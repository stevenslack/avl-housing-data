import './style.css';
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
 * Interface for the BLS wage data point.
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
 * Price/Earnings data point.
 */
interface PEdataPoint {
  year: string,
  period: string,
  avgHomeValue: number,
  annualWage: number,
  PEratio: number,
}

// Store for the PEdataPoint series.
const dataSeries: PEdataPoint[] = [];

/**
 * Get the yearly quarter key.
 *
 * @param month - The month as a number 1 - 12.
 * @returns The quarter key. Possible values are Q1, Q2, Q3, Q4 or an empty string.
 */
function getQuarter(month: number): string {
  const quarters = {
    Q1: [1, 2, 3],
    Q2: [4, 5, 6],
    Q3: [7, 8, 9],
    Q4: [10, 11, 12],
  };

  for (const [key, value] of Object.entries(quarters)) {
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
  .map((x: BLSWageDataPoint) => {
    const dataPoint = x;
    dataPoint.period = x.period.replace('0', '');
    return dataPoint;
  });

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
        seriesData.forEach((x) => {
          // Ensure there is a match for each year and period/quarter
          // before calculating the annual wage.
          if ((x.year === year) && (x.period === period)) {
            // Multiply the weekly wage by the number of weeks in a year.
            annualWage = Math.round(Number(x.value) * 52.1429);
          }
        });

        // Calculate the Price to Earnings ratio.
        const PEratio: number = Number((avgHomeValue / annualWage).toFixed(1));

        // Only add a data point if there is a corresponding wage data value.
        if (annualWage) {
          dataSeries.push({
            year,
            period,
            avgHomeValue,
            annualWage,
            PEratio,
          });
        }
      }
    }
  }
}

function getPlotLineString() {
  const plotLine: Array<[number, number]> = [];
  dataSeries.forEach((dataPoint, index) => {
    console.log(dataPoint);
    const ratio = dataPoint.PEratio;
    const year = Number(dataPoint.year);
    // const delimiter = dataSeries.length !== index + 1 ? ', ' : '';
    plotLine.push([index, ratio]);
  });
  return plotLine;
}

/**
 * https://css-tricks.com/svg-path-syntax-illustrated-guide/
 * Create plot line with data points for an SVG with the following:
 *
 * Example: width 200 and height 160;
 *
 * width = total number of data points
 * height = range from lowest to highest point + some padding.
 *
 * Example data point:
 *
 * Starting at the bottom left of the graph:
 * "0 160" would indicate the following:
 * 0 = all the way to the left of the viewbox
 * 160 = all the way from the top (start at bottom left)
 *
 *  <svg width="190" height="160" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 160 C 40 10, 65 10, 95 80 S 150 150, 190 0" stroke="black" fill="transparent"/>
    </svg>
 *
 */
