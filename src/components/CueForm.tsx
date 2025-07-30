import { FC, useState, useEffect } from 'react';
import { CuePoint } from '../types/types';

interface CueFormProps {
  currentTime: number;
  currentBeat: number;
  isMetronomeRunning: boolean;
  onSubmit: (cue: Omit<CuePoint, 'id'> | CuePoint) => void;
  editingCue: CuePoint | null;
  onCancel: () => void;
  onPause: () => void;
}

const CueForm: FC<CueFormProps> = ({ 
  currentTime, 
  currentBeat, 
  isMetronomeRunning,
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

  useEffect(() => {
    onPause();

    if (editingCue) {
      setTime(editingCue.time);
      setTitle(editingCue.title);
      setNote(editingCue.note);
      setBeat(editingCue.beat);
    } else {
      const minutes = Math.floor(currentTime / 60).toString().padStart(2, '0');
      const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
      setTime(`${minutes}:${seconds}`);
      setTitle('');
      setNote('');
      setBeat(currentBeat); // Always set the beat, regardless of metronome state
    }
  }, [editingCue, onPause, currentTime, currentBeat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!time || !title) {
      alert('Please enter at least a time and title');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit({ time, title, note, beat });
      if (!editingCue) {
        setTitle('');
        setNote('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const getBeatColor = () => {
    // Beats 1 and 5 are purple, all others are red
    return currentBeat === 1 || currentBeat === 5 
      ? 'bg-purple-600' 
      : 'bg-red-600';
  };

  return (
    <div className="mb-6">
      {/* Header with beat indicator always visible */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`rounded-full h-10 w-10 flex items-center justify-center text-white font-bold ${getBeatColor()}`}>
          {currentBeat}
        </div>
        <div className="flex-1 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">
            {editingCue ? 'Edit Cue Point' : '➕ Add New Cue Point'}
          </h3>
          {editingCue && (
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top row - Time and Title */}
        <div className="flex gap-4">
          {/* Time */}
          <div className="flex-1">
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="MM:SS"
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              required
            />
          </div>

          {/* Title */}
          <div className="flex-[3]">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="[Title of Cue Point]"
              className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add detailed notes about this cue point..."
          className="w-full p-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition min-h-[120px]"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {editingCue && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-5 py-2.5 rounded-lg text-white transition flex items-center gap-2 ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
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
  );
};

export default CueForm;