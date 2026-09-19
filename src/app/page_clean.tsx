'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { CuePoint } from '../types/types';
import { useToneMetronome } from '../hooks/useToneMetronome';
import { useToneAutoSync } from '../hooks/useToneAutoSync';
import { extractVideoId } from '../utils/youtubeUtils';

// Utility functions for precise time handling
const parseTimeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  const minutes = parseInt(parts[0]);
  const secondsPart = parts[1];
  
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
  const [pausedBeat, setPausedBeat] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [timeMode, setTimeMode] = useState<'8-beat' | 'flamenco-12'>('8-beat');
  
  // Tone.js Metronome hook
  const {
    bpm,
    currentBeat,
    isRunning: isMetronomeRunning,
    isMuted,
    start: startMetronome,
    stop: stopMetronome,
    adjustBpm,
    setBPM,
    toggleMute,
    tapTempo,
    syncToBeat,
    getTimeModeConfig
  } = useToneMetronome(120, timeMode);

  // Auto-sync hook  
  const {
    isLocked,
    detectedBPM,
    isDetecting,
    syncReference,
    beatGrid,
    initializeAudioAnalysis,
    detectBPMFromVideo,
    connectVideoElement,
    lockSync,
    unlockSync,
    toggleAutoSync,
    getSyncedBeat,
    adjustTempo,
    cleanup: cleanupAutoSync
  } = useToneAutoSync();

  // Refs for accessing video elements
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const loadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
      startTimeTracking(true); // Reset time when loading new video
    } else {
      alert('Please enter a valid YouTube URL (videos or reels)');
    }
  };

  const startTimeTracking = (resetTime = false) => {
    // No need for manual timer - VideoPlayer handles all time updates
    if (resetTime) {
      setCurrentTime(0);
    }
    // console.log('🎞️ Using VideoPlayer time sync for all videos');
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
    const shouldResumeMetronome = wasMetronomeRunning;
    const beatToResume = pausedBeat;
    
    // Reset tracking states first
    setWasMetronomeRunning(false);
    
    // Always resume playback after saving a cue
    if (shouldResumeMetronome) {
      startMetronome();
    }
    console.log('🎬 Always resuming video playback after cue save');
    handlePlay(); // Always resume video
  };

  const handleEditCue = (cue: CuePoint) => {
    // Track current states before pausing
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
    console.log('🎯 Jumping to timestamp:', newTime, 'for video:', videoId ? 'YouTube' : 'local');
    setCurrentTime(newTime);
    
    // For YouTube videos, the VideoPlayer will handle the seeking via useEffect
    // For local videos, the manual timer will update automatically
  };

  const handleVideoPlayStateChange = useCallback((newIsPlaying: boolean) => {
    console.log('🎞️ Video player state changed:', newIsPlaying);
    
    // Prevent unnecessary updates if state is already correct
    if (isPlaying === newIsPlaying) {
      console.log('🎞️ State already matches, skipping update');
      return;
    }
    
    setIsPlaying(newIsPlaying);
    
    if (newIsPlaying) {
      console.log('🎞️ Video resumed playing - relying on VideoPlayer time sync');
    } else {
      console.log('🎞️ Video paused');
      // When video is paused, also pause metronome if it's running
      if (isMetronomeRunning) {
        console.log('🥁 Auto-pausing metronome because video paused');
        setWasMetronomeRunning(true);
        setPausedBeat(currentBeat);
        stopMetronome();
      }
    }
  }, [isPlaying, isMetronomeRunning, currentBeat, stopMetronome]);

  const handleVideoEnded = useCallback(() => {
    console.log('🎬 Video ended - stopping metronome and resetting');
    
    // Stop the video playback (VideoPlayer handles time updates)
    setIsPlaying(false);
    
    // Stop the metronome if it's running
    if (isMetronomeRunning) {
      console.log('🥁 Stopping metronome because video ended');
      stopMetronome();
    }
    
    // Reset any saved states
    setWasMetronomeRunning(false);
  }, [isMetronomeRunning, stopMetronome]);

  const handlePlay = () => {
    setIsPlaying(true);
    // VideoPlayer will handle time updates automatically
  };

  const handlePause = () => {
    setIsPlaying(false);
    setWasMetronomeRunning(isMetronomeRunning);
    setPausedBeat(currentBeat);
    // No need to stop manual timer - VideoPlayer handles everything
    if (isMetronomeRunning) {
      stopMetronome();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0); // Reset to beginning
    // VideoPlayer will handle stopping time updates
    if (isMetronomeRunning) {
      stopMetronome();
    }
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
    // VideoPlayer will automatically handle the speed change via its playbackSpeed prop
  };

  const handleToggleOverlay = () => {
    setOverlaysVisible(prev => !prev);
  };

  const handleStartMetronome = async () => {
    try {
      // Ensure Tone.js audio context is started (requires user interaction)
      if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log('🎵 Tone.js audio context started');
      }
      
      // Stop current metronome if running
      if (isMetronomeRunning) {
        stopMetronome();
      }
      
      // Start metronome (Tone.js manages beat internally)
      await startMetronome();
      console.log('🎵 Metronome start requested');
    } catch (error) {
      console.error('Failed to start metronome:', error);
    }
  };

  // Memoized time update handler to prevent infinite re-renders
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Auto-sync functions
  const handleAutoSync = useCallback(async () => {
    try {
      const videoElement = videoElementRef.current || undefined;
      const success = await toggleAutoSync(videoElement, timeMode);
      
      if (success) {
        console.log('🔒 Auto-sync locked with continuous monitoring');
        
        // If auto-sync detected a BPM, update the metronome's BPM but don't interfere with beat timing
        if (detectedBPM && detectedBPM !== bpm) {
          setBPM(detectedBPM);
          console.log(`🎵 Updated metronome BPM to detected ${detectedBPM}`);
        }
      } else {
        console.log('🔓 Auto-sync unlocked');
      }
    } catch (error) {
      console.error('Failed to toggle auto-sync:', error);
    }
  }, [toggleAutoSync, timeMode, detectedBPM, bpm, setBPM]);

  const handleTempoControl = useCallback((action: 'faster' | 'slower' | 'match') => {
    const amount = 5;
    let newBpm: number;
    
    switch (action) {
      case 'faster':
        newBpm = bpm + amount;
        adjustBpm(amount);
        break;
      case 'slower':
        newBpm = Math.max(bpm - amount, 60);
        adjustBpm(-amount);
        break;
      case 'match':
        if (detectedBPM) {
          const diff = detectedBPM - bpm;
          adjustBpm(diff);
          newBpm = detectedBPM;
        } else {
          return;
        }
        break;
      default:
        return;
    }
    
    // Update auto-sync if locked
    if (isLocked) {
      adjustTempo(action);
    }
    
    console.log(`🎵 Tempo adjusted to ${newBpm} BPM`);
  }, [bpm, adjustBpm, detectedBPM, isLocked, adjustTempo]);

  // Cleanup auto-sync on unmount
  useEffect(() => {
    return () => {
      cleanupAutoSync();
    };
  }, [cleanupAutoSync]);

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
          placeholder="Paste YouTube URL (videos or reels)..."
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
          currentCue={currentCue}
          overlaysVisible={overlaysVisible}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          onTimeUpdate={handleTimeUpdate}
          onPlayStateChange={handleVideoPlayStateChange}
          onVideoEnded={handleVideoEnded}
          debug={false}
          onVideoElementReady={(element) => {
            videoElementRef.current = element;
          }}
          onVideoFileUploaded={(file) => {
            console.log('📁 VideoPlayer uploaded file:', file.name);
            // File uploaded but not stored in state
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
          onBpmChange={setBPM}
          onTimeModeChange={setTimeMode}
          onToggleMute={toggleMute}
          getTimeModeConfig={getTimeModeConfig}
          isLocked={isLocked}
          detectedBPM={detectedBPM}
          isDetecting={isDetecting}
          onAutoSync={handleAutoSync}
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
