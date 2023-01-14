import getDateRangePerQuarter from '../getDateRangePerQuarter';
import {
  BLSWageDataPoint,
  HomeValueSeries,
  PEdataPoint,
} from '../types/dataSeriesTypes';
import { ArrayOfThreeNumbers, QuarterKeys } from '../types/fiscalYearTypes';

/**
 * Build Price to Earnings Data Series.
 *
 * @param homeValues - Data for the time series of home values.
 * @param wages      - Data for the time series of wages.
 * @returns          - An array of data points with
 *                     P/E ratio, year, period, date range, avg home value, and annual wages.
 */
export default function buildPEDataSeries(
  homeValues: HomeValueSeries,
  wages: BLSWageDataPoint[],
): PEdataPoint[] {
  // Store for the PEdataPoint series.
  const dataSeries: PEdataPoint[] = [];

  for (const year in homeValues) {
    if (Object.prototype.hasOwnProperty.call(homeValues, year)) {
      const yearValue = homeValues[year];

      for (const period in yearValue) {
        if (Object.prototype.hasOwnProperty.call(yearValue, period)) {
          const yearValuePeriod: ArrayOfThreeNumbers | number[] = yearValue[period];
          // For each period there is 3 months of median home prices.
          // Below, those 3 months are averaged into one value representing the period/quarter.
          const sum: number = yearValuePeriod.reduce((acc, curr) => acc + curr, 0);
          const avgHomeValue: number = Math.round(sum / yearValuePeriod.length);

          let annualWage: string | number = 0;
          let dateRange: Date[] = [new Date(), new Date()];

          wages.forEach((x) => {
            // Ensure there is a match for each year and period/quarter
            // before calculating the annual wage.
            if ((x.year === year) && (x.period === period)) {
              // Multiply the weekly wage by the number of weeks in a year.
              annualWage = Math.round(Number(x.value) * 52.1429);
              dateRange = getDateRangePerQuarter(Number(year), period as QuarterKeys);
            }
          });

          // Calculate the Price to Earnings ratio.
          const PEratio: number = Number((avgHomeValue / annualWage).toFixed(1));

          // Only add a data point if there is a corresponding wage data value.
          if (annualWage) {
            dataSeries.push({
              year,
              period,
              dateRange,
              avgHomeValue,
              annualWage,
              PEratio,
            });
          }
        }
      }
    }
  }

  return dataSeries;
}
