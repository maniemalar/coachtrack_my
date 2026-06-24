import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Mail,
  TrendingUp, 
  Plus, 
  Pencil,
  Check, 
  X, 
  MessageSquare, 
  ShieldAlert, 
  ShieldCheck,
  Shield,
  DollarSign, 
  FileText, 
  Utensils, 
  Dumbbell,
  Search,
  Bell,
  Sparkles,
  ArrowUpRight,
  ClipboardList,
  Camera,
  Activity,
  Send,
  Download,
  Clock,
  Briefcase,
  Flame,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ChevronRight,
  ChevronDown,
  CreditCard,
  ArrowRight,
  Settings,
  ArrowLeft,
  Trophy,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from './PageHeader';
import BodyMeasurementsRedesign from './BodyMeasurementsRedesign';
import { TrainerProfile, TraineeProfile, WorkoutLog, NutritionLog, BookingSession, Payment, Invoice, resolveTraineeAvatar, resolveMealPhoto } from '../types';
import { dbService } from '../lib/dbService';
import { AHMAD_COMPLETED_SESSIONS, getSharedBodyLogs, setSharedBodyLogs } from '../lib/sharedHistory';
import { MealImage } from './MealImage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import DownloadButton from './DownloadButton';

export function getCleanActiveBookings(bks: any[]) {
  if (!bks) return [];
  const ALLOWED_NAMES = ['Ahmad Bin Ibrahim', 'Mei Ling Tan', 'Muhammad Faizul'];
  const ALLOWED_SLOTS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'];
  
  const filtered = bks.filter(b => {
    if (!b) return false;
    const name = b.traineeName;
    if (!ALLOWED_NAMES.includes(name)) return false;
    
    const status = (b.status || '').toLowerCase();
    if (status === 'completed' || status === 'cancelled') return false;
    
    if (!ALLOWED_SLOTS.includes(b.timeSlot)) return false;
    
    return true;
  });

  const seen = new Set<string>();
  const deduplicated: any[] = [];
  
  for (const b of filtered) {
    const tId = b.trainerId || 'tr_sarah';
    const d = b.date || '';
    const tSlot = b.timeSlot || '';
    const key = `${tId}_${d}_${tSlot}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(b);
    }
  }

  deduplicated.sort((a, b) => {
    const dateComp = (a.date || '').localeCompare(b.date || '');
    if (dateComp !== 0) return dateComp;
    
    const indexA = ALLOWED_SLOTS.indexOf(a.timeSlot);
    const indexB = ALLOWED_SLOTS.indexOf(b.timeSlot);
    const valA = indexA === -1 ? 999 : indexA;
    const valB = indexB === -1 ? 999 : indexB;
    return valA - valB;
  });

  return deduplicated;
}

interface TrainerDashboardProps {
  trainerProfile?: any | TrainerProfile;
  activeTab?: string;
  showNotificationsDrawer?: boolean;
  setShowNotificationsDrawer?: (show: boolean) => void;
}

class TrainerDashboardErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error("TrainerDashboard error:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl m-4 font-sans text-center max-w-lg mx-auto shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-sm font-bold uppercase tracking-wider mb-2">Something went wrong</h2>
          <p className="text-xs text-slate-600 mb-4">The trainer dashboard encountered a display error. Please refresh or try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TrainerDashboard(props: TrainerDashboardProps) {
  return (
    <TrainerDashboardErrorBoundary>
      <TrainerDashboardInner {...props} />
    </TrainerDashboardErrorBoundary>
  );
}

export function getTrainerAvailableDays() {
  return {
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: true,
    Sun: false,
  };
}

export function TrainerDashboardInner({ 
  trainerProfile: initialTrainerProfile, 
  activeTab = 'trainer-dashboard',
  showNotificationsDrawer: passedShowNotificationsDrawer,
  setShowNotificationsDrawer: passedSetShowNotificationsDrawer
}: TrainerDashboardProps) {
  // Load profile from profiles and trainer_profiles using supabase.auth.getUser()
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [resolvedTrainerProfile, setResolvedTrainerProfile] = useState<any>(null);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);

  const [onboardDiscipline, setOnboardDiscipline] = useState('HIIT & Calorie Burning');
  const [onboardLocation, setOnboardLocation] = useState('Kuala Lumpur');
  const [onboardType, setOnboardType] = useState('Freelance');
  const [onboardExperience, setOnboardExperience] = useState('3');
  const [onboardPlan, setOnboardPlan] = useState('CoachBasic');
  const [onboardPhone, setOnboardPhone] = useState('');
  const [onboardVerification, setOnboardVerification] = useState('Pending Verification');
  const [savingOnboard, setSavingOnboard] = useState(false);

  const isSupActive = useMemo(() => {
    try {
      const mode = localStorage.getItem('coach_track_mode');
      return mode === 'live' && isSupabaseConfigured && !!supabase;
    } catch (e) {
      return false;
    }
  }, []);

  const [sessionToLog, setSessionToLog] = useState<any | null>(null);
  const [logWorkoutType, setLogWorkoutType] = useState('HIIT Core Strength');
  const [logDuration, setLogDuration] = useState(60);
  const [logCalories, setLogCalories] = useState(450);
  const [logIntensity, setLogIntensity] = useState(8);
  const [logExercises, setLogExercises] = useState<{name: string, sets: number, reps: number, weight: number, id: string}[]>([
    { name: 'Squats', sets: 4, reps: 12, weight: 60, id: 'ex_1' },
    { name: 'Deadlifts', sets: 4, reps: 8, weight: 80, id: 'ex_2' },
    { name: 'Plank Hold', sets: 3, reps: 60, weight: 0, id: 'ex_3' }
  ]);
  const [logEnergyLevel, setLogEnergyLevel] = useState(8);
  const [logEffort, setLogEffort] = useState(8);
  const [logFormQuality, setLogFormQuality] = useState(8);
  const [logMobility, setLogMobility] = useState(7);
  const [logNotes, setLogNotes] = useState('Client demonstrated improved squat depth. Core engagement improved significantly. Need additional mobility work next session.');
  const [logMood, setLogMood] = useState('Excellent');
  const [logOutcome, setLogOutcome] = useState('Completed Successfully');

  useEffect(() => {
    if (sessionToLog) {
      setLogWorkoutType(sessionToLog.title || sessionToLog.type || 'HIIT Core Strength');
      setLogDuration(60);
      setLogCalories(450);
      setLogIntensity(8);
      
      const titleLower = (sessionToLog.title || '').toLowerCase();
      if (titleLower.includes('chest') || titleLower.includes('upper')) {
        setLogExercises([
          { name: 'Bench Press', sets: 4, reps: 10, weight: 50, id: 'ex_1' },
          { name: 'Incline Dumbbell Flyes', sets: 3, reps: 12, weight: 14, id: 'ex_2' },
          { name: 'Push-ups', sets: 3, reps: 15, weight: 0, id: 'ex_3' }
        ]);
      } else if (titleLower.includes('deadlift') || titleLower.includes('posterior') || titleLower.includes('lower') || titleLower.includes('strength')) {
        setLogExercises([
          { name: 'Squats', sets: 4, reps: 12, weight: 60, id: 'ex_1' },
          { name: 'Deadlifts', sets: 4, reps: 8, weight: 80, id: 'ex_2' },
          { name: 'Plank Hold', sets: 3, reps: 60, weight: 0, id: 'ex_3' }
        ]);
      } else {
        setLogExercises([
          { name: 'Burpees', sets: 4, reps: 10, weight: 0, id: 'ex_1' },
          { name: 'Mountain Climbers', sets: 3, reps: 30, weight: 0, id: 'ex_2' },
          { name: 'Kettlebell Swings', sets: 3, reps: 15, weight: 16, id: 'ex_3' }
        ]);
      }
      setLogEnergyLevel(8);
      setLogEffort(8);
      setLogFormQuality(8);
      setLogMobility(7);
      setLogNotes('Client demonstrated improved squat depth. Core engagement improved significantly. Need additional mobility work next session.');
      setLogMood('Excellent');
      setLogOutcome('Completed Successfully');
    }
  }, [sessionToLog]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      setProfileError(null);
      
      console.log('Fetching logged-in user profile...');
      if (isSupActive) {
        const { data: { user }, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
          throw authErr;
        }
        if (!user) {
          throw new Error("No authenticated Supabase session found.");
        }
        console.log("Current auth user ID:", user.id);

        // Fetch from profiles
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        console.log("Loaded profile row:", prof);

        // Fetch from trainer_profiles
        const { data: tProf, error: tProfErr } = await supabase
          .from('trainer_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        console.log("Loaded trainer profile row:", tProf);

        if (tProf) {
          const combined = {
            id: user.id,
            userId: user.id,
            name: prof?.name || user.user_metadata?.name || 'Coach',
            email: prof?.email || user.email || '',
            avatarUrl: prof?.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120',
            discipline: tProf.discipline || 'Not set',
            experienceYears: Number(tProf.experience_years) || 0,
            location: tProf.location || 'Not set',
            freelanceStatus: tProf.freelance_status || 'Not set',
            pricePerHour: Number(tProf.price_per_hour) || 0,
            bio: tProf.bio || '',
            selectedPlan: tProf.selected_plan || 'Starter',
            traineeLimit: tProf.trainee_limit || 5,
            subscriptionStatus: tProf.subscription_status || 'Active',
            phoneNumber: tProf.phone_number || 'Not set',
            verificationStatus: tProf.verification_status || 'Pending Verification',
            certificates: tProf.certificates || [],
            idProofUrl: tProf.id_proof_url || ''
          };
          setResolvedTrainerProfile(combined);
          setIsOnboarding(false);
          console.log("Dashboard render mode: real data");
        } else {
          setIsOnboarding(true);
          console.log("Dashboard render mode: onboarding");
        }
      } else {
        // Offline / Sandbox Demo mode
        console.log("Dashboard render mode: default sandbox");
        setResolvedTrainerProfile(initialTrainerProfile || {
          id: 'tr_sarah',
          userId: 'u_sarah',
          name: 'Sarah Tan',
          discipline: 'Yoga & Pilates Instructor',
          experienceYears: 6,
          location: 'SS15, Subang Jaya',
          freelanceStatus: 'Freelance',
          pricePerHour: 80,
          bio: 'Dedicated to helping office workers improve flexibility, core strength, and mindfulness near Subang Jaya.',
          selectedPlan: 'Starter',
          phoneNumber: '+60 12-345 6789',
          verificationStatus: 'Verified',
          traineeLimit: 5
        });
        setIsOnboarding(false);
      }
    } catch (err: any) {
      console.error("Failed to load trainer profile:", err);
      setProfileError("Failed to load trainer profile. Please try again. Details: " + (err.message || err));
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [initialTrainerProfile, isSupActive]);

  const handleSaveOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingOnboard(true);
      if (!isSupActive) {
        setIsOnboarding(false);
        setSavingOnboard(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated session found.");

      const planLower = onboardPlan.toLowerCase();
      let limit = 5;
      let price = 0;
      if (planLower.includes('growth')) {
        limit = 20;
        price = 149;
      } else if (planLower.includes('pro')) {
        limit = 50;
        price = 299;
      }

      // Check if profile exists; insert if not
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('profiles').insert({
          id: user.id,
          email: user.email || '',
          role: 'trainer',
          name: user.user_metadata?.name || 'Trainer',
          avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
        });
      }

      // 1. Insert into trainer_profiles
      const { error: tErr } = await supabase.from('trainer_profiles').insert({
        id: user.id,
        discipline: onboardDiscipline,
        experience_years: Number(onboardExperience),
        location: onboardLocation,
        freelance_status: onboardType,
        price_per_hour: onboardDiscipline.toLowerCase().includes('yoga') ? 110 : 130,
        bio: `${onboardDiscipline} trainer based in ${onboardLocation}.`,
        selected_plan: onboardPlan,
        trainee_limit: limit,
        subscription_price: price,
        subscription_status: 'Active',
        subscription_start_date: new Date().toISOString().split('T')[0],
        subscription_renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        verification_status: onboardVerification,
        certificates: ['Fitness license'],
        id_proof_url: 'Self-certified onboarding',
        phone_number: onboardPhone
      });

      if (tErr) throw tErr;

      // 2. Insert into trainers for legacy searches
      await supabase.from('trainers').insert({
        id: `tr_${user.id.substring(0, 10)}`,
        userId: user.id,
        name: user.user_metadata?.name || user.email || 'Trainer',
        discipline: onboardDiscipline,
        experience_years: Number(onboardExperience),
        location: onboardLocation,
        freelance_status: onboardType,
        price_per_hour: onboardDiscipline.toLowerCase().includes('yoga') ? 110 : 130,
        bio: `${onboardDiscipline} trainer based in ${onboardLocation}.`,
        lat: 3.0792,
        lng: 101.5950,
        verified: onboardVerification.includes('Verified'),
        avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
      });

      triggerToast("Trainer profile completed successfully!");
      // Reload profile
      await loadProfile();
    } catch (err: any) {
      console.error("Failed to save onboarding profile:", err);
      alert("Error saving trainer profile: " + err.message);
    } finally {
      setSavingOnboard(false);
    }
  };

  const p = resolvedTrainerProfile || {
    id: 'unknown-id',
    name: 'Trainer',
    email: 'trainer@coachtrack.my',
    discipline: 'Not set',
    location: 'Not set',
    experienceYears: 0,
    freelanceStatus: 'Not set',
    pricePerHour: 0,
    bio: '',
    selectedPlan: 'Not set',
    phoneNumber: 'Not set',
    verificationStatus: 'Pending Verification'
  };

  const trainerProfile = p;

  // Lists
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [nutrition, setNutrition] = useState<NutritionLog[]>([]);
  const [bookings, setBookings] = useState<BookingSession[]>(() => {
    try {
      const trainerId = resolvedTrainerProfile?.id || initialTrainerProfile?.id || 'tr_sarah';
      const stored = localStorage.getItem(`bookings_fallback_${trainerId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
    return [];
  });
  const [payments, setPayments] = useState<Payment[]>([]);

  // Page 2: Client Management States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeProfile | null>(null);
  const [traineeDetailTab, setTraineeDetailTab] = useState<'history' | 'body' | 'photos' | 'ai' | 'chat' | 'nutrition'>('body');
  const [clientFilterMode, setClientFilterMode] = useState<'consistency' | 'payment'>('consistency');

  // Redesigned Client Profile Section state and persistent trackers
  const [profileSection, setProfileSection] = useState<'body' | 'sessions' | 'nutrition' | 'medical'>('body');
  const [bodySubPage, setBodySubPage] = useState<'main' | 'weight' | 'girth'>('main');
  const [editingWeightLogDate, setEditingWeightLogDate] = useState<string | null>(null);
  const [editingGirthLogDate, setEditingGirthLogDate] = useState<string | null>(null);

  useEffect(() => {
    setBodySubPage('main');
    setEditingWeightLogDate(null);
    setEditingGirthLogDate(null);
  }, [selectedTrainee?.id]);

  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({ 'sess-0': true });
  const [trendFilterRange, setTrendFilterRange] = useState<string>('8 Weeks');
  const [detailedMeals, setDetailedMeals] = useState<Record<string, boolean>>({});
  const [expandedMealId, setExpandedMealId] = useState<string | null>('m_2');
  const [nutritionWeekDayHovered, setNutritionWeekDayHovered] = useState<number | null>(null);
  const [nutritionActiveMonthTab, setNutritionActiveMonthTab] = useState<'week1' | 'week2' | 'week3' | 'week4'>('week4');
  
  const [bodyLogs, setBodyLogsState] = useState<Record<string, Array<{
    date: string;
    weight: number;
    height: number;
    bmi: number;
    bmr: number;
    bodyFat: number;
    waist: number;
    chest: number;
    hip: number;
    arm: number;
    thigh: number;
    notes: string;
  }>>>(() => getSharedBodyLogs());

  const setBodyLogs = (val: any) => {
    if (typeof val === 'function') {
      setBodyLogsState(prev => {
        const next = val(prev);
        setSharedBodyLogs(next);
        return next;
      });
    } else {
      setBodyLogsState(val);
      setSharedBodyLogs(val);
    }
  };

  const [medicalObsNotes, setMedicalObsNotes] = useState<Record<string, string>>({
    'te_ahmad': "Ahmad is showing progressive core compression control. Glute bridges are clean.",
    'te_ling': "Watch for pelvic floor alignment fatigue on side planks.",
    'te_faizul': "Excellent shoulder extension. Slight overhead caution is advised.",
  });

  const [mealComments, setMealComments] = useState<Record<string, string>>({
    'm_1': "Excellent high-protein choice. Opt for breast meat next time.",
    'm_2': "Perfect timing right after your HIIT session.",
    'm_3': "Watch the sodium in stir-frys."
  });

  const [nutritionActiveDate, setNutritionActiveDate] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customNutritionDate, setCustomNutritionDate] = useState<string>('2026-06-21');

  // Client Removal States
  const [showRemoveClientModal, setShowRemoveClientModal] = useState(false);
  const [removeClientSearch, setRemoveClientSearch] = useState('');
  const [removingTrainee, setRemovingTrainee] = useState<TraineeProfile | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Schedule Session states for Group Scheduling
  const [scheduleType, setScheduleType] = useState<'individual' | 'group'>('individual');
  const [scheduleSelectedTraineeIds, setScheduleSelectedTraineeIds] = useState<string[]>([]);
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  
  // Workspace Dynamic Chat Thread state
  const [activeChatTrainee, setActiveChatTrainee] = useState<any>({
    id: 'te_ahmad',
    userId: 'u_ahmad',
    name: 'Ahmad Bin Ibrahim',
    initials: 'AI',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    status: 'online',
    goals: 'Weight Loss & Cardio',
    streakCount: 5
  });

  // Additional Trainer chat workspace states
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isSearchingChat, setIsSearchingChat] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({
    u_ahmad: 0,
    u_ling: 2,
    u_faizul: 1
  });
  const [replyTagType, setReplyTagType] = useState<string | null>(null);
  const [replyTagTitle, setReplyTagTitle] = useState('');
  const [chatRightPanelTab, setChatRightPanelTab] = useState<'workouts' | 'nutrition' | 'progress' | 'gemini'>('workouts');
  
  // AI recommendations states
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);
  const [approvedState, setApprovedState] = useState<'idle' | 'approved' | 'edited' | 'rejected'>('idle');
  const [aiEditMode, setAiEditMode] = useState(false);
  const [aiNotesBuffer, setAiNotesBuffer] = useState('');
  
  // Trainer manual notes saving
  const [notesText, setNotesText] = useState('');
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Page 3: Payments & Billing state filters
  const [paymentSubTab, setPaymentSubTab] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterPackage, setFilterPackage] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedInvoiceDocMode, setSelectedInvoiceDocMode] = useState<'invoice' | 'receipt'>('invoice');
  const [paymentScreen, setPaymentScreen] = useState<'main' | 'invoices' | 'history'>('main');
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('June 2026');
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState<boolean>(false);

  const monthsList = [
    'January 2026',
    'February 2026',
    'March 2026',
    'April 2026',
    'May 2026',
    'June 2026'
  ];

  const monthlyPaymentsData: Record<string, {
    monthlyRevenue: string;
    monthlyRevenueSub: string;
    monthlyRevenueUp: boolean;
    totalCollected: string;
    totalCollectedSub: string;
    totalCollectedUp: boolean;
    pendingPayments: string;
    pendingPaymentsSub: string;
    completedPayments: string;
    completedPaymentsSub: string;
    freeSlots: number;
    freeSlotsText: string;
    aiAdvice: string;
    growthTips: { icon: string; text: string }[];
    invoices: {
      client: string;
      package: string;
      invoiceNo: string;
      amount: number;
      status: 'PAID' | 'PENDING';
      due?: string;
      avatar: string;
    }[];
    history: {
      client: string;
      package: string;
      amount: string;
      date: string;
      status: string;
      payId: string;
    }[];
  }> = {
    'January 2026': {
      monthlyRevenue: 'RM 520',
      monthlyRevenueSub: '↑ 10% vs Dec',
      monthlyRevenueUp: true,
      totalCollected: 'RM 420',
      totalCollectedSub: '↑ 15% vs Dec',
      totalCollectedUp: true,
      pendingPayments: 'RM 100',
      pendingPaymentsSub: '1 Invoice Pending',
      completedPayments: '1 Payment',
      completedPaymentsSub: 'This Month',
      freeSlots: 8,
      freeSlotsText: '8 Slots Available',
      aiAdvice: '"Start of the New Year! You have 8 coaching slots ready to fill. Launch resolution marketing campaigns."',
      growthTips: [
        { icon: '🎯', text: 'Promote New Year fitness resolution programs' },
        { icon: '✨', text: 'Follow up on warm leads from last December' },
        { icon: '📱', text: 'Post a successful client testimonial package' }
      ],
      invoices: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Starter',
          invoiceNo: 'INV-0126-001',
          amount: 420,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Mei Ling Tan',
          package: 'Single Session Tryout',
          invoiceNo: 'INV-0126-002',
          amount: 100,
          status: 'PENDING',
          due: '28 January 2026',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
        }
      ],
      history: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Starter',
          amount: 'RM 420',
          date: '10 Jan 2026',
          status: 'PAID',
          payId: 'TXN-O1003429'
        }
      ]
    },
    'February 2026': {
      monthlyRevenue: 'RM 680',
      monthlyRevenueSub: '↑ 30% vs Jan',
      monthlyRevenueUp: true,
      totalCollected: 'RM 600',
      totalCollectedSub: '↑ 42% vs Jan',
      totalCollectedUp: true,
      pendingPayments: 'RM 80',
      pendingPaymentsSub: '1 Invoice Pending',
      completedPayments: '2 Payments',
      completedPaymentsSub: 'This Month',
      freeSlots: 6,
      freeSlotsText: '6 Slots Available',
      aiAdvice: '"Steady client gains in February. Your premium programs are getting great traction."',
      growthTips: [
        { icon: '📈', text: 'Up-sell single session clients to multi-packs' },
        { icon: '🟢', text: 'Create weekend recovery masterclasses' },
        { icon: '🤝', text: 'Ask current clients for a Google Review referral' }
      ],
      invoices: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Per Month',
          invoiceNo: 'INV-0226-001',
          amount: 300,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes Per Month',
          invoiceNo: 'INV-0226-002',
          amount: 300,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session',
          invoiceNo: 'INV-0226-003',
          amount: 80,
          status: 'PENDING',
          due: '25 February 2026',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        }
      ],
      history: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Per Month',
          amount: 'RM 300',
          date: '12 Feb 2026',
          status: 'PAID',
          payId: 'TXN-O2093411'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes Per Month',
          amount: 'RM 300',
          date: '15 Feb 2026',
          status: 'PAID',
          payId: 'TXN-O2104598'
        }
      ]
    },
    'March 2026': {
      monthlyRevenue: 'RM 760',
      monthlyRevenueSub: '↑ 11% vs Feb',
      monthlyRevenueUp: true,
      totalCollected: 'RM 760',
      totalCollectedSub: '↑ 26% vs Feb',
      totalCollectedUp: true,
      pendingPayments: 'RM 0',
      pendingPaymentsSub: '0 Invoices Pending',
      completedPayments: '3 Payments',
      completedPaymentsSub: 'All Cleared',
      freeSlots: 5,
      freeSlotsText: '5 Slots Available',
      aiAdvice: '"Perfect payment collection! 100% of invoices are cleared. Focus on client milestones now."',
      growthTips: [
        { icon: '✨', text: 'Celebrate mid-month trainer-client checkpoints' },
        { icon: '📱', text: 'Share video clips of proper squat mechanics' },
        { icon: '🔥', text: 'Conduct quick hydration & nutrition check-ins' }
      ],
      invoices: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Per Month',
          invoiceNo: 'INV-0326-001',
          amount: 300,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes Per Month',
          invoiceNo: 'INV-0326-002',
          amount: 300,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Two Sessions',
          invoiceNo: 'INV-0326-003',
          amount: 160,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        }
      ],
      history: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Per Month',
          amount: 'RM 300',
          date: '10 Mar 2026',
          status: 'PAID',
          payId: 'TXN-O3005822'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes Per Month',
          amount: 'RM 300',
          date: '14 Mar 2026',
          status: 'PAID',
          payId: 'TXN-O3014902'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Two Sessions',
          amount: 'RM 160',
          date: '18 Mar 2026',
          status: 'PAID',
          payId: 'TXN-O3156291'
        }
      ]
    },
    'April 2026': {
      monthlyRevenue: 'RM 820',
      monthlyRevenueSub: '↑ 8% vs Mar',
      monthlyRevenueUp: true,
      totalCollected: 'RM 740',
      totalCollectedSub: '↓ 2.6% vs Mar',
      totalCollectedUp: false,
      pendingPayments: 'RM 80',
      pendingPaymentsSub: '1 Invoice Pending',
      completedPayments: '3 Payments',
      completedPaymentsSub: 'This Month',
      freeSlots: 4,
      freeSlotsText: '4 Slots Available',
      aiAdvice: '"Strong demand continues. Remind Faizul about his pending single session invoice."',
      growthTips: [
        { icon: '🔔', text: 'Send gentle invoice reminders 48h before due' },
        { icon: '💡', text: 'Explain the benefits of block payments to clients' },
        { icon: '🟢', text: 'Open up one temporary slot for a morning group class' }
      ],
      invoices: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Per Month',
          invoiceNo: 'INV-0426-001',
          amount: 300,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Mei Ling Tan',
          package: '5 Classes Per Month',
          invoiceNo: 'INV-0426-002',
          amount: 360,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session',
          invoiceNo: 'INV-0426-003',
          amount: 80,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session Upgrade',
          invoiceNo: 'INV-0426-004',
          amount: 80,
          status: 'PENDING',
          due: '22 April 2026',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        }
      ],
      history: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '4 Classes Per Month',
          amount: 'RM 300',
          date: '08 Apr 2026',
          status: 'PAID',
          payId: 'TXN-O4051012'
        },
        {
          client: 'Mei Ling Tan',
          package: '5 Classes Per Month',
          amount: 'RM 360',
          date: '10 Apr 2026',
          status: 'PAID',
          payId: 'TXN-O4105213'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session',
          amount: 'RM 80',
          date: '12 Apr 2026',
          status: 'PAID',
          payId: 'TXN-O4124991'
        }
      ]
    },
    'May 2026': {
      monthlyRevenue: 'RM 910',
      monthlyRevenueSub: '↑ 11% vs Apr',
      monthlyRevenueUp: true,
      totalCollected: 'RM 910',
      totalCollectedSub: '↑ 23% vs Apr',
      totalCollectedUp: true,
      pendingPayments: 'RM 0',
      pendingPaymentsSub: '0 Invoices Pending',
      completedPayments: '3 Payments',
      completedPaymentsSub: 'Clean Sheet',
      freeSlots: 3,
      freeSlotsText: '3 Slots Available',
      aiAdvice: '"Excellent! Active coaching portfolio is healthy with zero payment friction. Maintain client accountability."',
      growthTips: [
        { icon: '🟢', text: 'Pitch package upgrades during monthly fitness reviews' },
        { icon: '📱', text: 'Highlight summer-body transformation strategies' },
        { icon: '🤝', text: 'Recommend hydration partners for extra revenue' }
      ],
      invoices: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '8 Classes Premium Tier',
          invoiceNo: 'INV-0526-001',
          amount: 520,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes Per Month',
          invoiceNo: 'INV-0526-002',
          amount: 310,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session Upgrade',
          invoiceNo: 'INV-0526-003',
          amount: 80,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        }
      ],
      history: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '8 Classes Premium Tier',
          amount: 'RM 520',
          date: '05 May 2026',
          status: 'PAID',
          payId: 'TXN-O5021200'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes Per Month',
          amount: 'RM 310',
          date: '12 May 2026',
          status: 'PAID',
          payId: 'TXN-O5120391'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session',
          amount: 'RM 80',
          date: '18 May 2026',
          status: 'PAID',
          payId: 'TXN-O5182903'
        }
      ]
    },
    'June 2026': {
      monthlyRevenue: 'RM 990',
      monthlyRevenueSub: '↑ 18% vs May',
      monthlyRevenueUp: true,
      totalCollected: 'RM 910',
      totalCollectedSub: '↑ 22% vs May',
      totalCollectedUp: true,
      pendingPayments: 'RM 80',
      pendingPaymentsSub: '1 Invoice Pending',
      completedPayments: '2 Payments',
      completedPaymentsSub: 'This Month',
      freeSlots: 4,
      freeSlotsText: '4 Slots Available',
      aiAdvice: '"You still have 4 coaching slots available this week."',
      growthTips: [
        { icon: '✨', text: 'Share client transformations regularly' },
        { icon: '🟢', text: 'Offer free consultation to new leads' },
        { icon: '📱', text: 'Post 3–4 times weekly on social media' },
        { icon: '🎯', text: 'Follow up with inactive clients' }
      ],
      invoices: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '8 Classes Per Month',
          invoiceNo: 'INV-0626-001',
          amount: 600,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes Per Month',
          invoiceNo: 'INV-0626-002',
          amount: 310,
          status: 'PAID',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session',
          invoiceNo: 'INV-0626-003',
          amount: 80,
          status: 'PENDING',
          due: '25 June 2026',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        }
      ],
      history: [
        {
          client: 'Ahmad Bin Ibrahim',
          package: '8 Classes',
          amount: 'RM 600',
          date: '15 Jun 2026',
          status: 'PAID',
          payId: 'TXN-O9445218'
        },
        {
          client: 'Mei Ling Tan',
          package: '4 Classes',
          amount: 'RM 310',
          date: '14 Jun 2026',
          status: 'PAID',
          payId: 'TXN-O9134125'
        },
        {
          client: 'Muhammad Faizul',
          package: 'Single Session',
          amount: 'RM 80',
          date: '20 May 2026',
          status: 'PAID',
          payId: 'TXN-O9023405'
        }
      ]
    }
  };

  // Session History Page States
  const [sessionFilter, setSessionFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled/Missed'>('All');
  const [localShowNotificationsDrawer, setLocalShowNotificationsDrawer] = useState(false);
  const showNotificationsDrawer = passedShowNotificationsDrawer !== undefined ? passedShowNotificationsDrawer : localShowNotificationsDrawer;
  const setShowNotificationsDrawer = passedSetShowNotificationsDrawer !== undefined ? passedSetShowNotificationsDrawer : setLocalShowNotificationsDrawer;
  const [selectedWeekDay, setSelectedWeekDay] = useState('2026-06-20');
  const [activeFeedbackSession, setActiveFeedbackSession] = useState<any>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [expandedVideoWorkoutId, setExpandedVideoWorkoutId] = useState<string | null>(null);
  
  const [activeNotifTab, setActiveNotifTab] = useState<'All' | 'Unread' | 'Client Activity' | 'Sessions' | 'Billing'>('All');
  const [notifList, setNotifList] = useState<any[]>([
    {
      id: 'not_1',
      group: 'Today',
      title: 'Ahmad Ibrahim uploaded a meal',
      subtitle: 'Nutrition review needed',
      time: '10:00 AM',
      isUnread: true,
      emoji: '🥗',
      bgColor: 'bg-emerald-50 text-emerald-650 border border-emerald-100',
    },
    {
      id: 'not_2',
      group: 'Today',
      title: 'Mei Ling Tan requested reschedule',
      subtitle: 'Session time change requested',
      time: '10:30 AM',
      isUnread: true,
      emoji: '📅',
      bgColor: 'bg-amber-50 text-amber-650 border border-amber-100',
    },
    {
      id: 'not_3',
      group: 'Today',
      title: 'Muhammad Faizul invoice pending',
      subtitle: 'Payment reminder required',
      time: '11:25 AM',
      isUnread: true,
      emoji: '💳',
      bgColor: 'bg-purple-50 text-purple-650 border border-purple-100',
    },
    {
      id: 'not_4',
      group: 'Yesterday',
      title: 'Session completed',
      subtitle: 'Ahmad Ibrahim completed HIIT Core Strength',
      time: '5:00 PM',
      isUnread: false,
      emoji: '✅',
      bgColor: 'bg-indigo-50 text-indigo-650 border border-indigo-100',
    }
  ]);
  
  // Feedback popup alerts
  const [alertBanner, setAlertBanner] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Floating micro-chats bottom system
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInputText, setChatInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Feedback states
  const [replyingWorkoutId, setReplyingWorkoutId] = useState<string | null>(null);
  const [workoutFeedbackText, setWorkoutFeedbackText] = useState('');

  const [replyingNutritionId, setReplyingNutritionId] = useState<string | null>(null);
  const [nutritionFeedbackText, setNutritionFeedbackText] = useState('');

  // Invoice creator states
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [selectedTraineeId, setSelectedTraineeId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState(150);
  const [invoiceDescription, setInvoiceDescription] = useState('1x Premium HIIT Custom Workout Hour');
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-06-18');
  const [invoiceCreatedSuccess, setInvoiceCreatedSuccess] = useState(false);

  // Prescribe Workout states
  const [showPrescribeForm, setShowPrescribeForm] = useState(false);
  const [prescribeTraineeId, setPrescribeTraineeId] = useState('');
  const [prescribeTraineeName, setPrescribeTraineeName] = useState('');
  const [prescribeWorkoutType, setPrescribeWorkoutType] = useState('HIIT Core Strength');
  const [prescribeDuration, setPrescribeDuration] = useState(45);
  const [prescribeNotes, setPrescribeNotes] = useState('');
  const [prescribeExercises, setPrescribeExercises] = useState<{ name: string; sets: number; reps: number; weight: number }[]>([
    { name: '', sets: 3, reps: 10, weight: 0 }
  ]);
  const [prescribeSuccess, setPrescribeSuccess] = useState(false);
  const [prescribeVideoProofRequired, setPrescribeVideoProofRequired] = useState(true);

  // New States for redesigned Trainer Dashboard & Coaching Hub
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientGoals, setNewClientGoals] = useState('Build Muscle & Strength');
  const [newClientAge, setNewClientAge] = useState(25);
  const [newClientWeight, setNewClientWeight] = useState(70);
  const [newClientHeight, setNewClientHeight] = useState(172);

  // Redesigned Add Client connection states
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePkgOption, setInvitePkgOption] = useState('4-Class Package');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [trainerInvitations, setTrainerInvitations] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Expanded Invoice states
  const [invoiceTitle, setInvoiceTitle] = useState('Personal Training Services Invoice');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [invoiceType, setInvoiceType] = useState('Personal Training Package');
  const [invoiceBillingTarget, setInvoiceBillingTarget] = useState<'individual' | 'selected' | 'all'>('individual');
  const [invoiceSelectedTraineeIds, setInvoiceSelectedTraineeIds] = useState<string[]>([]);

  // Schedule Session states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTraineeId, setScheduleTraineeId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('2026-06-17');
  const [scheduleTimeSlot, setScheduleTimeSlot] = useState('10:00 AM');
  const [scheduleLocation, setScheduleLocation] = useState('SS15 Studio • Selangor');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Session Action Sheet / Completion states
  const [selectedSessionForAction, setSelectedSessionForAction] = useState<any>(null);
  const [showSessionActionSheet, setShowSessionActionSheet] = useState(false);
  const [isReschedulingSession, setIsReschedulingSession] = useState(false);
  const [rescheduleNewDate, setRescheduleNewDate] = useState('2026-06-21');
  const [rescheduleNewTimeSlot, setRescheduleNewTimeSlot] = useState('10:00 AM');

  // Shared slot availability check so both modal grids share the exact same booked slots logic
  const checkSlotIsBooked = (dateStr: string, timeStr: string, excludeBookingId?: string) => {
    if (!bookings || !Array.isArray(bookings)) return false;
    return bookings.some(b => 
      b &&
      b.trainerId === (trainerProfile?.id || 'tr_sarah') && 
      b.date === dateStr && 
      b.timeSlot === timeStr && 
      b.id !== excludeBookingId &&
      b.status !== 'Cancelled' && 
      b.status?.toLowerCase() !== 'cancelled' &&
      b.status !== 'Completed' &&
      b.status?.toLowerCase() !== 'completed'
    );
  };
  const [showLogWorkoutForm, setShowLogWorkoutForm] = useState(false);
  const [sessionFinishWorkoutType, setSessionFinishWorkoutType] = useState('HIIT Core & Strength');
  const [sessionFinishNotes, setSessionFinishNotes] = useState('');
  const [sessionFinishCalories, setSessionFinishCalories] = useState(355);
  const [sessionFinishExercises, setSessionFinishExercises] = useState<{name: string, sets: number, reps: number, weight: number}[]>([
    { name: 'Kettlebell Swings', sets: 4, reps: 12, weight: 16 },
    { name: 'Plank Holds', sets: 3, reps: 60, weight: 0 }
  ]);

  // Assignment Options for Workouts
  const [assignOption, setAssignOption] = useState<'all' | 'selected' | 'individual'>('individual');
  const [selectedTraineeIdsForPrescription, setSelectedTraineeIdsForPrescription] = useState<string[]>([]);

  const [coachingFeed, setCoachingFeed] = useState<any[]>([
    { id: 1, type: 'workout', text: 'Workout feedback successfully sent to Ahmad Bin Ibrahim for HIIT Routine', time: '15 mins ago' },
    { id: 2, type: 'nutrition', text: 'Dietary swap advice provided to Mei Ling Tan (SS15 Gym)', time: '1 hour ago' },
    { id: 3, type: 'photo', text: 'Week 8 progress photo visual comparison reviewed', time: '3 hours ago' },
    { id: 4, type: 'ai', text: 'AI custom metabolic optimizer recommendation approved for Muhammad Faizul', time: 'Yesterday' }
  ]);

  // Modals for Coaching Hub actions
  const [selectedPhotoTrainee, setSelectedPhotoTrainee] = useState<TraineeProfile | null>(null);
  const [photoFeedbackText, setPhotoFeedbackText] = useState('');

  // Billing dummy seed data for rich sorting
  const [billingList, setBillingList] = useState<any[]>([
    { id: "pay_1", traineeName: "Ahmad Bin Ibrahim", traineeId: "te_ahmad", packageName: "8 Classes Per Month", packageType: "Monthly", amount: 600, dueDate: "2026-07-05", status: "Paid", month: "July 2026", invoiceNo: "INV-2026-001", email: "ahmad@coachtrack.my" },
    { id: "pay_2", traineeName: "Mei Ling Tan", traineeId: "te_ling", packageName: "4 Classes Per Month", packageType: "Monthly", amount: 310, dueDate: "2026-06-25", status: "Paid", month: "June 2026", invoiceNo: "INV-2026-002", email: "ling@coachtrack.my" },
    { id: "pay_3", traineeName: "Muhammad Faizul", traineeId: "te_faizul", packageName: "Single Session", packageType: "Single", amount: 80, dueDate: "2026-06-12", status: "Pending", month: "June 2026", invoiceNo: "INV-2026-003", email: "faizul@coachtrack.my" }
  ]);

  useEffect(() => {
    // Clean old corrupted demo fallback storage on load
    const checkNames = ["Amy Wong", "Jason Wong", "Amir Hakim", "Daniel Lee", "Chloe Lim", "Priya Nair", "Nur Aisyah"];
    const keySarah = "bookings_fallback_tr_sarah";
    let shouldReset = false;

    // Check bookings_fallback_tr_sarah
    const storedSarah = localStorage.getItem(keySarah);
    if (storedSarah) {
      if (checkNames.some(name => storedSarah.includes(name))) {
        shouldReset = true;
      }
      try {
        const parsed = JSON.parse(storedSarah);
        const seen = new Set();
        for (const b of parsed) {
          const k = `${b.trainerId || 'tr_sarah'}_${b.date}_${b.timeSlot}`;
          if (seen.has(k)) shouldReset = true;
          seen.add(k);
        }
      } catch {
        shouldReset = true;
      }
    }

    // Check coach_track_demo_storage
    const demoDataRaw = localStorage.getItem('coach_track_demo_storage');
    if (demoDataRaw) {
      if (checkNames.some(name => demoDataRaw.includes(name))) {
        shouldReset = true;
      }
      try {
        const parsed = JSON.parse(demoDataRaw);
        if (parsed?.db?.bookings) {
          const seen = new Set();
          for (const b of parsed.db.bookings) {
            const k = `${b.trainerId || 'tr_sarah'}_${b.date}_${b.timeSlot}`;
            if (seen.has(k)) shouldReset = true;
            seen.add(k);
          }
        }
      } catch {
        shouldReset = true;
      }
    }

    if (shouldReset) {
      localStorage.removeItem(keySarah);
      localStorage.removeItem('coach_track_demo_storage');
      import('../lib/demoData').then(m => {
        m.demoDataService.reset();
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    fetchTrainerData();
    if (chatOpen) {
      fetchChatMessages(activeChatTrainee?.userId);
    }
  }, [trainerProfile, chatOpen, activeChatTrainee]);

  // Hook to handle bottom chat auto scroll
  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Safe default initialization hook for Schedule Session
  useEffect(() => {
    if (showScheduleModal) {
      if (scheduleDate < '2026-06-22' || new Date(scheduleDate).getDay() === 0) {
        setScheduleDate('2026-06-22');
      }
    }
  }, [showScheduleModal]);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setAlertBanner({ message, type });
    setTimeout(() => {
      setAlertBanner(null);
    }, 4000);
  };

  const fetchTrainerData = async () => {
    try {
      if (isSupActive) {
        // Bookings related to this instructor
        const dataBk = await dbService.getBookings({ trainerId: trainerProfile.id });
        if (dataBk && dataBk.length > 0) {
          setBookings(dataBk);
        } else {
          const stored = localStorage.getItem(`bookings_fallback_${trainerProfile.id}`);
          if (stored) {
            setBookings(JSON.parse(stored));
          } else {
            const initialFallback = [
              {
                id: 'b_1',
                trainerId: trainerProfile.id,
                traineeId: 'te_ahmad',
                traineeName: 'Ahmad Bin Ibrahim',
                title: 'HIIT Core Strength',
                type: 'Strength',
                date: '2026-06-20',
                timeSlot: '10:00 AM',
                status: 'Approved',
                location: 'SS15 Studio • Selangor',
                notes: 'Focusing on high intensity spinal extensions and core conditioning'
              },
              {
                id: 'b_2',
                trainerId: trainerProfile.id,
                traineeId: 'te_ling',
                traineeName: 'Mei Ling Tan',
                title: 'Pilates Slimming',
                type: 'Pilates',
                date: '2026-06-20',
                timeSlot: '02:00 PM',
                status: 'Approved',
                location: 'Subang Gym • Selangor',
                notes: 'Reformer posture and abdominal recovery flow'
              },
              {
                id: 'b_3',
                trainerId: trainerProfile.id,
                traineeId: 'te_faizul',
                traineeName: 'Muhammad Faizul',
                title: 'Athletic Strength',
                type: 'Strength',
                date: '2026-06-20',
                timeSlot: '04:00 PM',
                status: 'Approved',
                location: 'PJ Peak Performance',
                notes: 'Olympic weightlifting transitions and posture audits'
              }
            ];
            setBookings(initialFallback);
            localStorage.setItem(`bookings_fallback_${trainerProfile.id}`, JSON.stringify(initialFallback));
          }
        }

        // Workouts logged by clients
        const dataWorkouts = await dbService.getWorkouts({ trainerId: trainerProfile.id });
        setWorkouts(dataWorkouts || []);

        // Get all assigned trainees
        const dataTr = await dbService.getTraineesForTrainer(trainerProfile.id);
        const mappedTrainees = (dataTr || []).map((t: any) => ({
          ...t,
          avatarUrl: resolveTraineeAvatar(t.name, t.avatarUrl)
        }));
        setTrainees(mappedTrainees);

        // Payments from backend
        const dataPay = await dbService.getPayments({ trainerId: trainerProfile.id });
        setPayments(dataPay || []);
        if (dataPay && dataPay.length > 0) {
          const mappedBackendPayments = dataPay.map((p: any) => {
            const traineeInfo = (dataTr || []).find((t: any) => t.id === p.traineeId) || { name: 'Ahmad Bin Ibrahim', email: 'ahmad@coachtrack.my' };
            return {
              id: p.id,
              traineeName: traineeInfo.name,
              traineeId: p.traineeId,
              packageName: p.packageName || p.itemDescription || 'Monthly Coaching Plan',
              packageType: (p.packageName || p.itemDescription || '').toLowerCase().includes('monthly') ? 'Monthly' : 'Single',
              amount: p.amount,
              dueDate: p.dueDate || '2026-06-25',
              status: p.status || 'Pending',
              month: 'June 2026',
              invoiceNo: p.invoiceNo || `COACH-2026-${String(Math.floor(Math.random() * 9000 + 1000))}`,
              email: traineeInfo.email || 'ahmad@coachtrack.my'
            };
          });
          setBillingList(mappedBackendPayments);
        } else {
          setBillingList([]);
        }

        // Fetch trainer invitations
        const dataInv = await dbService.getInvitations({ trainerId: trainerProfile.id });
        setTrainerInvitations(dataInv || []);

        setNutrition([]);
      } else {
        // Demo sandbox mode - Fallback to demo items
        const dataBk = await dbService.getBookings({ trainerId: trainerProfile.id });
        setBookings(dataBk);

        const dataWorkouts = await dbService.getWorkouts({ trainerId: trainerProfile.id });
        setWorkouts(dataWorkouts);

        const dataTr = await dbService.getTraineesForTrainer(trainerProfile.id);
        if (dataTr && dataTr.length > 0) {
          const mappedTrainees = dataTr.map((t: any) => ({
            ...t,
            avatarUrl: resolveTraineeAvatar(t.name, t.avatarUrl)
          }));
          setTrainees(mappedTrainees);
        } else {
          const dataSingle = await dbService.getTraineeProfile('u_ahmad');
          if (dataSingle) {
            const mappedSingle = {
              ...dataSingle,
              avatarUrl: resolveTraineeAvatar(dataSingle.name, dataSingle.avatarUrl)
            };
            setTrainees([mappedSingle]);
          }
        }

        const dataPay = await dbService.getPayments({ trainerId: trainerProfile.id });
        setPayments(dataPay);
        
          setBillingList([
          { id: "pay_1", traineeName: "Ahmad Bin Ibrahim", traineeId: "te_ahmad", packageName: "8 Classes Per Month", packageType: "Monthly", amount: 600, dueDate: "2026-07-05", status: "Paid", month: "July 2026", invoiceNo: "INV-2026-001", email: "ahmad@coachtrack.my" },
          { id: "pay_2", traineeName: "Mei Ling Tan", traineeId: "te_ling", packageName: "4 Classes Per Month", packageType: "Monthly", amount: 310, dueDate: "2026-06-25", status: "Paid", month: "June 2026", invoiceNo: "INV-2026-002", email: "ling@coachtrack.my" },
          { id: "pay_3", traineeName: "Muhammad Faizul", traineeId: "te_faizul", packageName: "Single Session", packageType: "Single", amount: 80, dueDate: "2026-06-12", status: "Pending", month: "June 2026", invoiceNo: "INV-2026-003", email: "faizul@coachtrack.my" }
        ]);

        const dataInv = await dbService.getInvitations({ trainerId: trainerProfile.id });
        setTrainerInvitations(dataInv);

        const dataNutr = await dbService.getNutrition('te_ahmad');
        setNutrition(dataNutr);
      }
    } catch (e) {
      console.error('Error loading coach dashboard data:', e);
    }
  };

  const handleAddClientInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError('');
    setInviteSuccess(false);

    // Enforce subscription-based trainee client limits
    const currentTraineesCount = trainees.length;
    let maxClients = 5; // Starter limit fallback
    const planName = String(trainerProfile.selectedPlan || (trainerProfile as any).selected_plan || 'CoachBasic').toLowerCase();
    
    if (planName.includes('growth') || planName.includes('plus')) {
      maxClients = 20;
    } else if (planName.includes('pro')) {
      maxClients = 50;
    } else {
      maxClients = 5;
    }

    if (currentTraineesCount >= maxClients) {
      setInviteError(`Client limit reached! Your current "${trainerProfile.selectedPlan || (trainerProfile as any).selected_plan || 'CoachBasic'}" supports up to ${maxClients} active trainees. Please upgrade your trainer plan in the Profile page to add more clients.`);
      setInviteLoading(false);
      return;
    }

    try {
      let packageName = invitePkgOption;
      let sessions = 8;
      let price = 299;

      if (invitePkgOption === 'Single Class') {
        packageName = 'Single Class Onboarding Slot';
        sessions = 1;
        price = 80;
      } else if (invitePkgOption === '4-Class Package') {
        packageName = '4-Class Coaching Pass';
        sessions = 4;
        price = 310;
      } else if (invitePkgOption === '8-Class Package') {
        packageName = '8-Class Active Plan';
        sessions = 8;
        price = 600;
      }

      await dbService.createInvitation({
        trainerId: trainerProfile.id,
        traineeEmail: inviteEmail.trim(),
        packageName,
        sessions,
        price
      });

      setInviteSuccess(true);
      setInviteEmail('');
      
      // Update local invites and trainee roster!
      const refreshedInv = await dbService.getInvitations({ trainerId: trainerProfile.id });
      setTrainerInvitations(refreshedInv);

      // Re-trigger global data fetch
      await fetchTrainerData();

      // Show alert visual banner
      setAlertBanner({ message: `Invitation successfully sent to ${inviteEmail.trim()}! Status marked: Pending.`, type: 'success' });
      
      // Close modal after delay
      setTimeout(() => {
        setShowAddClientForm(false);
        setInviteSuccess(false);
      }, 1500);

    } catch (err: any) {
      setInviteError(err.message || 'Failed to send connection request. Check trainee email exists.');
    } finally {
      setInviteLoading(false);
    }
  };

  const registeredTraineesForSlot = useMemo(() => {
    if (!scheduleDate || !scheduleTimeSlot) return [];
    const matched = bookings.filter(b => b.date === scheduleDate && b.timeSlot === scheduleTimeSlot);
    return Array.from(new Set(matched.map(b => b.traineeId)));
  }, [bookings, scheduleDate, scheduleTimeSlot]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleType === 'individual' && !scheduleTraineeId) return;

    // Guard: Prevent Sunday bookings
    if (scheduleDate && new Date(scheduleDate).getDay() === 0) {
      triggerToast("Sundays are unavailable. Trainer schedule is closed.", "info");
      return;
    }

    // Guard: Prevent identical trainer + date + timeSlot duplication
    const isAlreadyBooked = checkSlotIsBooked(scheduleDate, scheduleTimeSlot);
    if (isAlreadyBooked) {
      triggerToast("This slot is already booked. Please choose another time.", "info");
      return;
    }

    try {
      if (scheduleType === 'individual') {
        const selectedT = trainees.find(t => t.id === scheduleTraineeId);
        const payload = {
          trainerId: trainerProfile.id,
          traineeId: scheduleTraineeId,
          traineeName: selectedT ? selectedT.name : 'Client',
          date: scheduleDate,
          timeSlot: scheduleTimeSlot,
          location: scheduleLocation,
          notes: scheduleNotes,
          status: 'Approved' as const,
          packageType: 'Single Slot' as const,
          amountPaid: 150,
          paymentStatus: 'Paid' as const
        };

        const res = await dbService.createBooking(payload);
        if (res) {
          setScheduleSuccess(true);
          triggerToast(`Individual session scheduled successfully with ${selectedT ? selectedT.name : 'Client'}!`, 'success');
        }
      } else {
        // Group Session: Create booking records for each additional participant
        for (const tid of scheduleSelectedTraineeIds) {
          const selectedT = trainees.find(t => t.id === tid);
          const payload = {
            trainerId: trainerProfile.id,
            traineeId: tid,
            traineeName: selectedT ? selectedT.name : 'Client',
            date: scheduleDate,
            timeSlot: scheduleTimeSlot,
            location: scheduleLocation,
            notes: scheduleNotes,
            status: 'Approved' as const,
            packageType: 'Group Slot' as const,
            amountPaid: 150,
            paymentStatus: 'Paid' as const
          };
          await dbService.createBooking(payload);
        }
        setScheduleSuccess(true);
        const totalCount = registeredTraineesForSlot.length + scheduleSelectedTraineeIds.length;
        triggerToast(`Group session scheduled! Total ${totalCount} participants synced.`, 'success');
      }

      setTimeout(() => {
        setScheduleSuccess(false);
        setShowScheduleModal(false);
        setScheduleSelectedTraineeIds([]);
        setScheduleSearchQuery('');
        fetchTrainerData();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchChatMessages = async (targetUserId?: string) => {
    try {
      const recipient = targetUserId || activeChatTrainee?.userId || 'u_ahmad';
      const data = await dbService.getChats('u_sarah', recipient);
      setChatMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFloatingMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    try {
      const targetUid = activeChatTrainee?.userId || 'u_ahmad';
      const payload = {
        senderId: 'u_sarah',
        receiverId: targetUid,
        message: chatInputText,
        replyToType: replyTagType || undefined,
        replyToTitle: replyTagTitle || undefined,
        replyToId: replyTagTitle ? `ctx_${Date.now()}` : undefined
      };

      const res = await dbService.createChatMessage(payload);

      if (res) {
        setChatInputText('');
        setReplyTagType(null);
        setReplyTagTitle('');
        fetchChatMessages(targetUid);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingStatus = async (bookingId: string, status: 'Approved' | 'Cancelled') => {
    try {
      const ok = await dbService.updateBookingStatus(bookingId, status);
      if (ok) {
        triggerToast(`Booking slot successfully ${status.toLowerCase()}!`);
        fetchTrainerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkoutReply = async (workoutId: string, status: string = 'Approved') => {
    if (!workoutFeedbackText.trim()) return;

    try {
      const ok = await dbService.addWorkoutFeedback(workoutId, workoutFeedbackText, status);
      if (ok) {
        setReplyingWorkoutId(null);
        setWorkoutFeedbackText('');
        triggerToast(`Workout flagged as ${status.toLowerCase()} and feedback dispatched!`);
        fetchTrainerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNutritionReply = async (nutritionId: string) => {
    if (!nutritionFeedbackText.trim()) return;

    try {
      const ok = await dbService.addNutritionFeedback(nutritionId, nutritionFeedbackText);
      if (ok) {
        setReplyingNutritionId(null);
        setNutritionFeedbackText('');
        triggerToast('Dietary suggestion updated successfully!');
        fetchTrainerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvoiceCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetIds: string[] = [];
    if (invoiceBillingTarget === 'all') {
      targetIds = trainees.map(t => t.id);
    } else if (invoiceBillingTarget === 'selected') {
      targetIds = invoiceSelectedTraineeIds;
    } else {
      if (selectedTraineeId) {
        targetIds = [selectedTraineeId];
      }
    }

    if (targetIds.length === 0) {
      alert("Please select or assign at least one trainee client!");
      return;
    }

    try {
      // Loop over targeted clients
      for (const targetId of targetIds) {
        const payload = {
          trainerId: trainerProfile.id,
          traineeId: targetId,
          amount: invoiceAmount,
          itemDescription: `${invoiceTitle} - ${invoiceDescription} (${invoiceType})`,
          dueDate: invoiceDueDate
        };

        const res = await dbService.createInvoice(payload);
        if (res) {
          const target = trainees.find(t => t.id === targetId);
          // Add to billing simulation dynamically
          const newSim = {
            id: "pay_sim_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            traineeName: target ? target.name : 'Issued Client',
            traineeId: targetId,
            packageName: `${invoiceTitle} - ${invoiceDescription}`,
            packageType: invoiceType.toLowerCase().includes('monthly') ? 'Monthly' : 'Single',
            amount: invoiceAmount,
            dueDate: invoiceDueDate,
            status: 'Pending',
            month: 'June 2026',
            invoiceNo: 'INV-2026-000' + String(Math.floor(Math.random() * 90 + 10)),
            email: target ? target.email : 'client@coachtrack.my',
            notes: invoiceNotes
          };
          setBillingList(prev => [newSim, ...prev]);
        }
      }

      setInvoiceCreatedSuccess(true);
      triggerToast(`Custom Invoice issued successfully to ${targetIds.length} client(s)!`, 'success');
      setTimeout(() => {
        setInvoiceCreatedSuccess(false);
        setShowInvoiceForm(false);
        setInvoiceNotes('');
        setInvoiceTitle('Personal Training Services Invoice');
        setInvoiceDescription('1x Premium HIIT Custom Workout Hour');
        setInvoiceAmount(150);
        setInvoiceBillingTarget('individual');
        setInvoiceSelectedTraineeIds([]);
        fetchTrainerData();
      }, 1200);

    } catch (err) {
      console.error(err);
    }
  };

  const handlePrescribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetIds: string[] = [];
    if (assignOption === 'all') {
      targetIds = trainees.map(t => t.id);
    } else if (assignOption === 'selected') {
      targetIds = selectedTraineeIdsForPrescription;
    } else {
      if (prescribeTraineeId) {
        targetIds = [prescribeTraineeId];
      }
    }

    if (targetIds.length === 0) {
      alert("Please select or assign to at least one trainee client!");
      return;
    }

    try {
      const payload = {
        trainerId: trainerProfile.id,
        traineeId: targetIds[0], // fallback compatibility
        traineeIds: targetIds, // handles multi targets
        workoutType: prescribeWorkoutType,
        duration: prescribeDuration,
        exercises: prescribeExercises.filter(ex => ex.name.trim() !== ''),
        notes: prescribeNotes,
        videoProofRequired: prescribeVideoProofRequired
      };

      const res = await dbService.createPrescribedWorkout(payload);

      if (res) {
        setPrescribeSuccess(true);
        triggerToast(`Routine prescribed successfully to ${targetIds.length} client(s)!`);
        setTimeout(() => {
          setPrescribeSuccess(false);
          setShowPrescribeForm(false);
          setPrescribeNotes('');
          setPrescribeExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
          setAssignOption('individual');
          setSelectedTraineeIdsForPrescription([]);
          fetchTrainerData();
        }, 1205);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveClientExecute = async (traineeId: string) => {
    setActionProcessing(true);
    try {
      const success = await dbService.unassignTrainee(traineeId);
      if (success) {
        triggerToast("Client removed from your active coaching roster successfully", "success");
        await fetchTrainerData();
        setRemovingTrainee(null);
      } else {
        alert("Failed to unassign client. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while removing client.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleMarkSessionCompleted = (sessionId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === sessionId) {
        return {
          ...b,
          status: 'Completed' as const,
          notes: b.notes || 'Trainee physical exercise routines audited and checked off completely.'
        };
      }
      return b;
    }));
    triggerToast("Session marked as Completed! Presence records compiled.", "success");
  };

  const handleSaveSessionFeedback = () => {
    if (!feedbackSessionId) return;
    setBookings(prev => prev.map(b => {
      if (b.id === feedbackSessionId) {
        return {
          ...b,
          notes: feedbackInput
        };
      }
      return b;
    }));
    triggerToast("Session audit details updated successfully!", "success");
    setFeedbackSessionId(null);
    setFeedbackInput('');
  };

  // Trainee Deep Stats Helper (Gives realistic mock values for extra trainees)
  const getTraineeStats = (traineeId: string) => {
    const traineeWorkouts = workouts.filter(w => w.traineeId === traineeId);
    const traineeMeals = nutrition.filter(n => n.traineeId === traineeId);
    const traineeBookings = bookings.filter(b => b.traineeId === traineeId);
    
    const defaults: Record<string, any> = {
      'te_ahmad': {
        targetWeight: 75,
        completionRate: 42,
        completedWorkouts: 5,
        missedWorkouts: 7,
        lastCheckin: traineeWorkouts.length > 0 
          ? `${traineeWorkouts[0].date} - ${traineeWorkouts[0].workoutType}` 
          : "2026-06-10 - Cardio Interval Run",
        lastWorkoutDate: "2026-06-10",
        latestMeal: traineeMeals.length > 0 
          ? `${traineeMeals[0].foodName} (${traineeMeals[0].calories} kcal)` 
          : "Nasi Lemak tapi kurang manis (620 kcal)",
        packageName: "8 Classes Per Month",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        amountPaid: 600,
        dueDate: "None",
        invoiceCount: 1,
        nextSession: traineeBookings.length > 0 && traineeBookings[0].status === 'Approved'
          ? `${traineeBookings[0].date} @ ${traineeBookings[0].timeSlot}` 
          : "2026-06-12 @ 10:00 AM",
        bodyMetrics: { weight: 84, height: 176, bodyFat: 21.8, muscleMass: 36.4, bmr: 1730 },
        attendance: "42% (5/12 completed)",
        notes: "Excellent commitment to cardio metrics. Lower lumbar spine feels stable after glute bridge repetitions. Needs reminder about daily water consumption in Subang heat."
      },
      'te_ling': {
        targetWeight: 52,
        completionRate: 78,
        completedWorkouts: 14,
        missedWorkouts: 4,
        lastCheckin: "2026-06-09 - Reformer Pilates Level 1",
        lastWorkoutDate: "2026-06-09",
        latestMeal: "Shredded Quinoa Salad & Chicken Breast (390 kcal)",
        packageName: "4 Classes Per Month",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        amountPaid: 310,
        dueDate: "None",
        invoiceCount: 1,
        nextSession: "2026-06-13 @ 2:30 PM",
        bodyMetrics: { weight: 58, height: 162, bodyFat: 25.5, muscleMass: 21.2, bmr: 1250 },
        attendance: "78% (14/18 completed)",
        notes: "Post-partum abdominal separation (diastasis recti) is healing well. Focus on safe transverse abdominis stabilizers. Strict posture control on pelvic alignment."
      },
      'te_jason': {
        targetWeight: 72,
        completionRate: 0,
        completedWorkouts: 0,
        missedWorkouts: 0,
        lastCheckin: "No workouts completed yet",
        lastWorkoutDate: "N/A",
        latestMeal: "No meals logged",
        packageName: "Single Session",
        paymentStatus: "Pending",
        outstandingAmount: 80,
        amountPaid: 0,
        dueDate: "2026-06-12",
        invoiceCount: 1,
        nextSession: "2026-06-20 @ 11:00 AM",
        bodyMetrics: { weight: 78, height: 175, bodyFat: 24.2, muscleMass: 29.5, bmr: 1620 },
        attendance: "0% (0/1 completed)",
        notes: "New client. Focusing on baseline strength and posture assessment."
      },
      'te_aisyah': {
        targetWeight: 55,
        completionRate: 65,
        completedWorkouts: 11,
        missedWorkouts: 6,
        lastCheckin: "2026-06-11 - MetCon Bodyweight Circuit",
        lastWorkoutDate: "2026-06-11",
        latestMeal: "Grilled salmon & asparagus (420 kcal)",
        packageName: "4 Classes Per Month",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        amountPaid: 310,
        dueDate: "None",
        invoiceCount: 1,
        nextSession: "2026-06-15 @ 4:00 PM",
        bodyMetrics: { weight: 62, height: 165, bodyFat: 22.1, muscleMass: 24.5, bmr: 1380 },
        attendance: "65% (11/17 completed)",
        notes: "High work capacity in conditioning blocks. Watch for left ankle inversion fatigue."
      },
      'te_daniel': {
        targetWeight: 82,
        completionRate: 91,
        completedWorkouts: 20,
        missedWorkouts: 2,
        lastCheckin: "2026-06-14 - Compound Powerlifting Deadlift Set",
        lastWorkoutDate: "2026-06-14",
        latestMeal: "Brown Rice & Double Grilled Chicken Breast (820 kcal)",
        packageName: "8 Classes Per Month",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        amountPaid: 600,
        dueDate: "None (Fully Paid)",
        invoiceCount: 1,
        nextSession: "None Scheduled",
        bodyMetrics: { weight: 92, height: 180, bodyFat: 17.6, muscleMass: 42.8, bmr: 1980 },
        attendance: "91% (20/22 completed)",
        notes: "High potential for deadlift target of 180kg. Work on thoracic spine extension under heavy loads. Form is solid, but tends to hyper-extend lower lumbar at lockouts."
      },
      'te_priya': {
        targetWeight: 52,
        completionRate: 72,
        completedWorkouts: 10,
        missedWorkouts: 4,
        lastCheckin: "2026-06-13 - Upper Body Push-Pull Hypertrophy",
        lastWorkoutDate: "2026-06-13",
        latestMeal: "Tofu Scramble & Avocado Toast (380 kcal)",
        packageName: "4 Classes Per Month",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        amountPaid: 310,
        dueDate: "None",
        invoiceCount: 1,
        nextSession: "2026-06-19 @ 9:00 AM",
        bodyMetrics: { weight: 55, height: 160, bodyFat: 23.4, muscleMass: 20.8, bmr: 1220 },
        attendance: "72% (10/14 completed)",
        notes: "Consistent effort. Excellent shoulder mobilization progression."
      },
      'te_amir': {
        targetWeight: 85,
        completionRate: 50,
        completedWorkouts: 6,
        missedWorkouts: 6,
        lastCheckin: "2026-06-08 - Barbell Squat Progressions",
        lastWorkoutDate: "2026-06-08",
        latestMeal: "Mixed Beef Rice bowl (720 kcal)",
        packageName: "8 Classes Per Month",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        amountPaid: 600,
        dueDate: "None",
        invoiceCount: 1,
        nextSession: "2026-06-17 @ 11:00 AM",
        bodyMetrics: { weight: 95, height: 185, bodyFat: 26.8, muscleMass: 38.2, bmr: 1890 },
        attendance: "50% (6/12 completed)",
        notes: "Form on deep squats has improved significantly. Focus on hip flexor stretching."
      },
      'te_chloe': {
        targetWeight: 50,
        completionRate: 85,
        completedWorkouts: 17,
        missedWorkouts: 3,
        lastCheckin: "2026-06-12 - Agility ladder & speed sprints",
        lastWorkoutDate: "2026-06-12",
        latestMeal: "Acai Berry protein bowl (310 kcal)",
        packageName: "8 Classes Per Month",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        amountPaid: 600,
        dueDate: "None",
        invoiceCount: 1,
        nextSession: "2026-06-18 @ 6:00 PM",
        bodyMetrics: { weight: 52, height: 158, bodyFat: 18.2, muscleMass: 22.0, bmr: 1190 },
        attendance: "85% (17/20 completed)",
        notes: "Very high athletic speed. Continuing to improve functional flexibility under fatigue."
      }
    };
    
    return defaults[traineeId] || {
      targetWeight: 70,
      completionRate: 80,
      completedWorkouts: 8,
      missedWorkouts: 2,
      lastCheckin: "None logged this cycle",
      lastWorkoutDate: "N/A",
      latestMeal: "No meal logged today",
      packageName: "Custom Package",
      paymentStatus: "Pending",
      outstandingAmount: 150,
      dueDate: "2026-06-20",
      invoiceCount: 1,
      nextSession: "None Booked",
      bodyMetrics: { weight: 75, height: 170, bodyFat: 19.5, muscleMass: 31.0, bmr: 1510 },
      attendance: "80% (8/10 completed)",
      notes: "Baseline training details configured. Maintain consistency across workout prescriptions."
    };
  };

  // Saved manual Notes
  const handleSaveTraineeNotes = () => {
    if (!selectedTrainee) return;
    setNotesSuccess(true);
    triggerToast(`Coaching notes updated for ${selectedTrainee.name}!`);
    setTimeout(() => {
      setNotesSuccess(false);
    }, 2000);
  };

  // Link any Log contextual reference directly back to chat thread
  const linkContextToChat = async (contextRef: string, defaultPrompt: string) => {
    if (!selectedTrainee) return;
    try {
      await dbService.createChatMessage({
        senderId: 'u_sarah',
        receiverId: selectedTrainee.userId,
        message: `📢 Replying to ${contextRef}`
      });
      
      // Update thread focus instantly
      setActiveChatTrainee({
        id: selectedTrainee.id,
        userId: selectedTrainee.userId,
        name: selectedTrainee.name,
        avatarUrl: selectedTrainee.avatarUrl,
        initials: selectedTrainee.name.substring(0, 2).toUpperCase(),
        status: 'online'
      });
      
      setChatOpen(true);
      setChatInputText(defaultPrompt);
      fetchChatMessages(selectedTrainee.userId);
      triggerToast("Linked item context smoothly into client chat!");
    } catch (err) {
      console.error("Context mapping failed:", err);
    }
  };

  // AI Recommendation Trigger (Gemini-supported)
  const handleAskAiRecommendation = async (traineeId: string) => {
    setLoadingAi(true);
    setAiRecommendation(null);
    try {
      const res = await fetch('/api/ai/workout-rec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeId })
      });
      if (res.ok) {
        const data = await res.json();
        setAiRecommendation(data);
      } else {
        triggerToast('Could not fetch AI generation. Try again.', 'info');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Export records CSV
  const handleExportPayments = () => {
    const csvContent = "Trainee,Package,Amount (RM),Due Date,Status\n" + 
      billingList.map(b => `"${b.traineeName}","${b.packageName}",${b.amount},${b.dueDate},"${b.status}"`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CoachTrack_Revenue_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Malaysia Revenue records exported to CSV successfully!');
  };

  // Filters for Billing data
  const filteredBilling = billingList.filter(b => {
    // Sub-tab filter
    if (paymentSubTab !== 'All') {
      if (paymentSubTab === 'Pending' && b.status !== 'Pending') return false;
      if (paymentSubTab === 'Paid' && b.status !== 'Paid') return false;
      if (paymentSubTab === 'Overdue' && b.status !== 'Overdue') return false;
    }
    // Month filter
    if (filterMonth !== 'All' && !b.month.includes(filterMonth)) return false;
    // Package filter
    if (filterPackage !== 'All' && b.packageType !== filterPackage) return false;
    
    return true;
  });

  // Math for Revenue Dashboard
  const paidSumRevenue = billingList.filter(p => p.status === 'Paid').reduce((sum, item) => sum + item.amount, 0);
  const pendingSumRevenue = billingList.filter(p => p.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);
  const overdueSumRevenue = billingList.filter(p => p.status === 'Overdue').reduce((sum, item) => sum + item.amount, 0);
  
  const totalInvoiced = paidSumRevenue + pendingSumRevenue + overdueSumRevenue;
  const singleSessionsCount = billingList.filter(b => b.packageType === 'Single').length;
  const monthlyPacksCount = billingList.filter(b => b.packageType === 'Monthly').length;

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 space-y-4 font-sans bg-slate-100/50 rounded-2xl border border-slate-200">
        <RefreshCw className="w-10 h-10 text-indigo-700 animate-spin" />
        <p className="text-sm font-semibold text-slate-800">Loading trainer profile...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center shadow-lg font-sans">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3 animate-bounce" />
        <h3 className="text-base font-bold text-slate-900 mb-2">Profile Loading Failed</h3>
        <p className="text-xs text-rose-700 mb-4">{profileError}</p>
        <button 
          onClick={loadProfile}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
        >
          Troubleshoot or Try Again
        </button>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white border border-slate-200 rounded-3xl shadow-xl font-sans">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-indigo-50 text-indigo-700 rounded-full mb-3">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black font-display text-slate-900">Complete Your Trainer Profile</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Welcome to CoachTrack! We need a few more details to set up your business command center and roster live fitness plans.
          </p>
        </div>

        <form onSubmit={handleSaveOnboarding} className="space-y-6 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Discipline / Specialty
              </label>
              <input 
                type="text" 
                value={onboardDiscipline} 
                onChange={(e) => setOnboardDiscipline(e.target.value)}
                placeholder="e.g., HIIT & Calorie Burning, Strength Training"
                required
                className="w-full text-xs font-medium px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-600 text-slate-800 font-sans"
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Location
              </label>
              <input 
                type="text" 
                value={onboardLocation} 
                onChange={(e) => setOnboardLocation(e.target.value)}
                placeholder="e.g., Subang Jaya, PJ, KL"
                required
                className="w-full text-xs font-medium px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-650 text-slate-800 font-sans"
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Trainer Type (Freelance / Studio)
              </label>
              <select 
                value={onboardType} 
                onChange={(e) => setOnboardType(e.target.value)}
                className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-600 text-slate-800 font-sans"
              >
                <option value="Freelance">Freelance Personal Trainer</option>
                <option value="Full-Time Club Trainer">Full-Time Club Trainer</option>
                <option value="Studio Owner">Commercial Studio Owner</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Years of Experience
              </label>
              <input 
                type="number" 
                value={onboardExperience} 
                onChange={(e) => setOnboardExperience(e.target.value)}
                min="0"
                max="50"
                required
                className="w-full text-xs font-medium px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-600 text-slate-800 font-sans"
              />
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Selected Trainer Plan
              </label>
              <select 
                value={onboardPlan} 
                onChange={(e) => setOnboardPlan(e.target.value)}
                className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-600 text-slate-800 font-sans"
              >
                <option value="CoachBasic">CoachBasic (RM29/mo)</option>
                <option value="CoachPlus">CoachPlus (RM59/mo)</option>
                <option value="CoachPro">CoachPro (RM99/mo)</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Phone Number
              </label>
              <input 
                type="tel" 
                value={onboardPhone} 
                onChange={(e) => setOnboardPhone(e.target.value)}
                placeholder="e.g., +60 14-948 4056"
                required
                className="w-full text-xs font-medium px-4 py-3 bg-slate-50 border border-slate-250 rounded-xl focus:border-[#001F3F] text-slate-800 font-sans"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                Verification Status
              </label>
              <input 
                type="text" 
                value={onboardVerification} 
                readOnly
                className="w-full text-xs font-semibold px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl font-sans cursor-not-allowed select-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={savingOnboard}
            className="w-full mt-4 py-4 bg-indigo-900 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition duration-150 ease-in-out cursor-pointer flex items-center justify-center gap-2"
          >
            {savingOnboard ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Trainer Profile</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  if (sessionToLog) {
    const isFormComplete = !!(logWorkoutType && logWorkoutType.trim()) && !!logDuration && !!(logNotes && logNotes.trim());
    return (
      <div className="w-full bg-slate-50 min-h-screen pb-16 pt-2 text-left relative">
        <AnimatePresence>
          {alertBanner && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 left-4 right-4 z-50 mx-auto px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold text-white flex items-center gap-2.5 w-[calc(100%-32px)] max-w-[360px] box-border break-words ${
                alertBanner.type === 'success' ? 'bg-[#001F3F] border-b-4 border-teal-400' : 'bg-slate-900 border-b-4 border-indigo-400'
              }`}
            >
              <span className="text-base">{alertBanner.type === 'success' ? '🚀' : 'ℹ️'}</span>
              <p className="flex-1 font-sans">{alertBanner.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 text-left font-sans max-w-4xl mx-auto pb-12 animate-fade-in mt-3">
            {/* Sub-Header / Back button */}
            <div className="flex items-center gap-1.5 mb-1 select-none">
              <button 
                type="button"
                onClick={() => setSessionToLog(null)}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition cursor-pointer font-bold text-xs"
              >
                ←
              </button>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Back to Dashboard</span>
            </div>

            {/* 1. Header and Subtitle */}
            <div className="border-b border-slate-200 pb-2">
              <h2 className="text-[20px] font-extrabold font-display text-slate-900 tracking-tight uppercase leading-tight">
                Workout Session
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Record coaching outcomes and client performance
              </p>
            </div>

            {/* 2. CLIENT CARD */}
            {(() => {
              const matchedTrainee = trainees.find(t => 
                t.id === sessionToLog.traineeId || 
                (t.name && sessionToLog.traineeName && t.name.toLowerCase().trim().includes(sessionToLog.traineeName.toLowerCase().trim())) ||
                (t.name && sessionToLog.traineeName && sessionToLog.traineeName.toLowerCase().trim().includes(t.name.toLowerCase().trim()))
              );
              const traineeName = sessionToLog.traineeName || matchedTrainee?.name || "Client";
              const traineePhoto = resolveTraineeAvatar(traineeName, sessionToLog.traineePhoto || sessionToLog.photo || matchedTrainee?.avatarUrl);
              const traineeGoal = matchedTrainee?.goals || "Athletic strength preparation, fat loss conditioning, and clean meal alignment.";
              const sessionWorkoutName = sessionToLog.title || sessionToLog.workoutName || "HIIT Core Strength";

              return (
                <div className="bg-white border border-slate-200/60 rounded-[16px] p-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-left border-l-4 border-l-indigo-650">
                  <div className="flex items-center gap-3">
                    <img 
                      src={traineePhoto} 
                      alt={traineeName} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shadow-xs shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-[14px] leading-tight">
                        {traineeName}
                      </h3>
                      <p className="text-[11px] font-semibold text-indigo-700 mt-0.5 font-sans leading-relaxed">
                        🎯 {traineeGoal}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          Session:
                        </span>
                        <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-850 px-2 py-0.2 rounded">
                          {sessionWorkoutName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-1.5 self-stretch sm:self-auto pt-3 sm:pt-0 border-t border-slate-100 sm:border-0 font-sans">
                    <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <span>⏱</span>
                      <span className="font-bold text-[#001F3F] font-mono">
                        {sessionToLog.timeSlot || "09:00 AM - 10:00 AM"}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                      Status: In Progress
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* 3. WORKOUT SUMMARY Display as modern fitness cards */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                Workout Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200/60 rounded-[14px] p-3 shadow-xs text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans truncate">
                    Workout Type
                  </span>
                  <input 
                    type="text" 
                    value={logWorkoutType}
                    onChange={(e) => setLogWorkoutType(e.target.value)}
                    className="text-xs font-bold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 w-full focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="bg-white border border-slate-200/60 rounded-[14px] p-3 shadow-xs text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans truncate">
                    Duration
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      value={logDuration}
                      onChange={(e) => setLogDuration(Number(e.target.value))}
                      className="text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 w-16 focus:ring-1 focus:ring-indigo-400 focus:outline-none font-mono text-center"
                    />
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-sans">Mins</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-[14px] p-3 shadow-xs text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-sans truncate">
                    Calories Burned
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      value={logCalories}
                      onChange={(e) => setLogCalories(Number(e.target.value))}
                      className="text-xs font-bold text-slate-900 bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1.5 w-16 focus:ring-1 focus:ring-indigo-400 focus:outline-none font-mono text-center"
                    />
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">kcal</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/60 rounded-[14px] p-3 shadow-xs text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-sans truncate">
                      Intensity
                    </span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded font-mono">
                      {logIntensity}/10
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={logIntensity}
                    onChange={(e) => setLogIntensity(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5"
                  />
                </div>
              </div>
            </div>

            {/* 4. EXERCISES COMPLETED */}
            <div className="bg-white border border-slate-200/60 rounded-[16px] p-4 shadow-xs text-left">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Exercises Completed
                </h4>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.2 rounded uppercase font-sans">
                  {logExercises.length} Completed
                </span>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {logExercises.map((ex, index) => (
                  <div 
                    key={ex.id || index}
                    className="bg-slate-50 border border-slate-200/50 rounded-[12px] p-3 flex flex-col justify-between relative shadow-2xs hover:border-indigo-200 transition"
                  >
                    {/* Delete button */}
                    <button 
                      type="button"
                      onClick={() => {
                        setLogExercises(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-355 hover:text-rose-500 font-bold text-[10px] transition cursor-pointer"
                      title="Remove exercise"
                    >
                      ✕
                    </button>

                    <div className="flex items-start gap-1.5 mb-2 pr-2.5">
                      <span className="text-emerald-500 font-bold shrink-0 text-xs mt-0.5 font-sans">✓</span>
                      <input 
                        type="text" 
                        value={ex.name}
                        onChange={(e) => {
                          const updated = [...logExercises];
                          updated[index].name = e.target.value;
                          setLogExercises(updated);
                        }}
                        placeholder="Exercise name"
                        className="p-1 px-2 text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-[8px] shadow-2xs w-full focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <div>
                        <label className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5 font-sans text-center">Sets</label>
                        <input 
                          type="number" 
                          value={ex.sets}
                          onChange={(e) => {
                            const updated = [...logExercises];
                            updated[index].sets = Number(e.target.value);
                            setLogExercises(updated);
                          }}
                          className="p-0.5 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded w-full font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5 font-sans text-center">Reps</label>
                        <input 
                          type="number" 
                          value={ex.reps}
                          onChange={(e) => {
                            const updated = [...logExercises];
                            updated[index].reps = Number(e.target.value);
                            setLogExercises(updated);
                          }}
                          className="p-0.5 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded w-full font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5 font-sans text-center">Wt (kg)</label>
                        <input 
                          type="number" 
                          value={ex.weight}
                          onChange={(e) => {
                            const updated = [...logExercises];
                            updated[index].weight = Number(e.target.value);
                            setLogExercises(updated);
                          }}
                          className="p-0.5 text-[10px] font-bold text-slate-700 bg-white border border-slate-200 rounded w-full font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setLogExercises(prev => [
                    ...prev,
                    { id: 'ex_' + Date.now() + Math.random(), name: '', sets: 3, reps: 10, weight: 0 }
                  ]);
                }}
                className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 border-dashed rounded-[10px] text-[11px] font-bold text-slate-600 cursor-pointer transition font-sans"
              >
                <span>➕</span>
                <span>Add Exercise</span>
              </button>
            </div>

            {/* 5. CLIENT PERFORMANCE */}
            <div className="bg-white border border-slate-200/60 rounded-[16px] p-4 shadow-xs text-left">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 font-sans">
                Client Performance
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Energy */}
                <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider font-sans">Energy Level</span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">{logEnergyLevel}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={logEnergyLevel}
                    onChange={(e) => setLogEnergyLevel(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1"
                  />
                  <div className="flex justify-between text-[7px] uppercase font-bold text-slate-450 mt-1 font-mono">
                    <span>1 (Low)</span>
                    <span>10 (Peak)</span>
                  </div>
                </div>

                {/* Effort */}
                <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider font-sans">Effort</span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">{logEffort}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={logEffort}
                    onChange={(e) => setLogEffort(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1"
                  />
                  <div className="flex justify-between text-[7px] uppercase font-bold text-slate-455 mt-1 font-mono">
                    <span>1 (Min)</span>
                    <span>10 (Max)</span>
                  </div>
                </div>

                {/* Form Quality */}
                <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider font-sans">Form Quality</span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">{logFormQuality}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={logFormQuality}
                    onChange={(e) => setLogFormQuality(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1"
                  />
                  <div className="flex justify-between text-[7px] uppercase font-bold text-slate-455 mt-1 font-mono">
                    <span>1 (Needs Work)</span>
                    <span>10 (Pristine)</span>
                  </div>
                </div>

                {/* Mobility */}
                <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider font-sans">Mobility</span>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">{logMobility}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={logMobility}
                    onChange={(e) => setLogMobility(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1"
                  />
                  <div className="flex justify-between text-[7px] uppercase font-bold text-slate-455 mt-1 font-mono">
                    <span>1 (Stiff)</span>
                    <span>10 (Fluid)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. TRAINER NOTES */}
            <div className="bg-white border border-slate-200/60 rounded-[16px] p-4 shadow-xs text-left">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">
                Trainer Notes
              </h4>
              <textarea 
                rows={3}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 leading-relaxed font-sans focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                placeholder="Client demonstrated improved squat depth..."
              />
            </div>

            {/* 7. CLIENT MOOD */}
            <div className="bg-white border border-slate-200/60 rounded-[16px] p-4 shadow-xs text-left">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-sans">
                Client Mood
              </h4>
              <div className="flex flex-wrap gap-1.5 text-xs select-none font-medium">
                {[
                  { val: 'Excellent', icon: '😀 Excellent', activeBg: 'bg-emerald-100 border-emerald-400 text-emerald-950 border font-bold' },
                  { val: 'Good', icon: '🙂 Good', activeBg: 'bg-indigo-100 border-indigo-400 text-indigo-950 border font-bold' },
                  { val: 'Average', icon: '😐 Average', activeBg: 'bg-amber-100 border-amber-350 text-amber-950 border font-bold' },
                  { val: 'Low Energy', icon: '😴 Low Energy', activeBg: 'bg-slate-200 border-slate-400 text-slate-900 border font-bold' }
                ].map((moodItem) => (
                  <button
                    key={moodItem.val}
                    type="button"
                    onClick={() => setLogMood(moodItem.val)}
                    className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase cursor-pointer transition duration-100 font-sans ${
                      logMood === moodItem.val 
                        ? moodItem.activeBg
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/85'
                    }`}
                  >
                    {moodItem.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* 8. SESSION OUTCOME */}
            <div className="bg-white border border-slate-200/60 rounded-[16px] p-4 shadow-xs text-left">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-sans">
                Session Outcome
              </h4>
              <div className="flex flex-wrap gap-1.5 text-xs select-none font-medium text-left">
                {[
                  { val: 'Completed Successfully', activeBg: 'bg-teal-100 border-teal-400 text-teal-900 border font-bold' },
                  { val: 'Modified Workout', activeBg: 'bg-purple-100 border-purple-400 text-purple-900 border font-bold' },
                  { val: 'Partial Completion', activeBg: 'bg-amber-100 border-amber-400 text-amber-900 border font-bold' },
                  { val: 'Recovery Session', activeBg: 'bg-indigo-100 border-indigo-400 text-indigo-900 border font-bold' }
                ].map((outcomeItem) => (
                  <button
                    key={outcomeItem.val}
                    type="button"
                    onClick={() => setLogOutcome(outcomeItem.val)}
                    className={`px-3 py-1.5 border rounded-lg text-[10px] font-bold uppercase cursor-pointer transition duration-100 font-sans ${
                      logOutcome === outcomeItem.val
                        ? outcomeItem.activeBg
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50/85'
                    }`}
                  >
                    {outcomeItem.val}
                  </button>
                ))}
              </div>
            </div>

            {/* 9. BOTTOM STICKY ACTIONS */}
            <div className="pt-4 border-t border-slate-200 flex flex-col gap-2 mt-3 font-sans max-w-xl ml-auto">
              <div className="flex justify-end items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setSessionToLog(null)}
                  className="flex-1 h-[44px] bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-[10px] font-bold text-[13px] cursor-pointer text-center flex items-center justify-center"
                >
                  Cancel
                </button>
                
                <button 
                  type="button"
                  onClick={async () => {
                    const logData = {
                      traineeId: sessionToLog.traineeId || 'te_ahmad',
                      date: new Date().toISOString().split('T')[0],
                      workoutType: logWorkoutType,
                      duration: logDuration,
                      exercises: logExercises.map(ex => ({ name: ex.name, sets: ex.sets, reps: ex.reps, weight: ex.weight })),
                      notes: `[Saved Workout Draft]\nOutcome: ${logOutcome}\nMood: ${logMood}\nNotes: ${logNotes}`
                    };
                    await dbService.createWorkoutLog(logData);
                    triggerToast("Workout log draft saved successfully!", "success");
                    setSessionToLog(null);
                    fetchTrainerData();
                  }}
                  className="flex-1 h-[44px] bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-900 rounded-[10px] font-bold text-[13px] cursor-pointer text-center flex items-center justify-center"
                >
                  Save Workout
                </button>
              </div>

              <div className="flex justify-end w-full">
                <button 
                  type="button"
                  disabled={!isFormComplete}
                  onClick={async () => {
                    if (!isFormComplete) return;
                    const logData = {
                      traineeId: sessionToLog.traineeId || 'te_ahmad',
                      date: new Date().toISOString().split('T')[0],
                      workoutType: logWorkoutType,
                      duration: logDuration,
                      exercises: logExercises.map(ex => ({ name: ex.name || 'Strength Movement', sets: ex.sets, reps: ex.reps, weight: ex.weight })),
                      notes: `[Session Completed]\nOutcome: ${logOutcome}\nMood: ${logMood}\nTrainer Notes: ${logNotes}\nMetrics: Energy: ${logEnergyLevel}, Effort: ${logEffort}, Form: ${logFormQuality}, Mobility: ${logMobility}`
                    };
                    await dbService.createWorkoutLog(logData);
                    await dbService.updateBookingStatus(sessionToLog.id, 'Completed');
                    setBookings(prev => {
                      const next = prev.map(b => b.id === sessionToLog.id ? { ...b, status: 'Completed' } : b);
                      localStorage.setItem(`bookings_fallback_${trainerProfile.id}`, JSON.stringify(next));
                      return next;
                    });
                    triggerToast(`Session successfully completed and logged! ✓`, "success");
                    setSessionToLog(null);
                    fetchTrainerData();
                  }}
                  className={`w-full h-[44px] rounded-[10px] font-bold text-[13px] cursor-pointer text-center transition flex justify-center items-center ${
                    isFormComplete 
                      ? 'bg-[#041F63] hover:bg-[#041F63]/90 text-white shadow-md' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Complete Session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedTrainee) {
    // 1. Dynamic Client Statistics derived from current state
    const currentTraineeLogs = bodyLogs[selectedTrainee.id] || [];
    const latestLog = currentTraineeLogs[currentTraineeLogs.length - 1] || {
      weight: selectedTrainee.weight || 84,
      height: selectedTrainee.height || 176,
      waist: 94,
      chest: 104,
      hip: 108,
      arm: 38,
      thigh: 62,
      bmi: 27.1,
      bmr: 1805,
      bodyFat: 21.8,
      notes: "No logs logged yet."
    };

    // Calculate dynamic age/gender details
    const traineeAge = selectedTrainee.age || 28;
    const isTraineeMale = !(selectedTrainee.name.toLowerCase().includes('ling') || selectedTrainee.name.toLowerCase().includes('may'));

    // 2. Download Handlers
    const handleDownloadBodyCSV = () => {
      const list = bodyLogs[selectedTrainee.id] || [];
      const header = "Date,Weight (kg),Height (cm),BMI,BMR (kcal),Body Fat (%),Waist (cm),Chest (cm),Hip (cm),Arm (cm),Thigh (cm),Notes\n";
      const rows = list.map(l => {
        return `"${l.date}",${l.weight},${l.height},${l.bmi.toFixed(1)},${l.bmr.toFixed(0)},${l.bodyFat.toFixed(1)},${l.waist},${l.chest},${l.hip},${l.arm},${l.thigh},"${l.notes.replace(/"/g, '""')}"`;
      }).join("\n");
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedTrainee.name.replace(/\s+/g, '_')}_Body_Measurements.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Body measurements exported successfully!');
    };

    const handleDownloadSessionsCSV = () => {
      const csvHeaders = "Date,Session Name,Duration,Calories burned,Rating,Exercises,Pain/Discomfort,Trainer Notes,Client Mood,Outcome\n";
      const csvRows = AHMAD_COMPLETED_SESSIONS.map(row => {
        const cleanExercises = row.exercises.map(ex => ex.replace(/^•\s*/, '')).join('; ');
        return `"${row.date}","${row.name}","${row.duration}","${row.calories}","${row.rating}","${cleanExercises.replace(/"/g, '""')}","${row.pain.replace(/"/g, '""')}","${row.notes.replace(/"/g, '""')}","${row.mood.replace(/"/g, '""')}","${row.outcome.replace(/"/g, '""')}"`;
      }).join("\n");
      
      const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedTrainee.name.replace(/\s+/g, '_')}_Session_History.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Ahmad Bin Ibrahim\'s premium session history downloaded! ✓', "success");
    };

    const handleDownloadNutritionCSV = () => {
      const clientMeals = nutrition.filter(n => n.traineeId === selectedTrainee.id);
      const listToDownload = clientMeals.length > 0 ? clientMeals : activeMealsList;
      const header = "Date,Time,Meal Name,Calories,Protein,Carbs,Fat,Fiber,Coach Feedback,AI Insight\n";
      const rows = listToDownload.map(n => {
        const savedComment = mealComments[n.id] || n.trainerFeedback || 'None';
        const aiInsightText = n.aiInsight || (n.foodName.includes('Nasi Lemak') ? 'High carb meal. Reduce rice portion slightly and add more lean protein.' : 'Solid protein profile.');
        const mealTime = n.time || (n.foodName.includes('Nasi Lemak') ? '03:15 PM' : n.foodName.includes('Chicken') ? '12:30 PM' : n.foodName.includes('Shake') ? '05:00 PM' : '07:30 PM');
        return `"${n.date}","${mealTime}","${n.foodName}",${n.calories},${n.protein},${n.carbs},${n.fat},${n.fiber || 5},"${savedComment.replace(/"/g, '""')}","${aiInsightText.replace(/"/g, '""')}"`;
      }).join("\n");
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedTrainee.name.replace(/\s+/g, '_')}_Nutrition_History.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Nutrition history exported successfully! ✓', "success");
    };

    const handleDownloadMedicalCSV = () => {
      const note = medicalObsNotes[selectedTrainee.id] || "No medical notes.";
      const header = "Date,Condition,Injury,Medication,Allergy,Pain Area,Severity,Restriction,Trainer Note,Clearance Status\n";
      const row = `"2026-06-21","Mild lower back discomfort","Previous knee strain","None","None","Lower back","Mild","Avoid heavy barbell squats","${note.replace(/"/g, '""')}","Cleared for Training"`;
      const blob = new Blob([header + row], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${selectedTrainee.name.replace(/\s+/g, '_')}_Medical_History.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Medical history exported successfully!');
    };

    // Calculate current session items
    const clientWorkouts = workouts.filter(w => w.traineeId === selectedTrainee.id);
    // Suppress empty states with solid seeds so the UI feels alive
    const sessionLogsToDraw = clientWorkouts.length > 0 ? clientWorkouts : [
      { id: 's_s1', date: '2026-06-21', workoutType: 'HIIT Core Strength', duration: 45, notes: 'Terrific intensity today. Back strain avoided perfectly.', exercises: [] },
      { id: 's_s2', date: '2026-06-18', workoutType: 'Cardio Endurance', duration: 55, notes: 'Steady jogging at 135 average heart rate.', exercises: [] },
      { id: 's_s3', date: '2026-06-15', workoutType: 'Strength Training', duration: 45, notes: 'Focus on perfect form during squats.', exercises: [] }
    ];

    // Calculate total calories burned this week
    const totalWeeklyCaloriesBurned = sessionLogsToDraw.length * 450; 

    // Handle posting coach comments on a meal
    const handlePostMealComment = (mealId: string, commentVal: string) => {
      setMealComments(prev => ({
        ...prev,
        [mealId]: commentVal
      }));
      triggerToast("Coach meal comment saved successfully! ✓", "success");
    };

    // Filter nutrition logs dynamically based on the sub-tab filter
    const activeDateStr = nutritionActiveDate === 'today' ? '2026-06-21' : (nutritionActiveDate === 'yesterday' ? '2026-06-20' : customNutritionDate);
    const traineeNutritionLogs = nutrition.filter(n => n.traineeId === selectedTrainee.id && n.date === activeDateStr);
    
    // Fallback seed nutrition logs if selected date has no entries
    const activeMealsList = traineeNutritionLogs.length > 0 ? traineeNutritionLogs.map(m => ({
      ...m,
      time: m.time || (m.foodName.includes('Nasi Lemak') ? '03:15 PM' : m.foodName.includes('Chicken') ? '12:30 PM' : m.foodName.includes('Shake') ? '05:00 PM' : '07:30 PM'),
      mealType: m.mealType || (m.foodName.includes('Nasi Lemak') ? 'Lunch' : m.foodName.includes('Chicken') ? 'Breakfast' : m.foodName.includes('Shake') ? 'Post Workout' : 'Dinner'),
      aiInsight: m.aiInsight || (m.foodName.includes('Nasi Lemak') ? 'High carb meal. Reduce rice portion slightly and add more lean protein.' : m.foodName.includes('Chicken') ? 'Solid protein profile. Try swapping seasoned rice with steamed white rice to cut down fat.' : m.foodName.includes('Shake') ? 'Optimal post-recovery protein uptake. Facilitates active cellular recovery.' : 'Swap next time for steamed flat noodles to lower overall lipid profiles.'),
      trainerFeedback: m.trainerFeedback || (m.foodName.includes('Nasi Lemak') ? 'Excellent choice, but control sambal and rice portion.' : 'Very consistent nutrient profiling today.')
    })) : [
      { 
        id: 'm_1', 
        traineeId: selectedTrainee.id, 
        date: activeDateStr, 
        foodName: 'Hainanese Chicken Rice', 
        calories: 620, 
        protein: 32, 
        carbs: 75, 
        fat: 22, 
        fiber: 2, 
        notes: "Roasted fragrant chicken slices served with seasoned oil rice and spicy garlic chili paste.",
        time: '12:30 PM',
        mealType: 'Breakfast',
        aiInsight: 'Solid protein profile. Try swapping seasoned rice with steamed white rice to cut down fat.',
        trainerFeedback: 'Great roasted choice. Solid portion of proteins!'
      },
      { 
        id: 'm_2', 
        traineeId: selectedTrainee.id, 
        date: activeDateStr, 
        foodName: 'Nasi Lemak Biasa & Fried Egg', 
        calories: 650, 
        protein: 18, 
        carbs: 85, 
        fat: 25, 
        fiber: 4, 
        notes: "Traditional coconut rice served with boiled cucumber, crispy peanuts, fried anchovies, and a farm-fresh fried egg.",
        time: '03:15 PM',
        mealType: 'Lunch',
        aiInsight: 'High carb meal. Reduce rice portion slightly and add more lean protein.',
        trainerFeedback: 'Excellent choice, but control sambal and rice portion.'
      },
      { 
        id: 'm_3', 
        traineeId: selectedTrainee.id, 
        date: activeDateStr, 
        foodName: 'Protein Recovery Shake', 
        calories: 310, 
        protein: 35, 
        carbs: 20, 
        fat: 4, 
        fiber: 6, 
        notes: "Whey isolate shake with half banana.",
        time: '05:00 PM',
        mealType: 'Post Workout',
        aiInsight: 'Optimal post-recovery protein uptake. Facilitates active cellular recovery.',
        trainerFeedback: 'Excellent choices post-run. Try not to exceed 1 banana scoop.'
      },
      { 
        id: 'm_4', 
        traineeId: selectedTrainee.id, 
        date: activeDateStr, 
        foodName: 'Stir-fried Beef Noodles', 
        calories: 520, 
        protein: 45, 
        carbs: 60, 
        fat: 16, 
        fiber: 16, 
        notes: "Lean flank steak with whole wheat high fiber flat noodles.",
        time: '07:30 PM',
        mealType: 'Dinner',
        aiInsight: 'Swap next time for steamed flat noodles to lower overall lipid profiles.',
        trainerFeedback: 'Controlled carbohydrates in the evening would yield much higher alert levels.'
      }
    ];

    // Compute dynamic nutrients total for dynamic KPI Cards!
    const totalDailyCal = activeMealsList.reduce((acc, m) => acc + (m.calories || 0), 0);
    const totalDailyProtein = activeMealsList.reduce((acc, m) => acc + (m.protein || 0), 0);
    const totalDailyCarbs = activeMealsList.reduce((acc, m) => acc + (m.carbs || 0), 0);
    const totalDailyFat = activeMealsList.reduce((acc, m) => acc + (m.fat || 0), 0);
    const totalDailyFiber = activeMealsList.reduce((acc, m) => acc + (m.fiber || 5), 0);

    const targetCalorieGoal = 1800;
    const isDailyExceeded = totalDailyCal > targetCalorieGoal;

    const handleSaveWeightOnly = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const wt = parseFloat(fd.get('weight') as string);
      const dtStr = fd.get('date') as string || new Date().toISOString().substring(0, 10);
      
      if (isNaN(wt)) return;

      const list = [...(bodyLogs[selectedTrainee.id] || [])];
      const existingIdx = list.findIndex(l => l.date === dtStr);

      const ht = selectedTrainee.height || 176;
      const age = selectedTrainee.age || 28;
      const male = !(selectedTrainee.name.toLowerCase().includes('ling') || selectedTrainee.name.toLowerCase().includes('may'));

      const calculatedBMI = wt / ((ht / 100) * (ht / 100));
      const calculatedBMR = 10 * wt + 6.25 * ht - 5 * age + (male ? 5 : -161);

      if (existingIdx > -1) {
        // Update existing record
        const ext = list[existingIdx];
        
        let calculatedFat = 0;
        if (male) {
          calculatedFat = (ext.waist * 0.574) + (ext.thigh * 0.2) + (ext.chest * 0.1) - (ht * 0.1) - 10;
        } else {
          calculatedFat = (ext.waist * 0.52) + (ext.hip * 0.25) - (ht * 0.08) - 5;
        }
        calculatedFat = Math.max(5, Math.min(45, calculatedFat));

        list[existingIdx] = {
          ...ext,
          weight: wt,
          bmi: Math.round(calculatedBMI * 10) / 10,
          bmr: Math.round(calculatedBMR),
          bodyFat: Math.round(calculatedFat * 10) / 10,
        };
      } else {
        // Create new record
        const base = list[list.length - 1] || { waist: 94, chest: 104, hip: 108, arm: 38, thigh: 62 };
        
        let calculatedFat = 0;
        if (male) {
          calculatedFat = (base.waist * 0.574) + (base.thigh * 0.2) + (base.chest * 0.1) - (ht * 0.1) - 10;
        } else {
          calculatedFat = (base.waist * 0.52) + (base.hip * 0.25) - (ht * 0.08) - 5;
        }
        calculatedFat = Math.max(5, Math.min(45, calculatedFat));

        list.push({
          date: dtStr,
          weight: wt,
          height: ht,
          bmi: Math.round(calculatedBMI * 10) / 10,
          bmr: Math.round(calculatedBMR),
          bodyFat: Math.round(calculatedFat * 10) / 10,
          waist: base.waist,
          chest: base.chest,
          hip: base.hip,
          arm: base.arm,
          thigh: base.thigh,
          notes: "Weight logged."
        });
      }

      list.sort((a, b) => a.date.localeCompare(b.date));

      setBodyLogs(prev => ({
        ...prev,
        [selectedTrainee.id]: list
      }));

      setEditingWeightLogDate(null);
      form.reset();
      triggerToast(`Weight saved successfully! ✓`, "success");
    };

    const handleSaveGirthOnly = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      const fd = new FormData(form);
      const dtStr = fd.get('date') as string || new Date().toISOString().substring(0, 10);
      const wst = parseFloat(fd.get('waist') as string);
      const chst = parseFloat(fd.get('chest') as string);
      const hp = parseFloat(fd.get('hip') as string);
      const am = parseFloat(fd.get('arm') as string);
      const th = parseFloat(fd.get('thigh') as string);

      if (isNaN(wst) || isNaN(chst) || isNaN(hp) || isNaN(am) || isNaN(th)) {
        triggerToast("Please fill all measurement fields.", "error");
        return;
      }

      const list = [...(bodyLogs[selectedTrainee.id] || [])];
      const existingIdx = list.findIndex(l => l.date === dtStr);

      const ht = selectedTrainee.height || 176;
      const age = selectedTrainee.age || 28;
      const male = !(selectedTrainee.name.toLowerCase().includes('ling') || selectedTrainee.name.toLowerCase().includes('may'));

      let calculatedFat = 0;
      if (male) {
        calculatedFat = (wst * 0.574) + (th * 0.2) + (chst * 0.1) - (ht * 0.1) - 10;
      } else {
        calculatedFat = (wst * 0.52) + (hp * 0.25) - (ht * 0.08) - 5;
      }
      calculatedFat = Math.max(5, Math.min(45, calculatedFat));

      if (existingIdx > -1) {
        // Update existing record
        const ext = list[existingIdx];
        const wt = ext.weight;
        const calculatedBMI = wt / ((ht / 100) * (ht / 100));
        const calculatedBMR = 10 * wt + 6.25 * ht - 5 * age + (male ? 5 : -161);

        list[existingIdx] = {
          ...ext,
          waist: wst,
          chest: chst,
          hip: hp,
          arm: am,
          thigh: th,
          bodyFat: Math.round(calculatedFat * 10) / 10,
          bmi: Math.round(calculatedBMI * 10) / 10,
          bmr: Math.round(calculatedBMR)
        };
      } else {
        // Create new record
        const base = list[list.length - 1] || { weight: selectedTrainee.weight || 84 };
        const wt = base.weight;
        const calculatedBMI = wt / ((ht / 100) * (ht / 100));
        const calculatedBMR = 10 * wt + 6.25 * ht - 5 * age + (male ? 5 : -161);

        list.push({
          date: dtStr,
          weight: wt,
          height: ht,
          bmi: Math.round(calculatedBMI * 10) / 10,
          bmr: Math.round(calculatedBMR),
          bodyFat: Math.round(calculatedFat * 10) / 10,
          waist: wst,
          chest: chst,
          hip: hp,
          arm: am,
          thigh: th,
          notes: "Girth measurements logged."
        });
      }

      list.sort((a, b) => a.date.localeCompare(b.date));

      setBodyLogs(prev => ({
        ...prev,
        [selectedTrainee.id]: list
      }));

      setEditingGirthLogDate(null);
      form.reset();
      triggerToast(`Girth measurements saved successfully! ✓`, "success");
    };

    return (
      <div className="w-full bg-[#F8FAFC] min-h-screen pb-24 text-left relative overflow-x-hidden box-border break-words font-sans">
        
        {/* Toast Alert Banner inside sub-routing */}
        <AnimatePresence>
          {alertBanner && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 left-4 right-4 z-50 mx-auto px-4 py-3 rounded-xl shadow-2xl text-xs font-bold text-white flex items-center gap-2.5 w-[calc(100%-32px)] max-w-[360px] box-border break-words ${
                alertBanner.type === 'success' ? 'bg-[#001F3F] border-b-4 border-teal-400' : 'bg-slate-900 border-b-4 border-indigo-400'
              }`}
            >
              <span className="text-base">{alertBanner.type === 'success' ? '🚀' : 'ℹ️'}</span>
              <p className="flex-1 font-sans">{alertBanner.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLIENT PROFILE CONTAINER */}
        <div className={`mx-auto px-4 pt-4 transition-all duration-300 ${profileSection === 'sessions' ? 'max-w-md md:max-w-3xl font-sans' : 'max-w-md font-sans'}`}>
          
          {/* BACK ARROW LINK */}
          <button 
            onClick={() => setSelectedTrainee(null)}
            className="text-[#061A4D] hover:text-[#14B8A6] font-bold text-xs flex items-center gap-1.5 mb-4 px-1 cursor-pointer transition-colors uppercase tracking-wider font-sans select-none"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Back to Trainees</span>
          </button>
          
          {/* CLIENT HEADER COMPACT CARD */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-3xs mb-4 text-left relative">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img 
                  src={selectedTrainee.avatarUrl} 
                  alt={selectedTrainee.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#14B8A6] shadow-3xs"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="font-extrabold text-slate-900 text-sm truncate font-sans tracking-tight leading-none">
                    {selectedTrainee.name}
                  </h2>
                  <span className="text-[8px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-black font-sans uppercase tracking-wide border border-emerald-200/50 leading-none shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold truncate mb-1 leading-none">
                  Goal: {selectedTrainee.goals.toLowerCase().includes('post') ? 'Post-partum restoration' : 'Weight Loss & Cardio'}
                </p>
                <div className="flex items-center gap-2 select-none">
                  <span className="text-[9px] font-extrabold text-[#061A4D] bg-indigo-50/70 border border-indigo-100 px-1.5 py-0.5 rounded">
                    📦 {getTraineeStats(selectedTrainee.id).packageName || "8 Classes Per Month"}
                  </span>
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                    <span>{selectedTrainee.streakCount || 5} Days</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC SECTION PILLS */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-4 select-none touch-pan-x">
            {[
              { id: 'body', label: 'Body Measurements' },
              { id: 'sessions', label: 'Session History' },
              { id: 'nutrition', label: 'Nutrition History' },
              { id: 'medical', label: 'Medical History' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setProfileSection(sec.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  profileSection === sec.id
                    ? 'bg-[#061A4D] text-white shadow-sm font-sans'
                    : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50 font-sans'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* SECTION CONTENTS */}
          
          {/* ======================================================== */}
          {/* 1. BODY MEASUREMENTS SECTION */}
          {profileSection === 'body' && (
            <BodyMeasurementsRedesign 
              selectedTrainee={selectedTrainee} 
              bodyLogs={bodyLogs} 
              setBodyLogs={setBodyLogs}
              handleDownloadBodyCSV={handleDownloadBodyCSV}
              triggerToast={triggerToast}
              traineeAge={traineeAge}
              isTraineeMale={isTraineeMale}
            />
          )}

          {/* ======================================================== */}
          {/* 2. SESSION HISTORY SECTION */}
          {profileSection === 'sessions' && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6 text-left"
            >
              
              {/* SECTION 1 - WEEKLY PERFORMANCE OVERVIEW */}
              <div>
                <p className="text-2xs font-extrabold text-[#061A4D]/60 uppercase tracking-widest mb-3 font-sans">
                  WEEKLY PERFORMANCE OVERVIEW
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Card 1: Calories Burned */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-3xs hover:shadow-2xs transition-all duration-200 select-none">
                    <div className="flex items-center gap-1 mb-1.5 text-amber-500">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Calories Burned</span>
                    </div>
                    <p className="font-black text-slate-900 text-sm leading-none mb-1">
                      450 <span className="text-3xs text-slate-400 font-bold">kcal</span>
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                      ↑ 16% vs last week
                    </span>
                  </div>

                  {/* Card 2: Sessions Completed */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-3xs hover:shadow-2xs transition-all duration-200 select-none">
                    <div className="flex items-center gap-1 mb-1.5 text-indigo-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Sess. Completed</span>
                    </div>
                    <p className="font-black text-slate-900 text-sm leading-none mb-1">
                      3
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                      ↑ 1 vs last week
                    </span>
                  </div>

                  {/* Card 3: Training Duration */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-3xs hover:shadow-2xs transition-all duration-200 select-none">
                    <div className="flex items-center gap-1 mb-1.5 text-teal-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Duration</span>
                    </div>
                    <p className="font-black text-slate-900 text-sm leading-none mb-1">
                      180 <span className="text-3xs text-slate-400 font-bold">mins</span>
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                      ↑ 20 mins vs last wk
                    </span>
                  </div>

                  {/* Card 4: Average Session Rating */}
                  <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-3xs hover:shadow-2xs transition-all duration-200 select-none">
                    <div className="flex items-center gap-1 mb-1.5 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">Avg. Rating</span>
                    </div>
                    <p className="font-black text-slate-900 text-sm leading-none mb-1">
                      4.8 <span className="text-3xs text-slate-400 font-bold">/ 5</span>
                    </p>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">
                      ↑ 0.3 vs last week
                    </span>
                  </div>
                </div>
              </div>

              {/* GRAPHS & CONSISTENCY CONTAINER (Dynamic double column on desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* SECTION 2 - CALORIES BURNED TREND */}
                <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-3xs md:col-span-2 select-none relative">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <p className="text-[10.5px] font-black text-[#061A4D] uppercase tracking-widest font-sans">
                      CALORIES BURNED TREND (LAST 8 WEEKS)
                    </p>
                    
                    {/* Dropdown filter selector */}
                    <div className="relative shrink-0">
                      <select 
                        id="trend-filter-dropdown"
                        value={trendFilterRange}
                        onChange={(e) => setTrendFilterRange(e.target.value)}
                        className="bg-[#F8FAFC]/90 border border-slate-200 text-slate-750 font-extrabold text-2xs py-1.5 pl-3 pr-8 rounded-xl cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none font-sans"
                      >
                        <option value="8 Weeks">8 Weeks</option>
                        <option value="4 Weeks">4 Weeks</option>
                      </select>
                      <ChevronDown className="w-4.5 h-4.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Modern responsive bezier Line chart built with precise inline styling SVG */}
                  <div className="w-full h-44 relative bg-slate-50/40 rounded-2xl border border-slate-100 p-2.5 flex flex-col justify-between">
                    <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="trend-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid background lines */}
                      <line x1="30" y1="40" x2="450" y2="40" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="30" y1="92" x2="450" y2="92" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                      <line x1="30" y1="144" x2="450" y2="144" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                      
                      {/* Left vertical indicators */}
                      <text x="5" y="44" className="text-[10px] font-extrabold fill-slate-400 font-sans">700</text>
                      <text x="5" y="96" className="text-[10px] font-extrabold fill-slate-400 font-sans">500</text>
                      <text x="5" y="148" className="text-[10px] font-extrabold fill-slate-400 font-sans">300</text>
                      
                      {/* Area Fill Gradient under curve */}
                      <path 
                        d="M 30 144 C 60 128.4, 60 112.8, 90 112.8 C 120 112.8, 120 131, 150 131 C 180 131, 180 92, 210 92 C 240 92, 240 53, 270 53 C 300 53, 300 40, 330 40 C 360 40, 360 86.8, 390 86.8 C 420 86.8, 420 105, 450 105 L 450 170 L 30 170 Z" 
                        fill="url(#trend-grad)" 
                      />
                      
                      {/* Bezier Line Curve */}
                      <path 
                        d="M 30 144 C 60 128.4, 60 112.8, 90 112.8 C 120 112.8, 120 131, 150 131 C 180 131, 180 92, 210 92 C 240 92, 240 53, 270 53 C 300 53, 300 40, 330 40 C 360 40, 360 86.8, 390 86.8 C 420 86.8, 420 105, 450 105" 
                        fill="none" 
                        stroke="#14B8A6" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />
                      
                      {/* Weekly Circle dots and markers */}
                      {[
                        { x: 30, y: 144, val: 300, label: "Week 1" },
                        { x: 90, y: 112.8, val: 420, label: "Week 2" },
                        { x: 150, y: 131, val: 350, label: "Week 3" },
                        { x: 210, y: 92, val: 500, label: "Week 4" },
                        { x: 270, y: 53, val: 650, label: "Week 5" },
                        { x: 330, y: 40, val: 700, label: "Week 6" },
                        { x: 390, y: 86.8, val: 520, label: "Week 7" },
                        { x: 450, y: 105, val: 450, label: "Week 8" }
                      ].map((pt, pIdx) => (
                        <g key={pIdx} className="group cursor-pointer">
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r="5" 
                            className="fill-white stroke-teal-500 stroke-2 hover:fill-teal-500 hover:r-7 transition-all duration-150" 
                          />
                          <text 
                            x={pt.x} 
                            y={pt.y - 12} 
                            textAnchor="middle" 
                            className="text-[9px] font-black fill-slate-850 bg-white px-1 shadow-xs rounded font-sans"
                          >
                            {pt.val}
                          </text>
                          <text 
                            x={pt.x} 
                            y="190" 
                            textAnchor="middle" 
                            className="text-[9px] font-black fill-slate-400 font-sans"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* SECTION 3 - CONSISTENCY SCORE */}
                <div className="bg-white border border-slate-200/85 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between select-none">
                  <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest font-sans mb-3 text-left">
                    CONSISTENCY SCORE
                  </p>
                  
                  <div className="flex flex-col items-center justify-center my-auto py-1">
                    {/* Circle Indicator Container */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90 animate-pulse-slow">
                        <circle 
                          cx="56" 
                          cy="56" 
                          r="46" 
                          stroke="#E2E8F0" 
                          strokeWidth="8" 
                          fill="transparent" 
                        />
                        <motion.circle 
                          cx="56" 
                          cy="56" 
                          r="46" 
                          stroke="#14B8A6" 
                          strokeWidth="8.5" 
                          strokeDasharray={2 * Math.PI * 46}
                          initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
                          animate={{ strokeDashoffset: (2 * Math.PI * 46) * (1 - 0.92) }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          fill="transparent" 
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Text in the middle */}
                      <div className="absolute text-center flex flex-col items-center">
                        <span className="text-2xl font-black text-[#061A4D] block tracking-tight">92%</span>
                        <span className="text-[9px] font-black text-teal-600 uppercase tracking-widest leading-none">Excellent</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3 text-center">
                      Attended 11 of 12 scheduled sessions
                    </p>
                  </div>
                  
                  {/* Green badge: consistency feedback info */}
                  <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-2.5 mt-3 flex items-start gap-2 text-left">
                    <span className="text-sm shrink-0 text-emerald-600 font-bold">✓</span>
                    <div className="text-left font-sans">
                      <p className="text-[10.5px] font-black text-emerald-800 leading-tight">Great consistency</p>
                      <p className="text-[9.5px] font-extrabold text-emerald-600 leading-normal">Keep up the momentum.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 4 - SESSION HISTORY TABLE */}
              <div className="bg-white border border-slate-200/85 rounded-xl p-3.5 shadow-3xs">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest font-sans">
                    SESSION HISTORY
                  </p>
                  <span className="text-[9.5px] font-black text-indigo-700 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-lg select-none">
                    4 Recorded sessions
                  </span>
                </div>
                
                {/* Responsive Table Grid */}
                <div className="overflow-hidden rounded-2xl border border-slate-100 font-sans">
                  {/* Table Header */}
                  <div className="grid grid-cols-5 bg-[#061A4D]/5 p-3.5 border-b border-slate-200/60 text-[9.5px] font-black text-[#061A4D] uppercase tracking-wider select-none text-left">
                    <span className="col-span-1">Date</span>
                    <span className="col-span-2">Session Name</span>
                    <span className="col-span-1">Duration</span>
                    <span className="col-span-1 text-right">Calories</span>
                  </div>

                  {/* Table Body Rows */}
                  <div className="divide-y divide-slate-100 bg-white">
                    {AHMAD_COMPLETED_SESSIONS.map((row) => {
                      const isExpanded = !!expandedSessions[row.idx];
                      return (
                        <div key={row.idx} className="transition-all duration-200">
                          
                          {/* Row Header Line */}
                          <button 
                            onClick={() => {
                              setExpandedSessions(prev => ({
                                ...prev,
                                [row.idx]: !prev[row.idx]
                              }));
                            }}
                            className={`w-full grid grid-cols-5 p-3.5 items-center text-xs font-semibold hover:bg-slate-50/70 transition-colors text-left cursor-pointer ${isExpanded ? 'bg-[#14B8A6]/5' : ''}`}
                          >
                            <span className="col-span-1 text-slate-550 font-extrabold font-sans text-left">{row.date}</span>
                            <span className="col-span-2 text-slate-900 font-extrabold flex items-center gap-1.5 font-sans justify-start">
                              <span className="truncate">{row.name}</span>
                              <span className="shrink-0 flex items-center gap-0.5 bg-amber-50 rounded px-1.5 py-0.5 text-[9px] font-black text-amber-700 font-sans">
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                <span>{row.rating}</span>
                              </span>
                            </span>
                            <span className="col-span-1 text-slate-600 font-bold font-sans text-left">{row.duration}</span>
                            <span className="col-span-1 text-right text-[#061A4D] font-black flex items-center justify-end gap-1">
                              <span>{row.calories}</span>
                              <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transform transition-transform duration-250 ${isExpanded ? 'rotate-180 text-teal-600' : ''}`} />
                            </span>
                          </button>
                          
                          {/* Row Expandable details drawer */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden bg-slate-50/40 border-t border-slate-100"
                              >
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                  {/* Left: Exercises List */}
                                  <div className="bg-white rounded-2xl border border-slate-205 border-slate-200/50 p-3.5 shadow-xs">
                                    <p className="text-[10px] font-black text-[#061A4D] uppercase tracking-wider mb-2.5 select-none">
                                      🏋️ Exercises Performed
                                    </p>
                                    <ul className="space-y-1">
                                      {row.exercises.map((ex, exIdx) => (
                                        <li key={exIdx} className="text-[14px] font-medium text-slate-700 font-sans text-left leading-tight">
                                          {ex}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  {/* Right: Detailed Session Specs */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white rounded-xl border border-slate-200/50 p-2.5 shadow-xs text-left">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">Duration</span>
                                      <span className="text-[14px] font-semibold text-[#061A4D] block">{row.duration}</span>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200/50 p-2.5 shadow-xs text-left">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">Calories Burned</span>
                                      <span className="text-[14px] font-semibold text-[#14B8A6] block">{row.calories}</span>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200/50 p-2.5 shadow-xs text-left col-span-2">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">Pain/Discomfort</span>
                                      <span className="text-[14px] font-medium text-slate-700 leading-[1.4] block">{row.pain}</span>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200/50 p-2.5 shadow-xs text-left col-span-2">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">Trainer Notes</span>
                                      <p className="text-[14px] font-medium text-slate-600 leading-snug italic">"{row.notes}"</p>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200/50 p-2.5 shadow-xs text-left">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">Client Mood</span>
                                      <span className="text-xs font-semibold text-indigo-700 block leading-tight">{row.mood}</span>
                                    </div>
                                    <div className="bg-white rounded-xl border border-slate-200/50 p-2.5 shadow-xs text-left">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide block mb-0.5">Outcome</span>
                                      <span className="text-xs font-semibold text-emerald-700 block leading-tight">{row.outcome}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 5 - DOWNLOAD BUTTON */}
              <DownloadButton 
                id="btn-dl-sessions-premium-refcard"
                onClick={handleDownloadSessionsCSV}
                label="DOWNLOAD SESSION REPORT"
              />

              {/* SECTION 6 - PERSONAL RECORDS */}
              <div>
                <p className="text-2xs font-extrabold text-[#061A4D]/60 uppercase tracking-widest mb-3 font-sans">
                  🏆 PERSONAL RECORDS
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
                  {/* Card 1 */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Highest Calories Burned</span>
                    <span className="text-base font-black text-slate-900">500 kcal</span>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Longest Workout</span>
                    <span className="text-base font-black text-[#14B8A6]">90 mins</span>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Most Consistent Week</span>
                    <span className="text-base font-black text-indigo-700">5 Sessions</span>
                  </div>
                  {/* Card 4 */}
                  <div className="bg-white border border-slate-200/80 rounded-[20px] p-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                    <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-1">Best Attendance</span>
                    <span className="text-base font-black text-rose-600">92%</span>
                  </div>
                </div>
              </div>

              {/* SECTION 7 - COACHAI PERFORMANCE INSIGHT */}
              <div className="bg-[#061A4D] text-white border border-slate-800 rounded-[24px] p-6 shadow-[0_12px_32px_rgba(6,26,77,0.12)] relative overflow-hidden">
                {/* Visual sparkles absolute bg decor */}
                <div className="absolute right-0 top-0 w-36 h-36 bg-gradient-to-bl from-teal-500/20 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-3 select-none">
                  <Sparkles className="w-5 h-5 text-teal-400 fill-teal-400" />
                  <p className="text-[10px] font-black tracking-widest uppercase text-teal-400 font-sans">
                    ✨ COACHAI PERFORMANCE INSIGHT
                  </p>
                </div>
                
                <div className="space-y-2.5 font-sans text-xs select-text leading-relaxed text-slate-200 text-left">
                  <p className="font-medium text-slate-300">
                    Based on current trends, Ahmad is on track to achieve his weight-loss goal in approximately <span className="text-teal-300 font-black">11 weeks</span>.
                  </p>
                </div>
                
                {/* Horizontal line divider */}
                <div className="border-t border-slate-700/60 my-4.5" />
                
                {/* Focus recommendation box */}
                <div className="text-left select-none">
                  <span className="text-[10px] font-black text-teal-400/80 tracking-wider uppercase block mb-1">
                    FOCUS RECOMMENDATION
                  </span>
                  <p className="text-xs font-extrabold text-teal-300 leading-normal font-sans">
                    Increase cardio duration by 10 minutes per session to accelerate fat loss and improve endurance.
                  </p>
                </div>
              </div>

            </motion.div>
          )}

          {/* ======================================================== */}
          {/* 3. NUTRITION HISTORY SECTION */}
          {profileSection === 'nutrition' && (() => {
            const displayedTitleText = nutritionActiveDate === 'today'
              ? 'Today'
              : nutritionActiveDate === 'yesterday'
                ? 'Yesterday'
                : customNutritionDate
                  ? new Date(customNutritionDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'Selected Date';

            // Calculate dynamic Nutrition Score based on target 1800
            const calorieDeviationPct = Math.abs(totalDailyCal - 1800) / 1800;
            let nutritionScore = Math.round(100 - (calorieDeviationPct * 40));
            nutritionScore = Math.max(40, Math.min(100, nutritionScore));
            const scoreRating = nutritionScore >= 85 ? 'EXCELLENT' : (nutritionScore >= 70 ? 'GOOD' : 'FAIR');

            // Dynamic Status
            const calDiff = totalDailyCal - 1800;
            const statusLabel = calDiff > 0 
              ? `+${calDiff} kcal Over Target` 
              : calDiff === 0 
                ? 'On Target ✓' 
                : `${Math.abs(calDiff)} kcal Under Target`;

            // State-driven color for Daily status indicator
            let statusColorClass = 'text-emerald-500 bg-emerald-50 border-emerald-100';
            let statusDotColor = 'bg-emerald-500';
            if (calDiff > 150) {
              statusColorClass = 'text-rose-500 bg-rose-50 border-rose-100';
              statusDotColor = 'bg-rose-500';
            } else if (calDiff > 0) {
              statusColorClass = 'text-amber-500 bg-amber-50 border-amber-100';
              statusDotColor = 'bg-amber-500';
            }

            // Macro details and percentages
            const totalGrams = totalDailyProtein + totalDailyCarbs + totalDailyFat + totalDailyFiber;
            const proteinPctVal = totalGrams > 0 ? Math.round((totalDailyProtein / totalGrams) * 100) : 28;
            const carbsPctVal = totalGrams > 0 ? Math.round((totalDailyCarbs / totalGrams) * 100) : 51;
            const fatPctVal = totalGrams > 0 ? Math.round((totalDailyFat / totalGrams) * 100) : 15;
            const fiberPctVal = totalGrams > 0 ? Math.max(0, 100 - proteinPctVal - carbsPctVal - fatPctVal) : 6;

            // Target calculations & color codes for macros
            const pPct = Math.round((totalDailyProtein / 140) * 100);
            const cPct = Math.round((totalDailyCarbs / 180) * 100);
            const fPct = Math.round((totalDailyFat / 60) * 100);
            const fibPct = Math.round((totalDailyFiber / 30) * 100);

            const getMacroStatus = (pctValue: number, limit: number) => {
              if (pctValue > 105) return { color: 'text-rose-500', bar: 'bg-rose-500', bgMuted: 'bg-rose-50/50', label: 'Exceeded', border: 'border-rose-100' };
              if (pctValue >= 90) return { color: 'text-emerald-500', bar: 'bg-emerald-500', bgMuted: 'bg-emerald-50/50', label: 'Achieved', border: 'border-emerald-100' };
              return { color: 'text-amber-500', bar: 'bg-amber-500', bgMuted: 'bg-amber-50/50', label: 'Nearing', border: 'border-amber-100' };
            };

            const pStatus = getMacroStatus(pPct, 140);
            const cStatus = getMacroStatus(cPct, 180);
            const fStatus = getMacroStatus(fPct, 60);
            const fibStatus = getMacroStatus(fibPct, 30);

            const weeklyTrendValues = [
              { day: 'Mon', val: 1650 },
              { day: 'Tue', val: 1780 },
              { day: 'Wed', val: 1950 },
              { day: 'Thu', val: 1705 },
              { day: 'Fri', val: 1820 },
              { day: 'Sat', val: 1750 },
              { day: 'Sun', val: totalDailyCal }
            ];

            return (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6 text-left font-sans text-slate-800"
              >
                {/* PAGE TITLE */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 select-none">
                  <div>
                    <h2 className="text-[32px] font-bold tracking-tight text-[#081F63] leading-tight">
                      Nutrition Intelligence
                    </h2>
                    <p className="text-[13px] font-medium text-slate-400 mt-0.5">
                      Premium dietary insights, compliance metrics and real-time food analytics.
                    </p>
                  </div>

                  {/* Premium Filter Chips */}
                  <div className="flex gap-1 bg-[#F5F7FA] border border-slate-200 p-1 rounded-[16px] shrink-0 self-start md:self-center">
                    <button 
                      onClick={() => setNutritionActiveDate('today')}
                      className={`px-4 py-2 text-xs font-bold rounded-[12px] font-sans transition-all cursor-pointer ${
                        nutritionActiveDate === 'today'
                          ? 'bg-[#081F63] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => setNutritionActiveDate('yesterday')}
                      className={`px-4 py-2 text-xs font-bold rounded-[12px] font-sans transition-all cursor-pointer ${
                        nutritionActiveDate === 'yesterday'
                          ? 'bg-[#081F63] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button 
                      onClick={() => setNutritionActiveDate('custom')}
                      className={`px-4 py-2 text-xs font-bold rounded-[12px] font-sans transition-all cursor-pointer ${
                        nutritionActiveDate === 'custom'
                          ? 'bg-[#081F63] text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Select Date
                    </button>
                  </div>
                </div>

                {nutritionActiveDate === 'custom' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden bg-[#F5F7FA] rounded-[20px] p-4 border border-slate-200"
                  >
                    <div className="flex gap-3 items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans shrink-0">Choose Date:</span>
                      <input 
                        type="date" 
                        value={customNutritionDate}
                        onChange={(e) => setCustomNutritionDate(e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-[12px] px-3 py-2 text-sm font-bold font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#18D4C5]"
                      />
                    </div>
                  </motion.div>
                )}

                {/* SECTION 1 – NUTRITION OVERVIEW HERO CARD */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs select-none">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Score (circular progress ring) on left */}
                    <div className="md:col-span-4 flex items-center justify-center md:border-r md:border-slate-100 pr-0 md:pr-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Nutrition Score</span>
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          {/* Svg Circle indicator */}
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="38" 
                              className="text-[#F5F7FA]" 
                              strokeWidth="7" 
                              stroke="currentColor" 
                              fill="transparent" 
                            />
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="38" 
                              className="text-[#18D4C5] transition-all duration-500" 
                              strokeWidth="7" 
                              strokeDasharray={2 * Math.PI * 38} 
                              strokeDashoffset={2 * Math.PI * 38 * (1 - nutritionScore / 100)} 
                              strokeLinecap="round" 
                              stroke="currentColor" 
                              fill="transparent" 
                            />
                          </svg>
                          <div className="absolute text-center flex flex-col items-center justify-center">
                            <span className="text-xl font-black text-[#081F63] tracking-tight">{nutritionScore}</span>
                            <span className="text-[8px] font-bold text-slate-400 border-t border-slate-100/80 pt-0.5 mt-0.5 uppercase tracking-widest">{scoreRating}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Calories consumed vs daily targets */}
                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Daily Intake Summary</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xl font-black text-[#081F63]">{totalDailyCal}</span>
                          <span className="text-slate-400 text-xs font-semibold">/ {targetCalorieGoal} kcal consumed</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="relative">
                        <div className="w-full bg-[#F5F7FA] h-2.5 rounded-full overflow-hidden border border-slate-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              calDiff > 0 ? 'bg-rose-500' : 'bg-[#18D4C5]'
                            }`}
                            style={{ width: `${Math.min(100, (totalDailyCal / targetCalorieGoal) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Status row */}
                      <div className="flex items-center justify-between">
                        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold font-sans flex items-center gap-1.5 ${statusColorClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                          <span>{statusLabel}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          {calDiff > 0 ? 'Under target by 0 kcal' : `${1800 - totalDailyCal} kcal remaining`}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SECTION 2 – WEEKLY ANALYTICS & MACRO DISTRIBUTION */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Weekly Calorie Trend Line Chart */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#081F63] mb-0.5">Weekly Calorie Trend</h4>
                      <p className="text-[11px] font-semibold text-slate-400">Fluctuations in dietary intakes vs daily targets.</p>
                    </div>

                    {/* Custom SVG Line Chart */}
                    <div className="w-full mt-4 select-none">
                      <div className="relative h-32 w-full">
                        {/* Legend Overlay of active coordinate */}
                        <div className="absolute top-1 left-2 bg-[#081F63]/10 border border-[#081F63]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#081F63]">
                          {nutritionWeekDayHovered !== null ? (
                            <span>{weeklyTrendValues[nutritionWeekDayHovered].day}: <strong>{weeklyTrendValues[nutritionWeekDayHovered].val} kcal</strong> ({weeklyTrendValues[nutritionWeekDayHovered].val > 1800 ? 'Over' : 'Under'})</span>
                          ) : (
                            <span>Hover days to inspect values</span>
                          )}
                        </div>

                        <svg className="w-full h-full overflow-visible" viewBox="0 0 540 120" preserveAspectRatio="none">
                          {/* Define Gradient Fills */}
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#18D4C5" stopOpacity="0.45" />
                              <stop offset="100%" stopColor="#18D4C5" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* 1800 kcal target line */}
                          <line 
                            x1="0" 
                            y1="40" 
                            x2="540" 
                            y2="40" 
                            stroke="#EF4444" 
                            strokeWidth="1.5" 
                            strokeDasharray="4,4" 
                          />
                          <text x="535" y="32" fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="end">TARGET: 1800 KCAL</text>

                          {/* SVG paths - line and filled area */}
                          {/* Points computation: X spacing: 540 / 6 = 90. Y mapping: 120 - (val / 2400) * 100 */}
                          <path 
                            d={`
                              M 0,${120 - (1650 / 2400) * 100} 
                              L 90,${120 - (1780 / 2400) * 100} 
                              L 180,${120 - (1950 / 2400) * 100} 
                              L 270,${120 - (1705 / 2400) * 100} 
                              L 360,${120 - (1820 / 2400) * 100} 
                              L 450,${120 - (1750 / 2400) * 100} 
                              L 540,${120 - (totalDailyCal / 2400) * 100}
                            `}
                            fill="none" 
                            stroke="#18D4C5" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                          />

                          <path 
                            d={`
                              M 0,${120 - (1650 / 2400) * 100} 
                              L 90,${120 - (1780 / 2400) * 100} 
                              L 180,${120 - (1950 / 2400) * 100} 
                              L 270,${120 - (1705 / 2400) * 100} 
                              L 360,${120 - (1820 / 2400) * 100} 
                              L 450,${120 - (1750 / 2400) * 100} 
                              L 540,${120 - (totalDailyCal / 2400) * 100}
                              L 540,120
                              L 0,120
                              Z
                            `}
                            fill="url(#chartGradient)"
                          />

                          {/* Data points */}
                          {[1650, 1780, 1950, 1705, 1820, 1750, totalDailyCal].map((val, i) => {
                            const x = i * 90;
                            const y = 120 - (val / 2400) * 100;
                            const isOver = val > 1800;
                            return (
                              <g 
                                key={i} 
                                className="cursor-pointer" 
                                onMouseEnter={() => setNutritionWeekDayHovered(i)}
                                onMouseLeave={() => setNutritionWeekDayHovered(null)}
                              >
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r="9" 
                                  fill={nutritionWeekDayHovered === i ? '#081F63' : 'transparent'} 
                                  className="transition-colors duration-150"
                                />
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r="4" 
                                  fill={isOver ? '#EF4444' : '#18D4C5'} 
                                  stroke="#FFFFFF" 
                                  strokeWidth="1.5" 
                                />
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* X Axis days of the week */}
                      <div className="flex justify-between px-1.5 mt-2.5 border-t border-slate-50 pt-1.5">
                        {weeklyTrendValues.map((dayObj, i) => (
                          <span 
                            key={i} 
                            className={`text-2xs font-extrabold block transition-colors ${
                              nutritionWeekDayHovered === i ? 'text-[#081F63] scale-105' : 'text-slate-400'
                            }`}
                          >
                            {dayObj.day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Macro Distribution Donut Chart */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-3.5 shadow-3xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#081F63] mb-0.5">Macro Distribution</h4>
                      <p className="text-[11px] font-semibold text-slate-400 font-sans">Relative gram ratio of logged macros.</p>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      
                      {/* Apple style Concentric Loops */}
                      <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Loop 1: Protein */}
                          <circle cx="56" cy="56" r="46" stroke="#E5E7EB" strokeWidth="5.5" fill="none" />
                          <circle cx="56" cy="56" r="46" stroke="#4F46E5" strokeWidth="5.5" strokeDasharray={2 * Math.PI * 46} strokeDashoffset={2 * Math.PI * 46 * (1 - proteinPctVal / 100)} strokeLinecap="round" fill="none" />

                          {/* Loop 2: Carbs */}
                          <circle cx="56" cy="56" r="37" stroke="#E5E7EB" strokeWidth="5.5" fill="none" />
                          <circle cx="56" cy="56" r="37" stroke="#18D4C5" strokeWidth="5.5" strokeDasharray={2 * Math.PI * 37} strokeDashoffset={2 * Math.PI * 37 * (1 - carbsPctVal / 100)} strokeLinecap="round" fill="none" />

                          {/* Loop 3: Fat */}
                          <circle cx="56" cy="56" r="28" stroke="#E5E7EB" strokeWidth="5.5" fill="none" />
                          <circle cx="56" cy="56" r="28" stroke="#F59E0B" strokeWidth="5.5" strokeDasharray={2 * Math.PI * 28} strokeDashoffset={2 * Math.PI * 28 * (1 - fatPctVal / 100)} strokeLinecap="round" fill="none" />

                          {/* Loop 4: Fiber */}
                          <circle cx="56" cy="56" r="19" stroke="#E5E7EB" strokeWidth="5" fill="none" />
                          <circle cx="56" cy="56" r="19" stroke="#0F172A" strokeWidth="5" strokeDasharray={2 * Math.PI * 19} strokeDashoffset={2 * Math.PI * 19 * (1 - fiberPctVal / 100)} strokeLinecap="round" fill="none" />
                        </svg>

                        {/* Middle decorative icon */}
                        <div className="absolute font-black text-slate-300 text-base">🍽</div>
                      </div>

                      {/* Stacked legends */}
                      <div className="flex-1 space-y-1 font-sans">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#4F46E5] shrink-0" />
                            <span className="text-[13px] font-medium text-slate-500">Protein</span>
                          </div>
                          <span className="text-[14px] font-semibold text-slate-800">{proteinPctVal}% ({totalDailyProtein}g)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#18D4C5] shrink-0" />
                            <span className="text-[13px] font-medium text-slate-500">Carbs</span>
                          </div>
                          <span className="text-[14px] font-semibold text-slate-800">{carbsPctVal}% ({totalDailyCarbs}g)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shrink-0" />
                            <span className="text-[13px] font-medium text-slate-500">Fat</span>
                          </div>
                          <span className="text-[14px] font-semibold text-slate-800">{fatPctVal}% ({totalDailyFat}g)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0F172A] shrink-0" />
                            <span className="text-[13px] font-medium text-slate-500">Fiber</span>
                          </div>
                          <span className="text-[14px] font-semibold text-slate-800">{fiberPctVal}% ({totalDailyFiber}g)</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>



                {/* SECTION 4 & SECTION 5 – NUTRITION LOGS ACTIVITY FEED & EXPANDABLE DETAILS */}
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#081F63]">
                      Nutrition Activity Feed
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">{activeMealsList.length} Meals Logged</span>
                  </div>

                  <div className="space-y-2">
                    {activeMealsList.map((meal, idx) => {
                      const mealPhotoUrl = resolveMealPhoto(meal.foodName);
                      const savedComment = mealComments[meal.id] || meal.trainerFeedback || '';
                      const isMealDetailed = !!detailedMeals[meal.id];
                      const isExpanded = expandedMealId === meal.id;

                      return (
                        <div 
                          key={meal.id || idx} 
                          className="bg-white border border-slate-200 rounded-xl shadow-3xs overflow-hidden transition-all duration-200"
                        >
                          {/* Feed row - clean horizontal layout, vertical footprint reduced by at least 40% */}
                          <button 
                            onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                            className={`w-full flex items-center justify-between p-3.5 text-left select-none transition-colors duration-200 cursor-pointer ${
                              isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              
                              {/* Left Thumbnail */}
                              <div className="w-12 h-12 rounded-[14px] overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                                <MealImage src={mealPhotoUrl} alt={meal.foodName} className="w-full h-full object-cover" />
                              </div>

                              {/* Center Meta */}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-[#081F63] text-sm truncate">
                                  {meal.foodName}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-medium">
                                  <span>{meal.time || '12:00 PM'}</span>
                                  <span>•</span>
                                  <span className="text-[#18D4C5] font-bold">{meal.calories} kcal</span>
                                </div>
                              </div>

                            </div>

                            {/* Right Arrow */}
                            <div className="shrink-0 ml-3 text-slate-400">
                              <ChevronDown 
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-[#18D4C5]' : ''
                                }`} 
                              />
                            </div>
                          </button>

                          {/* SECTION 5 expandable details smooth render */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden bg-[#FAFCFF]"
                              >
                                <div className="p-5 border-t border-slate-100 space-y-4">
                                  
                                  {/* Large Dynamic Food Image */}
                                  <div className="w-full h-44 rounded-[18px] overflow-hidden border border-slate-150 relative shadow-3xs bg-slate-100">
                                    <MealImage src={mealPhotoUrl} alt={meal.foodName} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-extrabold text-[#081F63] shadow-md border border-slate-100 select-none">
                                      🔥 {meal.calories} kcal
                                    </div>
                                  </div>

                                  {/* Detailed Macro Grid */}
                                  <div className="bg-white border border-slate-100 rounded-xl p-3 grid grid-cols-4 gap-2 text-center text-xs shadow-3xs">
                                    <div className="border-r border-slate-50">
                                      <span className="block text-[11px] font-semibold text-slate-400">Protein</span>
                                      <span className="block text-[14px] font-bold text-[#081F63] mt-0.5">{meal.protein}g</span>
                                    </div>
                                    <div className="border-r border-slate-50">
                                      <span className="block text-[11px] font-semibold text-slate-400">Carbs</span>
                                      <span className="block text-[14px] font-bold text-[#081F63] mt-0.5">{meal.carbs}g</span>
                                    </div>
                                    <div className="border-r border-slate-50">
                                      <span className="block text-[11px] font-semibold text-slate-400">Fat</span>
                                      <span className="block text-[14px] font-bold text-[#081F63] mt-0.5">{meal.fat}g</span>
                                    </div>
                                    <div>
                                      <span className="block text-[11px] font-semibold text-slate-400">Fiber</span>
                                      <span className="block text-[14px] font-bold text-[#081F63] mt-0.5">{meal.fiber || 5}g</span>
                                    </div>
                                  </div>

                                  {/* AI Insight banner inside expanded view */}
                                  <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3.5">
                                    <div className="flex items-center gap-1.5 mb-1 text-[#4F46E5] select-none">
                                      <Sparkles className="w-4 h-4 fill-indigo-100" />
                                      <span className="text-[11px] font-bold uppercase tracking-wider">AI Nutrition Analysis</span>
                                    </div>
                                    <p className="text-[13px] leading-relaxed text-slate-600 font-medium">
                                      {meal.aiInsight}
                                    </p>
                                  </div>

                                  {/* Coach Feedback banner */}
                                  <div className="bg-teal-50/30 border border-teal-100/40 rounded-xl p-3.5">
                                    <span className="text-[11px] font-bold text-[#18D4C5] uppercase tracking-wider block mb-1">Active Coach Guidance</span>
                                    <p className="text-[13px] leading-relaxed text-slate-600 italic">
                                      "{savedComment || 'No special coaching instructions issued yet. Input active recommendations below.'}"
                                    </p>
                                  </div>

                                  {/* Input comments form */}
                                  <div className="space-y-2 w-full max-w-full overflow-hidden">
                                    <input 
                                      type="text" 
                                      id={`input_comment_${meal.id}`}
                                      placeholder="Provide active coach feedback..."
                                      defaultValue={savedComment}
                                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#081F63] font-medium placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#18D4C5] h-9 select-text"
                                    />
                                    <button 
                                      onClick={() => {
                                        const el = document.getElementById(`input_comment_${meal.id}`) as HTMLInputElement;
                                        if (el) {
                                          handlePostMealComment(meal.id, el.value);
                                        }
                                      }}
                                      className="w-full bg-[#081F63] hover:bg-[#081F63]/90 text-white font-black text-xs rounded-lg uppercase tracking-wider transition h-9 select-none cursor-pointer flex items-center justify-center shadow-3xs px-4 text-center font-sans"
                                    >
                                      Post
                                    </button>
                                  </div>

                                  {/* Full detailed notes accordion toggle */}
                                  <div className="pt-2 border-t border-slate-100 text-right">
                                    <button 
                                      onClick={() => setDetailedMeals(prev => ({ ...prev, [meal.id]: !isMealDetailed }))}
                                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <span>{isMealDetailed ? 'Hide Raw Details' : 'View Raw Ingredient Logs'}</span>
                                      <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isMealDetailed ? 'rotate-180 text-indigo-600' : ''}`} />
                                    </button>

                                    <AnimatePresence initial={false}>
                                      {isMealDetailed && (
                                        <motion.div 
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="text-left overflow-hidden mt-2 bg-slate-50 border border-slate-150 rounded-xl p-3"
                                        >
                                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Raw Ingredient Logger notes:</span>
                                          <p className="text-[13px] font-medium text-slate-500 leading-relaxed italic pr-4">
                                            "{meal.notes || 'No supplementary meal tags added.'}"
                                          </p>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                 {/* BENTO INTEL ROW – SECTION 6 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
                  
                  {/* SECTION 6 – COACHAI ANALYSIS */}
                  <div className="lg:col-span-12 bg-gradient-to-br from-[#061A4D] to-[#122F88] text-white border border-slate-900/40 rounded-xl p-4 shadow-3xs flex flex-col justify-between select-none">
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 text-[#18D4C5] fill-[#18D4C5]" />
                        <span>CoachAI Analysis</span>
                      </h4>
                      <p className="text-[11px] text-indigo-150 mb-3.5 font-semibold">Immediate cognitive patterns checked.</p>
                      
                      <div className="space-y-2.5 text-[11px] font-bold">
                        <div className="flex gap-2.5 items-center">
                          <span className="text-emerald-300 bg-emerald-500/20 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]">✓</span>
                          <span className="text-slate-100">Protein intake adequate</span>
                        </div>
                        <div className="flex gap-2.5 items-center">
                          <span className="text-emerald-300 bg-emerald-500/20 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]">✓</span>
                          <span className="text-slate-100">Meal timing consistent</span>
                        </div>
                        <div className="flex gap-2.5 items-center">
                          <span className="text-rose-300 bg-rose-500/20 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]">!</span>
                          <span className="text-slate-100">
                            {totalDailyCal > 1800 
                              ? `Calories exceeded by ${totalDailyCal - 1800} kcal` 
                              : `Calorie loads within targets`
                            }
                          </span>
                        </div>
                        <div className="flex gap-2.5 items-center">
                          <span className="text-rose-300 bg-rose-500/20 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px]">!</span>
                          <span className="text-slate-100">Lunch contributed highest carb intake</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-2.5 mt-4 text-[9px] font-black text-indigo-200 uppercase tracking-widest leading-none">
                      COACHTRACK ENGINE • JUN 2026
                    </div>
                  </div>

                </div>

                 {/* SECTION 9 – QUICK INSIGHT CARDS */}
                 <div>
                   <h3 className="text-xs font-black text-[#081F63] uppercase tracking-wide mb-2.5 select-none">
                     Dietary Quick Insights
                   </h3>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 select-none">
                     
                     {/* INSIGHT 1 */}
                     <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-left shadow-3xs h-[72px] flex flex-col justify-center">
                       <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-none mb-1.5">🔥 Highest Calorie</span>
                       <div>
                         <span className="text-xs font-extrabold text-[#081F63] block leading-tight">Wednesday</span>
                         <span className="text-[10px] text-[#14B8A6] font-black uppercase tracking-tight block mt-0.5 leading-none">1,950 kcal</span>
                       </div>
                     </div>

                     {/* INSIGHT 2 */}
                     <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-left shadow-3xs h-[72px] flex flex-col justify-center">
                       <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-none mb-1.5">🥗 Healthiest Meal</span>
                       <div>
                         <span className="text-xs font-extrabold text-[#081F63] block truncate leading-tight">Recovery Shake</span>
                         <span className="text-[10px] text-[#14B8A6] font-black uppercase tracking-tight block mt-0.5 leading-none">Opt. Protein</span>
                       </div>
                     </div>

                     {/* INSIGHT 3 */}
                     <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-left shadow-3xs h-[72px] flex flex-col justify-center">
                       <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-none mb-1.5">💪 Protein Champ</span>
                       <div>
                         <span className="text-xs font-extrabold text-[#081F63] block leading-tight">Friday</span>
                         <span className="text-[10px] text-[#14B8A6] font-black uppercase tracking-tight block mt-0.5 leading-none">145g Intake</span>
                       </div>
                     </div>

                     {/* INSIGHT 4 */}
                     <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 text-left shadow-3xs h-[72px] flex flex-col justify-center">
                       <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider leading-none mb-1.5">📈 Best Nutrition</span>
                       <div>
                         <span className="text-xs font-extrabold text-[#081F63] block leading-tight">Tuesday</span>
                         <span className="text-[10px] text-[#14B8A6] font-black uppercase tracking-tight block mt-0.5 leading-none">88 / 100 Score</span>
                       </div>
                     </div>

                   </div>
                 </div>

                {/* SECTION 10 – DOWNLOAD COMPLIANT REPORT */}
                <DownloadButton 
                  id="btn-dl-nutrition-premium-report"
                  onClick={handleDownloadNutritionCSV}
                  label="DOWNLOAD NUTRITION REPORT"
                />

              </motion.div>
            );
          })()}

          {/* ======================================================== */}
          {/* 4. MEDICAL HISTORY SECTION */}
          {profileSection === 'medical' && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              
              {/* Compact Profile Medical Cards */}
              <div className="bg-white border border-slate-200/85 rounded-xl p-3.5 shadow-3xs text-left space-y-3 font-sans select-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  🏥 Certified Health Assessment Details
                </p>

                <div className="grid grid-cols-2 gap-2.5 font-sans">
                  <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase font-sans">Medical Status</span>
                    <span className="text-xs font-black text-emerald-600 block mt-0.5">Cleared for Training</span>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase font-sans">Known Conditions</span>
                    <span className="text-xs font-black text-slate-800 block mt-0.5">Mild discomfort</span>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase font-sans">Injury Notes</span>
                    <span className="text-xs font-black text-slate-800 block mt-0.5">Knee strain history</span>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase font-sans">Restrictions</span>
                    <span className="text-xs font-black text-rose-600 block mt-0.5">Avoid heavy squats</span>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase font-sans">Allergies</span>
                    <span className="text-xs font-black text-slate-800 block mt-0.5">None reported</span>
                  </div>
                  <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                    <span className="text-[9px] text-slate-400 font-extrabold tracking-wide uppercase font-sans">Emergency Contact</span>
                    <span className="text-xs font-extrabold text-slate-800 block mt-0.5">Saved Contact ✓</span>
                  </div>
                </div>
              </div>

              {/* Interactive notes section for medical review */}
              <div className="bg-white border border-slate-200/85 rounded-xl p-3.5 shadow-3xs text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 font-sans select-none">
                  ✍️ Medical Observation Notes
                </span>
                
                <textarea 
                  id={`text_med_obs_${selectedTrainee.id}`}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-sans shadow-3xs focus:outline-teal-500 leading-relaxed mb-3"
                  placeholder="Record heart rates, custom posture observations, medical warning details..."
                  defaultValue={medicalObsNotes[selectedTrainee.id] || ''}
                />
                
                <button 
                  onClick={() => {
                    const el = document.getElementById(`text_med_obs_${selectedTrainee.id}`) as HTMLTextAreaElement;
                    if (el) {
                      setMedicalObsNotes(prev => ({
                        ...prev,
                        [selectedTrainee.id]: el.value
                      }));
                      triggerToast('Medical notes saved! ✓', 'success');
                    }
                  }}
                  className="w-full bg-[#061A4D] hover:bg-slate-900 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer font-sans select-none"
                >
                  Save Medical Notes
                </button>
              </div>

              {/* Download CSV button */}
              <DownloadButton 
                id="btn-dl-medical"
                onClick={handleDownloadMedicalCSV}
                label="DOWNLOAD MEDICAL HISTORY CSV"
              />
            </motion.div>
          )}

          {/* Spacer block */}
          <div className="h-6" />

        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16 pt-2 text-left relative overflow-x-hidden box-border break-words">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-4 right-4 z-50 mx-auto px-4 py-3 rounded-xl shadow-2xl text-xs font-bold text-white flex items-center gap-2.5 w-[calc(100%-32px)] max-w-[360px] box-border break-words ${
              alertBanner.type === 'success' ? 'bg-[#001F3F] border-b-4 border-teal-400' : 'bg-slate-900 border-b-4 border-indigo-400'
            }`}
          >
            <span className="text-base">{alertBanner.type === 'success' ? '🚀' : 'ℹ️'}</span>
            <p className="flex-1 font-sans">{alertBanner.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
 
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Quick Actions Row */}
        {activeTab !== 'trainer-dashboard' && activeTab !== 'session-history' && activeTab !== 'client-management' && activeTab !== 'coaching-hub' && activeTab !== 'revenue' && (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-8 text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3.5 flex items-center gap-1.5 font-sans">
              ⚡ Trainer Quick Actions
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-row md:flex-wrap gap-3 select-none">
            
            <button
              id="qa-add-client"
              onClick={() => {
                setInviteEmail('');
                setInvitePkgOption('Monthly Pass');
                setShowAddClientForm(true);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-teal-500/15 to-teal-600/5 hover:from-teal-500/25 hover:to-teal-600/10 border border-teal-200 text-[#001f3f] rounded-xl text-xs font-bold font-sans transition duration-155 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 shrink-0 text-teal-600" />
              <span>Add New Client</span>
            </button>

            <button
              id="qa-issue-invoice"
              onClick={() => {
                setSelectedTraineeId(trainees[0]?.id || 'te_ahmad');
                setInvoiceAmount(150);
                setInvoiceDueDate('2026-06-25');
                setInvoiceDescription('Premium Personal Training Service Tier');
                setInvoiceType('Personal Training Package');
                setInvoiceNotes('');
                setInvoiceTitle('Coaching Services Invoice');
                setInvoiceBillingTarget('individual');
                setInvoiceSelectedTraineeIds([]);
                setShowInvoiceForm(true);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500/15 to-indigo-600/5 hover:from-indigo-500/25 hover:to-indigo-600/10 border border-indigo-200 text-[#001f3f] rounded-xl text-xs font-bold font-sans transition duration-155 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
              <span>Issue Invoice</span>
            </button>

            <button
              id="qa-schedule-session"
              onClick={() => {
                setScheduleTraineeId(trainees[0]?.id || 'te_ahmad');
                setScheduleDate('2026-06-22');
                setScheduleTimeSlot('10:00 AM');
                setScheduleLocation('SS15 Studio • Selangor');
                setScheduleNotes('Personal training tracking alignment review');
                setShowScheduleModal(true);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#001f3f] hover:bg-slate-900 border border-indigo-900 text-white rounded-xl text-xs font-bold font-sans transition duration-155 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Schedule Session</span>
            </button>
            
          </div>
        </div>
        )}

        {/* Custom Invoice Generator Modal Form */}
        {showInvoiceForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[18px] w-[90%] max-w-[360px] mx-auto p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative border border-slate-100 text-left overflow-y-auto max-h-[85vh] box-border break-words animate-zoom-in flex flex-col">
              <button 
                type="button"
                onClick={() => setShowInvoiceForm(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100 rounded-full p-1 cursor-pointer font-bold transition z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="mb-3 pr-8">
                <span className="inline-block px-1.5 py-0.2 text-[8.5px] font-bold text-[#17D4C3] bg-[#17D4C3]/10 rounded tracking-wider mb-1 uppercase select-none">BILLING HUB</span>
                <h3 className="text-[20px] font-extrabold text-[#041F63] leading-tight mb-0.5">
                  Issue Custom Invoice
                </h3>
                <p className="text-[11px] text-slate-500">
                  Generate and dispatch professional invoices.
                </p>
              </div>

              {invoiceCreatedSuccess ? (
                <div className="text-center py-2 space-y-3">
                  <span className="text-3xl block">📋</span>
                  <h3 className="font-bold text-[#041F63] text-[18px] leading-tight">Invoice Generated!</h3>
                  <p className="text-[11px] text-slate-500 font-sans">Client billing registers have been updated.</p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInvoiceForm(false);
                      }}
                      className="w-full bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInvoiceCreateSubmit} className="space-y-3.5">
                  {/* Billing Target Option */}
                  <div className="bg-slate-50/50 border border-slate-100 p-3 rounded-[12px] space-y-2 text-left">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Billing Target Group
                    </label>
                    <div className="flex flex-col gap-1.5 text-[12px] font-semibold">
                      <label className="flex items-center gap-2 cursor-pointer font-bold font-sans text-slate-700 select-none">
                        <input
                          type="radio"
                          name="invoiceTargetOption"
                          value="individual"
                          checked={invoiceBillingTarget === 'individual'}
                          onChange={() => setInvoiceBillingTarget('individual')}
                          className="text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5 bg-white border-slate-200 cursor-pointer"
                        />
                        Single Client
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold font-sans text-slate-700 select-none">
                        <input
                          type="radio"
                          name="invoiceTargetOption"
                          value="selected"
                          checked={invoiceBillingTarget === 'selected'}
                          onChange={() => {
                            setInvoiceBillingTarget('selected');
                            if (selectedTraineeId && !invoiceSelectedTraineeIds.includes(selectedTraineeId)) {
                                setInvoiceSelectedTraineeIds([selectedTraineeId]);
                            }
                          }}
                          className="text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5 bg-white border-slate-200 cursor-pointer"
                        />
                        Multiple Clients
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold font-sans text-slate-700 select-none">
                        <input
                          type="radio"
                          name="invoiceTargetOption"
                          value="all"
                          checked={invoiceBillingTarget === 'all'}
                          onChange={() => setInvoiceBillingTarget('all')}
                          className="text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5 bg-white border-slate-200 cursor-pointer"
                        />
                        All Clients ({trainees.length})
                      </label>
                    </div>

                    {/* Client lists to select from */}
                    {invoiceBillingTarget === 'selected' && (
                      <div className="pt-2 border-t border-slate-100 mt-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Select Multiple Clients
                        </label>
                        <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto p-0.5 scrollbar-thin">
                          {trainees.map((t) => {
                            const isChecked = invoiceSelectedTraineeIds.includes(t.id);
                            return (
                              <div
                                key={t.id}
                                onClick={() => {
                                  if (isChecked) {
                                    setInvoiceSelectedTraineeIds(invoiceSelectedTraineeIds.filter(id => id !== t.id));
                                  } else {
                                    setInvoiceSelectedTraineeIds([...invoiceSelectedTraineeIds, t.id]);
                                  }
                                }}
                                className={`flex items-center gap-2 p-2 rounded-[10px] border cursor-pointer transition select-none ${
                                  isChecked
                                    ? 'border-[#4F46E5] bg-[#F5F7FF]'
                                    : 'border-[#D7DFEA] hover:bg-slate-50 bg-white'
                                }`}
                              >
                                <div className="relative flex items-center justify-center shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    readOnly
                                    className="rounded border-slate-300 text-[#4F46E5] focus:ring-[#4F46E5] h-3.5 w-3.5 pointer-events-none"
                                  />
                                </div>
                                <img
                                  src={t.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                                  alt={t.name}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                                <div className="truncate text-left">
                                  <div className="text-[12px] font-semibold text-slate-800 truncate">{t.name}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {invoiceBillingTarget === 'individual' && (
                      <div className="pt-2 border-t border-slate-100 mt-1">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Select Client Card
                        </label>
                        <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto p-0.5 scrollbar-thin">
                          {trainees.map(t => {
                            const isSelected = selectedTraineeId === t.id;
                            return (
                              <div
                                key={t.id}
                                onClick={() => setSelectedTraineeId(t.id)}
                                className={`flex items-center gap-2 p-2 rounded-[10px] border cursor-pointer transition select-none ${
                                  isSelected
                                    ? 'border-[#4F46E5] bg-[#F5F7FF]'
                                    : 'border-[#D7DFEA] hover:bg-slate-50 bg-white'
                                }`}
                              >
                                <img
                                  src={t.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                                  alt={t.name}
                                  referrerPolicy="no-referrer"
                                  className="w-6 h-6 rounded-full object-cover shrink-0"
                                />
                                <div className="truncate text-left flex-1 min-w-0">
                                  <div className="text-[12px] font-semibold text-slate-800 truncate">{t.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{t.goals || 'Active Trainee'}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Invoice details */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Invoice Title
                      </label>
                      <input 
                        type="text" 
                        value={invoiceTitle}
                        onChange={(e) => setInvoiceTitle(e.target.value)}
                        placeholder="Coaching Fee"
                        className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Invoice Type
                      </label>
                      <select
                        value={invoiceType}
                        onChange={(e) => setInvoiceType(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition"
                        required
                      >
                        <option value="Single Class">Single Class</option>
                        <option value="4 Classes">4 Classes</option>
                        <option value="8 Classes font-sans">8 Classes</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Amount (RM)
                      </label>
                      <input 
                        type="number" 
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                        className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Due Date
                      </label>
                      <input 
                        type="date" 
                        value={invoiceDueDate}
                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                        className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Service Description
                    </label>
                    <input 
                      type="text" 
                      value={invoiceDescription}
                      onChange={(e) => setInvoiceDescription(e.target.value)}
                      placeholder="Monthly Pack (8x Slots)"
                      className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Notes (Optional Remarks)
                    </label>
                    <textarea 
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      placeholder="Please checkout via FPX or CoachTrack card..."
                      className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none h-12 resize-none transition"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="submit"
                      className="w-full bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                    >
                      ISSUE INVOICE
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInvoiceForm(false)}
                      className="w-full bg-white border border-[#D7DFEA] text-[#52607A] hover:bg-slate-50 font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Add Client Onboarding Modal */}
        {showAddClientForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[18px] w-[90%] max-w-[360px] mx-auto p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative border border-slate-100 text-left overflow-y-auto max-h-[85vh] box-border break-words animate-zoom-in flex flex-col">
              <button 
                type="button"
                onClick={() => {
                  setShowAddClientForm(false);
                  setInviteError('');
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100 rounded-full p-1 cursor-pointer font-bold transition z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="mb-3 pr-8">
                <span className="inline-block px-1.5 py-0.2 text-[8.5px] font-bold text-[#17D4C3] bg-[#17D4C3]/10 rounded tracking-wider mb-1 uppercase select-none">CLIENT ONBOARDING</span>
                <h3 className="text-[20px] font-extrabold text-[#041F63] leading-tight mb-0.5">
                  Invite New Client
                </h3>
                <p className="text-[11px] text-slate-500">
                  Send invitation and assign coaching package.
                </p>
              </div>

              <form onSubmit={handleAddClientInviteSubmit} className="space-y-3.5">
                {inviteError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-2.5 text-[11px] font-semibold">
                    ⚠️ {inviteError}
                  </div>
                )}
                
                {inviteSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5 text-[11px] font-bold text-center">
                    🎉 Invitation generated successfully!
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#041F63] font-sans mb-1 uppercase tracking-wider">
                    Client Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#041F63]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="eLearning, health, gym email..."
                      className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] pl-9 pr-3 py-1.5 text-[13px] font-medium focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition text-slate-800"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                    Only existing accounts can be onboarded.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#041F63] font-sans mb-1 uppercase tracking-wider">
                    Choose Coaching Package
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {/* Package 1 */}
                    <div 
                      onClick={() => setInvitePkgOption('Single Class')}
                      className={`relative border p-2.5 rounded-[12px] cursor-pointer transition select-none ${
                        invitePkgOption === 'Single Class' 
                          ? 'border-[#4F46E5] bg-[#F5F7FF]' 
                          : 'border-[#D7DFEA] hover:border-slate-350 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[12px]">Single Session</h4>
                          <p className="text-[10px] text-slate-500">Introductory lessons</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[14px] font-bold text-[#041F63]">RM80</span>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-[10px] text-slate-500 pl-1">
                        <div>✓ One coaching session & Workout guidance</div>
                      </div>
                    </div>

                    {/* Package 2 */}
                    <div 
                      onClick={() => setInvitePkgOption('4-Class Package')}
                      className={`relative border p-2.5 rounded-[12px] cursor-pointer transition select-none ${
                        invitePkgOption === '4-Class Package' 
                          ? 'border-[#4F46E5] bg-[#F5F7FF]' 
                          : 'border-[#D7DFEA] hover:border-slate-350 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="absolute top-2 right-2 bg-[#17D4C3] text-white text-[8px] font-bold tracking-wider uppercase px-1 py-0.1 rounded">
                        POPULAR
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[12px]">4 Classes / Month</h4>
                          <p className="text-[10px] text-slate-500">Weekly progression</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[14px] font-bold text-[#041F63]">RM310</span>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-[10px] text-slate-500 pl-1">
                        <div>✓ Weekly coaching & Progress tracking</div>
                      </div>
                    </div>

                    {/* Package 3 */}
                    <div 
                      onClick={() => setInvitePkgOption('8-Class Package')}
                      className={`relative border p-2.5 rounded-[12px] cursor-pointer transition select-none ${
                        invitePkgOption === '8-Class Package' 
                          ? 'border-[#4F46E5] bg-[#F5F7FF]' 
                          : 'border-[#D7DFEA] hover:border-slate-350 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-bold text-slate-900 text-[12px]">8 Classes / Month</h4>
                          <p className="text-[10px] text-slate-500">Maximum frequency</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[14px] font-bold text-[#041F63]">RM600</span>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-[10px] text-slate-500 pl-1">
                        <div>✓ Twice weekly coaching & full reviews</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                  >
                    {inviteLoading ? 'SENDING...' : 'SEND INVITATION'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddClientForm(false);
                      setInviteError('');
                    }}
                    className="w-full bg-white border border-[#D7DFEA] text-[#52607A] hover:bg-slate-50 font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Session Options Action Sheet Modal (Interactive Coaching Dashboard) */}
        {showSessionActionSheet && selectedSessionForAction && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[18px] w-[90%] max-w-[360px] mx-auto p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative border border-slate-100 text-left overflow-y-auto max-h-[85vh] space-y-3.5 box-border break-words animate-zoom-in flex flex-col">
              
              {/* Close */}
              <button 
                onClick={() => {
                  setShowSessionActionSheet(false);
                  setIsReschedulingSession(false);
                  setShowLogWorkoutForm(false);
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100 rounded-full p-1 cursor-pointer font-bold transition z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Title Header */}
              <div className="mb-1 pr-8">
                <span className="inline-block px-1.5 py-0.2 text-[8.5px] font-bold text-[#17D4C3] bg-[#17D4C3]/10 rounded tracking-wider mb-1 uppercase select-none">SESSION MANAGEMENT</span>
                <h3 className="text-[20px] font-extrabold text-[#041F63] leading-tight mb-0.5">
                  Manage Session
                </h3>
                <p className="text-[11px] text-slate-500">
                  Adjust coaching date and available time.
                </p>
              </div>

              {/* Active Trainee Details */}
              <div className="bg-slate-50 p-3 rounded-[12px] border border-slate-100 text-[12px] text-slate-700 font-medium space-y-1 select-none">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-normal">Trainee Name:</span> 
                  <span className="font-bold text-[#041F63]">{selectedSessionForAction.traineeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-normal">Currently Booked:</span> 
                  <span className="font-bold text-[#041F63] truncate ml-2 max-w-[160px]">{selectedSessionForAction.date} at {selectedSessionForAction.timeSlot || selectedSessionForAction.time_slot || '10:00 AM'}</span>
                </div>
              </div>

              {!isReschedulingSession && (
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <button
                    onClick={() => {
                      setSessionToLog(selectedSessionForAction);
                      setShowSessionActionSheet(false);
                    }}
                    className="h-14 bg-[#17D4C3] hover:bg-[#17D4C3]/90 text-white font-bold rounded-[12px] flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-md transition text-[13px]"
                  >
                    <span className="text-md">✅</span>
                    <span>Complete</span>
                  </button>

                  <button
                    onClick={() => setIsReschedulingSession(true)}
                    className="h-14 bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold rounded-[12px] flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-md transition text-[13px]"
                  >
                    <span className="text-md">📅</span>
                    <span>Reschedule</span>
                  </button>
                </div>
              )}

              {/* Reschedule View */}
              {isReschedulingSession && (
                <div className="space-y-3 pt-2.5 border-t border-slate-100 text-left">
                  <h4 className="font-bold text-[#041F63] text-[14px]">Reschedule Session Slot</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Date</label>
                      <input 
                        type="date" 
                        value={rescheduleNewDate}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && new Date(val).getDay() === 0) {
                            alert("Sundays are unavailable. Trainer schedule is closed.");
                          } else {
                            setRescheduleNewDate(val);
                          }
                        }}
                        className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium text-slate-800 focus:ring-2 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">New Time Slot</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map(time => {
                          const isBooked = checkSlotIsBooked(rescheduleNewDate, time, selectedSessionForAction?.id);
                          const isSelected = rescheduleNewTimeSlot === time;
                          
                          if (isBooked) {
                            return (
                              <button
                                key={time}
                                type="button"
                                disabled
                                className="border border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed py-1.5 text-center text-[10px] text-slate-400 font-medium rounded-[10px] flex flex-col items-center justify-center h-10"
                              >
                                <span>{time}</span>
                                <span className="text-[6.5px] font-bold uppercase text-rose-500 tracking-wider">Booked</span>
                              </button>
                            );
                          }

                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setRescheduleNewTimeSlot(time);
                              }}
                              className={`border py-1.5 text-center font-bold text-[11px] rounded-[10px] transition flex flex-col items-center justify-center cursor-pointer select-none h-10 ${
                                isSelected
                                  ? 'border-[#4F46E5] bg-[#F5F7FF] shadow-xs text-[#4F46E5]'
                                  : 'border-[#D7DFEA] hover:bg-slate-50 bg-white text-slate-700'
                              }`}
                            >
                              <span>{time}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button 
                        onClick={async () => {
                          const bookingId = selectedSessionForAction.id;
                          
                          if (rescheduleNewDate && new Date(rescheduleNewDate).getDay() === 0) {
                            alert("Sundays are unavailable. Trainer schedule is closed.");
                            return;
                          }

                          const isAlreadyBooked = checkSlotIsBooked(rescheduleNewDate, rescheduleNewTimeSlot, bookingId);
                          if (isAlreadyBooked) {
                            alert("This slot is already booked. Please choose another time.");
                            return;
                          }

                          const ok = await dbService.updateBookingStatus(bookingId, 'Approved', rescheduleNewDate, rescheduleNewTimeSlot);
                          if (ok) {
                            alert("Session rescheduled successfully!");
                            setShowSessionActionSheet(false);
                            setIsReschedulingSession(false);
                            fetchTrainerData();
                          } else {
                            alert("Failed to reschedule.");
                          }
                        }}
                        className="w-full bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                      >
                        CONFIRM RESCHEDULE
                      </button>
                      <button
                        onClick={() => setIsReschedulingSession(false)}
                        className="w-full bg-white border border-[#D7DFEA] text-[#52607A] hover:bg-slate-50 font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Schedule Session Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[18px] w-[90%] max-w-[360px] mx-auto p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative border border-slate-100 text-left overflow-y-auto max-h-[85vh] flex flex-col box-border break-words animate-zoom-in">
              <button 
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100 rounded-full p-1 cursor-pointer font-bold transition z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              
              <div className="mb-3 pr-8">
                <span className="inline-block px-1.5 py-0.2 text-[8.5px] font-bold text-[#17D4C3] bg-[#17D4C3]/10 rounded tracking-wider mb-1 uppercase select-none">SESSION HUB DESK</span>
                <h3 className="text-[20px] font-extrabold text-[#041F63] leading-tight mb-0.5">
                  Schedule New Session
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select trainee, date and available coaching slot.
                </p>
              </div>

              {scheduleSuccess ? (
                <div className="text-center py-2 space-y-3">
                  <span className="text-3xl block">📅</span>
                  <h3 className="font-extrabold text-[#041F63] text-[18px] leading-tight">Session Slotted Successfully!</h3>
                  <p className="text-[11px] text-slate-500 font-sans">The client notification checklists have been synchronised.</p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleSuccess(false);
                        setShowScheduleModal(false);
                      }}
                      className="w-full bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-[44px] rounded-[10px] text-[13px] flex items-center justify-center transition cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="space-y-3.5">
                  
                  {/* SECTION 1 — SELECT TRAINEE */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#041F63] font-sans uppercase tracking-wider">
                      Select Trainee
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto p-1 scrollbar-thin">
                      {!trainees || trainees.length === 0 ? (
                        <div className="col-span-2 text-center py-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400 text-[10px] font-sans">
                          No active trainees available.
                        </div>
                      ) : (
                        trainees.map((t) => {
                          if (!t) return null;
                          const isSelected = scheduleTraineeId === t.id;
                          return (
                            <div
                              key={t.id || Math.random().toString()}
                              onClick={() => setScheduleTraineeId(t.id)}
                              className={`p-2 rounded-[10px] border transition cursor-pointer select-none text-left ${
                                isSelected
                                  ? 'border-[#041F63] bg-[#041F63]/5'
                                  : 'border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <span className="block text-[12px] font-bold text-slate-900 truncate">{t.name || 'Client'}</span>
                              <span className="block text-[10px] text-slate-500 truncate mt-0.5">{t.goals || 'Personal Coaching'}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* SECTION 2 — SELECT DATE */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#041F63] font-sans uppercase tracking-wider">
                      Select Date
                    </label>
                    {(() => {
                      const daysList = [];
                      const startDate = new Date('2026-06-21'); // June 21 is Sunday
                      for (let i = 0; i < 10; i++) {
                        const d = new Date(startDate);
                        d.setDate(startDate.getDate() + i);
                        const yyyy = d.getFullYear();
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const dateStr = `${yyyy}-${mm}-${dd}`;
                        daysList.push({
                          dateStr,
                          dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                          dayNum: d.getDate(),
                          monthName: d.toLocaleDateString('en-US', { month: 'short' }),
                          jsDate: d
                        });
                      }
                      return (
                        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                          {daysList.map(item => {
                            const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                            const checkKey = dayKeys[item.jsDate.getDay()];
                            const available = getTrainerAvailableDays();
                            const isDayDisabledInSettings = !available[checkKey as keyof typeof available];
                            const isPast = item.dateStr < '2026-06-21';
                            const isDisabled = isDayDisabledInSettings || isPast;
                            const isSelected = scheduleDate === item.dateStr;

                            return (
                              <button
                                key={item.dateStr}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  if (!isDisabled) setScheduleDate(item.dateStr);
                                }}
                                className={`px-2.5 py-1.5 rounded-[10px] border transition shrink-0 flex flex-col items-center justify-center min-w-[50px] ${
                                  isDisabled
                                    ? 'bg-slate-50 border-slate-105 text-slate-300 cursor-not-allowed opacity-50'
                                    : isSelected
                                      ? 'border-[#17D4C3] bg-[#041F63] text-white font-bold'
                                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white cursor-pointer'
                                }`}
                              >
                                <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? 'text-[#17D4C3]' : 'text-slate-400'}`}>
                                  {item.dayName}
                                </span>
                                <span className={`text-[14px] font-bold leading-tight mt-0.5 ${isSelected ? 'text-white' : 'text-[#041F63]'}`}>
                                  {item.dayNum}
                                </span>
                              </button>
                            );
                          })}
                          
                          {/* Styled Custom Date Input */}
                          <div className="relative min-w-[100px] flex flex-col justify-center items-center px-2 py-1 rounded-[10px] border border-slate-200 hover:bg-slate-50 bg-white shrink-0">
                            <span className="text-[8px] uppercase font-bold text-slate-400">Or Custom</span>
                            <input
                              type="date"
                              value={scheduleDate}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                  const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                  const checkKey = dayKeys[new Date(val).getDay()];
                                  const available = getTrainerAvailableDays();
                                  if (!available[checkKey as keyof typeof available]) {
                                    triggerToast(`${checkKey}days are disabled in your availability settings.`, "info");
                                  } else {
                                    setScheduleDate(val);
                                  }
                                }
                              }}
                              className="w-full bg-transparent text-[11px] font-bold text-center text-slate-800 outline-none mt-0.5 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* SECTION 3 — AVAILABLE COACHING SLOTS */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#041F63] font-sans uppercase tracking-wider">
                      Available Coaching Slots
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map(time => {
                        const isBooked = checkSlotIsBooked(scheduleDate, time);
                        const isUnavailable = time === '12:00 PM'; // Coach Disabled Slot
                        const isSelected = scheduleTimeSlot === time;
                        const isClickable = !isBooked && !isUnavailable;

                        return (
                          <button
                            key={time}
                            type="button"
                            disabled={!isClickable}
                            onClick={() => {
                              if (isClickable) setScheduleTimeSlot(time);
                            }}
                            className={`py-1.5 px-1 text-center rounded-[10px] border text-[11px] font-bold flex flex-col items-center justify-center min-h-[40px] transition-all ${
                              isBooked
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                                : isUnavailable
                                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                                  : isSelected
                                    ? 'border-[#061C4A] bg-[#061C4A]/10 text-[#061C4A] font-extrabold cursor-pointer'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 bg-white cursor-pointer'
                            }`}
                          >
                            <span>{time}</span>
                            {isBooked && (
                              <span className="text-[6.5px] font-bold uppercase text-rose-500 tracking-wider">
                                BOOKED
                              </span>
                            )}
                            {isUnavailable && (
                              <span className="text-[6.5px] font-bold uppercase text-amber-600 tracking-wider">
                                DISABLED
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 4 — SESSION SUMMARY */}
                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2.5 space-y-1 font-sans text-[11px]">
                    <span className="block text-[8px] font-bold uppercase text-[#7C8BA1] tracking-wider">Session Summary</span>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-slate-600">
                      <div>
                        <span className="text-slate-400 text-[9px] block">Selected Trainee:</span>
                        <strong className="block text-[#061C4A] truncate font-bold text-[11px]">
                          {trainees?.find(t => t && t.id === scheduleTraineeId)?.name || trainees?.[0]?.name || 'Needs Selection'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#7C8BA1] text-[9px] block">Selected Date:</span>
                        <strong className="block text-[#061C4A] font-bold text-[11px]">
                          {(() => {
                            if (!scheduleDate) return 'Needs Selection';
                            try {
                              const d = new Date(scheduleDate);
                              return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                            } catch {
                              return scheduleDate;
                            }
                          })()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#7C8BA1] text-[9px] block">Selected Time:</span>
                        <strong className="block text-[#061C4A] font-bold text-[11px]">{scheduleTimeSlot || 'Needs Selection'}</strong>
                      </div>
                      <div>
                        <span className="text-[#7C8BA1] text-[9px] block">Session Type:</span>
                        <strong className="block text-[#061C4A] font-bold text-[11px]">Personal Coaching</strong>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="flex gap-2.5 pt-2.5 border-t border-slate-100 font-sans sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="flex-1 h-[44px] bg-white border border-[#edf2f7] hover:bg-slate-50 text-slate-600 font-bold rounded-[10px] text-[13px] cursor-pointer text-center transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-[44px] bg-[#061A4D] hover:bg-[#061A4D]/95 text-white font-bold rounded-[10px] text-[13px] cursor-pointer text-center transition shadow-sm"
                    >
                      Schedule
                    </button>
                  </div>

                </form>
              )}
            </div>
          </div>
        )}



        {/* Prescribe Workout Popup Modal */}
        {showPrescribeForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-[calc(100%-32px)] max-w-[360px] mx-auto p-5 shadow-2xl relative border border-slate-100 text-left overflow-y-auto max-h-[85vh] box-border break-words">
              <h3 className="font-display font-medium text-slate-900 text-lg mb-1">
                Prescribe Routine for {prescribeTraineeName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Routine will appear directly inside client Ahmad Ibrahim's checklist planner logs.
              </p>

              {prescribeSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center my-6">
                  <span className="text-xl">🏋️‍♂️</span>
                  <p className="font-bold mt-1">Prescription Dispatched successfully!</p>
                  <p className="text-xs">Your customized sequence is live.</p>
                </div>
              ) : (
                <form onSubmit={handlePrescribeSubmit} className="space-y-4">
                  
                  {/* Assignment Target Option selection */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 text-left">
                    <label className="block text-2xs font-bold text-slate-705 uppercase tracking-wider mb-1 font-sans">
                      🎯 Sequence Assignment Target
                    </label>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-slate-750">
                        <input
                          type="radio"
                          name="assignOption"
                          value="individual"
                          checked={assignOption === 'individual'}
                          onChange={() => setAssignOption('individual')}
                          className="text-teal-605 focus:ring-teal-500 rounded-full"
                        />
                        Single Client
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-slate-750">
                        <input
                          type="radio"
                          name="assignOption"
                          value="selected"
                          checked={assignOption === 'selected'}
                          onChange={() => {
                            setAssignOption('selected');
                            if (prescribeTraineeId && !selectedTraineeIdsForPrescription.includes(prescribeTraineeId)) {
                              setSelectedTraineeIdsForPrescription([prescribeTraineeId]);
                            }
                          }}
                          className="text-teal-605 focus:ring-teal-500 rounded-full"
                        />
                        Selected Client(s)
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-slate-750">
                        <input
                          type="radio"
                          name="assignOption"
                          value="all"
                          checked={assignOption === 'all'}
                          onChange={() => setAssignOption('all')}
                          className="text-teal-605 focus:ring-teal-500 rounded-full"
                        />
                        All Active Clients ({trainees.length})
                      </label>
                    </div>

                    {/* Checkboxes layout for multi-select option */}
                    {assignOption === 'selected' && (
                      <div className="pt-2 border-t border-slate-200 mt-2 grid grid-cols-2 gap-2 text-2xs">
                        {trainees.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-150 shadow-2xs">
                            <input
                              type="checkbox"
                              checked={selectedTraineeIdsForPrescription.includes(t.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTraineeIdsForPrescription([...selectedTraineeIdsForPrescription, t.id]);
                                } else {
                                  setSelectedTraineeIdsForPrescription(selectedTraineeIdsForPrescription.filter(id => id !== t.id));
                                }
                              }}
                              className="rounded text-teal-605 focus:ring-teal-500"
                            />
                            <span className="font-bold text-slate-755 truncate">{t.name}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {assignOption === 'individual' && trainees.length > 1 && (
                      <div className="pt-2 border-t border-slate-150 mt-2">
                        <select
                          value={prescribeTraineeId}
                          onChange={(e) => {
                            setPrescribeTraineeId(e.target.value);
                            const tFound = trainees.find(tr => tr.id === e.target.value);
                            if (tFound) setPrescribeTraineeName(tFound.name);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-2xs text-slate-800"
                        >
                          {trainees.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Routine Title / Focus Name
                      </label>
                      <input
                        type="text"
                        value={prescribeWorkoutType}
                        onChange={(e) => setPrescribeWorkoutType(e.target.value)}
                        placeholder="E.g. Pilates Core Focus"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Est. Duration (mins)
                      </label>
                      <input
                        type="number"
                        value={prescribeDuration}
                        onChange={(e) => setPrescribeDuration(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Coaching Notes & Instructions
                    </label>
                    <input
                      type="text"
                      value={prescribeNotes}
                      onChange={(e) => setPrescribeNotes(e.target.value)}
                      placeholder="E.g. Keep spine flat, focus on pelvis alignment"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800"
                    />
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex justify-between items-center text-left">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Require Video Evidence</p>
                      <p className="text-[10px] text-slate-500">Trainees must upload video proof of workout completion.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={prescribeVideoProofRequired} 
                        onChange={(e) => setPrescribeVideoProofRequired(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[4px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"></div>
                    </label>
                  </div>

                  {/* Exercises dynamic builder rows */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between items-center">
                      <span>Exercises Sets Plan</span>
                      <button
                        type="button"
                        onClick={handleAddPrescribeExercise}
                        className="text-[10px] text-teal-600 font-extrabold hover:underline cursor-pointer"
                      >
                        + Add Row
                      </button>
                    </label>

                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {prescribeExercises.map((ex, idx) => (
                        <div key={idx} className="flex gap-1.5 items-center">
                          <input
                            type="text"
                            placeholder="Bench press / squats"
                            value={ex.name}
                            onChange={(e) => handleUpdatePrescribeExercise(idx, 'name', e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs flex-1 min-w-[85px] text-slate-800"
                            required
                          />
                          <input
                            type="number"
                            placeholder="Sets"
                            value={ex.sets}
                            title="Sets"
                            onChange={(e) => handleUpdatePrescribeExercise(idx, 'sets', Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs w-12 text-slate-800"
                          />
                          <input
                            type="number"
                            placeholder="Reps"
                            value={ex.reps}
                            title="Reps"
                            onChange={(e) => handleUpdatePrescribeExercise(idx, 'reps', Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs w-12 text-slate-800"
                          />
                          <input
                            type="number"
                            placeholder="Wt (kg)"
                            value={ex.weight}
                            title="Weight"
                            onChange={(e) => handleUpdatePrescribeExercise(idx, 'weight', Number(e.target.value))}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-xs w-14 text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowPrescribeForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePrescribeSubmit}
                      className="bg-[#001F3F] text-teal-400 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Dispatch Routine
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PAGE ROUTING BODY */}

        {/* 1. REDESIGNED TRAINER DASHBOARD VIEW - BUSINESS COMMAND CENTER */}
        {activeTab === 'trainer-dashboard' && (() => {
          // Dynamic calculation of today's bookings
          const activeBookings = bookings.length > 0 ? bookings : [
            {
              id: 'b_1',
              trainerId: 'tr_sarah',
              traineeId: 'te_ahmad',
              traineeName: 'Ahmad Bin Ibrahim',
              title: 'HIIT Core Strength',
              type: 'Strength',
              date: '2026-06-20',
              timeSlot: '10:00 AM',
              status: 'Approved',
              location: 'SS15 Studio • Selangor',
              notes: 'Focusing on high intensity spinal extensions and core conditioning'
            },
            {
              id: 'b_2',
              trainerId: 'tr_sarah',
              traineeId: 'te_ling',
              traineeName: 'Mei Ling Tan',
              title: 'Pilates Slimming',
              type: 'Pilates',
              date: '2026-06-20',
              timeSlot: '02:00 PM',
              status: 'Approved',
              location: 'Subang Gym • Selangor',
              notes: 'Reformer posture and abdominal recovery flow'
            },
            {
              id: 'b_3',
              trainerId: 'tr_sarah',
              traineeId: 'te_faizul',
              traineeName: 'Muhammad Faizul',
              title: 'Athletic Strength',
              type: 'Strength',
              date: '2026-06-20',
              timeSlot: '04:00 PM',
              status: 'Approved',
              location: 'PJ Peak Performance',
              notes: 'Olympic weightlifting transitions and posture audits'
            }
          ];

          // Filter activeBookings using shared helper function and match '2026-06-20'
          const cleanActiveBookings = getCleanActiveBookings(activeBookings);
          const todayBookings = cleanActiveBookings.filter(b => b.date === '2026-06-20');
          const trainerName = resolvedTrainerProfile?.name || trainerProfile?.name || 'Sarah';
          const todaySessionsCount = todayBookings.filter(b => b.status !== 'Completed').length;

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 animate-fade-in text-left pb-4"
            >
              <PageHeader 
                title="Dashboard" 
                subtitle="Manage today’s coaching activity" 
                className="-mx-4 sm:-mx-6 lg:-mx-8 !pt-3 !pb-1"
              />

              {/* 1. Premium Welcome Greeting Box (First element) */}
              <div id="dashboard-hero-greeting" className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white p-4 py-3.5 rounded-xl shadow-xs relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-20 h-20 bg-white/5 rounded-full -mr-5 -mb-5 pointer-events-none"></div>
                <div className="absolute left-1/3 top-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12 pointer-events-none font-sans"></div>
                
                <h1 className="text-lg font-black font-display tracking-tight text-white mb-0.5">
                  Good Morning {trainerName} 👋
                </h1>
                <p className="text-[11px] text-indigo-100 font-medium">
                  ⚡ {todaySessionsCount} Sessions Today • Keep up the coaching rhythm
                </p>
              </div>

              {/* 2. QUICK ACTIONS ROW - SQUARE ICON CARDS */}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-sans select-none">
                  ⚡ Trainer Quick Actions
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => {
                      setInviteEmail('');
                      setInvitePkgOption('Monthly Pass');
                      setShowAddClientForm(true);
                    }}
                    className="flex flex-col justify-center items-center text-center p-2.5 bg-[#E6F7F5] border border-[#C1E7E0] hover:border-teal-450 rounded-xl shadow-3xs active:scale-95 hover:shadow-2xs cursor-pointer transition w-full h-[76px]"
                  >
                    <span className="text-xl mb-0.5 font-extrabold text-teal-650 shrink-0 font-sans leading-none">+</span>
                    <span className="text-[10px] font-black text-[#001F3F] uppercase tracking-wider font-sans leading-tight">Add<br/>Client</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTraineeId(trainees[0]?.id || 'te_ahmad');
                      setInvoiceAmount(150);
                      setInvoiceDueDate('2026-06-25');
                      setInvoiceDescription('Premium Personal Training Service Tier');
                      setInvoiceType('Personal Training Package');
                      setInvoiceNotes('');
                      setInvoiceTitle('Coaching Services Invoice');
                      setInvoiceBillingTarget('individual');
                      setInvoiceSelectedTraineeIds([]);
                      setShowInvoiceForm(true);
                    }}
                    className="flex flex-col justify-center items-center text-center p-2.5 bg-[#EEF1FF] border border-[#D3D8FD] hover:border-indigo-400 rounded-xl shadow-3xs active:scale-95 hover:shadow-2xs cursor-pointer transition w-full h-[76px]"
                  >
                    <span className="text-lg mb-1 shrink-0 font-sans leading-none">📄</span>
                    <span className="text-[10px] font-black text-indigo-950 uppercase tracking-wider font-sans leading-tight">Issue<br/>Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      setScheduleTraineeId(trainees[0]?.id || 'te_ahmad');
                      setScheduleDate('2026-06-22');
                      setScheduleTimeSlot('10:00 AM');
                      setScheduleLocation('SS15 Studio • Selangor');
                      setScheduleNotes('Personal training tracking alignment review');
                      setShowScheduleModal(true);
                    }}
                    className="flex flex-col justify-center items-center text-center p-2.5 bg-[#05162D] border border-slate-900 hover:border-indigo-500 rounded-xl shadow-3xs active:scale-95 hover:shadow-2xs cursor-pointer text-white transition w-full h-[76px]"
                  >
                    <span className="text-lg mb-1 shrink-0 text-amber-400 font-sans leading-none">📅</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-wider font-sans leading-tight">Schedule<br/>Session</span>
                  </button>
                </div>
              </div>

              {/* 3. KPI STATUS CARDS (2x2 COMPACT GRID) */}
              <div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 font-sans">
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white border border-slate-200/50 rounded-xl p-2.5 shadow-3xs text-left flex flex-col justify-between h-[52px]">
                    <span className="text-lg font-black text-slate-900 font-mono leading-none">
                      {trainees.length || 3}
                    </span>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider font-sans leading-none">
                      Clients
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/50 rounded-xl p-2.5 shadow-3xs text-left flex flex-col justify-between h-[52px]">
                    <span className="text-[15px] font-black text-slate-900 font-mono leading-none">
                      RM {Math.round(paidSumRevenue || 910).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider font-sans leading-none">
                      Revenue
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/50 rounded-xl p-2.5 shadow-3xs text-left flex flex-col justify-between h-[52px]">
                    <span className="text-[15px] font-black text-rose-600 font-mono leading-none">
                      RM {Math.round((pendingSumRevenue + overdueSumRevenue) || 80).toLocaleString()}
                    </span>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider font-sans leading-none">
                      Pending
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200/50 rounded-xl p-2.5 shadow-3xs text-left flex flex-col justify-between h-[52px]">
                    <span className="text-lg font-black text-indigo-600 font-mono leading-none">
                      {todaySessionsCount}
                    </span>
                    <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider font-sans leading-none">
                      Sessions
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. TODAY'S SCHEDULE - VISUAL CENTERPIECE */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-sans">
                    Today's Schedule
                  </h3>
                  <span className="text-[8px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full uppercase font-sans">
                    Live Status
                  </span>
                </div>

                <div className="space-y-2.5">
                  {todayBookings.map((b: any) => {
                    const time = b.timeSlot || b.time_slot || '10:00 AM';
                    const title = b.title || b.discipline || 'HIIT Core Strength';
                    const type = b.type || 'Strength';
                    const traineeName = b.traineeName || b.buyerName || 'Client';
                    const loc = b.location || 'SS15 Studio';
                    const status = b.status || 'Approved';
                    const photo = resolveTraineeAvatar(traineeName, b.avatarUrl);

                    return (
                      <div 
                        key={b.id}
                        onClick={() => {
                          setSelectedSessionForAction(b);
                          setRescheduleNewDate(b.date || '2026-06-20');
                          setRescheduleNewTimeSlot(time);
                          setShowSessionActionSheet(true);
                        }}
                        className="bg-white border border-slate-200/70 hover:border-indigo-400 rounded-xl overflow-hidden shadow-3xs hover:shadow-2xs transition duration-150 cursor-pointer text-left flex flex-col font-sans"
                      >
                        <div className="p-2.5 flex items-center gap-2.5">
                          {/* Time badge: 12px text for time */}
                          <div className="shrink-0 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg text-center min-w-[50px] flex flex-col justify-center">
                            <span className="text-xs font-black text-indigo-900 font-mono block leading-none">{time.split(' ')[0]}</span>
                            <span className="text-[9px] font-black text-indigo-700 tracking-wider font-mono block mt-0.5 uppercase leading-none">{time.split(' ')[1]}</span>
                          </div>

                          <div className="flex-1 min-w-0 flex items-center gap-2.5">
                            {/* Reduced avatar to 36px */}
                            <img 
                              src={photo} 
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0" 
                              alt={traineeName} 
                            />
                            <div className="min-w-0 flex-1">
                              {/* First line: Client name (always one line, truncated if too long) */}
                              <div className="flex items-center justify-between gap-1.5">
                                <h4 className="text-xs font-black text-slate-950 leading-tight truncate">{traineeName}</h4>
                                <span className={`text-[7px] font-bold uppercase tracking-wider px-1 py-0.2 rounded leading-none shrink-0 ${
                                  status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                  'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {status === 'Approved' ? 'Upcoming' : status}
                                </span>
                              </div>
                              
                              {/* Second line: Location (always one line, format: SS15 Studio • Selangor) */}
                              <p className="text-[10px] text-slate-500 mt-1 font-medium leading-none truncate">
                                📍 {loc.includes('•') ? loc : `${loc} • Selangor`}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50/40 py-1 px-2.5 border-t border-slate-100 flex justify-between items-center text-[8.5px] text-slate-400">
                          <span className="truncate max-w-[180px]">📅 {b.date} • <span className="font-semibold text-slate-500">{title}</span></span>
                          <span className="font-extrabold text-indigo-600 flex items-center gap-0.5 hover:underline shrink-0">
                            <span>Actions</span>
                            <span>➡</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })()}

        {activeTab === 'coaching-hub' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-left animate-fade-in font-sans"
          >
            <PageHeader
              title="Nutrition & Meal Feed"
              subtitle="Review meal submissions and coach feedback"
              className="-mx-4 sm:-mx-6 lg:-mx-8"
            />

            {/* Instagram-style visual Feed Layout */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
              
              {nutrition.length === 0 ? (
                <div className="col-span-full bg-white p-12 text-center rounded-[24px] border border-dashed border-slate-200">
                  <span className="text-3xl block mb-2">🥦</span>
                  <p className="font-extrabold text-slate-700">No Meals Logged Today</p>
                  <p className="text-xs text-slate-450 mt-1">Waiting for clients to post meal photos to their diaries.</p>
                </div>
              ) : (
                nutrition.map((n, idx) => {
                  const clientName = n.traineeName || 'Ahmad Ibrahim';
                  const timeStr = n.date || 'Today';
                  
                  const mealPhoto = resolveMealPhoto(n.foodName);

                  // Custom AI insights aligned dynamically with that specific nutrition entry name
                  let aiFeedSpec = "Optimal carbohydrate-to-protein ratios detected for athletic conditioning. Keep active and align with daily targets.";
                  const lowerFood = (n.foodName || "").toLowerCase();
                  if (lowerFood.includes("nasi lemak")) {
                    aiFeedSpec = "A classic high-energy local meal. Great slow-release carb-energy for heavy lifting, but watch the sambal sugar loads.";
                  } else if (lowerFood.includes("roti")) {
                    aiFeedSpec = "Fast energy source. Pair this crispy flatbread with egg (telur) next time to lower the glycemic index and increase bioavailable protein.";
                  } else if (lowerFood.includes("chicken")) {
                    aiFeedSpec = "Excellent high-quality lean protein detected! Perfect for accelerating micro-fiber cellular rebuilding post strength training.";
                  } else if (lowerFood.includes("shake") || lowerFood.includes("protein")) {
                    aiFeedSpec = "Premium amino muscle reconstruction fuel block. Excellent rapid metabolic absorption timing.";
                  }

                  return (
                    <div 
                      key={n.id}
                      className="bg-white border border-slate-200 rounded-[28px] overflow-hidden shadow-xs relative flex flex-col justify-between"
                    >
                      {/* Top Header Row of Meal Card */}
                      <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2.5">
                          {/* Trainee avatar */}
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-extrabold text-indigo-900 border border-indigo-200 text-xs">
                            {clientName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs block">{clientName}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">{timeStr}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase text-indigo-650 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full font-mono">
                          🔥 {n.calories} kcal
                        </span>
                      </div>

                      {/* Meal Photo (Instagram style bleed with robust error recovery) */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        <MealImage
                          src={mealPhoto}
                          alt={n.foodName}
                          className="w-full h-full object-cover"
                          containerClassName="w-full h-full aspect-video rounded-none border-none p-4 font-sans"
                        />
                        <div className="absolute left-3 bottom-3 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-2xs font-extrabold font-sans select-none">
                          {n.foodName}
                        </div>
                      </div>

                      {/* Nutrient capsule bars */}
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-2 text-center">
                            <span className="text-[8px] uppercase tracking-wide text-emerald-800 font-extrabold block">Protein</span>
                            <span className="text-xs font-black text-emerald-950 font-mono">{n.protein}g</span>
                          </div>
                          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-2 text-center">
                            <span className="text-[8px] uppercase tracking-wide text-indigo-800 font-extrabold block">Carbs</span>
                            <span className="text-xs font-black text-indigo-950 font-mono">{n.carbs}g</span>
                          </div>
                          <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-2 text-center">
                            <span className="text-[8px] uppercase tracking-wide text-rose-800 font-extrabold block">Fats</span>
                            <span className="text-xs font-black text-rose-955 font-mono">{n.fat}g</span>
                          </div>
                        </div>

                        {/* Trainee food note */}
                        {n.notes && (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[11px] text-slate-600 leading-relaxed italic text-left">
                            &ldquo;{n.notes}&rdquo;
                          </div>
                        )}

                        {/* Custom Interactive Coach Comment Component */}
                        <div className="border-t border-slate-100 pt-3 text-left">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Coach feedback</span>
                          
                          {n.trainerFeedback ? (
                            <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-3 text-[11px] text-teal-900 leading-relaxed text-left">
                              <span className="font-extrabold text-[#001F3F] block text-[9px] uppercase mb-1">Your reply:</span>
                              <p className="italic">&ldquo;{n.trainerFeedback}&rdquo;</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5 font-sans">
                              {replyingNutritionId === n.id ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    value={nutritionFeedbackText}
                                    onChange={(e) => setNutritionFeedbackText(e.target.value)}
                                    placeholder="Type professional coaching swap or comments..."
                                    className="w-full bg-white border border-slate-200 p-2.5 rounded-2xl text-xs text-slate-800 focus:outline-[#001F3F]"
                                    rows={2}
                                  />
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingNutritionId(null)}
                                      className="px-3 py-1 text-2xs font-extrabold text-slate-400 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleNutritionReply(n.id);
                                        triggerToast("Coaching feedback dispatched to trainee!", "success");
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-2xs py-1.5 px-3.5 rounded-lg cursor-pointer"
                                    >
                                      Post Comment
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-1.5 font-sans">
                                  <button
                                    onClick={() => {
                                      setReplyingNutritionId(n.id);
                                      setNutritionFeedbackText('');
                                    }}
                                    className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-xl hover:bg-indigo-100 transition duration-100 cursor-pointer"
                                  >
                                    💬 Leave Comment
                                  </button>
                                  <button
                                    onClick={() => {
                                      dbService.addNutritionFeedback(n.id, "Phenomenal nutritional choices and perfect macro split. Excellent work!");
                                      triggerToast("Marked daily nutritional log as Approved!", "success");
                                      fetchTrainerData();
                                    }}
                                    className="text-[10px] font-extrabold text-slate-600 bg-white border border-slate-250 px-3.5 py-1.5 rounded-xl hover:bg-slate-50 transition duration-100 cursor-pointer"
                                  >
                                    ✓ Quick Approve
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Glowing AI Coach recommendation row */}
                        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-3.5 relative overflow-hidden border border-indigo-900 shadow-xs flex items-start gap-2 text-left">
                          <Sparkles className="w-4 h-4 text-teal-400 shrink-0 mt-0.5 animate-pulse" />
                          <div className="min-w-0">
                            <span className="text-[8px] font-black uppercase text-teal-400 tracking-widest block font-mono">CoachAI Analysis</span>
                            <p className="text-[10px] text-slate-350 leading-relaxed font-sans mt-0.5">{aiFeedSpec}</p>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}

            </div>
          </motion.div>
        )}
        {/* 2. DYNAMIC CLIENTS VIEW & DRILL DOWN DETAILS */}
        {activeTab === 'client-management' && (() => {
          const getConsistencyBadge = (rate: number) => {
            if (rate >= 75) {
              return <span className="text-[10px] bg-teal-50 border border-teal-200 text-teal-750 px-2.5 py-0.5 rounded-full font-bold">Consistent</span>;
            } else if (rate >= 50) {
              return <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-750 px-2.5 py-0.5 rounded-full font-bold">Needs Attention</span>;
            } else {
              return <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-750 px-2.5 py-0.5 rounded-full font-bold">Low Consistency</span>;
            }
          };

          const getPaymentBadge = (status: string) => {
            if (status === 'Paid') {
              return <span className="text-[10px] bg-emerald-50 border border-emerald-250 text-emerald-850 px-2.5 py-0.5 rounded-full font-bold">Paid</span>;
            } else if (status === 'Pending') {
              return <span className="text-[10px] bg-yellow-50 border border-yellow-250 text-yellow-850 px-2.5 py-0.5 rounded-full font-bold">Pending</span>;
            } else {
              return <span className="text-[10px] bg-rose-50 border border-rose-250 text-rose-850 px-2.5 py-0.5 rounded-full font-bold">Overdue</span>;
            }
          };

          const sortedTrainees = trainees
            .filter(t => {
              const stats = getTraineeStats(t.id);
              const query = searchTerm.toLowerCase();
              const matchesName = t.name.toLowerCase().includes(query);
              const matchesGoal = (t.goals || '').toLowerCase().includes(query);
              const matchesPackage = (stats.packageName || '').toLowerCase().includes(query);
              return matchesName || matchesGoal || matchesPackage;
            })
            .sort((a, b) => {
              const statsA = getTraineeStats(a.id);
              const statsB = getTraineeStats(b.id);
              
              if (clientFilterMode === 'consistency') {
                if (statsA.completionRate !== statsB.completionRate) {
                  return statsA.completionRate - statsB.completionRate;
                }
                return (statsB.missedWorkouts || 0) - (statsA.missedWorkouts || 0);
              } else {
                const isAUnpaid = statsA.outstandingAmount > 0;
                const isBUnpaid = statsB.outstandingAmount > 0;
                
                if (isAUnpaid !== isBUnpaid) {
                  return isAUnpaid ? -1 : 1; 
                }
                
                if (statsB.outstandingAmount !== statsA.outstandingAmount) {
                  return statsB.outstandingAmount - statsA.outstandingAmount;
                }
                
                if (statsA.paymentStatus !== statsB.paymentStatus) {
                  if (statsA.paymentStatus === 'Overdue') return -1;
                  if (statsB.paymentStatus === 'Overdue') return 1;
                  if (statsA.paymentStatus === 'Pending') return -1;
                  if (statsB.paymentStatus === 'Pending') return 1;
                }
                return 0;
              }
            });

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <PageHeader 
                title="Clients" 
                subtitle="View and manage your trainees" 
                className="-mx-4 sm:-mx-6 lg:-mx-8"
              />

              {/* Header description with Search Bar */}
              <div className="flex justify-end items-center gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search trainees..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-[#001F3F]"
                  />
                </div>
              </div>

              {/* Clients Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pending Invitations list with 'Pend' label */}
                {trainerInvitations.filter(inv => inv.status === 'Pending').map((inv) => (
                  <div 
                    key={inv.id}
                    className="bg-slate-50 border border-dashed border-amber-200 hover:border-amber-400 rounded-xl p-3 shadow-3xs text-left transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-800 text-xs truncate leading-none mb-1">{inv.traineeEmail}</h4>
                        <p className="text-[10px] text-slate-500 font-sans leading-none">
                          <span className="font-semibold text-slate-600">Offered Package:</span> {inv.packageName}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="text-[8px] text-amber-800 font-extrabold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50 uppercase tracking-tight font-sans">
                            Pending
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono">{inv.date}</span>
                        </div>
                      </div>
                      <div className="bg-amber-50/70 text-amber-900 border border-amber-100/50 px-2 py-1 rounded-lg text-[9px] font-bold leading-tight text-center shrink-0 max-w-[130px]">
                        Awaiting onboarding acceptance
                      </div>
                    </div>
                  </div>
                ))}

                {sortedTrainees.map((t) => {
                  const stats = getTraineeStats(t.id);
                  return (
                    <div 
                      key={t.id}
                      onClick={() => {
                        setSelectedTrainee(t);
                        setNotesText(stats.notes);
                        setAiRecommendation(null);
                        setTraineeDetailTab('body');
                      }}
                      className="bg-white border border-slate-150 hover:border-teal-500/40 rounded-2xl p-4 shadow-sm text-left transition-all hover:scale-101 hover:shadow-md cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          referrerPolicy="no-referrer"
                          src={t.avatarUrl} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" 
                          alt={t.name} 
                        />
                        <div className="min-w-0 font-sans">
                          <h4 className="font-extrabold text-slate-800 text-sm truncate">{t.name}</h4>
                          <span className="text-[10px] text-teal-650 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Streak: {t.streakCount} Days
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {stats.paymentStatus === 'Overdue' && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-100 shrink-0">
                            Overdue
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              
              {trainees.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div className="col-span-full bg-white p-12 text-center rounded-xl border border-dashed border-slate-200">
                  <span className="text-2xl">🔍</span>
                  <p className="font-bold text-slate-600 mt-2">No matching trainees found.</p>
                  <p className="text-xs text-slate-400">Try modifying your query terms.</p>
                </div>
              )}
            </div>

            {/* Remove Client Option banner/trigger */}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setRemoveClientSearch('');
                  setShowRemoveClientModal(true);
                }}
                className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm shrink-0 transition flex items-center gap-1.5"
              >
                🗑 Remove Client
              </button>
            </div>

            {/* Remove Client Modal */}
            {showRemoveClientModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-[calc(100%-32px)] max-w-[360px] mx-auto max-h-[80vh] flex flex-col shadow-2xl relative border border-slate-100 text-left overflow-y-auto box-border break-words">
                  {/* Header */}
                  <div className="p-5 border-b border-slate-100 shrink-0">
                    <h3 className="font-display font-medium text-slate-900 text-lg mb-1">
                      🗑 Manage & Remove Trainer-Client Affiliations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Search and remove clients from your active roster.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="p-5 border-b border-slate-50 bg-slate-50/50 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search assigned client by name..."
                        value={removeClientSearch}
                        onChange={(e) => setRemoveClientSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-[#001F3F]"
                      />
                    </div>
                  </div>

                  {/* Scrollable list */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
                    {trainees
                      .filter(t => t.name.toLowerCase().includes(removeClientSearch.toLowerCase()))
                      .map((t) => {
                        const stats = getTraineeStats(t.id);
                        return (
                          <div key={t.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white hover:border-slate-300 transition shadow-2xs">
                            <div className="space-y-1 text-left">
                              <div className="flex items-center gap-2">
                                <img referrerPolicy="no-referrer" src={t.avatarUrl} className="w-8 h-8 rounded-full border border-slate-100 object-cover" />
                                <h4 className="font-bold text-sm text-slate-850">{t.name}</h4>
                              </div>
                              <p className="text-2xs text-slate-600 pt-0.5">
                                <span className="font-extrabold text-slate-700">Goal:</span> {t.goals || 'Weight Loss & Cardio'}
                              </p>
                              <p className="text-2xs text-slate-600">
                                <span className="font-extrabold text-slate-700">Package:</span> {stats.packageName || 'PT Package'}
                              </p>
                              <div className="flex items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-slate-400 font-bold">Billing:</span>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                  stats.paymentStatus === 'Paid' ? 'bg-emerald-50 border border-emerald-150 text-emerald-800' : 'bg-rose-50 border border-rose-150 text-rose-800'
                                }`}>
                                  {stats.paymentStatus}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setRemovingTrainee(t)}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 font-extrabold px-3.5 py-2 rounded-xl text-xs cursor-pointer tracking-wide self-end sm:self-center transition"
                            >
                              🗑 Remove Client Link
                            </button>
                          </div>
                        );
                      })}

                    {trainees.filter(t => t.name.toLowerCase().includes(removeClientSearch.toLowerCase())).length === 0 && (
                      <p className="text-slate-400 text-xs italic text-center py-6">No matching rostered clients found.</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-5 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => setShowRemoveClientModal(false)}
                      className="px-5 py-2.5 bg-[#001F3F] text-teal-400 hover:bg-slate-900 border border-transparent rounded-xl text-xs font-black cursor-pointer shadow-md"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Nested Removal Confirmation Dialog */}
            {removingTrainee && (
              <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white rounded-2xl w-[calc(100%-32px)] max-w-[360px] mx-auto p-5 shadow-2xl relative border border-slate-100 text-left overflow-y-auto max-h-[80vh] box-border break-words">
                  <span className="text-3xl block">⚠️</span>
                  <h3 className="font-display font-black text-lg text-rose-700 mt-2 mb-1.5">
                    Confirm Client Roster Removal
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mb-4 leading-relaxed">
                    Are you sure you want to remove this client from your coaching roster?
                  </p>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-2xs text-slate-500 space-y-1 mb-5">
                    <p>✔ Trainee's general user account will <strong className="text-slate-800">NOT</strong> be deleted.</p>
                    <p>✔ All history including nutrition inputs, invoices, receipts, and workout history are preserved.</p>
                  </div>

                  <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setRemovingTrainee(null)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer font-bold"
                      disabled={actionProcessing}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveClientExecute(removingTrainee.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-md transition"
                      disabled={actionProcessing}
                    >
                      {actionProcessing ? 'Removing...' : 'Confirm Removal'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TRAINEE OVERLAY SIDE-DRAWER PANEL */}
            <AnimatePresence>
              {selectedTrainee && (
                <div className="absolute inset-0 z-[48] overflow-hidden flex justify-end">
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedTrainee(null)}
                    className="absolute inset-0 bg-slate-950"
                  />

                  {/* Content Container */}
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10 box-border"
                  >
                    {/* Drawer Header */}
                    <div className="bg-slate-900 text-white p-6 flex justify-between items-center shrink-0">
                      <div className="flex items-center gap-3">
                        <img 
                          referrerPolicy="no-referrer"
                          src={selectedTrainee.avatarUrl} 
                          className="w-12 h-12 rounded-full object-cover border-2 border-teal-400" 
                          alt={selectedTrainee.name} 
                        />
                        <div>
                          <h3 className="font-display font-black text-white text-base leading-tight">{selectedTrainee.name} Profile</h3>
                          <p className="text-[10px] text-teal-400 font-bold tracking-widest uppercase">Target Focus Co-ordination</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedTrainee(null)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Navigation Drawer Tabs */}
                    <div className="bg-slate-100 p-2 border-b border-slate-200 shrink-0 flex gap-1.5 overflow-x-auto">
                      <button 
                        onClick={() => setTraineeDetailTab('body')}
                        className={`px-2.5 py-1.5 text-2xs font-extrabold rounded-lg transition shrink-0 ${
                          traineeDetailTab === 'body' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        📊 Metrics & Notes
                      </button>
                      <button 
                        onClick={() => setTraineeDetailTab('history')}
                        className={`px-2.5 py-1.5 text-2xs font-extrabold rounded-lg transition shrink-0 ${
                          traineeDetailTab === 'history' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        🏋️ Workout History
                      </button>
                      <button 
                        onClick={() => setTraineeDetailTab('nutrition')}
                        className={`px-2.5 py-1.5 text-2xs font-extrabold rounded-lg transition shrink-0 ${
                          traineeDetailTab === 'nutrition' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        🍽️ Nutrition History
                      </button>
                      <button 
                        onClick={() => setTraineeDetailTab('photos')}
                        className={`px-2.5 py-1.5 text-2xs font-extrabold rounded-lg transition shrink-0 ${
                          traineeDetailTab === 'photos' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        📸 Progress Gallery
                      </button>
                      <button 
                        onClick={() => setTraineeDetailTab('ai')}
                        className={`px-2.5 py-1.5 text-2xs font-extrabold rounded-lg transition shrink-0 flex items-center gap-1 ${
                          traineeDetailTab === 'ai' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-indigo-650 font-black hover:bg-indigo-50'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-teal-500" /> CoachAI Analysis
                      </button>
                    </div>

                    {/* Drawer Scrollable Body Content */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto text-left">
                      
                      {/* TAB 1: METRICS & NOTES */}
                      {traineeDetailTab === 'body' && (
                        <div className="space-y-6">
                          
                          {/* Metrics Header Summary */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#001F3F]/5 border border-teal-500/10 p-4 rounded-xl">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Client Attendance Status</span>
                              <strong className="text-slate-800 text-lg block font-display font-black mt-0.5">{getTraineeStats(selectedTrainee.id).attendance}</strong>
                              <p className="text-[9.5px] text-slate-500 mt-1">Status: Consistently active in Subang Studio</p>
                            </div>
                            <div className="bg-[#001F3F]/5 border border-teal-500/10 p-4 rounded-xl">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Calculated BMI Rating</span>
                              <strong className="text-teal-700 text-lg block font-display font-black mt-0.5">
                                {(selectedTrainee.weight / ((selectedTrainee.height / 100) ** 2)).toFixed(1)} kg/m²
                              </strong>
                              <p className="text-[9.5px] text-slate-500 mt-1">Goal: target to {(getTraineeStats(selectedTrainee.id).targetWeight / ((selectedTrainee.height / 100) ** 2)).toFixed(1)} kg/m²</p>
                            </div>
                          </div>

                          {/* Anthropometrics Grid */}
                          <div>
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Trainee Anthropometric Metrics</h4>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Height</span>
                                <strong className="text-slate-800 text-xs font-sans">{selectedTrainee.height} cm</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Weight</span>
                                <strong className="text-slate-800 text-xs font-sans">{selectedTrainee.weight} kg</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Weight</span>
                                <strong className="text-teal-700 text-xs font-sans">{getTraineeStats(selectedTrainee.id).targetWeight} kg</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Body Fat Rate</span>
                                <strong className="text-slate-800 text-xs font-sans">{getTraineeStats(selectedTrainee.id).bodyMetrics.bodyFat} %</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Muscle Mass</span>
                                <strong className="text-slate-800 text-xs font-sans">{getTraineeStats(selectedTrainee.id).bodyMetrics.muscleMass} kg</strong>
                              </div>
                              <div className="bg-[#001F3F]/10 border border-[#001F3F]/15 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-500 block uppercase font-bold">Calculated BMR</span>
                                <strong className="text-[#001F3F] text-xs font-black font-sans">{getTraineeStats(selectedTrainee.id).bodyMetrics.bmr} kcal</strong>
                              </div>
                            </div>
                          </div>

                          {/* Client Goals */}
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Trainee Goal Objectives & Limitations</span>
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-bold text-slate-700">{selectedTrainee.goals || "Re-stabilize posture and achieve fat depletion of 3-5% before next cycle."}</p>
                              <div className="flex gap-2 mt-2">
                                <span className="bg-rose-50 text-rose-705 px-2.5 py-0.5 rounded text-[10px] font-bold border border-rose-100">🇲🇾 Subang Jaya Sandbox</span>
                                <span className="bg-[#001F3F]/10 text-[#001F3F] px-2.5 py-0.5 rounded text-[10px] font-bold">Weekly Rate: 3x sessions</span>
                              </div>
                            </div>
                          </div>

                          {/* Coaching Package Contract details */}
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Coaching Package Contract</span>
                            <div className="grid grid-cols-2 gap-4 mt-3 text-xs">
                              <div>
                                <span className="text-slate-500 block">Package Name</span>
                                <strong className="text-slate-800 font-bold">{getTraineeStats(selectedTrainee.id).packageName || '8 Classes Per Month'}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Trainer Coach</span>
                                <strong className="text-slate-800 font-bold">Coach Sarah Tan</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Amount Paid</span>
                                <strong className="text-[#001F3F] font-black">RM {getTraineeStats(selectedTrainee.id).amountPaid || 600}</strong>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Contract Status</span>
                                <span className="inline-flex items-center gap-1.5 text-emerald-850 text-emerald-800 font-extrabold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  {getTraineeStats(selectedTrainee.id).status || 'Active'}
                                </span>
                              </div>
                              <div className="col-span-2 border-t border-slate-200/55 pt-2 flex justify-between">
                                <span className="text-slate-500">Auto Renewal:</span>
                                <strong className="text-slate-850 font-bold">{getTraineeStats(selectedTrainee.id).renewal || 'Next Month'}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Physical Check-In Dates History */}
                          <div>
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2.5 font-display">Session Attendance Log</h4>
                            <div className="flex gap-2 overflow-x-auto py-1">
                              {["11 Jun 2026", "08 Jun 2026", "05 Jun 2026", "01 Jun 2026", "28 May 2026"].map((date, idx) => (
                                <div key={idx} className="bg-white border text-center p-2 rounded-lg min-w-[85px] leading-tight shadow-xs">
                                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Session #{5 - idx}</span>
                                  <strong className="text-[11px] text-slate-800 block mt-1">{date}</strong>
                                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">✓ Checked</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Private Observation notes */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5 font-display">
                              <label className="font-bold text-xs uppercase text-slate-400 tracking-wider">Coach Private Observations</label>
                              {notesSuccess && <span className="text-[10px] font-bold text-teal-600 block">✓ Saved!</span>}
                            </div>
                            <textarea
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              rows={5}
                              placeholder="Type tactical feedback, limitations, injury recovery profiles here..."
                              className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-[#001F3F] mb-2"
                            />
                            <button
                              onClick={handleSaveTraineeNotes}
                              className="bg-[#001F3F] hover:bg-slate-900 text-teal-400 text-2xs font-extrabold px-4 py-2 rounded-lg cursor-pointer transition"
                            >
                              Save Performance Observations
                            </button>
                            
                            {/* History Note Timeline */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Observations timeline history</span>
                              <div className="border-l-2 border-slate-200 pl-3 space-y-3">
                                <div className="text-2xs">
                                  <span className="text-slate-400 font-bold block">10 Jun 2026</span>
                                  <p className="text-slate-650 italic mt-0.5">"{getTraineeStats(selectedTrainee.id).notes}"</p>
                                </div>
                                <div className="text-2xs">
                                  <span className="text-slate-400 font-bold block">05 Jun 2026</span>
                                  <p className="text-slate-650 italic mt-0.5">"Needs slight postural control alignment on overhead extensions level. Tight hammies."</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: WORKOUTS HISTORY ONLY */}
                      {traineeDetailTab === 'history' && (
                        <div className="space-y-6">
                          
                          {/* Workout summary stats cards + Weekly Workout completion chart */}
                          <div className="bg-[#001F3F]/5 border border-teal-500/10 p-4 rounded-xl space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-250 pb-3">
                              <div>
                                <strong className="text-slate-800 text-sm block">Subang Center Activity Analytics</strong>
                                <p className="text-[10px] text-slate-500 mt-1">Evaluated adherence metric over current recurring subscription cycle.</p>
                              </div>
                              <div className="text-right">
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  92% Adherence
                                </span>
                              </div>
                            </div>

                            {/* Weekly Workout Completion Chart */}
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Weekly Workout Completion Tracker</span>
                              <div className="flex justify-between items-end h-16 pt-2 select-none">
                                {[
                                  { day: 'Mon', completed: true, val: 90 },
                                  { day: 'Tue', completed: true, val: 90 },
                                  { day: 'Wed', completed: false, val: 10 },
                                  { day: 'Thu', completed: true, val: 90 },
                                  { day: 'Fri', completed: true, val: 90 },
                                  { day: 'Sat', completed: false, val: 10 },
                                  { day: 'Sun', completed: true, val: 90 },
                                ].map((item, idx) => (
                                  <div key={idx} className="flex flex-col items-center flex-1">
                                    <div className="w-4 bg-slate-200 rounded-t-sm relative h-10 overflow-hidden">
                                      <div 
                                        className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-305 ${
                                          item.completed ? 'bg-gradient-to-t from-teal-500 to-[#001F3F]' : 'bg-slate-300'
                                        }`}
                                        style={{ height: `${item.val}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-500 mt-1.5">{item.day}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Workouts checklist */}
                          <div>
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Completed Workout Log Historics</h4>
                            <div className="space-y-4">
                              {workouts.filter(w => w.traineeId === selectedTrainee.id).map(w => (
                                <div key={w.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-xs text-xs space-y-3">
                                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                    <div>
                                      <strong className="text-slate-800 text-sm">{w.workoutType} Session</strong>
                                      <span className="text-slate-400 text-[10px] block mt-0.5">{w.date}</span>
                                    </div>
                                    <span className="bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                      🔥 450 kcal • 45 mins
                                    </span>
                                  </div>
                                  
                                  {/* Exercises detail list */}
                                  <div className="flex flex-wrap gap-2">
                                    {w.exercises.map((ex, idx) => (
                                      <span key={idx} className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 font-medium text-slate-600 text-[11px] flex gap-1">
                                        🏋️ {ex.name} <strong className="text-[#001F3F] font-bold">({ex.sets}x{ex.reps} @ {ex.weight}kg)</strong>
                                      </span>
                                    ))}
                                  </div>
                                  
                                  {w.notes && (
                                    <p className="text-slate-500 italic text-[11px] bg-slate-50 p-2.5 rounded-lg border-l-2 border-teal-500 text-left">
                                      &ldquo;{w.notes}&rdquo;
                                    </p>
                                  )}

                                  {/* Workout Video Evidence Proof Section */}
                                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-2 text-left">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                        📹 Workout Verification Video
                                      </span>
                                      {w.videoUrl ? (
                                        <button
                                          onClick={() => {
                                            setExpandedVideoWorkoutId(expandedVideoWorkoutId === w.id ? null : w.id);
                                          }}
                                          className="text-[10px] bg-emerald-100 text-[#001F3F] hover:bg-emerald-250 px-2.5 py-1 rounded-full font-extrabold cursor-pointer flex items-center gap-1 transition shadow-2xs"
                                        >
                                          <span>✓ Video Proof Available</span>
                                          <span className="font-extrabold">({expandedVideoWorkoutId === w.id ? 'Hide' : 'Play Preview'})</span>
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-100/60 px-2 py-0.5 rounded-full inline-block">
                                          No proof video submitted for this session.
                                        </span>
                                      )}
                                    </div>

                                    {/* Playable Video Frame */}
                                    {w.videoUrl && expandedVideoWorkoutId === w.id && (
                                      <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video max-h-[220px] md:max-h-[280px] flex items-center justify-center mt-2">
                                        <video
                                          src={w.videoUrl}
                                          controls
                                          playsInline
                                          className="w-full h-full object-contain"
                                          referrerPolicy="no-referrer"
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Contextual Reply to Workout button */}
                                  <div className="flex justify-end pt-2 border-t border-slate-50">
                                    <button
                                      onClick={() => linkContextToChat(
                                        `Workout Log - ${w.workoutType} Session (${w.date})`,
                                        `Hey ${selectedTrainee.name}, excellent work on your ${w.workoutType} session logged on ${w.date}! Concerning your performance...`
                                      )}
                                      className="text-[10px] bg-[#001F3F]/10 text-[#001F3F] hover:bg-[#001F3F] hover:text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all duration-100"
                                    >
                                      <Send className="w-3 h-3 text-teal-600" /> Reply to Workout
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {workouts.filter(w => w.traineeId === selectedTrainee.id).length === 0 && (
                                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No workout logs registered under this trainee ID.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: NUTRITION HISTORY ONLY */}
                      {traineeDetailTab === 'nutrition' && (
                        <div className="space-y-6">
                          
                          {/* Compliance and Weekly Calorie Progress Charts */}
                          <div className="bg-[#001F3F]/5 border border-teal-500/10 p-4 rounded-xl space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                              <div>
                                <strong className="text-slate-800 text-sm block">Nutrition Compliance Analysis</strong>
                                <p className="text-[10px] text-slate-500 mt-1">Daily cal target calories tracked relative to 1,800 kcal limit.</p>
                              </div>
                              <div className="text-right">
                                <span className="bg-teal-100 text-[#001F3F] text-[10px] font-black px-2 py-0.5 rounded-full">
                                  88% Compliance
                                </span>
                              </div>
                            </div>

                            {/* Weekly Calorie chart */}
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Weekly Calories Burnt vs Target</span>
                              <div className="flex justify-between items-end h-16 pt-2 px-1 select-none">
                                {[
                                  { day: 'Mon', target: 1800, logged: 1720, label: 'Optimal' },
                                  { day: 'Tue', target: 1800, logged: 2100, label: 'Over' },
                                  { day: 'Wed', target: 1800, logged: 1950, label: 'Acceptable' },
                                  { day: 'Thu', target: 1800, logged: 1680, label: 'Optimal' },
                                  { day: 'Fri', target: 1800, logged: 1780, label: 'Optimal' },
                                  { day: 'Sat', target: 1800, logged: 2200, label: 'Over' },
                                  { day: 'Sun', target: 1800, logged: 1750, label: 'Optimal' },
                                ].map((item, idx) => {
                                  const pct = Math.min((item.logged / 2500) * 100, 100);
                                  const isOver = item.logged > item.target;
                                  return (
                                    <div key={idx} className="flex flex-col items-center flex-1">
                                      <div className="w-4 bg-slate-200 rounded-t-sm relative h-10 overflow-hidden">
                                        <div 
                                          className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all duration-300 ${
                                            isOver ? 'bg-amber-500' : 'bg-teal-500'
                                          }`}
                                          style={{ height: `${pct}%` }}
                                        />
                                      </div>
                                      <span className="text-[9px] font-bold text-slate-500 mt-1.5">{item.day}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* AI Nutrition Analysis Guidance card */}
                          <div className="bg-gradient-to-r from-[#001F3F] to-indigo-950 text-white p-4 rounded-xl border border-teal-500/20">
                            <span className="bg-teal-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full inline-block leading-none mb-2 select-none font-sans">
                              AI DIETARY ANALYZER
                            </span>
                            <h5 className="font-bold text-xs text-teal-300">Malaysian Foods Optimization Suggestion</h5>
                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                              Your client has logged Nasi Lemak and Chicken Rice. While the protein component is adequate, we suggest replacing high-fat Malaysian coconut gravies with steamed options and requesting sauces on the side to decrease simple sugar loads by 20% in the current cycle.
                            </p>
                          </div>

                          {/* Nutrition checklist */}
                          <div>
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Completed Nutrition Meal Log Historics</h4>
                            <div className="space-y-4">
                              {nutrition.filter(n => n.traineeId === selectedTrainee.id).map(n => (
                                <div key={n.id} className="border border-slate-100 rounded-xl p-4 bg-white shadow-xs text-xs space-y-3">
                                  <div className="flex gap-3 items-center border-b border-slate-50 pb-2">
                                    <div className="w-10 h-10 shrink-0">
                                      <MealImage
                                        src={resolveMealPhoto(n.foodName)}
                                        alt={n.foodName}
                                        className="w-full h-full object-cover rounded-lg border border-slate-100"
                                        containerClassName="w-full h-full rounded-lg border border-slate-100 flex-col !p-1 text-center font-sans"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <strong className="text-slate-800 text-sm block truncate">{n.foodName}</strong>
                                      <span className="text-slate-400 text-[9px] block font-bold capitalize mt-0.5">{n.date} meal log</span>
                                    </div>
                                    <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 mt-0.5 py-0.5 rounded flex gap-1 shrink-0">
                                      🔥 {n.calories} kcal
                                    </span>
                                  </div>

                                  <div className="flex gap-4 text-[10px] text-slate-500 font-semibold bg-slate-50 p-2 rounded-lg">
                                    <span>Protein: <strong className="text-slate-800">{n.protein}g</strong></span>
                                    <span>Carbs: <strong className="text-slate-800">{n.carbs}g</strong></span>
                                    <span>Fat: <strong className="text-slate-800">{n.fat}g</strong></span>
                                  </div>

                                  {n.notes && (
                                    <p className="text-[11px] text-slate-500 pl-2 border-l-2 border-slate-300 italic">
                                      &ldquo;{n.notes}&rdquo;
                                    </p>
                                  )}

                                  {n.trainerFeedback && (
                                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-2.5 text-[11px] text-teal-800">
                                      <strong className="font-bold">Sent Observation:</strong> &ldquo;{n.trainerFeedback}&rdquo;
                                    </div>
                                  )}

                                  {/* Contextual Reply to Nutrition Button */}
                                  <div className="flex justify-end pt-2 border-t border-slate-50">
                                    <button
                                      onClick={() => linkContextToChat(
                                        `Nutrition Log - ${n.foodName} (${n.date})`,
                                        `Hey ${selectedTrainee.name}, analyzing your recent raw meal logs of ${n.foodName} (${n.calories} kcal) on ${n.date}...`
                                      )}
                                      className="text-[10px] bg-[#001F3F]/10 text-[#001F3F] hover:bg-[#001F3F] hover:text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition"
                                    >
                                      <Send className="w-3 h-3 text-teal-600" /> Reply to Nutrition
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {nutrition.filter(n => n.traineeId === selectedTrainee.id).length === 0 && (
                                <p className="text-xs text-slate-400 py-6 text-center bg-slate-100 rounded-xl border border-dashed border-slate-205">No nutrition records logged under this trainee yet.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 4: PROGRESS PHOTOS GALLERY */}
                      {traineeDetailTab === 'photos' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center bg-slate-55 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div>
                              <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider">Visual Physique Tracker</h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">Dual assessment visual comparison slider timeline.</p>
                            </div>
                            <label className="bg-[#001F3F] text-teal-400 px-3 py-1.5 rounded-lg text-2xs font-extrabold hover:bg-slate-900 cursor-pointer flex items-center gap-1 leading-none">
                              <Camera className="w-3.5 h-3.5 text-teal-400" /> Upload Photos
                              <input type="file" className="hidden" onChange={() => triggerToast('Physique photo processed in sandbox securely!')} />
                            </label>
                          </div>

                          {/* Beautiful before and after container */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                              <img 
                                referrerPolicy="no-referrer"
                                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=320" 
                                className="w-full h-36 object-cover rounded-lg mb-2" 
                                alt="Assessment Week 1" 
                              />
                              <span className="text-[10px] font-bold text-slate-500">Initial Assessment (Week 1)</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center relative overflow-hidden group">
                              <img 
                                referrerPolicy="no-referrer"
                                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=320" 
                                className="w-full h-36 object-cover rounded-lg mb-2 grayscale" 
                                alt="Recent Progression Week 8" 
                              />
                              <span className="text-[10px] font-bold text-slate-700">Recent Progression (Week 8)</span>
                            </div>
                          </div>

                          {/* Reply with Progress Review */}
                          <div className="flex justify-between items-center text-xs bg-slate-50 border border-slate-100 p-3 rounded-lg">
                            <span className="text-slate-500 text-[11px]">Last photo assessed: <strong className="text-slate-800">11 June 2026</strong></span>
                            <button
                              onClick={() => linkContextToChat(
                                `Progress Photo assessed on 11 Jun 2026`,
                                `Hey ${selectedTrainee.name}, incredible progress on your Week 8 visual photos comparison! I can see notable changes...`
                              )}
                              className="text-[10px] bg-[#001F3F]/10 text-[#001F3F] hover:bg-[#001F3F] hover:text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                            >
                              <Send className="w-3 h-3 text-teal-650" /> Reply to Progress Photo
                            </button>
                          </div>

                          {/* Physiological Measurements */}
                          <div className="border-t border-slate-100 pt-4 space-y-4">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Physiological Measurements (Past 8 Weeks)</span>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="border border-slate-100 p-2 rounded bg-white">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Waist Girth</span>
                                  <strong className="text-slate-800 text-xs font-sans">82 cm <span className="text-emerald-600 text-[9px] font-black">(-4cm)</span></strong>
                                </div>
                                <div className="border border-slate-100 p-2 rounded bg-white">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Chest Width</span>
                                  <strong className="text-slate-800 text-xs font-sans">104 cm <span className="text-teal-650 text-[9px] font-bold">(+2cm)</span></strong>
                                </div>
                                <div className="border border-slate-100 p-2 rounded bg-white">
                                  <span className="text-[8px] text-slate-400 block uppercase font-bold">Thigh Circumference</span>
                                  <strong className="text-slate-800 text-xs font-sans">58 cm <span className="text-emerald-600 text-[9px] font-black">(-1.5cm)</span></strong>
                                </div>
                              </div>
                            </div>

                            {/* Weight change trend visual indicator */}
                            <div className="bg-[#001F3F]/5 rounded-xl p-3 border border-slate-100">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Weight Change Trendline</span>
                              <div className="flex justify-between text-2xs text-slate-650 font-medium">
                                <span>Week 1: <strong className="text-[#001F3F]">{selectedTrainee.weight + 4} kg</strong></span>
                                <span>→</span>
                                <span>Week 4: <strong className="text-[#001F3F]">{selectedTrainee.weight + 2} kg</strong></span>
                                <span>→</span>
                                <span>Week 8 (Now): <strong className="text-emerald-700">{selectedTrainee.weight} kg</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 5: COACHAI ANALYSIS */}
                      {traineeDetailTab === 'ai' && (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-950 relative overflow-hidden text-left shadow-lg">
                            <span className="absolute right-1 bottom-1 text-5xl opacity-10 pointer-events-none text-slate-500">✨</span>
                            <span className="bg-teal-400 text-slate-955 text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block mb-2 font-mono">
                              CoachAI Analysis
                            </span>
                            <h4 className="font-display font-bold text-sm text-white mb-1">
                              CoachAI Analysis
                            </h4>
                            <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                              Instantly analyze height, weight, body fat and target goals to generate a 3-day structured routine calibrated for the hot Malaysian humidity.
                            </p>
                            
                            <button
                              onClick={() => {
                                handleAskAiRecommendation(selectedTrainee.id);
                                setApprovedState('idle');
                                setAiEditMode(false);
                              }}
                              disabled={loadingAi}
                              className="bg-teal-400 hover:bg-teal-500 text-slate-955 text-2xs font-extrabold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-slate-955 animate-spin" />
                              <span>{loadingAi ? 'Consolidating client profile metrics...' : 'Deploy CoachAI Analysis'}</span>
                            </button>
                          </div>

                          {/* Generated recommendation results block */}
                          {aiRecommendation && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border border-indigo-150 p-5 rounded-2xl bg-indigo-50/50 space-y-4 text-slate-800"
                            >
                              <div className="border-b border-indigo-100 pb-3 flex justify-between items-center">
                                <div>
                                  <h5 className="font-bold text-sm text-indigo-950">{aiRecommendation.workoutName || "Cardio Intervals & Calibrated Core Strength"}</h5>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Primary focus: {aiRecommendation.focus || "Adipose Depletion & Lean Tone"}</p>
                                </div>
                                <span className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  approvedState === 'approved' ? 'bg-emerald-650 text-emerald-800 bg-emerald-50 border border-emerald-250' :
                                  approvedState === 'rejected' ? 'bg-rose-650 text-rose-800 bg-rose-50 border border-rose-250' :
                                  approvedState === 'edited' ? 'bg-amber-650 text-amber-800 bg-amber-50 border border-amber-250' : 'bg-indigo-650 text-white'
                                }`}>
                                  {approvedState === 'approved' ? '✓ Approved' :
                                   approvedState === 'rejected' ? '✗ Rejected' :
                                   approvedState === 'edited' ? 'Modified' : 'Pending Review'}
                                </span>
                              </div>

                              {/* Injury Risk warnings */}
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-900 text-2xs flex gap-2">
                                <span className="bg-amber-500 text-white font-extrabold px-1.5 rounded h-4 block">ADVICE</span>
                                <p className="leading-tight">
                                  <strong>Metabolic Warnings:</strong> Baseline anthropometric metrics indicate standard vertebral control. Hold posture vertical and limit heavy compression deadlifts during heat alerts in Selangor.
                                </p>
                              </div>

                              {/* Dynamic Text Editor Area when edit state clicked */}
                              {aiEditMode ? (
                                <div className="space-y-2 text-left">
                                  <label className="text-[10.5px] font-bold text-slate-600 block">Edit Program Specifications</label>
                                  <textarea 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-[#001F3F]"
                                    rows={5}
                                    value={aiNotesBuffer || JSON.stringify(aiRecommendation.schedule, null, 2)}
                                    onChange={(e) => setAiNotesBuffer(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setAiEditMode(false);
                                        setApprovedState('edited');
                                        triggerToast("Updates to Gemini's routine successfully cached!");
                                      }}
                                      className="bg-emerald-650 text-white text-2xs px-3 py-1.5 rounded font-bold"
                                    >
                                      Save Changes
                                    </button>
                                    <button 
                                      onClick={() => setAiEditMode(false)}
                                      className="bg-slate-200 text-slate-700 text-2xs px-3 py-1.5 rounded font-bold"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3.5 text-xs text-left">
                                  {aiRecommendation.schedule?.map((item: any, id: number) => (
                                    <div key={id} className="bg-white border rounded-xl p-3 shadow-inner">
                                      <strong className="text-slate-800 block text-[11px] mb-2">{item.day}</strong>
                                      <ul className="space-y-1.5 text-slate-650">
                                        {item.exercises?.map((ex: any, xid: number) => (
                                          <li key={xid} className="border-b border-dashed border-slate-100 pb-1.5 text-[11px]">
                                            👨‍💻 <strong className="text-[#001F3F]">{ex.name}</strong> • {ex.sets}s × {ex.reps}r {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{ex.descr}</p>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Tips */}
                              <div className="bg-slate-900 text-white rounded-xl p-4 text-2xs relative">
                                <span className="text-teal-400 font-extrabold uppercase tracking-wide block mb-1">🇲🇾 Coach Tactical Tips</span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-350">
                                  {aiRecommendation.tips?.map((t: string, tid: number) => (
                                    <li key={tid}>{t}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Trainer approval workflow button dashboard panel */}
                              <div className="border-t border-indigo-100 pt-3 flex flex-wrap gap-2 justify-between">
                                <div className="flex gap-1.5 shrink-0">
                                  <button
                                    onClick={() => {
                                      setApprovedState('approved');
                                      triggerToast("Suggestion marked as Approved! Ready to dispatch.");
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition cursor-pointer select-none ${
                                      approvedState === 'approved' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-850 hover:bg-slate-300'
                                    }`}
                                  >
                                    Approve Suggestion
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAiEditMode(true);
                                      setAiNotesBuffer(JSON.stringify(aiRecommendation.schedule, null, 2));
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-850 hover:bg-slate-300 text-2xs font-extrabold transition cursor-pointer select-none"
                                  >
                                    Edit Suggestion
                                  </button>
                                  <button
                                    onClick={() => {
                                      setApprovedState('rejected');
                                      triggerToast("Suggestion marked as Rejected");
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition cursor-pointer select-none ${
                                      approvedState === 'rejected' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-200 text-slate-850 hover:bg-slate-300'
                                    }`}
                                  >
                                    Reject Suggestion
                                  </button>
                                </div>
                                <button
                                  onClick={async () => {
                                    try {
                                      await dbService.createChatMessage({
                                        senderId: 'u_sarah',
                                        receiverId: selectedTrainee.userId,
                                        message: `✨ [CoachAI Analysis] Here is your personalized prescription:\n\n${aiRecommendation.workoutName}\nFocus: ${aiRecommendation.focus}\nTips:\n- ${aiRecommendation.tips?.join('\n- ')}`
                                      });
                                      
                                      // Focus thread
                                      setActiveChatTrainee({
                                        id: selectedTrainee.id,
                                        userId: selectedTrainee.userId,
                                        name: selectedTrainee.name,
                                        avatarUrl: selectedTrainee.avatarUrl,
                                        initials: selectedTrainee.name.substring(0, 2).toUpperCase(),
                                        status: 'online'
                                      });
                                      
                                      setChatOpen(true);
                                      setChatInputText("Let me know if you would like me to modify this routine!");
                                      fetchChatMessages(selectedTrainee.userId);
                                      triggerToast("Optimizer program dispatched to client private chat!");
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-indigo-950 hover:bg-slate-900 text-teal-400 font-extrabold rounded-lg text-2xs transition cursor-pointer select-none flex items-center gap-1 leading-none"
                                >
                                  <Send className="w-3.5 h-3.5 text-teal-400 font-bold" /> Send to Client
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Drawer Footer controls */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between shrink-0">
                      <button 
                        onClick={() => setSelectedTrainee(null)}
                        className="px-4 py-2 border border-slate-200 text-xs bg-white text-slate-650 hover:bg-slate-100 font-bold rounded-xl cursor-pointer"
                      >
                        Exit Details
                      </button>
                      <button 
                        onClick={() => {
                          setPrescribeTraineeId(selectedTrainee.id);
                          setPrescribeTraineeName(selectedTrainee.name);
                          setPrescribeWorkoutType('Targeted Muscle Core Routine');
                          setPrescribeNotes('Prioritize control over loaded weights.');
                          setPrescribeExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
                          setShowPrescribeForm(true);
                        }}
                        className="bg-indigo-950 hover:bg-slate-900 text-teal-400 font-semibold text-xs py-2 px-5 rounded-xl transition cursor-pointer"
                      >
                        + Prescribe Direct Workout
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })()}

                {/* 3. COMPREHENSIVE PAYMENTS / REVENUE VIEW */}
        {activeTab === 'revenue' && (() => {
          const currentMonthData = monthlyPaymentsData[selectedMonth] || monthlyPaymentsData['June 2026'];
          const selectedMonthIndex = monthsList.indexOf(selectedMonth);

          const segments = [
            { toX: 105, d: "C 70 73, 70 65, 105 55" }, // Feb
            { toX: 175, d: "C 140 45, 140 40, 175 37" }, // Mar
            { toX: 245, d: "C 210 34, 210 28, 245 23" }, // Apr
            { toX: 315, d: "C 280 18, 280 15, 315 11" }, // May
            { toX: 385, d: "C 350 7, 350 5, 385 4" }   // Jun
          ];

          let activePath = "M 35 90";
          let activeFillPath = "M 35 90 L 35 100 L 35 100 Z";
          let futurePath = "";

          if (selectedMonthIndex === 0) {
            activePath = "M 35 90 L 36 90";
            activeFillPath = "M 35 90 L 36 90 L 36 100 L 35 100 Z";
            futurePath = "M 35 90 C 70 73, 70 65, 105 55 C 140 45, 140 40, 175 37 C 210 34, 210 28, 245 23 C 280 18, 280 15, 315 11 C 350 7, 350 5, 385 4";
          } else {
            let activeSegs = "";
            for (let i = 0; i < selectedMonthIndex; i++) {
              activeSegs += " " + segments[i].d;
            }
            activePath = "M 35 90" + activeSegs;
            const endX = segments[selectedMonthIndex - 1].toX;
            activeFillPath = activePath + " L " + endX + " 100 L 35 100 Z";

            if (selectedMonthIndex < 5) {
              let futureSegs = "";
              for (let i = selectedMonthIndex; i < 5; i++) {
                futureSegs += " " + segments[i].d;
              }
              const startY = [90, 55, 37, 23, 11, 4][selectedMonthIndex];
              futurePath = "M " + endX + " " + startY + futureSegs;
            }
          }

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 font-sans text-[#061C4A] pb-12"
            >
              <PageHeader 
                title="Payments" 
                subtitle="Track revenue, invoices, and client payments" 
                className="px-0 pt-4 pb-0"
              >
                {paymentScreen === 'main' && (
                  <div className="relative">
                    <button
                      onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                      className="bg-white hover:bg-slate-50 text-[#061C4A] text-[11px] font-black px-3.5 py-1.75 rounded-full select-none cursor-pointer transition flex items-center gap-1.5 shrink-0 border border-slate-200 shadow-3xs font-sans tracking-wide uppercase"
                    >
                      <span>📅 {selectedMonth}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    
                    {isMonthDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsMonthDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2.5 pb-1 w-44 bg-white border border-slate-200 rounded-[16px] shadow-lg z-20 overflow-hidden text-left py-1 text-xs font-bold font-sans">
                          {monthsList.map((m) => (
                            <button
                              key={m}
                              onClick={() => {
                                setSelectedMonth(m);
                                setIsMonthDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                                selectedMonth === m ? 'text-[#5B4CFB] font-extrabold bg-[#5B4CFB]/5' : 'text-[#061C4A]'
                              }`}
                            >
                              <span>{m}</span>
                              {selectedMonth === m && <Check className="w-3.5 h-3.5 text-[#5B4CFB] shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </PageHeader>

            {paymentScreen === 'main' && (
              <>

                {/* 2. Revenue Summary KPI Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Monthly Revenue */}
                  <div className="bg-[#EEF1FF] border border-[#5B4CFB]/10 p-3 rounded-xl shadow-3xs flex flex-col justify-between h-[92px] text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Monthly Revenue</span>
                      <div className="w-5.5 h-5.5 rounded bg-white/70 flex items-center justify-center text-[#5B4CFB] shrink-0">
                        <TrendingUp className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <strong className="text-[15px] font-black font-display text-[#061C4A] block leading-none">{currentMonthData.monthlyRevenue}</strong>
                      <span className="text-[9px] font-extrabold text-emerald-600 mt-1 flex items-center gap-0.5 leading-none">
                        <span>{currentMonthData.monthlyRevenueSub}</span>
                      </span>
                    </div>
                  </div>

                  {/* Total Collected */}
                  <div className="bg-[#DFF7F2] border border-teal-500/10 p-3 rounded-xl shadow-3xs flex flex-col justify-between h-[92px] text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Total Collected</span>
                      <div className="w-5.5 h-5.5 rounded bg-white/70 flex items-center justify-center text-teal-600 shrink-0">
                        <DollarSign className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <strong className="text-[15px] font-black font-display text-[#061C4A] block leading-none">{currentMonthData.totalCollected}</strong>
                      <span className={`text-[9px] font-extrabold ${currentMonthData.totalCollectedUp ? 'text-emerald-600' : 'text-rose-600'} mt-1 flex items-center gap-0.5 leading-none`}>
                        <span>{currentMonthData.totalCollectedSub}</span>
                      </span>
                    </div>
                  </div>

                  {/* Pending Payments */}
                  <div className="bg-amber-50 border border-amber-500/10 p-3 rounded-xl shadow-3xs flex flex-col justify-between h-[92px] text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Pending Payments</span>
                      <div className="w-5.5 h-5.5 rounded bg-white/70 flex items-center justify-center text-amber-600 shrink-0">
                        <Clock className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <strong className="text-[15px] font-black font-display text-[#061C4A] block leading-none">{currentMonthData.pendingPayments}</strong>
                      <span className="text-[9px] font-extrabold text-amber-700 mt-1 block leading-none">
                        {currentMonthData.pendingPaymentsSub}
                      </span>
                    </div>
                  </div>

                  {/* Completed Payments */}
                  <div className="bg-sky-50/70 border border-sky-500/10 p-3 rounded-xl shadow-3xs flex flex-col justify-between h-[92px] text-left">
                    <div className="flex justify-between items-start">
                      <span className="text-[9.5px] text-slate-500 font-extrabold uppercase tracking-wider leading-none">Completed Payments</span>
                      <div className="w-5.5 h-5.5 rounded bg-white/70 flex items-center justify-center text-sky-600 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                    <div className="mt-auto">
                      <strong className="text-[15px] font-black font-display text-[#061C4A] block leading-none">{currentMonthData.completedPayments}</strong>
                      <span className="text-[9px] font-extrabold text-sky-700 mt-1 block leading-none">
                        {currentMonthData.completedPaymentsSub}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Revenue Trend Chart card */}
                <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-2xs text-left relative overflow-hidden">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-display font-medium text-[#061C4A] text-sm leading-tight">Revenue Trend</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                        Monthly coaching revenue generated from active client packages.
                      </p>
                    </div>
                  </div>

                  {/* Detailed Graph View with Interactive tooltip */}
                  <div className="relative h-44 bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-105 border-slate-100 flex flex-col justify-between overflow-hidden">
                    
                    {/* Hover detail area inside chart */}
                    <div className="flex justify-between items-center text-left shrink-0 z-10">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-widest text-[#061C4A]">
                        {hoveredTrendIndex !== null 
                          ? "Month: " + [ 'January', 'February', 'March', 'April', 'May', 'June' ][hoveredTrendIndex]
                          : ""
                        }
                      </span>
                      <span className="text-[10px] font-bold text-[#5B4CFB] bg-white border border-[#5B4CFB]/15 px-2 py-0.5 rounded-md whitespace-nowrap">
                        {hoveredTrendIndex !== null 
                          ? [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ][hoveredTrendIndex] + ": RM " + [520, 680, 760, 820, 910, 990][hoveredTrendIndex]
                          : selectedMonth.slice(0, 3) + ": " + currentMonthData.monthlyRevenue
                        }
                      </span>
                    </div>

                    {/* SVG GRAPH */}
                    <div className="w-full h-24 relative mt-2">
                      <svg viewBox="0 0 430 110" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="purple-area-gradient-redesign" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#5B4CFB" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#5B4CFB" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Chart Grid Lines */}
                        <line x1="35" y1="15" x2="385" y2="15" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="35" y1="50" x2="385" y2="50" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="35" y1="85" x2="385" y2="85" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="35" y1="100" x2="385" y2="100" stroke="#CBD5E1" strokeWidth="1.5" />

                        {/* Area Fill Below Bezier Curve */}
                        <path 
                          d={activeFillPath} 
                          fill="url(#purple-area-gradient-redesign)" 
                        />

                        {/* Bezier Line Stroke (Active Part) */}
                        <path 
                          d={activePath} 
                          fill="none" 
                          stroke="#5B4CFB" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                        />

                        {/* Future Path (Dashed) */}
                        {futurePath && (
                          <path 
                            d={futurePath} 
                            fill="none" 
                            stroke="#5B4CFB" 
                            strokeWidth="2" 
                            strokeLinecap="round"
                            strokeDasharray="4,3"
                            className="opacity-40"
                          />
                        )}

                        {/* Interactive vertical hover indicator line */}
                        {hoveredTrendIndex !== null && (
                          <line 
                            x1={[35, 105, 175, 245, 315, 385][hoveredTrendIndex]} 
                            y1="4" 
                            x2={[35, 105, 175, 245, 315, 385][hoveredTrendIndex]} 
                            y2="100" 
                            stroke="#5B4CFB" 
                            strokeWidth="1.5" 
                            strokeDasharray="4,2" 
                          />
                        )}

                        {/* Plot Circles with Hover Anchors */}
                        {[
                          { month: 'Jan', val: 520, cx: 35, cy: 90 },
                          { month: 'Feb', val: 680, cx: 105, cy: 55 },
                          { month: 'Mar', val: 760, cx: 175, cy: 37 },
                          { month: 'Apr', val: 820, cx: 245, cy: 23 },
                          { month: 'May', val: 910, cx: 315, cy: 11 },
                          { month: 'Jun', val: 990, cx: 385, cy: 4 }
                        ].map((pt, index) => {
                          const isSelected = selectedMonthIndex === index;
                          const isHovered = hoveredTrendIndex === index;
                          const isFuture = index > selectedMonthIndex;
                          return (
                            <g key={pt.month}>
                              {/* Giant invisible hover capture hit target */}
                              <circle 
                                cx={pt.cx} 
                                cy={pt.cy} 
                                r="22" 
                                fill="transparent" 
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredTrendIndex(index)}
                                onMouseLeave={() => setHoveredTrendIndex(null)}
                              />
                              {/* Aesthetic glow ring on hover or selection */}
                              {(isHovered || isSelected) && (
                                <circle 
                                  cx={pt.cx} 
                                  cy={pt.cy} 
                                  r="8" 
                                  fill="#5B4CFB" 
                                  fillOpacity="0.25" 
                                  className="pointer-events-none"
                                />
                              )}
                              {/* Beautiful centered circle dot */}
                              <circle 
                                cx={pt.cx} 
                                cy={pt.cy} 
                                r={(isHovered || isSelected) ? "4" : "3"} 
                                fill={isFuture ? "#F1F5F9" : "white"} 
                                stroke={isHovered ? "#061C4A" : isSelected ? "#061C4A" : isFuture ? "#CBD5E1" : "#5B4CFB"} 
                                strokeWidth="2.5" 
                                className="pointer-events-none transition-all duration-75"
                              />
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* X-Axis labels */}
                    <div className="flex justify-between items-center px-4 shrink-0 font-sans mt-0.5 pointer-events-none">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((monthName, idx) => (
                        <span 
                          key={monthName} 
                          className={`text-[9px] font-bold text-center w-8 ${
                            hoveredTrendIndex === idx ? 'text-[#5B4CFB] font-extrabold' : 'text-slate-450'
                          }`}
                        >
                          {monthName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Quick Access Navigation Cards Shortcuts */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-450 font-sans block text-left">
                    Quick Navigation Shortcuts
                  </h4>

                  {/* Card A: Recent Invoices */}
                  <div 
                    onClick={() => setPaymentScreen('invoices')}
                    className="bg-[#061C4A] hover:bg-[#0c2c69] text-white p-5 rounded-[22px] shadow-sm flex items-center justify-between cursor-pointer transition-all duration-155 transform active:scale-99"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-[16px] bg-white/10 flex items-center justify-center text-teal-350 border border-white/5 font-bold">
                        <FileText className="w-6 h-6 text-teal-400" />
                      </div>
                      <div>
                        <h4 className="font-display font-medium text-white text-sm">Recent Invoices</h4>
                        <p className="text-[11px] text-slate-300 leading-none mt-1">View and manage latest invoices</p>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition text-white">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card B: Payment History */}
                  <div 
                    onClick={() => setPaymentScreen('history')}
                    className="bg-white hover:bg-slate-50 border border-slate-200/80 p-5 rounded-[22px] shadow-sm flex items-center justify-between cursor-pointer transition-all duration-155 transform active:scale-99"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-[16px] bg-[#EEF1FF] flex items-center justify-center text-[#5B4CFB] border border-[#5B4CFB]/5">
                        <CreditCard className="w-6 h-6 text-[#5B4CFB]" />
                      </div>
                      <div>
                        <h4 className="font-display font-medium text-[#061C4A] text-sm">Payment History</h4>
                        <p className="text-[11px] text-slate-500 leading-none mt-1">View all received payments</p>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 5. CoachAI Analysis Section */}
                <div className="bg-gradient-to-r from-[#061A4D] via-[#092B6E] to-[#0A3D8F] text-white border border-slate-900/40 rounded-[24px] p-5 shadow-2xs text-left relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mb-6 pointer-events-none"></div>
                  <div className="absolute left-1/3 top-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mt-16 pointer-events-none font-sans"></div>

                  {/* Mascot Header */}
                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="relative shrink-0">
                      {/* Animated Mascot bubble avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shadow-md relative border border-white/10">
                        <span className="text-xl">🤖</span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#061A4D] animate-pulse"></span>
                      </div>
                    </div>

                    <div className="text-left">
                      {/* AI Mascot Branding */}
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="font-display font-medium text-sm text-white">CoachAI Analysis</span>
                        <span className="text-[8px] bg-[#18D4C5] text-slate-950 font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider scale-90">LIVE</span>
                      </div>
                      <p className="text-[10px] text-indigo-150 uppercase tracking-wide mt-1.5 font-bold">
                        AI insights to help grow your coaching business.
                      </p>
                    </div>
                  </div>

                  {/* KPI slots available */}
                  <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-[18px] p-4.5 mb-4 flex items-center justify-between shadow-3xs text-left relative z-10">
                    <div>
                      <span className="text-[9px] text-indigo-200 block uppercase font-extrabold tracking-wider">Free Slots This Week</span>
                      <strong className="text-white text-base font-black font-display leading-none block mt-1">4 Slots Available</strong>
                      <p className="text-[11px] text-indigo-100 mt-2 leading-tight italic">
                        "You still have 4 coaching slots available this week."
                      </p>
                    </div>
                    {/* Growth score circle */}
                    <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex flex-col items-center justify-center text-[10px] font-black font-mono shrink-0 shadow-sm border border-emerald-400">
                      <span className="leading-none">4/10</span>
                      <span className="text-[6px] tracking-tight font-sans mt-0.5 uppercase opacity-90">SLOTS</span>
                    </div>
                  </div>

                  {/* Smart Growth suggestions */}
                  <div className="space-y-2 font-sans relative z-10">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-200 font-sans block text-left mb-1">
                      💡 Smart Growth Tips
                    </span>
                    
                    {[
                      { icon: '✨', text: 'Share client transformations regularly' },
                      { icon: '🟢', text: 'Offer free consultation to new leads' },
                      { icon: '📱', text: 'Post 3–4 times weekly on social media' },
                      { icon: '🎯', text: 'Follow up with inactive clients' }
                    ].map((tip, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[14px] p-2.5 text-[11px] text-white font-medium shadow-3xs transition"
                      >
                        <span className="text-sm shrink-0 leading-none">{tip.icon}</span>
                        <span className="leading-tight">{tip.text}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </>
            )}

            {/* 6. Invoice Screen View */}
            {paymentScreen === 'invoices' && (
              <div className="space-y-4">
                {/* Screen Header Toolbar */}
                <div className="flex items-center justify-start pb-1 border-b border-slate-100 bg-transparent">
                  <button 
                    onClick={() => setPaymentScreen('main')}
                    className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-205 border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold uppercase rounded-md tracking-wider transition cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft className="w-3 h-3 text-slate-500" />
                    <span>Back to Payments</span>
                  </button>
                </div>

                <div className="text-left">
                  <h3 className="text-xl font-black font-display text-[#061C4A]">Recent Invoices</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Invoices generated according to client packages.
                  </p>
                </div>

                {/* Invoice cards list */}
                <div className="space-y-4">
                  {[
                    {
                      client: 'Ahmad Bin Ibrahim',
                      package: '8 Classes Per Month',
                      invoiceNo: 'INV-0626-001',
                      amount: 600,
                      status: 'PAID',
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
                    },
                    {
                      client: 'Mei Ling Tan',
                      package: '4 Classes Per Month',
                      invoiceNo: 'INV-0626-002',
                      amount: 310,
                      status: 'PAID',
                      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
                    },
                    {
                      client: 'Muhammad Faizul',
                      package: 'Single Session',
                      invoiceNo: 'INV-0626-003',
                      amount: 80,
                      status: 'PENDING',
                      due: '25 June 2026',
                      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
                    }
                  ].map((invoice) => (
                    <div 
                      key={invoice.invoiceNo}
                      className="bg-white border border-slate-200 rounded-[20px] p-4.5 shadow-3xs relative overflow-hidden text-left"
                    >
                      {/* Left vertical ribbon color mapping status */}
                      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${invoice.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

                      <div className="pl-2.5">
                        {/* Row 1: Profile and Title */}
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img 
                              src={invoice.avatar} 
                              alt={invoice.client} 
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border border-slate-105 object-cover shrink-0"
                            />
                            <div className="truncate text-left">
                              <h4 className="font-display font-medium text-sm text-[#061C4A] truncate leading-tight">
                                {invoice.client}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 leading-none font-mono">
                                {invoice.invoiceNo}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold leading-none">Total Rate</span>
                            <span className="text-sm font-black text-[#061C4A] block mt-1 leading-none">
                              RM {invoice.amount}
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-100 my-3" />

                        {/* Row 2: Service & Status */}
                        <div className="flex justify-between items-center text-xs text-left">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider leading-none">Applied Package</span>
                            <span className="font-bold text-slate-700 block mt-1 font-sans leading-none">
                              {invoice.package}
                            </span>
                          </div>

                          <div className="text-right">
                            {invoice.status === 'PAID' ? (
                              <span className="bg-[#DFF7F2] text-[#001f3f] border border-teal-250 text-[10px] uppercase font-bold px-3 py-1 rounded-full inline-block tracking-wider">
                                PAID
                              </span>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <span className="bg-amber-50 text-amber-800 border border-amber-200/50 text-[10px] uppercase font-bold px-3 py-1 rounded-full inline-block tracking-wider">
                                  PENDING
                                </span>
                                {invoice.due && (
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none block">
                                    Due: {invoice.due}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Payment History Screen View */}
            {paymentScreen === 'history' && (
              <div className="space-y-4">
                {/* Screen Header Toolbar */}
                <div className="flex items-center justify-start pb-1 border-b border-slate-100 bg-transparent">
                  <button 
                    onClick={() => setPaymentScreen('main')}
                    className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-205 border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold uppercase rounded-md tracking-wider transition cursor-pointer whitespace-nowrap"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>Back to Payments</span>
                  </button>
                </div>

                <div className="text-left">
                  <h3 className="text-xl font-black font-display text-[#061C4A]">Payment History</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Show completed and settled payments.
                  </p>
                </div>

                {/* Receipt-style Cards list */}
                <div className="space-y-4">
                  {[
                    {
                      client: 'Ahmad Bin Ibrahim',
                      package: '8 Classes',
                      amount: 'RM 600',
                      date: '15 Jun 2026',
                      status: 'PAID',
                      payId: 'TXN-O9445218'
                    },
                    {
                      client: 'Mei Ling Tan',
                      package: '4 Classes',
                      amount: 'RM 310',
                      date: '14 Jun 2026',
                      status: 'PAID',
                      payId: 'TXN-O9134125'
                    },
                    {
                      client: 'Muhammad Faizul',
                      package: 'Single Session',
                      amount: 'RM 80',
                      date: '20 May 2026',
                      status: 'PAID',
                      payId: 'TXN-O9023405'
                    }
                  ].map((pay) => (
                    <div 
                      key={pay.payId}
                      className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-3xs relative overflow-hidden text-left"
                    >
                      {/* Top vintage continuous dot pattern simulating physical tear receipt edge */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-repeating-dots flex justify-around select-none">
                        {Array.from({ length: 32 }).map((_, i) => (
                          <div key={i} className="w-1.5 h-1 px bg-slate-200 rounded-full" />
                        ))}
                      </div>

                      <div className="pt-2">
                        {/* Payment Identification stamp header */}
                        <div className="flex justify-between items-center text-xs mb-3.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wide uppercase leading-none">
                            {pay.payId}
                          </span>
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded leading-none">
                            ✓ {pay.status}
                          </span>
                        </div>

                        {/* Details columns */}
                        <div className="space-y-3 font-sans">
                          {/* Client row */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">Client Recipient</span>
                            <strong className="text-[#061C4A] font-bold">{pay.client}</strong>
                          </div>

                          {/* Package row */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">Coaching Package</span>
                            <span className="text-slate-700 font-bold">{pay.package}</span>
                          </div>

                          {/* Date row */}
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold">Payment Date</span>
                            <span className="text-slate-600 font-bold">{pay.date}</span>
                          </div>

                          {/* Final bold dot pattern divider line */}
                          <div className="border-t border-dashed border-slate-200 my-4" />

                          {/* Amount total line */}
                          <div className="flex justify-between items-center bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[#061C4A] font-bold text-xs">Settled Amount</span>
                            <span className="text-base font-black text-[#5B4CFB] font-display">
                              {pay.amount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </motion.div>
          );
        })()}
{/* 3.1 COMPREHENSIVE COACHING SESSION HISTORY REGISTER */}
        {activeTab === 'session-history' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 animate-fade-in text-left font-sans"
          >
            <PageHeader 
              title="Schedule" 
              subtitle="Manage your coaching calendar" 
              className="-mx-4 sm:-mx-6 lg:-mx-8"
            />

            {/* Date selector using week-strip styled layout */}
            <div className="bg-white border border-slate-200/60 rounded-[24px] p-4.5 shadow-2xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                  Select Calendar Day
                </span>
                <span className="text-[10px] font-black text-indigo-650 font-mono">June 2026</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 px-0.5">
                {[
                  { day: 'Mon', date: 15, dateStr: '2026-06-15' },
                  { day: 'Tue', date: 16, dateStr: '2026-06-16' },
                  { day: 'Wed', date: 17, dateStr: '2026-06-17' },
                  { day: 'Thu', date: 18, dateStr: '2026-06-18' },
                  { day: 'Fri', date: 19, dateStr: '2026-06-19' },
                  { day: 'Sat', date: 20, dateStr: '2026-06-20', isToday: true },
                  { day: 'Sun', date: 21, dateStr: '2026-06-21', isDisabled: true }
                ].map((d) => {
                  const isSelected = selectedWeekDay === d.dateStr;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      disabled={d.isDisabled}
                      onClick={() => !d.isDisabled && setSelectedWeekDay(d.dateStr)}
                      className={`flex flex-col items-center py-2.5 rounded-xl cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-[#001F3F] text-white font-extrabold shadow-sm scale-[1.03]' 
                          : d.isToday
                            ? 'bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold'
                            : d.isDisabled
                              ? 'opacity-40 bg-slate-50 border-dashed text-slate-350 cursor-not-allowed'
                              : 'hover:bg-slate-50 text-slate-500 font-medium'
                      }`}
                    >
                      <span className="text-[8px] font-bold uppercase tracking-wider leading-none mb-1">{d.day}</span>
                      <span className="text-xs font-bold font-mono leading-none">{d.date}</span>
                      {d.isToday && !isSelected && <span className="w-1 h-1 rounded-full bg-indigo-505 mt-1"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Today’s Sessions */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Today's Sessions ({selectedWeekDay === '2026-06-20' ? 'Jun 20 Today' : selectedWeekDay})
              </h4>
              <div className="grid grid-cols-1 gap-3.5">
                {(() => {
                  const activeBks = getCleanActiveBookings(bookings).filter(s => s.date === selectedWeekDay);
                  if (activeBks.length === 0) {
                    return (
                      <div className="bg-white p-7 text-center rounded-2xl border border-dashed border-slate-200 py-10">
                        <span className="text-xl block mb-1.5">📅</span>
                        <p className="font-bold text-slate-700 text-xs">No Scheduled Sessions for This Day</p>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">Trainer schedule is completely open. Add new slots from the Dashboard as needed!</p>
                      </div>
                    );
                  }
                  return activeBks.map((s) => {
                    const time = s.timeSlot || '10:00 AM';
                    const traineeName = s.traineeName || 'Client';
                    const matchedTrainee = trainees.find(t => t.id === s.traineeId || t.name === s.traineeName);
                    const photo = resolveTraineeAvatar(traineeName, matchedTrainee?.avatarUrl);

                    return (
                      <div 
                        key={s.id}
                        onClick={() => {
                          setSelectedSessionForAction(s);
                          setRescheduleNewDate(s.date || '2026-06-20');
                          setRescheduleNewTimeSlot(time);
                          setShowSessionActionSheet(true);
                        }}
                        className="bg-white border border-slate-200/70 hover:border-indigo-400 rounded-xl overflow-hidden shadow-3xs hover:shadow-2xs transition duration-150 cursor-pointer text-left flex flex-col font-sans"
                      >
                        <div className="p-2.5 flex items-center gap-2.5">
                          {/* Time badge: compact 12px text */}
                          <div className="shrink-0 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg text-center min-w-[50px] flex flex-col justify-center">
                            <span className="text-xs font-black text-indigo-900 font-mono block leading-none">{time.split(' ')[0]}</span>
                            <span className="text-[9px] font-black text-indigo-700 tracking-wider font-mono block mt-0.5 uppercase leading-none">{time.split(' ')[1]}</span>
                          </div>

                          <div className="flex-1 min-w-0 flex items-center gap-2.5 text-sans">
                            {/* Reduced avatar size to 36px */}
                            <img 
                              src={photo} 
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0 bg-slate-50" 
                              alt={traineeName} 
                            />
                            <div className="min-w-0 flex-1">
                              {/* First line: client name (one line) and status tag */}
                              <div className="flex items-center justify-between gap-1.5">
                                <h4 className="text-xs font-black text-slate-950 leading-tight truncate">{traineeName}</h4>
                                <span className={`text-[7px] font-bold uppercase tracking-wider px-1 py-0.2 rounded leading-none shrink-0 ${
                                  s.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  s.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                  'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                }`}>
                                  {s.status}
                                </span>
                              </div>
                              
                              {/* Second line: location */}
                              <p className="text-[10px] text-slate-500 mt-1 font-medium leading-none truncate">
                                📍 {s.location || 'SS15 Studio • Selangor'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50/40 py-1 px-2.5 border-t border-slate-100 flex justify-between items-center text-[8.5px] text-slate-400">
                          <span className="truncate max-w-[180px]">📅 {s.date} • <span className="font-semibold text-slate-500">{s.title || 'Personal Training'}</span></span>
                          <span className="font-extrabold text-indigo-650 flex items-center gap-0.5 hover:underline text-[8.5px] uppercase tracking-wider font-sans shrink-0">
                            <span>Adjust</span>
                            <span>➡</span>
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="space-y-3.5 pt-2">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Upcoming Sessions (Next Days)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
                {(() => {
                  const upcomingBks = getCleanActiveBookings(bookings).filter(s => s.date > selectedWeekDay);
                  if (upcomingBks.length === 0) {
                    return (
                      <div className="bg-slate-50/50 p-6 text-center rounded-2xl border border-dashed border-slate-200/80 py-8 col-span-full">
                        <p className="font-extrabold text-[#001F3F]/40 text-[10px] uppercase tracking-wider font-sans">No Scheduled Upcoming Sessions After {selectedWeekDay}</p>
                      </div>
                    );
                  }
                  return upcomingBks.map((s) => {
                    const time = s.timeSlot || '10:00 AM';
                    const traineeName = s.traineeName || 'Client';
                    const matchedTrainee = trainees.find(t => t.id === s.traineeId || t.name === s.traineeName);
                    const photo = resolveTraineeAvatar(traineeName, matchedTrainee?.avatarUrl);

                    return (
                      <div 
                        key={s.id}
                        onClick={() => {
                          setSelectedSessionForAction(s);
                          setRescheduleNewDate(s.date || '2026-06-20');
                          setRescheduleNewTimeSlot(time);
                          setShowSessionActionSheet(true);
                        }}
                        className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl overflow-hidden shadow-2xs hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition duration-150 cursor-pointer text-left flex flex-col font-sans"
                      >
                        <div className="p-3.5 flex items-center gap-3.5">
                          <img 
                            src={photo} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0 bg-slate-50" 
                            alt={traineeName} 
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-black text-indigo-750 font-mono block shrink-0 bg-indigo-50/50 border border-indigo-100/50 px-1.5 py-0.5 rounded-md w-fit leading-none mb-1">
                              {s.date} • {time}
                            </span>
                            <h4 className="text-xs font-black text-slate-800 truncate leading-tight">{s.title || 'Personal Training Slot'}</h4>
                            <p className="text-[10px] text-slate-400 mt-1 truncate font-sans">🙎 {traineeName} • 📍 {s.location || 'SS15 Studio • Selangor'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Change Feedback Text Dialog Modal */}
            {feedbackSessionId && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-[calc(100%-32px)] max-w-[360px] mx-auto p-5 shadow-2xl relative border border-slate-100 text-left text-slate-850 overflow-y-auto max-h-[85vh] box-border break-words">
                  <h3 className="font-display font-medium text-slate-900 text-base mb-1.5 flex items-center gap-1">
                    ✏ Physical Practice Review Notes
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 font-sans">
                    Provide specialized biometric comments or review logs for this class.
                  </p>

                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Enter stance accuracy, heart rate intervals comments, or weight execution feedback..."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 p-3 mb-4 focus:outline-teal-500 font-sans font-medium"
                  />

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 bg-white">
                    <button
                      onClick={() => setFeedbackSessionId(null)}
                      className="px-4 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer font-bold font-sans"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSessionFeedback}
                      className="bg-[#001F3F] text-[#4FFBCC] text-xs font-black px-5 py-2 rounded-xl cursor-pointer shadow-md font-sans"
                    >
                      Save Audit Review
                    </button>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}

      </div>

      {/* 4. FLOATING TRIGGER BUTTON FOOTER FOR COACH */}
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3 text-left font-sans">
        <button
          onClick={() => {
            setChatOpen(!chatOpen);
            if (!chatOpen && activeChatTrainee?.userId) {
              fetchChatMessages(activeChatTrainee.userId);
            }
          }}
          className="flex items-center justify-center rounded-full p-4 shadow-2xl transition duration-150 scale-110 active:scale-95 cursor-pointer bg-[#001F3F] hover:bg-slate-900 border border-teal-500/20 text-[#4FFBCC]"
          title="Direct Client Messaging Workspace"
          id="btn-coach-floating-chat"
        >
          {chatOpen ? <X className="w-5 h-5 text-teal-400" /> : <MessageSquare className="w-5 h-5 text-teal-400" />}
        </button>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
              className="absolute inset-0 z-[110] bg-slate-900/40 backdrop-blur-xs cursor-pointer"
            />

            {/* Bottom Sheet Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="absolute bottom-0 left-0 right-0 z-[120] bg-white rounded-t-[20px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] flex flex-col h-[75%] max-h-[75%] border-t border-slate-100 overflow-hidden box-border text-slate-800"
            >
              {/* Native Drag handles */}
              <div 
                className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1.5 shrink-0 cursor-pointer"
                onClick={() => setChatOpen(false)}
              />

              {/* Flex wrapper for split column layout */}
              <div className="flex-1 flex overflow-hidden w-full h-full relative text-left">
              {/* Left Sidebar — Trainee Selection Panel (35% width) */}
              <div className="w-14 sm:w-52 md:w-56 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden text-left">
                <div className="p-2 sm:p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                  <div className="hidden sm:block">
                    <h3 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Select Trainee</h3>
                    <p className="text-[10px] text-slate-400">Coached Client Channels</p>
                  </div>
                  <div className="block sm:hidden text-center w-full">
                    <span className="text-sm select-none">👥</span>
                  </div>
                  {(() => {
                    const defaultTrainees = [
                      {
                        id: 'te_ahmad',
                        userId: 'u_ahmad',
                        name: 'Ahmad Bin Ibrahim',
                        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
                        goals: 'Weight Loss & Cardio',
                        streakCount: 5,
                        status: 'online'
                      },
                      {
                        id: 'te_ling',
                        userId: 'u_ling',
                        name: 'Mei Ling Tan',
                        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                        goals: 'Post-Partum Recovery',
                        streakCount: 8,
                        status: 'offline'
                      },
                      {
                        id: 'te_faizul',
                        userId: 'u_faizul',
                        name: 'Muhammad Faizul',
                        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
                        goals: 'Athletic Strength & Power',
                        streakCount: 12,
                        status: 'online'
                      }
                    ];

                    const displayedTraineesMap = new Map<string, any>();
                    defaultTrainees.forEach(dt => displayedTraineesMap.set(dt.userId, dt));
                    trainees.forEach(t => {
                      if (t.userId) {
                        const existing = displayedTraineesMap.get(t.userId);
                        displayedTraineesMap.set(t.userId, {
                          id: t.id,
                          userId: t.userId,
                          name: (t.name === 'Ahmad bin Ibrahim' || t.name === 'Ahmad Ibrahim') ? 'Ahmad Bin Ibrahim' : t.name,
                          avatarUrl: t.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
                          goals: t.goals || existing?.goals || 'General Fitness',
                          streakCount: t.streakCount ?? existing?.streakCount ?? 0,
                          status: existing?.status || 'offline'
                        });
                      }
                    });
                    const combinedTrainees = Array.from(displayedTraineesMap.values());

                    return (
                      <span className="hidden sm:inline-block text-[10px] bg-slate-200 text-slate-705 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                        {combinedTrainees.length} Active
                      </span>
                    );
                  })()}
                </div>

                {/* Trainee search query box */}
                <div className="hidden sm:block p-3 border-b border-slate-200 bg-white shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search managed clients..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-2xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-300"
                    />
                  </div>
                </div>

                {/* List of trainees */}
                <div className="flex-1 overflow-y-auto p-1.5 sm:p-2 space-y-1.5 scrollbar-thin">
                  {(() => {
                    const defaultTrainees = [
                      {
                        id: 'te_ahmad',
                        userId: 'u_ahmad',
                        name: 'Ahmad Bin Ibrahim',
                        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
                        goals: 'Weight Loss & Cardio',
                        streakCount: 5,
                        status: 'online'
                      },
                      {
                        id: 'te_ling',
                        userId: 'u_ling',
                        name: 'Mei Ling Tan',
                        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                        goals: 'Post-Partum Recovery',
                        streakCount: 8,
                        status: 'offline'
                      },
                      {
                        id: 'te_faizul',
                        userId: 'u_faizul',
                        name: 'Muhammad Faizul',
                        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
                        goals: 'Athletic Strength & Power',
                        streakCount: 12,
                        status: 'online'
                      }
                    ];

                    const displayedTraineesMap = new Map<string, any>();
                    defaultTrainees.forEach(dt => displayedTraineesMap.set(dt.userId, dt));
                    trainees.forEach(t => {
                      if (t.userId) {
                        const existing = displayedTraineesMap.get(t.userId);
                        displayedTraineesMap.set(t.userId, {
                          id: t.id,
                          userId: t.userId,
                          name: (t.name === 'Ahmad bin Ibrahim' || t.name === 'Ahmad Ibrahim') ? 'Ahmad Bin Ibrahim' : t.name,
                          avatarUrl: t.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
                          goals: t.goals || existing?.goals || 'General Fitness',
                          streakCount: t.streakCount ?? existing?.streakCount ?? 0,
                          status: existing?.status || 'offline'
                        });
                      }
                    });

                    const filtered = Array.from(displayedTraineesMap.values()).filter(t => 
                      !chatSearchQuery.trim() || t.name.toLowerCase().includes(chatSearchQuery.toLowerCase())
                    );

                    if (filtered.length === 0) {
                      return <p className="text-[11px] text-slate-400 text-center py-8">No clients match filter.</p>;
                    }

                    return filtered.map((t: any) => {
                      const isSelected = activeChatTrainee?.userId === t.userId;
                      const unread = unreadCounts[t.userId] || 0;

                      // Previews of last messages
                      let lastMsg = "Thanks coach Sarah! I logged my breakfast just now.";
                      if (t.id === 'te_ling') lastMsg = "Ready to target pelvis floor alignment recovery.";
                      if (t.id === 'te_jason') lastMsg = "Deadlift target hit at 150kg today! Form felt stable.";

                      return (
                        <button
                          key={t.userId}
                          onClick={() => {
                            setActiveChatTrainee(t);
                            // Reset unread map
                            setUnreadCounts(prev => ({ ...prev, [t.userId]: 0 }));
                            fetchChatMessages(t.userId);
                          }}
                          className={`w-full text-left p-1.5 sm:p-3 rounded-xl transition duration-150 relative border flex items-center justify-center sm:justify-start gap-3 cursor-pointer select-none ${
                            isSelected
                              ? 'bg-slate-900 border-slate-900 text-white shadow-md font-semibold'
                              : 'bg-white border-slate-100 hover:bg-slate-105 hover:border-slate-200 text-slate-700 shadow-3xs'
                          }`}
                        >
                          {/* Avatar with indicator */}
                          <div className="relative shrink-0">
                            <img
                              referrerPolicy="no-referrer"
                              src={t.avatarUrl}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';
                              }}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border shrink-0 ${isSelected ? 'border-slate-700' : 'border-slate-200'}`}
                              alt={t.name}
                            />
                            {/* Live Online Badge */}
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 ${isSelected ? 'border-slate-900' : 'border-white'} ${
                              t.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`} />
                          </div>

                          {/* Middle textual section */}
                          <div className="hidden sm:block flex-1 min-w-0 pr-1.5">
                            <div className="flex justify-between items-baseline gap-1">
                              <h4 className={`font-extrabold text-xs truncate leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {t.name}
                              </h4>
                              <span className={`text-[8.5px] uppercase font-black px-1.5 rounded ${isSelected ? 'bg-teal-400 text-slate-950 font-black' : 'bg-slate-100 text-slate-650'}`}>
                                Client
                              </span>
                            </div>
                            <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-teal-300' : 'text-teal-605 font-bold text-teal-600'}`}>
                              {t.goals}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                              <span className={`font-bold flex items-center gap-0.5 ${isSelected ? 'text-amber-400' : 'text-amber-600'}`}>
                                <Flame className={`w-3 h-3 ${isSelected ? 'fill-amber-400 text-amber-400' : 'fill-amber-600 text-amber-600'}`} /> {t.streakCount} Days
                              </span>
                              <span className="text-slate-300 select-none">•</span>
                              <span className={`truncate select-none block max-w-[90px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                                {lastMsg}
                              </span>
                            </div>
                          </div>

                          {/* Unread dot notifications */}
                          {unread > 0 && (
                            <span className="absolute right-1 top-1 sm:right-3 sm:top-3 bg-rose-500 text-white font-black text-[9px] min-w-4 h-4 rounded-full flex items-center justify-center px-1 animate-bounce">
                              {unread}
                            </span>
                          )}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Chat Messenger (65% width) */}
              <div className="flex-1 md:w-[65%] bg-white flex flex-col min-h-0 overflow-hidden text-slate-800">
                {/* Trainer Chat Header */}
                <div className="py-2.5 px-3 bg-slate-900 text-white border-b border-slate-200 flex justify-between items-center shrink-0">
                  <div className="text-left flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-xs shrink-0">
                      👥
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="font-display font-black text-white text-xs sm:text-sm leading-none">
                          {activeChatTrainee?.name || 'Ahmad Ibrahim'} (Client)
                        </h4>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1 self-center">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" /> Active
                        </span>
                      </div>
                      <p className="text-[8px] sm:text-[9px] text-teal-400 font-bold tracking-wider uppercase mt-0.5">
                        ACTIVE CLIENT THREAD
                      </p>
                    </div>
                  </div>

                  {/* Header Action Tools */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        fetchChatMessages(activeChatTrainee?.userId);
                        triggerToast('Instantly refreshed client synchronized records timeline!');
                      }}
                      title="Sync history"
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                    <button
                      onClick={() => setChatOpen(false)}
                      title="Close message workspace"
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  </div>
                </div>

                {/* Context Selector zone above Message Inputs */}
                <div className="bg-slate-50 border-b border-slate-200 p-1.5 sm:p-2.5 px-3 sm:px-4 flex flex-wrap items-center gap-1.5 text-[9px] sm:text-xs text-left shrink-0 select-none">
                  <span className="text-slate-400 font-bold block text-[8px] sm:text-2xs uppercase">Tag Context:</span>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Workout Log'); setReplyTagTitle('Active Routine'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 shrink-0 cursor-pointer text-[9px] sm:text-[11px] shadow-3xs"
                  >
                    🏋️ Workout Log
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Nutrition Tracker'); setReplyTagTitle('Diet Logs'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 shrink-0 cursor-pointer text-[9px] sm:text-[11px] shadow-3xs"
                  >
                    🍱 Nutrition Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Progress Photo'); setReplyTagTitle('Week 8 Comparison'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 shrink-0 cursor-pointer text-[9px] sm:text-[11px] shadow-3xs"
                  >
                    📸 Progress Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Body Metrics Update'); setReplyTagTitle('Scale Weight'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 shrink-0 cursor-pointer text-[9px] sm:text-[11px] shadow-3xs"
                  >
                    📊 Metrics Update
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Payment Status'); setReplyTagTitle('Monthly Subscription'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 shrink-0 cursor-pointer text-[9px] sm:text-[11px] shadow-3xs"
                  >
                    💳 Payment Status
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Upcoming Session'); setReplyTagTitle('Private Workout'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 font-semibold text-slate-700 shrink-0 cursor-pointer text-[9px] sm:text-[11px] shadow-3xs"
                  >
                    📅 Session Booking
                  </button>
                </div>

                {/* Message list bubble container */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50/70 scrollbar-thin">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-10 sm:py-20 text-slate-400 text-xs space-y-1.5 flex flex-col items-center justify-center">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto opacity-75" />
                      <p className="font-bold text-slate-500 text-xs">No matching messages found in thread.</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">Send motivational tips or comment on progress below.</p>
                    </div>
                  ) : (
                    chatMessages.map(m => {
                      const isCoach = m.senderId === 'u_sarah';
                      
                      // Identify contextual tag styles
                      let contextIcon = "📌";
                      if (m.replyToType === 'Workout Log') contextIcon = "🏋️";
                      else if (m.replyToType === 'Nutrition Tracker') contextIcon = "🍱";
                      else if (m.replyToType === 'Progress Photo') contextIcon = "📸";
                      else if (m.replyToType === 'Body Metrics Update') contextIcon = "📊";
                      else if (m.replyToType === 'Payment Status') contextIcon = "💳";
                      else if (m.replyToType === 'Upcoming Session') contextIcon = "📅";

                      return (
                        <div key={m.id} className={`flex ${isCoach ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl p-3.5 shadow-sm text-xs relative text-left ${
                            isCoach 
                              ? 'bg-slate-900 text-slate-50 rounded-tr-none' 
                              : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none'
                          }`}>
                            
                            {/* Replying Context Tag Above Message Bubble */}
                            {m.replyToType && (
                              <div className={`mb-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                isCoach 
                                  ? 'bg-white/10 text-teal-305 text-teal-300' 
                                  : 'bg-teal-50 border border-teal-100/50 text-teal-800 text-teal-850'
                              }`}>
                                <span>{contextIcon}</span>
                                <span>Replying to {m.replyToType} {m.replyToTitle ? `[${m.replyToTitle}]` : ''}</span>
                              </div>
                            )}

                            <p className="leading-relaxed font-sans text-xs whitespace-pre-wrap">{m.message}</p>
                            
                            <div className="flex justify-end items-center gap-1.5 mt-1.5 opacity-60 text-[9px] select-none">
                              <span>
                                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isCoach && <span className="text-[8px] text-teal-400 font-extrabold font-mono">✓ Sent</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Smart Trainer Actions Toolbar (Prefills message + sets context tag) */}
                <div className="bg-slate-50 border-t border-slate-150 p-2 sm:p-3 flex flex-col text-left shrink-0 select-none">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-extrabold text-slate-800 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600 font-bold animate-pulse" /> Smart Coach Actions (1-Click Presets)
                  </span>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] sm:text-[11px] font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Upcoming Session');
                        setReplyTagTitle('Personalized Motivation');
                        setChatInputText("🔥 Phenomenal performance logged this week! You are unlocking an entirely new standard. Let's keep this momentum unbroken!");
                      }}
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 h-7 sm:h-8 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs text-[10px] sm:text-[11px]"
                    >
                      🚀 Send Motivation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Workout Log');
                        setReplyTagTitle('Alignment Correction');
                        setChatInputText("🏋️ Posture Correction: Avoid hyper-extending upper lumbar spine at lockout. Keep core loaded thoracic extended.");
                      }}
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 h-7 sm:h-8 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs text-[10px] sm:text-[11px]"
                    >
                      🏋️ Posture Correction
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Nutrition Tracker');
                        setReplyTagTitle('Macronutrient Advice');
                        setChatInputText("🍱 Meal feedback: Exceptional protein volume! Try swapping out saturated oils to shave margin lipid count.");
                      }}
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 h-7 sm:h-8 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs text-[10px] sm:text-[11px]"
                    >
                      🍱 Comment Meal Log
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Progress Photo');
                        setReplyTagTitle('Aesthetic Checkin');
                        setChatInputText("📸 Photo review: Splendid lateral expansion! Postural vertical alignment shows marvelous progress!");
                      }}
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 h-7 sm:h-8 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs text-[10px] sm:text-[11px]"
                    >
                      📸 Photo Feedback
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Workout Log');
                        setReplyTagTitle('Follow Up Missed');
                        setChatInputText("🚨 Missed Workout: Let's keep our cellular momentum rolling! Access our low-intensity mobilizer stretching frame today.");
                      }}
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 h-7 sm:h-8 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs text-[10px] sm:text-[11px]"
                    >
                      🚨 Missed Workout
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Payment Status');
                        setReplyTagTitle('Invoice Stream');
                        setChatInputText("💰 Invoice reminder: To avoid disruptions, please drop by your Billing Cabinet tab to reconcile remaining balances.");
                      }}
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2 py-1 h-7 sm:h-8 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs text-[10px] sm:text-[11px]"
                    >
                      💰 Send Payment Reminder
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Upcoming Session');
                        setReplyTagTitle('Evaluation booking');
                        setChatInputText("📅 Calendar booking: Let's synchronize virtual progress evaluation schedules! Let me know your best days.");
                      }}
                      className="bg-white hover:bg-slate-105 border border-slate-200 px-2 py-1 h-7 sm:h-8 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs text-[10px] sm:text-[11px]"
                    >
                      📅 Schedule Session
                    </button>
                  </div>
                </div>

                {/* Form input bottom messaging row */}
                <form onSubmit={handleSendFloatingMessage} className="bg-white border-t border-slate-200 p-2.5 sm:p-3.5 flex flex-col gap-1.5 shrink-0">
                  {replyTagType && (
                    <div className="bg-teal-50 border border-teal-100 text-teal-800 px-2 py-0.5 rounded-lg flex justify-between items-center text-[9px] sm:text-[10px] select-none shrink-0">
                      <span className="font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">
                        📌 Active Tag: Replying to {replyTagType} &ldquo;{replyTagTitle}&rdquo;
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTagType(null);
                          setReplyTagTitle('');
                        }}
                        className="font-black hover:text-teal-900 text-[10px] shrink-0 cursor-pointer"
                      >
                        ✕ Clear
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Send a private direct prompt to Client ${activeChatTrainee?.name || 'Ahmad'}...`}
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl px-2.5 py-2 text-[11px] sm:text-xs text-slate-800 outline-none focus:outline-teal-500 font-sans"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-teal-400 px-3 sm:px-4 rounded-lg sm:rounded-xl transition duration-75 font-black uppercase text-[10px] sm:text-3xs tracking-wider flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Send
                    </button>
                  </div>
                </form>

              </div>

            </div>
          </motion.div>
        </>
      )}
        </AnimatePresence>

    </div>
  );

  // Dynamic state helpers for exercise prescription dynamic builder
  function handleAddPrescribeExercise() {
    setPrescribeExercises([...prescribeExercises, { name: '', sets: 3, reps: 10, weight: 0 }]);
  }

  function handleUpdatePrescribeExercise(index: number, field: string, value: any) {
    const updated = [...prescribeExercises];
    updated[index] = { ...updated[index], [field]: value };
    setPrescribeExercises(updated);
  }
}
