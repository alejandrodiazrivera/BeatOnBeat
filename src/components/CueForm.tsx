import { FC, useState, useEffect, useRef } from 'react';
import { CuePoint } from '../types/types';

// Utility functions for precise time handling
const formatTimeWithMilliseconds = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);
  
  if (milliseconds === 0) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
};

interface CueFormProps {
  currentTime: number;
  currentBeat: number;
  timeMode: '8-beat' | 'flamenco-12';
  onSubmit: (cue: Omit<CuePoint, 'id'> | CuePoint) => void;
  editingCue: CuePoint | null;
  onCancel: () => void;
  onPause: () => void;
}

const CueForm: FC<CueFormProps> = ({ 
  currentTime, 
  currentBeat, 
  timeMode,
  onSubmit, 
  editingCue,
  onCancel,
  onPause
}) => {
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [beat, setBeat] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('📝 CueForm useEffect triggered:', {
      editingCue: !!editingCue,
      editingCueId: editingCue?.id,
      currentTime,
      currentBeat
    });
    console.log('📝 CueForm calling onPause()');
    onPause();

    if (editingCue) {
      setTime(editingCue.time);
      setTitle(editingCue.title);
      setNote(editingCue.note);
      setBeat(editingCue.beat);
    } else {
      const formattedTime = formatTimeWithMilliseconds(currentTime);
      setTime(formattedTime);
      setTitle('');
      setNote('');
      setBeat(currentBeat); // Always set the beat, regardless of metronome state
    }
  }, [editingCue, onPause, currentTime, currentBeat]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable dragging on mobile
    if (!formRef.current) return;
    const rect = formRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMoveCallback = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUpCallback = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveCallback);
      document.addEventListener('mouseup', handleMouseUpCallback);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMoveCallback);
        document.removeEventListener('mouseup', handleMouseUpCallback);
      };
    }
  }, [isDragging, dragOffset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CueForm handleSubmit called');
    console.log('Form data:', { time, title, note, beat });
    setIsSubmitting(true);
    
    if (!time) {
      alert('Please enter a time');
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('Calling onSubmit with:', { time, title, note, beat });
      onSubmit({ time, title, note, beat });
      console.log('onSubmit call completed successfully');
      if (!editingCue) {
        console.log('Clearing form fields');
        setTitle('');
        setNote('');
      }
    } catch (error) {
      console.error('Error in onSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const getBeatColor = (beatValue: number) => {
    if (timeMode === 'flamenco-12') {
      // Flamenco accents: 3, 6, 8, 10, 12 are red (accented), others are orange
      return [3, 6, 8, 10, 12].includes(beatValue) ? 'bg-red-600' : 'bg-orange-500';
    } else {
      // 8-beat mode: Beats 1 and 5 are purple, all others are red
      return beatValue === 1 || beatValue === 5 ? 'bg-black' : 'bg-gray-400';
    }
  };

  const handleBeatClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent any event bubbling
    // Dynamic max beat based on time mode
    const maxBeat = timeMode === 'flamenco-12' ? 12 : 8;
    const nextBeat = beat && beat < maxBeat ? beat + 1 : 1;
    setBeat(nextBeat);
  };

  return (
    <div 
      ref={formRef}
      className={`mb-6 bg-white rounded-xl shadow-lg border-2 border-black w-full max-w-[calc(100vw-2rem)] sm:max-w-lg ${isMobile ? '' : (isDragging ? 'cursor-grabbing' : 'cursor-grab')}`}
      style={isMobile
        ? {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            maxHeight: 'calc(100vh - 2rem)',
            overflow: 'auto',
            margin: '0 1rem',
          }
        : {
            position: 'fixed',
            left: position.x === 0 && position.y === 0 ? '50%' : Math.max(16, Math.min(position.x, window.innerWidth - (formRef.current?.offsetWidth || 400) - 16)),
            top: position.y === 0 && position.y === 0 ? '50%' : Math.max(8, Math.min(position.y, window.innerHeight - (formRef.current?.offsetHeight || 500) - 8)),
            transform: position.x === 0 && position.y === 0 ? 'translate(-50%, -50%)' : 'none',
            zIndex: 1000,
            maxHeight: 'calc(100vh - 2rem)',
            overflow: 'auto',
            margin: 0,
          }
      }
    >
      {/* Header with beat indicator */}
      <div 
        className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-3 sm:p-4 pb-0"
        onMouseDown={handleMouseDown}
      >
        <div 
          className={`rounded-full h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform text-sm sm:text-base ${getBeatColor(beat || 1)}`}
          onClick={handleBeatClick}
          title="Click to change beat number"
        >
          {beat || 1}
        </div>
        <div className="flex-1 flex items-center justify-between min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-Title truncate pr-2">
            {editingCue ? 'Edit Cue Point' : '➕ Add New Cue Point'}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {editingCue && (
              <button
                onClick={onCancel}
                className="text-Exit hover:text-ExitHighlight transition ml-2 text-lg sm:text-xl"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Time and Title row - with larger text */}
          <div className="flex gap-3 sm:gap-4 items-center">
            {/* Time input */}
            <div className="w-24 sm:w-28"> {/* Slightly wider to accommodate larger text */}
              <label htmlFor="cue-time" className="sr-only">Time</label>
              <input
                id="cue-time"
                name="time"
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="MM:SS"
                className="w-full p-3 border-2 border-black rounded-lg focus:border-black focus:ring-2 focus:ring-gray-300 outline-none transition text-base sm:text-lg h-[50px] sm:h-[56px]"
                required
              />
            </div>

            {/* Title input */}
            <div className="flex-1">
              <label htmlFor="cue-title" className="sr-only">Title</label>
              <input
                id="cue-title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cue title"
                className="w-full p-3 border-2 border-black rounded-lg focus:border-black focus:ring-2 focus:ring-gray-300 outline-none transition text-base sm:text-lg h-[50px] sm:h-[56px]"
                required
              />
            </div>
          </div>

          {/* Notes - with larger text */}
          <div className="mt-3 sm:mt-4">
            <label htmlFor="cue-note" className="sr-only">Notes</label>
            <textarea
              id="cue-note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add detailed notes about this cue point..."
              className="w-full p-3 border-2 border-black rounded-lg focus:border-black focus:ring-2 focus:ring-gray-300 outline-none transition text-base sm:text-lg resize-y min-h-[140px]"
              rows={5}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#000000 #f1f1f1'
              }}
            />
          </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
          {editingCue && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 sm:px-5 py-2 sm:py-2.5 border-2 border-black rounded-lg text-black hover:bg-black hover:text-white transition text-sm sm:text-base order-2 sm:order-1"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2 ${
              isSubmitting 
                ? 'bg-gray-400 text-white cursor-not-allowed border-2 border-gray-400' 
                : 'bg-black text-white border-2 border-black hover:bg-gray-800'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                {editingCue ? 'Save Changes' : 'Add Cue Point'}
              </>
            )}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default CueForm;