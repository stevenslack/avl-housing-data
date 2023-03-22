import * as d3 from 'd3';
import {
  PEdataPoint,
} from '../types/dataSeriesTypes';
import {
  AxisGenerator,
} from '../types/lineChartTypes';
import getPEDataSeries from '../getPEDataSeries';

/**
 * Render the the P / E chart.
 *
 * @param width - The width of the chart.
 * @param height - The height of the chart.
 */
export default function renderChart(width: number, height: number) {
  /**
   * Target the existing SVG element to build the
   * line chart and set the dynamic width and height.
   */
  const svg = d3.select('.pe-graph__svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  /**
   * Deconstruct the data series.
   */
  const {
    dataSeries,
    PEavg,
  } = getPEDataSeries();

  /**
   * Set up the scale and path (for the line) of the SVG.
   *
   * Time scales implement ticks based on calendar intervals. Since
   * our X axis is a time scale this is the function to generate the
   * X scale.
   *
   * The extent of the range is the determined with the dataSeries dateRange
   * and the width determines the scale of the range.
   *
   * @param range — Array of range values.
   */
  const xScale: d3.ScaleTime<number, number, never> = d3.scaleTime()
    .domain(
      d3.extent(dataSeries, (d: PEdataPoint) => d.dateRange?.[1]) as Date[],
    )
    // Sets the scale’s range to the specified array of values.
    .range([0, width]);

  /**
   * X Axis generator.
   *
   * Constructs a new bottom-oriented axis generator for the given scale.
   */
  const xAxis: AxisGenerator = d3.axisBottom(xScale);

  /**
   * Set the Y linear scale defined over a numeric domain (PEratio).
   *
   * @param range — Array of range values.
   */
  const yScale: d3.ScaleLinear<number, number, never> = d3.scaleLinear()
    // The domain gives us the y-axis range starting at 4.
    .domain([4, d3.max(dataSeries, (d: PEdataPoint) => d.PEratio) as number + 1])
    .range([height, 10]);

  /**
   * Y axis generator.
   *
   * Constructs a new left-oriented axis generator for the given scale.
   */
  const yAxis: AxisGenerator = d3.axisLeft(yScale);

  /**
   * Line generator for the SVG path values in the line chart.
   */
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

  /**
   * Create the SVG path element and generate the line.
   */
  d3.select('.pe-graph__pe-ratio-line')
    .datum(dataSeries)
    .attr('d', lineGenerator as any);

  /**
   * Create the horizontal average line
   * which demonstrates the average P/E over time.
   */
  d3.select('.pe-graph__avg-line')
    .attr('x2', `${width}`)
    .attr('y1', yScale(PEavg))
    .attr('y2', yScale(PEavg));

  /**
   * Apply a label to the average P / E ratio.
   */
  d3.select('.pe-graph__avg-line-label')
    .attr('y', yScale(PEavg) + 25)
    .attr('x', width - 90)
    .text(`Average: ${PEavg}`);

  /**
   * Create the X Axis for the bottom of the graph
   * which displays the ticks as year values.
   */
  svg.select('.pe-graph__x-axis')
    // The transform puts the x axis at the bottom of the graph.
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  /**
   * Add the label and set the position for the X Axis.
   */
  svg.select('.pe-graph__x-axis-label')
    .attr('x', `${width / 2}`)
    .attr('y', 50);

  /**
   * Create the Y Axis for the left side of the graph
   * which displays the ticks as price to earnings values.
   */
  svg.select('.pe-graph__y-axis')
    .call(yAxis);

  /**
   * Add the label and set the position for the Y Axis.
   */
  svg.select('.pe-graph__y-axis-label')
    .attr('x', `-${height / 2}`)
    .attr('y', -50);

  const tooltip = d3.selectAll('.pe-graph__tooltip');
  const tooltipCircle = d3.select('.pe-graph__tooltip-circle');
  const xAxisLine = d3.select('.pe-graph__drop-line');

  /**
   * Populate the PE data Point display.
   *
   * @param dataPoint - The PEdataPoint to populate the data display with.
   */
  function populateDataDisplay(dataPoint: PEdataPoint) {
    // Format the date for displaying the year value from the data point.
    const formatDate = d3.timeFormat('%Y');
    // Get the data point values to populate the tool tip.
    const year = formatDate(dataPoint?.dateRange?.[1]);

    // Create our number formatter.
    const currencyFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    // Apply the values to update the tooltip.
    d3.selectAll('.data-display__date').text(`${dataPoint?.period} ${year}`);
    d3.selectAll('.data-display__pe-ratio').text(dataPoint?.PEratio);
    d3.selectAll('.data-display__wage').text(currencyFormat.format(dataPoint?.annualWage));
    d3.selectAll('.data-display__home-price').text(currencyFormat.format(dataPoint?.avgHomeValue));
  }

  // Get the last data point in the data series.
  const lastIndex: number = Object.keys(dataSeries).length - 1;
  const lastDataPoint: PEdataPoint = dataSeries[lastIndex];

  // Set the initial data display with the last data point.
  populateDataDisplay(lastDataPoint);

  /**
   * On the SVG mousemove calculate the position and show the data display as a tooltip.
   */
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

      // Tooltip data display.
      populateDataDisplay(dataPoint);

      const x = xScale(dataPoint?.dateRange?.[1]);
      const y = yScale(dataPoint?.PEratio);

      tooltip
        .attr('x', x)
        .attr('y', y)
        .style('opacity', 1)
        .style(
          'transform',
          'translate(-110px, -120px)',
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
}
