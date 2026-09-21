import { FC } from 'react';
import {Play,Pause,Square,Rewind,FastForward,FlipHorizontal2,Repeat,Save,X,Upload} from 'lucide-react';

interface VideoControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onSpeedChange: (speed: number) => void;
  onToggleMirror?: () => void;
  onLoopModeChange?: () => void;
  onSaveLoop?: () => void;
  onClearLoop?: () => void;
  onOpenFilePicker?: () => void;
  isMirrored?: boolean;
  loopMode?: 'inactive' | 'activated' | 'active';
  canSaveLoop?: boolean;
  canClearLoop?: boolean;
  playbackSpeed?: number;
}

const VideoControls: FC<VideoControlsProps> = ({
  onPlay,
  onPause,
  onStop,
  onSkipBack,
  onSkipForward,
  onSpeedChange,
  onToggleMirror = () => {},
  onLoopModeChange = () => {},
  onSaveLoop = () => {},
  onClearLoop = () => {},
  onOpenFilePicker = () => {},
  isMirrored = false,
  loopMode = 'inactive',
  canSaveLoop = false,
  canClearLoop = false,
  playbackSpeed = 1
}) => {
  const speedCycle = [1, 0.75, 0.5];
  const speedIndex = speedCycle.indexOf(playbackSpeed);
  const nextSpeed = speedCycle[(speedIndex + 1) % speedCycle.length];
  const speedLabel = `${playbackSpeed === 0.75 ? '0,75' : playbackSpeed === 0.5 ? '0,5' : '1'}x`;

  const handleSpeedChange = () => {
    onSpeedChange(nextSpeed);
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

      <button
        onClick={onToggleMirror}
        className={`p-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${isMirrored ? 'bg-Cue text-white' : 'bg-Ff-Fr text-white hover:bg-Ff-FrHover'}`}
        aria-label={isMirrored ? 'Show video normally' : 'Mirror video'}
        aria-pressed={isMirrored}
        title={isMirrored ? 'Show video normally' : 'Mirror video'}
      >
        <FlipHorizontal2 className="w-5 h-5" />
      </button>

      <button
        onClick={onOpenFilePicker}
        className="p-2 rounded-lg bg-Ff-Fr text-white hover:bg-Ff-FrHover transition-colors duration-200 flex items-center justify-center"
        aria-label="Choose video file"
        title="Choose video file"
      >
        <Upload className="w-5 h-5" />
      </button>

      <button
        onClick={handleSpeedChange}
        className="w-16 min-w-16 max-w-16 h-10 flex-none p-2 bg-white border-2 border-Borders rounded-lg text-Text hover:bg-gray-100 focus:ring-2 focus:ring-InputboxHighlight focus:outline-none inline-flex items-center justify-center"
        aria-label={`Playback speed ${speedLabel}. Change speed`}
        title="Change playback speed"
      >
        {speedLabel}
      </button>

      <button
        onClick={onLoopModeChange}
        className={`loop-mode-wrapper w-[110px] min-w-[110px] ${loopMode === 'activated' ? 'loop-mode-wrapper--active' : ''}`}
        aria-label={`Loop mode: ${loopMode}`}
        title={loopMode === 'activated' ? 'Finish loop' : loopMode === 'active' ? 'Stop loop' : 'Start loop'}
      >
        <span className="loop-mode-button">
          <Repeat className="mr-1 inline-block h-4 w-4" />
          {loopMode === 'activated' ? 'Loop out' : loopMode === 'active' ? 'Loop' : 'Loop in'}
        </span>
      </button>

      <button
        onClick={onSaveLoop}
        disabled={!canSaveLoop}
        className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-Cue px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-CueHover disabled:cursor-not-allowed disabled:bg-gray-300"
        aria-label="Save loop"
        title="Save loop"
      >
        <Save className="h-4 w-4" />
        Save loop
      </button>

      {canClearLoop && (
        <button
          onClick={onClearLoop}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border-2 border-Borders bg-white px-2 py-2 text-xs font-medium text-Text transition-colors duration-200 hover:bg-gray-100"
          aria-label="Clear loop"
          title="Clear loop"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}

    </div>
  );
};

export default VideoControls;