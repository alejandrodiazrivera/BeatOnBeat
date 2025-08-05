import { FC } from 'react';
import { Layers } from 'lucide-react';

interface VideoControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSpeedChange: (speed: number) => void;
  onAddCue: () => void;
  onToggleOverlay: () => void;
  isPlaying: boolean;
  overlaysVisible: boolean;
  playbackSpeed?: number;
}

const VideoControls: FC<VideoControlsProps> = ({
  onPlay,
  onPause,
  onSkipBack,
  onSkipForward,
  onSpeedChange,
  onAddCue,
  onToggleOverlay,
  isPlaying,
  overlaysVisible,
  playbackSpeed = 1
}) => {
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSpeedChange(parseFloat(e.target.value));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Play Button - only shown when paused */}
      {!isPlaying && (
        <button
          onClick={onPlay}
          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          aria-label="Play"
        >
          ▶ Play
        </button>
      )}

      {/* Pause Button - only shown when playing */}
      {isPlaying && (
        <button
          onClick={onPause}
          className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
          aria-label="Pause"
        >
          ⏸ Pause
        </button>
      )}

      <button
        onClick={onSkipBack}
        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        aria-label="Skip Back 10 seconds"
      >
        ⏮ 10s
      </button>

      <button
        onClick={onSkipForward}
        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
        aria-label="Skip Forward 10 seconds"
      >
        ⏭ 10s
      </button>

      <select
        onChange={handleSpeedChange}
        className="p-2 border border-gray-200 rounded-lg"
        value={playbackSpeed}
        aria-label="Playback Speed"
      >
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
          <option key={speed} value={speed}>{speed}x</option>
        ))}
      </select>

      <button
      onClick={onAddCue}
      className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg 
                transition-colors duration-200 flex items-center justify-center gap-1.5"
      aria-label="Add Cue Point"
    >
      Add Cue
    </button>

      <button
        onClick={onToggleOverlay}
        className={`p-2 rounded-lg ml-auto flex items-center justify-center transition-colors duration-200 ${
          overlaysVisible 
            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
        }`}
        aria-label="Toggle Overlays"
        title={overlaysVisible ? 'Hide Overlays' : 'Show Overlays'}
      >
        <Layers size={20} />
      </button>
    </div>
  );
};

export default VideoControls;