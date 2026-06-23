import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Sliders, Search, ShieldCheck, CalendarCheck, 
  CreditCard, Sparkles, Filter, Check, Award, ArrowRight
} from 'lucide-react';
import { TrainerProfile } from '../types';
import { dbService } from '../lib/dbService';

// Import modular redesigned components
import MarketplaceHero from './MarketplaceHero';
import TrainerWideCard from './TrainerWideCard';
import BookingFlowOverlay from './BookingFlowOverlay';

interface TrainerFinderProps {
  traineeId: string;
  onNavigateToTab: (tab: string) => void;
}

const MALAYSIAN_HUBS = [
  { name: 'Mid Valley Megamall, KL center', lat: 3.1186, lng: 101.6775 },
  { name: 'Bangsar, KL center', lat: 3.1258, lng: 101.6715 },
  { name: 'SS15, Subang Jaya', lat: 3.0789, lng: 101.5944 },
  { name: 'KLCC Tower area', lat: 3.1578, lng: 101.7118 },
  { name: 'Damansara Uptown, PJ', lat: 3.1365, lng: 101.6215 }
];

const QUICK_SPECIALTIES = [
  { label: 'All', value: '', icon: '🌐' },
  { label: 'Yoga & Pilates', value: 'Yoga & Pilates', icon: '🧘‍♀️' },
  { label: 'Strength & Conditioning', value: 'Strength & Conditioning', icon: '🏋️‍♂️' },
  { label: 'HIIT & Fat Loss', value: 'HIIT & Fat Loss Specialist', icon: '⚡' }
];

export default function TrainerFinder({ traineeId, onNavigateToTab }: TrainerFinderProps) {
  const [trainers, setTrainers] = useState<(TrainerProfile & { distance: number })[]>([]);
  const [selectedHub, setSelectedHub] = useState(0); 
  const [radiusKm, setRadiusKm] = useState(10); // USER_REQUEST Default 10km radius
  const [searchDiscipline, setSearchDiscipline] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [traineeName, setTraineeName] = useState('Ahmad');

  useEffect(() => {
    if (traineeId) {
      dbService.getTraineeProfile(traineeId).then(profile => {
        if (profile) {
          const firstName = profile.name.split(' ')[0];
          setTraineeName(firstName);
        }
      });
    }
  }, [traineeId]);
  
  // Floating detail view toggle
  const [activeDetailsTrainer, setActiveDetailsTrainer] = useState<TrainerProfile | null>(null);
  const [initialBookingState, setInitialBookingState] = useState<'details' | 'booking'>('details');
  const [savedFavorites, setSavedFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchInvitations();
  }, [traineeId]);

  useEffect(() => {
    fetchNearbyTrainers();
  }, [selectedHub, radiusKm, searchDiscipline]);

  const fetchInvitations = async () => {
    try {
      const data = await dbService.getInvitations({ traineeId });
      setInvitations(data.filter(inv => inv.status === 'Pending'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptInvitation = async (invId: string) => {
    try {
      await dbService.respondToInvitation(invId, 'Accepted');
      // Dispatch automated welcome message on chat
      await dbService.createChatMessage({
        senderId: traineeId || 'te_ahmad',
        receiverId: 'u_sarah', // Coach Sarah Tan user ID is u_sarah
        message: `Terima kasih Coach Sarah Tan! I have accepted your package invitation of private scheduled sessions of Yoga & Pilates.`
      });
      fetchInvitations();
      alert("Coaching package invitation accepted! Custom dispatch receipt created.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeclineInvitation = async (invId: string) => {
    try {
      await dbService.respondToInvitation(invId, 'Declined');
      fetchInvitations();
    } catch (e) {
      console.error(e);
    }
  };

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

  // Smart local filters based on discipline bios
  const matchesSpecialization = (t: TrainerProfile, spec: string) => {
    if (!spec) return true;
    const search = spec.toLowerCase();
    
    if (search.includes('yoga') || search.includes('pilates')) {
      return t.discipline.toLowerCase().includes('yoga') || t.discipline.toLowerCase().includes('pilates');
    }
    if (search.includes('strength')) {
      return t.discipline.toLowerCase().includes('strength') || t.discipline.toLowerCase().includes('conditioning');
    }
    if (search.includes('hiit') || search.includes('cardio') || search.includes('fat')) {
      return t.discipline.toLowerCase().includes('hiit') || t.discipline.toLowerCase().includes('fat loss') || t.bio.toLowerCase().includes('fat');
    }
    if (search.includes('weight') || search.includes('loss')) {
      return t.discipline.toLowerCase().includes('weight') || t.discipline.toLowerCase().includes('loss') || t.bio.toLowerCase().includes('weight loss');
    }
    if (search.includes('rehab') || search.includes('rehabilitation') || search.includes('mobility')) {
      return t.discipline.toLowerCase().includes('rehab') || t.bio.toLowerCase().includes('rehab') || t.certificates.some(c => c.toLowerCase().includes('rehab'));
    }
    return t.discipline.toLowerCase().includes(search) || t.bio.toLowerCase().includes(search);
  };

  // Filter and sort wide cards. USER_REQUEST: Sarah Tan should appear first
  const processedTrainers = trainers
    .filter(t => matchesSpecialization(t, searchDiscipline))
    .filter(t => {
      if (!nameSearch) return true;
      return t.name.toLowerCase().includes(nameSearch.toLowerCase());
    })
    .sort((a, b) => {
      if (a.id === 'tr_sarah') return -1;
      if (b.id === 'tr_sarah') return 1;
      return b.rating - a.rating;
    });

  const handleOpenTrainerProfile = (t: TrainerProfile) => {
    setInitialBookingState('details');
    setActiveDetailsTrainer(t);
  };

  const handleOpenTrainerBooking = (t: TrainerProfile) => {
    setInitialBookingState('booking');
    setActiveDetailsTrainer(t);
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-24 pt-6 text-left relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <AnimatePresence mode="wait">
          {!activeDetailsTrainer ? (
            <motion.div
              key="marketplace-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Premium Top Hero component */}
              <MarketplaceHero />

              {/* COOPERATIVE PENDING PROPOSALS FROM COACHES */}
              {invitations.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border border-dashed border-emerald-500/30 rounded-3xl p-5 mb-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-emerald-500 text-white rounded-2xl">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-[#001F3F] text-sm tracking-wide uppercase">
                        Active Client Invitation Offer
                      </h3>
                      <p className="text-2xs text-slate-500 font-medium font-mono">
                        Direct custom proposal waiting for your verification.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md transition">
                        <div>
                          <span className="text-[8px] uppercase font-black text-teal-600 tracking-widest font-mono">
                            Premium Plan Proposal
                          </span>
                          <h4 className="text-base font-black text-[#001F3F] leading-tight font-display mt-0.5">
                            {inv.packageName}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            From: <strong className="text-slate-700 font-bold">{inv.trainerName || 'Coach Sarah Tan'}</strong>
                          </p>
                          <div className="text-2xs font-extrabold text-[#18D4C5] bg-teal-50 border border-teal-100/50 rounded-lg px-2 py-1 inline-block mt-2 font-mono">
                            💎 {inv.sessions} Private Classes Scheduled
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-50 pt-3 flex-wrap gap-2">
                          <span className="text-base font-black text-slate-900 font-display">
                            RM {inv.price}
                          </span>
                          
                          <div className="flex gap-1.5 text-2xs">
                            <button
                              onClick={() => handleDeclineInvitation(inv.id)}
                              className="bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleAcceptInvitation(inv.id)}
                              className="bg-[#001F3F] hover:bg-slate-900 text-[#18D4C5] font-black px-4 py-1.5 rounded-xl cursor-pointer shadow-sm"
                            >
                              Accept custom
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEARCH CARD INPUT DECK */}
              <div className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 my-0 py-0 bg-gradient-to-r from-teal-500 via-[#18D4C5] to-[#001F3F]" />
                
                <div className="grid md:grid-cols-3 gap-5">
                  {/* Location Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Location</span>
                    </label>
                    <select
                      value={selectedHub}
                      onChange={(e) => setSelectedHub(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-[#001F3F] focus:ring-1 focus:ring-[#001F3F]/30"
                    >
                      {MALAYSIAN_HUBS.map((hub, i) => (
                        <option key={i} value={i}>{hub.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Range Slider default 10km - min: 2km, max: 25km */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 font-sans">
                        <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Search Radius</span>
                      </label>
                      <span className="text-indigo-600 font-bold text-xs font-sans">{radiusKm} KM</span>
                    </div>
                    <input 
                      type="range" 
                      min="2" 
                      max="25" 
                      value={radiusKm} 
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-[#001F3F] mt-2"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1 font-sans">
                      <span>2 km</span>
                      <span>10 km (Default)</span>
                      <span>25 km</span>
                    </div>
                  </div>

                  {/* Keyword search coach name */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1 font-sans">
                      <Search className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Search Coach</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="Search coach name..."
                      value={nameSearch}
                      onChange={(e) => setNameSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 focus:outline-[#001F3F] focus:ring-1 focus:ring-[#001F3F]/30 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* SPECIALIZATION QUICK SELECT chips */}
              <div className="space-y-2.5 text-left">
                <h3 className="text-sm font-bold text-slate-700 font-sans tracking-tight">
                  Browse by Category
                </h3>
                
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {QUICK_SPECIALTIES.map((chip, idx) => {
                    const isActive = searchDiscipline === chip.value;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSearchDiscipline(chip.value)}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full border transition-all duration-150 cursor-pointer ${
                          isActive 
                            ? 'bg-[#001F3F] border-[#001F3F] text-[#18D4C5] shadow-sm font-sans' 
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300 font-sans'
                        }`}
                      >
                        <span className="text-sm">{chip.icon}</span>
                        <span>{chip.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>



              {/* LIST READOUT */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-slate-400 text-xs border-b pb-2">
                  <span className="font-extrabold uppercase tracking-widest text-[10px] text-slate-500">
                    Coaches List ({processedTrainers.length} results)
                  </span>
                  <span className="text-[10px] font-medium font-mono">Sorted: Featured First</span>
                </div>

                {loading ? (
                  <div className="text-center py-20 bg-white border rounded-3xl">
                    <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 text-xs uppercase font-extrabold tracking-widest font-mono text-center">
                      Locating nearest coaches...
                    </p>
                  </div>
                ) : processedTrainers.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-slate-150 rounded-3xl shadow-sm">
                    <span className="text-4xl block mb-2">📍</span>
                    <h4 className="font-display font-black text-slate-800 text-lg">
                      No trainers matched in search geofence
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                      Try sliding the geofence widget wider or modifying name keyword descriptors to explore other accredited personal trainers.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {processedTrainers.map((t) => (
                      <TrainerWideCard
                        key={t.id}
                        trainer={t}
                        isFavorite={savedFavorites.includes(t.id)}
                        onToggleFavorite={toggleFavorite}
                        onOpenProfile={handleOpenTrainerProfile}
                        onOpenBooking={handleOpenTrainerBooking}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* DEDICATED FULL SCREEN OVERLAY STEP BOOOKING SYSTEM */
            <motion.div
              key="booking-system"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="pt-2"
            >
              <BookingFlowOverlay
                trainer={activeDetailsTrainer}
                traineeId={traineeId || 'te_ahmad'}
                initialStep={initialBookingState}
                onClose={() => setActiveDetailsTrainer(null)}
                onNavigateToTab={onNavigateToTab}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
