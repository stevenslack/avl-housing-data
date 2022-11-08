import './style.css';
import housingData from './data/avl-county-zhvi.json' assert { type: 'JSON' };

const weeklyWages = Object.entries(Array.from(housingData)[0]);

/**
 * Interface for each year / quarterly data points.
 */
interface yearData {
  [year: string]: {
    [quarter: string]: number[];
  };
};

/**
 * Get the yearly quarter key.
 *
 * @param month - The month as a number 1 - 12.
 * @returns The quarter key. Possible values are Q1, Q2, Q3, Q4 or an empty string.
 */
function getQuarter(month: number): string {
  const quarters = {
    'Q1': [1, 2, 3],
    'Q2': [4, 5, 6],
    'Q3': [7, 8, 9],
    'Q4': [10, 11, 12],
  };

  for (const [key, value] of Object.entries(quarters)) {
    if (-1 !== value.indexOf(month)) {
      return key;
    }
  }
  return '';
}

const final = weeklyWages.reduce((acc: yearData, curr: [string, number], index): yearData => {
  const date = new Date(curr[0]);

  const year: string = JSON.stringify(date.getFullYear());
  // Set the quarter ID by passing the month. Add 1 to ensure months are not on a zero-based numbering sequence.
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

console.log(final);

// const api = fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/ENU3702140010/?startyear=2013&endyear=2023&calculations=true&annualaverage=true&aspects=true').then((data) => {
//   return data.json();
// });

// console.log(api);