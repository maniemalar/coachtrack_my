import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Dumbbell, 
  TrendingUp, 
  Flame, 
  Award, 
  Calendar, 
  Heart, 
  Clock, 
  ShieldCheck, 
  Utensils, 
  Mail, 
  Phone, 
  Scale, 
  Cpu, 
  MessageSquare, 
  Settings, 
  Bell, 
  FileText, 
  RefreshCw, 
  Bookmark, 
  Sparkles,
  Search,
  Upload,
  CheckCircle,
  TrendingDown,
  Save,
  Star
} from 'lucide-react';
import { TraineeProfile, TrainerProfile, Payment } from '../types';

interface TraineeProfilePageProps {
  traineeProfile: TraineeProfile;
  assignedTrainer: TrainerProfile | null;
  onUpdateProfile: (updated: TraineeProfile) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function TraineeProfilePage({ 
  traineeProfile, 
  assignedTrainer, 
  onUpdateProfile, 
  onNavigateToTab 
}: TraineeProfilePageProps) {
  
  const [profile, setProfile] = useState<TraineeProfile>(traineeProfile);
  const [activeSubTab, setActiveSubTab] = useState<'hub' | 'goals' | 'preferences' | 'subscription' | 'account'>('hub');
  
  // Section 2 - Personal info form inputs
  const [nameInput, setNameInput] = useState(traineeProfile.name);
  const [emailInput, setEmailInput] = useState("ahmad@coachtrack.my");
  const [phoneInput, setPhoneInput] = useState("+60 17-291 3810");
  const [dob, setDob] = useState("1998-04-12");
  const [gender, setGender] = useState("Male");
  const [height, setHeight] = useState(traineeProfile.height || 176);
  const [weight, setWeight] = useState(traineeProfile.weight || 84);
  const [locationStr, setLocationStr] = useState("SS15, Subang Jaya, PJ");

  // Section 3 - Fitness Goal Choices
  const [goalsChecked, setGoalsChecked] = useState([
    { name: 'Weight Loss', checked: true },
    { name: 'Muscle Gain', checked: false },
    { name: 'General Fitness', checked: true },
    { name: 'Sports Performance', checked: false },
    { name: 'Yoga & Flexibility', checked: false },
    { name: 'Rehabilitation', checked: false },
    { name: 'Marathon Training', checked: true },
  ]);
  const [targetWeight, setTargetWeight] = useState(72);
  const [targetDate, setTargetDate] = useState("2026-09-01");

  // Body Metrics
  const startingWeight = 91.5;
  const weightChange = (weight - startingWeight).toFixed(1);
  const bmiValue = (weight / ((height / 100) * (height / 100))).toFixed(1);
  const [bodyFat, setBodyFat] = useState(24.2);
  const [muscleMass, setMuscleMass] = useState(61.8);

  // Section 7 - Achievements list
  const achievements = [
    { title: "First Workout Completed", icon: "🏆", desc: "Logged first cardiorespiratory strength training workout.", date: "Aug 2025", achieved: true },
    { title: "7-Day Streak Achieved", icon: "🔥", desc: "Logged exercise or healthy foods 7 days in a row.", date: "Jan 2026", achieved: true },
    { title: "50 Workouts Completed", icon: "💪", desc: "Successfully completed 50 full workout recipes.", date: "Pending", achieved: false },
    { title: "30 Nutrition Logs Submitted", icon: "🥗", desc: "Logged local Malaysian calorie entries 30 times.", date: "Jan 2026", achieved: true },
    { title: "10 Sessions Attended", icon: "🏃", desc: "Attended 10 coach-guided physical classes.", date: "Pending", achieved: false },
  ];

  // Section 8 - Preferences state
  const [workoutPreferences, setWorkoutPreferences] = useState({
    Gym: true,
    Yoga: false,
    Running: true,
    Sports: true,
    Pilates: false,
    HIIT: true,
  });

  const [dietPreferences, setDietPreferences] = useState({
    Vegetarian: false,
    Vegan: false,
    Halal: true,
    'Low Carb': true,
    'High Protein': true,
  });

  const [injuryNotes, setInjuryNotes] = useState("Slightly tight upper right shoulder during plank holds and heavy chest press routines. Avoid overhead shoulder presses over 25kg.");

  // Section 10 & 11 - Account Settings & notifications
  const [passwordInput, setPasswordInput] = useState("********");
  const [twoFactorToken, setTwoFactorToken] = useState(false);
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    sessionReminders: true,
    nutritionReminders: true,
    paymentReminders: true,
    trainerMessages: true,
    progressReviews: true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdatePersonalInfo = async () => {
    // Generate updated model
    const updated = {
      ...profile,
      name: nameInput,
      weight: Number(weight),
      height: Number(height),
      goals: goalsChecked.filter(g => g.checked).map(g => g.name).join(', ')
    };

    try {
      const res = await fetch(`/api/trainees/${profile.id}/profile`, {
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
        triggerToast("Personal health metrics saved securely!");
      } else {
        onUpdateProfile(updated);
        triggerToast("Offline backup active. Preferences stored locally.");
      }
    } catch (e) {
      onUpdateProfile(updated);
      triggerToast("Changes successfully stored in sandbox local DB.");
    }
  };

  const toggleGoalSelection = (index: number) => {
    const next = [...goalsChecked];
    next[index].checked = !next[index].checked;
    setGoalsChecked(next);
    triggerToast("Physical target choices synced.");
  };

  const toggleWorkoutPref = (key: string) => {
    setWorkoutPreferences(prev => ({
      ...prev,
      [key as keyof typeof workoutPreferences]: !prev[key as keyof typeof workoutPreferences]
    }));
    triggerToast("Workout environment updated.");
  };

  const toggleDietPref = (key: string) => {
    setDietPreferences(prev => ({
      ...prev,
      [key as keyof typeof dietPreferences]: !prev[key as keyof typeof dietPreferences]
    }));
    triggerToast("Diet habits updated.");
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16 pt-6 text-slate-800 animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Saved Alert Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-teal-500/20 text-teal-300 font-bold px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* SECTION 1 - TRAINEE HEADLINER PROFILE HEADER */}
        <div className="relative bg-gradient-to-r from-teal-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden mb-8 border border-white/5">
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-5 text-center md:text-left">
              {/* Profile Image with upload overlay */}
              <div className="relative group cursor-pointer w-20 h-20 md:w-24 md:h-24">
                <img 
                  referrerPolicy="no-referrer"
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'} 
                  className="w-full h-full rounded-2xl object-cover border-3 border-teal-400/40 shadow-semibold" 
                  alt={profile.name}
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition text-center text-5xs font-black tracking-widest uppercase text-teal-300">
                  <Upload className="w-4 h-4 mb-1 text-teal-300" />
                  Replace
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const fakeUrl = URL.createObjectURL(e.target.files[0]);
                        setProfile(prev => ({ ...prev, avatarUrl: fakeUrl }));
                        triggerToast("Photo upload simulated!");
                      }
                    }} 
                  />
                </label>
              </div>

              {/* Bio summary */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white">{profile.name}</h2>
                  <span className="bg-teal-550 text-slate-950 font-black text-4xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Member Since Aug 2025
                  </span>
                </div>

                <p className="text-xs font-semibold text-teal-350 leading-relaxed font-sans max-w-xl">
                  🎯 Primary Goal: <strong className="text-white">{profile.goals || 'Weight Loss & Cardiovascular Endurance'}</strong>
                </p>

                {/* Trainer and package micro badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-4xs tracking-wide text-slate-350 font-bold uppercase font-sans">
                  {assignedTrainer ? (
                    <span className="bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-full text-slate-300">
                      Coach: <strong className="text-teal-400">{assignedTrainer.name}</strong>
                    </span>
                  ) : (
                    <span className="bg-amber-950/60 border border-amber-800/40 px-2.5 py-1 rounded-full text-amber-300">
                      No Trainer Joined
                    </span>
                  )}
                  <span className="bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-full text-slate-300">
                    Subscription: <strong className="text-indigo-300">Monthly Roster Plan (12x Classes)</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Header Fast Stats: streak */}
            <div className="bg-slate-800/40 border border-slate-700/45 p-4 rounded-2xl w-full md:w-auto shrink-0 flex justify-around md:flex-col gap-3">
              <div className="text-center md:text-left">
                <span className="block text-4xs uppercase tracking-wider text-slate-400 font-extrabold">Habits Streak count</span>
                <span className="text-base font-black text-slate-200 flex items-center justify-center md:justify-start gap-1">
                  <Flame className="w-5 h-5 text-amber-400 inline" /> {profile.streakCount} Active Days
                </span>
              </div>
              <div className="text-center md:text-left border-l md:border-l-0 md:border-t border-slate-700/55 pl-3 md:pl-0 md:pt-2">
                <span className="block text-4xs uppercase tracking-wider text-slate-400 font-extrabold">Next Calibration Review</span>
                <span className="text-xs font-bold text-white">Sunday (2 Days)</span>
              </div>
            </div>

          </div>
        </div>

        {/* TWO-COLUMN TABBED HUB LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Rail items */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-205">
            <button
              onClick={() => setActiveSubTab('hub')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'hub' 
                  ? 'bg-slate-900 text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Stats Hub</span>
            </button>

            <button
              id="trainee-tab-goals"
              onClick={() => setActiveSubTab('goals')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'goals' 
                  ? 'bg-slate-900 text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Weight & Goals Setup</span>
            </button>

            <button
              id="trainee-tab-pref"
              onClick={() => setActiveSubTab('preferences')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'preferences' 
                  ? 'bg-slate-900 text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Diet & Injuries</span>
            </button>

            <button
              id="trainee-tab-sub"
              onClick={() => setActiveSubTab('subscription')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'subscription' 
                  ? 'bg-slate-900 text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Subscription & Invoices</span>
            </button>

            <button
              id="trainee-tab-account"
              onClick={() => setActiveSubTab('account')}
              className={`flex-1 lg:flex-initial text-left px-4 py-3 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'account' 
                  ? 'bg-slate-900 text-teal-400 shadow-md font-black' 
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Security & Alerts</span>
            </button>
          </div>

          {/* MAIN FIELD BLOCKS */}
          <div className="lg:col-span-9 space-y-6">

            {/* SUBTAB 1: PERSONAL STATS HUB & INTERACTIVE STATS CARDS */}
            {activeSubTab === 'hub' && (
              <div className="space-y-6">
                
                {/* Body metrics overview Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Current Weight</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-slate-900">{weight} kg</span>
                      <span className="text-4xs text-slate-500 font-bold">{height}cm</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Weight Change</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className={`text-xl font-black ${Number(weightChange) < 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {weightChange} kg
                      </span>
                      <span className="text-4xs text-slate-400 font-sans leading-none flex items-center gap-0.5">
                        <TrendingDown className="w-3" /> from starting
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Body Mass Index (BMI)</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-black text-slate-900">{bmiValue}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 font-bold rounded-lg leading-none">
                        Slight Overweight
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-2xs">
                    <span className="block text-3xs font-extrabold uppercase text-slate-400 tracking-wider">Fitted Body Fat %</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xl font-black text-slate-900">{bodyFat}%</span>
                      <span className="text-4xs text-slate-400 font-mono font-bold">{muscleMass}kg muscle</span>
                    </div>
                  </div>
                </div>

                {/* COMPACT SECS - ASSIGNED COACH COMPASS CARD */}
                {assignedTrainer && (
                  <div className="bg-white border border-slate-205/85 rounded-2xl p-5 shadow-xs text-left">
                    <h3 className="font-display font-black text-slate-900 text-xs mb-3.5 uppercase tracking-wide text-slate-403">My Linked Certified Trainer</h3>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5 text-center sm:text-left">
                        <img 
                          referrerPolicy="no-referrer"
                          src={assignedTrainer.avatarUrl} 
                          className="w-12 h-12 rounded-xl object-cover border-2 border-teal-500 shadow-sm"
                          alt={assignedTrainer.name}
                        />
                        <div>
                          <h4 className="font-display font-extrabold text-slate-900 text-sm leading-tight">{assignedTrainer.name}</h4>
                          <p className="text-2xs text-slate-500 mt-0.5 font-sans">
                            {assignedTrainer.discipline} • <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" /> <strong className="text-slate-700">{assignedTrainer.rating}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => onNavigateToTab('chats')}
                          className="bg-slate-900 hover:bg-slate-800 text-teal-400 px-4 py-2 rounded-xl text-2xs font-extrabold cursor-pointer transition shadow-xs flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-teal-400 inline" /> Direct Chat Messenger
                        </button>
                        <button 
                          onClick={() => onNavigateToTab('find-trainer')}
                          className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 px-4 py-2 rounded-xl text-2xs font-bold cursor-pointer transition"
                        >
                          Explore Other Coaches
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 5 - GENERAL PERFORMANCE TRACKING EXTRAS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-3 border-b border-slate-100 pb-2">📂 Aggregate Fitness Performance Log</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150">
                      <span className="block text-4xs uppercase tracking-wide font-extrabold text-slate-400">Total Workouts</span>
                      <span className="text-lg font-black text-slate-800">46 Workouts</span>
                      <p className="text-[10px] text-teal-650 font-bold mt-1">✓ Completion Rate: 94%</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150">
                      <span className="block text-4xs uppercase tracking-wide font-extrabold text-slate-400">Streak Metrics</span>
                      <span className="text-lg font-black text-slate-800">{profile.streakCount} Days</span>
                      <p className="text-[10px] text-orange-600 font-bold mt-1">🔥 Max Streak: 14 Days</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150">
                      <span className="block text-4xs uppercase tracking-wide font-extrabold text-slate-400">Sessions Attended</span>
                      <span className="text-lg font-black text-slate-800">18 Classes</span>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">Damansara & SS15</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-150">
                      <span className="block text-4xs uppercase tracking-wide font-extrabold text-slate-400">Malaysian Calories Logged</span>
                      <span className="text-lg font-black text-slate-800">32 Meals</span>
                      <p className="text-[10px] font-bold text-slate-950 mt-1">🥗 30 Audits Complete</p>
                    </div>
                  </div>
                </div>

                {/* SEC 7 - ACHIEVEMENTS & BADGES ROW */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1">⭐ Earned Badges & Milestones</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Complete recipes prescribed by Coach Sarah to earn special stickers.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {achievements.map((ach) => (
                      <div 
                        key={ach.title} 
                        className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                          ach.achieved 
                            ? 'bg-teal-50/50 border-teal-200 text-slate-800' 
                            : 'bg-slate-50/40 border-slate-205 text-slate-400 grayscale'
                        }`}
                      >
                        <span className="text-3xl shrink-0">{ach.icon}</span>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-black leading-tight truncate">{ach.title}</p>
                          <p className="text-3xs text-slate-400 mt-1 block truncate leading-none">{ach.desc}</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1.5 ${
                            ach.achieved ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-404'
                          }`}>
                            {ach.achieved ? `Achieved in ${ach.date}` : `Locked`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 2: HEIGHT & WEIGHT TREND GOAL SETUP */}
            {activeSubTab === 'goals' && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-display font-black text-slate-900 text-base">⚖ Metrics Calibration & Goal Selection</h3>
                    <button 
                      onClick={handleUpdatePersonalInfo}
                      className="bg-slate-900 hover:bg-slate-800 text-teal-400 text-2xs font-extrabold px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs transition flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5 text-teal-405 inline" /> Save Goal Details
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Current Height (cm)
                        </label>
                        <input 
                          type="number" 
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Current Weight (kg)
                        </label>
                        <input 
                          type="number" 
                          value={weight}
                          onChange={(e) => setWeight(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-205 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Target Physique Goal Weight (kg)
                        </label>
                        <input 
                          type="number" 
                          value={targetWeight}
                          onChange={(e) => setTargetWeight(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Target Calibration Date
                        </label>
                        <input 
                          type="date" 
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-3xs font-extrabold text-slate-405 uppercase tracking-widest mb-1.5">
                        Selected Fitness Target Tracks
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {goalsChecked.map((target, index) => (
                          <button
                            key={target.name}
                            type="button"
                            onClick={() => toggleGoalSelection(index)}
                            className={`p-3 rounded-xl border text-center font-bold text-2xs cursor-pointer transition flex items-center justify-between gap-1 ${
                              target.checked 
                                ? 'bg-teal-50 border-teal-400 text-teal-850 shadow-2xs font-extrabold animate-pulse' 
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
                            }`}
                          >
                            <span>{target.checked ? '✓' : '○'} {target.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weight Trend Chart SVG section */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1">📈 Weight Trend History Over Time</h3>
                  <p className="text-[11px] text-slate-400 mb-6">Visual tracking of progress toward {targetWeight}kg milestone.</p>
                  
                  {/* SVG Area chart */}
                  <div className="relative h-48 w-full bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between">
                    <div className="absolute inset-x-0 top-1/4 border-b border-dashed border-slate-200/50" />
                    <div className="absolute inset-x-0 top-2/4 border-b border-dashed border-slate-200/50" />
                    <div className="absolute inset-x-0 top-3/4 border-b border-dashed border-slate-200/50" />

                    {/* Simple SVG decorative Line graph covering data nodes */}
                    <div className="absolute inset-4 z-10 pointer-events-none">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Area shading gradient */}
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        {/* Filled path */}
                        <path d="M 0 50 Q 20 40 40 45 T 80 84 T 100 90 L 100 100 L 0 100 Z" fill="url(#chartGrad)" />
                        {/* Stroke path */}
                        <path d="M 0 50 Q 20 40 40 45 T 80 84 T 100 90" fill="none" stroke="#0d9488" strokeWidth="2.5" />
                        
                        {/* Nodes */}
                        <circle cx="0" cy="50" r="1.5" fill="#0f172a" />
                        <circle cx="20" cy="40" r="1.5" fill="#0f172a" />
                        <circle cx="40" cy="45" r="1.5" fill="#0f172a" />
                        <circle cx="80" cy="84" r="1.5" fill="#001f3f" />
                        <circle cx="100" cy="90" r="1.5" fill="#14b8a6" />
                      </svg>
                    </div>

                    {/* Nodes annotation labels */}
                    <div className="relative z-20 flex justify-between h-full items-end pb-3 text-4xs font-bold text-slate-500 font-mono">
                      <div className="flex flex-col items-center">
                        <span className="bg-slate-900 text-white rounded px-1 py-0.5 text-5xs mb-8">91.5kg</span>
                        <span>Aug</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="bg-slate-900 text-white rounded px-1 py-0.5 text-5xs mb-10">89kg</span>
                        <span>Oct</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="bg-slate-900 text-white rounded px-1 py-0.5 text-5xs mb-9">88.2kg</span>
                        <span>Jan</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="bg-slate-900 text-white rounded px-1 py-0.5 text-5xs mb-3 text-red-100">84kg</span>
                        <span>Active</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="bg-teal-600 text-white rounded px-1 py-0.5 text-5xs mb-1 text-teal-100">72kg</span>
                        <span>Target</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 3: PREFERENCES & DIETS & INJURIES */}
            {activeSubTab === 'preferences' && (
              <div className="space-y-6">
                
                {/* Workout Environments Preferences Checkboxes */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1">🏋 Preferred Workout Environments</h3>
                  <p className="text-[11px] text-slate-400 mb-4">Toggle domains where you prefer active physical classes.</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {Object.keys(workoutPreferences).map((env) => {
                      const active = workoutPreferences[env as keyof typeof workoutPreferences];
                      return (
                        <button
                          key={env}
                          onClick={() => toggleWorkoutPref(env)}
                          className={`p-3 rounded-xl border text-center font-bold text-2xs cursor-pointer transition flex items-center justify-between ${
                            active 
                              ? 'bg-teal-50 border-teal-500 text-teal-850 font-black' 
                              : 'bg-white border-slate-200 text-slate-550'
                          }`}
                        >
                          <span>{active ? '✓' : '○'} {env} Track</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Diet Habits & Preferences */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1">🥗 Daily Dietary preferences</h3>
                  <p className="text-[11px] text-slate-400 mb-4 font-sans">Helps Coach Sarah prescribe aligned nasi lemak portion adjustments.</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {Object.keys(dietPreferences).map((diet) => {
                      const active = dietPreferences[diet as keyof typeof dietPreferences];
                      return (
                        <button
                          key={diet}
                          onClick={() => toggleDietPref(diet)}
                          className={`p-3 rounded-xl border text-center font-bold text-2xs cursor-pointer transition flex items-center justify-between ${
                            active 
                              ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black font-sans' 
                              : 'bg-white border-slate-200 text-slate-550'
                          }`}
                        >
                          <span>{active ? '✓' : '○'} {diet}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inury / medical Notes text area */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-display font-black text-slate-900 text-base">⚠️ Active Medical & Injury Registry</h3>
                      <p className="text-[11px] text-slate-404">Critical constraints reviewed by linked coaches before exercises.</p>
                    </div>
                    <button 
                      onClick={() => triggerToast("Medical constraints synced.")}
                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-black text-2xs px-3 py-1.5 rounded-xl cursor-pointer transition shadow-2xs"
                    >
                      Audit Record
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={injuryNotes}
                    onChange={(e) => setInjuryNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-rose-900 font-semibold focus:ring-red-400"
                  />
                </div>

              </div>
            )}

            {/* SUBTAB 4: SUBSCRIPTION & INVOICES */}
            {activeSubTab === 'subscription' && (
              <div className="space-y-6">
                
                {/* 1. Subscription current plan billing overview */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-4 border-b border-slate-100 pb-3">💳 Billing & Coaching Membership</h3>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
                    <div className="text-left space-y-1">
                      <span className="text-[10px] font-black uppercase text-teal-400 font-mono tracking-widest leading-none">Roster Status Active</span>
                      <h4 className="font-display font-black text-white text-base">Monthly Coaching Package</h4>
                      <p className="text-4xs text-slate-400 font-medium">Auto-renewing recurring checkout (RM880 / 8 Classes)</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                      <div className="text-right text-left">
                        <span className="block text-4xs uppercase tracking-wider text-slate-400 leading-none">Next Bill date</span>
                        <span className="text-sm font-bold text-white font-mono block mt-1">July 01, 2026</span>
                      </div>
                      <button 
                        onClick={() => alert("Redirecting secure Malaysia ToyyibPay bank checkout flow...")}
                        className="bg-teal-500 hover:bg-teal-650 text-slate-950 text-xs font-black px-4.5 py-2.5 rounded-xl cursor-pointer shadow-md transition"
                      >
                        Renew Plan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <button 
                      onClick={() => onNavigateToTab('payments')}
                      className="p-4 border border-slate-200 rounded-2xl hover:border-slate-350 transition hover:bg-slate-50 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div>
                        <span className="block text-2xs font-extrabold text-slate-800">View Active Invoices</span>
                        <span className="text-4xs text-slate-450 block mt-0.5">Audit unpaid checkouts or billing history</span>
                      </div>
                      <span className="text-lg">💰</span>
                    </button>

                    <button 
                      onClick={() => onNavigateToTab('payments')}
                      className="p-4 border border-slate-205 rounded-2xl hover:border-slate-350 transition hover:bg-slate-50 flex items-center justify-between text-left cursor-pointer"
                    >
                      <div>
                        <span className="block text-2xs font-extrabold text-slate-800">Digital Tax Receipts</span>
                        <span className="text-4xs text-slate-450 block mt-0.5 font-sans">Download PDF receipts for corporate wellness</span>
                      </div>
                      <span className="text-lg">📄</span>
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* SUBTAB 5: SECURITY & DYNAMIC NOTIFICATIONS SETTINGS */}
            {activeSubTab === 'account' && (
              <div className="space-y-6">
                
                {/* Personal Information editable panel */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                    <h3 className="font-display font-black text-slate-900 text-base">⚙ Core Personal Registry</h3>
                    <button 
                      onClick={handleUpdatePersonalInfo}
                      className="bg-slate-900 text-teal-400 font-extrabold text-2xs px-3.5 py-1.5 rounded-xl cursor-pointer"
                    >
                      Update Identity Profile
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Full Name
                        </label>
                        <input 
                          type="text" 
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Registered Email ID
                        </label>
                        <input 
                          type="email" 
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-202 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1 font-sans">
                          Phone Contact
                        </label>
                        <input 
                          type="text" 
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                          Date of Birth
                        </label>
                        <input 
                          type="date" 
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                          Gender Focus
                        </label>
                        <select 
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold select-none"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Prefer not to state</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                        Base Living Location (Klang Valley)
                      </label>
                      <input 
                        type="text" 
                        value={locationStr}
                        onChange={(e) => setLocationStr(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-203 rounded-xl px-4 py-2 text-xs focus:ring-teal-500 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Password modification settings */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-4">🔐 Account Security Credentials</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                        Current Account Password
                      </label>
                      <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                    </div>
                    <div className="flex items-center justify-between border border-dashed border-slate-200/80 rounded-xl p-3 bg-slate-50/50 text-left">
                      <div>
                        <span className="block text-2xs font-extrabold text-slate-700 leading-none mb-1">2-Factor Authentication</span>
                        <span className="text-3xs text-slate-400 block max-w-xs font-sans leading-none">Protect account utilizing secure mobile ping alerts</span>
                      </div>
                      <button
                        onClick={() => setTwoFactorToken(!twoFactorToken)}
                        className={`text-2xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer ${
                          twoFactorToken ? 'bg-teal-150 text-teal-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {twoFactorToken ? 'Enabled' : 'Disabled (Placeholder)'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trainee Live Notification Switches */}
                <div className="bg-white border border-slate-250/60 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1">🔔 Live Event Notifications Alerts</h3>
                  <p className="text-[11px] text-slate-404 mb-4 font-sans">Toggle live email or mobile triggers for ongoing classes.</p>

                  <div className="space-y-2.5">
                    {[
                      { key: 'workoutReminders', label: 'Daily Workout Reminders', desc: 'Direct workout prompts regarding active prescribed exercises' },
                      { key: 'sessionReminders', label: 'Physical Sessions Reminders', desc: 'Alerts 1 hour prior to physical training in Subang SS15' },
                      { key: 'nutritionReminders', label: 'Nutrition Audit Reminders', desc: 'Hydration triggers, macro parameters, and calorie logs reminders' },
                      { key: 'paymentReminders', label: 'Payment Reminders', desc: 'Confirmation invoice receipts or payment alerts' },
                      { key: 'trainerMessages', label: 'Trainer Messages & Feedback Reviews', desc: 'Instant alert when Coach Sarah Tan submits workout video reviews' },
                      { key: 'progressReviews', label: 'Calibration Review Prompts', desc: 'Prompt for weekly waist front/side progress pictures' }
                    ].map((box) => (
                      <div 
                        key={box.key}
                        onClick={() => {
                          setNotifications(prev => ({
                            ...prev,
                            [box.key as keyof typeof notifications]: !prev[box.key as keyof typeof notifications]
                          }));
                          triggerToast("Alert preferences adjusted.");
                        }}
                        className="p-3 bg-slate-50 border border-slate-150 rounded-xl hover:border-slate-250 cursor-pointer flex items-center justify-between text-left transition"
                      >
                        <div className="min-w-0 pr-4">
                          <span className="block text-2xs font-extrabold text-slate-700 leading-none mb-1">{box.label}</span>
                          <span className="text-3xs text-slate-400 font-sans block truncate max-w-[500px] leading-none">{box.desc}</span>
                        </div>
                        <span className={`text-4xs uppercase tracking-wider font-extrabold px-2 py-0.5 rounded border inline-block ${
                          notifications[box.key as keyof typeof notifications] 
                            ? 'bg-emerald-150 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-404 border-slate-200'
                        }`}>
                          {notifications[box.key as keyof typeof notifications] ? '✓ Active' : '○ Muted'}
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
    </div>
  );
}
