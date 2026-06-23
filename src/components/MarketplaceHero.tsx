import React from 'react';
import { Activity, MapPin } from 'lucide-react';

export default function MarketplaceHero() {
  return (
    <div className="relative bg-gradient-to-r from-[#001F3F] to-[#041F63] rounded-2xl overflow-hidden px-5 py-6 sm:py-8 text-white mb-6 shadow-md border border-indigo-950/40">
      {/* Decorative Subtle Blur Sphere */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#18D4C5]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-teal-500 to-[#18D4C5]" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        {/* Left Copy Section */}
        <div className="space-y-2.5 max-w-2xl text-left">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-[#18D4C5] rounded-full animate-ping" />
            <span className="text-[9px] font-semibold tracking-wider uppercase text-[#18D4C5] font-sans">
              COACHTRACK MY MARKETPLACE
            </span>
          </div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight font-sans">
            Find Your <span className="text-[#18D4C5]">Perfect Coach</span>
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl font-sans">
            Browse verified fitness professionals, match goals, and instantly book available coaching slots synchronized directly with their trainer calendars.
          </p>

          {/* Compact Quick Stats */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 pt-2 border-t border-white/5 font-sans">
            <div className="flex items-center gap-1">
              <span className="text-teal-400 font-bold">✓</span> 100% Verified Credentials
            </div>
            <div className="text-white/10">•</div>
            <div className="flex items-center gap-1">
              <span className="text-teal-400 font-bold">✓</span> Direct Calendar Sync
            </div>
            <div className="text-white/10">•</div>
            <div className="flex items-center gap-1">
              <span className="text-teal-400 font-bold">✓</span> Zero Booking Fees
            </div>
          </div>
        </div>

        {/* Right Badge (Saves huge vertical space) */}
        <div className="shrink-0 flex items-center">
          <div className="bg-slate-900/40 border border-white/10 rounded-xl px-3.5 py-3 flex flex-row sm:flex-col items-start gap-2.5 backdrop-blur-sm shadow-lg max-w-xs sm:max-w-none w-full">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#18D4C5] animate-pulse" />
              <span className="text-[10px] font-bold uppercase text-slate-300 font-sans tracking-wider">NETWORK ACTIVE</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-teal-400 font-semibold font-sans">
              <MapPin className="w-3 h-3" />
              <span>SS15 • Subang Jaya Hub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
