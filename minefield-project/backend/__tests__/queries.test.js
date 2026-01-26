describe('Datbase connection', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = {...originalEnv};
    });

    it('should initialize with local config in development', () => {
        //arrange
        process.env.NODE_ENV = 'development';
        const mockPool = jest.fn();
        jest.doMock('pg', () => ({
            Pool: mockPool
        }));
        require('../queries/queries.js');
        //assert
        expect(mockPool).toHaveBeenCalled();
        expect(mockPool).toHaveBeenCalledWith(expect.objectContaining({ 
            database: 'MineSweeper',
            host: 'localhost'
        }));
    });

    it('should initialize with connectionString in production', () => {
        //arrange
        process.env.NODE_ENV = 'production';
        process.env.DATABASE_URL = 'postgres://render-url';
        const mockPool = jest.fn();
        jest.doMock('pg', () => ({
            Pool: mockPool
        }));
        require('../queries/queries.js');
        //assert
        expect(mockPool).toHaveBeenCalled();
        expect(mockPool).toHaveBeenCalledWith(expect.objectContaining({ 
            connectionString: 'postgres://render-url'
        }));
    });

    it('handles error of setting up the database connection', () => {
        //arrange
        process.env.NODE_ENV = 'development';
        const errorMessage = 'Database Connection issue'
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        jest.doMock('pg', () => ({
            Pool: jest.fn(() => {
                throw new Error(errorMessage);
            })
        }));
        //assert
        expect(() => {
            require('../queries/queries.js')
        }).toThrow(errorMessage);
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('FATAL ERROR during Database setup'),
            errorMessage
        );
        consoleSpy.mockRestore();
    });
})