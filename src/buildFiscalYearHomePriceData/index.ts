import getQuarter from '../getQuarter';
import { HomeValueSeries, ZHVIdata } from '../types/dataSeriesTypes';
import { YearData } from '../types/fiscalYearTypes';

/**
 * Build the fiscal year home price series using Zillows ZHVI data.
 *
 * The data built in this function represents each year
 * divided into quarters which have their monthly home values in an array.
 *
 * @param data - The ZHVI data.
 * @returns    - The home value series which is an object
 *               with year keys and quarterly home price values.
 */
export default function buildFiscalYearHomePriceData(
  data: ZHVIdata | {}[],
): HomeValueSeries | null {
  let monthlyHomePrices: {}[] = [{}];

  // Ensure the data is in the correct shape.
  if (Array.isArray(data) && data?.length >= 1) {
    monthlyHomePrices = Object.entries(Array.from(data)[0]);
  }

  if (Object.keys(monthlyHomePrices[0]).length === 0) {
    return null;
  }

  return monthlyHomePrices.reduce((acc: YearData, curr: [string, number] | {}) => {
    const date = Array.isArray(curr) ? new Date(curr[0]) : new Date();

    const year: string = JSON.stringify(date.getFullYear());
    // Set the quarter ID by passing the month.
    // Add 1 to ensure months are not on a zero-based numbering sequence.
    const quarter: string = getQuarter(date.getMonth() + 1);

    const [, currHomeValue] = Array.isArray(curr) ? curr : [];

    let quarterlyHomeValues: number[] = [currHomeValue];

    if (acc[year] && acc[year][quarter]) {
      const accHomeValues = acc[year][quarter];
      accHomeValues.push(currHomeValue);
      quarterlyHomeValues = accHomeValues;
    }

    return { ...acc, [year]: { ...acc[year], [quarter]: quarterlyHomeValues } };
  }, {});
}
