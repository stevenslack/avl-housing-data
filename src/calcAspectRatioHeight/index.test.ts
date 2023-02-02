/**
 * Set the following as a Jest test in an adjacent file. e.g. 'calcAspectRatioHeight.test.js'
 *
 * @jest-environment jsdom
 */
import calcAspectRatioHeight from './index';

describe('Test function `calcAspectRatioHeight`.', () => {
  test('Should be 56.25 if no params are passed.', () => {
    expect(calcAspectRatioHeight()).toBe(56.25);
  });

  test('Should use default 16:9 aspect ratio if only width parameter is passed.', () => {
    expect(calcAspectRatioHeight(78)).toBe(43.875);
    expect(calcAspectRatioHeight(100)).toBe(56.25);
  });

  test('An aspect ratio should output the correct height calculation.', () => {
    expect(calcAspectRatioHeight(100, '4:3')).toBe(75);
    expect(calcAspectRatioHeight(100, '5:4')).toBe(80);
    expect(calcAspectRatioHeight(100, '9:16')).toBe(177.77777777777777);
    expect(calcAspectRatioHeight(100, '16:9')).toBe(56.25);
    expect(calcAspectRatioHeight(100, '1:1')).toBe(100);
  });

  test('Should output correct height if width is passed as a string.', () => {
    // @ts-ignore - Should throw an error if a string is passed.
    expect(calcAspectRatioHeight('100', '16:9')).toBe(56.25);
  });

  test('Should output the default 16:9 height if the aspect ratio is invalid.', () => {
    expect(calcAspectRatioHeight(100, ':')).toBe(56.25);
    expect(calcAspectRatioHeight(100, '')).toBe(56.25);
    // @ts-ignore - Should throw an error if number is passed instead of a string.
    expect(calcAspectRatioHeight(100, 3495807)).toBe(56.25);
    expect(calcAspectRatioHeight(100, '//&:ll')).toBe(56.25);
    expect(calcAspectRatioHeight(1, '//&:luu')).toBe(0.5625);
    expect(calcAspectRatioHeight(78, ':')).toBe(43.875);
    expect(calcAspectRatioHeight(78, '')).toBe(43.875);
  });
});
