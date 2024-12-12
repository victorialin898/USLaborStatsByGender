// Updated row converter to include job_group
const rowConverter = function (d) {
  return {
    year: +d.Year,
    total_employees: +d.Total_Number,
    men: +d.Men_Number,
    women: +d.Women_Number,
    median_income: +d.Total_MedianEarnings,
    median_income_men: +d.Men_MedianEarnings,
    median_income_women: +d.Women_MedianEarnings,
    gender_wage_gap: 100*(+d.Women_MedianEarnings)/(+d.Men_MedianEarnings),
    job: d.Occupation
  };
};

// Load the data
d3.csv("https://raw.githubusercontent.com/marissainga/USLaborStatsByGender/refs/heads/main/data/top_jobs_data.csv", rowConverter).then(function (data) {

  // Get unique years for the slider
  const uniqueYears = [...new Set(data.map((d) => d.year))].sort();

  // Set dimensions and margins
  const margin = { top: 20, right: 50, bottom: 250, left: 50 };  // Increased bottom margin for space
  const width = 730 - margin.left - margin.right;  // Increased width for more space
  const height = 500 - margin.top - margin.bottom;

  // Create SVG container
  const svg = d3
    .select("#plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear().range([0, width]); // X-axis: Number of Men
  const y = d3.scaleLinear().range([height, 0]); // Y-axis: Median Earnings

  // Create a color scale based on job names
  const colorScale = d3.scaleOrdinal(d3.schemeSet3)
    .domain(data.map(d => d.job)); // Use job names as domain for the color scale

  // Axes
  const xAxis = svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
  const yAxis = svg.append("g").attr("class", "y-axis");

  // Add X-axis label
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${width / 2},${height + 40})`)
    .style("text-anchor", "middle")
    .text("Number of Employees in Occupation (Millions)");

  // Add Y-axis label
  svg
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .style("text-anchor", "middle")
    .text("Median Earnings ($)");

  // Create a legend container below the chart
  const legend = svg
    .append("g")
    .attr("transform", `translate(0, ${height + 60})`); // Position below the chart

  // Parameters for a fixed legend grid (3 columns, 5 rows)
  const legendItemWidth = 220;  // Width of each legend item
  const itemsPerRow = 3;  // Number of items per row
  const itemsPerColumn = 5; // Number of rows (fixed)
  const rowHeight = 30;  // Space between rows
  const maxItems = itemsPerRow * itemsPerColumn; // Max items to display

  // Create legend items (jobs)
  const legendItems = legend
    .selectAll(".legend-item")
    .data(colorScale.domain().slice(0, maxItems)) // Limit to 15 items
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(${(i % itemsPerRow) * legendItemWidth}, ${Math.floor(i / itemsPerRow) * rowHeight})`); // Multiple rows

  // Add legend colored rectangles
  legendItems
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", colorScale);

  // Add legend labels
  legendItems
    .append("text")
    .attr("x", 30)
    .attr("y", 15)
    .style("font-size", "10px")
    .text((d) => d)
    .style("text-anchor", "start");

  // Add an extra legend item for "Men Excess Earnings"
  const extraLegendItem = legend
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", `translate(${(maxItems % itemsPerRow) * legendItemWidth}, ${Math.floor(maxItems / itemsPerRow) * rowHeight})`);
  
  // Add a blue rectangle for "Men Excess Earnings"
  extraLegendItem
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "blue"); // Blue color
  
  // Add the text label with bold font
  extraLegendItem
    .append("text")
    .attr("x", 30)
    .attr("y", 15)
    .style("font-size", "12px")
    .style("font-weight", "bold") // Make the font bold
    .text("Men Excess Earnings")
    .style("text-anchor", "start");
  
// Create the title text (outside of the updateChart function)
  const title = svg
    .append("text")
    .attr("class", "chart-title")
    .attr("x", 250)
    .attr("y", -8) // Adjust the position to a better spot (above the chart but not too high)
    .style("text-anchor", "middle")
    .style("font-size", "15px")
    .style("font-weight", "bold")
    .text(`2023 Number of Employees vs Median Earnings Selected Occupations`); // Initial title

  // Function to update the chart
  function updateChart(selectedYear) {
    title.text(`${selectedYear} Number of Employees vs Median Earnings Selected Occupations`);
    // Tooltip selection
    const tooltip = d3.select("#tooltip");

    // Filter data for the selected year
    const filteredData = data.filter((d) => d.year === selectedYear);

    // Update scales
    const maxEarnings = d3.max(filteredData, (d) =>
      Math.max(d.median_income_men, d.median_income_women)
    );

    x.domain([2, 14]); // Add padding to maxMen
    y.domain([0, 110000]); // Add padding to maxEarnings

    // Update axes
    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y));
    
    // Bind data for base bars (shared earnings)
    const sharedBars = svg.selectAll(".bar-shared").data(filteredData, d => d.job);

    sharedBars
      .enter()
      .append("rect")
      .attr("class", "bar-shared")
      .merge(sharedBars)
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(
            `<strong>Job:</strong> ${d.job}<br>
             <strong>Year:</strong> ${d.year}<br>
             <strong>Men Num Workers:</strong>${(d.men).toFixed(2)} MM<br>
             <strong>Women Num Workers:</strong>${(d.women).toFixed(2)} MM<br>
             <strong>Median Income (Men):</strong> $${d.median_income_men}<br>
             <strong>Median Income (Women):</strong> $${d.median_income_women}<br>
             <strong>Wage Gap:</strong> ${d.gender_wage_gap.toFixed(0)}%`
          )
          .style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      })
      .transition()
      .duration(400)
      .attr("x", (d, i) => x(d.total_employees) - 10) // Center the bar
      .attr("y", (d) => y(Math.min(d.median_income_men, d.median_income_women)))
      .attr("width", 20)
      .attr("height", (d) =>
        height - y(Math.min(d.median_income_men, d.median_income_women))
      )
      .attr("fill", (d) => colorScale(d.job)); // Color based on job

    sharedBars.exit().remove();

    // Draw a box around the wage gap, filled with job color
    const wageGapBox = svg.selectAll(".wage-gap-box").data(filteredData, d => d.job);

    wageGapBox
      .enter()
      .append("rect")
      .attr("class", "wage-gap-box")
      .merge(wageGapBox)
      .transition()
      .duration(400)
      .attr("x", (d) => x(d.total_employees) - 10) // Positioning box with respect to men's bar
      .attr("y", (d) => y(Math.max(d.median_income_men, d.median_income_women))) // Position the box at the top of the larger income bar
      .attr("width", 20)
      .attr("height", (d) =>
        height - y(Math.abs(d.median_income_men - d.median_income_women))
      ) // Height of the wage gap
      .attr("fill", (d) => colorScale(d.job)) // Fill the box with job's color
      .attr("stroke", "none"); // No border for the box

    wageGapBox.exit().remove();
  }

  // Listen for slider changes
  const slider = d3.select("#year-slider");x
  const yearText = d3.select("#selected-year");

  slider.on("input", function () {
    const selectedYear = +this.value;
    yearText.text(selectedYear); // Display selected year
    updateChart(selectedYear);
  });

  // Initial chart render
  updateChart(2023);

}).catch(function (error) {
  console.error("Error loading the CSV file:", error);
});
