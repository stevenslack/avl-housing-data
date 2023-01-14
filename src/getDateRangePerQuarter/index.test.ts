import getDateRangePerQuarter from './index';

test('getDateRangePerQuarter returns correct date range for quarter', () => {
  const year = 2022;
  const quarter = 'Q1';
  const expectedDateRange = [new Date(2022, 0, 1), new Date(2022, 2, 31)];

  expect(getDateRangePerQuarter(year, quarter)).toEqual(expectedDateRange);
});
