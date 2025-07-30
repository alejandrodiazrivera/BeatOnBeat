import { useState, useEffect, useCallback, useRef } from 'react';

type AudioNodeRef = OscillatorNode | AudioBufferSourceNode | null;

export const useMetronome = (initialBpm = 100) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickSourcesRef = useRef<AudioNodeRef[]>([]);

  useEffect(() => {
    const initAudio = async () => {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = beat === 1 || beat === 5 ? 800 : 600;
    
    const now = audioContextRef.current.currentTime;
    if (beat === 1 || beat === 5) {
      gainNode.gain.setValueAtTime(0.7, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else {
      gainNode.gain.setValueAtTime(0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start();
    oscillator.stop(now + (beat === 1 || beat === 5 ? 0.2 : 0.1));
    
    clickSourcesRef.current.push(oscillator);
    
    oscillator.onended = () => {
      clickSourcesRef.current = clickSourcesRef.current.filter(
        s => s !== oscillator
      );
      gainNode.disconnect();
    };
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentBeat(1);
    playClick(1);
    
    const interval = 60000 / bpm;
    timerRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = prev === 8 ? 1 : prev + 1;
        playClick(nextBeat);
        return nextBeat;
      });
    }, interval);
  }, [bpm, isRunning, playClick]);

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
        timerRef.current = setInterval(() => {
          setCurrentBeat(prev => {
            const nextBeat = prev === 8 ? 1 : prev + 1;
            playClick(nextBeat);
            return nextBeat;
          });
        }, interval);
      }
    }
  }, [isRunning, playClick]);

  const adjustBpm = useCallback((amount: number) => {
    setBpmPrecise(bpm + amount);
  }, [bpm, setBpmPrecise]);

  const tapTempo = useCallback(() => {
    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current, now].slice(-4);
    
    if (tapTimesRef.current.length > 1) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
      const tappedBpm = 60000 / avgInterval;
      setBpmPrecise(tappedBpm);
    }
  }, [setBpmPrecise]);

  return {
    bpm,
    currentBeat,
    isRunning,
    tapTempo,
    start,
    stop,
    adjustBpm,
    setBpm: setBpmPrecise,
    setCurrentBeat
  };
};