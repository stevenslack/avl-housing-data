import './style.css';
import * as d3 from 'd3';

import housingData from './data/avl-county-zhvi.json' assert { type: 'JSON' };
import wagesData from './data/bls-wages';

// TODO: fetch data and use stored data if endpoint limit is reached.
// fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/ENU3702140010/?startyear=2013&endyear=2023&calculations=true&annualaverage=true&aspects=true')
//   .then((data) => data.json())
//   .then((result) => result?.Results)
//   .then((series) => console.log(series['series'][0]['data']));

const monthlyHomePrices = Object.entries(Array.from(housingData)[0]);

// Shape for period/quarters key values.
enum Quarters {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
  Q5 = 'Q5',
  Q01 = 'Q01',
  Q02 = 'Q02',
  Q03 = 'Q03',
  Q04 = 'Q04',
  Q05 = 'Q05',
}

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
  period: Quarters | string,
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

// Store for the PEdataPoint series.
const dataSeries: PEdataPoint[] = [];

type QuarterName = 'Q1' | 'Q2' | 'Q3' | 'Q4';

type QuarterMonths = {
  [key in QuarterName]: [number, number, number];
};

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
function getDateRangePerQuarter(year: number, quarter: QuarterName): Date[] {
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
 * The home value data series.
 *
 * The data stored in this variable has been manipulated to represent
 * each year divided into quarters which have their monthly home values
 * in an array.
 */
const homeValueSeries = monthlyHomePrices.reduce((acc: YearData, curr: [string, number]) => {
  const date = new Date(curr[0]);

  const year: string = JSON.stringify(date.getFullYear());
  // Set the quarter ID by passing the month.
  // Add 1 to ensure months are not on a zero-based numbering sequence.
  const quarter: string = getQuarter(date.getMonth() + 1);

  const [, currHomeValue] = curr;
  // Set the initial
  let quarterlyHomeValues: number[] = [currHomeValue];

  if (acc[year] && acc[year][quarter]) {
    const accHomeValues = acc[year][quarter];
    accHomeValues.push(currHomeValue);
    quarterlyHomeValues = accHomeValues;
  }

  return { ...acc, [year]: { ...acc[year], [quarter]: quarterlyHomeValues } };
}, {});

// Assign the period data to match the housing data set (Q01 to equal Q1).
const seriesData: BLSWageDataPoint[] = wagesData
  .map((x: BLSWageDataPoint) => ({
    ...x,
    period: x.period.replace('0', ''),
  }));

for (const year in homeValueSeries) {
  if (Object.prototype.hasOwnProperty.call(homeValueSeries, year)) {
    const yearValue = homeValueSeries[year];

    for (const period in yearValue) {
      if (Object.prototype.hasOwnProperty.call(yearValue, period)) {
        // For each period there is 3 months of median home prices.
        // Below those 3 months are averaged into one value representing the period/quarter.
        const sum: number = yearValue[period].reduce((acc, curr) => acc + curr, 0);
        const avgHomeValue: number = Math.round(sum / yearValue[period].length);

        let annualWage: string | number = 0;
        let dateRange: Date[] = [new Date(), new Date()];

        seriesData.forEach((x) => {
          // Ensure there is a match for each year and period/quarter
          // before calculating the annual wage.
          if ((x.year === year) && (x.period === period)) {
            // Multiply the weekly wage by the number of weeks in a year.
            annualWage = Math.round(Number(x.value) * 52.1429);
            dateRange = getDateRangePerQuarter(Number(year), period as QuarterName);
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

const width = 1000;
const height = 600;

const svg = d3.select('#pe-graph').append('svg')
  .attr('width', width)
  .attr('height', height)
  .lower(); // prepends the svg to the #pe-graph element.

const xScale = d3.scaleTime()
  .domain(
    d3.extent(dataSeries, (d: PEdataPoint) => d.dateRange?.[1]) as Date[],
  )
  .range([0, width]);

const yScale = d3.scaleLinear()
  // The domain gives us the y-axis range starting at 4.
  .domain([4, d3.max(dataSeries, (d: PEdataPoint) => d.PEratio) as number + 1])
  .range([height, 10]);

const lineGenerator = d3.line()
  .x((d: any) => xScale(d?.dateRange?.[1]))
  .y((d: any) => yScale(d?.PEratio))
  .curve(d3.curveMonotoneX);

svg.append('path')
  .datum(dataSeries)
  .attr('d', lineGenerator as any)
  .attr('stroke', 'steelblue')
  .attr('fill', 'none');

// Create the vertical drop line.
const xAxisLine = svg.append('g')
  .append('rect')
  .attr('class', 'dotted')
  .attr('stroke-width', '1px')
  .attr('width', '.5px');

const xAxis = d3.axisBottom(xScale);

svg.append('g')
  // The transform puts the x axis at the bottom of the graph.
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis);

const yAxis = d3.axisLeft(yScale);

// Create the y-axis-label.
svg.append('g')
  .call(yAxis)
  .append('text')
  .attr('class', 'y-axis-label')
  .attr('fill', 'currentColor')
  .attr('x', `-${height / 2}`)
  .attr('y', -50)
  .text('P/E Ratio')
  .style('transform', 'rotate(-90deg)')
  .style('font-size', '16px');

const tooltip = d3.select('.tooltip');

const tooltipCircle = svg
  .append('circle')
  .attr('class', 'tooltip__circle')
  .attr('r', 4)
  .attr('stroke', '#af9358')
  .attr('fill', 'white')
  .attr('stroke-width', 2)
  .style('opacity', 0);

svg.on('mousemove', (event) => {
  // eslint-disable-next-line max-len
  const calculateDataPoint = (d: PEdataPoint) => Math.abs(Number(d.dateRange?.[1]) - Number(xScale.invert(event.offsetX)));
  // Update the position of the tooltip
  const index = d3.leastIndex(
    dataSeries,
    (a: PEdataPoint, b: PEdataPoint) => calculateDataPoint(a) - calculateDataPoint(b),
  );

  if (typeof index !== 'undefined') {
    const dataPoint = dataSeries[index];

    // Format the date for displaying the year value from the data point.
    const formatDate = d3.timeFormat('%Y');
    // Get the data point values to populate the tool tip.
    const year = formatDate(dataPoint?.dateRange?.[1]);
    const period = dataPoint?.period;
    const PERatio = dataPoint?.PEratio;
    const homeValue = dataPoint?.avgHomeValue;
    const wages = dataPoint?.annualWage;

    // Create our number formatter.
    const currencyFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    // Apply the values to update the tooltip.
    tooltip.select('.tooltip__date-value').text(`${period} ${year}`);
    tooltip.select('.tooltip__pe-ratio-value').text(PERatio);
    tooltip.select('.tooltip__wage-value').text(currencyFormat.format(wages));
    tooltip.select('.tooltip__home-price-value').text(currencyFormat.format(homeValue));

    const x = xScale(dataPoint?.dateRange?.[1]);
    const y = yScale(PERatio);

    tooltip.style('opacity', 1);
    tooltip.style(
      'transform',
      `translate(calc( -32% + ${x}px), calc(-80% + ${y}px))`,
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

  tooltip.attr('x', event.offsetX + 10)
    .attr('y', event.offsetY + 10);
})
  .on('mouseleave', () => {
    // Hide the tooltip and the tooltipCircle.
    tooltip.style('opacity', 0);
    tooltipCircle.style('opacity', 0);
    xAxisLine.style('opacity', 0);
  });
