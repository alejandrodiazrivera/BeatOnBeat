import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "ChoreoLab — Learn choreography one loop at a time",
  description:
    "A browser-based video practice tool. Load a video, mark a section, loop it until it's yours.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-Text antialiased">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-Borders bg-Navbar">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/LogoInv.png"
              alt="ChoreoLab Logo"
              width={60}
              height={60}
              className="h-10 w-10 rounded-md object-contain"
              priority
            />
            <span className="text-base font-semibold tracking-tight text-white">
              ChoreoLab
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/library"
              className="hidden text-sm text-TextXl transition-colors hover:text-white sm:inline"
            >
              Library
            </Link>
            <Link href="/practice" className="ds-btn-primary bg-white text-Navbar hover:bg-LayersToggle hover:text-Navbar">
              Open app
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="border-b border-Separator">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:py-24">
          <div>
            <span className="ds-chip">
              <RepeatGlyph />
              Practice tool
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Learn choreography
              <br />
              <span className="text-TextL">one loop at a time.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-TextSm">
              ChoreoLab is a browser-based video practice studio. Load a video,
              mark the section you&apos;re stuck on, and loop it until it&apos;s yours.
              Slow it down, mirror it, save cues — all without leaving the page.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/practice" className="ds-btn-primary">
                <PlayGlyph />
                Start practicing
              </Link>
              <Link
                href="/library"
                className="ds-btn-secondary"
              >
                Browse the library
              </Link>
            </div>

            <p className="mt-5 text-xs text-TextL">
              No sign-up. Runs entirely in your browser.
            </p>
          </div>

          {/* Mock preview — same markup as the HTML version, converted to JSX */}
          <div className="rounded-2xl border border-Separator bg-[#fafafa] p-4 sm:p-5">
            <div className="mb-4">
              <h2 className="text-[17px] font-semibold text-Title">Loop Workspace</h2>
            </div>

            {/* URL row */}
            <div className="mb-4 flex flex-wrap items-center gap-2.5">
              <div className="ds-input-row min-w-0 flex-1 basis-[300px]">
                <span className="ds-input-row__field truncate text-TextXl">
                  https://youtube.com/watch?v=dQw4w…
                </span>
                <span className="ds-input-row__button">Load</span>
              </div>
              <span className="ds-btn-secondary h-[43px]">
                <UploadGlyph />
                Choose file
              </span>
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

              {/* Stat cards */}
              <div className="grid gap-3 border-t border-Separator px-4 py-3 md:grid-cols-3">
                <div className="ds-stat">
                  <div className="ds-stat__label">Loop Status</div>
                  <div className="ds-stat__value">Looping section</div>
                </div>
                <div className="ds-stat">
                  <div className="ds-stat__label">Loop In</div>
                  <div className="ds-stat__value tabular">00:42</div>
                </div>
                <div className="ds-stat">
                  <div className="ds-stat__label">Loop Out</div>
                  <div className="ds-stat__value tabular">01:18</div>
                </div>
              </div>

              {/* Controls bar */}
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

            {/* Saved loops preview */}
            <div className="ds-card mt-4 p-4">
              <div className="ds-drawer__header">
                <div>
                  <span className="ds-drawer__eyebrow">Saved Loops</span>
                  <p className="mt-0.5 text-xs text-TextL">
                    Jump to or restart a practice section.
                  </p>
                </div>
                <span className="ds-drawer__close"><PanelGlyph className="h-3.5 w-3.5" /></span>
              </div>

              <div className="space-y-1.5">
                {[
                  { title: "Verse 8-count",    time: "00:42 – 01:18" },
                  { title: "Chorus",           time: "01:24 – 01:52" },
                  { title: "Bridge footwork",  time: "02:10 – 02:34" },
                ].map((cue) => (
                  <div key={cue.time} className="ds-row">
                    <span className="ds-row__title">{cue.title}</span>
                    <span className="ds-row__meta">{cue.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-Separator">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <p className="ds-eyebrow">What&apos;s inside</p>
          <h2 className="ds-heading mt-3 max-w-xl">
            Everything you need to break a routine down.
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-Separator bg-Separator sm:grid-cols-2 lg:grid-cols-3">
            {[
              { t: "YouTube or local files", d: "Paste a YouTube URL or upload a video straight from your device. Both paths run through one unified player." },
              { t: "Loop any section",       d: "Drop an in and an out point, then let the section repeat while you drill a phrase into muscle memory." },
              { t: "Cues with notes",        d: "Save timestamps with a title and a note. Jump to any moment from the sidebar in a single click." },
              { t: "Slow it down",           d: "Cycle through 1x, 0.75x and 0.5x without losing your position in the video." },
              { t: "Mirror mode",            d: "Flip the video horizontally to learn choreography from the opposite side." },
              { t: "Communal library",       d: "Share videos and loops with everyone. The library stays in sync across clients in real time." },
            ].map((f) => (
              <div key={f.t} className="bg-white p-7 transition-colors hover:bg-[#fafafa]">
                <h3 className="ds-subheading">{f.t}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-TextL">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-Navbar">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-TextL">
            The workflow
          </p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Three steps, then it&apos;s just repetition.
          </h2>

          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              { n: "01", t: "Load",  d: "Paste a YouTube link or pick a file from your machine. No account, no upload, nothing leaves your browser." },
              { n: "02", t: "Mark",  d: "Scrub to the phrase you're working on and set the loop in and out points. Save it as a cue for later." },
              { n: "03", t: "Drill", d: "Loop it, slow it down, mirror it, repeat. Then move on to the next cue in your list." },
            ].map((s, i) => (
              <div key={s.n} className={i < 2 ? "md:border-r md:border-Borders md:pr-8" : undefined}>
                <span className="text-xs font-medium tabular-nums tracking-[0.18em] text-TextL">{s.n}</span>
                <h3 className="mt-4 text-lg font-semibold text-white">{s.t}</h3>
                <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-TextXl">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Library CTA */}
      <section className="border-b border-Separator bg-Separator">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-center lg:py-20">
          <div>
            <h2 className="max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              Looking for something to practice?
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-TextSm">
              The communal library holds shared videos and their loops. Search,
              filter by tag, and start drilling a routine someone else already mapped out.
            </p>
          </div>
          <Link href="/library" className="ds-btn-primary shrink-0">
            Browse library →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-Separator">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Logo.png"
              alt="ChoreoLab Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-md object-contain"
            />
            <span className="text-sm font-medium">ChoreoLab</span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-TextL">
            <Link href="/practice" className="transition-colors hover:text-Text">Practice</Link>
            <Link href="/library"  className="transition-colors hover:text-Text">Library</Link>
          </nav>

          <p className="text-xs text-TextL">Client-side · no account required</p>
        </div>
      </footer>
    </main>
  );
}

/* ── Inline Lucide glyphs (avoids importing the package into a server component) ── */

function PlayGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className}><polygon points="6 3 20 12 6 21 6 3" /></svg>;
}
function PauseGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <rect x="14" y="4" width="4" height="16" rx="1" />
      <rect x="6"  y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
function StopGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
function RewindGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}
function FastForwardGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </svg>
  );
}
function FlipGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
      <path d="M12 20v2M12 14v2M12 8v2M12 2v2" />
    </svg>
  );
}
function GaugeGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}
function RepeatGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function SaveGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}
function TrashGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
function PanelGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M15 3v18" />
      <path d="m8 9 3 3-3 3" />
    </svg>
  );
}
function UploadGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}