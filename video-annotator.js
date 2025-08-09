/**
 * VideoAnnotator for Konva.js - Manages layers and annotations
 */
class VideoAnnotator {
  constructor(videoElement, konvaStage, metadata = {}) {
    this.video = videoElement;
    this.stage = konvaStage;
    this.metadata = metadata;
    this.visualizers = [];
    
    this.startTime = metadata.startTime || null;
    this._lastRenderTime = -1;
    
    // Create and manage layers internally
    this._initLayers();
    
    // Initialize visualizers
    this._initVisualizers();
    
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

  _initVisualizers() {
    // Import and initialize visualizers based on metadata or configuration
    // For now, we'll initialize Debug visualizer as default
    import('./visual-components/debug.js').then(({ Debug }) => {
      const debugVisualizer = new Debug(this.metadata);
      if (debugVisualizer.init) {
        // Debug visualizer uses dynamic layer for real-time updates
        debugVisualizer.init(this.dynamicLayer, this.stage);
      }
      this.visualizers.push(debugVisualizer);
    }).catch(err => {
      console.warn('Could not load Debug visualizer:', err);
    });
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
    // Notify visualizers of resize events
    for (const visualizer of this.visualizers) {
      if (visualizer.onResize) {
        visualizer.onResize(this.stage);
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
