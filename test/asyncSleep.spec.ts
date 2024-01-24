import {
    asyncSleep,
} from '../src'; // replace 'yourFile' with your actual file name

describe('asyncSleep', () => {
  test('waits for the specified time before resolving', async () => {
    const startTime = Date.now();
    const waitTime = 1000; // 1 second

    await asyncSleep(waitTime);

    // Fudge factor of 2 milliseconds.
    const endTime = Date.now() + 2;
    const elapsedTime = endTime - startTime;

    // Check that the elapsed time is at least the wait time.
    // We use toBeGreaterThanOrEqual because the actual elapsed time might be slightly more than the wait time due to the nature of setTimeout and JS event loop.
    expect(elapsedTime).toBeGreaterThanOrEqual(waitTime);
  });
});