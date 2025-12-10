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
}

// draw() runs continuously (or once if noLoop() is called)
function draw() {
  // Set the background to light gray (220 on a 0-255 scale)
  background(220);

  // Loop through each day in our data array
  for (let i = 0; i < dataArray.length; i++) {
    // Draw a 10x10 pixel rectangle at position (0, 0) - top-left corner
    // NOTE: This draws ALL rectangles in the same spot, stacked on top of each other
    // You'll only see ONE rectangle even though the loop runs multiple times
    rect(0, 0, 10, 10);
  }
}
