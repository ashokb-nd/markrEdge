/**
 * Inertial Bar Vis      cornerRadius: 0,  // Removed corner rounding
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowBlur: 8,
      shadowOffset: { x: 0, y: 4 }
    });

    // Create border
    const border = new Konva.Rect({
      x: x,
      y: y,
      width: width,
      height: height,
      stroke: options.BorderColor,
      strokeWidth: options.BorderWidth,
      cornerRadius: 0  // Removed corner roundingays IMU/accelerometer data as a time-series graph
 * 
 * Expected data structure extracted from metadata:
 * - sensorMetaData array with accelerometer readings
 */
import { BaseVisualizer } from './base-visualizer.js';

// Modular component for the graph background and grid
class GraphBackground {
  constructor() {
    this.group = new Konva.Group();
  }

  create(x, y, width, height, options) {
    // Create background rectangle with rounded corners
    const background = new Konva.Rect({
      x: x,
      y: y,
      width: width,
      height: height,
      fill: options.BackgroundColor,
      opacity: options.BackgroundOpacity,
      cornerRadius: options.CornerRadius,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowBlur: 8,
      shadowOffset: { x: 0, y: 4 }
    });

    // Create border
    const border = new Konva.Rect({
      x: x,
      y: y,
      width: width,
      height: height,
      stroke: options.BorderColor,
      strokeWidth: options.BorderWidth,
      // cornerRadius: options.CornerRadius
    });

    this.group.add(background);
    this.group.add(border);

    // Add grid lines
    this.addGridLines(x, y, width, height, options);

    return this.group;
  }

  addGridLines(x, y, width, height, options) {
    // Major grid lines (fewer, more prominent)
    this.addMajorGridLines(x, y, width, height, options);
    // Minor grid lines (more numerous, very subtle)
    this.addMinorGridLines(x, y, width, height, options);
  }

  addMajorGridLines(x, y, width, height, options) {
    // Horizontal major grid lines
    for (let i = 1; i < 4; i++) {
      const gridY = y + (height * i / 4);
      const hLine = new Konva.Line({
        points: [x, gridY, x + width, gridY],
        stroke: options.GridColor,
        strokeWidth: 0.5,
        opacity: options.GridOpacity * 1.5, // Slightly more visible
        perfectDrawEnabled: false,
      });
      this.group.add(hLine);
    }

    // Vertical major grid lines
    for (let i = 1; i < 8; i++) {
      const gridX = x + (width * i / 8);
      const vLine = new Konva.Line({
        points: [gridX, y, gridX, y + height],
        stroke: options.GridColor,
        strokeWidth: 0.5,
        opacity: options.GridOpacity * 2,
        perfectDrawEnabled: false,
      });
      this.group.add(vLine);
    }
  }

  addMinorGridLines(x, y, width, height, options) {
    // Horizontal minor grid lines
    for (let i = 1; i < 16; i++) {
      if (i % 4 !== 0) { // Skip where major lines are
        const gridY = y + (height * i / 16);
        const hLine = new Konva.Line({
          points: [x, gridY, x + width, gridY],
          stroke: options.GridColor,
          strokeWidth: 0.25,
          opacity: options.GridOpacity * 0.5, // More subtle
          perfectDrawEnabled: false,
        });
        this.group.add(hLine);
      }
    }

    // Vertical minor grid lines
    for (let i = 1; i < 32; i++) {
      if (i % 4 !== 0) { // Skip where major lines are
        const gridX = x + (width * i / 32);
        const vLine = new Konva.Line({
          points: [gridX, y, gridX, y + height],
          stroke: options.GridColor,
          strokeWidth: 0.25,
          opacity: options.GridOpacity * 0.5,
          perfectDrawEnabled: false,
        });
        this.group.add(vLine);
      }
    }
  }
  }


// Modular component for data curves
class DataCurves {
  constructor() {
    this.group = new Konva.Group();
    this.lateralCurve = null;
    this.drivingCurve = null;
  }

  create(timeValues, lateralValues, drivingValues, x, y, width, height, options) {
    const maxG = 0.75; // Max G-force to display
    const gScale = (height / 2) / maxG;
    const numPoints = Math.min(timeValues.length, lateralValues.length, drivingValues.length);

    // Create points for lateral curve (green)
    const lateralPoints = [];
    for (let i = 0; i < numPoints; i++) {
      const pointX = x + timeValues[i] * width;
      const clampedLateral = Math.max(-maxG, Math.min(maxG, lateralValues[i]));
      const pointY = y + height/2 - (clampedLateral * gScale);
      lateralPoints.push(pointX, pointY);
    }

    // Create points for driving curve (red)
    const drivingPoints = [];
    for (let i = 0; i < numPoints; i++) {
      const pointX = x + timeValues[i] * width;
      const clampedDriving = Math.max(-maxG, Math.min(maxG, drivingValues[i]));
      const pointY = y + height/2 - (clampedDriving * gScale);
      drivingPoints.push(pointX, pointY);
    }

    // Create lateral acceleration curve
    this.lateralCurve = new Konva.Line({
      points: lateralPoints,
      stroke: options.Curve1Color,
      strokeWidth: options.CurveLineWidth,
      opacity: options.Opacity,
      tension: 0.1, // Smooth curves
      lineCap: 'round',
      lineJoin: 'round'
    });

    // Create driving acceleration curve
    this.drivingCurve = new Konva.Line({
      points: drivingPoints,
      stroke: options.Curve2Color,
      strokeWidth: options.CurveLineWidth,
      opacity: options.Opacity,
      tension: 0.1, // Smooth curves
      lineCap: 'round',
      lineJoin: 'round'
    });

    this.group.add(this.lateralCurve);
    this.group.add(this.drivingCurve);

    return this.group;
  }

  update(timeValues, lateralValues, drivingValues, x, y, width, height, options) {
    if (!this.lateralCurve || !this.drivingCurve) return;

    const maxG = 0.75;
    const gScale = (height / 2) / maxG;
    const numPoints = Math.min(timeValues.length, lateralValues.length, drivingValues.length);

    // Update lateral curve points
    const lateralPoints = [];
    for (let i = 0; i < numPoints; i++) {
      const pointX = x + timeValues[i] * width;
      const clampedLateral = Math.max(-maxG, Math.min(maxG, lateralValues[i]));
      const pointY = y + height/2 - (clampedLateral * gScale);
      lateralPoints.push(pointX, pointY);
    }

    // Update driving curve points
    const drivingPoints = [];
    for (let i = 0; i < numPoints; i++) {
      const pointX = x + timeValues[i] * width;
      const clampedDriving = Math.max(-maxG, Math.min(maxG, drivingValues[i]));
      const pointY = y + height/2 - (clampedDriving * gScale);
      drivingPoints.push(pointX, pointY);
    }

    this.lateralCurve.points(lateralPoints);
    this.drivingCurve.points(drivingPoints);
  }
}

// Modular component for timeline indicator
class TimelineIndicator {
  constructor() {
    this.line = null;
  }

  create(videoProgress, x, y, width, height, options) {
    const timelineX = x + (videoProgress * width);
    
    // Clamp to graph bounds
    if (timelineX < x || timelineX > x + width) return null;
    
    this.line = new Konva.Line({
      points: [timelineX, y, timelineX, y + height],
      stroke: options.TimelineColor,
      strokeWidth: options.TimelineWidth,
      opacity: 1.0
    });

    return this.line;
  }

  update(videoProgress, x, y, width, height) {
    if (!this.line) return;
    
    const timelineX = x + (videoProgress * width);
    
    // Clamp to graph bounds
    if (timelineX < x || timelineX > x + width) {
      this.line.visible(false);
      return;
    }
    
    this.line.visible(true);
    this.line.points([timelineX, y, timelineX, y + height]);

  }
}

// Modular component for labels
class GraphLabels {
  constructor() {
    this.group = new Konva.Group();
  }

  create(x, y, width, height, options) {
    // Top-right corner: "BKWD|LEFT" with proper colors
    const topY = y + 20;
    const endX = x + width - 8;
    
    // Create "LEFT" text in green (lateral color)
    const leftText = new Konva.Text({
      x: endX - 35, // Adjust position for alignment
      y: topY - 10,
      text: 'LEFT',
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: options.Curve1Color,
      stroke: options.TextStrokeColor,
      strokeWidth: 1,
      align: 'right'
    });

    // Create "|" separator
    const separator1 = new Konva.Text({
      x: endX - 40,
      y: topY - 10,
      text: '|',
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: options.TextColor,
      stroke: options.TextStrokeColor,
      strokeWidth: 1
    });

    // Create "BKWD" text in red (driving color)
    const bkwdText = new Konva.Text({
      x: endX - 80,
      y: topY - 10,
      text: 'BKWD',
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: options.Curve2Color,
      stroke: options.TextStrokeColor,
      strokeWidth: 1
    });

    // Bottom-right corner: "FWD|RIGHT" with proper colors
    const bottomY = y + height - 8;

    // Create "RIGHT" text in green (lateral color)
    const rightText = new Konva.Text({
      x: endX - 40,
      y: bottomY - 2,
      text: 'RIGHT',
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: options.Curve1Color,
      stroke: options.TextStrokeColor,
      strokeWidth: 1
    });

    // Create "|" separator
    const separator2 = new Konva.Text({
      x: endX - 45,
      y: bottomY - 2,
      text: '|',
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: options.TextColor,
      stroke: options.TextStrokeColor,
      strokeWidth: 1
    });

    // Create "FWD" text in red (driving color)
    const fwdText = new Konva.Text({
      x: endX - 70,
      y: bottomY - 2,
      text: 'FWD',
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: options.Curve2Color,
      stroke: options.TextStrokeColor,
      strokeWidth: 1
    });

    this.group.add(bkwdText);
    this.group.add(separator1);
    this.group.add(leftText);
    this.group.add(fwdText);
    this.group.add(separator2);
    this.group.add(rightText);

    return this.group;
  }
}

class InertialBar extends BaseVisualizer {
  constructor(staticLayer, dynamicLayer, metadata = {}) {
    super(staticLayer, dynamicLayer, metadata);
    this.inertialBarGroup = null;
    this.graphGroup = null;  // New group to hold background, curves, and labels
    this.graphBackground = new GraphBackground();
    this.dataCurves = new DataCurves();
    this.timelineIndicator = new TimelineIndicator();
    this.graphLabels = new GraphLabels();
    
    // Graph options - Professional color scheme
    this.options = {
      Opacity: 0.95,
      BackgroundColor: "#1a1a1a", // Dark charcoal
      BackgroundOpacity: 0.5, // Even more transparent background
      BorderColor: "rgba(74, 144, 226, 0.5)", // Semi-transparent blue border
      BorderWidth: 1,
      GridColor: "#ffffff", // White grid lines
      GridOpacity: 0.07, // Very subtle grid
      Curve1Color: "#2ecc71", // Professional emerald green for lateral
      Curve2Color: "#e74c3c", // Professional crimson red for driving
      TimelineColor: "#f39c12", // Professional orange/amber
      TextColor: "#ecf0f1", // Soft white for better readability
      LabelColor: "#bdc3c7", // Light gray for labels
      CurveLineWidth: 1,
      TimelineWidth: 1,
      TextStrokeColor: "#2c3e50", // Dark blue-gray stroke
      TextStrokeWidth: 1.5,
    };
  }

  processMetadata(metadata = {}) {
    // Extract IMU/inertial data from sensorMetaData
    const sensorMetaData = metadata?.sensorMetaData;

    if (!sensorMetaData || !Array.isArray(sensorMetaData)) {
      // Return dummy data for testing
      return this.generateDummyData(100);
    }

    // Initialize arrays for accelerometer data
    const acc1 = [];
    const acc2 = [];
    const acc3 = [];
    const epochtime = [];

    // Parse accelerometer data from sensorMetaData
    sensorMetaData.forEach(entry => {
        if (entry.accelerometer) {
            // Parse the accelerometer string format: "  9.68  -0.17  -1.2   1751942812933"
            const accelString = entry.accelerometer.trim();
            const values = accelString.split(/\s+/); // Split by whitespace
            
            if (values.length >= 4) {
                const x = parseFloat(values[0]);
                const y = parseFloat(values[1]);
                const z = parseFloat(values[2]);
                const time = parseInt(values[3]);
                
                // Only add if all values are valid numbers
                if (!isNaN(x) && !isNaN(y) && !isNaN(z) && !isNaN(time)) {
                    acc1.push(x);
                    acc2.push(y);
                    acc3.push(z);
                    epochtime.push(time);
                }
            }
        }
    });

    if (acc1.length === 0) {
      // Return dummy data if no valid accelerometer data found
      return this.generateDummyData(100);
    }

    // Convert epoch times to normalized values (0 to 1)
    const minTime = Math.min(...epochtime);
    const maxTime = Math.max(...epochtime);
    const timeRange = maxTime - minTime;
    
    const timeValues = epochtime.map(time => (time - minTime) / timeRange);
    
    // Create inertial bar data structure
    return {
      // Raw accelerometer data arrays
      acc1: acc1,
      acc2: acc2, // Lateral acceleration
      acc3: acc3, // Driving acceleration
      epochtime: epochtime,
      timeValues: timeValues,
      lateralValues: acc2,  // Use acc2 for lateral
      drivingValues: acc3   // Use acc3 for driving
    };
  }

  generateDummyData(numPoints) {
    const timeValues = [];
    const lateralValues = [];
    const drivingValues = [];
    const epochtime = [];
    
    const currentTime = Date.now();
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      timeValues.push(t);
      epochtime.push(currentTime + i * 100); // 100ms intervals
      
      // Generate smooth curves with some randomness
      lateralValues.push(0.3 * Math.sin(t * 4 * Math.PI) + 0.1 * (Math.random() - 0.5));
      drivingValues.push(0.2 * Math.cos(t * 6 * Math.PI) + 0.1 * (Math.random() - 0.5));
    }
    
    return { 
      timeValues, 
      lateralValues, 
      drivingValues, 
      epochtime,
      acc1: drivingValues.map(v => v + 9.8), // Add gravity component
      acc2: lateralValues,
      acc3: drivingValues
    };
  }

  display(epochTime, videoRect) {
    if (!this.data) return;

    const L = videoRect.height;
    const W = videoRect.width;

    // Graph dimensions and positioning - make it wider and span more of the screen
    const graphWidth = W * 0.9;   // 90% of video width
    const graphHeight = L * 0.15; // 15% of video height
    const graphX = W * 0.05;      // 5% margin from left (centered)
    const graphY = L - graphHeight - (L * 0.02);  // 2% margin from bottom

    // Create inertial bar group only once
    if (!this.inertialBarGroup) {
      this.inertialBarGroup = new Konva.Group();
      
      // Create a unified graph group
      this.graphGroup = new Konva.Group({
        x: graphX,
        y: graphY,
        width: graphWidth,
        height: graphHeight,
        draggable: true,  // Make the graph draggable
        dragBoundFunc: function(pos) {
          // Get stage dimensions
          const stage = this.getStage();
          const stageWidth = stage.width();
          const stageHeight = stage.height();
          
          // Calculate bounds
          const minX = stageWidth * 0.05;  // 5% from left
          const maxX = stageWidth * 0.95 - graphWidth;  // 5% from right
          const minY = 0;  // Allow dragging to top
          const maxY = stageHeight - graphHeight - (stageHeight * 0.02);  // Keep 2% margin from bottom
          
          // Clamp position within bounds
          return {
            x: Math.max(minX, Math.min(pos.x, maxX)),
            y: Math.max(minY, Math.min(pos.y, maxY))
          };
        }
      });

      // Create background and grid
      const backgroundGroup = this.graphBackground.create(
        0, 0, graphWidth, graphHeight, this.options  // Relative to graphGroup
      );
      this.graphGroup.add(backgroundGroup);

      // Create data curves
      const curvesGroup = this.dataCurves.create(
        this.data.timeValues,
        this.data.lateralValues,
        this.data.drivingValues,
        0, 0, graphWidth, graphHeight,  // Relative to graphGroup
        this.options
      );
      this.graphGroup.add(curvesGroup);

      // Create labels
      const labelsGroup = this.graphLabels.create(
        0, 0, graphWidth, graphHeight, this.options  // Relative to graphGroup
      );
      this.graphGroup.add(labelsGroup);

      // Add the unified graph group to the main group
      this.inertialBarGroup.add(this.graphGroup);

      this.staticLayer.add(this.inertialBarGroup);

      // Create timeline indicator in dynamic layer
      const videoProgress = Math.min(1.0, Math.max(0.0, epochTime / 60000)); // Assume max 60 second video
      const timelineLine = this.timelineIndicator.create(
        videoProgress, this.graphGroup.x(), this.graphGroup.y(), graphWidth, graphHeight, this.options
      );
      if (timelineLine) {
        this.dynamicLayer.add(timelineLine);
      }
    } else {
      // Update timeline indicator (this changes frequently)
      const videoProgress = Math.min(1.0, Math.max(0.0, epochTime / 60000)); // Assume max 60 second video
      // Use the current position of the graph group for the timeline
      const currentX = this.graphGroup.x();
      const currentY = this.graphGroup.y();
      this.timelineIndicator.update(videoProgress, currentX, currentY, graphWidth, graphHeight);
      this.dynamicLayer.draw();
    }
  }
}

export { InertialBar };
