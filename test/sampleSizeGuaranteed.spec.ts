import _ from 'lodash';

import { sampleSizeGuaranteed } from '../src/';

describe('sampleSizeGuaranteed', () => {
  test('returns undefined for empty array', () => {
    expect(sampleSizeGuaranteed([], 3)).toBeUndefined();
  });

  test('returns a sample of size numToSample when arr length is greater than or equal to numToSample', () => {
    const arr = [1, 2, 3, 4, 5];
    const numToSample = 3;
    const result = sampleSizeGuaranteed(arr, numToSample);

    expect(result).toHaveLength(numToSample);
    result.forEach(item => expect(arr).toContain(item));
  });

  test('returns a sample of size numToSample when arr length is less than numToSample', () => {
    const arr = [1, 2, 3];
    const numToSample = 5;
    const result = sampleSizeGuaranteed(arr, numToSample);

    expect(result).toHaveLength(numToSample);
    result.forEach(item => expect(arr).toContain(item));
  });
});