import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Award, 
  DollarSign, 
  CheckCircle,
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Lock, 
  Bell, 
  Star,
  Users,
  Activity,
  ChevronRight,
  Save,
  Check,
  Eye,
  RefreshCw
} from 'lucide-react';
import { TrainerProfile } from '../types';

interface TrainerProfilePageProps {
  trainerProfile: TrainerProfile;
  onUpdateProfile: (updated: TrainerProfile) => void;
}

export default function TrainerProfilePage({ trainerProfile, onUpdateProfile }: TrainerProfilePageProps) {
  const [profile, setProfile] = useState<TrainerProfile>(trainerProfile);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'packages' | 'business' | 'availability' | 'security'>('profile');
  
  // Section 2 - Professional Info States
  const [bioInput, setBioInput] = useState(trainerProfile.bio);
  const [philosophy, setPhilosophy] = useState("Empowering clients through foundational biomechanics, consistency over intensity, and structured habit loop feedback.");
  const [licenseNumber, setLicenseNumber] = useState("MFA-2026-90812");
  const [verificationStatus, setVerificationStatus] = useState<'Pending' | 'Verified' | 'Rejected'>('Verified');
  const [uploadedLicense, setUploadedLicense] = useState("malaysian_fit_license_2026.pdf");
  const [uploadedId, setUploadedId] = useState("sarah_id_card_verified.jpg");
  const [viewDocName, setViewDocName] = useState<string | null>(null);

  // Section 3 - Specializations State
  const [specializations, setSpecializations] = useState([
    { name: 'Strength Training', checked: true },
    { name: 'Weight Loss Coaching', checked: true },
    { name: 'Yoga', checked: false },
    { name: 'Sports Performance', checked: true },
    { name: 'Pilates', checked: false },
    { name: 'Running Coach', checked: false },
    { name: 'Rehabilitation', checked: true },
    { name: 'Martial Arts', checked: false },
  ]);

  // Section 4 - Coaching Packages State
  const [packages, setPackages] = useState([
    { id: 'pkg_1', name: '4 Classes Trial Pack', price: 480, sessions: 4 },
    { id: 'pkg_2', name: '8 Classes Standard Pack', price: 880, sessions: 8 },
    { id: 'pkg_3', name: 'Monthly Personal Coaching', price: 1200, sessions: 12 },
    { id: 'pkg_4', name: 'Custom Contest Prep Pack', price: 2200, sessions: 20 },
  ]);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageNameInput, setPackageNameInput] = useState('');
  const [packagePriceInput, setPackagePriceInput] = useState(0);
  const [packageSessionInput, setPackageSessionInput] = useState(4);
  const [isAddingPackage, setIsAddingPackage] = useState(false);

  // Section 5 - Business performance stats
  const analyticsData = {
    activeClients: 12,
    sessionsCompleted: 148,
    revenueMonth: 9840,
    revenueYear: 84320,
    clientRetention: 92,
    workoutReviews: 114,
    nutritionReviews: 87,
  };

  // Section 6 - Reviews list
  const reviews = [
    { name: "Ahmad bin Ibrahim", rating: 5, text: "Sarah has completely changed my stance accuracy and lower back safety during deep heavy squat logs. Simply the best trainer in Subang!", date: "2026-06-12" },
    { name: "Mei Ling Tan", rating: 5, text: "Extremely attentive and structured coaching. The weekly habits, hydration triggers, and posture-focused rehabilitation are amazing.", date: "2026-05-30" },
    { name: "Muhammad Faizul", rating: 4, text: "Very supportive with daily nutrition log audits. The calorie reviews are direct and incredibly helpful for food discipline.", date: "2026-05-18" },
  ];

  // Section 7 - Availability Settings
  const [availableDays, setAvailableDays] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([
    { id: 'slot_1', label: '8:00 AM – 12:00 PM', active: true },
    { id: 'slot_2', label: '12:00 PM – 2:00 PM (Lunch Slots)', active: false },
    { id: 'slot_3', label: '2:00 PM – 6:00 PM', active: true },
    { id: 'slot_4', label: '6:00 PM – 10:00 PM', active: false },
  ]);

  // Section 8 & 9 - Account / Notification Settings
  const [email, setEmail] = useState(trainerProfile.userId === 'tr_sarah' || trainerProfile.userId === 'u_sarah' ? 'sarah@coachtrack.my' : 'coach@coachtrack.my');
  const [phone, setPhone] = useState("+60 12-345 6789");
  const [locationStr, setLocationStr] = useState(trainerProfile.location);
  const [password, setPassword] = useState("********");
  const [twoFactor, setTwoFactor] = useState(false);
  const [notifications, setNotifications] = useState({
    newWorkout: true,
    newNutrition: true,
    newProgressPhoto: true,
    newBooking: true,
    newPayment: true,
    invoiceOverdue: true,
    chatMessage: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save edits back to Parent & Server
  const handleSaveProfileHeaderAndBio = async () => {
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
        triggerToast("Professional profile updated successfully!");
      } else {
        // Local state fallback representation
        onUpdateProfile(updated);
        triggerToast("Profile saved in offline fallback zone.");
      }
    } catch (e) {
      onUpdateProfile(updated);
      triggerToast("Saved in local browser persistent sandbox!");
    }
  };

  // Specialization checklist toggle
  const toggleSpecialization = (index: number) => {
    const next = [...specializations];
    next[index].checked = !next[index].checked;
    setSpecializations(next);
    triggerToast("Specializations checklist updated!");
  };

  // Save coaching packages actions
  const handleAddPackage = () => {
    if (!packageNameInput) return;
    const newPkg = {
      id: 'pkg_' + Date.now(),
      name: packageNameInput,
      price: packagePriceInput,
      sessions: packageSessionInput
    };
    setPackages([...packages, newPkg]);
    setPackageNameInput('');
    setPackagePriceInput(0);
    setPackageSessionInput(4);
    setIsAddingPackage(false);
    triggerToast(`Package "${newPkg.name}" compiled and logged!`);
  };

  const handleRemovePackage = (id: string, name: string) => {
    setPackages(packages.filter(p => p.id !== id));
    triggerToast(`Removed custom package: ${name}`);
  };

  const startEditPackage = (pkg: any) => {
    setEditingPackageId(pkg.id);
    setPackageNameInput(pkg.name);
    setPackagePriceInput(pkg.price);
    setPackageSessionInput(pkg.sessions);
  };

  const handleSaveEditedPackage = () => {
    setPackages(packages.map(p => {
      if (p.id === editingPackageId) {
        return {
          ...p,
          name: packageNameInput,
          price: packagePriceInput,
          sessions: packageSessionInput
        };
      }
      return p;
    }));
    setEditingPackageId(null);
    setPackageNameInput('');
    setPackagePriceInput(0);
    setPackageSessionInput(4);
    triggerToast("Package details adjusted successfully!");
  };

  // Day toggle
  const toggleDay = (day: string) => {
    setAvailableDays(prev => ({
      ...prev,
      [day as keyof typeof availableDays]: !prev[day as keyof typeof availableDays]
    }));
    triggerToast("Available days grid synced.");
  };

  // Time Slot toggle
  const toggleTimeActive = (id: string) => {
    setAvailableTimeSlots(prev => prev.map(s => {
      if (s.id === id) return { ...s, active: !s.active };
      return s;
    }));
    triggerToast("Availability time range toggled.");
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16 pt-6 text-slate-800 animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-teal-500/30 text-teal-300 font-bold px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 animate-spin" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SECTION 1 - COMPREHENSIVE PROFILE HEADER */}
        <div className="relative bg-[#001F3F] text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden mb-8 border border-slate-800">
          {/* Subtle architectural background overlays */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
              {/* Profile image with elegant overlay */}
              <div className="relative group cursor-pointer">
                <img 
                  referrerPolicy="no-referrer"
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'} 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-slate-700/50 shadow-lg"
                  alt={profile.name}
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-center text-3xs font-black tracking-wider uppercase text-teal-400">
                  <Upload className="w-5 h-5 mb-1 text-teal-400" />
                  Replace
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const fakeUrl = URL.createObjectURL(e.target.files[0]);
                        setProfile(prev => ({ ...prev, avatarUrl: fakeUrl }));
                        triggerToast("Photo selection simulated!");
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Bio details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white">{profile.name}</h2>
                  <span className="bg-teal-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED COACH
                  </span>
                </div>

                <p className="text-sm font-semibold text-teal-400 font-sans">
                  {profile.discipline} • {profile.location}
                </p>

                {/* Micro Meta Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1.5 text-xs text-slate-300">
                  <span className="flex items-center gap-1 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/40 font-medium">
                    🏢 {profile.freelanceStatus === 'Gym Operator' ? 'Under Gym Facility' : 'Freelance Trainer'}
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/40">
                    Rating: <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" /> <strong className="text-amber-300">{profile.rating}</strong>
                  </span>
                  <span className="flex items-center gap-1 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/40">
                    Experience: <strong>{profile.experienceYears} Years</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Header fast stats cards */}
            <div className="bg-slate-800/45 border border-slate-700/40 p-4 rounded-2xl w-full md:w-auto shrink-0 flex justify-around md:flex-col gap-3">
              <div className="text-center md:text-left">
                <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Active Client Base</span>
                <span className="text-xl font-black text-white">{analyticsData.activeClients} Active Clients</span>
              </div>
              <div className="text-center md:text-left border-l md:border-l-0 md:border-t border-slate-700/60 pl-3 md:pl-0 md:pt-2.5">
                <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Coaching Since</span>
                <span className="text-sm font-bold text-white">August 2024</span>
              </div>
            </div>

          </div>
        </div>

        {/* SECONDARY SIDEBAR TABS LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sub Tab selection rails */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveSubTab('profile')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'profile' 
                  ? 'bg-[#001F3F] text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Bio & Specializations</span>
            </button>

            <button
              id="trainer-tab-packages"
              onClick={() => setActiveSubTab('packages')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'packages' 
                  ? 'bg-[#001F3F] text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Coaching Packages</span>
            </button>

            <button
              id="trainer-tab-business"
              onClick={() => setActiveSubTab('business')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'business' 
                  ? 'bg-[#001F3F] text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>SaaS Performance</span>
            </button>

            <button
              id="trainer-tab-availability"
              onClick={() => setActiveSubTab('availability')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'availability' 
                  ? 'bg-[#001F3F] text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Availability Grid</span>
            </button>

            <button
              id="trainer-tab-security"
              onClick={() => setActiveSubTab('security')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'security' 
                  ? 'bg-[#001F3F] text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Security & Alerts</span>
            </button>
          </div>

          {/* MAIN FORM AND DISPLAY PANEL */}
          <div className="lg:col-span-9 space-y-6">

            {/* TAB 1: BIO & CREDENTIALS & SPECIALIZATIONS */}
            {activeSubTab === 'profile' && (
              <div className="space-y-6">
                
                {/* BIO CARD */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-display font-black text-slate-900 text-base">✏ My Professional Statement & Bio</h3>
                    <button 
                      onClick={handleSaveProfileHeaderAndBio}
                      className="bg-[#001F3F] hover:bg-slate-900 text-teal-400 text-2xs font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                        Coaching Specialty Title
                      </label>
                      <input 
                        type="text" 
                        value={profile.discipline}
                        onChange={(e) => setProfile({ ...profile, discipline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Base Location (Klang Valley)
                        </label>
                        <input 
                          type="text" 
                          value={locationStr}
                          onChange={(e) => setLocationStr(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Years Of Active Experience
                        </label>
                        <input 
                          type="number" 
                          value={profile.experienceYears}
                          onChange={(e) => setProfile({ ...profile, experienceYears: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                        Biography & Experience Summary
                      </label>
                      <textarea
                        rows={3}
                        value={bioInput}
                        onChange={(e) => setBioInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-medium leading-relaxed"
                        placeholder="Tell prospective trainees about your specialization patterns..."
                      />
                    </div>

                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                        Coaching Philosophy & Biometrics Axiom
                      </label>
                      <input 
                        type="text" 
                        value={philosophy}
                        onChange={(e) => setPhilosophy(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* SPECIALIZATIONS CHECKLIST */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="font-display font-black text-slate-900 text-base">🎯 Specialization Core Disciplines</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Manage fields shown to prospective clients in the CoachTrack finder directory.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {specializations.map((spec, index) => (
                      <button
                        key={spec.name}
                        onClick={() => toggleSpecialization(index)}
                        className={`p-3 rounded-xl border text-center font-bold text-2xs cursor-pointer transition-all flex items-center justify-between gap-1 ${
                          spec.checked 
                            ? 'bg-teal-50 border-teal-500 text-[#001F3F] shadow-2xs font-extrabold' 
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        <span>{spec.checked ? '✓' : '○'} {spec.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PROFESSIONAL VERIIFICATION & DOCUMENTS */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-base">🛡 Regulatory Licenses & Credentials</h3>
                      <p className="text-[11px] text-slate-400">Compliance file verification status for Malaysian sports coaching registry.</p>
                    </div>
                    <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 border rounded-full ${
                      verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      verificationStatus === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                      'bg-rose-50 text-rose-850 border-rose-300'
                    }`}>
                      ● {verificationStatus} Status
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Malaysia Fitness License Key ID
                        </label>
                        <input 
                          type="text" 
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-mono text-slate-700 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Re-upload Verification Documents
                        </label>
                        <button
                          onClick={() => {
                            setVerificationStatus('Pending');
                            triggerToast("Compliance logs reset to Pending review!");
                          }}
                          className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-205 text-slate-650 hover:text-slate-900 text-xs py-2.5 rounded-xl transition font-sans font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4 text-slate-500 inline" /> Re-trigger Review Protocol
                        </button>
                      </div>
                    </div>

                    <div className="border border-slate-150 rounded-xl p-3 bg-slate-50 flex flex-col md:flex-row gap-3 items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-8 h-8 text-teal-650 shrink-0" />
                        <div className="text-left">
                          <p className="text-2xs font-extrabold text-slate-800 leading-none">Fitness License: {uploadedLicense}</p>
                          <p className="text-3xs text-slate-400 font-medium mt-1">Uploaded 4 months ago • PDF File (2.1 MB)</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setViewDocName(uploadedLicense)}
                          className="bg-white hover:bg-slate-100 border border-slate-250 p-2 rounded-lg text-slate-700 transition cursor-pointer text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> View
                        </button>
                        <label className="bg-white hover:bg-slate-100 border border-slate-250 p-2 rounded-lg text-slate-700 transition cursor-pointer text-xs flex items-center gap-1 select-none">
                          <Upload className="w-3.5 h-3.5 text-slate-500" /> Replace
                          <input 
                            type="file" 
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setUploadedLicense(e.target.files[0].name);
                                triggerToast("New Fitness License uploaded successfully!");
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>

                    <div className="border border-slate-150 rounded-xl p-3 bg-slate-50 flex flex-col md:flex-row gap-3 items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-8 h-8 text-indigo-650 shrink-0" />
                        <div className="text-left">
                          <p className="text-2xs font-extrabold text-slate-800 leading-none">Identification document: {uploadedId}</p>
                          <p className="text-3xs text-slate-400 font-medium mt-1">Uploaded 4 months ago • JPG Image (880 KB)</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setViewDocName(uploadedId)}
                          className="bg-white hover:bg-slate-100 border border-slate-250 p-2 rounded-lg text-slate-700 transition cursor-pointer text-xs flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" /> View
                        </button>
                        <label className="bg-white hover:bg-slate-100 border border-slate-250 p-2 rounded-lg text-slate-700 transition cursor-pointer text-xs flex items-center gap-1 select-none">
                          <Upload className="w-3.5 h-3.5 text-slate-500" /> Replace
                          <input 
                            type="file" 
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setUploadedId(e.target.files[0].name);
                                triggerToast("New Identification ID uploaded successfully!");
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: COACHING PACKAGES */}
            {activeSubTab === 'packages' && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-150 pb-3">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-base">🏷 Manage Coaching Packages</h3>
                      <p className="text-[11px] text-slate-400">Configure prices. These synchronize instantly with checkout invoices and client custom bookings.</p>
                    </div>
                    {!isAddingPackage && (
                      <button 
                        onClick={() => {
                          setIsAddingPackage(true);
                          setEditingPackageId(null);
                        }}
                        className="bg-[#001F3F] hover:bg-slate-900 text-teal-400 text-xs font-black px-4 py-2 rounded-xl cursor-pointer flex items-center gap-1 shadow-sm transition"
                      >
                        <Plus className="w-4 h-4" /> Add New Package
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Package Inline Form */}
                  {(isAddingPackage || editingPackageId) && (
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-6 space-y-4">
                      <h4 className="font-display font-black text-slate-900 text-xs">
                        {editingPackageId ? '✏ Modify Existing Package Plan' : '🆕 Append New Premium Coaching Package'}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            Package Name
                          </label>
                          <input 
                            type="text" 
                            value={packageNameInput}
                            onChange={(e) => setPackageNameInput(e.target.value)}
                            placeholder="e.g. Monthly Pack (8x Slots)"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            Price Block (RM)
                          </label>
                          <input 
                            type="number" 
                            value={packagePriceInput}
                            onChange={(e) => setPackagePriceInput(Number(e.target.value))}
                            placeholder="e.g. 1080"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            Included Session Count
                          </label>
                          <input 
                            type="number" 
                            value={packageSessionInput}
                            onChange={(e) => setPackageSessionInput(Number(e.target.value))}
                            placeholder="e.g. 8"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => {
                            setIsAddingPackage(false);
                            setEditingPackageId(null);
                            setPackageNameInput('');
                          }}
                          className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs hover:bg-slate-100 cursor-pointer font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={editingPackageId ? handleSaveEditedPackage : handleAddPackage}
                          className="bg-[#001F3F] text-teal-400 text-xs font-black px-5 py-2 rounded-xl cursor-pointer shadow-md"
                        >
                          {editingPackageId ? 'Update Package Plan' : 'Insert & Log Plan'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List of active packages */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg) => (
                      <div 
                        key={pkg.id} 
                        className="bg-white border border-slate-200 hover:border-teal-500/35 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 border border-teal-100/60 px-2 py-0.5 rounded-full inline-block mb-2">
                              {pkg.sessions} Slots Package
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => startEditPackage(pkg)}
                                className="text-slate-400 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition cursor-pointer"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleRemovePackage(pkg.id, pkg.name)}
                                className="text-rose-400 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-display font-black text-slate-800 text-sm leading-tight mb-2">{pkg.name}</h4>
                          <p className="text-2xs text-slate-400 mb-4">Eligible for weekly strength schedules, direct digital PDF invoicing, and video validation reviews.</p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex justify-between items-center bg-white">
                          <span className="text-3xs font-extrabold text-slate-405 uppercase tracking-wide">Client Investment</span>
                          <span className="text-base font-black text-slate-900">RM {pkg.price} <span className="text-3xs text-slate-400 font-medium">/ flat</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: BUSINESS PERFORMANCE */}
            {activeSubTab === 'business' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* 7 Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50/50 flex items-center justify-center text-teal-600 shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-4xs uppercase tracking-wider font-extrabold text-slate-400">Active Members</span>
                      <span className="text-base font-black text-slate-800">{analyticsData.activeClients} Active</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-4xs uppercase tracking-wider font-extrabold text-slate-400">Sessions Audited</span>
                      <span className="text-base font-black text-slate-800">{analyticsData.sessionsCompleted} classes</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-4xs uppercase tracking-wider font-extrabold text-slate-400">Revenue Month</span>
                      <span className="text-base font-black text-slate-800">RM {analyticsData.revenueMonth}</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-4xs uppercase tracking-wider font-extrabold text-slate-400">Audits Performed</span>
                      <span className="text-base font-black text-slate-800">{analyticsData.workoutReviews + analyticsData.nutritionReviews} edits</span>
                    </div>
                  </div>
                </div>

                {/* Styled SVG Chart layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Revenue Growth Trend */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-left">
                    <h3 className="font-display font-medium text-slate-900 text-xs mb-1.5">📈 Monthly Revenue Trend 2026</h3>
                    <p className="text-[11px] text-slate-400 mb-6">Aggregate collection cycles for subscription and classes (RM).</p>

                    {/* SVG GRAPH */}
                    <div className="relative h-44 w-full bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col justify-between">
                      {/* Grid lines */}
                      <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-200/70" />
                      <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-200/70" />
                      <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-200/70" />

                      {/* Bar graph bars */}
                      <div className="relative z-10 flex items-end justify-between h-full pt-4">
                        {[
                          { m: 'Jan', val: '5k', pct: '45%' },
                          { m: 'Feb', val: '6.2k', pct: '55%' },
                          { m: 'Mar', val: '7.8k', pct: '70%' },
                          { m: 'Apr', val: '8.4k', pct: '75%' },
                          { m: 'May', val: '9.2k', pct: '88%' },
                          { m: 'Jun (Est)', val: '12k', pct: '100%', highlight: true }
                        ].map((chunk) => (
                          <div key={chunk.m} className="flex flex-col items-center gap-1.5 flex-1 mx-2">
                            <span className="text-4xs font-mono text-slate-400 leading-none">{chunk.val}</span>
                            <div 
                              style={{ height: chunk.pct }} 
                              className={`w-full rounded-t-md transition-all duration-500 ${
                                chunk.highlight ? 'bg-gradient-to-t from-[#001F3F] to-teal-400' : 'bg-slate-300'
                              }`} 
                            />
                            <span className="text-4xs font-bold text-slate-500 leading-none">{chunk.m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Client Roster growth */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <h3 className="font-display font-medium text-slate-900 text-xs mb-1.5">👥 Active Client Expansion Trend</h3>
                    <p className="text-[11px] text-slate-400 mb-6 font-sans">Active paying members (retention rate: 92%).</p>

                    <div className="relative h-44 w-full bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col justify-between">
                      <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-200/70" />
                      <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-200/70" />
                      <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-200/70" />

                      <div className="relative z-10 flex items-end justify-between h-full pt-4">
                        {[
                          { m: 'Jan', val: '4', pct: '30%' },
                          { m: 'Feb', val: '6', pct: '45%' },
                          { m: 'Mar', val: '8', pct: '60%' },
                          { m: 'Apr', val: '8', pct: '60%' },
                          { m: 'May', val: '10', pct: '80%' },
                          { m: 'Jun', val: '12', pct: '100%', highlight: true }
                        ].map((chunk) => (
                          <div key={chunk.m} className="flex flex-col items-center gap-1.5 flex-1 mx-2">
                            <span className="text-4xs font-mono text-slate-400 leading-none">{chunk.val}</span>
                            <div 
                              style={{ height: chunk.pct }} 
                              className={`w-full rounded-t-md transition-all duration-500 ${
                                chunk.highlight ? 'bg-teal-500' : 'bg-[#001F3F]/40'
                              }`} 
                            />
                            <span className="text-4xs font-bold text-slate-500 leading-none">{chunk.m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Section 6 - Reviews list inside Business/Performance zone tab */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1">⭐ Verified Trainee Feedback & Comments</h3>
                  <p className="text-[11px] text-slate-440 mb-4">Static physical testimonials checked and compiled by the CoachTrack core team.</p>

                  <div className="space-y-4">
                    {reviews.map((rev, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-150 shadow-2xs">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-slate-900">🙎 {rev.name}</span>
                          <span className="text-4xs text-slate-400 font-mono font-medium">{rev.date}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <p className="text-2xs text-slate-600 leading-relaxed font-serif">&ldquo;{rev.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: AVAILABILITY SETTINGS */}
            {activeSubTab === 'availability' && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="font-display font-black text-slate-900 text-base">📅 Weekly Availability Scheduler</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Select days you can receive booking schedules, group classes, and online posture audits.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                    {Object.keys(availableDays).map((day) => {
                      const isActive = availableDays[day as keyof typeof availableDays];
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`p-3 rounded-xl border text-center font-bold text-2xs cursor-pointer transition flex flex-col justify-center items-center gap-1.5 ${
                            isActive 
                              ? 'bg-teal-50 border-teal-500 text-teal-850' 
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-bold text-3xs tracking-wider uppercase font-sans">{day.substring(0, 3)}</span>
                          <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-teal-500 animate-pulse' : 'bg-slate-200'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time range selection standard cards */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div>
                    <h3 className="font-display font-black text-slate-900 text-base">⏰ Primary Coaching Hours Slots</h3>
                    <p className="text-[11px] text-slate-400 mb-4">Select hours when calendar checkless reservations are active.</p>
                  </div>

                  <div className="space-y-2.5">
                    {availableTimeSlots.map((slot) => (
                      <div 
                        key={slot.id} 
                        onClick={() => toggleTimeActive(slot.id)}
                        className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          slot.active 
                            ? 'bg-teal-50/50 border-teal-500/35 text-slate-800' 
                            : 'bg-slate-50/60 border-slate-150 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">⏰</span>
                          <span className="text-xs font-bold font-mono">{slot.label}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full border ${
                          slot.active 
                            ? 'bg-teal-100 text-teal-800 border-teal-200' 
                            : 'bg-slate-100 text-slate-404 border-slate-201'
                        }`}>
                          {slot.active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: SECURITY & ALERTS & ACCOUNT SETTINGS */}
            {activeSubTab === 'security' && (
              <div className="space-y-6">
                
                {/* 1. Account Settings */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-4 border-b border-slate-100 pb-3">⚙ Core Contact & Location Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                        Professional Email String
                      </label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-505"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                        Phone Number Contact (Malaysian)
                      </label>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-505 font-mono"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => triggerToast("Account core contact guidelines saved.")}
                      className="bg-[#001F3F] text-teal-400 text-2xs font-extrabold px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-900 shadow-3xs"
                    >
                      Update Contact Records
                    </button>
                  </div>
                </div>

                {/* 2. Security options */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-4">🔐 Account Security & Credentials</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Current Security Password
                        </label>
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                        />
                      </div>
                      <div className="flex items-center justify-between border border-dashed border-slate-200/80 rounded-xl p-3 bg-slate-50/50">
                        <div>
                          <span className="block text-2xs font-extrabold text-slate-700">Two-Factor Auth (2FA)</span>
                          <span className="text-[10px] text-slate-400 font-sans">Send verification SMS/WhatsApp pin logs</span>
                        </div>
                        <button
                          onClick={() => setTwoFactor(!twoFactor)}
                          className={`text-2xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer ${
                            twoFactor ? 'bg-teal-100 text-teal-800' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {twoFactor ? 'Enabled' : 'Disabled (Placeholder)'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-4xs uppercase font-mono tracking-widest font-black flex justify-between items-center text-slate-500">
                      <span>● IP Address Activity: 165.2.204.1 (Kuala Lumpur, MY)</span>
                      <span className="text-slate-400 font-medium">Session: active now</span>
                    </div>
                  </div>
                </div>

                {/* 3. Notification switches */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1">🔔 Live Event Notifications Alerts</h3>
                  <p className="text-[11px] text-slate-440 mb-4 font-sans">Toggle live email or smartphone banners for routine client logs.</p>

                  <div className="space-y-2.5">
                    {[
                      { key: 'newWorkout', label: 'New Client Workout Submission Proof', desc: 'Direct alerts when custom recorded exercise MP4 files upload' },
                      { key: 'newNutrition', label: 'New Client Nutrition Log Submission', desc: 'Daily calories, protein, and local nasi lemak calorie charts logged' },
                      { key: 'newProgressPhoto', label: 'Client Progress Front/Side Photos Uploaded', desc: 'Alert regarding updated physique progress screenshots' },
                      { key: 'newBooking', label: 'New Booking Reservation Requested', desc: 'Calendar scheduling requests directly waiting for authorization' },
                      { key: 'newPayment', label: 'Invoice Paid or Checkout Complete', desc: 'RM payment confirmation log notification' },
                      { key: 'invoiceOverdue', label: 'Trainee Overdue Invoice Alert', desc: 'Weekly automatic reminder for overdue clients' },
                      { key: 'chatMessage', label: 'Direct Message / Chat Receipts', desc: 'Chat message threads received from linked trainees' }
                    ].map((notifBox) => (
                      <div 
                        key={notifBox.key}
                        onClick={() => {
                          setNotifications(prev => ({
                            ...prev,
                            [notifBox.key as keyof typeof notifications]: !prev[notifBox.key as keyof typeof notifications]
                          }));
                          triggerToast("Alert preferences adjusted.");
                        }}
                        className="p-3 bg-slate-50 border border-slate-150 rounded-xl hover:border-slate-250 cursor-pointer flex items-center justify-between text-left transition"
                      >
                        <div className="min-w-0 pr-4">
                          <span className="block text-2xs font-extrabold text-slate-700 leading-none mb-1">{notifBox.label}</span>
                          <span className="text-3xs text-slate-400 font-sans block truncate max-w-[500px]">{notifBox.desc}</span>
                        </div>
                        <span className={`text-4xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border inline-block ${
                          notifications[notifBox.key as keyof typeof notifications] 
                            ? 'bg-emerald-150 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {notifications[notifBox.key as keyof typeof notifications] ? '✓ Active' : '○ Muted'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Verification modal document viewer component */}
      {viewDocName && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 text-center text-slate-800">
            <h3 className="font-display font-black text-slate-900 text-sm mb-1.5">
              📄 Secure Document Viewer
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Registered Verification File: <span className="font-bold text-slate-700">{viewDocName}</span>
            </p>
            
            {/* Simulated file window */}
            <div className="bg-slate-900/5 border border-slate-200 h-64 rounded-xl flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xl">🔒</p>
                <p className="text-2xs font-bold text-slate-800 mt-2">CoachTrack Certified Cryptographic Lock</p>
                <p className="text-3xs text-slate-400 max-w-xs mt-1.5 leading-relaxed mx-auto">This document was verified by CoachTrack MY Trust and Safety team on Jan 20, 2026. Credentials status: Verified.</p>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <button
                onClick={() => setViewDocName(null)}
                className="w-full bg-[#001F3F] hover:bg-slate-900 border border-transparent text-teal-400 text-xs font-black py-2.5 rounded-xl cursor-pointer shadow-md transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
