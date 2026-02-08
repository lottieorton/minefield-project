const { getScores, saveScore } = require('../queries/scores.js');
const scoreRouter = require('../routes/scores.js');
const db = require('../queries/queries.js');
const express = require('express');
const request = require('supertest');
jest.mock('../queries/queries.js', () => ({
    pool: {
        query: jest.fn()
    }
}));
jest.mock('../functions/ensureAuthenticated.js', () => ({
    ensureAuthenticated: jest.fn()
        // ensureAuthenticated: jest.fn((req, res, next) => next())
}));
const { ensureAuthenticated } = require('../functions/ensureAuthenticated.js');

//SCORES - QUERIES
describe('getScores controller', () => {
    it('on successful score retrieval returns 200 status and scores object', async () => {
        //arrange
        const mockScores = [{
            "difficulty": "Easy",
            "wins": "4",
            "losses": "1",
            "games": "5",
            "wlratio": "80"
        }];
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const req = { user: { username: 'testUser'}};
        db.pool.query.mockResolvedValueOnce({
            rows: mockScores
        });
        //action
        await getScores(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockScores);
    });

    it('handles database errors', async () => {
        //arrange
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const req = { user: { username: 'testUser'}};
        const databaseError = new Error();
        db.pool.query.mockRejectedValueOnce(databaseError);
        //action
        await getScores(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            msg: 'Unable to retrieve scores due to a server error'
        }));
    });
});

describe('saveScore controller', () => {
    it('on successful game save returns 201 status and game object', async () => {
        //arrange
        const mockGame = [{
            "game_id": 1,
            "user_id": 10,
            "difficulty": "Easy",
            "win": true
        }];
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const req = { 
            user: { username: 'testUser'},
            body: {
                difficulty: 'Easy',
                win: true
            }
        };
        db.pool.query.mockResolvedValueOnce({
            rows: mockGame
        });
        //action
        await saveScore(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockGame);
    });

    it('handles database errors', async () => {
        //arrange
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const req = { 
            user: { username: 'testUser'},
            body: {
                difficulty: 'Easy',
                win: true
            }
        };
        const databaseError = new Error();
        db.pool.query.mockRejectedValueOnce(databaseError);
        //action
        await saveScore(req, res);
        //assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            msg: 'Unable to save score due to server error'
        }));
    });
});

// SCORES - ROUTES
describe('scores routes', () => {    
    let app;
    let mockAuthValue = true;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use((req, res, next) => {
            req.isAuthenticated = () => mockAuthValue;
            req.user = { id: 10, username: 'testuser' };
            next();
        });
        app.use('/scores', scoreRouter);
    })

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /scores/saveScore route', async () => {
        //arrange
        const mockGame = [{
            "game_id": 1,
            "user_id": 10,
            "difficulty": "Easy",
            "win": true
        }];
        db.pool.query.mockResolvedValueOnce({ rows: mockGame });
        ensureAuthenticated.mockImplementation((req, res, next) => next());
        //action
        const response = await request(app)
            .post('/scores/saveScore')
            .send({
                difficulty: 'Easy',
                win: true
            });
        //assert
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(mockGame);
        expect(ensureAuthenticated).toHaveBeenCalled();
    });

    it('POST /scores/saveScore route when user not authenticated', async () => {
        //arrange
        ensureAuthenticated.mockImplementation((req, res, next) => res.status(400).json({isLoggedIn: false}));
        //action
        const response = await request(app)
            .post('/scores/saveScore')
            .send({
                difficulty: 'Easy',
                win: true
            });
        //assert
        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({isLoggedIn: false});
        expect(ensureAuthenticated).toHaveBeenCalled();
    });

    it('GET /scores/ route', async () => {
        //arrange
        const mockScores = [{
            "difficulty": "Easy",
            "wins": "4",
            "losses": "1",
            "games": "5",
            "wlratio": "80"
        }];
        db.pool.query.mockResolvedValueOnce({ rows: mockScores });
        ensureAuthenticated.mockImplementation((req, res, next) => next());
        //action
        const response = await request(app)
            .get('/scores/')
        //assert
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(mockScores);
        expect(ensureAuthenticated).toHaveBeenCalled();
    });

    it('GET /scores/ route when user not authenticated', async () => {
        //arrange
        ensureAuthenticated.mockImplementation((req, res, next) => res.status(400).json({isLoggedIn: false}));
        //action
        const response = await request(app)
            .get('/scores/')
        //assert
        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({isLoggedIn: false});
        expect(ensureAuthenticated).toHaveBeenCalled();
    });
})