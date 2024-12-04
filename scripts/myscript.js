// Example data (replace with your own dataset)
const data = [
  {year: 2020, job: "Engineer", men: 3000, women: 1200, median_income: 80000},
  {year: 2020, job: "Teacher", men: 1500, women: 2500, median_income: 50000},
  {year: 2020, job: "Nurse", men: 500, women: 4000, median_income: 60000},
  {year: 2019, job: "Engineer", men: 2800, women: 1100, median_income: 78000},
  {year: 2019, job: "Teacher", men: 1600, women: 2400, median_income: 48000},
  {year: 2019, job: "Nurse", men: 600, women: 3900, median_income: 58000}
];

// Get unique years for the slider
const uniqueYears = [...new Set(data.map(d => d.year))].sort();

// Set dimensions and margins
const margin = {top: 20, right: 30, bottom: 120, left: 100};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#plot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// Axes
const xAxis = svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
const yAxis = svg.append("g").attr("class", "y-axis");

// Add X-axis label
svg.append("text")
  .attr("class", "axis-label")
  .attr("transform", `translate(${width / 2},${height + 40})`)
  .style("text-anchor", "middle")
  .text("Men's Median Earnings");

// Add Y-axis label
svg.append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("y", -60)
  .attr("x", -height / 2)
  .style("text-anchor", "middle")
  .text("Number of Men and Women in Occupation");

// Update chart function
function updateChart(selectedYear) {
  // Filter data for the selected year
  const filteredData = data.filter(d => d.year === selectedYear);

  // Update scales
  const minIncome = d3.min(filteredData, d => d.median_income);
  const maxIncome = d3.max(filteredData, d => d.median_income);
  x.domain([minIncome * 0.9, maxIncome * 1.1]); // Add padding around the range
  y.domain([0, d3.max(filteredData, d => Math.max(d.men, d.women))]);

  // Update axes
  xAxis.call(d3.axisBottom(x).tickFormat(d => `$${d / 1000}k`));
  yAxis.call(d3.axisLeft(y));

  // Bind data for men bars
  const barsMen = svg.selectAll(".bar-men").data(filteredData);

  // Enter and update for men bars
  barsMen.enter()
    .append("rect")
    .attr("class", "bar-men")
    .merge(barsMen)
    .transition()
    .duration(500)
    .attr("x", d => x(d.median_income) - 20) // Offset for men bar
    .attr("y", d => y(d.men))
    .attr("width", 20)
    .attr("height", d => height - y(d.men));

  // Exit for men bars
  barsMen.exit().remove();

  // Bind data for women bars
  const barsWomen = svg.selectAll(".bar-women").data(filteredData);

  // Enter and update for women bars
  barsWomen.enter()
    .append("rect")
    .attr("class", "bar-women")
    .merge(barsWomen)
    .transition()
    .duration(500)
    .attr("x", d => x(d.median_income) + 1) // Offset for women bar
    .attr("y", d => y(d.women))
    .attr("width", 20)
    .attr("height", d => height - y(d.women));

  // Exit for women bars
  barsWomen.exit().remove();

  // Bind data for job labels
  const jobLabels = svg.selectAll(".job-label").data(filteredData);

  // Enter and update for job labels
  jobLabels.enter()
    .append("text")
    .attr("class", "job-label")
    .merge(jobLabels)
    .transition()
    .duration(2000)
    .attr("x", d => x(d.median_income))
    .attr("y", height + 30) // Adjust position above the axis
    .text(d => d.job);

  // Exit for job labels
  jobLabels.exit().remove();
}

// Listen for slider changes
const slider = d3.select("#year-slider");
const yearText = d3.select("#selected-year");

slider.on("input", function() {
  const selectedYear = +this.value;
  yearText.text(selectedYear); // Display selected year
  updateChart(selectedYear);
});

// Initial chart render
updateChart(uniqueYears[0]);
