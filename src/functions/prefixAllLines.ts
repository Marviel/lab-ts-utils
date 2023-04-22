/**
 * This function adds a given prefix to the start of each line in a given string.
 *
 * @param {string} prefix - The prefix to be added before each line.
 * @param {string} str - The input string containing lines separated by newline characters.
 * @return {string} - Returns a new string with each line prefixed with the given prefix.
 */
export function prefixAllLines(prefix: string, str: string): string {
  return str
    .split('\n')
    .map(line => `${prefix}${line}`)
    .join('\n');
}
