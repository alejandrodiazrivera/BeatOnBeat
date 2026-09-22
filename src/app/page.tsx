'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { CuePoint } from '../types/types';
import { extractVideoId } from '../utils/youtubeUtils';

// U  // Auto-sync functionsctions for precise time handling
const parseTimeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  const minutes = parseInt(parts[0]);
  const secondsPart = parts[1];
  
  // Handle milliseconds if present (e.g., "45.500" or "45")
  const seconds = parseFloat(secondsPart);
  
  return minutes * 60 + seconds;
};

// Calculate the first downbeat (beat 1) time for precise metronome sync
const calculateFirstDownbeat = (bpm: number, videoTime: number, currentBeat: number): number => {
  // Calculate beat and measure durations
  const beatDuration = 60.0 / bpm;
  const measureDuration = 8 * beatDuration;
  
  // Time of last "1" beat BEFORE the given timestamp
  const lastOneTime = videoTime - (currentBeat - 1) * beatDuration;
  
  // Compute first downbeat using modulo arithmetic
  let firstOneTime = lastOneTime - measureDuration * Math.floor(lastOneTime / measureDuration);
  
  // Correct floating-point imprecision (if needed)
  if (firstOneTime < 0 || firstOneTime >= measureDuration) {
    firstOneTime = lastOneTime % measureDuration;
    if (firstOneTime < 0) {
      firstOneTime += measureDuration;
    }
  }
  
  return firstOneTime;
};

import VideoPlayer from '../components/VideoPlayer';
import VideoControls from '../components/VideoControls';
import CueForm from '../components/CueForm';
import CueList from '../components/CueList';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Upload } from 'lucide-react';

const formatPracticeTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [currentCue, setCurrentCue] = useState<CuePoint | null>(null);
  const [editingCue, setEditingCue] = useState<CuePoint | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
<<<<<<< HEAD
  
  // Sync lock state for video-metronome synchronization
  const [isLocked, setIsLocked] = useState(false);
  const [syncReference, setSyncReference] = useState<{
    bpm: number;
    beat: number;
    videoTime: number;
    beatReferences?: Array<{
      beat: number;
      videoTime: number;
      timestamp: number;
    }>;
    averageBpm?: number;
    accuracy?: number;
  } | null>(null);
  
  // Multi-beat sync lock state
  const [isCapturingSync, setIsCapturingSync] = useState(false);
  const [capturedBeats, setCapturedBeats] = useState<Array<{
    beat: number;
    videoTime: number;
    timestamp: number;
  }>>([]);
  
  // Extrapolated beats for entire video
  const [extrapolatedBeats, setExtrapolatedBeats] = useState<Array<{
    beat: number;
    videoTime: number;
    cyclePosition: number;
  }>>([]);
=======
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
>>>>>>> youtuber
  
  const loadVideo = () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
      setVideoFile(null); // Clear uploaded file when loading YouTube video
      startTimeTracking(true); // Reset time when loading new video
    } else {
      alert('Please enter a valid YouTube URL (videos or reels)');
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clear YouTube video when uploading file
      setVideoId(null);
      setVideoUrl('');
      setVideoFile(file);
      startTimeTracking(true); // Reset time when loading new video
      
      console.log('📁 Video file uploaded:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
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
<<<<<<< HEAD
      console.log('🎞️ Starting time tracking due to video play');
      
      // Apply enhanced sync lock logic if enabled
      if (isLocked && syncReference) {
        // Use the enhanced sync reference with improved BPM calculation
        const usedBpm = syncReference.averageBpm || syncReference.bpm;
        const videoDelta = currentTime - syncReference.videoTime;
        const beatInterval = 60 / usedBpm;
        const beatsElapsed = videoDelta / beatInterval;
        const config = getTimeModeConfig();
        
        // Calculate precise beat position, maintaining sub-beat timing
        const exactBeatPosition = syncReference.beat - 1 + beatsElapsed;
        const cyclePosition = exactBeatPosition % config.beatsPerCycle;
        const targetBeat = Math.floor(cyclePosition) + 1;
        
        // Calculate the fractional part to determine how far into the beat we are
        const beatFraction = cyclePosition - Math.floor(cyclePosition);
        
        // Use the efficient algorithm to find the first downbeat time
        const firstDownbeatTime = calculateFirstDownbeat(usedBpm, currentTime, targetBeat);
        
        console.log('🎵 Starting enhanced synced playback from video player with downbeat:', {
          currentVideoTime: currentTime.toFixed(3),
          firstDownbeatTime: firstDownbeatTime.toFixed(3),
          videoDelta: videoDelta.toFixed(3),
          beatsElapsed: beatsElapsed.toFixed(3),
          exactBeatPosition: exactBeatPosition.toFixed(3),
          targetBeat,
          beatFraction: beatFraction.toFixed(3),
          usedBpm: usedBpm.toFixed(2),
          accuracy: syncReference.accuracy ? syncReference.accuracy.toFixed(1) + '%' : 'single-beat'
        });
        
        // Set the correct beat and BPM first
        setCurrentBeat(targetBeat);
        setBpm(usedBpm);
        
        // Start metronome with sub-beat precision
        // If we're significantly into a beat (more than 25%), advance to next beat
        if (beatFraction > 0.25) {
          const nextBeat = targetBeat === config.beatsPerCycle ? 1 : targetBeat + 1;
          console.log('🎵 Advancing to next beat due to timing:', nextBeat);
          setCurrentBeat(nextBeat);
        }
        
        startMetronome();
      }
      
      startTimeTracking(); // Resume from current time
=======
      console.log('🎞️ Video resumed playing - relying on VideoPlayer time sync');
>>>>>>> youtuber
    } else {
      console.log('🎞️ Video paused');
    }
  }, [isPlaying]);

<<<<<<< HEAD
  const handleVideoEnded = () => {
    console.log('🎬 Video ended - stopping metronome and resetting');
    // Reset all playback and metronome states so controls work again
    setIsPlaying(false);
    setCurrentTime(0); // Reset to beginning
    stopTimeTracking();
    if (isMetronomeRunning) {
      console.log('🥁 Stopping metronome because video ended');
      stopMetronome();
    }
    setCurrentBeat(1); // Always reset to beat 1
    setWasVideoPlaying(false);
    setWasMetronomeRunning(false);
    // Optionally, reset overlays and editing cue
    setOverlaysVisible(true);
    setEditingCue(null);
    // If you want to auto-enable controls, you can add more resets here
=======
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
>>>>>>> youtuber
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

<<<<<<< HEAD
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

  // Handle sync lock toggle
  const handleLockSync = (syncData: { bpm: number; beat: number; videoTime: number }) => {
    if (syncData.bpm === 0) {
      // Unlock
      setIsLocked(false);
      setSyncReference(null);
      console.log('🔓 Sync unlocked');
    } else {
      // Lock with current sync reference, without multi-beat tuning
      setIsLocked(true);
      const newSyncReference = {
        bpm: syncData.bpm,
        beat: syncData.beat,
        videoTime: syncData.videoTime,
        // Set a default accuracy since we are skipping the multi-beat calculation
        accuracy: 100 
      };
      setSyncReference(newSyncReference);
      console.log('🔒 Sync locked directly at:', newSyncReference);
    }
  };

  const finalizeSyncLock = (beatReferences: Array<{beat: number; videoTime: number; timestamp: number}>, initialBpm: number) => {
    if (beatReferences.length < 2) return;
    
  // Calculate average BPM from captured beats (weighted: newer beats count more)
    const intervals: number[] = [];
    for (let i = 1; i < beatReferences.length; i++) {
      const timeDiff = beatReferences[i].videoTime - beatReferences[i-1].videoTime;
      const beatDiff = beatReferences[i].beat - beatReferences[i-1].beat;
      
      // Handle beat wrap-around (e.g., beat 4 to beat 1)
      const config = getTimeModeConfig();
      const adjustedBeatDiff = beatDiff <= 0 ? beatDiff + config.beatsPerCycle : beatDiff;
      
      if (adjustedBeatDiff > 0) {
        const intervalBpm = (adjustedBeatDiff * 60) / timeDiff;
        intervals.push(intervalBpm);
      }
    }
    // Debug info: log all captured beats and their video times
    console.log('🔎 BPM Lock Debug: Registered beats and times:');
    beatReferences.forEach((ref, idx) => {
      console.log(`  Beat ${idx + 1}: beat=${ref.beat}, videoTime=${ref.videoTime.toFixed(3)}, timestamp=${ref.timestamp}`);
    });
    
    // Weighted stats helper (linear weights: 1..n, newest interval gets weight n)
    let averageBpm: number;
    let stdDeviation: number;
    let accuracy: number;
    if (intervals.length > 0) {
      const n = intervals.length;
      const weights = intervals.map((_, idx) => idx + 1);
      const weightSum = weights.reduce((a, b) => a + b, 0);
      // Weighted average BPM
      averageBpm = intervals.reduce((acc, val, idx) => acc + val * weights[idx], 0) / weightSum;
      // Weighted variance and derived accuracy
      const weightedVariance = intervals.reduce((acc, val, idx) => {
        const diff = val - averageBpm!;
        return acc + weights[idx] * diff * diff;
      }, 0) / weightSum;
      stdDeviation = Math.sqrt(weightedVariance);
      accuracy = ((averageBpm - stdDeviation) / averageBpm) * 100;
      console.log('⚖️ Weighted BPM averaging applied', {
        intervals: intervals.map(v => Number(v.toFixed(3))),
        weights,
        weightedAverageBpm: Number(averageBpm.toFixed(3)),
        weightedStdDev: Number(stdDeviation.toFixed(3)),
        accuracy: Number(accuracy.toFixed(2)) + '%'
      });
    } else {
      // Fallback to initial BPM if no intervals were computed
      averageBpm = initialBpm;
      stdDeviation = 0;
      accuracy = 100;
      console.log('⚠️ No valid intervals for BPM averaging. Falling back to initial BPM.', { initialBpm });
    }
    
    // Extrapolate beats for entire video duration (assuming 5 minutes max, can be made dynamic)
    const videoDuration = 300; // 5 minutes in seconds - this could be dynamic from video element
    const beatInterval = 60 / averageBpm;
    const config = getTimeModeConfig();
    const startReference = beatReferences[0];
    
    const extrapolated: Array<{beat: number; videoTime: number; cyclePosition: number}> = [];
    
    // Calculate backwards from start reference to time 0
    let currentTime = startReference.videoTime;
    let currentBeat = startReference.beat;
    while (currentTime > 0) {
      currentTime -= beatInterval;
      currentBeat = currentBeat === 1 ? config.beatsPerCycle : currentBeat - 1;
      if (currentTime >= 0) {
        extrapolated.unshift({
          beat: currentBeat,
          videoTime: Math.round(currentTime * 1000) / 1000,
          cyclePosition: currentBeat
        });
      }
    }
    
    // Add the captured beats
    beatReferences.forEach(ref => {
      extrapolated.push({
        beat: ref.beat,
        videoTime: ref.videoTime,
        cyclePosition: ref.beat
      });
    });
    
    // Calculate forwards from last reference to end of video
    currentTime = beatReferences[beatReferences.length - 1].videoTime;
    currentBeat = beatReferences[beatReferences.length - 1].beat;
    while (currentTime < videoDuration) {
      currentTime += beatInterval;
      currentBeat = currentBeat === config.beatsPerCycle ? 1 : currentBeat + 1;
      if (currentTime <= videoDuration) {
        extrapolated.push({
          beat: currentBeat,
          videoTime: Math.round(currentTime * 1000) / 1000,
          cyclePosition: currentBeat
        });
      }
    }
    
    // Sort by time and store
    extrapolated.sort((a, b) => a.videoTime - b.videoTime);
    setExtrapolatedBeats(extrapolated);
    
    console.log('🎵 Extrapolated beats for entire video:', {
      totalBeats: extrapolated.length,
      videoDuration: videoDuration,
      beatInterval: beatInterval.toFixed(3),
      firstFewBeats: extrapolated.slice(0, 10).map(b => ({ 
        beat: b.beat, 
        time: b.videoTime.toFixed(3) 
      })),
      lastFewBeats: extrapolated.slice(-10).map(b => ({ 
        beat: b.beat, 
        time: b.videoTime.toFixed(3) 
      }))
    });

    // Predict timestamps for first 2 bars (16 beats) starting from first downbeat
    const predictedBeats: Array<{beat: number; bar: number; time: number}> = [];
    // Find the first downbeat (beat 1) time
    const firstDownbeatTime = calculateFirstDownbeat(averageBpm, startReference.videoTime, startReference.beat);
    for (let i = 0; i < 16; i++) {
      const beatNum = (i % config.beatsPerCycle) + 1;
      const barNum = Math.floor(i / config.beatsPerCycle) + 1;
      const timestamp = firstDownbeatTime + i * beatInterval;
      predictedBeats.push({ beat: beatNum, bar: barNum, time: Math.round(timestamp * 1000) / 1000 });
    }
    console.log('🔮 Predicted timestamps for first 2 bars (16 beats):');
    predictedBeats.forEach(b => {
      console.log(`  Bar ${b.bar}, Beat ${b.beat}: ${formatTimeWithMilliseconds(b.time)}`);
    });
    
    // Use the most recent beat as primary reference
    const primaryReference = beatReferences[beatReferences.length - 1];
    
    const enhancedSyncRef = {
      bpm: averageBpm,
      beat: primaryReference.beat,
      videoTime: primaryReference.videoTime,
      beatReferences: beatReferences,
      averageBpm: averageBpm,
      accuracy: accuracy
    };
    
    setIsLocked(true);
    setSyncReference(enhancedSyncRef);
    setIsCapturingSync(false);
    setCapturedBeats([]);
    
    console.log('🔒 Enhanced sync lock finalized!', {
      capturedBeats: beatReferences.length,
      initialBpm: initialBpm.toFixed(1),
      calculatedBpm: averageBpm.toFixed(2),
      accuracy: accuracy.toFixed(1) + '%',
      stdDeviation: stdDeviation.toFixed(2),
      beatReferences: beatReferences.map(b => ({
        beat: b.beat,
        time: b.videoTime.toFixed(3)
      }))
    });
  };

  // Get current video time for sync reference
  const getCurrentVideoTime = () => {
    return currentTime;
  };

  // Enhanced play handler for sync mode
  const handlePlay = () => {
    if (isLocked && syncReference) {
      // Use the enhanced sync reference with improved BPM calculation
      const usedBpm = syncReference.averageBpm || syncReference.bpm;
      const videoDelta = currentTime - syncReference.videoTime;
      const beatInterval = 60 / usedBpm;
      const beatsElapsed = videoDelta / beatInterval;
      const config = getTimeModeConfig();
      
      // Calculate precise beat position, maintaining sub-beat timing
      const exactBeatPosition = syncReference.beat - 1 + beatsElapsed;
      const cyclePosition = exactBeatPosition % config.beatsPerCycle;
      const targetBeat = Math.floor(cyclePosition) + 1;
      
      // Calculate the fractional part to determine how far into the beat we are
      const beatFraction = cyclePosition - Math.floor(cyclePosition);
      
      // Use the efficient algorithm to find the first downbeat time
      const firstDownbeatTime = calculateFirstDownbeat(usedBpm, currentTime, targetBeat);
      
      console.log('🎵 Starting enhanced synced playback with downbeat calculation:', {
        currentVideoTime: currentTime.toFixed(3),
        firstDownbeatTime: firstDownbeatTime.toFixed(3),
        videoDelta: videoDelta.toFixed(3),
        beatsElapsed: beatsElapsed.toFixed(3),
        exactBeatPosition: exactBeatPosition.toFixed(3),
        targetBeat,
        beatFraction: beatFraction.toFixed(3),
        usedBpm: usedBpm.toFixed(2),
        accuracy: syncReference.accuracy ? syncReference.accuracy.toFixed(1) + '%' : 'single-beat',
        capturedBeats: syncReference.beatReferences?.length || 1
      });
      
      // Show extrapolated beats for current video position if available
      if (extrapolatedBeats.length > 0) {
        const currentIndex = extrapolatedBeats.findIndex(b => Math.abs(b.videoTime - currentTime) < 0.1);
        const contextBeats = currentIndex >= 0 
          ? extrapolatedBeats.slice(Math.max(0, currentIndex - 2), currentIndex + 3)
          : extrapolatedBeats.slice(0, 5);
        
        console.log('🎵 Extrapolated beats around current position:', {
          currentVideoTime: currentTime.toFixed(3),
          firstDownbeatCalculated: firstDownbeatTime.toFixed(3),
          contextBeats: contextBeats.map(b => ({
            beat: b.beat,
            time: b.videoTime.toFixed(3),
            isCurrent: Math.abs(b.videoTime - currentTime) < 0.1
          }))
        });
      }
      
      // Set the correct beat and BPM first
      setCurrentBeat(targetBeat);
      setBpm(usedBpm);
      
      // Start metronome with sub-beat precision
      // If we're significantly into a beat (more than 25%), advance to next beat
      if (beatFraction > 0.25) {
        const nextBeat = targetBeat === config.beatsPerCycle ? 1 : targetBeat + 1;
        console.log('🎵 Advancing to next beat due to timing:', nextBeat);
        setCurrentBeat(nextBeat);
      }
      
      startMetronome();
    }
    
    setIsPlaying(true);
    startTimeTracking();
  };

  useEffect(() => {
    return () => {
      stopTimeTracking();
    };
  }, []);

=======
>>>>>>> youtuber
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[white] via-[#F9FAFB] to-[white]">
      <Header />
      
      <main className="pt-24 px-4">
<<<<<<< HEAD
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                {/* Upload button now lives in VideoControls */}
            </div>
          </div>

          <div className="mb-4 aspect-video bg-black rounded-lg overflow-hidden">
            <VideoPlayer
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
=======
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
>>>>>>> youtuber
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
<<<<<<< HEAD
              onSpeedChange={handleSpeedChange}
              onAddCue={handleAddCue}
              onToggleOverlay={handleToggleOverlay}
              overlaysVisible={overlaysVisible}
              playbackSpeed={playbackSpeed}
                onUploadVideo={handleVideoUpload}
                uploadButtonId="video-upload-controls"
            />
          </div>

          <div className="space-y-6">
            <MetronomeControls
              bpm={bpm ?? 0}
              currentBeat={currentBeat}
              isRunning={isMetronomeRunning}
              timeMode={timeMode}
              isMuted={isMuted}
              isLocked={isLocked}
              isCapturingSync={isCapturingSync}
              capturedBeatsCount={capturedBeats.length}
              syncAccuracy={syncReference?.accuracy}
              onTapTempo={tapTempo}
              onStart={handleStartMetronome}
              onStop={stopMetronome}
              onAdjustBpm={adjustBpm}
              onBpmChange={(newBpm) => adjustBpm(newBpm - (bpm ?? 0))}
              onTimeModeChange={setTimeMode}
              onToggleMute={toggleMute}
              onLockSync={handleLockSync}
              getTimeModeConfig={getTimeModeConfig}
              getCurrentVideoTime={getCurrentVideoTime}
            />

=======
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
>>>>>>> youtuber
            <CueList
              cuePoints={cuePoints}
              currentTime={currentTime}
              onEdit={handleEditCue}
              onDelete={handleDeleteCue}
              onJump={handleJumpToTimestamp}
<<<<<<< HEAD
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
=======
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
>>>>>>> youtuber
        </div>
      </main>
      <Footer />
    </div>
  );
}
