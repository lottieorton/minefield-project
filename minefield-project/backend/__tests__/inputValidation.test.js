const express = require('express');
const request = require('supertest');
const { app } = require('../index.js');
const { inputValidation } = require('../functions/inputValidation.js');

const mockValidationResult = jest.fn();
jest.mock('express-validator', () => ({
    ...jest.requireActual('express-validator'),
    validationResult: (req) => mockValidationResult(req)
}));

const { validationResult } = require('express-validator');

describe('inputValidation', () => {
    const done = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns next when validationResult has no error messages', async () => {
        //arrange
        const req = {body: {}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        mockValidationResult.mockReturnValue({ errors: [] })
        //action
        inputValidation(req, res, done);
        //assert
        expect(done).toHaveBeenCalledWith();
    });

    it('returns error messages when validationResult has some', async () => {
        //arrange
        const req = {body: {}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const validationResponseObject = {errors: [{"type":"field", "msg": 'Password must be at least 8 characters long'}, {"type":"field", "msg": 'Password must contain at least one uppercase letter'}]};
        mockValidationResult.mockReturnValue(validationResponseObject);
        //action
        inputValidation(req, res, done);
        //assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({"msg": "Password must be at least 8 characters long | Password must contain at least one uppercase letter"});
    });

    it('returns default error message when validationResult has caught error with no message', async () => {
        //arrange
        const req = {body: {}};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        const validationResponseObject = {errors: [{"type":"field"}]};
        mockValidationResult.mockReturnValue(validationResponseObject);
        //action
        inputValidation(req, res, done);
        //assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({"msg": "Unable to retrieve scores due to a server error"});
    });
});
