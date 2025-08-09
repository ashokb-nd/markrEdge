/**
 * Debug visualizer for PTS display and debug information
 */
class Debug {
  constructor(metadata = {}) {
    this.metadata = metadata;
    this.ptsText = null;
  }

  /**
   * Initialize PTS text object on the layer
   */
  init(layer, stage) {
    this.ptsText = new Konva.Text({
      x: stage.width() - 120,
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

    layer.add(this.ptsText);
  }

  /**
   * Update PTS display based on current video time
   */
  display(layer, epochTime, videoRect, videoPTS) {
    if (this.ptsText) {
      this.ptsText.text(`PTS: ${videoPTS.toFixed(2)}s`);
    }
  }

  /**
   * Handle resize - reposition PTS text
   */
  onResize(stage) {
    if (this.ptsText) {
      this.ptsText.x(stage.width() - 120);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.ptsText) {
      this.ptsText.destroy();
      this.ptsText = null;
    }
  }
}

export { Debug };
