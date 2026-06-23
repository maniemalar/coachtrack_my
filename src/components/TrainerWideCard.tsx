import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, MapPin, Award, Clock, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { TrainerProfile } from '../types';
import { dbService } from '../lib/dbService';

interface TrainerWideCardProps {
  trainer: TrainerProfile & { distance?: number };
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenProfile: (t: TrainerProfile) => void;
  onOpenBooking: (t: TrainerProfile) => void;
}

const MATCH_PERCENTAGES: Record<string, number> = {
  tr_sarah: 92,
  tr_faiz: 84,
  tr_rishi: 79
};

const DISCIPLINE_HIGHLIGHTS: Record<string, string[]> = {
  tr_sarah: ["Therapeutic Yoga", "Postural Alignment", "Core Restorative", "Pilates Balance"],
  tr_faiz: ["Powerlifting", "Hypertrophy Guidance", "Kettlebell Conditioning", "CPT Certified"],
  tr_rishi: ["Aerobic Conditioning", "Functional HIIT", "Calisthenics Power", "Weight Management"]
};

export default function TrainerWideCard({
  trainer,
  isFavorite,
  onToggleFavorite,
  onOpenProfile,
  onOpenBooking,
}: TrainerWideCardProps) {
  const isSarah = trainer.id === 'tr_sarah';
  
  // Rating and review data
  const ratingValue = isSarah ? 4.9 : trainer.rating;
  const reviewCount = isSarah ? 128 : (trainer.id === 'tr_faiz' ? 42 : 28);
  const experienceYearsText = isSarah ? "6+ Years" : `${trainer.experienceYears} Years`;
  
  // Goal Match percentage calculation
  const matchPct = MATCH_PERCENTAGES[trainer.id] || 75;

  // Retrieve live booked slots to compute genuine next available slot
  const [trainerBookings, setTrainerBookings] = useState<any[]>([]);

  useEffect(() => {
    dbService.getBookings({ trainerId: trainer.id })
      .then(setTrainerBookings)
      .catch(err => console.error("Error loaded bookings in wide card:", err));
  }, [trainer.id]);

  // Next Available Slot Synchronizer Logic (Never random, strictly following configured schedule)
  const getNextSlotStr = () => {
    const ALLOWED_SLOTS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
    const today = new Date('2026-06-22'); // Baseline today in the app
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const isSunday = checkDate.getDay() === 0;
      if (isSunday) continue; // Closed on Sundays
      
      const dayName = i === 0 ? "Today" : (i === 1 ? "Tomorrow" : checkDate.toLocaleDateString('en-US', { weekday: 'short' }));
      const dateStr = checkDate.toISOString().split('T')[0];
      
      for (const slot of ALLOWED_SLOTS) {
        const isBooked = trainerBookings.some(b => b.date === dateStr && b.timeSlot === slot && b.status !== 'Cancelled');
        if (!isBooked) {
          return `${dayName} at ${slot}`;
        }
      }
    }
    return "Next Week";
  };

  const dynamicNextSlot = getNextSlotStr();

  return (
    <div 
      onClick={() => onOpenProfile(trainer)}
      className={`group relative bg-white border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg flex flex-col gap-4 font-sans text-left cursor-pointer ${
        isSarah 
          ? 'border-indigo-500/30 shadow-indigo-100/40 ring-2 ring-indigo-500/5' 
          : 'border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* 1. Profile Photo (with Favorite Toggle overlay) */}
      <div className="relative">
        <div className="relative w-full h-44 sm:h-48 overflow-hidden rounded-xl">
          <img 
            referrerPolicy="no-referrer"
            src={trainer.avatarUrl} 
            alt={trainer.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
          
          {/* Top category badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {isSarah && (
              <span className="bg-indigo-600 text-white text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> MY PRIMARY COACH
              </span>
            )}
            <span className="bg-slate-900/60 backdrop-blur-sm text-slate-200 text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
              {trainer.freelanceStatus || 'Professional'}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(trainer.id, e);
            }}
            className="absolute top-3 right-3 bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-lg shadow border border-slate-100 transition active:scale-90"
            title="Favorite toggle"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* 2 & 3. Coach Name & Verification Badge */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition">
              {trainer.name}
            </h3>
            {trainer.verified && (
              <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100 mt-0.5">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> VERIFIED
              </span>
            )}
          </div>
        </div>

        {/* 4. Specialization */}
        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
          {trainer.discipline}
        </p>
      </div>

      {/* 5. Rating */}
      <div className="flex items-center gap-1 text-xs text-slate-600">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
        <span className="font-bold text-slate-800">{ratingValue.toFixed(1)}</span>
        <span className="text-slate-400 font-normal">({reviewCount} reviews • {experienceYearsText} exp)</span>
      </div>

      {/* 6. Location (Assigned Coach instead of distance) */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-medium text-slate-705 truncate max-w-[180px]">{trainer.location}</span>
        <span className="text-slate-300">•</span>
        {isSarah ? (
          <span className="text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Assigned Coach
          </span>
        ) : (
          <span className="text-teal-700 font-bold bg-teal-50 border border-teal-100 px-2 py-0.5 rounded text-[10px]">
            {trainer.distance || 2.4} km away
          </span>
        )}
      </div>

      {/* 7. Goal Match Percentage */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-medium">Goal Alignment Fit</span>
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-indigo-600">{matchPct}% Match</span>
          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-indigo-600 rounded-full" 
              style={{ width: `${matchPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 8. Available Slots */}
      <div className="flex items-center gap-2 text-xs text-slate-700">
        <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <div className="text-left leading-tight">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Available Slot</span>
          <span className="font-semibold text-slate-800">{dynamicNextSlot}</span>
        </div>
      </div>

      {/* 9. Price */}
      <div className="border-t border-slate-100 pt-3 mt-1 flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Starting Rate</span>
        <p className="text-base font-bold text-slate-900">
          RM {trainer.pricePerHour} <span className="text-[10px] text-slate-400 font-normal">/ session</span>
        </p>
      </div>

      {/* 10 & 11. View Profile Button and Book Session Button */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenProfile(trainer);
          }}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center cursor-pointer"
        >
          View Profile
        </button>
        
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenBooking(trainer);
          }}
          className="bg-[#001F3F] hover:bg-slate-900 text-[#18D4C5] font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer hover:shadow"
        >
          <span>Book Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
