/**
 * Calculate the height for a specific width and aspect ratio.
 *
 * @param width The width used to generate a height for the aspect ratio.
 * @param aspectRatio The aspect ratio with the ':' as a delimiter. Example: '16:9'.
 * @returns the height for the aspect ratio.
 */
export default function calcAspectRatioHeight(width: number = 100, aspectRatio: string = '16:9'):number {
  let y = String(aspectRatio); // make a copy of the aspect ratio.

  const errorMessage = `calcAspectRatioHeight() contains an invalid aspect ratio format of "${aspectRatio}"`;

  // If the aspect ratio is invalid use the default value of 16:9.
  if (!y || !y.includes(':')) {
    y = '16:9';
    // eslint-disable-next-line no-console
    console.log(errorMessage);
  }
  // Split the string between the delimiter in order to run the aspect ratio calculation.
  const [divisor, dividend] = y.split(':', 2);

  // Cast the divisor and dividend as integers.
  const divisorCopy = Number(divisor);
  const dividendCopy = Number(dividend);

  let quotient = dividendCopy / divisorCopy;

  // Check for empty values for quotient assignment and fallback to 16:9 otherwise.
  if (
    (!divisorCopy || Number.isNaN(divisorCopy))
    || (!dividendCopy || Number.isNaN(dividendCopy))
  ) {
    quotient = 9 / 16;
  }

  // In the case that the quotient is invalid or not a number, use the default aspect ratio.
  if (Number.isNaN(quotient)) {
    // eslint-disable-next-line no-console
    console.log(errorMessage);
    quotient = 9 / 16;
  }

  // Set the width as a number and fallback to 100 as a default.
  const x = width ? Number(width) : 100;

  return quotient * x;
}
