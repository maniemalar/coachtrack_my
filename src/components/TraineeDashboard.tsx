import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Calendar, 
  Camera, 
  Sparkles, 
  X, 
  MessageCircle, 
  Check, 
  TrendingUp, 
  TrendingDown,
  Info,
  ChevronRight,
  Award,
  ShieldCheck,
  MessageSquare,
  Clock,
  MapPin,
  RefreshCw,
  Scale,
  Apple,
  Utensils,
  CheckCircle
} from 'lucide-react';
import { dbService } from '../lib/dbService';
import { TraineeProfile, TrainerProfile, BookingSession, NutritionLog } from '../types';
import { SharedNotificationPanel } from './SharedNotificationPanel';

interface TraineeDashboardProps {
  traineeUserId: string;
  onNavigateToTab: (tab: string) => void;
}

export default function TraineeDashboard({ traineeUserId, onNavigateToTab }: TraineeDashboardProps) {
  const [traineeMeta, setTraineeMeta] = useState<TraineeProfile | null>(null);
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);

  // Reschedule Modals/Detail States
  const [selectedSession, setSelectedSession] = useState<BookingSession | null>(null);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'detail' | 'selector' | 'summary'>('detail');
  const [newDate, setNewDate] = useState<string>('');
  const [newTimeSlot, setNewTimeSlot] = useState<string>('10:00 AM');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [allTrainerBookings, setAllTrainerBookings] = useState<any[]>([]);

  // Photo-upload States
  const [mealPhoto, setMealPhoto] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scanResult, setScanResult] = useState<{
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    comment: string;
  } | null>(null);

  const [showNutritionInsight, setShowNutritionInsight] = useState<boolean>(false);
  const [lastUploadedPhoto, setLastUploadedPhoto] = useState<string>('');
  
  // Floating Coach popup states
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);
  const [quickMessage, setQuickMessage] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [quickSuccess, setQuickSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Baselines for Today's Nutrition Progress (Initial state when page loads)
  const BASE_CALORIES = 1450;
  const BASE_PROTEIN = 95;
  const BASE_CARBS = 160;
  const BASE_FAT = 50;
  const BASE_FIBER = 12;

  useEffect(() => {
    fetchTraineeData();
  }, [traineeUserId]);

  const fetchTraineeData = async () => {
    try {
      // 1. Fetch Trainee Profile
      let profile = await dbService.getTraineeProfile(traineeUserId);
      if (!profile) return;
      
      // Force 'Ahmad Bin Ibrahim' profile defaults & Trainer Coach Sarah Tan
      if (profile.id === 'te_ahmad' || profile.userId === 'u_ahmad') {
        profile.assignedTrainerId = 'tr_sarah';
        profile.name = 'Ahmad Bin Ibrahim';
        profile.streakCount = 5;
        profile.goals = 'Weight Loss & Cardio';
      }
      setTraineeMeta(profile);

      // 2. Fetch Assigned Trainer (Sarah Tan)
      const trainerId = profile.assignedTrainerId || 'tr_sarah';
      const tr = await dbService.getTrainerProfile(trainerId);
      if (tr) {
        setTrainer(tr);
      } else {
        const fallbackSarah = await dbService.getTrainerProfile('tr_sarah');
        setTrainer(fallbackSarah);
      }

      // 3. Fetch Bookings Sessions (Ahmad's scheduled sessions with coach)
      const dataBk = await dbService.getBookings({ traineeId: profile.id });
      setBookings(dataBk);

      // Fetch all bookings for Coach Sarah to support real blocking logic
      const trainerBks = await dbService.getBookings({ trainerId: 'tr_sarah' });
      setAllTrainerBookings(trainerBks);

      // 4. Fetch Nutrition Logs of Ahmad
      const logs = await dbService.getNutrition(profile.id);
      setNutritionLogs(logs);
    } catch (e) {
      console.error('Error fetching trainee dashboard data:', e);
    }
  };

  const checkSlotIsBooked = (dateStr: string, timeStr: string, currentBookingId?: string) => {
    // Current session slot should also show as booked/current
    if (selectedSession && selectedSession.date === dateStr && selectedSession.timeSlot === timeStr) {
      return true;
    }
    if (!allTrainerBookings || !Array.isArray(allTrainerBookings)) return false;
    return allTrainerBookings.some(b => 
      b &&
      b.trainerId === 'tr_sarah' && 
      b.date === dateStr && 
      b.timeSlot === timeStr && 
      b.id !== currentBookingId &&
      b.status !== 'Cancelled' && 
      b.status?.toLowerCase() !== 'cancelled' &&
      b.status !== 'Completed' &&
      b.status?.toLowerCase() !== 'completed'
    );
  };

  const handleOpenReschedule = (session: BookingSession) => {
    setSelectedSession(session);
    setNewDate(session.date);
    setNewTimeSlot(session.timeSlot);
    setRescheduleReason('');
    setRescheduleSuccess(false);
    setModalStep('detail');
    setIsRescheduling(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSession) return;
    setActionLoading(true);
    try {
      // 1. Submit trainee-side pending reschedule request
      const success = await dbService.updateBookingStatus(
        selectedSession.id, 
        'Reschedule Requested', 
        undefined, 
        undefined, 
        newDate, 
        newTimeSlot
      );
      
      if (success) {
        const origFormattedDate = new Date(selectedSession.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
        const newFormattedDate = new Date(newDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

        // 2) Dispatch chat message
        await dbService.createChatMessage({
          senderId: traineeMeta?.userId || 'te_ahmad',
          receiverId: 'u_sarah', // Coach Sarah Tan's user ID
          message: `🕒 Reschedule Request from Ahmad Bin Ibrahim:\nSession: ${selectedSession.title}\nRequested Slot: ${newDate} at ${newTimeSlot}\nOriginal Slot: ${selectedSession.date} at ${selectedSession.timeSlot}`
        });

        // 3) Create a realistic notification object in database.json / localStorage for Coach Sarah Tan
        if (typeof window !== 'undefined') {
          try {
            const data = localStorage.getItem('coach_track_demo_storage');
            if (data) {
              const parsed = JSON.parse(data);
              if (!parsed.notifications) parsed.notifications = [];
              parsed.notifications.unshift({
                id: `res_not_${Date.now()}`,
                userId: 'u_sarah', // Sarah Tan's user ID
                group: 'Today',
                title: 'Ahmad Ibrahim requested reschedule',
                subtitle: `Ahmad Bin Ibrahim requested to reschedule ${selectedSession.title} from ${origFormattedDate} ${selectedSession.timeSlot} to ${newFormattedDate} ${newTimeSlot}.`,
                time: 'Just Now',
                read: false,
                isUnread: true,
                bgColor: 'bg-amber-50 text-amber-650 border border-amber-100',
                emoji: '📅',
                type: 'reschedule',
                bookingId: selectedSession.id,
                requestedDate: newDate,
                requestedTimeSlot: newTimeSlot
              });
              localStorage.setItem('coach_track_demo_storage', JSON.stringify(parsed));
            }
          } catch (e) {
            console.error(e);
          }
        }

        setRescheduleSuccess(true);
        setTimeout(() => {
          setIsRescheduling(false);
          setSelectedSession(null);
          fetchTraineeData();
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Drag and Drop Handles
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMealPhoto(reader.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Fast-track Simulations link triggers
  const triggerSimulation = (type: 'nasi_lemak' | 'roti_canai') => {
    if (type === 'nasi_lemak') {
      setMealPhoto('https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?auto=format&fit=crop&q=80&w=240');
      setScanResult(null);
    } else {
      setMealPhoto('https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=240');
      setScanResult(null);
    }
  };

  // Trigger AI analysis simulation
  const handleAnalyzePhoto = async () => {
    if (!mealPhoto) return;
    setIsAnalyzing(true);
    
    // Simulate real server response or AI parsing delay
    setTimeout(() => {
      const isNasiLemak = mealPhoto.includes('632203171982');
      if (isNasiLemak) {
        setScanResult({
          foodName: 'Ayam Goreng Nasi Lemak',
          calories: 650,
          protein: 22,
          carbs: 85,
          fat: 25,
          fiber: 5,
          comment: 'Detected Ayam Goreng Nasi Lemak. High calorie post-workout option! Try limiting sambal oil portion.'
        });
      } else {
        setScanResult({
          foodName: 'Telur Roti Canai',
          calories: 320,
          protein: 10,
          carbs: 42,
          fat: 12,
          fiber: 2,
          comment: 'Crispy Roti Canai detected. Moderate wheat gluten load. Good protein buffer from eggs added.'
        });
      }
      setIsAnalyzing(false);
    }, 1800);
  };

  // Save parsed meal to persistent database
  const handleSaveMealLog = async () => {
    if (!scanResult || !traineeMeta) return;

    try {
      const logItem = {
        traineeId: traineeMeta.id,
        date: new Date().toISOString().substring(0, 10),
        foodName: scanResult.foodName,
        calories: scanResult.calories,
        protein: scanResult.protein,
        carbs: scanResult.carbs,
        fat: scanResult.fat,
        notes: 'Logged via Gemini Food Photo Scanner.'
      };

      await dbService.createNutritionLog(logItem);
      alert(`${scanResult.foodName} successfully logged to history! Daily metrics consolidated.`);
      setLastUploadedPhoto(mealPhoto);
      setShowNutritionInsight(true);
      setMealPhoto('');
      setScanResult(null);
      fetchTraineeData();
    } catch (e) {
      console.error('Error saving meal log:', e);
    }
  };

  // Compute aggregated dynamic nutrition progress
  // Today's total logged calories includes baseline + newly logged session calories of today
  const sessionAddedCals = nutritionLogs
    .filter(n => n.date === new Date().toISOString().substring(0, 10))
    .reduce((sum, item) => sum + item.calories, 0);

  const sessionAddedProtein = nutritionLogs
    .filter(n => n.date === new Date().toISOString().substring(0, 10))
    .reduce((sum, item) => sum + item.protein, 0);

  const sessionAddedCarbs = nutritionLogs
    .filter(n => n.date === new Date().toISOString().substring(0, 10))
    .reduce((sum, item) => sum + item.carbs, 0);

  const sessionAddedFat = nutritionLogs
    .filter(n => n.date === new Date().toISOString().substring(0, 10))
    .reduce((sum, item) => sum + item.fat, 0);

  const currentCalories = BASE_CALORIES + sessionAddedCals;
  const targetCalories = 1800;
  const remainingCalories = Math.max(0, targetCalories - currentCalories);

  const currentProtein = BASE_PROTEIN + sessionAddedProtein;
  const currentCarbs = BASE_CARBS + sessionAddedCarbs;
  const currentFat = BASE_FAT + sessionAddedFat;
  const currentFiber = BASE_FIBER + Math.round(sessionAddedCals * 0.005); // Simulated fiber ratio

  // Static target levels for UI progress bar visualization
  const targetProtein = 135;
  const targetCarbs = 210;
  const targetFat = 65;
  const targetFiber = 28;

  // Upcoming Synced Session: Let's find real bookings or map standard upcoming sessions
  // Ensuring the exact required synced session is always rendered cleanly.
  const activeSessions = bookings && bookings.length > 0
    ? bookings
        .filter(b => b.status !== 'Cancelled' && b.status?.toLowerCase() !== 'cancelled')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3)
    : [];

  const nearestUpcomingSession = (() => {
    if (!bookings || bookings.length === 0) return null;
    const activeBk = bookings.filter(b => b.status !== 'Cancelled' && b.status?.toLowerCase() !== 'cancelled');
    if (activeBk.length === 0) return null;
    
    // Sort bookings by date and time
    const sorted = [...activeBk].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Find the first session today or in the future
    const todayStr = '2026-06-22'; // Reference system date index
    const futureOrToday = sorted.filter(b => b.date >= todayStr);
    
    if (futureOrToday.length > 0) {
      return futureOrToday[0];
    }
    // Fallback if none are future
    return sorted[sorted.length - 1];
  })();

  // Multi-messaging handler for floating avatar Quick chat form
  const handleSendQuickMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMessage.trim() || !traineeMeta) return;
    setSendingMessage(true);
    try {
      await dbService.createChatMessage({
        senderId: traineeMeta.userId,
        receiverId: 'u_sarah', // Coach Sarah Tan's user ID
        message: quickMessage.trim()
      });
      setQuickMessage('');
      setQuickSuccess(true);
      setTimeout(() => setQuickSuccess(false), 3000);
    } catch (err) {
      console.error('Error sending quick chat:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="w-full bg-[#FAFBFF] min-h-screen pb-24">
      {/* Strict Mobile viewport containment wrapper */}
      <div className="mx-auto w-full max-w-[390px] overflow-x-hidden px-5 py-5 bg-[#FAFBFF] flex flex-col gap-6 text-left box-border">

        {/* 1. HERO DASHBOARD CARD */}
        <div id="hero-dashboard-card" className="bg-gradient-to-br from-[#081F63] to-[#142D7A] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          {/* Ambient blur lights */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-teal-400/10 rounded-full blur-xl pointer-events-none"></div>

          {/* Top Row: Welcome & Streak */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] bg-teal-400 text-slate-850 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                TRAINEE METRICS
              </span>
              <h2 className="text-2xl font-bold font-display mt-2 leading-none">
                Good Morning Ahmad 👋
              </h2>
            </div>
            {/* 5-Day Streak Badge inside hero card */}
            <div className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-2xl shadow-sm border border-amber-300">
              <Flame className="w-4 h-4 fill-current animate-pulse text-red-700" />
              <span className="text-[10px] font-black uppercase">5-Day Streak</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Left stats info */}
            <div className="col-span-7 space-y-3 text-xs text-slate-200 font-medium">
              <div className="flex flex-col">
                <span className="text-slate-300/75 text-[9px] uppercase font-bold tracking-wider mb-0.5">Assigned Coach</span>
                <strong className="text-white text-sm font-black">{trainer?.name || 'Sarah Tan'}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-300/75 text-[9px] uppercase font-bold tracking-wider mb-0.5">My Active Goal</span>
                <strong className="text-white text-sm font-black">{traineeMeta?.goals || 'Weight Loss & Cardio'}</strong>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-300/75 text-[9px] uppercase font-bold tracking-wider mb-0.5">Package Plan</span>
                <strong className="text-teal-300 text-sm font-black">8 Classes Per Month (RM600 Paid)</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-slate-300/75 text-[9px] uppercase font-bold tracking-wider">Current</span>
                  <strong className="text-white font-black text-sm">84 kg</strong>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-300/75 text-[9px] uppercase font-bold tracking-wider">Target</span>
                  <strong className="text-white font-black text-sm">75 kg</strong>
                </div>
              </div>
            </div>

            {/* Circular Progress Ring */}
            <div className="col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#14D8C5"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - 0.47)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-base font-black text-white leading-none">47%</span>
                  <span className="text-[7.5px] text-teal-300 font-extrabold uppercase tracking-widest mt-0.5">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Predictable goal timeline */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 bg-white/5 p-3 rounded-2xl border border-white/5">
            <Sparkles className="w-4.5 h-4.5 text-teal-300 shrink-0 mt-0.5 fill-current/10" />
            <div className="text-left font-sans text-xs">
              <span className="block text-[8px] font-extrabold text-teal-300 uppercase tracking-widest mb-0.5">CoachAI Analysis</span>
              <p className="text-slate-100 font-semibold leading-relaxed">
                Estimated goal completion: <strong className="text-white font-black">Approximately 10–12 weeks remaining</strong>
              </p>
            </div>
          </div>
        </div>


        {/* 2. NEXT SESSION CARD */}
        <div id="next-session-card" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] uppercase font-black tracking-widest text-[#081F63] font-mono flex items-center gap-1.5">
              <Calendar className="w-4.5 h-4.5 text-teal-600" /> Next Session
            </h3>
            <span className="text-[8px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase font-mono">Nearest Active Slot</span>
          </div>

          {nearestUpcomingSession ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-3.5">
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg font-mono font-bold">
                  {new Date(nearestUpcomingSession.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} • {nearestUpcomingSession.timeSlot}
                </span>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200 font-bold">
                    {nearestUpcomingSession.status || 'Upcoming'}
                  </span>
                  <span className="text-[9px] font-extrabold text-indigo-700 font-mono font-bold">
                    ⏳ {(() => {
                      const todayVal = new Date('2026-06-22');
                      const targetDateObj = new Date(nearestUpcomingSession.date);
                      const diffTime = targetDateObj.getTime() - todayVal.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays === 0) return "Today";
                      if (diffDays === 1) return "Tomorrow";
                      if (diffDays > 1) return `In ${diffDays} days`;
                      return "Today";
                    })()}
                  </span>
                </div>
              </div>

              <h4 className="font-extrabold text-[#081F63] text-sm leading-snug mb-3 font-sans">
                {nearestUpcomingSession.title}
              </h4>
              
              <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4 font-sans">
                <div className="flex justify-between">
                  <span className="font-medium text-slate-400">Coach</span>
                  <span className="font-bold text-slate-700">Coach Sarah Tan</span>
                </div>
                <div className="flex justify-between font-sans">
                  <span className="font-medium text-slate-400">Location</span>
                  <span className="font-bold text-slate-700 truncate max-w-[185px]">📍 {nearestUpcomingSession.location || 'SS15 Studio, Selangor'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-sans">
                <button
                  type="button"
                  id="view-session-details-btn"
                  onClick={() => handleOpenReschedule(nearestUpcomingSession)}
                  className="bg-slate-100 hover:bg-slate-200 text-[#081F63] font-extra-bold text-[11px] py-2.5 rounded-xl transition cursor-pointer text-center font-bold"
                >
                  View Details
                </button>
                <button
                  type="button"
                  id="request-session-reschedule-btn"
                  onClick={() => {
                    handleOpenReschedule(nearestUpcomingSession);
                    setTimeout(() => setModalStep('selector'), 120);
                  }}
                  className="bg-[#081F63] hover:bg-[#122A7D] text-white font-extra-bold text-[11px] py-2.5 rounded-xl transition cursor-pointer text-center shadow-sm font-bold"
                >
                  Reschedule
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 text-center text-slate-400 text-xs font-sans">
              No sessions assigned yet.
            </div>
          )}
        </div>


        {/* 3. LOG TODAY'S MEAL */}
        <div id="log-todays-meal-card" className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[12px] font-black text-[#081F63] flex items-center gap-1.5 uppercase font-mono tracking-wider">
              <Camera className="w-4 h-4 text-indigo-600" /> Log Today's Meal
            </h4>
            <span className="text-[8px] bg-indigo-50 text-indigo-700 tracking-wider uppercase font-black px-2 py-0.5 rounded-full border border-indigo-100 font-mono">
              CoachAI Analysis
            </span>
          </div>

          {/* Caloric Intake Gauge */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-left">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span className="font-extrabold text-slate-700">Daily Calorie Budget</span>
              <span className="text-[#081F63] font-mono font-black text-sm font-bold">
                {currentCalories} / {targetCalories} kcal
              </span>
            </div>
            {/* ProgressBar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-350" 
                style={{ width: `${Math.min(100, (currentCalories / targetCalories) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center mt-1.5 font-sans">
              <p className="text-[10px] text-slate-500 font-semibold truncate pr-1">
                💡 {remainingCalories > 0 ? `${remainingCalories} kcal left to reach target limit.` : 'Caloric target achieved! Steady state reached.'}
              </p>
              <span className="text-[10.5px] font-mono font-black text-[#081F63] shrink-0 font-bold">
                Left: {remainingCalories} kcal
              </span>
            </div>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-3 transition ${
              isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            {mealPhoto ? (
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black">
                <img src={mealPhoto} className="w-full h-full object-cover" alt="Meal Preview" referrerPolicy="no-referrer" />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMealPhoto('');
                    setScanResult(null);
                  }}
                  className="absolute top-2.5 right-2.5 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 cursor-pointer shadow-md transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xl shadow-sm border border-indigo-100">
                  🍲
                </div>
                <span className="text-xs font-black text-indigo-700">Scan Meal Plate</span>
                <span className="text-[9px] text-slate-400 font-medium">Drag & drop photo or tap to open roll</span>
                <div className="flex justify-center gap-3 mt-1 text-slate-405 text-[9px] font-extrabold uppercase font-mono">
                  <span>📸 Camera</span>
                  <span>🖼️ Gallery</span>
                  <span>📂 Drag / Drop</span>
                </div>
              </div>
            )}
          </div>

          {/* Simulation fast trackers for easier validation */}
          {!mealPhoto && (
            <div className="flex flex-col gap-1.5 pt-1 text-left font-sans">
              <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Quick scan simulation:</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button"
                  onClick={() => triggerSimulation('nasi_lemak')}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-705 text-[10px] font-bold rounded-xl cursor-pointer transition truncate flex items-center justify-center gap-1 font-bold"
                >
                  🍛 Nasi Lemak
                </button>
                <button 
                  type="button"
                  onClick={() => triggerSimulation('roti_canai')}
                  className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-705 text-[10px] font-bold rounded-xl cursor-pointer transition truncate flex items-center justify-center gap-1 font-bold"
                >
                  🫓 Roti Canai
                </button>
              </div>
            </div>
          )}

          {mealPhoto && !scanResult && (
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleAnalyzePhoto}
              className="w-full bg-[#081F63] hover:bg-[#122A7D] text-white font-extrabold text-xs py-3.5 rounded-xl uppercase tracking-wider cursor-pointer shadow-md disabled:opacity-60 transition"
            >
              {isAnalyzing ? '⚡ CoachAI Analyzing...' : '🔍 Analyze Meal with CoachAI'}
            </button>
          )}

          {scanResult && (
            <div className="bg-[#081F63] text-white rounded-2xl p-4 shadow-md space-y-3 text-left font-sans">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                  <span className="text-[8px] text-teal-400 uppercase tracking-widest font-black block font-mono">Plate Decoded</span>
                  <p className="text-xs font-extrabold text-[#18D4C5]">{scanResult.foodName}</p>
                </div>
                <span className="text-xs font-mono font-black text-teal-300">
                  +{scanResult.calories} kcal
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold bg-black/15 p-2 rounded-xl font-sans">
                <div className="flex flex-col">
                  <span className="text-slate-300 text-[8px] uppercase">Protein</span>
                  <span>{scanResult.protein}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-300 text-[8px] uppercase">Carbs</span>
                  <span>{scanResult.carbs}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-300 text-[8px] uppercase">Fat</span>
                  <span>{scanResult.fat}g</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-300 text-[8px] uppercase">Fiber</span>
                  <span>{scanResult.fiber}g</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-200 leading-normal italic pl-2.5 border-l-2 border-teal-400">
                &ldquo;{scanResult.comment}&rdquo;
              </p>

              <button
                type="button"
                onClick={handleSaveMealLog}
                className="w-full bg-teal-405 hover:bg-teal-35 text-[#081F63] font-black py-2.5 rounded-xl text-xs tracking-wide uppercase transition cursor-pointer font-bold"
              >
                📝 Log to Coach Review History
              </button>
            </div>
          )}

          {/* Consolidated Daily Macrominerals */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-left font-sans">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block font-mono">
              Consolidated Daily Macrominerals
            </span>
            <div className="grid grid-cols-2 gap-2.5 font-sans">
              
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="font-bold text-slate-500">Protein</span>
                  <span className="font-extrabold text-[#081F63]">{currentProtein} / {targetProtein}g</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#081F63] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (currentProtein / targetProtein) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="font-bold text-slate-500">Carbs</span>
                  <span className="font-extrabold text-[#081F63]">{currentCarbs} / {targetCarbs}g</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#18D4C5] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (currentCarbs / targetCarbs) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="font-bold text-slate-500">Fat</span>
                  <span className="font-extrabold text-amber-500">{currentFat} / {targetFat}g</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (currentFat / targetFat) * 100)}%` }}></div>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-1 text-[10px]">
                  <span className="font-bold text-slate-500">Fiber</span>
                  <span className="font-extrabold text-[#10B981]">{currentFiber} / {targetFiber}g</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (currentFiber / targetFiber) * 100)}%` }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Compact saved logs listing inside Section 3 */}
          {nutritionLogs.length > 0 && (
            <div className="pt-3 border-t border-slate-100 text-left">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-2">Logged Food History ({nutritionLogs.length})</span>
              <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                {nutritionLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded border border-slate-100 text-[10.5px]">
                    <div className="truncate pr-2">
                      <strong className="text-slate-800 font-bold block truncate">{log.foodName}</strong>
                      <span className="text-[8px] text-slate-400">{log.date}</span>
                    </div>
                    <span className="font-bold text-indigo-700 shrink-0 uppercase bg-indigo-50 border border-indigo-100 px-1 py-0.5 rounded">{log.calories} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>


        {/* 4. AI NUTRITION INSIGHT */}
        {showNutritionInsight && (
          <div id="ai-nutrition-insight-card" className="bg-gradient-to-br from-[#081F63] to-[#122F88] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden text-left space-y-4">
            <button 
              type="button" 
              onClick={() => setShowNutritionInsight(false)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 cursor-pointer transition shadow-sm border border-white/5"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-teal-400/20 text-teal-300 rounded-full flex items-center justify-center font-bold text-sm border border-teal-400/20">
                ✨
              </div>
              <div>
                <span className="text-[8px] font-extrabold text-teal-400 uppercase tracking-widest block font-mono">Expert Coach Recommendation</span>
                <h4 className="text-sm font-extrabold text-slate-100">CoachAI Analysis</h4>
              </div>
            </div>

            <p className="text-xs text-slate-100 font-medium leading-relaxed font-sans">
              "Protein intake is slightly low for your calorie target. Consider supplementing future meal cycles with grilled chicken fillet, steamed barramundi, tofu, or organic local duck eggs to maximize skeletal hypertrophy!"
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-teal-300/80 block text-[8px] uppercase tracking-wider font-extrabold mb-0.5 font-bold font-mono">Meal Score</span>
                <strong className="text-white text-xs font-black">8.5 / 10</strong>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-teal-300/80 block text-[8px] uppercase tracking-wider font-extrabold mb-0.5 font-bold font-mono">Caloric Balance</span>
                <strong className="text-white text-xs font-black">Optimal Deficit</strong>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-teal-300/80 block text-[8px] uppercase tracking-wider font-extrabold mb-0.5 font-bold font-mono">Protein Quality</span>
                <strong className="text-white text-xs font-black font-bold">High (Lean Base)</strong>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="text-teal-300/80 block text-[8px] uppercase tracking-wider font-extrabold mb-0.5 font-bold font-mono font-bold font-mono">Recovery Rating</span>
                <strong className="text-white text-xs font-black font-bold">Highly Restorative</strong>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowNutritionInsight(false)}
              className="w-full bg-white/10 hover:bg-white/15 text-white border border-white/10 text-[10px] font-black py-2 rounded-xl uppercase tracking-wider transition cursor-pointer mt-1"
            >
              Dismiss Insight
            </button>
          </div>
        )}

        {/* 5. PROGRESS SNAPSHOT */}
        <div id="progress-snapshot-card" className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-left space-y-4">
          <h4 className="text-[11px] uppercase font-black tracking-widest text-[#081F63] mb-1 flex items-center gap-1.5 font-mono">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Progress Snapshot
          </h4>

          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Weight Loss Progress Ring */}
            <div className="col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#F1F5F9"
                    strokeWidth="7"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="38"
                    stroke="#10B981"
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 38}
                    strokeDashoffset={2 * Math.PI * 38 * (1 - 0.133)}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-base font-black text-slate-800 leading-none">13%</span>
                  <span className="text-[7.5px] text-[#10B981] font-black uppercase tracking-wider mt-0.5 font-sans font-bold">Weight Lost</span>
                </div>
              </div>
            </div>

            {/* Metrics Info */}
            <div className="col-span-7 space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-400 font-bold">Current Weight</span>
                <strong className="text-slate-900 font-extrabold text-sm">84.0 kg</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-400 font-bold">Target Goal</span>
                <strong className="text-slate-900 font-extrabold text-sm">75.0 kg</strong>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-400 font-bold">Current BMI</span>
                <strong className="text-slate-900 font-extrabold text-sm">27.1</strong>
              </div>
            </div>
          </div>

          {/* Mini weight trend chart */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 font-mono">Weight Trend Tracker</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-lg border border-emerald-100 shrink-0 font-bold font-sans">
                ↓ 1.2 kg this month
              </span>
            </div>
            
            {/* SVG Sparkline Chart */}
            <div className="w-full h-14 relative flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 5 L 33 22 L 66 8 L 100 28"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 5 L 33 22 L 66 8 L 100 28 L 100 30 L 0 30 Z"
                  fill="url(#chartGrad)"
                />
                {/* Data Points */}
                <circle cx="0" cy="5" r="2" fill="#10B981" />
                <circle cx="33" cy="22" r="2" fill="#10B981" />
                <circle cx="66" cy="8" r="2" fill="#10B981" />
                <circle cx="100" cy="28" r="2" fill="#10B981" />
              </svg>
              
              {/* Point Labels */}
              <div className="absolute inset-x-0 bottom-full mb-1 flex justify-between px-1 text-[8px] font-mono font-bold text-slate-400 pointer-events-none">
                <span>84.0kg</span>
                <span>83.2kg</span>
                <span>84.0kg</span>
                <span>82.8kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. WEEKLY TREND WIDGET */}
        <div id="weekly-trend-widget-card" className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-left">
          <h4 className="text-[11px] uppercase font-black tracking-widest text-[#081F63] mb-4 flex items-center gap-1.5 font-mono">
            <TrendingUp className="w-4 h-4 text-[#081F63]" /> Weekly Trends
          </h4>

          <div className="grid grid-cols-2 gap-3.5 font-sans">
            {/* Weight Tile */}
            <div className="bg-slate-50/75 p-2 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[85px]">
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-400 block font-mono">Weight Trend</span>
                <span className="text-xs font-black text-slate-800 block mt-0.5">Weight ↓</span>
              </div>
              <div className="mt-2 flex flex-col items-start font-sans">
                <span className="text-[9px] font-mono font-bold text-slate-400">Steady</span>
                <span className="text-[7.5px] font-extrabold text-[#10B981] bg-emerald-50 px-1 py-0.5 mt-1 rounded border border-emerald-100 font-sans">
                  ↓ 0.5 kg
                </span>
              </div>
            </div>

            {/* Calories Tile */}
            <div className="bg-slate-50/75 p-2 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[85px]">
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-400 block font-mono">Calorie Intake</span>
                <span className="text-xs font-black text-slate-800 block mt-0.5">Calories ↓</span>
              </div>
              <div className="mt-2 flex flex-col items-start font-sans">
                <span className="text-[9px] font-mono font-bold text-slate-400">Deficit</span>
                <span className="text-[7.5px] font-extrabold text-[#10B981] bg-emerald-50 px-1 py-0.5 mt-1 rounded border border-emerald-100 font-sans">
                  ↓ 120 kcal
                </span>
              </div>
            </div>

            {/* Workout Attendance Tile */}
            <div className="bg-slate-50/75 p-2 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[85px]">
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-400 block font-mono">Workouts Logs</span>
                <span className="text-xs font-black text-slate-800 block mt-0.5 font-bold">Attendance ↑</span>
              </div>
              <div className="mt-2 flex flex-col items-start font-sans">
                <span className="text-[9px] font-mono font-bold text-slate-400">3 of 3 days</span>
                <span className="text-[7.5px] font-extrabold text-indigo-700 bg-indigo-50 px-1 py-0.5 mt-1 rounded border border-indigo-100 font-sans">
                  100% ↑
                </span>
              </div>
            </div>

            {/* Nutrition Compliance Tile */}
            <div className="bg-slate-50/75 p-2 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[85px]">
              <div>
                <span className="text-[8px] uppercase font-bold text-slate-400 block font-mono">Nutri Tracker</span>
                <span className="text-xs font-black text-slate-800 block mt-0.5 font-bold">Compliance ↑</span>
              </div>
              <div className="mt-2 flex flex-col items-start font-sans">
                <span className="text-[9px] font-mono font-bold text-slate-400">Fiber Rate</span>
                <span className="text-[7.5px] font-extrabold text-[#10B981] bg-emerald-50 px-1 py-0.5 mt-1 rounded border border-emerald-100 font-sans">
                  92% ↑
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* 7. COACHAI GOAL PREDICTION */}
        <div className="bg-gradient-to-br from-[#081F63] to-[#122A7D] text-white rounded-3xl p-5 shadow-sm text-left relative overflow-hidden font-sans">
          <div className="absolute -top-3 -right-3 text-white/5 pointer-events-none">
            <Sparkles className="w-16 h-16" />
          </div>

          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-4 h-4 text-teal-350 fill-current" />
            <span className="text-[10px] uppercase font-mono font-black text-teal-350 tracking-wider">
              CoachAI Analysis
            </span>
          </div>

          <p className="text-xs text-slate-100 leading-relaxed font-semibold">
            “At your current daily average metabolic rate, you are on track to achieve your target 75kg goal in around 10–12 weeks. Stay consistent!”
          </p>
        </div>


        {/* Direct Link to Messages Tab with Active Coach */}
        <button
          onClick={() => onNavigateToTab('chats')}
          className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[#081F63] text-xs font-extrabold py-3.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
        >
          <MessageCircle className="w-4 h-4 text-indigo-700" />
          Chat with Coach Sarah Tan
        </button>

      </div>

      {/* Reschedule Interactive Modal Sheet */}
      {isRescheduling && selectedSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-[90%] max-w-[340px] mx-auto p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative border border-slate-100 text-left overflow-y-auto max-h-[92vh] box-border break-words animate-zoom-in flex flex-col">
            
            <button 
              onClick={() => {
                setIsRescheduling(false);
                setSelectedSession(null);
              }}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 border border-slate-100 rounded-full cursor-pointer font-bold z-10 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Success screen override */}
            {rescheduleSuccess ? (
              <div className="py-4 text-center space-y-2.5">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-teal-600 border border-teal-100 font-bold text-xl font-mono">
                  ✓
                </div>
                <div>
                  <h4 className="font-display font-black text-[#041F63] text-sm">Proposal Dispatched!</h4>
                  <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                    Coach Sarah Tan has been notified via chat. You can monitor the reschedule status on your schedule list.
                  </p>
                </div>
                <div className="pt-1.5">
                  <button
                    onClick={() => {
                      setIsRescheduling(false);
                      setSelectedSession(null);
                    }}
                    className="w-full bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-8 rounded-lg text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : modalStep === 'detail' ? (
              /* ================= STEP 1: SESSION DETAIL ================= */
              <div className="space-y-3">
                <div>
                  <span className="inline-block px-1.5 py-0.2 text-[8px] font-bold text-teal-600 bg-teal-50 rounded tracking-wider mb-0.5 uppercase select-none">
                    Booking Detail
                  </span>
                  <h4 className="font-display font-black text-[#041F63] text-sm leading-tight">
                    {selectedSession.title || 'HIIT Private Coaching'}
                  </h4>
                </div>

                <div className="space-y-2 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[11px]">
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Coach</span>
                    <span className="text-slate-800 font-extrabold">Sarah Tan</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Current Date</span>
                    <span className="text-slate-800 font-mono font-bold">
                      {new Date(selectedSession.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Current Time</span>
                    <span className="text-slate-800 font-mono font-bold">{selectedSession.timeSlot}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Location</span>
                    <span className="text-slate-800 font-medium">SS15 Studio, Selangor</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-400 font-bold">Status</span>
                    <span className={`font-black uppercase px-1.5 py-0.2 text-[9px] rounded-full ${
                      selectedSession.status === 'Reschedule Requested'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedSession.status === 'Approved' || selectedSession.status === 'Completed'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedSession.status === 'Reschedule Requested' ? 'Pending Reschedule' : (selectedSession.status || 'Upcoming')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setModalStep('selector')}
                    className="w-full bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-9 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Request Reschedule</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRescheduling(false);
                      onNavigateToTab('chats');
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold h-9 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Message Coach</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRescheduling(false);
                      setSelectedSession(null);
                    }}
                    className="w-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold h-9 rounded-lg text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : modalStep === 'selector' ? (
              /* ================= STEP 2: SLOT SELECTOR ================= */
              <div className="space-y-3">
                <div>
                  <h4 className="font-display font-black text-[#041F63] text-sm flex items-center gap-1.5 leading-tight">
                    <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
                    <span>Proposal Details</span>
                  </h4>
                  <p className="text-slate-400 text-[10px]">
                    Select a date & slot according to Coach Sarah Tan's calendar.
                  </p>
                </div>

                {/* Preferred Replacement Date */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Preferred Replacement Date
                  </label>
                  <input 
                    type="date" 
                    value={newDate} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && new Date(val).getDay() === 0) {
                        alert("Sundays are unavailable. Trainer schedule is closed.");
                      } else {
                        setNewDate(val);
                      }
                    }}
                    className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-lg px-2 h-8 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition font-mono box-border"
                  />
                </div>

                {/* Preferred Replacement Time Slot Grid */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Preferred Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((time) => {
                      const isBooked = checkSlotIsBooked(newDate, time, selectedSession.id);
                      const isSelected = newTimeSlot === time;

                      if (isBooked) {
                        return (
                          <button
                            key={time}
                            type="button"
                            disabled
                            className="border border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed py-1 text-center text-[9px] text-slate-400 font-medium rounded-lg flex flex-col items-center justify-center h-8"
                          >
                            <span>{time}</span>
                            <span className="text-[6px] font-bold uppercase text-rose-500 tracking-wider">Booked</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setNewTimeSlot(time)}
                          className={`border py-1 text-center font-bold text-[10px] rounded-lg transition flex flex-col items-center justify-center cursor-pointer select-none h-8 ${
                            isSelected
                              ? 'border-[#4F46E5] bg-[#F5F7FF] text-[#4F46E5]'
                              : 'border-[#D7DFEA] hover:bg-slate-50 bg-white text-slate-700'
                          }`}
                        >
                          <span>{time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Reason textarea */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Reason for Rescheduling
                  </label>
                  <input 
                    type="text"
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="E.g., Client meeting conflict..."
                    className="w-full bg-[#F8FAFC] border border-[#D7DFEA] rounded-lg px-2 h-8 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#041F63]/10 focus:border-[#041F63] outline-none transition"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setModalStep('detail')}
                    className="w-1/3 bg-white border border-[#D7DFEA] text-[#52607A] hover:bg-slate-50 font-bold h-9 rounded-lg text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!newDate) {
                        alert("Please select a convenient replacement date first.");
                        return;
                      }
                      if (new Date(newDate).getDay() === 0) {
                        alert("Sundays are unavailable. Trainer schedule is closed.");
                        return;
                      }
                      if (checkSlotIsBooked(newDate, newTimeSlot, selectedSession.id)) {
                        alert("The selected slot is busy. Please choose an available slot.");
                        return;
                      }
                      setModalStep('summary');
                    }}
                    className="flex-1 bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-9 rounded-lg text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              /* ================= STEP 3: SUMMARY CONFIRMATION ================= */
              <div className="space-y-3">
                <div>
                  <h4 className="font-display font-black text-[#041F63] text-sm flex items-center gap-1.5 leading-tight">
                    <span>Summary of Request</span>
                  </h4>
                  <p className="text-slate-400 text-[10px]">
                    Please review your proposed schedule details.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[11px] text-slate-700">
                  <div className="flex justify-between py-0.5 border-b border-slate-100">
                    <span className="font-bold text-slate-400">Coach</span>
                    <span className="font-extrabold text-[#041F63]">Sarah Tan</span>
                  </div>
                  
                  <div className="py-0.5 border-b border-slate-100 space-y-0.5">
                    <span className="font-bold text-slate-400 block">Current Slot</span>
                    <span className="font-mono font-bold text-slate-500 block">
                      {new Date(selectedSession.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} at {selectedSession.timeSlot}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5 bg-teal-500/5 p-2 rounded-lg border border-teal-100">
                    <span className="font-bold text-teal-700 block text-[10px]">Proposed Replacement Slot</span>
                    <span className="font-mono font-extrabold text-teal-800 block text-[11px]">
                      {new Date(newDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} at {newTimeSlot}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setModalStep('selector')}
                    className="w-1/3 bg-white border border-[#D7DFEA] text-[#52607A] hover:bg-slate-50 font-bold h-9 rounded-lg text-xs flex items-center justify-center transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmReschedule}
                    disabled={actionLoading}
                    className="flex-1 bg-[#041F63] hover:bg-[#041F63]/90 text-white font-bold h-9 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {actionLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    ) : (
                      "Send Request"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING TRIGGER BUTTON FOR TRAINEE TO MESSAGE COACH */}
      <div className="fixed bottom-[74px] right-[max(16px,calc(50%-195px))] z-[80] flex flex-col items-end gap-3 text-left font-sans">
        <button
          onClick={() => {
            onNavigateToTab('chats');
          }}
          className="w-14 h-14 rounded-full shadow-2xl transition duration-150 active:scale-95 cursor-pointer bg-[#001F3F] hover:bg-slate-900 border border-teal-500/20 text-[#4FFBCC] flex items-center justify-center shrink-0"
          title="Message Coach"
          id="btn-trainee-floating-chat"
        >
          <MessageSquare className="w-5 h-5 text-teal-400" />
        </button>
      </div>

    </div>
  );
}
