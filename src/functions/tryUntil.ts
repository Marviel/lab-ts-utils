interface TryUntilOptions<TReturn> {
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
    func: (timeElapsedMS: number) => Promise<TReturn>;

    /**
     * If provided, the function will be called with the result of the promise.
     * If this returns true, the function will stop trying and return the result.
     *
     * If this is NOT provided, the function will stop trying when the promise resolves.
     */
    stopCondition?: (result: TReturn) => boolean;

    /**
     * The limit
     */
    tryLimits?: {
        /**
         * The maximum number of attempts to try,
         */
        maxAttempts?: number;
        /**
         * The maximum amount of time to try,
         */
        maxTimeMS?: number;
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
 * Try to execute a promise-returning function until it succeeds or a stopping condition is reached.
 */
export function tryUntilAsync<TReturn>(opts: TryUntilOptions<TReturn>) {
    const { func, stopCondition, tryLimits = {}, delay = { ms: 1000 } } = opts;

    const { maxAttempts, maxTimeMS } = tryLimits;

    let attempts = 0;
    let startTime = Date.now();

    return new Promise<TReturn>(async (resolve, reject) => {
        while (true) {
            try {
                const result = await func(Date.now() - startTime);

                if (stopCondition && stopCondition(result)) {
                    // Check stop condition, if provided
                    resolve(result);
                    return;
                } else if (!stopCondition) {
                    // If no stop condition, resolve with result
                    resolve(result);
                    return;
                }
            } catch (e) {
                if (maxAttempts && attempts >= maxAttempts - 1) {
                    reject(e);
                    return;
                } else if (maxTimeMS && Date.now() - startTime >= maxTimeMS) {
                    reject(e);
                    return;
                }
            }

            // Increment attempts
            attempts += 1;

            // Wait for delay
            if (delay.ms) {
                await new Promise(resolve => setTimeout(resolve, delay.ms));
            } else if (delay.delayFunction) {
                await delay.delayFunction();
            }
        }
    });
}
