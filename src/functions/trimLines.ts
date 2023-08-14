export interface TrimLinesConfig {
  /**
   * If true, trims the whitespace from the start of each line,
   * equal to the least indented line of the provided text.
   * 
   * @default true
   */
  trimLeftToLeastIndent?: boolean;
  /**
   * If true, removes the leading line blocks.
   * 
   * @default true
   */
  trimVerticalStart?: boolean; 
  /** 
   * If true, removes the trailing line blocks.
   * 
   * @default true
   */
  trimVerticalEnd?: boolean 
  /**
   * FUTURE: If provided, will force all lines to have at least this much whitespace at the start.
   */
  // minIndent?: {
  //   type: 'spaces',
  //   minNumSpaces: number
  // } | {
  //   type: 'tabs',
  //   minNumTabs: number
  // }
}


/**
 * Trims the whitespace from the start and end of each line.
 *
 * Also optionally trims the leading and trailing line blocks.
 *
 * @param str The string to trim.
 * @param config Configuration for how to trim the string.
 * @returns The trimmed string.
 */
export function trimLines(
  str: string,
  config?: TrimLinesConfig
): string {
  const { trimLeftToLeastIndent, trimVerticalStart, trimVerticalEnd } = {
    trimLeftToLeastIndent: config?.trimLeftToLeastIndent ?? true,
    trimVerticalStart: config?.trimVerticalStart ?? true,
    trimVerticalEnd: config?.trimVerticalEnd ?? true,
  };

  const splitLines = str.split('\n');

  function getStringLeftIndentLength(str: string): number {
    return str.length - str.trimLeft().length;
  }

  let firstOccupiedLineIdx: number | undefined = undefined;
  let lastOccupiedLineIdx: number | undefined = undefined;

  // If trimLeftToLeastIndent is true, we need to get the length of the least indent.
  let leastIndent: null | number = null;
  if (trimLeftToLeastIndent) {
    // Get the least indent.
    for (const l of splitLines) {
      // Ignore empty lines.
      if (l.trim().length === 0) {
        continue;
      }

      // Get the indent for this line.
      const indent = getStringLeftIndentLength(l)

      // Update leastIndent if needed.
      if (leastIndent === null || indent < leastIndent) {
        leastIndent = indent;
      }
    }
  }

  // Trim the whitespace for each line.
  const resultArrPreLeadTrail = splitLines.map((l, idx) => {
    // Trim the whitespace for this line.
    let newVal = l.trim();

    // If trimLeftToLeastIndent is true, trim the whitespace from the start of each line to the least indent.
    if (trimLeftToLeastIndent && leastIndent !== null) {
        // Calculate the correct amount of left indent for this line.
        const indentOfThisItem = getStringLeftIndentLength(l);
        const totalIndent = Math.max(0, indentOfThisItem - leastIndent);

        // Re-add the correct amount of whitespace to the start of this line.
        newVal = totalIndent ? `${' '.repeat(totalIndent)}${newVal}` : newVal;
    }

    // Bookkeeping
    if (newVal.length > 0) {
      if (firstOccupiedLineIdx === undefined) {
        firstOccupiedLineIdx = idx;
      }
      lastOccupiedLineIdx = idx;
    }

    return newVal;
  });

  // If this string is all whitespace, return an empty string.
  if (firstOccupiedLineIdx === undefined || lastOccupiedLineIdx === undefined) {
    return '';
  }

  let resultArr = resultArrPreLeadTrail;

  // Remove leading & trailing line blocks
  if (trimVerticalStart && trimVerticalEnd) {
    resultArr = resultArrPreLeadTrail.slice(
            firstOccupiedLineIdx as number,
            // @ts-ignore
            (lastOccupiedLineIdx as number) + 1
          );
  }
  // Just remove leading
  else if (trimVerticalStart) {
    resultArr = resultArrPreLeadTrail.slice(firstOccupiedLineIdx as number)
  }
  // Just remove trailing
  else if (trimVerticalEnd) {
    resultArr = resultArrPreLeadTrail.slice(0, (lastOccupiedLineIdx as number) + 1)
  }

  // Join lines together and done.
  return resultArr.join('\n');
}
