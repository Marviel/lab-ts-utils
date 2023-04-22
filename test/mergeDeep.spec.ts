import _ from 'lodash';

import { mergeDeep } from '../src/functions/mergeDeep';

describe('mergeDeep', () => {
  it('should deep merge objects', (): any => {
    const obj1 = {
      a: 1,
      b: {
        c: 3,
        d: {
          e: 5,
        },
      },
    };
    const obj2 = {
      a: 2,
      b: {
        d: {
          f: 6,
        },
      },
    };
    const expectedResult = {
      a: 2,
      b: {
        c: 3,
        d: {
          e: 5,
          f: 6,
        },
      },
    };

    const result = mergeDeep({ toMerge: [obj1, obj2] });
    expect(result).toEqual(expectedResult);
  });

  it('should merge arrays by default', (): any => {
    const obj1 = { a: [1, 2] };
    const obj2 = { a: [3, 4] };
    const expectedResult = { a: [1, 2, 3, 4] };

    const result = mergeDeep({ toMerge: [obj1, obj2] });
    expect(result).toEqual(expectedResult);
  });

  it('should not throw an error if failOnMismatchedArrays is false or not set and two properties are not both arrays', (): any => {
    const obj1 = { a: [1, 2] };
    const obj2 = { a: 3 };

    const result = mergeDeep({ toMerge: [obj1, obj2] });

    expect((): any => mergeDeep({ toMerge: [obj1, obj2] })).not.toThrow();
    expect((): any =>
      mergeDeep({ toMerge: [obj1, obj2], failOnMismatchedArrays: false })
    ).not.toThrow();
  });
});
