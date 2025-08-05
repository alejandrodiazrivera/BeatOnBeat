import { FC, useState, useEffect, ChangeEvent } from 'react';
import { RotateCcw } from 'lucide-react';
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
    description: string;
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
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Metronome</h3>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          onClick={onTapTempo}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
          title={timeMode === '8-beat' 
            ? 'Tap to set tempo - tap on each quarter note beat' 
            : 'Tap to set tempo - tap on quarter notes OR on flamenco accents (3,6,8,10,12)'
          }
        >
          Tap Beat
        </button>
        
        <div className="flex items-center gap-1">
          <button
            onClick={handleDecrement}
            className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center font-bold transition active:bg-gray-400"
          >
            -
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={handleBpmInputChange}
            onBlur={handleBpmInputBlur}
            onKeyPress={handleKeyPress}
            className="font-bold w-16 text-center border border-gray-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="BPM value"
            placeholder="120"
          />
          <span className="font-bold">BPM</span>
          
          <button
            onClick={handleIncrement}
            className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center font-bold transition active:bg-gray-400"
          >
            +
          </button>
        </div>
        
        <BeatIndicator 
          currentBeat={currentBeat} 
          isRunning={isRunning}
          timeMode={timeMode}
          getTimeModeConfig={getTimeModeConfig}
        />
        
        {/* Time Mode Toggle Button */}
        <button
          onClick={() => onTimeModeChange(timeMode === '8-beat' ? 'flamenco-12' : '8-beat')}
          className="px-3 py-2 rounded-lg transition bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
          title={`Switch to ${timeMode === '8-beat' ? 'Flamenco 12-beat compás' : '8-beat (Two 4/4)'}`}
        >
          {timeMode === '8-beat' ? '4/4' : '12/8'}
        </button>
        
        {/* Start Button - Resets to beat 1 and starts metronome */}
        <button
        onClick={onStart}
        className="px-4 py-2 rounded-lg transition bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
        title="Start metronome"
      >
        <RotateCcw size={20} />
      </button>
      </div>
    </div>
  );
};

export default MetronomeControls;