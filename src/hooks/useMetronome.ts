import { useState, useEffect, useRef, useCallback } from 'react';

<<<<<<< HEAD
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type AudioNodeRef = OscillatorNode | null;
type TimeMode = '8-beat' | 'flamenco-12';

export const useMetronome = () => {
  // Live beat correction state
  const correctionRef = useRef<{offset: number, beatsRemaining: number, step: number} | null>(null);
  const isLockedRef = useRef(false);

  const [bpm, setBpm] = useState<number | null>(null);
=======
export const useMetronome = (initialBpm = 100, beatsPerCycle = 8) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
>>>>>>> youtuber
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [timeMode, setTimeMode] = useState<'8-beat' | 'flamenco-12'>('8-beat');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickSourcesRef = useRef<OscillatorNode[]>([]);
  const tapTimesRef = useRef<number[]>([]);

  // Time mode configuration
  const getTimeModeConfig = useCallback(() => {
    switch (timeMode) {
      case 'flamenco-12':
        return { 
          beatsPerCycle: 12, 
          strongBeats: [1, 3, 6, 8, 10],
          name: 'Flamenco (12-beat)'
        };
      case '8-beat':
      default:
        return { 
          beatsPerCycle: 8, 
          strongBeats: [4, 8],
          name: '8-Beat'
        };
    }
  }, [timeMode]);

  // Get current beats per cycle based on time mode
  const getCurrentBeatsPerCycle = useCallback(() => {
    const config = getTimeModeConfig();
    return config.beatsPerCycle;
  }, [getTimeModeConfig]);

  useEffect(() => {
<<<<<<< HEAD
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        
        // Resume audio context if it's suspended (common on mobile)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
      }
    };

    const handleFirstInteraction = async () => {
      await initAudio();
      
      // Additional mobile-specific audio context activation
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
        } catch (error) {
          console.warn('Failed to resume audio context:', error);
        }
      }
      
      // Remove listeners after successful activation
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    // Listen for multiple interaction types (including touch for mobile)
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

=======
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
>>>>>>> youtuber
    return () => {
      // Remove all event listeners
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      
      clickSourcesRef.current.forEach(source => {
        if (source) {
          source.stop();
          source.disconnect();
        }
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

<<<<<<< HEAD
  const playClick = useCallback(async (beat: number) => {
    if (!audioContextRef.current || isMuted) return;
    
    // Ensure audio context is resumed (important for mobile)
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
        return;
      }
    }
    
    const config = getTimeModeConfig(timeMode);
=======
  // Play click, accent beats based on time mode
  const playClick = useCallback((beat: number) => {
    if (!audioContextRef.current || isMuted) return;
>>>>>>> youtuber
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.type = 'square';
    
    const config = getTimeModeConfig();
    const isStrongBeat = config.strongBeats.includes(beat);
    
    if (isStrongBeat) {
      oscillator.frequency.value = 2000;
      gainNode.gain.setValueAtTime(1.0, audioContextRef.current.currentTime);
    } else {
      oscillator.frequency.value = 1500;
      gainNode.gain.setValueAtTime(0.7, audioContextRef.current.currentTime);
    }
    
    const now = audioContextRef.current.currentTime;
    const duration = 0.05;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.start();
    oscillator.stop(now + duration);
    clickSourcesRef.current.push(oscillator);
    oscillator.onended = () => {
      clickSourcesRef.current = clickSourcesRef.current.filter(s => s !== oscillator);
      gainNode.disconnect();
    };
  }, [isMuted, getTimeModeConfig]);

  // Call this when lock state changes in parent
  const setLocked = useCallback((locked: boolean) => {
    isLockedRef.current = locked;
    if (!locked) correctionRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
<<<<<<< HEAD
    // If BPM is unknown, set to 100 before starting
    if (bpm === null) {
      setBpm(100);
    }
    // If already running, stop first to prevent double timers
    if (isRunning) {
      setIsRunning(false);
      setTimeout(() => {
        setIsRunning(true);
        startTimeRef.current = Date.now();
        const config = getTimeModeConfig(timeMode);
        const startBeat = (timeMode === 'flamenco-12' && currentBeat === 12) ? 12 : 1;
        if (startBeat === 1) {
          setCurrentBeat(1);
        }
        playClick(startBeat);
        const interval = 60000 / (bpm === null ? 100 : bpm);
        timerRef.current = setInterval(() => {
          setCurrentBeat(prev => {
            const nextBeat = prev === config.beatsPerCycle ? 1 : prev + 1;
            playClick(nextBeat);
            return nextBeat;
          });
        }, interval);
      }, 10);
      return;
    }
    const config = getTimeModeConfig(timeMode);
    setIsRunning(true);
    startTimeRef.current = Date.now();
    const startBeat = (timeMode === 'flamenco-12' && currentBeat === 12) ? 12 : 1;
    if (startBeat === 1) {
      setCurrentBeat(1);
    }
    playClick(startBeat);
    const interval = 60000 / (bpm === null ? 100 : bpm);
=======
    setIsRunning(true);
    setCurrentBeat(1);
    playClick(1);
    
    const beatsInCycle = getCurrentBeatsPerCycle();
    
>>>>>>> youtuber
    timerRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = prev === beatsInCycle ? 1 : prev + 1;
        playClick(nextBeat);
        return nextBeat;
      });
<<<<<<< HEAD
    }, interval);
  }, [bpm, isRunning, timeMode, currentBeat]);
=======
    }, 60000 / bpm);
  }, [bpm, playClick, getCurrentBeatsPerCycle]);
>>>>>>> youtuber

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Update BPM while running
  useEffect(() => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current);
<<<<<<< HEAD
      timerRef.current = null;
      const config = getTimeModeConfig(timeMode);
      const beatDuration = 60000 / (bpm === null ? 100 : bpm);
      const elapsedTime = Date.now() - startTimeRef.current;
      const elapsedBeats = Math.floor(elapsedTime / beatDuration);
      const timeInCurrentBeat = elapsedTime % beatDuration;
      const timeToNextBeat = beatDuration - timeInCurrentBeat;
      const expectedBeat = (elapsedBeats % config.beatsPerCycle) + 1;
      setCurrentBeat(expectedBeat);

      // Correction logic: apply step if active
      let correctionStep = 0;
      if (correctionRef.current && correctionRef.current.beatsRemaining > 0) {
        correctionStep = correctionRef.current.step;
        correctionRef.current.beatsRemaining -= 1;
        if (correctionRef.current.beatsRemaining === 0) correctionRef.current = null;
      }

      const timeoutId = setTimeout(() => {
        if (isRunning && !timerRef.current) {
          setCurrentBeat(prev => {
            const nextBeat = prev === config.beatsPerCycle ? 1 : prev + 1;
            playClick(nextBeat);
            return nextBeat;
          });
          timerRef.current = setInterval(() => {
            setCurrentBeat(prev => {
              const nextBeat = prev === config.beatsPerCycle ? 1 : prev + 1;
              playClick(nextBeat);
              return nextBeat;
            });
          }, beatDuration + correctionStep);
        }
      }, timeToNextBeat + correctionStep);
      return () => {
        clearTimeout(timeoutId);
      };
=======
      const beatsInCycle = getCurrentBeatsPerCycle();
      
      timerRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = prev === beatsInCycle ? 1 : prev + 1;
          playClick(nextBeat);
          return nextBeat;
        });
      }, 60000 / bpm);
>>>>>>> youtuber
    }
  }, [bpm, isRunning, playClick, getCurrentBeatsPerCycle]);

  // Reset beat when time mode changes
  useEffect(() => {
    if (isRunning) {
      setCurrentBeat(1);
    }
  }, [timeMode, isRunning]);

  const setBpmPrecise = useCallback((newBpm: number | string) => {
    const numericBpm = typeof newBpm === 'string' ? parseFloat(newBpm) : newBpm;
    if (isNaN(numericBpm)) return;
    setBpm(Math.max(40, Math.min(300, numericBpm)));
  }, []);

<<<<<<< HEAD
  const adjustBpm = useCallback((amount: number) => {
  setBpmPrecise((bpm === null ? 100 : bpm) + amount);
  }, [bpm, setBpmPrecise]);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current, now].slice(-8);

    // If locked, use tap for correction
    if (isLockedRef.current) {
      // Correction logic: compare tap to closest predicted beat
      // For demo, assume predicted beats are every beatDuration from startTimeRef
      if (!bpm) return;
      const beatDuration = 60000 / bpm;
      const elapsed = now - startTimeRef.current;
      const predictedBeatNum = Math.round(elapsed / beatDuration);
      const predictedBeatTime = startTimeRef.current + predictedBeatNum * beatDuration;
      const offset = now - predictedBeatTime;
      // Only correct if within ±100ms
      if (Math.abs(offset) <= 100) {
        // Smooth correction over next 8 beats
        correctionRef.current = {
          offset,
          beatsRemaining: 8,
          step: offset / 8
        };
      }
      return;
    }

    // Normal tap tempo logic (unlocked)
    if (tapTimesRef.current.length > 1) {
=======
  const adjustBpm = useCallback((delta: number) => {
    setBpm(prev => Math.max(40, Math.min(300, prev + delta)));
  }, []);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    tapTimesRef.current.push(now);
    
    // Keep only the last 4 taps
    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current = tapTimesRef.current.slice(-4);
    }
    
    // Need at least 2 taps to calculate BPM
    if (tapTimesRef.current.length >= 2) {
>>>>>>> youtuber
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
<<<<<<< HEAD
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      let tappedBpm;
      if (timeMode === '8-beat') {
        tappedBpm = 60000 / avgInterval;
      } else if (timeMode === 'flamenco-12') {
        if (tapTimesRef.current.length >= 6) {
          const variance = intervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - avgInterval, 2);
          }, 0) / intervals.length;
          const isRegularTapping = variance < (avgInterval * 0.15);
          if (isRegularTapping) {
            const possibleQuarterTempo = 60000 / avgInterval;
            if (possibleQuarterTempo > 200) {
              tappedBpm = possibleQuarterTempo * 0.6;
            } else {
              tappedBpm = possibleQuarterTempo;
            }
          } else {
            tappedBpm = 60000 / avgInterval;
          }
        } else {
          tappedBpm = 60000 / avgInterval;
        }
      } else {
        tappedBpm = 60000 / avgInterval;
      }
      setBpmPrecise(tappedBpm);
=======
      
      const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / averageInterval);
      
      // Only update if the BPM is reasonable
      if (calculatedBpm >= 40 && calculatedBpm <= 300) {
        setBpm(calculatedBpm);
      }
>>>>>>> youtuber
    }
    
    // Clear old taps after 3 seconds
    setTimeout(() => {
      const cutoff = Date.now() - 3000;
      tapTimesRef.current = tapTimesRef.current.filter(time => time > cutoff);
    }, 3000);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    bpm,
    currentBeat,
    isRunning,
    isMuted,
    timeMode,
    start,
    stop,
    setBpm: setBpmPrecise,
    setCurrentBeat,
    adjustBpm,
    setTimeMode,
    tapTempo,
    toggleMute,
    getTimeModeConfig
  };
};