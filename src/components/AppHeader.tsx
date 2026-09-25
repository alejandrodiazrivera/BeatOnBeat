'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppHeader() {
  const pathname = usePathname();
  const showOpenApp = pathname === '/' || pathname === '/landing';

  return (
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
          <span className="text-base font-semibold tracking-tight text-white">ChoreoLab</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/about"
            className="hidden text-sm text-TextXl transition-colors hover:text-white sm:inline"
          >
            About
          </Link>
          <Link
            href="/library"
            className="hidden text-sm text-TextXl transition-colors hover:text-white sm:inline"
          >
            Library
          </Link>
          {showOpenApp && (
            <Link
              href="/loop"
              className="ds-btn-primary bg-white text-Navbar hover:bg-LayersToggle hover:text-Navbar"
            >
              Open app
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
