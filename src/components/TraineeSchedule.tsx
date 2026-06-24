import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  MessageSquare, 
  X, 
  RefreshCw,
  Award,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { dbService } from '../lib/dbService';
import { BookingSession } from '../types';

interface TraineeScheduleProps {
  traineeId: string;
  onNavigateToTab: (tab: string) => void;
}

export default function TraineeSchedule({ traineeId, onNavigateToTab }: TraineeScheduleProps) {
  const [sessions, setSessions] = useState<BookingSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<BookingSession | null>(null);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<'detail' | 'selector' | 'summary'>('detail');
  const [newDate, setNewDate] = useState<string>('');
  const [newTimeSlot, setNewTimeSlot] = useState<string>('10:05 AM');
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [allTrainerBookings, setAllTrainerBookings] = useState<any[]>([]);
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(null);

  // Focus Date for Calendar Grid (e.g. June 2026)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 5, 1)); // June 2026

  useEffect(() => {
    fetchSessions();
  }, [traineeId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Resolve the direct user-level ID (like 'u_ahmad') to trainee profile ID (like 'te_ahmad')
      const profile = await dbService.getTraineeProfile(traineeId);
      const realTraineeId = profile ? profile.id : traineeId;

      const data = await dbService.getBookings({ traineeId: realTraineeId });
      // Sort by date then timeSlot
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSessions(sorted);

      // Fetch all bookings for Coach Sarah to support real blocking logic
      const trainerBks = await dbService.getBookings({ trainerId: 'tr_sarah' });
      setAllTrainerBookings(trainerBks);
    } catch (err) {
      console.error("Error loading trainee schedule:", err);
    } finally {
      setLoading(false);
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
          senderId: traineeId,
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
          fetchSessions();
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Generate 35 calendar cells for June 2026
  const getDaysInJune2026 = () => {
    const totalDays = 30;
    const startDayOffset = 1; // June 1st, 2026 was a Monday
    const cells = [];
    
    // Empty cells for padding before Monday
    for (let i = 0; i < startDayOffset; i++) {
      cells.push({ day: 0, dateStr: '' });
    }
    
    // Filled cells
    for (let day = 1; day <= totalDays; day++) {
      const formattedDate = `2026-06-${String(day).padStart(2, '0')}`;
      cells.push({ 
        day, 
        dateStr: formattedDate 
      });
    }
    
    return cells;
  };

  const calendarDays = getDaysInJune2026();

  // Check if a specific date string has an active booking session
  const getSessionsForDate = (dateStr: string) => {
    return sessions.filter(s => s.date === dateStr);
  };

  const filteredSessions = selectedFilterDate 
    ? sessions.filter(s => s.date === selectedFilterDate)
    : sessions;

  return (
    <div className="max-w-md mx-auto px-4 py-6 text-left space-y-6">
      
      {/* Page Title */}
      <div>
        <span className="text-[10px] font-bold tracking-wider uppercase bg-[#081F63] text-[#18D4C5] px-3 py-1 rounded-full mb-2 inline-block">
          Personal Calendar
        </span>
        <h2 className="text-2xl font-black font-display text-slate-900">Your Class Schedule</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review, reschedule, and manage clinical exercise sessions assigned with Coach Sarah Tan.
        </p>
      </div>

      {/* Calendar Area */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="text-sm font-black font-display text-slate-800">June 2026</h3>
          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">SS15 Subang Jaya</span>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => {
            if (cell.day === 0) return <div key={idx} className="h-9"></div>;

            const daySessions = getSessionsForDate(cell.dateStr);
            const isToday = cell.day === 20; // Anchor on June 20, 2026 for demonstration
            const hasSessions = daySessions.length > 0;
            const isSelectedFilter = selectedFilterDate === cell.dateStr;

            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (hasSessions) {
                    setSelectedFilterDate(prev => prev === cell.dateStr ? null : cell.dateStr);
                  }
                }}
                className={`h-10 sm:h-11 flex flex-col items-center justify-between py-1.5 rounded-lg transition-all relative border select-none ${
                  isSelectedFilter
                    ? 'bg-teal-500 text-white border-teal-500 font-extrabold ring-2 ring-teal-400 cursor-pointer scale-105 shadow-sm'
                    : isToday 
                      ? 'bg-[#081F63] text-white border-[#081F63] shadow-xs cursor-pointer' 
                      : hasSessions 
                        ? 'bg-teal-50 text-[#081F63] border-teal-200 font-bold hover:bg-teal-100/70 cursor-pointer active:scale-95' 
                        : 'bg-slate-50/50 text-slate-800 border-transparent hover:bg-slate-50'
                }`}
              >
                <span className="text-xs leading-none font-mono font-bold">{cell.day}</span>
                {hasSessions && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isSelectedFilter || isToday ? 'bg-white' : 'bg-[#18D4C5]'
                  } mb-0.5`}></span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcomings Session Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center py-1">
          <h3 className="font-display font-black text-xs text-slate-400 uppercase tracking-wider pl-1">
            Coaching Bookings List
          </h3>
          {selectedFilterDate && (
            <button
              onClick={() => setSelectedFilterDate(null)}
              className="text-[10px] text-teal-600 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1 cursor-pointer"
            >
              Show All <X className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
            <RefreshCw className="w-6 h-6 text-[#18D4C5] animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading scheduled classes...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-6 space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No sessions assigned yet.</p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Book some class sessions on the "Coach" tab to see them displayed here.
            </p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 p-6 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No classes on this specific date.</p>
            <p className="text-[10px] text-slate-400">
              Select another highlighted calendar cell or click "Show All" to see your full roster.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => {
              const isApproved = session.status === 'Approved' || session.status === 'Completed';
              const isRescheduledPending = session.status === 'Reschedule Requested';
              return (
                <div 
                  key={session.id} 
                  onClick={() => handleOpenReschedule(session)}
                  className="bg-white border border-slate-100 hover:border-[#18D4C5]/50 hover:shadow-md cursor-pointer transition-all duration-200 rounded-3xl shadow-sm p-4 text-left relative overflow-hidden group active:scale-[0.98] select-none"
                >
                  {/* Highlight bar */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                    isRescheduledPending 
                      ? 'bg-amber-400' 
                      : isApproved 
                        ? 'bg-[#18D4C5]' 
                        : 'bg-amber-500'
                  }`}></div>

                  <div className="pl-2.5 space-y-3">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block font-sans">
                          {session.packageType || 'Private Session'}
                        </span>
                        <h4 className="text-[14px] font-black text-slate-900 leading-tight font-display group-hover:text-teal-600 transition">
                          {session.title || 'HIIT Private Coaching'}
                        </h4>
                      </div>
                      
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${
                        isRescheduledPending
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isApproved 
                            ? 'bg-teal-50 text-teal-700 border border-teal-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {session.status || 'Scheduled'}
                      </span>
                    </div>

                    {/* Meta parameter details */}
                    <div className="grid grid-cols-2 gap-2 text-slate-500 font-sans text-xs bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 font-mono">
                          {new Date(session.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 font-mono">{session.timeSlot}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1 border-t border-slate-150 pt-1.5 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-semibold text-slate-700">{session.location || 'SS15, Subang Jaya'}</span>
                      </div>
                    </div>

                    {/* Coach Certification Info */}
                    <div className="bg-slate-100/40 rounded-2xl p-2.5 border border-slate-100 text-xs flex justify-between items-center">
                      <div>
                        <p className="font-black text-slate-800">Coach Sarah Tan</p>
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] font-black bg-white border border-slate-200 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1.5 border-t border-slate-100/70" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenReschedule(session)}
                        className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        onClick={() => onNavigateToTab('chats')}
                        className="flex-1 bg-[#081F63] hover:bg-[#07194f] text-white font-bold py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3 text-[#18D4C5]" />
                        <span>Message Coach</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Interactive Modal Sheet */}
      {isRescheduling && selectedSession && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-5 relative shadow-2xl space-y-4 animate-slide-up sm:animate-zoom-in text-left">
            
            <button 
              onClick={() => {
                setIsRescheduling(false);
                setSelectedSession(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 bg-slate-50 rounded-full cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Success screen override */}
            {rescheduleSuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-teal-600 border border-teal-100 font-bold text-2xl font-mono">
                  ✓
                </div>
                <div>
                  <h4 className="font-display font-black text-slate-900 text-lg">Proposal Dispatched!</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Coach Sarah Tan has been notified via chat. You can monitor the reschedule status on your schedule list.
                  </p>
                </div>
              </div>
            ) : modalStep === 'detail' ? (
              /* ================= STEP 1: SESSION DETAIL ================= */
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md tracking-wider inline-block mb-1">
                    Booking Detail
                  </span>
                  <h4 className="font-display font-black text-slate-900 text-xl leading-snug">
                    {selectedSession.title || 'HIIT Private Coaching'}
                  </h4>
                </div>

                <div className="space-y-2.5 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Coach</span>
                    <span className="text-slate-800 font-extrabold">Sarah Tan</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Current Date</span>
                    <span className="text-slate-800 font-mono font-bold">
                      {new Date(selectedSession.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Current Time</span>
                    <span className="text-slate-800 font-mono font-bold">{selectedSession.timeSlot}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-bold">Location</span>
                    <span className="text-slate-800 font-medium">SS15 Studio, Selangor</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-bold">Status</span>
                    <span className={`font-black uppercase px-2 py-0.5 text-[10px] rounded-full ${
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

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => setModalStep('selector')}
                    className="w-full bg-[#041F63] hover:bg-[#031542] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Request Reschedule</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRescheduling(false);
                      onNavigateToTab('chats');
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-105 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                    <span>Message Coach</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRescheduling(false);
                      setSelectedSession(null);
                    }}
                    className="w-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-bold py-2 rounded-xl text-xs transition text-center cursor-pointer mt-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : modalStep === 'selector' ? (
              /* ================= STEP 2: SLOT SELECTOR ================= */
              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-black text-slate-900 text-lg flex items-center gap-1.5">
                    <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
                    <span>Proposal Details</span>
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Select a date & slot according to Coach Sarah Tan's working calendar.
                  </p>
                </div>

                {/* Preferred Replacement Date */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#041F63] uppercase tracking-wider">
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
                    className="w-full max-w-full box-border bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium font-mono focus:outline-[#041F63] focus:ring-1 focus:ring-[#041F63]"
                  />
                </div>

                {/* Preferred Replacement Time Slot Grid */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#041F63] uppercase tracking-wider">
                    Preferred Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM'].map((time) => {
                      const isBooked = checkSlotIsBooked(newDate, time, selectedSession.id);
                      const isSelected = newTimeSlot === time;

                      if (isBooked) {
                        return (
                          <button
                            key={time}
                            type="button"
                            disabled
                            className="bg-slate-100 border border-slate-200 opacity-60 text-slate-400 font-bold py-2.5 text-center text-[10px] rounded-xl cursor-not-allowed flex flex-col items-center justify-center h-12"
                          >
                            <span>{time}</span>
                            <span className="text-[7px] font-black uppercase text-rose-500 tracking-wider">Booked</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setNewTimeSlot(time)}
                          className={`border py-2.5 text-center font-bold text-[11px] rounded-xl transition flex flex-col items-center justify-center cursor-pointer select-none h-12 ${
                            isSelected
                              ? 'border-teal-400 bg-teal-50 text-teal-800 ring-2 ring-teal-400'
                              : 'border-slate-200 hover:bg-slate-50 bg-white text-slate-700'
                          }`}
                        >
                          <span>{time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Reason textarea */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-[#041F63] uppercase tracking-wider">
                    Reason for Rescheduling
                  </label>
                  <textarea 
                    rows={2}
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    placeholder="E.g., Client meeting conflict..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:outline-[#041F63] focus:ring-1 focus:ring-[#041F63]"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setModalStep('detail')}
                    className="w-1/3 bg-slate-50 hover:bg-slate-101 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-xs text-center cursor-pointer"
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
                    className="flex-1 bg-[#041F63] hover:bg-[#031542] text-white font-bold py-3 rounded-xl text-xs text-center cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              /* ================= STEP 3: SUMMARY CONFIRMATION ================= */
              <div className="space-y-4">
                <div>
                  <h4 className="font-display font-black text-slate-900 text-lg flex items-center gap-1.5">
                    <span>Summary of Request</span>
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Please review your proposed schedule assignment details.
                  </p>
                </div>

                <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-150/50">
                    <span className="font-bold text-slate-400">Coach</span>
                    <span className="font-extrabold text-[#041F63]">Sarah Tan</span>
                  </div>
                  
                  <div className="py-1.5 border-b border-slate-150/50 space-y-1">
                    <span className="font-bold text-slate-400 block">Current Slot</span>
                    <span className="font-mono font-bold text-slate-500 block">
                      {new Date(selectedSession.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} at {selectedSession.timeSlot}
                    </span>
                  </div>

                  <div className="py-1.5 space-y-1 bg-teal-500/5 p-2.5 rounded-xl border border-teal-100">
                    <span className="font-bold text-teal-700 block">Proposed Replacement Slot</span>
                    <span className="font-mono font-extrabold text-teal-800 block text-sm">
                      {new Date(newDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })} at {newTimeSlot}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setModalStep('selector')}
                    className="w-1/3 bg-slate-50 hover:bg-slate-101 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-xs text-center cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmReschedule}
                    disabled={actionLoading}
                    className="flex-1 bg-[#041F63] hover:bg-[#031542] text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
                  >
                    {actionLoading ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    ) : (
                      "Send Reschedule Request"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
