import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Heart, ShieldCheck, MapPin, Award, Star, 
  MessageSquare, Share2, AlertTriangle, Check, ChevronRight, 
  Clock, CheckCircle2, CreditCard, ShieldAlert 
} from 'lucide-react';
import { TrainerProfile, BookingSession } from '../types';
import { dbService } from '../lib/dbService';

interface BookingFlowOverlayProps {
  trainer: TrainerProfile;
  traineeId: string;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
  initialStep?: 'details' | 'booking';
}

const TRAINER_METADATA_MAP: Record<string, {
  regId: string;
  languages: string[];
  trainerType: string;
  accreditationBody: string;
  certExpiry: string;
  licenseStatus: string;
  ratingsBreakdown: {
    professionalism: number;
    communication: number;
    results: number;
    punctuality: number;
  };
  testimonials: { author: string; text: string; rating: number }[];
}> = {
  tr_sarah: {
    regId: 'MY-TR-9017',
    languages: ['English', 'Bahasa Melayu', 'Mandarin', 'Cantonese'],
    trainerType: 'Freelance & Gym',
    accreditationBody: 'NASM (Sports Medicine)',
    certExpiry: '2028-11-20',
    licenseStatus: 'Active & Authenticated',
    ratingsBreakdown: { professionalism: 5.0, communication: 4.8, results: 4.9, punctuality: 4.9 },
    testimonials: [
      { author: 'Ahmad Ibrahim', text: 'Sarah helped me recover from lower back pain in just 6 weeks. Her posture corrections are incredibly precise!', rating: 5 },
      { author: 'Mei Ling Tan', text: 'Every lesson is tailored beautifully. Very professional environment!', rating: 5 },
      { author: 'Muhammad Faizul', text: 'Excellent athletic coaching expertise. Highly supportive!', rating: 4 }
    ]
  },
  tr_faiz: {
    regId: 'MY-TR-7115',
    languages: ['Bahasa Melayu', 'English'],
    trainerType: 'Gym-Based Operator',
    accreditationBody: 'ACE (Exercise)',
    certExpiry: '2028-01-10',
    licenseStatus: 'Registered & Certified',
    ratingsBreakdown: { professionalism: 4.8, communication: 4.7, results: 4.9, punctuality: 4.8 },
    testimonials: [
      { author: 'Ariff Roslan', text: 'Coach Faiz pushed my squat target to 140kg safely and structured my nutrition guidelines perfectly.', rating: 5 },
      { author: 'Chong Wei', text: 'Strong tactical strength plans. SS15 gym has premier equipment.', rating: 5 }
    ]
  },
  tr_rishi: {
    regId: 'MY-TR-8812',
    languages: ['English', 'Tamil', 'Bahasa Melayu'],
    trainerType: 'Freelance Specialist',
    accreditationBody: 'NASM Nutrition Specialist',
    certExpiry: '2027-09-30',
    licenseStatus: 'Verified Consultant',
    ratingsBreakdown: { professionalism: 4.7, communication: 4.8, results: 4.8, punctuality: 4.6 },
    testimonials: [
      { author: 'Devendra S.', text: 'Rishi is an aerobic powerhouse! Keeps you highly motivated and accountable.', rating: 5 },
      { author: 'Jasmine Kaur', text: 'I lost 8kg in 2 months with Rishi. Challenging workouts but amazing results!', rating: 4 }
    ]
  }
};

const SERVICES_CATALOG = [
  'Personal Training Assessment',
  'Postural Alignment & Kinesiology',
  'Weight Management Routines',
  'Strength & Conditioning',
  'Yoga & Therapeutic Mindfulness',
  'HIIT Functional Training'
];

export default function BookingFlowOverlay({
  trainer,
  traineeId,
  onClose,
  onNavigateToTab,
  initialStep = 'details'
}: BookingFlowOverlayProps) {
  const meta = TRAINER_METADATA_MAP[trainer.id] || {
    regId: 'MY-TR-5555',
    languages: ['English', 'Bahasa Melayu'],
    trainerType: 'Certified Professional',
    accreditationBody: 'Malaysian Fitness Accreditation',
    certExpiry: '2027-12-31',
    licenseStatus: 'Verified Instructor',
    ratingsBreakdown: { professionalism: 4.8, communication: 4.8, results: 4.8, punctuality: 4.8 },
    testimonials: [{ author: 'Client', text: 'Highly professional, great attention to details.', rating: 5 }]
  };

  const isSarah = trainer.id === 'tr_sarah';
  const ratingVal = isSarah ? 4.9 : trainer.rating;
  const reviewCount = isSarah ? 128 : (trainer.id === 'tr_faiz' ? 42 : 28);

  const [bookingStep, setBookingStep] = useState<'details' | 'booking' | 'payment' | 'completed'>(initialStep);
  const [selectedPackage, setSelectedPackage] = useState<'single' | 'bundle4' | 'monthly'>('single');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [bookingRefNotes, setBookingRefNotes] = useState('Postural correction and flexible target goals.');
  const [paymentOption, setPaymentOption] = useState('fpx_maybank');
  
  const [selectedRecurringDay, setSelectedRecurringDay] = useState<string>('Monday');
  const [selectedRecurringDays, setSelectedRecurringDays] = useState<string[]>(['Tuesday', 'Friday']);
  const [selectedRecurringTime, setSelectedRecurringTime] = useState<string>('10:00 AM');
  
  const [trainerBookings, setTrainerBookings] = useState<BookingSession[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [bookingSuccessId, setBookingSuccessId] = useState('');
  const [bookingSuccessInvoice, setBookingSuccessInvoice] = useState('');

  useEffect(() => {
    dbService.getBookings({ trainerId: trainer.id })
      .then(setTrainerBookings)
      .catch(err => console.error("Error loading trainer bookings:", err));
  }, [trainer.id]);

  const formatSummaryDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const dayNum = parseInt(parts[2], 10);
    return `${dayNum} ${monthNames[monthIdx] || ''} ${year}`;
  };

  const next7Days = React.useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        isoString: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        monthShort: d.toLocaleDateString('en-US', { month: 'short' })
      };
    }).filter(day => day.dayName !== 'Sun').slice(0, 7);
  }, []);

  useEffect(() => {
    if (next7Days.length > 0 && !selectedDate) {
      setSelectedDate(next7Days[0].isoString);
    }
  }, [next7Days, selectedDate]);

  const handleToggleRecurringDay = (day: string) => {
    if (selectedRecurringDays.includes(day)) {
      setSelectedRecurringDays(selectedRecurringDays.filter(d => d !== day));
    } else {
      if (selectedRecurringDays.length < 2) {
        setSelectedRecurringDays([...selectedRecurringDays, day]);
      } else {
        setSelectedRecurringDays([selectedRecurringDays[1], day]);
      }
    }
  };

  const getNextDatesForDay = (dayName: string, count: number): string[] => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = daysOfWeek.findIndex(d => d.toLowerCase() === dayName.toLowerCase());
    if (targetDayIndex === -1) return [];

    const dates: string[] = [];
    const today = new Date();
    let steps = 1;
    while (dates.length < count && steps < 60) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + steps);
      if (nextDate.getDay() === targetDayIndex) {
        dates.push(nextDate.toISOString().split('T')[0]);
      }
      steps++;
    }
    return dates;
  };

  const getNextDatesForDays = (dayNames: string[], countPerDay: number): string[] => {
    const dates: string[] = [];
    dayNames.forEach(day => {
      dates.push(...getNextDatesForDay(day, countPerDay));
    });
    return dates.sort();
  };

  const getConflicts = (): string[] => {
    if (selectedPackage === 'single') {
      const isReserved = trainerBookings.some(b => b.date === selectedDate && b.timeSlot === selectedTimeSlot && b.status !== 'Cancelled');
      return isReserved ? [selectedDate] : [];
    } else if (selectedPackage === 'bundle4') {
      const dates = getNextDatesForDay(selectedRecurringDay, 4);
      return dates.filter(dt => 
        trainerBookings.some(b => b.date === dt && b.timeSlot === selectedRecurringTime && b.status !== 'Cancelled')
      );
    } else {
      if (selectedRecurringDays.length === 0) return [];
      const dates = getNextDatesForDays(selectedRecurringDays, 4);
      return dates.filter(dt => 
        trainerBookings.some(b => b.date === dt && b.timeSlot === selectedRecurringTime && b.status !== 'Cancelled')
      );
    }
  };

  const currentConflicts = getConflicts();
  const hasConflicts = currentConflicts.length > 0;

  const handleConfirmSecureBooking = async () => {
    setIsProcessingPayment(true);
    try {
      let packageCost = trainer.pricePerHour;
      let packageLabel = 'Single Class Trial';

      if (selectedPackage === 'bundle4') {
        packageCost = isSarah ? 310 : Math.round((trainer.pricePerHour * 4) * 0.9);
        packageLabel = '4 Classes Per Month';
      } else if (selectedPackage === 'monthly') {
        packageCost = isSarah ? 600 : Math.round((trainer.pricePerHour * 8) * 0.8);
        packageLabel = '8 Classes Per Month';
      } else {
        packageCost = isSarah ? 80 : trainer.pricePerHour;
        packageLabel = 'Single Session';
      }

      const sessionsToCreate: { date: string; timeSlot: string; notes: string }[] = [];
      let mainDate = selectedDate || new Date().toISOString().split('T')[0];
      let mainTime = selectedTimeSlot || '10:00 AM';

      if (selectedPackage === 'single') {
        sessionsToCreate.push({
          date: mainDate,
          timeSlot: mainTime,
          notes: `Selected Package: Single Session assessment. Notes: ${bookingRefNotes}`
        });
      } else if (selectedPackage === 'bundle4') {
        const recDay = selectedRecurringDay || 'Monday';
        mainTime = selectedRecurringTime || '10:00 AM';
        const dates = getNextDatesForDay(recDay, 4);
        mainDate = dates[0] || mainDate;
        dates.forEach((dt, idx) => {
          sessionsToCreate.push({
            date: dt,
            timeSlot: mainTime,
            notes: `4-Class Bundle: Carded Class #${idx + 1} (${recDay}). Notes: ${bookingRefNotes}`
          });
        });
      } else if (selectedPackage === 'monthly') {
        const recDays = selectedRecurringDays.length === 2 ? selectedRecurringDays : ['Tuesday', 'Friday'];
        mainTime = selectedRecurringTime || '10:00 AM';
        const dates = getNextDatesForDays(recDays, 4);
        mainDate = dates[0] || mainDate;
        dates.forEach((dt, idx) => {
          sessionsToCreate.push({
            date: dt,
            timeSlot: mainTime,
            notes: `8-Class Monthly: Carded Class #${idx + 1}. Selected: ${recDays.join(', ')}. Notes: ${bookingRefNotes}`
          });
        });
      }

      const matchesOverlap = sessionsToCreate.some(sess => {
        return trainerBookings.some(b => b.date === sess.date && b.timeSlot === sess.timeSlot && b.status !== 'Cancelled');
      });

      if (matchesOverlap && selectedPackage === 'single') {
        alert("CRITICAL WARNING: Overlap double booking detected! That time slot is already reserved. Please select another active booking slot.");
        setIsProcessingPayment(false);
        return;
      }

      let firstCreated: any = null;
      for (const sess of sessionsToCreate) {
        const bookPayload = {
          trainerId: trainer.id,
          traineeId: traineeId || 'te_ahmad',
          traineeName: 'Ahmad Ibrahim',
          date: sess.date,
          timeSlot: sess.timeSlot,
          location: trainer.location,
          notes: sess.notes,
          packageType: selectedPackage === 'single' ? ('Single Slot' as any) : ('Monthly Pack' as any),
          amountPaid: packageCost,
          status: 'Approved' as any
        };
        const res = await dbService.createBooking(bookPayload);
        if (!firstCreated) firstCreated = res;
      }

      const invoicePayload = {
        trainerId: trainer.id,
        traineeId: traineeId || 'te_ahmad',
        amount: packageCost,
        itemDescription: `${packageLabel} with Coach ${trainer.name} [Scheduled Starts ${mainDate} ${mainTime}]`,
        dueDate: mainDate
      };

      const invoiceRes = await dbService.createInvoice(invoicePayload);
      const randomId = Math.floor(Math.random() * 90000 + 10000);
      const invString = `INV-${invoiceRes?.id?.split('_').pop()?.toUpperCase() || randomId}`;
      setBookingSuccessInvoice(invString);
      setBookingSuccessId(firstCreated?.id || `b_${randomId}`);

      const messageBody = `🚨 *CoachTrack MY Marketplace Instant Checkout Confirmation* 🚨\n\n🎯 *Coach:* ${trainer.name}\n📦 *Package:* ${packageLabel}\n🗓️ *Starts:* ${mainDate} at ${mainTime}\n💰 *Escrow Deposit Received:* RM ${packageCost} (Cleared via FPX)\n🧾 *Invoice:* ${invString}\n\n_Your trainer has been locked. Chat below to align posture goals!_`;
      
      await dbService.createChatMessage({
        senderId: traineeId || 'te_ahmad',
        receiverId: trainer.userId,
        message: messageBody
      });

      setTimeout(async () => {
        const coachGreeting = `Hi Ahmad! I have received your instant booking slot for the *${packageLabel}* (${mainTime} starts ${mainDate}). Looking forward to helping you recover alignment and build customized core patterns at ${trainer.location}. Be sure to bring loose clothes. Let's make it count! 🧘‍♀️✨`;
        await dbService.createChatMessage({
          senderId: trainer.userId,
          receiverId: traineeId || 'te_ahmad',
          message: coachGreeting
        });
      }, 1500);

      setBookingStep('completed');
    } catch (e) {
      console.error(e);
      alert("Billing connection failed. Please retry.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-150 shadow-md overflow-hidden text-left w-full max-w-[390px] mx-auto flex flex-col box-border font-sans select-none">
      {/* Return Navigation bar */}
      <div className="bg-[#001F3F] text-white py-3 px-4 flex items-center justify-between shrink-0">
        <button 
          onClick={onClose}
          className="flex items-center gap-1 text-teal-300 hover:text-teal-400 font-extrabold text-[11px] bg-white/10 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <span className="text-[9px] uppercase font-mono text-slate-300 tracking-wider">
          Verified Coach Registry
        </span>
      </div>

      {/* Profile Header banner */}
      <div className="relative bg-[#081F63] p-4 text-white flex flex-col gap-3 items-center border-b border-indigo-950 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent pointer-events-none" />
        <img 
          referrerPolicy="no-referrer"
          src={trainer.avatarUrl} 
          className="w-16 h-16 rounded-xl object-cover border-2 border-slate-700 shadow-lg shrink-0" 
          alt={trainer.name}
        />
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <h2 className="font-sans font-black text-base text-white leading-tight">
              {trainer.name}
            </h2>
            <span className="bg-[#18D4C5] text-[#001F3F] text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
              <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED MY-COACH
            </span>
          </div>

          <p className="text-teal-400 font-extrabold text-[10px] uppercase tracking-wider">
            {trainer.discipline} • {meta.trainerType}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-[10px] text-slate-300 font-medium">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-teal-400 shrink-0" /> {trainer.location}
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5 font-bold text-teal-300">
              ★ {ratingVal.toFixed(1)}
            </span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-1 pt-0.5">
            {meta.languages.map((l, idx) => (
              <span key={idx} className="bg-white/10 text-slate-200 text-[8.5px] px-1.5 py-0.5 rounded font-mono">
                🗣️ {l}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Quick Card */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center w-full">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-black text-teal-400 tracking-wider">Lesson Trial Rate</span>
            <p className="text-lg font-display font-black text-white">RM {isSarah ? 80 : trainer.pricePerHour}</p>
          </div>
          {bookingStep === 'details' && (
            <button
              onClick={() => setBookingStep('booking')}
              className="w-full bg-[#18D4C5] hover:bg-teal-400 text-[#001F3F] font-black text-xs py-2 rounded-lg mt-2 transition shadow cursor-pointer uppercase tracking-wider"
            >
              Instant Booking
            </button>
          )}
        </div>
      </div>

      {/* Multiphase Scheduling Steps in Single Column Mobile Layout */}
      <div className="flex-1 overflow-y-auto">
        
        {bookingStep === 'details' && (
          <div className="p-4 space-y-4 bg-slate-50/50">
            {/* Bio text */}
            <div className="space-y-1 bg-white p-3.5 border border-slate-100 rounded-xl shadow-xs text-left">
              <h3 className="font-sans font-black text-slate-900 text-[10px] tracking-wider uppercase border-b pb-1 border-slate-100">
                Biography & Mission
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {trainer.bio}
              </p>
              <p className="text-slate-400 text-[9px] italic leading-normal">
                Serving Malaysia since 2020. Utilizing custom heart-rate monitoring and alignment practices for secure physical progression.
              </p>
            </div>

            {/* Specialties */}
            <div className="space-y-2 bg-white p-3.5 border border-slate-100 rounded-xl shadow-xs text-left">
              <h3 className="font-sans font-black text-slate-900 text-[10px] tracking-wider uppercase border-b pb-1 border-slate-100">
                Specialties & Activations
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {SERVICES_CATALOG.map((serv, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-center gap-1 text-[9.5px] text-slate-700 min-w-0">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">{serv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-2 bg-white p-3.5 border border-slate-100 rounded-xl shadow-xs text-left">
              <h3 className="font-sans font-black text-slate-900 text-[10px] tracking-wider uppercase border-b pb-1 border-slate-100">
                Accredited Certifications
              </h3>
              <div className="space-y-1.5">
                {trainer.certificates.map((cert, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-150 rounded-lg p-2 flex justify-between items-center text-[11px]">
                    <div className="flex gap-1.5 items-start min-w-0">
                      <Award className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <strong className="text-slate-800 block truncate text-[10px]">{cert}</strong>
                        <span className="text-[9px] text-slate-400 block truncate">
                          Status: <strong className="text-teal-700 font-bold">{meta.licenseStatus}</strong>
                        </span>
                      </div>
                    </div>
                    <span className="text-[8px] bg-white border px-1 rounded text-slate-500 shrink-0">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ratings & Testimonials */}
            <div className="space-y-3 bg-white p-3.5 border border-slate-100 rounded-xl shadow-xs text-left">
              <h3 className="font-sans font-black text-slate-900 text-[10px] tracking-wider uppercase border-b pb-1 border-slate-100">
                Performance Breakdown
              </h3>
              
              <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-150 text-[10px]">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Professionalism</span>
                    <strong className="text-[#001F3F] font-mono">{meta.ratingsBreakdown.professionalism.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Communication</span>
                    <strong className="text-[#001F3F] font-mono">{meta.ratingsBreakdown.communication.toFixed(1)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Results</span>
                    <strong className="text-[#001F3F] font-mono">{meta.ratingsBreakdown.results.toFixed(1)}</strong>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 border-l border-slate-200 pl-2 flex flex-col justify-center leading-relaxed">
                  <p className="font-bold text-slate-700">100% Audited</p>
                  <p className="mt-0.5">Reviews matched with calendar workout logs.</p>
                </div>
              </div>

              <div className="space-y-2">
                {meta.testimonials.map((t, i) => (
                  <div key={i} className="border border-slate-100 rounded-lg p-2.5 bg-white shadow-xs space-y-0.5 text-left">
                    <div className="flex justify-between items-center text-slate-400 text-[9px]">
                      <span className="font-bold text-slate-700">{t.author}</span>
                      <span className="text-yellow-500 font-black">★ {t.rating}</span>
                    </div>
                    <p className="text-slate-600 italic text-[10px] leading-relaxed">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Selector Card */}
            <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs space-y-3 text-left">
              <span className="text-[9px] font-black text-teal-600 uppercase bg-teal-50 px-1.5 py-0.5 rounded">
                STEP 1: SELECT PACKAGE BUNDLE
              </span>
              <h3 className="font-sans font-black text-slate-900 text-xs">
                Choose Class Coaching Package
              </h3>
              <p className="text-[9.5px] text-slate-500 leading-normal">
                Select a package. Date/time selection is on the next screen. Escrow funds are secure.
              </p>

              <div className="space-y-2">
                <div 
                  onClick={() => setSelectedPackage('single')}
                  className={`p-2.5 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                    selectedPackage === 'single' ? 'border-[#001F3F] bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <strong className="text-2xs font-black text-slate-800 block">Single Trial Class</strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">1-hour posture assessment</span>
                  </div>
                  <span className="text-xs font-black text-[#001F3F]">RM {isSarah ? 80 : trainer.pricePerHour}</span>
                </div>

                <div 
                  onClick={() => setSelectedPackage('bundle4')}
                  className={`p-2.5 rounded-lg border-2 cursor-pointer transition relative overflow-hidden flex items-center justify-between ${
                    selectedPackage === 'bundle4' ? 'border-[#001F3F] bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="absolute top-0 right-0 bg-teal-500 text-slate-950 text-[6px] font-bold uppercase px-1.5 py-0.2 rounded-bl font-mono">
                    SAVE 10%
                  </span>
                  <div>
                    <strong className="text-2xs font-black text-slate-800 block">4 Classes Per Month</strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Recurring weekly slots</span>
                  </div>
                  <span className="text-xs font-black text-[#001F3F]">RM {isSarah ? 310 : Math.round(trainer.pricePerHour * 4 * 0.9)}</span>
                </div>

                <div 
                  onClick={() => setSelectedPackage('monthly')}
                  className={`p-2.5 rounded-lg border-2 cursor-pointer transition relative overflow-hidden flex items-center justify-between ${
                    selectedPackage === 'monthly' ? 'border-[#001F3F] bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[6px] font-bold uppercase px-1.5 py-0.2 rounded-bl font-mono">
                    SAVE 20%
                  </span>
                  <div>
                    <strong className="text-2xs font-black text-slate-800 block">8 Classes Per Month</strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5 font-bold text-indigo-700">Recommended</span>
                  </div>
                  <span className="text-xs font-black text-[#001F3F]">RM {isSarah ? 600 : Math.round(trainer.pricePerHour * 8 * 0.8)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookingStep('booking')}
                className="w-full bg-[#001F3F] hover:bg-slate-900 text-[#18D4C5] font-black text-xs py-2 rounded-lg transition flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
              >
                <span>Select Date & Time</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Share and prechat buttons */}
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Coach profile link copied!")}
                className="flex-1 bg-white border p-2 rounded-lg text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-slate-50 cursor-pointer"
              >
                <Share2 className="w-3 h-3 text-slate-400" /> Share Coach
              </button>
              <button 
                onClick={() => {
                  const btn = document.getElementById('floating-chat-toggle');
                  if (btn) btn.click();
                }}
                className="flex-1 bg-white border p-2 rounded-lg text-slate-700 font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-slate-50 cursor-pointer"
              >
                <MessageSquare className="w-3 h-3 text-slate-400" /> Pre-Chat Inquiry
              </button>
            </div>
          </div>
        )}

        {bookingStep === 'booking' && (
          <div className="p-4 bg-slate-50/50">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm text-left font-sans space-y-3.5 overflow-hidden relative">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight">
                    Select Schedule
                  </h3>
                  <span className="text-[8px] font-black text-indigo-600 uppercase">
                    STEP 2 of 3
                  </span>
                </div>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                  {selectedPackage === 'single' ? 'Single Session' : selectedPackage === 'bundle4' ? '4 Classes' : '8 Classes'}
                </span>
              </div>

              {selectedPackage === 'single' ? (
                <div className="space-y-3 font-sans">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Available calendar days</span>
                    <div className="flex gap-1 overflow-x-auto pb-1.5 snap-x no-scrollbar">
                      {next7Days.map((day) => {
                        const isPicked = selectedDate === day.isoString;
                        return (
                          <button
                            key={day.isoString}
                            type="button"
                            onClick={() => setSelectedDate(day.isoString)}
                            className={`flex-shrink-0 w-[44px] h-[44px] text-center rounded-[10px] border flex flex-col items-center justify-center transition cursor-pointer p-1 leading-[1.1] ${
                              isPicked 
                                ? 'bg-[#001F3F] border-[#001F3F] text-white shadow-xs'
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="text-[8.5px] uppercase font-bold opacity-75">{day.dayName}</span>
                            <span className="text-[13px] font-bold mt-0.5">{day.dateNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Available slots</span>
                    <div className="grid grid-cols-2 gap-1.5 font-sans w-full">
                      {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => {
                        const isSlotPicked = selectedTimeSlot === slot;
                        const isReserved = trainerBookings.some(b => b.date === selectedDate && b.timeSlot === slot && b.status !== 'Cancelled');
                        
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isReserved}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`h-[44px] rounded-[10px] p-[8px_10px] border text-center transition flex flex-col justify-center items-center relative text-[13px] font-bold leading-[1.1] ${
                              isReserved
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                : isSlotPicked
                                  ? 'bg-[#001F3F] border-[#001F3F] text-white'
                                  : 'bg-white border-[#001F3F] text-[#001F3F] hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <span>{slot}</span>
                            {isReserved && <span className="text-[7.5px] text-rose-500 font-bold block leading-none mt-0.5">BOOKED</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : selectedPackage === 'bundle4' ? (
                <div className="space-y-3 font-sans">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Select ONE Recurring Day</span>
                    <div className="grid grid-cols-3 gap-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                        const isDaySelected = selectedRecurringDay === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedRecurringDay(day)}
                            className={`h-[44px] text-[13px] text-center font-bold rounded-[10px] border transition cursor-pointer ${
                              isDaySelected 
                                ? 'bg-[#001F3F] border-[#001F3F] text-white' 
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Choose Recurring Time</span>
                    <div className="grid grid-cols-2 gap-1.5 font-sans w-full">
                      {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => {
                        const isTimeSelected = selectedRecurringTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedRecurringTime(slot)}
                            className={`h-[44px] rounded-[10px] p-[8px_10px] border text-center transition flex flex-col justify-center items-center text-[13px] font-bold leading-[1.1] ${
                              isTimeSelected 
                                ? 'bg-[#001F3F] border-[#001F3F] text-white' 
                                : 'bg-white border-[#001F3F] text-[#001F3F] hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <span>{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-sans">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-500 block">Select TWO Recurring Days</span>
                      <span className="text-[8px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                        {selectedRecurringDays.length} / 2
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                        const isDaySelected = selectedRecurringDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleToggleRecurringDay(day)}
                            className={`h-[44px] text-[13px] text-center font-bold rounded-[10px] border transition cursor-pointer ${
                              isDaySelected 
                                ? 'bg-[#001F3F] border-[#001F3F] text-white' 
                                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {day.substring(0, 3)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Choose Recurring Time</span>
                    <div className="grid grid-cols-2 gap-1.5 font-sans w-full">
                      {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => {
                        const isTimeSelected = selectedRecurringTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedRecurringTime(slot)}
                            className={`h-[44px] rounded-[10px] p-[8px_10px] border text-center transition flex flex-col justify-center items-center text-[13px] font-bold leading-[1.1] ${
                              isTimeSelected 
                                ? 'bg-[#001F3F] border-[#001F3F] text-white' 
                                : 'bg-white border-[#001F3F] text-[#001F3F] hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <span>{slot}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Conflict Warnings */}
              {hasConflicts && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg space-y-1 font-sans">
                  <div className="flex gap-1 items-center font-bold text-[9px] uppercase text-red-800">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Schedule Warning</span>
                  </div>
                  <p className="text-[9px] leading-tight font-semibold text-red-800">
                    Coach already booked for:
                  </p>
                  <div className="text-[9px] bg-white/70 px-2 py-1 rounded border border-red-100 max-h-16 overflow-y-auto space-y-0.5 font-bold">
                    {currentConflicts.map(dt => (
                      <div key={dt} className="flex justify-between items-center text-red-900">
                        <span>🗓️ {dt}</span>
                        <span className="text-[7px] bg-red-100 text-red-800 px-1 py-0.2 rounded font-bold">BUSY</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Summary Card */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-1.5 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-500">Package:</span>
                  <span className="text-[14px] font-bold text-slate-900 truncate max-w-[150px]">
                    {selectedPackage === 'single' ? 'Single Session' : selectedPackage === 'bundle4' ? '4 Classes' : '8 Classes'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-500">Coach:</span>
                  <span className="text-[14px] font-bold text-slate-900">{trainer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-500">Date:</span>
                  <span className="text-[14px] font-bold text-slate-900 leading-tight text-right truncate max-w-[150px]">
                    {selectedPackage === 'single' ? formatSummaryDate(selectedDate) : selectedPackage === 'bundle4' ? `Every ${selectedRecurringDay}` : `Weekly: ${selectedRecurringDays.join(', ')}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-bold text-slate-500">Time:</span>
                  <span className="text-[14px] font-bold text-indigo-950">
                    {selectedPackage === 'single' ? selectedTimeSlot : selectedRecurringTime}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t border-slate-150 pt-3 font-sans">
                <button 
                  type="button"
                  onClick={() => setBookingStep('details')}
                  className="flex-1 h-[44px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-[10px] transition cursor-pointer text-center text-[13px]"
                >
                  Back
                </button>
                <button 
                  type="button"
                  onClick={() => setBookingStep('payment')}
                  disabled={hasConflicts || (selectedPackage === 'monthly' && selectedRecurringDays.length !== 2)}
                  className="flex-1 h-[44px] bg-[#001F3F] hover:bg-slate-900 border border-indigo-950 text-white font-bold rounded-[10px] transition text-center text-[13px] cursor-pointer shadow-xs disabled:opacity-45 disabled:cursor-not-allowed font-sans"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {bookingStep === 'payment' && (
          <div className="p-4 bg-slate-50/50">
            <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
              <span className="text-[9px] font-black text-teal-600 uppercase bg-teal-50 px-2 py-0.5 rounded">
                STEP 3: SECURE CHECKOUT
              </span>
              
              <h3 className="font-sans font-black text-slate-900 text-xs">
                Malaysian FPX Direct Escrow
              </h3>

              {(() => {
                let baseAmt = isSarah ? 80 : trainer.pricePerHour;
                if (selectedPackage === 'bundle4') baseAmt = isSarah ? 310 : Math.round(trainer.pricePerHour * 4 * 0.9);
                if (selectedPackage === 'monthly') baseAmt = isSarah ? 600 : Math.round(trainer.pricePerHour * 8 * 0.8);
                
                const commission = Number((baseAmt * 0.05).toFixed(2));
                const netPayout = Number((baseAmt - commission).toFixed(2));
                return (
                  <div className="bg-slate-50 border p-3 rounded-lg text-2xs space-y-2 text-slate-600 font-medium">
                    <div className="flex justify-between border-b pb-1.5 border-slate-200">
                      <span className="font-bold text-slate-800">Lesson Price:</span>
                      <span className="font-bold text-slate-800">RM {baseAmt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coach Net:</span>
                      <span>RM {netPayout}</span>
                    </div>
                    <div className="flex justify-between text-[#18D4C5] bg-[#001F3F] px-1.5 py-0.5 rounded text-[10px]">
                      <span>Platform Fee (5%):</span>
                      <span className="font-mono">RM {commission}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-black text-xs pt-1 border-t">
                      <span>Total ESCROW:</span>
                      <span>RM {baseAmt}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2 text-2xs">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Choose banking gateway</span>
                
                <div className="space-y-1.5">
                  <label className={`border rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition ${paymentOption === 'fpx_maybank' ? 'border-[#001F3F] bg-[#001F3F]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="pay" 
                      checked={paymentOption === 'fpx_maybank'} 
                      onChange={() => setPaymentOption('fpx_maybank')} 
                      className="accent-[#001F3F]"
                    />
                    <div className="text-left leading-none">
                      <strong className="text-slate-800 block text-xs">Maybank2u FPX Bank</strong>
                      <span className="text-[8px] text-teal-600 uppercase font-black font-mono block mt-0.5">Clears instantly</span>
                    </div>
                  </label>

                  <label className={`border rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition ${paymentOption === 'fpx_cimb' ? 'border-[#001F3F] bg-[#001F3F]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="pay" 
                      checked={paymentOption === 'fpx_cimb'} 
                      onChange={() => setPaymentOption('fpx_cimb')} 
                      className="accent-[#001F3F]"
                    />
                    <div className="text-left leading-none">
                      <strong className="text-slate-800 block text-xs">CIMB Clicks Instant</strong>
                      <span className="text-[8px] text-slate-400 block mt-0.5">SST Exempt Platform</span>
                    </div>
                  </label>

                  <label className={`border rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition ${paymentOption === 'fpx_rhb' ? 'border-[#001F3F] bg-[#001F3F]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                    <input 
                      type="radio" 
                      name="pay" 
                      checked={paymentOption === 'fpx_rhb'} 
                      onChange={() => setPaymentOption('fpx_rhb')} 
                      className="accent-[#001F3F]"
                    />
                    <div className="text-left leading-none">
                      <strong className="text-slate-800 block text-xs">RHB Now Direct fpx</strong>
                      <span className="text-[8px] text-slate-400 block mt-0.5">Full Encrypted Escrow</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <button 
                  onClick={() => setBookingStep('booking')}
                  className="flex-1 h-[44px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-[10px] transition cursor-pointer text-[13px]"
                >
                  Back
                </button>
                
                <button 
                  onClick={handleConfirmSecureBooking}
                  disabled={isProcessingPayment}
                  className="flex-1 h-[44px] bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1.5 cursor-pointer text-[13px]"
                >
                  {isProcessingPayment ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Authorize Escrow</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {bookingStep === 'completed' && (
          <div className="p-4 bg-slate-50/50">
            <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3.5 text-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              
              <h3 className="font-sans font-black text-emerald-950 text-sm leading-tight">
                Booking Fully Confirmed!
              </h3>
              
              <p className="text-[10.5px] text-slate-600 leading-relaxed">
                Your payment has cleared. Coach <strong className="text-[#001F3F]">{trainer.name}</strong> has been booked and notified instantly via chat.
              </p>

              <div className="bg-slate-50 border rounded-lg p-3 text-left text-2xs space-y-1 text-slate-600">
                <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Receipt Invoice Details</span>
                <div className="flex justify-between">
                  <span>Tax Invoice:</span>
                  <strong className="text-slate-900 font-mono text-[9px]">{bookingSuccessInvoice}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Booking Code:</span>
                  <strong className="text-slate-950 font-mono text-[9px] uppercase">{bookingSuccessId}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Reserved Starts:</span>
                  <strong className="text-slate-900 truncate max-w-[150px]">
                    {selectedPackage === 'single' ? `${selectedDate} (${selectedTimeSlot})` : `Every ${selectedPackage === 'bundle4' ? selectedRecurringDay : selectedRecurringDays.join('/')}`}
                  </strong>
                </div>
              </div>

              <div className="space-y-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTab('trainee-dashboard');
                  }}
                  className="w-full bg-[#001F3F] hover:bg-slate-900 text-[#18D4C5] font-black py-2 rounded-lg transition"
                >
                  Go to Trainee Dashboard
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-teal-600 font-bold text-2xs hover:underline block mx-auto cursor-pointer"
                >
                  Browse Other Trainers
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
