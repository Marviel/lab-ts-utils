// update with actual import path

import {
    createSimpleLogger,
    SimpleLogger,
} from '../src/functions/simpleLogger';

describe('createSimpleLogger', () => {
    let consoleMock: jest.SpyInstance;

    beforeEach(() => {
        consoleMock = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleMock.mockRestore();
    });

    it('should create logger with default console.log when logFunctions is not provided', () => {
        const logger: SimpleLogger = createSimpleLogger({});

        logger.log('Test Log');

        expect(consoleMock).toHaveBeenCalledWith('Test Log');
    });

    it('should create logger with provided logFunction', () => {
        const mockLogFunction = jest.fn();

        const logger: SimpleLogger = createSimpleLogger({
            logFunctions: {
                log: mockLogFunction
            }
        });

        logger.log('Test Log');

        expect(mockLogFunction).toHaveBeenCalledWith('Test Log');
    });

    it('should add rawString prefix to log', () => {
        const logger: SimpleLogger = createSimpleLogger({
            prefix: {
                type: 'rawString',
                rawString: '[PREFIX]',
            }
        });

        logger.log('Test Log');

        expect(consoleMock).toHaveBeenCalledWith('[PREFIX]', 'Test Log');
    });

    it('should allow a string argument type, which does the same thing as simpleString', () => {
        const logger: SimpleLogger = createSimpleLogger({
            prefix: 'PREFIX'
        });

        logger.log('Test Log');

        expect(consoleMock).toHaveBeenCalledWith('[PREFIX]: ', 'Test Log');
    });

    it('should add simpleString prefix to log', () => {
        const logger: SimpleLogger = createSimpleLogger({
            prefix: {
                type: 'simpleString',
                simpleString: 'INFO',
                logTypePrefix: 'short',
            }
        });

        logger.log('Test Log');

        expect(consoleMock).toHaveBeenCalledWith('[L|INFO]: ', 'Test Log');
    });

    it('should add function type prefix to log', () => {
        const logger: SimpleLogger = createSimpleLogger({
            prefix: {
                type: 'function',
                func: ({ logType, logArgs }) => `[${logType.toUpperCase()}]: ${logArgs.join(',')}`
            }
        });

        logger.log('Test Log');

        expect(consoleMock).toHaveBeenCalledWith('[LOG]: Test Log', 'Test Log');
    });

});