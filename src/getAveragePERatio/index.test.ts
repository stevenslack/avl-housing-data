import getAveragePERatio from '.';
import { PEdataPoint } from '../types/dataSeriesTypes';

const mockData = [
  {
    year: '2013',
    period: 'Q1',
    dateRange: [
      new Date('2013-01-01'),
      new Date('2013-03-31T04:00:00.000Z'),
    ],
    avgHomeValue: 205889,
    annualWage: 37386,
    PEratio: 5.5,
  },
  {
    year: '2013',
    period: 'Q2',
    dateRange: [
      new Date('2013-04-01T04:00:00.000Z'),
      new Date('2013-06-30T04:00:00.000Z'),
    ],
    avgHomeValue: 207695,
    annualWage: 35979,
    PEratio: 5.8,
  },
  {
    year: '2022',
    period: 'Q1',
    dateRange: [
      new Date('2022-01-01T05:00:00.000Z'),
      new Date('2022-03-31T04:00:00.000Z'),
    ],
    avgHomeValue: 407290,
    annualWage: 50579,
    PEratio: 8.1,
  },
];

const error = new Error('Cannot calculate P/E average. Data point. PEdataPoint does not match type');

describe('getAveragePERatio', () => {
  test('calculates the average P/E ratio correctly', () => {
    expect(getAveragePERatio(mockData)).toBe(6.5);
  });

  test('calculates the average P/E ratio for empty array as 0', () => {
    const data: PEdataPoint[] = [];
    expect(getAveragePERatio(data)).toBeNaN();
  });

  test('calculates the average P/E ratio for array with a null object', () => {
    const mockCopyNull = mockData;
    // @ts-ignore
    mockCopyNull.push(null);

    expect(() => getAveragePERatio(mockCopyNull)).toThrow(error);
  });

  test('calculates the average P/E ratio for array with undefined object.', () => {
    const mockCopyUndefined = mockData;
    // @ts-ignore
    mockCopyUndefined.push(undefined);

    expect(() => getAveragePERatio(mockCopyUndefined)).toThrow(error);
  });
});
