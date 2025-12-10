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
  createCanvas(8000, 600);
  d3.csv("./data/airquality.csv").then((response) => {
    console.log(response);
    data = response;
    groupedArray = groupByTime(data);
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
  // Define 4 y positions for labels
  let labelYPositions = [height - 100, height - 80, height - 60, height - 40, height - 20];

  let previousDay = null; // Track the previous day

  groupedArray.forEach((timeGroup, timeIndex) => {
    timeGroup.entries.forEach((entry, entryIndex) => {
      let x = 50 + timeIndex * 20;
      let y = 50 + entryIndex * 40;

      // Find min/max for this specific field
      let fieldMinMax = minMaxResults.find((m) => m.field === entry.field);
      let value = parseFloat(entry.value);

      // Map value based on its field's min/max
      let rectHeight = map(value, fieldMinMax.min, fieldMinMax.max, 0, 35);
      //fill(100, 150, 200);
      //rect(x - rectW / 2, y, rectW, rectHeight);
      drawHatchRect(x - rectW / 2, y, rectW, rectHeight, value, fieldMinMax.min, fieldMinMax.max);

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

    // Label the timeGroup at the bottom - cycle through 4 positions
    let x = 50 + timeIndex * 20;
    let labelY = labelYPositions[timeIndex % 5];
    line(x, 0, x, labelY - 10);
    fill(0);
    textSize(10);
    textAlign(CENTER);
    let w = textWidth(hour);

    // Display hour
    text(hour, x, labelY);

    // Display day if it changed
    if (day !== previousDay) {
      fill(200, 0, 0); // Red color for day label
      textSize(12);
      text(day, x, labelY - 15); // Position above the hour
      previousDay = day;
    }
  });

  //   // Loop through each time group
  //   groupedArray.forEach((timeGroup, timeIndex) => {
  //     // Loop through each entry in this time group
  //     timeGroup.entries.forEach((entry, entryIndex) => {
  //       // Position based on indices
  //       let x = timeIndex * 10; // spacing between time groups
  //       let y = entryIndex * 50; // spacing between entries

  //       // Map value to visual property (e.g., color or height)
  //       let value = parseFloat(entry.value);
  //       let rectHeight = map(value, 0, 2, 0, 5); // adjust min/max as needed

  //       // Draw rectangle
  //       fill(100, 150, 200);
  //       rect(x, y, 10, rectHeight);

  //       // Optional: add text label
  //       fill(0);
  //       textSize(10);
  //       // text(entry.field, x + 5, y + 15);
  //     });
  //   });
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
