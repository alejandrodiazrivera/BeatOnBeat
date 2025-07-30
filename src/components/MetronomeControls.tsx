import { FC, useState, useEffect, useCallback, ChangeEvent } from 'react';
import BeatIndicator from './BeatIndicator';

interface MetronomeControlsProps {
  bpm: number;
  currentBeat: number;
  isRunning: boolean;
  onTapTempo: () => void;
  onStart: () => void;  // No changes needed to props
  onStop: () => void;
  onAdjustBpm: (amount: number) => void;
  onBpmChange: (newBpm: number) => void;
  className?: string;
}

const MetronomeControls: FC<MetronomeControlsProps> = ({
  bpm,
  currentBeat,
  isRunning,
  onTapTempo,
  onStart,
  onStop,
  onAdjustBpm,
  onBpmChange
}) => {
  const [inputValue, setInputValue] = useState(bpm.toFixed(2));

  // Sync input with BPM changes
  useEffect(() => {
    setInputValue(bpm.toFixed(2));
  }, [bpm]);

  const handleBpmInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (/^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onBpmChange(Math.max(1, numValue));
      }
    }
  };

  const handleBpmInputBlur = () => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue <= 0) {
      setInputValue(bpm.toFixed(2));
    } else {
      onBpmChange(numValue);
    }
  };

  const handleIncrement = () => onAdjustBpm(0.01);
  const handleDecrement = () => onAdjustBpm(-0.01);

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Metronome</h3>
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          onClick={onTapTempo}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
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
            className="font-bold w-20 text-center border border-gray-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="BPM value"
          />
          <span className="font-bold">BPM</span>
          
          <button
            onClick={handleIncrement}
            className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center font-bold transition active:bg-gray-400"
          >
            +
          </button>
        </div>
        
        <BeatIndicator currentBeat={currentBeat} isRunning={isRunning} />
        
        {/* Start Button - Now acts as reset when pressed multiple times */}
        <button
        onClick={onStart}
        className="px-4 py-2 rounded-lg transition bg-blue-500 hover:bg-blue-600 text-white"
      >
        Start
      </button>
        
        {/* Stop Button - Only active when running */}
        <button
          onClick={onStop}
          disabled={!isRunning}
          className={`px-4 py-2 rounded-lg transition ${
            !isRunning 
              ? 'bg-red-500 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Stop
        </button>
      </div>
    </div>
  );
};

export default MetronomeControls;