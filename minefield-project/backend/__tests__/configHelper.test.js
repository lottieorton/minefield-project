jest.mock('dotenv', () => ({
    config: jest.fn()
}))

describe('dotenv configuration', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks(); //reset call counts
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should have access to .env variables when not in production', async () => {
        //arrange
        process.env.NODE_ENV = 'development';
        const loadEnv = require('../functions/configHelper.js');
        const dotenv = require('dotenv');
        //action
        loadEnv();
        //assert
        expect(dotenv.config).toHaveBeenCalled();
    });

    it('shouldnt have access to .env variables when in production', async () => {
        //arrange
        process.env.NODE_ENV = 'production';
        const loadEnv = require('../functions/configHelper.js');
        const dotenv = require('dotenv');
        //action
        loadEnv();
        //assert
        expect(dotenv.config).not.toHaveBeenCalled();
    });
});