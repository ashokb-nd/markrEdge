
import {Grapher} from "./grapher.js"
import { BaseVisualizer } from './base-visualizer.js';

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
      this.grapher.addMarker('marker3', '😴', 'Drowsy - incab', 0.25);
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
