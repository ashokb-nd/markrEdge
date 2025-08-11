// Grapher class encapsulates all graph-related logic and elements
class Grapher {
  constructor(staticLayer, dynamicLayer, options, data, minTime, maxTime) {
    this.staticLayer = staticLayer;
    this.dynamicLayer = dynamicLayer;
    this.options = options;
    this.data = data;
    this.minTime = minTime;
    this.maxTime = maxTime;

    this.graphBackground = new GraphBackground();
    this.dataCurves = new DataCurves();
    this.timelineIndicator = new TimelineIndicator();
    this.graphLabels = new GraphLabels();
    this.markerManager = new MarkerManager();

    this.inertialBarGroup = null;
    this.graphGroup = null;
  }

  createElements(graphX, graphY, graphWidth, graphHeight, epochTime) {
    this.inertialBarGroup = new Konva.Group();

    // Create a unified graph group
    this.graphGroup = new Konva.Group({
      x: graphX,
      y: graphY,
      width: graphWidth,
      height: graphHeight,
      draggable: true,
      dragBoundFunc: function(pos) {
        const stage = this.getStage();
        const stageWidth = stage.width();
        const stageHeight = stage.height();
        const minX = stageWidth * 0.05;
        const maxX = stageWidth * 0.95 - graphWidth;
        const minY = 0;
        const maxY = stageHeight - graphHeight - (stageHeight * 0.02);
        return {
          x: Math.max(minX, Math.min(pos.x, maxX)),
          y: Math.max(minY, Math.min(pos.y, maxY))
        };
      }
    });

    // Create background and grid
    const backgroundGroup = this.graphBackground.create(
      0, 0, graphWidth, graphHeight, this.options
    );
    this.graphGroup.add(backgroundGroup);

    // Create data curves
    const curvesGroup = this.dataCurves.create(
      this.data.timeValues,
      this.data.lateralValues,
      this.data.drivingValues,
      0, 0, graphWidth, graphHeight,
      this.options
    );
    this.graphGroup.add(curvesGroup);

    // Create labels
    const labelsGroup = this.graphLabels.create(
      0, 0, graphWidth, graphHeight, this.options
    );
    this.graphGroup.add(labelsGroup);

    // Add marker group
    this.graphGroup.add(this.markerManager.group);

    this.inertialBarGroup.add(this.graphGroup);
    this.staticLayer.add(this.inertialBarGroup);

    // Timeline indicator
    const videoProgress = TimelineIndicator.calculateVideoProgress(epochTime, this.minTime, this.maxTime);
    const timelineLine = this.timelineIndicator.create(
      videoProgress, this.graphGroup.x(), this.graphGroup.y(), graphWidth, graphHeight, this.options
    );
    if (timelineLine) {
      this.dynamicLayer.add(timelineLine);
    }
  }

  updateTimeline(epochTime, graphWidth, graphHeight) {
    this.minTime = Math.min(...this.data.epochTimes);
    this.maxTime = Math.max(...this.data.epochTimes);
    const videoProgress = TimelineIndicator.calculateVideoProgress(epochTime, this.minTime, this.maxTime);
    const currentX = this.graphGroup.x();
    const currentY = this.graphGroup.y();
    this.timelineIndicator.update(videoProgress, currentX, currentY, graphWidth, graphHeight);
    this.dynamicLayer.draw();
  }

  addMarker(markerID, emoji, description, normalizedTime) {
    const graphWidth = this.graphGroup.width();
    const graphHeight = this.graphGroup.height();
    this.markerManager.create(
      markerID,
      emoji,
      description,
      normalizedTime,
      0,
      0,
      graphWidth,
      graphHeight,
      this.options
    );
    this.staticLayer.batchDraw();
  }

  removeMarker(markerID) {
    this.markerManager.removeMarker(markerID);
    this.staticLayer.batchDraw();
  }

  updateMarkers() {
    const graphWidth = this.graphGroup.width();
    const graphHeight = this.graphGroup.height();
    this.markerManager.markers.forEach((marker, markerID) => {
      const time = marker.time;
      this.markerManager.update(
        markerID,
        time,
        0,
        0,
        graphWidth,
        graphHeight
      );
    });
  }
}

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
    const maxG = 0.75*9.8; // Max G-force to display
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

    console.log("Updating data curves with", timeValues.length, "points");

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

  /**
   * Calculate video progress as a value between 0 and 1
   * @param {number} epochTime - Current time
   * @param {number} minTime - Start time
   * @param {number} maxTime - End time
   * @returns {number} Progress value between 0 and 1
   */
  static calculateVideoProgress(epochTime, minTime, maxTime) {
    if (maxTime === minTime) return 0;
    return Math.min(1.0, Math.max(0.0, (epochTime - minTime) / (maxTime - minTime)));
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

// Modular component for emoji markers
class MarkerManager {
  constructor() {
    this.group = new Konva.Group();
    this.markers = new Map(); // Map markerID to marker objects
    this.tooltips = new Map(); // Map markerID to tooltip objects
  }

  create(markerID, emoji, description, time, x, y, width, height, options) {
    // Calculate position based on time (0-1)
    const markerX = x + (time * width);
    const markerY = y - 25; // Position above the graph

    // Create a group for this marker and its tooltip
    const markerGroup = new Konva.Group({
      x: markerX - 10,
      y: markerY
    });

    // Create emoji text
    const emojiText = new Konva.Text({
      text: emoji,
      fontSize: 20,
      align: 'center'
    });

    // Create tooltip (initially hidden)
    const tooltip = new Konva.Label({
      x: 0,
      y: -30,
      visible: false
    });
    // Add tooltip background
    tooltip.add(new Konva.Tag({
      fill: '#222831', // Modern dark background
      stroke: '#63d3d8ff', // Accent border color
      strokeWidth: 1,
      padding: 16, // Increased padding for more space
      cornerRadius: 4, // Slightly more rounded corners
    }));

    // Add tooltip text
    tooltip.add(new Konva.Text({
      text: description,
      fontSize: 11,
      fontFamily: 'Inter, Arial, sans-serif',
      fontStyle: 'normal',
      padding: 4, // Added padding for text
      fill: '#f5f6fa',
      align: 'center',
      lineHeight: 1
    }));

    // Add hover handlers
    emojiText.on('mouseover touchstart', () => {
      tooltip.visible(true);
      this.group.draw();
    });

    emojiText.on('mouseout touchend', () => {
      tooltip.visible(false);
      this.group.draw();
    });

    // Add elements to the marker group
    markerGroup.add(emojiText);
    markerGroup.add(tooltip);

    // Add marker group to main group and store references
    this.group.add(markerGroup);
    this.markers.set(markerID, markerGroup);
    this.tooltips.set(markerID, tooltip);

    return this.group;
  }

  update(markerID, time, x, y, width, height) {
    const markerGroup = this.markers.get(markerID);
    if (markerGroup) {
      const markerX = x + (time * width);
      markerGroup.x(markerX - 10);
      markerGroup.y(y - 25); // Position above the graph
    }
  }

  removeMarker(markerID) {
    const marker = this.markers.get(markerID);
    if (marker) {
      marker.destroy();
      this.markers.delete(markerID);
    }
  }
}


class InertialBar extends BaseVisualizer {
  constructor(staticLayer, dynamicLayer, metadata = {}) {
    super(staticLayer, dynamicLayer, metadata);
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
    this.grapher = null;
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
    const epochTimes = [];

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
                    epochTimes.push(time);
                }
            }
        }
    });

    if (acc1.length === 0) {
      // Return dummy data if no valid accelerometer data found
      return this.generateDummyData(100);
    }

    // Convert epoch times to normalized values (0 to 1)
    this.minTime = Math.min(...epochTimes);
    this.maxTime = Math.max(...epochTimes);
    const timeRange = this.maxTime - this.minTime;

    const timeValues = epochTimes.map(time => (time - this.minTime) / timeRange);

    // Create inertial bar data structure
    return {
      // Raw accelerometer data arrays
      acc1: acc1,
      acc2: acc2, // Lateral acceleration
      acc3: acc3, // Driving acceleration
      epochTimes: epochTimes,
      timeValues: timeValues,
      lateralValues: acc2,  // Use acc2 for lateral
      drivingValues: acc3   // Use acc3 for driving
    };
  }

  // generateDummyData(numPoints) {
  //   const timeValues = [];
  //   const lateralValues = [];
  //   const drivingValues = [];
  //   const epochtime = [];
    
  //   const currentTime = Date.now();
    
  //   for (let i = 0; i < numPoints; i++) {
  //     const t = i / (numPoints - 1);
  //     timeValues.push(t);
  //     epochtime.push(currentTime + i * 100); // 100ms intervals
      
  //     // Generate smooth curves with some randomness
  //     lateralValues.push(0.3 * Math.sin(t * 4 * Math.PI) + 0.1 * (Math.random() - 0.5));
  //     drivingValues.push(0.2 * Math.cos(t * 6 * Math.PI) + 0.1 * (Math.random() - 0.5));
  //   }
    
  //   return { 
  //     timeValues, 
  //     lateralValues, 
  //     drivingValues, 
  //     epochtime,
  //     acc1: drivingValues.map(v => v + 9.8), // Add gravity component
  //     acc2: lateralValues,
  //     acc3: drivingValues
  //   };
  // }

  // Add a marker at the specified normalized time (0-1)
  addMarker(markerID, emoji, description, normalizedTime) {
    if (!this.graphGroup) return;
    
    const graphPos = this.graphGroup.position();
    const graphWidth = this.graphGroup.width();
    const graphHeight = this.graphGroup.height();

    this.markerManager.create(
      markerID,
      emoji,
      description,
      normalizedTime,
      0, // Relative to graphGroup
      0,
      graphWidth,
      graphHeight,
      this.options
    );
    this.staticLayer.batchDraw();
  }

  // Remove a marker by its ID
  removeMarker(markerID) {
    this.markerManager.removeMarker(markerID);
    this.staticLayer.batchDraw();
  }

  // Update marker positions when graph is moved
  updateMarkers() {
    if (!this.graphGroup) return;
    
    const graphPos = this.graphGroup.position();
    const graphWidth = this.graphGroup.width();
    const graphHeight = this.graphGroup.height();

    // Update each marker's position
    this.markerManager.markers.forEach((marker, markerID) => {
      const time = marker.time; // Store time when marker is created
      this.markerManager.update(
        markerID,
        time,
        0, // Relative to graphGroup
        0,
        graphWidth,
        graphHeight
      );
    });
  }

  display(epochTime, H, W) {
    if (!this.data) return;
    const graphWidth = W * 0.9;
    const graphHeight = H * 0.15;
    const graphX = W * 0.05;
    const graphY = H - graphHeight - (H * 0.02);
    if (!this.grapher) {
      this.grapher = new Grapher(
        this.staticLayer,
        this.dynamicLayer,
        this.options,
        this.data,
        this.minTime,
        this.maxTime
      );
      this.grapher.createElements(graphX, graphY, graphWidth, graphHeight, epochTime);
      // Add demo markers
      this.grapher.addMarker('marker1', '📱', 'Driver distraction alert - incab', 0.5);
      this.grapher.addMarker('marker2', '🚗', 'Vehicle speed alert - incab \n 80 mph', 0.75);
    } else {
      this.grapher.updateTimeline(epochTime, graphWidth, graphHeight);
    }
  }

  addMarker(markerID, emoji, description, normalizedTime) {
    if (this.grapher) {
      this.grapher.addMarker(markerID, emoji, description, normalizedTime);
    }
  }

  removeMarker(markerID) {
    if (this.grapher) {
      this.grapher.removeMarker(markerID);
    }
  }

  updateMarkers() {
    if (this.grapher) {
      this.grapher.updateMarkers();
    }
  }
  }


export { InertialBar };
