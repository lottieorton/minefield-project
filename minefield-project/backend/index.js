const express = require('express');
const app = express();
const PORT = process.env.PORT || 4001;
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('./queries/queries.js');
const bodyParser = require('body-parser');
const loadEnv = require('./functions/configHelper.js');
loadEnv();
//need to update to HTTPS
//need to update to ENV
const FRONTEND_BASE_URL = 
     process.env.NODE_ENV === 'production' 
        ? 'https://minefield-project-frontend.onrender.com'
        : 'http://localhost:3000';
const API_BASE_URL = 
     process.env.NODE_ENV === 'production' 
        ? 'https://minefield-project.onrender.com'
        : 'http://localhost:4001';
const cors = require('cors');
const GoogleStrategy = require('passport-google-oidc');

//Router imports
const gameBoardRouter = require('./routes/gameBoard.js');
const usersRouter = require('./routes/users.js');
const scoreRouter = require('./routes/scores.js');
//app.use(express.static('public')); NOT NEEDED
app.set('trust proxy', 1);
app.use(cors({ credentials: true, origin: FRONTEND_BASE_URL })); //allows credentials request
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));

//session set up
const sessionSecret = crypto.randomBytes(32).toString('base64');

app.use(
    session({
        base: '/',
        secret: sessionSecret,
        cookie: {maxAge: 1000*60*60*24, secure: true, sameSite: 'none'}, 
        //For localhost: secure: false, sameSite: 'lax'
        //secure: true, HTTPS only, set sameSite to 'none when set secure back to true
        resave: false,
        saveUninitialized: false,
        proxy: true
    })
);

//passport and bcrypt
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${API_BASE_URL}/auth/google/redirect`
  },
    async function(issuer, profile, cb) {
        try {
            //check for existing federated credential
            console.log("issuer is: " + issuer);
            console.log("profile is: " + JSON.stringify(profile));
            const credResult = await db.pool.query(
                'SELECT * FROM federated_credentials WHERE provider = $1 AND subject = $2', 
                [issuer, profile.id]
            );
            console.log(`credResult is:` + JSON.stringify(credResult));

            const cred = credResult.rows[0];
        
            if (!cred) {
                // The Google account has not logged in to this app before.  Create a new user record and link it to the Google account.
                const userInsertResult = await db.pool.query(
                    'INSERT INTO users (first_name, last_name, username) VALUES ($1, $2, $3) RETURNING id, first_name', 
                    [profile.name.givenName, profile.name.familyName, profile.emails[0].value]
                );
                const newUser = userInsertResult.rows[0];
                console.log('newUser: ' + JSON.stringify(newUser));
                await db.pool.query(
                    'INSERT INTO federated_credentials (user_id, provider, subject) VALUES ($1, $2, $3)', 
                    [newUser.id, issuer, profile.id]
                );
                //returns the new user object for Passport serialization
                return cb(null, newUser);
            } else {
                // The Google account has previously logged in to the app.  Get the user record linked to the Google account and log the user in.
                const userResult = await db.pool.query(
                    'SELECT id, username, first_name, last_name FROM users WHERE id = $1', 
                    [cred.user_id]
                );
                const user = userResult.rows[0];
                if (!user) { return cb(new Error("User ID linked to credential not found.")); }
                return cb(null, user);
            }
        } catch (err) {
            console.error("Google Auth Error:", err);
            return cb(err);
        }
    }
));

//Google request login
app.get('/login/google', passport.authenticate('google', { scope: [ 'email', 'profile' ]}));

//callback URL called when logged in
app.get('/auth/google/redirect',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_BASE_URL}/login`, failureMessage: true }),
    (req, res) => {
        //successful authentication, redirection
        res.redirect(`${FRONTEND_BASE_URL}/profile`);
    }
);

const getUserByUsername = async (username) => {
    try {
        const result = await db.pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

async function authenticateUser (username, password, done) {
    try {
        const user = await getUserByUsername(username);
        //if user not found
        if(!user) return done(null, false, { message: 'Cannot find user'});
        //if user found compare password
        const matchedPassword = await bcrypt.compare(password, user.password);
        if(matchedPassword) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Incorrect password'});
        }
    } catch (error) {
        return done(error);
    }
};

passport.use(new LocalStrategy({/*usernameField: 'username'*/}, authenticateUser)); //usernameField only needed if the exact file names username and password aren't used

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    console.log('deserializing user: ' + id);
    try {
        const result = await db.pool.query(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        const user = result.rows[0];
        if(user) {
            console.log('req.user deserialize:'+ user);
            done(null, user);
        } else {
            console.log('req.user deserialize: not found');
            done(null, false);
        }
    } catch (error) {
        done(error);
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        console.log(`attempting to login post endpoint with`)
        console.log(`autentication done error is: ${JSON.stringify(err)} user is ${JSON.stringify(user)}, info is: ${JSON.stringify(info)}`)

        if (err) {
            console.log(`authentication failed with error`)
            return next(err);
        }
        if (!user) { 
            // Handle failure response here
            console.log(`autentication failed with no user`)

            return res.status(401).json({ message: info.message || 'Authentication failed' });
        }
        //establishes the session and calls passport.serializeUser
        req.login(user, (err) => {
            console.log("Logged in supposedly with user:" + JSON.stringify(user))
            req.session.save((saveErr) => {
                console.log("SAVING REQUEST SESSION")
                if (saveErr) {
                    console.error("Session save error after login:", saveErr);
                    return next(saveErr);
                }
                // session is now saved, and the cookie is set

                console.log(`Hello ${user.first_name} logged in as ${user.username}`);
                // This response carries the Set-Cookie header.

                return res.status(200).json({
                    message: 'Login Successful',
                    user: {
                        id: user.id,
                        username: user.username,
                        firstName: user.first_name
                    }
                });
                
            });
        });
    }) (req, res, next)
});

app.get('/logout', (req, res, next) => {
    console.log("Is logout mocked?", req.logout.toString().includes('errorMessage'));
    req.logout((err) => {
        if (err) {
            console.log('error logging out');
            return next(err);
        }
        //optional but deleting the session and clearling the cookie
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.clearCookie('connect.sid');
            console.log('Logged out');
            //res.redirect('/');
            return res.status(200).json({ 
                message: 'Successfully logged out' 
            });
        });
    });
});

//Just for testing purposes
// const getUserById = async (req, res, next) => {
//     if (req.isAuthenticated()) {
//         console.log('User session correctly sustained');
//         res.status(200).json(req.user.username);
//     } else {
//         res.status(401).send('Not authenticated');
//     } 
// };
// app.get('/me', getUserById);

//API requests
app.use('/gameBoard', gameBoardRouter);
app.use('/user', usersRouter);
app.use('/scores', scoreRouter);

//error-handling middleware
app.use((err, req, res, next) => {
    console.log("LOGOUT ERROR DEBUG:", err);
    const status = err.status || 500;
    res.status(status).send(err.message);
});

// app.listen(PORT, () => {
//     console.log(`Server is listening on port ${PORT}`)
// });

module.exports = {
    app,
    FRONTEND_BASE_URL,
    API_BASE_URL,
    sessionSecret,
    getUserByUsername,
    authenticateUser
};

/* istanbul ignore if */
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}