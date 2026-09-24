'use client';

import { createClient, type RealtimePostgresChangesPayload, type SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { extractVideoId } from '@/utils/youtubeUtils';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

type VideoRow = {
  id: string;
  youtube_id: string;
  title: string | null;
  channel_name: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  tags: string[] | null;
  views: number | null;
  flag_count: number | null;
  added_by: string | null;
  created_at: string;
  updated_at: string;
};

type LoopRow = {
  id: string;
  video_id: string;
  name: string;
  start_seconds: number;
  end_seconds: number;
  added_by: string | null;
  created_at: string;
  updated_at: string;
};

type LibraryVideo = {
  id: string;
  youtubeId: string;
  title: string;
  channel: string;
  thumbnail: string;
  durationSeconds: number | null;
  tags: string[];
  views: number;
  flags: number;
  addedBy: string | null;
  createdAt: number;
  updatedAt: number;
};

type LibraryLoop = {
  id: string;
  videoId: string;
  name: string;
  start: number;
  end: number;
  addedBy: string | null;
  createdAt: number;
  updatedAt: number;
};

type SortKey = 'title' | 'channel' | 'loops' | 'views' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface YTPlayer {
  destroy: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData?: () => { video_id: string };
}

interface YTNamespace {
  Player: new (
    element: string | HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    }
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const THUMB_FALLBACK_2 =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='176' height='100'><rect width='100%25' height='100%25' fill='%23e5e5e5'/><polygon points='74,36 74,64 100,50' fill='%23999999'/></svg>";

let ytLoaderPromise: Promise<YTNamespace> | null = null;

const mapVideoRow = (r: VideoRow): LibraryVideo => ({
  id: r.id,
  youtubeId: r.youtube_id,
  title: r.title ?? 'Untitled',
  channel: r.channel_name ?? 'YouTube',
  thumbnail: r.thumbnail_url ?? `https://i.ytimg.com/vi/${r.youtube_id}/hqdefault.jpg`,
  durationSeconds: r.duration_seconds ?? null,
  tags: r.tags ?? [],
  views: r.views ?? 0,
  flags: r.flag_count ?? 0,
  addedBy: r.added_by,
  createdAt: new Date(r.created_at).getTime(),
  updatedAt: new Date(r.updated_at).getTime(),
});

const mapLoopRow = (r: LoopRow): LibraryLoop => ({
  id: r.id,
  videoId: r.video_id,
  name: r.name,
  start: Number(r.start_seconds),
  end: Number(r.end_seconds),
  addedBy: r.added_by,
  createdAt: new Date(r.created_at).getTime(),
  updatedAt: new Date(r.updated_at).getTime(),
});

const fmtTime = (sec: number | null): string => {
  if (sec === null || !Number.isFinite(sec)) return '—';
  const safe = Math.max(0, Math.round(sec));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const fmtAdded = (timestamp: number): string => {
  const d = new Date(timestamp);
  const now = new Date();
  const day = 86400000;
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / day);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

const thumbFallback1 = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

const loadYT = async (): Promise<YTNamespace> => {
  if (ytLoaderPromise) return ytLoaderPromise;
  ytLoaderPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('YouTube API can only load in browser.'));
      return;
    }
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => reject(new Error('Failed to load YouTube iframe API.'));
    document.head.appendChild(script);
  });
  return ytLoaderPromise;
};

export default function LibraryPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase: SupabaseClient | null = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    return createClient(supabaseUrl, supabaseAnonKey);
  }, [supabaseAnonKey, supabaseUrl]);

  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [loops, setLoops] = useState<LibraryLoop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const [addInput, setAddInput] = useState('');
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [hasLoopsOnly, setHasLoopsOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [adding, setAdding] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [activeLoopId, setActiveLoopId] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [flaggedThisSession, setFlaggedThisSession] = useState<Set<string>>(new Set());

  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const loopTimerRef = useRef<number | null>(null);

  const loopCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    loops.forEach((l) => counts.set(l.videoId, (counts.get(l.videoId) ?? 0) + 1));
    return counts;
  }, [loops]);

  const allTags = useMemo(() => {
    return [...new Set(videos.flatMap((v) => v.tags))].sort((a, b) => a.localeCompare(b));
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = videos.filter((v) => {
      const queryPass =
        q.length === 0 ||
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.tags.join(' ').toLowerCase().includes(q);
      const tagPass = !tagFilter || v.tags.includes(tagFilter);
      const loopsPass = !hasLoopsOnly || (loopCountMap.get(v.id) ?? 0) > 0;
      return queryPass && tagPass && loopsPass;
    });

    const dir = sortDir === 'asc' ? 1 : -1;
    list.sort((a, b) => {
      const lv = (() => {
        if (sortKey === 'title') return a.title.toLowerCase();
        if (sortKey === 'channel') return a.channel.toLowerCase();
        if (sortKey === 'loops') return loopCountMap.get(a.id) ?? 0;
        if (sortKey === 'views') return a.views;
        return a.createdAt;
      })();
      const rv = (() => {
        if (sortKey === 'title') return b.title.toLowerCase();
        if (sortKey === 'channel') return b.channel.toLowerCase();
        if (sortKey === 'loops') return loopCountMap.get(b.id) ?? 0;
        if (sortKey === 'views') return b.views;
        return b.createdAt;
      })();
      return lv < rv ? -1 * dir : lv > rv ? 1 * dir : 0;
    });
    return list;
  }, [hasLoopsOnly, loopCountMap, search, sortDir, sortKey, tagFilter, videos]);

  const totalPages = useMemo(() => {
    if (pageSize === 0) return 1;
    return Math.max(1, Math.ceil(filteredVideos.length / pageSize));
  }, [filteredVideos.length, pageSize]);

  const pageItems = useMemo(() => {
    if (pageSize === 0) return filteredVideos;
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    return filteredVideos.slice(start, start + pageSize);
  }, [filteredVideos, page, pageSize, totalPages]);

  const selectedVideo = useMemo(
    () => videos.find((v) => v.id === selectedVideoId) ?? null,
    [selectedVideoId, videos]
  );

  const selectedLoops = useMemo(() => {
    if (!selectedVideoId) return [];
    return loops
      .filter((l) => l.videoId === selectedVideoId)
      .slice()
      .sort((a, b) => a.start - b.start);
  }, [loops, selectedVideoId]);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('library-flagged');
      if (!stored) return;
      const parsed = JSON.parse(stored) as string[];
      setFlaggedThisSession(new Set(parsed));
    } catch (error) {
      console.error('Failed to read flagged IDs from sessionStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('library-flagged', JSON.stringify([...flaggedThisSession]));
    } catch (error) {
      console.error('Failed to write flagged IDs to sessionStorage:', error);
    }
  }, [flaggedThisSession]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setLoadingError('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }
    let mounted = true;

    const fetchAll = async () => {
      setLoading(true);
      setLoadingError(null);
      try {
        const [videoResult, loopResult] = await Promise.all([
          supabase.from('videos').select('*').order('created_at', { ascending: false }),
          supabase.from('loops').select('*'),
        ]);
        if (videoResult.error) throw videoResult.error;
        if (loopResult.error) throw loopResult.error;
        if (!mounted) return;
        setVideos((videoResult.data as VideoRow[]).map(mapVideoRow));
        setLoops((loopResult.data as LoopRow[]).map(mapLoopRow));
      } catch (error) {
        console.error('Failed to load communal library:', error);
        if (mounted) setLoadingError('Could not reach the library.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchAll();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('communal-library')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'videos' },
        (payload: RealtimePostgresChangesPayload<VideoRow>) => {
          setVideos((prev) => {
            const next = prev.slice();
            if (payload.eventType === 'INSERT' && payload.new) {
              if (next.some((v) => v.id === payload.new.id)) return prev;
              next.unshift(mapVideoRow(payload.new));
              return next;
            }
            if (payload.eventType === 'UPDATE' && payload.new) {
              const index = next.findIndex((v) => v.id === payload.new.id);
              if (index === -1) return prev;
              next[index] = mapVideoRow(payload.new);
              return next;
            }
            if (payload.eventType === 'DELETE' && payload.old) {
              return prev.filter((v) => v.id !== payload.old.id);
            }
            return prev;
          });
          if (payload.eventType === 'DELETE' && payload.old) {
            setLoops((prev) => prev.filter((l) => l.videoId !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loops' },
        (payload: RealtimePostgresChangesPayload<LoopRow>) => {
          setLoops((prev) => {
            const next = prev.slice();
            if (payload.eventType === 'INSERT' && payload.new) {
              if (next.some((l) => l.id === payload.new.id)) return prev;
              next.push(mapLoopRow(payload.new));
              return next;
            }
            if (payload.eventType === 'UPDATE' && payload.new) {
              const index = next.findIndex((l) => l.id === payload.new.id);
              if (index === -1) return prev;
              next[index] = mapLoopRow(payload.new);
              return next;
            }
            if (payload.eventType === 'DELETE' && payload.old) {
              return prev.filter((l) => l.id !== payload.old.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const applyDuration = useCallback(
    async (videoId: string, seconds: number) => {
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('videos')
          .update({ duration_seconds: Math.round(seconds) })
          .eq('id', videoId)
          .select()
          .single();
        if (error) throw error;
        const mapped = mapVideoRow(data as VideoRow);
        setVideos((prev) => prev.map((v) => (v.id === videoId ? mapped : v)));
      } catch (error) {
        console.error('Failed to persist duration:', error);
      }
    },
    [supabase]
  );

  const stopLoop = useCallback(() => {
    setActiveLoopId(null);
    if (loopTimerRef.current !== null) {
      window.clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!drawerOpen || !selectedVideo) return;
    const run = async () => {
      const YT = await loadYT();
      if (!playerHostRef.current) return;
      const createPlayer = () => {
        const host = playerHostRef.current as HTMLElement;
        host.innerHTML = '';
        const mountNode = document.createElement('div');
        mountNode.className = 'h-full w-full';
        host.appendChild(mountNode);

        playerRef.current = new YT.Player(mountNode, {
          videoId: selectedVideo.youtubeId,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: (event) => {
              const d = event.target.getDuration();
              if (Number.isFinite(d) && d > 0) {
                void applyDuration(selectedVideo.id, d);
              }
            },
            onStateChange: (event) => {
              if (event.data === 0) stopLoop();
            },
          },
        });
      };

      if (!playerRef.current) {
        createPlayer();
        return;
      }

      const hasLoadVideoById = typeof (playerRef.current as unknown as { loadVideoById?: unknown }).loadVideoById === 'function';
      if (!hasLoadVideoById) {
        playerRef.current.destroy?.();
        playerRef.current = null;
        createPlayer();
        return;
      }

      const current = playerRef.current.getVideoData?.().video_id;
      if (current !== selectedVideo.youtubeId) {
        playerRef.current.loadVideoById(selectedVideo.youtubeId);
      }
    };

    run().catch((error) => {
      console.error('Failed to initialize YouTube player:', error);
      showToast('Could not initialize video player.');
    });
  }, [applyDuration, drawerOpen, selectedVideo, showToast, stopLoop]);

  useEffect(() => {
    return () => {
      if (loopTimerRef.current !== null) {
        window.clearInterval(loopTimerRef.current);
      }
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  const openVideo = useCallback(
    async (videoId: string) => {
      setSelectedVideoId(videoId);
      setDrawerOpen(true);
      stopLoop();

      setVideos((prev) => prev.map((v) => (v.id === videoId ? { ...v, views: v.views + 1 } : v)));
      if (!supabase) return;
      try {
        await supabase.rpc('increment_view', { vid: videoId });
      } catch (error) {
        console.warn('Could not increment view count:', error);
      }
    },
    [stopLoop, supabase]
  );

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedVideoId(null);
    stopLoop();
    if (playerRef.current && typeof (playerRef.current as unknown as { pauseVideo?: unknown }).pauseVideo === 'function') {
      playerRef.current.pauseVideo();
    }
  }, [stopLoop]);

  const playLoop = useCallback(
    (loop: LibraryLoop) => {
      if (
        !playerRef.current ||
        typeof (playerRef.current as unknown as { seekTo?: unknown }).seekTo !== 'function' ||
        typeof (playerRef.current as unknown as { playVideo?: unknown }).playVideo !== 'function'
      ) {
        showToast('Player is still loading.');
        return;
      }
      setActiveLoopId(loop.id);
      playerRef.current.seekTo(loop.start, true);
      playerRef.current.playVideo();
      if (loopTimerRef.current !== null) {
        window.clearInterval(loopTimerRef.current);
      }
      loopTimerRef.current = window.setInterval(() => {
        if (!playerRef.current) return;
        const currentTime = playerRef.current.getCurrentTime();
        if (currentTime >= loop.end) {
          playerRef.current.seekTo(loop.start, true);
        }
      }, 80);
    },
    [showToast]
  );

  const handleFlag = useCallback(
    async (videoId: string) => {
      if (!supabase) return;
      if (flaggedThisSession.has(videoId)) {
        showToast('Already flagged in this session.');
        return;
      }

      const nextSet = new Set(flaggedThisSession);
      nextSet.add(videoId);
      setFlaggedThisSession(nextSet);
      try {
        await supabase.rpc('increment_flag', { vid: videoId });
        setVideos((prev) =>
          prev.map((v) => (v.id === videoId ? { ...v, flags: v.flags + 1 } : v))
        );
        showToast('Flagged for review.');
      } catch (error) {
        console.error('Flag RPC failed:', error);
        const rollback = new Set(nextSet);
        rollback.delete(videoId);
        setFlaggedThisSession(rollback);
        showToast('Could not flag — try again.');
      }
    },
    [flaggedThisSession, showToast, supabase]
  );

  const probeDuration = useCallback(
    async (youtubeId: string): Promise<number | null> => {
      try {
        const YT = await loadYT();
        const id = `probe-${youtubeId}-${Date.now()}`;
        const host = document.createElement('div');
        host.style.position = 'fixed';
        host.style.left = '-9999px';
        host.style.top = '-9999px';
        host.style.width = '1px';
        host.style.height = '1px';
        host.style.opacity = '0';
        document.body.appendChild(host);

        const container = document.createElement('div');
        container.id = id;
        host.appendChild(container);

        return await new Promise<number | null>((resolve) => {
          let settled = false;
          const done = (value: number | null) => {
            if (!settled) {
              settled = true;
              if (host.parentNode) {
                host.parentNode.removeChild(host);
              }
              resolve(value);
            }
          };
          const timeout = window.setTimeout(() => done(null), 9000);
          const probe = new YT.Player(container, {
            videoId: youtubeId,
            playerVars: { autoplay: 0, controls: 0, mute: 1 },
            events: {
              onReady: (event) => {
                const duration = event.target.getDuration();
                window.clearTimeout(timeout);
                probe.destroy();
                done(duration > 0 ? duration : null);
              },
              onError: () => {
                window.clearTimeout(timeout);
                probe.destroy();
                done(null);
              },
            },
          });
        });
      } catch (error) {
        console.error('Duration probe failed:', error);
        return null;
      }
    },
    []
  );

  const fetchMeta = useCallback(async (youtubeId: string) => {
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
    } catch (error) {
      console.error('Failed to fetch oEmbed metadata:', error);
      return fallback;
    }
  }, []);

  const addVideo = useCallback(async () => {
    if (!supabase) return;
    const ytId = extractVideoId(addInput);
    if (!ytId) {
      showToast('That does not look like a valid YouTube link.');
      return;
    }

    const existing = videos.find((v) => v.youtubeId === ytId);
    if (existing) {
      showToast('Already in the library.');
      await openVideo(existing.id);
      return;
    }

    setAdding(true);
    try {
      const meta = await fetchMeta(ytId);
      const { data, error } = await supabase
        .from('videos')
        .insert({
          youtube_id: ytId,
          title: meta.title,
          channel_name: meta.channel,
          thumbnail_url: meta.thumbnail,
          added_by: null,
        })
        .select()
        .single();

      if (error) throw error;
      const created = mapVideoRow(data as VideoRow);
      setVideos((prev) => [created, ...prev]);
      setAddInput('');
      setPage(1);
      showToast('Added to library.');

      const duration = await probeDuration(ytId);
      if (duration && duration > 0) {
        await applyDuration(created.id, duration);
      }
    } catch (error) {
      console.error('Failed to add video:', error);
      showToast('Could not add video.');
    } finally {
      setAdding(false);
    }
  }, [addInput, applyDuration, fetchMeta, openVideo, probeDuration, showToast, supabase, videos]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'title' || key === 'channel' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  const paginationLabel = (() => {
    if (filteredVideos.length === 0) return '';
    if (pageSize === 0) return `Showing 1–${filteredVideos.length} of ${filteredVideos.length}`;
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, filteredVideos.length);
    return `Showing ${start}–${end} of ${filteredVideos.length}`;
  })();

  return (
    <div className="min-h-screen bg-white text-Text antialiased">
      <Header />

      <main className="px-4 pt-24">
        <div className="mx-auto max-w-[1220px] pb-24 pt-7">
          <div className="mb-5">
            <h1 className="text-[22px] font-semibold text-Title">Communal Library</h1>
            <p className="mt-1 text-sm text-TextL">Shared dance-video library and registered loops.</p>
            <p className="mt-1 text-xs text-TextXl">
              {videos.length} video{videos.length === 1 ? '' : 's'} · {loops.length} loop{loops.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="flex min-w-[260px] flex-1 basis-[340px] items-center gap-2 rounded-xl border border-Borders bg-white py-1.5 pl-3.5 pr-1.5 transition focus-within:ring-2 focus-within:ring-Navbar/10">
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste a YouTube link and press Enter..."
              value={addInput}
              onChange={(event) => setAddInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void addVideo();
                }
              }}
              className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-TextXl"
            />
            <button
              onClick={() => void addVideo()}
              disabled={adding}
              className="rounded-lg bg-Navbar px-4 py-2 text-sm font-semibold text-Save transition hover:bg-Borders disabled:cursor-default disabled:opacity-50"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>

          <input
            type="search"
            autoComplete="off"
            placeholder="Search videos..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="min-w-[150px] flex-[0_1_220px] rounded-[11px] border border-Borders bg-white px-3.5 py-2.5 text-sm text-Text outline-none transition focus:border-Navbar"
          />

          <select
            value={tagFilter}
            onChange={(event) => {
              setTagFilter(event.target.value);
              setPage(1);
            }}
            className="cursor-pointer rounded-[11px] border border-Borders bg-white px-3.5 py-2.5 text-sm text-Text outline-none transition focus:border-Navbar"
          >
            <option value="">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer select-none items-center gap-2 rounded-[11px] border border-Borders bg-white px-3.5 py-2.5 text-sm text-TextL">
            <input
              type="checkbox"
              checked={hasLoopsOnly}
              onChange={(event) => {
                setHasLoopsOnly(event.target.checked);
                setPage(1);
              }}
              className="cursor-pointer accent-Navbar"
            />
            Has loops
          </label>
        </div>

        <div className="overflow-hidden rounded-2xl border border-Separator">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-Separator/40 text-left text-[11.5px] font-bold uppercase tracking-[0.075em] text-TextL">
                <th className="w-[112px] px-3.5 py-3 font-bold" />
                <th
                  className="cursor-pointer select-none px-3.5 py-3 font-bold transition hover:text-Text"
                  onClick={() => toggleSort('title')}
                >
                  Title
                </th>
                <th
                  className="hidden cursor-pointer select-none px-3.5 py-3 font-bold transition hover:text-Text md:table-cell"
                  onClick={() => toggleSort('channel')}
                >
                  Channel
                </th>
                <th
                  className="w-[92px] cursor-pointer select-none px-3.5 py-3 font-bold transition hover:text-Text"
                  onClick={() => toggleSort('loops')}
                >
                  Loops
                </th>
                <th className="hidden w-[190px] px-3.5 py-3 font-bold md:table-cell">Tags</th>
                <th
                  className="w-[80px] cursor-pointer select-none px-3.5 py-3 font-bold transition hover:text-Text"
                  onClick={() => toggleSort('views')}
                >
                  Views
                </th>
                <th
                  className="w-[110px] cursor-pointer select-none px-3.5 py-3 font-bold transition hover:text-Text"
                  onClick={() => toggleSort('createdAt')}
                >
                  Added
                </th>
                <th className="w-[52px] px-3.5 py-3 font-bold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-Separator">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-TextL">
                    Loading communal library...
                  </td>
                </tr>
              )}

              {!loading && loadingError && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-DeleteCue">
                    {loadingError}
                  </td>
                </tr>
              )}

              {!loading && !loadingError && pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-TextL">
                    {videos.length === 0 ? 'The communal library is empty.' : 'No videos match your filters.'}
                  </td>
                </tr>
              )}

              {!loading &&
                !loadingError &&
                pageItems.map((video) => {
                  const count = loopCountMap.get(video.id) ?? 0;
                  const isOpen = selectedVideoId === video.id;
                  return (
                    <tr
                      key={video.id}
                      className={`group transition-colors hover:bg-Separator/30 ${isOpen ? 'bg-Separator/30' : ''}`}
                    >
                      <td className="px-3.5 py-2.5 align-middle">
                        <button onClick={() => void openVideo(video.id)} className="block">
                          <img
                            className="block h-[54px] w-[96px] rounded-lg border border-Separator bg-Separator/40 object-cover"
                            referrerPolicy="no-referrer"
                            src={video.thumbnail}
                            alt=""
                            data-fallback-stage="0"
                            onError={(event) => {
                              const target = event.currentTarget;
                              const stage = target.dataset.fallbackStage ?? '0';
                              if (stage === '0') {
                                target.dataset.fallbackStage = '1';
                                target.src = thumbFallback1(video.youtubeId);
                              } else if (stage === '1') {
                                target.dataset.fallbackStage = '2';
                                target.src = THUMB_FALLBACK_2;
                              }
                            }}
                          />
                        </button>
                      </td>
                      <td className="max-w-[200px] px-3.5 py-2.5 align-middle">
                        <button
                          className="block max-w-[200px] truncate text-left text-[14.5px] font-semibold leading-snug text-Text transition hover:text-TextL"
                          onClick={() => void openVideo(video.id)}
                          title={video.title}
                        >
                          {video.title}
                        </button>
                        <div className="mt-0.5 max-w-[200px] truncate text-[12.5px] text-TextL md:hidden">
                          {video.channel}
                        </div>
                      </td>
                      <td className="hidden max-w-[180px] truncate px-3.5 py-2.5 align-middle text-[12.5px] text-TextL md:table-cell">
                        {video.channel}
                      </td>
                      <td className="px-3.5 py-2.5 align-middle">
                        <button
                          className={`inline-flex min-w-[34px] items-center justify-center rounded-full border px-2.5 py-[3px] text-[13px] font-bold transition ${
                            count
                              ? 'border-Navbar bg-Navbar text-Save hover:bg-Borders'
                              : 'border-Separator bg-white text-TextXl hover:bg-Separator hover:text-TextL'
                          }`}
                          onClick={() => void openVideo(video.id)}
                        >
                          {count}
                        </button>
                      </td>
                      <td className="hidden px-3.5 py-2.5 align-middle md:table-cell">
                        {video.tags.length ? (
                          <div className="flex flex-wrap gap-1">
                            {video.tags.map((tag) => (
                              <span
                                key={`${video.id}-${tag}`}
                                className="inline-block rounded-full border border-Separator bg-Separator/40 px-2.5 py-0.5 text-[11.5px] text-TextSm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[12.5px] text-TextXl">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 align-middle text-sm text-TextL">
                        {video.views}
                      </td>
                      <td className="whitespace-nowrap px-3.5 py-2.5 align-middle text-sm text-TextL">
                        {fmtAdded(video.createdAt)}
                      </td>
                      <td className="px-3.5 py-2.5 align-middle">
                        <button
                          onClick={() => void handleFlag(video.id)}
                          title="Flag for review"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-TextXl transition hover:border-Borders hover:bg-Separator hover:text-Text"
                        >
                          ⚑
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-Separator bg-white px-4 py-2.5 text-[13px] text-TextL">
            <div className="tabular-nums">{paginationLabel}</div>
            <div className="flex items-center gap-1">
              {pageSize !== 0 && totalPages > 1 && (
                <>
                  <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                    className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg border border-Separator bg-white px-2 text-[12.5px] font-medium tabular-nums transition disabled:cursor-default disabled:opacity-30"
                  >
                    ‹
                  </button>
                  <span className="px-2 text-[12.5px]">
                    {page}/{totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                    className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg border border-Separator bg-white px-2 text-[12.5px] font-medium tabular-nums transition disabled:cursor-default disabled:opacity-30"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            <label className="flex select-none items-center gap-2">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(parseInt(event.target.value, 10));
                  setPage(1);
                }}
                className="cursor-pointer rounded-lg border border-Borders bg-white px-2 py-1 text-[12.5px] outline-none transition focus:border-Navbar"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>All</option>
              </select>
            </label>
          </div>
          </div>
        </div>
      </main>

      <Footer />

      <div
        className={`fixed inset-0 z-40 bg-Navbar/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'pointer-events-none opacity-0'}`}
        onClick={closeDrawer}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[min(560px,100%)] overflow-y-auto border-l border-Separator bg-white transition-transform duration-300 ease-out ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!drawerOpen}
      >
        <div className="px-5 pb-16 pt-5">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-TextXl">Video workspace</span>
            <button
              title="Close (Esc)"
              onClick={closeDrawer}
              className="grid h-8 w-8 place-items-center rounded-lg border border-Separator bg-white text-TextL transition hover:border-Borders hover:text-Text"
            >
              ✕
            </button>
          </div>

          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-xl border border-Separator bg-Navbar">
            {selectedVideo && (
              <img
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
                referrerPolicy="no-referrer"
                src={selectedVideo.thumbnail}
              />
            )}
            <div ref={playerHostRef} className="absolute inset-0 h-full w-full" />
          </div>

          <h2 className="mb-1.5 text-lg font-semibold leading-snug tracking-tight text-Title">
            {selectedVideo?.title ?? '—'}
          </h2>
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[13px] text-TextL">
            {selectedVideo?.channel}
            {selectedVideo && (
              <>
                <span className="opacity-40">·</span>
                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-Text hover:underline"
                >
                  Open on YouTube ↗
                </a>
              </>
            )}
          </div>

          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-[15px] font-semibold text-Text">Registered loops</h3>
            <span className="text-[13px] text-TextL">
              {selectedLoops.length} loop{selectedLoops.length === 1 ? '' : 's'}
            </span>
          </div>

          <div>
            {selectedLoops.length === 0 ? (
              <div className="rounded-xl border border-dashed border-Separator p-5 text-center text-[13.5px] text-TextXl">
                No loops registered yet.
              </div>
            ) : (
              selectedLoops.map((loop) => {
                const playing = activeLoopId === loop.id;
                const duration = selectedVideo?.durationSeconds ?? null;
                const left = duration ? Math.max(0, Math.min(100, (loop.start / duration) * 100)) : 0;
                const width = duration
                  ? Math.max(0.5, Math.min(100 - left, ((loop.end - loop.start) / duration) * 100))
                  : 0;
                return (
                  <div
                    key={loop.id}
                    className={`mb-2.5 rounded-xl border p-3.5 transition ${
                      playing
                        ? 'border-Navbar bg-Navbar/[0.03]'
                        : 'border-Separator bg-white hover:border-Borders'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[14.5px] font-semibold text-Text">{loop.name}</span>
                      <span className="whitespace-nowrap text-[12.5px] tabular-nums text-TextL">
                        {fmtTime(loop.start)} – {fmtTime(loop.end)}
                      </span>
                    </div>
                    {duration && (
                      <div className="relative my-2.5 h-1 rounded-full bg-Separator">
                        <span
                          className="absolute inset-y-0 rounded-full bg-Navbar"
                          style={{ left: `${left}%`, width: `${width}%` }}
                        />
                      </div>
                    )}
                    <button
                      className="rounded-lg border border-Navbar bg-Navbar px-2.5 py-1.5 text-[12.5px] font-medium text-Save transition hover:bg-Borders"
                      onClick={() => {
                        if (playing) stopLoop();
                        else playLoop(loop);
                      }}
                    >
                      {playing ? '■ Stop' : '▶ Play loop'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-Navbar px-4 py-2.5 text-[13.5px] text-Save shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
