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
//need to update to HTTPS
//need to update to ENV
const FRONTEND_BASE_URL = 
     process.env.NODE_ENV === 'production' 
        ? 'https://ecommerceapi-5-iktx.onrender.com'
        : 'http://localhost:3000';
const cors = require('cors');

//Router imports
const gameBoardRouter = require('./routes/gameBoard.js');
const usersRouter = require('./routes/users.js');

//app.use(express.static('public')); NOT NEEDED
app.use(cors({ credentials: true, origin: FRONTEND_BASE_URL })); //allows credentials request
app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));

//session set up
const sessionSecret = crypto.randomBytes(32).toString('base64');

app.use(
    session({
        secret: sessionSecret,
        cookie: {maxAge: 1000*60*60*24, secure: false, sameSite: 'lax'}, //secure: true, HTTPS only, set sameSite to 'none when set secure back to true
        resave: false, //? true?
        saveUninitialized: false
    })
);

//passport and bcrypt
app.use(passport.initialize());
app.use(passport.session());

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
            done(null, user);
        } else {
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
            console.log(`autentication failed with error`)
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
        console.log('error logging out');
        if (err) {
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
const getUserById = async (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log('User session correctly sustained');
        res.status(200).json(req.user.username);
    } else {
        res.status(401).send('Not authenticated');
    } 
};
app.get('/me', getUserById);

//API requests
app.use('/gameBoard', gameBoardRouter);
app.use('/user', usersRouter);


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