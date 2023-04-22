/**
 * This function trims the whitespace at the start and end of each line in a given string.
 *
 * @param {string} str - The input string containing lines separated by newline characters.
 * @return {string} - Returns a new string in which all lines have been trimmed.
 */
export function trimAllLines(str: string, detectIndentation = true): string {
  return str
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}
