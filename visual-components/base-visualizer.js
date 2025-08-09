/**
 * Base Visualizer class - defines the public API for all visualizers
 * This serves as both a template and documentation for visualizer implementations
 */
class BaseVisualizer {
  constructor(metadata = {}) {
    this.metadata = metadata;
    this.isInitialized = false;
  }

  /**
   * Initialize the visualizer with layer and stage references
   * Called once when the visualizer is set up
   * @param {Konva.Layer} layer - The layer this visualizer should primarily use
   * @param {Konva.Stage} stage - The stage for accessing dimensions and global properties
   */
  init(layer, stage) {
    this.layer = layer;
    this.stage = stage;
    this.isInitialized = true;
  }

  /**
   * Display/update visualizer content based on current video state
   * Called on every video timeupdate event
   * @param {Object} layers - Object containing both static and dynamic layers
   * @param {Konva.Layer} layers.staticLayer - Layer for persistent content
   * @param {Konva.Layer} layers.dynamicLayer - Layer for frequently changing content
   * @param {number} epochTime - Current time in milliseconds since epoch
   * @param {Object} videoRect - Video dimensions {width, height}
   * @param {number} currentTime - Current video playback time in seconds
   */
  display(layers, epochTime, videoRect, currentTime) {
    if (!this.isInitialized) {
      console.warn('Visualizer not initialized. Call init() first.');
      return;
    }
    
    // Override in subclasses to implement visualization logic
    this._render(layers, epochTime, videoRect, currentTime);
  }

  /**
   * Handle stage resize events
   * Called when the video/stage dimensions change
   * @param {Konva.Stage} stage - The stage that was resized
   */
  onResize(stage) {
    // Override in subclasses if resize handling is needed
    this._handleResize(stage);
  }

  /**
   * Clean up resources when visualizer is being destroyed
   * Called when VideoAnnotator is destroyed
   */
  destroy() {
    // Override in subclasses to clean up resources
    this._cleanup();
    this.isInitialized = false;
  }

  // Protected methods - to be overridden by subclasses

  /**
   * Main rendering logic - implement in subclasses
   * @param {Object} layers - Available layers
   * @param {number} epochTime - Current epoch time
   * @param {Object} videoRect - Video dimensions
   * @param {number} currentTime - Video time
   * @protected
   */
  _render(layers, epochTime, videoRect, currentTime) {
    // Default: no-op
  }

  /**
   * Handle resize logic - implement in subclasses if needed
   * @param {Konva.Stage} stage - The resized stage
   * @protected
   */
  _handleResize(stage) {
    // Default: no-op
  }

  /**
   * Cleanup logic - implement in subclasses if needed
   * @protected
   */
  _cleanup() {
    // Default: no-op
  }

  // Utility methods for common visualizer tasks

  /**
   * Helper to choose appropriate layer based on content type
   * @param {Object} layers - Available layers
   * @param {boolean} isStatic - True for static content, false for dynamic
   * @returns {Konva.Layer} The appropriate layer
   */
  getLayer(layers, isStatic = false) {
    return isStatic ? layers.staticLayer : layers.dynamicLayer;
  }

  /**
   * Helper to create styled text
   * @param {string} text - Text content
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {Object} options - Styling options
   * @returns {Konva.Text} Configured text object
   */
  createText(text, x, y, options = {}) {
    return new Konva.Text({
      x,
      y,
      text,
      fontSize: options.fontSize || 12,
      fill: options.color || 'white',
      fontFamily: options.fontFamily || 'Arial',
      ...options
    });
  }
}

export { BaseVisualizer };
