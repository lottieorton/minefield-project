const { session } = require('passport');
const request = require('supertest');
const bcrypt = require('bcrypt');
const express = require('express');
const sinon = require('sinon');

jest.mock('../queries/queries.js', () => ({
    pool: {
        query: jest.fn()
    }
}));

jest.mock('passport-google-oidc', () => {
    return jest.fn().mockImplementation((options, verify) => {
        googleVerifyCallback = verify;
        return { name: 'google', authenticate: jest.fn() };
    });
});

jest.mock('passport', () => {
    const actualPassport = jest.requireActual('passport');
    actualPassport.authenticate = jest.fn(actualPassport.authenticate);
    return actualPassport;
});

const passport = require('passport');
let googleVerifyCallback;
//const db = require('../queries/queries.js');
const indexModule = require('../index.js');
const app = indexModule.app;
const sessionSecret = indexModule.sessionSecret;
const getUserByUsername = indexModule.getUserByUsername;
const authenticateUser = indexModule.authenticateUser;

describe('passport - Google strategy', () => {
    let db;

    const mockProfile = {
        id: 'google-123',
        name: { givenName: 'Lotts', familyName: 'Here' },
        emails: [{value: 'test@gmail.com'}]
    };
    const mockIssuer = 'https://accounts.google.com';

    beforeEach(() => {
        jest.resetModules();
        db = require('../queries/queries.js');
        require('../index.js');
        db.pool.query.mockClear();
    });

    it('creates a new user if federated credential does not exist', async () => {
        //arrange
        db.pool.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1, first_name: 'Lotts'}] })
        .mockResolvedValueOnce({ rows: [] });
        const done = jest.fn();
        //action
        await googleVerifyCallback(mockIssuer, mockProfile, done);
        //assert
        expect(db.pool.query).toHaveBeenNthCalledWith(1,
            expect.stringContaining('SELECT * FROM federated_credentials'), 
            [mockIssuer, mockProfile.id]
        );
        expect(db.pool.query).toHaveBeenNthCalledWith(2,
            expect.stringContaining('INSERT INTO users'), 
            [mockProfile.name.givenName, mockProfile.name.familyName, mockProfile.emails[0].value]
        );
        expect(db.pool.query).toHaveBeenNthCalledWith(3,
            expect.stringContaining('INSERT INTO federated_credentials'), 
            [1, mockIssuer, mockProfile.id]
        );
        expect(done).toHaveBeenCalledWith(null, { id: 1, first_name: 'Lotts' })
    });

    it('selects an existing user if federated credential exists', async () => {
        //arrange
        const mockUser = { id: 2, username: 'Lottso', first_name: 'Lotts', last_name: 'Here'};
        db.pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: mockUser.id, provider: mockIssuer, subject: mockProfile.id}] })
        .mockResolvedValueOnce({ rows: [mockUser] });
        const done = jest.fn();
        //action
        await googleVerifyCallback(mockIssuer, mockProfile, done);
        //assert
        expect(db.pool.query).toHaveBeenNthCalledWith(1,
            expect.stringContaining('SELECT * FROM federated_credentials'), 
            [mockIssuer, mockProfile.id]
        );
        expect(db.pool.query).toHaveBeenNthCalledWith(2,
            expect.stringContaining('SELECT id, username, first_name, last_name FROM users'), 
            [2]
        );
        expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    it('returns an error if a user isnt found but a federated credential exists', async () => {
        //arrange
        const errorMessage = "User ID linked to credential not found.";
        db.pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 2, provider: mockIssuer, subject: mockProfile.id}] })
        .mockResolvedValueOnce({ rows: [] });
        const done = jest.fn();
        //action
        await googleVerifyCallback(mockIssuer, mockProfile, done);
        //assert
        expect(db.pool.query).toHaveBeenNthCalledWith(1,
            expect.stringContaining('SELECT * FROM federated_credentials'), 
            [mockIssuer, mockProfile.id]
        );
        expect(db.pool.query).toHaveBeenNthCalledWith(2,
            expect.stringContaining('SELECT id, username, first_name, last_name FROM users'), 
            [2]
        );
        expect(done).toHaveBeenCalledWith(new Error(errorMessage));
    });

    it('handles an error if there is an issue with the database requests', async () => {
        //arrange
        const errorMessage = "Error with database connection.";
        db.pool.query
        .mockRejectedValueOnce(new Error(errorMessage));
        const done = jest.fn();
        //action
        await googleVerifyCallback(mockIssuer, mockProfile, done);
        //assert
        expect(done).toHaveBeenCalledWith(new Error(errorMessage));
    });
});

describe('GET /auth/google/redirect - successful', () => {
    let app;
    //let db;
    
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        const passport = require('passport');
        passport.authenticate.mockImplementation(() => (req, res, next) => {
            req.user = {id: 1, username: 'testuser'}; //simulate logged in user
            req.login = jest.fn((user, cb) => cb(null));
            next();
        });
        //db = require('../queries/queries.js');
        process.env.FRONTEND_BASE_URL = 'http://localhost:3000';
        const indexModule = require('../index.js');
        app = indexModule.app;
    });

    it('should redirect to the profile page on successful authentication', async () => {
        //arrange
        const expectedUrl = `${process.env.FRONTEND_BASE_URL}/profile`;
        //action
        const response = await request(app).get('/auth/google/redirect');
        //assert
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(expectedUrl);
    });
});

describe('GET /auth/google/redirect - false', () => {
    let app;
    //let db;
    
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        const passport = require('passport');
        passport.authenticate.mockImplementation((strategy, options) => (req, res, next) => {
            return res.redirect(`${process.env.FRONTEND_BASE_URL}/login`);
        });
        //db = require('../queries/queries.js');
        process.env.FRONTEND_BASE_URL = 'http://localhost:3000';
        const indexModule = require('../index.js');
        app = indexModule.app;
    });

    it('should redirect to the login page on failed authentication', async () => {
        //arrange
        const expectedUrl = `${process.env.FRONTEND_BASE_URL}/login`;
        //action
        const response = await request(app).get('/auth/google/redirect');
        //assert
        expect(response.status).toBe(302);
        expect(response.header.location).toBe(expectedUrl);
    });
})
