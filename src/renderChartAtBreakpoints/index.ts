import calcAspectRatioHeight from '../calcAspectRatioHeight';
import renderChart from '../renderChart';

/**
 * Render the chart based off of an array of breakpoint sizes
 * and the initial width of the viewport.
 *
 * @param breakPoints - An array of breakpoint values.
 * @param buffer      - A buffer / padding to apply to the breakpoint size.
 */
export default function renderChartAtBreakpoints(breakPoints: number[], buffer: number = 200) {
  if (breakPoints.length > 0) {
    // Set the initial width based off of the viewport size or the smallest breakpoint value.
    const initialWidth: number = breakPoints.find(
      (value) => value <= (window.innerWidth - buffer),
    ) || Math.min(...breakPoints);

    // Initial render of the chart.
    renderChart(initialWidth, calcAspectRatioHeight(initialWidth, '15:9'));

    breakPoints.forEach((width, index) => {
      const mediaQuery = `(min-width: ${width + buffer}px)`;
      const mediaQueryList = window.matchMedia(mediaQuery);

      const height = calcAspectRatioHeight(width, '15:9');

      // Add an event listener for the chart to re-render at different breakpoints.
      mediaQueryList.addEventListener('change', (event) => {
        if (event.matches) {
          renderChart(width, height);
        } else {
          const nextSize = breakPoints[index - 1];
          if (typeof nextSize !== 'undefined') {
            renderChart(nextSize - 100, calcAspectRatioHeight(nextSize - 100, '15:9'));
          }
        }
      });
    });
  }
}
