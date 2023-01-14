import getPEDataSeries from './index';

describe('getPEDataSeries', () => {
  test('returns an object with PEavg and dataSeries', () => {
    const peData = getPEDataSeries();

    expect(peData).toHaveProperty('PEavg');
    expect(peData.PEavg).toBeGreaterThan(1);
    expect(peData).toHaveProperty('dataSeries');
  });
});
