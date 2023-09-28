import { expBackoffAsync } from '../src';

// Mock timers
jest.useFakeTimers();

describe('expBackoffAsync', () => {
  // Spy on setTimeout
  let setTimeoutSpy: any

  beforeEach(() => {
    setTimeoutSpy = jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    setTimeoutSpy.mockRestore();
  });

  test('should resolve after correct wait time', async () => {
    const iteration = 1;
    const startMs = 1000;
    const multiplier = 2;
    const expectedWaitTimeMs = startMs * (multiplier ** iteration);

    // Make sure our spy is set up correctly
    expect(setTimeoutSpy).not.toBeCalled();

    const mockResult = expBackoffAsync({
      iteration,
      startMs,
      multiplier,
    });

    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), expectedWaitTimeMs);

    jest.advanceTimersByTime(expectedWaitTimeMs);

    await expect(mockResult).resolves.toEqual({
      timeWaited: expectedWaitTimeMs
    });
  });
});