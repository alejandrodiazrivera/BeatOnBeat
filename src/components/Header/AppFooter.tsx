'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AppFooter() {
  return (
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
          <span className="text-sm font-medium">© 2026 ChoreoLab. All rights reserved.</span>
          <span className="text-sm font-medium">CVR.nr: 12345678</span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-TextL">
          <Link href="/product" className="transition-colors hover:text-Text">
            Product
          </Link>
          <Link href="/testimony" className="transition-colors hover:text-Text">
            Case Study
          </Link>
          <Link href="/about" className="transition-colors hover:text-Text">
            About
          </Link>
        </nav>

        <p className="text-xs text-TextL">Client-side · no account required</p>
      </div>
    </footer>
  );
}
