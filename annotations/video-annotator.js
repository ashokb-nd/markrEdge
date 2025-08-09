/**
 * VideoAnnotator for Konva.js - Manages layers and annotations
 * Pluggable component for adding visual annotations to video elements
 */

// Import visualizers
import { Debug } from "./visual-components/debug.js";
// Add more visualizers here as needed
// import { Timestamp } from "./visual-components/timestamp.js";
// import { BoundingBox } from "./visual-components/bounding-box.js";

// Auto-generate visualizer map from classes
const AVAILABLE_VISUALIZERS = [
  Debug,
  // Add more visualizers to this array
];

// Create map automatically: class name -> class reference
const VISUALIZER_MAP = Object.fromEntries(AVAILABLE_VISUALIZERS.map(cls => [cls.name, cls]));

class VideoAnnotator {
  constructor(videoElement, konvaStage, metadata = {}, visualizerNames = [], options = {}) {
    this.video = videoElement;
    this.stage = konvaStage;
    this.metadata = metadata;
    this.visualizerNames = visualizerNames;
    this.visualizers = [];
    
    // Cache startTime from metadata for performance
    this.startTime = metadata.startTime || null;
    this._lastRenderTime = -1;

    // Default options with overrides
    this.options = {
      debugMode: false,
      ...options,
    };
    
    // Create and manage layers internally
    this._initLayers();
    
    // Initialize visualizers based on categories
    this._initializeVisualizers(this.visualizerNames);
    
    this._setupEventListeners();
  }

  _initLayers() {
    // Create static layer for persistent annotations, UI elements
    this.staticLayer = new Konva.Layer();
    
    // Create dynamic layer for real-time overlays, animations
    this.dynamicLayer = new Konva.Layer();
    
    // Add layers to stage
    this.stage.add(this.staticLayer);
    this.stage.add(this.dynamicLayer);
  }

  _initializeVisualizers(visualizerNames) {
    console.log('Initializing visualizers:', visualizerNames);
    
    for (const category of visualizerNames) {
      const VisualizerClass = VISUALIZER_MAP[category];
      if (!VisualizerClass) {
        console.warn(`Visualizer for category "${category}" not found.`);
        console.log('Available visualizers:', Object.keys(VISUALIZER_MAP));
        continue;
      }

      // Pass metadata directly to each visualizer
      const visualizer = new VisualizerClass(this.metadata);
      
      // Initialize with dynamic layer and stage info (not stage object)
      if (visualizer.init) {
        const stageInfo = {
          width: this.stage.width(),
          height: this.stage.height()
        };
        visualizer.init(this.dynamicLayer, stageInfo);
      }
      
      console.log(`Initialized visualizer for category: ${category}`, visualizer);
      this.visualizers.push(visualizer);
    }
  }

  _setupEventListeners() {
    // Update on video time change
    this.video.addEventListener("timeupdate", () => {
      this._render();
    });

    // Handle resize
    window.addEventListener('resize', () => {
      this._onResize();
    });
  }

  _onResize() {
    // Create stage info object
    const stageInfo = {
      width: this.stage.width(),
      height: this.stage.height()
    };
    
    // Notify visualizers of resize events with stage info, not stage object
    for (const visualizer of this.visualizers) {
      if (visualizer.onResize) {
        visualizer.onResize(stageInfo);
      }
    }
    // Redraw both layers
    this.staticLayer.batchDraw();
    this.dynamicLayer.batchDraw();
  }

  _render() {
    const currentTime = this.video.currentTime;
    
    if (this._lastRenderTime === currentTime) return;
    this._lastRenderTime = currentTime;
    
    const epochTime = this.getEpochTime(currentTime);
    const videoRect = this._getVideoRect();
    
    // Update visualizers - they decide which layer to use
    for (const visualizer of this.visualizers) {
      if (visualizer.display) {
        // Pass both layers so visualizer can choose appropriate one
        visualizer.display({
          staticLayer: this.staticLayer,
          dynamicLayer: this.dynamicLayer
        }, epochTime, videoRect, currentTime);
      }
    }
    
    this._onTimeUpdate(currentTime);
  }

  _getVideoRect() {
    return {
      width: this.video.videoWidth || this.video.offsetWidth,
      height: this.video.videoHeight || this.video.offsetHeight
    };
  }

  _onTimeUpdate(currentTime) {
    // To be overridden by implementations
  }

  addDetection(x, y, width, height, label, confidence = 1.0) {
    const rect = new Konva.Rect({
      x, y, width, height,
      stroke: 'red',
      strokeWidth: 2,
      fill: 'transparent'
    });

    const text = new Konva.Text({
      x, y: y - 20,
      text: `${label} ${(confidence * 100).toFixed(0)}%`,
      fontSize: 12,
      fill: 'red'
    });

    // Add detections to dynamic layer (can change frequently)
    this.dynamicLayer.add(rect);
    this.dynamicLayer.add(text);
    this.dynamicLayer.batchDraw();

    return { rect, text };
  }

  clearDetections() {
    // Clear both layers
    this.staticLayer.removeChildren();
    this.dynamicLayer.removeChildren();
    this.staticLayer.batchDraw();
    this.dynamicLayer.batchDraw();
  }

  getEpochTime(videoPTS = this.video.currentTime) {
    return this.startTime ? this.startTime + (videoPTS * 1000) : Date.now();
  }

  destroy() {
    for (const visualizer of this.visualizers) {
      if (visualizer.destroy) {
        visualizer.destroy();
      }
    }
  }
}

export { VideoAnnotator };
