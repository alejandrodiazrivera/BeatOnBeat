"use client"; // drop if you don't need client hooks — AppHeader/AppFooter can carry their own directive

import type { ReactNode } from "react";
import AppHeader from "@/components/Header/AppHeader";
import AppFooter from "@/components/Header/AppFooter";

/* ------------------------------------------------------------------ */
/*  Icons — one Glyph wrapper, thin per-icon components                */
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

const ArrowGlyph = ({ className }: { className?: string }) => (
  <Glyph className={className}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Glyph>
);

/* ------------------------------------------------------------------ */
/*  Editorial primitives                                               */
/* ------------------------------------------------------------------ */

function SectionMarker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl tabular-nums">
        {index}
      </span>
      <span className="h-px flex-1 self-center bg-Separator" />
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
/*  Section shapes — pick one per section                              */
/* ------------------------------------------------------------------ */

/** Left column = heading + copy + aside, right column = visual/detail. */
function SplitSection({
  index,
  label,
  title,
  intro,
  aside,
  children,
}: {
  index: string;
  label: string;
  title: string;
  intro?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <SectionMarker index={index} label={label} />
      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
            {title}
          </h2>
          {intro && (
            <div className="mt-4 space-y-4 text-base leading-relaxed text-TextSm">
              {intro}
            </div>
          )}
          {aside}
        </div>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}

/** Key/value grid, used as the aside in a SplitSection. */
function MetaGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-Separator pt-6">
      {items.map(([k, v], i) => (
        <div key={`${k}-${i}`}>
          <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-TextXl">
            {k}
          </dt>
          <dd className="mt-1.5 text-[13px] leading-snug text-TextSm">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Heading column + a divided list of rows on the right. */
function ListSection({
  index,
  label,
  title,
  intro,
  items,
}: {
  index: string;
  label: string;
  title: string;
  intro?: string;
  items: { heading: string; body: string }[];
}) {
  return (
    <section>
      <SectionMarker index={index} label={label} />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
            {title}
          </h2>
          {intro && (
            <p className="mt-4 text-base leading-relaxed text-TextSm">{intro}</p>
          )}
        </div>
        <div className="lg:col-span-8">
          <div className="divide-y divide-Separator">
            {items.map((it, i) => (
              <div
                key={`${it.heading}-${i}`}
                className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[220px_1fr] sm:gap-8"
              >
                <h3 className="text-[15px] font-semibold tracking-tight text-Title">
                  {it.heading}
                </h3>
                <p className="text-[15px] leading-relaxed text-TextSm">
                  {it.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Heading column + a spec table on the right. */
function SpecSection({
  index,
  label,
  title,
  intro,
  rows,
}: {
  index: string;
  label: string;
  title: string;
  intro?: string;
  rows: [string, string][];
}) {
  return (
    <section>
      <SectionMarker index={index} label={label} />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
            {title}
          </h2>
          {intro && (
            <p className="mt-4 text-base leading-relaxed text-TextSm">{intro}</p>
          )}
        </div>
        <dl className="lg:col-span-8">
          {rows.map(([k, v], i) => (
            <div
              key={`${k}-${i}`}
              className={`grid grid-cols-1 gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-6 ${
                i > 0 ? "border-t border-Separator" : ""
              }`}
            >
              <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-TextXl sm:pt-1">
                {k}
              </dt>
              <dd className="text-[15px] leading-relaxed text-TextSm">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Heading column + native <details> accordion. */
function FaqSection({
  index,
  label,
  title,
  items,
}: {
  index: string;
  label: string;
  title: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section>
      <SectionMarker index={index} label={label} />
      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight text-Title sm:text-3xl">
            {title}
          </h2>
        </div>
        <div className="lg:col-span-8">
          <div className="divide-y divide-Separator">
            {items.map((item, i) => (
              <details key={`${item.q}-${i}`} className="group py-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 [&::-webkit-details-marker]:hidden">
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
  );
}

/* ------------------------------------------------------------------ */
/*  Page shell                                                         */
/* ------------------------------------------------------------------ */

export default function ProductPage() {
  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-white px-6 pb-24 pt-10 text-Text antialiased">
        <div className="mx-auto max-w-5xl">
          {/* Masthead */}
          <header className="max-w-3xl">
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl">
              <span>ChoreoLab</span>
              <span className="h-1 w-1 rounded-full bg-Separator" />
              <span>Case Study</span>
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-Title sm:text-5xl lg:text-6xl">
              Headline goes here
              <br />
              across two lines
              <span className="text-TextXl">.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-TextSm">
              One paragraph of supporting copy. Say what it is, who it&rsquo;s
              for, and what it removes from the workflow.
            </p>

            <div className="mt-8">
              <button className="ds-btn-primary inline-flex h-[46px] items-center gap-2 px-5 text-[14px] font-semibold">
                Primary action
                <ArrowGlyph className="h-4 w-4" />
              </button>
            </div>
          </header>

          <Rule />

          <SplitSection
            index="01"
            label="Section label"
            title="A heading for the first idea."
            intro={
              <>
                <p>First supporting paragraph.</p>
                <p>Second supporting paragraph.</p>
              </>
            }
            aside={
              <MetaGrid
                items={[
                  ["Built for", "Value"],
                  ["Input", "Value"],
                  ["Control", "Value"],
                  ["Storage", "Value"],
                ]}
              />
            }
          >
            {/* visual, mock, screenshot */}
          </SplitSection>

          <Rule />

          <ListSection
            index="02"
            label="Section label"
            title="A heading for the second idea."
            intro="Optional intro paragraph."
            items={[
              { heading: "First row", body: "Row body copy." },
              { heading: "Second row", body: "Row body copy." },
              { heading: "Third row", body: "Row body copy." },
            ]}
          />

          <Rule />

          <FaqSection
            index="03"
            label="Questions"
            title="A heading for the FAQ."
            items={[
              { q: "First question?", a: "Answer." },
              { q: "Second question?", a: "Answer." },
              { q: "Third question?", a: "Answer." },
            ]}
          />

          <Rule />

          <SpecSection
            index="04"
            label="Details"
            title="A heading for the spec table."
            intro="Optional intro paragraph."
            rows={[
              ["Speed", "Value"],
              ["Nudge", "Value"],
              ["Mirror", "Value"],
              ["Storage", "Value"],
              ["Sources", "Value"],
            ]}
          />

          <Rule />

          {/* Closing CTA */}
          <section className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl">
              Eyebrow
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-Title sm:text-4xl">
              Closing headline that lands the point.
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button className="ds-btn-primary inline-flex h-[46px] items-center gap-2 px-5 text-[14px] font-semibold">
                Primary action
                <ArrowGlyph className="h-4 w-4" />
              </button>
              <button className="ds-btn-secondary inline-flex h-[46px] items-center px-5 text-[14px] font-semibold">
                Secondary action
              </button>
            </div>
          </section>
        </div>
      </main>

      <AppFooter />
    </>
  );
}