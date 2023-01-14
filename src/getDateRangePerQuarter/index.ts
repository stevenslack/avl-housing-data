import { QuarterKeys } from '../types/fiscalYearTypes';
import quarterMonths from '../quarterMonths';
/**
 * Get the date range for a quarter period in a year.
 *
 * @param year    - The year in which the quarter resides.
 * @param quarter - The quarter to get the month range for.
 * @returns       - An array of 2 dates from beginning to end of a quarter.
 */
export default function getDateRangePerQuarter(year: number, quarter: QuarterKeys): Date[] {
  let dateRange: Date[] = [new Date(), new Date()];
  // Set the date range as an array of beginning and end months for each quarter.
  dateRange = [
    new Date(year, quarterMonths[quarter][0] - 1, 1),
    new Date(year, quarterMonths[quarter][2], 0),
  ];

  return dateRange;
}
