import { trimLines } from '../src/';

describe('trimLines', () => {
    it('should trim whitespaces from start and end of each line by default', () => {
      const input = `
        line1   
        line2  
          line3 
      `;
      const expectedOutput = 'line1\nline2\n  line3';
      expect(trimLines(input)).toEqual(expectedOutput);
    });
  
    it('should trim left to least indent by default', () => {
      const input = `
            line1
              line2
                
                line3
            
      `;
      const expectedOutput = 'line1\n  line2\n    \n    line3';
      expect(trimLines(input)).toEqual(expectedOutput);
    });

    it('should NOT trim left to least indent when disabled', () => {
        const input = `
              line1
                line2
                  line3
        `;
        const config = { trimLeftToLeastIndent: false };
        const expectedOutput = 'line1\nline2\nline3';
        expect(trimLines(input, config)).toEqual(expectedOutput);
      });
  
    it('should remove leading line blocks by default', () => {
      const input = `
        line1
        line2
        line3
      `;
      const expectedOutput = 'line1\nline2\nline3';
      expect(trimLines(input)).toEqual(expectedOutput);
    });

    it('should remove trailing line blocks by default', () => {
      const input = `
        line1
        line2
        line3
  
      `;
      const expectedOutput = 'line1\nline2\nline3';
      expect(trimLines(input)).toEqual(expectedOutput);
    });

    it('should remove ONLY leading line blocks when configured', () => {
        const input = `
          line1
          line2
          line3
        `;
        const config = { trimVerticalStart: true, trimVerticalEnd: false };
        const expectedOutput = 'line1\nline2\nline3\n';
        expect(trimLines(input, config)).toEqual(expectedOutput);
      });

    it('should remove ONLY trailing line blocks when configured', () => {
        const input = `
          line1
          line2
          line3
        `;
        const config = { trimVerticalStart: false, trimVerticalEnd: true };
        const expectedOutput = '\nline1\nline2\nline3';
        expect(trimLines(input, config)).toEqual(expectedOutput);
      });
    
    it('should remove NEITHER trailing line blocks when configured', () => {
        const input = `
          line1
          line2
          line3
        `;
        const config = { trimVerticalStart: false, trimVerticalEnd: false };
        const expectedOutput = '\nline1\nline2\nline3\n';
        expect(trimLines(input, config)).toEqual(expectedOutput);
      });
  

  
    it('should handle an empty string', () => {
      const input = '';
      const expectedOutput = '';
      expect(trimLines(input)).toEqual(expectedOutput);
    });
  
    it('should handle a string with only whitespaces', () => {
      const input = '   \n\t\n  ';
      const expectedOutput = '';
      expect(trimLines(input)).toEqual(expectedOutput);
    });
  });