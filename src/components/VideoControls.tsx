import { FC } from 'react';
import { Play, Pause, Square, Rewind, FastForward, FlipHorizontal2, Repeat, Save, X, Upload, PanelRightClose, Gauge } from 'lucide-react';

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
  onOpenSavedLoops?: () => void;
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
  onOpenFilePicker,
  onOpenSavedLoops,
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
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={onPlay}
        className="ds-btn-icon"
        aria-label="Play"
        title="Play"
      >
        <Play className="h-4 w-4" />
      </button>

      <button
        onClick={onPause}
        className="ds-btn-icon"
        aria-label="Pause"
        title="Pause"
      >
        <Pause className="h-4 w-4" />
      </button>

      <button
        onClick={onStop}
        className="ds-btn-icon"
        aria-label="Stop"
        title="Stop"
      >
        <Square className="h-4 w-4" />
      </button>

      <span className="ds-divider-v" />

      <button
        onClick={onSkipBack}
        className="ds-btn-icon"
        aria-label="Skip Back 5 seconds"
        title="Back 5s"
      >
        <Rewind className="h-4 w-4" />
      </button>

      <button
        onClick={onSkipForward}
        className="ds-btn-icon"
        aria-label="Skip Forward 5 seconds"
        title="Forward 5s"
      >
        <FastForward className="h-4 w-4" />
      </button>

      <span className="ds-divider-v" />

      <button
        onClick={onToggleMirror}
        className="ds-btn-icon"
        data-active={isMirrored}
        aria-label={isMirrored ? 'Show video normally' : 'Mirror video'}
        aria-pressed={isMirrored}
        title="Mirror"
      >
        <FlipHorizontal2 className="h-4 w-4" />
      </button>

      {onOpenFilePicker && (
        <button
          onClick={onOpenFilePicker}
          className="ds-btn-icon"
          aria-label="Choose video file"
          title="Choose video file"
        >
          <Upload className="h-4 w-4" />
        </button>
      )}

      <button
        onClick={handleSpeedChange}
        className="ds-btn-pill"
        aria-label={`Playback speed ${speedLabel}. Change speed`}
        title="Change playback speed"
      >
        <Gauge className="h-4 w-4" />
        {speedLabel}
      </button>

      <span className="flex-1" />

      <button
        onClick={onLoopModeChange}
        className="ds-btn-pill"
        data-active={loopMode !== 'inactive'}
        aria-label={`Loop mode: ${loopMode}`}
        title={loopMode === 'activated' ? 'Finish loop' : loopMode === 'active' ? 'Stop loop' : 'Start loop'}
      >
        <Repeat className="h-4 w-4" />
        Loop
      </button>

      <button
        onClick={onSaveLoop}
        disabled={!canSaveLoop}
        className="ds-btn-icon"
        aria-label="Save loop"
        title="Save loop"
      >
        <Save className="h-4 w-4" />
      </button>

      {canClearLoop && (
        <button
          onClick={onClearLoop}
          className="ds-btn-icon"
          aria-label="Clear loop"
          title="Clear loop"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {onOpenSavedLoops && (
        <>
          <span className="ds-divider-v" />
          <button
          onClick={onOpenSavedLoops}
          className="ds-btn-icon"
          aria-label="Toggle saved loops"
          title="Toggle saved loops"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
        </>
      )}
    </div>
  );
};

export default VideoControls;