import Link from "next/link";
import Image from "next/image";
import AppHeader from "@/components/Header/AppHeader";
import AppFooter from "@/components/Header/AppFooter";

export const metadata = {
  title: "ChoreoLab — Learn choreography one loop at a time",
  description:
    "A browser-based video practice tool. Load a video, mark a section, loop it until it's yours.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-Text antialiased">
      <AppHeader />

      {/* ---------------------------------------------------------- */}
      {/*  Hero                                                      */}
      {/* ---------------------------------------------------------- */}
      <section className="border-b border-Separator">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
          {/* Copy */}
          <div>
            <span className="ds-chip">
              <RepeatGlyph />
              Loop Editor
            </span>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Learn choreography
              <br />
              <span className="text-TextL">one loop at a time.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-TextSm">
              ChoreoLab is a browser-based video practice studio. Load a video,
              mark the section you&apos;re stuck on, and loop it until it&apos;s
              yours. Slow it down, mirror it, save cues — all without leaving
              the page.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/loop" className="ds-btn-primary">
                <PlayGlyph />
                Start practicing
              </Link>
              <Link href="/library" className="ds-btn-secondary">
                Browse the library
              </Link>
            </div>

            <p className="mt-5 text-xs text-TextL">
              No sign-up. Runs entirely in your browser.
            </p>
          </div>

          {/* Hero image */}
          <figure className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-Separator bg-[#fafafa]">
              <Image
                src="/hero.jpg"
                alt="A dancer mid-movement in a studio, framed against a soft-lit wall."
                fill
                priority
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-TextXl">
              <span>Studio session — Vol. 01</span>
              <span className="tabular-nums">Fig. A</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Features                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="border-b border-Separator">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <p className="ds-eyebrow">What&apos;s inside</p>
          <h2 className="ds-heading mt-3 max-w-xl">
            Everything you need to break a routine down.
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-Separator bg-Separator sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "YouTube or local files",
                d: "Paste a YouTube URL or upload a video straight from your device. Both paths run through one unified player.",
              },
              {
                t: "Loop any section",
                d: "Drop an in and an out point, then let the section repeat while you drill a phrase into muscle memory.",
              },
              {
                t: "Cues with notes",
                d: "Save timestamps with a title and a note. Jump to any moment from the sidebar in a single click.",
              },
              {
                t: "Slow it down",
                d: "Cycle through 1x, 0.75x and 0.5x without losing your position in the video.",
              },
              {
                t: "Mirror mode",
                d: "Flip the video horizontally to learn choreography from the opposite side.",
              },
              {
                t: "Communal library",
                d: "Share videos and loops with everyone. The library stays in sync across clients in real time.",
              },
            ].map((f) => (
              <div
                key={f.t}
                className="bg-white p-7 transition-colors hover:bg-[#fafafa]"
              >
                <h3 className="ds-subheading">{f.t}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-TextL">
                  {f.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Workflow                                                  */}
      {/* ---------------------------------------------------------- */}
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
              {
                n: "01",
                t: "Load",
                d: "Paste a YouTube link or pick a file from your machine. No account, no upload, nothing leaves your browser.",
              },
              {
                n: "02",
                t: "Mark",
                d: "Scrub to the phrase you're working on and set the loop in and out points. Save it as a cue for later.",
              },
              {
                n: "03",
                t: "Drill",
                d: "Loop it, slow it down, mirror it, repeat. Then move on to the next cue in your list.",
              },
            ].map((s, i) => (
              <div
                key={s.n}
                className={
                  i < 2 ? "md:border-r md:border-Borders md:pr-8" : undefined
                }
              >
                <span className="text-xs font-medium tabular-nums tracking-[0.18em] text-TextL">
                  {s.n}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {s.t}
                </h3>
                <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-TextXl">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  Library CTA                                               */}
      {/* ---------------------------------------------------------- */}
      <section className="border-b border-Separator bg-Separator">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-16 lg:flex-row lg:items-center lg:py-20">
          <div>
            <h2 className="max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
              Looking for something to practice?
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-TextSm">
              The communal library holds shared videos and their loops. Search,
              filter by tag, and start drilling a routine someone else already
              mapped out.
            </p>
          </div>
          <Link href="/library" className="ds-btn-primary shrink-0">
            Browse library →
          </Link>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}

/* ── Inline glyphs ─────────────────────────────────────────────── */

function PlayGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function RepeatGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}