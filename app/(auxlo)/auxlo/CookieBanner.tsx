"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("auxlo-cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("auxlo-cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("auxlo-cookie-consent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-8 right-8 z-[100] md:left-auto md:max-w-md animate-in slide-in-from-bottom-10 duration-500">
      <div className="rounded-3xl border border-auxlo-elevated bg-auxlo-surface/90 backdrop-blur-xl p-8 shadow-2xl">
        <h3 className="text-lg font-bold text-auxlo-text mb-4">Cookie Preference</h3>
        <p className="text-auxlo-muted text-sm leading-relaxed mb-8">
          We use cookies to enhance your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read our <Link href="/auxlo/privacy" className="text-auxlo-lime hover:underline font-bold">Privacy Policy</Link> and <Link href="/auxlo/terms" className="text-auxlo-lime hover:underline font-bold">Terms</Link> for more details.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={handleAccept}
            className="flex-grow rounded-full bg-auxlo-lime px-6 py-3 text-xs font-bold uppercase tracking-widest text-auxlo-black transition hover:scale-105 active:scale-95"
          >
            Accept
          </button>
          <button 
            onClick={handleReject}
            className="flex-grow rounded-full border border-auxlo-elevated bg-auxlo-black px-6 py-3 text-xs font-bold uppercase tracking-widest text-auxlo-text transition hover:bg-auxlo-elevated"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
