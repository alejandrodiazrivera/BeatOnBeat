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
      <div className="rounded-2xl border border-Separator bg-white p-5">
        <h3 className="text-lg font-semibold tracking-tight text-Title">Saved loops</h3>
        <div className="mt-2 text-sm italic text-TextL">No saved loops yet.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-Separator bg-white">
      <div className="border-b border-Separator bg-Separator/25 px-4 py-3">
        <h3 className="text-lg font-semibold tracking-tight text-Title">Saved loops</h3>
        <p className="mt-1 text-sm text-TextL">Jump back into a saved practice section or edit its label.</p>
      </div>
      <div className="relative px-4 py-3">
        <div 
          className="overflow-y-auto"
          style={{ height: '450px' }}
        >
          <div className="space-y-2.5">
            {cuePoints.map((cue, index) => (
              <div key={cue.id} className="rounded-xl border border-Separator bg-white px-3.5 py-3 transition hover:border-Borders hover:bg-Separator/20">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex min-w-[26px] items-center justify-center rounded-full border border-Separator bg-Separator/40 px-2 py-0.5 text-[11.5px] font-bold text-TextXl">
                        {index + 1}.
                        </span>
                        <strong className="block whitespace-nowrap text-[13px] font-semibold text-Title time-display">
                          {cue.endTime ? `${cue.time} - ${cue.endTime}` : cue.time}
                        </strong>
                      </div>
                      <h4 className="mt-2 truncate text-sm font-semibold text-Title" title={cue.title}>{cue.title}</h4>
                    </div>
                    <div className="flex flex-nowrap justify-end gap-2">
                      <button
                        onClick={() => cue.endTime ? onLoop(cue) : onJump(cue.time)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-Separator bg-white text-Text transition hover:border-Borders hover:bg-Separator hover:text-Title"
                        title={cue.endTime ? 'Loop practice section' : 'Jump to timestamp'}
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      {!cue.endTime && (
                        <button
                          onClick={() => onEdit(cue)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-Separator bg-white text-Text transition hover:border-Borders hover:bg-Separator hover:text-Title"
                          title="Edit cue"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(cue.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-Separator bg-white text-Text transition hover:border-Borders hover:bg-Separator hover:text-DeleteCue"
                        title="Delete cue"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {cue.note ? <p className="text-sm text-TextL">{cue.note}</p> : null}
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