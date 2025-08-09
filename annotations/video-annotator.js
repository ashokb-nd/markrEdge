/**
 * VideoAnnotator for Konva.js - Manages layers and annotations
 * 1. konvastage resizing, aligning with video element is not the responsibility of this class.
 * 2. That should be handled by the client code that uses this class.
 * 3. only handles annotations.
 */



// Import visualizers
import { Debug } from "./visual-components/debug.js";
// Add more visualizers here as needed


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
    
    // starting epoch time for video to align the annotations with the video playback
    if (metadata.startTime) {
      this._videoStartEpochTimeMS = metadata.startTime;
    } else {
      this._videoStartEpochTimeMS = Date.now(); // Fallback to current time if not provided
      console.warn("No startTime provided in metadata, using current time as fallback.");
    }

    this._lastRenderTime = -1;

    // Default options with overrides
    this.options = {
      debugMode: false,
      ...options,
    };
    
    // Create and manage layers internally
    this._initLayers();
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
    
    for (const category of visualizerNames) {
      const VisualizerClass = VISUALIZER_MAP[category];
      if (!VisualizerClass) {
        console.warn(`Visualizer for category "${category}" not found.`);
        console.log('Available visualizers:', Object.keys(VISUALIZER_MAP));
        continue;
      }

      // Pass metadata directly to each visualizer
      // also static and dynamic layers
      const visualizer = new VisualizerClass( this.staticLayer,
                                              this.dynamicLayer,
                                              this.metadata
                                            );
      this.visualizers.push(visualizer);
    }
  }

  _setupEventListeners() {
    // Update on video time change
    // later change it to use  "requestVideoFrameCallback" method

    this._render(); // on the video preview
    this.video.addEventListener("timeupdate", () => {
      this._render();
    });

    // Handle resize
    // window.addEventListener('resize', () => {
    //   this._onResize();
    // });
  }

  // _onResize() {
  //   // Create stage info object
  //   const stageInfo = {
  //     width: this.stage.width(),
  //     height: this.stage.height()
  //   };
  //   
  //   // Notify visualizers of resize events with stage info, not stage object
  //   for (const visualizer of this.visualizers) {
  //     if (visualizer.onResize) {
  //       visualizer.onResize(stageInfo);
  //     }
  //   }
  //   // Redraw both layers
  //   this.staticLayer.batchDraw();
  //   this.dynamicLayer.batchDraw();
  // }

  //this is called for every time the video time changes
  _render() {
    const epochTime = this.getCurrentEpochTimeInVideo();
    const videoRect = this._getVideoRect();

    if (this._lastRenderTime === epochTime){console.log("skipping render as last render time is same as current epoch time"); return;}
    this._lastRenderTime = epochTime;

    this.visualizers.forEach(visualizer => {visualizer.display(epochTime, videoRect);});
  }

  _getVideoRect() {
    // size of video at present time in Browser in pixels
    return {
      width: this.video.offsetWidth,
      height: this.video.offsetHeight
    };
  }

  getCurrentEpochTimeInVideo() {
    if (this._videoStartEpochTimeMS) {
      return this._videoStartEpochTimeMS + (this.video.currentTime * 1000);
    }else{
      throw new Error("video start epochtime is not set");
    }
  }

}

export { VideoAnnotator };


