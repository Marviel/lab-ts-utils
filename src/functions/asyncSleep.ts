/**
 * Returns a promise which will resolve when the provided time has elapsed.
 * @param milliseconds The milliseconds which will pass before the returned promise is resolved.
 */
export async function asyncSleep(milliseconds: number): Promise<any> {
    return await new Promise((resolve) => setTimeout(resolve, milliseconds));
}