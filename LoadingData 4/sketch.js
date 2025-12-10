let dataArray = [];

function preload() {
  dataArray = loadJSON("data/airqualityGroupedByDay.json");
}

function setup() {
  createCanvas(800, 1600);
  dataArray = Object.values(dataArray);
  console.log("dataArray", dataArray);
  rectMode(CENTER);
  noLoop();
}

function draw() {
  background(220);
  textAlign(CENTER, CENTER);
  let rectWidth = 20;
  let posX = 0;
  let posY = 10;
  for (let i = 0; i < dataArray.length; i++) {
    const day = dataArray[i];
    posX = 0;
    for (let hour = 0; hour < 24; hour++) {
      if (day.hours[hour]) {
        const entry = day.hours[hour];
        // Example: color based on Office_pm25 value
        fill(255);
        rect(posX, posY, 20, 20);
        const Workshop_pm25 = entry.entries.find((e) => e.field === "Workshop_pm25");
        if (Workshop_pm25) {
          let value = Workshop_pm25.value;
          push();
          translate(posX, posY);
          rotate(map(value, 0, 10, 0, 2 * PI));
          rect(0, 0, 20, 20);
          if (value < 0.5) {
            text("😃", 0, 0); // Center the text
          } else {
            text("🤯", 0, 0); // Center the text
          }

          pop();
        } else {
          console.log(entry);
        }
        fill(255);
      } else {
        fill(100);
      }
      //rect(posX, posY, 20, 20);

      fill(0);
      //  text(hour, posX + rectWidth / 2, posY + rectWidth / 2); // Center the text
      posX += rectWidth;
    }
    posY += rectWidth;
  }
}
