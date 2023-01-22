import buildFiscalYearHomePriceData from './index';

const zhviData = {
  '2002-01-31': 100,
  '2002-02-28': 110,
  '2002-03-31': 120,
  '2002-04-30': 125,
  '2002-05-31': 125,
  '2002-06-30': 130,
  '2002-07-31': 135,
  '2002-08-31': 140,
  '2002-09-30': 142,
  '2002-10-31': 162,
  '2002-11-30': 163,
  '2002-12-31': 163,
  '2003-01-31': 164,
  '2003-02-28': 165,
  '2003-03-31': 166,
  '2003-04-30': 166,
  '2003-05-31': 167,
  '2003-06-30': 168,
  '2003-07-31': 168,
  '2003-08-31': 169,
  '2003-09-30': 170,
  '2003-10-31': 171,
  '2003-11-30': 171,
  '2003-12-31': 172,
};

describe('buildFiscalYearHomePriceData', () => {
  test('returns a valid HomeValueSeries object', () => {
    const homeValueSeries = buildFiscalYearHomePriceData([zhviData]);

    expect(homeValueSeries).toEqual({
      2002: {
        Q1: [100, 110, 120],
        Q2: [125, 125, 130],
        Q3: [135, 140, 142],
        Q4: [162, 163, 163],
      },
      2003: {
        Q1: [164, 165, 166],
        Q2: [166, 167, 168],
        Q3: [168, 169, 170],
        Q4: [171, 171, 172],
      },
    });
  });

  test('returns null for an empty data input', () => {
    const homeValueSeries = buildFiscalYearHomePriceData([]);

    expect(homeValueSeries).toBe(null);
  });

  test('returns null for an invalid data input', () => {
    // @ts-ignore Ignored to cause a null return.
    const homeValueSeries = buildFiscalYearHomePriceData({});

    expect(homeValueSeries).toBe(null);
  });
});
