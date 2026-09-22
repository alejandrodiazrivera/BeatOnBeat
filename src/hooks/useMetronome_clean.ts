import { useState, useEffect, useRef, useCallback } from 'react';

export const useMetronome = (initialBpm = 100, beatsPerCycle = 8) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickSourcesRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
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

  // Play click, accent beats 4 and 8
  const playClick = useCallback((beat: number) => {
    if (!audioContextRef.current || isMuted) return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.type = 'square';
    
    // Strong beats on 4 and 8
    if (beat === 4 || beat === 8) {
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
  }, [isMuted]);

  const start = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(true);
    setCurrentBeat(1);
    playClick(1);
    timerRef.current = setInterval(() => {
      setCurrentBeat(prev => {
        const nextBeat = prev === beatsPerCycle ? 1 : prev + 1;
        playClick(nextBeat);
        return nextBeat;
      });
    }, 60000 / bpm);
  }, [bpm, playClick, beatsPerCycle]);

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
      timerRef.current = setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = prev === beatsPerCycle ? 1 : prev + 1;
          playClick(nextBeat);
          return nextBeat;
        });
      }, 60000 / bpm);
    }
  }, [bpm, isRunning, playClick, beatsPerCycle]);

  const setBpmPrecise = useCallback((newBpm: number | string) => {
    const numericBpm = typeof newBpm === 'string' ? parseFloat(newBpm) : newBpm;
    if (isNaN(numericBpm)) return;
    setBpm(Math.max(40, Math.min(300, numericBpm)));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    bpm,
    currentBeat,
    isRunning,
    isMuted,
    start,
    stop,
    setBpm: setBpmPrecise,
    setCurrentBeat,
    toggleMute
  };
};
