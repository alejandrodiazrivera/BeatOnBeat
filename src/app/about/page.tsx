"use client";

import AppHeader from "@/components/Header/AppHeader";
import AppFooter from "@/components/Header/AppFooter";

export default function AboutPage() {
  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-white px-6 pb-20 pt-10 text-Text antialiased">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-tight text-Title">
            About ChoreoLab
          </h1>

          <div className="mt-8 space-y-10 text-base leading-relaxed text-TextSm">
            <section className="space-y-4">
              <p>
                I think of music as a language,
                and dance as one way of speaking that language through the body.
              </p>

              <p>
                I built ChoreoLab because I wanted a better way to remember the
                movements I learned in class and navigate the thousands of dance
                videos I&apos;ve accumulated from festivals and socials.
              </p>
            </section>

            <section className="space-y-4">
              <p className="text-xl font-semibold leading-relaxed text-Title">
                Seeing a movement is not the same as being able to perform it.
              </p>

              <p>
                Watching a movement once and trying to reproduce it creates a
                gap between what your eyes see and what your body can do.
              </p>

              <p>
                ChoreoLab is built around closing that gap. Isolate a movement,
                slow it down, loop it, and watch it repeatedly until it becomes
                familiar.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold tracking-tight text-Title">
                Movement as vocabulary
              </h2>

              <p>
                I believe movement is a vocabulary. Individual steps, gestures,
                and transitions become phrases and sequences — giving us more
                ways to express what we hear and feel through our bodies.
              </p>

              <p>
                ChoreoLab started as a personal practice tool. I want to explore
                what happens when those movements can also be documented,
                connected, and shared.
              </p>
            </section>

            <section className="border-t border-border pt-10">
              <p className="text-lg font-medium leading-relaxed text-Title">
                A place to explore, practice, and build a shared vocabulary of
                how human beings move their bodies in the context of music.
              </p>
            </section>
          </div>

          {/* Sign-off: logo → name (with overlapping signature) → Founder */}
          <div className="mt-20 flex flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="ChoreoLab logo"
              className="h-8 w-auto"
            />

            <div className="relative mt-6 inline-block">
              <p className="text-l font-semibold tracking-tight text-Title">
                Alejandro Díaz Rivera, Developer
              </p>

            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </>
  );
}