import { validate as isUuid } from 'uuid';

import { typedUuidV4 } from '../src';

describe('typedUuidV4', () => {
  it('should generate a valid UUID with the given type name', () => {
    const typeName = 'TestType';
    const result = typedUuidV4(typeName);

    // Check that the result has the correct format
    expect(result).toMatch(
      new RegExp(
        `^${typeName}_[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$`
      )
    );

    // Extract the UUID part and validate it
    const uuidPart = result.split('_')[1];
    expect(isUuid(uuidPart)).toEqual(true);
  });

  it('should work with different type names', () => {
    const typeName = 'AnotherType';
    const result = typedUuidV4(typeName);

    // Check that the result has the correct format
    expect(result).toMatch(
      new RegExp(
        `^${typeName}_[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$`
      )
    );

    // Extract the UUID part and validate it
    const uuidPart = result.split('_')[1];
    expect(isUuid(uuidPart)).toEqual(true);
  });

  it('should generate unique UUIDs', () => {
    const typeName = 'TestType';
    const results = new Set<string>();

    for (let i = 0; i < 1000; i++) {
      const result = typedUuidV4(typeName);

      // Check that the UUID is not already in the set
      expect(results.has(result)).toBeFalsy();

      // Add the generated UUID to the set
      results.add(result);
    }
  });
});
