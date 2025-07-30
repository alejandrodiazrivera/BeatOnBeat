import { FC } from 'react';
import { CuePoint } from '../types/types';

interface CueListProps {
  cuePoints: CuePoint[];
  currentTime: number;
  onEdit: (cue: CuePoint) => void;
  onDelete: (id: string) => void;
  onJump: (time: string) => void;
}

const CueList: FC<CueListProps> = ({ cuePoints, currentTime, onEdit, onDelete, onJump }) => {
  // Temporary mock data for testing (remove this in production)
  const mockCuePoints: CuePoint[] = [
  {
    id: '1',
    time: '00:00:05',
    title: 'Basic Step Start',
    note: 'Leader: Forward break (1-2-3), Follower: Back step (5-6-7)',
    beat: 1, // On the "1" beat (salsa counts in 8)
  },
  {
    id: '2',
    time: '00:00:15',
    title: 'Right Turn (Derecha)',
    note: 'Leader signals → Follower spins 360° under raised arm (beat 3)',
    beat: 3, // Turn lands on the 3
  },
  {
    id: '3',
    time: '00:00:30',
    title: 'Cross Body Lead',
    note: 'Leader steps aside, guides Follower across (5-6-7 timing)',
    beat: 5, // Key moment in the 8-count
  },
  {
    id: '4',
    time: '00:00:45',
    title: 'Copa (Breakaway)',
    note: 'Open position → Follower free spins → catch on 7',
    beat: 7, // Syncopated move
  },
  {
    id: '5',
    time: '00:01:00',
    title: 'Shines (Footwork)',
    note: 'Partners separate: Suzy Q → side taps → sync back on 1',
    beat: 1, // Restart cycle
  },
];

  // Use mock data if cuePoints is empty (for testing)
  const displayCuePoints = cuePoints.length > 0 ? cuePoints : mockCuePoints;

  if (displayCuePoints.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Cue Points</h3>
        <div className="text-gray-500 italic">No cue points added yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Cue Points</h3>
      <div className="relative">
        <div 
          className="overflow-y-auto"
          style={{ height: '300px' }} // Fixed height to show 3 items
        >
          <div className="space-y-4">
            {displayCuePoints.map((cue) => (
              <div key={cue.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Timestamp Column - Takes 4 columns on desktop */}
                  <div className="md:col-span-4">
                    <h4 className="text-sm font-medium mb-1 text-gray-600"></h4>
                    <div className="flex items-center">
                      {cue.beat && (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold mr-2
                          ${cue.beat === 1 || cue.beat === 5 ? 'bg-purple-500' : 'bg-red-500'}`}>
                          {cue.beat}
                        </span>
                      )}
                      <div className="text-sm">
                        <strong>{cue.time}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Notes Column - Takes 5 columns on desktop */}
                  <div className="md:col-span-5">
                    <h4 className="text-sm font-medium mb-1 text-gray-600">{cue.title}</h4>
                    <div className="text-sm min-h-[40px]">
                      {cue.note || <span className="text-gray-500 italic">No title</span>}
                    </div>
                  </div>

                  {/* Actions Column - Takes 3 columns on desktop */}
                  <div className="md:col-span-3">
                    <h4 className="text-sm font-medium mb-1 text-gray-600"></h4>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => onJump(cue.time)}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded text-xs transition"
                      >
                        Jump
                      </button>
                      <button
                        onClick={() => onEdit(cue)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(cue.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CueList;