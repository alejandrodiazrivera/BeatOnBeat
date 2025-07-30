import { FC, useState } from 'react';
import CueForm from './CueForm';
import CueList from './CueList';
import { CuePoint } from '../types/types';

const CueManager: FC = () => {
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [editingCue, setEditingCue] = useState<CuePoint | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false); // Add if needed

  const handleSubmit = (cue: Omit<CuePoint, 'id'> | CuePoint) => {
    if ('id' in cue) {
      setCuePoints(cuePoints.map(c => c.id === cue.id ? cue : c));
    } else {
      const newCue = {
        ...cue,
        id: Date.now().toString()
      };
      setCuePoints([...cuePoints, newCue]);
    }
    setEditingCue(null);
  };

  const handleEdit = (cue: CuePoint) => {
    setEditingCue(cue);
  };

  const handleDelete = (id: string) => {
    setCuePoints(cuePoints.filter(cue => cue.id !== id));
  };

  const handleJump = (time: string) => {
    const [minutes, seconds] = time.split(':').map(Number);
    setCurrentTime(minutes * 60 + seconds);
    console.log('Jumping to:', time);
  };

  // Add if needed:
  const handlePause = () => {
    setIsMetronomeRunning(false);
    // Add any additional pause logic here
  };

  return (
    <div>
      <CueForm
        currentTime={currentTime}
        currentBeat={currentBeat}
        onSubmit={handleSubmit}
        editingCue={editingCue}
        onCancel={() => setEditingCue(null)}
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

export default CueManager;