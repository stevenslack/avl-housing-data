import './style.css';
import * as d3 from 'd3';

import { ValueFn } from 'd3';
import housingData from './data/avl-county-zhvi.json' assert { type: 'JSON' };
import wagesData from './data/bls-wages';

// TODO: fetch data and use stored data if endpoint limit is reached.
// fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/ENU3702140010/?startyear=2013&endyear=2023&calculations=true&annualaverage=true&aspects=true')
//   .then((data) => data.json())
//   .then((result) => result?.Results)
//   .then((series) => console.log(series['series'][0]['data']));

// Shape for period/quarters key values.
type Quarters = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q01' | 'Q02' | 'Q03' | 'Q04' | 'Q05';
type QuarterKeys = Extract<Quarters, 'Q1' | 'Q2' | 'Q3' | 'Q4'> | string;

// Common types.
type ArrayOfThreeNumbers = [number, number, number];

// Data format for the ZHVI data.
type ZHVIdata = [
  {
    [date: string]: number;
  },
];

/**
 * Interface for each year / quarterly data points.
 */
interface YearData {
  [year: string]: {
    [quarter: string]: number[];
  };
}

/**
 * The BLS wage data point definition.
 */
interface BLSWageDataPoint {
  year: string | number;
  period: Quarters,
  periodName: string,
  value: string | number,
  aspects: [],
  footnotes: [{}],
}

/**
 * Price/Earnings data point definition.
 */
interface PEdataPoint {
  year: string,
  period: string,
  avgHomeValue: number,
  dateRange: Date[],
  annualWage: number,
  PEratio: number,
}

type QuarterMonths = {
  [key in QuarterKeys]: ArrayOfThreeNumbers;
};

type HomeValueSeries = { [x: string]: QuarterMonths | { [x: string]: number[]; }; } | null;

// eslint-disable-next-line max-len
type LineGenerator = ValueFn<SVGPathElement, PEdataPoint[], string | number | boolean | readonly (string | number)[] | null>;

/**
 * An object representing each fiscal quarter with
 * the corresponding month numbers in an array.
 */
const quarterMonths: QuarterMonths = {
  Q1: [1, 2, 3],
  Q2: [4, 5, 6],
  Q3: [7, 8, 9],
  Q4: [10, 11, 12],
};

/**
 * Get the date range for a quarter period in a year.
 *
 * @param year - The year in which the quarter resides.
 * @param quarter - The quarter to get the month range for.
 * @returns an array of 2 dates from beginning to end of a quarter.
 */
function getDateRangePerQuarter(year: number, quarter: QuarterKeys): Date[] {
  let dateRange: Date[] = [new Date(), new Date()];
  // Set the date range as an array of beginning and end months for each quarter.
  dateRange = [
    new Date(year, quarterMonths[quarter][0] - 1, 1),
    new Date(year, quarterMonths[quarter][2], 0),
  ];

  return dateRange;
}

/**
 * Get the yearly quarter key.
 *
 * @param month - The month as a number 1 - 12.
 * @returns The quarter key. Possible values are Q1, Q2, Q3, Q4 or an empty string.
 */
function getQuarter(month: number): string {
  for (const [key, value] of Object.entries(quarterMonths)) {
    if (value.indexOf(month) !== -1) {
      return key;
    }
  }
  return '';
}

/**
 * Get the PE Average.
 *
 * @param data - An array of PEdataPoint objects.
 * @returns - The P / E average across the dataset.
 */
function getAveragePERatio(data: PEdataPoint[]): number {
  const total: number = data?.length || 0;

  const totalPEratio: number = data.reduce(
    (acc: number, curr: PEdataPoint) => acc + Number(curr?.PEratio),
    0,
  );

  return Number((totalPEratio / total).toFixed(1));
}

/**
 * Build the fiscal year home price series using Zillows ZHVI data.
 *
 * The data built in this function represents each year
 * divided into quarters which have their monthly home values in an array.
 *
 * @param data The ZHVI data.
 * @returns    The home value series which is an object
 *             with year keys and quarterly home price values.
 */
function buildFiscalYearHomePriceData(data: ZHVIdata | {}[]): HomeValueSeries | null {
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

/**
 * Build Price to Earnings Data Series.
 *
 * @param homeValues - Data for the time series of home values.
 * @param wages - Data for the time series of wages.
 * @returns - An array of data points with
 *            P/E ratio, year, period, date range, avg home value, and annual wages.
 */
function buildPEDataSeries(homeValues: HomeValueSeries, wages: BLSWageDataPoint[]): PEdataPoint[] {
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

// Assign the period data to match the housing data set (Q01 to equal Q1).
const wageData: BLSWageDataPoint[] = wagesData
  .map((x: BLSWageDataPoint) => ({
    ...x,
    period: x.period.replace('0', ''),
  }));

const homeValueSeries = buildFiscalYearHomePriceData(housingData);
const dataSeries = buildPEDataSeries(homeValueSeries, wageData);
const PEavg = getAveragePERatio(dataSeries);
const width = 1000;
const height = 600;

// Select the existing SVG element.
const svg = d3.select('.pe-graph__svg')
  .attr('width', width)
  .attr('height', height);

/**
 * Set up the scale and path (for the line) of the SVG.
 */
const xScale: d3.ScaleTime<number, number, never> = d3.scaleTime()
  .domain(
    d3.extent(dataSeries, (d: PEdataPoint) => d.dateRange?.[1]) as Date[],
  )
  .range([0, width]);

const yScale: d3.ScaleLinear<number, number, never> = d3.scaleLinear()
  // The domain gives us the y-axis range starting at 4.
  .domain([4, d3.max(dataSeries, (d: PEdataPoint) => d.PEratio) as number + 1])
  .range([height, 10]);

const lineGenerator = d3.line()
  .x((d: PEdataPoint | [number, number]) => {
    if ('dateRange' in d) {
      return xScale(d.dateRange?.[1]);
    }
    // default behavior of returning first element of a two-element array of numbers.
    return d[0];
  })
  .y((d: PEdataPoint | [number, number]) => {
    if ('PEratio' in d) {
      return yScale(d.PEratio);
    }
    // default behavior of returning first element of a two-element array of numbers.
    return Array.isArray(d) ? d[0] : 0;
  })
  .curve(d3.curveMonotoneX);

svg.append('path')
  .datum(dataSeries)
  .attr('d', lineGenerator as LineGenerator)
  .attr('stroke', 'steelblue')
  .attr('fill', 'none');

// Average line.
d3.select('.pe-graph__avg-line')
  .attr('x2', `${width}`)
  .attr('y1', yScale(PEavg))
  .attr('y2', yScale(PEavg));

/**
 * X Axis set up.
 */
const xAxis = d3.axisBottom(xScale);
svg.append('g')
  // The transform puts the x axis at the bottom of the graph.
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis)
  .append('text')
  .attr('class', 'pe-graph__x-axis-label')
  .attr('fill', 'currentColor')
  .attr('x', `${width / 2}`)
  .attr('y', 50)
  .text('Year')
  .style('font-size', '16px');

/**
 * Y axis set up.
 */
const yAxis = d3.axisLeft(yScale);
svg.append('g')
  .call(yAxis)
  .append('text')
  .attr('class', 'pe-graph__y-axis-label')
  .attr('fill', 'currentColor')
  .attr('x', `-${height / 2}`)
  .attr('y', -50)
  .text('P/E Ratio')
  .style('transform', 'rotate(-90deg)')
  .style('font-size', '16px');

const tooltip = d3.select('.tooltip');
const tooltipCircle = d3.select('.pe-graph__tooltip-circle');
const xAxisLine = d3.select('.pe-graph__drop-line');

svg.on('mousemove', (event) => {
  // eslint-disable-next-line max-len
  const calculateDataPoint = (d: PEdataPoint) => Math.abs(Number(d.dateRange?.[1]) - Number(xScale.invert(event.offsetX)));
  // Update the position of the tooltip
  const index = d3.leastIndex(
    dataSeries,
    (a: PEdataPoint, b: PEdataPoint) => calculateDataPoint(a) - calculateDataPoint(b),
  );

  if (typeof index !== 'undefined') {
    const dataPoint: PEdataPoint = dataSeries[index];

    // Format the date for displaying the year value from the data point.
    const formatDate = d3.timeFormat('%Y');
    // Get the data point values to populate the tool tip.
    const year = formatDate(dataPoint?.dateRange?.[1]);
    const PERatio = dataPoint?.PEratio;

    // Create our number formatter.
    const currencyFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    // Apply the values to update the tooltip.
    tooltip.select('.tooltip__date').text(`${dataPoint?.period} ${year}`);
    tooltip.select('.tooltip__pe-ratio').text(PERatio);
    tooltip.select('.tooltip__wage').text(currencyFormat.format(dataPoint?.annualWage));
    tooltip.select('.tooltip__home-price').text(currencyFormat.format(dataPoint?.avgHomeValue));

    const x = xScale(dataPoint?.dateRange?.[1]);
    const y = yScale(PERatio);

    tooltip.style('opacity', 1);
    tooltip.style(
      'transform',
      `translate(calc(-35% + ${x}px), calc(-80% + ${y}px))`,
    );

    tooltipCircle
      .attr('cx', x)
      .attr('cy', y)
      .style('opacity', 1);

    xAxisLine.attr('x', x)
      .attr('y', y)
      .attr('height', height - y)
      .style('opacity', 1);
  }
}).on('mouseleave', () => {
  // Hide the tooltip and the tooltipCircle.
  tooltip.style('opacity', 0);
  tooltipCircle.style('opacity', 0);
  xAxisLine.style('opacity', 0);
});
