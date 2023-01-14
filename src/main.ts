import './style.css';
import * as d3 from 'd3';
import {
  PEdataPoint,
} from './types/dataSeriesTypes';
import {
  AxisGenerator,
  LineGenerator,
} from './types/lineChartTypes';
import getPEDataSeries from './getPEDataSeries';

const {
  dataSeries,
  PEavg,
} = getPEDataSeries();

const width = 1000;
const height = 600;

// Select the existing SVG element.
const svg = d3.select('.pe-graph__svg')
  .attr('width', width)
  .attr('height', height)
  .attr('viewBox', `0 0 ${width} ${height}`);

/**
 * Set up the scale and path (for the line) of the SVG.
 */
const xScale: d3.ScaleTime<number, number, never> = d3.scaleTime()
  .domain(
    d3.extent(dataSeries, (d: PEdataPoint) => d.dateRange?.[1]) as Date[],
  )
  .range([0, width]);

const yScale: d3.ScaleLinear<number, number, never> = d3.scaleLinear()
  // The domain gives us the y-axis range starting at 4.
  .domain([4, d3.max(dataSeries, (d: PEdataPoint) => d.PEratio) as number + 1])
  .range([height, 10]);

const lineGenerator = d3.line()
  .x((d: PEdataPoint | [number, number]) => {
    if ('dateRange' in d) {
      return xScale(d.dateRange?.[1]);
    }
    // default behavior of returning first element of a two-element array of numbers.
    return d[0];
  })
  .y((d: PEdataPoint | [number, number]) => {
    if ('PEratio' in d) {
      return yScale(d.PEratio);
    }
    // default behavior of returning first element of a two-element array of numbers.
    return Array.isArray(d) ? d[0] : 0;
  })
  .curve(d3.curveMonotoneX);

svg.append('path')
  .datum(dataSeries)
  .attr('d', lineGenerator as LineGenerator)
  .attr('stroke', 'steelblue')
  .attr('fill', 'none');

// Average line.
d3.select('.pe-graph__avg-line')
  .attr('x2', `${width}`)
  .attr('y1', yScale(PEavg))
  .attr('y2', yScale(PEavg));

/**
 * X Axis set up.
 *
 * Constructs a new bottom-oriented axis generator for the given scale.
 * @see https://github.com/d3/d3-axis#axisBottom
 */
const xAxis: AxisGenerator = d3.axisBottom(xScale);

svg.select('.pe-graph__x-axis')
  // The transform puts the x axis at the bottom of the graph.
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis);

// Add the X Axis label.
svg.select('.pe-graph__x-axis-label')
  .attr('x', `${width / 2}`)
  .attr('y', 50);

/**
 * Y axis set up.
 */
const yAxis: AxisGenerator = d3.axisLeft(yScale);

svg.select('.pe-graph__y-axis')
  .call(yAxis);

svg.select('.pe-graph__y-axis-label')
  .attr('x', `-${height / 2}`)
  .attr('y', -50);

const tooltip = d3.select('.tooltip');
const tooltipCircle = d3.select('.pe-graph__tooltip-circle');
const xAxisLine = d3.select('.pe-graph__drop-line');

svg.on('mousemove', (event) => {
  // eslint-disable-next-line max-len
  const calculateDataPoint = (d: PEdataPoint) => Math.abs(Number(d.dateRange?.[1]) - Number(xScale.invert(event.offsetX)));
  // Update the position of the tooltip
  const index = d3.leastIndex(
    dataSeries,
    (a: PEdataPoint, b: PEdataPoint) => calculateDataPoint(a) - calculateDataPoint(b),
  );

  if (typeof index !== 'undefined') {
    const dataPoint: PEdataPoint = dataSeries[index];

    // Format the date for displaying the year value from the data point.
    const formatDate = d3.timeFormat('%Y');
    // Get the data point values to populate the tool tip.
    const year = formatDate(dataPoint?.dateRange?.[1]);
    const PERatio = dataPoint?.PEratio;

    // Create our number formatter.
    const currencyFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    // Apply the values to update the tooltip.
    tooltip.select('.tooltip__date').text(`${dataPoint?.period} ${year}`);
    tooltip.select('.tooltip__pe-ratio').text(PERatio);
    tooltip.select('.tooltip__wage').text(currencyFormat.format(dataPoint?.annualWage));
    tooltip.select('.tooltip__home-price').text(currencyFormat.format(dataPoint?.avgHomeValue));

    const x = xScale(dataPoint?.dateRange?.[1]);
    const y = yScale(PERatio);

    tooltip.style('opacity', 1);
    tooltip.style(
      'transform',
      `translate(calc(-7% + ${x}px), calc(-80% + ${y}px))`,
    );

    tooltipCircle
      .attr('cx', x)
      .attr('cy', y)
      .style('opacity', 1);

    xAxisLine.attr('x', x)
      .attr('y', y)
      .attr('height', height - y)
      .style('opacity', 1);
  }
}).on('mouseleave', () => {
  // Hide the tooltip and the tooltipCircle.
  tooltip.style('opacity', 0);
  tooltipCircle.style('opacity', 0);
  xAxisLine.style('opacity', 0);
});
