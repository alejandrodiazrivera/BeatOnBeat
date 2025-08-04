import { useState, useEffect, useRef } from 'react';
import { CuePoint } from './types/types';
import { useMetronome } from './hooks/useMetronome';
import VideoPlayer from './components/VideoPlayer';
import VideoControls from './components/VideoControls';
import MetronomeControls from './components/MetronomeControls';
import CueManager from './components/CueManager';

const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [testCueTrigger, setTestCueTrigger] = useState(0);
  
  const {
    bpm,
    currentBeat,
    isRunning: isMetronomeRunning,
    tapTempo,
    start: startMetronome,
    stop: stopMetronome,
    adjustBpm
  } = useMetronome();

  const timeUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      // Don't start the simulated timer anymore, let YouTube player sync the time
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

  const handleAddCue = () => {
    alert('Add cue functionality moved to CueManager');
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    // Don't start simulated timer, YouTube player will sync time
    alert('Play functionality would work with YouTube API');
  };

  const handlePause = () => {
    setIsPlaying(false);
    // Don't stop simulated timer, YouTube player handles time
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

  const handleTestCue = () => {
    console.log('Test cue button clicked!');
    setTestCueTrigger(prev => prev + 1); // Increment to trigger test cue
  };

  useEffect(() => {
    return () => {
      stopTimeTracking();
    };
  }, []);

  // Auto-load the default video on component mount
  useEffect(() => {
    if (videoUrl && !videoId) {
      loadVideo();
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="container mx-auto px-4 py-6 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">YouTube Dancevideo Analyzer</h1>
      </header>

      <div className="flex gap-2 mb-6">
        <input
          id="youtube-url"
          name="youtubeUrl"
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
        currentCue={null}
        overlaysVisible={overlaysVisible}
        isMetronomeRunning={isMetronomeRunning}
        isPlaying={isPlaying}
        onTimeUpdate={handleTimeUpdate}
      />

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
      />

      <MetronomeControls
        bpm={bpm}
        currentBeat={currentBeat}
        isRunning={isMetronomeRunning}
        onTapTempo={tapTempo}
        onStart={startMetronome}
        onStop={stopMetronome}
        onAdjustBpm={adjustBpm}
        onBpmChange={handleBpmChange}
      />

      <CueManager 
        currentTime={currentTime}
        currentBeat={currentBeat}
        isMetronomeRunning={isMetronomeRunning}
        testCueTrigger={testCueTrigger}
      />
    </div>
  );
};

export default App;