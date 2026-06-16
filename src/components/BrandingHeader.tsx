import React from 'react';
import { UserRole } from '../types';
import { LogIn, LogOut, Users, Settings, Plus, Info, Globe } from 'lucide-react';

interface BrandingHeaderProps {
  currentUser: { id: string; email: string; role: UserRole; name: string; avatarUrl: string } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onQuickLogin: (role: UserRole) => void;
}

export default function BrandingHeader({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  onQuickLogin
}: BrandingHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm relative z-40">
      {/* Demo Multi-role Switcher bar */}
      <div className="bg-slate-950 text-white text-xs px-4 py-2 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          <span>DEMO SANDBOX ACTIVE: Switch accounts instantly to test workflows</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onQuickLogin(UserRole.TRAINEE)}
            className={`px-2.5 py-1 rounded transition text-[11px] font-semibold ${
              currentUser?.role === UserRole.TRAINEE 
                ? 'bg-teal-500 text-white font-bold ring-1 ring-white/20' 
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            🧑 Ahmad Ibrahim (Trainee)
          </button>
          <button 
            onClick={() => onQuickLogin(UserRole.TRAINER)}
            className={`px-2.5 py-1 rounded transition text-[11px] font-semibold ${
              currentUser?.role === UserRole.TRAINER 
                ? 'bg-teal-500 text-white font-bold ring-1 ring-white/20' 
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            🏋️ Sarah Tan (Trainer)
          </button>
          {currentUser && (
            <button 
              onClick={onLogout}
              className="bg-rose-500/80 hover:bg-rose-600 px-2 py-0.5 text-[10px] rounded text-white font-medium flex items-center gap-1 ml-2 transition border border-rose-400"
            >
              <LogOut className="w-3 h-3" /> Log Out
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Brand Block */}
        <div className="flex items-center gap-4">
          {/* Company Uploaded Logo */}
          <img 
            alt="CoachTrack MY Logo" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDETvXZjCP6SyPdhxA5LBJxWToef2-2QRTWXAAcbAR1pYCPBQvSJ3JfenXj6iDZVITmo5sPVkUUbY6CFwY_JmfWywrTQ6vMQ17bJvlNGH4dBCAJBZQAbpTyqrM4kh0PaRdmjdFW5e_ga3qBpyVr_yuIpHJ3_B6g5G116iBOCQhZkDgjAZt18i5v1T48bkwzj8qwRAN4PQidoeK2dCT4jg0emt8ViDZeIiKE--IH9uddRKJNsZ2f0AOkUxqqnvBN0WOSIFHezK-Aw6s" 
            className="h-[60px] w-[60px] object-contain shrink-0 bg-transparent"
            id="app_logo"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black tracking-tight leading-none font-display">
              <span className="text-[#001F3F]">COACH</span><span className="text-teal-500">TRACK MY</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] font-medium text-slate-500 mt-1">
              Track • Improve • Achieve
            </p>
          </div>
        </div>

        {/* Global Nav Tabs */}
        {currentUser ? (
          <nav className="flex items-center gap-6 md:gap-8 overflow-x-auto max-w-full pb-1 md:pb-0" id="main-navigation">
            {currentUser.role === UserRole.TRAINEE ? (
              <>
                <button
                  id="tab-trainee-dash"
                  onClick={() => setActiveTab('trainee-dashboard')}
                  className={`py-1 text-sm font-semibold transition-all ${
                    activeTab === 'trainee-dashboard'
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1 font-bold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  id="tab-find-trainer"
                  onClick={() => setActiveTab('find-trainer')}
                  className={`py-1 text-sm font-semibold transition-all ${
                    activeTab === 'find-trainer'
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1 font-bold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Coaches near me
                </button>
                <button
                  id="tab-trainee-history"
                  onClick={() => setActiveTab('trainee-history')}
                  className={`py-1 text-sm font-semibold transition-all pr-1 whitespace-nowrap ${
                    activeTab === 'trainee-history'
                      ? 'text-teal-650 border-b-2 border-teal-600 pb-1 font-bold text-teal-600'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Session & Workout History
                </button>
                <button
                  id="tab-payments"
                  onClick={() => setActiveTab('payments')}
                  className={`py-1 text-sm font-semibold transition-all ${
                    activeTab === 'payments'
                      ? 'text-teal-650 border-b-2 border-teal-600 pb-1 font-bold text-teal-600'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Payments
                </button>
              </>
            ) : (
              <>
                <button
                  id="tab-trainer-dash"
                  onClick={() => setActiveTab('trainer-dashboard')}
                  className={`py-1 text-sm font-semibold transition-all ${
                    activeTab === 'trainer-dashboard'
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1 font-bold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  id="tab-client-mgmt"
                  onClick={() => setActiveTab('client-management')}
                  className={`py-1 text-sm font-semibold transition-all ${
                    activeTab === 'client-management'
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1 font-bold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Clients
                </button>
                <button
                  id="tab-session-history"
                  onClick={() => setActiveTab('session-history')}
                  className={`py-1 text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === 'session-history'
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1 font-bold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Session History
                </button>
                <button
                  id="tab-coaching-hub"
                  onClick={() => setActiveTab('coaching-hub')}
                  className={`py-1 text-sm font-semibold transition-all ${
                    activeTab === 'coaching-hub'
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1 font-bold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Coaching Hub
                </button>
                <button
                  id="tab-revenue"
                  onClick={() => setActiveTab('revenue')}
                  className={`py-1 text-sm font-semibold transition-all ${
                    activeTab === 'revenue'
                      ? 'text-teal-600 border-b-2 border-teal-600 pb-1 font-bold'
                      : 'text-slate-600 hover:text-teal-600'
                  }`}
                >
                  Payments
                </button>
              </>
            )}
          </nav>
        ) : (
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                activeTab === 'landing' ? 'text-teal-600' : 'text-slate-600 hover:text-teal-600'
              }`}
            >
              Overview
            </button>
            <button
              id="auth-trigger"
              onClick={() => setActiveTab('login')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              Trainee Login
            </button>
          </div>
        )}

        {/* Profile Card Info Box */}
        {currentUser && (
          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4 py-1.5 shrink-0">
            <img 
              referrerPolicy="no-referrer"
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'} 
              className="w-10 h-10 rounded-full border-2 border-teal-500 object-cover" 
              alt={currentUser.name}
            />
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight block truncate max-w-[120px]">
                {currentUser.name}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-center mt-1 w-max ${
                currentUser.role === UserRole.TRAINER 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-teal-100 text-teal-700 border border-teal-200'
              }`}>
                {currentUser.role === UserRole.TRAINER ? 'Coach Profile' : 'Trainee Active'}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
