import { SimpleLogger } from './simpleLogger';

interface ExpBackoffAsyncArgs {
    /**
     * Which iteration this was.
     * 
     * Algorithm is:
     *      waitTimeMs = startMs * (multiplier ^ iteration)
     */
    iteration: number;

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
     * A logger to use for logging.
     */
    logger?: SimpleLogger;
}

interface ExpBackoffAsyncReturn {
    timeWaited: number;
}


export async function expBackoffAsync(
    args: ExpBackoffAsyncArgs
): Promise<ExpBackoffAsyncReturn> {
    const {
        startMs = 1000,
        multiplier = 2,
        iteration,
        logger
    } = args;

    logger?.debug('expBackoffAsync', { startMs, multiplier, iteration })

    const waitTimeMs = startMs * (multiplier ** iteration);

    logger?.debug('waiting', waitTimeMs)

    return new Promise<ExpBackoffAsyncReturn>((resolve, reject) => {
        setTimeout(() => {
            logger?.debug('waited', waitTimeMs)
            resolve({
                timeWaited: waitTimeMs
            });
        }, waitTimeMs);
    });
}