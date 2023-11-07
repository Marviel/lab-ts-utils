import {
    tryUntilAsync,
    TryUntilOptions,
} from '../src/functions/tryUntilAsync';

jest.useRealTimers();

describe('tryUntilAsync', () => {
    const mockFunc = jest.fn();
    const onErrorMock = jest.fn();
    const delayFunctionMock = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test('onError should be called with correct parameters when an error occurs', async () => {
        const error = new Error('Test Error');

        mockFunc.mockRejectedValue(error);

        const testTryUntilOptions: TryUntilOptions<void> = {
            func: mockFunc,
            tryLimits: {
                maxAttempts: 2
            },
            onError: onErrorMock
        };

        await expect(tryUntilAsync(testTryUntilOptions)).rejects.toThrow();

        // check if onError was called with correct parameters
        expect(onErrorMock).toBeCalledWith(expect.objectContaining({
            failedAttempts: 1,
            tryLimits: {
                maxAttempts: 2
            },
            err: error,
            pastErrors: [error]
        }));
    });

    test('delayFunction should be called with correct parameters after an error occurred', async () => {
        delayFunctionMock.mockResolvedValueOnce(undefined);
        const error = new Error('Test Error');

        mockFunc.mockRejectedValue(error);

        const testTryUntilOptions: TryUntilOptions<void> = {
            func: mockFunc,
            tryLimits: {
                maxAttempts: 2
            },
            delay: {
                delayFunction: delayFunctionMock
            }
        };

        await expect(tryUntilAsync(testTryUntilOptions)).rejects.toThrow();

        // check if delayFunction was called with correct parameters
        expect(delayFunctionMock).toBeCalledWith(expect.objectContaining({
            numFailedAttempts: 1,
            tryLimits: {
                maxAttempts: 2
            },
            err: error,
            pastErrors: [error]
        }));
    });

    test('should resolve when promise resolves without stopCondition and no errors', async () => {
        const func = jest
            .fn()
            .mockReturnValue(Promise.resolve('Hello, World!'));

        const result = await tryUntilAsync({ func });
        expect(func).toHaveBeenCalledTimes(1);
        expect(result).toBe('Hello, World!');
    });

    test('should stop trying when stopCondition is true', async () => {
        const func = jest.fn().mockResolvedValue('Hello, World!');
        const stopCondition = (result: string) => result === 'Hello, World!';

        const result = await tryUntilAsync({ func, stopCondition });
        expect(func).toHaveBeenCalledTimes(1);
        expect(result).toBe('Hello, World!');
    });

    test('should stop trying after maxAttempts if error thrown', async () => {
        const func = jest
            .fn()
            .mockRejectedValue(new Error('Something went wrong'));
        const maxAttempts = 3;

        await expect(
            tryUntilAsync({ func, tryLimits: { maxAttempts } })
        ).rejects.toThrow(`Exceeded maxAttempts: ${maxAttempts}`);
        expect(func).toHaveBeenCalledTimes(maxAttempts);
    });

    test('should stop trying after maxTimeMS if error thrown', async () => {
        const maxTimeMS = 1000;
        const func = jest
            .fn()
            .mockRejectedValue(new Error(`Something went wrong`));

        await expect(
            tryUntilAsync({ func, tryLimits: { maxTimeMS } })
        ).rejects.toThrow(`Timed out after maxTimeMS: ${maxTimeMS}`);
    });

    describe('tryUntilAsync', () => {
        it('should fail on timeout', async () => {
            const maxTimeMS = 1000;

            const options: TryUntilOptions<void> = {
                func: jest.fn(() => new Promise(res => setTimeout(res, 2000))),
                tryLimits: {
                    maxTimeMS,
                },
                delay: {
                    // Delay longer than maxTimeMS
                    ms: 10000
                }
            };

            await expect(tryUntilAsync(options)).rejects.toThrow(`Timed out after maxTimeMS: ${maxTimeMS}`);

            // Validate that the function was called twice before the timeout
            expect(options.func).toHaveBeenCalledTimes(1);
        });
    });

    test('should wait for delay.ms between attempts', async () => {
        const func = jest
            .fn()
            .mockRejectedValueOnce(new Error('Something went wrong'))
            .mockResolvedValue('Hello, World!');
        const delay = { ms: 1000 };
        const start = Date.now();

        await tryUntilAsync({ func, delay });
        const end = Date.now();
        const elapsed = end - start;

        expect(elapsed).toBeGreaterThanOrEqual(delay.ms);
    });

    test('should use delayFunction if provided', async () => {
        const func = jest
            .fn()
            .mockResolvedValueOnce('Hello, World!')
            .mockResolvedValue('Hello Again, World!');
        const delayFunction = jest
            .fn()
            .mockReturnValue(new Promise(resolve => setTimeout(resolve, 1000)));
        const delay = { delayFunction };

        const result = await tryUntilAsync({
            func,
            delay,
            stopCondition: res => res === 'Hello Again, World!',
        });

        expect(delayFunction).toHaveBeenCalled();
        expect(result).toBe('Hello Again, World!');
    });

    it('should immediately reject when immediateReject is called', async () => {
        const errorMessage = 'Immediate Error';

        const func = jest.fn(({ immediateReject }) => {
            immediateReject(new Error(errorMessage));
            return new Promise((resolve, reject) => {
                setTimeout(() => resolve('Waited too long.'), 5000);
            });
        });

        const promise = tryUntilAsync({
            func,
            tryLimits: {
                maxAttempts: 10,
            },
        });

        await expect(promise).rejects.toThrowError(errorMessage);
        expect(func).toHaveBeenCalledTimes(1);
    });

    test('scalar delay', async () => {
        let attempts = 0;
        await expect(tryUntilAsync({
            func: async ({ numPreviousTries }) => {
                attempts += 1;
                if (numPreviousTries < 3) {
                    throw new Error();
                } else {
                    return true;
                }
            },
            maxErrorHistory: 5,
            delay: {
                type: 'scalar',
                ms: 1000,
            },
            tryLimits: {
                maxTimeMS: 1500,
            }
        })).rejects.toThrow();
        expect(attempts).toBe(2);
    });

    test('expBackoff delay', async () => {
        let attempts = 0;
        const res = await tryUntilAsync({
            func: async ({ numPreviousTries }) => {
                attempts += 1;
                if (numPreviousTries < 3) {
                    throw new Error();
                } else {
                    return true;
                }
            },
            maxErrorHistory: 5,
            delay: {
                type: 'expBackoff',
                startMs: 100,
                multiplier: 2,
            },
        });
        expect(attempts).toBe(4);
    });

    test('custom delay', async () => {
        let attempts = 0;
        const res = await tryUntilAsync({
            func: async ({ numPreviousTries }) => {
                attempts += 1;
                if (numPreviousTries < 3) {
                    throw new Error();
                } else {
                    return true;
                }
            },
            maxErrorHistory: 5,
            delay: {
                type: 'custom',
                delayFunction: ({ numFailedAttempts }) => new Promise<void>((resolve) => {
                    setTimeout(resolve, numFailedAttempts * 100);
                }),
            },
        });
        expect(attempts).toBe(4);
    });
});
