'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { CuePoint } from '../../types/types';
import { extractVideoId } from '../../utils/youtubeUtils';

// U  // Auto-sync functionsctions for precise time handling
const parseTimeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  const minutes = parseInt(parts[0]);
  const secondsPart = parts[1];
  
  // Handle milliseconds if present (e.g., "45.500" or "45")
  const seconds = parseFloat(secondsPart);
  
  return minutes * 60 + seconds;
};
import VideoPlayer from '../../components/VideoPlayer';
import VideoControls from '../../components/VideoControls';
import CueForm from '../../components/CueForm';
import CueList from '../../components/CueList';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const formatPracticeTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function LoopPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [currentCue, setCurrentCue] = useState<CuePoint | null>(null);
  const [editingCue, setEditingCue] = useState<CuePoint | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [practiceStart, setPracticeStart] = useState<number | null>(null);
  const [practiceEnd, setPracticeEnd] = useState<number | null>(null);
  const [isLoopingPractice, setIsLoopingPractice] = useState(false);
  const [loopMode, setLoopMode] = useState<'inactive' | 'activated' | 'active'>('inactive');
  const [isMirrored, setIsMirrored] = useState(false);
  const [practiceName, setPracticeName] = useState('');
  const [isSaveLoopDialogOpen, setIsSaveLoopDialogOpen] = useState(false);
  const [isSavedLoopsOpen, setIsSavedLoopsOpen] = useState(false);
  const currentTimeRef = useRef(0);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const resumeAfterSaveRef = useRef(false);
  const ignorePauseUntilRef = useRef(0);
  // Removed unused videoFile state
  
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

  useEffect(() => {
    if (!isLoopingPractice || practiceStart === null || practiceEnd === null) {
      return;
    }

    if (currentTime >= practiceEnd) {
      setCurrentTime(practiceStart);
    }
  }, [currentTime, isLoopingPractice, practiceStart, practiceEnd]);

  useEffect(() => {
    if (isSaveLoopDialogOpen || !resumeAfterSaveRef.current) {
      return;
    }

    const resumeTimer = window.setTimeout(() => {
      resumeAfterSaveRef.current = false;
      ignorePauseUntilRef.current = Date.now() + 1000;
      setIsPlaying(true);
    }, 0);

    return () => window.clearTimeout(resumeTimer);
  }, [isSaveLoopDialogOpen]);

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
    
    handlePlay();
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
    const newTime = parseTimeToSeconds(time);
    console.log('🎯 Jumping to timestamp:', newTime, 'for video:', videoId ? 'YouTube' : 'local');
    setCurrentTime(newTime);
    
    // For YouTube videos, the VideoPlayer will handle the seeking via useEffect
    // For local videos, the manual timer will update automatically
  };

  const handleVideoPlayStateChange = useCallback((newIsPlaying: boolean) => {
    console.log('🎞️ Video player state changed:', newIsPlaying);

    if (!newIsPlaying && Date.now() < ignorePauseUntilRef.current) {
      return;
    }
    
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
    }
  }, [isPlaying]);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Memoized time update handler to prevent infinite re-renders
  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time;
    setCurrentTime(time);
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    // VideoPlayer will handle time updates automatically
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 5);
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const newTime = currentTime + 5;
    setCurrentTime(newTime);
  };

  const handleMarkPracticeStart = () => {
    const markedTime = Math.max(currentTimeRef.current, currentTime);
    setPracticeStart(markedTime);
    setPracticeEnd(null);
    setIsLoopingPractice(false);
    setLoopMode('activated');
    setIsSavedLoopsOpen(true);
  };

  const handleMarkPracticeEnd = () => {
    const markedTime = Math.max(currentTimeRef.current, currentTime);
    if (practiceStart === null || markedTime <= practiceStart) {
      alert('Mark a start point before marking an end point.');
      return;
    }

    setPracticeEnd(markedTime);
    setIsLoopingPractice(true);
    setLoopMode('active');
  };

  const handleLoopModeChange = () => {
    if (loopMode === 'inactive') {
      handleMarkPracticeStart();
      return;
    }

    if (loopMode === 'activated') {
      handleMarkPracticeEnd();
      return;
    }

    setIsLoopingPractice(false);
    setLoopMode('inactive');
  };

  const handleClearPracticeSection = () => {
    setPracticeStart(null);
    setPracticeEnd(null);
    setIsLoopingPractice(false);
    setLoopMode('inactive');
    setPracticeName('');
  };

  const handleSavePracticeLoop = () => {
    if (practiceStart === null || practiceEnd === null) {
      alert('Mark both a start and end point before saving a practice loop.');
      return;
    }

    const title = practiceName.trim() || `Practice loop ${cuePoints.length + 1}`;
    const savedLoop: CuePoint = {
      id: Date.now().toString(),
      time: formatPracticeTime(practiceStart),
      endTime: formatPracticeTime(practiceEnd),
      title,
      note: ''
    };

    setCuePoints(prev => [...prev, savedLoop]);
    setPracticeStart(null);
    setPracticeEnd(null);
    setIsLoopingPractice(false);
    setLoopMode('inactive');
    setPracticeName('');
    resumeAfterSaveRef.current = true;
    setIsSaveLoopDialogOpen(false);
    // Open saved loops sidebar when a loop is saved
    setIsSavedLoopsOpen(true);
  };

  const handleOpenSaveLoopDialog = () => {
    if (practiceStart === null || practiceEnd === null) {
      alert('Mark both a start and end point before saving a practice loop.');
      return;
    }

    if (isPlaying) {
      handlePause();
    }
    setIsSaveLoopDialogOpen(true);
  };

  const handleCloseSaveLoopDialog = () => {
    setIsSaveLoopDialogOpen(false);
  };

  const handleLoopCue = (cue: CuePoint) => {
    if (!cue.endTime) {
      handleJumpToTimestamp(cue.time);
      return;
    }

    const start = parseTimeToSeconds(cue.time);
    const end = parseTimeToSeconds(cue.endTime);
    setPracticeStart(start);
    setPracticeEnd(end);
    currentTimeRef.current = start;
    setCurrentTime(start);
    setIsLoopingPractice(true);
    setLoopMode('active');
    handlePlay();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    // VideoPlayer will automatically handle the speed change via its playbackSpeed prop
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[white] via-[#F9FAFB] to-[white]">
      <Header />
      
      <main className="pt-24 px-4">
        <div className="container mx-auto max-w-6xl">
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

      <div className="relative flex flex-col items-start gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-4 aspect-video bg-black rounded-lg overflow-hidden">
            <VideoPlayer
              videoId={videoId}
              currentTime={currentTime}
              currentCue={currentCue}
              isPlaying={isPlaying}
              isMirrored={isMirrored}
              loop={loopMode !== 'inactive'}
              muted={false}
              playbackSpeed={playbackSpeed}
              onTimeUpdate={handleTimeUpdate}
              onPlayStateChange={handleVideoPlayStateChange}
              onVideoEnded={handleVideoEnded}
              fileInputRef={videoFileInputRef}
              debug={false}
              onVideoFileUploaded={(file) => {
                console.log('📁 VideoPlayer uploaded file:', file.name);
                setVideoId(null);
                setCurrentTime(0);
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
              onToggleMirror={() => setIsMirrored(prev => !prev)}
              onOpenFilePicker={() => videoFileInputRef.current?.click()}
              isMirrored={isMirrored}
              onLoopModeChange={handleLoopModeChange}
              onSaveLoop={handleOpenSaveLoopDialog}
              onClearLoop={handleClearPracticeSection}
              loopMode={loopMode}
              canSaveLoop={practiceStart !== null && practiceEnd !== null}
              canClearLoop={practiceStart !== null || practiceEnd !== null}
              onSpeedChange={handleSpeedChange}
              playbackSpeed={playbackSpeed}
            />
          </div>
        </div>

        <aside
          className={`relative hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out lg:block ${
            isSavedLoopsOpen ? 'w-[360px]' : 'w-0'
          }`}
          aria-hidden={!isSavedLoopsOpen}
        >
          <div className="w-[360px]">
            <CueList
              cuePoints={cuePoints}
              currentTime={currentTime}
              onEdit={handleEditCue}
              onDelete={handleDeleteCue}
              onJump={handleJumpToTimestamp}
              onLoop={handleLoopCue}
            />
          </div>
        </aside>

        <button
          type="button"
          onClick={() => setIsSavedLoopsOpen(prev => !prev)}
          className="absolute right-0 top-0 z-10 hidden h-10 w-10 translate-x-1/2 items-center justify-center rounded-full border-2 border-Borders bg-white text-Text shadow-md transition-colors hover:bg-gray-100 lg:flex"
          aria-label={isSavedLoopsOpen ? 'Collapse saved loops sidebar' : 'Open saved loops sidebar'}
          title={isSavedLoopsOpen ? 'Collapse saved loops sidebar' : 'Open saved loops sidebar'}
        >
          {isSavedLoopsOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
        </button>

        <div className="w-full lg:hidden">
          <CueList
            cuePoints={cuePoints}
            currentTime={currentTime}
            onEdit={handleEditCue}
            onDelete={handleDeleteCue}
            onJump={handleJumpToTimestamp}
            onLoop={handleLoopCue}
          />
        </div>
      </div>

      {isSaveLoopDialogOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseSaveLoopDialog();
            }
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSavePracticeLoop();
            }}
            className="w-full max-w-md rounded-xl border-2 border-Borders bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-loop-title"
          >
            <h2 id="save-loop-title" className="text-xl font-semibold text-Title">
              Save practice loop
            </h2>
            <p className="mt-2 text-sm text-Text">
              Give this section a name so you can find it again in your cue points.
            </p>
            <p className="mt-3 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-Text">
              {practiceStart !== null && practiceEnd !== null
                ? `${formatPracticeTime(practiceStart)} - ${formatPracticeTime(practiceEnd)}`
                : ''}
            </p>
            <label htmlFor="practice-loop-name" className="sr-only">
              Practice loop name
            </label>
            <input
              id="practice-loop-name"
              type="text"
              value={practiceName}
              onChange={(event) => setPracticeName(event.target.value)}
              placeholder="e.g. Opening footwork"
              autoFocus
              className="mt-4 w-full rounded-lg border-2 border-Borders px-3 py-3 text-Text outline-none focus:border-Cue"
              maxLength={80}
              required
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseSaveLoopDialog}
                className="rounded-lg border-2 border-Borders px-4 py-2 text-sm font-medium text-Text hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-Cue px-4 py-2 text-sm font-medium text-white hover:bg-CueHover"
              >
                Save loop
              </button>
            </div>
          </form>
        </div>
      )}

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