import { Quarters, QuarterMonths } from './fiscalYearTypes';

/**
 * Types for housing and labor statistics data series.
 */

/**
 * Data format for Zillows ZHVI data.
 */
export type ZHVIdata = [
  {
    [date: string]: number;
  },
];

/**
 * The BLS wage data point definition.
 */
export interface BLSWageDataPoint {
  year: string | number;
  period: Quarters,
  periodName?: string,
  value: string | number,
  aspects?: [],
  footnotes?: [{}],
}

/**
 * Price/Earnings data point definition.
 */
export interface PEdataPoint {
  year: string,
  period: string,
  avgHomeValue: number,
  dateRange: Date[],
  annualWage: number,
  PEratio: number,
}

/**
 * The shape of the home value series data points.
 */
export type HomeValueSeries = {
  [x: string]: QuarterMonths | {
    [x: string]: number[];
  };
} | null;
