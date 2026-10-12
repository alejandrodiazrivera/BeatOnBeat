import AppHeader from "@/components/Header/AppHeader";
import AppFooter from "@/components/Header/AppFooter";

/* ------------------------------------------------------------------ */
/*  Editorial primitives                                               */
/* ------------------------------------------------------------------ */

/** A section: number + label hang in the left margin, content sits in a column. */
function Section({
  number,
  label,
  children,
}: {
  number: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-y-5 border-t border-Separator pt-6 md:grid-cols-[8rem_1fr] md:gap-x-10 md:pt-8">
      <div className="md:pt-[3px]">
        <div className="flex items-baseline gap-2 md:block">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-TextXl tabular-nums">
            {number}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-TextXl md:mt-1 md:block">
            {label}
          </span>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-white px-6 pb-20 pt-12 text-Text antialiased">
        <div className="mx-auto max-w-3xl">
          {/* ---------------------------------------------------- */}
          {/*  Masthead                                            */}
          {/* ---------------------------------------------------- */}
          <header>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-TextXl">
              <span>ChoreoLab</span>
              <span className="h-1 w-1 rounded-full bg-Separator" />
              <span>About</span>
            </div>

            <h1 className="mt-6 max-w-[20ch] text-[34px] font-semibold leading-[1.1] tracking-tight text-Title sm:text-[42px]">
              About ChoreoLab
            </h1>
          </header>

          {/* ---------------------------------------------------- */}
          {/*  Lede — first paragraph, slightly larger              */}
          {/* ---------------------------------------------------- */}
          <p className="mt-8 max-w-[62ch] text-[19px] leading-[1.55] text-TextSm">
            <span className="float-left mr-3 mt-[6px] font-semibold leading-none text-Title text-[52px]">
              I
            </span>
            think of music as a language, and dance as one way of speaking that
            language through the body. I built ChoreoLab because I wanted a
            better way to remember the movements I learned in class and
            navigate the thousands of dance videos I&rsquo;ve accumulated from
            festivals and socials.
          </p>

          {/* ---------------------------------------------------- */}
          {/*  Body sections                                       */}
          {/* ---------------------------------------------------- */}
          <div className="mt-14 space-y-10">
            <Section number="01" label="The gap">
              <h2 className="max-w-[26ch] text-[22px] font-semibold leading-snug tracking-tight text-Title sm:text-[24px]">
                Seeing a movement is not the same as being able to perform it.
              </h2>

              <div className="mt-5 max-w-[62ch] space-y-4 text-[16px] leading-[1.7] text-TextSm">
                <p>
                  Watching a movement once and trying to reproduce it creates a
                  gap between what your eyes see and what your body can do.
                </p>
                <p>
                  ChoreoLab is built around closing that gap. Isolate a
                  movement, slow it down, loop it, and watch it repeatedly
                  until it becomes familiar.
                </p>
              </div>
            </Section>

            <Section number="02" label="Vocabulary">
              <h2 className="max-w-[26ch] text-[22px] font-semibold leading-snug tracking-tight text-Title sm:text-[24px]">
                Movement as vocabulary.
              </h2>

              <div className="mt-5 max-w-[62ch] space-y-4 text-[16px] leading-[1.7] text-TextSm">
                <p>
                  I believe movement is a vocabulary. Individual steps,
                  gestures, and transitions become phrases and sequences &mdash;
                  giving us more ways to express what we hear and feel through
                  our bodies.
                </p>
                <p>
                  ChoreoLab started as a personal practice tool. I want to
                  explore what happens when those movements can also be
                  documented, connected, and shared.
                </p>
              </div>
            </Section>
          </div>

          {/* ---------------------------------------------------- */}
          {/*  Pull quote                                          */}
          {/* ---------------------------------------------------- */}
          <blockquote className="mt-16 border-t border-Separator pt-8">
            <p className="max-w-[38ch] text-[24px] font-medium leading-[1.35] tracking-tight text-Title sm:text-[28px]">
              A place to explore, practice, and build a shared vocabulary of
              how human beings move their bodies in the context of music.
            </p>
          </blockquote>

          {/* ---------------------------------------------------- */}
          {/*  Sign-off                                            */}
          {/* ---------------------------------------------------- */}
          {/* Sign-off */}
          <footer className="mt-16 border-t border-Separator pt-8">
            <div className="flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="h-10 w-auto" />

              <p className="mt-5 text-[14px] font-semibold tracking-tight text-Title">
                Alejandro D&iacute;az Rivera
              </p>
              <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-TextXl">
                Founder/Developer
              </p>
            </div>
          </footer>
        </div>
      </main>

      <AppFooter />
    </>
  );
}