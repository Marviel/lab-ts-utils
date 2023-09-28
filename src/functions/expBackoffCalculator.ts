import { SimpleLogger } from './simpleLogger';

interface ExponentialBackoffCalculatorArgs {
    /**
     * Start time for the first iteration.
     * 
     * Defaults to 1000.
     * 
     */
    startMs?: number;

    /**
     * What multiplier is used in the exponential backout wait time.
     * 
     * Defaults to 2.
     * 
     * Algorithm is:
     *      waitTimeMs = startMs * (multiplier ^ iteration)
     */
    multiplier?: number;

    /**
     * Which iteration this was.
     * 
     * Algorithm is:
     *      waitTimeMs = startMs * (multiplier ^ iteration)
     */
    iteration: number;

    /**
     * A logger to use for logging.
     */
    logger?: SimpleLogger;
}

/**
 * Calculates the wait time for exponential backoff.
 * 
 * Returns: `startMs * (multiplier ^ iteration)`
 *
 * @param args - Arguments for the exponential backoff calculator.
 * @returns The wait time in milliseconds.
 */
export async function createExponentialBackoffCalculator(
    args: ExponentialBackoffCalculatorArgs
) {
    const {
        startMs = 1000,
        multiplier = 2,
        iteration
    } = args;

    return startMs * (multiplier ** iteration);
}
