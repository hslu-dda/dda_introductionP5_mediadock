let dataArray = [];
let powerMeter = [];

function preload() {
  dataArray = loadJSON("data/airquality.json");
  powerMeter = loadJSON("data/Powermeter.json");
}

function setup() {
  createCanvas(400, 400);
  dataArray = Object.values(dataArray);
  powerMeter = Object.values(powerMeter);

  console.log(dataArray, powerMeter);
  let stats = getMinMaxPerField(dataArray);
  console.log(stats);

  const dailyBins = binByTimeInterval(dataArray, "Office_pm25", d3.timeDay);
  console.log(dailyBins);
}

function draw() {
  background(220);
}

const sortByTime = (array, order = "asc") => {
  return [...array].sort((a, b) => {
    const timeA = new Date(a.time);
    const timeB = new Date(b.time);

    return order === "asc" ? timeA - timeB : timeB - timeA;
  });
};

function getMinMaxPerField(data) {
  // flatten all entries into one array
  const allEntries = data.flatMap((d) => d.entries);

  // group by field
  const grouped = d3.group(allEntries, (d) => d.field);

  // compute min/max
  const result = {};
  for (const [field, items] of grouped) {
    const values = items.map((d) => +d.value); // numeric
    result[field] = {
      min: d3.min(values),
      max: d3.max(values),
    };
  }

  return result;
}

// Daily bins
function binByTimeInterval(data, field, interval = d3.timeDay) {
  const entries = data.flatMap((d) =>
    d.entries
      .filter((e) => e.field === field)
      .map((e) => ({
        time: new Date(d.time),
        value: +e.value,
      }))
  );

  const histogram = d3
    .bin()
    .value((d) => d.time)
    .thresholds(
      interval.range(
        // Use the interval parameter
        d3.min(entries, (d) => d.time),
        d3.max(entries, (d) => d.time)
      )
    );

  const bins = histogram(entries);

  return bins.map((bin) => ({
    timeRange: [bin.x0, bin.x1],
    count: bin.length,
    avgValue: d3.mean(bin, (d) => d.value),
    maxValue: d3.max(bin, (d) => d.value),
    minValue: d3.min(bin, (d) => d.value),
  }));
}
