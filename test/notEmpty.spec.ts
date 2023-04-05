import { notEmpty } from '../src';

describe('notEmpty', () => {
  // Test various non-empty values
  it('should return true for non-empty values', () => {
    expect(notEmpty(42)).toBe(true);
    expect(notEmpty('hello')).toBe(true);
    expect(notEmpty({ key: 'value' })).toBe(true);
    expect(notEmpty([1, 2, 3])).toBe(true);
  });

  // Test null and undefined
  it('should return false for empty values', () => {
    expect(notEmpty(null)).toBe(false);
    expect(notEmpty(undefined)).toBe(false);
  });
});
