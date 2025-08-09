import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [timeMode, setTimeMode] = useState<TimeMode>('8-beat');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0); // Track when metronome started
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickSourcesRef = useRef<AudioNodeRef[]>([]);

  // Time mode configurations
  const getTimeModeConfig = (mode: TimeMode) => {
    switch (mode) {
      case '8-beat':
        return {
          beatsPerCycle: 8,
          strongBeats: [1, 5] // Start of each 4/4 measure
        };
      case 'flamenco-12':
        return {
          beatsPerCycle: 12,
          strongBeats: [3, 6, 8, 10, 12] // Authentic flamenco accents
        };
      default:
        return {
          beatsPerCycle: 8,
          strongBeats: [1, 5]
        };
    }
  };

  useEffect(() => {
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
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'sine';
    
    if (timeMode === 'flamenco-12') {
      // Authentic flamenco sound pattern
      if (config.strongBeats.includes(beat)) {
        // Accented beats (3, 6, 8, 10, 12) - deeper, more resonant
        oscillator.frequency.value = 400; // Lower frequency for flamenco accents
        gainNode.gain.setValueAtTime(0.8, audioContextRef.current.currentTime);
      } else {
        // Non-accented beats - lighter
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
      }
    } else {
      // Original 8-beat pattern
      oscillator.frequency.value = config.strongBeats.includes(beat) ? 800 : 600;
      gainNode.gain.setValueAtTime(config.strongBeats.includes(beat) ? 0.7 : 0.5, audioContextRef.current.currentTime);
    }
    
    const now = audioContextRef.current.currentTime;
    const duration = config.strongBeats.includes(beat) ? 0.2 : 0.1;
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start();
    oscillator.stop(now + duration);
    
    clickSourcesRef.current.push(oscillator);
    
    oscillator.onended = () => {
      clickSourcesRef.current = clickSourcesRef.current.filter(
        s => s !== oscillator
      );
      gainNode.disconnect();
    };
  }, [timeMode, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Call this when lock state changes in parent
  const setLocked = useCallback((locked: boolean) => {
    isLockedRef.current = locked;
    if (!locked) correctionRef.current = null;
  }, []);

  const start = useCallback(() => {
    // Prevent multiple timers - always clear existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
    timerRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = prev === config.beatsPerCycle ? 1 : prev + 1;
        playClick(nextBeat);
        return nextBeat;
      });
    }, interval);
  }, [bpm, isRunning, timeMode, currentBeat]);

  const stop = useCallback(() => {
    // Always clear timer regardless of isRunning state to prevent orphaned timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Restart timer when playClick changes while running (e.g., when mute state changes)
  // This maintains beat synchronization by calculating the proper timing offset
  useEffect(() => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current);
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
    }
  }, [playClick, isRunning, bpm, timeMode]);

  // Cleanup effect to prevent orphaned timers
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const setBpmPrecise = useCallback((newBpm: number | string) => {
    const numericBpm = typeof newBpm === 'string' ? parseFloat(newBpm) : newBpm;
    if (isNaN(numericBpm)) return;
    
    const validatedBpm = parseFloat(Math.max(40, Math.min(300, numericBpm)).toFixed(2));
    setBpm(validatedBpm);
    
    if (isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        const interval = 60000 / validatedBpm;
        const config = getTimeModeConfig(timeMode);
        timerRef.current = setInterval(() => {
          setCurrentBeat(prev => {
            const nextBeat = prev === config.beatsPerCycle ? 1 : prev + 1;
            playClick(nextBeat);
            return nextBeat;
          });
        }, interval);
      }
    }
  }, [isRunning, playClick, timeMode]);

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
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
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
    }
  }, [setBpmPrecise, timeMode]);

  return {
    bpm,
    currentBeat,
    isRunning,
    timeMode,
    isMuted,
    tapTempo,
    start,
    stop,
    adjustBpm,
    setBpm: setBpmPrecise,
    setCurrentBeat,
    setTimeMode,
    toggleMute,
    getTimeModeConfig: () => getTimeModeConfig(timeMode)
  };
};