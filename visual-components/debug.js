/**
 * Debug visualizer for PTS display and debug information
 */
import { BaseVisualizer } from './base-visualizer.js';

class Debug extends BaseVisualizer {
  constructor(metadata = {}) {
    super(metadata);
    this.ptsText = null;
    this.crossMarks = {
      horizontal: null,
      vertical: null
    };
    this.border = null;
    this.diagonalCrosses = {
      topLeftToBottomRight: null,
      topRightToBottomLeft: null
    };
  }

  /**
   * Initialize PTS text object and cross marks on the layer
   */
  init(layer, stageInfo) {
    super.init(layer, stageInfo);
    
    // Initialize PTS text
    this.ptsText = new Konva.Text({
      x: stageInfo.width - 120,
      y: 10,
      text: 'PTS: 0.00s',
      fontSize: 16,
      fontFamily: 'Arial',
      fill: 'white',
      stroke: 'black',
      strokeWidth: 2,
      shadowColor: 'black',
      shadowBlur: 4,
      shadowOffset: { x: 1, y: 1 },
    });

    // Create cross marks for alignment debugging
    this.crossMarks.horizontal = new Konva.Line({
      points: [0, stageInfo.height / 2, stageInfo.width, stageInfo.height / 2],
      stroke: 'rgba(144, 238, 144, 0.8)', // Light green
      strokeWidth: 1,
      dash: [5, 5], // Dashed line
      listening: false // Don't capture events
    });

    this.crossMarks.vertical = new Konva.Line({
      points: [stageInfo.width / 2, 0, stageInfo.width / 2, stageInfo.height],
      stroke: 'rgba(144, 238, 144, 0.8)', // Light green
      strokeWidth: 1,
      dash: [5, 5], // Dashed line
      listening: false // Don't capture events
    });

    // Create border rectangle around the full video area
    this.border = new Konva.Rect({
      x: 0,
      y: 0,
      width: stageInfo.width,
      height: stageInfo.height,
      stroke: 'rgba(144, 238, 144, 0.8)', // Light green to match cross marks
      strokeWidth: 2,
      fill: null, // No fill, just border
      listening: false // Don't capture events
    });

    // Create diagonal crosses from corner to corner (X pattern)
    this.diagonalCrosses.topLeftToBottomRight = new Konva.Line({
      points: [0, 0, stageInfo.width, stageInfo.height],
      stroke: 'rgba(144, 238, 144, 0.8)', // Light green
      strokeWidth: 1,
      dash: [5, 5], // Dashed line
      listening: false // Don't capture events
    });

    this.diagonalCrosses.topRightToBottomLeft = new Konva.Line({
      points: [stageInfo.width, 0, 0, stageInfo.height],
      stroke: 'rgba(144, 238, 144, 0.8)', // Light green
      strokeWidth: 1,
      dash: [5, 5], // Dashed line
      listening: false // Don't capture events
    });

    layer.add(this.ptsText);
    layer.add(this.crossMarks.horizontal);
    layer.add(this.crossMarks.vertical);
    layer.add(this.border);
    layer.add(this.diagonalCrosses.topLeftToBottomRight);
    layer.add(this.diagonalCrosses.topRightToBottomLeft);
  }

  /**
   * Update PTS display based on current video time
   */
  _render(layers, epochTime, videoRect, videoPTS) {
    // Use dynamic layer for real-time updates
    const layer = this.getLayer(layers, false);
    
    if (this.ptsText) {
      this.ptsText.text(`PTS: ${videoPTS.toFixed(2)}s`);
      layer.batchDraw();
    }
  }

  /**
   * Handle resize - reposition PTS text and cross marks
   */
  _handleResize(stageInfo) {
    if (this.ptsText) {
      this.ptsText.x(stageInfo.width - 120);
    }
    
    // Update cross mark positions for new dimensions
    if (this.crossMarks.horizontal) {
      this.crossMarks.horizontal.points([0, stageInfo.height / 2, stageInfo.width, stageInfo.height / 2]);
    }
    
    if (this.crossMarks.vertical) {
      this.crossMarks.vertical.points([stageInfo.width / 2, 0, stageInfo.width / 2, stageInfo.height]);
    }

    // Update border dimensions
    if (this.border) {
      this.border.width(stageInfo.width);
      this.border.height(stageInfo.height);
    }

    // Update diagonal crosses for new dimensions
    if (this.diagonalCrosses.topLeftToBottomRight) {
      this.diagonalCrosses.topLeftToBottomRight.points([0, 0, stageInfo.width, stageInfo.height]);
    }
    
    if (this.diagonalCrosses.topRightToBottomLeft) {
      this.diagonalCrosses.topRightToBottomLeft.points([stageInfo.width, 0, 0, stageInfo.height]);
    }
  }

  /**
   * Cleanup
   */
  _cleanup() {
    if (this.ptsText) {
      this.ptsText.destroy();
      this.ptsText = null;
    }
    
    if (this.crossMarks.horizontal) {
      this.crossMarks.horizontal.destroy();
      this.crossMarks.horizontal = null;
    }
    
    if (this.crossMarks.vertical) {
      this.crossMarks.vertical.destroy();
      this.crossMarks.vertical = null;
    }

    if (this.border) {
      this.border.destroy();
      this.border = null;
    }

    // Cleanup diagonal crosses
    if (this.diagonalCrosses.topLeftToBottomRight) {
      this.diagonalCrosses.topLeftToBottomRight.destroy();
      this.diagonalCrosses.topLeftToBottomRight = null;
    }
    
    if (this.diagonalCrosses.topRightToBottomLeft) {
      this.diagonalCrosses.topRightToBottomLeft.destroy();
      this.diagonalCrosses.topRightToBottomLeft = null;
    }
  }
}

export { Debug };
