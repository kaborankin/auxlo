"use client";

import React, { useEffect, useState, useRef } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AuxloNav from "./Nav";
import AuxloFooter from "./Footer";
import CookieBanner from "./CookieBanner";

const industries = [
  { key: "aesthetics", title: "Aesthetics" },
  { key: "dental", title: "Dental" },
  { key: "salon", title: "Salon" },
  { key: "physio", title: "Physio" },
  { key: "nails", title: "Nails" },
];

const journeySteps = [
  { id: "content", label: "CONTENT" },
  { id: "discovery", label: "DISCOVERY" },
  { id: "enquiry", label: "ENQUIRY" },
  { id: "crm", label: "CRM" },
  { id: "follow-up", label: "FOLLOW-UP" },
  { id: "booking", label: "BOOKING" },
  { id: "customer", label: "CUSTOMER" },
];

export default function AuxloLandingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const journeyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!journeyRef.current) return;
      const rect = journeyRef.current.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrollPosition = -rect.top + (window.innerHeight / 2);
      const step = Math.min(
        journeySteps.length - 1,
        Math.max(0, Math.floor((scrollPosition / sectionHeight) * journeySteps.length))
      );
      setActiveStep(step);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="auxlo-home-shell bg-auxlo-black text-auxlo-text font-inter selection:bg-auxlo-lime selection:text-auxlo-black">
      <AuxloNav />

      <main className="auxlo-main-surface">
        {/* Section 1 — Hero (Reverted to Left Text, Right Image) */}
        <section className="px-4 sm:px-6 py-12 sm:py-20 lg:px-8 lg:py-28 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-20 items-center">
              <div className="lg:col-span-7 space-y-8 text-left animate-in fade-in slide-in-from-left-6 duration-1000">
                <p className="text-[9px] sm:text-[12px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold text-auxlo-lime mb-4">
                  GROWTH + OPERATIONS
                </p>
                <h1 className="font-manrope text-2xl font-extrabold leading-[1.1] tracking-tight text-auxlo-text sm:text-4xl lg:text-7xl">
                  Turn attention into enquiries.<br />Keep everything moving.
                </h1>
                <p className="text-sm sm:text-base lg:text-xl leading-relaxed text-auxlo-muted max-w-2xl font-medium">
                  Content, customer journeys and business systems connected into one practical operating layer for UK service businesses.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-4">
                  <Link href="/auxlo/contact" className="inline-flex items-center justify-center rounded-full bg-auxlo-lime px-5 py-3 text-xs sm:px-10 sm:py-5 sm:text-base font-bold text-auxlo-black transition hover:scale-105 active:scale-95 shadow-xl shadow-auxlo-lime/10">
                    Request a Concept
                  </Link>
                  <Link href="/auxlo/demos" className="inline-flex items-center justify-center rounded-full border border-auxlo-elevated bg-auxlo-elevated/50 px-5 py-3 text-xs sm:px-10 sm:py-5 sm:text-base font-bold text-auxlo-text transition hover:bg-auxlo-elevated hover:scale-105 active:scale-95 backdrop-blur-sm">
                    See how it works
                  </Link>
                </div>

                <div className="pt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-auxlo-text/40">
                   <span className="text-auxlo-text/40">CONTENT</span>
                   <ArrowRight className="w-4 h-4 text-auxlo-lime/30" />
                   <span className="text-auxlo-text/40">ENQUIRY</span>
                   <ArrowRight className="w-4 h-4 text-auxlo-lime/30" />
                   <span className="text-auxlo-text/40">OPERATIONS</span>
                </div>
              </div>

              <div className="lg:col-span-5 relative animate-in fade-in slide-in-from-right-6 duration-1000">
                <div className="rounded-[1.5rem] sm:rounded-[2.5rem] bg-auxlo-elevated/40 border border-auxlo-lime/10 overflow-hidden shadow-2xl p-2 sm:p-4 backdrop-blur-sm group">
                   <div className="relative aspect-[4/5] lg:aspect-[10/12] w-full rounded-[1.5rem] overflow-hidden">
                      <Image
                        src="/auxlo/crmimg.png"
                        alt="Auxlo CRM Visual"
                        fill
                        priority
                        className="object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — THE IDEA */}
        <section className="bg-auxlo-surface px-6 py-32 lg:px-8 border-y border-auxlo-elevated">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="font-manrope text-3xl font-bold tracking-tight text-auxlo-text sm:text-5xl lg:text-6xl max-w-4xl mx-auto leading-tight">
              Your business doesn’t need more tools.<br />It needs the right things connected.
            </h2>
            <div className="mt-24 grid gap-16 sm:grid-cols-3 text-left">
              <div>
                <span className="text-auxlo-lime font-bold text-3xl mb-6 block">01 Content</span>
                <p className="text-auxlo-muted text-lg leading-relaxed">Get discovered and stay visible consistently without living on social media.</p>
              </div>
              <div>
                <span className="text-auxlo-lime font-bold text-3xl mb-6 block">02 Enquiries</span>
                <p className="text-auxlo-muted text-lg leading-relaxed">Make it effortless for people to take the next step through intuitive booking and enquiry flows.</p>
              </div>
              <div>
                <span className="text-auxlo-lime font-bold text-3xl mb-6 block">03 Operations</span>
                <p className="text-auxlo-muted text-lg leading-relaxed">Capture, organise and follow up automatically without everything living in someone’s head.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 — 01 CONTENT */}
        <section id="content" className="px-4 sm:px-6 py-16 sm:py-32 lg:px-8 overflow-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-5 lg:gap-20 items-center">
              <div>
                <p className="text-[9px] sm:text-[11px] font-bold text-auxlo-lime uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-6">01 / CONTENT</p>
                <h2 className="font-manrope text-2xl font-bold text-auxlo-text sm:text-5xl lg:text-6xl leading-tight mb-4 sm:mb-8">Stay visible without living on Instagram.</h2>
                <p className="text-sm sm:text-xl text-auxlo-muted leading-relaxed mb-6 sm:mb-10">Content creation, planning and social scheduling designed around the business.</p>
                <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-12">
                  {["Content creation", "Content planning", "Social scheduling", "Instagram management", "Performance insights"].map(item => (
                    <li key={item} className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base text-auxlo-text/90 font-medium">
                      <div className="h-2 w-2 rounded-full bg-auxlo-lime" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auxlo/contact" className="inline-flex text-auxlo-lime hover:text-auxlo-text items-center gap-2 sm:gap-3 font-bold uppercase tracking-widest text-[10px] sm:text-[13px] transition-colors group">
                  Explore Content <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
              <div className="relative aspect-[4/5] rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-2xl border border-auxlo-elevated group">
                <Image
                  src="/auxlo/contentimg.png"
                  alt="Studio Production"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — 02 CUSTOMER JOURNEY */}
        <section id="customer-journey" className="bg-auxlo-surface/50 px-4 sm:px-6 py-16 sm:py-32 lg:px-8 border-y border-auxlo-elevated">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-5 lg:gap-20 items-center">
              <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl border border-auxlo-elevated group p-2 sm:p-4 bg-auxlo-elevated/20">
                <Image
                  src="/auxlo/image.png"
                  alt="Booking Flow Concept"
                  fill
                  className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="lg:pl-16">
                <p className="text-[9px] sm:text-[11px] font-bold text-auxlo-lime uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-6">02 / JOURNEY</p>
                <h2 className="font-manrope text-2xl font-bold text-auxlo-text sm:text-5xl lg:text-6xl leading-tight mb-4 sm:mb-8">Make it easier for customers to take the next step.</h2>
                <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-12">
                  {["Websites", "Landing pages", "Booking systems", "Enquiry forms", "WhatsApp integration", "Lead capture"].map(item => (
                    <li key={item} className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base text-auxlo-text/90 font-medium">
                      <div className="h-2 w-2 rounded-full bg-auxlo-lime" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auxlo/contact" className="inline-flex text-auxlo-lime hover:text-auxlo-text items-center gap-2 sm:gap-3 font-bold uppercase tracking-widest text-[10px] sm:text-[13px] transition-colors group">
                  Explore Journey <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — 03 OPERATIONS */}
        <section id="operations" className="px-4 sm:px-6 py-16 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-5 lg:gap-20 items-center">
              <div>
                <p className="text-[9px] sm:text-[11px] font-bold text-auxlo-lime uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-6">03 / OPERATIONS</p>
                <h2 className="font-manrope text-2xl font-bold text-auxlo-text sm:text-5xl lg:text-6xl leading-tight mb-4 sm:mb-8">Spend less time chasing the things your system should handle.</h2>
                <ul className="space-y-2 sm:space-y-4 mb-6 sm:mb-12">
                  {["CRM", "Lead management", "Follow-ups", "Notifications", "Scheduling", "AI-assisted workflows", "Automation"].map(item => (
                    <li key={item} className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base text-auxlo-text/90 font-medium">
                      <div className="h-2 w-2 rounded-full bg-auxlo-lime" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auxlo/contact" className="inline-flex text-auxlo-lime hover:text-auxlo-text items-center gap-2 sm:gap-3 font-bold uppercase tracking-widest text-[10px] sm:text-[13px] transition-colors group">
                  Explore Operations <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
              <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden shadow-2xl border border-auxlo-elevated group p-2 sm:p-4 bg-auxlo-elevated/20">
                <Image
                  src="/auxlo/heroimg.png"
                  alt="Operations Dashboard"
                  fill
                  className="object-contain p-2 sm:p-4 transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 6 — THE CONNECTED JOURNEY */}
        <section ref={journeyRef} className="bg-auxlo-black px-6 py-40 lg:px-8 border-y border-auxlo-elevated min-h-[120vh]">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-auxlo-text sm:text-7xl mb-16 sm:mb-32">Everything is connected.</h2>
            
            <div className="grid lg:grid-cols-2 gap-20 items-start max-w-6xl mx-auto">
               <div className="flex flex-col gap-8 text-left sticky top-40">
                  {journeySteps.map((step, idx) => (
                    <div 
                      key={step.id} 
                      className={`flex items-center gap-4 sm:gap-8 transition-all duration-500 ${activeStep === idx ? 'opacity-100 sm:translate-x-4' : 'opacity-30 translate-x-0'}`}
                    >
                      <span className={`text-3xl sm:text-5xl font-manrope font-black ${activeStep === idx ? 'text-auxlo-lime' : 'text-auxlo-text'}`}>
                        {step.label}
                      </span>
                      {idx < journeySteps.length - 1 && (
                        <div className={`h-px flex-grow bg-auxlo-text transition-all duration-500 ${activeStep === idx ? 'scale-x-100 opacity-20' : 'scale-x-0 opacity-0'}`} />
                      )}
                    </div>
                  ))}
               </div>

               <div className="space-y-12">
                  <div className="rounded-3xl border border-auxlo-elevated bg-auxlo-surface p-6 sm:p-12 text-left">
                    <h3 className="font-manrope text-xl font-bold text-auxlo-text/60 mb-8 sm:mb-12 uppercase tracking-widest">Without a system</h3>
                    <div className="space-y-6 text-xl sm:text-2xl font-medium text-auxlo-text/50">
                      <p>Instagram</p>
                      <p className="text-auxlo-text/30">↓</p>
                      <p>WhatsApp</p>
                      <p className="text-auxlo-text/30">↓</p>
                      <p>Manual response</p>
                      <p className="text-auxlo-text/30">↓</p>
                      <p className="line-through decoration-auxlo-lime/20">Forgotten follow-up</p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-auxlo-lime/20 bg-auxlo-elevated p-6 sm:p-12 text-left shadow-2xl shadow-auxlo-lime/5">
                    <h3 className="font-manrope text-xl font-bold text-auxlo-lime mb-8 sm:mb-12 uppercase tracking-widest">With Auxlo</h3>
                    <div className="space-y-6 text-xl sm:text-2xl font-bold text-auxlo-text">
                      <p className="flex items-center gap-4">Content <CheckCircle2 className="w-6 h-6 text-auxlo-lime" /></p>
                      <p className="text-auxlo-muted/30">↓</p>
                      <p className="flex items-center gap-4">Enquiry <CheckCircle2 className="w-6 h-6 text-auxlo-lime" /></p>
                      <p className="text-auxlo-muted/30">↓</p>
                      <p className="flex items-center gap-4">CRM <CheckCircle2 className="w-6 h-6 text-auxlo-lime" /></p>
                      <p className="text-auxlo-muted/30">↓</p>
                      <p className="flex items-center gap-4">Notification <CheckCircle2 className="w-6 h-6 text-auxlo-lime" /></p>
                      <p className="text-auxlo-muted/30">↓</p>
                      <p className="flex items-center gap-4">Follow-up <CheckCircle2 className="w-6 h-6 text-auxlo-lime" /></p>
                      <p className="text-auxlo-muted/30">↓</p>
                      <p className="flex items-center gap-4 text-auxlo-lime">Booking <CheckCircle2 className="w-6 h-6" /></p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Section 7 — SEE IT BEFORE YOU BUY IT */}
        <section className="px-6 py-40 lg:px-8 border-b border-auxlo-elevated overflow-hidden">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="font-manrope text-4xl font-extrabold tracking-tight text-auxlo-text sm:text-7xl mb-10">See it before you buy it.</h2>
            <p className="mt-4 text-xl text-auxlo-muted max-w-2xl mx-auto font-medium mb-24">
              We build practical concepts around real service businesses so you can see how the customer journey could work.
            </p>
            
            <div className="max-w-6xl mx-auto mb-32">
               <div className="relative aspect-video rounded-[2.5rem] bg-auxlo-surface border border-auxlo-elevated overflow-hidden shadow-2xl group">
                 <div className="absolute inset-0 bg-[#000] p-4 pt-12">
                   <iframe 
                     src="/auxlo/demos/aesthetics" 
                     className="w-full h-full rounded-xl border-none opacity-80 group-hover:opacity-100 transition-opacity"
                     title="Aesthetics Demo"
                   />
                 </div>
                 {/* Browser Frame Header */}
                 <div className="absolute top-0 left-0 right-0 h-12 bg-auxlo-elevated flex items-center px-6 gap-2">
                    <div className="flex gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-auxlo-text/20" />
                       <div className="w-3 h-3 rounded-full bg-auxlo-text/20" />
                       <div className="w-3 h-3 rounded-full bg-auxlo-text/20" />
                    </div>
                    <div className="mx-auto bg-auxlo-black/40 px-10 py-1 rounded-md text-[10px] font-mono text-auxlo-text/40">
                      auxlo.uk/demos/aesthetics
                    </div>
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-auxlo-black via-transparent to-transparent pointer-events-none" />
                 <div className="absolute bottom-4 left-4 sm:bottom-12 sm:left-12 text-left">
                    <p className="text-auxlo-lime font-bold uppercase tracking-widest text-[11px] mb-2">FEATURED CONCEPT</p>
                    <h3 className="text-2xl sm:text-4xl font-manrope font-bold text-auxlo-text mb-3 sm:mb-6">Aesthetics</h3>
                    <Link href="/auxlo/demos/aesthetics" className="inline-flex items-center justify-center rounded-full bg-auxlo-lime px-6 py-3 text-xs sm:px-8 sm:py-4 sm:text-sm font-bold text-auxlo-black transition hover:scale-105 active:scale-95">
                      View interactive demo <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </div>
               </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              {industries.filter(i => i.key !== 'aesthetics').map((ind) => (
                <Link key={ind.key} href={`/auxlo/demos/${ind.key}`} className="rounded-3xl border border-auxlo-elevated bg-auxlo-surface/40 p-10 flex flex-col items-center group transition-all hover:border-auxlo-lime/30 hover:-translate-y-2">
                  <h3 className="font-manrope text-2xl font-bold text-auxlo-text mb-2 group-hover:text-auxlo-lime transition-colors">{ind.title}</h3>
                  <p className="text-auxlo-muted text-sm font-medium mb-8">Booking experience</p>
                  <span className="mt-auto text-[11px] font-black uppercase tracking-widest text-auxlo-muted group-hover:text-auxlo-text transition-colors">
                    View Concept →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section 8 — BUILT AROUND SERVICE BUSINESSES */}
        <section className="bg-auxlo-black px-6 py-32 lg:px-8 border-b border-auxlo-elevated">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="font-manrope text-3xl font-extrabold text-auxlo-text uppercase tracking-[0.2em] mb-20 opacity-50">Built around real service businesses</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[
                "Beauty & Wellness",
                "Healthcare",
                "Events",
                "Cleaning & Maintenance",
                "Trades & Home Services",
                "Professional Services"
              ].map(industry => (
                <div key={industry} className="text-[14px] font-bold text-auxlo-muted transition-colors hover:text-auxlo-lime cursor-default">
                  {industry}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 9 — ABOUT AUXLO TEASER */}
        <section className="bg-auxlo-surface px-6 py-40 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-manrope text-3xl font-bold text-auxlo-text sm:text-5xl leading-tight mb-12">
              We’re not here to give your business another dashboard.
            </h2>
            <p className="text-xl sm:text-2xl leading-relaxed text-auxlo-muted font-medium mb-16">
              Auxlo is built around a simple idea: the tools you already use should work together.
            </p>
            <div className="grid md:grid-cols-3 gap-12 text-left max-w-3xl mx-auto mb-20">
               <div>
                 <p className="text-auxlo-text font-bold mb-2">Content</p>
                 <p className="text-auxlo-muted text-sm">Gets attention.</p>
               </div>
               <div>
                 <p className="text-auxlo-text font-bold mb-2">Journeys</p>
                 <p className="text-auxlo-muted text-sm">Capture it.</p>
               </div>
               <div>
                 <p className="text-auxlo-text font-bold mb-2">Operations</p>
                 <p className="text-auxlo-muted text-sm">Keep it moving.</p>
               </div>
            </div>
            <Link href="/auxlo/about" className="inline-flex items-center justify-center rounded-full border border-auxlo-elevated px-10 py-5 text-base font-bold text-auxlo-text transition hover:bg-auxlo-text hover:text-auxlo-black hover:scale-105 active:scale-95">
              About Auxlo →
            </Link>
          </div>
        </section>

        {/* Section 10 — FINAL CTA */}
        <section className="bg-auxlo-lime px-6 py-40 lg:px-8 text-auxlo-black overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-white opacity-10 rounded-full blur-[120px] pointer-events-none" />
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <h2 className="font-manrope text-4xl font-extrabold tracking-tight sm:text-7xl mb-12">
              You already have the attention.<br />
              Let’s build what happens next.
            </h2>
            <p className="text-lg sm:text-2xl leading-relaxed font-bold mb-16 max-w-2xl mx-auto opacity-80">
              No obligation. No generic proposal. Just a practical concept built around your business.
            </p>
            <Link href="/auxlo/contact" className="inline-flex items-center justify-center rounded-full bg-auxlo-black px-12 py-6 text-lg font-black uppercase tracking-widest text-auxlo-lime transition hover:scale-105 active:scale-95 shadow-2xl">
              Request a Concept
            </Link>
          </div>
        </section>
      </main>

      <AuxloFooter />
      <CookieBanner />
    </div>
  );
}
