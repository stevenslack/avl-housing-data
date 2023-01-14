import quarterMonths from '../quarterMonths';

/**
 * Get the yearly quarter key.
 *
 * @param month - The month as a number 1 - 12.
 * @returns     - The quarter key. Possible values are Q1, Q2, Q3, Q4 or an empty string.
 */
export default function getQuarter(month: number): string {
  for (const [key, value] of Object.entries(quarterMonths)) {
    if (value.indexOf(month) !== -1) {
      return key;
    }
  }
  return '';
}
