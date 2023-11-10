import {
    failureMaybe,
    IfMaybe,
    isFailureMaybe,
    isSuccessMaybe,
    Maybe,
    successMaybe,
} from './types';

/**
 * Converts a function that may throw into a function that returns a maybe object.
 * @param fn 
 * @returns 
 */
export function maybify<TIn extends any[], TOut>(fn: (...input: TIn) => Promise<TOut>): (...input: TIn) => Promise<IfMaybe<TOut, TOut, Maybe<TOut>>> {
    // TODO: this should gracefully handle Synchronous functions as well.
    //@ts-ignore
    return async (...input: TIn) => {
        try {
            const result = await fn(...input);

            // If this is already a maybe, return it as-is.
            if (isSuccessMaybe(result) || isFailureMaybe(result)) {
                return result;
            }
            // If this wasn't a maybe, return a success maybe.
            else {
                return successMaybe(result);
            }
        } catch (error: any) {
            // If we encounter any errors, return a failure maybe.
            return failureMaybe(error);
        }
    };
}