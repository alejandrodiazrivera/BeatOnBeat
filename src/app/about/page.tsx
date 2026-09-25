"use client";
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

export default function AboutPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-white px-6 pb-20 pt-10 text-Text antialiased">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-tight text-Title">About ChoreoLab</h1>
          <p className="mt-4 text-base leading-relaxed text-TextSm">
            ChoreoLab is a browser-based video practice studio. Load a video, mark the section you&apos;re stuck on, and loop it until it&apos;s yours.
          </p>
        </div>
      </main>
      <AppFooter />
    </>
  );
}