import { v4 as uuidv4, validate as isUuid } from 'uuid';

export type TypedUuidV4<TTypeName extends string = string> =
    `${TTypeName}_${string}`;

export function isTypedUuidV4<TTypeName extends string = string>(
    value: unknown,
    typeName?: TTypeName
): value is TypedUuidV4<TTypeName> {
    // Split on the first `_` character
    const parts = typeof value === 'string' ? value.split('_') : [];

    // If we didn't find a typeName and a UUID, it's not a typed UUID.
    if (parts.length !== 2) {
        return false;
    }

    const foundTypeName = parts[0];
    const foundUuid = parts[1];

    // If the typeName was passed in, make sure the type name matches it.
    if (typeName !== undefined && foundTypeName !== typeName) {
        return false;
    }

    // Make sure we found a type name.
    if (foundTypeName.length < 1) {
        return false;
    }

    // Make sure it's actually a UUID
    if (!isUuid(foundUuid)) {
        return false;
    }

    return true;
}

export function typedUuidV4<TTypeName extends string = any>(
    typeName: TTypeName
): `${TTypeName}_${string}` {
    // We use `_` because:
    // 1. It doesn't require URI encoding.
    // 2. It is a single character, so it is easy to split on in all languages.
    // It is visually distinct from the rest of the UUID, so it is easy to see where the type name ends and the UUID begins.
    return `${typeName}_${uuidv4()}`;
}
