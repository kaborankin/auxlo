"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/auxlo#content", label: "Services" },
  { href: "/auxlo/demos", label: "Demos" },
  { href: "/auxlo/about", label: "About" },
  { href: "/auxlo/contact", label: "Contact" },
];

export default function AuxloNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-auxlo-elevated bg-auxlo-black/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-1 lg:px-8">
        <Link href="/auxlo" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <Image
            src="/auxlo/logo.png"
            alt="Auxlo Logo"
            width={140}
            height={140}
            className="h-12 w-auto object-contain mix-blend-screen md:h-[140px]"
            priority
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 text-sm font-medium text-auxlo-text/90 md:flex text-[13px] uppercase tracking-widest">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-auxlo-text transition hover:text-auxlo-lime">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auxlo/contact" className="hidden md:inline-flex items-center justify-center rounded-full bg-auxlo-lime px-5 py-2.5 text-[12px] font-bold uppercase tracking-widest text-auxlo-black transition hover:scale-105 active:scale-95">
            Request a Concept
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center rounded-full border border-auxlo-elevated p-2.5 text-auxlo-text transition hover:border-auxlo-lime/40 hover:text-auxlo-lime md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="border-t border-auxlo-elevated bg-auxlo-black/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-[13px] font-medium uppercase tracking-widest text-auxlo-text transition hover:bg-auxlo-elevated/60 hover:text-auxlo-lime"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auxlo/contact"
              onClick={() => setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-auxlo-lime px-5 py-3 text-[12px] font-bold uppercase tracking-widest text-auxlo-black transition active:scale-95"
            >
              Request a Concept
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
