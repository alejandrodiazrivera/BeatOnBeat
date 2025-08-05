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
  if (cuePoints.length === 0) {
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
            {cuePoints.map((cue) => (
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
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 w-8 h-8 rounded flex items-center justify-center transition"
                        title="Jump to timestamp"
                      >
                        ▶
                      </button>
                      <button
                        onClick={() => onEdit(cue)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white w-8 h-8 rounded flex items-center justify-center transition"
                        title="Edit cue"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => onDelete(cue.id)}
                        className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded flex items-center justify-center transition"
                        title="Delete cue"
                      >
                        ✕
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