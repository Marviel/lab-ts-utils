import _, { Dictionary } from 'lodash';

import { notEmpty } from './notEmpty';

/**
 * Checks if a given value is a Promise.
 *
 * @param value - The value to check.
 * @returns True if the value is a Promise, otherwise False.
 */
export function isPromise(value: any): value is Promise<any> {
    return value instanceof Promise;
}

/**
 * Conditional type for checking if a type `T` is `any`.
 *
 * @template T - The type to check.
 * @template True - Returned when the type is `any`.
 * @template False - Returned when the type is not `any`.
 */
declare type IsAny<T, True, False = never> = true | false extends (
    T extends never ? true : false
)
    ? True
    : False;

/**
 * Returns an array of values from a dictionary object, filtering out empty entries.
 *
 * @template TValue - The dictionary's value type.
 * @param dic - The input dictionary.
 * @returns An array of filtered values.
 */
export function dictValues<TValue>(dic: Dictionary<TValue>) {
    return _.values(dic).filter(notEmpty);
}

/**
 * Maps over an array, applying a function that returns O, undefined, or null,
 * and then filters out the empty (null/undefined) values in the resulting array.
 *
 * @template I - The input type.
 * @template O - The output type.
 * @param m - The input array.
 * @param fn - The function to apply.
 * @returns A filtered array.
 */
export function notEmptyMap<I, O>(
    m: I[],
    fn: (input: I) => O | undefined | null
): O[] {
    return m.map(fn).filter(notEmpty);
}

/**
 * A union type representing a Maybe data structure with success/failure states.
 *
 * @template T - The data type.
 */
export type Maybe<T> =
    | { success: true; data: T; error?: undefined | null }
    | { success: false; error: Error; data?: undefined | null };


/**
 * Helper to create a success maybe object.
 * @param obj The data object.
 * @returns A success maybe object.
 */
export function successMaybe<T>(data: T): Maybe<T> {
    return { success: true, data, error: undefined };
}

/**
 * Helper to create a failure maybe object.
 * @param error The error object.
 * @returns A failure maybe object.
 */
export function failureMaybe(error: Error): Maybe<any> {
    return { success: false, error, data: undefined };
}

export function isSuccessMaybe<T>(item: any): item is { success: true; data: T } {
    // Make sure we have all the necessary fields, and that success is true.
    return (item.success !== undefined && item.data !== undefined) && item.success;
}

export function isFailureMaybe<T>(item: any): item is { success: false; error: Error } {
    // Make sure we have all the necessary fields, and that success is false.
    return (item.success !== undefined && item.error !== undefined) && !item.success;
}

export type IfMaybe<T, Y, N> = T extends Maybe<any> ? Y : N;



/**
 * A utility type for defining async functions with given input and output types.
 *
 * @template InT - The input type(s) as a tuple.
 * @template OutT - The output type.
 */
export type AsyncFunction<InT extends any[], OutT> = (
    ...args: InT
) => Promise<OutT>;

/**
 * Return either the input value or null if it's null or undefined.
 *
 * @template T - The input type.
 * @param v - The input value.
 * @returns The input value or null.
 */
export function valueOrNull<T>(v: T | null | undefined): T | null {
    return v ? v : null;
}

/**
 * Ensures that the input is an array by returning it as-is if it's already an array,
 * or wrapping it in an array if it's a single value.
 *
 * @template T - The input type.
 * @param arg - The input value or array.
 * @returns The input as an array.
 */
export function arrayify<T>(arg: T | T[]): T[] {
    return arg instanceof Array ? arg : [arg];
}

/**
 * Utility type to extract the inner type U of an array type T, or return T itself if it's not an array.
 *
 * @template T - The input type.
 */
export type Unarray<T> = T extends Array<infer U> ? U : T;

/**
 * Wraps a function and produces a maybe-ified version of the function.
 *
 * If an exception is thrown, an object with an error will be returned, looking like:
 * {success: true, error: TheError}
 *
 * If no exception is thrown, a data object will be returned, looking like:
 * {success: true, data: TheData}
 * @param f The function that could throw
 * @returns A maybe object.
 */
export function catchToMaybeAsync<InT extends any[], OutT>(
    f: AsyncFunction<InT, OutT>
): AsyncFunction<InT, Maybe<OutT>> {
    return async (...input: InT) => {
        try {
            const data = await Promise.resolve(f(...input));
            return { success: true, data };
        } catch (error: any) {
            return { success: false, error };
        }
    };
}

/**
 * Returns the type of the constructor parameters of a class.
 */
export type ConstructorParameters<T> = T extends new (...args: infer U) => any
    ? U
    : never;
/**
 * Returns the type of the constructor return type of a class.
 */
export type ConstructorReturnType<T> = T extends new (...args: any[]) => infer R
    ? R
    : never;

/**
 * Gets a non-nullable property type from a the first constructor parameter of a class.
 * Helpful for not defining types more than once.
 *
 * This is useful in situations where you want to create a class that requires a config object
 * with optional properties that are defaulted in the constructor if not provided.
 * and you want to use that config object as the source of types for internal parameters.
 *
 * You can use this like:
 *
 * ```typescript
 * type MyConfig = {
 *  myProp?: { key: string }
 * }
 *
 * class MyClass {
 *    private _myProp: RequiredConstructorConfigType<typeof MyClass, 'myProp'>;
 *
 *   constructor({myProp}: MyConfig) {
 *    this._myProp = myProp ?? {key: 'defaultKey'};
 *   }
 * ```
 *
 *
 */
export type RequiredConstructorConfigType<
    T,
    Prop extends keyof ConstructorParameters<T>[0]
> = NonNullable<ConstructorParameters<T>[0][Prop]>;




/**
 * Determine if an array is not empty, meaning it has at least one element.
 */
//@ts-ignore
function notEmptyArr<T>(arr: T[]): arr is [T, ...T] {
    return arr.length >= 1;
}