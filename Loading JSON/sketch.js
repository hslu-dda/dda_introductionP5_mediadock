let dataArray = [];
let powerMeter = [];
let counter = 0;
let minMax = [];
let eScale;

function preload() {
  dataArray = loadJSON("data/airquality.json");
  powerMeter = loadJSON("data/Powermeter.json");
}

function setup() {
  createCanvas(800, 1600);
  dataArray = Object.values(dataArray);
  powerMeter = Object.values(powerMeter);

  // Sort data by time
  dataArray = sortByTime(dataArray);
  console.log("dataArray", dataArray);

  // Group data by day and hour
  const dailyData = groupByDayAndHour(dataArray);
  console.log("dailyData", dailyData);
  minMax = getMinMaxPerField(dataArray);
  console.log("min", minMax["Office_pm25"]);
  eScale = createEmojiScale(minMax["Office_pm25"].min, minMax["Office_pm25"].max);
}

function draw() {
  background(220);

  // Sort data by time
  const sortedData = sortByTime(dataArray);

  // Group by day and hour
  const dailyData = groupByDayAndHour(sortedData);

  // Draw the visualization
  drawDailyHourlyRects(dailyData);

  drawCurrentSelection(dataArray[counter]);
  counter++;
}

function drawCurrentSelection(item) {
  const Office_pm25 = item.entries.find((e) => e.field === "Office_pm25");
  const value = Office_pm25 ? parseFloat(Office_pm25.value) : 0;

  //emoji = pm25EmojiScale(value);
  let e = eScale(value); // 😟
  console.log(e);

  push();
  translate(width / 2, height / 2);
  rectMode(CENTER);
  rect(0, 0, 100, 100);
  textAlign(CENTER, CENTER);

  textSize(500);
  text(e, 0, 0);
  pop();
}

const sortByTime = (array, order = "asc") => {
  return [...array].sort((a, b) => {
    const timeA = new Date(a.time);
    const timeB = new Date(b.time);
    return order === "asc" ? timeA - timeB : timeB - timeA;
  });
};

function groupByDayAndHour(data) {
  const dayMap = new Map();
  data.forEach((entry) => {
    const time = new Date(entry.time);
    const dayKey = d3.timeDay.floor(time).getTime();
    const hour = time.getUTCHours();

    // const time = new Date("2025-10-22T16:00:00Z"); => UTC because of Z
    //time.getHours(); // Returns 18 (6pm) // CEST because of Switzerland

    if (!dayMap.has(dayKey)) {
      dayMap.set(dayKey, {
        date: d3.timeDay.floor(time),
        hours: new Map(),
      });
    }
    dayMap.get(dayKey).hours.set(hour, entry);
  });

  return Array.from(dayMap.values());
}

// Filter for only 18:00 entries
function filterOnly18Hours(data, time) {
  return data.filter((entry) => {
    const time = new Date(entry.time);
    return time.getHours() === time;
  });
}

function drawDailyHourlyRects(dailyData) {
  const dayWidth = 500;
  const dayHeight = 40;
  const hourWidth = dayWidth / 24;
  const startX = 150;
  const startY = 50;
  const spacing = 10;

  const minMax = getMinMaxPerField(dataArray);
  let y = startY;
  dailyData.forEach((day, dayIndex) => {
    //  const y = startY + dayIndex * (dayHeight + spacing);

    // Draw day container
    noFill();
    stroke(0);
    strokeWeight(2);
    rect(startX, y, dayWidth, dayHeight);

    // Draw day label
    fill(0);
    noStroke();
    textAlign(RIGHT, CENTER);
    text(day.date.toLocaleDateString(), startX - 10, y + dayHeight / 2);

    // Draw hourly rectangles
    let x = startX;
    textAlign(CENTER);
    for (let hour = 0; hour < 24; hour++) {
      // const x = startX + hour * hourWidth;
      stroke(255);
      strokeWeight(1);
      if (day.hours.has(hour)) {
        // Hour has data - color it based on some value
        const entry = day.hours.get(hour);
        // Example: color based on Office_pm25 value
        const Office_pm25 = entry.entries.find((e) => e.field === "Office_pm25");
        const value = Office_pm25 ? parseFloat(Office_pm25.value) : 0;
        const pm25Range = minMax["Office_pm25"];
        const normalized = map(value, pm25Range.min, pm25Range.max, 0, 1);
        // Map value to color (you can adjust this based on your data range)
        fill(lerpColor(color(0, 255, 0), color(255, 0, 0), normalized));
        rect(x, y, hourWidth, dayHeight / 2);
        let emoji = pm25EmojiScale(value);
        text(emoji, x + 10, y + 10);
        const Workshop_pm25 = entry.entries.find((e) => e.field === "Workshop_pm25");
        const Workshop_pm25_value = Workshop_pm25 ? parseFloat(Workshop_pm25.value) : 0;
        const Workshop_pm25_range = minMax["Workshop_pm25"];
        const Workshop_pm25_normalized = map(
          Workshop_pm25_value,
          Workshop_pm25_range.min,
          Workshop_pm25_range.max,
          0,
          1
        );
        // Map value to color (you can adjust this based on your data range)
        fill(lerpColor(color(0, 255, 0), color(255, 0, 0), Workshop_pm25_normalized));
        rect(x, y + dayHeight / 2, hourWidth, dayHeight / 2);
        emoji = pm25EmojiScale(Workshop_pm25_value);
        text(emoji, x + 10, y + dayHeight / 2 + 10);
      } else {
        // Hour is missing - grey
        fill(150);
        rect(x, y, hourWidth, dayHeight);
      }
      x += hourWidth;
    }
    y += dayHeight + spacing;
  });
}

// Create the PM2.5 emoji scale (do this once, outside your loop)
const pm25EmojiScale = d3.scaleThreshold().domain([12, 35]).range(["😀", "😐", "😷"]);

function getMinMaxPerField(data) {
  const allEntries = data.flatMap((d) => d.entries);
  const grouped = d3.group(allEntries, (d) => d.field);

  const result = {};
  for (const [field, items] of grouped) {
    const values = items.map((d) => +d.value);
    result[field] = {
      min: d3.min(values),
      max: d3.max(values),
    };
  }
  return result;
}

function createEmojiScale(min, max) {
  const emojiScale = ["😀", "🙂", "😐", "😟", "😨", "😷", "😵"];

  return d3.scaleQuantize().domain([min, max]).range(emojiScale);
}
