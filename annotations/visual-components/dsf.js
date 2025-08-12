
// ====== Template for new visualizers ======
import { BaseVisualizer } from './base-visualizer.js';

export class Dsf extends BaseVisualizer {
  constructor(staticLayer, dynamicLayer, metadata) {
    super(staticLayer, dynamicLayer, metadata);
    // Additional initialization if needed
    this.vanishingTriangle = null;
  }

  processMetadata(metadata) {
   const MIN_TRACK_LENGTH = 3;
    const CANONICAL_OUTWARD_IMAGE_WIDTH = 1920;
    const CANONICAL_OUTWARD_IMAGE_HEIGHT = 1080;
    
    const inferenceData = metadata?.inference_data || {};
    const observationsData = inferenceData?.observations_data || {};
    const laneCalParams = observationsData?.laneCalibrationParams;

    if (!laneCalParams) return null;

    let [vanishingPointEstimate, _, xInt, imageHeight] = laneCalParams;

    // Convert to 1920x1080 resolution scale
    const scale = CANONICAL_OUTWARD_IMAGE_HEIGHT / imageHeight;

    vanishingPointEstimate = vanishingPointEstimate.map(x => x * scale);
    xInt = xInt.map(x => x * scale);
    imageHeight = CANONICAL_OUTWARD_IMAGE_HEIGHT;

    // Create short lane calibration segments: bottom corners to 5% up from bottom
    const calibrationHeight = imageHeight * 0.05; // 5% of image height
    const topY = imageHeight - calibrationHeight; // Y coordinate for top of calibration segment
    
    // Left lane line direction vector from bottom to vanishing point
    const leftDirX = vanishingPointEstimate[0] - xInt[0];
    const leftDirY = vanishingPointEstimate[1] - imageHeight;
    const leftLength = Math.sqrt(leftDirX * leftDirX + leftDirY * leftDirY);
    
    // Right lane line direction vector from bottom to vanishing point  
    const rightDirX = vanishingPointEstimate[0] - xInt[1];
    const rightDirY = vanishingPointEstimate[1] - imageHeight;
    const rightLength = Math.sqrt(rightDirX * rightDirX + rightDirY * rightDirY);
    
    // Calculate end points at 5% height for each lane
    const leftEndX = xInt[0] + (leftDirX / leftLength) * calibrationHeight;
    const leftEndY = topY;
    
    const rightEndX = xInt[1] + (rightDirX / rightLength) * calibrationHeight;  
    const rightEndY = topY;

    // case 1: just 5%
    // -------
    // Return normalized coordinates (0-1 range) for the short calibration segments
    // const vanishingTriangle = [
    //   // Left calibration segment: bottom-left to 5% up
    //   [[xInt[0] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
    //    [leftEndX / CANONICAL_OUTWARD_IMAGE_WIDTH, leftEndY / imageHeight]],
    //   // Right calibration segment: bottom-right to 5% up
    //   [[xInt[1] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
    //    [rightEndX / CANONICAL_OUTWARD_IMAGE_WIDTH, rightEndY / imageHeight]]
    // ];


    // case 2: till vanishing point
    // -------
       const vanishingTriangleData = [
      // Left calibration segment: bottom-left to 5% up
      [[xInt[0] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
       [vanishingPointEstimate[0] / CANONICAL_OUTWARD_IMAGE_WIDTH, vanishingPointEstimate[1] / imageHeight]],
      // Right calibration segment: bottom-right to 5% up
      [[xInt[1] / CANONICAL_OUTWARD_IMAGE_WIDTH, 1.0],
       [vanishingPointEstimate[0] / CANONICAL_OUTWARD_IMAGE_WIDTH, vanishingPointEstimate[1] / imageHeight]]
    ];

    return vanishingTriangleData;
  }

  display(epochTime, H, W) {

    // Only create group once
    if (!this.vanishingTriangle) {
      this.vanishingTriangle = new Konva.Group({});
      const style = {
        stroke: '#04fd63ff',
        strokeWidth: 1,
        lineCap: 'round',
        // opacity: 0.8
      };


    // change from normalized coordinates to pixels
    const p1 = this.data[0][0].map((val, i) => val * (i % 2 === 0 ? W : H));
    const p2 = this.data[0][1].map((val, i) => val * (i % 2 === 0 ? W : H));
    const p3 = this.data[1][0].map((val, i) => val * (i % 2 === 0 ? W : H));
    const p4 = this.data[1][1].map((val, i) => val * (i % 2 === 0 ? W : H));

    this.vanishingTriangle = new Konva.Line({
    points: [...p1, ...p2, ...p3, ...p4],
      ...style
    });

    this.staticLayer.add(this.vanishingTriangle);
  }
  // if already there. do nothing
}
}
