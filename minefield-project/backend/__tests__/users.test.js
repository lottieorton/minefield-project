const { createUser, registerUser, getUsers} = require('../queries/users.js');
const usersRouter = require('../routes/users.js');
const db = require('../queries/queries.js');
const bcrypt = require('bcrypt');
const express = require('express');
const request = require('supertest');
jest.mock('bcrypt', () => ({
    genSalt: jest.fn().mockResolvedValue('fake_salt'),
    hash: jest.fn().mockResolvedValue('fake_hashed_password')
}));
jest.mock('../queries/queries.js', () => ({
    pool: {
        query: jest.fn()
    }
}));

//USERS - QUERIES
describe('createUser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('on successful addition of user to database', async () => {
        //arrange
        const mockUser = {
            username: 'username', 
            password: 'P@ssword',
            first_name: 'Lotts',
            last_name: 'Here'
        };
        const mockDbUser = { ...mockUser, id: 1, password: 'fake_hashed_password' };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockDbUser]
        });
        //action
        const result = await createUser(mockUser);
        //assert
        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).toHaveBeenCalledWith('P@ssword', 'fake_salt');
        expect(db.pool.query).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO users'),
            [mockDbUser.username, mockDbUser.password, mockDbUser.first_name, mockDbUser.last_name]
        );
        expect(result).toEqual(mockDbUser);
    });

    it('handles database error of user addition to database', async () => {
        //arrange
        const databaseErrorMessage = 'Database addition error';
        const mockUser = {
            username: 'username', 
            password: 'P@ssword',
            first_name: 'Lotts',
            last_name: 'Here'
        };
        //const mockDbUser = { ...mockUser, id: 1, password: 'fake_hashed_password' };
        db.pool.query.mockRejectedValueOnce(new Error(databaseErrorMessage));
        jest.spyOn(console, 'error').mockImplementation(() => {});
        //action
        //assert
        await expect(createUser(mockUser)).rejects.toThrow(databaseErrorMessage);
        //clean up
        console.error.mockRestore();
    });

    it('handles database error of user already existing', async () => {
        //arrange
        const mockUser = {
            username: 'username', 
            password: 'P@ssword',
            first_name: 'Lotts',
            last_name: 'Here'
        };
        const databaseError = new Error('Database violation');
        databaseError.code = '23505';
        db.pool.query.mockRejectedValueOnce(databaseError);
        //jest.spyOn(console, 'error').mockImplementation(() => {});
        //action
        //assert
        await expect(createUser(mockUser)).rejects.toThrow('Username already taken');
    });
});

describe('registerUser controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                username: 'username',
                password: 'P@ssword',
                first_name: 'Lotts',
                last_name: 'Here'
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    })

    it('on successful registration returns 201 status and new user', async () => {
        //arrange
        const mockUser = {
            username: 'username', 
            password: 'hashedPassword',
            first_name: 'Lotts',
            last_name: 'Here'
        };
        db.pool.query.mockResolvedValueOnce({
            rows: [mockUser]
        });
        //action
        await registerUser(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            msg: 'New user created',
            newuser: mockUser
        }));
    });

    it('handles username already exists database error', async () => {
        //arrange
        const mockUser = {
            username: 'username', 
            password: 'hashedPassword',
            first_name: 'Lotts',
            last_name: 'Here'
        };
        const errorMessage = 'Database violation username already taken'
        const databaseError = new Error(errorMessage);
        db.pool.query.mockRejectedValueOnce(databaseError);
        //action
        await registerUser(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            msg: errorMessage
        }));
    });

    it('handles other database errors', async () => {
        //arrange
        const mockUser = {
            username: 'username', 
            password: 'hashedPassword',
            first_name: 'Lotts',
            last_name: 'Here'
        };
        //const errorMessage = 'Database violation username already taken'
        const databaseError = new Error();
        db.pool.query.mockRejectedValueOnce(databaseError);
        //action
        await registerUser(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            msg: 'Unable to create user due to a server error'
        }));
    });
});

describe('getUsers controller', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    })

    it('returns all users', async () => {
        //arrange
        const mockUsers = [{ username: 'username' }, { username: 'username2' }];
        db.pool.query.mockImplementation((sql, callback) => {
            callback(null, {rows: mockUsers});
        });
        //action
        getUsers(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining(mockUsers));
    });

    it('handles database errors', async () => {
        //arrange
        const mockUsers = [{ username: 'username' }, { username: 'username2' }];
        const databaseError = new Error('Database selection error');
        db.pool.query.mockImplementation((sql, callback) => {
            callback(databaseError, null);
        });
        //action
        getUsers(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                msg: 'Unable to retrieve users'
            })
        );
    });
});

//USERS - ROUTES
describe('users routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/user', usersRouter);
    })

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /user/register route', async () => {
        //arrange
        const mockUser = { id: 1, username: 'test', first_name: 'Lotts' };
        db.pool.query.mockResolvedValueOnce({ rows: [mockUser] });
        //action
        const response = await request(app)
            .post('/user/register')
            .send({
                username: 'test',
                password: 'P@ssword',
                first_name: 'Lotts',
                last_name: 'Here'
            });
        //assert
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            msg: 'New user created',
            newuser: { username: 'test' }
        });
    });

    it('GET /user/ route', async () => {
        //arrange
        const mockUsers = [{ username: 'username' }, { username: 'username2' }];
        db.pool.query.mockImplementation((sql, callback) => {
            callback(null, {rows: mockUsers});
        });
        //action
        const response = await request(app)
            .get('/user/');
        //assert
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(mockUsers);
    });
})