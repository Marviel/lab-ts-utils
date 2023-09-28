/**
 * This function checks if an item has some value.
 * It narrows down the type from TValue | null | undefined to TValue,
 * allowing TypeScript to know that the value is not null or undefined.
 *
 * @function notEmpty
 * @template TValue - The type of the value being checked
 * @param {TValue | null | undefined} value - The item to be checked for emptiness
 * @returns {boolean} True if the value is not empty, false otherwise
 */
export function notEmpty<TValue>(
    value: TValue | null | undefined
): value is TValue {
    // Check if the provided value is neither null nor undefined
    return value !== null && value !== undefined;
}
