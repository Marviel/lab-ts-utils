import {
    arrayify,
    catchToMaybeAsync,
    dictValues,
    isPromise,
    Maybe,
    notEmptyMap,
    valueOrNull,
} from '../src';

// Test for isPromise
describe('isPromise', () => {
  it('should return true if value is a Promise', () => {
    const promise = new Promise<void>((res) => {
      /* noop */
      res();
    });
    expect(isPromise(promise)).toBe(true);
  });

  it('should return false if value is not a Promise', () => {
    const notPromise = { then: 'not a function' };
    expect(isPromise(notPromise)).toBe(false);
  });
});

// Test for dictValues
describe('dictValues', () => {
  it('should filter out empty values from dictionary and return an array', () => {
    const dic = { key1: 'value1', key2: null, key3: undefined, key4: 'value2' };
    const expectedResult = ['value1', 'value2'];
    expect(dictValues(dic)).toEqual(expect.arrayContaining(expectedResult));
  });
});

// Test for notEmptyMap
describe('notEmptyMap', () => {
  it('should filter out empty values from mapped array', () => {
    const inputArray = [1, 2, 3, 4];
    const fn = (num: number) => (num % 2 === 0 ? num : null);
    const expectedResult = [2, 4];
    expect(notEmptyMap(inputArray, fn)).toEqual(
      expect.arrayContaining(expectedResult)
    );
  });
});

// Test for catchToMaybeAsync
describe('catchToMaybeAsync', () => {
  it('should return success object when there is no error', async () => {
    const fn = async (num: number) => num * 2;
    const wrappedFn = catchToMaybeAsync(fn);
    const expectedResult: Maybe<number> = { success: true, data: 4 };
    await expect(wrappedFn(2)).resolves.toEqual(expectedResult);
  });

  it('should return error object when there is an error', async () => {
    const errorFn = async (num: number) => {
      throw new Error('Error occurred');
    };
    const wrappedFn = catchToMaybeAsync(errorFn);
    const errorResult = await wrappedFn(2);
    expect(errorResult.success).toEqual(false);
    expect(errorResult.error).toBeInstanceOf(Error);
  });
});

// Test for valueOrNull
describe('valueOrNull', () => {
  it('should return null if the value is null or undefined', () => {
    expect(valueOrNull(null)).toBeNull();
    expect(valueOrNull(undefined)).toBeNull();
  });

  it('should return the original value if it is not null or undefined', () => {
    expect(valueOrNull(42)).toBe(42);
    expect(valueOrNull('test')).toBe('test');
  });
});

// Test for arrayify
describe('arrayify', () => {
  it('should return the original array if input is already an array', () => {
    const inputArray = [1, 2, 3];
    expect(arrayify(inputArray)).toEqual(expect.arrayContaining([1, 2, 3]));
  });

  it('should return an array containing the input if input is not an array', () => {
    const input = 42;
    expect(arrayify(input)).toEqual(expect.arrayContaining([42]));
  });
});
