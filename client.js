import { VideoAnnotator } from './annotations/video-annotator.js';

let inwardAnnotator, outwardAnnotator;

// Get video and canvas elements
const inwardVideo = document.getElementById('inward');
const outwardVideo = document.getElementById('outward');
const inwardKonvaDiv = document.getElementById('inward-konva-div');
const outwardKonvaDiv = document.getElementById('outward-konva-div');

    // Create Konva stages - client handles sizing and resizing
    const inwardStage = new Konva.Stage({
        container: inwardKonvaDiv,
        width: inwardVideo.offsetWidth,
        height: inwardVideo.offsetHeight,
    });
    
    const outwardStage = new Konva.Stage({
        container: outwardKonvaDiv,
        width: outwardVideo.offsetWidth,
        height: outwardVideo.offsetHeight,
    });

function setResizeListenersForKonvaResizing() {

    // Add event listeners for video size changes
    function updateInwardStageSize() {
        inwardStage.width(inwardVideo.offsetWidth);
        inwardStage.height(inwardVideo.offsetHeight);
    }

    function updateOutwardStageSize() {
        outwardStage.width(outwardVideo.offsetWidth);
        outwardStage.height(outwardVideo.offsetHeight);
    }

    // Listen for video resize events
    inwardVideo.addEventListener('loadedmetadata', updateInwardStageSize);
    outwardVideo.addEventListener('loadedmetadata', updateOutwardStageSize);

    // Use ResizeObserver to watch for actual video element size changes
    const inwardResizeObserver = new ResizeObserver(() => {
        updateInwardStageSize();
    });
    inwardResizeObserver.observe(inwardVideo);

    const outwardResizeObserver = new ResizeObserver(() => {
        updateOutwardStageSize();
    });
    outwardResizeObserver.observe(outwardVideo);
};

function loadMetadata(){
    //placeholder for metadata loading logic

    // Create metadata (placeholder)
    return { startTime: Date.now() };
}
function initVideoAnnotators() {

    const metadata = loadMetadata();
    
    // Create annotators - they handle layer management and annotations
    inwardAnnotator = new VideoAnnotator(
        inwardVideo, 
        inwardStage, 
        metadata,
        ['Debug', 'InertialBar']  // Added InertialBar to inward video
    );
    
    outwardAnnotator = new VideoAnnotator(
        outwardVideo, 
        outwardStage, 
        metadata,
        ['Header', 'InertialBar']  // Added InertialBar to outward video
    );
}

function syncPlay() {
    const inward = document.getElementById('inward');
    const outward = document.getElementById('outward');
    
    inward.currentTime = 0;
    outward.currentTime = 0;
    
    inward.play();
    outward.play();
}

setResizeListenersForKonvaResizing();
// Global functions for testing
window.syncPlay = syncPlay;

// Initialize the video annotators, when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        initVideoAnnotators();
    }, 100);
});
