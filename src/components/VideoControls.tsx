import { FC } from 'react';
import {Play,Pause,Square,Rewind,FastForward, Layers, Layers2,Pin} from 'lucide-react';

interface VideoControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSpeedChange: (speed: number) => void;
  onAddCue: () => void;
  onToggleOverlay: () => void;
  overlaysVisible: boolean;
  playbackSpeed?: number;
}

const VideoControls: FC<VideoControlsProps> = ({
  onPlay,
  onPause,
  onStop,
  onSkipBack,
  onSkipForward,
  onSpeedChange,
  onAddCue,
  onToggleOverlay,
  overlaysVisible,
  playbackSpeed = 1
}) => {
  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSpeedChange(parseFloat(e.target.value));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Play Button */}
      <button
        onClick={onPlay}
        className="p-2 bg-white border-2 border-Play  text-Play hover:bg-Play hover:text-PlayHover rounded-lg transition-colors duration-200 flex items-center justify-center"
        aria-label="Play"
      >
        <Play className="w-5 h-5" />
      </button>

      {/* Pause Button */}
      <button
      onClick={onPause}
      className="p-2 bg-white border-2 border-Pause text-Pause hover:bg-Pause hover:text-PauseHover rounded-lg transition-colors duration-200 flex items-center justify-center"
      aria-label="Pause"
    >
      <Pause className="w-5 h-5" />
    </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        className="p-2 bg-white border-2 border-Stop text-Stop hover:bg-Stop hover:text-StopHover rounded-lg transition-colors duration-200"
        aria-label="Stop"
      >
        <Square className="w-5 h-5" />
      </button>

      <button
        onClick={onSkipBack}
        className="p-2 text-white bg-Ff-Fr hover:bg-Ff-FrHover rounded-lg transition-colors duration-200"
        aria-label="Skip Back 5 seconds"
      >
        <Rewind className="w-5 h-5" />
      </button>

      <button
        onClick={onSkipForward}
        className="p-2 text-white bg-Ff-Fr hover:bg-Ff-FrHover rounded-lg transition-colors duration-200"
        aria-label="Skip Forward 5 seconds"
      >
        <FastForward className="w-5 h-5" />
      </button>

      <select
        onChange={handleSpeedChange}
        className="p-2 border-2 border-Borders rounded-lg bg-white text-Text focus:ring-2 focus:ring-InputboxHighlight focus:outline-none"
        value={playbackSpeed}
        aria-label="Playback Speed"
      >
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
          <option key={speed} value={speed}>{speed}x</option>
        ))}
      </select>

      <button
        onClick={() => {
          console.log('🔵 Add Cue button clicked');
          onAddCue();
        }}
        className="p-2 bg-Cue hover:bg-CueHover text-white rounded-lg 
                  transition-colors duration-200 flex items-center justify-center gap-1.5"
        aria-label="Add Cue Point"
      >
        <Pin className="w-4 h-4" />

      </button>

      <button
        onClick={onToggleOverlay}
        className={`p-2 rounded-lg ml-auto flex items-center justify-center transition-colors duration-200 ${
          overlaysVisible 
            ? 'bg-Layers hover:bg-LayersHover text-white' 
            : 'bg-LayersToggle hover:bg-LayersToggleHover text-Text'
        }`}
        aria-label="Toggle Overlays"
        title={overlaysVisible ? 'Hide Overlays' : 'Show Overlays'}
      >
        {overlaysVisible ? <Layers size={20} /> : <Layers2 size={20} />}
      </button>
    </div>
  );
};

export default VideoControls;