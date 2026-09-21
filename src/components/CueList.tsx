import { FC } from 'react';
import { CuePoint } from '../types/types';
import { Play, Pencil } from 'lucide-react';

interface CueListProps {
  cuePoints: CuePoint[];
  currentTime: number;
  onEdit: (cue: CuePoint) => void;
  onDelete: (id: string) => void;
  onJump: (time: string) => void;
  onLoop?: (cue: CuePoint) => void;
}

const CueList: FC<CueListProps> = ({ cuePoints, onEdit, onDelete, onJump, onLoop = () => {} }) => {
  if (cuePoints.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-Borders p-6 lg:p-4 mb-6">
        <h3 className="text-xl lg:text-lg font-semibold mb-4 lg:mb-3 text-Title">Saved Loops</h3>
        <div className="text-Text italic">No saved loops yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-Borders p-6 lg:p-4 mb-6">
      <h3 className="text-xl lg:text-lg font-semibold mb-4 lg:mb-3 text-Title">Saved Loops</h3>
      <div className="relative">
        <div 
          className="overflow-y-auto"
          style={{ height: '450px' }} // Fixed height to show 3 items
        >
          <div className="space-y-4 lg:space-y-3">
            {cuePoints.map((cue, index) => (
              <div key={cue.id} className="border-b-2 border-CueDivider pb-4 lg:pb-3 last:border-b-0">
                <div className="flex flex-col gap-4 lg:flex-row lg:flex-nowrap lg:items-center lg:gap-2">
                  {/* Ordinal Number & Timestamp Column - Takes 4 columns on desktop */}
                  <div className="min-w-0 lg:flex-none">
                    <h4 className="text-sm font-medium mb-1 text-Title"></h4>
                    <div className="flex items-center">
                      <span className="text-l lg:text-sm font-bold text-Numeration mr-3 lg:mr-2 min-w-[2rem] lg:min-w-[1.5rem]">
                        {index + 1}.
                      </span>
                      <div className="min-w-0 text-sm lg:text-xs">
                        <strong className="block whitespace-nowrap text-Time time-display">
                          {cue.endTime ? `${cue.time} - ${cue.endTime}` : cue.time}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Notes Column - Takes 5 columns on desktop */}
                  <div className="min-w-0 lg:flex-1">
                    <h4 className="truncate whitespace-nowrap text-sm lg:text-xs font-medium mb-1 text-Title" title={cue.title}>{cue.title}</h4>
                  </div>

                  {/* Actions Column - Takes 3 columns on desktop */}
                  <div className="min-w-0 lg:flex-none">
                    <h4 className="text-sm font-medium mb-1 text-Title"></h4>
                    <div className="flex flex-nowrap justify-end gap-2 lg:gap-1">
                      <button
                        onClick={() => cue.endTime ? onLoop(cue) : onJump(cue.time)}
                        className="bg-JumpTo hover:bg-Pause text-black hover:text-JumpToTextHover w-8 h-8 lg:w-7 lg:h-7 rounded flex items-center justify-center transition-colors duration-200"
                        title={cue.endTime ? 'Loop practice section' : 'Jump to timestamp'}
                      >
                        <Play className="w-5 h-5 lg:w-4 lg:h-4" />
                      </button>
                      {!cue.endTime && (
                        <button
                          onClick={() => onEdit(cue)}
                          className="bg-Edit hover:bg-Metronome text-white w-8 h-8 lg:w-7 lg:h-7 rounded flex items-center justify-center transition-colors duration-200"
                          title="Edit cue"
                        >
                          <Pencil className="w-5 h-5 lg:w-4 lg:h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(cue.id)}
                        className="bg-DeleteCue hover:bg-Pause active:bg-Stop active:scale-95 text-white w-8 h-8 lg:w-7 lg:h-7 rounded flex items-center justify-center transition duration-200"
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