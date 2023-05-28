/**
 * Trims the whitespace from the start and end of each line.
 *
 * Also optionally trims the leading and trailing line blocks.
 *
 * @param str The string to trim.
 * @param config { trimVerticalStart: boolean, trimVerticalEnd: boolean } Optional config object. Defaults to { trimVerticalStart: true, trimVerticalEnd: true } if not provided.
 *         trimVerticalStart: If true, removes the leading line blocks.
 *         trimVerticalEnd: If true, removes the trailing line blocks.
 * @returns The trimmed string.
 */
export function trimLines(
  str: string,
  config?: { trimVerticalStart: boolean; trimVerticalEnd: boolean }
): string {
  const { trimVerticalStart, trimVerticalEnd } = {
    trimVerticalStart: config?.trimVerticalStart ?? true,
    trimVerticalEnd: config?.trimVerticalEnd ?? true,
  };

  const splitLines = str.split('\n');

  let firstOccupiedLineIdx: number | undefined = undefined;
  let lastOccupiedLineIdx: number | undefined = undefined;

  // Trim the whitespace for each line.
  const resultArrPreLeadTrail = splitLines.map((l, idx) => {
    // Trim the whitespace for this line.
    const newVal = l.trim();

    // Bookkeeping
    if (newVal.length > 0) {
      if (firstOccupiedLineIdx === undefined) {
        firstOccupiedLineIdx = idx;
      }
      lastOccupiedLineIdx = idx;
    }

    return newVal;
  });

  let resultArr = resultArrPreLeadTrail;

  // Remove leading & trailing line blocks
  if (trimVerticalStart && trimVerticalEnd) {
    resultArr =
      firstOccupiedLineIdx !== undefined && lastOccupiedLineIdx !== undefined
        ? //@ts-ignore
          resultArrPreLeadTrail.slice(
            firstOccupiedLineIdx as number,
            // @ts-ignore
            (lastOccupiedLineIdx as number) + 1
          )
        : resultArrPreLeadTrail;
  }
  // Just remove leading
  else if (trimVerticalStart) {
    resultArr =
      // @ts-ignore
      firstOccupiedLineIdx !== undefined
        ? // @ts-ignore
          resultArrPreLeadTrail.slice(firstOccupiedLineIdx as number)
        : resultArrPreLeadTrail;
  }
  // Just remove trailing
  else if (trimVerticalEnd) {
    resultArr =
      // @ts-ignore
      lastOccupiedLineIdx !== undefined
        ? // @ts-ignore
          resultArrPreLeadTrail.slice(0, (lastOccupiedLineIdx as number) + 1)
        : // @ts-ignore
          resultArrPreLeadTrail;
  }

  // Join lines together and done.
  return resultArr.join('\n');
}
