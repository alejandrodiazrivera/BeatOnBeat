# OnBeat - Video Metronome & Practice Tool

OnBeat is a powerful video metronome application built with Next.js that helps musicians practice with YouTube videos by providing synchronized metronome beats and cue point management.

## Features

### 🎵 Video Support
- **YouTube Videos**: Regular YouTube videos with full URL support
- **YouTube Reels/Shorts**: Full support for YouTube Shorts and Reels
- **Local Video Files**: Upload and practice with local video files (MP4, WebM, MOV)

### 🥁 Metronome Features
- **Manual Metronome**: Built with Web Audio API for precise timing
- **Auto-Sync Metronome**: Automatic BPM detection from video audio (Tone.js)
- **Multiple Time Signatures**: 8-beat and Flamenco 12-beat modes
- **Tap Tempo**: Quickly set BPM by tapping the beat
- **Strong Beat Accents**: Visual and audio emphasis on important beats
- **Mute Function**: Practice with visual metronome only

### 📍 Cue Point Management
- **Add Cues**: Mark important moments in videos with custom titles and notes
- **Edit/Delete Cues**: Full CRUD operations for cue points
- **Jump to Cues**: Quick navigation to marked timestamps
- **Precise Timing**: Millisecond precision for cue placement

### 🎬 Video Controls
- **Playback Speed**: Adjust video speed for practice (0.25x to 2x)
- **Skip Controls**: Quick 5-second forward/backward navigation
- **Overlay Toggle**: Show/hide time and beat overlays
- **Full Control Integration**: Seamless video and metronome synchronization

## Supported YouTube URL Formats

The application automatically detects and supports these YouTube URL formats:

```
Regular Videos:
- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID

YouTube Reels/Shorts:
- https://www.youtube.com/shorts/VIDEO_ID
- https://youtube.com/shorts/VIDEO_ID
```

All formats support additional parameters (timestamps, sharing parameters, etc.) and will correctly extract the 11-character video ID.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Load a Video**: Paste any YouTube URL (including Reels) or upload a local video file
2. **Set Up Metronome**: Choose manual or auto-sync mode, adjust BPM and time signature
3. **Add Cue Points**: Mark important sections for easy navigation
4. **Practice**: Use synchronized video and metronome for effective practice sessions

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Audio**: Web Audio API (manual metronome) + Tone.js (auto-sync)
- **Styling**: Tailwind CSS
- **Video Processing**: YouTube Iframe API + HTML5 Video

## Architecture

- `src/hooks/useMetronome.ts` - Manual metronome with Web Audio API
- `src/hooks/useToneMetronome.ts` - Tone.js-based metronome
- `src/hooks/useToneAutoSync.ts` - Auto BPM detection and sync
- `src/utils/youtubeUtils.ts` - YouTube URL parsing and validation
- `src/components/VideoPlayer.tsx` - Unified video player component

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
