import { useEffect, useRef, useState, memo, useCallback } from 'react';

// Types
interface VideoPlayerProps {
  currentTime: number;
  currentBeat: number;
  currentCue?: CuePoint | null;
  overlaysVisible?: boolean;
  isMetronomeRunning?: boolean;
  isPlaying: boolean;
  playbackSpeed?: number;
  videoFile?: File | null;
  onTimeUpdate?: (time: number) => void;
  onVideoElementReady?: (videoElement: HTMLVideoElement) => void;
  onVideoFileUploaded?: (file: File) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onVideoEnded?: () => void;
  debug?: boolean;
  aspectRatio?: number;
  fullHeight?: boolean;
  allowUploads?: boolean;
}

interface CuePoint {
  time: string;
  title: string;
  note?: string;
}

// Overlay Components (memoized)
const TimeOverlay = memo(({ currentTime }: { currentTime: number }) => {
  const formatTimeDisplay = (time: number) => {
    const totalMs = Math.floor(time * 1000);
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const milliseconds = totalMs % 1000;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    }
  };
  return (
    <div className="absolute top-2 left-2 bg-black/70 text-white p-1 md:p-2 rounded text-xs md:text-base font-mono">
      {formatTimeDisplay(currentTime)}
    </div>
  );
});

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
  <div className="absolute bottom-4 left-0 right-0 mx-auto bg-black/20 text-white p-2 md:p-4 rounded max-w-[90%] text-center">
    <h3 className="font-bold text-sm md:text-lg">{cue.title}</h3>
    {cue.note && <p className="mt-1 italic text-xs md:text-sm">{cue.note}</p>}
  </div>
));

// Main Component
export default function VideoPlayer({
  currentTime,
  currentBeat = 1,
  currentCue,
  overlaysVisible = true,
  isMetronomeRunning = false,
  isPlaying,
  playbackSpeed = 1,
  videoFile,
  onTimeUpdate,
  onVideoElementReady,
  onVideoFileUploaded,
  onPlayStateChange,
  onVideoEnded,
  debug = false,
  aspectRatio = 16/9,
  fullHeight = false,
  allowUploads = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Handle external video file prop (from upload button)
  useEffect(() => {
    if (videoFile && videoFile.type.startsWith('video/')) {
      setIsUploading(true);
      setTimeout(() => {
        setVideoSrc(URL.createObjectURL(videoFile));
        setIsUploading(false);
      }, 300);
    }
  }, [videoFile]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setIsUploading(true);
      setTimeout(() => {
        setVideoSrc(URL.createObjectURL(file));
        setIsUploading(false);
        onVideoFileUploaded?.(file);
      }, 300);
    }
  }, [onVideoFileUploaded]);

  // Play/pause control
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => {
          if (debug) console.error('Play error:', e);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, debug]);

  // Seek control
  useEffect(() => {
    if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime, debug]);

  // Playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, debug]);

  // Time update sync
  useEffect(() => {
    if (!onTimeUpdate) return;
    const syncTime = () => {
      try {
        const time = videoRef.current?.currentTime || 0;
        onTimeUpdate(time);
      } catch (error) {
        if (debug) console.error('Time sync error:', error);
      }
    };
    const interval = setInterval(syncTime, 200);
    return () => clearInterval(interval);
  }, [onTimeUpdate, debug]);

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
      {allowUploads && !videoSrc && (
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

      {/* Local Video Player */}
      {videoSrc && (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el) {
              onVideoElementReady?.(el);
            }
          }}
          src={videoSrc}
          className="absolute inset-0 w-full h-full object-contain bg-black cursor-pointer"
          playsInline
          muted={!userInteracted}
          onLoadedData={() => {
            if (videoRef.current) {
              onVideoElementReady?.(videoRef.current);
            }
          }}
          onPlay={() => setUserInteracted(true)}
          onEnded={() => {
            if (debug) console.log('🎬 Local video ended, calling onVideoEnded');
            onVideoEnded?.();
          }}
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
          
        </div>
      )}

      {/* Error State */}
      {/* You can keep or remove this block as needed */}
      {/* Overlays */}
      {overlaysVisible && videoSrc && (
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