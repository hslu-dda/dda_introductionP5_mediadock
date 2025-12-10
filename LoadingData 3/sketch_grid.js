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
  textAlign(CENTER, CENTER);
  let rectWidth = 20;
  let posX = 0;
  let posY = 10;
  for (let i = 0; i < dataArray.length; i++) {
    posX = 10;
    for (let hour = 0; hour < 24; hour++) {
      noFill();
      rect(posX, posY, 20, 20);
      fill(0);
      text(hour, posX + rectWidth / 2, posY + rectWidth / 2); // Center the text
      posX += rectWidth;
    }

    posY += rectWidth;
  }
}
