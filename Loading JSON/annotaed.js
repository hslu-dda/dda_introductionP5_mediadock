// ============================================================================
// AIR QUALITY VISUALIZATION
// ============================================================================
// This program visualizes air quality data (PM2.5 levels) across days and hours
// using p5.js for drawing and d3.js for data manipulation.
//
// PM2.5 = Particulate Matter 2.5 micrometers (fine air pollution particles)
// Lower values = better air quality, Higher values = worse air quality
// ============================================================================

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

// Arrays to store our loaded data
let dataArray = []; // Will hold air quality measurements
let powerMeter = []; // Will hold power meter data (currently unused)

// ============================================================================
// P5.JS LIFECYCLE FUNCTIONS
// ============================================================================

/**
 * preload() runs FIRST, before setup()
 * Used to load external files (images, data, etc.)
 * The program waits for all preload operations to complete before continuing
 */
function preload() {
  // Load JSON files from the data folder
  dataArray = loadJSON("data/airquality.json");
  powerMeter = loadJSON("data/Powermeter.json");
}

/**
 * setup() runs ONCE after preload()
 * Used for initial configuration and one-time calculations
 */
function setup() {
  // Create a canvas 800 pixels wide and 1600 pixels tall
  createCanvas(800, 1600);

  // Convert JSON objects to arrays of values
  // Object.values() extracts just the values from key-value pairs
  dataArray = Object.values(dataArray);
  powerMeter = Object.values(powerMeter);

  // Sort all data chronologically (earliest to latest)
  dataArray = sortByTime(dataArray);
  console.log("dataArray", dataArray);

  // Organize data into days and hours for easier visualization
  const dailyData = groupByDayAndHour(dataArray);
  console.log("dailyData", dailyData);
}

/**
 * draw() runs REPEATEDLY (default: 60 times per second)
 * This is where animation and continuous rendering happens
 */
function draw() {
  // Clear the canvas with a light gray background
  background(220);

  // Sort data by time (ascending order by default)
  const sortedData = sortByTime(dataArray);

  // Group data by day and hour for visualization
  const dailyData = groupByDayAndHour(sortedData);

  // Draw the main visualization
  drawDailyHourlyRects(dailyData);
}

// ============================================================================
// DATA PROCESSING FUNCTIONS
// ============================================================================

/**
 * Sorts an array of data entries by their timestamp
 *
 * @param {Array} array - Array of objects with a 'time' property
 * @param {string} order - Sort direction: "asc" (ascending) or "desc" (descending)
 * @returns {Array} - New sorted array (original array unchanged)
 */
const sortByTime = (array, order = "asc") => {
  // Create a copy of the array using spread operator [...]
  // This prevents modifying the original array
  return [...array].sort((a, b) => {
    // Convert time strings to Date objects for comparison
    const timeA = new Date(a.time);
    const timeB = new Date(b.time);

    // Subtract dates to get the difference
    // Positive = timeA is later, Negative = timeA is earlier
    return order === "asc" ? timeA - timeB : timeB - timeA;
  });
};

/**
 * Groups data entries by day and hour
 * Creates a structure: Day -> Hour -> Data Entry
 *
 * @param {Array} data - Array of data entries with 'time' property
 * @returns {Array} - Array of day objects, each containing hours with data
 */
function groupByDayAndHour(data) {
  // Map is like an object but better for grouping data
  const dayMap = new Map();

  // Loop through each entry in the data
  data.forEach((entry) => {
    // Parse the timestamp
    const time = new Date(entry.time);

    // Get the start of the day (midnight) as a unique key
    // d3.timeDay.floor() rounds down to the start of the day
    const dayKey = d3.timeDay.floor(time).getTime();

    // Extract just the hour (0-23)
    const hour = time.getUTCHours();

    // NOTE: Be careful with time zones!
    // getUTCHours() = Universal Time (UTC)
    // getHours() = Local time (e.g., CEST for Switzerland)
    // Example: "2025-10-22T16:00:00Z" with 'Z' means UTC
    //          getUTCHours() returns 16
    //          getHours() in Switzerland (CEST) would return 18

    // If this day isn't in our map yet, create a new entry
    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        date: d3.timeDay.floor(time), // Store the day's date
        hours: new Map(), // Map to store hours within this day
      });
    }

    // Add this entry to the appropriate hour of the day
    dayMap.get(dayKey).hours.set(hour, entry);
  });

  // Convert the Map to an Array of day objects
  return Array.from(dayMap.values());
}

/**
 * Filters data to include only entries from a specific hour
 * Currently unused in the code, but useful for future filtering
 *
 * @param {Array} data - Array of data entries
 * @param {number} targetHour - Hour to filter for (0-23)
 * @returns {Array} - Filtered array with only entries from that hour
 */
function filterOnly18Hours(data, targetHour) {
  return data.filter((entry) => {
    const time = new Date(entry.time);
    // Return true if the hour matches targetHour
    return time.getHours() === targetHour;
  });
}

/**
 * Calculates the minimum and maximum values for each field in the dataset
 * This is used for normalizing values when coloring the visualization
 *
 * @param {Array} data - Array of data entries with 'entries' property
 * @returns {Object} - Object with min/max for each field
 *                     Example: { "Office_pm25": { min: 5, max: 50 } }
 */
function getMinMaxPerField(data) {
  // Flatten all entries from all data points into one array
  // flatMap() is like map() + flatten: [[1,2], [3,4]] becomes [1,2,3,4]
  const allEntries = data.flatMap((d) => d.entries);

  // Group entries by their field name using d3
  // Result: Map of field names to arrays of entries
  const grouped = d3.group(allEntries, (d) => d.field);

  // Calculate min and max for each field
  const result = {};
  for (const [field, items] of grouped) {
    // Extract numeric values from all entries for this field
    const values = items.map((d) => +d.value); // + converts string to number

    result[field] = {
      min: d3.min(values), // Find minimum value
      max: d3.max(values), // Find maximum value
    };
  }

  return result;
}

// ============================================================================
// VISUALIZATION FUNCTIONS
// ============================================================================

/**
 * Draws the main visualization: a grid of rectangles showing air quality
 * Each row = one day, Each column = one hour (24 hours total)
 * Colors indicate air quality levels (green = good, red = bad)
 *
 * @param {Array} dailyData - Array of day objects from groupByDayAndHour()
 */
function drawDailyHourlyRects(dailyData) {
  // Layout constants
  const dayWidth = 500; // Total width for all 24 hours
  const dayHeight = 40; // Height of each day row
  const hourWidth = dayWidth / 24; // Width of each hour cell (≈20.8px)
  const startX = 150; // Left margin for date labels
  const startY = 50; // Top margin
  const spacing = 10; // Vertical space between days

  // Get min/max values for all fields (used for color scaling)
  const minMax = getMinMaxPerField(dataArray);

  // Track vertical position as we draw each day
  let y = startY;

  // Loop through each day
  dailyData.forEach((day, dayIndex) => {
    // -------------------------
    // Draw day container outline
    // -------------------------
    noFill(); // Don't fill the rectangle
    stroke(0); // Black outline
    strokeWeight(2); // 2 pixel thick line
    rect(startX, y, dayWidth, dayHeight);

    // -------------------------
    // Draw date label on the left
    // -------------------------
    fill(0); // Black text
    noStroke(); // No outline on text
    textAlign(RIGHT, CENTER); // Align text to right, vertically centered
    text(day.date.toLocaleDateString(), startX - 10, y + dayHeight / 2);

    // -------------------------
    // Draw hourly rectangles (24 hours)
    // -------------------------
    let x = startX; // Start at the left edge
    textAlign(CENTER); // Center emoji text

    // Loop through each hour (0 to 23)
    for (let hour = 0; hour < 24; hour++) {
      stroke(255); // White border between cells
      strokeWeight(1); // 1 pixel border

      // Check if we have data for this hour
      if (day.hours.has(hour)) {
        // -------------------------
        // UPPER HALF: Office PM2.5
        // -------------------------
        const entry = day.hours.get(hour);

        // Find the Office PM2.5 reading
        const officePM25Entry = entry.entries.find((e) => e.field === "Office_pm25");
        const officePM25Value = officePM25Entry ? parseFloat(officePM25Entry.value) : 0;

        // Get the min/max range for Office PM2.5
        const officePM25Range = minMax["Office_pm25"];

        // Normalize value to 0-1 range
        // map(value, min, max, targetMin, targetMax)
        const normalizedOffice = map(officePM25Value, officePM25Range.min, officePM25Range.max, 0, 1);

        // Create color gradient: green (good) to red (bad)
        // lerpColor() blends between two colors based on the normalized value
        const officeColor = lerpColor(
          color(0, 255, 0), // Green for low PM2.5
          color(255, 0, 0), // Red for high PM2.5
          normalizedOffice
        );

        // Draw upper half rectangle
        fill(officeColor);
        rect(x, y, hourWidth, dayHeight / 2);

        // Add emoji indicator for air quality
        const officeEmoji = pm25EmojiScale(officePM25Value);
        text(officeEmoji, x + 10, y + 10);

        // -------------------------
        // LOWER HALF: Workshop PM2.5
        // -------------------------
        const workshopPM25Entry = entry.entries.find((e) => e.field === "Workshop_pm25");
        const workshopPM25Value = workshopPM25Entry ? parseFloat(workshopPM25Entry.value) : 0;

        const workshopPM25Range = minMax["Workshop_pm25"];
        const normalizedWorkshop = map(workshopPM25Value, workshopPM25Range.min, workshopPM25Range.max, 0, 1);

        const workshopColor = lerpColor(color(0, 255, 0), color(255, 0, 0), normalizedWorkshop);

        // Draw lower half rectangle
        fill(workshopColor);
        rect(x, y + dayHeight / 2, hourWidth, dayHeight / 2);

        const workshopEmoji = pm25EmojiScale(workshopPM25Value);
        text(workshopEmoji, x + 10, y + dayHeight / 2 + 10);
      } else {
        // No data for this hour - show gray
        fill(150); // Gray color
        rect(x, y, hourWidth, dayHeight);
      }

      // Move to next hour position
      x += hourWidth;
    }

    // Move down to next day row
    y += dayHeight + spacing;
  });
}

// ============================================================================
// SCALES AND HELPERS
// ============================================================================

/**
 * D3 scale that maps PM2.5 values to emojis
 * scaleThreshold() creates ranges:
 *   0-12: 😀 (Good air quality)
 *   12-35: 😐 (Moderate air quality)
 *   35+: 😷 (Poor air quality - wear a mask!)
 */
const pm25EmojiScale = d3
  .scaleThreshold()
  .domain([12, 35]) // Threshold values
  .range(["😀", "😐", "😷"]); // Emojis for each range

// ============================================================================
// NOTES FOR BEGINNERS
// ============================================================================

/*
KEY CONCEPTS USED IN THIS CODE:

1. DATA STRUCTURES:
   - Arrays: Ordered lists [item1, item2, item3]
   - Objects: Key-value pairs { key: value }
   - Maps: Like objects but better for dynamic data

2. ARRAY METHODS:
   - map(): Transform each item → new array
   - filter(): Keep only items that match condition
   - forEach(): Do something with each item
   - flatMap(): Transform and flatten nested arrays
   - sort(): Reorder items
   - find(): Get first item matching condition

3. P5.JS LIFECYCLE:
   preload() → setup() → draw() → draw() → draw() ...
   
4. COLOR MAPPING:
   - Normalize values to 0-1 range
   - Use lerpColor() to blend between colors
   - Lower PM2.5 = green (good), Higher PM2.5 = red (bad)

5. TIME HANDLING:
   - Be aware of UTC vs local time zones
   - Use Date objects for time calculations
   - d3.timeDay helps with day-level grouping

IMPROVEMENTS YOU COULD MAKE:
- Add interactivity (hover to see exact values)
- Add a color legend
- Show power meter data
- Add date range filtering
- Make canvas size responsive
- Add axis labels for hours
- Export data as image or PDF
*/
