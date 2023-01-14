/* eslint-disable max-len */
import { BaseType, ValueFn } from 'd3';
import { PEdataPoint } from './dataSeriesTypes';

/**
 * Type for the D3 line generator for the SVG path.
 */
export type LineGenerator = ValueFn<SVGPathElement, PEdataPoint[], string | number | boolean | readonly (string | number)[] | null>;

/**
 * Type for the D3 xAxis function.
 */
export type AxisGenerator = (selection: BaseType | unknown | HTMLElement | any, ...args: any[]) => void;
