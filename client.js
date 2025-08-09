import { VideoAnnotator } from './annotations/video-annotator.js';

let inwardAnnotator, outwardAnnotator;

function initVideoAnnotators() {
    const inwardVideo = document.getElementById('inward');
    const outwardVideo = document.getElementById('outward');
    const inwardCanvas = document.getElementById('inward-canvas');
    const outwardCanvas = document.getElementById('outward-canvas');
    
    // Create Konva stages - client handles sizing and resizing
    const inwardStage = new Konva.Stage({
        container: inwardCanvas,
        width: inwardVideo.offsetWidth,
        height: inwardVideo.offsetHeight,
    });
    
    const outwardStage = new Konva.Stage({
        container: outwardCanvas,
        width: outwardVideo.offsetWidth,
        height: outwardVideo.offsetHeight,
    });
    
    // Create metadata (placeholder)
    const metadata = { startTime: Date.now() };
    
    // Create annotators - they handle layer management and annotations
    inwardAnnotator = new VideoAnnotator(
        inwardVideo, 
        inwardStage, 
        metadata,
        ['Debug']
    );
    
    outwardAnnotator = new VideoAnnotator(
        outwardVideo, 
        outwardStage, 
        metadata,
        ['Debug']
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

// Global functions for testing
window.syncPlay = syncPlay;

// Initialize the video annotators, when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        initVideoAnnotators();
    }, 100);
});
