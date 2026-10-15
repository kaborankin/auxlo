import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AuxloFooter() {
  return (
    <footer className="bg-auxlo-black px-6 py-20 lg:px-8 border-t border-auxlo-elevated">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2">
            <Link href="/auxlo" className="flex items-center mb-6">
              <Image
                src="/auxlo/logo.png"
                alt="Auxlo Logo"
                width={120}
                height={120}
                className="object-contain mix-blend-screen -ml-4"
              />
            </Link>
            <p className="text-auxlo-text/60 max-w-xs leading-relaxed">
              Content. Customer journeys. Business systems. Connected into one practical operating layer.
            </p>
          </div>
          
          <div>
            <p className="font-bold text-auxlo-text text-[10px] uppercase tracking-[0.2em] mb-6">Services</p>
            <ul className="space-y-4 text-sm text-auxlo-text/60">
              <li><Link href="/auxlo#content" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Content</Link></li>
              <li><Link href="/auxlo#customer-journey" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Customer Journey</Link></li>
              <li><Link href="/auxlo#operations" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Operations</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-auxlo-text text-[10px] uppercase tracking-[0.2em] mb-6">Work</p>
            <ul className="space-y-4 text-sm text-auxlo-text/60">
              <li><Link href="/auxlo/demos" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Demos</Link></li>
            </ul>
            <p className="font-bold text-auxlo-text text-[10px] uppercase tracking-[0.2em] mt-10 mb-6">Company</p>
            <ul className="space-y-4 text-sm text-auxlo-text/60">
              <li><Link href="/auxlo/about" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">About</Link></li>
              <li><Link href="/auxlo/contact" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-auxlo-text text-[10px] uppercase tracking-[0.2em] mb-6">Legal</p>
            <ul className="space-y-4 text-sm text-auxlo-text/60">
              <li><Link href="/auxlo/privacy" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Privacy</Link></li>
              <li><Link href="/auxlo/cookies" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Cookies</Link></li>
              <li><Link href="/auxlo/terms" className="text-auxlo-text/70 hover:text-auxlo-lime transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-auxlo-elevated flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-medium uppercase tracking-[0.1em] text-auxlo-text/40">
          <p>© 2026 Auxlo Systems</p>
          <div className="flex gap-8">
            <span className="opacity-50 text-auxlo-text/40">United Kingdom</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
