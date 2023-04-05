/**
 * Prepends "Bearer" to a JWT token if it doesn't already start with "Bearer".
 *
 * @param token - The JWT token as a string, possibly without the "Bearer" prefix.
 * @returns A JWT token as a string starting with "Bearer", followed by a space and the token.
 */
export function jwtBearerify(token: string): string {
  // Check if the token starts with "Bearer", and return it with the prefix if not
  return token.startsWith('Bearer') ? token.trim() : `Bearer ${token.trim()}`;
}
