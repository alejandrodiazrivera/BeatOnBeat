import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { CuePoint } from '../types/types';

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  destroy: () => void;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  videoId: string | null;
  currentTime: number;
  currentBeat: number;
  currentCue: CuePoint | null;
  overlaysVisible: boolean;
  isMetronomeRunning: boolean;
  isPlaying: boolean;
  debug?: boolean;
  aspectRatio?: number;
  fullHeight?: boolean;
}

declare global {
  interface Window {
    YT: {
      Player: new (element: string | HTMLElement, options: any) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

const TimeOverlay = memo(({ currentTime }: { currentTime: number }) => (
  <div className="absolute top-2 left-2 bg-black/70 text-white p-1 md:p-2 rounded text-xs md:text-base">
    {new Date(currentTime * 1000).toISOString().substr(11, 8)}
  </div>
));

interface BeatOverlayProps {
  currentBeat: number;
  isMetronomeRunning: boolean;
}

const BeatOverlay = memo(({ currentBeat, isMetronomeRunning }: BeatOverlayProps) => {
  // Beat color logic
  const getBeatColor = (beat: number) => {
    if (!isMetronomeRunning) return 'bg-gray-400';
    const normalizedBeat = ((beat - 1) % 8) + 1; // Assuming 8-beat pattern
    if (beat === normalizedBeat) {
      return (beat === 1 || beat === 5) ? 'bg-purple-600' : 'bg-red-600';
    }
    return 'bg-gray-400';
  };

  return (
    <div className={`
      absolute top-2 right-2 
      flex items-center justify-center 
      w-6 h-6 md:w-8 md:h-8 
      rounded-full 
      text-white font-bold text-xs md:text-sm
      ${getBeatColor(currentBeat)}
      ${isMetronomeRunning ? 'animate-pulse' : ''}
      transition-colors duration-100
    `}>
      {currentBeat}
    </div>
  );
});

const CueOverlay = memo(({ cue }: { cue: CuePoint }) => (
  <div className="absolute bottom-4 left-0 right-0 mx-auto bg-black/70 text-white p-2 md:p-4 rounded max-w-[90%] md:max-w-md text-center">
    <h3 className="font-bold text-sm md:text-lg">{cue.title}</h3>
    <p className="text-xs md:text-base">{cue.time}</p>
    {cue.note && <p className="mt-1 md:mt-2 italic text-xs md:text-sm">{cue.note}</p>}
  </div>
));

export default function VideoPlayer({
  videoId,
  currentTime,
  currentBeat,
  currentCue,
  overlaysVisible,
  isMetronomeRunning,
  isPlaying,
  debug = false,
  aspectRatio = 0.5625,
  fullHeight = false
}: VideoPlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  const playerVars = useMemo(() => ({
    autoplay: isPlaying ? 1 : 0,
    controls: 0,
    disablekb: 1,
    rel: 0,
    modestbranding: 1
  }), [isPlaying]);

  // Load YouTube API
  useEffect(() => {
    if (!videoId) return;

    if (window.YT) {
      initializePlayer();
      return;
    }

    const timeout = setTimeout(() => {
      if (!window.YT) setApiError(true);
    }, 5000);

    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    tag.id = 'youtube-iframe-script';
    tag.async = true;

    window.onYouTubeIframeAPIReady = initializePlayer;

    document.body.appendChild(tag);

    return () => {
      cleanupPlayer();
      clearTimeout(timeout);
      document.getElementById('youtube-iframe-script')?.remove();
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId]);

  const initializePlayer = () => {
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
            if (debug) console.log('Player ready');
          },
          onStateChange: (event: { data: number }) => {
            if (debug) console.log('Player state:', event.data);
          },
          onError: () => setApiError(true)
        }
      });
    } catch (error) {
      if (debug) console.error('Player initialization failed:', error);
      setApiError(true);
    }
  };

  const cleanupPlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        if (debug) console.error('Player cleanup failed:', error);
      }
      playerRef.current = null;
    }
    setPlayerReady(false);
  };

  // Handle play/pause with debouncing
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    const handler = setTimeout(() => {
      try {
        isPlaying ? playerRef.current?.playVideo() : playerRef.current?.pauseVideo();
      } catch (error) {
        if (debug) console.error('Playback error:', error);
      }
    }, 100);

    return () => clearTimeout(handler);
  }, [isPlaying, playerReady]);

  // Handle seeking with threshold
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;

    try {
      const playerTime = playerRef.current.getCurrentTime();
      if (Math.abs(playerTime - currentTime) > 0.5) {
        playerRef.current.seekTo(currentTime, true);
        if (debug) console.log('Seeking to:', currentTime);
      }
    } catch (error) {
      if (debug) console.error('Seek error:', error);
    }
  }, [currentTime, playerReady]);

  if (apiError) {
    return (
      <div className="aspect-video bg-gray-800 flex items-center justify-center text-white p-4 text-center">
        <div>
          <h3 className="font-bold mb-2">YouTube Player Failed to Load</h3>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full bg-gray-900 ${fullHeight ? 'h-screen' : ''}`}
      style={!fullHeight ? { paddingBottom: `${aspectRatio * 100}%` } : undefined}
      role="region" 
      aria-label="Video player"
    >
      {/* Player container */}
      <div 
        ref={containerRef} 
        className="absolute top-0 left-0 w-full h-full"
        aria-live="polite"
        aria-atomic="true"
      >
        {!playerReady && videoId && (
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            loading="lazy"
            onError={() => setThumbnailError(true)}
          />
        )}
      </div>

      {/* Loading indicator */}
      {!playerReady && !apiError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Overlays */}
      {overlaysVisible && playerReady && (
        <div className="absolute inset-0 pointer-events-none">
          <TimeOverlay currentTime={currentTime} />
          {isMetronomeRunning && (
            <BeatOverlay 
              currentBeat={currentBeat} 
              isMetronomeRunning={isMetronomeRunning} 
            />
          )}
          {currentCue && <CueOverlay cue={currentCue} />}
        </div>
      )}
    </div>
  );
}