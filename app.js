// Initialize Lucide icons
lucide.createIcons();

const video = document.getElementById('webcam-video');
const canvas = document.getElementById('webcam-canvas');
const appContainer = document.getElementById('app');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const mainContent = document.getElementById('main-content');
const primaryEmoji = document.getElementById('primary-emoji');
const primaryText = document.getElementById('primary-text');
const metricsContainer = document.getElementById('metrics-container');
const errorText = document.getElementById('error-text');

let isModelLoaded = false;

// We load models directly from jsdelivr CDN since local env doesn't have internet to npm install
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

async function init() {
  try {
    console.log('Loading models...');
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    console.log('Models loaded successfully');
    isModelLoaded = true;
    startVideo();
  } catch (err) {
    console.error(err);
    showError('Failed to load AI models. Please check console for details.');
  }
}

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'user' } })
    .then((stream) => {
      video.srcObject = stream;
      loadingState.style.display = 'none';
      mainContent.style.display = 'flex';
      
      // Mirror the video
      video.style.transform = 'scaleX(-1)';
    })
    .catch((err) => {
      console.error(err);
      loadingState.style.display = 'none';
      showError('Camera access denied or unavailable.');
    });
}

function showError(msg) {
  errorText.innerText = msg;
  errorState.style.display = 'flex';
  loadingState.style.display = 'none';
  mainContent.style.display = 'none';
}

function getEmoji(emotion) {
  switch (emotion) {
    case 'happy': return '😄';
    case 'sad': return '😢';
    case 'angry': return '😠';
    case 'surprised': return '😲';
    case 'fearful': return '😨';
    case 'disgusted': return '🤢';
    default: return '😐';
  }
}

function updateTheme(emotion) {
  appContainer.className = `app-container theme-${emotion}`;
}

function renderMetrics(expressions) {
  // Sort expressions by value
  const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
  
  // Set primary
  const primary = sorted[0];
  const primaryEmotion = primary[0];
  primaryEmoji.innerText = getEmoji(primaryEmotion);
  primaryText.innerText = primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1);
  updateTheme(primaryEmotion);

  // Render top 4 metrics
  metricsContainer.innerHTML = '';
  sorted.slice(0, 4).forEach(([exp, val]) => {
    const percentage = Math.round(val * 100);
    const metricHtml = `
      <div class="metric-bar">
        <span class="metric-label">${exp}</span>
        <div class="progress-bg">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="metric-value">${percentage}%</span>
      </div>
    `;
    metricsContainer.insertAdjacentHTML('beforeend', metricHtml);
  });
}

video.addEventListener('play', () => {
  const displaySize = { width: video.clientWidth, height: video.clientHeight };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    if (video.paused || video.ended || !isModelLoaded) return;
    
    // Make sure we have proper dimensions
    const currentDisplaySize = { width: video.clientWidth, height: video.clientHeight };
    if (currentDisplaySize.width === 0) return;
    
    if (currentDisplaySize.width !== displaySize.width || currentDisplaySize.height !== displaySize.height) {
      displaySize.width = currentDisplaySize.width;
      displaySize.height = currentDisplaySize.height;
      faceapi.matchDimensions(canvas, displaySize);
    }

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        renderMetrics(detections[0].expressions);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        faceapi.draw.drawDetections(canvas, resizedDetections);
      } else {
        // Fallback to neutral if no face detected
        renderMetrics({ neutral: 1, happy: 0, sad: 0, angry: 0, surprised: 0, fearful: 0, disgusted: 0 });
      }
    } catch (e) {
      console.error("Detection error:", e);
    }
  }, 100);
});

// Handle window resize
window.addEventListener('resize', () => {
  if (video && canvas && video.clientWidth > 0) {
    const displaySize = { width: video.clientWidth, height: video.clientHeight };
    faceapi.matchDimensions(canvas, displaySize);
  }
});

init();

// Modal logic
const infoBtn = document.getElementById('info-btn');
const infoModal = document.getElementById('info-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

infoBtn.addEventListener('click', () => {
  infoModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
  infoModal.classList.remove('active');
});

// Close modal if clicking outside the content
infoModal.addEventListener('click', (e) => {
  if (e.target === infoModal) {
    infoModal.classList.remove('active');
  }
});
