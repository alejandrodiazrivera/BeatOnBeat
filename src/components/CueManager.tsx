import { FC, useState, useCallback, memo, useEffect } from 'react';
import CueForm from './CueForm';
import CueList from './CueList';
import { CuePoint } from '../types/types';

interface CueManagerProps {
  currentTime: number;
  currentBeat: number;
  isMetronomeRunning: boolean;
  testCueTrigger?: number; // Trigger for test cue (increment to trigger)
}

const CueManager: FC<CueManagerProps> = ({ currentTime, currentBeat, isMetronomeRunning, testCueTrigger }) => {
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [editingCue, setEditingCue] = useState<CuePoint | null>(null);

  console.log('CueManager rendered - cuePoints length:', cuePoints.length, 'cuePoints:', cuePoints);

  const handleSubmit = useCallback((cue: Omit<CuePoint, 'id'> | CuePoint) => {
    console.log('handleSubmit called with:', cue);
    
    setCuePoints(prev => {
      console.log('Current cuePoints before:', prev);
      
      if ('id' in cue) {
        // Editing existing cue
        const updatedCuePoints = prev.map(c => c.id === cue.id ? cue : c);
        console.log('Updated cuePoints after edit:', updatedCuePoints);
        return updatedCuePoints;
      } else {
        // Adding new cue
        const newCue = {
          ...cue,
          id: Date.now().toString()
        };
        const updatedCuePoints = [...prev, newCue];
        console.log('New cue created:', newCue);
        console.log('Updated cuePoints after add:', updatedCuePoints);
        return updatedCuePoints;
      }
    });
    setEditingCue(null);
  }, []);

  const handleEdit = useCallback((cue: CuePoint) => {
    setEditingCue(cue);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCuePoints(prev => prev.filter(cue => cue.id !== id));
  }, []);

  const handleJump = useCallback((time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    console.log('Would jump to:', time, '(', minutes * 60 + seconds, 'seconds)');
  }, []);

  const handlePause = useCallback(() => {
    console.log('Would pause metronome');
  }, []);

  const handleCancel = useCallback(() => {
    setEditingCue(null);
  }, []);

  // Test function to add a test cue point
  const addTestCue = useCallback(() => {
    const testCue = {
      time: '01:23',
      title: 'Test Cue Point',
      note: 'This is a test cue created from the metronome controls',
      beat: currentBeat
    };
    handleSubmit(testCue);
  }, [handleSubmit, currentBeat]);

  // Watch for test trigger changes
  useEffect(() => {
    if (testCueTrigger && testCueTrigger > 0) {
      addTestCue();
    }
  }, [testCueTrigger, addTestCue]);

  return (
    <div>
      <CueForm
        currentTime={currentTime}
        currentBeat={currentBeat}
        onSubmit={handleSubmit}
        editingCue={editingCue}
        onCancel={handleCancel}
        isMetronomeRunning={isMetronomeRunning}
        onPause={handlePause}
      />
      
      <CueList
        cuePoints={cuePoints}
        currentTime={currentTime}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onJump={handleJump}
      />
    </div>
  );
};

export default memo(CueManager);