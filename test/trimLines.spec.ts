import { trimLines } from '../src/';

describe('trimLines', () => {
    it('should trim whitespace from the start and end of each line', () => {
      const input = '   Line 1   \n  Line 2   ';
      const expected = 'Line 1\nLine 2';
      const result = trimLines(input);
      expect(result).toEqual(expected);
    });
  
    it('should remove leading and trailing line blocks by default', () => {
      const input = '\n\n  Line 1  \n  Line 2  \n\n';
      const expected = 'Line 1\nLine 2';
      const result = trimLines(input);
      expect(result).toEqual(expected);
    });
  
    it('should not remove any line blocks if both options are false', () => {
      const input = '\n\n  Line 1  \n  Line 2  \n\n';
      const config = { trimVerticalStart: false, trimVerticalEnd: false };
      const expected = '\n\nLine 1\nLine 2\n\n';
      const result = trimLines(input, config);
      expect(result).toEqual(expected);
    });
  
    it('should remove only leading line blocks if specified', () => {
      const input = '\n\n  Line 1  \n  Line 2  \n\n';
      const config = { trimVerticalStart: true, trimVerticalEnd: false };
      const expected = 'Line 1\nLine 2\n\n';
      const result = trimLines(input, config);
      expect(result).toEqual(expected);
    });
  
    it('should remove only trailing line blocks if specified', () => {
      const input = '\n\n  Line 1  \n  Line 2  \n\n';
      const config = { trimVerticalStart: false, trimVerticalEnd: true };
      const expected = '\n\nLine 1\nLine 2';
      const result = trimLines(input, config);
      expect(result).toEqual(expected);
    });
  });