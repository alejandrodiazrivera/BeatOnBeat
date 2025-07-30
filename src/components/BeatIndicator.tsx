import { FC, useMemo } from 'react';

interface BeatIndicatorProps {
  currentBeat: number;
  isRunning: boolean;
}

const BeatIndicator: FC<BeatIndicatorProps> = ({ currentBeat, isRunning }) => {
  // Memoize beats array to prevent unnecessary recreations
  const beats = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8], []);

  // Safely ensure currentBeat is a number between 1-8
  const normalizedBeat = Math.max(1, Math.min(8, Number(currentBeat) || 1));

  // Pre-calculate beat colors
  const getBeatColor = (beat: number) => {
    if (!isRunning) return 'bg-gray-200';
    if (beat === normalizedBeat) {
      return (beat === 1 || beat === 5) ? 'bg-purple-500' : 'bg-red-500';
    }
    return 'bg-gray-200';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
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