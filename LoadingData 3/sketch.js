// Create an empty array to store our air quality data
let dataArray = [];

// preload() runs once before setup() - use it to load external files
function preload() {
  // Load the JSON file containing air quality data grouped by day
  dataArray = loadJSON("data/airqualityGroupedByDay.json");
}

// setup() runs once at the start - use it to initialize your sketch
function setup() {
  // Create a canvas 800 pixels wide and 1600 pixels tall
  createCanvas(800, 1600);

  // Convert the JSON object into an array of values (days)
  dataArray = Object.values(dataArray);

  // Print the data to the console so we can see what we're working with
  console.log("dataArray", dataArray);

  // Set rectangles to be drawn from their center point (instead of top-left corner)
  rectMode(CENTER);

  // Tell p5.js to only run draw() once (not continuously)
  noLoop();
}

// draw() runs after setup() - this is where we create our visualization
function draw() {
  // Set the background to light gray (220 on a 0-255 scale)
  background(220);

  // Center text horizontally and vertically within shapes
  textAlign(CENTER, CENTER);

  // Set the width of each rectangle (represents one hour)
  let rectWidth = 20;

  // Starting X position (horizontal)
  let posX = 0;

  // Starting Y position (vertical)
  let posY = 20;

  // Loop through each day in our data array
  for (let i = 0; i < dataArray.length; i++) {
    // Get the current day's data
    const day = dataArray[i];

    // Reset X position to the left for each new day (new row)
    posX = 20;

    // Loop through all 24 hours of the day
    for (let hour = 0; hour < 24; hour++) {
      // Check if this hour has data
      if (day.hours[hour]) {
        // Get the data for this specific hour
        const entry = day.hours[hour];

        // Set default fill color to gray
        fill(200);

        // Look for the Workshop PM2.5 measurement in this hour's entries
        const Workshop_pm25 = entry.entries.find((e) => e.field === "Workshop_pm25");

        // If we found PM2.5 data for this hour
        if (Workshop_pm25) {
          // Get the PM2.5 value
          let value = Workshop_pm25.value;

          // If air quality is poor (PM2.5 > 0.5), color it red
          if (value > 0.5) {
            fill(255, 0, 0); // Red = bad air quality
          } else {
            // Otherwise, color it green (good air quality)
            fill(0, 255, 0); // Green = good air quality
          }
        } else {
          // No PM2.5 data found for this hour, log it and color green
          console.log(entry);
          fill(0, 255, 0);
        }
      } else {
        // No data exists for this hour, color it dark gray
        fill(100);
      }

      // Draw a rectangle at the current position
      rect(posX, posY, 20, 20);

      // Set text color to black
      fill(0);

      // Write the hour number on the rectangle
      text(hour, posX, posY);

      // Move to the next horizontal position (next hour)
      posX += rectWidth;
    }

    // Move to the next vertical position (next day)
    posY += rectWidth;
  }
}
