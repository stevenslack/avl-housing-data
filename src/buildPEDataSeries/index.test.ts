import buildPEDataSeries from './index';

const homeValues = {
  2000: {
    Q1: [100, 110, 120],
    Q2: [200, 210, 220],
    Q3: [],
    Q4: [],
  },
  2001: {
    Q1: [130, 140, 150],
    Q2: [230, 240, 250],
    Q3: [],
    Q4: [],
  },
};

const wages = [
  { year: '2000', period: 'Q1', value: '15' },
  { year: '2000', period: 'Q2', value: '20' },
  { year: '2001', period: 'Q1', value: '25' },
  { year: '2001', period: 'Q2', value: '30' },
];

describe('buildPEDataSeries', () => {
  test('returns a valid PEdataPoint array', () => {
    // @ts-ignore Allow wage data without conforming to BLSWageData shape.
    const peDataSeries = buildPEDataSeries(homeValues, wages);

    expect(peDataSeries).toEqual([
      {
        year: '2000',
        period: 'Q1',
        dateRange: [
          new Date('2000-01-01T05:00:00.000Z'),
          new Date('2000-03-31T05:00:00.000Z'),
        ],
        avgHomeValue: 110,
        annualWage: 782,
        PEratio: 0.1,
      },
      {
        year: '2000',
        period: 'Q2',
        dateRange: [
          new Date('2000-04-01T05:00:00.000Z'),
          new Date('2000-06-30T04:00:00.000Z'),
        ],
        avgHomeValue: 210,
        annualWage: 1043,
        PEratio: 0.2,
      },
      {
        year: '2001',
        period: 'Q1',
        dateRange: [
          new Date('2001-01-01T05:00:00.000Z'),
          new Date('2001-03-31T05:00:00.000Z'),
        ],
        avgHomeValue: 140,
        annualWage: 1304,
        PEratio: 0.1,
      },
      {
        year: '2001',
        period: 'Q2',
        dateRange: [
          new Date('2001-04-01T05:00:00.000Z'),
          new Date('2001-06-30T04:00:00.000Z'),
        ],
        avgHomeValue: 240,
        annualWage: 1564,
        PEratio: 0.2,
      },
    ]);
  });

  test('returns an empty array for an empty homeValues input', () => {
    // @ts-ignore Allow wage data without conforming to BLSWageData shape.
    const peDataSeries = buildPEDataSeries({}, wages);

    expect(peDataSeries).toEqual([]);
  });

  test('returns an empty array for an empty wages input', () => {
    const peDataSeries = buildPEDataSeries(homeValues, []);

    expect(peDataSeries).toEqual([]);
  });
});
