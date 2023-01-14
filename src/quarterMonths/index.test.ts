import quarterMonths from './index';

/**
 * Test Quarter months to ensure the state of the constant.
 */
test('quarterMonths has correct month indices for each quarter', () => {
  expect(quarterMonths).toEqual({
    Q1: [1, 2, 3],
    Q2: [4, 5, 6],
    Q3: [7, 8, 9],
    Q4: [10, 11, 12],
  });
});
