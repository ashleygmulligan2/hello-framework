import * as Plot from "npm:@observablehq/plot";

export function timeline(events, {width, height} = {}) {
  return Plot.plot({
    width,
    height,
    marginTop: 30,
    x: {nice: true, label: null, tickFormat: ""},
    y: {axis: null},
    marks: [
      Plot.ruleX(events, {x: "year", y: "y", markerEnd: "dot", strokeWidth: 2.5}),
      Plot.ruleY([0]),
      Plot.text(events, {x: "year", y: "y", text: "name", lineAnchor: "bottom", dy: -10, lineWidth: 10, fontSize: 12})
    ]
  });
}

export function heatmap(events, { width, height } = {}) {
  // Calculate average performance for each line of business
  const averages = events.reduce((acc, { lineOfBusiness, performance }) => {
    if (!acc[lineOfBusiness]) {
      acc[lineOfBusiness] = { total: 0, count: 0 };
    }
    acc[lineOfBusiness].total += performance;
    acc[lineOfBusiness].count += 1;
    return acc;
  }, {});

  const averageData = Object.entries(averages).map(([lineOfBusiness, { total, count }]) => ({
    lineOfBusiness,
    averagePerformance: (total / count).toFixed(2) // Calculate average and format to 2 decimal places
  }));

  // Extract unique line of business values for drawing lines
  const uniqueLinesOfBusiness = [...new Set(events.map(event => event.lineOfBusiness))];

  return Plot.plot({
    width,
    height,
    marginBottom: 100,
    x: { 
      field: "lineOfBusiness", 
      label: "Line of Business",
      grid: true,
    },
    y: { 
      field: "name", 
      label: "Name",
      axis: null, // Hide y-axis labels
      grid: true,
    },
    color: {
      field: "performance",
      type: "ordinal",
      domain: [1, 2, 3, 4, 5],
      range: ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#1a9850"], // Colors from red (low) to green (high)
    },
    marks: [
      Plot.cell(events, {
        x: "lineOfBusiness",
        y: "name",
        tip: true,
        fill: "performance",
        title: d => `Name: ${d.name}\nPerformance: ${d.performance}` // Tooltip with name and performance
      }),
      Plot.text(averageData, {
        x: "lineOfBusiness",
        y: -1, // Position above the heatmap
        text: d => `Avg: ${d.averagePerformance}`,
        dy: 50, // Offset to position the text above the cells
        textAnchor: "middle",
        fontSize: 15,
        fill: "white"
      }),
    ],
  });
}
