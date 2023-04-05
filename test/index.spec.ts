import { lukePackage } from '../src';

describe('index', () => {
  describe('lukePackage', () => {
    it('should return a string containing the message', () => {
      const message = 'Hello';

      const result = lukePackage(message);

      expect(result).toMatch(message);
    });
  });
});
