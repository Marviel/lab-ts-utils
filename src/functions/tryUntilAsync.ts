import { RingBuffer } from 'ring-buffer-ts';

import { expBackoffAsync } from './expBackoffAsync';

export interface TryUntilTryLimitsOptions {
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
}

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
    func: (opts: {
        timeElapsedMS: number;
        numPreviousTries: number;
        immediateReject?: (e: Error) => void;
    }) => Promise<TReturn>;

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
    tryLimits?: TryUntilTryLimitsOptions;

    /**
     * The maximum number of errors to keep track of.
     *
     * Defaults to 50.
     */
    maxErrorHistory?: number;

    /**
     * A function that will be called whenever an error occurs.
     * @param err The error that occurred on the last try.
     * @returns ignored.
     *
     * This will be called before `delayFunction` is called.
     */
    onError?: ({
        failedAttempts,
        tryLimits,
        err,
        pastErrors,
    }: {
        failedAttempts: number;
        tryLimits: TryUntilTryLimitsOptions;
        err?: Error;
        pastErrors: Error[];
    }) => void;

    /**
     * The amount of time to wait between attempts.
     *
     * Defaults to: `{ ms: 1000 }`
     */
    delay?: {
        type?: 'old';
        /**
         * The amount of time to wait between attempts, in milliseconds.
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
        delayFunction?: (params: {
            numFailedAttempts: number;
            tryLimits: TryUntilTryLimitsOptions;
            err?: Error;
            pastErrors: Error[];
        }) => Promise<void>;
    } | {
        type: 'scalar';
        /**
         * The amount of time to wait between attempts, in milliseconds.
         */
        ms: number;
    } | {
        type: 'expBackoff';
        /**
         * The starting time for the first iteration.
         * 
         * Defaults to 1000.
         * 
         * Algorithm is:
         *     waitTimeMs = startMs * (multiplier ^ iteration)
         */
        startMs?: number;
        /**
         * The multiplier to use for exponential backoff.
         * 
         * Defaults to 2.
         * 
         * Algorithm is:
         *      waitTimeMs = startMs * (multiplier ^ iteration)
         */
        multiplier?: number;
    } | {
        type: 'custom';
        /**
         * A function which can be used to delay the next attempt.
         *
         * The function should return a promise that resolves after a specified amount of time.
         *
         * If this is not provided, the function will use setTimeout.
         *
         * @returns A promise that resolves after the specified amount of time.
         */
        delayFunction: (params: {
            numFailedAttempts: number;
            tryLimits: TryUntilTryLimitsOptions;
            err?: Error;
            pastErrors: Error[];
        }) => Promise<void>;
    }
}

/**
 * This represents an error that occurred after the maxAttempts or maxTimeMS was reached.
 *
 * To get the error that occurred on the last try, use the `lastTryError` property.
 */
class TryUntilTimeoutError extends Error {
    constructor(message: string, readonly errors: Error[] | undefined) {
        super(message);
        this.name = 'TryUntilTimeoutError';
    }
}

class TryUntilStopConditionNotMetError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TryUntilStopConditionNotMetError';
    }
}

/**
 * Try to execute a promise-returning function until it succeeds or a stopping condition is reached.
 */
export function tryUntilAsync<TReturn>(
    opts: TryUntilOptions<TReturn>
): Promise<TReturn> {
    const {
        func,
        stopCondition,
        tryLimits = {},
        delay = { ms: 1000 },
        maxErrorHistory = 50,
    } = opts;

    const {
        maxAttempts,
        maxTimeMS = 1000 * 60,
        maxTimePerAttemptMS = Infinity,
    } = tryLimits;

    let attempts = 0;
    const startTime = Date.now();

    return new Promise<TReturn>(async (resolve, reject) => {
        /** The last error we encountered. */
        const pastErrors = new RingBuffer<Error>(maxErrorHistory);

        // Because setTimeout only accepts a 32-bit int, we need to limit the maxTimeMS
        // to the max value of a 32-bit int minus 2.
        const usingTimeout = Math.min(maxTimeMS, Math.pow(2, 31) - 2);
        const timeoutErrorMessage = `Timed out after maxTimeMS: ${maxTimeMS} ${usingTimeout === maxTimeMS ? '' : '(truncated to 2^31 - 2)'}`;

        let outerTimeout: NodeJS.Timeout | undefined = undefined;
        let innerTimeout: NodeJS.Timeout | undefined = undefined;
        let delayTimeout: NodeJS.Timeout | number | undefined = undefined;

        // Setup the outer timeout.
        outerTimeout = setTimeout(() => {
            reject(
                new TryUntilTimeoutError(
                    timeoutErrorMessage,
                    pastErrors.toArray()
                )
            );
        }, usingTimeout);

        const safeResolve = (resolveValue: TReturn | PromiseLike<TReturn>) => {
            // Clear timeouts
            if (outerTimeout) clearTimeout(outerTimeout);
            if (innerTimeout) clearTimeout(innerTimeout);
            if (delayTimeout) clearTimeout(delayTimeout);

            // Resolve
            resolve(resolveValue);
        };

        const safeReject = (rejectValue: Error) => {
            // Clear timeouts
            if (outerTimeout) clearTimeout(outerTimeout);
            if (innerTimeout) clearTimeout(innerTimeout);
            if (delayTimeout) clearTimeout(delayTimeout);

            // Reject
            reject(rejectValue);
        };

        while (true) {
            // console.log('Top of while')
            try {
                // Because setTimeout only accepts a 32-bit int, we need to limit the maxTimePerAttemptMS
                // to the max value of a 32-bit int minus 2.
                const usingAttemptTimeout = Math.min(
                    maxTimePerAttemptMS,
                    Math.pow(2, 31) - 2
                );
                const timeoutAttemptErrorMessage = `Attempt timed out after maxTimeMS: ${usingAttemptTimeout} ${usingTimeout === usingAttemptTimeout
                    ? ''
                    : '(truncated to 2^31 - 2)'
                    }`;

                // Reset the timeout.
                if (innerTimeout) clearTimeout(innerTimeout);
                innerTimeout = setTimeout(() => {
                    throw new TryUntilTimeoutError(
                        timeoutAttemptErrorMessage,
                        pastErrors.toArray()
                    );
                }, usingAttemptTimeout);

                // Try running the function.
                const result = await func({
                    timeElapsedMS: Date.now() - startTime,
                    numPreviousTries: attempts,
                    immediateReject: reject,
                });

                if (stopCondition) {
                    if (stopCondition(result)) {
                        // Check stop condition, if provided
                        safeResolve(result);
                        return;
                    } else {
                        throw new Error('Stop condition not met');
                    }
                } else if (!stopCondition) {
                    // If no stop condition, resolve with result
                    safeResolve(result);
                    return;
                }
            } catch (e: any) {
                // Increment attempts
                attempts += 1;

                // If we got an error, save it.
                pastErrors.add(e);

                // Call onError
                if (opts.onError) {
                    opts.onError({
                        failedAttempts: attempts,
                        tryLimits,
                        err: pastErrors.getLast(),
                        pastErrors: pastErrors.toArray(),
                    });
                }

                // If we're over our max attempts, reject.
                if (maxAttempts && attempts >= maxAttempts) {
                    safeReject(
                        new TryUntilTimeoutError(
                            `Exceeded maxAttempts: ${maxAttempts}`,
                            e
                        )
                    );
                    return;
                }

                // If we're over our max time, reject.
                // NOTE: this probably already happened due to the setTimeout above.
                else if (maxTimeMS && Date.now() - startTime >= maxTimeMS) {
                    safeReject(
                        new TryUntilTimeoutError(timeoutErrorMessage, e)
                    );
                    return;
                }

                // Wait for delay
                if (delay.type === 'expBackoff') {
                    // console.log('expBackoff start')
                    await expBackoffAsync({
                        iteration: attempts - 1,
                        startMs: delay.startMs,
                        multiplier: delay.multiplier,
                    })
                    // console.log('expBackoff done')
                    continue;
                } else if (!delay.type && delay.ms) {
                    await new Promise(delayRes => {
                        delayTimeout = setTimeout(delayRes, delay.ms);
                    });
                    continue;
                } else if ((delay.type === undefined || delay.type === 'custom') && delay.delayFunction) {
                    // console.log('custom start')
                    await delay.delayFunction({
                        numFailedAttempts: attempts,
                        tryLimits,
                        err: pastErrors.getLast(),
                        pastErrors: pastErrors.toArray(),
                    });
                    // console.log('custom done')
                    continue;
                } else {
                    continue;
                }
            }

            console.warn(
                'INTERNAL ERROR: TryUntilAsync reached unreachable code. Please report this issue here: https://github.com/Marviel/lab-ts-utils/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=TryuntilAsyncUnreachableCode'
            );
        }
    });
}
