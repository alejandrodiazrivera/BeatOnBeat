import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const getAudioContextConstructor = (): typeof AudioContext => {
  return window.AudioContext ?? window.webkitAudioContext ?? AudioContext;
};

export const useMetronome = (initialBpm = 100) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
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
    const AudioContextConstructor = getAudioContextConstructor();
    audioContextRef.current = new AudioContextConstructor();
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

  // Play click, accent beats based on time mode
  const playClick = useCallback((beat: number) => {
    if (!audioContextRef.current || isMuted) return;
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

  const start = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(true);
    setCurrentBeat(1);
    playClick(1);
    
    const beatsInCycle = getCurrentBeatsPerCycle();
    
    timerRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = prev === beatsInCycle ? 1 : prev + 1;
        playClick(nextBeat);
        return nextBeat;
      });
    }, 60000 / bpm);
  }, [bpm, playClick, getCurrentBeatsPerCycle]);

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
      const beatsInCycle = getCurrentBeatsPerCycle();
      
      timerRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = prev === beatsInCycle ? 1 : prev + 1;
          playClick(nextBeat);
          return nextBeat;
        });
      }, 60000 / bpm);
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
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      
      const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / averageInterval);
      
      // Only update if the BPM is reasonable
      if (calculatedBpm >= 40 && calculatedBpm <= 300) {
        setBpm(calculatedBpm);
      }
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