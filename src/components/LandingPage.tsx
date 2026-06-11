import React from 'react';
import { ShieldCheck, MapPin, Sparkles, Activity, Utensils, HeartHandshake, Check } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onStartAs: (role: UserRole) => void;
}

export default function LandingPage({ onStartAs }: LandingPageProps) {
  return (
    <div className="w-full bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Hero Banner section */}
      <section className="relative bg-white border-b border-slate-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 rounded-full px-3 py-1 text-teal-800 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Malaysia’s Premium AI Trainer & Client Platform</span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight leading-none mb-6">
              Accelerate Your Fitness Career. <br />
              <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">Achieve Perfect Physical Goals.</span>
            </h1>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed max-w-2xl">
              CoachTrack MY is the complete all-in-one software built for Malaysian sports coaches, gym operators, freelance trainers, and their trainees. Manage custom workouts, track nutrition featuring an authentic database of local delicacies (Nasi Lemak, Teh Tarik, Roti Canai), generate certified invoices, and utilize AI-enhanced advice!
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onStartAs(UserRole.TRAINEE)}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-8 py-4 rounded-xl transition duration-200 transform hover:-translate-y-0.5 shadow-md flex items-center gap-2 text-sm"
                id="btn-trainee-start"
              >
                Start Tracking as Trainee
              </button>
              <button 
                onClick={() => onStartAs(UserRole.TRAINER)}
                className="bg-[#001F3F] hover:bg-slate-900 text-teal-400 font-bold px-8 py-4 rounded-xl border border-slate-800 transition duration-200 transform hover:-translate-y-0.5 shadow-sm text-sm"
                id="btn-trainer-start"
              >
                Join as Trainer / Coach
              </button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Malaysian Instructors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Under 10km GPS Discovery</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="absolute -top-6 -left-6 w-72 h-72 bg-teal-400/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-indigo-505/10 rounded-full blur-3xl -z-10"></div>
            
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNp_aNaJfDRjjCZ1t70Yoe0my-seU1jLKtaELkv2wjUZtKoLZFmOE-rIGx_kvBJ40NSMkZaVu2Gj_D7tgyREuJiu20ehe_sxSvS-S74u_YZjaEsVs4o6Z_OMLjh4TEUfspKB4VbxTZuDUy5ZvVrldxdys7tZTd8x3nseZ_AqYUmyTWTow5Pe-UQqojCs2xDmZquB-jKHEonJF3zNamcN26f7BhBb9MwF6RILt3e6q8Cbq2h13FdTNTJZ5f60dEcYBDbzm4jzS9I7A" 
              alt="CoachTrack MY App Dashboard preview" 
              className="w-full h-auto rounded-2xl shadow-xl border border-slate-100 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature Split section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-display font-extrabold text-slate-900 text-center mb-4">
          Dual Platform Optimized for Both Sides
        </h2>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
          Whether you’re keeping track of your business, or pushing personal physical breakthroughs, we have you covered.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Trainer Software Features */}
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 font-bold">
              🏋️
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">
              For Trainers, Coaches & Gym Operators
            </h3>
            <p className="text-slate-600 mb-6">
              Run your entire freelance business or gym from a sleek portal. Eliminate scheduling headaches, track client nutrition, and streamline payments.
            </p>
            
            <ul className="space-y-3 mb-8 text-left">
              {[
                'Full Client Rosters & Profile Records',
                'Visual In-App Replies to Workout & Nutrition Logs',
                'Malaysian-Formatted Billing, Invoices & Receipt Records',
                'Revenue Dashboards to Monitor Monthly Growth',
                'Professional Document Certification Uploads',
                'Interactive Schedule Calendars & Timetable Booking'
              ].map((f, i) => (
                <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600">
                  <Check className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onStartAs(UserRole.TRAINER)}
              className="w-full bg-[#001F3F] hover:bg-slate-900 text-teal-400 font-bold py-3.5 rounded-xl transition"
            >
              Sign Up as Verified Coach
            </button>
          </div>

          {/* Trainee App Features */}
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-6 font-bold">
              💪
            </div>
            <h3 className="text-2xl font-display font-bold text-slate-900 mb-4">
              For Trainees, Students & Fitness Lovers
            </h3>
            <p className="text-slate-600 mb-6">
              Unlock professional support. Discover verified premium trainers close to your location, log meals, complete secure invoices, and track your daily progress.
            </p>

            <ul className="space-y-3 mb-8 text-left">
              {[
                'Nearby Discoveries (under 10km radius calculation)',
                'Workout Trackers with Set, Rep, and Weight log details',
                'AI-Powered Adaptive Workout Routine suggestions',
                'Authentic Malaysian Food & Calories database',
                'Direct Feedback & Tagged Coach Messaging',
                'Consolidated Billing & One-Click Payment Mockups'
              ].map((f, i) => (
                <li key={i} className="flex gap-2.5 items-start text-sm text-slate-600">
                  <Check className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onStartAs(UserRole.TRAINEE)}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3.5 rounded-xl transition"
            >
              Launch Your Trainee App
            </button>
          </div>
        </div>
      </section>

      {/* Local Spotlight Section */}
      <section className="bg-[#001F3F] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-black tracking-tight text-white mb-4">
              Empowering Community Fitness in Klang Valley & Beyond
            </h2>
            <p className="text-slate-300">
              Simplifying professional execution from Subang Jaya to Kuala Lumpur city center.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-indigo-900/40 rounded-xl border border-indigo-800">
              <span className="block text-4xl font-extrabold text-teal-400 font-display">100%</span>
              <span className="block text-sm text-slate-300 mt-2 font-medium">Verified Malaysian Coaches Only</span>
            </div>
            <div className="p-6 bg-indigo-900/40 rounded-xl border border-indigo-800">
              <span className="block text-4xl font-extrabold text-teal-400 font-display">10 KM</span>
              <span className="block text-sm text-slate-300 mt-2 font-medium">True Geo-Radius Search Limits</span>
            </div>
            <div className="p-6 bg-indigo-900/40 rounded-xl border border-indigo-800">
              <span className="block text-4xl font-extrabold text-teal-400 font-display">GEMINI</span>
              <span className="block text-sm text-slate-300 mt-2 font-medium">A.I. Adaptive Routine Architect</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
