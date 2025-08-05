import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

type AudioNodeRef = OscillatorNode | null;
type TimeMode = '8-beat' | 'flamenco-12';

export const useMetronome = (initialBpm = 100) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [timeMode, setTimeMode] = useState<TimeMode>('8-beat');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  
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
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    };

    const handleFirstInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
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

  const playClick = useCallback((beat: number) => {
    if (!audioContextRef.current) return;
    
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
  }, [timeMode]);

  const start = useCallback(() => {
    if (isRunning) return;
    
    const config = getTimeModeConfig(timeMode);
    setIsRunning(true);
    
    // For flamenco mode, if currentBeat is already set to 12, start there
    // Otherwise, start at beat 1 for normal operation
    const startBeat = (timeMode === 'flamenco-12' && currentBeat === 12) ? 12 : 1;
    if (startBeat === 1) {
      setCurrentBeat(1);
    }
    playClick(startBeat);
    
    const interval = 60000 / bpm;
    timerRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = prev === config.beatsPerCycle ? 1 : prev + 1;
        playClick(nextBeat);
        return nextBeat;
      });
    }, interval);
  }, [bpm, isRunning, playClick, timeMode, currentBeat]);

  const stop = useCallback(() => {
    if (!isRunning) return;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  }, [isRunning]);

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
    setBpmPrecise(bpm + amount);
  }, [bpm, setBpmPrecise]);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current, now].slice(-8); // Keep more taps for better accuracy
    
    if (tapTimesRef.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      
      // Calculate BPM based on time mode and intelligent pattern detection
      const config = getTimeModeConfig(timeMode);
      let tappedBpm;
      
      if (timeMode === '8-beat') {
        // Two 4/4 measures: Users typically tap quarter notes
        // Each tap = one quarter note = one metronome beat
        tappedBpm = 60000 / avgInterval;
      } else if (timeMode === 'flamenco-12') {
        // Flamenco 12-beat compás: More complex - users might tap different patterns
        
        // Check if user is tapping on strong beats (3, 6, 8, 10, 12)
        // If intervals are consistent and we have enough taps, try to detect pattern
        if (tapTimesRef.current.length >= 6) {
          // Calculate variance to see if tapping is regular
          const variance = intervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - avgInterval, 2);
          }, 0) / intervals.length;
          
          const isRegularTapping = variance < (avgInterval * 0.15); // Slightly more tolerance for flamenco
          
          if (isRegularTapping) {
            // Check if they're tapping on accented beats only
            // In flamenco, strong beats are not evenly spaced, so this is more complex
            const possibleQuarterTempo = 60000 / avgInterval;
            
            // For flamenco, we'll be more conservative and assume quarter note tapping
            // unless the tempo seems too fast (suggesting they're tapping accents only)
            if (possibleQuarterTempo > 200) {
              // Too fast - they might be tapping quarter notes of a slower tempo
              tappedBpm = possibleQuarterTempo * 0.6; // Adjust down
            } else {
              tappedBpm = possibleQuarterTempo;
            }
          } else {
            // Irregular tapping, assume quarter notes
            tappedBpm = 60000 / avgInterval;
          }
        } else {
          // Not enough data, assume quarter note tapping
          tappedBpm = 60000 / avgInterval;
        }
      } else {
        // Default: treat each tap as quarter note
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
    tapTempo,
    start,
    stop,
    adjustBpm,
    setBpm: setBpmPrecise,
    setCurrentBeat,
    setTimeMode,
    getTimeModeConfig: () => getTimeModeConfig(timeMode)
  };
};