# OnBeat Project Context

This file is a working reference for future development sessions. It describes the current implementation, ownership boundaries, important behavior, and known inconsistencies. Update it when the architecture or behavior changes.

## Project Summary

OnBeat is a browser-based video practice tool. A user loads a YouTube video, plays it with custom controls, creates timestamped cue points, and can mark a practice section for looping.

The application is a Next.js App Router project written in TypeScript and React. The main experience is client-side and currently keeps its state in React memory; there is no backend, database, authentication, or persistence layer.

## Source Of Truth

- Active page: `src/app/page.tsx`
- App shell: `src/app/layout.tsx`
- Global styling and Tailwind-related custom colors: `src/app/globals.css`
- Shared data types: `src/types/types.ts`
- Package root: this directory (`onbeat/`)
- Development server: `npm run dev`, normally at `http://localhost:3000`

The outer workspace folder contains an additional `node_modules/` directory, but commands and source changes should be made from the inner `onbeat/` project directory.

## Tech Stack

- Next.js 15.4.4 with the App Router
- React 19.1.0
- TypeScript 5 with strict mode enabled
- Tailwind CSS 3 configuration plus Tailwind/PostCSS packages
- Tone.js 15 for metronome timing, synthesis, transport, and analysis helpers
- Web Audio APIs for local video audio analysis
- `lucide-react` and `react-icons` for icons
- YouTube Iframe API for YouTube playback

`README.md` still describes the project as Next.js 14; `package.json` is the current dependency source of truth.

## User Flow

1. The user enters a YouTube URL in `src/app/page.tsx`.
2. `extractVideoId` in `src/utils/youtubeUtils.ts` validates and extracts an 11-character ID.
3. The ID is passed to `VideoPlayer`, which loads the YouTube Iframe API and creates a player.
4. The page owns playback state and passes it to `VideoControls` and `VideoPlayer`.
5. The page owns playback controls and cue creation/editing.
6. Cue creation/editing pauses playback, opens `CueForm`, then resumes playback after submit.
7. `CueList` displays cues and can jump the video to a cue timestamp.
8. The practice-section controls can mark a start and end time, name and save that range as a cue, then loop it by seeking through the existing `currentTime` path.

## Component Ownership

### `src/app/page.tsx`

The page is the orchestration layer and owns nearly all application state:

- `videoUrl`, `videoId`
- `currentTime`, `isPlaying`, `playbackSpeed`
- `cuePoints`, `currentCue`, `editingCue`
- `overlaysVisible`
- cue pause/resume bookkeeping (`wasMetronomeRunning`, `pausedBeat`)
- selected time mode (`8-beat` or `flamenco-12`)
- `useToneMetronome` and `useToneAutoSync` instances

It coordinates video and metronome pause/resume behavior. Keep changes to synchronization behavior here unless the behavior clearly belongs in a hook or component.

### `src/components/VideoPlayer.tsx`

Unified player component with two playback paths:

- YouTube playback through the global YouTube Iframe API
- Local video playback through an HTML5 `<video>` element and an object URL

It reports time and playback changes through callbacks, supports playback speed, overlays, cue display, and optional file upload. It also exposes the local video element through `onVideoElementReady` for audio analysis.

The parent currently does not store the uploaded file as application state. Treat local upload support as player-local behavior unless the upload flow is deliberately expanded.

### `src/components/VideoControls.tsx`

Presentational controls for play, pause, stop, five-second skip in either direction, playback speed, add cue, and overlay visibility.

### `src/components/CueForm.tsx`

Modal form for adding or editing a cue. It accepts `MM:SS` or `MM:SS.milliseconds`-style text, sanitizes submitted text, stores title/note/beat, and can be dragged on desktop.

### `src/components/CueList.tsx`

Cue list with edit, delete, and jump actions. Read this component before changing cue display or ordering behavior.

### `src/components/BeatIndicator.tsx`

Visual beat display driven by the selected time mode and `getTimeModeConfig`.

### `src/components/Header/` and `src/components/Footer/`

Brand/navigation and footer UI. These are JSX/CSS components rather than TypeScript components.

## Hooks

### Other hooks

The repository still contains `useMetronome.ts`, `useMetronome_clean.ts`, `useToneMetronome.ts`, `useToneAutoSync.ts`, `useBPMDetection.ts`, and `useAudio.ts` as legacy or experimental code. None are imported by the active `src/app/page.tsx`. Remove them and the remaining legacy page variants in a separate cleanup once the cue redesign has stabilized.

## Data Model

`src/types/types.ts` defines:

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

Cue IDs are generated with `Date.now().toString()` in the page. Cue times remain strings rather than numeric seconds, so parsing/formatting logic is duplicated between the page, player/form, and cue list areas.

`AppState` exists as a type but is not currently used as a single state container.

## YouTube Utilities

`src/utils/youtubeUtils.ts` supports:

- `youtube.com/watch?v=...`
- `youtu.be/...`
- `youtube.com/shorts/...`

`extractVideoId` performs simple string-based parsing and validates the result with the 11-character YouTube ID regex. `getYouTubeVideoType`, `isYouTubeUrl`, and thumbnail generation are also available. `src/utils/testYouTubeUtils.ts` contains utility test/demo code; check its actual usage before treating it as a test runner.

## Important Behavior And Quirks

- All primary state is ephemeral. Reloading the page loses the loaded video, cues, BPM, and settings.
- Cue save currently resumes video playback unconditionally, even if the user was not playing before opening the cue form.
- The page uses `currentTime` as the seek source; `VideoPlayer` performs the actual YouTube/local player synchronization.
- The page checks active cues with a small approximately 0.1-second tolerance.
- The active metronome feature was removed. Do not reintroduce BPM, beat, Tone, or auto-sync props while redesigning cues unless the product direction explicitly brings timing assistance back.
- `CuePoint` and `AppState` still contain legacy beat/metronome fields for compatibility with old files; the active cue form no longer creates or edits beat values.
- Practice loops are currently stored in the in-memory `cuePoints` array. They can be named, revisited, and activated from the cue list, but they are lost on page reload until persistence is added.
- YouTube API loading and player lifecycle are handled inside `VideoPlayer`; avoid adding a second YouTube API loader in the page.
- Practice sections currently exist as page-local start/end timestamps and are not yet persisted or represented in the `CuePoint` data model.
- Some source files contain verbose debug logging and older comments. Preserve behavior first; avoid broad cleanup while changing a focused feature.

## Styling And UI Conventions

- The active page uses Tailwind utility classes heavily.
- Custom semantic color names such as `Metronome`, `Stop`, `Pause`, `Cue`, `Borders`, and `InputboxColor` are defined through the Tailwind configuration and/or global CSS.
- Existing controls use Lucide icons and icon-only buttons with accessible labels/titles.
- Keep the existing visual language when extending the practice workflow; do not introduce a second component system without a clear reason.

## Important Files

```text
src/app/page.tsx                 Main orchestration and application state
src/app/layout.tsx               Root layout and metadata
src/app/globals.css              Global styles and custom CSS
src/components/VideoPlayer.tsx   YouTube/HTML5 video abstraction
src/components/VideoControls.tsx Playback and cue controls
src/components/CueForm.tsx       Add/edit cue modal
src/components/CueList.tsx       Cue display and actions
src/utils/youtubeUtils.ts        YouTube URL parsing/validation
src/types/types.ts               Shared TypeScript types
```

## Legacy And Experimental Files

The repository includes `page_clean.tsx`, `page_fixed.tsx`, `useMetronome_clean.ts`, and other alternative hooks. They are not the active route or active metronome implementation unless imported by the current page. Do not update a legacy variant as a substitute for the active file without confirming the import path.

## Commands

Run these from the inner `onbeat/` directory:

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

The project has no documented database setup or environment variables. YouTube playback depends on browser access to the YouTube Iframe API, and audio analysis depends on browser Web Audio support.

## Guidance For Future Changes

1. Start at `src/app/page.tsx` for user-facing workflow changes.
2. Move reusable timing/audio behavior into the owning hook rather than duplicating Tone.js logic in components.
3. Keep YouTube iframe concerns inside `VideoPlayer`.
4. Keep cue parsing/formatting consistent; consider centralizing it before adding more timestamp features.
5. Validate focused behavior first, then run `npm run build` for cross-component TypeScript/Next.js issues.
6. Avoid broad refactors of the legacy files unless the task explicitly targets them.
