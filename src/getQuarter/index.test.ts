import getQuarter from './index';

describe('getQuarter', () => {
  test('returns Q1 for January', () => {
    expect(getQuarter(1)).toBe('Q1');
  });

  test('returns Q2 for April', () => {
    expect(getQuarter(4)).toBe('Q2');
  });

  test('returns Q3 for July', () => {
    expect(getQuarter(7)).toBe('Q3');
  });

  test('returns Q4 for October', () => {
    expect(getQuarter(10)).toBe('Q4');
  });

  test('returns an empty string for an invalid month', () => {
    expect(getQuarter(13)).toBe('');
  });
});
