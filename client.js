import { VideoAnnotator } from './annotations/video-annotator.js';

let inwardAnnotator, outwardAnnotator;

// Get video and canvas elements
const inwardVideo = document.getElementById('inward');
const outwardVideo = document.getElementById('outward');
const inwardKonvaDiv = document.getElementById('inward-konva-div');
const outwardKonvaDiv = document.getElementById('outward-konva-div');

// Get pause both button element
const pauseBothBtn = document.getElementById('pause-both-btn');
// Add event listener for pause both button
if (pauseBothBtn && inwardVideo && outwardVideo) {
    pauseBothBtn.addEventListener('click', () => {
        inwardVideo.pause();
        outwardVideo.pause();
    });
}

// class annotations
class Annotation {
    constructor(videoElement, konvaStage, metadata = {}, visualizerNames = [], options = {}) {
        this.videoElement = videoElement;
        this.konvaStage = konvaStage;
        this.metadata = metadata;
        this.visualizerNames = visualizerNames;
        this.options = options;

        // Initialize the video annotator
        this.videoAnnotator = new VideoAnnotator(
            this.videoElement,
            this.konvaStage,
            this.metadata,
            this.visualizerNames,
            this.options
        );
    }
}

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

// Load and return metadata
function loadMetadata(metadata_path) {
    return fetch(metadata_path)
        .then(response => response.json())
        .then(data => {
            // console.log("Metadata loaded:", data);
            return data;
        })
        .catch(error => {
            console.error("Error loading metadata:", error);
            return { startTime: Date.now() };
        });
}
function initVideoAnnotators() {
    //loads the metadata and initializes the annotators
    const request_ids = ['486511cb-0a08-4295-b45a-e1bd0ec1e1db','14304e48-8f7d-4cc7-95cf-b60eefa0fe9a']
    const baseDir = "/assets/symlink/nd-training-data-production/" + request_ids[0] + "/";
    const inwardVideoPath = baseDir + 'inwardVideo.mp4';
    const outwardVideoPath = baseDir + 'outwardVideo.mp4';
    const metadataPath = baseDir + 'metadata.txt';

    console.log(inwardVideoPath);
    console.log(outwardVideoPath);
    console.log(metadataPath);
    // set src for video elements
    inwardVideo.src = inwardVideoPath;
    outwardVideo.src = outwardVideoPath;

    loadMetadata(metadataPath).then(metadata => {
    // Create annotators - they handle layer management and annotations
    inwardAnnotator = new VideoAnnotator(
        inwardVideo, 
        inwardStage, 
        metadata,
        ['Header', 'InertialBar']  
    );
    
    outwardAnnotator = new VideoAnnotator(
        outwardVideo, 
        outwardStage, 
        metadata,
        ['Header', 'InertialBar', 'Dsf',"Multilane"]  
    );
    });
}

function syncPlay() {
    const inward = document.getElementById('inward');
    const outward = document.getElementById('outward');
    
    // inward.currentTime = 0;
    // outward.currentTime = 0;
    
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
