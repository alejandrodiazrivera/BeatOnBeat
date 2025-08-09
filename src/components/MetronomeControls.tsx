import { FC, useState, useEffect, ChangeEvent } from 'react';
import { RotateCcw, MousePointerClick, Lock, LockOpen, Volume2, VolumeX, Square } from 'lucide-react';
import BeatIndicator from './BeatIndicator';

interface MetronomeControlsProps {
  bpm: number;
  currentBeat: number;
  isRunning: boolean;
  timeMode: '8-beat' | 'flamenco-12';
  isMuted: boolean;
  isLocked: boolean;
  isCapturingSync?: boolean;
  capturedBeatsCount?: number;
  syncAccuracy?: number;
  onTapTempo: () => void;
  onStart: () => void;
  onStop: () => void;
  onAdjustBpm: (amount: number) => void;
  onBpmChange: (newBpm: number) => void;
  onTimeModeChange: (mode: '8-beat' | 'flamenco-12') => void;
  onToggleMute: () => void;
  onLockSync: (syncData: { bpm: number; beat: number; videoTime: number }) => void;
  getTimeModeConfig: () => {
    beatsPerCycle: number;
    strongBeats: number[];
  };
  getCurrentVideoTime: () => number;
  className?: string;
}

const MetronomeControls: FC<MetronomeControlsProps> = ({
  bpm,
  currentBeat,
  isRunning,
  timeMode,
  isMuted,
  isLocked,
  isCapturingSync = false,
  capturedBeatsCount = 0,
  syncAccuracy,
  onTapTempo,
  onStart,
  onStop,
  onAdjustBpm,
  onBpmChange,
  onTimeModeChange,
  onToggleMute,
  onLockSync,
  getTimeModeConfig,
  getCurrentVideoTime
}) => {
  const [inputValue, setInputValue] = useState('--');

  // Sync input with BPM changes
  useEffect(() => {
  setInputValue((bpm === 40 || bpm === undefined || bpm === null) ? '--' : Math.round(bpm).toString());
  }, [bpm]);

  const handleBpmInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Don't update BPM while typing, only on blur
  };

  const handleBpmInputBlur = () => {
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue <= 0) {
      setInputValue(Math.round(bpm).toString());
    } else {
      const clampedValue = Math.max(30, Math.min(300, numValue)); // Clamp between 30-300 BPM
      onBpmChange(clampedValue);
      setInputValue(clampedValue.toString());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBpmInputBlur();
    }
  };

  // Lock toggle handler
  const handleLockToggle = () => {
    if (isLocked) {
      // Unlock - call with null to clear sync
      onLockSync({ bpm: 0, beat: 0, videoTime: 0 });
    } else {
      // Lock - use the most recent BPM, even if just tapped
      const currentVideoTime = getCurrentVideoTime();
      onLockSync({ bpm, beat: currentBeat, videoTime: currentVideoTime });
    }
  };

  // Mute toggle handler
  const handleMuteToggle = () => {
    onToggleMute();
  };

  const handleIncrement = () => onAdjustBpm(0.5); // Increase by 1 BPM
  const handleDecrement = () => onAdjustBpm(-0.5); // Decrease by 1 BPM

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-Borders p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-Metronome">Metronome</h3>
      
      {/* Controls Row - All controls in a single horizontal line */}
  <div className="flex flex-row flex-wrap items-center gap-2 mt-4 w-full">
        <button
          onClick={onTapTempo}
          className="bg-BeatTap hover:bg-Pause active:bg-Metronome text-Metronome active:text-white px-3 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center justify-center gap-2 border-2 border-dashed border-Metronome"
          title={
            timeMode === '8-beat'
              ? 'Tap to set tempo - tap on each quarter note beat'
              : 'Tap to set tempo - tap on quarter notes OR on flamenco accents (3,6,8,10,12)'
          }
        >
          Beat Tap
          <MousePointerClick className="w-5 h-5" />
        </button>
        <button
          className="bpm-btn bpm-btn--decrement px-2 py-1 border rounded"
          onClick={handleDecrement}
          aria-label="Decrease BPM"
          disabled={isLocked}
        >
          -
        </button>
        <div className="relative flex items-center">
            <div className="relative w-20">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={handleBpmInputChange}
                onBlur={handleBpmInputBlur}
                onKeyPress={handleKeyPress}
                className="font-bold text-center border-2 border-InputboxColor rounded-lg py-0.5 pr-7 pl-1 w-full focus:outline-none focus:ring-2 focus:ring-InputboxHighlight text-InputText"
                aria-label="BPM value"
                placeholder="100"
                disabled={isLocked}
              />
              <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-Bpm text-xs pointer-events-none select-none bg-transparent px-0.5">BPM</span>
            </div>
        </div>
        <button
          className="bpm-btn bpm-btn--increment px-2 py-1 border rounded"
          onClick={handleIncrement}
          aria-label="Increase BPM"
          disabled={isLocked}
        >
          +
        </button>
        <button
          onClick={handleLockToggle}
          className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 border-2 border-Borders ${
            isCapturingSync 
              ? 'bg-yellow-500 text-white animate-pulse' 
              : isLocked 
                ? 'bg-Metronome text-white' 
                : 'bg-white text-Metronome hover:bg-Metronome hover:text-white'
          }`}
          title={
            isCapturingSync 
              ? `Capturing beat ${capturedBeatsCount}/4 - Keep metronome running!`
              : isLocked 
                ? `Sync locked ${syncAccuracy ? `(${syncAccuracy.toFixed(1)}% accuracy)` : ''} - Click to unlock`
                : 'Lock metronome sync'
          }
          aria-label={
            isCapturingSync 
              ? `Capturing beat ${capturedBeatsCount} of 4`
              : isLocked 
                ? 'Unlock metronome sync' 
                : 'Lock metronome sync'
          }
        >
          {isCapturingSync ? (
            <span className="text-xs font-bold">{capturedBeatsCount}</span>
          ) : isLocked ? (
            <Lock size={20} />
          ) : (
            <LockOpen size={20} />
          )}
        </button>
        <button
          onClick={handleMuteToggle}
          className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 border-2 border-Borders ${isMuted ? 'bg-Stop text-white' : 'bg-white text-Metronome hover:bg-Stop hover:text-white'}`}
          title={isMuted ? 'Unmute metronome' : 'Mute metronome'}
          aria-label={isMuted ? 'Unmute metronome' : 'Mute metronome'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
          {/* Beat Indicator */}
          <div className="flex items-center ml-4">
            <BeatIndicator 
              currentBeat={currentBeat} 
              isRunning={isRunning}
              timeMode={timeMode}
              getTimeModeConfig={getTimeModeConfig}
            />
          </div>
          {/* Signature/Start/Stop Buttons */}
          <button
            onClick={() => onTimeModeChange(timeMode === '8-beat' ? 'flamenco-12' : '8-beat')}
            className="px-3 py-2 rounded-lg transition-colors duration-200 bg-Signature hover:bg-Metronome text-white text-sm font-medium ml-2"
            title={`Switch to ${timeMode === '8-beat' ? 'Flamenco 12-beat compás' : '8-beat (Two 4/4)'}`}
          >
            {timeMode === '8-beat' ? '4/4' : '12/8'}
          </button>
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-lg transition-colors duration-200 bg-Stop hover:bg-Pause text-white flex items-center justify-center font-medium ml-2"
            title="Start metronome"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={onStop}
            className="px-4 py-2 rounded-lg transition-colors duration-200 bg-Metronome hover:bg-Stop text-white flex items-center justify-center font-medium ml-2"
            title="Stop metronome"
            disabled={!isRunning}
          >
            <Square size={20} />
          </button>
      </div>
      </div>
  );
};

export default MetronomeControls;