
// ====== Template for new visualizers ======
import { BaseVisualizer } from './base-visualizer.js';

export class Dsf extends BaseVisualizer {
  constructor(staticLayer, dynamicLayer, metadata) {
    super(staticLayer, dynamicLayer, metadata);

    // lane calibration
    // this.vanishingTriangle = null;
    // this.positionsInLaneData = null;
    // this.VP_normalized = null; // Vanishing Point
    // this.lane_cal_left = null; // Left lane calibration
    // this.lane_cal_right = null; // Right lane calibration

    this.laneLine = new Konva.Line({
    points: [0, 0, 0, 0],
    stroke: '#ee2913ff',
    strokeWidth: 2,
    lineCap: 'round',
    // opacity: 0.8
  });
  }

  processMetadata(metadata) {
    // add positionsInLane data
    this.positionsInLaneData = metadata?.inference_data?.observations_data?.positionsInLane || null;
    //  it is list of [epochTime,position] eg.  [1751942810796, -0.07]
    // console.log("Positions in lane data:", this.positionsInLaneData);



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
    const VP = [vanishingPointEstimate[0] / CANONICAL_OUTWARD_IMAGE_WIDTH, vanishingPointEstimate[1] / imageHeight];
    this.VP_normalized = VP;
    this.lane_cal_left = xInt[0] / CANONICAL_OUTWARD_IMAGE_WIDTH;
    this.lane_cal_right = xInt[1] / CANONICAL_OUTWARD_IMAGE_WIDTH;

    const vanishingTriangleData = [
      [[this.lane_cal_left, 1.0], [...VP]],
      [[this.lane_cal_right, 1.0], [...VP]]
    ];

    // console.log("Vanishing Triangle Data:", vanishingTriangleData);
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
  //add positions marking on road
  //pick the closet positioninlane value to this epoch from this.positionInLane
//   console.log('positionsInLaneData',this.positionsInLaneData);
  const [closetEpoch, closest_PIL] = this.positionsInLaneData.reduce((prev, curr) => {
    return (Math.abs(curr[0] - epochTime) < Math.abs(prev[0] - epochTime) ? curr : prev);
  });

  // lanewidth * closest_PIL + lane centre
  // formula : PIL = (vp_x - lane_center) / lane_width
  // lane_center = PIL * lane_width + vp_x

  const laneWidth_norm = (this.lane_cal_left - this.lane_cal_right);
  const laneCenter = (closest_PIL * laneWidth_norm + this.VP_normalized[0]) * W;
  const lane_left = laneCenter - laneWidth_norm*W / 2;
  const lane_right = laneCenter + laneWidth_norm*W / 2;

//   draw a line from lane_left to lane_right
//   this.laneLine = new Konva.Line({
//     points: [lane_left, H, lane_right, H],
//     stroke: '#04fd63ff',
//     strokeWidth: 5,
//     lineCap: 'round',
//     // opacity: 0.8
//   });

    this.laneLine.points([lane_left, H-10, lane_right, H-10]);
  this.dynamicLayer.add(this.laneLine);
}
}
