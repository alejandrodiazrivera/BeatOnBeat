"use client";

import type { ReactNode } from "react";
import AppHeader from "@/components/Header/AppHeader";
import AppFooter from "@/components/Header/AppFooter";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function Glyph({
  className = "h-4 w-4",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const UploadGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M12 16V4" />
    <path d="M7.5 8.5 12 4l4.5 4.5" />
    <path d="M4 15.5v3A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-3" />
  </Glyph>
);
const PlayGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />
  </Glyph>
);
const PauseGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" />
  </Glyph>
);
const StopGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
  </Glyph>
);
const RewindGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M11 6 4.5 12 11 18" />
    <path d="M19.5 6 13 12l6.5 6" />
  </Glyph>
);
const FastForwardGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M13 6 19.5 12 13 18" />
    <path d="M4.5 6 11 12l-6.5 6" />
  </Glyph>
);
const FlipGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M12 3v18" strokeDasharray="2 2.5" />
    <path d="M9 7 4.5 12 9 17z" />
    <path d="M15 7l4.5 5L15 17z" />
  </Glyph>
);
const GaugeGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="M12 18l4.2-5.2" />
  </Glyph>
);
const RepeatGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M17 2.5 20.5 6 17 9.5" />
    <path d="M3.5 11V10a4 4 0 0 1 4-4h13" />
    <path d="M7 21.5 3.5 18 7 14.5" />
    <path d="M20.5 13v1a4 4 0 0 1-4 4h-13" />
  </Glyph>
);
const SaveGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </Glyph>
);
const TrashGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M4 7h16" />
    <path d="M10 4h4" />
    <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    <path d="M10 11v6M14 11v6" />
  </Glyph>
);
const PanelGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M15 3v18" />
  </Glyph>
);
const ArrowGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Glyph>
);

/* ------------------------------------------------------------------ */
/*  Editorial helpers                                                  */
/* ------------------------------------------------------------------ */

function SectionMarker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl tabular-nums">
        {index}
      </span>
      <span className="h-px flex-1 bg-Separator" />
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl">
        {label}
      </span>
    </div>
  );
}

function Rule() {
  return <hr className="my-16 border-0 border-t border-Separator sm:my-24" />;
}

/* ------------------------------------------------------------------ */
/*  Loop Editor mock                                                   */
/* ------------------------------------------------------------------ */

function LoopEditorMock() {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-Separator bg-[#fafafa] p-4 sm:p-5">
      {/* Workflow eyebrow — labels the interaction model */}
      <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-TextXl">
        <span>Load</span>
        <span className="text-TextL">→</span>
        <span>Mark</span>
        <span className="text-TextL">→</span>
        <span>Loop</span>
        <span className="text-TextL">→</span>
        <span>Drill</span>
      </div>

        {/* Video card */}
      <section className="ds-card overflow-hidden">
        <div className="p-4">
          <div className="ds-video-frame">
            <div className="relative w-full pt-[56.25%]">
              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-[#141414] to-[#000000]">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-Borders bg-LoadVideo">
                  <PlayGlyph className="ml-0.5 h-5 w-5 text-Text2Xl" />
                </div>
              </div>
              <span className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-Text2Xl">
                Loop · 0:42 → 1:18
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-Separator px-4 py-4">
          <div className="rounded-2xl border border-Separator bg-white p-4">
            <div className="flex items-end justify-between gap-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-TextXl">
                Timeline
              </div>
              <div className="text-right text-[13px] text-TextL tabular-nums">
                <span className="font-semibold text-Text">00:56</span> / 03:10
              </div>
            </div>

            <div className="relative mt-6">
              <div className="relative h-2 rounded-full bg-Separator">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-Navbar/20"
                  style={{ width: "29.5%" }}
                />
                <div
                  className="absolute inset-y-[-3px] rounded-[4px] bg-Navbar/8"
                  style={{ left: "22%", width: "19%" }}
                />

                <div
                  className="absolute top-[-10px] h-7 w-[9px] -translate-x-1/2"
                  style={{ left: "22%" }}
                >
                  <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-Navbar" />
                  <div className="absolute left-1/2 top-0 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                  <div className="absolute bottom-0 left-1/2 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                </div>

                <div
                  className="absolute top-[-10px] h-7 w-[9px] -translate-x-1/2"
                  style={{ left: "41%" }}
                >
                  <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-Navbar" />
                  <div className="absolute left-1/2 top-0 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                  <div className="absolute bottom-0 left-1/2 h-[2px] w-[9px] -translate-x-1/2 bg-Navbar" />
                </div>

                <div
                  className="absolute top-[-7px] h-[22px] w-[2px] -translate-x-1/2 bg-Navbar"
                  style={{ left: "29.5%" }}
                >
                  <div className="absolute left-1/2 top-[-5px] h-[10px] w-[10px] -translate-x-1/2 rounded-full bg-Navbar shadow-[0_0_0_2px_#fff]" />
                </div>
              </div>

              <div className="relative mt-2 h-4 text-[10px] text-TextXl tabular-nums">
                <span className="absolute left-0 -translate-x-0">00:00</span>
                <span className="absolute left-1/4 -translate-x-1/2">00:47</span>
                <span className="absolute left-1/2 -translate-x-1/2">01:35</span>
                <span className="absolute left-3/4 -translate-x-1/2">02:22</span>
                <span className="absolute right-0 translate-x-0">03:10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="border-t border-Separator px-4 py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="ds-btn-icon" title="Play"><PlayGlyph /></span>
            <span className="ds-btn-icon" title="Pause"><PauseGlyph /></span>
            <span className="ds-btn-icon" title="Stop"><StopGlyph /></span>

            <span className="ds-divider-v" />

            <span className="ds-btn-icon" title="Back 5s"><RewindGlyph /></span>
            <span className="ds-btn-icon" title="Forward 5s"><FastForwardGlyph /></span>

            <span className="ds-divider-v" />

            <span className="ds-btn-icon" title="Mirror"><FlipGlyph /></span>
            <span className="ds-btn-pill tabular">
              <GaugeGlyph />
              1x
            </span>

            <span className="flex-1" />

            <span className="ds-btn-pill" data-active="true">
              <RepeatGlyph />
              <span className="hidden sm:inline">Loop</span>
            </span>
            <span className="ds-btn-icon" title="Save loop"><SaveGlyph /></span>
            <span className="ds-btn-icon text-TextL" title="Clear loop"><TrashGlyph /></span>

            <span className="ds-divider-v" />

            <span className="ds-btn-icon" title="Saved loops"><PanelGlyph /></span>
          </div>
        </div>
      </section>

      {/* Saved loops */}
      <div className="ds-card mt-4 p-4">
        <div className="ds-drawer__header">
          <div>
            <span className="ds-drawer__eyebrow">Saved Loops</span>
            <p className="mt-0.5 text-xs text-TextL">
              Jump to or restart a practice section.
            </p>
          </div>
          <span className="ds-drawer__close">
            <PanelGlyph className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="space-y-1.5">
          {[
            { title: "Verse 8-count", time: "00:42 – 01:18" },
            { title: "Chorus", time: "01:24 – 01:52" },
            { title: "Bridge footwork", time: "02:10 – 02:34" },
          ].map((cue) => (
            <div key={cue.time} className="ds-row">
              <span className="ds-row__title">{cue.title}</span>
              <span className="ds-row__meta">{cue.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProductPage() {
  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-white px-6 pb-24 pt-10 text-Text antialiased">
        <div className="mx-auto max-w-5xl">
          {/* ---------------------------------------------------- */}
          {/*  Masthead — single CTA now                           */}
          {/* ---------------------------------------------------- */}
          <header className="max-w-3xl">
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl">
              <span>ChoreoLab</span>
              <span className="h-1 w-1 rounded-full bg-Separator" />
              <span>Product</span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-Title sm:text-5xl lg:text-6xl">
              Practice the part
              <br />
              that isn&rsquo;t working
              <span className="text-TextXl">.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-TextSm">
              A loop editor built for rehearsal, not for watching. Drop in a
              video, mark the section you keep fumbling, and play it back until
              it lands — frame by frame, at any speed, without leaving the
              page.
            </p>

            <div className="mt-8">
              <button className="ds-btn-primary inline-flex h-[46px] items-center gap-2 px-5 text-[14px] font-semibold">
                Start a loop
                <ArrowGlyph className="h-4 w-4" />
              </button>
            </div>
          </header>

          <Rule />

          {/* ---------------------------------------------------- */}
          {/*  Section 01 — The Editor                             */}
          {/* ---------------------------------------------------- */}
          <section>
            <SectionMarker index="01" label="The Editor" />

            <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-4">
                <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
                  Everything you need to isolate a moment.
                </h2>

                <p className="mt-4 text-base leading-relaxed text-TextSm">
                  The editor stays out of the way. Load a source, drag the
                  handles, and the loop is live — no timeline wrangling, no
                  export step, no second tab.
                </p>
                <p className="mt-4 text-base leading-relaxed text-TextSm">
                  Every control in the editor is reachable from the keyboard,
                  so your hands never leave the instrument.
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-Separator pt-6">
                  {[
                    ["Built for", "Dancers, musicians, coaches"],
                    ["Input", "YouTube links & local files"],
                    ["Control", "0.25× – 2× playback"],
                    ["Loops", "Unlimited, saved per source"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-TextXl">
                        {k}
                      </dt>
                      <dd className="mt-1.5 text-[13px] leading-snug text-TextSm">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="lg:col-span-8">
                <LoopEditorMock />
              </div>
            </div>
          </section>

          <Rule />

          {/* ---------------------------------------------------- */}
          {/*  Section 02 — Who it's for (unchanged)               */}
          {/* ---------------------------------------------------- */}
          <section>
            <SectionMarker index="02" label="Who it's for" />

            <div className="mt-10 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
                  Anyone whose practice is a repetition problem.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-TextSm">
                  ChoreoLab wasn&rsquo;t designed for one discipline. It was
                  designed for the moment you already know what to do and just
                  need to do it forty more times.
                </p>
              </div>

              <div className="lg:col-span-8">
                <div className="divide-y divide-Separator">
                  {[
                    {
                      who: "Dancers & choreographers",
                      use: "Mark an 8-count, mirror it, and drill both sides until the transition stops being a thought.",
                    },
                    {
                      who: "Musicians & teachers",
                      use: "Loop a two-bar phrase, drop to 0.5×, and build the run up to tempo without touching a metronome.",
                    },
                    {
                      who: "Coaches & athletes",
                      use: "Isolate a single rep from a full match, then repeat it clean with a side-by-side reference.",
                    },
                    {
                      who: "Language & speech learners",
                      use: "Loop a native speaker's sentence, slow it down, and shadow the rhythm line by line.",
                    },
                  ].map((p) => (
                    <div
                      key={p.who}
                      className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-8"
                    >
                      <h3 className="text-[15px] font-semibold tracking-tight text-Title">
                        {p.who}
                      </h3>
                      <p className="text-[15px] leading-relaxed text-TextSm">
                        {p.use}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Rule />

          {/* ---------------------------------------------------- */}
          {/*  Section 03 — Questions                              */}
          {/*  (design principle block removed)                    */}
          {/* ---------------------------------------------------- */}
          <section>
            <SectionMarker index="03" label="Questions" />

            <div className="mt-10 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
                  The things people ask before they try it.
                </h2>
              </div>

              <div className="lg:col-span-8">
                <div className="divide-y divide-Separator">
                  {[
                    {
                      q: "Do I need an account?",
                      a: "No. ChoreoLab runs entirely in the browser. Nothing you load is uploaded to a server.",
                    },
                    {
                      q: "Where does my video go?",
                      a: "Nowhere. YouTube videos are streamed directly from YouTube; local files stay on your machine the entire session.",
                    },
                    {
                      q: "Will my saved loops survive a refresh?",
                      a: "Yes — loops are stored locally alongside the source, so reloading the page or the source brings them back.",
                    },
                    {
                      q: "Can I share a loop with someone else?",
                      a: "Saved loops can be pushed to the communal library, where anyone can find and replay them.",
                    },
                    {
                      q: "Does it work on mobile?",
                      a: "Yes. The editor is fully responsive, though the keyboard shortcuts are best on a desktop.",
                    },
                  ].map((item) => (
                    <details key={item.q} className="group py-5">
                      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6">
                        <span className="text-[15px] font-semibold tracking-tight text-Title">
                          {item.q}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-TextXl transition-transform group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-TextSm">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <Rule />

          {/* ---------------------------------------------------- */}
          {/*  Section 04 — Details                                */}
          {/* ---------------------------------------------------- */}
          <section>
            <SectionMarker index="04" label="Details" />

            <div className="mt-10 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
                  Every control in reach.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-TextSm">
                  Every setting is one gesture away, and every loop is saved
                  locally to the source you loaded it from.
                </p>
              </div>

              <dl className="lg:col-span-8">
                {[
                  ["Playback speed", "0.25× / 0.5× / 0.75× / 1× / 1.5× / 2×"],
                  ["Nudge", "±5 seconds, plus frame stepping"],
                  ["Mirror mode", "Horizontal flip for left/right work"],
                  ["Saved loops", "Named, timestamped, unlimited per source"],
                  ["Sources", "YouTube URL, uploaded video file"],
                  ["Storage", "Loops persist locally with the source"],
                ].map(([k, v], i) => (
                  <div
                    key={k}
                    className={`grid grid-cols-1 gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6 ${
                      i > 0 ? "border-t border-Separator" : ""
                    }`}
                  >
                    <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-TextXl sm:pt-1">
                      {k}
                    </dt>
                    <dd className="text-[15px] leading-relaxed text-TextSm">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <Rule />

          {/* ---------------------------------------------------- */}
          {/*  Closing CTA                                         */}
          {/* ---------------------------------------------------- */}
          <section className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl">
              Ready when you are
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-Title sm:text-4xl">
              Load a track. Mark the bar. Go again.
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button className="ds-btn-primary inline-flex h-[46px] items-center gap-2 px-5 text-[14px] font-semibold">
                Open the Loop Editor
                <ArrowGlyph className="h-4 w-4" />
              </button>
              <button className="ds-btn-secondary inline-flex h-[46px] items-center px-5 text-[14px] font-semibold">
                Read the docs
              </button>
            </div>
          </section>
        </div>
      </main>

      <AppFooter />
    </>
  );
}