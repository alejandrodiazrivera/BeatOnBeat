'use client';
import { useState, useEffect, useRef } from 'react';
import { CuePoint } from '../types/types';
import { useMetronome } from '../hooks/useMetronome';
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
  
  const {
    bpm,
    currentBeat,
    isRunning: isMetronomeRunning,
    timeMode,
    tapTempo,
    start: startMetronome,
    stop: stopMetronome,
    adjustBpm,
    setCurrentBeat: setMetronomeBeat,
    setTimeMode,
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
    // Adjust interval based on playback speed for smoother tracking
    const interval = playbackSpeed <= 0.5 ? 250 : 500;
    timeUpdateIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + (interval / 1000) * playbackSpeed);
    }, interval);
  };

  const stopTimeTracking = () => {
    if (timeUpdateIntervalRef.current) {
      clearInterval(timeUpdateIntervalRef.current);
      timeUpdateIntervalRef.current = null;
    }
  };

  const checkActiveCue = (time: number) => {
    let activeCue = null;
    let minDiff = Infinity;
    
    cuePoints.forEach(cue => {
      const [minutes, seconds] = cue.time.split(':').map(Number);
      const cueTime = minutes * 60 + seconds;
      const diff = Math.abs(time - cueTime);
      
      if (diff < 0.5 && diff < minDiff) {
        activeCue = cue;
        minDiff = diff;
      }
    });
    
    setCurrentCue(activeCue);
  };

  useEffect(() => {
    checkActiveCue(currentTime);
  }, [currentTime, cuePoints]);

  const handleAddCue = () => {
    // Pause both video and metronome when adding a cue
    if (isPlaying) {
      handlePause();
    }

    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
    const time = `${minutes}:${seconds}`;
    
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
    
    // Resume playback if it was playing before
    if (wasMetronomeRunning) {
      setMetronomeBeat(pausedBeat);
      startMetronome();
    }
    if (isPlaying) {
      handlePlay();
    }
  };

  const handleEditCue = (cue: CuePoint) => {
    if (isPlaying) {
      handlePause();
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
    const [minutes, seconds] = time.split(':').map(Number);
    const newTime = minutes * 60 + seconds;
    setCurrentTime(newTime);
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

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const newTime = currentTime + 10;
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
      setMetronomeBeat(12);
    } else {
      // For 8-beat, set to last beat so first tick will be beat 1
      const config = getTimeModeConfig();
      setMetronomeBeat(config.beatsPerCycle);
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
    <div className="relative min-h-screen">
      <Header />
      
      <main className="pt-24 px-4">
        <div className="container mx-auto max-w-4xl">
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste YouTube URL..."
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-200"
        />
        <button
          onClick={loadVideo}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg"
        >
          Load Video
        </button>
        <label className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg cursor-pointer flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload File
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Clear YouTube URL when uploading a file
                setVideoUrl('');
                setVideoId(null);
                // The VideoPlayer component will handle the file
              }
            }}
            className="hidden"
          />
        </label>
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
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
        <VideoControls
          onPlay={handlePlay}
          onPause={handlePause}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          onSpeedChange={handleSpeedChange}
          onAddCue={handleAddCue}
          onToggleOverlay={handleToggleOverlay}
          isPlaying={isPlaying}
          overlaysVisible={overlaysVisible}
          playbackSpeed={playbackSpeed}
        />
        
        <MetronomeControls
          bpm={bpm}
          currentBeat={currentBeat}
          isRunning={isMetronomeRunning}
          timeMode={timeMode}
          onTapTempo={tapTempo}
          onStart={handleStartMetronome}
          onAdjustBpm={adjustBpm}
          onBpmChange={(newBpm) => adjustBpm(newBpm - bpm)}
          onTimeModeChange={setTimeMode}
          getTimeModeConfig={getTimeModeConfig}
          className="ml-auto"
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

      <CueList
        cuePoints={cuePoints}
        currentTime={currentTime}
        onEdit={handleEditCue}
        onDelete={handleDeleteCue}
        onJump={handleJumpToTimestamp}
      />
      </div>
      </main>
      <Footer />
    </div>
  )
}