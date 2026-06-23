import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Mail, 
  Phone, 
  Scale, 
  Cpu, 
  Settings, 
  Bell, 
  RefreshCw, 
  Sparkles,
  CheckCircle,
  Save,
  Star,
  Download,
  AlertCircle,
  Lock,
  PlusCircle,
  Fingerprint,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TraineeProfile, TrainerProfile } from '../types';
import { 
  getSharedBodyLogs, 
  setSharedBodyLogs, 
  BodyLog 
} from '../lib/sharedHistory';

interface TraineeProfilePageProps {
  traineeProfile: TraineeProfile;
  assignedTrainer: TrainerProfile | null;
  onUpdateProfile: (updated: TraineeProfile) => void;
  onNavigateToTab: (tab: string) => void;
  onLogout?: () => void;
}

/**
 * Clean volumetric 3D fitness mannequin scanner model.
 * Fits the aesthetic look requested by the fitness tracker system (CoachTrack MY).
 */
function BodyScannerMannequin({ latestLog, isMale, showCallouts }: { latestLog: any; isMale: boolean; showCallouts?: boolean }) {
  const chest = latestLog.chest || 104;
  const waist = latestLog.waist || 94;
  const hip = latestLog.hip || 108;
  const arm = latestLog.arm || 38;
  const thigh = latestLog.thigh || 62;

  // Proportional metrics offsets
  const chestOffset = Math.max(-8, Math.min(8, (chest - 104) * 0.28));
  const waistOffset = Math.max(-8, Math.min(8, (waist - 94) * 0.32));
  const hipOffset = Math.max(-8, Math.min(8, (hip - 108) * 0.28));
  const armOffset = Math.max(-5, Math.min(5, (arm - 38) * 0.38));
  const thighOffset = Math.max(-6, Math.min(6, (thigh - 62) * 0.3));

  // Node placements
  const leftShoulderX = 46 - chestOffset * 0.2;
  const rightShoulderX = 114 + chestOffset * 0.2;
  const leftArmpitX = 59 - chestOffset * 0.1;
  const rightArmpitX = 101 + chestOffset * 0.1;
  const leftWaistX = 63 - waistOffset * 0.4;
  const rightWaistX = 97 + waistOffset * 0.4;
  const leftHipX = 59 - hipOffset * 0.4;
  const rightHipX = 101 + hipOffset * 0.4;
  const leftArmX = 35 - armOffset;
  const rightArmX = 125 + armOffset;

  return (
    <div className={`relative border border-slate-100 rounded-[24px] bg-[#F8FAFC]/40 p-4 shadow-3xs flex flex-col items-center justify-center overflow-hidden w-full transition-all duration-300 ${showCallouts ? 'min-h-[290px]' : 'min-h-[200px]'}`}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] select-none">
        <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-slate-400" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-slate-400" />
      </div>

      <svg viewBox="0 0 160 260" className={`w-full overflow-visible drop-shadow-[0_4px_12px_rgba(100,116,139,0.06)] relative z-10 transition-all duration-300 ${showCallouts ? 'h-72' : 'h-48'}`}>
        <defs>
          <linearGradient id="mannequin3DGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="leftArmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="rightArmGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="shortsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* HEAD & NECK */}
        <ellipse cx="80" cy="24" rx="9.5" ry="11" fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />
        <path d="M 75,34 L 75,45 Q 80,47 85,45 L 85,34 Z" fill="url(#mannequin3DGrad)" stroke="#CBD5E1" strokeWidth="0.5" />

        {/* TORSO */}
        <path 
          d={`
            M 74,45 
            C 65,45 52,48 ${leftShoulderX},48 
            C 42,55 45,72 ${leftArmpitX},74 
            C 60,90 61,105 ${leftWaistX},115 
            C 64,125 61,135 ${leftHipX},148 
            C 65,152 75,160 80,162 
            C 85,160 95,152 ${rightHipX},148 
            C 99,135 96,125 ${rightWaistX},115 
            C 99,105 100,90 ${rightArmpitX},74 
            C 115,72 118,55 ${rightShoulderX},48 
            C 108,48 95,45 86,45 
            Z
          `}
          fill="url(#mannequin3DGrad)"
          stroke="#94A3B8"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* ARMS */}
        {/* Left Arm */}
        <path 
          d={`
            M ${leftShoulderX}, 48 
            C ${leftArmX}, 55 ${leftArmX}, 75 ${leftArmX}, 95 
            C ${leftArmX}, 110 ${leftArmX + 1}, 125 ${leftArmX + 1}, 155 
            C ${leftArmX + 1}, 158 ${leftArmX + 5}, 158 ${leftArmX + 6}, 155 
            C ${leftArmX + 8}, 125 ${leftArmX + 10}, 110 ${leftArmX + 11}, 95 
            C ${leftArmX + 12}, 85 ${leftArmX + 17}, 76 ${leftArmpitX}, 74 
            C ${leftArmX + 9}, 60 ${leftArmX + 7}, 54 ${leftShoulderX}, 48 
            Z
          `}
          fill="url(#leftArmGrad)"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />
        {/* Left Hand */}
        <path d={`M ${leftArmX + 1}, 155 C ${leftArmX}, 160 ${leftArmX + 2}, 166 ${leftArmX + 4}, 167 C ${leftArmX + 6}, 166 ${leftArmX + 7}, 160 ${leftArmX + 6}, 155 Z`} fill="url(#leftArmGrad)" stroke="#94A3B8" strokeWidth="0.5" />

        {/* Right Arm */}
        <path 
          d={`
            M ${rightShoulderX}, 48 
            C ${rightArmX}, 55 ${rightArmX}, 75 ${rightArmX}, 95 
            C ${rightArmX}, 110 ${rightArmX - 1}, 125 ${rightArmX - 1}, 155 
            C ${rightArmX - 1}, 158 ${rightArmX - 5}, 158 ${rightArmX - 6}, 155 
            C ${rightArmX - 8}, 125 ${rightArmX - 10}, 110 ${rightArmX - 11}, 95 
            C ${rightArmX - 12}, 85 ${rightArmX - 17}, 76 ${rightArmpitX}, 74 
            C ${rightArmX - 9}, 60 ${rightArmX - 7}, 54 ${rightShoulderX}, 48 
            Z
          `}
          fill="url(#rightArmGrad)"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />
        {/* Right Hand */}
        <path d={`M ${rightArmX - 1}, 155 C ${rightArmX}, 160 ${rightArmX - 2}, 166 ${rightArmX - 4}, 167 C ${rightArmX - 6}, 166 ${rightArmX - 7}, 160 ${rightArmX - 6}, 155 Z`} fill="url(#rightArmGrad)" stroke="#94A3B8" strokeWidth="0.5" />

        {/* COMPRESSION SHORTS */}
        <path 
          d={`
            M ${leftWaistX + 1}, 122 
            L ${rightWaistX - 1}, 122 
            C ${rightWaistX + 2}, 135 ${rightHipX + 1}, 148 ${rightHipX + 1}, 150 
            L 99, 175 
            L 85, 175 
            L 80, 156 
            L 75, 175 
            L 61, 175 
            C 60, 150 ${leftHipX - 1}, 148 ${leftHipX - 1}, 150 
            Z
          `} 
          fill="url(#shortsGrad)" 
        />

        {/* LEGS */}
        {/* Left Leg */}
        <path d={`M ${leftHipX}, 148 C ${54 - thighOffset * 0.4}, 160 ${55 - thighOffset * 0.4}, 185 63, 202 C 64, 215 60, 222 60, 228 C 60, 235 64, 245 66, 248 L 70, 248 C 71, 245 74, 235 74, 228 C 74, 222 71, 215 71, 202 C 73, 185 75, 172 80, 162 Z`} fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />
        <path d="M 66, 248 L 63, 255 L 71, 255 L 70, 248 Z" fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />

        {/* Right Leg */}
        <path d={`M ${rightHipX}, 148 C ${106 + thighOffset * 0.4}, 160 ${105 + thighOffset * 0.4}, 185 97, 202 C 96, 215 100, 222 100, 228 C 100, 235 96, 245 94, 248 L 90, 248 C 89, 245 86, 235 86, 228 C 86, 222 89, 215 89, 202 C 87, 185 85, 172 80, 162 Z`} fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />
        <path d="M 94, 248 L 97, 255 L 89, 255 L 90, 248 Z" fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />

        {/* Callout Pins rendering with precise non-overlapping positions outside body */}
        {showCallouts && (
          <g>
            {/* Chest Girth Pin (Teal - Left Side) - Upper chest / pectoral line */}
            <line x1="66" y1="68" x2="20" y2="68" stroke="#14B8A6" strokeWidth="0.5" />
            <circle cx="66" cy="68" r="1.5" fill="#14B8A6" />
            <circle cx="20" cy="68" r="1.5" fill="#14B8A6" />
            <text x="16" y="71" textAnchor="end" className="text-[8.5px] font-bold fill-[#0d9488] font-sans leading-none">Chest {chest} cm</text>

            {/* Arm Girth Pin (Orange - Left Side) - Upper arm / bicep */}
            <line x1="36" y1="82" x2="20" y2="82" stroke="#F97316" strokeWidth="0.5" />
            <circle cx="36" cy="82" r="1.5" fill="#F97316" />
            <circle cx="20" cy="82" r="1.5" fill="#F97316" />
            <text x="16" y="85" textAnchor="end" className="text-[8.5px] font-bold fill-[#c2410c] font-sans leading-none">Arm {arm} cm</text>

            {/* Hip Girth Pin (Purple - Left Side) - Hip / pelvis area */}
            <line x1="59" y1="144" x2="20" y2="144" stroke="#8B5CF6" strokeWidth="0.5" />
            <circle cx="59" cy="144" r="1.5" fill="#8B5CF6" />
            <circle cx="20" cy="144" r="1.5" fill="#8B5CF6" />
            <text x="16" y="147" textAnchor="end" className="text-[8.5px] font-bold fill-[#6d28d9] font-sans leading-none">Hip {hip} cm</text>

            {/* Waist Girth Pin (Blue - Right Side) - Natural waist / abdomen */}
            <line x1="96" y1="116" x2="140" y2="116" stroke="#3B82F6" strokeWidth="0.5" />
            <circle cx="96" cy="116" r="1.5" fill="#3B82F6" />
            <circle cx="140" cy="116" r="1.5" fill="#3B82F6" />
            <text x="144" y="119" textAnchor="start" className="text-[8.5px] font-bold fill-[#1d4ed8] font-sans leading-none">Waist {waist} cm</text>

            {/* Thigh Girth Pin (Navy - Right Side) - Upper thigh, above knee */}
            <line x1="90" y1="178" x2="140" y2="178" stroke="#082567" strokeWidth="0.5" />
            <circle cx="90" cy="178" r="1.5" fill="#082567" />
            <circle cx="140" cy="178" r="1.5" fill="#082567" />
            <text x="144" y="181" textAnchor="start" className="text-[8.5px] font-bold fill-[#082567] font-sans leading-none">Thigh {thigh} cm</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function TraineeProfilePage({ 
  traineeProfile, 
  assignedTrainer, 
  onUpdateProfile, 
  onNavigateToTab,
  onLogout
}: TraineeProfilePageProps) {
  
  const [profile, setProfile] = useState<TraineeProfile>(traineeProfile);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'weight' | 'measurements' | 'medical' | 'settings'>('overview');
  const [expandedCheckIns, setExpandedCheckIns] = useState<Record<number, boolean>>({});
  
  // Localized Profile States
  const [nameInput, setNameInput] = useState(traineeProfile.name || "Ahmad Bin Ibrahim");
  const [emailInput, setEmailInput] = useState("ahmad@coachtrack.my");
  const [phoneInput, setPhoneInput] = useState("+60 17-291 3810");
  const [dob, setDob] = useState("1998-04-12");
  const [gender, setGender] = useState("Male");
  const [locationStr, setLocationStr] = useState("SS15, Subang Jaya, Selangor");

  // Goals
  const [goalsChecked, setGoalsChecked] = useState([
    { name: 'Weight Loss', checked: true },
    { name: 'Muscle Gain', checked: false },
    { name: 'General Fitness', checked: true },
    { name: 'Sports Performance', checked: false },
    { name: 'Yoga & Flexibility', checked: false },
    { name: 'Rehabilitation', checked: false },
    { name: 'Marathon Training', checked: true },
  ]);
  const [targetWeightConst, setTargetWeightConst] = useState(72.0);

  // New persistent states for Medical History records
  const [bloodType, setBloodType] = useState(() => localStorage.getItem('coachtrack_med_blood') || "O+");
  const [allergies, setAllergies] = useState(() => localStorage.getItem('coachtrack_med_allergies') || "Peanuts, Shellfish & Trace Soy");
  const [conditions, setConditions] = useState(() => localStorage.getItem('coachtrack_med_conditions') || "Mild Exercise-Induced Asthma");
  const [prevInjuries, setPrevInjuries] = useState(() => localStorage.getItem('coachtrack_med_injuries') || "Right shoulder anterior AC sprain (2025 rehabilitation)");
  const [medications, setMedications] = useState(() => localStorage.getItem('coachtrack_med_medications') || "Ventolin inhaler (1-2 puffs post workout as needed)");
  const [emergencyContact, setEmergencyContact] = useState(() => localStorage.getItem('coachtrack_med_emergency') || "Ibrahim Bin Abdul Rahman (Father) — +60 12-345 6789");
  const [coachMedicalNotes, setCoachMedicalNotes] = useState(() => localStorage.getItem('coachtrack_med_coach_notes') || "Tight shoulder extension when tired. Avoid overhead exercises exceeding 25kg. Squat load must be watched.");

  // Password / Toggles
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

  // Modal Control for Record New Weight
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [inputWeight, setInputWeight] = useState("");
  const [inputBodyFat, setInputBodyFat] = useState("");
  const [inputNotes, setInputNotes] = useState("");

  // Modal Control for Record New Girth
  const [showGirthModal, setShowGirthModal] = useState(false);
  const [inputChest, setInputChest] = useState("");
  const [inputWaist, setInputWaist] = useState("");
  const [inputHip, setInputHip] = useState("");
  const [inputArm, setInputArm] = useState("");
  const [inputThigh, setInputThigh] = useState("");
  const [inputGirthNotes, setInputGirthNotes] = useState("");
  const [expandedGirthRow, setExpandedGirthRow] = useState<number | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time synchronization loader
  const [sharedBodyLogs, setSharedBodyLogsLocal] = useState<Record<string, BodyLog[]>>(() => getSharedBodyLogs());

  const currentLogs = sharedBodyLogs[profile.id] || [];
  const latestLog = currentLogs[currentLogs.length - 1] || {
    date: "2026-06-21",
    weight: 84,
    height: 176,
    waist: 94,
    chest: 104,
    hip: 108,
    arm: 38,
    thigh: 62,
    bmi: 27.1,
    bmr: 1805,
    bodyFat: 21.8,
    notes: "Postural stability on deep squats is steady."
  };
  const prevLog = currentLogs.length > 1 ? currentLogs[currentLogs.length - 2] : null;

  const currentWeight = latestLog.weight;
  const height = latestLog.height;
  const bmiValue = latestLog.bmi;
  const bmrValue = latestLog.bmr;

  const syncBodyLogsFromStorage = () => {
    setSharedBodyLogsLocal(getSharedBodyLogs());
  };

  // Sync state with localstorage on mount and focus
  useEffect(() => {
    syncBodyLogsFromStorage();
    window.addEventListener('focus', syncBodyLogsFromStorage);
    return () => window.removeEventListener('focus', syncBodyLogsFromStorage);
  }, []);

  // Save Medical records
  const handleSaveMedicalHistory = () => {
    localStorage.setItem('coachtrack_med_blood', bloodType);
    localStorage.setItem('coachtrack_med_allergies', allergies);
    localStorage.setItem('coachtrack_med_conditions', conditions);
    localStorage.setItem('coachtrack_med_injuries', prevInjuries);
    localStorage.setItem('coachtrack_med_medications', medications);
    localStorage.setItem('coachtrack_med_emergency', emergencyContact);
    localStorage.setItem('coachtrack_med_coach_notes', coachMedicalNotes);
    triggerToast("Medical records and health checklist securely synced!");
  };

  const handleUpdatePersonalInfo = async () => {
    const updated = {
      ...profile,
      name: nameInput,
      goals: goalsChecked.filter(g => g.checked).map(g => g.name).join(', ')
    };
    onUpdateProfile(updated);
    setProfile(updated);
    triggerToast("Identity and fitness registry saved!");
  };

  // Action function to add new scale check-in
  const handleAddNewWeightCheckIn = () => {
    const parsedWeight = parseFloat(inputWeight);
    const parsedFat = parseFloat(inputBodyFat) || 20;
    
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      triggerToast("Please enter a valid scale weight.");
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const newLogItem: BodyLog = {
      date: todayStr,
      weight: parsedWeight,
      height: latestLog.height || 176,
      bmi: parseFloat((parsedWeight / Math.pow((latestLog.height || 176) / 100, 2)).toFixed(1)),
      bmr: latestLog.bmr || 1805,
      bodyFat: parsedFat,
      waist: latestLog.waist || 94,
      chest: latestLog.chest || 104,
      hip: latestLog.hip || 108,
      arm: latestLog.arm || 38,
      thigh: latestLog.thigh || 62,
      notes: inputNotes || "Scale weight updated."
    };

    const updatedUserLogs = [...currentLogs, newLogItem];
    const updatedAllLogs = {
      ...sharedBodyLogs,
      [profile.id]: updatedUserLogs
    };

    // Commit to localStorage
    setSharedBodyLogs(updatedAllLogs);
    setSharedBodyLogsLocal(updatedAllLogs);
    
    // Close & reset
    setShowWeightModal(false);
    setInputWeight("");
    setInputBodyFat("");
    setInputNotes("");
    
    triggerToast(`Added weight logs: ${parsedWeight}kg registrado! ✓`);
  };

  // Action function to add new girth check-in
  const handleAddNewGirthCheckIn = () => {
    const parsedChest = parseFloat(inputChest);
    const parsedWaist = parseFloat(inputWaist);
    const parsedHip = parseFloat(inputHip);
    const parsedArm = parseFloat(inputArm);
    const parsedThigh = parseFloat(inputThigh);

    if (isNaN(parsedChest) || isNaN(parsedWaist) || isNaN(parsedHip) || isNaN(parsedArm) || isNaN(parsedThigh)) {
      triggerToast("Please fill in all girth circumference values.");
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const newLogItem: BodyLog = {
      date: todayStr,
      weight: latestLog.weight || 84,
      height: latestLog.height || 176,
      bmi: latestLog.bmi || 27.1,
      bmr: latestLog.bmr || 1805,
      bodyFat: latestLog.bodyFat || 21.8,
      chest: parsedChest,
      waist: parsedWaist,
      hip: parsedHip,
      arm: parsedArm,
      thigh: parsedThigh,
      notes: inputGirthNotes || "Girth circumferences updated."
    };

    const updatedUserLogs = [...currentLogs, newLogItem];
    const updatedAllLogs = {
      ...sharedBodyLogs,
      [profile.id]: updatedUserLogs
    };

    // Commit to localStorage
    setSharedBodyLogs(updatedAllLogs);
    setSharedBodyLogsLocal(updatedAllLogs);

    // Close & reset
    setShowGirthModal(false);
    setInputChest("");
    setInputWaist("");
    setInputHip("");
    setInputArm("");
    setInputThigh("");
    setInputGirthNotes("");

    triggerToast("Girth measurements recorded successfully! ✓");
  };

  // CSV Exporters
  const handleDownloadWeightCSV = () => {
    const csvHeaders = "Date,Weight (kg),Height (cm),BMI,BMR,Body Fat (%)\n";
    const csvRows = currentLogs.map(l => {
      return `"${l.date}",${l.weight},${l.height},${l.bmi},${l.bmr},${l.bodyFat}`;
    }).join("\n");
    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${profile.name.replace(/\s+/g, '_')}_Weight_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNavigateToTab('profile');
    triggerToast("Weight history CSV downloaded successfully! ✓");
  };

  const handleDownloadMeasurementsCSV = () => {
    const csvHeaders = "Date,Chest (cm),Waist (cm),Hip (cm),Arm (cm),Thigh (cm)\n";
    const csvRows = currentLogs.map(l => {
      return `"${l.date}",${l.chest},${l.waist},${l.hip},${l.arm},${l.thigh}`;
    }).join("\n");
    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${profile.name.replace(/\s+/g, '_')}_Circumference_Girth.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Girth measurements CSV downloaded successfully! ✓");
  };

  return (
    <div className="w-full bg-[#FAFBFC] min-h-screen pb-16 pt-5 text-slate-800 text-left relative box-border font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Saved Alert Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-55 bg-[#001F3F] border-b-4 border-teal-400 text-teal-300 font-bold px-4 py-3 rounded-2xl shadow-xl text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* PREMIUM PROFILE SUMMARY CARD */}
        <div className="bg-gradient-to-br from-[#081F63] to-[#041033] text-white border border-slate-800 rounded-[28px] p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative overflow-hidden">
          {/* Subtle background glow decoration matching CoachTrack MY styling */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-5 z-10 w-full md:w-auto">
            <img 
              referrerPolicy="no-referrer"
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'} 
              className="w-16 h-16 rounded-[20px] object-cover border-2 border-teal-400/30 shadow-sm shrink-0" 
              alt={profile.name}
            />
            <div className="text-center sm:text-left space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">{profile.name}</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-bold font-sans border border-teal-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                Fitness Goal: Weight Loss
              </span>
            </div>
          </div>

          {/* Quick Stats Block with premium spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto z-10">
            {/* Assigned Coach */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-400">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-teal-200/60 font-extrabold uppercase tracking-wider font-sans">Assigned Coach</span>
                <span className="text-xs font-black text-white">Sarah Tan</span>
              </div>
            </div>

            {/* Active Streak */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-350 font-sans">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-teal-200/60 font-extrabold uppercase tracking-wider font-sans">Active Streak</span>
                <span className="text-xs font-black text-teal-300">5 Days</span>
              </div>
            </div>

            {/* Current Plan */}
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-xl bg-teal-400/20 flex items-center justify-center text-teal-400">
                <Calendar className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-teal-200/60 font-extrabold uppercase tracking-wider font-sans">Current Plan</span>
                <span className="text-xs font-black text-white">8 Classes / Month</span>
              </div>
            </div>
          </div>

          {/* Refresh Action */}
          <div className="flex items-center gap-2 z-10 self-stretch sm:self-auto justify-center sm:justify-start">
            <button 
              onClick={() => {
                syncBodyLogsFromStorage();
                triggerToast("Fetched latest dashboard weights and coach notes! ✓");
              }}
              className="w-full sm:w-auto bg-teal-400 hover:bg-teal-350 text-[#081F63] border-none py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>
        </div>

        {/* MAIN SPLIT NAVIGATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sidebar Tabs Panel - 5 tabs only */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200 no-scrollbar select-none scroll-smooth">
            {[
              { id: 'overview', icon: User, label: 'Overview' },
              { id: 'weight', icon: Scale, label: 'Weight Tracking' },
              { id: 'measurements', icon: TrendingUp, label: 'Body Measurements' },
              { id: 'medical', icon: ShieldCheck, label: 'Medical History' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((tab) => {
              const active = activeSubTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex-1 lg:flex-initial text-left px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    active 
                      ? 'bg-slate-900 text-teal-400 shadow-sm font-black' 
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-950'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Workspace Frame */}
          <div className="lg:col-span-9 space-y-6">

            {/* TAB 1: OVERVIEW COMPREHENSIVE HUB */}
            {activeSubTab === 'overview' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Primary Metric Metrics: Current Weight vs BMI vs Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs text-left">
                    <span className="block text-xs font-semibold text-slate-500">Current Registered Weight</span>
                    <strong className="text-4xl font-extrabold text-slate-950 block mt-1.5 leading-none">
                      {currentWeight} <span className="text-sm font-semibold text-slate-400">kg</span>
                    </strong>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs text-left">
                    <span className="block text-xs font-semibold text-slate-500">BMI</span>
                    <strong className="text-4xl font-extrabold text-indigo-950 block mt-1.5 leading-none">
                      {bmiValue} <span className="text-xs font-bold text-[#FF8C00] bg-[#FFF8E7] px-2 py-0.5 rounded-lg ml-2 font-sans">Overweight</span>
                    </strong>
                  </div>
                </div>

                {/* Current Subscription Plan */}
                <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs text-left">
                  <h3 className="font-sans font-bold text-[#081F63] text-[13px] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>Current Subscription Plan</span>
                  </h3>
                  <div className="bg-slate-900 text-white rounded-xl p-4 space-y-1 border border-slate-800">
                    <strong className="block text-xs font-black text-teal-400">8 Classes Per Month</strong>
                    <span className="text-[11px] block text-slate-300 font-semibold">RM 600 / month recurrence billing</span>
                    <span className="text-xs text-slate-400 font-medium block mt-1">Next Bill Date: July 01, 2026</span>
                  </div>
                </div>

                {/* Assigned Coach Profile Card */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-3xs text-left">
                  <h3 className="text-lg font-bold text-[#081F63] mb-4 font-sans flex items-center gap-1.5">
                    <User className="w-5 h-5 text-teal-500" />
                    <span>Assigned Personal Coach</span>
                  </h3>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-3xs shrink-0"
                        alt="Coach Sarah Tan"
                      />
                      <div className="text-center sm:text-left space-y-1.5">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h4 className="text-lg font-bold text-[#081F63] leading-none">
                            Coach Sarah Tan
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-600 font-bold text-[11px] border border-teal-100 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            Verified Coach
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium text-slate-500">
                          Yoga & Pilates Instructor
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs font-semibold text-slate-400">
                          <span className="text-[#FF8C00] font-bold">⭐ 4.8 Rating</span>
                          <span className="text-slate-300">•</span>
                          <span>📍 Location: SS15, Subang Jaya</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 shrink-0">
                      <button 
                        onClick={() => onNavigateToTab('chats')}
                        className="flex-1 md:flex-none text-white hover:bg-[#041033] bg-[#081F63] font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-3xs transition flex items-center justify-center gap-1.5"
                      >
                        Chat Coach
                      </button>
                      <button 
                        onClick={() => triggerToast("Coach Sarah Tan is registered Active. Base SS15 Studio Selangor.")}
                        className="flex-1 md:flex-none text-slate-750 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5"
                      >
                        View Coach Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fitness Performance Quick Statistics */}
                <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs text-left">
                  <h3 className="font-sans font-bold text-[#081F63] text-[13px] uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-500" />
                    <span>Quick Performance Statistics</span>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl">
                      <span className="block text-xs font-medium text-slate-500">Total Workouts</span>
                      <strong className="block text-slate-900 text-base font-black mt-1">46 Completed</strong>
                    </div>
                    <div className="p-4 bg-teal-50/50 border border-teal-100/50 rounded-2xl">
                      <span className="block text-xs font-medium text-slate-500">Sessions Attended</span>
                      <strong className="block text-slate-900 text-base font-black mt-1">18 Classes</strong>
                    </div>
                    <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl">
                      <span className="block text-xs font-medium text-slate-500">Meals Logged</span>
                      <strong className="block text-slate-900 text-base font-black mt-1">32 Logged</strong>
                    </div>
                    <div className="p-4 bg-rose-50/50 border border-rose-100/50 rounded-2xl">
                      <span className="block text-xs font-medium text-slate-500">Max Streak reached</span>
                      <strong className="block text-slate-900 text-base font-black mt-1 text-rose-700">14 Days 🔥</strong>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: WEIGHT TRACKING SECTION */}
            {activeSubTab === 'weight' && (() => {
              const goalW = targetWeightConst;
              const chartWeights = currentLogs.map(l => l.weight);
              const minChartW = Math.min(...chartWeights, goalW) - 3;
              const maxChartW = Math.max(...chartWeights, 85) + 3;
              const rangeW = maxChartW - minChartW || 10;

              const svgWidth = 320;
              const svgHeight = 100; // REDUCED BY 40% (Previously 155)
              const padLeft = 40;
              const padRight = 10;
              const padTop = 15;
              const padBottom = 20;

              const getSvgX = (index: number, total: number) => {
                if (total <= 1) return padLeft + (svgWidth - padLeft - padRight) / 2;
                return padLeft + index * (svgWidth - padLeft - padRight) / (total - 1);
              };

              const getSvgY = (val: number) => {
                return svgHeight - padBottom - ((val - minChartW) / rangeW) * (svgHeight - padTop - padBottom);
              };

              let pathD = "";
              let areaD = "";
              if (currentLogs.length > 0) {
                pathD = currentLogs.map((l, idx) => {
                  const x = getSvgX(idx, currentLogs.length);
                  const y = getSvgY(l.weight);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(" ");

                if (currentLogs.length > 1) {
                  const startX = getSvgX(0, currentLogs.length);
                  const endX = getSvgX(currentLogs.length - 1, currentLogs.length);
                  const bottomY = svgHeight - padBottom;
                  areaD = `${pathD} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
                }
              }

              const goalY = getSvgY(goalW);

              return (
                <div className="space-y-6 animate-fade-in text-left">
                  
                  {/* Title Bar - Compact */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <Scale className="w-5 h-5 text-teal-650" />
                        <span>Weight Analytics</span>
                      </h2>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Last Sync: Today</span>
                  </div>

                  {/* 1. Weight Overview - Compact 2x2 grid */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-3xs">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Weight Overview</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Current Weight</span>
                        <strong className="text-slate-950 text-base font-black mt-0.5 block">{currentWeight} kg</strong>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Target Weight</span>
                        <strong className="text-teal-650 text-base font-black mt-0.5 block">{goalW} kg</strong>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">BMI</span>
                        <strong className="text-slate-950 text-base font-black mt-0.5 block">{bmiValue}</strong>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">BMR</span>
                        <strong className="text-indigo-950 text-base font-black mt-0.5 block">{bmrValue} kcal</strong>
                      </div>
                    </div>
                  </div>

                  {/* 2. Progress Summary */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-3xs">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Progress Summary</h3>
                    
                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 border border-slate-100 p-3 rounded-xl mb-3">
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Start</span>
                        <span className="text-xs font-black text-slate-700">91.5 kg</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Current</span>
                        <span className="text-xs font-black text-slate-950">{currentWeight} kg</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-extrabold text-slate-400 block uppercase">Target</span>
                        <span className="text-xs font-black text-teal-600">{goalW} kg</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/50 relative mb-2">
                      <div className="bg-gradient-to-r from-teal-400 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: '38.5%' }} />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-500">Goal Progress:</span>
                        <span className="text-sm font-semibold text-teal-650">38.5%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-slate-500">Total Weight Lost:</span>
                        <span className="text-sm font-semibold text-teal-650">-7.5 kg achieved</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Weekly Weight Trend - Height reduced approx 40% (to 100px) */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 shadow-3xs">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Weekly Weight Trend</h3>
                    
                    <div className="w-full h-28 relative bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                        <line x1={padLeft} y1={getSvgY(maxChartW)} x2={svgWidth - padRight} y2={getSvgY(maxChartW)} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2,2" />
                        <line x1={padLeft} y1={getSvgY(minChartW)} x2={svgWidth - padRight} y2={getSvgY(minChartW)} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2,2" />

                        {/* Benchmark Line */}
                        <line x1={padLeft} y1={goalY} x2={svgWidth - padRight} y2={goalY} stroke="#F97316" strokeWidth="1" strokeDasharray="3,3" />
                        <text x={svgWidth - padRight - 5} y={goalY - 2} textAnchor="end" fill="#F97316" className="text-[7.5px] font-black uppercase tracking-wider font-sans">
                          Goal: {goalW}kg
                        </text>

                        {areaD && (
                          <path d={areaD} fill="url(#weightGradCompact)" opacity="0.1" />
                        )}

                        {pathD && (
                          <path d={pathD} fill="none" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
                        )}

                        {currentLogs.map((l, idx) => {
                          const x = getSvgX(idx, currentLogs.length);
                          const y = getSvgY(l.weight);
                          return (
                            <g key={idx}>
                              <circle cx={x} cy={y} r="3.5" fill="#14B8A6" stroke="#FFF" strokeWidth="1" />
                              <text x={x} y={y - 5} textAnchor="middle" fill="#082567" className="text-[8px] font-bold font-mono">
                                {l.weight}
                              </text>
                            </g>
                          );
                        })}

                        {currentLogs.map((l, idx) => {
                          const x = getSvgX(idx, currentLogs.length);
                          const dtLabel = new Date(l.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
                          return (
                            <text key={idx} x={x} y={svgHeight - 2} textAnchor="middle" fill="#94A3B8" className="text-[7.5px] font-bold font-sans">
                              {dtLabel}
                            </text>
                          );
                        })}

                        <defs>
                          <linearGradient id="weightGradCompact" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#14B8A6" />
                            <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>

                  {/* 4. Recent Check-ins */}
                  <div className="space-y-3 text-left animate-fade-in">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Check-ins</h3>
                    
                    <div className="space-y-2.5">
                      {[...currentLogs].reverse().map((l, lIdx) => {
                        const isExpanded = !!expandedCheckIns[lIdx];
                        const toggleExpand = () => {
                          setExpandedCheckIns(prev => ({
                            ...prev,
                            [lIdx]: !prev[lIdx]
                          }));
                        };

                        return (
                          <div 
                            key={lIdx} 
                            className="bg-white border border-slate-200/80 rounded-2xl shadow-3xs overflow-hidden transition-all duration-300 text-left"
                          >
                            {/* Collapsed Header / Row */}
                            <div 
                              onClick={toggleExpand}
                              className="flex items-center justify-between px-4 py-4 md:py-5 min-h-[64px] md:min-h-[72px] cursor-pointer select-none hover:bg-slate-50/50 transition duration-150"
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-slate-500">{l.date}</span>
                                <span className="text-md font-semibold text-slate-900">{l.weight} kg</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Validated
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Expanded State content */}
                            {isExpanded && (
                              <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4 animate-fade-in text-left">
                                <div className="grid grid-cols-3 gap-3 text-center">
                                  <div className="bg-white p-3 rounded-xl border border-slate-150">
                                    <span className="text-[10px] font-medium text-slate-500 block uppercase tracking-wider">Weight</span>
                                    <strong className="text-slate-950 font-black text-sm block mt-0.5">{l.weight} kg</strong>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-150">
                                    <span className="text-[10px] font-medium text-slate-500 block uppercase tracking-wider">Body Fat</span>
                                    <strong className="text-indigo-950 font-black text-sm block mt-0.5">{l.bodyFat}%</strong>
                                  </div>
                                  <div className="bg-white p-3 rounded-xl border border-slate-150">
                                    <span className="text-[10px] font-medium text-slate-500 block uppercase tracking-wider">BMI</span>
                                    <strong className="text-slate-800 font-extrabold text-sm block mt-0.5">{l.bmi}</strong>
                                  </div>
                                </div>

                                <div className="bg-white border border-slate-150 rounded-xl p-3 text-xs text-slate-650 leading-relaxed">
                                  <span className="text-[8px] font-black text-[#14B8A6] block uppercase mb-1">Coach Sarah Diagnostic Notes</span>
                                  {l.notes || "Baseline Calibration."}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                    <button
                      onClick={() => setShowWeightModal(true)}
                      className="w-full sm:flex-1 bg-[#081F63] hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Record New Weight</span>
                    </button>
                    <button
                      onClick={handleDownloadWeightCSV}
                      className="w-full sm:flex-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-350 px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Weight CSV</span>
                    </button>
                  </div>

                </div>
              );
            })()}

            {/* TAB 3: BODY MEASUREMENTS CIRMCUMFERENCE */}
            {activeSubTab === 'measurements' && (() => {
              const scaleTicks = [20, 40, 60, 80, 100, 120];
              const svgWidth = 340;
              const svgHeight = 175;
              const padLeft = 40;
              const padRight = 10;
              const padTop = 15;
              const padBottom = 25;

              const getSvgX = (index: number, total: number) => {
                if (total <= 1) return padLeft + (svgWidth - padLeft - padRight) / 2;
                return padLeft + index * (svgWidth - padLeft - padRight) / (total - 1);
              };

              const getGirthY = (val: number) => {
                const minVal = 15;
                const maxVal = 125;
                return svgHeight - padBottom - ((val - minVal) / (maxVal - minVal)) * (svgHeight - padTop - padBottom);
              };

              // Map curves
              const makePath = (field: keyof BodyLog) => {
                if (currentLogs.length === 0) return "";
                return currentLogs.map((l, idx) => {
                  const x = getSvgX(idx, currentLogs.length);
                  const y = getGirthY(Number(l[field]) || 0);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(" ");
              };

              const chestPath = makePath('chest');
              const waistPath = makePath('waist');
              const hipPath = makePath('hip');
              const armPath = makePath('arm');
              const thighPath = makePath('thigh');

              const getDiffObj = (f: keyof BodyLog, label: string) => {
                const prevMetric = prevLog ? Number(prevLog[f]) : null;
                const currMetric = Number(latestLog[f]);
                if (prevMetric === null) return { text: "Initial baseline", color: "text-slate-400" };
                const difference = currMetric - prevMetric;
                if (difference < 0) {
                  return { text: `↓ ${Math.abs(difference).toFixed(1)}cm limit`, color: "text-emerald-700 font-extrabold" };
                } else if (difference > 0) {
                  return { text: `↑ ${difference.toFixed(1)}cm growth`, color: "text-indigo-650 font-extrabold" };
                }
                return { text: "Stable", color: "text-slate-500 font-extrabold" };
              };

              const chestDiff = getDiffObj('chest', 'Chest');
              const waistDiff = getDiffObj('waist', 'Waist');
              const hipDiff = getDiffObj('hip', 'Hip');
              const armDiff = getDiffObj('arm', 'Arm');
              const thighDiff = getDiffObj('thigh', 'Thigh');

              return (
                <div className="space-y-6 animate-fade-in text-left">
                  
                  {/* Title Bar - Identical to Weight Analytics */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        <TrendingUp className="w-5 h-5 text-teal-650" />
                        <span>Body Measurements</span>
                      </h2>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Last Sync: Today</span>
                  </div>

                  {/* Silhouettes & Deltas */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Interactive Mannequin Blueprint */}
                    <div className="md:col-span-5 flex flex-col items-center bg-white border border-slate-200/80 rounded-[28px] p-5 shadow-xs">
                      <h3 className="text-xs font-bold text-slate-900 self-start mb-4 font-sans">Girth Mapping</h3>
                      <BodyScannerMannequin latestLog={latestLog} isMale={true} showCallouts={true} />
                    </div>

                    {/* Numeric Girth Boxes List */}
                    <div className="md:col-span-7 bg-white border border-slate-200/80 rounded-[28px] p-5 shadow-xs flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 mb-4 font-sans">Weekly Circumference Review</h3>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="text-2xs text-slate-400 font-bold block">Chest Circumference</span>
                            <strong className="text-base text-slate-900 font-black mt-1 block">{latestLog.chest} cm</strong>
                            <span className={`text-[10px] mt-1.5 block ${chestDiff.color}`}>{chestDiff.text}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="text-2xs text-slate-400 font-bold block">Waist Circumference</span>
                            <strong className="text-base text-slate-900 font-black mt-1 block">{latestLog.waist} cm</strong>
                            <span className={`text-[10px] mt-1.5 block ${waistDiff.color}`}>{waistDiff.text}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="text-2xs text-slate-400 font-bold block">Hip Circumference</span>
                            <strong className="text-base text-slate-900 font-black mt-1 block">{latestLog.hip} cm</strong>
                            <span className={`text-[10px] mt-1.5 block ${hipDiff.color}`}>{hipDiff.text}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="text-2xs text-slate-400 font-bold block">Arm Circumference</span>
                            <strong className="text-base text-slate-900 font-black mt-1 block">{latestLog.arm} cm</strong>
                            <span className={`text-[10px] mt-1.5 block ${armDiff.color}`}>{armDiff.text}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 col-span-2 sm:col-span-1">
                            <span className="text-2xs text-slate-400 font-bold block">Thigh Circumference</span>
                            <strong className="text-base text-slate-900 font-black mt-1 block">{latestLog.thigh} cm</strong>
                            <span className={`text-[10px] mt-1.5 block ${thighDiff.color}`}>{thighDiff.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Multiline multi-girth analytic chart */}
                  <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-900 mb-2.5 font-sans">Girth Trend Over Time</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4 text-xs font-semibold text-slate-500 font-sans">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#18D2C3]" /> Chest</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Waist</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /> Hip</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Arm</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#082567]" /> Thigh</span>
                    </div>

                    <div className="w-full h-44 relative bg-slate-50/50 rounded-2xl p-3 border border-slate-100/65 overflow-hidden">
                      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                        {scaleTicks.map((tickVal, tIdx) => {
                          const yCoord = getGirthY(tickVal);
                          return (
                            <g key={tIdx}>
                              <line x1={padLeft} y1={yCoord} x2={svgWidth - padRight} y2={yCoord} stroke="#E2E8F0" strokeWidth="0.5" strokeDasharray="2,2" />
                              <text x={padLeft - 6} y={yCoord + 3} textAnchor="end" fill="#94A3B8" className="text-[9px] font-semibold font-sans">
                                {tickVal}cm
                              </text>
                            </g>
                          );
                        })}

                        {chestPath && <path d={chestPath} fill="none" stroke="#18D2C3" strokeWidth="2" strokeLinecap="round" />}
                        {waistPath && <path d={waistPath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />}
                        {hipPath && <path d={hipPath} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" />}
                        {armPath && <path d={armPath} fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />}
                        {thighPath && <path d={thighPath} fill="none" stroke="#082567" strokeWidth="2" strokeLinecap="round" />}

                        {/* Node Highlight Circles */}
                        {currentLogs.map((l, idx) => {
                          const x = getSvgX(idx, currentLogs.length);
                          return (
                            <g key={idx}>
                              <circle cx={x} cy={getGirthY(l.chest)} r="2" fill="#18D2C3" />
                              <circle cx={x} cy={getGirthY(l.waist)} r="2" fill="#3B82F6" />
                              <circle cx={x} cy={getGirthY(l.hip)} r="2" fill="#8B5CF6" />
                              <circle cx={x} cy={getGirthY(l.arm)} r="2" fill="#F97316" />
                              <circle cx={x} cy={getGirthY(l.thigh)} r="2" fill="#082567" />
                            </g>
                          );
                        })}

                        {currentLogs.map((l, idx) => {
                          const x = getSvgX(idx, currentLogs.length);
                          const dtLabel = new Date(l.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
                          return (
                            <text key={idx} x={x} y={svgHeight - 6} textAnchor="middle" fill="#94A3B8" className="text-[8px] font-bold font-sans">
                              {dtLabel}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Girth Registry table */}
                  <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-xs overflow-hidden">
                    <h3 className="text-xs font-bold text-slate-900 mb-4 font-sans">Recent Girth Check-ins</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-sans">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-extrabold pb-2 uppercase text-[9px] tracking-wider">
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Chest</th>
                            <th className="py-2.5">Waist</th>
                            <th className="py-2.5">Hip</th>
                            <th className="py-2.5">Arm</th>
                            <th className="py-2.5">Thigh</th>
                            <th className="py-2.5 text-right pr-4"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold">
                          {currentLogs.map((l, idx) => {
                            const isExpanded = expandedGirthRow === idx;
                            return (
                              <Fragment key={idx}>
                                <tr 
                                  className="hover:bg-slate-50/50 text-slate-705 cursor-pointer transition-colors"
                                  onClick={() => setExpandedGirthRow(isExpanded ? null : idx)}
                                >
                                  <td className="py-3 font-medium text-slate-500">{l.date}</td>
                                  <td className="py-3 text-slate-800">{l.chest} cm</td>
                                  <td className="py-3 text-slate-900 font-black">{l.waist} cm</td>
                                  <td className="py-3 text-slate-800">{l.hip} cm</td>
                                  <td className="py-3 text-slate-800">{l.arm} cm</td>
                                  <td className="py-3 text-[#082567] font-extrabold">{l.thigh} cm</td>
                                  <td className="py-3 text-right pr-4">
                                    <span className="text-slate-400 hover:text-slate-600 inline-flex items-center">
                                      {isExpanded ? (
                                        <ChevronUp className="w-4 h-4" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4" />
                                      )}
                                    </span>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-slate-50/40">
                                    <td colSpan={7} className="py-3 px-4 text-left border-t border-slate-100">
                                      <div className="py-1">
                                        <strong className="block text-xs font-extrabold text-slate-900 mb-1 font-sans">Diagnostic Report:</strong>
                                        <p className="text-xs font-medium text-slate-600 leading-relaxed font-sans">
                                          {l.notes || "Measurements successfully recorded."}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
                    <button
                      onClick={() => setShowGirthModal(true)}
                      className="w-full sm:flex-1 bg-[#081F63] hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Record New Girth</span>
                    </button>
                    <button
                      onClick={handleDownloadMeasurementsCSV}
                      className="w-full sm:flex-1 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-350 px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Girth CSV</span>
                    </button>
                  </div>

                </div>
              );
            })()}

            {/* TAB 4: MEDICAL HISTORY */}
            {activeSubTab === 'medical' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Section Header */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-3xs">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-5.5 h-5.5 text-rose-600 animate-pulse" />
                      <span>Certified Medical Health Record</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Authorized Medical and Safety parameters for Coach Sarah
                    </p>
                  </div>
                </div>

                {/* Health Record Dashboard Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Blood Type & Allergies Grid */}
                  <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Type</label>
                      <input 
                        type="text"
                        value={bloodType}
                        onChange={(e) => setBloodType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-900 focus:ring-teal-500 focus:bg-white transition"
                        placeholder="e.g. O+"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Allergies</label>
                      <input 
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-rose-800 focus:ring-teal-500 focus:bg-white transition"
                        placeholder="e.g. Penicillin, Peanuts"
                      />
                    </div>
                  </div>

                  {/* Existing Conditions & Current Medications */}
                  <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-705 mb-1.5">Existing Medical Conditions</label>
                      <input 
                        type="text"
                        value={conditions}
                        onChange={(e) => setConditions(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-indigo-950 focus:ring-teal-500 focus:bg-white transition"
                        placeholder="e.g. Chronic Asthma, Diabetes"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-705 mb-1.5">Current Medication</label>
                      <input 
                        type="text"
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-850 focus:ring-teal-500 focus:bg-white transition"
                        placeholder="e.g. Inhaler as prescribed"
                      />
                    </div>
                  </div>

                </div>

                {/* Previous Injuries Card */}
                <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs text-left">
                  <label className="block text-xs font-semibold text-slate-705 mb-2 font-sans">Previous Physical Injuries</label>
                  <textarea
                    rows={2}
                    value={prevInjuries}
                    onChange={(e) => setPrevInjuries(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-750 focus:ring-teal-500 focus:bg-white transition"
                    placeholder="Provide description of any historic operations or muscular injury"
                  />
                </div>

                {/* Emergency Contact */}
                <div className="bg-white border border-slate-200/80 rounded-[24px] p-5 shadow-3xs text-left text-xs font-sans">
                  <h3 className="text-xs font-semibold text-slate-705 mb-2 font-sans">Emergency Contact</h3>
                  <input 
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-900 focus:ring-teal-500"
                    placeholder="e.g. Spouse / Parent — Contact number"
                  />
                </div>

                {/* Coach Medical Notes */}
                <div className="bg-amber-50/50 border border-amber-200 rounded-[24px] p-5 text-left text-xs font-sans">
                  <div className="flex items-center gap-2 mb-2 text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-semibold text-amber-800">Linked Coach Medical Directive Notes</h3>
                  </div>
                  <textarea
                    rows={3}
                    value={coachMedicalNotes}
                    onChange={(e) => setCoachMedicalNotes(e.target.value)}
                    className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-amber-950 focus:ring-amber-400 focus:ring-1"
                    placeholder="Input physical medical diagnostics issued by sarah."
                  />
                </div>

                {/* Save Medical Records Button */}
                <button
                  onClick={handleSaveMedicalHistory}
                  className="w-full bg-[#081F63] hover:bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs mt-4"
                >
                  Save Medical Records
                </button>

              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {activeSubTab === 'settings' && (
              <div className="space-y-6 animate-fade-in text-left">
                
                {/* Edit Profile Registry Card */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-3xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 font-sans">Edit Profile Details</h3>
                      <p className="text-sm text-slate-500 font-sans mt-0.5">Manage your public registration profile information.</p>
                    </div>
                    <button 
                      onClick={handleUpdatePersonalInfo}
                      className="bg-[#081F63] hover:bg-slate-900 text-teal-400 hover:text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-3xs transition shrink-0"
                    >
                      Update Profile Info
                    </button>
                  </div>

                  <div className="space-y-4 font-sans">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                        <input 
                          type="text" 
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email</label>
                        <input 
                          type="email" 
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">Phone Contact</label>
                        <input 
                          type="text" 
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
                        <input 
                          type="date" 
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                        <select 
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Prefer not to state</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Living Location (Selangor / KL)</label>
                      <input 
                        type="text" 
                        value={locationStr}
                        onChange={(e) => setLocationStr(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Change Password & Security Card */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-3xs">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 font-sans">Security Settings</h3>
                    <p className="text-sm text-slate-500 font-sans mt-0.5 mb-6">Manage authentication settings and two-factor options.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                      <input 
                        type="password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-semibold text-slate-800"
                        placeholder="Enter credentials password"
                      />
                    </div>
                    <div className="flex items-center justify-between border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 text-left">
                      <div>
                        <span className="block text-sm font-semibold text-slate-850 font-sans">Two-Factor Authentication</span>
                        <p className="text-xs text-slate-500 font-sans mt-0.5">Ping mobile verification alerts on log steps</p>
                      </div>
                      <button
                        onClick={() => {
                          setTwoFactorToken(!twoFactorToken);
                          triggerToast("2FA security settings adjusted!");
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl cursor-pointer transition shrink-0 ${
                          twoFactorToken ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {twoFactorToken ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences Card */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-3xs">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 font-sans">Notification Preferences</h3>
                    <p className="text-sm text-slate-500 font-sans mt-0.5 mb-6">Toggle mobile email alerts or direct messaging reviews from Coach Sarah Tan.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'workoutReminders', label: 'Workout Reminders', desc: 'Prompts regarding daily physical exercise regimes', icon: Dumbbell },
                      { key: 'sessionReminders', label: 'Session Reminders', desc: 'Alert notifications 1 hour prior to studio physically', icon: Clock },
                      { key: 'nutritionReminders', label: 'Nutrition Log Reminders', desc: 'Alert updates if daily macro registers are missing', icon: Flame },
                      { key: 'paymentReminders', label: 'Payment Receipts', desc: 'Bimonthly renewal invoices and subscription confirmations', icon: Calendar }
                    ].map((box) => {
                      const IconComponent = box.icon;
                      const isEnabled = notifications[box.key as keyof typeof notifications];
                      return (
                        <div 
                          key={box.key}
                          onClick={() => {
                            setNotifications(prev => ({
                              ...prev,
                              [box.key as keyof typeof notifications]: !prev[box.key as keyof typeof notifications]
                            }));
                            triggerToast("Notification configuration updated.");
                          }}
                          className="p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-150 rounded-2xl cursor-pointer flex items-center justify-between text-left transition"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isEnabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="block text-sm font-semibold text-slate-800 font-sans">{box.label}</span>
                              <span className="text-xs text-slate-500 font-sans block mt-0.5">{box.desc}</span>
                            </div>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border shrink-0 transition ${
                            isEnabled 
                              ? 'bg-teal-50 text-teal-700 border-teal-100' 
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {isEnabled ? 'Enabled' : 'Muted'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Privacy Settings Card */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-3xs">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 font-sans">Privacy Settings</h3>
                    <p className="text-sm text-slate-500 font-sans mt-0.5 mb-6">Control who has visibility to your physical training logs and performance history.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-slate-850 font-sans">Private Profile Scope</span>
                        <p className="text-xs text-slate-500 font-sans mt-0.5">Only your assigned coach can view your profile.</p>
                      </div>
                    </div>
                    <span className="text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0">
                      Private
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* RECORD NEW WEIGHT MODAL DIALOG */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl animate-fade-in text-left">
            <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5 mb-2">
              <Scale className="w-5 h-5 text-teal-600" />
              <span>Record Scale Log</span>
            </h3>
            <p className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider font-mono mb-4">Input daily morning physical metrics.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Weight (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={inputWeight}
                  onChange={(e) => setInputWeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:ring-teal-500"
                  placeholder="e.g. 83.5"
                />
              </div>

              <div>
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Estimated Body Fat % (Optional)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={inputBodyFat}
                  onChange={(e) => setInputBodyFat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:ring-teal-500"
                  placeholder="e.g. 21.5"
                />
              </div>

              <div>
                <label className="block text-3xs font-black text-slate-400 uppercase tracking-widest mb-1 font-mono">Check-in Notes / Log description</label>
                <textarea 
                  rows={2}
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:ring-teal-500"
                  placeholder="Describe muscular status or sleep quality today..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-755 border border-slate-200 rounded-xl text-xs font-extrabold py-2.5 text-center cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewWeightCheckIn}
                className="flex-1 bg-slate-950 text-teal-400 hover:text-white rounded-xl text-xs font-black py-2.5 text-center cursor-pointer transition shadow-3xs"
              >
                Save Metrics Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD NEW GIRTH MODAL DIALOG */}
      {showGirthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-sm w-full p-6 shadow-2xl animate-fade-in text-left">
            <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-5 h-5 text-teal-650" />
              <span>Record Girth Circumferences</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-4 font-sans">Input physical body circumference metrics.</p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Chest Circumference (cm)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={inputChest}
                  onChange={(e) => setInputChest(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:ring-teal-500"
                  placeholder="e.g. 104.0"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Waist Circumference (cm)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={inputWaist}
                  onChange={(e) => setInputWaist(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:ring-teal-500"
                  placeholder="e.g. 94.0"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Hip Circumference (cm)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={inputHip}
                  onChange={(e) => setInputHip(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:ring-teal-500"
                  placeholder="e.g. 108.0"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Arm Circumference (cm)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={inputArm}
                  onChange={(e) => setInputArm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:ring-teal-500"
                  placeholder="e.g. 38.0"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Thigh Circumference (cm)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={inputThigh}
                  onChange={(e) => setInputThigh(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-black text-slate-900 focus:ring-teal-500"
                  placeholder="e.g. 62.0"
                />
              </div>

              <div>
                <label className="block text-3xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Check-in Notes / Description</label>
                <textarea 
                  rows={2}
                  value={inputGirthNotes}
                  onChange={(e) => setInputGirthNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-800 focus:ring-teal-500"
                  placeholder="Describe muscular status or body feeling today..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowGirthModal(false)}
                className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-705 border border-slate-200 rounded-xl text-xs font-extrabold py-2.5 text-center cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewGirthCheckIn}
                className="flex-1 bg-slate-950 text-teal-400 hover:text-white rounded-xl text-xs font-black py-2.5 text-center cursor-pointer transition shadow-3xs"
              >
                Save Girth Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
