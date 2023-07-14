import { tryUntilAsync } from '../src/functions/tryUntilAsync';

describe('tryUntilAsync', () => {
    test('should resolve when promise resolves without stopCondition and no errors', async () => {
        const func = jest
            .fn()
            .mockReturnValue(Promise.resolve('Hello, World!'));

        const result = await tryUntilAsync({ func });
        expect(func).toHaveBeenCalledTimes(1);
        expect(result).toBe('Hello, World!');
    });

    test('should stop trying when stopCondition is true', async () => {
        const func = jest.fn().mockResolvedValue('Hello, World!');
        const stopCondition = (result: string) => result === 'Hello, World!';

        const result = await tryUntilAsync({ func, stopCondition });
        expect(func).toHaveBeenCalledTimes(1);
        expect(result).toBe('Hello, World!');
    });

    test('should stop trying after maxAttempts if error thrown', async () => {
        const func = jest
            .fn()
            .mockRejectedValue(new Error('Something went wrong'));
        const maxAttempts = 3;

        await expect(
            tryUntilAsync({ func, tryLimits: { maxAttempts } })
        ).rejects.toThrow('Something went wrong');
        expect(func).toHaveBeenCalledTimes(maxAttempts);
    });

    test('should stop trying after maxTimeMS if error thrown', async () => {
        const func = jest
            .fn()
            .mockRejectedValue(new Error('Something went wrong'));
        const maxTimeMS = 1000;

        await expect(
            tryUntilAsync({ func, tryLimits: { maxTimeMS } })
        ).rejects.toThrow('Something went wrong');
    });

    test('should wait for delay.ms between attempts', async () => {
        const func = jest
            .fn()
            .mockRejectedValueOnce(new Error('Something went wrong'))
            .mockResolvedValue('Hello, World!');
        const delay = { ms: 1000 };
        const start = Date.now();

        await tryUntilAsync({ func, delay });
        const end = Date.now();
        const elapsed = end - start;

        expect(elapsed).toBeGreaterThanOrEqual(delay.ms);
    });

    test('should use delayFunction if provided', async () => {
        const func = jest
            .fn()
            .mockResolvedValueOnce('Hello, World!')
            .mockResolvedValue('Hello Again, World!');
        const delayFunction = jest
            .fn()
            .mockReturnValue(new Promise(resolve => setTimeout(resolve, 1000)));
        const delay = { delayFunction };

        const result = await tryUntilAsync({
            func,
            delay,
            stopCondition: res => res === 'Hello Again, World!',
        });

        expect(delayFunction).toHaveBeenCalled();
        expect(result).toBe('Hello Again, World!');
    });
});
