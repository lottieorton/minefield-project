const { session } = require('passport');
const request = require('supertest');
const bcrypt = require('bcrypt');
const express = require('express');
const passport = require('passport');
const sinon = require('sinon');

//NOTE WHEN TESTING WITH HTTPS SECURE - MAY NEED TO INCLUDE the below line as cookie won't be sent over std non-secure supertest connection
//request(app).post('/login').set('X-Forwarded-Proto', 'https')

jest.mock('../queries/queries.js', () => ({
    pool: {
        query: jest.fn()
    }
}));

const db = require('../queries/queries.js');
// const { app, sessionSecret, getUserByUsername, authenticateUser } = require('../index.js');
const indexModule = require('../index.js');
const app = indexModule.app;
const sessionSecret = indexModule.sessionSecret;
const getUserByUsername = indexModule.getUserByUsername;
const authenticateUser = indexModule.authenticateUser;


describe('frontend base url logic and CORS calls', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('uses localhost url in CORS headers when in development', async () => {
        //arrange
        process.env.NODE_ENV = 'development';
        const expectedURL = "http://localhost:3000"
        //action
        const { app } = require('../index');
        const response = await request(app)
            .get('/test') //call an endpoint
        //assert
        expect(response.headers['access-control-allow-origin']).toBe(expectedURL);
    });
    
    it('uses ecommerceAPI url in CORS headers when in production', async () => {
        //arrange
        process.env.NODE_ENV = 'production';
        const expectedURL = "https://ecommerceapi-5-iktx.onrender.com";
        //action
        const { app } = require('../index');
        const response = await request(app)
            .get('/test') //call an endpoint
        //assert
        expect(response.headers['access-control-allow-origin']).toBe(expectedURL);
    });

    it('want to test credentials are set to true in CORS headers', async () => {
        //arrange
        process.env.NODE_ENV = 'development';
        //action
        const { app } = require('../index');
        const response = await request(app)
            .get('/test') //call an endpoint
        //assert
        expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
});

describe('API base url logic', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('uses localhost url when in development', async () => {
        //arrange
        process.env.NODE_ENV = 'development';
        const expectedURL = "http://localhost:4001"
        //action
        const { API_BASE_URL } = require('../index');
        //assert
        expect(API_BASE_URL).toBe(expectedURL);
    });

    it('uses Render url when in production', async () => {
        //arrange
        process.env.NODE_ENV = 'production';
        const expectedURL = "https://ecommerceapi-5-iktx.onrender.com"
        //action
        const { API_BASE_URL } = require('../index');
        //assert
        expect(API_BASE_URL).toBe(expectedURL);
    });
});

describe('backend configuration', () => {
    /* DONT NEED THE STATIC FILES from /public
    it('should serve static files from /public', async () => {
        const response = await request(app).get('/index.js');
        expect(response.status).toBe(405);
    });*/

    it('a random sessionSecret of length 32 in base 64 is generated', () => {
        //assert
        expect(sessionSecret.length).toBe(44);
    });

    it('bodyParser.json - enables JSON data passed to requests to be read', async () => {
        //TEST A JSON RESPONSE IS ABLE TO BE UNPACKED - POST REQUEST
        //arrange
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
            .set('Content-Type', 'application/json')
        //assert
        if (response.status === 500) {
            console.log('Server Error Detail:', response.text);
        }
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login Successful');
    });

    it('urlencoded - enables URL-econded form data to be parsed', async () => {
        //arrange
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .type('form') //this sends as form data
            .send({
                username: 'testuser',
                password: password
            })
        //assert
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login Successful');
    });

    it('sets up session logic with correct cookie headers', async () => {
        //arrange
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
        const cookie = response.headers['set-cookie'][0];
        //testing the cookie expiry is approx 24 hours
        const expiresMatch = cookie.match(/Expires=([^;]+)/);
        const expiresDate = new Date(expiresMatch[1]);
        const now = new Date();
        const diffInHours = (expiresDate - now) / (1000 * 60 * 60);
        //assert - cookie is created and with correct expiry date
        expect(response.headers['set-cookie']).toBeDefined();
        expect(cookie).toMatch(/connect.sid/i);
        expect(diffInHours).not.toBeLessThan(23);
        expect(diffInHours).toBeLessThan(25);
    });

    it('session set up doesnt set up a cookie for non logged in requests', async () => {
        //action
        const response = await request(app)
            .get('/') //call an endpoint
        //assert
        expect(response.headers['set-cookie']).not.toBeDefined();
    });
    //test session persists

    it('passport.initialize() adds Passport methods, passport.session() restores user via deserializeUser, passport.serialize() called and saved user to session, passports Local strategy is also correctly passing the login info to the authenticate user', async () => {
        //arrange
        const agent = request.agent(app); //agent is needed to act like a browser and save the cookie
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        await agent
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
        // mocking for deserializeUser
            db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        const response = await agent.get(`/me`) //call an endpoint
        //assert
        expect(response.status).toBe(200);
        expect(response.body).toBe('testuser');
    });

    it('should not have a user if no session cookie is provided aka passport.session working correctly', async () => {
        //action
        const response = await request(app).get(`/me`)
        //assert
        expect(response.status).toBe(401);
    });

    it('req.logout() clears the session and therefore prevents access to /me', async () => {
        //arrange
        const agent = request.agent(app); //agent is needed to act like a browser and save the cookie
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        //log in
        const loginResponse = await agent
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
        expect(loginResponse.status).toBe(200);
        //logout
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        const logoutResponse = await agent.get(`/logout`) //call logout endpoint
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toBe('Successfully logged out');
        //try to access /me should fail
        const profileResponse = await agent.get('/me');
        expect(profileResponse.status).toBe(401);
    });

    it('should return 400 if useranme field is missing or named incorrectly, as passport LocalStrategy accepts default login info', async () => {
        //arrange
        const agent = request.agent(app);
        //action
        const response = await agent
            .post('/login') //call an endpoint
            .send({
                email: 'testuser',
                password: 'P@ssword'
            })
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Missing credentials');
    });

    it('errorHandling middleware is triggered when the database fails', async () => {
        //arrange
        const errorMessage = 'Database connection failed';
        db.pool.query.mockRejectedValueOnce(new Error(errorMessage));
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: 'P@ssword'
            })
        expect(response.status).toBe(500);
        expect(response.text).toBe(errorMessage);
    });

});

describe('getByUsername', () => {
    it('getByUsername if successful returns user data', async () => {
        //arrange
        const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        const user = await getUserByUsername(mockUser.username);
        //assert
        expect(user).toBe(mockUser);
    });

    it('getByUsername if unsuccessful returns error', async () => {
        //arrange
        const errorMessage = 'Database connection failed';
        db.pool.query.mockRejectedValueOnce(new Error(errorMessage));
        //assert
        await expect(getUserByUsername('testuser')).rejects.toThrow(errorMessage);
    });

    it('deserialize user logic if no user passed', async () => {
        //arrange
        const agent = request.agent(app); //agent is needed to act like a browser and save the cookie
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        //log in
        const loginResponse = await agent
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
        expect(loginResponse.status).toBe(200);
        //mock user no longer existing in database
        db.pool.query.mockResolvedValueOnce({
            rows: []
        });
        const profileResponse = await agent.get('/me');
        //deserialize returns done(null, false), so isAuthenticated is false
        expect(profileResponse.status).toBe(401);
    });
});

describe('authenticateUser', () => {
    let done;
    
    // jest.mock('bcrypt');
    // jest.mock('../index', () => ({
    //     ...jest.requireActual('../index'), // Keep other exports like authenticateUser
    //     getUserByUsername: jest.fn()
    // }));
    beforeEach(() => {
        done = jest.fn();
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore the original function after each test
        jest.restoreAllMocks();
    });
    
    it('calls getUserByUsername and if password matches calls done(null, user)', async () => {
        //arrange
        const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });

        //const getUserByUsernameSpy = jest.spyOn(indexModule, 'getUserByUsername').mockResolvedValue(mockUser);
        const bcryptSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        //action
        await authenticateUser(mockUser.username, 'P@ssword', done);
        //assert
        expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('if user exists but password doesnt match calls done(null, false), { message: `Incorrect password`}', async () => {
        //arrange
        const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });

        //const getUserByUsernameSpy = jest.spyOn(indexModule, 'getUserByUsername').mockResolvedValue(mockUser);
        const bcryptSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
        //action
        await authenticateUser(mockUser.username, 'P@ssword', done);
        //assert
        expect(done).toHaveBeenCalledWith(null, false, { message: 'Incorrect password'});
    });

    it('if user doesnt exist calls done(null, false, { message: `Cannot find user`})', async () => {
        //arrange
        const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword' };
        db.pool.query.mockResolvedValueOnce({
            rows: []
        });

        //const getUserByUsernameSpy = jest.spyOn(indexModule, 'getUserByUsername').mockResolvedValue(undefined);
        //const bcryptSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
        //action
        await authenticateUser(mockUser.username, 'P@ssword', done);
        //assert
        expect(done).toHaveBeenCalledWith(null, false, { message: 'Cannot find user'});
    });

    it('authenticateUser, if database call errors done(error)', async () => {
        //arrange
        const errorMessage = 'Database issue';
        db.pool.query.mockRejectedValueOnce(new Error(errorMessage));
        //action
        await authenticateUser('testuser', 'P@ssword', done);
        //assert
        expect(done).toHaveBeenCalledWith(new Error(errorMessage));

    });
});

describe('/login', () => {
    //SETTING UP SESSION AND DESERIALISE BEING CALLED TESTED ABOVE
    it('successfully logins in with correct login details', async () => {
        //arrange
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
            .set('Content-Type', 'application/json')
        //assert
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login Successful');
        expect(response.body.user).toStrictEqual({id: mockUser.id, username: mockUser.username});
    });

    it('authenticate error returns next(error)', async () => {
        //arrange
        const authError = new Error ('Database Issue');
        const authenticateSpy = jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
            return (req, res, next) => {
                callback(authError, null ,null);
            };
        });
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: 'P@ssword'
            })
            .set('Content-Type', 'application/json')
        //assert
        expect(response.status).toBe(500);
        expect(response.text).toBe('Database Issue');
        //clean up
        authenticateSpy.mockRestore();
    });

    it('!user returns 401 with error message', async () => {
        //arrange
        const authError = new Error ('Database Issue');
        const authenticateSpy = jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
            return (req, res, next) => {
                callback(null, false, { message: 'Cannot find user'});
            };
        });
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: 'P@ssword'
            })
            .set('Content-Type', 'application/json')
        //assert
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Cannot find user');
        //clean up
        authenticateSpy.mockRestore();
    });

    it('when error saving session, returns next(saveErr)', async () => {
        //arrange
        const sessionError = new Error ('Failed to set up persist session');
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        const authenticateSpy = jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
            return (req, res, next) => {
                //mock req.login succeed
                req.login = jest.fn((user, done) => done(null));
                //mock req.session.save fail
                req.session = req.session || {};
                req.session.save = jest.fn((saveCallback) => {
                    saveCallback(sessionError);
                })
                //passport callback
                callback(null, mockUser, null);
            }
        });
        //action
        const response = await request(app)
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
            .set('Content-Type', 'application/json')
        //assert
        expect(response.status).toBe(500);
        expect(response.text).toBe('Failed to set up persist session');
        //clean up
        authenticateSpy.mockRestore();
    });
})
    
describe('/logout', () => {
    it('req.logout called and destroys session, clears cookie, returns res.status(200) and json', async () => {
        //SESSION DESTROYED TESTED EARLIER
        //arrange
        const agent = request.agent(app); //agent is needed to act like a browser and save the cookie
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        //log in
        const loginResponse = await agent
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
        expect(loginResponse.status).toBe(200);
        //logout
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        const logoutResponse = await agent.get(`/logout`) //call logout endpoint
        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toBe('Successfully logged out');
    });

    it('error logging out', async () => {
        //arrange
        const agent = request.agent(app); //agent is needed to act like a browser and save the cookie
        const password = 'P@ssword';
        const hashedPassword = await bcrypt.hash(password, 10);
        const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
        const errorMessage = 'Database error during deserialization';
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        //log in
        await agent
            .post('/login') //call an endpoint
            .send({
                username: 'testuser',
                password: password
            })
        //logout
        db.pool.query.mockRejectedValueOnce(new Error(errorMessage));
        const logoutResponse = await agent.get(`/logout`) //call logout endpoint
        expect(logoutResponse.status).toBe(500);
        expect(logoutResponse.text).toBe(errorMessage);
    });
    
    //NOT TESTING LOGOUT ERROR MESSAGES AS SET UP TO BE DIFFICULT TO TEST
});