import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {   MapPin, 
  Search, 
  Compass, 
  ShieldCheck, 
  Star, 
  Calendar, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  Share2, 
  Heart, 
  AlertTriangle, 
  FileText, 
  Check, 
  Award, 
  X,
  CreditCard,
  Percent,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { TrainerProfile, BookingSession } from '../types';
import { dbService } from '../lib/dbService';

interface TrainerFinderProps {
  traineeId: string;
  onNavigateToTab: (tab: string) => void;
}

const MALAYSIAN_HUBS = [
  { name: 'Mid Valley Megamall, KL', lat: 3.1186, lng: 101.6775 },
  { name: 'Bangsar, KL center', lat: 3.1258, lng: 101.6715 },
  { name: 'SS15, Subang Jaya', lat: 3.0789, lng: 101.5944 },
  { name: 'KLCC Tower area', lat: 3.1578, lng: 101.7118 },
  { name: 'Damansara Uptown, PJ', lat: 3.1365, lng: 101.6215 }
];

// High fidelity trainer reviews & credential metadata
const TRAINER_METADATA_MAP: Record<string, {
  regId: string;
  languages: string[];
  trainerType: string;
  studioName?: string;
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
    trainerType: 'Freelance & Gym-Based',
    studioName: 'Bangsar Pilates Lab',
    accreditationBody: 'NASM (National Academy of Sports Medicine)',
    certExpiry: '2028-11-20',
    licenseStatus: 'Active & Authenticated by Ministry of Youth & Sports Malaysia',
    ratingsBreakdown: { professionalism: 5.0, communication: 4.8, results: 4.9, punctuality: 4.9 },
    testimonials: [
      { author: 'Ahmad bin Ibrahim', text: 'Sarah helped me recover from lower back pain in just 6 weeks. Her posture corrections are incredibly precise!', rating: 5 },
      { author: 'Mei Ling Tan', text: 'Every lesson is tailored beautifully. Very professional environment!', rating: 5 },
      { author: 'Muhammad Faizul', text: 'Excellent prenatal expertise. My wife loves her session structures!', rating: 4 }
    ]
  },
  tr_faiz: {
    regId: 'MY-TR-7115',
    languages: ['Bahasa Melayu', 'English'],
    trainerType: 'Gym-Based Operator',
    studioName: 'SS15 Iron Palace Gym',
    accreditationBody: 'ACE (American Council on Exercise)',
    certExpiry: '2028-01-10',
    licenseStatus: 'Registered & Certified Sports Coach Malaysia',
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
    studioName: 'Prime Strength & Fat Loss Studio',
    accreditationBody: 'NASM Fitness Nutrition Specialist',
    certExpiry: '2027-09-30',
    licenseStatus: 'Verified Fitness Consultant',
    ratingsBreakdown: { professionalism: 4.7, communication: 4.8, results: 4.8, punctuality: 4.6 },
    testimonials: [
      { author: 'Devendra S.', text: 'Rishi is an aerobic powerhouse! Keeps you highly motivated and accountable throughout the week.', rating: 5 },
      { author: 'Jasmine Kaur', text: 'I lost 8kg in 2 months with Rishi. Challenging workouts but amazing results!', rating: 4 }
    ]
  }
};

const SERVICES_CATALOG = [
  'Personal Training',
  'Group Training',
  'Online Coaching',
  'Sports Coaching',
  'Yoga Classes',
  'Strength & Conditioning',
  'Weight Loss Programs',
  'Rehabilitation Programs'
];

export default function TrainerFinder({ traineeId, onNavigateToTab }: TrainerFinderProps) {
  const [trainers, setTrainers] = useState<(TrainerProfile & { distance: number })[]>([]);
  const [selectedHub, setSelectedHub] = useState(0); 
  const [radiusKm, setRadiusKm] = useState(10); 
  const [searchDiscipline, setSearchDiscipline] = useState('');
  const [loading, setLoading] = useState(false);

  // Detail View and step booking flow
  const [activeDetailsTrainer, setActiveDetailsTrainer] = useState<TrainerProfile | null>(null);
  const [savedFavorites, setSavedFavorites] = useState<string[]>([]);
  const [activeReviewTab, setActiveReviewTab] = useState<'all' | 'highest'>('all');
  
  // Interactive Custom Booking State
  const [bookingStep, setBookingStep] = useState<'details' | 'booking' | 'payment' | 'completed'>('details');
  const [selectedPackage, setSelectedPackage] = useState<'single' | 'bundle4' | 'monthly'>('single');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM');
  const [bookingRefNotes, setBookingRefNotes] = useState('First consultation and initial fitness goals setup.');
  const [paymentOption, setPaymentOption] = useState('fpx_maybank');
  
  const [bookingSuccessId, setBookingSuccessId] = useState('');
  const [bookingSuccessInvoice, setBookingSuccessInvoice] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessRegisteredModal, setShowSuccessRegisteredModal] = useState(false);

  // Auto redirect after 5 seconds if registered
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccessRegisteredModal) {
      timer = setTimeout(() => {
        setShowSuccessRegisteredModal(false);
        setActiveDetailsTrainer(null);
        setBookingStep('details');
        onNavigateToTab('find-trainer');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [showSuccessRegisteredModal]);

  // Initialize dates
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      isoString: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthShort: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  useEffect(() => {
    if (next7Days.length > 0 && !selectedDate) {
      setSelectedDate(next7Days[0].isoString);
    }
  }, []);

  useEffect(() => {
    fetchNearbyTrainers();
  }, [selectedHub, radiusKm, searchDiscipline]);

  const fetchNearbyTrainers = async () => {
    setLoading(true);
    try {
      const hub = MALAYSIAN_HUBS[selectedHub];
      const data = await dbService.searchNearbyTrainers(hub.lat, hub.lng, radiusKm, searchDiscipline);
      setTrainers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedFavorites.includes(id)) {
      setSavedFavorites(savedFavorites.filter(f => f !== id));
    } else {
      setSavedFavorites([...savedFavorites, id]);
    }
  };

  const handleOpenTrainerDetails = (trainer: TrainerProfile) => {
    setActiveDetailsTrainer(trainer);
    setBookingStep('details');
  };

  const handleStartBookingProcess = () => {
    setBookingStep('booking');
  };

  const handleGoToPayment = () => {
    setBookingStep('payment');
  };

  const handleConfirmSecureBooking = async () => {
    if (!activeDetailsTrainer) return;
    setIsProcessingPayment(true);

    try {
      // Calculate payment amounts based on package selected
      let amount = activeDetailsTrainer.pricePerHour;
      let packLabel = 'Single Class Trial';

      if (selectedPackage === 'bundle4') {
        amount = Math.round((activeDetailsTrainer.pricePerHour * 4) * 0.9); // 10% bundle discount
        packLabel = '4-Class Package Bundle';
      } else if (selectedPackage === 'monthly') {
        amount = Math.round((activeDetailsTrainer.pricePerHour * 8) * 0.8); // 20% premium loyalty discount
        packLabel = 'Monthly Continuous Coaching';
      }

      // 1. Create calendar booking
      const bookPayload = {
        trainerId: activeDetailsTrainer.id,
        traineeId: traineeId || 'te_ahmad',
        traineeName: 'Ahmad Ibrahim',
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        location: activeDetailsTrainer.location,
        notes: `Selected Package: ${packLabel}. Brief limit: ${bookingRefNotes}`,
        packageType: selectedPackage === 'single' ? 'Single Slot' : 'Monthly Pack' as any,
        amountPaid: amount,
        status: 'Approved' as any
      };

      const bookingRes = await dbService.createBooking(bookPayload);

      // 2. Generate a PAID custom payment receipt invoice inside Malaysian Ringgit (MYR)
      const invoicePayload = {
        trainerId: activeDetailsTrainer.id,
        traineeId: traineeId || 'te_ahmad',
        amount: amount,
        itemDescription: `${packLabel} [Coach ${activeDetailsTrainer.name} - ${selectedDate} ${selectedTimeSlot}]`,
        dueDate: selectedDate
      };

      const invoiceRes = await dbService.createInvoice(invoicePayload);

      // Update state if we saved via supabase or mock state
      if (invoiceRes) {
        const invoiceId = invoiceRes.newInvoice?.id || invoiceRes.newPayment?.id || invoiceRes.id || '';
        const paymentId = invoiceRes.newPayment?.id || invoiceRes.id;
        
        // Mock set to paid
        if (paymentId) {
          await dbService.payInvoice(paymentId);
        }
        if (invoiceId) {
          setBookingSuccessInvoice(`INV-${invoiceId.split('_').pop()?.toUpperCase() || invoiceId.slice(0, 6).toUpperCase()}`);
        } else {
          setBookingSuccessInvoice(`INV-${Math.floor(Math.random() * 90000 + 10000)}`);
        }
      } else {
        setBookingSuccessInvoice(`INV-${Math.floor(Math.random() * 90000 + 10000)}`);
      }

      setBookingSuccessId(bookingRes ? bookingRes.id : `b_${Math.floor(Math.random() * 8000 + 1000)}`);

      // 3. Automated dispatch communication confirmation to private Trainee - Trainer chat message!
      const messageBody = `Automated CoachTrack Booking cleared!\n📌 Coach: ${activeDetailsTrainer.name}\n📦 Package: ${packLabel}\n🗓️ Session: ${selectedDate} at ${selectedTimeSlot}\n💰 Amount Paid: RM ${amount} (Cleared via FPX)\nInvoice: ${bookingSuccessInvoice || 'INV-MY-ONLINE'}`;
      
      await dbService.createChatMessage({
        senderId: traineeId || 'te_ahmad',
        receiverId: activeDetailsTrainer.userId,
        message: messageBody
      });

      // Dispatch simulated response from Trainer back to Ahmad in chat
      setTimeout(async () => {
        await dbService.createChatMessage({
          senderId: activeDetailsTrainer.userId,
          receiverId: traineeId || 'te_ahmad',
          message: `Terima kasih Ahmad! I received your booking for the ${packLabel} on ${selectedDate} (${selectedTimeSlot}). I will prepare a premium posture assessment for our workout hours. See you soon at ${activeDetailsTrainer.location}!`
        });
      }, 1000);

      setBookingStep('completed');
      setShowSuccessRegisteredModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const getTrainerMeta = (trainerId: string) => {
    return TRAINER_METADATA_MAP[trainerId] || {
      regId: 'MY-TR-5555',
      languages: ['English', 'Bahasa Melayu'],
      trainerType: 'Certified Professional',
      accreditationBody: 'Malaysian Fitness Accreditation',
      certExpiry: '2027-12-31',
      licenseStatus: 'Verified Instructor',
      ratingsBreakdown: { professionalism: 4.8, communication: 4.8, results: 4.8, punctuality: 4.8 },
      testimonials: [{ author: 'Client', text: 'Great experience', rating: 5 }]
    };
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24 pt-6 text-left relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toggle between Main Discovery and Overlaid Trainer details */}
        {!activeDetailsTrainer ? (
          <>
            {/* Search header context */}
            <div className="mb-8">
              <span className="text-[10px] font-black tracking-wider uppercase bg-[#001F3F] text-teal-400 px-3 py-1 rounded-full mb-2.5 inline-block">
                CoachTrack Malaysia Partnership
              </span>
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <Compass className="w-7 h-7 text-[#001F3F]" />
                <span>Premium Trainer Marketplace</span>
              </h2>
              <p className="text-slate-500 text-sm">
                Unlock direct coaching access. Browse accredited specialists, view certificates, verify client ratings, and book instant workout slots close to your location.
              </p>
            </div>

            {/* Locator Controls Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Hub dropdown */}
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>Search Hub (KL & Selangor)</span>
                  </label>
                  <select
                    value={selectedHub}
                    onChange={(e) => setSelectedHub(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-[#001F3F]"
                  >
                    {MALAYSIAN_HUBS.map((hub, i) => (
                      <option key={i} value={i}>{hub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Radius controller */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">
                      Search Fence Radius
                    </label>
                    <span className="text-teal-600 font-extrabold text-xs">{radiusKm} KM</span>
                  </div>
                  <input 
                    type="range" 
                    min="2" 
                    max="25" 
                    value={radiusKm} 
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-[#001F3F]"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1.5 uppercase">
                    <span>2 km</span>
                    <span className="text-teal-600">Standard range</span>
                    <span>25 km</span>
                  </div>
                </div>

                {/* Search discipline */}
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Search className="w-3.5 h-3.5 text-teal-600" />
                    <span>Filter Specialization</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="Search Yoga, Strength, Fat Loss..."
                    value={searchDiscipline}
                    onChange={(e) => setSearchDiscipline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-[#001F3F]"
                  />
                </div>

              </div>
            </div>

            {/* List block */}
            {loading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 text-xs uppercase font-extrabold tracking-wider">Locating nearest coaches...</p>
              </div>
            ) : trainers.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-150 rounded-3xl shadow-sm">
                <span className="text-4xl block mb-2">📍</span>
                <h4 className="font-display font-medium text-slate-800 text-lg">No trainers matched in range</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try sliding the geofence widget wider or modifying the specialization search criteria to explore more certified tutors.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {trainers.map((t) => {
                  const isFav = savedFavorites.includes(t.id);
                  return (
                    <div 
                      key={t.id}
                      onClick={() => handleOpenTrainerDetails(t)}
                      className="bg-white border-2 border-slate-100 hover:border-teal-500/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group text-left"
                    >
                      {/* Top display banner */}
                      <div className="relative">
                        <div className="bg-[#001F3F] h-28 relative overflow-hidden flex items-end p-4">
                          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-transparent"></div>
                          <span className="text-[9px] font-black uppercase text-teal-400 bg-white/10 px-2 py-0.5 rounded backdrop-blur">
                            Verified Hub Coach
                          </span>
                        </div>
                        
                        <img 
                          referrerPolicy="no-referrer"
                          src={t.avatarUrl} 
                          alt={t.name}
                          className="w-20 h-20 rounded-full border-4 border-white object-cover absolute -bottom-10 left-5 shadow-md flex-shrink-0"
                        />
                        
                        <button
                          onClick={(e) => toggleFavorite(t.id, e)}
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow transition-all active:scale-90"
                          title="Favorite toggle"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
                        </button>
                      </div>

                      {/* Content parameters */}
                      <div className="p-5 pt-12 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className="font-display font-black text-slate-900 text-lg group-hover:text-teal-600 transition leading-tight">
                              {t.name}
                            </h4>
                            {t.verified && (
                              <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-100 uppercase tracking-widest shadow-sm">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-teal-600 font-extrabold mb-3 uppercase tracking-wider">{t.discipline}</p>

                          <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t.location}</span>
                            <span className="text-slate-300">•</span>
                            <strong className="text-teal-700 font-black">{t.distance} km away</strong>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-5">
                            {t.bio}
                          </p>
                        </div>

                        {/* Summary accreditation */}
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-5 flex justify-between items-center">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Credentials</span>
                            <span className="text-xs font-semibold text-slate-700 truncate block">
                              {t.certificates[0]}
                            </span>
                          </div>
                          <span className="bg-slate-200/60 text-slate-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            {t.experienceYears} Years
                          </span>
                        </div>

                        {/* Footer card controls */}
                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Trial Fee</span>
                            <span className="font-display font-black text-slate-900 text-base">
                              RM {t.pricePerHour} <span className="text-[10px] text-slate-400 font-normal">/ session</span>
                            </span>
                          </div>

                          <div className="bg-[#001F3F] text-teal-400 group-hover:bg-teal-600 group-hover:text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition duration-300 shadow">
                            <span>Open Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* ========================================================
             STYLIZED PREMIUM DEDICATED TRAINER DETAILS PAGE / SCREENS
             ======================================================== */
          <div className="bg-white rounded-3xl border border-slate-105 shadow-xl overflow-hidden text-left">
            
            {/* Page Header Back controls */}
            <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center text-xs">
              <button 
                onClick={() => setActiveDetailsTrainer(null)}
                className="flex items-center gap-1.5 text-teal-400 hover:text-teal-350 font-extrabold bg-white/10 px-3 py-2 rounded-xl transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Discovery Marketplace</span>
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-slate-400 hidden sm:inline">Viewing verified credentials</span>
                <button
                  onClick={(e) => toggleFavorite(activeDetailsTrainer.id, e)}
                  className="bg-white/10 hover:bg-white/15 p-2 rounded-full transition"
                  title="Toggle favorite status"
                >
                  <Heart className={`w-4 h-4 ${savedFavorites.includes(activeDetailsTrainer.id) ? 'text-red-500 fill-current' : 'text-slate-300'}`} />
                </button>
              </div>
            </div>

            {/* Profile Hero banner */}
            <div className="relative bg-[#001F3F] py-12 px-6 sm:px-10 text-white flex flex-col md:flex-row gap-6 md:gap-8 items-center border-b border-indigo-950">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-indigo-500/15 pointer-events-none"></div>
              
              <img 
                referrerPolicy="no-referrer"
                src={activeDetailsTrainer.avatarUrl} 
                className="w-32 h-32 rounded-3xl object-cover border-4 border-slate-800 shadow-xl shrink-0" 
                alt={activeDetailsTrainer.name}
              />

              <div className="text-center md:text-left flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h3 className="font-display font-black text-2xl sm:text-3xl tracking-tight text-white leading-none">
                    {activeDetailsTrainer.name}
                  </h3>
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                    <ShieldCheck className="w-3.5 h-3.5 text-white" /> Live Certified Verified
                  </span>
                </div>

                <p className="text-teal-400 font-extrabold text-sm uppercase tracking-wider">
                  {activeDetailsTrainer.discipline} ({getTrainerMeta(activeDetailsTrainer.id).trainerType})
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400" /> {activeDetailsTrainer.location} Center ({activeDetailsTrainer.distance} km)
                  </span>
                  <span>•</span>
                  <span><strong>Accredited Expiry:</strong> {getTrainerMeta(activeDetailsTrainer.id).certExpiry}</span>
                  <span>•</span>
                  <span><strong>Reg ID:</strong> {getTrainerMeta(activeDetailsTrainer.id).regId}</span>
                </div>

                <div className="pt-2 flex justify-center md:justify-start gap-1">
                  {getTrainerMeta(activeDetailsTrainer.id).languages.map((l, idx) => (
                    <span key={idx} className="bg-white/10 text-slate-200 text-[10px] px-2 py-0.5 rounded font-medium">
                      🗣️ {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* Instant booking shortcut sidebar */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shrink-0 text-center w-full md:w-auto min-w-[200px]">
                <span className="text-[10px] font-extrabold text-[#76c7c0] block uppercase tracking-widest mb-1">Trial Session Rate</span>
                <p className="text-3xl font-display font-black text-white">RM {activeDetailsTrainer.pricePerHour}</p>
                <p className="text-[9px] text-slate-400 mt-1">Fully dynamic sandbox invoice generated</p>
                
                <button
                  onClick={handleStartBookingProcess}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs py-3.5 px-6 rounded-xl w-full mt-4 transition shadow cursor-pointer uppercase tracking-wider"
                >
                  ⚡ Book Live Slot
                </button>
              </div>
            </div>

            {/* Split Grid Details */}
            <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              
              {/* Left Column Profile fields */}
              <div className="lg:col-span-2 p-6 sm:p-8 space-y-8">
                
                {/* Biography About */}
                <div className="space-y-3">
                  <h4 className="font-display font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                    Professional Biography & Mission
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {activeDetailsTrainer.bio}
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed italic">
                    With over {activeDetailsTrainer.experienceYears} years of verified experience instructing fitness in Selangor and Klang Valley, I focus heavily on posture correction, functional daily movements, strength calibration, and safety parameters.
                  </p>
                </div>

                {/* Services Catalog Offerd */}
                <div className="space-y-3">
                  <h4 className="font-display font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                    Scope of Services Catalog & Specializations
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {SERVICES_CATALOG.map((serv, idx) => {
                      const hasService = idx % 2 === 0 || serv.toLowerCase().includes('conditioning') || serv.toLowerCase().includes('personal') || serv.toLowerCase().includes('weight');
                      return (
                        <div 
                          key={idx} 
                          className={`flex items-center gap-2.5 p-2 rounded-xl text-xs border ${
                            hasService 
                              ? 'bg-emerald-50/20 border-emerald-100 text-slate-800' 
                              : 'bg-slate-50/50 border-slate-100 text-slate-400'
                          }`}
                        >
                          <Check className={`w-4 h-4 ${hasService ? 'text-emerald-600' : 'text-slate-300'}`} />
                          <span className={hasService ? 'font-bold' : ''}>{serv}</span>
                          {hasService && <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded-sm ml-auto font-black uppercase">Active</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Accreditations Certificates details */}
                <div className="space-y-4">
                  <h4 className="font-display font-black text-slate-900 text-base border-b border-slate-100 pb-2">
                    Certifications, Exponees & Accreditation Bureau
                  </h4>
                  
                  <div className="space-y-3">
                    {activeDetailsTrainer.certificates.map((cert, idx) => (
                      <div key={idx} className="border border-slate-150 rounded-2xl p-4 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                        <div className="flex gap-3 items-start text-left">
                          <div className="bg-[#001F3F] text-teal-400 p-2.5 rounded-xl shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <strong className="text-slate-800 block text-sm">{cert}</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Registered Status: <span className="text-emerald-700 font-bold">{getTrainerMeta(activeDetailsTrainer.id).licenseStatus}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Accredited by {getTrainerMeta(activeDetailsTrainer.id).accreditationBody}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-0 pt-2.5 sm:pt-0">
                          <button 
                            onClick={() => alert(`Reviewing certified license: ${cert}\nStatus: Authenticated`)}
                            className="text-[10px] font-bold text-slate-700 border border-slate-350 bg-white hover:bg-slate-50 p-2 rounded-lg w-full sm:w-auto text-center"
                          >
                            View Instructor Credential PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ratings Breakdown and Testimonials */}
                <div className="space-y-5">
                  <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                    <h4 className="font-display font-black text-slate-900 text-base">
                      Ratings Verification & Live Testimonials
                    </h4>
                    <div className="flex items-center gap-1 text-sm font-black text-slate-850">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{activeDetailsTrainer.rating} / 5.0 Rating</span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-150">
                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Performance Index</span>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Professionalism</span>
                        <strong className="text-[#001F3F] font-bold font-mono">{getTrainerMeta(activeDetailsTrainer.id).ratingsBreakdown.professionalism.toFixed(1)} / 5.0</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-normal">Communication Skill</span>
                        <strong className="text-[#001F3F] font-bold font-mono">{getTrainerMeta(activeDetailsTrainer.id).ratingsBreakdown.communication.toFixed(1)} / 5.0</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Results Adherence</span>
                        <strong className="text-[#001F3F] font-bold font-mono">{getTrainerMeta(activeDetailsTrainer.id).ratingsBreakdown.results.toFixed(1)} / 5.0</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Punctuality</span>
                        <strong className="text-[#001F3F] font-bold font-mono">{getTrainerMeta(activeDetailsTrainer.id).ratingsBreakdown.punctuality.toFixed(1)} / 5.0</strong>
                      </div>
                    </div>

                    <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-5 text-xs flex flex-col justify-center">
                      <p className="font-bold text-slate-800">100% Verified Reviews</p>
                      <p className="text-slate-500 mt-1 text-2xs leading-relaxed">
                        Every single client review undergoes mandatory CoachTrack matching verifying booked trainer hours before public dispatch validation.
                      </p>
                    </div>
                  </div>

                  {/* Testimonial bubbles */}
                  <div className="space-y-3">
                    {getTrainerMeta(activeDetailsTrainer.id).testimonials.map((test, tid) => (
                      <div key={tid} className="border border-slate-100 rounded-2xl p-4 text-xs bg-white shadow-sm flex flex-col gap-1 text-left">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-slate-800">{test.author}</span>
                          <div className="flex text-yellow-500">
                            {Array.from({ length: test.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 italic">
                          &ldquo; {test.text} &rdquo;
                        </p>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
              
              {/* Right Column Booking step processor */}
              <div className="p-6 sm:p-8 bg-slate-50/50">
                
                {bookingStep === 'details' && (
                  <div className="space-y-6">
                    <div className="border-2 border-slate-900 rounded-3xl p-5 bg-white shadow-md space-y-4">
                      <span className="text-[10px] uppercase font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded inline-block tracking-wider">
                        Step 1: Discover Bundles
                      </span>
                      <h4 className="font-display font-black text-[#001F3F] text-lg leading-tight">
                        Choose Class Coaching Package
                      </h4>
                      <p className="text-xs text-slate-500 leading-normal">
                        Select a target package that matches your fitness budget. All payments are securely simulated.
                      </p>

                      <div className="space-y-3">
                        {/* Package Cards */}
                        <div 
                          onClick={() => setSelectedPackage('single')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            selectedPackage === 'single' 
                              ? 'border-slate-800 bg-slate-50 shadow-sm' 
                              : 'border-slate-150 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <strong className="text-xs font-black uppercase tracking-wider text-slate-900">Single Session Pack</strong>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPackage === 'single' ? 'bg-[#001F3F] border-transparent' : 'border-slate-300'}`}>
                              {selectedPackage === 'single' && <Check className="w-2.5 h-2.5 text-teal-400" />}
                            </div>
                          </div>
                          <p className="text-2xs text-slate-500">1x Class Assessment (1 hour duration)</p>
                          <p className="text-2xs text-[#76c7c0] uppercase font-extrabold mt-1">Perfect for trial seekers</p>
                          <p className="text-lg font-black text-[#001F3F] mt-1.5">RM {activeDetailsTrainer.pricePerHour}</p>
                        </div>

                        <div 
                          onClick={() => setSelectedPackage('bundle4')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                            selectedPackage === 'bundle4' 
                              ? 'border-slate-800 bg-slate-50 shadow-sm' 
                              : 'border-slate-150 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="absolute top-0 right-0 bg-teal-500 text-slate-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl">
                            Best Value
                          </span>
                          <div className="flex justify-between items-center mb-1">
                            <strong className="text-xs font-black uppercase tracking-wider text-slate-900">4-Class Package</strong>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPackage === 'bundle4' ? 'bg-[#001F3F] border-transparent' : 'border-slate-300'}`}>
                              {selectedPackage === 'bundle4' && <Check className="w-2.5 h-2.5 text-teal-400" />}
                            </div>
                          </div>
                          <p className="text-2xs text-slate-500">4x Customized Sessions (60 Days Validity)</p>
                          <p className="text-2xs text-teal-600 font-extrabold mt-1">Save RM {Math.round(activeDetailsTrainer.pricePerHour * 0.4)} over individual slots!</p>
                          <p className="text-lg font-black text-[#001F3F] mt-1.5">RM {Math.round((activeDetailsTrainer.pricePerHour * 4) * 0.9)}</p>
                        </div>

                        <div 
                          onClick={() => setSelectedPackage('monthly')}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                            selectedPackage === 'monthly' 
                              ? 'border-slate-800 bg-slate-50 shadow-sm' 
                              : 'border-slate-150 bg-white hover:bg-slate-50'
                          }`}
                        >
                          <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl">
                            Fully Immersive
                          </span>
                          <div className="flex justify-between items-center mb-1">
                            <strong className="text-xs font-black uppercase tracking-wider text-slate-900">Monthly Support</strong>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPackage === 'monthly' ? 'bg-[#001F3F] border-transparent' : 'border-slate-300'}`}>
                              {selectedPackage === 'monthly' && <Check className="w-2.5 h-2.5 text-teal-400" />}
                            </div>
                          </div>
                          <p className="text-2xs text-slate-500">8x Sessions + Unlimited Chat support & daily meal analysis</p>
                          <p className="text-2xs text-indigo-700 font-extrabold mt-1">20% Premium loyalty bundle price</p>
                          <p className="text-lg font-black text-[#001F3F] mt-1.5">RM {Math.round((activeDetailsTrainer.pricePerHour * 8) * 0.8)}</p>
                        </div>
                      </div>

                      <button
                        onClick={handleStartBookingProcess}
                        className="w-full bg-[#001F3F] hover:bg-slate-900 text-teal-400 font-extrabold text-xs py-3 rounded-xl transition duration-300 flex items-center justify-center gap-1.5 uppercase cursor-pointer"
                      >
                        <span>Select Date & Time</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-4">
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Quick Actions</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button 
                          onClick={() => {
                            // Automatically open floating chat block
                            const btn = document.getElementById('floating-chat-toggle');
                            if (btn) btn.click();
                          }}
                          className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-250 hover:bg-slate-200 border border-slate-250 p-2.5 rounded-xl font-bold text-slate-755"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </button>
                        <button 
                          onClick={() => alert(`Trainer details of ${activeDetailsTrainer.name} copied to clipboard!`)}
                          className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-250 hover:bg-slate-200 border border-slate-250 p-2.5 rounded-xl font-bold text-slate-755"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share Profile
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => alert('Profile and credentials flag reported to CoachTrack Trust & Security team.')}
                        className="w-full text-center text-[10px] font-bold text-rose-500 hover:underline flex items-center justify-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Report suspicious credentials
                      </button>
                    </div>
                  </div>
                )}

                {bookingStep === 'booking' && (
                  <div className="border-2 border-slate-900 rounded-3xl p-5 bg-white shadow-md space-y-5">
                    <span className="text-[10px] uppercase font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded inline-block tracking-wider">
                      Step 2: Dates & Booking
                    </span>
                    <h4 className="font-display font-black text-[#001F3F] text-lg leading-tight">
                      Pick Your Live Spot Target
                    </h4>

                    {/* Weekly calendar selector line */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose Session Date</span>
                      
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 snap-x">
                        {next7Days.map((day) => {
                          const isPicked = selectedDate === day.isoString;
                          return (
                            <button
                              key={day.isoString}
                              type="button"
                              onClick={() => setSelectedDate(day.isoString)}
                              className={`flex-1 min-w-[55px] snap-center text-center p-2 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                                isPicked 
                                  ? 'bg-[#001F3F] border-[#001F3F] text-white' 
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="text-[9px] uppercase font-bold opacity-75">{day.dayName}</span>
                              <span className="text-sm font-black mt-0.5">{day.dateNum}</span>
                              <span className="text-[8px] opacity-75">{day.monthShort}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time slot pills */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Available Time Slots</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((slot) => {
                          const isSlotPicked = selectedTimeSlot === slot;
                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`p-2.5 text-xs text-center font-bold rounded-xl border transition cursor-pointer ${
                                isSlotPicked 
                                  ? 'bg-[#001F3F] border-[#001F3F] text-white' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Booking text limit notes */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                        Session Objectives / Health Focus
                      </label>
                      <textarea
                        value={bookingRefNotes}
                        onChange={(e) => setBookingRefNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs h-16 text-slate-800 focus:outline-[#001F3F]"
                        placeholder="Specify if rehab, cardio focus, fat assessment expectations, etc."
                      />
                    </div>

                    {/* Summary row */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="flex justify-between">
                        <span>Selected Bundle:</span>
                        <strong className="text-slate-900 uppercase font-bold">{selectedPackage === 'single' ? 'Single Session' : selectedPackage === 'bundle4' ? '4-Class Package' : 'Monthly continuous'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Booking Date:</span>
                        <strong className="text-slate-900 font-bold">{selectedDate}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Selected Time:</span>
                        <strong className="text-[#001F3F] font-bold">{selectedTimeSlot}</strong>
                      </div>
                    </div>

                    {/* CTA row split */}
                    <div className="flex gap-2 text-xs pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setBookingStep('details')}
                        className="flex-1 py-3 border border-slate-350 bg-white hover:bg-slate-50 font-bold text-slate-750 text-center rounded-xl cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleGoToPayment}
                        className="flex-1 py-1.5 bg-[#001F3F] hover:bg-slate-900 text-teal-400 font-black text-center rounded-xl cursor-pointer uppercase tracking-wider"
                      >
                        Confirm Slot
                      </button>
                    </div>

                  </div>
                )}

                {bookingStep === 'payment' && (
                  <div className="border-2 border-slate-900 rounded-3xl p-5 bg-white shadow-md space-y-4">
                    <span className="text-[10px] uppercase font-black text-teal-600 bg-teal-50 px-2.5 py-1 rounded inline-block tracking-wider">
                      Step 3: Secure Checkout
                    </span>
                    <h4 className="font-display font-black text-[#001F3F] text-base leading-tight">
                      Malaysian FPX Bank Transfer & Sandbox Payment
                    </h4>
                    <p className="text-xs text-slate-500 leading-normal">
                      We secure all trainer commitments via instant escrow deposits. An official printable PDF receipt and SST Exempt custom tax invoice will be cleared.
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2.5">
                      <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                        <span className="font-medium text-slate-500">Payable Package:</span>
                        <span className="font-bold text-slate-900">{selectedPackage === 'single' ? '1x Trainer Session' : selectedPackage === 'bundle4' ? '4x Sessions Bundle' : 'Monthly Unlimited'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-500">Target Coach:</span>
                        <span className="font-bold text-[#001F3F]">{activeDetailsTrainer.name}</span>
                      </div>

                      {/* Explicit 5% Commission Breakdown */}
                      {(() => {
                        const computedTotal = selectedPackage === 'single' 
                          ? activeDetailsTrainer.pricePerHour 
                          : selectedPackage === 'bundle4' 
                            ? Math.round((activeDetailsTrainer.pricePerHour * 4) * 0.9) 
                            : Math.round((activeDetailsTrainer.pricePerHour * 8) * 0.8);
                        const commissionFee = Number((computedTotal * 0.05).toFixed(2));
                        const tPayout = Number((computedTotal - commissionFee).toFixed(2));
                        
                        return (
                          <>
                            <div className="flex justify-between text-slate-600 font-medium">
                              <span>Trainer Package Price:</span>
                              <span>RM {computedTotal}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 font-medium">
                              <span>CoachTrack MY 5% Service Fee / Commission:</span>
                              <span>RM {commissionFee}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 font-medium pb-1.5 border-b border-slate-200">
                              <span>Trainer Payout:</span>
                              <span className="text-emerald-700 font-bold">RM {tPayout}</span>
                            </div>
                            <div className="flex justify-between text-[#001F3F] font-black text-sm pt-0.5">
                              <span>Total Payment:</span>
                              <span>RM {computedTotal}</span>
                            </div>
                            <p className="text-[10px] text-teal-600 font-bold bg-teal-50 rounded px-2 py-1 text-center mt-2 border border-teal-100/50">
                              💡 Platform commission is included in this payment.
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose payment gateway</span>
                      
                      <div className="space-y-1.5">
                        <label className={`border rounded-xl p-2.5 flex items-center gap-3 cursor-pointer transition ${paymentOption === 'fpx_maybank' ? 'border-[#001F3F] bg-[#001F3F]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <input 
                            type="radio" 
                            name="fpx" 
                            checked={paymentOption === 'fpx_maybank'} 
                            onChange={() => setPaymentOption('fpx_maybank')} 
                            className="accent-[#001F3F]"
                          />
                          <div className="text-left font-semibold">
                            <p className="text-slate-800 leading-none">Maybank2u FPX Transfer</p>
                            <span className="text-[8px] text-slate-400 uppercase font-bold text-teal-600 block mt-0.5">Clears instantly</span>
                          </div>
                        </label>

                        <label className={`border rounded-xl p-2.5 flex items-center gap-3 cursor-pointer transition ${paymentOption === 'fpx_cimb' ? 'border-[#001F3F] bg-[#001F3F]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <input 
                            type="radio" 
                            name="fpx" 
                            checked={paymentOption === 'fpx_cimb'} 
                            onChange={() => setPaymentOption('fpx_cimb')} 
                            className="accent-[#001F3F]"
                          />
                          <div className="text-left font-semibold">
                            <p className="text-slate-800 leading-none">CIMB Clicks FPX Bank</p>
                            <span className="text-[8px] text-slate-400 block mt-0.5">SST Exempt Gateway</span>
                          </div>
                        </label>

                        <label className={`border rounded-xl p-2.5 flex items-center gap-3 cursor-pointer transition ${paymentOption === 'visa' ? 'border-[#001F3F] bg-[#001F3F]/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <input 
                            type="radio" 
                            name="fpx" 
                            checked={paymentOption === 'visa'} 
                            onChange={() => setPaymentOption('visa')} 
                            className="accent-[#001F3F]"
                          />
                          <div className="text-left font-semibold">
                            <p className="text-slate-800 leading-none">Visa / Mastercard Credit Card</p>
                            <span className="text-[8px] text-slate-400 block mt-0.5">Encrypted transaction</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Secure action validation buttons */}
                    <div className="flex gap-2 text-xs pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setBookingStep('booking')}
                        className="flex-1 py-3 border border-slate-350 bg-white hover:bg-slate-50 font-bold text-slate-750 rounded-xl text-center cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmSecureBooking}
                        disabled={isProcessingPayment}
                        className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl text-center flex items-center justify-center gap-1 cursor-pointer uppercase tracking-wider"
                      >
                        {isProcessingPayment ? (
                          <span className="w-4.5 h-4.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        ) : (
                          <span>Dispatch payment</span>
                        )}
                      </button>
                    </div>

                  </div>
                )}

                {bookingStep === 'completed' && (
                  <div className="border-2 border-emerald-500 rounded-3xl p-6 bg-emerald-50/20 text-center space-y-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <h4 className="font-display font-black text-emerald-900 text-lg leading-tight">
                      Booking Confirmed!
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your booking has been finalized with <strong className="text-indigo-950">{activeDetailsTrainer.name}</strong>. Both you and the coach received structural receipt confirmations internally.
                    </p>

                    <div className="bg-white rounded-2xl p-4 text-xs border border-emerald-100 space-y-2 text-left">
                      <p className="font-bold border-b pb-1 mb-1 border-slate-100 uppercase text-[9px] text-[#001F3F]">Booking Details</p>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Receipt Invoice:</span>
                        <span className="font-bold font-mono text-slate-800">{bookingSuccessInvoice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Booking code:</span>
                        <span className="font-bold font-mono text-slate-800 uppercase">{bookingSuccessId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reserved Slot:</span>
                        <span className="font-bold text-slate-800">{selectedDate} ({selectedTimeSlot})</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDetailsTrainer(null);
                          onNavigateToTab('trainee-dashboard');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
                      >
                        Return to Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDetailsTrainer(null);
                        }}
                        className="text-teal-700 font-bold text-xs hover:underline"
                      >
                        Browse Other Trainers
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* Success Modal Popup Notification with redirection */}
        <AnimatePresence>
          {showSuccessRegisteredModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl border border-emerald-100 shadow-2xl p-6 max-w-sm w-full text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-display font-black text-slate-900 text-lg">
                    Congratulations!
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    You have successfully registered <strong className="text-teal-700 font-bold">Coach {activeDetailsTrainer?.name}</strong> slots.
                  </p>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-[11px] text-slate-500 flex flex-col gap-1 text-left">
                  <div className="flex justify-between">
                    <span>Reserved Session:</span>
                    <strong className="text-slate-700">{selectedDate} at {selectedTimeSlot}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Selected Package:</span>
                    <strong className="text-slate-700">{selectedPackage === 'single' ? 'Single Slot' : selectedPackage === 'bundle4' ? '4-Class Bundle' : 'Monthly Unlimited'}</strong>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setShowSuccessRegisteredModal(false);
                      setActiveDetailsTrainer(null);
                      setBookingStep('details');
                      onNavigateToTab('find-trainer');
                    }}
                    className="w-full bg-[#001F3F] text-teal-400 hover:bg-slate-900 font-extrabold py-3 rounded-xl text-xs transition duration-150 uppercase tracking-widest cursor-pointer"
                  >
                    View Coaches Near Me Now
                  </button>
                  <p className="text-[10px] text-slate-400 animate-pulse">
                    Or wait, automatically redirecting in a few seconds...
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
