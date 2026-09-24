# ChoreoLab Project Context

This is the current implementation reference for development sessions.

## Project summary

ChoreoLab is a browser-based video practice tool where users:

1. Load a YouTube video (or upload a local video file),
2. Control playback (play/pause/stop/skip/speed/mirror),
3. Mark loop in/out sections,
4. Save loops and cues in a sidebar list.

The app is client-side and in-memory only (no backend, no persistence).

## Source of truth

- Main practice route: `src/app/page.tsx`
- Communal library route: `src/app/library/page.tsx`
- App shell: `src/app/layout.tsx`
- Global styles: `src/app/globals.css`
- Shared types: `src/types/types.ts`
- Utilities: `src/utils/youtubeUtils.ts`

Run commands from the repository root:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run start
```

## Current user flow

1. User pastes YouTube URL and clicks **Load Video**.
2. `extractVideoId` validates supported URL formats and returns the 11-char video id.
3. `VideoPlayer` loads YouTube Iframe API playback, or local file playback if a file was uploaded.
4. `VideoControls` drives transport, speed, mirror, and loop actions.
5. Loop sections can be saved as cue entries with `time` + `endTime`.
6. `CueList` supports jump/edit/delete and loop activation for saved ranges.

## Communal library flow (`/library`)

1. User pastes a YouTube URL and adds it to the shared Supabase-backed `videos` table.
2. Library rows support search, tag filtering, has-loops filtering, sorting, and pagination.
3. Selecting a row opens a right-side drawer with embedded YouTube playback.
4. Registered loops for the selected video are loaded from the `loops` table and can be played in loop mode.
5. Realtime subscriptions keep `videos` and `loops` synchronized across clients.

## Component ownership

### `src/app/page.tsx`

Main orchestration and state:

- Video: `videoUrl`, `videoId`, `currentTime`, `isPlaying`, `playbackSpeed`, `isMirrored`
- Cue/loop: `cuePoints`, `currentCue`, `editingCue`, `practiceStart`, `practiceEnd`, `loopMode`
- UI state: save-loop dialog, saved-loops sidebar

### `src/components/VideoPlayer.tsx`

Unified playback abstraction:

- YouTube Iframe path
- Local `<video>` path with file upload support
- Emits playback and time updates back to page
- Handles mirror, mute, playback rate, and seek synchronization

### `src/components/VideoControls.tsx`

Transport + workflow controls:

- Play / Pause / Stop
- Skip +/-5s
- Mirror toggle
- Local file picker trigger
- Speed cycle (`1x`, `0.75x`, `0.5x`)
- Loop in/out/active mode switch
- Save loop / clear loop

### `src/components/CueForm.tsx`

Cue editor modal for add/edit, with time/title/note fields.

### `src/components/CueList.tsx`

Saved loops/cues panel with jump, loop, edit (for non-loop cues), and delete actions.

## Data model

`CuePoint` in `src/types/types.ts`:

```ts
interface CuePoint {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  note: string;
  beat?: number;
}
```

`beat` remains in the type for legacy compatibility but is not used by the active page workflow.

## Legacy code status

Legacy metronome/auto-sync code still exists in files like:

- `src/app/page_clean.tsx`
- `src/app/page_fixed.tsx`
- `src/hooks/useMetronome.ts`
- `src/hooks/useToneMetronome.ts`
- `src/hooks/useToneAutoSync.ts`
- `src/components/MetronomeControls.tsx`

These are not imported by the active route (`src/app/page.tsx`).

## Important behavior and constraints

- App state resets on page refresh.
- Loop playback is implemented by monitoring `currentTime` and seeking back to `practiceStart`.
- Saved loops are represented as cue entries with `endTime`.
- YouTube API initialization and lifecycle are encapsulated in `VideoPlayer`.
