export interface TryUntilOptions<TReturn> {
    /**
     * The function to try.
     *
     * This should return a promise.
     *
     * If stopCondition is NOT provided, the function will stop trying and return whenever the promise resolves.
     *
     * If stopCondition is provided, this function will be called with the result of the promise,
     * and if it returns true, the function will stop trying and return the result.
     */
    func: (opts: {timeElapsedMS: number, numPreviousTries: number, immediateReject?: (e: Error) => void}) => Promise<TReturn>;

    /**
     * If provided, the function will be called with the result of the promise.
     * If this returns true, the function will stop trying and return the result.
     *
     * If this is NOT provided, the function will stop trying when the promise resolves.
     */
    stopCondition?: (result: TReturn) => boolean;

    /**
     * The limitatations around how many times to try.
     */
    tryLimits?: {
        /**
         * The maximum number of attempts to try,
         */
        maxAttempts?: number;
        /**
         * The maximum amount of time to try,
         * Defaults to 1 minute.
         * 
         * 
         * To wait for 2 minutes:
         * ```ts
         * tryUntilAsync({
         *    func: () => Promise.resolve(),
         *    tryLimits: {
         *      maxTimeMS: 1000 * 60 * 2
         *    }
         * })
         * ```
         * 
         * To wait FOREVER
         * ```ts
         * tryUntilAsync({
         *   func: () => Promise.resolve(),
         *   tryLimits: {
         *      maxTimeMS: Infinity
         *   }
         * })
         * ```
         */
        maxTimeMS?: number;

        /**
         * The maximum amount of time to try per attempt.
         * Defaults to Infinity.
         * 
         * To try three times, for 2 minutes per attempt:
         * ```ts
         * tryUntilAsync({
         *   func: () => Promise.resolve(),
         *  tryLimits: {
         *     maxTries: 3,
         *     maxTimePerAttemptMS: 1000 * 60 * 2
         *  }
         * })
         */
        maxTimePerAttemptMS?: number;
    };

    /**
     * The amount of time to wait between attempts.
     *
     * Defaults to: `{ ms: 1000 }`
     */
    delay?: {
        /**
         * The amount of time to wait between attempts.
         */
        ms?: number;
        /**
         * A function which can be used to delay the next attempt.
         *
         * The function should return a promise that resolves after a specified amount of time.
         *
         * If this is not provided, the function will use setTimeout.
         *
         * @returns A promise that resolves after the specified amount of time.
         */
        delayFunction?: () => Promise<void>;
    };
}


/**
 * This represents an error that occurred after the maxAttempts or maxTimeMS was reached.
 * 
 * To get the error that occurred on the last try, use the `lastTryError` property.
 */
class TryUntilTimeoutError extends Error {
    constructor(message: string, readonly lastTryError: Error | undefined) {
        super(message);
        this.name = 'TryUntilTimeoutError';
    }
}


/**
 * Try to execute a promise-returning function until it succeeds or a stopping condition is reached.
 */
export function tryUntilAsync<TReturn>(
    opts: TryUntilOptions<TReturn>
): Promise<TReturn> {
    const { func, stopCondition, tryLimits = {}, delay = { ms: 1000 } } = opts;

    const { 
        maxAttempts,
        maxTimeMS = 1000 * 60,
        maxTimePerAttemptMS = Infinity 
    } = tryLimits;

    let attempts = 0;
    let startTime = Date.now();

    return new Promise<TReturn>(async (resolve, reject) => {
        /** The last error we encountered. */
        var lastError: Error | undefined = undefined;

        // Because setTimeout only accepts a 32-bit int, we need to limit the maxTimeMS
        // to the max value of a 32-bit int minus 2.
        const usingTimeout = Math.min(maxTimeMS, Math.pow(2, 31) - 2)
        const timeoutErrorMessage = `Timed out after maxTimeMS: ${maxTimeMS} ${usingTimeout === maxTimeMS ? '' : '(truncated to 2^31 - 2)'}`;
        
        var outerTimeout: NodeJS.Timeout | undefined = undefined;
        var innerTimeout: NodeJS.Timeout | undefined = undefined;
        var delayTimeout: NodeJS.Timeout | number | undefined = undefined;

        // Setup the outer timeout.
        outerTimeout = setTimeout(() => {
            reject(new TryUntilTimeoutError(timeoutErrorMessage, lastError));
        }, usingTimeout);
        
        const safeResolve = (resolveValue: TReturn | PromiseLike<TReturn>) => {
            // Clear timeouts
            if (outerTimeout) clearTimeout(outerTimeout);
            if (innerTimeout) clearTimeout(innerTimeout);
            if (delayTimeout) clearTimeout(delayTimeout); 

            // Resolve
            resolve(resolveValue);
        }

        const safeReject = (rejectValue: Error) => {
            // Clear timeouts
            if (outerTimeout) clearTimeout(outerTimeout);
            if (innerTimeout) clearTimeout(innerTimeout);
            if (delayTimeout) clearTimeout(delayTimeout); 

            // Reject
            reject(rejectValue);
        }

        while (true) {
            try {
                // Because setTimeout only accepts a 32-bit int, we need to limit the maxTimePerAttemptMS
                // to the max value of a 32-bit int minus 2.
                const usingAttemptTimeout = Math.min(maxTimePerAttemptMS, Math.pow(2, 31) - 2)
                const timeoutAttemptErrorMessage = `Attempt timed out after maxTimeMS: ${usingAttemptTimeout} ${usingTimeout === usingAttemptTimeout ? '' : '(truncated to 2^31 - 2)'}`;
                
                // Reset the timeout.
                if (innerTimeout) clearTimeout(innerTimeout);
                innerTimeout = setTimeout(() => {
                    throw new TryUntilTimeoutError(timeoutAttemptErrorMessage, lastError);
                }, usingAttemptTimeout);

                // Try running the function.
                const result = await func({timeElapsedMS: Date.now() - startTime, numPreviousTries: attempts, immediateReject: reject});

                if (stopCondition && stopCondition(result)) {
                    // Check stop condition, if provided
                    safeResolve(result);
                    return;
                } else if (!stopCondition) {
                    // If no stop condition, resolve with result
                    safeResolve(result);
                    return;
                }
            } catch (e: any) {
                // If we got an error, save it.
                lastError = e;

                // If we're over our max attempts, reject.
                if (maxAttempts && attempts >= maxAttempts - 1) {
                    safeReject(new TryUntilTimeoutError(`Exceeded maxAttempts: ${maxAttempts}`, lastError));
                    return;
                }
                
                // If we're over our max time, reject.
                // NOTE: this probably already happened due to the setTimeout above.
                else if (maxTimeMS && Date.now() - startTime >= maxTimeMS) {
                    safeReject(new TryUntilTimeoutError(timeoutErrorMessage, lastError));
                    return;
                }
            }

            // Increment attempts
            attempts += 1;

            // Wait for delay
            if (delay.ms) {
                await new Promise(resolve => {
                    delayTimeout = setTimeout(resolve, delay.ms)
                });
            } else if (delay.delayFunction) {
                await delay.delayFunction();
            }
        }
    });
}