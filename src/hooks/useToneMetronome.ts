import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface ToneMetronomeConfig {
  highFreq: number;
  lowFreq: number;
  attackTime: number;
  releaseTime: number;
  volume: number;
}

export const useToneMetronome = (
  initialBpm: number = 100,
  timeMode: '8-beat' | 'flamenco-12' = '8-beat'
) => {
  const [bpm, setBpm] = useState(initialBpm);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Tone.js references
  const synthRef = useRef<Tone.Synth | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);
  
  // Metronome configuration
  const configRef = useRef<ToneMetronomeConfig>({
    highFreq: 800,  // Strong beat frequency
    lowFreq: 600,   // Weak beat frequency  
    attackTime: 0.01,
    releaseTime: 0.1,
    volume: -10 // dB
  });

  // Get time mode configuration
  const getTimeModeConfig = useCallback(() => {
    const config = timeMode === '8-beat' 
      ? { beatsPerCycle: 8, strongBeats: [8, 4] }
      : { beatsPerCycle: 12, strongBeats: [1, 4, 7, 10] };
    
    console.log('🔧 METRONOME CONFIG:', timeMode, config);
    return config;
  }, [timeMode]);

  // Initialize Tone.js components
  const initializeTone = useCallback(async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Create synth for metronome clicks
      if (!synthRef.current) {
        synthRef.current = new Tone.Synth({
          oscillator: {
            type: 'sine'
          },
          envelope: {
            attack: configRef.current.attackTime,
            decay: 0.01,
            sustain: 0.1,
            release: configRef.current.releaseTime
          }
        });
      }

      // Create volume control
      if (!volumeRef.current) {
        volumeRef.current = new Tone.Volume(configRef.current.volume);
        synthRef.current.connect(volumeRef.current);
        volumeRef.current.toDestination();
      }

      // Ensure Transport is set up
      if (Tone.Transport.state === 'stopped') {
        Tone.Transport.bpm.value = bpm;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Tone.js metronome:', error);
      return false;
    }
  }, [bpm]);

  // Create metronome click sound
  const playClick = useCallback((isStrongBeat: boolean = false, time?: number) => {
    if (!synthRef.current || isMuted) return;
    
    const frequency = isStrongBeat ? configRef.current.highFreq : configRef.current.lowFreq;
    const duration = isStrongBeat ? '16n' : '32n'; // Strong beats are longer
    
    try {
      if (time !== undefined) {
        // Use the scheduled time from the loop
        synthRef.current.triggerAttackRelease(frequency, duration, time);
      } else {
        // For immediate playback (like tap tempo)
        synthRef.current.triggerAttackRelease(frequency, duration);
      }
    } catch (error) {
      console.warn('Click playback error:', error);
    }
  }, [isMuted]);

  const stop = useCallback(() => {
    if (loopRef.current) {
      loopRef.current.stop();
      loopRef.current.dispose();
      loopRef.current = null;
    }
    
    setIsRunning(false);
    setCurrentBeat(1);
    console.log('🛑 Tone.js metronome stopped');
  }, []);

  // Start metronome
  const start = useCallback(async (syncedBeat?: number) => {
    console.log('🎵 Metronome start called, isRunning:', isRunning);
    
    if (isRunning) {
      // Stop current metronome first
      stop();
      // Minimal delay for cleanup - reduced from 50ms to 10ms
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const initialized = await initializeTone();
    console.log('🎵 Tone.js initialized:', initialized);
    
    if (!synthRef.current) {
      console.error('❌ Synth not available after initialization');
      return;
    }
    // Set starting beat (reset to 1 or use synced beat)
    const startingBeat = syncedBeat !== undefined ? syncedBeat : 1;
    setCurrentBeat(startingBeat);

    // Create beat counter ref for tracking current beat
    const beatCounter = { current: startingBeat };
    
    // Create metronome loop
    const loop = new Tone.Loop((time) => {
      const { beatsPerCycle, strongBeats } = getTimeModeConfig();
      const currentBeat = beatCounter.current;
      const isStrong = strongBeats.includes(currentBeat);
      
      // Debug logging to see beat patterns
      console.log(`🥁 Beat ${currentBeat}: ${isStrong ? 'STRONG' : 'weak'} (${isStrong ? configRef.current.highFreq : configRef.current.lowFreq}Hz)`);
      
      // Play click for current beat with precise timing
      playClick(isStrong, time);
      
      // Update React state
      setCurrentBeat(currentBeat);
      
      // Increment beat for next iteration
      beatCounter.current = currentBeat >= beatsPerCycle ? 1 : currentBeat + 1;
    }, `4n`); // Use quarter note timing for precise BPM sync

    // Set transport BPM to match our metronome BPM
    Tone.Transport.bpm.value = bpm;

    // Start the transport and loop with minimal latency
    if (Tone.Transport.state !== 'started') {
      Tone.Transport.start();
    }
    
    // Start the loop immediately - no delay for first beat
    loop.start(0);
    loopRef.current = loop;
    setIsRunning(true);
    
    console.log(`🎵 Tone.js metronome started at ${bpm} BPM, loop created:`, loop);
  }, [isRunning, bpm, getTimeModeConfig, initializeTone, playClick, stop]);

  // Adjust BPM
  const adjustBpm = useCallback((amount: number) => {
    const newBpm = Math.max(60, Math.min(200, bpm + amount));
    setBpm(newBpm);
    
    // Update running loop if active
    if (loopRef.current && isRunning) {
      loopRef.current.interval = `${60 / newBpm}s`;
      Tone.Transport.bpm.value = newBpm;
    }
    
    console.log(`🎶 BPM adjusted to ${newBpm}`);
    return newBpm;
  }, [bpm, isRunning]);

  // Set BPM directly
  const setBPM = useCallback((newBpm: number) => {
    const clampedBpm = Math.max(60, Math.min(200, newBpm));
    setBpm(clampedBpm);
    
    // Update running loop if active
    if (loopRef.current && isRunning) {
      loopRef.current.interval = `${60 / clampedBpm}s`;
      Tone.Transport.bpm.value = clampedBpm;
    }
    
    return clampedBpm;
  }, [isRunning]);

  // Sync to external beat (for auto-sync)
  const syncToBeat = useCallback((targetBeat: number, phase: number = 0) => {
    if (!isRunning || !loopRef.current) return;
    
    // Stop current loop
    loopRef.current.stop();
    
    // Set beat position
    setCurrentBeat(targetBeat);
    
    // Restart with phase offset
    const phaseOffset = phase > 0 ? `+${phase}s` : phase < 0 ? `${phase}s` : '';
    loopRef.current.start(`+0.01s${phaseOffset}`);
    
    console.log(`🔄 Synced to beat ${targetBeat} with phase ${phase.toFixed(3)}s`);
  }, [isRunning]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    
    if (volumeRef.current) {
      volumeRef.current.volume.value = isMuted ? configRef.current.volume : -Infinity;
    }
  }, [isMuted]);

  // Tap tempo functionality  
  const tapHistoryRef = useRef<number[]>([]);
  const tapTempo = useCallback(() => {
    const now = Date.now();
    const tapHistory = tapHistoryRef.current;
    
    tapHistory.push(now);
    
    // Keep only last 8 taps
    if (tapHistory.length > 8) {
      tapHistory.shift();
    }
    
    if (tapHistory.length >= 2) {
      // Calculate intervals
      const intervals = [];
      for (let i = 1; i < tapHistory.length; i++) {
        intervals.push(tapHistory[i] - tapHistory[i - 1]);
      }
      
      // Calculate average interval
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      const newBpm = Math.round(60000 / avgInterval); // Convert ms to BPM
      
      // Intelligent BPM interpretation based on context
      let adjustedBpm = newBpm;
      if (newBpm >= 40 && newBpm <= 60) {
        adjustedBpm = newBpm * 4; // Likely whole notes
      } else if (newBpm >= 60 && newBpm <= 80) {
        adjustedBpm = newBpm * 2; // Likely half notes
      } else if (newBpm >= 180 && newBpm <= 300) {
        adjustedBpm = Math.round(newBpm / 2); // Likely eighth notes
      } else if (newBpm > 300) {
        adjustedBpm = Math.round(newBpm / 4); // Likely sixteenth notes
      }
      
      // Clamp to reasonable range
      adjustedBpm = Math.max(60, Math.min(200, adjustedBpm));
      setBPM(adjustedBpm);
      
      console.log(`🥁 Tap tempo: ${adjustedBpm} BPM (from ${tapHistory.length} taps)`);
      return adjustedBpm;
    }
    
    return bpm;
  }, [bpm, setBPM]);

  // Cleanup function
  const cleanup = useCallback(() => {
    stop();
    
    if (synthRef.current) {
      synthRef.current.dispose();
      synthRef.current = null;
    }
    
    if (volumeRef.current) {
      volumeRef.current.dispose();
      volumeRef.current = null;
    }
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<ToneMetronomeConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };
    
    // Update volume if changed
    if (newConfig.volume !== undefined && volumeRef.current) {
      volumeRef.current.volume.value = isMuted ? -Infinity : newConfig.volume;
    }
  }, [isMuted]);

  return {
    // State
    bpm,
    currentBeat,
    isRunning,
    isMuted,
    
    // Controls
    start,
    stop,
    adjustBpm,
    setBPM,
    toggleMute,
    tapTempo,
    
    // Sync functions
    syncToBeat,
    
    // Config
    getTimeModeConfig,
    updateConfig,
    
    // Utilities
    cleanup
  };
};
