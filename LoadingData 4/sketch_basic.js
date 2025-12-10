let dataArray = [];

function preload() {
  dataArray = loadJSON("data/airqualityGroupedByDay.json");
}

function setup() {
  createCanvas(800, 1600);
  dataArray = Object.values(dataArray);
  console.log("dataArray", dataArray);
}

function draw() {
  background(220);

  for (let i = 0; i < dataArray.length; i++) {
    rect(0, 0, 10, 10);
  }
}
