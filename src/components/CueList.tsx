import { FC } from 'react';
import { CuePoint } from '../types/types';
import {Play,Pencil} from 'lucide-react';

interface CueListProps {
  cuePoints: CuePoint[];
  currentTime: number;
  onEdit: (cue: CuePoint) => void;
  onDelete: (id: string) => void;
  onJump: (time: string) => void;
}

const CueList: FC<CueListProps> = ({ cuePoints, onEdit, onDelete, onJump }) => {
  if (cuePoints.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-Borders p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-Title">Cue Points</h3>
        <div className="text-Text italic">No cue points added yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-Borders p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4 text-Title">Cue Points</h3>
      <div className="relative">
        <div 
          className="overflow-y-auto"
          style={{ height: '450px' }} // Fixed height to show 3 items
        >
          <div className="space-y-4">
            {cuePoints.map((cue, index) => (
              <div key={cue.id} className="border-b-2 border-CueDivider pb-4 last:border-b-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Ordinal Number & Timestamp Column - Takes 4 columns on desktop */}
                  <div className="md:col-span-4">
                    <h4 className="text-sm font-medium mb-1 text-Title"></h4>
                    <div className="flex items-center">
                      <span className="text-l font-bold text-Numeration mr-3 min-w-[2rem]">
                        {index + 1}.
                      </span>
                      {cue.beat && (
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold mr-2
                          ${cue.beat === 1 || cue.beat === 5 ? 'bg-[#9966cb]' : 'bg-[#f0807f]'}`}>
                          {cue.beat}
                        </span>
                      )}
                      <div className="text-sm">
                        <strong className="text-Time time-display">{cue.time}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Notes Column - Takes 5 columns on desktop */}
                  <div className="md:col-span-5">
                    <h4 className="text-sm font-medium mb-1 text-Title">{cue.title}</h4>
                    <div className="text-sm min-h-[40px] text-gray-700">
                      {cue.note || <span className="text-Note italic">No title</span>}
                    </div>
                  </div>

                  {/* Actions Column - Takes 3 columns on desktop */}
                  <div className="md:col-span-3">
                    <h4 className="text-sm font-medium mb-1 text-Title"></h4>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => onJump(cue.time)}
                        className="bg-JumpTo hover:bg-Pause text-black hover:text-JumpToTextHover w-8 h-8 rounded flex items-center justify-center transition-colors duration-200"
                        title="Jump to timestamp"
                      >
                        <Play  className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onEdit(cue)}
                        className="bg-Edit hover:bg-Metronome text-white w-8 h-8 rounded flex items-center justify-center transition-colors duration-200"
                        title="Edit cue"
                      >
                        <Pencil  className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(cue.id)}
                        className="bg-DeleteCue hover:bg-Pause text-white w-8 h-8 rounded flex items-center justify-center transition-colors duration-200"
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