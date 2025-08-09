/**
 * Debug visualizer for PTS display and debug information
 */
import { BaseVisualizer } from './base-visualizer.js';

class Debug extends BaseVisualizer {
  constructor(staticLayer, dynamicLayer, metadata = {}) {
    super(staticLayer, dynamicLayer, metadata);
    this.debugCross = null;
  }

  processMetadata(metadata) {
    return null;
  }

  display(epochTime, videoRect) {
    // Create debug cross only once and cache it
    if (!this.debugCross) {
      const L = videoRect.height;
      const W = videoRect.width;

      // Common properties for all debug elements
      const debugStyle = {
        stroke: 'rgba(0, 255, 0, 0.7)',
        dash: [5, 5]
      };

      // Helper function to create a dashed line
      const createLine = (points) => new Konva.Line({
        points,
        strokeWidth: 1,
        ...debugStyle
      });

      // Create group with all debug elements
      this.debugCross = new Konva.Group({
        draggable: true
      });
      this.debugCross.add(createLine([0, 0, W, L]));        // Diagonal 1
      this.debugCross.add(createLine([W, 0, 0, L]));        // Diagonal 2
      this.debugCross.add(createLine([W/2, 0, W/2, L]));    // Vertical
      this.debugCross.add(createLine([0, L/2, W, L/2]));    // Horizontal

      // Add border rectangle
      this.debugCross.add(new Konva.Rect({
        x: 0, y: 0, width: W, height: L,
        strokeWidth: 2,
        ...debugStyle
      }));

      this.staticLayer.add(this.debugCross);
    }
  }
}
export { Debug };
