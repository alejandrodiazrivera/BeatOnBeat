'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PanelRightClose } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { CuePoint } from '../../types/types';
import { extractVideoId } from '../../utils/youtubeUtils';

// U  // Auto-sync functionsctions for precise time handling
const parseTimeToSeconds = (timeString: string): number => {
  const parts = timeString.split(':');
  const minutes = parseInt(parts[0]);
  const secondsPart = parts[1];
  
  // Handle milliseconds if present (e.g., "45.500" or "45")
  const seconds = parseFloat(secondsPart);
  
  return minutes * 60 + seconds;
};
import VideoPlayer from '../../components/VideoPlayer';
import VideoControls from '../../components/VideoControls';
import CueForm from '../../components/CueForm';
import CueList from '../../components/CueList';
import AppHeader from '../../components/AppHeader';
import AppFooter from '../../components/AppFooter';

const formatPracticeTime = (timeInSeconds: number): string => {
  const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
  const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function LoopPage() {
  const searchParams = useSearchParams();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase: SupabaseClient | null = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, [supabaseAnonKey, supabaseUrl]);

  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([]);
  const [currentCue, setCurrentCue] = useState<CuePoint | null>(null);
  const [editingCue, setEditingCue] = useState<CuePoint | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [practiceStart, setPracticeStart] = useState<number | null>(null);
  const [practiceEnd, setPracticeEnd] = useState<number | null>(null);
  const [isLoopingPractice, setIsLoopingPractice] = useState(false);
  const [loopMode, setLoopMode] = useState<'inactive' | 'activated' | 'active'>('inactive');
  const [isMirrored, setIsMirrored] = useState(false);
  const [practiceName, setPracticeName] = useState('');
  const [isSaveLoopDialogOpen, setIsSaveLoopDialogOpen] = useState(false);
  const [isSavedLoopsOpen, setIsSavedLoopsOpen] = useState(false);
  const [libraryVideoId, setLibraryVideoId] = useState<string | null>(null);
  const currentTimeRef = useRef(0);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const resumeAfterSaveRef = useRef(false);
  const ignorePauseUntilRef = useRef(0);
  const processedDeepLinkRef = useRef<string | null>(null);
  // Removed unused videoFile state

  const fetchVideoMeta = useCallback(async (youtubeId: string) => {
    const fallback = {
      title: `YouTube video ${youtubeId}`,
      channel: 'YouTube',
      thumbnail: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    };

    try {
      const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}&format=json`;
      const response = await fetch(url);
      if (!response.ok) return fallback;
      const json = (await response.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };

      return {
        title: json.title || fallback.title,
        channel: json.author_name || fallback.channel,
        thumbnail: json.thumbnail_url || fallback.thumbnail,
      };
    } catch {
      return fallback;
    }
  }, []);

  const registerVideoInLibrary = useCallback(async (youtubeId: string): Promise<string | null> => {
    if (!supabase) return null;

    try {
      const { data: existing, error: existingError } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', youtubeId)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existing) {
        return existing.id as string;
      }

      const meta = await fetchVideoMeta(youtubeId);
      const { data: created, error: insertError } = await supabase
        .from('videos')
        .insert({
          youtube_id: youtubeId,
          title: meta.title,
          channel_name: meta.channel,
          thumbnail_url: meta.thumbnail,
          added_by: null,
        })
        .select('id')
        .single();

      if (insertError && insertError.code !== '23505') {
        throw insertError;
      }

      if (created?.id) {
        return created.id as string;
      }

      // Race-safe fallback when another client inserted the video first.
      const { data: retryExisting } = await supabase
        .from('videos')
        .select('id')
        .eq('youtube_id', youtubeId)
        .maybeSingle();

      return (retryExisting?.id as string | undefined) ?? null;
    } catch (error) {
      // Keep loop workflow uninterrupted if the library sync fails.
      console.error('Failed to register loaded loop video in library:', error);
      return null;
    }
  }, [fetchVideoMeta, supabase]);

  const loadLibraryLoops = useCallback(async (videoRowId: string): Promise<CuePoint[]> => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('loops')
        .select('id,name,start_seconds,end_seconds')
        .eq('video_id', videoRowId)
        .order('start_seconds', { ascending: true });

      if (error) {
        throw error;
      }

      const mapped: CuePoint[] = (data ?? []).map((row: {
        id: string;
        name: string;
        start_seconds: number;
        end_seconds: number;
      }) => ({
        id: row.id,
        title: row.name,
        time: formatPracticeTime(Number(row.start_seconds)),
        endTime: formatPracticeTime(Number(row.end_seconds)),
        note: '',
      }));

      setCuePoints(mapped);
      return mapped;
    } catch (error) {
      console.error('Failed to load library loops for video:', error);
      return [];
    }
  }, [supabase]);

  const loadVideoSelection = useCallback(async (
    youtubeId: string,
    options?: {
      libraryVideoRowId?: string | null;
      openSavedLoops?: boolean;
      loopId?: string | null;
    }
  ) => {
    setVideoId(youtubeId);
    setVideoUrl(`https://www.youtube.com/watch?v=${youtubeId}`);
    startTimeTracking(true);
    setCuePoints([]);
    setCurrentCue(null);
    setPracticeStart(null);
    setPracticeEnd(null);
    setIsLoopingPractice(false);
    setLoopMode('inactive');

    const linkedVideoId = options?.libraryVideoRowId ?? await registerVideoInLibrary(youtubeId);
    setLibraryVideoId(linkedVideoId);

    const loops = linkedVideoId ? await loadLibraryLoops(linkedVideoId) : [];

    if (options?.openSavedLoops) {
      setIsSavedLoopsOpen(true);
    }

    if (!options?.loopId) {
      return;
    }

    const selectedLoop = loops.find((cue) => cue.id === options.loopId && cue.endTime);
    if (!selectedLoop?.endTime) {
      return;
    }

    const start = parseTimeToSeconds(selectedLoop.time);
    const end = parseTimeToSeconds(selectedLoop.endTime);
    currentTimeRef.current = start;
    setCurrentTime(start);
    setPracticeStart(start);
    setPracticeEnd(end);
    setIsLoopingPractice(true);
    setLoopMode('active');
  }, [loadLibraryLoops, registerVideoInLibrary]);
  
  const loadVideo = async () => {
    const id = extractVideoId(videoUrl);
    if (id) {
      await loadVideoSelection(id);
    } else {
      alert('Please enter a valid YouTube URL (videos or reels)');
    }
  };

  const startTimeTracking = (resetTime = false) => {
    // No need for manual timer - VideoPlayer handles all time updates
    if (resetTime) {
      setCurrentTime(0);
    }
    // console.log('🎞️ Using VideoPlayer time sync for all videos');
  };

  const checkActiveCue = useCallback((time: number) => {
    let activeCue = null;
    let minDiff = Infinity;
    
    cuePoints.forEach(cue => {
      const cueTime = parseTimeToSeconds(cue.time);
      const diff = Math.abs(time - cueTime);
      
      if (diff < 0.1 && diff < minDiff) { // Reduced tolerance to 0.1 seconds for better precision
        activeCue = cue;
        minDiff = diff;
      }
    });
    
    setCurrentCue(activeCue);
  }, [cuePoints]);

  useEffect(() => {
    checkActiveCue(currentTime);
  }, [currentTime, cuePoints, checkActiveCue]);

  useEffect(() => {
    if (!isLoopingPractice || practiceStart === null || practiceEnd === null) {
      return;
    }

    if (currentTime >= practiceEnd) {
      setCurrentTime(practiceStart);
    }
  }, [currentTime, isLoopingPractice, practiceStart, practiceEnd]);

  useEffect(() => {
    if (isSaveLoopDialogOpen || !resumeAfterSaveRef.current) {
      return;
    }

    const resumeTimer = window.setTimeout(() => {
      resumeAfterSaveRef.current = false;
      ignorePauseUntilRef.current = Date.now() + 1000;
      setIsPlaying(true);
    }, 0);

    return () => window.clearTimeout(resumeTimer);
  }, [isSaveLoopDialogOpen]);

  useEffect(() => {
    const youtubeId = searchParams.get('youtubeId');
    if (!youtubeId) {
      return;
    }

    const libraryVideoRowId = searchParams.get('libraryVideoId');
    const loopId = searchParams.get('loopId');
    const openSavedLoops = searchParams.get('openSavedLoops') === '1';
    const deepLinkSignature = `${youtubeId}:${libraryVideoRowId ?? ''}:${loopId ?? ''}:${openSavedLoops ? '1' : '0'}`;

    if (processedDeepLinkRef.current === deepLinkSignature) {
      return;
    }

    processedDeepLinkRef.current = deepLinkSignature;
    void loadVideoSelection(youtubeId, {
      libraryVideoRowId,
      loopId,
      openSavedLoops,
    });
  }, [loadVideoSelection, searchParams]);

  const handleSubmitCue = (cue: Omit<CuePoint, 'id'>) => {
    console.log('handleSubmitCue called with:', cue);
    console.log('editingCue:', editingCue);
    
    if (editingCue && editingCue.id !== '') {
      console.log('Editing existing cue');
      setCuePoints(prev => 
        prev.map(c => 
          c.id === editingCue.id ? { ...cue, id: editingCue.id } : c
        )
      );
    } else {
      console.log('Adding new cue');
      const newCue = { ...cue, id: Date.now().toString() };
      console.log('New cue object:', newCue);
      setCuePoints(prev => {
        const updated = [...prev, newCue];
        console.log('Updated cuePoints:', updated);
        return updated;
      });
    }
    setEditingCue(null);
    
    handlePlay();
  };

  const handleEditCue = (cue: CuePoint) => {
    if (isPlaying) {
      handlePause();
    }
    
    setEditingCue(cue);
  };

  const handleDeleteCue = (id: string) => {
    if (window.confirm('Are you sure you want to delete this cue point?')) {
      setCuePoints(prev => prev.filter(cue => cue.id !== id));
      if (editingCue?.id === id) {
        setEditingCue(null);
      }
    }
  };

  const handleJumpToTimestamp = (time: string) => {
    const newTime = parseTimeToSeconds(time);
    console.log('🎯 Jumping to timestamp:', newTime, 'for video:', videoId ? 'YouTube' : 'local');
    setCurrentTime(newTime);
    
    // For YouTube videos, the VideoPlayer will handle the seeking via useEffect
    // For local videos, the manual timer will update automatically
  };

  const handleVideoPlayStateChange = useCallback((newIsPlaying: boolean) => {
    console.log('🎞️ Video player state changed:', newIsPlaying);

    if (!newIsPlaying && Date.now() < ignorePauseUntilRef.current) {
      return;
    }
    
    // Prevent unnecessary updates if state is already correct
    if (isPlaying === newIsPlaying) {
      console.log('🎞️ State already matches, skipping update');
      return;
    }
    
    setIsPlaying(newIsPlaying);
    
    if (newIsPlaying) {
      console.log('🎞️ Video resumed playing - relying on VideoPlayer time sync');
    } else {
      console.log('🎞️ Video paused');
    }
  }, [isPlaying]);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Memoized time update handler to prevent infinite re-renders
  const handleTimeUpdate = useCallback((time: number) => {
    currentTimeRef.current = time;
    setCurrentTime(time);
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    // VideoPlayer will handle time updates automatically
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSkipBack = () => {
    const newTime = Math.max(0, currentTime - 5);
    setCurrentTime(newTime);
  };

  const handleSkipForward = () => {
    const newTime = currentTime + 5;
    setCurrentTime(newTime);
  };

  const handleMarkPracticeStart = () => {
    const markedTime = Math.max(currentTimeRef.current, currentTime);
    setPracticeStart(markedTime);
    setPracticeEnd(null);
    setIsLoopingPractice(false);
    setLoopMode('activated');
  };

  const handleMarkPracticeEnd = () => {
    const markedTime = Math.max(currentTimeRef.current, currentTime);
    if (practiceStart === null || markedTime <= practiceStart) {
      alert('Mark a start point before marking an end point.');
      return;
    }

    setPracticeEnd(markedTime);
    setIsLoopingPractice(true);
    setLoopMode('active');
  };

  const handleLoopModeChange = () => {
    if (loopMode === 'inactive') {
      handleMarkPracticeStart();
      return;
    }

    if (loopMode === 'activated') {
      handleMarkPracticeEnd();
      return;
    }

    setIsLoopingPractice(false);
    setLoopMode('inactive');
  };

  const handleClearPracticeSection = () => {
    setPracticeStart(null);
    setPracticeEnd(null);
    setIsLoopingPractice(false);
    setLoopMode('inactive');
    setPracticeName('');
  };

  const handleSavePracticeLoop = async () => {
    if (practiceStart === null || practiceEnd === null) {
      alert('Mark both a start and end point before saving a practice loop.');
      return;
    }

    const title = practiceName.trim() || `Practice loop ${cuePoints.length + 1}`;
    let savedLoopId = Date.now().toString();

    if (libraryVideoId && supabase) {
      try {
        const { data: createdLoop, error } = await supabase
          .from('loops')
          .insert({
            video_id: libraryVideoId,
            name: title,
            start_seconds: practiceStart,
            end_seconds: practiceEnd,
            added_by: null,
          })
          .select('id')
          .single();

        if (error) {
          throw error;
        }

        if (createdLoop?.id) {
          savedLoopId = createdLoop.id as string;
        }
      } catch (error) {
        console.error('Failed to save loop to communal library:', error);
      }
    }

    const savedLoop: CuePoint = {
      id: savedLoopId,
      time: formatPracticeTime(practiceStart),
      endTime: formatPracticeTime(practiceEnd),
      title,
      note: ''
    };

    setCuePoints(prev => [...prev, savedLoop]);
    setPracticeStart(null);
    setPracticeEnd(null);
    setIsLoopingPractice(false);
    setLoopMode('inactive');
    setPracticeName('');
    resumeAfterSaveRef.current = true;
    setIsSaveLoopDialogOpen(false);
    // Open saved loops sidebar when a loop is saved
    setIsSavedLoopsOpen(true);
  };

  const handleOpenSaveLoopDialog = () => {
    if (practiceStart === null || practiceEnd === null) {
      alert('Mark both a start and end point before saving a practice loop.');
      return;
    }

    if (isPlaying) {
      handlePause();
    }
    setIsSaveLoopDialogOpen(true);
  };

  const handleCloseSaveLoopDialog = () => {
    setIsSaveLoopDialogOpen(false);
  };

  const handleLoopCue = (cue: CuePoint) => {
    if (!cue.endTime) {
      handleJumpToTimestamp(cue.time);
      return;
    }

    const start = parseTimeToSeconds(cue.time);
    const end = parseTimeToSeconds(cue.endTime);
    setPracticeStart(start);
    setPracticeEnd(end);
    currentTimeRef.current = start;
    setCurrentTime(start);
    setIsLoopingPractice(true);
    setLoopMode('active');
    handlePlay();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    // VideoPlayer will automatically handle the speed change via its playbackSpeed prop
  };

  const timelineDuration = useMemo(() => {
    const cueTimes = cuePoints.map((cue) => parseTimeToSeconds(cue.time));
    return Math.max(60, currentTime, practiceStart ?? 0, practiceEnd ?? 0, ...cueTimes);
  }, [cuePoints, currentTime, practiceEnd, practiceStart]);

  const pct = (timeInSeconds: number) => `${Math.min(100, Math.max(0, (timeInSeconds / timelineDuration) * 100))}%`;

  return (
    <div className="min-h-screen bg-white text-Text antialiased">
      <AppHeader />
      
      <main className="px-4 pt-8">
        <div className="mx-auto max-w-[1220px] pb-24 pt-7">
          <div className="mb-5">
            <h1 className="text-[22px] font-semibold text-Title">Loop Editor</h1>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2.5">
            <div className="flex min-w-[260px] flex-1 basis-[340px] items-center gap-2 rounded-xl border border-Borders bg-white py-1.5 pl-3.5 pr-1.5 transition focus-within:ring-2 focus-within:ring-Navbar/10">
              <input
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void loadVideo();
                  }
                }}
                placeholder="Paste a YouTube link and press Enter..."
                className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-TextXl"
              />
              <button
                onClick={() => void loadVideo()}
                className="rounded-lg bg-Navbar px-4 py-2 text-sm font-semibold text-Save transition hover:bg-Borders"
              >
                Load
              </button>
            </div>

            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              className="inline-flex h-[43px] items-center rounded-[11px] border border-Borders bg-white px-3.5 text-sm font-medium text-Text transition hover:border-Navbar hover:text-Title"
            >
              Choose file
            </button>
          </div>

          <section className="overflow-hidden rounded-2xl border border-Separator bg-white">
            <div className="p-4">
              <div className="overflow-hidden rounded-xl border border-Separator bg-Navbar">
                <VideoPlayer
                  videoId={videoId}
                  currentTime={currentTime}
                  currentCue={currentCue}
                  isPlaying={isPlaying}
                  isMirrored={isMirrored}
                  loop={loopMode !== 'inactive'}
                  muted={false}
                  playbackSpeed={playbackSpeed}
                  onTimeUpdate={handleTimeUpdate}
                  onPlayStateChange={handleVideoPlayStateChange}
                  onVideoEnded={handleVideoEnded}
                  fileInputRef={videoFileInputRef}
                  debug={false}
                  onVideoFileUploaded={(file) => {
                    console.log('📁 VideoPlayer uploaded file:', file.name);
                    setVideoId(null);
                    setCurrentTime(0);
                  }}
                />
              </div>
            </div>

            <div className="border-t border-Separator px-4 py-4">
              <div className="rounded-2xl border border-Separator bg-white p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-TextXl">Timeline</div>
                    <div className="mt-1 text-sm text-TextL">
                      {practiceStart !== null && practiceEnd !== null
                        ? (
                          <>
                            <span className="font-semibold text-Text">{formatPracticeTime(practiceStart)}</span>
                            <span className="px-1">–</span>
                            <span className="font-semibold text-Text">{formatPracticeTime(practiceEnd)}</span>
                            <span className="px-2 text-TextXl">·</span>
                            <span>{formatPracticeTime(Math.max(0, practiceEnd - practiceStart))} section</span>
                          </>
                        )
                        : practiceStart !== null
                          ? <><span className="font-semibold text-Text">{formatPracticeTime(practiceStart)}</span><span className="px-2 text-TextXl">·</span><span>waiting for OUT</span></>
                          : 'No loop set'}
                    </div>
                  </div>
                  <div className="text-right text-[13px] text-TextL tabular-nums">
                    <div><span className="font-semibold text-Text">{formatPracticeTime(currentTime)}</span> / {formatPracticeTime(timelineDuration)}</div>
                  </div>
                </div>

                <div className="relative mt-7">
                  <div className="relative h-2 rounded-full bg-Separator">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-Navbar/20" style={{ width: pct(currentTime) }} />

                    {practiceStart !== null && practiceEnd !== null && practiceEnd > practiceStart && (
                      <div
                        className="absolute inset-y-[-3px] rounded-[4px] bg-Navbar/8"
                        style={{ left: pct(practiceStart), width: `calc(${pct(practiceEnd)} - ${pct(practiceStart)})` }}
                      />
                    )}

                    {cuePoints.map((cue) => {
                      const cueTime = parseTimeToSeconds(cue.time);
                      return (
                        <div
                          key={cue.id}
                          className="absolute top-[-4px] h-4 w-[2px] -translate-x-1/2 rounded-full bg-Text2xl"
                          style={{ left: pct(cueTime) }}
                          title={`${cue.title} · ${cue.time}`}
                        />
                      );
                    })}

                    {practiceStart !== null && (
                      <div className="absolute top-[-10px] h-7 w-[9px] -translate-x-1/2" style={{ left: pct(practiceStart) }}>
                        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-Navbar" />
                        <div className="absolute top-0 left-1/2 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                        <div className="absolute bottom-0 left-1/2 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                        <span className="absolute bottom-[calc(100%+5px)] right-1/2 whitespace-nowrap rounded-md bg-Navbar px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white tabular-nums">
                          IN {formatPracticeTime(practiceStart)}
                        </span>
                      </div>
                    )}

                    {practiceEnd !== null && (
                      <div className="absolute top-[-10px] h-7 w-[9px] -translate-x-1/2" style={{ left: pct(practiceEnd) }}>
                        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-Navbar" />
                        <div className="absolute top-0 left-1/2 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                        <div className="absolute bottom-0 left-1/2 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                        <span className="absolute bottom-[calc(100%+5px)] left-1/2 whitespace-nowrap rounded-md bg-Navbar px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white tabular-nums">
                          OUT {formatPracticeTime(practiceEnd)}
                        </span>
                      </div>
                    )}

                    <div className="absolute top-[-7px] h-[22px] w-[2px] -translate-x-1/2 bg-Navbar" style={{ left: pct(currentTime) }}>
                      <div className="absolute left-1/2 top-[-5px] h-[10px] w-[10px] -translate-x-1/2 rounded-full bg-Navbar shadow-[0_0_0_2px_#fff]" />
                    </div>
                  </div>

                  <div className="relative mt-2 h-4 text-[10px] text-TextXl tabular-nums">
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                      const time = timelineDuration * ratio;
                      return (
                        <span key={ratio} className="absolute -translate-x-1/2" style={{ left: `${ratio * 100}%` }}>
                          {formatPracticeTime(time)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-Separator px-4 py-4">
              <VideoControls
                onPlay={handlePlay}
                onPause={handlePause}
                onStop={handleStop}
                onSkipBack={handleSkipBack}
                onSkipForward={handleSkipForward}
                onToggleMirror={() => setIsMirrored(prev => !prev)}
                isMirrored={isMirrored}
                onLoopModeChange={handleLoopModeChange}
                onSaveLoop={handleOpenSaveLoopDialog}
                onClearLoop={handleClearPracticeSection}
                onOpenSavedLoops={() => setIsSavedLoopsOpen(prev => !prev)}
                loopMode={loopMode}
                canSaveLoop={practiceStart !== null && practiceEnd !== null}
                canClearLoop={practiceStart !== null || practiceEnd !== null}
                onSpeedChange={handleSpeedChange}
                playbackSpeed={playbackSpeed}
              />
            </div>
          </section>
        </div>

      {isSaveLoopDialogOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-Navbar/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseSaveLoopDialog();
            }
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSavePracticeLoop();
            }}
            className="w-full max-w-md rounded-2xl border border-Separator bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-loop-title"
          >
            <h2 id="save-loop-title" className="text-xl font-semibold tracking-tight text-Title">
              Save practice loop
            </h2>
            <p className="mt-2 text-sm text-TextL">
              Give this section a name so you can find it again in your cue points.
            </p>
            <p className="mt-3 rounded-lg border border-Separator bg-Separator/25 px-3 py-2 text-sm font-medium text-Text">
              {practiceStart !== null && practiceEnd !== null
                ? `${formatPracticeTime(practiceStart)} - ${formatPracticeTime(practiceEnd)}`
                : ''}
            </p>
            <label htmlFor="practice-loop-name" className="sr-only">
              Practice loop name
            </label>
            <input
              id="practice-loop-name"
              type="text"
              value={practiceName}
              onChange={(event) => setPracticeName(event.target.value)}
              placeholder="e.g. Opening footwork"
              autoFocus
              className="mt-4 w-full rounded-lg border border-Borders px-3 py-3 text-Text outline-none transition focus:border-Navbar"
              maxLength={80}
              required
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseSaveLoopDialog}
                className="rounded-lg border border-Borders px-4 py-2 text-sm font-medium text-Text transition hover:bg-Separator/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-Navbar px-4 py-2 text-sm font-semibold text-Save transition hover:bg-Borders"
              >
                Save loop
              </button>
            </div>
          </form>
        </div>
      )}

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[min(420px,100%)] overflow-y-auto border-l border-Separator bg-white transition-transform duration-300 ease-out ${isSavedLoopsOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isSavedLoopsOpen}
      >
        <div className="px-5 pb-16 pt-5">
          <div className="mb-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-TextXl">Saved Loops</span>
              <p className="mt-1 text-sm text-TextL">Practice sections you can jump to or restart as loops.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSavedLoopsOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-Separator bg-white text-TextL transition hover:border-Borders hover:text-Text"
              title="Close saved loops"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

          <CueList
            cuePoints={cuePoints}
            currentTime={currentTime}
            onEdit={handleEditCue}
            onDelete={handleDeleteCue}
            onJump={handleJumpToTimestamp}
            onLoop={handleLoopCue}
          />
        </div>
      </aside>

      {editingCue && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-Navbar/50 backdrop-blur-sm">
          <CueForm
            currentTime={currentTime}
            onSubmit={handleSubmitCue}
            editingCue={editingCue}
            onCancel={() => setEditingCue(null)}
            onPause={handlePause} 
          />
        </div>
      )}
      </main>
      <AppFooter />
    </div>
  )
}