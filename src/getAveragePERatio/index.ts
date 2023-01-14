import { PEdataPoint } from '../types/dataSeriesTypes';

/**
 * Get the PE Average.
 *
 * @param data - An array of PEdataPoint objects.
 * @returns    - The P / E average across the dataset.
 */
export default function getAveragePERatio(data: PEdataPoint[]): number {
  const total: number = data?.length || 0;

  if (!Array.isArray(data)) {
    throw new Error('Cannot calculate average. Data is not an array.');
  }

  const totalPEratio: number = data.reduce(
    (acc: number, curr: PEdataPoint) => acc + Number(curr?.PEratio),
    0,
  );

  if (Number.isNaN(totalPEratio)) {
    throw new Error('Cannot calculate P/E average. Data point. PEdataPoint does not match type');
  }

  return Number((totalPEratio / total).toFixed(1));
}
