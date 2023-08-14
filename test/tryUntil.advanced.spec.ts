import {
    tryUntilAsync,
    TryUntilOptions,
} from '../src/functions/tryUntilAsync';

jest.useFakeTimers();

describe('tryUntilAsync Advanced', () => {
    let promiseResolver: (val?: any) => void;
  
    beforeEach(() => {
        promiseResolver = undefined!;
    });
  
    afterEach(() => {
        jest.clearAllTimers();
    });

    it('when maxTimeMS is Infinity, a 2 minute time should resolve.', async () => {
        const twoMinutesInMs = 1000 * 60 * 2;

        const options: TryUntilOptions<void> = {
            func: jest.fn(() => new Promise(res => { promiseResolver = res; })),
            tryLimits: {
                maxTimeMS: Infinity,
            },
            delay: { ms: 500 }
        };

        const promise = tryUntilAsync(options);

        // Simulate passing of 2 minute time
        jest.advanceTimersByTime(twoMinutesInMs);
        
        // Resolve the promise after 2 minutes
        promiseResolver();

        await expect(promise).resolves.not.toThrow();

        // Validate that the function was called correctly
        expect(options.func).toHaveBeenCalled();
    });

    it('when maxTimeMS is Infinity, It will wait a maximum of 2^31 - 2 milliseconds.', async () => {
        const options: TryUntilOptions<void> = {
            func: jest.fn(() => new Promise(res => { throw new Error('This should not be called'); })),
            tryLimits: {
                maxTimeMS: Infinity,
            },
            delay: { ms: Math.pow(2, 31) }
        };

        const promise = tryUntilAsync(options);

        // Do these two in parallel
        await expect(Promise.race([
            promise,
            new Promise(res => {
                jest.advanceTimersByTime(Math.pow(2, 31) + 1)
                const retting = () => {
                    console.error('retting was called... this should never happen.')
                    res(undefined);
                }
                // Wait for 5 seconds before resolving.
                // This should never actually happen.
                setTimeout(retting, 5000)
            })
        ])).rejects.toThrow(`Timed out after maxTimeMS: Infinity (truncated to 2^31 - 2)`);

        // Validate that the function was called correctly
        expect(options.func).toHaveBeenCalledTimes(1);
    });
});