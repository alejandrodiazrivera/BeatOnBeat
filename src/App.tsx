import { useState, useEffect, useRef } from 'react';
import { CuePoint } from './types/types';
import { useMetronome } from './hooks/useMetronome';
import VideoPlayer from './components/VideoPlayer';
import VideoControls from './components/VideoControls';
import MetronomeControls from './components/MetronomeControls';
import CueForm from './components/CueForm';
import CueList from './components/CueList';

const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [currentCue, setCurrentCue] = useState<CuePoint | null>(null);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [editingCue, setEditingCue] = useState<CuePoint | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // Added isPlaying state
  
  const {
    bpm,
    currentBeat,
    isRunning: isMetronomeRunning,
    tapTempo,
    start: startMetronome,
    stop: stopMetronome,
    adjustBpm
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
      startTimeTracking();
    } else {
      alert('Please enter a valid YouTube URL');
    }
  };

  const startTimeTracking = () => {
    stopTimeTracking();
    setCurrentTime(0);
    timeUpdateIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 0.5);
    }, 500);
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
    const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
    const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
    const time = `${minutes}:${seconds}`;
    
    setEditingCue({
      id: Date.now().toString(),
      time,
      title: '',
      note: '',
      beat: isMetronomeRunning ? currentBeat : undefined
    });
  };

  const handleSubmitCue = (cue: Omit<CuePoint, 'id'>) => {
    if (editingCue) {
      setCuePoints(prev => 
        prev.map(c => 
          c.id === editingCue.id ? { ...cue, id: editingCue.id } : c
        )
      );
    } else {
      setCuePoints(prev => [
        ...prev,
        { ...cue, id: Date.now().toString() }
      ]);
    }
    setEditingCue(null);
  };

  const handleEditCue = (cue: CuePoint) => {
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
    alert(`Would jump to ${time} (${newTime} seconds)`);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    startTimeTracking();
    alert('Play functionality would work with YouTube API');
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopTimeTracking();
    alert('Pause functionality would work with YouTube API');
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);
    alert(`Would skip back to ${newTime} seconds`);
  };

  const handleSkipForward = () => {
    const newTime = currentTime + 10;
    setCurrentTime(newTime);
    alert(`Would skip forward to ${newTime} seconds`);
  };

  const handleSpeedChange = (speed: number) => {
    alert(`Playback speed changed to ${speed}x (would work with YouTube API)`);
  };

  const handleToggleOverlay = () => {
    setOverlaysVisible(prev => !prev);
  };

  const handleBpmChange = (newBpm: number) => {
    adjustBpm(newBpm - bpm);
  };

  useEffect(() => {
    return () => {
      stopTimeTracking();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">YouTube Dancevideo Analyzer</h1>
      </header>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Paste YouTube URL here..."
          className="flex-1 p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
        />
        <button
          onClick={loadVideo}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition whitespace-nowrap"
        >
          Load Video
        </button>
      </div>

      <VideoPlayer
        videoId={videoId}
        currentTime={currentTime}
        currentBeat={currentBeat}
        currentCue={currentCue}
        overlaysVisible={overlaysVisible}
        isMetronomeRunning={isMetronomeRunning}
        isPlaying={isPlaying} // Added required prop
      />

      <VideoControls
        onPlay={handlePlay}
        onPause={handlePause}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onSpeedChange={handleSpeedChange}
        onAddCue={handleAddCue}
        onToggleOverlay={handleToggleOverlay}
        isPlaying={isPlaying} // Added required prop
        overlaysVisible={overlaysVisible} // Added required prop
      />

      <MetronomeControls
        bpm={bpm}
        currentBeat={currentBeat}
        isRunning={isMetronomeRunning}
        onTapTempo={tapTempo}
        onStart={startMetronome}
        onStop={stopMetronome}
        onAdjustBpm={adjustBpm}
        onBpmChange={handleBpmChange} // Added required prop
      />

      {editingCue ? (
        <CueForm
          currentTime={currentTime}
          currentBeat={currentBeat}
          isMetronomeRunning={isMetronomeRunning}
          onSubmit={handleSubmitCue}
          editingCue={editingCue}
          onCancel={() => setEditingCue(null)}
          onPause={() => {
            handlePause(); // Pause video playback
            stopMetronome(); // Stop the metronome
          }}
        />
      ) : (
        <CueForm
          currentTime={currentTime}
          currentBeat={currentBeat}
          isMetronomeRunning={isMetronomeRunning}
          onSubmit={handleSubmitCue}
          editingCue={null}
          onCancel={() => {}}
          onPause={() => {
            handlePause(); // Pause video playback
            stopMetronome(); // Stop the metronome
          }}
        />
      )}

      <CueList
        cuePoints={cuePoints}
        currentTime={currentTime}
        onEdit={handleEditCue}
        onDelete={handleDeleteCue}
        onJump={handleJumpToTimestamp}
      />
    </div>
  );
};

export default App;