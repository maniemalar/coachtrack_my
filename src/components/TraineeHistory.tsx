import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Dumbbell, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  FileVideo, 
  MessageSquare, 
  AlertTriangle, 
  Activity, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Search, 
  Sparkles, 
  RefreshCw,
  QrCode,
  ScanLine,
  User,
  Heart
} from 'lucide-react';
import { dbService } from '../lib/dbService';
import { BookingSession, WorkoutLog, TraineeProfile } from '../types';

interface TraineeHistoryProps {
  traineeUserId: string;
  onNavigateToTab: (tab: string) => void;
}

export default function TraineeHistory({ traineeUserId, onNavigateToTab }: TraineeHistoryProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'workouts'>('sessions');
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [traineeMeta, setTraineeMeta] = useState<TraineeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // QR simulation states
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [selectedSessionToScan, setSelectedSessionToScan] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Loaded demo workouts for fallbacks or references
  useEffect(() => {
    fetchHistoryData();
  }, [traineeUserId]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const profile = await dbService.getTraineeProfile(traineeUserId);
      if (profile) {
        setTraineeMeta(profile);
        
        // Fetch bookings & workouts for this trainee
        const [allBookings, allWorkouts] = await Promise.all([
          dbService.getBookings({ traineeId: profile.id }),
          dbService.getWorkouts({ traineeId: profile.id })
        ]);
        
        setBookings(allBookings);
        setWorkoutLogs(allWorkouts);
      }
    } catch (err) {
      console.error("Error loading history data: ", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerLocalNotification = (msg: string) => {
    setToastMessage(msg);
    setIsToastVisible(true);
    setTimeout(() => setIsToastVisible(false), 4000);
  };

  const handleSimulateQRScan = async () => {
    if (!selectedSessionToScan) {
      triggerLocalNotification("Please select a physical session from the checklist below to check-in for.");
      return;
    }
    
    setScanStatus('scanning');
    
    // Simulate camera delay
    setTimeout(async () => {
      try {
        const session = bookings.find(b => b.id === selectedSessionToScan);
        if (session) {
          // Update local status of booking & also mark qrChecked as true dynamically
          await dbService.updateBookingStatus(selectedSessionToScan, 'Approved');
          
          // Inject custom attribute on the object
          session.status = 'Approved';
          (session as any).qrChecked = true;
          (session as any).attendanceStatus = 'Present';
          
          // Keep persistent local edits in localStorage as a backup
          const cachedSessionKey = `qr_checked_session_${selectedSessionToScan}`;
          localStorage.setItem(cachedSessionKey, JSON.stringify({ qrChecked: true, attendanceStatus: 'Present' }));
          
          setScanStatus('success');
          triggerLocalNotification("QR Attendance Check-In verified successfully! Status marked as Present.");
          setTimeout(() => {
            setShowQRScanner(false);
            setScanStatus('idle');
            fetchHistoryData();
          }, 2000);
        } else {
          setScanStatus('error');
        }
      } catch (err) {
        setScanStatus('error');
      }
    }, 2000);
  };

  // Check if session has cached QR check-ins
  const getAugmentedSession = (session: BookingSession) => {
    const cached = localStorage.getItem(`qr_checked_session_${session.id}`);
    if (cached) {
      const data = JSON.parse(cached);
      return {
        ...session,
        qrChecked: data.qrChecked,
        attendanceStatus: data.attendanceStatus || 'Present'
      };
    }
    return session;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Toast Alert Banner */}
      {isToastVisible && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white border border-slate-700 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle className="text-teal-400 w-5 h-5 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#001F3F] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden mb-8">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4">
          <QrCode className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 font-bold px-3 py-1 text-2xs uppercase tracking-wider rounded-full border border-teal-500/30">
              Personal Vault
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white mb-2">
            Your Session & Workout History
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Verify your physical physical studio attendances via custom QR checkpoints, and review all previous interactive prescribed home workout uploads below.
          </p>
        </div>
      </div>

      {/* Secondary Level Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-3 mb-6">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 font-semibold text-xs sm:text-sm transition-all focus:outline-none flex items-center gap-2 cursor-pointer ${
            activeTab === 'sessions' 
              ? 'text-teal-650 font-black border-b-2 border-teal-650 text-teal-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4 text-slate-400" />
          <span>Physical Studio Sessions</span>
        </button>
        <button
          onClick={() => setActiveTab('workouts')}
          className={`pb-3 font-semibold text-xs sm:text-sm transition-all focus:outline-none flex items-center gap-2 cursor-pointer ${
            activeTab === 'workouts' 
              ? 'text-teal-650 font-black border-b-2 border-teal-650 text-teal-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Dumbbell className="w-4 h-4 text-slate-400" />
          <span>Workout History logs</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-900 animate-spin" />
          <p className="text-xs text-slate-500 font-medium font-sans">Compiling historical index vault...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* TAB 1: STUDIO ATTENDANCE SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="space-y-8">
              {/* QR Scan Simulated Quick Card Banner */}
              <div className="bg-teal-50/50 border border-teal-200 rounded-3xl p-6 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-teal-700">
                    <QrCode className="w-5 h-5 text-teal-600" />
                    <span className="font-bold text-xs uppercase tracking-wider font-sans">Physical Check-In QR Station</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-800 font-display">Are you currently present physically inside a Studio session?</h3>
                  <p className="text-2xs sm:text-xs text-slate-500 max-w-xl">
                    Trainers display private attendance QRs inside SS15 SS2 or Cheras boutique locations. Scan the trainer's QR code to record dynamic attendance instantaneously!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowQRScanner(true);
                    if (bookings.length > 0) {
                      // Pre-fill with first booking
                      const available = bookings.filter(b => b.status === 'Approved' || b.status === 'Pending');
                      if (available.length > 0) {
                        setSelectedSessionToScan(available[0].id);
                      }
                    }
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition shrink-0 cursor-pointer"
                >
                  <ScanLine className="w-4 h-4 animate-pulse text-white" />
                  <span>Scan Studio QR Attendance</span>
                </button>
              </div>

              {/* QR Scanner Mockup Overlay Panel */}
              {showQRScanner && (
                <div className="bg-slate-900 text-white border border-slate-700 rounded-3xl p-6 relative overflow-hidden animate-fade-in space-y-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ScanLine className="w-4 h-4 text-teal-400 animate-pulse" />
                      <span className="text-xs font-bold text-slate-300 font-mono">LENS SCANNER ACTIVE</span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowQRScanner(false);
                        setScanStatus('idle');
                      }}
                      className="text-slate-400 hover:text-white font-bold text-2xs cursor-pointer bg-slate-800 px-3 py-1 rounded-lg"
                    >
                      Close Lens
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 items-center">
                    {/* Simulated Camera Viewfinder */}
                    <div className="aspect-video bg-neutral-950 rounded-2xl border-2 border-slate-700 relative overflow-hidden flex flex-col items-center justify-center">
                      {scanStatus === 'idle' && (
                        <div className="absolute inset-x-0 top-0 bottom-0 bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
                          <QrCode className="w-16 h-16 text-slate-650 text-slate-500 mb-2" />
                          <p className="text-2xs text-slate-400">Aim camera viewport cleanly at Trainer's QR poster card</p>
                        </div>
                      )}

                      {scanStatus === 'scanning' && (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-4">
                          <div className="w-16 h-16 border-2 border-teal-500 rounded-xl relative animate-pulse flex items-center justify-center">
                            <span className="absolute inset-x-2 h-0.5 bg-teal-400 top-1/2 animate-bounce"></span>
                            <QrCode className="w-8 h-8 text-teal-500" />
                          </div>
                          <p className="text-2xs text-teal-400 mt-4 animate-pulse font-mono tracking-widest">DECODING MATRIX CHECKPOINT...</p>
                        </div>
                      )}

                      {scanStatus === 'success' && (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-4">
                          <CheckCircle className="w-14 h-14 text-teal-400 mb-2 animate-bounce" />
                          <p className="text-xs font-bold text-teal-300 font-sans">ATTENDANCE LOGGED SUCCESS</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Present verified inside Subang Head Office SS15</p>
                        </div>
                      )}

                      {scanStatus === 'error' && (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-4">
                          <AlertTriangle className="w-14 h-14 text-rose-500 mb-2" />
                          <p className="text-xs font-bold text-rose-300 font-sans">SCAN INVALID OR TIMEOUT</p>
                          <button 
                            onClick={() => setScanStatus('idle')}
                            className="bg-slate-800 text-2xs hover:bg-slate-700 text-white rounded px-2.5 py-1 mt-2 font-sans"
                          >
                            Retry Camera Link
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Check-In Form Selection */}
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-2xs text-slate-400 uppercase tracking-wider font-extrabold block">Select Physical Class Session</label>
                        <select
                          value={selectedSessionToScan}
                          onChange={(e) => setSelectedSessionToScan(e.target.value)}
                          className="w-full bg-slate-800 text-slate-200 rounded-xl p-3 text-xs border border-slate-700 focus:outline-[#001F3F]"
                        >
                          <option value="">-- Choose session from checklist --</option>
                          {bookings.map((booking) => (
                            <option key={booking.id} value={booking.id}>
                              🗓 {booking.date} @ {booking.timeSlot} • ({booking.location || 'SS15 HQ Studio'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 text-2xs text-slate-350 space-y-1">
                        <p className="font-bold text-slate-200">🔍 Real-time Physical Session Gate Lock info</p>
                        <p>Allows automated confirmation by matching device location coordinates against physical trainer beacon. Non-revertible once certified.</p>
                      </div>

                      <button
                        onClick={handleSimulateQRScan}
                        disabled={scanStatus === 'scanning' || !selectedSessionToScan}
                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 text-slate-950 font-black text-xs py-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        ✅ Authorize Attendance Log
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Physical Booking and Studio Classes Directory */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-left shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-900" />
                    <h3 className="font-display font-medium text-slate-900 text-sm">
                      Your Physical Studio Attendances
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 text-2xs font-extrabold uppercase font-mono rounded-lg bg-[#001F3F]/5 text-[#001F3F] border border-indigo-900/10">
                    {bookings.length} Sessions Total
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-400">You have no booked physical class sessions recorded.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {bookings.map((session) => {
                      const finalSess = getAugmentedSession(session);
                      const isQR = finalSess.qrChecked || finalSess.status === 'Approved' || finalSess.status === 'Completed';
                      
                      return (
                        <div 
                          key={session.id} 
                          className="border border-slate-100 rounded-2xl p-4.5 bg-slate-50/70 hover:bg-white hover:shadow-xs transition duration-150 text-left space-y-3 relative"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold tracking-wider text-indigo-900 block font-sans">SS15 Coach Session Checklist</span>
                              <strong className="text-slate-800 text-sm block font-sans">{finalSess.date}</strong>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-2xs font-extrabold border ${
                              isQR
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                : 'bg-amber-50 text-amber-800 border-amber-100'
                            }`}>
                              {isQR ? '✓ Present' : '🗓 Scheduled'}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-2xs text-slate-600 font-sans font-medium">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{finalSess.timeSlot} (60 min private cycle)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{finalSess.location || 'Bangsar Gym HQ, SS15'}</span>
                            </div>
                          </div>

                          {/* QR checkin verification status */}
                          <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-3xs font-mono">
                            <span className="text-slate-400 uppercase font-sans font-semibold">Security QR Verification</span>
                            <div className="flex items-center gap-1.5 font-sans font-bold">
                              {isQR ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                                  <span className="text-emerald-700">QR Code Verified</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                  <span className="text-slate-500">Awaiting QR scan on-premise</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WORKOUT HISTORY LOGS */}
          {activeTab === 'workouts' && (
            <div className="space-y-6 text-left">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-left shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-indigo-900" />
                    <h3 className="font-display font-medium text-slate-900 text-sm">
                      Your Workout Logs History
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 text-2xs font-extrabold uppercase font-mono rounded-lg bg-[#001F3F]/5 text-[#001F3F]">
                    {workoutLogs.length} Checked In
                  </span>
                </div>

                {workoutLogs.length === 0 ? (
                  <div className="text-center py-16">
                    <Dumbbell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-400">You have zero logged workout logs.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {workoutLogs.map((log) => {
                      const stat = (log as any).status || (log.trainerFeedback ? 'Approved' : 'Pending Review');
                      return (
                        <div key={log.id} className="border border-slate-150/70 rounded-2xl p-5 bg-slate-50/50 text-xs text-slate-800 space-y-4">
                          
                          {/* Header Block */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200/70 pb-3">
                            <div className="space-y-0.5">
                              <span className="text-4xs uppercase font-extrabold tracking-wider text-slate-400 font-mono">Routine Complete Log Checklist</span>
                              <h4 className="text-base font-black text-slate-900 leading-tight font-display">{log.workoutType} Program</h4>
                              <p className="text-slate-400 text-3xs font-mono mt-0.5">Checked In Date: {log.date || '11 Jun 2026'}</p>
                            </div>
                            
                            {/* Validation Badge based on workout log review status */}
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 text-2xs uppercase tracking-wide font-black rounded-lg border ${
                                stat === 'Approved' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                  : stat === 'Revision Requested'
                                  ? 'bg-rose-50 text-rose-800 border-rose-100 animate-pulse'
                                  : 'bg-amber-50 text-amber-800 border-amber-100'
                              }`}>
                                {stat}
                              </span>
                            </div>
                          </div>

                          {/* Exercise breakdown checklist list */}
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block font-sans">Completed exercises set breakdown</span>
                            <div className="grid sm:grid-cols-3 gap-2">
                              {log.exercises?.map((ex, idx) => (
                                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 text-2xs text-slate-755 font-medium flex items-center justify-between">
                                  <span>🏃 {ex.name}</span>
                                  <strong className="text-slate-900">{ex.sets}x{ex.reps} {ex.weight > 0 ? `@${ex.weight}kg` : ''}</strong>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Direct Feedback & Comments provided */}
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* Trainee Submitted Information */}
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-150">
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Your Adherence Notes</span>
                              
                              {log.notes && (
                                <p className="text-2xs text-slate-600 leading-relaxed font-sans">
                                  <strong className="text-slate-800 font-bold block">Trainee Commentary:</strong> &ldquo;{log.notes}&rdquo;
                                </p>
                              )}

                              {/* Separate feedback fields */}
                              <div className="space-y-1 pt-1.5 border-t border-slate-100 max-w-full text-2xs leading-relaxed text-slate-500">
                                {(log as any).difficulties && (
                                  <p>⚠️ <strong className="text-slate-800">Difficulties:</strong> {(log as any).difficulties}</p>
                                )}
                                {(log as any).painLevel && (
                                  <p>❗️ <strong className="text-slate-800">Discomfort/Pain:</strong> {(log as any).painLevel}</p>
                                )}
                                {(log as any).generalComments && (
                                  <p>💭 <strong className="text-slate-800">Comments:</strong> {(log as any).generalComments}</p>
                                )}
                              </div>
                            </div>

                            {/* Playback video uploader evidence */}
                            <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-150">
                              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block font-sans text-slate-400">📹 Exercise Video Proof</span>
                              
                              {(log as any).videoUrl ? (
                                <div className="space-y-1.5">
                                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative group">
                                    <video 
                                      src={(log as any).videoUrl} 
                                      controls 
                                      className="w-full h-full object-cover"
                                      preload="metadata"
                                    />
                                  </div>
                                  <div className="flex justify-between items-center text-3xs font-mono text-slate-400">
                                    <span>PROOF_VERIFIED.mp4</span>
                                    <span>Duration: ~10s</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="py-6 border border-dashed border-slate-200 rounded-xl text-center space-y-1 text-slate-400">
                                  <FileVideo className="w-8 h-8 text-slate-350 mx-auto" />
                                  <p className="text-2xs">Video not uploaded for this legacy log.</p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coach Feedbacks received */}
                          {log.trainerFeedback && (
                            <div className="bg-[#001F3F]/5 border border-indigo-900/10 rounded-xl p-4 text-xs space-y-1 text-left relative overflow-hidden">
                              <div className="absolute right-3 top-3 text-[#001F3F]/5 pointer-events-none">
                                <MessageSquare className="w-10 h-10" />
                              </div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <User className="w-3.5 h-3.5 text-indigo-900" />
                                <span className="font-extrabold text-[10px] text-indigo-950 uppercase tracking-wider">Coach Sarah Tan's Reply Directive</span>
                              </div>
                              <p className="font-sans text-slate-700 italic leading-relaxed">&ldquo;{log.trainerFeedback}&rdquo;</p>
                              {log.feedbackAt && (
                                <span className="text-[9px] font-mono text-slate-400 mt-1 block">Date Reviewed: {new Date(log.feedbackAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
