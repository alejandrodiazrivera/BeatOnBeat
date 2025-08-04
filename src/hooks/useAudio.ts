import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const clickSourcesRef = useRef<(OscillatorNode | AudioBufferSourceNode)[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize audio context
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
      // Clean up all active sounds
      clickSourcesRef.current.forEach(source => {
        source.stop();
        source.disconnect();
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playClick = (beat: number) => {
    if (!audioContextRef.current || isMuted) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    
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
      clickSourcesRef.current = clickSourcesRef.current.filter(s => s !== oscillator);
      gainNode.disconnect();
    };
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return { 
    playClick,
    isMuted,
    toggleMute
  };
};