/**
 * Fiscal Year Types.
 */

/**
 * Fiscal Quarter identifiers.
 * Shape for period/quarters key values.
 */
export type Quarters = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q01' | 'Q02' | 'Q03' | 'Q04' | 'Q05';

/**
 * Specific Fiscal Quarter identifiers.
 */
export type QuarterKeys = Extract<Quarters, 'Q1' | 'Q2' | 'Q3' | 'Q4'> | string;

/**
 * An array of three numbers.
 */
export type ArrayOfThreeNumbers = [number, number, number];

/**
 * Quarter keys and an array of three months
 * represented by month numbers.
 */
export type QuarterMonths = {
  [key in QuarterKeys]: ArrayOfThreeNumbers;
};

/**
 * Interface for each year / quarterly data points.
 */
export interface YearData {
  [year: string]: {
    [quarter: string]: number[];
  };
}
