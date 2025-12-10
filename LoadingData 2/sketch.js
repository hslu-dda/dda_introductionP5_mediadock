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

  textAlign(CENTER, CENTER);
  rectMode(CENTER);
}

// draw() runs continuously (or once if noLoop() is called)
function draw() {
  // Set the background to light gray (220 on a 0-255 scale)
  background(220);

  // Center text horizontally and vertically
  textAlign(CENTER, CENTER);

  // Set the width/height of each rectangle (represents one hour)
  let rectWidth = 20;

  // Starting X position (horizontal)
  let posX = 0;

  // Starting Y position (vertical) - starts at 10 pixels from top
  let posY = 10;

  // Loop through each day in our data array
  for (let i = 0; i < dataArray.length; i++) {
    // Reset X position to the left edge for each new day (new row)
    posX = 10;

    // Loop through all 24 hours of the day (0 to 23)
    for (let hour = 0; hour < 24; hour++) {
      // Remove fill color - draw only the rectangle outline
      noFill();

      // Draw a rectangle at the current position
      // rect() draws from top-left corner by default
      rect(posX, posY, 20, 20);

      // Set fill color to black for the text
      fill(0);

      // Draw the hour number centered inside the rectangle
      // Add half the width and height to position text in the center
      text(hour, posX, posY);

      // Move to the next horizontal position (next hour)
      posX += rectWidth;
    }

    // Move to the next vertical position (next day/row)
    posY += rectWidth;
  }
}
