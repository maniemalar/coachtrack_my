import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus, 
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
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TrainerProfile, TraineeProfile, WorkoutLog, NutritionLog, BookingSession, Payment, Invoice } from '../types';
import { dbService } from '../lib/dbService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface TrainerDashboardProps {
  trainerProfile?: any | TrainerProfile;
  activeTab?: string;
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

export function TrainerDashboardInner({ trainerProfile: initialTrainerProfile, activeTab = 'trainer-dashboard' }: TrainerDashboardProps) {
  // Load profile from profiles and trainer_profiles using supabase.auth.getUser()
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [resolvedTrainerProfile, setResolvedTrainerProfile] = useState<any>(null);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);

  const [onboardDiscipline, setOnboardDiscipline] = useState('HIIT & Calorie Burning');
  const [onboardLocation, setOnboardLocation] = useState('Kuala Lumpur');
  const [onboardType, setOnboardType] = useState('Freelance');
  const [onboardExperience, setOnboardExperience] = useState('3');
  const [onboardPlan, setOnboardPlan] = useState('Starter Trainer Plan');
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
          pricePerHour: 110,
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
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Page 2: Client Management States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeProfile | null>(null);
  const [traineeDetailTab, setTraineeDetailTab] = useState<'history' | 'body' | 'photos' | 'ai' | 'chat' | 'nutrition'>('body');
  const [clientFilterMode, setClientFilterMode] = useState<'consistency' | 'payment'>('consistency');

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
    name: 'Ahmad bin Ibrahim',
    initials: 'AI',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm6XjkajKC1E-auUB-6Sr-GyTGI4zsoY-YEgT0MAl6pw_jL3uSF-kMR6I3SCISx-0HXh-tcAf99gfuoVVhzN1P1HU5oCZk0WWchxWKY22ATwB-APrTezY3HVTAOMGVpXNApLlt1VIzi9o8yJXJ5nQRsSmRHOuxBYfJf_533KGGsCsvrxpZ_3m5uxZ9KZr2L6dBuXJkWmoMBDY9z_YnDYNr0b8EJ3Tyw-sPE0l5vW78317CdkDStSWtXZxNwtq6QaBgqW3N2oV2two',
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

  // Page 3: Payments & Billing state filters
  const [paymentSubTab, setPaymentSubTab] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterPackage, setFilterPackage] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedInvoiceDocMode, setSelectedInvoiceDocMode] = useState<'invoice' | 'receipt'>('invoice');

  // Session History Page States
  const [sessionFilter, setSessionFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled/Missed'>('All');
  const [activeQRModalSession, setActiveQRModalSession] = useState<any>(null);
  const [activeFeedbackSession, setActiveFeedbackSession] = useState<any>(null);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [expandedVideoWorkoutId, setExpandedVideoWorkoutId] = useState<string | null>(null);
  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      title: 'HIIT Hypertrophy Booster',
      date: '2026-06-20',
      timeSlot: '09:00 AM - 10:00 AM',
      location: 'Studio A (Kuala Lumpur)',
      type: 'Strength',
      status: 'Upcoming',
      registeredTrainees: [
        { name: 'Ahmad bin Ibrahim', presence: 'Present' },
        { name: 'Mei Ling Tan', presence: 'Present' }
      ]
    },
    {
      id: 'sess_2',
      title: 'Yoga Recovery Flow',
      date: '2026-06-18',
      timeSlot: '11:30 AM - 12:30 PM',
      location: 'Zoom Virtual Chamber',
      type: 'Mobility',
      status: 'Upcoming',
      registeredTrainees: [
        { name: 'Muhammad Faizul', presence: 'Present' }
      ]
    },
    {
      id: 'sess_3',
      title: 'Olympic Weightlifting Foundation',
      date: '2026-06-15',
      timeSlot: '03:00 PM - 04:30 PM',
      location: 'Gym Floor Power Racks',
      type: 'Power',
      status: 'Completed',
      registeredTrainees: [
        { name: 'Ahmad bin Ibrahim', presence: 'Present' },
        { name: 'Muhammad Faizul', presence: 'Present' },
        { name: 'Mei Ling Tan', presence: 'Absent' }
      ],
      feedback: 'Excellent power generation from Ahmad bin Ibrahim today. Faizul needs minor ankle routing tweaks.'
    },
    {
      id: 'sess_4',
      title: 'Outdoor Metabolic Conditioning',
      date: '2026-06-10',
      timeSlot: '07:30 AM - 08:30 AM',
      location: 'Lake Gardens Running Track',
      type: 'Cardio',
      status: 'Cancelled',
      registeredTrainees: [
        { name: 'Ahmad bin Ibrahim', presence: 'Absent' }
      ],
      cancelReason: 'Heavy rain in Kuala Lumpur. Rescheduled to virtual session.'
    },
    {
      id: 'sess_5',
      title: 'Anatomical Kettlebell Drills',
      date: '2026-06-08',
      timeSlot: '04:00 PM - 05:00 PM',
      location: 'Studio B (Functional Zone)',
      type: 'Mobility',
      status: 'Missed',
      registeredTrainees: [
        { name: 'Mei Ling Tan', presence: 'Absent' }
      ],
      notes: 'No show. Checked out with 24-hr late notice waiver.'
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
  const [invitePkgOption, setInvitePkgOption] = useState('Monthly Coaching Plan — 8 Sessions — RM299');
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

  // Send Reminder states
  const [showSendReminderForm, setShowSendReminderForm] = useState(false);
  const [reminderTraineeId, setReminderTraineeId] = useState('');
  const [reminderType, setReminderType] = useState('Workout Plan Log Checklist Reminder');
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderSuccess, setReminderSuccess] = useState(false);

  // Auto-update reminder template when recipient or reminder type changes
  useEffect(() => {
    const selectedTrainee = trainees.find(t => t.id === reminderTraineeId);
    if (!selectedTrainee) return;
    
    let msg = '';
    if (reminderType === 'Workout Plan Log Checklist Reminder') {
      msg = `Hi ${selectedTrainee.name}! Just a quick nudge to complete your prescribed HIIT Core Workout Routine and submit your feedback logs. Let's maintain the momentum!`;
    } else if (reminderType === 'Nutrition Log & Calorie Tracker Reminder') {
      msg = `Hi ${selectedTrainee.name}, please log your meals and updates inside your Daily Calorie Tracker. Consistency with macros is key!`;
    } else if (reminderType === 'Outstanding Invoice Payment Reminder') {
      msg = `Hi ${selectedTrainee.name}, this is a gentle reminder that you have an outstanding coaching invoice of ours awaiting check-out. Let me know if you face any issues.`;
    } else if (reminderType === 'Progress Gallery Verification Reminder') {
      msg = `Hey ${selectedTrainee.name}! Don't forget to upload your Week 8 progress photos inside the Trainee Dashboard. Can't wait to check your development.`;
    } else if (reminderType === 'Session Attendance Reminder') {
      msg = `Hi ${selectedTrainee.name}! Our training session is slotted for ${scheduleTimeSlot || 'your scheduled hour'} tomorrow. Get packed, stay hydrated, and let's crush it!`;
    }
    setReminderMessage(msg);
  }, [reminderTraineeId, reminderType, trainees]);

  // Assignment Options for Workouts
  const [assignOption, setAssignOption] = useState<'all' | 'selected' | 'individual'>('individual');
  const [selectedTraineeIdsForPrescription, setSelectedTraineeIdsForPrescription] = useState<string[]>([]);

  const [coachingFeed, setCoachingFeed] = useState<any[]>([
    { id: 1, type: 'workout', text: 'Workout feedback successfully sent to Ahmad Ibrahim for HIIT Routine', time: '15 mins ago' },
    { id: 2, type: 'nutrition', text: 'Dietary swap advice provided to Mei Ling Tan (SS15 Gym)', time: '1 hour ago' },
    { id: 3, type: 'photo', text: 'Week 8 progress photo visual comparison reviewed', time: '3 hours ago' },
    { id: 4, type: 'ai', text: 'AI custom metabolic optimizer recommendation approved for Faizul Razak', time: 'Yesterday' }
  ]);

  // Modals for Coaching Hub actions
  const [selectedPhotoTrainee, setSelectedPhotoTrainee] = useState<TraineeProfile | null>(null);
  const [photoFeedbackText, setPhotoFeedbackText] = useState('');

  // Billing dummy seed data for rich sorting
  const [billingList, setBillingList] = useState<any[]>([
    { id: "pay_1", traineeName: "Ahmad bin Ibrahim", traineeId: "te_ahmad", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-06-05", status: "Paid", month: "June 2026", invoiceNo: "INV-MY-0098", email: "ahmad@coachtrack.my" },
    { id: "pay_2", traineeName: "Ahmad bin Ibrahim", traineeId: "te_ahmad", packageName: "Single Slot Fee", packageType: "Single", amount: 150, dueDate: "2026-06-12", status: "Pending", month: "June 2026", invoiceNo: "INV-MY-0102", email: "ahmad@coachtrack.my" },
    { id: "pay_3", traineeName: "Mei Ling Tan", traineeId: "te_ling", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-06-25", status: "Pending", month: "June 2026", invoiceNo: "INV-MY-0105", email: "ling@coachtrack.my" },
    { id: "pay_4", traineeName: "Muhammad Faizul", traineeId: "te_faizul", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-05-28", status: "Overdue", month: "May 2026", invoiceNo: "INV-MY-0081", email: "faizul@coachtrack.my" },
    { id: "pay_5", traineeName: "Mei Ling Tan", traineeId: "te_ling", packageName: "Single Slot Fee", packageType: "Single", amount: 150, dueDate: "2026-05-15", status: "Paid", month: "May 2026", invoiceNo: "INV-MY-0075", email: "ling@coachtrack.my" },
    { id: "pay_6", traineeName: "Ahmad bin Ibrahim", traineeId: "te_ahmad", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-05-02", status: "Paid", month: "May 2026", invoiceNo: "INV-MY-0062", email: "ahmad@coachtrack.my" }
  ]);

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
        setBookings(dataBk || []);

        // Workouts logged by clients
        const dataWorkouts = await dbService.getWorkouts({ trainerId: trainerProfile.id });
        setWorkouts(dataWorkouts || []);

        // Get all assigned trainees
        const dataTr = await dbService.getTraineesForTrainer(trainerProfile.id);
        setTrainees(dataTr || []);

        // Payments from backend
        const dataPay = await dbService.getPayments({ trainerId: trainerProfile.id });
        setPayments(dataPay || []);
        if (dataPay && dataPay.length > 0) {
          const mappedBackendPayments = dataPay.map((p: any) => {
            const traineeInfo = (dataTr || []).find((t: any) => t.id === p.traineeId) || { name: 'Ahmad bin Ibrahim', email: 'ahmad@coachtrack.my' };
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
          setTrainees(dataTr);
        } else {
          const dataSingle = await dbService.getTraineeProfile('u_ahmad');
          if (dataSingle) setTrainees([dataSingle]);
        }

        const dataPay = await dbService.getPayments({ trainerId: trainerProfile.id });
        setPayments(dataPay);
        
        setBillingList([
          { id: "pay_1", traineeName: "Ahmad bin Ibrahim", traineeId: "te_ahmad", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-06-05", status: "Paid", month: "June 2026", invoiceNo: "INV-MY-0098", email: "ahmad@coachtrack.my" },
          { id: "pay_2", traineeName: "Ahmad bin Ibrahim", traineeId: "te_ahmad", packageName: "Single Slot Fee", packageType: "Single", amount: 150, dueDate: "2026-06-12", status: "Pending", month: "June 2026", invoiceNo: "INV-MY-0102", email: "ahmad@coachtrack.my" },
          { id: "pay_3", traineeName: "Mei Ling Tan", traineeId: "te_ling", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-06-25", status: "Pending", month: "June 2026", invoiceNo: "INV-MY-0105", email: "ling@coachtrack.my" },
          { id: "pay_4", traineeName: "Muhammad Faizul", traineeId: "te_faizul", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-05-28", status: "Overdue", month: "May 2026", invoiceNo: "INV-MY-0081", email: "faizul@coachtrack.my" },
          { id: "pay_5", traineeName: "Mei Ling Tan", traineeId: "te_ling", packageName: "Single Slot Fee", packageType: "Single", amount: 150, dueDate: "2026-05-15", status: "Paid", month: "May 2026", invoiceNo: "INV-MY-0075", email: "ling@coachtrack.my" },
          { id: "pay_6", traineeName: "Ahmad bin Ibrahim", traineeId: "te_ahmad", packageName: "Monthly Pack (8x Slots)", packageType: "Monthly", amount: 1080, dueDate: "2026-05-02", status: "Paid", month: "May 2026", invoiceNo: "INV-MY-0062", email: "ahmad@coachtrack.my" }
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
    const planName = String(trainerProfile.selectedPlan || (trainerProfile as any).selected_plan || 'Starter').toLowerCase();
    
    if (planName.includes('growth')) {
      maxClients = 20;
    } else if (planName.includes('pro')) {
      maxClients = 50;
    } else {
      maxClients = 5;
    }

    if (currentTraineesCount >= maxClients) {
      setInviteError(`Client limit reached! Your current "${trainerProfile.selectedPlan || (trainerProfile as any).selected_plan || 'Starter Trainer Plan'}" supports up to ${maxClients} active trainees. Please upgrade your trainer plan in the Profile page to add more clients.`);
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
        price = 110;
      } else if (invitePkgOption === '4-Class Package') {
        packageName = '4-Class Coaching Pass';
        sessions = 4;
        price = 399;
      } else if (invitePkgOption === '8-Class Package') {
        packageName = '8-Class Active Plan';
        sessions = 8;
        price = 750;
      } else if (invitePkgOption === 'Monthly Pass') {
        packageName = 'Monthly Infinite Pass';
        sessions = 12;
        price = 299;
      } else if (invitePkgOption === 'Custom Package') {
        packageName = 'Premium Certified Custom Package';
        sessions = 15;
        price = 1499;
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

  const handleSendReminderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTraineeId || !reminderMessage.trim()) return;

    try {
      const selectedT = trainees.find(t => t.id === reminderTraineeId);
      const payload = {
        senderId: 'u_sarah', // Trainer ID
        receiverId: selectedT ? selectedT.userId : 'u_ahmad',
        message: `📢 [COACH REMINDER - ${reminderType.toUpperCase()}]: ${reminderMessage}`
      };

      const res = await dbService.createChatMessage(payload);
      if (res) {
        setReminderSuccess(true);
        triggerToast(`Reminder dispatched to ${selectedT ? selectedT.name : 'Client'}'s chat feed!`, 'success');
        setTimeout(() => {
          setReminderSuccess(false);
          setShowSendReminderForm(false);
          fetchTrainerData();
        }, 1200);
      }
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
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'Completed',
          registeredTrainees: s.registeredTrainees.map(t => ({ ...t, presence: 'Present' })),
          feedback: s.feedback || 'Trainee physical exercise routines audited and checked off completely.'
        };
      }
      return s;
    }));
    triggerToast("Session marked as Completed! Presence records compiled.", "success");
  };

  const handleSaveSessionFeedback = () => {
    if (!feedbackSessionId) return;
    setSessions(prev => prev.map(s => {
      if (s.id === feedbackSessionId) {
        return {
          ...s,
          feedback: feedbackInput
        };
      }
      return s;
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
        packageName: "Monthly Pass",
        paymentStatus: "Pending",
        outstandingAmount: 299,
        dueDate: "2026-06-25",
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
        completionRate: 68,
        completedWorkouts: 13,
        missedWorkouts: 6,
        lastCheckin: "2026-06-09 - Reformer Pilates Level 1",
        lastWorkoutDate: "2026-06-09",
        latestMeal: "Shredded Quinoa Salad & Chicken Breast (390 kcal)",
        packageName: "8-Class Package",
        paymentStatus: "Overdue",
        outstandingAmount: 450,
        dueDate: "2026-06-05",
        invoiceCount: 2,
        nextSession: "2026-06-13 @ 2:30 PM",
        bodyMetrics: { weight: 58, height: 162, bodyFat: 25.5, muscleMass: 21.2, bmr: 1250 },
        attendance: "68% (13/19 completed)",
        notes: "Post-partum abdominal separation (diastasis recti) is healing well. Focus on safe transverse abdominis stabilizers. Strict posture control on pelvic alignment."
      },
      'te_faizul': {
        targetWeight: 88,
        completionRate: 91,
        completedWorkouts: 20,
        missedWorkouts: 2,
        lastCheckin: "2026-06-14 - Compound Powerlifting Deadlift Set",
        lastWorkoutDate: "2026-06-14",
        latestMeal: "Brown Rice & Double Grilled Chicken Breast (820 kcal)",
        packageName: "Personal Training Package",
        paymentStatus: "Paid",
        outstandingAmount: 0,
        dueDate: "None (Fully Paid)",
        invoiceCount: 1,
        nextSession: "None Scheduled",
        bodyMetrics: { weight: 92, height: 180, bodyFat: 17.6, muscleMass: 42.8, bmr: 1980 },
        attendance: "91% (20/22 completed)",
        notes: "High potential for deadlift target of 180kg. Work on thoracic spine extension under heavy loads. Form is solid, but tends to hyper-extend lower lumbar at lockouts."
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

  // Send Invoice Reminders
  const handleSendReminder = (clientName: string) => {
    triggerToast(`Payment reminder SMS & WhatsApp automatically dispatched to ${clientName}!`, 'info');
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
                <option value="Starter Trainer Plan">Starter Trainer Plan (Up to 5 clients • RM0)</option>
                <option value="Growth Trainer Plan">Growth Trainer Plan (Up to 20 clients • RM149)</option>
                <option value="Pro Trainer Plan">Pro Trainer Plan (Up to 50 clients • RM299)</option>
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

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24 pt-6 text-left relative">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {alertBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl text-xs font-bold text-white flex items-center gap-2.5 min-w-[320px] max-w-md ${
              alertBanner.type === 'success' ? 'bg-[#001F3F] border-b-4 border-teal-400' : 'bg-slate-900 border-b-4 border-indigo-400'
            }`}
          >
            <span className="text-base">{alertBanner.type === 'success' ? '🚀' : 'ℹ️'}</span>
            <p className="flex-1 font-sans">{alertBanner.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Verification Status Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm mb-8 gap-4">
          <div className="flex items-center gap-3">
            <img 
              referrerPolicy="no-referrer"
              src={trainerProfile.avatarUrl} 
              className="w-16 h-16 rounded-full border-2 border-teal-500 object-cover" 
              alt={trainerProfile.name}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-display font-black text-slate-800 leading-tight">
                  {trainerProfile.name}
                </h2>
                <span className="bg-[#001F3F]/10 text-[#001F3F] text-[9px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-teal-600" /> ACTIVE COACH
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Discipline: <strong className="text-teal-600 font-bold">{trainerProfile.discipline}</strong> • SS15, Subang Jaya
              </p>
            </div>
          </div>
          <div className="flex gap-2">
          </div>
        </div>

        {/* Quick Actions Row */}
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
              <span>Issue Custom Invoice</span>
            </button>

            <button
              id="qa-create-workout"
              onClick={() => {
                const defaultTr = trainees[0] || { id: 'te_ahmad', name: 'Ahmad bin Ibrahim' };
                setPrescribeTraineeId(defaultTr.id);
                setPrescribeTraineeName(defaultTr.name);
                setPrescribeWorkoutType('HIIT Core Strength');
                setPrescribeDuration(45);
                setPrescribeNotes('');
                setPrescribeExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
                setAssignOption('individual');
                setSelectedTraineeIdsForPrescription([]);
                setShowPrescribeForm(true);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#001F3F]/15 to-slate-950/5 hover:from-[#001F3F]/25 hover:to-slate-950/10 border border-slate-200 text-[#001F3F] rounded-xl text-xs font-bold font-sans transition duration-155 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <Dumbbell className="w-3.5 h-3.5 shrink-0 text-[#001F3F]" />
              <span>Create Workout Plan</span>
            </button>

            <button
              id="qa-schedule-session"
              onClick={() => {
                setScheduleTraineeId(trainees[0]?.id || 'te_ahmad');
                setScheduleDate('2026-06-17');
                setScheduleTimeSlot('10:00 AM');
                setScheduleLocation('SS15 Studio • Selangor');
                setScheduleNotes('Personal training tracking alignment review');
                setShowScheduleModal(true);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500/15 to-amber-600/5 hover:from-amber-500/25 hover:to-amber-600/10 border border-amber-200 text-[#001f3f] rounded-xl text-xs font-bold font-sans transition duration-155 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>Schedule Session</span>
            </button>

            <button
              id="qa-send-reminder"
              onClick={() => {
                setReminderTraineeId(trainees[0]?.id || 'te_ahmad');
                setReminderType('Workout Plan Log Checklist Reminder');
                setReminderMessage("Hi Ahmad! Please log your pending HIIT Core workout split inside your planner logs. Let's finish strong!");
                setShowSendReminderForm(true);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-rose-500/15 to-rose-600/5 hover:from-rose-500/25 hover:to-rose-600/10 border border-rose-200 text-[#001f3f] rounded-xl text-xs font-bold font-sans transition duration-155 cursor-pointer shadow-2xs hover:shadow-sm"
            >
              <Bell className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              <span>Send Reminder</span>
            </button>
            
          </div>
        </div>

        {/* Custom Invoice Generator Modal Form */}
        {showInvoiceForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 text-left">
              <h3 className="font-display font-medium text-slate-900 text-lg mb-1">
                Issue Custom Invoice
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-sans">
                Generate and dispatch a professional sandboxed invoice directly to client accounts.
              </p>

              {invoiceCreatedSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center my-6">
                  <span className="text-xl">📋</span>
                  <p className="font-bold mt-1">Invoice Generated Successfully!</p>
                  <p className="text-xs text-slate-500">Client billing registers have been updated.</p>
                </div>
              ) : (
                <form onSubmit={handleInvoiceCreateSubmit} className="space-y-4">
                  {/* Billing Target Option */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 text-left">
                    <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-sans">
                      🎯 Billing Target Group
                    </label>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-slate-755">
                        <input
                          type="radio"
                          name="invoiceTargetOption"
                          value="individual"
                          checked={invoiceBillingTarget === 'individual'}
                          onChange={() => setInvoiceBillingTarget('individual')}
                          className="text-teal-605 focus:ring-teal-500 rounded-full cursor-pointer"
                        />
                        Single Client
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-slate-755">
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
                          className="text-teal-605 focus:ring-teal-500 rounded-full cursor-pointer"
                        />
                        Selected Clients
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-slate-755">
                        <input
                          type="radio"
                          name="invoiceTargetOption"
                          value="all"
                          checked={invoiceBillingTarget === 'all'}
                          onChange={() => setInvoiceBillingTarget('all')}
                          className="text-teal-605 focus:ring-teal-500 rounded-full cursor-pointer"
                        />
                        All Active Clients ({trainees.length})
                      </label>
                    </div>

                    {/* Client lists to select from */}
                    {invoiceBillingTarget === 'selected' && (
                      <div className="pt-2 border-t border-slate-200 mt-2 grid grid-cols-2 gap-2 text-2xs">
                        {trainees.map((t) => (
                          <label key={t.id} className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-slate-150 shadow-2xs">
                            <input
                              type="checkbox"
                              checked={invoiceSelectedTraineeIds.includes(t.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setInvoiceSelectedTraineeIds([...invoiceSelectedTraineeIds, t.id]);
                                } else {
                                  setInvoiceSelectedTraineeIds(invoiceSelectedTraineeIds.filter(id => id !== t.id));
                                }
                              }}
                              className="rounded text-teal-605 focus:ring-teal-500 cursor-pointer"
                            />
                            <span className="font-bold text-slate-755 truncate">{t.name}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {invoiceBillingTarget === 'individual' && (
                      <div className="pt-1.5">
                        <select
                          value={selectedTraineeId}
                          onChange={(e) => setSelectedTraineeId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                          required
                        >
                          <option value="">-- Choose Client --</option>
                          {trainees.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Invoice details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                        Invoice Title
                      </label>
                      <input 
                        type="text" 
                        value={invoiceTitle}
                        onChange={(e) => setInvoiceTitle(e.target.value)}
                        placeholder="E.g. Coaching Hub Fee"
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800 font-sans font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                        Invoice Type
                      </label>
                      <select
                        value={invoiceType}
                        onChange={(e) => setInvoiceType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800 font-sans font-medium"
                        required
                      >
                        <option value="Single Class">Single Class</option>
                        <option value="4-Class Package">4-Class Package</option>
                        <option value="8-Class Package">8-Class Package</option>
                        <option value="Monthly Pass">Monthly Pass</option>
                        <option value="Nutrition Coaching">Nutrition Coaching</option>
                        <option value="Personal Training Package">Personal Training Package</option>
                        <option value="Custom Invoice">Custom Invoice</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                        Amount (RM)
                      </label>
                      <input 
                        type="number" 
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800 font-sans font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                        Due Date
                      </label>
                      <input 
                        type="date" 
                        value={invoiceDueDate}
                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800 font-sans font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                      Service Description
                    </label>
                    <input 
                      type="text" 
                      value={invoiceDescription}
                      onChange={(e) => setInvoiceDescription(e.target.value)}
                      placeholder="E.g. Monthly Pack (8x Slots)"
                      className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800 font-sans font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                      Notes (Optional Remarks)
                    </label>
                    <textarea 
                      value={invoiceNotes}
                      onChange={(e) => setInvoiceNotes(e.target.value)}
                      placeholder="E.g. Please checkout via FPX or GrabPay inside CoachTrack app wrapper..."
                      className="w-full bg-slate-50 border border-slate-255 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800 font-sans h-16 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowInvoiceForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-sans font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#001F3F] text-teal-400 hover:bg-slate-900 font-extrabold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-md py-2 px-5 font-sans"
                    >
                      Issue Invoice
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
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-left">
              <h3 className="font-display font-medium text-slate-900 text-lg mb-1 font-sans">
                Invite & Onboard New Trainee Client
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-sans">
                Enter your prospective trainee's registered email address and assign a structured coaching package to invite them to your roster.
              </p>

              <form onSubmit={handleAddClientInviteSubmit} className="space-y-4">
                {inviteError && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-xs font-semibold">
                    ⚠️ {inviteError}
                  </div>
                )}
                
                {inviteSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs font-semibold text-center">
                    🎉 Invitation generated successfully! Trainee notified.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                    Trainee Registered Email
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="E.g. ahmad@coachtrack.my"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-teal-500 text-slate-800"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-sans">
                    Only existing CoachTrack MY accounts can be onboarded.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 font-sans">
                    Select Training Package
                  </label>
                  <select
                    value={invitePkgOption}
                    onChange={(e) => setInvitePkgOption(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-teal-500 text-slate-800 font-sans"
                    required
                  >
                    <option value="Single Class">Single Class</option>
                    <option value="4-Class Package">4-Class Package</option>
                    <option value="8-Class Package font-sans">8-Class Package</option>
                    <option value="Monthly Pass">Monthly Pass</option>
                    <option value="Custom Package">Custom Package</option>
                  </select>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddClientForm(false);
                      setInviteError('');
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="bg-[#001F3F] text-teal-400 hover:bg-slate-900 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-1 font-sans"
                  >
                    {inviteLoading ? 'Sending Invitation...' : 'Send Client Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Session Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] md:max-h-[85vh] flex flex-col shadow-2xl relative border border-slate-100 text-left overflow-hidden">
              {/* Fixed Header */}
              <div className="p-5 border-b border-slate-100 shrink-0">
                <h3 className="font-display font-medium text-slate-900 text-lg mb-1">
                  📅 Schedule Client Session
                </h3>
                <p className="text-xs text-slate-500">
                  Schedule a coaching slot in our certified studio calendars.
                </p>
              </div>

              {scheduleSuccess ? (
                <div className="p-5 overflow-y-auto flex-1 text-center my-auto">
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4">
                    <span className="text-xl">📅</span>
                    <p className="font-bold mt-1">Session Slotted Successfully!</p>
                    <p className="text-xs text-slate-550 font-sans">The client notification checklists have been synchronised.</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="px-5 py-2 bg-[#001F3F] text-teal-400 font-extrabold rounded-xl text-xs cursor-pointer"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleScheduleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
                  {/* Step 1: Session Type Selection */}
                  <div>
                    <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-2 font-sans text-slate-600">
                      Session Type
                    </label>
                    <div className="flex gap-4 mb-1 font-sans text-xs">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input 
                          type="radio" 
                          name="scheduleType" 
                          checked={scheduleType === 'individual'} 
                          onChange={() => setScheduleType('individual')}
                          className="w-4 h-4 text-indigo-900 border-slate-300 focus:ring-indigo-900"
                        />
                        <span>Individual Session</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input 
                          type="radio" 
                          name="scheduleType" 
                          checked={scheduleType === 'group'} 
                          onChange={() => setScheduleType('group')}
                          className="w-4 h-4 text-indigo-900 border-slate-300 focus:ring-indigo-900"
                        />
                        <span>Group Session</span>
                      </label>
                    </div>
                  </div>

                  {scheduleType === 'individual' ? (
                    <div>
                      <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-1 font-sans text-slate-600">
                        Target Trainee Client
                      </label>
                      <select
                        value={scheduleTraineeId}
                        onChange={(e) => setScheduleTraineeId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans font-medium"
                        required={scheduleType === 'individual'}
                      >
                        <option value="">-- Choose Client --</option>
                        {trainees.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-3 font-sans text-xs">
                      <div>
                        <label className="block text-2xs font-bold text-slate-555 uppercase tracking-wider mb-1.5 text-slate-600">
                          Select Participants
                        </label>
                        
                        {/* Search Filter for additional trainees */}
                        <div className="relative mb-2">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input 
                            type="text"
                            placeholder="Query trainee by name..."
                            value={scheduleSearchQuery}
                            onChange={(e) => setScheduleSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:ring-indigo-900 focus:outline-none"
                          />
                        </div>

                        {/* Registered Participants (Auto-Added) */}
                        {registeredTraineesForSlot.length > 0 && (
                          <div className="mb-3 bg-slate-100/80 rounded-xl p-3 border border-slate-205">
                            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                              <span>Registered Participants (Auto-Added)</span>
                              <span className="text-[9px] text-slate-400 font-normal italic">(Locked)</span>
                            </span>
                            <div className="space-y-1.5">
                              {trainees.filter(t => registeredTraineesForSlot.includes(t.id)).map(t => (
                                <div key={t.id} className="flex items-center gap-2 text-slate-400 select-none">
                                  <div className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 text-[9px] font-black">
                                    ✓
                                  </div>
                                  <img referrerPolicy="no-referrer" src={t.avatarUrl} className="w-4.5 h-4.5 rounded-full object-cover saturate-50 opacity-75" />
                                  <span className="font-medium text-slate-500 text-xs">{t.name}</span>
                                  <span className="text-[8px] bg-slate-200 text-slate-600 font-bold tracking-wide uppercase px-1.5 py-0.5 rounded ml-auto">
                                    via Trainee Portal
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Additional Participants */}
                        <div>
                          <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1.5">
                            Add Additional Participants
                          </span>
                          <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-2 bg-slate-50/50">
                            {trainees
                              .filter(t => !registeredTraineesForSlot.includes(t.id))
                              .filter(t => t.name.toLowerCase().includes(scheduleSearchQuery.toLowerCase()))
                              .map(t => {
                                const isSelected = scheduleSelectedTraineeIds.includes(t.id);
                                return (
                                  <label key={t.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors text-slate-700">
                                    <input 
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        if (isSelected) {
                                          setScheduleSelectedTraineeIds(prev => prev.filter(id => id !== t.id));
                                        } else {
                                          setScheduleSelectedTraineeIds(prev => [...prev, t.id]);
                                        }
                                      }}
                                      className="w-3.5 h-3.5 rounded text-indigo-900 border-slate-300 focus:ring-indigo-900"
                                    />
                                    <img referrerPolicy="no-referrer" src={t.avatarUrl} className="w-4.5 h-4.5 rounded-full object-cover" />
                                    <span className="font-semibold text-xs text-slate-800">{t.name}</span>
                                  </label>
                                );
                              })}
                            {trainees.filter(t => !registeredTraineesForSlot.includes(t.id)).length === 0 && (
                              <p className="text-[10px] text-slate-400 italic py-1">No additional trainees available to inject.</p>
                            )}
                          </div>
                        </div>

                        {/* Chips list */}
                        {(registeredTraineesForSlot.length > 0 || scheduleSelectedTraineeIds.length > 0) && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {/* Auto registered locks */}
                            {trainees.filter(t => registeredTraineesForSlot.includes(t.id)).map(t => (
                              <span key={t.id} className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 text-2xs px-2 py-0.5 rounded-full font-bold border border-slate-200 select-none animate-fade-in">
                                ✓ {t.name}
                              </span>
                            ))}
                            {/* Manually added */}
                            {trainees.filter(t => scheduleSelectedTraineeIds.includes(t.id)).map(t => (
                              <span key={t.id} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-900 text-2xs px-2 py-0.5 rounded-full font-bold border border-indigo-100 animate-fade-in">
                                👤 {t.name}
                                <button 
                                  type="button" 
                                  onClick={() => setScheduleSelectedTraineeIds(prev => prev.filter(id => id !== t.id))}
                                  className="text-indigo-400 hover:text-indigo-600 font-extrabold ml-1 font-mono text-center"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-1 font-sans text-slate-600">
                        Scheduled Date
                      </label>
                      <input 
                        type="date" 
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-2xs font-bold text-slate-555 uppercase tracking-wider mb-1 font-sans text-slate-600">
                        Time Slot
                      </label>
                      <select
                        value={scheduleTimeSlot}
                        onChange={(e) => setScheduleTimeSlot(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans font-medium"
                        required
                      >
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="05:00 PM">05:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-1 font-sans text-slate-600">
                      Session Location
                    </label>
                    <input 
                      type="text" 
                      value={scheduleLocation}
                      onChange={(e) => setScheduleLocation(e.target.value)}
                      placeholder="E.g. SS15 Studio • Selangor"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-1 font-sans text-slate-600">
                      Session Notes / Agenda
                    </label>
                    <textarea 
                      value={scheduleNotes}
                      onChange={(e) => setScheduleNotes(e.target.value)}
                      placeholder="E.g. Form check, heavy squats, postural evaluation check-in..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans h-20 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Dynamic Summary Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 font-sans">
                    <span className="block text-[10px] font-black uppercase text-slate-400 tracking-wider">Session Summary</span>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-2xs text-slate-700">
                      <div>
                        <span className="text-slate-400">Session Type:</span>
                        <strong className="block text-slate-800 capitalize">{scheduleType} Session</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Schedule Slot:</span>
                        <strong className="block text-slate-800">{scheduleDate} @ {scheduleTimeSlot}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Location:</span>
                        <strong className="block text-slate-800 truncate">{scheduleLocation}</strong>
                      </div>
                      {scheduleType === 'group' ? (
                        <div>
                          <span className="text-slate-400">Participants Checklist:</span>
                          <strong className="block text-slate-900 font-black">
                            {registeredTraineesForSlot.length + scheduleSelectedTraineeIds.length} Total ({registeredTraineesForSlot.length} Reg, {scheduleSelectedTraineeIds.length} Add)
                          </strong>
                        </div>
                      ) : (
                        <div>
                          <span className="text-slate-400">Trainee Patient:</span>
                          <strong className="block text-slate-800 truncate">
                            {trainees.find(t => t.id === scheduleTraineeId)?.name || 'Needs Selection'}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sticky footer action buttons */}
                  <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 font-sans sticky bottom-0 bg-white">
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#001F3F] text-teal-400 hover:bg-slate-900 font-extrabold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-md"
                    >
                      Schedule Slot
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Send Reminder Modal */}
        {showSendReminderForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 text-left font-sans">
              <h3 className="font-display font-medium text-slate-900 text-lg mb-1 font-semibold">
                📢 Send Client Onboarding Reminder
              </h3>
              <p className="text-xs text-slate-500 mb-4 font-sans">
                Shoot a tailored in-app dispatch to your trainee client to nudge checklist logging.
              </p>

              {reminderSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center my-6">
                  <span className="text-xl">📢</span>
                  <p className="font-bold mt-1">Reminder Dispatched Successfully!</p>
                  <p className="text-xs text-slate-500">The notification push is live on recipient terminal feed.</p>
                </div>
              ) : (
                <form onSubmit={handleSendReminderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-1 font-sans text-slate-600">
                      Select Trainee Recipient
                    </label>
                    <select
                      value={reminderTraineeId}
                      onChange={(e) => setReminderTraineeId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans font-medium"
                      required
                    >
                      <option value="">-- Choose Client --</option>
                      {trainees.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-1 font-sans text-slate-600">
                      Reminder Category / Nudge Type
                    </label>
                    <select
                      value={reminderType}
                      onChange={(e) => setReminderType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans font-medium"
                      required
                    >
                      <option value="Workout Plan Log Checklist Reminder">🏋️ Workout Plan Log Checklist Reminder</option>
                      <option value="Nutrition Log & Calorie Tracker Reminder">🥦 Nutrition Log & Calorie Tracker Reminder</option>
                      <option value="Outstanding Invoice Payment Reminder">🧾 Outstanding Invoice Payment Reminder</option>
                      <option value="Progress Gallery Verification Reminder">📸 Progress Gallery Verification Reminder</option>
                      <option value="Session Attendance Reminder">📅 Session Attendance Reminder</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold text-slate-550 uppercase tracking-wider mb-1 font-sans text-slate-600">
                      Reminder Message (Malaysia Bahasa/English friendly)
                    </label>
                    <textarea 
                      value={reminderMessage}
                      onChange={(e) => setReminderMessage(e.target.value)}
                      placeholder="E.g. Hi Ahmad, please log your pending workouts..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-[#001F3F] text-slate-800 font-sans h-24 resize-none leading-relaxed"
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 font-sans">
                    <button
                      type="button"
                      onClick={() => setShowSendReminderForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#001F3F] text-teal-400 hover:bg-slate-900 font-extrabold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-md"
                    >
                      Send Reminder
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
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 text-left">
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
        {activeTab === 'trainer-dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 animate-fade-in"
          >
            {/* Header with Title and Date */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-black font-display text-slate-900 flex items-center gap-2 text-left">
                  <Briefcase className="w-5.5 h-5.5 text-indigo-900" />
                  <span>Trainer Command Center</span>
                </h3>
                <p className="text-xs text-slate-500 text-left font-sans">
                  Real-time operational dashboard, financial intake tracker, and client hub metrics.
                </p>
              </div>
              <div className="text-2xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                Current State: June 2026 • Live Sandbox
              </div>
            </div>

            {/* A. KPI SUMMARY CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Total Active Clients */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between text-slate-800 text-left">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Total Active Clients</span>
                  <div className="flex justify-between items-baseline mt-1.5 animate-pulse">
                    <span className="text-2xl font-black text-slate-800 font-display">
                      {isSupActive ? trainees.length : (trainees.length || 6)}
                    </span>
                    <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-200 uppercase font-sans">
                      👥 Active
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-sans">Verified active trainee roster</p>
              </div>

              {/* Card 2: Monthly Revenue */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between text-slate-800 font-sans text-left">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Monthly Revenue</span>
                  <div className="flex justify-between items-baseline mt-1.5 animate-fade-in">
                    <span className="text-2xl font-black text-[#001F3F] font-display">
                      RM {paidSumRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-250 font-sans uppercase">
                      ✓ Paid
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-sans">Verified completed invoices</p>
              </div>

              {/* Card 3: Pending Payments */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between text-slate-800 text-left">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Pending Payments</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-2xl font-black text-rose-500 font-display">
                      RM {(pendingSumRevenue + overdueSumRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold border border-rose-250 text-2xs">
                      {isSupActive ? billingList.filter(b => b.status === 'Overdue').length : 2} Overdue
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">Invoiced outstanding MYR</p>
              </div>

              {/* Card 4: Upcoming Sessions Today */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between text-slate-800 text-left font-sans">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Upcoming Sessions Today</span>
                  <div className="flex justify-between items-baseline mt-1.5">
                    <span className="text-2xl font-black text-slate-800 font-display">
                      {isSupActive ? bookings.filter(b => b.status === "Confirmed" || b.status?.toLowerCase().includes("confirm") || b.status === "Upcoming").length : 3}
                    </span>
                    <span className="text-[10px] text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-full font-bold border border-indigo-250 font-sans">
                      📅 Scheduled
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-sans">Schedules locked for today</p>
              </div>
            </div>

            {/* Quick Actions & Revenue Snapshot Grid */}
            <div className="grid lg:grid-cols-3 gap-8 text-left">
              
              {/* Left & Middle Column contents: Today's Schedule + Revenue Snapshot */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* B. TODAY'S SCHEDULE */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-955" />
                      <h3 className="font-display font-medium text-slate-909 text-sm text-slate-900">
                        Today's Coaching Schedule
                      </h3>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full uppercase">
                      ● active today
                    </span>
                  </div>

                  <div className="space-y-4 font-sans">
                    {isSupActive ? (
                      bookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                          <Calendar className="w-8 h-8 text-slate-300 mb-2.5" />
                          <p className="text-xs font-bold text-slate-600">No sessions scheduled yet.</p>
                          <p className="text-[10px] text-slate-400 mt-1">Book sessions with your trainees to organize your calendar.</p>
                        </div>
                      ) : (
                        bookings.map((b: any) => {
                          const time = b.timeSlot || b.time_slot || '10:00 AM';
                          const title = b.title || b.discipline || 'Personal Training Session';
                          const traineeName = b.traineeName || 'Trainee';
                          const loc = b.location || 'SS15 Studio';
                          return (
                            <div key={b.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-100 rounded-xl transition duration-150 hover:bg-slate-100 font-sans">
                              <div className="flex items-center gap-3">
                                <div className="bg-[#001F3F]/10 text-[#001F3F] font-bold w-12 h-12 rounded-xl flex flex-col justify-center items-center shrink-0">
                                  <span className="text-[10px] tracking-tight leading-none text-slate-505 font-mono">{time.split(' ')[0] || '10:00'}</span>
                                  <span className="text-xs uppercase font-black font-mono">{time.split(' ')[1] || 'AM'}</span>
                                </div>
                                <div>
                                  <strong className="text-slate-855 text-sm block">{traineeName}</strong>
                                  <span className="text-[10px] text-slate-450 flex items-center gap-1 mt-0.5">
                                    📍 {loc}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 sm:mt-0 flex items-center justify-between w-full sm:w-auto gap-4">
                                <span className="text-2xs text-[#001F3F] bg-[#001F3F]/10 px-2.5 py-1 rounded-md font-extrabold uppercase font-sans">
                                  {title}
                                </span>
                                <span className={`text-2xs font-bold px-2 py-0.5 rounded ${b.status === 'Completed' ? 'text-blue-800 bg-blue-105 bg-blue-100/60' : 'text-emerald-800 bg-emerald-100/60'}`}>
                                  {b.status || 'Confirmed'} ✓
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )
                    ) : (
                      <>
                        {/* Ahmad Ibrahim */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-101 border-slate-100 rounded-xl transition duration-150 hover:bg-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#001F3F]/10 text-[#001F3F] font-bold w-12 h-12 rounded-xl flex flex-col justify-center items-center shrink-0">
                              <span className="text-[10px] tracking-tight leading-none text-slate-505 font-mono">10:00</span>
                              <span className="text-xs uppercase font-black font-mono">AM</span>
                            </div>
                            <div>
                              <strong className="text-slate-855 text-sm block">Ahmad Ibrahim</strong>
                              <span className="text-[10px] text-slate-450 flex items-center gap-1 mt-0.5 font-sans">
                                📍 SS15 Studio • Selangor
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center justify-between w-full sm:w-auto gap-4 font-sans">
                            <span className="text-2xs text-[#001F3F] bg-[#001F3F]/10 px-2.5 py-1 rounded-md font-extrabold uppercase font-sans">
                              HIIT Core Strength
                            </span>
                            <span className="text-2xs font-bold text-emerald-850 bg-emerald-100/60 px-2 py-0.5 rounded font-sans">
                              Confirmed ✓
                            </span>
                          </div>
                        </div>

                        {/* Mei Ling Tan */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-100 rounded-xl transition duration-150 hover:bg-slate-100 font-sans">
                          <div className="flex items-center gap-3 font-sans">
                            <div className="bg-[#001F3F]/10 text-[#001F3F] font-bold w-12 h-12 rounded-xl flex flex-col justify-center items-center shrink-0 font-sans">
                              <span className="text-[10px] tracking-tight leading-none text-slate-505 font-mono">02:30</span>
                              <span className="text-xs uppercase font-black font-mono">PM</span>
                            </div>
                            <div>
                              <strong className="text-slate-855 text-sm block font-sans font-bold">Mei Ling Tan</strong>
                              <span className="text-[10px] text-slate-450 flex items-center gap-1 mt-0.5 font-sans">
                                📍 Subang Gym • Selangor
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center justify-between w-full sm:w-auto gap-4 font-sans">
                            <span className="text-2xs text-[#001F3F] bg-[#001F3F]/5 px-2.5 py-1 rounded-md font-extrabold uppercase">
                              Pilates Slimming
                            </span>
                            <span className="text-2xs font-bold text-emerald-850 bg-emerald-100/60 px-2 py-0.5 rounded">
                              Confirmed ✓
                            </span>
                          </div>
                        </div>

                        {/* Amy Wong */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 border border-slate-100 rounded-xl transition duration-150 hover:bg-slate-100 font-sans">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#001F3F]/10 text-[#001F3F] font-bold w-12 h-12 rounded-xl flex flex-col justify-center items-center shrink-0">
                              <span className="text-[10px] tracking-tight leading-none text-slate-505 font-mono">05:00</span>
                              <span className="text-xs uppercase font-black font-mono">PM</span>
                            </div>
                            <div>
                              <strong className="text-slate-855 text-sm block">Amy Wong</strong>
                              <span className="text-[10px] text-slate-450 flex items-center gap-1 mt-0.5">
                                📍 PJ Peak Performance
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0 flex items-center justify-between w-full sm:w-auto gap-4">
                            <span className="text-2xs text-indigo-950 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md font-extrabold uppercase">
                              Athletic Strength
                            </span>
                            <span className="text-2xs font-bold text-emerald-850 bg-emerald-100/60 px-2 py-0.5 rounded font-sans">
                              Confirmed ✓
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* D. REVENUE SNAPSHOT */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-display font-medium text-slate-900 text-sm">Revenue Snapshot</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5 font-sans">Malaysia Ringgit (MYR) monthly billing trajectory</p>
                    </div>
                    <div className="flex items-center gap-3 text-2xs font-semibold text-slate-450">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-indigo-950 rounded-full"></span> Collected</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-teal-400 rounded-full"></span> Projected</span>
                    </div>
                  </div>

                  {/* SVG Bar Chart Area */}
                  <div className="relative pt-6">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none h-40 border-b border-slate-100 text-[9px] font-mono text-slate-300">
                      <div className="border-b border-dashed border-slate-100/80 w-full pt-1">RM 2,500</div>
                      <div className="border-b border-dashed border-slate-100/80 w-full pt-1">RM 1,800</div>
                      <div className="border-b border-dashed border-slate-100/80 w-full pt-1">RM 1,200</div>
                      <div className="border-b border-dashed border-slate-100/80 w-full pt-1">RM 600</div>
                    </div>

                    <div className="flex justify-between items-end h-40 pt-6 relative px-4 z-10 font-sans">
                      <div className="flex flex-col items-center group w-12">
                        <div className="bg-slate-300 w-6 rounded-t-md transition-all duration-300 hover:bg-slate-400 animate-pulse" style={{ height: '35px' }}></div>
                        <span className="text-[9px] font-bold text-slate-400 mt-2 font-mono uppercase">Feb</span>
                      </div>
                      <div className="flex flex-col items-center group w-12">
                        <div className="bg-slate-300 w-6 rounded-t-md transition-all duration-300 hover:bg-slate-400" style={{ height: '58px' }}></div>
                        <span className="text-[9px] font-bold text-slate-400 mt-2 font-mono uppercase font-sans">Mar</span>
                      </div>
                      <div className="flex flex-col items-center group w-12">
                        <div className="bg-indigo-950/40 w-6 rounded-t-md transition-all duration-300 hover:bg-indigo-950 animate-fade-in" style={{ height: '80px' }}></div>
                        <span className="text-[9px] font-bold text-slate-405 mt-2 font-mono uppercase">Apr</span>
                      </div>
                      <div className="flex flex-col items-center group w-12">
                        <div className="bg-indigo-950/80 w-6 rounded-t-md transition-all duration-300 hover:bg-indigo-950" style={{ height: '115px' }}></div>
                        <span className="text-[9px] font-bold text-slate-400 mt-2 font-mono uppercase">May</span>
                      </div>
                      <div className="flex flex-col items-center group w-12 relative">
                        <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-teal-400 text-[9px] font-black font-mono py-1 px-2 rounded -translate-x-1/2 left-1/2 shadow-xl border border-slate-800 z-50 whitespace-nowrap">
                          RM {paidSumRevenue.toFixed(0)}
                        </span>
                        <div className="bg-gradient-to-t from-indigo-950 to-indigo-700 w-7 rounded-t-md transition-all duration-300 hover:brightness-110 shadow-lg border-t-2 border-indigo-400 cursor-pointer" style={{ height: '142px' }}></div>
                        <strong className="text-[9px] font-black text-indigo-950 mt-2 font-mono uppercase">Jun</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: C. RECENT NOTIFICATIONS */}
              <div className="space-y-8 text-left">

                {/* C. RECENT NOTIFICATIONS */}
                <div className="bg-white border border-slate-202 rounded-2xl p-6 shadow-sm text-left font-sans">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                    <span className="text-2xs font-extrabold text-slate-400 tracking-wider font-sans uppercase">Operational Alerts</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  </div>
                  
                  <div className="space-y-3.5 text-slate-800 font-sans">
                    <div className="flex gap-3 text-xs leading-tight font-sans">
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 shrink-0 text-xs">
                        🏋️
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-2xs leading-snug">3 workout logs submitted today</p>
                        <span className="text-[9px] text-[#001F3F] tracking-wide font-extrabold block mt-0.5 font-mono">AWAITING REVIEW IN HUB</span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs leading-tight">
                      <div className="w-7 h-7 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 shrink-0 text-xs font-sans">
                        🥦
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-2xs leading-snug">2 nutrition logs submitted today</p>
                        <span className="text-[9px] text-emerald-700 tracking-wide font-extrabold block mt-0.5 font-mono">AWAITING MEAL COMMENTS</span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs leading-tight font-sans">
                      <div className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 shrink-0 text-2xs font-bold font-sans">
                        RM
                      </div>
                      <div>
                        <p className="font-bold text-slate-855 text-2xs leading-snug">1 payment received (RM 1,080.00)</p>
                        <span className="text-[9px] text-teal-650 block mt-0.5 font-bold">Ahmad Ibrahim • INV-MY-0098 paid</span>
                      </div>
                    </div>

                    <div className="flex gap-3 text-xs leading-tight">
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-indigo-900" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-2xs leading-snug">1 booking request pending</p>
                        <span className="text-[9px] text-slate-400 block mt-0.5 font-medium">Slots review requested for SS15 Gym</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* 1B. NEW PAGE: COACHING HUB VIEW - CLIENTS REVIEWS WORKSPACE */}
        {activeTab === 'coaching-hub' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-left animate-fade-in"
          >
            {/* Coaching Hub Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-black font-display text-slate-900 flex items-center gap-2">
                  <ClipboardList className="w-5.5 h-5.5 text-indigo-900" />
                  <span>Coach Review Workspace</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Centralized hub for reviewing workout logs, daily calorie macros, progress comparison photos, and authorized AI recommendations.
                </p>
              </div>
              <div className="text-2xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                ⚡ Gate Controls Authorized
              </div>
            </div>

            {/* Main Workspace Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left 2 Columns containing reviews logs: workouts, nutrition, photos, AI recommendations */}
              <div className="lg:col-span-2 space-y-8 text-left">
                
                {/* SECTION A: WORKOUT LOGS AWAITING REVIEW */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-left">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-indigo-900" />
                      <h3 className="font-display font-medium text-slate-900 text-sm">
                        Workout Logs Awaiting Review
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 text-2xs font-extrabold uppercase font-mono rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                      {workouts.filter(w => !w.trainerFeedback).length || 3} Logs Pending
                    </span>
                  </div>

                  {workouts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No trainee workouts submitted today.</p>
                  ) : (
                    <div className="space-y-4">
                      {workouts.map((w) => (
                        <div key={w.id} className="border border-slate-150 rounded-xl p-4 bg-slate-50/70 text-slate-800">
                          <div className="flex justify-between items-start gap-2 mb-2 font-sans text-slate-800">
                            <div>
                              <span className="text-[9.5px] font-bold text-indigo-950 block uppercase tracking-wider">Ahmad Ibrahim • Subang Jaya</span>
                              <h4 className="font-bold text-slate-855 text-xs">{w.workoutType} Session Log</h4>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-2xs font-extrabold text-[#001F3F] bg-[#001F3F]/5 px-2 py-0.5 rounded-lg inline-block">⏱ {w.duration} mins</span>
                              <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-1 font-mono">Submitted: {w.date || '11 Jun 2026'}</p>
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2 my-2.5 text-2xs text-slate-800">
                            {w.exercises?.map((ex, idx) => (
                              <div key={idx} className="bg-white px-2.5 py-1.5 rounded border border-slate-100 text-slate-650 font-medium font-sans">
                                🏃 {ex.name || 'Core Stability Split'}: <strong className="text-slate-800">{ex.sets} sets</strong> × <strong className="text-slate-800">{ex.reps} reps</strong> {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                              </div>
                            ))}
                          </div>

                          {w.notes && (
                            <div className="text-2xs text-slate-700 bg-white p-3 rounded-lg border border-slate-150 mb-3 space-y-2">
                              <p className="font-semibold text-slate-800">📋 Trainee Active Notes:</p>
                              <p className="italic font-normal text-slate-600">&ldquo;{w.notes}&rdquo;</p>
                              
                              {/* Display extra fields */}
                              {(w.difficulties || w.painLevel || w.generalComments) && (
                                <div className="border-t border-slate-100 pt-2 space-y-1.5 mt-2 font-sans font-medium text-slate-500">
                                  {w.difficulties && (
                                    <p>⚠️ <strong className="text-slate-800">Difficulties:</strong> {w.difficulties}</p>
                                  )}
                                  {w.painLevel && (
                                    <p>
                                      ❗️ <strong className="text-slate-800">Discomfort Level:</strong>{' '}
                                      <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
                                        w.painLevel === 'Severe' || w.painLevel === 'Moderate'
                                          ? 'bg-rose-100 text-rose-700'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {w.painLevel}
                                      </span>
                                    </p>
                                  )}
                                  {w.generalComments && (
                                    <p>💭 <strong className="text-slate-800">Additional Comments:</strong> {w.generalComments}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Render Video Evidence Playback */}
                          {w.videoUrl && (
                            <div className="mb-3 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">📹 Submitter Video Proof :</span>
                              <div className="aspect-video max-w-sm rounded-xl overflow-hidden bg-slate-900 border border-slate-205">
                                <video 
                                  src={w.videoUrl} 
                                  controls 
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                />
                              </div>
                            </div>
                          )}

                          {w.trainerFeedback ? (
                            <div className="mt-2 bg-slate-100 border border-slate-150 text-slate-850 rounded-lg p-2.5 text-2xs text-left">
                              <p className="font-black mb-0.5 text-[9px] uppercase tracking-wider text-slate-500 font-sans">Your Dispatched Feedback Review ({w.status || 'Approved'}):</p>
                              <p className="italic font-sans">&ldquo;{w.trainerFeedback}&rdquo;</p>
                            </div>
                          ) : (
                            <div className="mt-3 flex flex-col gap-2 font-sans">
                              {replyingWorkoutId === w.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={workoutFeedbackText}
                                    onChange={(e) => setWorkoutFeedbackText(e.target.value)}
                                    placeholder="Provide coaching advice, alignment adjustments, or prescription directive amendments..."
                                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 focus:outline-[#001F3F] font-sans text-left"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingWorkoutId(null)}
                                      className="px-3 py-1 text-2xs font-bold text-slate-500 hover:bg-slate-100 rounded cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleWorkoutReply(w.id, 'Revision Requested');
                                        setCoachingFeed(prev => [
                                          { id: Date.now(), type: 'workout', text: `Revision requested on Ahmad Ibrahim's workout. Instructions: "${workoutFeedbackText}"`, time: 'Just now' },
                                          ...prev
                                        ]);
                                      }}
                                      className="bg-rose-500 hover:bg-rose-600 border border-rose-600 font-extrabold text-[#fff] text-2xs py-1.5 px-3.5 rounded-lg cursor-pointer transition shadow-sm"
                                    >
                                      ⚠️ Request Revision
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleWorkoutReply(w.id, 'Approved');
                                        setCoachingFeed(prev => [
                                          { id: Date.now(), type: 'workout', text: `Approved Ahmad Ibrahim's workout. Feedback: "${workoutFeedbackText}"`, time: 'Just now' },
                                          ...prev
                                        ]);
                                      }}
                                      className="bg-teal-600 hover:bg-teal-750 border border-teal-700 font-extrabold text-[#fff] text-2xs py-1.5 px-3.5 rounded-lg cursor-pointer transition shadow-sm"
                                    >
                                      ✓ Approve Workout
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => {
                                      setReplyingWorkoutId(w.id);
                                      setWorkoutFeedbackText('');
                                    }}
                                    className="bg-[#001F3F] hover:bg-indigo-950 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer font-sans"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-white" /> Review Workout & Send Feedback
                                  </button>
                                  <button
                                    onClick={() => {
                                      dbService.addWorkoutFeedback(w.id, "Excellent job completing this entire physical prescription. Your tempo and posture look incredibly aligned. Keep up the high standard!", "Approved");
                                      triggerToast("Workout marked as Approved! Automatic appraisal dispatched.", "success");
                                      fetchTrainerData();
                                      setCoachingFeed(prev => [
                                        { id: Date.now(), type: 'workout', text: `Workout log marked as Reviewed & Approved for ${w.workoutType}`, time: 'Just now' },
                                        ...prev
                                      ]);
                                    }}
                                    className="border border-slate-150 bg-white hover:bg-slate-100 text-slate-655 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer font-sans"
                                  >
                                    ✓ Instant Approve
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION B: NUTRITION LOGS AWAITING REVIEW */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-left">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-indigo-900" />
                      <h3 className="font-display font-medium text-slate-900 text-sm">
                        Nutrition Logs Awaiting Review
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 text-2xs font-extrabold uppercase font-mono rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                      {nutrition.filter(n => !n.trainerFeedback).length || 2} Logs Pending
                    </span>
                  </div>

                  {nutrition.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No trainee nutrition logs submitted.</p>
                  ) : (
                    <div className="space-y-4">
                      {nutrition.map((n) => (
                        <div key={n.id} className="border border-slate-155 rounded-xl p-4 bg-slate-50/70 text-slate-800 text-left">
                          <div className="flex justify-between items-start gap-2 mb-2 font-sans">
                            <div>
                              <span className="text-[9.5px] font-bold text-indigo-650 block uppercase">Client: Ahmad Ibrahim</span>
                              <h4 className="font-bold text-slate-855 text-xs">Meal: {n.foodName}</h4>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-2xs font-extrabold text-amber-900 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg inline-block font-mono animate-pulse">
                                🔥 {n.calories} kcal
                              </span>
                              <p className="text-[8.5px] text-slate-400 font-mono font-bold mt-1">Logged: {n.date || '11 Jun 2026'}</p>
                            </div>
                          </div>

                          <div className="flex gap-4 text-2xs text-slate-500 font-semibold my-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 font-sans">
                            <span>Carbs: <strong className="text-slate-850 font-bold font-mono">{n.carbs}g</strong></span>
                            <span>Protein: <strong className="text-emerald-700 font-bold font-mono">{n.protein}g</strong></span>
                            <span>Fat: <strong className="text-rose-700 font-bold font-mono">{n.fat}g</strong></span>
                          </div>

                          {n.notes && (
                            <p className="text-2xs italic text-slate-550 border-l-2 border-slate-205 pl-2 mb-3">
                              &ldquo;{n.notes}&rdquo;
                            </p>
                          )}

                          {n.trainerFeedback ? (
                            <div className="bg-slate-100 text-slate-850 rounded-lg p-3 text-2xs mt-2 border border-slate-150 text-left">
                              <p className="font-black mb-0.5 text-[9px] uppercase tracking-wider text-slate-555">Dietary Recommendation:</p>
                              <p className="italic font-sans">&ldquo;{n.trainerFeedback}&rdquo;</p>
                            </div>
                          ) : (
                            <div className="mt-3 flex flex-col gap-2 font-sans">
                              {replyingNutritionId === n.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={nutritionFeedbackText}
                                    onChange={(e) => setNutritionFeedbackText(e.target.value)}
                                    placeholder="Type comment or swap suggestion (e.g. swap white rice with quinoa)..."
                                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 focus:outline-[#001F3F] font-sans"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingNutritionId(null)}
                                      className="px-3 py-1 text-2xs font-bold text-slate-550 hover:bg-slate-100 rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleNutritionReply(n.id);
                                        // add to activity Feed
                                        setCoachingFeed(prev => [
                                          { id: Date.now(), type: 'nutrition', text: `Nutrition advice sent to Ahmad Ibrahim: "${nutritionFeedbackText}"`, time: 'Just now' },
                                          ...prev
                                        ]);
                                      }}
                                      className="bg-indigo-900 text-white font-bold text-2xs py-1 px-3.5 rounded"
                                    >
                                      Comment
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => {
                                      setReplyingNutritionId(n.id);
                                      setNutritionFeedbackText('');
                                    }}
                                    className="bg-indigo-900 hover:bg-slate-950 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer font-sans"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-white" /> Comment on Meal
                                  </button>
                                  <button
                                    onClick={() => {
                                      dbService.addNutritionFeedback(n.id, `Recommending healthier swap options. The caloric load matches targets, but swap simple carbs for fiber-dense vegetables.`);
                                      triggerToast("Strategic dietary swaps recommended successfully!", "success");
                                      fetchTrainerData();
                                      setCoachingFeed(prev => [
                                        { id: Date.now(), type: 'nutrition', text: `Dietary swaps recommended to Ahmad Ibrahim for meal: ${n.foodName}`, time: 'Just now' },
                                        ...prev
                                      ]);
                                    }}
                                    className="bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold py-1.5 px-3 rounded-lg transition hover:bg-teal-100 cursor-pointer font-sans font-sans"
                                  >
                                    🥦 Recommend Dietary Swaps
                                  </button>
                                  <button
                                    onClick={() => {
                                      dbService.addNutritionFeedback(n.id, "Perfect calorie and macro balance. Verified ✓");
                                      triggerToast("Marked daily nutritional log as Approved!", "success");
                                      fetchTrainerData();
                                      setCoachingFeed(prev => [
                                        { id: Date.now(), type: 'nutrition', text: `Dietary log authorized for Ahmad Ibrahim (${n.calories} kcal)`, time: 'Just now' },
                                        ...prev
                                      ]);
                                    }}
                                    className="border border-slate-150 bg-white hover:bg-slate-100 text-slate-655 text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer"
                                  >
                                    Mark Reviewed
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SECTION C: PROGRESS PHOTOS AWAITING REVIEW */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-left">
                  <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-3">
                    <Camera className="w-5 h-5 text-indigo-900" />
                    <div>
                      <h3 className="font-display font-medium text-slate-900 text-sm">
                        Progress Photos Awaiting Review
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Trainees visual physique timeline uploads pending coach feedback.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Photo Card 1 */}
                    <div className="border border-slate-150 bg-slate-50/55 p-4 rounded-2xl flex flex-col justify-between text-slate-850">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <strong className="text-slate-850 text-xs block font-bold">Ahmad Ibrahim</strong>
                            <span className="text-[10px] text-teal-605 font-bold bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-teal-200/60 font-sans">
                              Week 8 Visual Check
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">11 Jun 2026</span>
                        </div>
                        
                        {/* Mini thumbnails */}
                        <div className="grid grid-cols-2 gap-2 my-2.5">
                          <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=150" className="w-full h-24 object-cover rounded-lg grayscale border border-slate-100" alt="Before" />
                          <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=150" className="w-full h-24 object-cover rounded-lg border border-teal-200" alt="Current font-sans" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-sans">Comparing Base Week 1 against Current Week 8</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedPhotoTrainee(trainees[0] || { id: 'te_ahmad', name: 'Ahmad Ibrahim' } as any);
                            setPhotoFeedbackText('');
                          }}
                          className="flex-1 bg-indigo-900 hover:bg-slate-955 text-white text-2xs font-bold py-2 rounded-xl text-center cursor-pointer transition"
                        >
                          Compare & Feedback
                        </button>
                      </div>
                    </div>

                    {/* Photo Card 2 */}
                    <div className="border border-slate-150 bg-slate-50/55 p-4 rounded-2xl flex flex-col justify-between text-slate-850">
                      <div>
                        <div className="flex justify-between items-start mb-3 font-sans">
                          <div>
                            <strong className="text-slate-850 text-xs block font-bold font-sans">Mei Ling Tan</strong>
                            <span className="text-[10px] text-indigo-900 font-bold bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                              Week 4 Visual Check
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">09 Jun 2026</span>
                        </div>
                        
                        {/* Mini thumbnails */}
                        <div className="grid grid-cols-2 gap-2 my-2.5">
                          <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=150" className="w-full h-24 object-cover rounded-lg grayscale border border-slate-100" alt="Before" />
                          <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=150" className="w-full h-24 object-cover rounded-lg border border-indigo-200" alt="Current" />
                        </div>
                        <p className="text-[10px] text-slate-400">Comparing Base Week 1 against Current Week 4</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => {
                            const mei = trainees.find(t => t.id === 'te_ling') || { id: 'te_ling', name: 'Mei Ling Tan' } as any;
                            setSelectedPhotoTrainee(mei);
                            setPhotoFeedbackText('');
                          }}
                          className="flex-1 bg-indigo-900 hover:bg-slate-950 text-white text-2xs font-bold py-2 rounded-xl text-center cursor-pointer transition font-sans"
                        >
                          Compare & Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION D: AI RECOMMENDATIONS AWAITING APPROVAL */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm text-slate-800 text-left">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-900 animate-spin" />
                      <div>
                        <h3 className="font-display font-medium text-slate-900 text-sm">
                          AI Recommendations Awaiting Approval
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Mandatory premium certified coach verification gate.</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 border border-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded font-black font-mono font-sans">
                      HUMAN VERIFICATION REQUIRED
                    </span>
                  </div>

                  {/* Program specifications */}
                  <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-6 relative overflow-hidden mb-6 shadow-md text-left font-sans">
                    <div className="absolute right-2 bottom-2 text-7xl opacity-10 font-black tracking-widest text-[#001F3F] pointer-events-none">GEMINI</div>
                    <span className="bg-teal-400 text-[#001F3F] text-[9px] font-black px-2.5 py-0.5 rounded-full inline-block uppercase mb-2 animate-pulse">
                      RELIABLE METRIC GENERATION
                    </span>
                    <h4 className="font-display font-bold text-base text-white mb-1">
                      Ahmad Ibrahim • 3-Day Metabolic Strength Split
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed max-w-xl">
                      This plan was synthesized using client height (172cm), weight (70kg), and goals (Cardio Tone and Metabolic Stamina) targeted for local Selangor weather metrics.
                    </p>
                  </div>

                  {/* Review / Interactive Section */}
                  <div className="border border-indigo-150 rounded-2xl bg-indigo-50/40 p-5 space-y-4 font-sans text-slate-850">
                    <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                      <div>
                        <strong className="text-indigo-950 text-[#001F3F] text-sm block font-sans font-bold">HIIT Cardio Intervals & Calibrated Core Strength</strong>
                        <span className="text-[10px] text-slate-450 uppercase block mt-0.5 font-bold">Focus: Adipose Depletion & Lean Tone</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-250 font-sans">
                        Pending Trainer Gate
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-800">
                      {/* Day 1 */}
                      <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-sm">
                        <strong className="text-slate-800 text-[11px] block border-b pb-1.5 mb-2 font-bold font-sans">Day 1: Upper Chest & Core Burn</strong>
                        <ul className="space-y-1 text-slate-600 font-mono text-2xs leading-relaxed">
                          <li>⚡ Dumbbell Press: 3 sets × 12 reps @ 18kg</li>
                          <li>⚡ Push-ups (Tempo Control): 3 sets × 15 reps</li>
                          <li>⚡ Dynamic Mountain Climbers: 3 sets × 30 seconds</li>
                        </ul>
                      </div>

                      {/* Day 2 */}
                      <div className="bg-white p-3.5 border border-slate-200 rounded-xl shadow-sm">
                        <strong className="text-slate-805 text-[11px] block border-b pb-1.5 mb-2 font-bold font-sans">Day 2: Posterior Chain Strength</strong>
                        <ul className="space-y-1 text-slate-600 font-mono text-2xs leading-relaxed">
                          <li>⚡ Dumbbell Romanian Deadlifts: 3 sets × 10 reps @ 24kg</li>
                          <li>⚡ Goblet Squats (Deep Hip Control): 3 sets × 12 reps @ 16kg</li>
                          <li>⚡ Hanging Abdominal Leg Raises: 3 sets × 10 reps</li>
                        </ul>
                      </div>

                      {/* Coach tips */}
                      <div className="bg-[#001F3F] text-slate-50 p-4 rounded-xl text-2xs space-y-1 text-left">
                        <span className="text-teal-400 font-black block tracking-wide font-sans">🇲🇾 Coach Tactical Tips:</span>
                        <p>1. Rest exactly 45 seconds between exercises to optimize post-activation potentiation.</p>
                        <p>2. Complete under indoor air-conditioned studio during active solar midday heat alerts.</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-indigo-150 pt-4 flex flex-wrap gap-2 justify-between">
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            triggerToast("Gemini Workout Suggestion successfully APPROVED & signed!", "success");
                            // Send custom message
                            dbService.createChatMessage({
                              senderId: 'u_sarah',
                              receiverId: 'u_ahmad',
                              message: `✨ [Authorized AI Coach Optimizer Plan] I have approved your new 3-day training split! Focus is HIIT Cardio Intervals and Calibrated Core. Go to your workouts tab to review details!`
                            });
                            setCoachingFeed(prev => [
                              { id: Date.now(), type: 'ai', text: 'Approved AI Custom 3-Day Workout prescription for Ahmad Ibrahim', time: 'Just now' },
                              ...prev
                            ]);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-2xs py-2 px-3.5 rounded-lg transition shrink-0 cursor-pointer font-sans"
                        >
                          ✓ Approve & Dispatch
                        </button>
                        <button
                          onClick={() => {
                            triggerToast("AI Proposal has been edited and signed with coach corrections done.", "success");
                            setCoachingFeed(prev => [
                              { id: Date.now(), type: 'ai', text: 'Edited & Signed AI Routine split modifications for Ahmad Ibrahim', time: 'Just now' },
                              ...prev
                            ]);
                          }}
                          className="bg-slate-200 hover:bg-slate-350 text-slate-855 font-extrabold text-2xs py-2 px-3 rounded-lg transition shrink-0 cursor-pointer font-sans"
                        >
                          Modify & Approve
                        </button>
                        <button
                          onClick={() => {
                            triggerToast("AI suggestion has been flagged as Rejected.", "info");
                            setCoachingFeed(prev => [
                              { id: Date.now(), type: 'ai', text: 'Rejected AI template proposal to regenerate focus', time: 'Just now' },
                              ...prev
                            ]);
                          }}
                          className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-2xs py-2 px-3 rounded-lg transition shrink-0 cursor-pointer font-sans"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* SECTION E: RECENT COACHING ACTIVITY FEED (Right Column) */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-sm font-sans">
                  <h3 className="font-sans font-black text-xs text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Activity className="w-4 h-4 text-[#001F3F]" />
                    <span>Recent Coaching Activity Feed</span>
                  </h3>

                  <div className="space-y-4 text-left">
                    {coachingFeed.map((f) => (
                      <div key={f.id} className="flex gap-2.5 items-start text-xs leading-normal font-sans">
                        <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 text-2xs mt-0.5 ${
                          f.type === 'workout' ? 'bg-indigo-50 text-indigo-700 font-bold' :
                          f.type === 'nutrition' ? 'bg-emerald-50 text-emerald-700 font-bold' :
                          f.type === 'photo' ? 'bg-purple-100 text-purple-750 font-bold' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {f.type === 'workout' ? '🏋️' :
                           f.type === 'nutrition' ? '🥦' :
                           f.type === 'photo' ? '📸' : '✨'}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 leading-snug font-medium font-sans">{f.text}</p>
                          <span className="text-[9px] text-slate-450 font-bold uppercase font-mono">{f.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-950 text-white rounded-2xl p-5 border border-indigo-900 shadow-xl space-y-3 font-sans text-left">
                  <span className="text-[10px] tracking-widest font-black uppercase text-teal-400 block font-mono">Coach Checklist Guideline</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    Always consult your clients during visual reviews or when modifying AI optimization. Provide encouraging swaps and hydrate continuously.
                  </p>
                  <button
                    onClick={() => {
                      triggerToast("Opened internal SS15 studio syllabus PDF mockup.");
                    }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-2xs font-extrabold uppercase py-2.5 rounded-xl border border-white/20 transition cursor-pointer"
                  >
                    View Studio Syllabus
                  </button>
                </div>
              </div>

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
              className="space-y-8"
            >
              {/* Header description */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black font-display text-slate-900">Searchable Trainees Roster</h3>
                  <p className="text-xs text-slate-500">Manage logs, metrics, attendance and AI workouts optimization for each trainee.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search trainees by name, package or goal..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-[#001F3F]"
                  />
                </div>
              </div>

              {/* Segmented Filter Control Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left font-sans shadow-sm">
                <div>
                  <span className="block text-[10px] font-black uppercase text-indigo-950 tracking-wider mb-0.5">
                    Client prioritization filter
                  </span>
                  <p className="text-2xs text-slate-500 leading-normal">
                    {clientFilterMode === 'consistency' 
                      ? "Arrange by lowest completion rates first. Targets non-consistent or lagging attendees first."
                      : "Arrange by outstanding accounts first. Targets users with high unpaid invoices and overdue status."
                    }
                  </p>
                </div>
                <div className="flex bg-slate-200/60 p-1 rounded-xl shrink-0">
                  <button 
                    onClick={() => setClientFilterMode('consistency')}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition cursor-pointer ${
                      clientFilterMode === 'consistency' ? 'bg-[#001F3F] text-teal-400 shadow-sm font-black' : 'text-slate-600 hover:text-slate-905 font-medium'
                    }`}
                  >
                    🏋️ Workout Consistency
                  </button>
                  <button 
                    onClick={() => setClientFilterMode('payment')}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition cursor-pointer ${
                      clientFilterMode === 'payment' ? 'bg-[#001F3F] text-teal-400 shadow-sm font-black' : 'text-slate-600 hover:text-slate-905 font-medium'
                    }`}
                  >
                    💰 Payment Status
                  </button>
                </div>
              </div>

              {/* Clients Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Pending Invitations list with 'Pend' label */}
                {trainerInvitations.filter(inv => inv.status === 'Pending').map((inv) => (
                  <div 
                    key={inv.id}
                    className="bg-slate-50 border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-2xl p-5 shadow-sm text-left flex flex-col justify-between transition-all"
                  >
                    <div>
                      {/* Trainee Card upper */}
                      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 mb-3.5">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-700 shrink-0 font-bold font-sans border border-amber-100">
                          ✉️
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-slate-800 text-sm truncate">{inv.traineeEmail}</h4>
                          <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200/50 uppercase tracking-wide font-sans">
                            Pend
                          </span>
                        </div>
                      </div>

                      {/* Info specs */}
                      <div className="space-y-1.5 text-2xs mb-4 text-slate-600 font-sans">
                        <p><strong className="text-slate-700">Offered Package:</strong> {inv.packageName}</p>
                        <p><strong className="text-slate-700">Contract Sessions:</strong> {inv.sessions} sessions</p>
                        <p><strong className="text-slate-700">Price Quote:</strong> RM{inv.price}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-wide">Issued: {inv.date}</p>
                      </div>
                    </div>

                    <div className="bg-amber-50/50 rounded-xl p-2.5 border border-amber-100/50 text-center text-[10px] text-amber-900 font-semibold leading-relaxed font-sans">
                      Awaiting onboarding acceptance inside client dashboard.
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
                      className="bg-white border-2 border-transparent hover:border-teal-500/40 rounded-2xl p-5 shadow-sm text-left transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        {/* Trainee Card upper */}
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3.5 justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              referrerPolicy="no-referrer"
                              src={t.avatarUrl} 
                              className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0" 
                              alt={t.name} 
                            />
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-800 text-sm truncate">{t.name}</h4>
                              <span className="text-[10px] text-teal-650 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full">
                                Streak: {t.streakCount} Days
                              </span>
                            </div>
                          </div>
                          
                          {/* Dynamic Badge based on Filter state */}
                          <div className="shrink-0">
                            {clientFilterMode === 'consistency' 
                              ? getConsistencyBadge(stats.completionRate)
                              : getPaymentBadge(stats.paymentStatus)
                            }
                          </div>
                        </div>

                        {/* Info details switching by Filter mode */}
                        {clientFilterMode === 'consistency' ? (
                          <div className="space-y-2 text-2xs mb-4 font-sans text-slate-600">
                            <p className="line-clamp-1">
                              <strong className="text-slate-700">Fitness Goal:</strong> {t.goals}
                            </p>
                            
                            <div className="flex items-center gap-2 pt-1 font-sans">
                              <span className="text-slate-500">Routines Rate:</span>
                              <div className="flex-1 bg-slate-150 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  stats.completionRate >= 75 ? 'bg-teal-500' : stats.completionRate >= 50 ? 'bg-amber-405' : 'bg-rose-500'
                                }`} style={{ width: `${stats.completionRate}%` }}></div>
                              </div>
                              <strong className="text-slate-800 font-bold font-mono">{stats.completionRate}%</strong>
                            </div>

                            <p><strong className="text-slate-700">Assigned Workouts Completed:</strong> {stats.completedWorkouts || 0}</p>
                            <p><strong className="text-slate-700">Missed Workouts:</strong> <span className="font-bold text-rose-600 font-mono">{stats.missedWorkouts || 0}</span></p>
                            <p className="truncate"><strong className="text-slate-700">Last Workout Date:</strong> <span className="font-mono text-slate-800 font-bold">{stats.lastWorkoutDate || 'N/A'}</span></p>
                          </div>
                        ) : (
                          <div className="space-y-2 text-2xs mb-4 font-sans text-slate-600">
                            <p className="truncate">
                              <strong className="text-slate-700">Product Package:</strong> <span className="font-extrabold text-indigo-950">{stats.packageName || 'PT Package'}</span>
                            </p>
                            <p><strong className="text-slate-700">Outstanding Fee amount:</strong> <span className="font-black text-rose-600 font-mono text-xs">RM {stats.outstandingAmount || 0}</span></p>
                            <p><strong className="text-slate-700">Invoices count:</strong> {stats.invoiceCount || 0}</p>
                            <p className="truncate"><strong className="text-slate-700">Next billing Date due:</strong> <span className="font-mono text-slate-850 font-bold">{stats.dueDate || 'N/A'}</span></p>
                          </div>
                        )}

                        {/* Workouts History Preview */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 text-[10px] font-sans">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">🏋️ Workouts History</span>
                          <div className="space-y-1">
                            {workouts.filter(w => w.traineeId === t.id).slice(0, 2).map((w, idx) => (
                              <div key={idx} className="bg-slate-50/70 p-1.5 rounded border border-slate-100 flex justify-between">
                                <span className="font-bold text-slate-700 truncate max-w-[130px]">{w.workoutType} Session</span>
                                <span className="text-slate-400 shrink-0 font-mono text-[9px]">{w.date}</span>
                              </div>
                            ))}
                            {workouts.filter(w => w.traineeId === t.id).length === 0 && (
                              <p className="text-slate-400 italic text-2xs">No logged workouts yet</p>
                            )}
                          </div>
                        </div>

                        {/* Nutrition History Preview */}
                        <div className="mt-3 text-[10px] pb-2 font-sans">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">🥗 Nutrition History</span>
                          <div className="space-y-1">
                            {nutrition.filter(n => n.traineeId === t.id).slice(0, 2).map((n, idx) => (
                              <div key={idx} className="bg-slate-50/70 p-1.5 rounded border border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-700 truncate max-w-[120px]">{n.foodName}</span>
                                <span className="text-teal-600 font-extrabold shrink-0 font-mono text-[9px]">{n.calories} kcal</span>
                              </div>
                            ))}
                            {nutrition.filter(n => n.traineeId === t.id).length === 0 && (
                              <p className="text-slate-400 italic text-2xs">No logged meals yet</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom layout */}
                      <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2 font-sans">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          stats.paymentStatus === 'Paid' ? 'bg-teal-50 border border-teal-200 text-teal-850' : 'bg-rose-50 border border-rose-200 text-rose-850'
                        }`}>
                          🇲🇾 Account: {stats.paymentStatus}
                        </span>
                        <button 
                          className="text-[#001F3F] hover:text-slate-900 text-2xs font-extrabold flex items-center gap-0.5 cursor-pointer"
                        >
                          Deep Profile Detail <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
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
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 text-left font-sans mt-8 shadow-sm">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Need to Unassign a Client?</h4>
                <p className="text-xs text-slate-500">Unassign any client from your active list. The client user account is preserved, and historical logs, bills, and check-ins are protected.</p>
              </div>
              <button
                onClick={() => {
                  setRemoveClientSearch('');
                  setShowRemoveClientModal(true);
                }}
                className="bg-rose-50 border border-rose-250 text-rose-700 hover:bg-rose-100/80 font-extrabold px-5 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm shrink-0 transition"
              >
                🗑 Remove Client Option
              </button>
            </div>

            {/* Remove Client Modal */}
            {showRemoveClientModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl relative border border-slate-100 text-left overflow-hidden">
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
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-left">
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
                <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
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
                    className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
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
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-teal-500" /> AI Coach Optimizer
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

                          {/* Physical Check-In Dates History */}
                          <div>
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2.5 font-display">QR Code Scan Attendance Log</h4>
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
                                  <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                                    <div>
                                      <strong className="text-slate-800 text-sm">{n.foodName}</strong>
                                      <span className="text-slate-400 text-[9px] block font-bold capitalize mt-0.5">{n.date} meal log</span>
                                    </div>
                                    <span className="text-xs font-black text-teal-800 bg-teal-50 px-2 mt-0.5 py-0.5 rounded flex gap-1">
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

                      {/* TAB 5: AI COACH OPTIMIZER */}
                      {traineeDetailTab === 'ai' && (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-950 relative overflow-hidden text-left shadow-lg">
                            <span className="absolute right-1 bottom-1 text-5xl opacity-10 pointer-events-none text-slate-500">✨</span>
                            <span className="bg-teal-400 text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block mb-2">
                              POWERED BY GEMINI 3.5 FLASH
                            </span>
                            <h4 className="font-display font-bold text-sm text-white mb-1">
                              Custom AI Workout Optimizer
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
                              className="bg-teal-400 hover:bg-teal-500 text-slate-955 text-2xs font-extrabold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 text-slate-955 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-slate-955 animate-spin" />
                              <span>{loadingAi ? 'Consolidating client profile metrics...' : 'Deploy Gemini Coach Optimization'}</span>
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
                                        message: `✨ [Gemini AI Coach Optimizer] Here is your personalized prescription:\n\n${aiRecommendation.workoutName}\nFocus: ${aiRecommendation.focus}\nTips:\n- ${aiRecommendation.tips?.join('\n- ')}`
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
        {activeTab === 'revenue' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Page Header */}
            <div>
              <h3 className="text-2xl font-black font-display text-slate-900">Payments & Revenue Command Terminal</h3>
              <p className="text-xs text-slate-500">Track trainer service billing packets, overdue invoices, and monthly earnings breakdown inside Malaysian Ringgit (MYR).</p>
            </div>

            {/* LOWER COCH REVENUE ANALYTICS DASHBOARD CARD GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Accumulated Invoiced</span>
                <strong className="text-slate-800 text-xl font-black font-sans leading-none block mt-1">RM {totalInvoiced.toFixed(2)}</strong>
                <p className="text-[9px] text-slate-400 mt-1.5">{billingList.length} global issued packets</p>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full inline-block font-extrabold uppercase">Paid & Cleared</span>
                <strong className="text-emerald-600 text-xl font-black font-sans leading-none block mt-1.5">RM {paidSumRevenue.toFixed(2)}</strong>
                <p className="text-[9px] text-slate-400 mt-1.5">No tax withholding deducted</p>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-150 px-2 py-0.5 rounded-full inline-block font-extrabold uppercase">Pending Intake</span>
                <strong className="text-amber-600 text-xl font-black font-sans leading-none block mt-1.5">RM {pendingSumRevenue.toFixed(2)}</strong>
                <p className="text-[9px] text-slate-400 mt-1.5">{billingList.filter(b => b.status === 'Pending').length} active sandboxes due</p>
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-left">
                <span className="text-[10px] text-rose-800 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full inline-block font-extrabold uppercase">Overdue Balance</span>
                <strong className="text-rose-600 text-xl font-black font-sans leading-none block mt-1.5">RM {overdueSumRevenue.toFixed(2)}</strong>
                <p className="text-[9px] text-slate-400 mt-1.5">{billingList.filter(b => b.status === 'Overdue').length} immediate actions required</p>
              </div>
            </div>

            {/* BENTO GRAPHIC STATS: TRENDS & BREAKDOWNS */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Left stat card: Custom SVG Trend Chart */}
              <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl text-left shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-display font-medium text-slate-800 text-sm">Monthly Revenue Trend Chart</h4>
                    <p className="text-[10px] text-slate-400">Total earnings plotted across first-half months.</p>
                  </div>
                  <span className="text-[9px] font-bold bg-[#001F3F]/10 text-[#001F3F] px-2.5 py-1 rounded">2026 Sandbox Data</span>
                </div>

                {/* Aesthetic SVG Plot */}
                <div className="w-full relative h-48 bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-end justify-between font-sans">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none opacity-20">
                    <div className="border-b border-slate-400 w-full h-0"></div>
                    <div className="border-b border-slate-400 w-full h-0"></div>
                    <div className="border-b border-slate-400 w-full h-0"></div>
                  </div>

                  {/* Columns */}
                  {[
                    { month: "Jan", amt: 1200, pct: '30%' },
                    { month: "Feb", amt: 1850, pct: '45%' },
                    { month: "Mar", amt: 2200, pct: '58%' },
                    { month: "Apr", amt: 2900, pct: '75%' },
                    { month: "May", amt: 2310, pct: '60%' },
                    { month: "Jun", amt: 3240, pct: '92%' }
                  ].map((item, id) => (
                    <div key={id} className="flex flex-col items-center justify-end h-36 flex-1 relative group">
                      {/* Tooltip on hover */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none transition duration-150 z-10 font-bold whitespace-nowrap">
                        RM {item.amt}
                      </span>
                      {/* Bar fill wrapper to compute percentage with fixed height */}
                      <div className="w-8 sm:w-10 bg-slate-100/85 rounded-lg flex items-end h-[100px] mb-1.5">
                        <div 
                          className="w-full bg-[#001F3F] hover:bg-teal-500 rounded-lg transition-all duration-300 cursor-pointer" 
                          style={{ height: item.pct }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right stat card: package breakdown & top clients */}
              <div className="space-y-6 text-left">
                
                {/* Pack split bar */}
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Package Category breakdown</h4>
                  <div className="flex bg-slate-100 h-3.5 rounded-full overflow-hidden mb-3">
                    <div className="bg-[#001F3F] h-full" style={{ width: '70%' }} title="Monthly Pack"></div>
                    <div className="bg-teal-500 h-full" style={{ width: '30%' }} title="Single coaching"></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#001F3F] rounded-full inline-block"></span> Monthly Pack (70%)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-500 rounded-full inline-block"></span> Single Hour (30%)</span>
                  </div>
                </div>

                {/* Top payers */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-2.5">Top-Paying Roster Clients</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600 font-sans">1.</span>
                        <span className="font-bold">Ahmad bin Ibrahim</span>
                      </div>
                      <span className="text-[#001F3F] font-black">RM 2,310.00</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-650 font-sans">2.</span>
                        <span className="font-bold">Mei Ling Tan</span>
                      </div>
                      <span className="text-[#001F3F] font-black">RM 1,230.00</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs opacity-70">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-655 font-sans">3.</span>
                        <span className="font-medium">Muhammad Faizul</span>
                      </div>
                      <span className="text-[#001F3F] font-semibold">RM 0.00 (Due)</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* BILLING RECORD DATA TABLE SECTION */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm text-left overflow-hidden">
              
              {/* Filters Header toolbar */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                {/* Status sub tabs */}
                <div className="flex gap-1 bg-white p-1 rounded-xl shadow-inner border border-slate-200">
                  {['All', 'Paid', 'Pending', 'Overdue'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPaymentSubTab(tab as any)}
                      className={`px-3 py-1.5 font-bold rounded-lg transition duration-75 uppercase text-[10px] tracking-wide cursor-pointer ${
                        paymentSubTab === tab ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-500 hover:text-[#001F3F]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Dropdown selectors */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  
                  {/* Month */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <span>Month:</span>
                    <select 
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-700"
                    >
                      <option value="All">All Months</option>
                      <option value="June">June 2026</option>
                      <option value="May">May 2026</option>
                    </select>
                  </div>

                  {/* Pack */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <span>Package:</span>
                    <select 
                      value={filterPackage}
                      onChange={(e) => setFilterPackage(e.target.value)}
                      className="bg-white border border-slate-200 rounded px-2.5 py-1 text-slate-700"
                    >
                      <option value="All">All Packages</option>
                      <option value="Monthly">Monthly Pack</option>
                      <option value="Single">Single Hour Slot</option>
                    </select>
                  </div>

                  {/* Export button */}
                  <button 
                    onClick={handleExportPayments}
                    className="bg-[#001F3F] hover:bg-slate-900 border border-slate-950 text-teal-400 font-extrabold uppercase text-[10px] tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Record
                  </button>

                </div>
              </div>

              {/* Responsive Billing Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100/50 text-slate-500 font-bold text-[11px] border-b border-slate-100 uppercase">
                    <tr>
                      <th className="px-6 py-4">Trainee Name / ID</th>
                      <th className="px-6 py-4">Invoice Packet</th>
                      <th className="px-6 py-4">Unit Rates</th>
                      <th className="px-6 py-4">Due Target Date</th>
                      <th className="px-6 py-4">Audit Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredBilling.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <span className="font-extrabold text-slate-800 block text-xs">{b.traineeName}</span>
                          <span className="text-[10px] text-slate-450 font-mono text-slate-400">{b.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-indigo-950 font-bold block">{b.packageName}</span>
                          <span className="text-[10px] font-bold text-slate-400 font-mono">#{b.invoiceNo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <strong className="text-slate-800">RM {b.amount}.00</strong>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-500">{b.dueDate}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded font-black text-[10px] ${
                            b.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            b.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center gap-1.5">
                            <button 
                              onClick={() => {
                                setSelectedInvoice(b);
                                setSelectedInvoiceDocMode('invoice');
                              }}
                              className="bg-slate-800 hover:bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1.5 rounded cursor-pointer flex items-center gap-1"
                            >
                              <span>Invoice PDF</span>
                            </button>
                            
                            {b.status === 'Paid' && (
                              <button 
                                onClick={() => {
                                  setSelectedInvoice(b);
                                  setSelectedInvoiceDocMode('receipt');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded cursor-pointer flex items-center gap-1"
                              >
                                <span>Receipt PDF</span>
                              </button>
                            )}
                            
                            {b.status !== 'Paid' && (
                              <button 
                                onClick={() => handleSendReminder(b.traineeName)}
                                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-650 text-[10px] px-2.5 py-1.5 rounded cursor-pointer"
                              >
                                Send Reminder
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredBilling.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 text-xs">
                          No matching billing logs or outstanding packets recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BILLING INVOICE ITEM DETAIL Dialog Modal transformed into a Right-Side Drawer */}
            <AnimatePresence>
              {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex justify-end">
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs cursor-pointer"
                    onClick={() => setSelectedInvoice(null)}
                  />

                  {/* Drawer content panel */}
                  <motion.div 
                    initial={{ x: "100%", opacity: 0.9 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-sm sm:max-w-md md:w-[400px] h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between z-10 sm:rounded-l-3xl overflow-hidden"
                  >
                    {/* Header bar / Close Icon */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-550 bg-slate-900 text-white shrink-0">
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] bg-teal-500 text-slate-950 px-2 py-1 rounded">
                          {selectedInvoiceDocMode === 'receipt' ? 'Receipt' : 'Invoice'}
                        </span>
                        <span className="text-xs font-bold text-slate-200 font-mono">
                          #{selectedInvoice.invoiceNo}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedInvoice(null)}
                        className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition cursor-pointer"
                        title="Close preview"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Switcher Tabs at top of Drawer */}
                    <div className="bg-slate-100/65 p-2.5 flex gap-2 border-b border-slate-200 shrink-0">
                      <button 
                        onClick={() => setSelectedInvoiceDocMode('invoice')}
                        className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all uppercase tracking-wider ${
                          selectedInvoiceDocMode === 'invoice'
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/85'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                      
                      {selectedInvoice.status === 'Paid' ? (
                        <button 
                          onClick={() => setSelectedInvoiceDocMode('receipt')}
                          className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all uppercase tracking-wider ${
                            selectedInvoiceDocMode === 'receipt'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200/85'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      ) : (
                        <div className="flex-1 text-center py-1.5 text-[9px] uppercase font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg tracking-wider select-none flex items-center justify-center cursor-not-allowed">
                          Receipt Lock (Unpaid)
                        </div>
                      )}
                    </div>

                    {/* Scrollable Document Sandbox Paper Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {selectedInvoiceDocMode === 'receipt' && selectedInvoice.status === 'Paid' ? (
                        /* Receipt Paper layout */
                        <div className="space-y-6 relative text-left">
                          
                          {/* Stamp watermark */}
                          <div className="absolute right-2 top-10 opacity-15 pointer-events-none transform rotate-12 bg-emerald-100 border-4 border-dashed border-emerald-500 rounded-xl p-3 text-center text-emerald-800 font-black tracking-widest text-lg z-0 fire-stamp">
                            CLEARED & PAID
                          </div>

                          {/* CoachTrack MY Official Receipt Branding */}
                          <div className="text-center pb-4 border-b border-emerald-100 relative">
                            <h4 className="font-sans font-black tracking-widest text-[#001F3F] text-lg uppercase inline-block font-sans">
                              COACHTRACK MY
                            </h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-medium font-sans">
                              Track • Improve • Achieve
                            </p>
                            <div className="bg-emerald-600 text-white font-black text-[11px] tracking-widest mx-auto my-3.5 px-4 py-1.5 rounded-lg inline-block font-mono uppercase">
                              OFFICIAL RECEIPT
                            </div>
                          </div>

                          {/* Info Rows */}
                          <div className="space-y-3.5 py-2 text-xs">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Receipt No:</span>
                              <span className="text-slate-900 font-bold font-mono">RCP-{selectedInvoice.invoiceNo}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Invoice No:</span>
                              <span className="text-slate-900 font-bold font-mono">{selectedInvoice.invoiceNo}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Trainee Name:</span>
                              <span className="text-slate-900 font-bold">{selectedInvoice.traineeName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Trainer Name:</span>
                              <span className="text-slate-900 font-bold">{trainerProfile.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Package:</span>
                              <span className="text-slate-900 font-bold text-right max-w-[200px] truncate">{selectedInvoice.packageName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Payment Date:</span>
                              <span className="text-slate-900 font-bold font-mono">{selectedInvoice.dueDate}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Payment Method:</span>
                              <span className="text-slate-900 font-bold">FPX Online Banking</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Amount Paid:</span>
                              <span className="text-emerald-700 font-black text-sm">RM {selectedInvoice.amount}.00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Payment Status:</span>
                              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black uppercase font-sans">Paid</span>
                            </div>
                          </div>

                          {/* Address notes block */}
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-sans">
                            <strong>Service Registry Match:</strong> {trainerProfile.name} ({trainerProfile.discipline}) is a licensed independent CoachTrack provider. Verified secure checkout settlement.
                          </div>

                          {/* Compliance authentication stamp */}
                          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 leading-normal font-mono">
                            Authenticated match ID: AUTH-{selectedInvoice.invoiceNo.toUpperCase()}
                          </div>

                        </div>
                      ) : (
                        /* Invoice Paper layout */
                        <div className="space-y-6 text-left">
                          
                          {/* CoachTrack MY Invoice Branding */}
                          <div className="text-center pb-4 border-b border-slate-105 border-slate-100">
                            <h4 className="font-sans font-black tracking-widest text-[#001F3F] text-lg uppercase inline-block font-sans">
                              COACHTRACK MY
                            </h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 font-medium font-sans">
                              Track • Improve • Achieve
                            </p>
                            <div className="bg-slate-900 text-teal-400 font-black text-[11px] tracking-widest mx-auto my-3.5 px-4 py-1.5 rounded-lg inline-block font-mono uppercase">
                              INVOICE
                            </div>
                          </div>

                          {/* Info Rows */}
                          <div className="space-y-3.5 py-2 text-xs">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Invoice No:</span>
                              <span className="text-slate-900 font-bold font-mono">{selectedInvoice.invoiceNo}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Trainee Name:</span>
                              <span className="text-slate-900 font-bold">{selectedInvoice.traineeName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Trainer Name:</span>
                              <span className="text-slate-900 font-bold">{trainerProfile.name}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Package:</span>
                              <span className="text-slate-900 font-bold text-right max-w-[200px] truncate">{selectedInvoice.packageName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Due Date:</span>
                              <span className="text-slate-900 font-bold font-mono">{selectedInvoice.dueDate}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Amount Due:</span>
                              <span className="text-[#001F3F] font-black text-sm">RM {selectedInvoice.amount}.00</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                              <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider">Payment Status:</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-sans ${
                                selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                selectedInvoice.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>{selectedInvoice.status}</span>
                            </div>
                          </div>

                          {/* Bank settlement block */}
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-500 leading-relaxed font-sans">
                            <strong>Payment Guidelines:</strong> In Sandbox mode, click Quick Swapper demo tags above to process virtual checkouts. For live mode, trainee receives immediate email item alerts.
                          </div>

                          {/* Footnote */}
                          <p className="text-[10px] text-slate-400 leading-normal font-sans">
                            Coach Sarah Tan Registry • SS15 Studio • Selangor, Malaysia
                          </p>

                        </div>
                      )}
                    </div>

                    {/* Paper Footer actions inside Drawer */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2.5 shrink-0">
                      <button 
                        onClick={() => setSelectedInvoice(null)}
                        className="flex-1 py-3 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition duration-75 text-center cursor-pointer font-sans"
                      >
                        Close
                      </button>
                      <button 
                        onClick={() => {
                          const isReceipt = selectedInvoiceDocMode === 'receipt' && selectedInvoice.status === 'Paid';
                          triggerToast(`Successfully downloaded ${isReceipt ? 'Receipt' : 'Invoice'} PDF (#${selectedInvoice.invoiceNo})!`);
                        }}
                        className={`flex-1 py-3 text-white font-black text-xs rounded-xl transition duration-75 text-center cursor-pointer shadow-sm font-sans ${
                          selectedInvoiceDocMode === 'receipt' && selectedInvoice.status === 'Paid'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-slate-900 hover:bg-black'
                        }`}
                      >
                        Download {selectedInvoiceDocMode === 'receipt' && selectedInvoice.status === 'Paid' ? 'Receipt PDF' : 'Invoice PDF'}
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 3.1 COMPREHENSIVE COACHING SESSION HISTORY REGISTER */}
        {activeTab === 'session-history' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 animate-fade-in text-left"
          >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-2xl font-black font-display text-slate-900">📅 Coaching Session History Registry</h3>
                <p className="text-xs text-slate-500">Log, audit, and track booking attendance sheets, QR checkless sign-ins, and physical classroom feedback notes.</p>
              </div>
              
              {/* Filter controls */}
              <div className="flex bg-slate-150 p-1 rounded-xl shrink-0">
                {(['All', 'Upcoming', 'Completed', 'Cancelled/Missed'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setSessionFilter(filterOption)}
                    className={`px-3 py-1.5 rounded-lg text-2xs font-extrabold transition cursor-pointer ${
                      sessionFilter === filterOption 
                        ? 'bg-[#001F3F] text-teal-400 shadow-sm font-black' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            {/* LOWER SESSION HISTORY LIST GRID */}
            <div className="space-y-4">
              {sessions
                .filter(s => {
                  if (sessionFilter === 'All') return true;
                  if (sessionFilter === 'Upcoming') return s.status === 'Upcoming';
                  if (sessionFilter === 'Completed') return s.status === 'Completed';
                  if (sessionFilter === 'Cancelled/Missed') return s.status === 'Cancelled' || s.status === 'Missed';
                  return true;
                })
                .map((s) => (
                  <div 
                    key={s.id}
                    className="bg-white border border-slate-200 hover:border-teal-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition text-left flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Session main specs */}
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          s.status === 'Upcoming' ? 'bg-yellow-50 border border-yellow-250 text-yellow-850' :
                          s.status === 'Completed' ? 'bg-emerald-50 border border-emerald-250 text-emerald-850' :
                          s.status === 'Cancelled' ? 'bg-rose-50 border border-rose-250 text-rose-850' :
                          'bg-indigo-50 border border-indigo-200 text-indigo-850'
                        }`}>
                          ● {s.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-full">
                          🏃 {s.type} Class
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-display font-black text-slate-850 text-base leading-tight truncate">{s.title}</h4>
                        <p className="text-xs text-slate-550 pt-0.5 font-sans flex items-center gap-1.5 flex-wrap">
                          <span>📅 {s.date}</span>
                          <span className="text-slate-300">|</span>
                          <span>⏰ {s.timeSlot}</span>
                          <span className="text-slate-300">|</span>
                          <span className="font-medium text-slate-600">📍 {s.location}</span>
                        </p>
                      </div>

                      {/* Registered Trainees */}
                      <div className="pt-2 border-t border-slate-100 text-left">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
                          Registered Trainees & Presence Checked:
                        </span>
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {s.registeredTrainees.map((st, idx) => {
                            let badgeStyle = "bg-slate-55 border border-slate-150 text-slate-600";
                            if (s.status === 'Upcoming') {
                              badgeStyle = "bg-teal-50/50 border border-teal-100/50 text-teal-705";
                            } else if (st.presence === 'Present') {
                              badgeStyle = "bg-emerald-50 border border-emerald-150 text-emerald-800";
                            } else if (st.presence === 'Absent') {
                              badgeStyle = "bg-rose-50 border border-rose-150 text-rose-800 font-bold";
                            }
                            return (
                              <span key={idx} className={`text-[10px] font-extrabold px-3 py-1 rounded-lg ${badgeStyle}`}>
                                🙎 {st.name} {st.presence !== 'Registered' && `• ${st.presence}`}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Audit Details */}
                      {(s.feedback || s.cancelReason || s.notes) && (
                        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-2xs text-slate-600 block mt-3 font-sans leading-relaxed text-left">
                          {s.feedback && <p><strong>Coach Review:</strong> {s.feedback}</p>}
                          {s.cancelReason && <p className="text-rose-700"><strong>Cancellation Trigger:</strong> {s.cancelReason}</p>}
                          {s.notes && <p><strong>Auditor Notes:</strong> {s.notes}</p>}
                        </div>
                      )}
                    </div>

                    {/* Operational trigger buttons */}
                    <div className="shrink-0 flex items-center gap-2 mt-2 md:mt-0">
                      {s.status === 'Upcoming' ? (
                        <>
                          <button
                            onClick={() => setActiveQRModalSession(s)}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-805 text-2xs font-extrabold px-3.5 py-2.5 rounded-xl cursor-pointer transition shadow-2xs"
                          >
                            📷 Show QR Code
                          </button>
                          <button
                            onClick={() => handleMarkSessionCompleted(s.id)}
                            className="bg-[#001F3F] hover:bg-slate-900 border border-transparent text-teal-400 text-2xs font-black px-4 py-2.5 rounded-xl cursor-pointer transition shadow-md"
                          >
                            ✓ Mark Completed
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setFeedbackSessionId(s.id);
                            setFeedbackInput(s.feedback || '');
                          }}
                          className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-905 text-2xs font-extrabold px-3.5 py-2.5 rounded-xl cursor-pointer transition"
                        >
                          ✏ {s.feedback ? 'Edit Audit Notes' : 'Apply Feedback'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

              {sessions.filter(s => {
                if (sessionFilter === 'All') return true;
                if (sessionFilter === 'Upcoming') return s.status === 'Upcoming';
                if (sessionFilter === 'Completed') return s.status === 'Completed';
                if (sessionFilter === 'Cancelled/Missed') return s.status === 'Cancelled' || s.status === 'Missed';
                return true;
              }).length === 0 && (
                <div className="bg-white p-12 text-center rounded-xl border border-dashed border-slate-200">
                  <span className="text-2xl">📅</span>
                  <p className="font-bold text-slate-600 mt-2">No matching sessions in filter context.</p>
                  <p className="text-xs text-slate-400">All logs are safely seeded for your viewing.</p>
                </div>
              )}
            </div>

            {/* QR Code Presentation Modal */}
            {activeQRModalSession && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative border border-slate-100 text-center text-slate-800">
                  <h3 className="font-display font-black text-slate-900 text-base mb-1.5">
                    📱 Sign-in QR Attendance Code
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 uppercase tracking-wide font-semibold">
                    {activeQRModalSession.title}
                  </p>
                  
                  {/* Styled simulated QR SVG */}
                  <div className="bg-slate-50 border border-slate-150 p-6 rounded-2xl flex justify-center mb-4">
                    <svg className="w-40 h-40" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#f8fafc" />
                      <path d="M5 5h30v30H5V5zm10 10v10h10V15H15zm50-10h30v30H65V5zm10 10v10h10V15H75zM5 65h30v30H5V65zm10 10v10h10V75H15zm55-5h5v5h-5v-5zm10 10h10v10H80V80zm-10 10h10v5H70v-5zm0-15h5v5h-5v-5zm15-5h10v5H85v-5zm-5 5h5v5h-5v-5zm-15-5h5v5h-5v-5zm0 15h5v5h-5v-5zm-10-10h5v10h-5V70zm-5 5h5v5h-5v-5zm15-15h5v5h-5v-5zm15 0h5v5h-5v-5zm-30-20h5v10h-5V35zm10-5h5v5h-5v-5zm5 10h5v5h-5v-5zm10-15h5v5h-5V20zm-5 15h5v10h-5V35zm-25 15h5v5h-5v-5zm5 15h10v5H45v-5zm15 5h5v5h-5v-5zm5-15h5v5h-5v-5zm-15-5h10v5H50v-5zm30-5h5v10h-5V45zm-10 10h5v5h-5v-5z" fill="#001f3f" />
                    </svg>
                  </div>

                  <p className="text-2xs text-slate-550 leading-snug">
                    Point your trainee's CoachTrack mobile camera here to instantly record and check-in attendance.
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => setActiveQRModalSession(null)}
                      className="w-full bg-[#001F3F] hover:bg-slate-900 border border-transparent text-teal-400 text-xs font-black py-2.5 rounded-xl cursor-pointer shadow-md transition animate-fade-in"
                    >
                      Close Scanner Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Change Feedback Text Dialog Modal */}
            {feedbackSessionId && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 text-left text-slate-850">
                  <h3 className="font-display font-medium text-slate-900 text-base mb-1.5 flex items-center gap-1">
                    ✏ Physical Practice Review Notes
                  </h3>
                  <p className="text-xs text-slate-450 mb-4">
                    Provide specialized biometric comments or review logs for this class.
                  </p>

                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Enter stance accuracy, heart rate intervals comments, or weight execution feedback..."
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 p-3 mb-4 focus:outline-teal-500 font-medium"
                  />

                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 bg-white">
                    <button
                      onClick={() => setFeedbackSessionId(null)}
                      className="px-4 py-2 border border-slate-200 text-xs text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSessionFeedback}
                      className="bg-[#001F3F] text-teal-400 text-xs font-black px-5 py-2 rounded-xl cursor-pointer shadow-md"
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

      {/* 4. CHAT MESSAGE COMPACT INTERACTIVE TOGGLE AT LOWER-RIGHT REGION FOR COACH */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-3 max-w-[90vw] sm:max-w-none text-left font-sans">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl w-[320px] sm:w-[480px] md:w-[600px] h-[580px] sm:h-[650px] flex flex-row overflow-hidden shadow-2xl relative text-slate-800"
            >
              {/* Left Sidebar — Trainee Selection Panel (35% width) */}
              <div className="w-44 sm:w-52 md:w-56 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden text-left">
                <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                  <div>
                    <h3 className="font-display font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wider">Select Trainee</h3>
                    <p className="text-[10px] text-slate-400">Coached Client Channels</p>
                  </div>
                  {(() => {
                    const defaultTrainees = [
                      {
                        id: 'te_ahmad',
                        userId: 'u_ahmad',
                        name: 'Ahmad Ibrahim',
                        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm6XjkajKC1E-auUB-6Sr-GyTGI4zsoY-YEgT0MAl6pw_jL3uSF-kMR6I3SCISx-0HXh-tcAf99gfuoVVhzN1P1HU5oCZk0WWchxWKY22ATwB-APrTezY3HVTAOMGVpXNApLlt1VIzi9o8yJXJ5nQRsSmRHOuxBYfJf_533KGGsCsvrxpZ_3m5uxZ9KZr2L6dBuXJkWmoMBDY9z_YnDYNr0b8EJ3Tyw-sPE0l5vW78317CdkDStSWtXZxNwtq6QaBgqW3N2oV2two',
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
                        name: 'Jason Wong',
                        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
                        goals: 'Powerlifting',
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
                          name: t.name === 'Ahmad bin Ibrahim' ? 'Ahmad Ibrahim' : t.name,
                          avatarUrl: t.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
                          goals: t.goals || existing?.goals || 'General Fitness',
                          streakCount: t.streakCount ?? existing?.streakCount ?? 0,
                          status: existing?.status || 'offline'
                        });
                      }
                    });
                    const combinedTrainees = Array.from(displayedTraineesMap.values());

                    return (
                      <span className="text-[10px] bg-slate-200 text-slate-705 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                        {combinedTrainees.length} Active
                      </span>
                    );
                  })()}
                </div>

                {/* Trainee search query box */}
                <div className="p-3 border-b border-slate-200 bg-white shrink-0">
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
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                  {(() => {
                    const defaultTrainees = [
                      {
                        id: 'te_ahmad',
                        userId: 'u_ahmad',
                        name: 'Ahmad Ibrahim',
                        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm6XjkajKC1E-auUB-6Sr-GyTGI4zsoY-YEgT0MAl6pw_jL3uSF-kMR6I3SCISx-0HXh-tcAf99gfuoVVhzN1P1HU5oCZk0WWchxWKY22ATwB-APrTezY3HVTAOMGVpXNApLlt1VIzi9o8yJXJ5nQRsSmRHOuxBYfJf_533KGGsCsvrxpZ_3m5uxZ9KZr2L6dBuXJkWmoMBDY9z_YnDYNr0b8EJ3Tyw-sPE0l5vW78317CdkDStSWtXZxNwtq6QaBgqW3N2oV2two',
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
                        name: 'Jason Wong',
                        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
                        goals: 'Powerlifting',
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
                          name: t.name === 'Ahmad bin Ibrahim' ? 'Ahmad Ibrahim' : t.name,
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
                      if (t.id === 'te_faizul') lastMsg = "Deadlift target hit at 150kg today! Form felt stable.";

                      return (
                        <button
                          key={t.userId}
                          onClick={() => {
                            setActiveChatTrainee(t);
                            // Reset unread map
                            setUnreadCounts(prev => ({ ...prev, [t.userId]: 0 }));
                            fetchChatMessages(t.userId);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition duration-150 relative border flex items-center gap-3 cursor-pointer select-none ${
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
                              className={`w-10 h-10 rounded-full object-cover border shrink-0 ${isSelected ? 'border-slate-700' : 'border-slate-200'}`}
                              alt={t.name}
                            />
                            {/* Live Online Badge */}
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isSelected ? 'border-slate-900' : 'border-white'} ${
                              t.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`} />
                          </div>

                          {/* Middle textual section */}
                          <div className="flex-1 min-w-0 pr-1.5">
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
                            <span className="absolute right-3 top-3 bg-rose-500 text-white font-black text-[9px] min-w-4 h-4 rounded-full flex items-center justify-center px-1 animate-bounce">
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
                <div className="p-4 bg-slate-900 text-white border-b border-slate-200 flex justify-between items-center shrink-0">
                  <div className="text-left flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-sm shrink-0">
                      👥
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-black text-white text-sm sm:text-base leading-none">
                          {activeChatTrainee?.name || 'Ahmad Ibrahim'} (Client)
                        </h4>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 self-center">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Active Client
                        </span>
                      </div>
                      <p className="text-[10px] text-teal-400 font-bold tracking-wider uppercase mt-1">
                        ACTIVE CLIENT THREAD
                      </p>
                    </div>
                  </div>

                  {/* Header Action Tools */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        fetchChatMessages(activeChatTrainee?.userId);
                        triggerToast('Instantly refreshed client synchronized records timeline!');
                      }}
                      title="Sync history"
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition shrink-0 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={() => setChatOpen(false)}
                      title="Close message workspace"
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition shrink-0 cursor-pointer"
                    >
                      <X className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>
                </div>

                {/* Context Selector zone above Message Inputs */}
                <div className="bg-slate-50 border-b border-slate-200 p-2.5 px-4 flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-left shrink-0 select-none">
                  <span className="text-slate-400 font-bold block text-2xs uppercase">Tag Context:</span>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Workout Log'); setReplyTagTitle('Active Routine'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-705 text-slate-700 shrink-0 cursor-pointer shadow-3xs"
                  >
                    🏋️ Workout Log
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Nutrition Tracker'); setReplyTagTitle('Diet Logs'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-705 text-slate-700 shrink-0 cursor-pointer shadow-3xs"
                  >
                    🍱 Nutrition Tracker
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Progress Photo'); setReplyTagTitle('Week 8 Comparison'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-705 text-slate-700 shrink-0 cursor-pointer shadow-3xs"
                  >
                    📸 Progress Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Body Metrics Update'); setReplyTagTitle('Scale Weight'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-705 text-slate-700 shrink-0 cursor-pointer shadow-3xs"
                  >
                    📊 Metrics Update
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Payment Status'); setReplyTagTitle('Monthly Subscription'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-705 text-slate-700 shrink-0 cursor-pointer shadow-3xs"
                  >
                    💳 Payment Status
                  </button>
                  <button
                    type="button"
                    onClick={() => { setReplyTagType('Upcoming Session'); setReplyTagTitle('Private Workout'); }}
                    className="bg-white hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 font-semibold text-slate-705 text-slate-700 shrink-0 cursor-pointer shadow-3xs"
                  >
                    📅 Session Booking
                  </button>
                </div>

                {/* Message list bubble container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 scrollbar-thin">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 text-xs space-y-2 flex flex-col items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-slate-300 mx-auto opacity-75" />
                      <p className="font-bold text-slate-500">No matching messages found in thread.</p>
                      <p className="text-[11px] text-slate-400">Send motivational tips or comment on progress below.</p>
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
                <div className="bg-slate-50 border-t border-slate-150 p-3 flex flex-col text-left shrink-0 select-none">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-800 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 font-bold" /> Smart Coach Actions (1-Click Presets)
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px] font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyTagType('Upcoming Session');
                        setReplyTagTitle('Personalized Motivation');
                        setChatInputText("🔥 Phenomenal performance logged this week! You are unlocking an entirely new standard. Let's keep this momentum unbroken!");
                      }}
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs"
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
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs"
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
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs"
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
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs"
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
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs"
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
                      className="bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs"
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
                      className="bg-white hover:bg-slate-105 border border-slate-200 px-2.5 py-1 rounded-lg transition shrink-0 whitespace-nowrap cursor-pointer hover:border-slate-300 shadow-3xs"
                    >
                      📅 Schedule Session
                    </button>
                  </div>
                </div>

                {/* Form input bottom messaging row */}
                <form onSubmit={handleSendFloatingMessage} className="bg-white border-t border-slate-200 p-3.5 flex flex-col gap-2 shrink-0">
                  {replyTagType && (
                    <div className="bg-teal-50 border border-teal-100 text-teal-800 px-3 py-1 rounded-lg flex justify-between items-center text-[10px] select-none shrink-0">
                      <span className="font-bold uppercase tracking-wider text-[9px]">
                        📌 Active Tag: Replying to {replyTagType} &ldquo;{replyTagTitle}&rdquo;
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTagType(null);
                          setReplyTagTitle('');
                        }}
                        className="font-black hover:text-teal-900 text-xs shrink-0 cursor-pointer"
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
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:outline-teal-500 font-sans"
                    />
                    <button
                      type="submit"
                      className="bg-slate-900 hover:bg-slate-800 text-teal-400 px-4 rounded-xl transition duration-75 font-black uppercase text-3xs tracking-wider flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>
                </form>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating circular workspace trigger button */}
        <button
          onClick={() => {
            setChatOpen(!chatOpen);
            if (!chatOpen && activeChatTrainee?.userId) {
              fetchChatMessages(activeChatTrainee.userId);
            }
          }}
          className={`flex items-center justify-center rounded-full p-4 shadow-2xl transition-all duration-150 scale-110 active:scale-95 cursor-pointer bg-[#001F3F] hover:bg-slate-900 border border-teal-500/20 text-teal-400`}
          title="Direct Client Messaging Workspace"
          id="btn-coach-floating-chat"
        >
          {chatOpen ? <X className="w-5 h-5 text-teal-400" /> : <MessageSquare className="w-5 h-5 text-teal-400" />}
        </button>
      </div>

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
