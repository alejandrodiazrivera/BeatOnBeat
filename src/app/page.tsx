'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CuePoint } from '../types/types';
import { useMetronome } from '../hooks/useMetronome';

// Utility functions for precise time handling
const formatTimeWithMilliseconds = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
  
  if (milliseconds === 0) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
};

const parseTimeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  const minutes = parseInt(parts[0]);
  let secondsPart = parts[1];
  
  // Handle milliseconds if present (e.g., "45.500" or "45")
  const seconds = parseFloat(secondsPart);
  
  return minutes * 60 + seconds;
};
import VideoPlayer from '../components/VideoPlayer';
import VideoControls from '../components/VideoControls';
import MetronomeControls from '../components/MetronomeControls';
import CueForm from '../components/CueForm';
import CueList from '../components/CueList';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [currentCue, setCurrentCue] = useState<CuePoint | null>(null);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [editingCue, setEditingCue] = useState<CuePoint | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wasMetronomeRunning, setWasMetronomeRunning] = useState(false);
  const [wasVideoPlaying, setWasVideoPlaying] = useState(false);
  const [pausedBeat, setPausedBeat] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Refs for accessing video elements
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  
  const {
    bpm,
    currentBeat,
    isRunning: isMetronomeRunning,
    timeMode,
    isMuted,
    start: startMetronome,
    stop: stopMetronome,
    adjustBpm,
    setBpm,
    setCurrentBeat,
    setTimeMode,
    tapTempo,
    toggleMute,
    getTimeModeConfig
  } = useMetronome();

  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const extractVideoId = (url: string): string | null => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }
    return null;
  };

  const loadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
      startTimeTracking(true); // Reset time when loading new video
    } else {
      alert('Please enter a valid YouTube URL');
    }
  };

  const startTimeTracking = (resetTime = false) => {
    stopTimeTracking();
    if (resetTime) {
      setCurrentTime(0);
    }
    // Use higher precision interval for better millisecond accuracy
    const interval = 100; // Update every 100ms for better precision
    timeUpdateIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + (interval / 1000) * playbackSpeed;
        // Round to 3 decimal places for millisecond precision
        return Math.round(newTime * 1000) / 1000;
      });
    }, interval);
  };

  const stopTimeTracking = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  const checkActiveCue = useCallback((time: number) => {
    let activeCue = null;
    let minDiff = Infinity;
    
    cuePoints.forEach(cue => {
      const cueTime = parseTimeToSeconds(cue.time);
      const diff = Math.abs(time - cueTime);
      
      if (diff < 0.1 && diff < minDiff) { // Reduced tolerance to 0.1 seconds for better precision
        activeCue = cue;
        minDiff = diff;
      }
    });
    
    setCurrentCue(activeCue);
  }, [cuePoints]);

  useEffect(() => {
    checkActiveCue(currentTime);
  }, [currentTime, cuePoints, checkActiveCue]);

  const handleAddCue = () => {
    console.log('🎯 handleAddCue called - Current states:', {
      isPlaying,
      isMetronomeRunning,
      currentTime,
      currentBeat
    });

    // Track current states before pausing
    setWasVideoPlaying(isPlaying);
    setWasMetronomeRunning(isMetronomeRunning);
    setPausedBeat(currentBeat);

    // Pause both video and metronome when adding a cue - use proper handlers
    if (isPlaying) {
      console.log('🎬 Video is playing, pausing for cue add');
      handlePause(); // Use the existing handlePause function for proper state management
    } else if (isMetronomeRunning) {
      // If video is already paused but metronome is running, stop just the metronome
      console.log('🥁 Metronome is running, stopping it');
      stopMetronome();
    } else {
      console.log('🎬 Video and metronome are already stopped');
    }

    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
    const milliseconds = Math.floor((currentTime % 1) * 1000);
    
    // Include milliseconds for precision if not zero
    const time = milliseconds === 0 
      ? `${minutes}:${seconds}`
      : `${minutes}:${seconds}.${milliseconds.toString().padStart(3, '0')}`;
    
    // For new cues, set editingCue to a template object WITHOUT an id
    setEditingCue({
      id: '', // Empty id indicates this is a new cue template
      time,
      title: '',
      note: '',
      beat: isMetronomeRunning ? currentBeat : undefined
    });
  };

  const handleSubmitCue = (cue: Omit<CuePoint, 'id'>) => {
    console.log('handleSubmitCue called with:', cue);
    console.log('editingCue:', editingCue);
    
    if (editingCue && editingCue.id !== '') {
      console.log('Editing existing cue');
      setCuePoints(prev => 
        prev.map(c => 
          c.id === editingCue.id ? { ...cue, id: editingCue.id } : c
        )
      );
    } else {
      console.log('Adding new cue');
      const newCue = { ...cue, id: Date.now().toString() };
      console.log('New cue object:', newCue);
      setCuePoints(prev => {
        const updated = [...prev, newCue];
        console.log('Updated cuePoints:', updated);
        return updated;
      });
    }
    setEditingCue(null);
    
    // Store the previous states before resetting them
    const shouldResumeVideo = wasVideoPlaying;
    const shouldResumeMetronome = wasMetronomeRunning;
    const beatToResume = pausedBeat;
    
    // Reset tracking states first
    setWasVideoPlaying(false);
    setWasMetronomeRunning(false);
    
    // Resume playback if it was playing before - use the proper handlers
    if (shouldResumeMetronome) {
      setCurrentBeat(beatToResume);
      startMetronome();
    }
    if (shouldResumeVideo) {
      console.log('🎬 Resuming video playback after cue save');
      handlePlay(); // Use the existing handlePlay function for proper state management
    }
  };

  const handleEditCue = (cue: CuePoint) => {
    // Track current states before pausing
    setWasVideoPlaying(isPlaying);
    setWasMetronomeRunning(isMetronomeRunning);
    setPausedBeat(currentBeat);

    // Pause both video and metronome when editing a cue - use proper handlers
    if (isPlaying) {
      console.log('🎬 Pausing video for cue edit');
      handlePause(); // Use the existing handlePause function for proper state management
    } else if (isMetronomeRunning) {
      // If video is already paused but metronome is running, stop just the metronome
      stopMetronome();
    }
    
    setEditingCue(cue);
  };

  const handleDeleteCue = (id: string) => {
    if (window.confirm('Are you sure you want to delete this cue point?')) {
      setCuePoints(prev => prev.filter(cue => cue.id !== id));
      if (editingCue?.id === id) {
        setEditingCue(null);
      }
    }
  };

  const handleJumpToTimestamp = (time: string) => {
    const newTime = parseTimeToSeconds(time);
    setCurrentTime(newTime);
  };

  const handleVideoPlayStateChange = (newIsPlaying: boolean) => {
    console.log('🎞️ Video player state changed:', newIsPlaying);
    
    // Prevent unnecessary updates if state is already correct
    if (isPlaying === newIsPlaying) {
      console.log('🎞️ State already matches, skipping update');
      return;
    }
    
    setIsPlaying(newIsPlaying);
    
    if (newIsPlaying) {
      console.log('🎞️ Starting time tracking due to video play');
      startTimeTracking(); // Resume from current time
    } else {
      console.log('🎞️ Stopping time tracking due to video pause');
      stopTimeTracking();
      // When video is paused, also pause metronome if it's running
      if (isMetronomeRunning) {
        console.log('🥁 Auto-pausing metronome because video paused');
        setWasMetronomeRunning(true);
        setPausedBeat(currentBeat);
        stopMetronome();
      }
    }
  };

  const handleVideoEnded = () => {
    console.log('🎬 Video ended - stopping metronome and resetting');
    
    // Stop the video playback and time tracking
    setIsPlaying(false);
    stopTimeTracking();
    
    // Stop the metronome if it's running
    if (isMetronomeRunning) {
      console.log('🥁 Stopping metronome because video ended');
      stopMetronome();
      setCurrentBeat(1); // Reset to beat 1
    }
    
    // Reset any saved states
    setWasVideoPlaying(false);
    setWasMetronomeRunning(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    startTimeTracking(); // Resume from current time, don't reset
  };

  const handlePause = () => {
    setIsPlaying(false);
    setWasMetronomeRunning(isMetronomeRunning);
    setPausedBeat(currentBeat);
    stopTimeTracking();
    if (isMetronomeRunning) {
      stopMetronome();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0); // Reset to beginning
    stopTimeTracking();
    if (isMetronomeRunning) {
      stopMetronome();
    }
    // Reset metronome beat to 1
    setCurrentBeat(1);
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 5);
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const newTime = currentTime + 5;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    // Restart time tracking with new speed if currently playing
    if (isPlaying) {
      startTimeTracking(false);
    }
  };

  const handleToggleOverlay = () => {
    setOverlaysVisible(prev => !prev);
  };

  const handleStartMetronome = () => {
    // Stop current metronome if running
    if (isMetronomeRunning) {
      stopMetronome();
    }
    
    if (timeMode === 'flamenco-12') {
      // For flamenco, start ON beat 12 (flamenco technique)
      setCurrentBeat(12);
    } else {
      // For 8-beat, set to last beat so first tick will be beat 1
      const config = getTimeModeConfig();
      setCurrentBeat(config.beatsPerCycle);
    }
    
    // Start metronome
    startMetronome();
  };

  useEffect(() => {
    return () => {
      stopTimeTracking();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[white] via-[#F9FAFB] to-[white]">
      <Header />
      
      <main className="pt-24 px-4">
        <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste YouTube URL..."
          className="flex-1 p-3 border-2 border-InputboxColor rounded-lg focus:ring-2 focus:ring-InputboxHighlight focus:border-InputboxHighlight focus:outline-none text-InputText placeholder-InputboxColor"
        />
        <button
          onClick={loadVideo}
          className="bg-LoadVideo hover:bg-LoadVideoHover text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
        >
          Load Video
        </button>
      </div>

      <div className="mb-4 aspect-video bg-black rounded-lg overflow-hidden">
        <VideoPlayer
          videoId={videoId}
          currentTime={currentTime}
          currentBeat={currentBeat}
          currentCue={currentCue}
          overlaysVisible={overlaysVisible}
          isMetronomeRunning={isMetronomeRunning}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onTimeUpdate={setCurrentTime}
          onPlayStateChange={handleVideoPlayStateChange}
          onVideoEnded={handleVideoEnded}
          onVideoElementReady={(element) => {
            videoElementRef.current = element;
          }}
          onVideoFileUploaded={(file) => {
            console.log('📁 VideoPlayer uploaded file:', file.name);
            setVideoFile(file);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-6 p-3 bg-transparent rounded-lg">
        <VideoControls
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          onSpeedChange={handleSpeedChange}
          onAddCue={handleAddCue}
          onToggleOverlay={handleToggleOverlay}
          overlaysVisible={overlaysVisible}
          playbackSpeed={playbackSpeed}
        />
      </div>

      <div className="space-y-6">
        <MetronomeControls
          bpm={bpm}
          currentBeat={currentBeat}
          isRunning={isMetronomeRunning}
          timeMode={timeMode}
          isMuted={isMuted}
          onTapTempo={tapTempo}
          onStart={handleStartMetronome}
          onStop={stopMetronome}
          onAdjustBpm={adjustBpm}
          onBpmChange={(newBpm) => adjustBpm(newBpm - bpm)}
          onTimeModeChange={setTimeMode}
          onToggleMute={toggleMute}
          getTimeModeConfig={getTimeModeConfig}
        />

        <CueList
          cuePoints={cuePoints}
          currentTime={currentTime}
          onEdit={handleEditCue}
          onDelete={handleDeleteCue}
          onJump={handleJumpToTimestamp}
        />
      </div>

      {editingCue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <CueForm
            currentTime={currentTime}
            currentBeat={currentBeat}
            timeMode={timeMode}
            onSubmit={handleSubmitCue}
            editingCue={editingCue}
            onCancel={() => setEditingCue(null)}
            onPause={handlePause} 
          />
        </div>
      )}
      </div>
      </main>
      <Footer />
    </div>
  )
}