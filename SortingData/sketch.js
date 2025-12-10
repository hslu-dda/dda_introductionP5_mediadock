let dataArray = [];
let powerMeter = [];
let minMax = [];

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
}

function keyPressed() {
  if (key == "s") {
    dataArray = sortByTime(dataArray);
    console.log("dataArray", dataArray);
    const dailyData = groupByDayAndHour(dataArray);
    console.log("dailyData", dailyData);

    saveJSON(dailyData, "airqualityGroupedByDay.json");
  }
}

function draw() {}

const sortByTime = (array, order = "asc") => {
  return [...array].sort((a, b) => {
    const timeA = new Date(a.time);
    const timeB = new Date(b.time);
    return order === "asc" ? timeA - timeB : timeB - timeA;
  });
};

function groupByDayAndHour(dataArray) {
  const dailyData = [];

  dataArray.forEach((item) => {
    const date = new Date(item.time);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    // Find or create day entry
    let dayEntry = dailyData.find((d) => new Date(d.date).getTime() === dayStart.getTime());

    if (!dayEntry) {
      dayEntry = {
        date: dayStart.toISOString(),
        hours: {},
      };
      dailyData.push(dayEntry);
    }

    // Get hour key
    const hour = date.getHours();

    // Initialize hour array if needed
    if (!dayEntry.hours[hour]) {
      dayEntry.hours[hour] = {
        time: date.toISOString(),
        entries: [],
      };
    }

    // Add entries (flatten one level)
    dayEntry.hours[hour].entries.push(...item.entries); // Spread the entries array
  });

  return dailyData;
}

function filterOnlyHours(data, time) {
  return data.filter((entry) => {
    const time = new Date(entry.time);
    return time.getHours() === time;
  });
}

function getMinMaxPerField(data) {
  const allEntries = data.flatMap((d) => d.entries);

  // Group by field
  const grouped = allEntries.reduce((acc, entry) => {
    if (!acc[entry.field]) {
      acc[entry.field] = [];
    }
    acc[entry.field].push(entry);
    return acc;
  }, {});

  const result = {};

  for (const [field, items] of Object.entries(grouped)) {
    const values = items.map((d) => +d.value);
    result[field] = {
      min: min(values), // p5.js min function
      max: max(values), // p5.js max function
    };
  }

  return result;
}

// function getMinMaxPerField(data) {
//   const allEntries = data.flatMap((d) => d.entries);
//   const grouped = d3.group(allEntries, (d) => d.field);

//   const result = {};
//   for (const [field, items] of grouped) {
//     const values = items.map((d) => +d.value);
//     result[field] = {
//       min: d3.min(values),
//       max: d3.max(values),
//     };
//   }
//   return result;
// }
