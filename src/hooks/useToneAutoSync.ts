import { useState, useCallback, useRef, useEffect } from 'react';
import * as Tone from 'tone';

interface SyncReference {
  bpm: number;
  beat: number;
  videoTime: number;
  phase: number;
  startTime: number;
}

interface BeatGridPoint {
  time: number;
  beat: number;
  isStrong: boolean;
}

export const useToneAutoSync = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [detectedBPM, setDetectedBPM] = useState<number | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [syncReference, setSyncReference] = useState<SyncReference | null>(null);
  const [beatGrid, setBeatGrid] = useState<BeatGridPoint[]>([]);
  
  // Tone.js references
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const mediaElementRef = useRef<MediaElementAudioSourceNode | null>(null);
  const continuousMonitoringRef = useRef<number | null>(null);
  const beatDetectionRef = useRef<{
    lastBeatTime: number;
    beatIntervals: number[];
    energyHistory: number[];
    threshold: number;
  }>({
    lastBeatTime: 0,
    beatIntervals: [],
    energyHistory: [],
    threshold: 0.3
  });

  // Initialize Tone.js audio analysis
  const initializeAudioAnalysis = useCallback(async () => {
    try {
      // Start Tone.js audio context
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Create analyser for beat detection
      if (!analyserRef.current) {
        analyserRef.current = new Tone.Analyser('fft', 1024);
        analyserRef.current.smoothing = 0.3;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Tone.js:', error);
      return false;
    }
  }, []);

  // Stop continuous monitoring
  const stopContinuousMonitoring = useCallback(() => {
    if (continuousMonitoringRef.current) {
      clearTimeout(continuousMonitoringRef.current);
      continuousMonitoringRef.current = null;
      console.log('⏹️ Stopped continuous auto-sync monitoring');
    }
  }, []);

  // Generate beat grid with strong/weak beat patterns
  const generateBeatGrid = useCallback((bpm: number, timeMode: '8-beat' | 'flamenco-12', duration: number = 300) => {
    const beatInterval = 60 / bpm; // seconds per beat
    const grid: BeatGridPoint[] = [];
    
    // Define strong beat patterns
    const strongBeats = timeMode === '8-beat' 
      ? [1, 5] // Strong beats on 1 and 5 in 8-beat
      : [1, 4, 7, 10]; // Strong beats in Flamenco 12-beat pattern
    
    const beatsPerCycle = timeMode === '8-beat' ? 8 : 12;
    
    let beatNumber = 1;
    for (let time = 0; time < duration; time += beatInterval) {
      const currentBeat = ((beatNumber - 1) % beatsPerCycle) + 1;
      grid.push({
        time,
        beat: currentBeat,
        isStrong: strongBeats.includes(currentBeat)
      });
      beatNumber++;
    }
    
    return grid;
  }, []);

  // Advanced BPM detection using Tone.js
  const detectBPMFromVideo = useCallback(async (videoElement?: HTMLVideoElement) => {
    if (!analyserRef.current) {
      await initializeAudioAnalysis();
    }

    return new Promise<number>((resolve) => {
      setIsDetecting(true);
      
      const analysisStartTime = Tone.now();
      const analysisTime = 8; // 8 seconds of analysis
      const detection = beatDetectionRef.current;
      
      // Reset detection state
      detection.lastBeatTime = 0;
      detection.beatIntervals = [];
      detection.energyHistory = [];

      const analyze = () => {
        const currentTime = Tone.now();
        
        if (currentTime - analysisStartTime > analysisTime) {
          // Analysis complete
          let detectedBPM = 120; // Default fallback
          
          if (detection.beatIntervals.length > 3) {
            // Calculate BPM from detected beat intervals
            const avgInterval = detection.beatIntervals.reduce((sum, interval) => sum + interval, 0) / detection.beatIntervals.length;
            const rawBPM = 60 / avgInterval;
            
            // Intelligent BPM interpretation
            if (rawBPM >= 40 && rawBPM <= 60) {
              detectedBPM = Math.round(rawBPM * 4); // Likely whole notes
            } else if (rawBPM >= 60 && rawBPM <= 80) {
              detectedBPM = Math.round(rawBPM * 2); // Likely half notes
            } else if (rawBPM >= 80 && rawBPM <= 180) {
              detectedBPM = Math.round(rawBPM); // Quarter notes
            } else if (rawBPM >= 180 && rawBPM <= 300) {
              detectedBPM = Math.round(rawBPM / 2); // Eighth notes
            } else if (rawBPM > 300) {
              detectedBPM = Math.round(rawBPM / 4); // Sixteenth notes
            }
            
            // Clamp to reasonable range
            detectedBPM = Math.max(60, Math.min(200, detectedBPM));
          } else {
            // Fallback to energy-based estimation
            if (detection.energyHistory.length > 0) {
              const avgEnergy = detection.energyHistory.reduce((sum, e) => sum + e, 0) / detection.energyHistory.length;
              if (avgEnergy > 0.7) {
                detectedBPM = 128; // High energy dance music
              } else if (avgEnergy > 0.4) {
                detectedBPM = 110; // Medium energy rock/pop
              } else {
                detectedBPM = 90; // Lower energy ballad
              }
            }
          }
          
          console.log(`🎯 BPM Detection Complete: ${detectedBPM} BPM (${detection.beatIntervals.length} beats detected)`);
          setDetectedBPM(detectedBPM);
          setIsDetecting(false);
          resolve(detectedBPM);
          return;
        }

        // Analyze current audio frame
        if (analyserRef.current) {
          const fftValues = analyserRef.current.getValue() as Float32Array;
          
          // Calculate energy in bass frequencies (where beats are prominent)
          let bassEnergy = 0;
          const bassRange = Math.floor(fftValues.length * 0.1); // Lower 10% of spectrum
          
          for (let i = 0; i < bassRange; i++) {
            const magnitude = typeof fftValues[i] === 'number' ? fftValues[i] : fftValues[i];
            bassEnergy += magnitude * magnitude;
          }
          
          bassEnergy = Math.sqrt(bassEnergy / bassRange);
          detection.energyHistory.push(bassEnergy);
          
          // Beat detection using energy threshold
          if (detection.energyHistory.length > 5) {
            const recentAvg = detection.energyHistory.slice(-5).reduce((sum, e) => sum + e, 0) / 5;
            
            if (bassEnergy > recentAvg * (1 + detection.threshold)) {
              if (detection.lastBeatTime > 0) {
                const interval = currentTime - detection.lastBeatTime;
                // Accept reasonable beat intervals (0.3 - 2 seconds)
                if (interval > 0.3 && interval < 2) {
                  detection.beatIntervals.push(interval);
                  console.log(`🥁 Beat detected! Interval: ${interval.toFixed(3)}s`);
                }
              }
              detection.lastBeatTime = currentTime;
            }
          }
        }
        
        // Continue analysis
        requestAnimationFrame(analyze);
      };

      // Start analysis
      analyze();
    });
  }, [initializeAudioAnalysis]);

  // Continuous monitoring for drift correction
  const startContinuousMonitoring = useCallback(() => {
    if (continuousMonitoringRef.current) return; // Already monitoring
    
    console.log('🔄 Starting continuous auto-sync monitoring...');
    
    const monitor = () => {
      if (!isLocked || !syncReference) {
        continuousMonitoringRef.current = null;
        return;
      }
      
      // Re-detect BPM every 30 seconds for drift correction
      detectBPMFromVideo().then((newBPM) => {
        if (syncReference && Math.abs(newBPM - syncReference.bpm) > 3) {
          console.log(`🎯 Drift detected: ${syncReference.bpm} → ${newBPM} BPM, auto-correcting...`);
          
          // Update sync reference with corrected BPM
          const correctedSync = {
            ...syncReference,
            bpm: newBPM,
            startTime: Tone.now() // Reset timing reference
          };
          
          setSyncReference(correctedSync);
          setDetectedBPM(newBPM);
        }
      }).catch((error) => {
        console.warn('Continuous monitoring detection failed:', error);
      });
      
      // Schedule next monitoring cycle in 30 seconds
      continuousMonitoringRef.current = window.setTimeout(monitor, 30000);
    };
    
    // Start first monitoring cycle in 10 seconds (after initial lock)
    continuousMonitoringRef.current = window.setTimeout(monitor, 10000);
  }, [isLocked, syncReference, detectBPMFromVideo]);

  // Connect video element to Tone.js for analysis
  const connectVideoElement = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      await initializeAudioAnalysis();
      
      if (!analyserRef.current) return false;

      // Create media element source if not exists
      if (!mediaElementRef.current && videoElement) {
        // Check if video element is already connected to avoid InvalidStateError
        if ((videoElement as any)._connectedToAudioContext) {
          console.log('Video element already connected to AudioContext, skipping connection');
          return true;
        }

        // Create a separate AudioContext for analysis to avoid Tone.js conflicts
        const analysisContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const mediaSource = analysisContext.createMediaElementSource(videoElement);
        const analysisAnalyser = analysisContext.createAnalyser();
        
        // Mark video element as connected
        (videoElement as any)._connectedToAudioContext = true;
        
        // Configure the analysis analyser
        analysisAnalyser.fftSize = 2048;
        analysisAnalyser.smoothingTimeConstant = 0.8;
        
        // Connect for analysis only (separate from Tone.js)
        mediaSource.connect(analysisAnalyser);
        mediaSource.connect(analysisContext.destination);
        
        // Store the analysis setup
        mediaElementRef.current = mediaSource;
        
        // Replace Tone.js analyser with our analysis analyser for BPM detection
        const originalGetValue = analyserRef.current.getValue;
        (analyserRef.current as any).getValue = () => {
          const dataArray = new Uint8Array(analysisAnalyser.frequencyBinCount);
          analysisAnalyser.getByteFrequencyData(dataArray);
          // Convert to Float32Array to match Tone.js expectations
          const floatArray = new Float32Array(dataArray.length);
          for (let i = 0; i < dataArray.length; i++) {
            floatArray[i] = (dataArray[i] - 128) / 128; // Normalize to -1 to 1 range
          }
          return floatArray;
        };
        
        console.log('Video element connected for analysis using separate AudioContext');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to connect video element:', error);
      return false;
    }
  }, [initializeAudioAnalysis]);

  // Calculate phase alignment between video and metronome
  const calculatePhaseAlignment = useCallback((videoTime: number, bpm: number, targetBeat: number, beatsPerCycle: number) => {
    const beatInterval = 60 / bpm;
    const beatPosition = (videoTime / beatInterval) % beatsPerCycle;
    const targetPosition = targetBeat - 1; // Convert to 0-based
    const phase = (targetPosition - beatPosition) * beatInterval;
    return phase;
  }, []);

  // Lock auto-sync with current video state and start continuous monitoring
  const lockSync = useCallback(async (videoElement?: HTMLVideoElement, timeMode: '8-beat' | 'flamenco-12' = '8-beat') => {
    try {
      setIsDetecting(true);
      
      // Connect video for analysis if provided
      if (videoElement) {
        await connectVideoElement(videoElement);
      }
      
      // Detect initial BPM
      const detectedBPM = await detectBPMFromVideo(videoElement);
      const currentTime = videoElement?.currentTime || 0;
      const beatsPerCycle = timeMode === '8-beat' ? 8 : 12;
      
      // Calculate initial phase alignment (assume we want to start on beat 1)
      const beatInterval = 60 / detectedBPM;
      const currentBeatPosition = (currentTime / beatInterval) % beatsPerCycle;
      const targetBeat = Math.floor(currentBeatPosition) + 1;
      const phase = calculatePhaseAlignment(currentTime, detectedBPM, targetBeat, beatsPerCycle);
      
      const syncRef: SyncReference = {
        bpm: detectedBPM,
        beat: targetBeat,
        videoTime: currentTime,
        phase,
        startTime: Tone.now()
      };
      
      setSyncReference(syncRef);
      setBeatGrid(generateBeatGrid(detectedBPM, timeMode));
      setDetectedBPM(detectedBPM);
      setIsLocked(true);
      setIsDetecting(false);
      
      // Start continuous monitoring
      startContinuousMonitoring();
      
      console.log('🔒 Auto-sync locked with continuous monitoring:', syncRef);
      return syncRef;
    } catch (error) {
      console.error('Failed to lock auto-sync:', error);
      setIsDetecting(false);
      return null;
    }
  }, [connectVideoElement, detectBPMFromVideo, calculatePhaseAlignment, generateBeatGrid, startContinuousMonitoring]);

  // Unlock auto-sync and stop monitoring
  const unlockSync = useCallback(() => {
    stopContinuousMonitoring();
    setSyncReference(null);
    setBeatGrid([]);
    setIsLocked(false);
    setDetectedBPM(null);
    
    console.log('🔓 Auto-sync unlocked');
  }, [stopContinuousMonitoring]);

  // Get synchronized beat position based on video time
  const getSyncedBeat = useCallback((videoTime: number, beatsPerCycle: number = 8) => {
    if (!syncReference || !isLocked) return null;
    
    const beatInterval = 60 / syncReference.bpm;
    const timeDelta = videoTime - syncReference.videoTime + syncReference.phase;
    const beatsElapsed = timeDelta / beatInterval;
    
    // Calculate current beat position
    const currentBeatPos = (syncReference.beat - 1 + beatsElapsed) % beatsPerCycle;
    const targetBeat = Math.floor(currentBeatPos) + 1;
    const subBeatPosition = currentBeatPos % 1;
    
    return {
      beat: targetBeat,
      subBeat: subBeatPosition,
      phase: subBeatPosition * beatInterval
    };
  }, [syncReference, isLocked]);

  // Tempo control functions
  const adjustTempo = useCallback((action: 'faster' | 'slower' | 'match', amount: number = 5) => {
    if (!syncReference) return null;
    
    let newBPM: number;
    
    switch (action) {
      case 'faster':
        newBPM = syncReference.bpm + amount;
        break;
      case 'slower':
        newBPM = Math.max(syncReference.bpm - amount, 60);
        break;
      case 'match':
        newBPM = detectedBPM || syncReference.bpm;
        break;
      default:
        return null;
    }
    
    // Update sync reference with new BPM
    const updatedSync = {
      ...syncReference,
      bpm: newBPM
    };
    
    setSyncReference(updatedSync);
    console.log(`🎵 Tempo adjusted to ${newBPM} BPM`);
    
    return newBPM;
  }, [syncReference, detectedBPM]);

  // Cleanup function
  const cleanup = useCallback(() => {
    stopContinuousMonitoring();
    
    if (mediaElementRef.current) {
      try {
        mediaElementRef.current.disconnect();
        // Reset the connection flag if we have access to the video element
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          if ((video as any)._connectedToAudioContext) {
            delete (video as any)._connectedToAudioContext;
          }
        });
      } catch (error) {
        console.warn('Error during media element cleanup:', error);
      }
      mediaElementRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.dispose();
      analyserRef.current = null;
    }
  }, [stopContinuousMonitoring]);

  // Toggle lock (for single button interface)
  const toggleAutoSync = useCallback(async (videoElement?: HTMLVideoElement, timeMode: '8-beat' | 'flamenco-12' = '8-beat') => {
    if (isLocked) {
      unlockSync();
      return false;
    } else {
      const result = await lockSync(videoElement, timeMode);
      return result !== null;
    }
  }, [isLocked, lockSync, unlockSync]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // State
    isLocked,
    detectedBPM,
    isDetecting,
    syncReference,
    beatGrid,
    
    // Functions
    initializeAudioAnalysis,
    detectBPMFromVideo,
    connectVideoElement,
    lockSync,
    unlockSync,
    toggleAutoSync,
    getSyncedBeat,
    adjustTempo,
    cleanup
  };
};
