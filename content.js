console.log('Content script is running');

// Function to handle newly detected video elements
function handleNewVideo(video) {

  const parentFigure = video.closest('figure'); // funny name lol, but it is a <figure> element so it makes sense

  // get the sibling div element
  const siblingDivControls = parentFigure.nextElementSibling;


  // get the second div that is inside the siblingDivControls
  const videoControls = siblingDivControls.querySelector('div');

  // find the element with [arial-label="Unmute"]
  const muteButton = videoControls.querySelector('[aria-label="Unmute"]');

  // Try to find the element with the id="bsky-volume-slider" inside of the videoControls div
  if (videoControls.querySelector('#bsky-volume-slider')) {
    return;
  }

  // Create the volume slider element
  const volumeSlider = document.createElement('div');
  volumeSlider.id = 'bsky-volume-slider';
  volumeSlider.style.cssText = 'width: 5em; height: 1em; display: flex; align-items: center;';

  // Create the volume slider range element
  const volumeSliderRange = document.createElement('input');
  volumeSliderRange.type = 'range';
  volumeSliderRange.min = 0;
  volumeSliderRange.max = 100;
  volumeSliderRange.value = 50;
  volumeSliderRange.style.cssText = 'width: 100%;';

  // Add the onchange event listener to the volumeSliderRange
  volumeSliderRange.addEventListener('change', function () {
    const volume = volumeSliderRange.value;
    console.log('Volume changed to:', volume);
    // Update the volume of the video
    video.volume = volume / 100;
  });

  // Add the volumeSliderRange to the volumeSlider
  volumeSlider.appendChild(volumeSliderRange);

  // Add as sibling to the muteButton
  muteButton.parentNode.insertBefore(volumeSlider, muteButton);
}

// Function to check for any existing video elements
function detectExistingVideos() {
  const videos = document.querySelectorAll('video');
  if (videos.length > 0) {
    console.log('Existing videos detected:', videos);
    videos.forEach(handleNewVideo);
  } else {
    console.log('No videos detected yet');
  }
}

// Initial check for videos that may have already loaded
detectExistingVideos();

// Create a MutationObserver to detect newly added video elements
const observer = new MutationObserver((mutationsList) => {
  mutationsList.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        // Check if the added node is a video or contains videos
        if (node.tagName === 'VIDEO') {
          console.log('Video element added:', node);
          handleNewVideo(node);
        } else if (node.querySelectorAll) {
          const nestedVideos = node.querySelectorAll('video');
          nestedVideos.forEach((video) => {
            console.log('Nested video element added:', video);
            handleNewVideo(video);
          });
        }
      });
    }
  });
});

// Start observing the document's body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true // Observe the entire DOM subtree for changes
});
