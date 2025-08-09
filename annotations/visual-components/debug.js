/**
 * Debug visualizer for PTS display and debug information
 */
import { BaseVisualizer } from './base-visualizer.js';

class Debug extends BaseVisualizer {
  constructor(staticLayer, dynamicLayer, metadata = {}) {
    super(staticLayer, dynamicLayer, metadata);
    this.debugCross = null;
    this.testRectangle = null;
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

      // Helper function to create a dashed line with better hit area
      const createLine = (points) => new Konva.Line({
        points,
        strokeWidth: 1,
        hitStrokeWidth: 10, // Larger invisible hit area for easier dragging
        ...debugStyle
      });

      // Create group with all debug elements
      this.debugCross = new Konva.Group({
        draggable: true
      });
      
      const lines = [
        createLine([0, 0, W, L]),        // Diagonal 1
        createLine([W, 0, 0, L]),        // Diagonal 2
        createLine([W/2, 0, W/2, L]),    // Vertical
        createLine([0, L/2, W, L/2]),    // Horizontal
        // Border lines
        createLine([0, 0, W, 0]),        // Top
        createLine([W, 0, W, L]),        // Right
        createLine([W, L, 0, L]),        // Bottom
        createLine([0, L, 0, 0])         // Left
      ];
      
      // Add all lines to group
      lines.forEach(line => this.debugCross.add(line));
      
      // Add hover effects
      this.debugCross.on('mouseenter', () => {
        lines.forEach(line => line.stroke('rgba(255, 0, 0, 0.8)'));
        document.body.style.cursor = 'move';
        this.dynamicLayer.batchDraw();
      });
      
      this.debugCross.on('mouseleave', () => {
        lines.forEach(line => line.stroke('rgba(0, 255, 0, 0.7)'));
        document.body.style.cursor = 'default';
        this.dynamicLayer.batchDraw();
      });

      // Add drag events to redraw layer
      this.debugCross.on('dragend', () => {
        this.dynamicLayer.batchDraw();
      });

      this.dynamicLayer.add(this.debugCross);
    }

    // Create test rectangle only once and cache it
    if (!this.testRectangle) {
      this.testRectangle = new Konva.Rect({
        x: 50,
        y: 50,
        width: 100,
        height: 60,
        fill: 'rgba(255, 255, 0, 0.3)',
        stroke: 'rgba(255, 255, 0, 0.8)',
        strokeWidth: 2,
        draggable: true,
        cornerRadius: 5
      });

      // Add hover effects for the rectangle
      this.testRectangle.on('mouseenter', () => {
        this.testRectangle.fill('rgba(255, 255, 0, 0.5)');
        this.testRectangle.stroke('rgba(255, 165, 0, 1)');
        document.body.style.cursor = 'move';
        this.dynamicLayer.batchDraw();
      });

      this.testRectangle.on('mouseleave', () => {
        this.testRectangle.fill('rgba(255, 255, 0, 0.3)');
        this.testRectangle.stroke('rgba(255, 255, 0, 0.8)');
        document.body.style.cursor = 'default';
        this.dynamicLayer.batchDraw();
      });

      // Add drag event to redraw layer
      this.testRectangle.on('dragend', () => {
        this.dynamicLayer.batchDraw();
      });

      this.dynamicLayer.add(this.testRectangle);
    }
  }
}
export { Debug };
