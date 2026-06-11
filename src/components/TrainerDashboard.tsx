import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Check, 
  X, 
  MessageSquare, 
  ShieldAlert, 
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
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TrainerProfile, TraineeProfile, WorkoutLog, NutritionLog, BookingSession, Payment, Invoice } from '../types';

interface TrainerDashboardProps {
  trainerProfile: TrainerProfile;
  activeTab?: string;
}

export default function TrainerDashboard({ trainerProfile, activeTab = 'trainer-dashboard' }: TrainerDashboardProps) {
  // Lists
  const [trainees, setTrainees] = useState<TraineeProfile[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [nutrition, setNutrition] = useState<NutritionLog[]>([]);
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Page 2: Client Management States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeProfile | null>(null);
  const [traineeDetailTab, setTraineeDetailTab] = useState<'history' | 'body' | 'photos' | 'ai' | 'chat'>('body');
  
  // AI recommendations states
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null);
  
  // Trainer manual notes saving
  const [notesText, setNotesText] = useState('');
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Page 3: Payments & Billing state filters
  const [paymentSubTab, setPaymentSubTab] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterPackage, setFilterPackage] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
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
      fetchChatMessages();
    }
  }, [trainerProfile, chatOpen]);

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
      // Bookings related to this instructor
      const resBk = await fetch(`/api/bookings?trainerId=${trainerProfile.id}`);
      const dataBk = await resBk.json();
      setBookings(dataBk);

      // Workouts logged by clients
      const resWorkouts = await fetch(`/api/workouts?trainerId=${trainerProfile.id}`);
      const dataWorkouts = await resWorkouts.json();
      setWorkouts(dataWorkouts);

      // Payments from backend
      const resPay = await fetch(`/api/payments?trainerId=${trainerProfile.id}`);
      const dataPay = await resPay.json();
      setPayments(dataPay);

      // Get all assigned trainees
      const resTr = await fetch(`/api/trainees?trainerId=${trainerProfile.id}`);
      if (resTr.ok) {
        const dataTr = await resTr.json();
        setTrainees(dataTr);
        
        // Match base selection
        if (dataTr.length > 0 && !selectedTrainee) {
          // Keep defaults
        }
      } else {
        const resSingle = await fetch(`/api/trainees/u_ahmad`);
        const dataSingle = await resSingle.json();
        setTrainees([dataSingle]);
      }

      // Populate nutrition from Ahmad bin Ibrahim
      const resNutr = await fetch(`/api/nutrition?traineeId=te_ahmad`);
      const dataNutr = await resNutr.json();
      setNutrition(dataNutr);

    } catch (e) {
      console.error('Error loading coach dashboard data:', e);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const res = await fetch(`/api/chats?userA=u_sarah&userB=u_ahmad`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendFloatingMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim()) return;

    try {
      const payload = {
        senderId: 'u_sarah',
        receiverId: 'u_ahmad',
        message: chatInputText
      };

      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setChatInputText('');
        fetchChatMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingStatus = async (bookingId: string, status: 'Approved' | 'Cancelled') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerToast(`Booking slot successfully ${status.toLowerCase()}!`);
        fetchTrainerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleWorkoutReply = async (workoutId: string) => {
    if (!workoutFeedbackText.trim()) return;

    try {
      const res = await fetch(`/api/workouts/${workoutId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: workoutFeedbackText })
      });
      if (res.ok) {
        setReplyingWorkoutId(null);
        setWorkoutFeedbackText('');
        triggerToast('Workout feedback dispatched to trainee timeline!');
        fetchTrainerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNutritionReply = async (nutritionId: string) => {
    if (!nutritionFeedbackText.trim()) return;

    try {
      const res = await fetch(`/api/nutrition/${nutritionId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          feedback: nutritionFeedbackText,
          trainerId: trainerProfile.id
        })
      });
      if (res.ok) {
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
    if (!selectedTraineeId) return;

    try {
      const payload = {
        trainerId: trainerProfile.id,
        traineeId: selectedTraineeId,
        amount: invoiceAmount,
        itemDescription: invoiceDescription,
        dueDate: invoiceDueDate
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const target = trainees.find(t => t.id === selectedTraineeId);
        
        // Add to billing simulation dynamically
        const newSim = {
          id: "pay_sim_" + Date.now(),
          traineeName: target ? target.name : 'Issued Client',
          traineeId: selectedTraineeId,
          packageName: invoiceDescription,
          packageType: invoiceDescription.toLowerCase().includes('monthly') ? 'Monthly' : 'Single',
          amount: invoiceAmount,
          dueDate: invoiceDueDate,
          status: 'Pending',
          month: 'June 2026',
          invoiceNo: 'INV-MY-010' + (billingList.length + 1),
          email: 'client@coachtrack.my'
        };
        setBillingList([newSim, ...billingList]);
        
        setInvoiceCreatedSuccess(true);
        triggerToast('Custom Malaysia Invoice issued with sandbox checkout gateway!');
        setTimeout(() => {
          setInvoiceCreatedSuccess(false);
          setShowInvoiceForm(false);
          fetchTrainerData();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrescribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescribeTraineeId) return;

    try {
      const payload = {
        trainerId: trainerProfile.id,
        traineeId: prescribeTraineeId,
        workoutType: prescribeWorkoutType,
        duration: prescribeDuration,
        exercises: prescribeExercises.filter(ex => ex.name.trim() !== ''),
        notes: prescribeNotes
      };

      const res = await fetch('/api/prescribed-workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setPrescribeSuccess(true);
        triggerToast(`Routine prescribed for ${prescribeTraineeName}!`);
        setTimeout(() => {
          setPrescribeSuccess(false);
          setShowPrescribeForm(false);
          setPrescribeNotes('');
          setPrescribeExercises([{ name: '', sets: 3, reps: 10, weight: 0 }]);
          fetchTrainerData();
        }, 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trainee Deep Stats Helper (Gives realistic mock values for extra trainees)
  const getTraineeStats = (traineeId: string) => {
    const traineeWorkouts = workouts.filter(w => w.traineeId === traineeId);
    const traineeMeals = nutrition.filter(n => n.traineeId === traineeId);
    const traineeBookings = bookings.filter(b => b.traineeId === traineeId);
    
    const defaults: Record<string, any> = {
      'te_ahmad': {
        targetWeight: 75,
        completionRate: 85,
        lastCheckin: traineeWorkouts.length > 0 
          ? `${traineeWorkouts[0].date} - ${traineeWorkouts[0].workoutType}` 
          : "2026-06-10 - Cardio Interval Run",
        latestMeal: traineeMeals.length > 0 
          ? `${traineeMeals[0].foodName} (${traineeMeals[0].calories} kcal)` 
          : "Nasi Lemak tapi kurang manis (620 kcal)",
        paymentStatus: "Paid",
        nextSession: traineeBookings.length > 0 && traineeBookings[0].status === 'Approved'
          ? `${traineeBookings[0].date} @ ${traineeBookings[0].timeSlot}` 
          : "2026-06-12 @ 10:00 AM",
        bodyMetrics: { weight: 84, height: 176, bodyFat: 21.8, muscleMass: 36.4, bmr: 1730 },
        attendance: "92% (12/13 completed)",
        notes: "Excellent commitment to cardio metrics. Lower lumbar spine feels stable after glute bridge repetitions. Needs reminder about daily water consumption in Subang heat."
      },
      'te_ling': {
        targetWeight: 52,
        completionRate: 94,
        lastCheckin: "2026-06-09 - Reformer Pilates Level 1",
        latestMeal: "Shredded Quinoa Salad & Chicken Breast (390 kcal)",
        paymentStatus: "Pending",
        nextSession: "2026-06-13 @ 2:30 PM",
        bodyMetrics: { weight: 58, height: 162, bodyFat: 25.5, muscleMass: 21.2, bmr: 1250 },
        attendance: "96% (24/25 completed)",
        notes: "Post-partum abdominal separation (diastasis recti) is healing well. Focus on safe transverse abdominis stabilizers. Strict posture control on pelvic alignment."
      },
      'te_faizul': {
        targetWeight: 88,
        completionRate: 68,
        lastCheckin: "2026-06-08 - Compound Powerlifting Deadlift Set",
        latestMeal: "Brown Rice & Double Grilled Chicken Breast (820 kcal)",
        paymentStatus: "Overdue",
        nextSession: "None Scheduled",
        bodyMetrics: { weight: 92, height: 180, bodyFat: 17.6, muscleMass: 42.8, bmr: 1980 },
        attendance: "75% (6/8 completed)",
        notes: "High potential for deadlift target of 180kg. Work on thoracic spine extension under heavy loads. Form is solid, but tends to hyper-extend lower lumbar at lockouts."
      }
    };
    
    return defaults[traineeId] || {
      targetWeight: 70,
      completionRate: 80,
      lastCheckin: "None logged this cycle",
      latestMeal: "No meal logged today",
      paymentStatus: "Pending",
      nextSession: "None Booked",
      bodyMetrics: { weight: 75, height: 170, bodyFat: 19.5, muscleMass: 31.0, bmr: 1510 },
      attendance: "80% (0/0)",
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
            <button
              onClick={() => {
                setSelectedTraineeId('te_ahmad');
                setShowInvoiceForm(true);
              }}
              className="bg-[#001F3F] hover:bg-slate-900 text-teal-400 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Issue Custom Invoice
            </button>
          </div>
        </div>

        {/* Invoice Generator Modal Form */}
        {showInvoiceForm && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-left">
              <h3 className="font-display font-medium text-slate-900 text-lg mb-1">
                Issue Certified Malaysia Invoice
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Fill details below to generate a sandbox payment invoice that updates metrics immediately.
              </p>

              {invoiceCreatedSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center my-6">
                  <span className="text-xl">📋</span>
                  <p className="font-bold mt-1">Invoice Issued Successfully!</p>
                  <p className="text-xs text-slate-500">Client notified with checkout page link.</p>
                </div>
              ) : (
                <form onSubmit={handleInvoiceCreateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Choose Active Trainee Client
                    </label>
                    <select
                      value={selectedTraineeId}
                      onChange={(e) => setSelectedTraineeId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800"
                      required
                    >
                      <option value="">-- Choose Client --</option>
                      {trainees.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Session Fee (RM)
                      </label>
                      <input 
                        type="number" 
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Due Date
                      </label>
                      <input 
                        type="date" 
                        value={invoiceDueDate}
                        onChange={(e) => setInvoiceDueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Item Description / Package Details
                    </label>
                    <input 
                      type="text" 
                      value={invoiceDescription}
                      onChange={(e) => setInvoiceDescription(e.target.value)}
                      placeholder="E.g. Monthly Pack (8x Slots)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500 text-slate-800"
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowInvoiceForm(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#001F3F] text-teal-400 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Issue Invoice
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

        {/* 1. ORIGINAL DASHBOARD VIEW */}
        {activeTab === 'trainer-dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Upper quick stats panel */}
            <div className="grid md:grid-cols-3 gap-6 mb-2">
              <div className="bg-[#001F3F] p-5 rounded-2xl text-white shadow-lg border border-slate-800/10 opacity-95 transition-all hover:scale-[1.01]">
                <span className="text-slate-300 text-xs font-semibold uppercase tracking-wider block mb-1">Coach Monthly Verified Intake</span>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-black font-display text-white">RM {paidSumRevenue.toFixed(2)}</span>
                  <p className="text-[10px] text-teal-400 font-bold bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span> Sandbox Live
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-all hover:scale-[1.01]">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Outstanding Due Balance</span>
                  <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {billingList.filter(b => b.status === 'Overdue').length} Overdue
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-black text-rose-500 font-display">RM {overdueSumRevenue.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-medium">{billingList.filter(b => b.status !== 'Paid').length} invoices pending</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm text-white flex flex-col justify-between transition-all hover:scale-[1.01]">
                <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider block">Pending Booking Solicitations</span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-2xl font-black font-display text-white">
                    {bookings.filter(b => b.status === 'Pending').length} Request(s)
                  </span>
                  <span className="text-[10px] uppercase tracking-wider bg-teal-400 text-slate-900 font-black px-2.5 py-1 rounded-md">
                    Review Slots
                  </span>
                </div>
              </div>
            </div>

            {/* Core workout/nutrition logs review grids */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Left Column: Workouts & Food Logs Feedback Queue */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Completed routines log reviews */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Dumbbell className="w-5 h-5 text-[#001F3F]" />
                    <h3 className="font-display font-medium text-slate-800 text-base">
                      Trainee Logged Routines (Awaiting Coach Feedback)
                    </h3>
                  </div>

                  {workouts.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No trainee workouts submitted today.</p>
                  ) : (
                    <div className="space-y-4">
                      {workouts.map((w) => (
                        <div key={w.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/70">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <span className="text-[9px] font-bold text-teal-600 block uppercase tracking-wider">Ahmad bin Ibrahim • Subang Jaya</span>
                              <h4 className="font-bold text-slate-800 text-sm">{w.workoutType} Session Log</h4>
                            </div>
                            <span className="text-2xs font-extrabold text-[#001F3F] bg-[#001F3F]/5 px-2 py-0.5 rounded-lg shrink-0">⏱ {w.duration} mins</span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-2 my-2.5 text-2xs">
                            {w.exercises.map((ex, idx) => (
                              <div key={idx} className="bg-white px-2 py-1 rounded border border-slate-100 text-slate-600 font-medium">
                                {ex.name}: {ex.sets}s × {ex.reps}r {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                              </div>
                            ))}
                          </div>

                          {w.notes && (
                            <p className="text-2xs text-slate-550 italic bg-white p-2 rounded border border-slate-100 mb-3">
                              &ldquo;{w.notes}&rdquo;
                            </p>
                          )}

                          {w.trainerFeedback ? (
                            <div className="mt-2 bg-slate-100 border border-slate-150 text-slate-800 rounded-lg p-2.5 text-2xs">
                              <p className="font-black mb-0.5 text-[9px] uppercase tracking-wider text-slate-500">Your Feedback Review:</p>
                              <p className="italic">&ldquo;{w.trainerFeedback}&rdquo;</p>
                            </div>
                          ) : (
                            <div className="mt-2">
                              {replyingWorkoutId === w.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={workoutFeedbackText}
                                    onChange={(e) => setWorkoutFeedbackText(e.target.value)}
                                    placeholder="Provide coaching advice or alignment adjustments..."
                                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 focus:outline-teal-500"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingWorkoutId(null)}
                                      className="px-3 py-1 text-2xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleWorkoutReply(w.id)}
                                      className="bg-[#001F3F] text-teal-400 font-bold text-2xs py-1 px-3.5 rounded"
                                    >
                                      Send Review
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReplyingWorkoutId(w.id);
                                    setWorkoutFeedbackText('');
                                  }}
                                  className="bg-slate-900 text-white hover:text-teal-400 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Submit Coach Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Nutrition list feedback queue */}
                <div className="bg-white border border-[#001F3F]/10 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Utensils className="w-5 h-5 text-[#001F3F]" />
                    <h3 className="font-display font-medium text-slate-800 text-base">
                      Client Daily Nutritional Submissions
                    </h3>
                  </div>

                  {nutrition.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center font-sans">No client foods logged today.</p>
                  ) : (
                    <div className="space-y-4">
                      {nutrition.map((n) => (
                        <div key={n.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/70">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <span className="text-[9px] font-bold text-teal-600 block uppercase">Client: Ahmad Ibrahim</span>
                              <h4 className="font-bold text-slate-800 text-sm">Meal: {n.foodName}</h4>
                            </div>
                            <span className="text-2xs font-extrabold text-amber-900 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg shrink-0">
                              🔥 {n.calories} kcal
                            </span>
                          </div>

                          <div className="flex gap-4 text-2xs text-slate-500 font-semibold my-2">
                            <span>Carbs: <strong className="text-slate-800">{n.carbs}g</strong></span>
                            <span>Protein: <strong className="text-slate-800">{n.protein}g</strong></span>
                            <span>Fat: <strong className="text-slate-800">{n.fat}g</strong></span>
                          </div>

                          {n.notes && (
                            <p className="text-2xs italic text-slate-550 border-l-2 border-slate-200 pl-2 mb-3">
                              &ldquo;{n.notes}&rdquo;
                            </p>
                          )}

                          {n.trainerFeedback ? (
                            <div className="bg-slate-100 text-slate-800 rounded-lg p-3 text-2xs mt-2 border border-slate-150">
                              <p className="font-black mb-0.5 text-[9px] uppercase tracking-wider text-slate-500">Dietary Recommendation:</p>
                              <p className="italic">&ldquo;{n.trainerFeedback}&rdquo;</p>
                            </div>
                          ) : (
                            <div className="mt-2">
                              {replyingNutritionId === n.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={nutritionFeedbackText}
                                    onChange={(e) => setNutritionFeedbackText(e.target.value)}
                                    placeholder="Provide dietary swaps, macro advice, or hydration guidance..."
                                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-xs text-slate-800 focus:outline-[#001F3F]"
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setReplyingNutritionId(null)}
                                      className="px-3 py-1 text-2xs font-bold text-slate-500 hover:bg-slate-100 rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleNutritionReply(n.id)}
                                      className="bg-[#001F3F] text-teal-400 font-bold text-2xs py-1 px-3.5 rounded"
                                    >
                                      Send Swaps
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setReplyingNutritionId(n.id);
                                    setNutritionFeedbackText('');
                                  }}
                                  className="bg-slate-900 text-white hover:text-teal-400 text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> Submit Dietary Swap
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Sessions requests approvals & mini checklist */}
              <div className="space-y-8">
                
                {/* Bookings approval system */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <h3 className="font-display font-medium text-slate-800 text-base mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    <span>Trainee Booking Requests</span>
                  </h3>

                  {bookings.filter(b => b.status === 'Pending').length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No pending schedule confirmations.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.filter(b => b.status === 'Pending').map((b) => (
                        <div key={b.id} className="border border-slate-100 bg-slate-50/80 p-3.5 rounded-xl text-xs text-left">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-extrabold text-slate-800">{b.traineeName}</span>
                            <span className="text-teal-600 font-black">{b.timeSlot}</span>
                          </div>
                          <p className="text-slate-500 mb-2">Requested date: <strong className="text-slate-700">{b.date}</strong></p>
                          {b.notes && <p className="text-slate-600 bg-white p-2 border border-slate-100 rounded-lg text-[10px] mb-3 leading-snug">&ldquo;{b.notes}&rdquo;</p>}
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleBookingStatus(b.id, 'Approved')}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2 text-xs font-bold transition cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleBookingStatus(b.id, 'Cancelled')}
                              className="flex-1 hover:bg-rose-50 border border-slate-200 text-slate-550 rounded-lg py-2 text-xs font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Approved schedules block */}
                  <div className="border-t border-slate-100 pt-4 mt-4 text-left">
                    <h4 className="font-bold text-[10px] uppercase text-slate-400 font-sans tracking-widest mb-3">
                      Approved Coaching Schedule
                    </h4>
                    {bookings.filter(b => b.status === 'Approved').length === 0 ? (
                      <p className="text-2xs text-slate-400">No scheduled sessions secured today.</p>
                    ) : (
                      <div className="space-y-2">
                        {bookings.filter(b => b.status === 'Approved').map(b => (
                          <div key={b.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100">
                            <div>
                              <span className="font-bold text-slate-800 text-xs block leading-snug">{b.traineeName}</span>
                              <span className="text-slate-400 text-[9px]">{b.location}</span>
                            </div>
                            <span className="text-[#001F3F] font-black text-2xs bg-teal-400/20 px-2 py-0.5 rounded">{b.timeSlot}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Secondary Coach resources guide */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm text-left">
                  <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">My Assigned Coach Stats</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Active Clients</span>
                      <strong className="text-slate-800">{trainees.length} Trainees</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500">Booked Hours (Month)</span>
                      <strong className="text-slate-800">18.5 hrs</strong>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-slate-500">Client Goal Success Rate</span>
                      <strong className="text-teal-600 font-bold">92%</strong>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* 2. DYNAMIC CLIENTS VIEW & DRILL DOWN DETAILS */}
        {activeTab === 'client-management' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header description */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-2xl font-black font-display text-slate-900">Searchable Trainess Roster</h3>
                <p className="text-xs text-slate-500">Manage logs, metrics, attendance and AI workouts optimization for each trainee.</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Query trainees by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-teal-500"
                />
              </div>
            </div>

            {/* Clients Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainees.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map((t) => {
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
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3.5">
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

                      {/* Info specs */}
                      <div className="space-y-2 text-2xs mb-4">
                        <p className="text-slate-500 line-clamp-1"><strong className="text-slate-700">Goal:</strong> {t.goals}</p>
                        <p className="text-slate-550"><strong className="text-slate-700">Metrics Progress:</strong> Height {t.height}cm • Weight {t.weight}kg (Target {stats.targetWeight}kg)</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500">Routines Rate:</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${stats.completionRate}%` }}></div>
                          </div>
                          <strong className="text-slate-800 font-sans">{stats.completionRate}%</strong>
                        </div>
                        <p className="text-slate-550 truncate"><strong className="text-slate-700 font-bold text-slate-650">Last Workout:</strong> {stats.lastCheckin}</p>
                        <p className="text-slate-550 truncate"><strong className="text-slate-700 font-bold text-slate-650">Last Meal:</strong> {stats.latestMeal}</p>
                        <p className="text-slate-500"><strong className="text-slate-700">Next Secured:</strong> <span className="text-[#001F3F] font-semibold">{stats.nextSession}</span></p>
                      </div>
                    </div>

                    {/* Bottom layout */}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                        stats.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        🇲🇾 {stats.paymentStatus} status
                      </span>
                      <button 
                        className="text-teal-600 hover:text-teal-700 text-2xs font-extrabold flex items-center gap-0.5 cursor-pointer"
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
                    <div className="bg-slate-55 bg-slate-100 p-2 border-b border-slate-200 shrink-0 flex gap-2 overflow-x-auto">
                      <button 
                        onClick={() => setTraineeDetailTab('body')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                          traineeDetailTab === 'body' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        📊 Metrics & Notes
                      </button>
                      <button 
                        onClick={() => setTraineeDetailTab('history')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                          traineeDetailTab === 'history' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        🏋️ Workouts History
                      </button>
                      <button 
                        onClick={() => setTraineeDetailTab('photos')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 ${
                          traineeDetailTab === 'photos' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-slate-650 hover:bg-slate-200'
                        }`}
                      >
                        📸 Progress Gallery
                      </button>
                      <button 
                        onClick={() => setTraineeDetailTab('ai')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1 ${
                          traineeDetailTab === 'ai' ? 'bg-[#001F3F] text-white shadow-sm' : 'text-indigo-650 font-black hover:bg-indigo-50'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse text-teal-500" /> AI Coach Optimizer
                      </button>
                    </div>

                    {/* Drawer Scrollable Body Content */}
                    <div className="flex-1 p-6 space-y-6 overflow-y-auto text-left">
                      
                      {/* TAB A: BODY METRICS & EDIT NOTES */}
                      {traineeDetailTab === 'body' && (
                        <div className="space-y-6">
                          
                          {/* Metrics Grid */}
                          <div>
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Trainee Anthropometric Metrics</h4>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Height</span>
                                <strong className="text-slate-800 text-sm font-sans">{selectedTrainee.height} cm</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Weight</span>
                                <strong className="text-slate-800 text-sm font-sans">{selectedTrainee.weight} kg</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-105 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Target Weight</span>
                                <strong className="text-slate-800 text-sm font-sans">{getTraineeStats(selectedTrainee.id).targetWeight} kg</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-105 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Body Fat Rate</span>
                                <strong className="text-slate-800 text-sm font-sans">{getTraineeStats(selectedTrainee.id).bodyMetrics.bodyFat} %</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-105 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Muscle Mass</span>
                                <strong className="text-slate-800 text-sm font-sans">{getTraineeStats(selectedTrainee.id).bodyMetrics.muscleMass} kg</strong>
                              </div>
                              <div className="bg-slate-50 border border-slate-105 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Calculated BMR</span>
                                <strong className="text-[#001F3F] text-sm font-black font-sans">{getTraineeStats(selectedTrainee.id).bodyMetrics.bmr} kcal</strong>
                              </div>
                            </div>
                          </div>

                          {/* Interactive notes */}
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="font-bold text-xs uppercase text-slate-400 tracking-wider">Coach Private Observations</label>
                              {notesSuccess && <span className="text-[10px] font-bold text-teal-600 block">✓ Saved!</span>}
                            </div>
                            <textarea
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              rows={5}
                              placeholder="Type tactical feedback, limitations, injury recovery profiles here..."
                              className="w-full bg-slate-55 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-medium focus:outline-teal-500 mb-2"
                            />
                            <button
                              onClick={handleSaveTraineeNotes}
                              className="bg-[#001F3F] hover:bg-slate-900 text-teal-400 text-2xs font-extrabold px-4 py-2 rounded-lg cursor-pointer transition"
                            >
                              Save Performance Observations
                            </button>
                          </div>
                        </div>
                      )}

                      {/* TAB B: WORKOUTS & ATTENDANCE HISTORICS */}
                      {traineeDetailTab === 'history' && (
                        <div className="space-y-6">
                          
                          {/* Attendance Stat Panel */}
                          <div className="bg-[#001F3F]/5 border border-teal-500/10 p-4 rounded-xl flex justify-between items-center">
                            <div>
                              <strong className="text-slate-800 text-sm block">Subang Center Attendance</strong>
                              <p className="text-[10px] text-slate-500 mt-1">Checked in via physical QR codes.</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[#001F3F] font-black text-base">{getTraineeStats(selectedTrainee.id).attendance}</span>
                            </div>
                          </div>

                          {/* Workouts checklist */}
                          <div>
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider mb-3">Completed Workout Log Historics</h4>
                            <div className="space-y-3">
                              {workouts.filter(w => w.traineeId === selectedTrainee.id).map(w => (
                                <div key={w.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50 text-xs">
                                  <div className="flex justify-between items-center mb-1">
                                    <strong className="text-slate-800">{w.workoutType} Session</strong>
                                    <span className="text-slate-400 text-[10px]">{w.date}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 my-2">
                                    {w.exercises.map((ex, idx) => (
                                      <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-100 font-medium text-slate-600 text-[11px]">
                                        {ex.name} ({ex.sets}x{ex.reps})
                                      </span>
                                    ))}
                                  </div>
                                  {w.notes && <p className="text-slate-500 italic text-[11px]">&ldquo;{w.notes}&rdquo;</p>}
                                </div>
                              ))}

                              {workouts.filter(w => w.traineeId === selectedTrainee.id).length === 0 && (
                                <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">No workout logs registered under this trainee ID.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB C: PROGRESS PHOTOS GALLERY */}
                      {traineeDetailTab === 'photos' && (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Visual Physique Tracker</h4>
                            <label className="bg-[#001F3F] text-teal-400 px-3 py-1.5 rounded-lg text-2xs font-extrabold hover:bg-slate-900 cursor-pointer flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5" /> Upload Photo (mock)
                              <input type="file" className="hidden" onChange={() => triggerToast('Physique photo processed in sandbox securely!')} />
                            </label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
                              <img 
                                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=320" 
                                className="w-full h-36 object-cover rounded-lg mb-2" 
                                alt="Week 1" 
                              />
                              <span className="text-[10px] font-bold text-slate-500">Initial Assessment (Week 1)</span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-105 text-center">
                              <img 
                                src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=320" 
                                className="w-full h-36 object-cover rounded-lg mb-2 grayscale" 
                                alt="Week 8" 
                              />
                              <span className="text-[10px] font-bold text-slate-700">Recent Progression (Week 8)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB D: VERTICAL GEMINI AI RECOMMENDATIONS */}
                      {traineeDetailTab === 'ai' && (
                        <div className="space-y-6">
                          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-950 relative overflow-hidden text-left shadow-lg">
                            <span className="absolute right-1 bottom-1 text-5xl opacity-10 pointer-events-none">✨</span>
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
                              onClick={() => handleAskAiRecommendation(selectedTrainee.id)}
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
                                  <h5 className="font-bold text-sm text-indigo-950">{aiRecommendation.workoutName}</h5>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Primary focus: {aiRecommendation.focus}</p>
                                </div>
                                <span className="bg-teal-600 text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded">✓ Confirmed Plan</span>
                              </div>

                              <div className="space-y-3.5 text-xs">
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

                              {/* Tips */}
                              <div className="bg-slate-900 text-white rounded-xl p-4 text-2xs relative">
                                <span className="text-teal-400 font-extrabold uppercase tracking-wide block mb-1">🇲🇾 Coach Tactical Tips</span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-350">
                                  {aiRecommendation.tips?.map((t: string, tid: number) => (
                                    <li key={tid}>{t}</li>
                                  ))}
                                </ul>
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
        )}

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
                    <div key={id} className="flex flex-col items-center gap-1.5 flex-1 relative group">
                      {/* Tooltip on hover */}
                      <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded pointer-events-none transition duration-150 z-10 font-bold whitespace-nowrap">
                        RM {item.amt}
                      </span>
                      {/* Bar fill */}
                      <div className="w-8 sm:w-10 bg-indigo-950/80 hover:bg-teal-500 rounded transition duration-150 cursor-pointer" style={{ height: item.pct }}></div>
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
                        <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                          {/* Itemized action items */}
                          <button 
                            onClick={() => setSelectedInvoice(b)}
                            className="bg-slate-900 text-teal-400 text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer"
                          >
                            View Invoice
                          </button>
                          
                          {b.status !== 'Paid' && (
                            <button 
                              onClick={() => handleSendReminder(b.traineeName)}
                              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-650 text-[10px] px-2.5 py-1 rounded cursor-pointer"
                            >
                              Send Reminder
                            </button>
                          )}
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

            {/* BILLING INVOICE ITEM DETAIL Dialog Modal */}
            <AnimatePresence>
              {selectedInvoice && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl relative text-left overflow-hidden flex flex-col justify-between"
                  >
                    
                    {/* Invoice Paper layout */}
                    <div className="p-8 space-y-6">
                      
                      {/* Paper Top section */}
                      <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                        <div>
                          <h4 className="font-display font-black text-slate-800 text-base flex items-center gap-1">
                            <span className="text-[#001F3F]">COACH</span><span className="text-teal-600">TRACK MY</span>
                          </h4>
                          <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Malaysia Certified Invoice</p>
                          <p className="text-[10px] text-slate-500 mt-2 font-mono">
                            SST ID Reference: Tax-Free Sandbox Exempt<br/>
                            Coach Sarah Tan Registry • SS15 Studio, Selangor
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded font-black text-2xs uppercase mb-3 ${
                            selectedInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            selectedInvoice.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            Selected Registry: {selectedInvoice.status}
                          </span>
                          <p className="text-slate-800 font-bold font-mono text-sm leading-none">#{selectedInvoice.invoiceNo}</p>
                          <p className="text-slate-450 text-[10px] text-slate-400 mt-1">Due Date: {selectedInvoice.dueDate}</p>
                        </div>
                      </div>

                      {/* Coach & Trainee Address Cards */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase">Service Provider (Coach)</span>
                          <strong className="text-slate-800 block text-[11px]">{trainerProfile.name}</strong>
                          <p className="text-slate-500 text-[10px] mt-0.5">Discipline: {trainerProfile.discipline}</p>
                          <p className="text-slate-400 text-[10px] leading-snug">Malaysia Digital Gym Associate</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase">Bill To (Trainee Client)</span>
                          <strong className="text-slate-800 block text-[11px]">{selectedInvoice.traineeName}</strong>
                          <p className="text-slate-550 text-[10px] mt-0.5">Trainee Reference ID: {selectedInvoice.traineeId}</p>
                          <p className="text-slate-400 text-[10px] leading-snug">Ahmad Ibrahim Resident address, Kuala Lumpur</p>
                        </div>
                      </div>

                      {/* Items details Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="font-bold text-slate-500">
                              <th className="px-4 py-2">Item Description</th>
                              <th className="px-4 py-2 text-center">Qty</th>
                              <th className="px-4 py-2 text-right">Rates (RM)</th>
                              <th className="px-4 py-2 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-4 py-3 font-semibold text-slate-800 leading-snug">
                                {selectedInvoice.packageName}<br/>
                                <span className="text-[10px] text-slate-400">Exclusive personalized functional progress plan</span>
                              </td>
                              <td className="px-4 py-3 text-center">1</td>
                              <td className="px-4 py-3 text-right">RM {selectedInvoice.amount}.00</td>
                              <td className="px-4 py-3 text-right font-bold text-[#001F3F]">RM {selectedInvoice.amount}.00</td>
                            </tr>
                            <tr className="border-t border-slate-150 font-bold bg-slate-50/50 text-slate-800">
                              <td colSpan={3} className="px-4 py-2 text-right uppercase text-[9px] tracking-wider text-slate-400">Total payable (MYR)</td>
                              <td className="px-4 py-2 text-right font-black text-sm text-slate-900 border-t border-slate-350">RM {selectedInvoice.amount}.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Corporate compliance notes */}
                      <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100 space-y-1">
                        <p className="font-bold">Sandbox Bank Information Guide (FPX Gateway simulation):</p>
                        <p>Funds processes instantly back to trainer ledger upon confirmation. Invoice is compiled automatically on each package booking request event.</p>
                      </div>

                    </div>

                    {/* Paper Footer */}
                    <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-between shrink-0">
                      <button 
                        onClick={() => setSelectedInvoice(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                      >
                        Close Preview
                      </button>
                      <button 
                        onClick={() => triggerToast('Direct Invoice PDF generation mocked with browser print queue successfully!')}
                        className="px-4 py-2 border border-slate-205 hover:bg-slate-200 text-slate-650 bg-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Print Invoice
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      {/* 4. CHAT MESSAGE COMPACT INTERACTIVE TOGGLE AT LOWER-RIGHT REGION FOR COACH */}
      <div className="fixed bottom-6 right-6 z-50 text-left">
        <AnimatePresence>
          {chatOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.92 }}
              className="bg-white rounded-2xl w-[350px] h-[480px] shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden absolute bottom-16 right-0"
            >
              {/* Header inside floating box */}
              <div className="bg-[#001F3F] text-white p-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center font-bold text-slate-950 text-xs">
                    💬
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-xs leading-none">Ahmad Ibrahim (Client)</h4>
                    <span className="text-[9px] text-teal-400 font-bold block mt-1 tracking-wide uppercase">Active Thread • FPX Sandbox</span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 rounded hover:bg-white/10 text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat messages body list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/75">
                {chatMessages.length === 0 ? (
                  <p className="text-2xs text-slate-400 py-12 text-center">No chat messages with Ahmad yet.</p>
                ) : (
                  chatMessages.map(m => {
                    const isCoach = m.senderId === 'u_sarah';
                    return (
                      <div key={m.id} className={`flex ${isCoach ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-2xs ${
                          isCoach ? 'bg-[#001F3F] text-white rounded-tr-none' : 'bg-white text-slate-800 border rounded-tl-none border-slate-100 shadow-xs'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.message}</p>
                          <span className="text-[9px] block text-right mt-1.5 opacity-60">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input direct box row */}
              <form onSubmit={handleSendFloatingMessage} className="bg-white p-3 border-t border-slate-100 flex gap-1.5 shrink-0">
                <input 
                  type="text" 
                  placeholder="Review client progress or send tips..."
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-[#001F3F]"
                />
                <button 
                  type="submit" 
                  className="bg-[#001F3F]/10 hover:bg-[#001F3F]/20 text-[#001F3F] p-2 rounded-xl transition duration-75 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Circular Floating trigger button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={`flex items-center justify-center rounded-full p-4 shadow-2xl transition-all duration-150 scale-110 active:scale-95 cursor-pointer ${
            chatOpen ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-[#001F3F] hover:bg-slate-900 text-teal-400'
          }`}
          title="Direct Client Messaging"
          id="btn-coach-floating-chat"
        >
          {chatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5 text-teal-400" />}
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
