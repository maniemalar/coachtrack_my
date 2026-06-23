import React from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  Apple, 
  TrendingUp, 
  ArrowRight, 
  Star, 
  Crown, 
  Check 
} from 'lucide-react';

interface LandingPageProps {
  onStartAs: (action: 'login' | 'signup') => void;
}

export default function LandingPage({ onStartAs }: LandingPageProps) {
  return (
    <div className="w-full bg-[#F8FAFC] flex flex-col items-center justify-start text-slate-800 font-sans pb-12">
      {/* 3. HERO SECTION */}
      <div className="px-4 pt-6 w-full">
        <div className="w-full bg-gradient-to-br from-[#001F3F] via-[#052B54] to-[#18D4C5] rounded-[20px] p-6 text-white shadow-lg relative overflow-hidden">
          {/* Decorative organic background circle */}
          <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <span className="inline-block bg-white/15 backdrop-blur-md text-[#18D4C5] text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider border border-white/10">
              ⚡ LIVE FITNESS ECOSYSTEM
            </span>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight leading-none">
                CoachTrack MY
              </h1>
              <p className="text-sm font-semibold text-teal-300">
                Malaysia’s Premium Fitness Coaching Platform
              </p>
            </div>
            
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Book verified coaches, track workouts, monitor nutrition, and manage progress in one private coaching ecosystem.
            </p>
            
            <button
              onClick={() => onStartAs('login')}
              className="w-full bg-[#18D4C5] hover:bg-[#15C2B4] active:scale-[0.98] text-[#001F3F] font-extrabold py-3 px-5 rounded-[15px] text-xs uppercase tracking-wider transition duration-200 shadow-md shadow-teal-550/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Enter App Login</span>
              <ArrowRight className="w-4 h-4 text-[#001F3F]" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. FEATURE CARDS */}
      <div className="px-4 pt-8 w-full space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-black text-[#001F3F] uppercase tracking-wider">
            Premium App Capabilities
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            Everything you need for elite athletic progression
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Feature 1 */}
          <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-sm flex flex-col justify-between space-y-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#18D4C5]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#001F3F]">Verified Coaches</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal">
                Certified trainers with verified profiles and ratings.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-sm flex flex-col justify-between space-y-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#18D4C5]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#001F3F]">Smart Scheduling</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal">
                Book sessions based on real coach availability.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-sm flex flex-col justify-between space-y-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <Apple className="w-5 h-5 text-[#18D4C5]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#001F3F]">Nutrition Tracking</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal">
                Upload meals and receive AI-powered macro insights.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white border border-slate-100 p-4 rounded-[20px] shadow-sm flex flex-col justify-between space-y-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#18D4C5]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#001F3F]">Progress Analytics</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1 leading-normal">
                Track weight, BMI, measurements and history.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. COACHTRACK PLANS */}
      <div className="px-4 pt-10 w-full space-y-5">
        <div className="text-center">
          <h2 className="text-lg font-black text-[#001F3F] uppercase tracking-wider">
            Trainers, Choose Your CoachTrack Plan
          </h2>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[320px] mx-auto">
            Flexible memberships designed for every stage of your fitness journey.
          </p>
        </div>

        <div className="space-y-4">
          {/* CoachBasic Card */}
          <div className="bg-white border border-slate-150 p-5 rounded-[20px] shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-[#001F3F]">CoachBasic</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Start your fitness journey</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-[#001F3F] block">RM29</span>
                <span className="text-[8px] font-bold text-slate-400 block -mt-1">/month</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Coach Marketplace Access</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>View Coach Profiles & Ratings</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Session Booking</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Workout History</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Weight Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Notifications</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Basic Profile Management</span>
              </div>
            </div>

            <button
              onClick={() => onStartAs('signup')}
              className="mt-5 w-full bg-slate-100 hover:bg-slate-200 text-[#001F3F] font-bold py-2.5 rounded-[12px] text-[10px] uppercase tracking-wider transition cursor-pointer"
            >
              Choose CoachBasic
            </button>
          </div>

          {/* CoachPlus Card (MOST POPULAR) */}
          <div className="bg-white border-2 border-[#18D4C5] p-5 rounded-[20px] shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#18D4C5] text-[#001F3F] text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-[12px] flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-[#001F3F]" />
              <span>MOST POPULAR</span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-[#001F3F]">CoachPlus</h3>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">Everything needed for active coaching</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-[#001F3F] block">RM59</span>
                <span className="text-[8px] font-bold text-slate-400 block -mt-1">/month</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-700 font-bold">
                <Check className="w-3.5 h-3.5 text-[#18D4C5] shrink-0" />
                <span>Everything in CoachBasic</span>
              </div>

              {/* Nutrition Group */}
              <div className="space-y-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#18D4C5] block">Nutrition Suite</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Nutrition Tracking & Meal Logging</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>AI Nutrition Feedback</span>
                </div>
              </div>

              {/* Progress Group */}
              <div className="space-y-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#18D4C5] block">Progress Tracking</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Body Measurements Tracking</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Weight Analytics Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>BMI & BMR Tracking</span>
                </div>
              </div>

              {/* Coaching Tools Group */}
              <div className="space-y-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#18D4C5] block">Coaching Tools</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Coach Messaging & Chat Logs</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Session History Access</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartAs('signup')}
              className="mt-5 w-full bg-[#18D4C5] hover:bg-[#15C2B4] text-[#001F3F] font-extrabold py-2.5 rounded-[12px] text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm shadow-teal-350/20"
            >
              Choose CoachPlus
            </button>
          </div>

          {/* CoachPro Card (PREMIUM HIGHLIGHT) */}
          <div className="bg-[#001F3F] border border-slate-800 p-5 rounded-[20px] shadow-lg relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 bg-[#18D4C5] text-[#001F3F] text-[8px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-[12px] flex items-center gap-1">
              <Crown className="w-2.5 h-2.5 text-[#001F3F] fill-[#001F3F]" />
              <span>COACHPRO ELITE</span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-extrabold text-white">CoachPro</h3>
                <p className="text-[10px] text-teal-300 font-bold mt-0.5">Complete transformation ecosystem</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-[#18D4C5] block">RM99</span>
                <span className="text-[8px] font-bold text-slate-400 block -mt-1">/month</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-teal-300 font-bold">
                <Check className="w-3.5 h-3.5 text-[#18D4C5] shrink-0" />
                <span>Everything in CoachPlus</span>
              </div>

              {/* Advanced Intelligence */}
              <div className="space-y-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#18D4C5] block">Advanced Health Intelligence</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Medical History Management</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Injury Tracking Records</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Emergency Contact Repository</span>
                </div>
              </div>

              {/* Premium Analytics */}
              <div className="space-y-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#18D4C5] block">Premium Analytics</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Transformation Progress Dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Advanced Trend Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Goal Achievement Forecasting</span>
                </div>
              </div>

              {/* Professional Reports */}
              <div className="space-y-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#18D4C5] block">Professional Reports</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>CSV Progress Reports & Downloads</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Monthly Transformation Reports</span>
                </div>
              </div>

              {/* Premium Visibility Benefits */}
              <div className="space-y-1.5 pl-1">
                <span className="text-[9px] font-black uppercase tracking-wider text-[#18D4C5] block">Premium Visibility Benefits</span>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Top Placement in Discovery</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Priority Placement in Search Results</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartAs('signup')}
              className="mt-5 w-full bg-[#18D4C5] hover:bg-[#15C2B4] text-[#001F3F] font-extrabold py-2.5 rounded-[12px] text-[10px] uppercase tracking-wider transition cursor-pointer shadow-md"
            >
              Choose CoachPro
            </button>
          </div>
        </div>
      </div>

      {/* 6. FINAL CTA */}
      <div className="px-4 pt-12 w-full">
        <div className="bg-white border border-slate-150 p-6 rounded-[20px] text-center space-y-5 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-[#001F3F]">
              Ready to Start Your Fitness Journey?
            </h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Join CoachTrack MY and connect with verified fitness professionals today.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onStartAs('login')}
              className="w-full bg-[#001F3F] hover:bg-[#052b54] text-white font-bold py-3 rounded-[12px] text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              Login
            </button>
            <button
              onClick={() => onStartAs('signup')}
              className="w-full bg-white border-2 border-[#001F3F] text-[#001F3F] hover:bg-slate-50 font-bold py-3 rounded-[12px] text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
