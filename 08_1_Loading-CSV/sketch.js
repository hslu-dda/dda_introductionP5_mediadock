/*
Data Design + Art, HSLU Lucerne
*/

// global variable to store the loaded data
let data;
let groupedArray;
let minMaxResults;
let emojiScales;

let rectW = 10;

function setup() {
  createCanvas(600, 8000);
  d3.csv("./data/Powermeter_30Days-2.csv").then((response) => {
    console.log("response", response);
    data = response;
    groupedArray = groupByTime(data);

    saveJSON(groupedArray, "airquality.json");
    const csv = convertToCSV(groupedArray);
    //downloadCSV(csv, "air_quality_data.csv");

    console.log("groupedArray", groupedArray);
    minMaxResults = findMinMaxByField(data);
    console.log("minMaxResults", minMaxResults);
    emojiScales = createEmojiScales(minMaxResults);
    // call a custom function
    createViz();
  });
}

function draw() {
  // when is the data available?
  // be sure the data is available
  if (data && data.length) {
    // console.log("yes, I'm here :)", data);
  }
}

function createViz() {
  // Define x positions for labels (left side)
  let labelXPositions = [40, 60, 80, 100, 120];

  let previousDay = null; // Track the previous day

  groupedArray.forEach((timeGroup, timeIndex) => {
    timeGroup.entries.forEach((entry, entryIndex) => {
      let x = 50 + entryIndex * 40; // fields go horizontally
      let y = 50 + timeIndex * 20; // time goes vertically

      // Find min/max for this specific field
      let fieldMinMax = minMaxResults.find((m) => m.field === entry.field);
      let value = parseFloat(entry.value);

      // Map value based on its field's min/max
      let rectWidth = map(value, fieldMinMax.min, fieldMinMax.max, 0, 35);
      //fill(100, 150, 200);
      //rect(x, y - rectW / 2, rectWidth, rectW);
      drawHatchRect(x, y - rectW / 2, rectWidth, rectW, value, fieldMinMax.min, fieldMinMax.max);

      let emoji = emojiScales[entry.field](value);

      textSize(20);
      textAlign(CENTER);

      let w = textWidth(emoji);

      // text(emoji, x, y);
    });
    // Parse the timestamp
    let timestamp = new Date(timeGroup.time);
    let hour = timestamp.getHours();
    let day = timestamp.toISOString().split("T")[0]; // Get YYYY-MM-DD

    // Label the timeGroup on the left side - cycle through positions
    let y = 50 + timeIndex * 20;
    let labelX = labelXPositions[timeIndex % 5];
    line(0, y, labelX - 10, y);
    fill(0);
    textSize(10);
    textAlign(RIGHT);

    // Display hour
    text(hour, labelX, y + 4);

    // Display day if it changed
    if (day !== previousDay) {
      fill(200, 0, 0); // Red color for day label
      textSize(12);
      text(day, labelX - 15, y + 4); // Position to the left of hour
      previousDay = day;
    }
  });
}

const groupByTime = (data) => {
  // Filter out invalid entries first
  const validData = data.filter((item) => {
    return item._time && item._value !== null && item._value !== undefined && item._value !== "" && item._field;
  });

  return Object.values(
    validData.reduce((acc, item) => {
      const key = item._time;
      if (!acc[key]) {
        acc[key] = {
          time: item._time,
          entries: [],
        };
      }
      acc[key].entries.push({
        start: item._start,
        stop: item._stop,
        field: item._field,
        measurement: item._measurement,
        value: item._value,
      });
      return acc;
    }, {})
  );
};

const findMinMaxByField = (data) => {
  // Group by field directly from original data
  const byField = d3.group(data, (d) => d._field);

  // Calculate min and max for each field
  const minMaxByField = Array.from(byField, ([field, entries]) => {
    const values = entries.map((e) => parseFloat(e._value));
    return {
      field: field,
      measurement: entries[0]._measurement,
      min: d3.min(values),
      max: d3.max(values),
      extent: d3.extent(values),
    };
  });
  return minMaxByField;
};

// Create emoji scales for each field
const createEmojiScales = (minMaxResults) => {
  const emojiScale = ["😀", "🙂", "😐", "😟", "😨", "😷", "😵"];
  // const emojiScale = ["🟢", "🟡", "🟠", "🔴", "⚫"];

  const scales = {};

  minMaxResults.forEach((field) => {
    scales[field.field] = d3.scaleQuantize().domain([field.min, field.max]).range(emojiScale);
  });

  return scales;
};

function drawHatchRect(x, y, w, h, value, fieldMin, fieldMax) {
  push(); // Save drawing state

  // Map value to hatch density (more lines = higher value)
  let hatchSpacing = map(value, fieldMin, fieldMax, 10, 2); // Closer lines for higher values

  // Map value to hatch angle
  let hatchAngle = 45; //map(value, fieldMin, fieldMax, 0, 90); // 0° to 90°

  // Create clipping region for the rectangle
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(x, y, w, h);
  drawingContext.clip();

  // Draw background
  fill(240);
  noStroke();
  //rect(x, y, w, h);

  // Draw hatch lines
  stroke(100, 150, 200);
  strokeWeight(1);

  translate(x + w / 2, y + h / 2);
  rotate(radians(hatchAngle));

  // Draw diagonal lines
  let maxDist = Math.sqrt(w * w + h * h);
  for (let i = -maxDist; i < maxDist; i += hatchSpacing) {
    line(i, -maxDist, i, maxDist);
  }

  drawingContext.restore(); // Restore clipping region

  // Draw rectangle outline
  noFill();
  stroke(100, 150, 200);
  strokeWeight(2);
  //rect(x, y, w, h);

  pop(); // Restore drawing state
}

const convertToCSV = (groupedData) => {
  if (!groupedData || groupedData.length === 0) {
    return "";
  }

  // Get all unique field names across all entries
  const fieldNames = new Set();
  groupedData.forEach((item) => {
    item.entries.forEach((entry) => {
      fieldNames.add(entry.field);
    });
  });

  const sortedFields = Array.from(fieldNames).sort();

  // Create CSV header
  const headers = ["time", ...sortedFields];
  const csvRows = [headers.join(",")];

  // Create CSV rows
  groupedData.forEach((item) => {
    const row = [item.time];

    // Create a map of field -> value for this time entry
    const fieldValueMap = {};
    item.entries.forEach((entry) => {
      fieldValueMap[entry.field] = entry.value;
    });

    // Add values in the same order as headers
    sortedFields.forEach((field) => {
      row.push(fieldValueMap[field] || "");
    });

    csvRows.push(row.join(","));
  });

  return csvRows.join("\n");
};

// Example usage:
// const groupedData = groupByTime(yourData);
// const csv = convertToCSV(groupedData);
// console.log(csv);

// To download as CSV file:
const downloadCSV = (csvContent, filename = "data.csv") => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
