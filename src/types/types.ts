export interface CuePoint {
  id: string;
  time: string;
  title: string;
  note: string;
  beat?: number;
}

export interface AppState {
  cuePoints: CuePoint[];
  currentBPM: number | null;
  currentBeat: number;
  isMetronomeRunning: boolean;
  overlaysVisible: boolean;
  currentTime: number;
  currentCue: CuePoint | null;
  editingId: string | null;
  videoId: string | null;
}