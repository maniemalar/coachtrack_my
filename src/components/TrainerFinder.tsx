import React, { useState, useEffect } from 'react';
import { MapPin, Search, Compass, ShieldCheck, Star, Calendar, MessageSquare, ArrowRight } from 'lucide-react';
import { TrainerProfile, TraineeProfile } from '../types';

interface TrainerFinderProps {
  traineeId: string;
  onNavigateToTab: (tab: string) => void;
}

// Preset Malaysian Hub locations to calculate accurate distance relative to Ahmad
const MALAYSIAN_HUBS = [
  { name: 'Mid Valley Megamall, KL', lat: 3.1186, lng: 101.6775 },
  { name: 'Bangsar, KL center', lat: 3.1258, lng: 101.6715 },
  { name: 'SS15, Subang Jaya', lat: 3.0789, lng: 101.5944 },
  { name: 'KLCC Tower area', lat: 3.1578, lng: 101.7118 },
  { name: 'Damansara Uptown, PJ', lat: 3.1365, lng: 101.6215 }
];

export default function TrainerFinder({ traineeId, onNavigateToTab }: TrainerFinderProps) {
  const [trainers, setTrainers] = useState<(TrainerProfile & { distance: number })[]>([]);
  const [selectedHub, setSelectedHub] = useState(0); // Default Mid Valley
  const [radiusKm, setRadiusKm] = useState(10); // Standard 10km search constraint
  const [searchDiscipline, setSearchDiscipline] = useState('');
  const [loading, setLoading] = useState(false);

  // Booking modal states
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-06-12');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [bookingNotes, setBookingNotes] = useState('First fitness goals setup session.');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [packageType, setPackageType] = useState<'Single' | 'Monthly'>('Single');

  useEffect(() => {
    fetchNearbyTrainers();
  }, [selectedHub, radiusKm, searchDiscipline]);

  const fetchNearbyTrainers = async () => {
    setLoading(true);
    try {
      const hub = MALAYSIAN_HUBS[selectedHub];
      const url = `/api/trainers/search?lat=${hub.lat}&lng=${hub.lng}&radius=${radiusKm}&discipline=${searchDiscipline}`;
      const res = await fetch(url);
      const data = await res.json();
      setTrainers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainer) return;

    try {
      const finalAmount = packageType === 'Single' 
        ? selectedTrainer.pricePerHour 
        : Math.round((selectedTrainer.pricePerHour * 8) * 0.9);

      const payload = {
        trainerId: selectedTrainer.id,
        traineeId: traineeId || 'te_ahmad', // Dynamic demo trainee check
        traineeName: 'Ahmad Ibrahim',
        date: bookingDate,
        timeSlot: bookingTime,
        location: selectedTrainer.location,
        notes: bookingNotes,
        packageType: packageType,
        amountPaid: finalAmount
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedTrainer(null);
          onNavigateToTab('trainee-dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16 pt-6 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Search header context */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Compass className="w-6 h-6 text-teal-600 animate-spin-slow" />
            <span>Discover Local Certified Coaches</span>
          </h2>
          <p className="text-slate-500 text-sm">
            Find certified fitness trainers, yoga specialists, and boutique gym operator guides located under our maximum 10km geo-fence radius.
          </p>
        </div>

        {/* Search & Filters block */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            
            {/* Hub Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Search Location Hub</span>
              </label>
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-teal-500"
              >
                {MALAYSIAN_HUBS.map((hub, i) => (
                  <option key={i} value={i}>{hub.name}</option>
                ))}
              </select>
            </div>

            {/* Radius Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Maximum Radius Distance
                </label>
                <span className="text-teal-600 font-bold text-xs">{radiusKm} KM</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="25" 
                value={radiusKm} 
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>2 km</span>
                <span className="font-bold text-teal-600">Standard: 10 km limit</span>
                <span>25 km</span>
              </div>
            </div>

            {/* Discipline Keyword filter */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Filter Discipline</span>
              </label>
              <input 
                type="text"
                placeholder="Yoga, Coach, Strength, Zumba..."
                value={searchDiscipline}
                onChange={(e) => setSearchDiscipline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
              />
            </div>

          </div>
        </div>

        {/* Results grid container */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 text-sm">Searching nearby trainers...</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <span className="text-3xl block mb-2">📍</span>
            <h4 className="font-bold text-slate-800 text-sm">No Trainers within range!</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto">
              No results match your criteria under <strong className="text-indigo-900">{radiusKm} km</strong> from our selected hub. Try sliding the radius range wider!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trainers.map((t) => (
              <div 
                key={t.id} 
                className="bg-white border border-slate-105 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition duration-250 flex flex-col justify-between"
              >
                {/* Trainer Card Top banner */}
                <div className="relative">
                  <div className="bg-slate-900 h-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-indigo-500/10"></div>
                  </div>
                  <img 
                    referrerPolicy="no-referrer"
                    src={t.avatarUrl} 
                    alt={t.name}
                    className="w-16 h-16 rounded-full border-4 border-white object-cover absolute -bottom-8 left-4 shadow-sm"
                  />
                  {t.verified && (
                    <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  )}
                </div>

                {/* Trainer Description Body */}
                <div className="p-4 pt-10 text-left flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-medium text-slate-900 text-lg leading-snug">
                      {t.name}
                    </h4>
                    <p className="text-xs text-teal-600 font-bold mb-1.5">{t.discipline}</p>
                    
                    <div className="flex items-center gap-1 mb-3 text-xs">
                      <span className="text-slate-500 font-medium">{t.location}</span>
                      <span className="text-slate-300">•</span>
                      <strong className="text-teal-700 font-black">{t.distance} km away</strong>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {t.bio}
                    </p>
                  </div>

                  {/* Certified Pills list */}
                  <div className="mb-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Accreditation</span>
                    <div className="flex flex-wrap gap-1">
                      {t.certificates.slice(0, 1).map((c, i) => (
                        <span key={i} className="text-[9px] font-bold bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-600 truncate max-w-full block">
                          {c}
                        </span>
                      ))}
                      {t.certificates.length > 1 && (
                        <span className="text-[9px] font-semibold bg-indigo-50 text-indigo-700 rounded px-1.5 py-0.5">
                          +{t.certificates.length - 1} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Stats / Book call */}
                  <div className="border-t border-slate-50 pt-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Pricing</span>
                      <span className="font-black text-slate-900">RM {t.pricePerHour} <span className="text-[10px] text-slate-400 font-normal">/hr</span></span>
                    </div>

                    <button
                      onClick={() => setSelectedTrainer(t)}
                      className="bg-indigo-950 hover:bg-slate-900 text-teal-400 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
                    >
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

        {/* Booking Dialog Modal */}
        {selectedTrainer && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-left">
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2.5">
                Send Training Booking Request
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Schedule a session with <strong className="text-indigo-950">{selectedTrainer.name}</strong>. The trainer will receive a notification in their dashboard to approve or decline.
              </p>

              {bookingSuccess ? (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-4 text-center my-6">
                  <span className="text-xl inline-block mb-1">🎉</span>
                  <p className="font-bold">Request Sent Successfully!</p>
                  <p className="text-xs">Awaiting coach response.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Select Gym Date
                      </label>
                      <input 
                        type="date" 
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Time Slot
                      </label>
                      <select
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-teal-500"
                      >
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="12:00 PM">12:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                        <option value="06:00 PM">06:00 PM</option>
                      </select>
                    </div>
                  </div>

                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Session Goal / Notes for Instructor
                    </label>
                    <textarea
                      value={bookingNotes}
                      onChange={(e) => setBookingNotes(e.target.value)}
                      placeholder="Specify focus (posture alignment, weight lifting advice)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs h-20 focus:ring-teal-500 text-slate-800"
                    />
                  </div>

                  {/* Select Package Choice */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Choose Booking Pack Type
                    </label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <label className={`border rounded-xl p-3 flex flex-col cursor-pointer transition text-left ${packageType === 'Single' ? 'border-teal-600 bg-teal-50/45 text-slate-900 ring-1 ring-teal-600/30' : 'border-slate-200 hover:bg-slate-50 text-slate-650'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs">Single Slot</span>
                          <input 
                            type="radio" 
                            name="package" 
                            checked={packageType === 'Single'} 
                            onChange={() => setPackageType('Single')} 
                            className="text-teal-600 accent-teal-600 focus:ring-teal-550"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mb-1.5 font-medium">1x Individual Session</span>
                        <span className="font-black text-sm text-slate-800">RM {selectedTrainer.pricePerHour}</span>
                      </label>

                      <label className={`border rounded-xl p-3 flex flex-col cursor-pointer transition text-left ${packageType === 'Monthly' ? 'border-teal-600 bg-teal-50/45 text-slate-900 ring-1 ring-teal-600/30' : 'border-slate-200 hover:bg-slate-50 text-slate-650'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs">Monthly Pack</span>
                          <input 
                            type="radio" 
                            name="package" 
                            checked={packageType === 'Monthly'} 
                            onChange={() => setPackageType('Monthly')} 
                            className="text-teal-600 accent-teal-600 focus:ring-teal-550"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mb-1.5 font-medium">8x Slots (10% Off!)</span>
                        <span className="font-black text-sm text-slate-800">RM {((selectedTrainer.pricePerHour * 8) * 0.9).toFixed(0)}</span>
                      </label>
                    </div>
                  </div>

                  {/* Simulated Malaysian Payment Checkout Gateway */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 mb-4 text-left border border-slate-950 relative overflow-hidden">
                    <span className="absolute right-0 top-0 text-3xl translate-x-1 -translate-y-1 opacity-20 pointer-events-none">💳</span>
                    <p className="text-[9px] uppercase font-bold tracking-wider text-teal-400">Secure Checkout Gate (Demo Sandbox)</p>
                    <p className="text-xs text-white/95 mt-1 font-medium">You pay <strong className="text-teal-400">RM {packageType === 'Single' ? selectedTrainer.pricePerHour : ((selectedTrainer.pricePerHour * 8) * 0.9).toFixed(0)}</strong> instantly via FPX Online Banking Bank Transfer or Credit Card.</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <select className="bg-white/10 text-white border border-white/15 rounded px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-teal-400">
                        <option value="fpx_maybank" className="text-slate-900">Maybank2u FPX</option>
                        <option value="fpx_cimb" className="text-slate-900">CIMB Clicks FPX</option>
                        <option value="fpx_rhb" className="text-slate-900">RHB Now FPX</option>
                        <option value="visa" className="text-slate-900">Visa / Mastercard</option>
                        <option value="tng" className="text-slate-900">Touch 'n Go eWallet</option>
                      </select>
                      <input 
                        type="password" 
                        placeholder="PIN Code / Secure Auth" 
                        value="••••••"
                        disabled
                        className="bg-white/10 text-white/50 border border-white/15 rounded px-2 py-1 text-[10px] text-center"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedTrainer(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-650 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Confirm Booking & Pay RM {packageType === 'Single' ? selectedTrainer.pricePerHour : ((selectedTrainer.pricePerHour * 8) * 0.9).toFixed(0)}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
