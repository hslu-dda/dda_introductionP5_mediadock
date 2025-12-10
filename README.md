# Air Quality Visualization

A simple visualization tool that displays air quality data (PM2.5 levels) in an easy-to-read heatmap format.

## What Does This Do?

This project creates a colorful grid where:

- Each **row** represents one day
- Each **column** represents one hour (0-23)
- Each **colored square** shows the air quality for that specific hour

### Color Guide

- 🟢 **Green**: Good air quality (PM2.5 below 12)
- 🔴 **Red**: Poor air quality (PM2.5 at or above 12)
- ⬜ **Light Gray**: No PM2.5 reading available
- ⬛ **Dark Gray**: No data recorded for that hour

### Data

Your JSON file should look like this:

```json
{
  "2024-01-01": {
    "hours": {
      "0": {
        "entries": [
          {
            "field": "Workshop_pm25",
            "value": 8.5
          }
        ]
      },
      "1": {
        "entries": [
          {
            "field": "Workshop_pm25",
            "value": 15.2
          }
        ]
      }
    }
  },
  "2024-01-02": {
    "hours": {
      "0": {
        "entries": [
          {
            "field": "Workshop_pm25",
            "value": 10.1
          }
        ]
      }
    }
  }
}
```

## Customizing the Visualization

### Change the Air Quality Threshold

In `sketch.js`, find this line:

```javascript
if (value < 12) {
```

Change `12` to your preferred threshold value.

### Change Colors

Find these lines in `sketch.js`:

```javascript
fill(0, 255, 0); // Green for good air quality
fill(255, 0, 0); // Red for poor air quality
```

Change the RGB values to your preferred colors. Format is `fill(Red, Green, Blue)` where each value is 0-255.

### Change Canvas Size

In `sketch.js`, find:

```javascript
createCanvas(800, 1600);
```

Adjust these numbers (width, height) to fit your screen or data.

### Change Square Size

Find this line:

```javascript
let rectWidth = 20;
```

Change `20` to make squares bigger or smaller.

## Understanding PM2.5 Levels

PM2.5 refers to fine particulate matter in the air. General guidelines:

- **0-12**: Good air quality
- **12-35**: Moderate
- **35-55**: Unhealthy for sensitive groups
- **55+**: Unhealthy

(These thresholds vary by country and organization)
