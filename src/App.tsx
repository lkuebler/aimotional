import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, RefreshCcw, Info, X } from 'lucide-react';
// @ts-ignore
import LetterGlitch from './components/LetterGlitch';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [emotion, setEmotion] = useState('neutral');
  const [expressions, setExpressions] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        setError('Failed to load AI models.');
        console.error(err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (isModelLoaded) {
      startVideo();
    }
  }, [isModelLoaded]);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        setError('Camera access denied or unavailable.');
        console.error(err);
      });
  };

  const handleVideoOnPlay = () => {
    const displaySize = { width: videoRef.current!.clientWidth, height: videoRef.current!.clientHeight };
    faceapi.matchDimensions(canvasRef.current!, displaySize);

    setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.paused || videoRef.current.ended) return;
      
      const currentDisplaySize = { width: videoRef.current.clientWidth, height: videoRef.current.clientHeight };
      if (currentDisplaySize.width === 0) return;
      
      if (currentDisplaySize.width !== displaySize.width || currentDisplaySize.height !== displaySize.height) {
        displaySize.width = currentDisplaySize.width;
        displaySize.height = currentDisplaySize.height;
        faceapi.matchDimensions(canvasRef.current, displaySize);
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (detections.length > 0) {
          const largestFace = detections.reduce((prev, current) => {
            const prevArea = prev.detection.box.width * prev.detection.box.height;
            const currentArea = current.detection.box.width * current.detection.box.height;
            return currentArea > prevArea ? current : prev;
          });

          const sortedExpressions = Object.entries(largestFace.expressions).sort(
            (a, b) => b[1] - a[1]
          );
          setEmotion(sortedExpressions[0][0]);
          setExpressions(largestFace.expressions as unknown as Record<string, number>);

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        } else {
          setEmotion('neutral');
          setExpressions({});
        }
      } catch (e) {
        console.error(e);
      }
    }, 100);
  };

  const getEmoji = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😄';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😲';
      case 'fearful': return '😨';
      case 'disgusted': return '🤢';
      default: return '😐';
    }
  };

  const emotionColors: Record<string, string[]> = {
    happy: ["#ff9a9e", "#fecfef", "#ffffff", "#ff6b6b"],
    sad: ["#2c3e50", "#3498db", "#ffffff", "#2980b9"],
    angry: ["#cb2d3e", "#ef473a", "#ffffff", "#c0392b"],
    surprised: ["#fceabb", "#f8b500", "#ffffff", "#e67e22"],
    fearful: ["#141e30", "#243b55", "#ffffff", "#8e44ad"],
    disgusted: ["#11998e", "#38ef7d", "#ffffff", "#16a085"],
    neutral: ["#5227FF", "#F43F5E", "#ffffff", "#7C3AED"], // User's requested default colors
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 lg:p-8 overflow-hidden text-white font-['Outfit']">
      
      {/* Background Glitch Layer */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchColors={emotionColors[emotion] || emotionColors.neutral}
          glitchSpeed={30}
          centerVignette
          outerVignette
          smooth
        />
      </div>

      {/* Glassmorphism Panel */}
      <div className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 lg:p-8 shadow-2xl transition-all duration-500">
        
        <header className="flex justify-between items-center pb-6 mb-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Camera size={28} />
            <h1 className="text-2xl font-semibold tracking-wide">Emotion Analysis</h1>
          </div>
          <button 
            onClick={() => setShowInfo(true)}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all"
          >
            <Info size={20} />
          </button>
        </header>

        {error ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-5 text-center">
            <RefreshCcw size={48} className="animate-spin duration-2000" />
            <p>{error}</p>
          </div>
        ) : !isModelLoaded ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-5 text-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
            <p className="text-lg">Loading AI Models...</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black shadow-lg flex items-center justify-center min-h-[300px]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-auto max-h-[500px] object-cover scale-x-[-1]"
                onPlay={handleVideoOnPlay}
              />
              <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1]" 
              />
            </div>

            <div className="flex-none w-full md:w-72 flex flex-col gap-6">
              <div className="text-center bg-black/10 rounded-2xl p-6 border border-white/20 transition-all duration-300">
                <span className="text-6xl block mb-3 animate-bounce">{getEmoji(emotion)}</span>
                <h2 className="text-3xl font-extrabold tracking-wide capitalize">{emotion}</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                {Object.entries(expressions)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([exp, val]) => (
                    <div key={exp} className="flex items-center gap-3">
                      <span className="w-20 text-sm font-semibold capitalize">{exp}</span>
                      <div className="flex-1 h-2 bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white/80 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round(val * 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold">{Math.round(val * 100)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e2f]/90 border border-white/20 backdrop-blur-xl rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <h2 className="text-2xl font-bold">About the AI Models</h2>
              <button onClick={() => setShowInfo(false)} className="hover:scale-110 transition-transform">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4 text-gray-200">
              <p className="leading-relaxed">
                This application uses on-device machine learning to analyze your facial expressions in real-time. No data is ever sent to a server—everything happens directly in your browser!
              </p>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Powered by <a href="https://github.com/vladmandic/face-api" target="_blank" rel="noreferrer" className="underline">face-api.js</a></h3>
                <ul className="space-y-2 pl-2">
                  <li className="relative pl-5 before:content-['→'] before:absolute before:left-0 before:text-white/60">
                    <strong>TinyFaceDetector:</strong> A highly performant, lightweight model for real-time face detection.
                  </li>
                  <li className="relative pl-5 before:content-['→'] before:absolute before:left-0 before:text-white/60">
                    <strong>FaceExpressionNet:</strong> A neural network trained to recognize 7 basic emotional expressions.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
