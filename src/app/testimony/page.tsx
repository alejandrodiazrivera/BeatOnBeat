"use client";
import AppHeader from "@/components/Header/AppHeader";
import AppFooter from "@/components/Header/AppFooter";
export default function TestimonyPage() {
  return (
    <>
      <AppHeader />

      <main className="min-h-screen bg-white px-6 pb-20 pt-10 text-Text antialiased">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-tight text-Title">
            Testimony
          </h1>

          <div className="mt-8 space-y-10 text-base leading-relaxed text-TextSm">
            <section className="space-y-4">
              <p>
                This is the testimony page. Here you can find information about our testimonies.
              </p>
            </section>
          </div>
        </div>
      </main>

      <AppFooter />
    </>
  );
}