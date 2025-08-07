import { FC, useState, useEffect, ChangeEvent } from 'react';
import { RotateCcw, MousePointerClick} from 'lucide-react';
import BeatIndicator from './BeatIndicator';

interface MetronomeControlsProps {
  bpm: number;
  currentBeat: number;
  isRunning: boolean;
  timeMode: '8-beat' | 'flamenco-12';
  onTapTempo: () => void;
  onStart: () => void;
  onAdjustBpm: (amount: number) => void;
  onBpmChange: (newBpm: number) => void;
  onTimeModeChange: (mode: '8-beat' | 'flamenco-12') => void;
  getTimeModeConfig: () => {
    beatsPerCycle: number;
    strongBeats: number[];
  };
  className?: string;
}

const MetronomeControls: FC<MetronomeControlsProps> = ({
  bpm,
  currentBeat,
  isRunning,
  timeMode,
  onTapTempo,
  onStart,
  onAdjustBpm,
  onBpmChange,
  onTimeModeChange,
  getTimeModeConfig
}) => {
  const [inputValue, setInputValue] = useState(Math.round(bpm).toString());

  // Sync input with BPM changes
  useEffect(() => {
    setInputValue(Math.round(bpm).toString());
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

  const handleIncrement = () => onAdjustBpm(1); // Increase by 1 BPM
  const handleDecrement = () => onAdjustBpm(-1); // Decrease by 1 BPM

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-Borders p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-Metronome">Metronome</h3>
      
      {/* Controls Row - Mobile stacks, Desktop single line */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 mt-4">
        {/* Beat Tap Button - Full width on mobile, normal on desktop */}
        <button
          onClick={onTapTempo}
          className="w-full sm:w-auto bg-BeatTap hover:bg-Pause active:bg-Metronome 
                    text-Metronome active:text-white px-4 py-3 sm:py-2 rounded-lg 
                    transition-colors duration-200 font-medium flex items-center justify-center gap-2
                    border-2 border-dashed border-Metronome"
          title={
            timeMode === '8-beat'
              ? 'Tap to set tempo - tap on each quarter note beat'
              : 'Tap to set tempo - tap on quarter notes OR on flamenco accents (3,6,8,10,12)'
          }
        >
          Beat Tap
          <MousePointerClick className="w-6 h-6" />
        </button>

        {/* BPM Controls - Centered on mobile */}
        <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
          <button
            onClick={handleDecrement}
            className="bg-Pause hover:bg-Stop text-Metronome hover:text-white w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-200"
          >
            -
          </button>
          <div className="relative w-20 mx-1">
            <input
              type="text"
              value={inputValue}
              onChange={handleBpmInputChange}
              onBlur={handleBpmInputBlur}
              onKeyPress={handleKeyPress}
              className="font-bold w-full text-center border-2 border-InputboxColor rounded-lg py-1 pr-8 pl-2 focus:outline-none focus:ring-2 focus:ring-InputboxHighlight text-InputText"
              aria-label="BPM value"
              placeholder="100"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-Bpm text-xs pointer-events-none select-none">BPM</span>
          </div>
          <button
            onClick={handleIncrement}
            className="bg-Pause hover:bg-Stop text-Metronome hover:text-white w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-200"
          >
            +
          </button>
        </div>
        
        {/* Beat Indicator */}
        <div className="w-full sm:w-auto flex justify-center sm:justify-start">
          <BeatIndicator 
            currentBeat={currentBeat} 
            isRunning={isRunning}
            timeMode={timeMode}
            getTimeModeConfig={getTimeModeConfig}
          />
        </div>
        
        {/* Control Buttons */}
        <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-start">
          {/* Time Mode Toggle Button */}
          <button
            onClick={() => onTimeModeChange(timeMode === '8-beat' ? 'flamenco-12' : '8-beat')}
            className="px-3 py-2 rounded-lg transition-colors duration-200 bg-Signature hover:bg-Metronome text-white text-sm font-medium"
            title={`Switch to ${timeMode === '8-beat' ? 'Flamenco 12-beat compás' : '8-beat (Two 4/4)'}`}
          >
            {timeMode === '8-beat' ? '4/4' : '12/8'}
          </button>
          
          {/* Start Button - Resets to beat 1 and starts metronome */}
          <button
            onClick={onStart}
            className="px-4 py-2 rounded-lg transition-colors duration-200 bg-Stop hover:bg-Pause text-white flex items-center justify-center font-medium"
            title="Start metronome"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetronomeControls;