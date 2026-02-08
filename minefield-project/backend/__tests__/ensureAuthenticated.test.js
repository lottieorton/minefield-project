const express = require('express');
const request = require('supertest');
const { app } = require('../index.js');
const { ensureAuthenticated } = require('../functions/ensureAuthenticated.js');

describe('ensureAuthenticated', () => {    
    const done = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    })

    it('returns next when is authenticated', async () => {
        //arrange
        const req = {isAuthenticated: () => true};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        //action
        ensureAuthenticated(req, res, done);
        //assert
        expect(done).toHaveBeenCalled();
    });

    it('returns 400 status and isLoggedIn = false when isnt authenticated', async () => {
        //arrange
        const req = {isAuthenticated: () => false};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        //action
        ensureAuthenticated(req, res, done);
        //assert
        expect(done).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({isLoggedIn: false});
    });
})