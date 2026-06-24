import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Award, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Lock, 
  Star,
  Users,
  Activity,
  Check,
  Upload,
  Eye,
  FileText,
  KeyRound,
  ChevronRight,
  TrendingUp,
  X,
  CreditCard,
  Building,
  Save,
  MessageSquare
} from 'lucide-react';
import { TrainerProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from './PageHeader';

interface TrainerProfilePageProps {
  trainerProfile: TrainerProfile;
  onUpdateProfile: (updated: TrainerProfile) => void;
}

export default function TrainerProfilePage({ trainerProfile, onUpdateProfile }: TrainerProfilePageProps) {
  const [profile, setProfile] = useState<TrainerProfile>(trainerProfile);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'packages' | 'analytics' | 'settings'>('overview');
  
  // States
  const [bioInput, setBioInput] = useState(
    trainerProfile.bio || "Helping busy professionals improve strength, mobility and sustainable fitness habits."
  );
  const [viewDocName, setViewDocName] = useState<string | null>(null);
  const [showDocManager, setShowDocManager] = useState(false);
  const [securityExpanded, setSecurityExpanded] = useState(false);

  // Specializations State
  const [specializations, setSpecializations] = useState([
    { name: 'Strength Training', checked: true },
    { name: 'Weight Loss', checked: true },
    { name: 'Sports Performance', checked: true },
    { name: 'Rehabilitation', checked: true },
    { name: 'Yoga', checked: false },
    { name: 'Pilates', checked: false },
    { name: 'Running Coach', checked: false },
    { name: 'Martial Arts', checked: false },
  ]);

  // Coaching Packages State
  const [packages, setPackages] = useState([
    { id: 'pkg_1', name: 'Single Session', price: 80, sessions: 1, clients: 1 },
    { id: 'pkg_2', name: '4 Classes Per Month', price: 310, sessions: 4, clients: 2 },
    { id: 'pkg_3', name: '8 Classes Per Month', price: 600, sessions: 8, clients: 5 },
  ]);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageNameInput, setPackageNameInput] = useState('');
  const [packagePriceInput, setPackagePriceInput] = useState(0);
  const [packageSessionInput, setPackageSessionInput] = useState(4);
  const [packageClientsInput, setPackageClientsInput] = useState(2);
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  // Availability Settings
  const [availableDays, setAvailableDays] = useState({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: false,
  });

  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    { id: 'slot_1', label: '08:00 AM', active: true },
    { id: 'slot_2', label: '10:00 AM', active: true },
    { id: 'slot_3', label: '12:00 PM', active: true },
    { id: 'slot_4', label: '02:00 PM', active: true },
    { id: 'slot_5', label: '04:00 PM', active: true },
    { id: 'slot_6', label: '06:00 PM', active: true },
  ]);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  // Settings states
  const [email, setEmail] = useState(
    trainerProfile.userId === 'tr_sarah' || trainerProfile.userId === 'u_sarah' 
      ? 'sarah@coachtrack.my' 
      : 'coach@coachtrack.my'
  );
  const [phone, setPhone] = useState("+60 12-345 6789");
  const [locationStr, setLocationStr] = useState(trainerProfile.location || "Subang Jaya, Selangor");
  const [password, setPassword] = useState("••••••••••••");
  const [twoFactor, setTwoFactor] = useState(true);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Save Action
  const handleSaveBioAndProfile = async () => {
    const updated = {
      ...profile,
      bio: bioInput,
      location: locationStr,
    };
    try {
      const res = await fetch(`/api/trainers/${profile.id}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const saved = await res.json();
        setProfile(saved);
        onUpdateProfile(saved);
        triggerToast("Professional biography updated! ✓");
      } else {
        onUpdateProfile(updated);
        triggerToast("Biography saved in local context. ✓");
      }
    } catch {
      onUpdateProfile(updated);
      triggerToast("Biography updated successfully. ✓");
    }
  };

  const toggleSpecialization = (index: number) => {
    const next = [...specializations];
    next[index].checked = !next[index].checked;
    setSpecializations(next);
    triggerToast(`Specializations checklist updated!`);
  };

  const handleAddPackage = () => {
    if (!packageNameInput) return;
    const newPkg = {
      id: 'pkg_' + Date.now(),
      name: packageNameInput,
      price: packagePriceInput,
      sessions: packageSessionInput,
      clients: packageClientsInput
    };
    setPackages([...packages, newPkg]);
    setPackageNameInput('');
    setPackagePriceInput(0);
    setPackageSessionInput(4);
    setPackageClientsInput(0);
    setIsAddingPackage(false);
    triggerToast(`Created package plan: ${newPkg.name} ✓`);
  };

  const handleRemovePackage = (id: string, name: string) => {
    setPackages(packages.filter(p => p.id !== id));
    triggerToast(`Removed package plan: ${name}`);
  };

  const startEditPackage = (pkg: any) => {
    setEditingPackageId(pkg.id);
    setPackageNameInput(pkg.name);
    setPackagePriceInput(pkg.price);
    setPackageSessionInput(pkg.sessions);
    setPackageClientsInput(pkg.clients || 0);
  };

  const handleSaveEditedPackage = () => {
    setPackages(packages.map(p => {
      if (p.id === editingPackageId) {
        return {
          ...p,
          name: packageNameInput,
          price: packagePriceInput,
          sessions: packageSessionInput,
          clients: packageClientsInput
        };
      }
      return p;
    }));
    setEditingPackageId(null);
    setPackageNameInput('');
    setPackagePriceInput(0);
    setPackageSessionInput(4);
    setPackageClientsInput(0);
    triggerToast("Package details adjusted successfully! ✓");
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev => ({
      ...prev,
      [day as keyof typeof availableDays]: !prev[day as keyof typeof availableDays]
    }));
    triggerToast(`Availability toggled for ${day}`);
  };

  const toggleTimeActive = (id: string) => {
    setAvailableTimeSlots(prev => prev.map(s => {
      if (s.id === id) return { ...s, active: !s.active };
      return s;
    }));
    triggerToast("Time slot availability synced.");
  };

  const addTimeSlot = (label: string) => {
    setAvailableTimeSlots(prev => prev.map(s => {
      if (s.label === label) return { ...s, active: true };
      return s;
    }));
    triggerToast(`Added coaching slot: ${label} ✓`);
  };

  const removeTimeSlot = (id: string, label: string) => {
    setAvailableTimeSlots(prev => prev.map(s => {
      if (s.id === id) return { ...s, active: false };
      return s;
    }));
    triggerToast(`Removed coaching slot: ${label}`);
  };

  const activeDaysCount = Object.values(availableDays).filter(Boolean).length;
  const activeSlotsCount = availableTimeSlots.filter(s => s.active).length;
  const weeklyCapacity = activeDaysCount * activeSlotsCount;

  return (
    <div className="w-full bg-[#FAFCFF] min-h-screen pb-20 pt-0 text-[#081F5C] animate-fade-in text-left font-sans">
      <PageHeader 
        title="Profile" 
        subtitle="Manage your coaching profile and business settings" 
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#081F5C] border border-[#13D4C8] text-white font-bold px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#13D4C8]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* PROFILE BANNER / HEADER */}
        <div id="trainer-profile-header-card" className="relative bg-[#081F5C] text-white rounded-[24px] p-6 md:p-8 shadow-md overflow-hidden mb-6 border border-slate-800">
          <div className="absolute right-0 top-0 w-80 h-80 bg-[#13D4C8]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-[#5B5FEF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
              {/* Profile image with upload hover trigger */}
              <div className="relative group cursor-pointer shrink-0">
                <img 
                  referrerPolicy="no-referrer"
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'} 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-3 border-[#13D4C8]/40 shadow-md"
                  alt={profile.name}
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center text-[10px] font-black uppercase text-[#13D4C8]">
                  <Upload className="w-4 h-4 mb-0.5 text-[#13D4C8]" />
                  Replace
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const fakeUrl = URL.createObjectURL(e.target.files[0]);
                        setProfile(prev => ({ ...prev, avatarUrl: fakeUrl }));
                        triggerToast("Photo updated! ✓");
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Bio & Details Header */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">{profile.name}</h2>
                  <span className="bg-[#13D4C8] text-[#081F5C] font-black text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-[#13D4C8]">
                  {profile.discipline} • {profile.location}
                </p>

                {/* Rating & Experience */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-2xs md:text-xs text-slate-350">
                  <span className="flex items-center gap-1 bg-slate-900/40 px-2.5 py-1 rounded-full border border-slate-700/30">
                    ⭐ <strong className="text-amber-400">{profile.rating || 4.8}</strong> / 5.0 Rating
                  </span>
                  <span className="flex items-center gap-1 bg-slate-900/40 px-2.5 py-1 rounded-full border border-slate-700/30">
                    Experience: <strong>{profile.experienceYears || 5} Years</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Subscriptions info */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 p-3.5 rounded-2xl w-full sm:w-auto shrink-0 flex justify-around sm:flex-col gap-2.5 text-center sm:text-left">
              <div>
                <span className="block text-[9px] font-black uppercase text-slate-300 tracking-wider">Plan Class Status</span>
                <span className="text-sm font-extrabold text-[#13D4C8]">Coach Growth Tier</span>
              </div>
              <div className="border-l sm:border-l-0 sm:border-t border-white/10 pl-3 sm:pl-0 sm:pt-2">
                <span className="block text-[9px] font-black uppercase text-slate-300 tracking-wider">Coach Area ID</span>
                <span className="text-xs font-mono font-bold text-white">#MY_721_SARAH</span>
              </div>
            </div>

          </div>
        </div>

        {/* PREMIUM MODERN SEGMENTED TABS BAR */}
        <div id="trainer-profile-tabs" className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-sm mb-6 flex flex-row items-center justify-between gap-1 w-full relative sm:overflow-visible overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`flex-1 text-center py-2.5 px-3 sm:px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'overview' 
                ? 'bg-[#081F5C] text-white shadow-sm font-black' 
                : 'text-slate-550 hover:bg-slate-100 hover:text-[#081F5C]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('packages')}
            className={`flex-1 text-center py-2.5 px-3 sm:px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'packages' 
                ? 'bg-[#081F5C] text-white shadow-sm font-black' 
                : 'text-slate-550 hover:bg-slate-100 hover:text-[#081F5C]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Packages</span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex-1 text-center py-2.5 px-3 sm:px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'analytics' 
                ? 'bg-[#081F5C] text-white shadow-sm font-black' 
                : 'text-slate-550 hover:bg-slate-100 hover:text-[#081F5C]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Business Analytics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex-1 text-center py-2.5 px-3 sm:px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSubTab === 'settings' 
                ? 'bg-[#081F5C] text-white shadow-sm font-black' 
                : 'text-slate-550 hover:bg-slate-100 hover:text-[#081F5C]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* TAB PANES */}
        <div id="trainer-profile-tab-content" className="space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Coach Performance KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div id="kpi-card-rating" className="bg-white p-3 sm:p-4.5 rounded-[16px] sm:rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition duration-300">
                  <div className="text-sm sm:text-base md:text-lg font-black text-amber-500 flex items-center gap-1 select-none">
                    ⭐ <span className="text-slate-900">4.8 / 5.0</span>
                  </div>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-1.5 sm:mt-2">
                    Coach Rating
                  </span>
                </div>

                <div id="kpi-card-clients" className="bg-white p-3 sm:p-4.5 rounded-[16px] sm:rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition duration-300">
                  <div className="text-sm sm:text-base md:text-lg font-black text-slate-900 flex items-center gap-1.5 select-none">
                    👥 <span className="text-slate-900">8</span>
                  </div>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-1.5 sm:mt-2">
                    Active Clients
                  </span>
                </div>

                <div id="kpi-card-goals" className="bg-white p-3 sm:p-4.5 rounded-[16px] sm:rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition duration-300">
                  <div className="text-sm sm:text-base md:text-lg font-black text-[#13D4C8] flex items-center gap-1 text-[#081F5C] select-none">
                    🎯 <span className="text-slate-900">88%</span>
                  </div>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-1.5 sm:mt-2">
                    Goal Completion Rate
                  </span>
                </div>

                <div id="kpi-card-retention" className="bg-white p-3 sm:p-4.5 rounded-[16px] sm:rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition duration-300">
                  <div className="text-sm sm:text-base md:text-lg font-black text-[#5B5FEF] flex items-center gap-1 select-none">
                    🔄 <span className="text-slate-900">89%</span>
                  </div>
                  <span className="block text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mt-1.5 sm:mt-2">
                    Client Retention
                  </span>
                </div>
              </div>

              {/* AI Coach Insights Card */}
              <div id="ai-insights-premium-card" className="relative bg-[#081F5C] text-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 border border-slate-800 shadow-lg overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-[#13D4C8]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3 text-[#13D4C8] border-b border-white/10 pb-2 sm:pb-2.5 select-none">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#13D4C8]" />
                  <span className="text-[10px] sm:text-2xs font-extrabold uppercase tracking-widest block">
                    ✨ CoachAI Analysis
                  </span>
                </div>
                <div className="space-y-2 text-[11px] sm:text-xs text-slate-100">
                  <p className="font-semibold text-[#13D4C8]">
                    Your clients maintain a <span className="underline">92%</span> attendance rate.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5 text-[10px] sm:text-2xs text-slate-300">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="block text-slate-450 uppercase font-bold text-[9px] sm:text-3xs">Most successful package</span>
                      <strong className="text-white font-black text-[11px] sm:text-xs">8 Classes Per Month</strong>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <span className="block text-slate-450 uppercase font-bold text-[9px] sm:text-3xs">Peak booking days</span>
                      <strong className="text-white font-black text-[11px] sm:text-xs">Tuesday and Thursday</strong>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5 col-span-1 sm:col-span-2">
                      <span className="block text-slate-450 uppercase font-bold text-[9px] sm:text-3xs">Available coaching capacity</span>
                      <strong className="text-white font-black text-[11px] sm:text-xs">3 remaining slots weekly</strong>
                    </div>
                  </div>

                  <div className="bg-[#13D4C8]/10 border border-[#13D4C8]/25 p-2.5 sm:p-3 rounded-xl mt-2.5 text-[10px] sm:text-2xs text-slate-100">
                    <strong className="text-[#13D4C8] block text-[9px] sm:text-3xs uppercase font-black mb-0.5">Recommendation</strong>
                    Promote a beginner weight-loss package to increase monthly revenue streams.
                  </div>
                </div>
              </div>

              {/* Coach Biography */}
              <div id="overview-biography-section" className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 border border-slate-200/80 shadow-sm text-left">
                <div className="flex flex-row items-center justify-between gap-2 mb-2.5 sm:mb-3 border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-[#081F5C] text-[11px] sm:text-xs tracking-wider uppercase font-sans">
                    Professional Biography
                  </h3>
                  <button 
                    onClick={handleSaveBioAndProfile}
                    className="bg-[#081F5C] hover:bg-slate-900 text-white hover:text-white text-[9px] sm:text-3xs font-black px-2.5 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 transition shadow-sm border border-transparent shrink-0"
                  >
                    <Save className="w-3 h-3 text-[#13D4C8]" /> Save Changes
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] sm:text-xs text-slate-700 focus:outline-[#13D4C8] font-bold leading-relaxed"
                  placeholder="Describe your expertise, focus areas, and coaching experiences..."
                />
              </div>

              {/* Specializations Category Chips */}
              <div id="overview-specializations-section" className="bg-white rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 border border-slate-200/80 shadow-sm text-left">
                <h3 className="font-extrabold text-[#081F5C] text-[11px] sm:text-xs tracking-wider uppercase font-sans mb-1 pb-1">
                  Core Specializations
                </h3>
                <p className="text-[10px] sm:text-[11px] font-normal text-slate-500 mb-3 sm:mb-4">Tick disciplines displayed to trainees in your public discoverable profile.</p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {specializations.map((spec, idx) => (
                    <button
                      key={spec.name}
                      onClick={() => toggleSpecialization(idx)}
                      className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] md:text-[13px] font-medium transition-all duration-200 flex items-center gap-1 sm:gap-1.5 cursor-pointer select-none border ${
                        spec.checked 
                          ? 'bg-[#13D4C8]/5 border-[#13D4C8] text-[#081F5C] font-semibold' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span className={spec.checked ? 'text-[#13D4C8]' : 'text-slate-350'}>{spec.checked ? '✔' : '○'}</span>
                      <span>{spec.name}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PACKAGES */}
          {activeSubTab === 'packages' && (
            <div id="packages-sub-tab" className="space-y-6 animate-fade-in text-left">
              
              <div className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 shadow-sm">
                <div className="flex flex-row items-center justify-between gap-2 mb-3.5 sm:mb-4 border-b border-slate-100 pb-2.5 sm:pb-3">
                  <div>
                    <h3 className="font-sans font-black text-[#081F5C] text-xs sm:text-sm uppercase tracking-wider">
                      Manage Coaching Packages
                    </h3>
                    <p className="text-[10px] sm:text-3xs text-slate-400 font-bold mt-0.5">Customize tier pricing models synced dynamically to invoices.</p>
                  </div>
                  {!isAddingPackage && (
                    <button 
                      onClick={() => {
                        setIsAddingPackage(true);
                        setEditingPackageId(null);
                        setPackageNameInput('');
                        setPackagePriceInput(100);
                        setPackageSessionInput(4);
                        setPackageClientsInput(0);
                      }}
                      className="bg-[#081F5C] hover:bg-slate-900 text-white font-extrabold text-[9px] sm:text-3xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm transition-all shrink-0"
                    >
                      <Plus className="w-3 h-3 text-[#13D4C8]" /> Add Package
                    </button>
                  )}
                </div>

                {/* Inline Editing & Adding package Form */}
                {(isAddingPackage || editingPackageId) && (
                  <div className="bg-slate-50/70 border border-slate-200 p-3 sm:p-4.5 rounded-2xl mb-4 sm:mb-5 space-y-3 sm:space-y-4">
                    <h4 className="font-extrabold text-[#081F5C] text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-between">
                      <span>{editingPackageId ? '✏ Edit Package Plan' : '🆕 Add Standard Package'}</span>
                      <button 
                        onClick={() => {
                          setIsAddingPackage(false);
                          setEditingPackageId(null);
                        }} 
                        className="text-slate-450 hover:text-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                      <div>
                        <label className="block text-[9px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Package Name
                        </label>
                        <input 
                          type="text" 
                          value={packageNameInput}
                          onChange={(e) => setPackageNameInput(e.target.value)}
                          placeholder="e.g. 12 Classes Pack"
                          className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-2xs focus:ring-1 focus:ring-[#13D4C8] font-bold text-[#081F5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Monthly Price (RM)
                        </label>
                        <input 
                          type="number" 
                          value={packagePriceInput}
                          onChange={(e) => setPackagePriceInput(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-2xs focus:ring-1 focus:ring-[#13D4C8] font-bold text-[#081F5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Classes Included
                        </label>
                        <input 
                          type="number" 
                          value={packageSessionInput}
                          onChange={(e) => setPackageSessionInput(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-2xs focus:ring-1 focus:ring-[#13D4C8] font-bold text-[#081F5C]"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Active Trainees
                        </label>
                        <input 
                          type="number" 
                          value={packageClientsInput}
                          onChange={(e) => setPackageClientsInput(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-[11px] sm:text-2xs focus:ring-1 focus:ring-[#13D4C8] font-bold text-[#081F5C]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/50">
                      <button
                        onClick={() => {
                          setIsAddingPackage(false);
                          setEditingPackageId(null);
                        }}
                        className="px-2.5 py-1.5 border border-slate-250 bg-white rounded-lg sm:rounded-xl text-[10px] sm:text-3xs font-extrabold hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={editingPackageId ? handleSaveEditedPackage : handleAddPackage}
                        className="bg-[#081F5C] text-white font-extrabold text-[10px] sm:text-3xs px-3 py-1.5 rounded-lg sm:rounded-xl cursor-pointer shadow-sm"
                      >
                        {editingPackageId ? 'Update Plan' : 'Confirm Package'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Grid layout of active packages as requested */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {packages.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      className="bg-white border border-slate-200/90 rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 flex flex-col justify-between hover:shadow-2xs hover:border-[#13D4C8]/50 transition-all duration-300"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[8px] sm:text-[9px] font-black uppercase text-[#5B5FEF] bg-[#5B5FEF]/5 border border-[#5B5FEF]/10 px-2 py-0.5 rounded-full">
                            {pkg.sessions} {pkg.sessions === 1 ? 'Session' : 'Classes'}
                          </span>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => startEditPackage(pkg)}
                              className="text-slate-400 hover:text-[#081F5C] p-1 rounded-lg hover:bg-slate-50 transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleRemovePackage(pkg.id, pkg.name)}
                              className="text-rose-450 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-50/50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-[#081F5C] text-xs sm:text-sm leading-tight font-sans">
                          {pkg.name}
                        </h4>
                        
                        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold mt-1">
                          💼 {pkg.clients || 0} active {pkg.clients === 1 ? 'client uses' : 'clients use'} this tier
                        </p>
                      </div>

                      <div className="border-t border-slate-100/80 pt-2.5 mt-2.5 flex justify-between items-center bg-white select-none">
                        <span className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider">Fee Cost</span>
                        <strong className="text-xs sm:text-sm font-black text-[#081F5C]">
                          RM {pkg.price}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Popularity Section */}
              <div id="package-popularity-insight" className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 shadow-sm text-left">
                <h3 className="font-sans font-black text-[#081F5C] text-xs uppercase tracking-wider flex items-center gap-1.5 mb-0.5 pb-0.5">
                  <span>📈 Package Popularity & Distribution</span>
                </h3>
                <p className="text-[10px] sm:text-3xs text-slate-400 font-bold mb-3">Client distribution across configured subscriptions.</p>

                <div className="space-y-2.5 pt-1">
                  
                  {/* Dynamic Popularity List mapped representing the real state data */}
                  {packages.map((pkg) => {
                    const maxClients = Math.max(...packages.map(p => p.clients || 1), 1);
                    const percentage = Math.max(10, Math.min(100, Math.floor(((pkg.clients || 0) / maxClients) * 100)));
                    return (
                      <div key={pkg.id} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] sm:text-3xs font-black tracking-widest text-[#081F5C] uppercase">
                          <span className="font-extrabold">{pkg.name}</span>
                          <span className="text-[#13D4C8]">{pkg.clients || 0} {pkg.clients === 1 ? 'Client' : 'Clients'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 sm:h-3 rounded-full overflow-hidden flex items-center relative border border-slate-200/50">
                          <div 
                            style={{ width: `${percentage}%` }} 
                            className="bg-gradient-to-r from-[#081F5C] to-[#13D4C8] h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BUSINESS ANALYTICS */}
          {activeSubTab === 'analytics' && (
            <div id="analytics-sub-tab" className="space-y-6 animate-fade-in text-left">
              
              {/* Analytics KPI rows */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div id="revenue-card" className="bg-white p-4 rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                    Revenue This Month
                  </span>
                  <div className="text-base sm:text-lg font-black text-slate-900 select-none">
                    RM 910
                  </div>
                </div>

                <div id="forecast-card" className="bg-white p-4 rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                    Revenue Forecast
                  </span>
                  <div className="text-base sm:text-lg font-black text-indigo-700 select-none">
                    RM 1240
                  </div>
                </div>

                <div id="sessions-card" className="bg-white p-4 rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                    Active Clients
                  </span>
                  <div className="text-base sm:text-lg font-black text-[#13D4C8] select-none">
                    8 Members
                  </div>
                </div>

                <div id="workouts-card" className="bg-white p-4 rounded-[24px] border border-slate-200/80 shadow-3xs hover:shadow-2xs transition">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                    Sessions Completed
                  </span>
                  <div className="text-base sm:text-lg font-black text-[#5B5FEF] select-none">
                    148 Classes
                  </div>
                </div>
              </div>

              {/* Charts grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Revenue trend line chart with smooth curves */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-[#081F5C] text-xs uppercase tracking-wider mb-0.5 font-sans flex items-center gap-1">
                      <span>📈 Revenue Trend</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase">Monthly gross income (Jan - Jun)</p>
                  </div>

                  <div className="bg-slate-50/60 border border-slate-150/60 rounded-2xl p-4.5 relative w-full h-auto">
                    {/* Professional Modern Responsive SVG */}
                    <svg className="w-full h-auto overflow-visible" viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="revenue-grad-new" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#13D4C8" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#13D4C8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Subtle Grid Lines & Y-Axis Labels */}
                      <line x1="65" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">RM 1200</text>

                      <line x1="65" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="64" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">RM 900</text>

                      <line x1="65" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="104" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">RM 600</text>

                      <line x1="65" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="144" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">RM 300</text>

                      <line x1="65" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />
                      <text x="12" y="184" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">RM 0</text>

                      {/* Filled Area beneath the curve */}
                      <path 
                        d="M 65,113 C 105,105 105,105 148,97 C 190,89 190,81 231,76 C 272,71 272,71 314,68 C 355,65 355,60 397,57 C 438,54 438,59 480,59 L 480,180 L 65,180 Z" 
                        fill="url(#revenue-grad-new)" 
                      />

                      {/* Smooth curved path */}
                      <path 
                        d="M 65,113 C 105,105 105,105 148,97 C 190,89 190,81 231,76 C 272,71 272,71 314,68 C 355,65 355,60 397,57 C 438,54 438,59 480,59" 
                        fill="none" 
                        stroke="#081F5C" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                      />

                      {/* Plot Points & Value Labels (Perfect contrast & spacing) */}
                      <circle cx="65" cy="113" r="4.5" fill="#13D4C8" stroke="#081F5C" strokeWidth="1.5" />
                      <text x="65" y="96" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">RM500</text>

                      <circle cx="148" cy="97" r="4.5" fill="#13D4C8" stroke="#081F5C" strokeWidth="1.5" />
                      <text x="148" y="80" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">RM620</text>

                      <circle cx="231" cy="76" r="4.5" fill="#13D4C8" stroke="#081F5C" strokeWidth="1.5" />
                      <text x="231" y="59" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">RM780</text>

                      <circle cx="314" cy="68" r="4.5" fill="#13D4C8" stroke="#081F5C" strokeWidth="1.5" />
                      <text x="314" y="51" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">RM840</text>

                      <circle cx="397" cy="57" r="4.5" fill="#13D4C8" stroke="#081F5C" strokeWidth="1.5" />
                      <text x="397" y="40" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">RM920</text>

                      <circle cx="480" cy="59" r="4.5" fill="#13D4C8" stroke="#081F5C" strokeWidth="1.5" />
                      <text x="480" y="42" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">RM910</text>

                      {/* X-Axis Labels (Perfect spacing, clean horizontal layout) */}
                      <text x="65" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Jan</text>
                      <text x="148" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Feb</text>
                      <text x="231" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Mar</text>
                      <text x="314" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Apr</text>
                      <text x="397" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">May</text>
                      <text x="480" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Jun</text>
                    </svg>
                  </div>
                </div>

                {/* 2. Client growth area chart */}
                <div className="bg-white p-5 rounded-[24px] border border-slate-200/80 shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-[#081F5C] text-xs uppercase tracking-wider mb-0.5 font-sans flex items-center gap-1">
                      <span>👥 Client Growth</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase">Active signed trainees (Jan - Jun)</p>
                  </div>

                  <div className="bg-slate-50/60 border border-slate-150/60 rounded-2xl p-4.5 relative w-full h-auto">
                    {/* Modern Clean Responsive Area SVG */}
                    <svg className="w-full h-auto overflow-visible" viewBox="0 0 500 220" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="client-grad-new" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#13D4C8" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#13D4C8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Subtle Grid Lines & Y-Axis Scale */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">12</text>

                      <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="64" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">9</text>

                      <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="104" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">6</text>

                      <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeDasharray="4,4" strokeWidth="1" />
                      <text x="12" y="144" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">3</text>

                      <line x1="40" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />
                      <text x="12" y="184" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">0</text>

                      {/* Filled Area below the trend line */}
                      <path 
                        d="M 40,127 L 128,100 L 216,73 L 304,73 L 392,47 L 480,20 L 480,180 L 40,180 Z" 
                        fill="url(#client-grad-new)" 
                      />

                      {/* Crisp Area boundary line */}
                      <path 
                        d="M 40,127 L 128,100 L 216,73 L 304,73 L 392,47 L 480,20" 
                        fill="none" 
                        stroke="#13D4C8" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data Points with clear clean Value labels */}
                      <circle cx="40" cy="127" r="4.5" fill="#ffffff" stroke="#13D4C8" strokeWidth="2" />
                      <text x="40" y="112" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">4</text>

                      <circle cx="128" cy="100" r="4.5" fill="#ffffff" stroke="#13D4C8" strokeWidth="2" />
                      <text x="128" y="85" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">6</text>

                      <circle cx="216" cy="73" r="4.5" fill="#ffffff" stroke="#13D4C8" strokeWidth="2" />
                      <text x="216" y="58" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">8</text>

                      <circle cx="304" cy="73" r="4.5" fill="#ffffff" stroke="#13D4C8" strokeWidth="2" />
                      <text x="304" y="58" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">8</text>

                      <circle cx="392" cy="47" r="4.5" fill="#ffffff" stroke="#13D4C8" strokeWidth="2" />
                      <text x="392" y="32" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">10</text>

                      <circle cx="480" cy="20" r="5.5" fill="#13D4C8" stroke="#081F5C" strokeWidth="2" />
                      <text x="480" y="10" fill="#081F5C" fontSize="10" fontWeight="extrabold" textAnchor="middle">12</text>

                      {/* X-Axis Month names perfectly spaced and centered */}
                      <text x="40" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Jan</text>
                      <text x="128" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Feb</text>
                      <text x="216" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Mar</text>
                      <text x="304" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Apr</text>
                      <text x="392" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">May</text>
                      <text x="480" y="206" fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">Jun</text>
                    </svg>
                  </div></div>

              </div>

              {/* AI Forecast card */}
              <div id="ai-revenue-forecast" className="bg-[#081F5C] text-white p-5 rounded-[24px] border border-slate-800 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-[#5B5FEF]/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-1.5 mb-2.5 text-[#13D4C8] border-b border-white/10 pb-2 select-none">
                  <Sparkles className="w-4 h-4 fill-[#13D4C8]" />
                  <span className="text-2xs font-extrabold uppercase tracking-widest block font-sans">
                    🤖 CoachAI Analysis
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-slate-205 leading-relaxed">
                    Based on current package sales, projected July revenue: <span className="text-[#13D4C8] font-black underline">RM 1240 (+36%)</span>
                  </p>
                  <p className="text-slate-300">
                    Expected new organic clients: <strong className="text-white">2 in active pipeline</strong>
                  </p>
                  
                  <div className="bg-[#13D4C8]/10 border border-[#13D4C8]/20 p-2.5 rounded-xl text-2xs text-[#13D4C8] mt-1.5 inline-block font-sans">
                    💡 <strong className="font-extrabold">Recommended Promotion:</strong> Launch the "4-Class Starter Package" to sub-segments.
                  </div>
                </div>
              </div>

              {/* Verified Client Testimonials - Keep only latest 3 as requested */}
              <div id="testimonials-section" className="bg-white border border-slate-200/85 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5 shadow-sm">
                <div className="border-b border-slate-100 pb-2 mb-3 flex justify-between items-center select-none">
                  <h3 className="font-sans font-black text-[#081F5C] text-[11px] sm:text-xs uppercase tracking-wider">
                    ⭐ Client Testimonials
                  </h3>
                  <span className="text-[9px] sm:text-[9px] text-slate-400 font-extrabold uppercase">3 verified reviews</span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-150 text-[11px] sm:text-xs text-left">
                    <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                      <strong className="text-slate-800 text-[10px] sm:text-2xs">Ahmad Bin Ibrahim</strong>
                      <span className="text-[#13D4C8] text-[9px] sm:text-2xs select-none">⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="text-[10px] sm:text-2xs text-slate-600 italic">
                      "Sarah helped improve my flexibility and reduced my lower back pain."
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-150 text-[11px] sm:text-xs text-left">
                    <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                      <strong className="text-slate-800 text-[10px] sm:text-2xs">Mei Ling Tan</strong>
                      <span className="text-[#13D4C8] text-[9px] sm:text-2xs select-none">⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="text-[10px] sm:text-2xs text-slate-600 italic">
                      "Extremely attentive and structured coaching. The post-workout rehabilitation is perfect!"
                    </p>
                  </div>

                  <div className="p-2.5 sm:p-3.5 rounded-xl bg-slate-50/70 border border-slate-150 text-[11px] sm:text-xs text-left">
                    <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                      <strong className="text-slate-800 text-[10px] sm:text-2xs">Muhammad Faizul</strong>
                      <span className="text-[#13D4C8] text-[9px] sm:text-2xs select-none">⭐⭐⭐⭐⭐</span>
                    </div>
                    <p className="text-[10px] sm:text-2xs text-slate-600 italic">
                      "Very supportive with daily nutrition log audits. Meal plans are highly focused and practical."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeSubTab === 'settings' && (
            <div id="settings-sub-tab" className="space-y-6 animate-fade-in text-left">
              
              {/* Availability Days */}
              <div className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 shadow-sm">
                <h3 className="font-sans font-black text-[#081F5C] text-xs uppercase tracking-wider mb-1 pb-1">
                  📅 Available Days
                </h3>
                <p className="text-[14px] font-medium text-slate-400 leading-[1.4] mb-3 sm:mb-4">Trainees can only book sessions during enabled days.</p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {Object.keys(availableDays).map((day) => {
                    const isActive = availableDays[day as keyof typeof availableDays];
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-[13px] font-medium transition-all duration-200 flex items-center justify-between gap-1.5 select-none border cursor-pointer min-w-[70px] sm:min-w-[85px] ${
                          isActive 
                            ? 'bg-white border-[#17D4C3] text-[#081F5C] font-semibold' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <span className={isActive ? 'text-[#17D4C3] font-bold' : 'text-slate-400 font-bold'}>
                          {isActive ? '✔' : '✖'}
                        </span>
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coaching Time Slots list */}
              <div className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 shadow-sm space-y-4 sm:space-y-5">
                <div className="flex flex-row items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
                  <div className="space-y-0.5 text-left">
                    <h3 className="font-sans font-black text-[#081F5C] text-xs uppercase tracking-wider flex items-center gap-1 matches-theme">
                      <Clock className="w-3.5 h-3.5 text-[#13D4C8]" />
                      <span>⏰ Coaching Slots</span>
                    </h3>
                    <p className="text-[14px] font-medium text-slate-400 leading-[1.4]">Configure standard daily timeslot availability intervals.</p>
                  </div>

                  <button
                    onClick={() => setIsSlotModalOpen(true)}
                    className="flex items-center justify-center gap-1 bg-[#081F5C] text-[#13D4C8] hover:bg-slate-900 text-[9px] sm:text-[10px] font-black uppercase tracking-widest py-1.5 px-2.5 sm:py-2 sm:px-3 border border-transparent rounded-xl cursor-pointer transition shadow-3xs shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Slot</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-left">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selected Slots</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {availableTimeSlots.filter(s => s.active).map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-1.5 bg-[#13D4C8]/10 border border-[#13D4C8]/30 hover:border-[#081F5C] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-[#081F5C] transition-all select-none"
                      >
                        <span className="text-[#13D4C8] font-bold">✓</span>
                        <span className="font-sans">{slot.label}</span>
                        <button
                          onClick={() => removeTimeSlot(slot.id, slot.label)}
                          className="text-[#081F5C]/60 hover:text-red-500 font-bold ml-0.5 transition-colors focus:outline-none cursor-pointer"
                          title={`Remove ${slot.label}`}
                        >
                          <X className="w-2.5 h-2.5 text-[#081F5C] hover:text-red-500 shrink-0 inline" />
                        </button>
                      </div>
                    ))}
                    {availableTimeSlots.filter(s => s.active).length === 0 && (
                      <p className="text-[10px] sm:text-3xs text-slate-400 italic">No coaching slots currently active. Click "+ Add Slot" above to activate availability.</p>
                    )}
                  </div>
                </div>

                {/* Summary Capacity metrics */}
                <div className="pt-2.5 border-t border-slate-100/60">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Summary statistics card */}
                    <div className="p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] bg-slate-50/70 border border-slate-150/80 text-left space-y-2">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-black text-slate-400 select-none">
                        <span>Schedule Metrics</span>
                        <span className="text-[#13D4C8] font-black leading-none text-[8px] sm:text-[9px]">● Active</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <div className="text-center p-1.5 sm:p-2 rounded-xl bg-white border border-slate-150 shadow-3xs">
                          <span className="block text-sm sm:text-base font-black text-[#081F5C] leading-none">{activeDaysCount}</span>
                          <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Active Days</span>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 rounded-xl bg-white border border-slate-150 shadow-3xs">
                          <span className="block text-sm sm:text-base font-black text-[#081F5C] leading-none">{activeSlotsCount}</span>
                          <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Active Slots</span>
                        </div>
                        <div className="text-center p-1.5 sm:p-2 rounded-xl bg-white border border-slate-150 shadow-3xs">
                          <span className="block text-sm sm:text-base font-black text-[#13D4C8] leading-none">{weeklyCapacity}</span>
                          <span className="text-[8px] sm:text-[9px] text-slate-450 font-bold uppercase tracking-wider block mt-1 max-w-[80px] mx-auto text-ellipsis overflow-hidden">Capacity</span>
                        </div>
                      </div>
                    </div>

                    {/* CoachAI Schedule Insight card */}
                    <div className="p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] bg-[#081F5C] text-white relative overflow-hidden flex flex-col justify-between border border-slate-800 text-left min-h-[85px] sm:min-h-[90px]">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-[#13D4C8]/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center gap-1 text-[9px] font-black text-[#13D4C8] uppercase tracking-wider mb-1 z-10 select-none">
                        <Sparkles className="w-3 h-3 fill-[#13D4C8]" />
                        <span>CoachAI Analysis</span>
                      </div>
                      <p className="text-[10px] text-slate-200 leading-normal font-medium z-10">
                        Current schedule supports approximately <strong className="text-[#13D4C8] font-black">{weeklyCapacity} sessions</strong> weekly. Based on current utilization, there is capacity for 2–3 additional clients.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Status Section with Manage Documents button */}
              <div className="bg-white border border-slate-200/80 rounded-[20px] sm:rounded-[24px] p-4 sm:p-5.5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold leading-none">
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-250 p-1 rounded-full text-[9px] sm:text-3xs">✔</span>
                    <strong className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">Verified Coach</strong>
                  </div>
                  <p className="text-[10px] sm:text-3xs text-slate-500 font-bold">
                    Fitness License Verified • Last Review: <span className="text-[#081F5C]">January 2026</span>
                  </p>
                  <p className="text-[10px] sm:text-3xs text-emerald-600 font-bold">
                    Identity Verification: <span className="underline">Approved</span>
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => setShowDocManager(!showDocManager)}
                    className="bg-[#081F5C] text-[#13D4C8] hover:bg-slate-900 border border-transparent rounded-xl px-3.5 py-2 sm:px-5 sm:py-2.5 text-2xs sm:text-xs font-bold cursor-pointer transition shadow-3xs w-full sm:w-auto text-center"
                  >
                    {showDocManager ? 'Hide Core Documents' : 'Manage Documents'}
                  </button>
                </div>
              </div>

              {/* Manage Documents Hidden block (Expands smoothly) */}
              <AnimatePresence>
                {showDocManager && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-3.5 bg-slate-50/50 p-4 rounded-[20px] border border-slate-200/70"
                  >
                    <div className="flex items-center justify-between text-left pb-1.5 border-b border-slate-200/60 select-none">
                      <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Compliance Files</span>
                      <span className="text-[10px] font-mono font-bold text-[#5B5FEF]">Status: Approved</span>
                    </div>

                    <div className="flex items-center justify-between text-2xs bg-white p-3 rounded-xl border border-slate-150">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-500" />
                        <div>
                          <strong className="block text-slate-900 leading-none">malaysian_fit_license_2026.pdf</strong>
                          <span className="text-3xs text-slate-400 mt-0.5 block">2.1 MB • Signed</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setViewDocName("malaysian_fit_license_2026.pdf")}
                        className="p-1 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-900 text-3xs font-black transition cursor-pointer"
                      >
                        VIEW
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-2xs bg-white p-3 rounded-xl border border-slate-150">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#5B5FEF]" />
                        <div>
                          <strong className="block text-slate-900 leading-none">sarah_id_card_verified.jpg</strong>
                          <span className="text-3xs text-slate-400 mt-0.5 block">880 KB • ID Card Approved</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setViewDocName("sarah_id_card_verified.jpg")}
                        className="p-1 px-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-900 text-3xs font-black transition cursor-pointer"
                      >
                        VIEW
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Security - Collapsed by default */}
              <div className="bg-white border border-slate-200/80 rounded-[24px] p-5.5 shadow-sm">
                <button 
                  onClick={() => setSecurityExpanded(!securityExpanded)}
                  className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
                >
                  <div>
                    <h3 className="font-sans font-black text-[#081F5C] text-xs uppercase tracking-wider">
                      🔐 Security Settings
                    </h3>
                    <p className="text-[14px] font-medium text-[#7C8BA1] mt-0.5">Change password and manage 2-Factor logs.</p>
                  </div>
                  <span className="text-[#081F5C] font-black text-sm select-none">
                    {securityExpanded ? '▲' : '▼'}
                  </span>
                </button>

                <AnimatePresence>
                  {securityExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden pt-5 space-y-4 border-t border-slate-100 mt-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[13px] font-bold tracking-[1px] uppercase text-[#8A99B3] mb-1.5">
                            Professional Email Address
                          </label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-[16px] font-semibold text-[#1F2A44]"
                          />
                        </div>
                        <div>
                          <label className="block text-[13px] font-bold tracking-[1px] uppercase text-[#8A99B3] mb-1.5">
                            Phone Number Contact
                          </label>
                          <input 
                            type="text" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-[16px] font-semibold text-[#1F2A44] font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[13px] font-bold tracking-[1px] uppercase text-[#8A99B3] mb-1.5">
                            Account Secret Password
                          </label>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-[16px] font-semibold text-[#1F2A44]"
                          />
                        </div>

                        <div className="flex items-center justify-between border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-3 select-none">
                          <div>
                            <span className="block text-[13px] font-bold tracking-[1px] uppercase text-[#8A99B3] leading-none mb-1.5">2-Factor (2FA)</span>
                            <span className="text-[11px] text-[#7C8BA1] font-medium block">Verify with OTP code SMS</span>
                          </div>
                          <button
                            onClick={() => {
                              setTwoFactor(!twoFactor);
                              triggerToast(twoFactor ? "2FA authentication paused." : "2FA authentication active! ✓");
                            }}
                            className={`h-[40px] px-5 flex items-center justify-center text-[14px] font-bold rounded-xl cursor-pointer transition select-none tracking-normal ${
                              twoFactor ? 'bg-[#13D4C8] text-[#081F5C]' : 'bg-slate-200 text-[#52607A]'
                            }`}
                          >
                            {twoFactor ? 'Active ✓' : 'Disabled'}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={() => triggerToast("Security setting profiles updated successfully! ✓")}
                          className="bg-[#081F5C] text-[#13D4C8] hover:bg-[#081F5C]/90 border border-transparent rounded-[12px] h-12 px-6 flex items-center justify-center text-[15px] font-bold tracking-[0.5px] cursor-pointer transition shadow-3xs"
                        >
                          Update Security Details
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Verification modal document viewer component */}
      {viewDocName && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-center text-slate-800">
            <h3 className="font-sans font-black text-[#081F5C] text-sm uppercase tracking-wide mb-1.5">
              📄 Secure Document Viewer
            </h3>
            <p className="text-3xs text-slate-405 font-bold mb-4">
              Registered Compliance File: <span className="font-black text-slate-700">{viewDocName}</span>
            </p>
            
            {/* Mock file window overlay */}
            <div className="bg-slate-900/5 border border-slate-203 h-52 rounded-2xl flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-2xl">🔒</p>
                <p className="text-3xs font-black text-slate-700 uppercase tracking-widest mt-3">CoachTrack SECURE DECRYPT</p>
                <p className="text-[10px] text-slate-400 font-semibold max-w-[240px] mt-2 leading-relaxed mx-auto">This document was verified by the CoachTrack MY Auditing Team in January 2026. File authenticity score: Approved.</p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-150 pt-4">
              <button
                onClick={() => setViewDocName(null)}
                className="w-full bg-[#081F5C] hover:bg-slate-900 border border-transparent text-[#13D4C8] text-2xs font-extrabold tracking-widest uppercase py-3 rounded-xl cursor-pointer shadow-md transition"
              >
                Close Compliance Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Picker Modal overlay */}
      <AnimatePresence>
        {isSlotModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#081F5C]/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-left select-none"
            >
              <button 
                onClick={() => setIsSlotModalOpen(false)}
                className="absolute right-4 top-4 hover:bg-slate-150 p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-sans font-black text-[#081F5C] text-sm uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#13D4C8]" />
                <span>Add Coaching Slot</span>
              </h3>
              <p className="text-3xs text-slate-400 font-bold mb-4">
                Select from standard CoachTrack training intervals:
              </p>

              <div className="space-y-2">
                {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((timeLabel) => {
                  const slotObj = availableTimeSlots.find(s => s.label === timeLabel);
                  const isAlreadyActive = slotObj ? slotObj.active : false;

                  return (
                    <button
                      key={timeLabel}
                      disabled={isAlreadyActive}
                      onClick={() => {
                        if (slotObj) {
                          addTimeSlot(timeLabel);
                        }
                        setIsSlotModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-2xs font-extrabold transition-all cursor-pointer ${
                        isAlreadyActive
                          ? 'border-slate-100 bg-slate-50 text-slate-350 cursor-not-allowed'
                          : 'border-slate-200 bg-white text-[#081F5C] hover:border-[#13D4C8] hover:bg-[#13D4C8]/5'
                      }`}
                    >
                      <span className="font-mono tracking-wider">{timeLabel}</span>
                      {isAlreadyActive ? (
                        <span className="text-emerald-500 font-extrabold text-[9px] uppercase tracking-wider flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-500 inline" /> Active ✓
                        </span>
                      ) : (
                        <span className="text-[#13D4C8] text-[9px] font-black uppercase tracking-wider">
                          + Add Slot
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 border-t border-slate-150 pt-4 flex gap-2">
                <button
                  onClick={() => setIsSlotModalOpen(false)}
                  className="w-full bg-[#081F5C] hover:bg-slate-900 border border-transparent text-[#13D4C8] text-2xs font-extrabold tracking-widest uppercase py-2.5 rounded-xl cursor-pointer shadow-md transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
