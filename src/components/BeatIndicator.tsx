import { FC, useMemo } from 'react';

interface BeatIndicatorProps {
  currentBeat: number;
  isRunning: boolean;
  timeMode: '8-beat' | 'flamenco-12';
  getTimeModeConfig: () => {
    beatsPerCycle: number;
    strongBeats: number[];
    description: string;
  };
}

const BeatIndicator: FC<BeatIndicatorProps> = ({ 
  currentBeat, 
  isRunning, 
  timeMode,
  getTimeModeConfig 
}) => {
  const config = getTimeModeConfig();
  
  // Generate beats array
  const beats = useMemo(() => 
    Array.from({ length: config.beatsPerCycle }, (_, i) => i + 1),
    [config.beatsPerCycle]
  );

  // Safely ensure currentBeat is within range
  const normalizedBeat = Math.max(1, Math.min(config.beatsPerCycle, Number(currentBeat) || 1));

  // Get beat color - enhanced for flamenco
  const getBeatColor = (beat: number) => {
    if (!isRunning) return 'bg-gray-200';
    
    const isCurrentBeat = beat === normalizedBeat;
    
    if (timeMode === 'flamenco-12') {
      if (config.strongBeats.includes(beat)) {
        // Flamenco accents (3, 6, 8, 10, 12) - deep red for authenticity
        return isCurrentBeat ? 'bg-red-600' : 'bg-red-300';
      } else {
        // Non-accented beats - subtle
        return isCurrentBeat ? 'bg-orange-400' : 'bg-gray-200';
      }
    } else {
      // Original 8-beat pattern
      if (config.strongBeats.includes(beat)) {
        return isCurrentBeat ? 'bg-purple-500' : 'bg-purple-200';
      } else {
        return isCurrentBeat ? 'bg-red-500' : 'bg-gray-200';
      }
    }
  };

  // Special layout for flamenco 12-beat
  if (timeMode === 'flamenco-12') {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-xs font-semibold text-center text-gray-600">
          {config.description}
        </div>
        <div className="grid grid-cols-6 gap-1">
          {beats.map(beat => (
            <div
              key={beat}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors duration-100 ${getBeatColor(beat)}`}
              title={`Beat ${beat}${config.strongBeats.includes(beat) ? ' (Accented)' : ''}`}
            >
              {isRunning && normalizedBeat === beat ? beat : ''}
            </div>
          ))}
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold text-center text-gray-600">
        {config.description}
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {beats.map(beat => (
          <div
            key={beat}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors duration-100 ${getBeatColor(beat)}`}
          >
            {isRunning && normalizedBeat === beat ? beat : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeatIndicator;