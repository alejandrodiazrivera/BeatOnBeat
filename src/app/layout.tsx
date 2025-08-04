import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BeOnBeat┃Timing moves',
  description: 'Analyze dance videos with cue points',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress jQuery unload warnings from YouTube API
              if (typeof console !== 'undefined') {
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  if (args[0] && args[0].includes && args[0].includes('Unload event listeners are deprecated')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
              }
            `,
          }}
        />
      </body>
    </html>
  )
}