import { useEffect, useRef, useState, useMemo, memo, useCallback } from 'react';

// Types
interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setPlaybackRate: (suggestedRate: number) => void;
  destroy: () => void;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  videoId?: string | null;
  currentTime: number;
  currentBeat: number;
  currentCue?: CuePoint | null;
  overlaysVisible?: boolean;
  isMetronomeRunning?: boolean;
  isPlaying: boolean;
  playbackSpeed?: number;
  onTimeUpdate?: (time: number) => void;
  debug?: boolean;
  aspectRatio?: number;
  fullHeight?: boolean;
  allowUploads?: boolean;
}

interface CuePoint {
  title: string;
  time: string;
  note?: string;
}

declare global {
  interface Window {
    YT: {
      Player: new (element: string | HTMLElement, options: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

interface YTPlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars: Record<string, number>;
  events: {
    onReady: () => void;
    onStateChange: (event: { data: number }) => void;
    onError: () => void;
  };
}

// Overlay Components (memoized)
const TimeOverlay = memo(({ currentTime }: { currentTime: number }) => (
  <div className="absolute top-2 left-2 bg-black/70 text-white p-1 md:p-2 rounded text-xs md:text-base">
    {new Date(currentTime * 1000).toISOString().substr(11, 8)}
  </div>
));

const BeatOverlay = memo(({ currentBeat, isMetronomeRunning }: { 
  currentBeat: number; 
  isMetronomeRunning?: boolean 
}) => (
  <div className={`
    absolute top-2 right-2 flex items-center justify-center
    w-6 h-6 md:w-8 md:h-8 rounded-full text-white font-bold text-xs md:text-sm
    ${isMetronomeRunning ? 'animate-pulse bg-red-600' : 'bg-gray-400'}
  `}>
    {currentBeat}
  </div>
));

const CueOverlay = memo(({ cue }: { cue: CuePoint }) => (
  <div className="absolute bottom-4 left-0 right-0 mx-auto bg-black/70 text-white p-2 md:p-4 rounded max-w-[90%] text-center">
    <h3 className="font-bold text-sm md:text-lg">{cue.title}</h3>
    <p className="text-xs md:text-base">{cue.time}</p>
    {cue.note && <p className="mt-1 italic text-xs md:text-sm">{cue.note}</p>}
  </div>
));

// Main Component
export default function VideoPlayer({
  videoId,
  currentTime,
  currentBeat = 1,
  currentCue,
  overlaysVisible = true,
  isMetronomeRunning = false,
  isPlaying,
  playbackSpeed = 1,
  onTimeUpdate,
  debug = false,
  aspectRatio = 16/9,
  fullHeight = false,
  allowUploads = true
}: VideoPlayerProps) {
  // Refs
  const playerRef = useRef<YTPlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [playerReady, setPlayerReady] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Memoized player vars
  const playerVars = useMemo(() => ({
    autoplay: isPlaying ? 1 : 0,
    controls: 0,
    disablekb: 1,
    rel: 0,
    modestbranding: 1
  }), [isPlaying]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setIsUploading(true);
      setTimeout(() => { // Simulate processing
        setVideoFile(file);
        setVideoSrc(URL.createObjectURL(file));
        cleanupPlayer();
        setIsUploading(false);
      }, 300);
    }
  }, []);

  // Cleanup YouTube player
  const cleanupPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        debug && console.error('Cleanup error:', error);
      }
      playerRef.current = null;
    }
    setPlayerReady(false);
  }, [debug]);

  // Initialize YouTube player
  const initializePlayer = useCallback(() => {
    if (!containerRef.current || !videoId) return;

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars,
        events: {
          onReady: () => {
            setPlayerReady(true);
            debug && console.log('YouTube player ready');
          },
          onStateChange: (event) => debug && console.log('Player state:', event.data),
          onError: () => setApiError(true)
        }
      });
    } catch (error) {
      debug && console.error('YT init error:', error);
      setApiError(true);
    }
  }, [videoId, playerVars, debug]);

  // Load YouTube API
  useEffect(() => {
    if (!videoId) return;

    if (window.YT) {
      initializePlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.id = 'youtube-iframe-script';

    window.onYouTubeIframeAPIReady = initializePlayer;
    document.body.appendChild(tag);

    return () => {
      cleanupPlayer();
      document.getElementById('youtube-iframe-script')?.remove();
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId, initializePlayer, cleanupPlayer]);

  // Play/pause control
  useEffect(() => {
    if (videoId) {
      if (!playerReady || !playerRef.current) return;
      isPlaying ? playerRef.current.playVideo() : playerRef.current.pauseVideo();
    } else if (videoRef.current) {
      isPlaying 
        ? videoRef.current.play().catch(e => debug && console.error('Play error:', e))
        : videoRef.current.pause();
    }
  }, [isPlaying, playerReady, videoId, debug]);

  // Seek control
  useEffect(() => {
    if (videoId) {
      if (!playerReady || !playerRef.current) return;
      if (Math.abs(playerRef.current.getCurrentTime() - currentTime) > 0.5) {
        playerRef.current.seekTo(currentTime, true);
      }
    } else if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime, playerReady, videoId]);

  // Playback speed
  useEffect(() => {
    if (videoId) {
      if (!playerReady || !playerRef.current) return;
      playerRef.current.setPlaybackRate(playbackSpeed);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, playerReady, videoId]);

  // Time update sync
  useEffect(() => {
    if (!onTimeUpdate) return;
    
    const syncTime = () => {
      const time = videoId 
        ? playerRef.current?.getCurrentTime() || 0
        : videoRef.current?.currentTime || 0;
      onTimeUpdate(time);
    };

    const interval = setInterval(syncTime, 200);
    return () => clearInterval(interval);
  }, [onTimeUpdate, videoId]);

  // Cleanup local video URL
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  // Render
  return (
    <div 
      className={`relative w-full bg-black ${fullHeight ? 'h-screen' : ''}`}
      style={!fullHeight ? { paddingBottom: `${100/aspectRatio}%` } : {}}
    >
      {/* Upload Area (when no video loaded) */}
      {allowUploads && !videoId && !videoSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
          <label className={`
            flex flex-col items-center justify-center 
            w-full h-full border-2 border-dashed rounded-lg 
            hover:bg-gray-900/50 transition-colors cursor-pointer
            ${isUploading ? 'border-blue-500' : 'border-gray-600'}
          `}>
            <input 
              type="file" 
              accept="video/*" 
              onChange={handleFileUpload}
              className="hidden" 
              disabled={isUploading}
            />
            <div className="text-center p-6">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-blue-400">Processing video...</p>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-300 font-medium">Drag & drop a video file or click to browse</p>
                  <p className="text-gray-500 text-sm mt-1">Supports MP4, WebM, MOV</p>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {/* YouTube Player */}
      {videoId && (
        <div 
          ref={containerRef} 
          className="absolute inset-0"
        >
          {!playerReady && (
            <img
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
        </div>
      )}
      
      {/* Local Video Player */}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-contain bg-black cursor-pointer"
          playsInline
          muted={!userInteracted}
          onPlay={() => setUserInteracted(true)}
          onClick={() => {
            setUserInteracted(true);
            if (videoRef.current) {
              videoRef.current.muted = false;
            }
          }}
          controls={userInteracted}
        />
      )}

      {/* Unmute indicator for local videos */}
      {videoSrc && !userInteracted && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span className="text-sm">Click to enable sound</span>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {videoId && !playerReady && !apiError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error State */}
      {apiError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 text-white p-4">
          <div className="text-center">
            <h3 className="font-bold mb-2">Player Error</h3>
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200"
            >
              Reload Player
            </button>
          </div>
        </div>
      )}

      {/* Overlays */}
      {overlaysVisible && (playerReady || videoSrc) && (
        <div className="absolute inset-0 pointer-events-none">
          <TimeOverlay currentTime={currentTime} />
          {isMetronomeRunning && (
            <BeatOverlay currentBeat={currentBeat} isMetronomeRunning={isMetronomeRunning} />
          )}
          {currentCue && <CueOverlay cue={currentCue} />}
        </div>
      )}
    </div>
  );
}

// Display names for React DevTools
TimeOverlay.displayName = 'TimeOverlay';
BeatOverlay.displayName = 'BeatOverlay';
CueOverlay.displayName = 'CueOverlay';