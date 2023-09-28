import _ from 'lodash';

/**
 * This function detects the minimum indentation level of each line and removes it.
 * It reads over all lines, identifies the minimum indentation level, and strips all
 * indentation before this level.
 *
 * @param {string} str - The input string containing lines separated by newline characters.
 * @param {boolean} detectIndentation - When set to true, detects and removes the min indentation level.
 * @return {string} - Returns a new string with adjusted indentation.
 */
export function fixIndent(str: string): string {
    // Split the input string into an array of lines
    const lines = str.split('\n');

    // Detect the minimum indentation level in non-empty lines
    const minIndentLevel =
        _.chain(lines)
            .filter(line => line.trim().length > 0)
            .map(line => line.length - line.trimStart().length)
            .min()
            .value() || 0;

    // Remove the minimum indentation level from each line
    return lines.map(line => line.slice(minIndentLevel)).join('\n');
}
