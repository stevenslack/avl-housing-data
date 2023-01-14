import buildFiscalYearHomePriceData from '../buildFiscalYearHomePriceData';
import buildPEDataSeries from '../buildPEDataSeries';
import getAveragePERatio from '../getAveragePERatio';
import {
  BLSWageDataPoint,
  HomeValueSeries,
  PEdataPoint,
} from '../types/dataSeriesTypes';

import housingData from '../data/avl-county-zhvi.json' assert { type: 'JSON' };
import wagesData from '../data/bls-wages';

// TODO: fetch data and use stored data if endpoint limit is reached.
// fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/ENU3702140010/?startyear=2013&endyear=2023&calculations=true&annualaverage=true&aspects=true')
//   .then((data) => data.json())
//   .then((result) => result?.Results)
//   .then((series) => console.log(series['series'][0]['data']));

/**
 * Get the P/E Ratio data series.
 *
 * @returns An object with the PEavg value and the dataSeries object.
 */
export default function getPEDataSeries() {
  // Assign the period data to match the housing data set (Q01 to equal Q1).
  const wageData: BLSWageDataPoint[] = wagesData
    .map((x: BLSWageDataPoint) => ({
      ...x,
      period: x.period.replace('0', ''),
    }));

  const homeValueSeries: HomeValueSeries = buildFiscalYearHomePriceData(housingData);
  const dataSeries: PEdataPoint[] = buildPEDataSeries(homeValueSeries, wageData);
  const PEavg: number = getAveragePERatio(dataSeries);

  return {
    PEavg,
    dataSeries,
  };
}
