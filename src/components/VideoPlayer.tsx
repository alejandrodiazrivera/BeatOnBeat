import Image from 'next/image';
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
  currentCue?: CuePoint | null;
  overlaysVisible?: boolean;
  isPlaying: boolean;
  playbackSpeed?: number;
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
const TimeOverlay = memo(({ currentTime }: { currentTime: number }) => {
  // Format time with milliseconds for precision
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

const CueOverlay = memo(({ cue }: { cue: CuePoint }) => (
  <div className="absolute bottom-4 left-0 right-0 mx-auto bg-black/20 text-white p-2 md:p-4 rounded max-w-[90%] text-center">
    <h3 className="font-bold text-sm md:text-lg">{cue.title}</h3>
    {cue.note && <p className="mt-1 italic text-xs md:text-sm">{cue.note}</p>}
  </div>
));

// Main Component
export default function VideoPlayer({
  videoId,
  currentTime,
  currentCue,
  overlaysVisible = true,
  isPlaying,
  playbackSpeed = 1,
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
  // Refs
  const playerRef = useRef<YTPlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingSeekRef = useRef<number | null>(null);
  
  // State
  const [playerReady, setPlayerReady] = useState(false);
  const [apiError, setApiError] = useState(false);
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

  // Cleanup YouTube player
  const cleanupPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        if (debug) console.error('Cleanup error:', error);
      }
      playerRef.current = null;
    }
    setPlayerReady(false);
  }, [debug]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setIsUploading(true);
      setTimeout(() => { // Simulate processing
        setVideoSrc(URL.createObjectURL(file));
        cleanupPlayer();
        setIsUploading(false);
        // Notify parent about uploaded file
        onVideoFileUploaded?.(file);
      }, 300);
    }
  }, [onVideoFileUploaded, cleanupPlayer]);

  // Initialize YouTube player
  const initializePlayer = useCallback(() => {
    if (!containerRef.current || !videoId) return;

    try {
      // Suppress YouTube API cross-origin warnings in development
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      
  const suppressYouTubeWarnings = (message: unknown, ...args: unknown[]) => {
        const messageStr = String(message);
        // Suppress common YouTube development warnings
        if ((messageStr.includes('postMessage') && messageStr.includes('youtube.com')) ||
            (messageStr.includes('target origin') && messageStr.includes('youtube.com')) ||
            (messageStr.includes('localhost') && messageStr.includes('youtube.com'))) {
          return; // Suppress YouTube cross-origin warnings in development
        }
        originalConsoleWarn(message, ...args);
      };
      
  const suppressYouTubeErrors = (message: unknown, ...args: unknown[]) => {
        const messageStr = String(message);
        // Suppress common YouTube development errors
        if ((messageStr.includes('postMessage') && messageStr.includes('youtube.com')) ||
            (messageStr.includes('target origin') && messageStr.includes('youtube.com')) ||
            (messageStr.includes('DOMWindow') && messageStr.includes('youtube.com'))) {
          return; // Suppress YouTube cross-origin errors in development
        }
        originalConsoleError(message, ...args);
      };
      
      // Temporarily override console methods
      console.warn = suppressYouTubeWarnings;
      console.error = suppressYouTubeErrors;
      
      // Add a small delay to ensure the container is ready
      setTimeout(() => {
        if (!containerRef.current) return;
        
        try {
          playerRef.current = new window.YT.Player(containerRef.current, {
            height: '100%',
            width: '100%',
            videoId,
            playerVars,
            events: {
              onReady: () => {
                // Restore original console methods
                console.warn = originalConsoleWarn;
                console.error = originalConsoleError;
                
                if (debug) console.log('YouTube player onReady called');
                
                // Multiple verification attempts for player readiness
                const verifyPlayer = (attempt = 1) => {
                  if (!playerRef.current) {
                    if (debug) console.warn('Player ref lost during verification');
                    return;
                  }
                  
                  if (typeof playerRef.current.playVideo === 'function' && 
                      typeof playerRef.current.getCurrentTime === 'function') {
                    setPlayerReady(true);
                    if (debug) console.log(`YouTube player ready and verified (attempt ${attempt})`);
                  } else {
                    if (attempt < 10) { // Try up to 10 times
                      if (debug) console.log(`Player methods not ready, attempt ${attempt}/10`);
                      setTimeout(() => verifyPlayer(attempt + 1), 100 * attempt); // Increasing delay
                    } else {
                      if (debug) console.error('YouTube player methods never became available after 10 attempts');
                      setApiError(true);
                    }
                  }
                };
                
                // Start verification immediately, then with delay
                verifyPlayer();
              },
            onStateChange: (event) => {
              if (debug) console.log('YouTube Player state:', event.data);
              
              // Sync YouTube player state with React state
              if (onPlayStateChange) {
                const isNowPlaying = event.data === window.YT.PlayerState.PLAYING;
                const isNowPaused = event.data === window.YT.PlayerState.PAUSED;
                const isEnded = event.data === window.YT.PlayerState.ENDED;
                
                if (debug) console.log('YouTube state change:', { 
                  isNowPlaying, 
                  isNowPaused, 
                  isEnded,
                  eventData: event.data 
                });
                
                // Only call state change if it's actually different
                if (isNowPlaying && !isPlaying) {
                  onPlayStateChange(true);
                } else if ((isNowPaused || isEnded) && isPlaying) {
                  onPlayStateChange(false);
                }
                
                // Handle video end event
                if (isEnded && onVideoEnded) {
                  if (debug) console.log('🎬 Video ended, calling onVideoEnded');
                  onVideoEnded();
                }
              }
            },
            onError: () => {
              // Restore original console methods in case of error
              console.warn = originalConsoleWarn;
              console.error = originalConsoleError;
              
              if (debug) console.error('YouTube player error');
              setApiError(true);
            }
          }
        });
        } catch (playerError) {
          // Restore original console methods in case of player creation error
          console.warn = originalConsoleWarn;
          console.error = originalConsoleError;
          
          if (debug) console.error('YT player creation error:', playerError);
          setApiError(true);
        }
      }, 100);
    } catch (error) {
      if (debug) console.error('YT init error:', error);
      setApiError(true);
    }
  }, [videoId, playerVars, debug, onPlayStateChange, onVideoEnded]);

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
    console.log('🎞️ VideoPlayer play/pause effect triggered:', {
      isPlaying,
      videoId,
      playerReady,
      hasPlayerRef: !!playerRef.current,
      hasVideoRef: !!videoRef.current
    });

    if (videoId) {
      if (!playerRef.current) {
        if (debug) console.log('⚠️ YouTube player ref not available yet');
        return;
      }
      
      // More aggressive safety check for YouTube player methods
      const attemptControl = (retries = 3) => {
        try {
          if (typeof playerRef.current?.playVideo === 'function' && 
              typeof playerRef.current?.pauseVideo === 'function') {
            if (debug) console.log(`🎞️ YouTube: ${isPlaying ? 'Playing' : 'Pausing'} video`);
            if (isPlaying) {
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } else if (retries > 0) {
            if (debug) console.warn(`YouTube player methods not available, retrying... (${retries} attempts left)`);
            setTimeout(() => attemptControl(retries - 1), 100);
          } else {
            if (debug) console.error('YouTube player methods unavailable after retries');
          }
        } catch (error) {
          if (debug) console.error('YouTube player control error:', error);
          if (retries > 0) {
            setTimeout(() => attemptControl(retries - 1), 100);
          } else {
            setApiError(true);
          }
        }
      };
      
      attemptControl();
    } else if (videoRef.current) {
      console.log(`🎞️ Local video: ${isPlaying ? 'Playing' : 'Pausing'} video`);
      if (isPlaying) {
        videoRef.current.play().catch(e => {
          if (debug) console.error('Play error:', e);
        });
      } else {
        videoRef.current.pause();
      }
    } else {
      console.log('⚠️ No video player available');
    }
  }, [isPlaying, playerReady, videoId, debug]);

  // Seek control
  useEffect(() => {
    pendingSeekRef.current = currentTime;

    if (videoId) {
      if (!playerRef.current) return;
      
      const attemptSeek = (retries = 3) => {
        try {
          if (typeof playerRef.current?.getCurrentTime === 'function' && 
              typeof playerRef.current?.seekTo === 'function') {
            const currentPlayerTime = playerRef.current.getCurrentTime();
            if (Math.abs(currentPlayerTime - currentTime) > 0.5) {
              if (debug) console.log(`🎯 Seeking YouTube video to ${currentTime}s`);
              playerRef.current.seekTo(currentTime, true);
            } else {
              pendingSeekRef.current = null;
            }
          } else if (retries > 0) {
            if (debug && retries === 3) console.log('YouTube seek methods not available, retrying...');
            setTimeout(() => attemptSeek(retries - 1), 50);
          }
        } catch (error) {
          if (debug) console.error('YouTube player seek error:', error);
          if (retries > 0) {
            setTimeout(() => attemptSeek(retries - 1), 50);
          }
        }
      };
      
      attemptSeek();
    } else if (videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
        videoRef.current.currentTime = currentTime;
      } else {
        pendingSeekRef.current = null;
      }
    }
  }, [currentTime, playerReady, videoId, debug]);

  // Playback speed
  useEffect(() => {
    if (videoId) {
      if (!playerReady || !playerRef.current) return;
      
      try {
        if (typeof playerRef.current.setPlaybackRate === 'function') {
          playerRef.current.setPlaybackRate(playbackSpeed);
        } else {
          if (debug) console.warn('YouTube player setPlaybackRate method not available yet');
        }
      } catch (error) {
        if (debug) console.error('YouTube player playback speed error:', error);
      }
    } else if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, playerReady, videoId, debug]);

  // Time update sync - handles both YouTube and local videos
  useEffect(() => {
    if (!onTimeUpdate) return;
    
    const syncTime = () => {
      try {
        let time = 0;
        let hasValidSource = false;
        
        if (videoId && playerRef.current) {
          // YouTube video - get time from YouTube Player API
          // Check if player is ready and has the required method
          if (playerReady && typeof playerRef.current.getCurrentTime === 'function') {
            time = playerRef.current.getCurrentTime();
            hasValidSource = true;
            if (debug) console.log('🎞️ YouTube time:', time);
          } else {
            // Player might not be ready yet, but still try to get time
            try {
              if (typeof playerRef.current.getCurrentTime === 'function') {
                time = playerRef.current.getCurrentTime();
                hasValidSource = true;
                if (debug) console.log('🎞️ YouTube time (player not marked ready):', time);
              }
            } catch (e) {
              // Silently ignore - player not ready yet
              if (debug) console.log('🎞️ YouTube player not ready for time sync');
            }
          }
        } else if (videoRef.current && !videoRef.current.paused) {
          // Local video - get time from HTML video element (only if not paused)
          time = videoRef.current.currentTime;
          hasValidSource = true;
          if (debug) console.log('🎞️ Local video time:', time);
        } else if (videoRef.current) {
          // Even if paused, still sync the time
          time = videoRef.current.currentTime;
          hasValidSource = true;
          if (debug) console.log('🎞️ Local video time (paused):', time);
        }

        if (
          pendingSeekRef.current !== null &&
          hasValidSource &&
          Math.abs(time - pendingSeekRef.current) > 0.5
        ) {
          return;
        }

        if (pendingSeekRef.current !== null) {
          pendingSeekRef.current = null;
        }
        
        // Update time if we have a valid source
        if (hasValidSource) {
          onTimeUpdate(time);
        }
      } catch (error) {
        if (debug) console.error('Time sync error:', error);
      }
    };

    // Sync time immediately
    syncTime();
    
    // Use consistent interval for both video types
    const updateInterval = 100; // 100ms for smoother updates
    const interval = setInterval(syncTime, updateInterval);
    return () => clearInterval(interval);
  }, [onTimeUpdate, videoId, debug, playerReady, videoSrc]);

  // Cleanup local video URL
  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [videoSrc]);

  // Keep YouTube and local video sources mutually exclusive.
  useEffect(() => {
    if (videoId && videoSrc) {
      URL.revokeObjectURL(videoSrc);
      setVideoSrc(null);
    }
  }, [videoId, videoSrc]);

  // Render
  return (
    <div 
      className={`relative w-full bg-black rounded-xl shadow-lg border-2 border-Borders ${fullHeight ? 'h-screen' : ''}`}
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
                  <p className="text-gray-300 font-medium">Drag &amp; drop a video file or click to browse</p>
                  <p className="text-gray-500 text-sm mt-1">Supports MP4, WebM, MOV</p>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {/* YouTube Player */}
      {videoId && !videoSrc && (
        <div 
          ref={containerRef} 
          className="absolute inset-0"
        >
          {!playerReady && (
            <Image
              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
              alt="Video thumbnail"
              fill
              className="absolute inset-0 w-full h-full object-cover opacity-50"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
              priority
            />
          )}
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
          {currentCue && <CueOverlay cue={currentCue} />}
        </div>
      )}
    </div>
  );
}

// Display names for React DevTools
TimeOverlay.displayName = 'TimeOverlay';
CueOverlay.displayName = 'CueOverlay';