import { fixIndent } from '../src/functions/fixIndent';

describe('fixIndent', () => {
  test('should remove minimum indentation in all lines', () => {
    const input = "  line1\n    line2\n    line3";
    const expected = "line1\n  line2\n  line3";
    expect(fixIndent(input)).toBe(expected);
  });

  test('should keep the original string when no indentation is present', () => {
    const input = "line1\nline2\nline3";
    expect(fixIndent(input)).toBe(input);
  });

  test('should not modify an empty string', () => {
    const input = '';

    expect(fixIndent(input)).toBe('');
  });

  test('should handle lines with only whitespace correctly', () => {
    const input = "  line1\n\n  line2";
    const expected = "line1\n\nline2";

    expect(fixIndent(input)).toBe(expected);
  });
});
