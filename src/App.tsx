import { useState, useEffect } from 'react';
import { UserRole } from './types';
import BrandingHeader from './components/BrandingHeader';
import LandingPage from './components/LandingPage';
import TraineeDashboard from './components/TraineeDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import TrainerFinder from './components/TrainerFinder';
import ChatMessenger from './components/ChatMessenger';
import InvoicesList from './components/InvoicesList';
import TraineeHistory from './components/TraineeHistory';
import TraineeSchedule from './components/TraineeSchedule';
import TrainerProfilePage from './components/TrainerProfilePage';
import TraineeProfilePage from './components/TraineeProfilePage';
import AuthForm from './components/AuthForm';
import { 
  Home, 
  Users, 
  Calendar, 
  Apple, 
  Dumbbell, 
  Compass, 
  History, 
  CreditCard, 
  MessageCircle, 
  X,
  LogOut,
  Sparkles,
  Bell,
  ArrowLeft,
  Settings,
  Trash2
} from 'lucide-react';
import { dbService } from './lib/dbService';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import PageHeader from './components/PageHeader';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    role: UserRole;
    name: string;
    avatarUrl: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [trainerProfile, setTrainerProfile] = useState<any>(null);
  const [traineeProfile, setTraineeProfile] = useState<any>(null);
  const [assignedTrainer, setAssignedTrainer] = useState<any>(null);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [showTraineeNotifications, setShowTraineeNotifications] = useState(false);
  const [traineeNotifications, setTraineeNotifications] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('coach_track_trainee_notifications');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    const seed = [
      {
        id: 'trainee_not_1',
        group: 'Today',
        title: 'New Session Scheduled',
        subtitle: 'Coach Sarah scheduled HIIT Core Strength on 20 Jun 2026 at 10:00 AM, SS15 Studio, Selangor.',
        time: '09:15 AM',
        isUnread: true,
        emoji: '📅',
        bgColor: 'bg-indigo-50 text-indigo-650 border border-indigo-100',
        tab: 'trainee-schedule'
      },
      {
        id: 'trainee_not_2',
        group: 'Today',
        title: 'Meal Feedback Received',
        subtitle: 'Coach Sarah commented on your Nasi Lemak Biasa & Fried Egg meal log.',
        time: '10:45 AM',
        isUnread: true,
        emoji: '🥗',
        bgColor: 'bg-emerald-50 text-emerald-650 border border-emerald-100',
        tab: 'trainee-dashboard'
      },
      {
        id: 'trainee_not_3',
        group: 'Today',
        title: 'Reschedule Request Sent',
        subtitle: 'Your reschedule request has been sent to Coach Sarah Tan.',
        time: '11:30 AM',
        isUnread: false,
        emoji: '⏳',
        bgColor: 'bg-amber-50 text-amber-650 border border-amber-100',
        tab: 'trainee-schedule'
      },
      {
        id: 'trainee_not_4',
        group: 'Yesterday',
        title: 'Payment Confirmed',
        subtitle: 'RM600 paid for 8 Classes Per Month with Coach Sarah Tan.',
        time: '02:00 PM',
        isUnread: false,
        emoji: '✅',
        bgColor: 'bg-emerald-50 text-[#059669] border border-emerald-100',
        tab: 'payments'
      },
      {
        id: 'trainee_not_5',
        group: 'Yesterday',
        title: 'Invoice Received',
        subtitle: 'Invoice for 8 Classes Per Month from Coach Sarah Tan.',
        time: '09:00 AM',
        isUnread: true,
        emoji: '🧾',
        bgColor: 'bg-purple-50 text-purple-650 border border-purple-100',
        tab: 'payments'
      }
    ];
    try {
      localStorage.setItem('coach_track_trainee_notifications', JSON.stringify(seed));
    } catch (e) {
      console.error(e);
    }
    return seed;
  });

  const [authFormMode, setAuthFormMode] = useState<'login' | 'signup'>('login');

  const [isLiveMode, setIsLiveMode] = useState<boolean>(() => {
    try {
      if (!isSupabaseConfigured) {
        return false;
      }
      const stored = localStorage.getItem('coach_track_mode');
      if (stored === 'sandbox') {
        return false;
      }
      return true; // Live is default when configured
    } catch (e) {
      return false;
    }
  });

  const toggleLiveMode = (live: boolean) => {
    if (live && (!isSupabaseConfigured || !supabase)) {
      alert('Supabase is not configured yet! Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.\n\nUntil then, the highly polished offline Demo Sandbox Mode is fully active and ready to use!');
      return;
    }
    try {
      localStorage.setItem('coach_track_mode', live ? 'live' : 'sandbox');
    } catch (e) {}
    setIsLiveMode(live);
    // Logout to purge stale state
    setCurrentUser(null);
    setTrainerProfile(null);
    setTraineeProfile(null);
    setAssignedTrainer(null);
    setActiveTab('landing');
  };

  const handleResetLocalDb = async () => {
    if (window.confirm('Are you sure you want to restore the local Sandbox Database to initial demo seeds? Any offline modifications will be replaced.')) {
      try {
        localStorage.removeItem('coach_track_demo_storage');
        await fetch('/api/admin/reset', { method: 'POST' }).catch(() => {});
        alert('Local Database restored successfully! Reloading page to apply updates...');
        window.location.reload();
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  const handleSetupSupabaseDb = async () => {
    alert('Live Mode uses real database schema directly. Manual database setup/seeding is disabled.');
  };

  const handleInstantSwitch = async (role: 'trainer' | 'trainee') => {
    if (role === 'trainer') {
      const user = {
        id: 'u_sarah',
        email: 'sarah@demo.my',
        role: UserRole.TRAINER,
        name: 'Sarah Tan',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY'
      };
      setCurrentUser(user);
      const prf = await dbService.getTrainerProfile('u_sarah');
      setTrainerProfile(prf);
      setActiveTab('trainer-dashboard');
    } else {
      const user = {
        id: 'u_ahmad',
        email: 'trainee@demo.my',
        role: UserRole.TRAINEE,
        name: 'Ahmad Bin Ibrahim',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      };
      setCurrentUser(user);
      const prf = await dbService.getTraineeProfile('u_ahmad');
      setTraineeProfile(prf);
      setActiveTab('trainee-dashboard');
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      if (isLiveMode && isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('Session restored from Supabase');
            let { data: userProfile, error: profErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (profErr && (profErr.code === 'PGRST116' || profErr.message?.includes('coerce') || profErr.message?.includes('zero rows'))) {
              console.log('Session restore: Profile record missing. Healing...');
              const { data: maybeTrainer } = await supabase
                .from('trainer_profiles')
                .select('id')
                .eq('id', session.user.id)
                .maybeSingle();

              const isTrainerByTable = !!maybeTrainer;
              const isTrainerByEmail = session.user.email?.toLowerCase().includes('trainer') || session.user.email?.toLowerCase().includes('sarah');
              const determinedRole = (isTrainerByTable || isTrainerByEmail) ? 'trainer' : 'trainee';

              const { data: newProf, error: insertErr } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email || '',
                  role: determinedRole,
                  name: session.user.user_metadata?.name || (determinedRole === 'trainer' ? 'Coach' : 'Trainee Athlete'),
                  avatar_url: determinedRole === 'trainer'
                    ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
                })
                .select()
                .single();

              if (!insertErr && newProf) {
                userProfile = newProf;
                profErr = null;
              }
            }

            if (!profErr && userProfile) {
              const mappedRole = (userProfile.role ? userProfile.role.toUpperCase() : 'TRAINEE') as UserRole;
              setCurrentUser({
                id: session.user.id,
                email: userProfile.email,
                role: mappedRole,
                name: userProfile.name || 'User',
                avatarUrl: userProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
              });
              if (mappedRole === UserRole.TRAINER) {
                setActiveTab('trainer-dashboard');
              } else {
                setActiveTab('trainee-dashboard');
              }
              console.log('Role redirect success');
            }
          }
        } catch (err) {
          console.error('Error recovering Supabase session:', err);
        }
      }
    };
    restoreSession();
  }, [isLiveMode]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.TRAINER) {
        fetchTrainerProfile(currentUser.id);
      } else {
        fetchTraineeProfile(currentUser.id);
      }
    }
  }, [currentUser]);

  const fetchTrainerProfile = async (userId: string) => {
    try {
      const data = await dbService.getTrainerProfile(userId);
      if (data) {
        setTrainerProfile(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTraineeProfile = async (userId: string) => {
    try {
      const data = await dbService.getTraineeProfile(userId);
      if (data) {
        // ALWAYS FORCE COACH SARAH TAN FOR AHMAD
        if (data.id === 'te_ahmad' || data.userId === 'u_ahmad') {
          data.assignedTrainerId = 'tr_sarah';
        }
        setTraineeProfile(data);
        const trainerId = data.assignedTrainerId || 'tr_sarah';
        if (trainerId) {
          const tr = await dbService.getTrainerProfile(trainerId);
          setAssignedTrainer(tr);
        } else {
          setAssignedTrainer(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    if (isLiveMode && isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
        console.log('Supabase user signed out successfully');
      } catch (e) {
        console.error('Error signing out of Supabase:', e);
      }
    }
    setCurrentUser(null);
    setTrainerProfile(null);
    setTraineeProfile(null);
    setAssignedTrainer(null);
    setActiveTab('landing');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-800" id="main-root">
      
      {/* Main viewport */}
      <div className="flex-1 flex flex-col justify-start w-full">
        {currentUser ? (
          /* Premium Mobile Device Mockup centered on active dashboard */
          <div className="flex-1 w-full flex items-center justify-center p-0 sm:p-6 bg-slate-950 relative">
            <div className="w-full max-w-[430px] min-h-screen sm:min-h-[854px] sm:max-h-[854px] bg-slate-50 relative flex flex-col overflow-hidden sm:rounded-[36px] sm:shadow-2xl sm:border-[10px] sm:border-slate-800 transition-all">
              
              {/* Status Header */}
              <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => {
                  setActiveTab(currentUser.role === UserRole.TRAINER ? 'trainer-dashboard' : 'trainee-dashboard');
                }}>
                  <img 
                    alt="CoachTrack MY Logo" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDETvXZjCP6SyPdhxA5LBJxWToef2-2QRTWXAAcbAR1pYCPBQvSJ3JfenXj6iDZVITmo5sPVkUUbY6CFwY_JmfWywrTQ6vMQ17bJvlNGH4dBCAJBZQAbpTyqrM4kh0PaRdmjdFW5e_ga3qBpyVr_yuIpHJ3_B6g5G116iBOCQhZkDgjAZt18i5v1T48bkwzj8qwRAN4PQidoeK2dCT4jg0emt8ViDZeIiKE--IH9uddRKJNsZ2f0AOkUxqqnvBN0WOSIFHezK-Aw6s" 
                    className="h-9 w-9 object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="font-sans font-black text-xs tracking-tight text-[#001F3F] leading-none">
                      COACH<span className="text-[#18D4C5]">TRACK MY</span>
                    </span>
                    <span className="text-[6.5px] font-bold text-slate-400 tracking-[1px] uppercase leading-none mt-1">
                      TRACK • INSPIRE • ACHIEVE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Notification icon */}
                  <button 
                    onClick={() => {
                      if (currentUser.role === UserRole.TRAINER) {
                        setShowNotificationsDrawer(true);
                      } else {
                        setShowTraineeNotifications(true);
                      }
                    }}
                    className="p-1 px-1.5 text-slate-600 hover:text-[#001F3F] transition-all cursor-pointer relative rounded-lg hover:bg-slate-50 shrink-0"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {currentUser.role === UserRole.TRAINER ? (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-white"></span>
                    ) : (
                      traineeNotifications.some(n => n.isUnread) && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-white"></span>
                      )
                    )}
                  </button>

                  {/* Profile route with Online Indicator */}
                  <div className="relative shadow-sm rounded-full bg-white shrink-0">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-6 h-6 rounded-full overflow-hidden border transition-all hover:scale-105 cursor-pointer flex items-center justify-center ${
                        activeTab === 'profile' ? 'border-[#18D4C5] ring-2 ring-[#18D4C5]/20' : 'border-slate-200'
                      }`}
                    >
                      <img src={currentUser.avatarUrl} className="w-full h-full object-cover" />
                    </button>
                    <span className="absolute bottom-0 right-0 block w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white"></span>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="p-1 px-1.5 text-slate-500 hover:text-rose-500 transition-all cursor-pointer rounded-lg hover:bg-slate-50 shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main content body inside scrollable phone */}
              <div className="flex-1 overflow-y-auto pb-24 relative bg-slate-50 w-full">
                
                {activeTab === 'trainee-dashboard' && (
                  <TraineeDashboard 
                    traineeUserId={currentUser.id} 
                    onNavigateToTab={(tab) => {
                      if (tab === 'chats') {
                        setActiveTab('chats');
                      } else {
                        setActiveTab(tab);
                      }
                    }} 
                  />
                )}

                {activeTab === 'find-trainer' && (
                  <TrainerFinder 
                    traineeId={currentUser.id}
                    onNavigateToTab={(tab) => {
                      if (tab === 'chats') {
                        setActiveTab('chats');
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                  />
                )}

                {activeTab === 'trainee-schedule' && (
                  <TraineeSchedule 
                    traineeId={currentUser.id}
                    onNavigateToTab={(tab) => {
                      if (tab === 'chats') {
                        setActiveTab('chats');
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                  />
                )}

                {activeTab === 'payments' && (
                  <InvoicesList traineeId={currentUser.id} />
                )}

                {activeTab === 'trainee-history' && (
                  <TraineeHistory 
                    traineeUserId={currentUser.id} 
                    onNavigateToTab={(tab) => {
                      if (tab === 'chats') {
                        setActiveTab('chats');
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                  />
                )}

                {/* Trainer Dashboard tab routing split */}
                {activeTab === 'trainer-dashboard' && (
                  <TrainerDashboard trainerProfile={trainerProfile} activeTab="trainer-dashboard" showNotificationsDrawer={showNotificationsDrawer} setShowNotificationsDrawer={setShowNotificationsDrawer} />
                )}

                {activeTab === 'client-management' && (
                  <TrainerDashboard trainerProfile={trainerProfile} activeTab="client-management" showNotificationsDrawer={showNotificationsDrawer} setShowNotificationsDrawer={setShowNotificationsDrawer} />
                )}

                {activeTab === 'session-history' && (
                  <TrainerDashboard trainerProfile={trainerProfile} activeTab="session-history" showNotificationsDrawer={showNotificationsDrawer} setShowNotificationsDrawer={setShowNotificationsDrawer} />
                )}

                {activeTab === 'coaching-hub' && (
                  <TrainerDashboard trainerProfile={trainerProfile} activeTab="coaching-hub" showNotificationsDrawer={showNotificationsDrawer} setShowNotificationsDrawer={setShowNotificationsDrawer} />
                )}

                {activeTab === 'revenue' && (
                  <TrainerDashboard trainerProfile={trainerProfile} activeTab="revenue" showNotificationsDrawer={showNotificationsDrawer} setShowNotificationsDrawer={setShowNotificationsDrawer} />
                )}

                {activeTab === 'chats' && (
                  <ChatMessenger 
                    currentUserId={currentUser.id} 
                    senderRole={currentUser.role}
                  />
                )}

                {activeTab === 'profile' && (
                  currentUser.role === UserRole.TRAINER ? (
                    trainerProfile && (
                      <TrainerProfilePage 
                        trainerProfile={trainerProfile} 
                        onUpdateProfile={(updated) => {
                          setTrainerProfile(updated);
                          setCurrentUser(prev => prev ? { ...prev, name: updated.name, avatarUrl: updated.avatarUrl } : null);
                        }} 
                      />
                    )
                  ) : (
                    traineeProfile && (
                      <TraineeProfilePage 
                        traineeProfile={traineeProfile} 
                        assignedTrainer={assignedTrainer}
                        onUpdateProfile={(updated) => {
                          setTraineeProfile(updated);
                          setCurrentUser(prev => prev ? { ...prev, name: updated.name, avatarUrl: updated.avatarUrl } : null);
                        }}
                        onNavigateToTab={(tab) => {
                          if (tab === 'chats') {
                            setActiveTab('chats');
                          } else {
                            setActiveTab(tab);
                          }
                        }}
                        onLogout={handleLogout}
                      />
                    )
                  )
                )}

              </div>

              {/* STICKY BOTTOM TAB NAVIGATION */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] shrink-0">
                {currentUser.role === UserRole.TRAINEE ? (
                  /* Trainee Sticky Navigation Buttons */
                  <>
                    <button
                      onClick={() => setActiveTab('trainee-dashboard')}
                      className={`flex flex-col items-center justify-center w-14 h-full transition-colors cursor-pointer ${
                        activeTab === 'trainee-dashboard' ? 'text-teal-500 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Dumbbell className="w-4.5 h-4.5 mb-1" />
                      <span className="text-[9px] tracking-tight">Home</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('find-trainer')}
                      className={`flex flex-col items-center justify-center w-14 h-full transition-colors cursor-pointer ${
                        activeTab === 'find-trainer' ? 'text-teal-500 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Compass className="w-4.5 h-4.5 mb-1" />
                      <span className="text-[9px] tracking-tight">Coach</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('trainee-schedule')}
                      className={`flex flex-col items-center justify-center w-14 h-full transition-colors cursor-pointer ${
                        activeTab === 'trainee-schedule' ? 'text-teal-500 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Calendar className="w-4.5 h-4.5 mb-1" />
                      <span className="text-[9px] tracking-tight">Schedule</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('payments')}
                      className={`flex flex-col items-center justify-center w-14 h-full transition-colors cursor-pointer ${
                        activeTab === 'payments' ? 'text-teal-500 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-4.5 h-4.5 mb-1" />
                      <span className="text-[9px] tracking-tight">Payments</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('trainee-history')}
                      className={`flex flex-col items-center justify-center w-14 h-full transition-colors cursor-pointer ${
                        activeTab === 'trainee-history' ? 'text-teal-500 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <History className="w-4.5 h-4.5 mb-1" />
                      <span className="text-[9px] tracking-tight">History</span>
                    </button>
                  </>
                ) : (
                  /* Trainer Sticky Navigation Buttons */
                  <>
                    <button
                      onClick={() => setActiveTab('trainer-dashboard')}
                      className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
                        activeTab === 'trainer-dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Home className="w-5 h-5 mb-1" />
                      <span className="text-[10px] tracking-wide">Home</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('client-management')}
                      className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
                        activeTab === 'client-management' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Users className="w-5 h-5 mb-1" />
                      <span className="text-[10px] tracking-wide">Clients</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('session-history')}
                      className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
                        activeTab === 'session-history' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Calendar className="w-5 h-5 mb-1" />
                      <span className="text-[10px] tracking-wide">Schedule</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('revenue')}
                      className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
                        activeTab === 'revenue' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mb-1" />
                      <span className="text-[10px] tracking-wide">Payments</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('coaching-hub')}
                      className={`flex flex-col items-center justify-center w-16 h-full transition-colors cursor-pointer ${
                        activeTab === 'coaching-hub' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Apple className="w-5 h-5 mb-1" />
                      <span className="text-[10px] tracking-wide">Nutrition</span>
                    </button>
                  </>
                )}
              </div>

              {/* Trainee Notification Drawer */}
              <AnimatePresence>
                {showTraineeNotifications && (
                  <>
                    {/* Backdrop Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowTraineeNotifications(false)}
                      className="absolute inset-0 z-[110] bg-slate-900/40 backdrop-blur-xs cursor-pointer"
                    />

                    {/* Bottom Sheet Container */}
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                      className="absolute bottom-0 left-0 right-0 z-[120] bg-white rounded-t-[20px] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] flex flex-col h-[65%] max-h-[65%] border-t border-slate-100 overflow-hidden box-border text-slate-800"
                    >
                      {/* Native Drag handles */}
                      <div 
                        className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1.5 shrink-0 cursor-pointer"
                        onClick={() => setShowTraineeNotifications(false)}
                      />

                      {/* Main Content Area - scrolling internally */}
                      <div className="flex-1 overflow-y-auto flex flex-col text-left font-sans">
                        {/* 1. Page Header */}
                        <div className="flex justify-between items-center px-4.5 py-4 border-b border-slate-100 shrink-0 bg-white">
                          <button 
                            onClick={() => setShowTraineeNotifications(false)}
                            className="flex items-center gap-1.5 text-[#0F172A] hover:text-slate-600 font-extrabold text-xs tracking-wider cursor-pointer font-sans"
                          >
                            <ArrowLeft className="w-4 h-4 text-[#0F172A]" />
                            <span>Back</span>
                          </button>
                          <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-slate-50 cursor-pointer transition">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Page standard header */}
                        <PageHeader 
                          title="Notifications" 
                          subtitle="Stay updated with study & session events" 
                        />

                        {/* 2. Alert Card */}
                        <div className="px-4.5 pt-4">
                          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-100 rounded-[18px] p-3.5 flex items-start gap-2.5 shadow-2xs">
                            <span className="text-base shrink-0">✨</span>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-sans font-extrabold text-[10px] uppercase text-[#6366F1] tracking-wider leading-none">Reminder</h5>
                              <p className="text-[11px] text-[#64748B] mt-1 font-sans font-medium leading-relaxed">You have new personal coach updates.</p>
                            </div>
                          </div>
                        </div>

                        {/* 3. Notification Groups & Rows */}
                        <div className="flex-1 px-4.5 py-4 space-y-5 select-none bg-white">
                          {(() => {
                            const groups = ['Today', 'Yesterday'];
                            return groups.map((group) => {
                              const groupNotifs = traineeNotifications.filter(n => n.group === group);
                              if (groupNotifs.length === 0) return null;
                              const hasUnreadInGroup = groupNotifs.some(n => n.isUnread);

                              return (
                                <div key={group} className="space-y-3">
                                  {/* Group Header with "Mark all read" */}
                                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                    <span className="text-[10px] font-black uppercase text-[#0F172A] tracking-widest">{group}</span>
                                    {hasUnreadInGroup && (
                                      <button
                                        onClick={() => {
                                          setTraineeNotifications(prev => {
                                            const updated = prev.map(n => n.group === group ? { ...n, isUnread: false } : n);
                                            localStorage.setItem('coach_track_trainee_notifications', JSON.stringify(updated));
                                            return updated;
                                          });
                                        }}
                                        className="text-[9px] font-extrabold text-[#6366F1] hover:text-[#4f46e5] cursor-pointer hover:underline transition font-sans"
                                      >
                                        Mark all read
                                      </button>
                                    )}
                                  </div>

                                  {/* Group rows */}
                                  <div className="space-y-2.5">
                                    {groupNotifs.map((notif) => (
                                      <div
                                        key={notif.id}
                                        onClick={() => {
                                          setTraineeNotifications(prev => {
                                            const updated = prev.map(n => n.id === notif.id ? { ...n, isUnread: false } : n);
                                            localStorage.setItem('coach_track_trainee_notifications', JSON.stringify(updated));
                                            return updated;
                                          });
                                          if (notif.tab) {
                                            setActiveTab(notif.tab);
                                            setShowTraineeNotifications(false);
                                          }
                                        }}
                                        className={`bg-white border text-left p-3 rounded-[18px] flex items-center justify-between gap-3 shadow-2xs transition duration-155 cursor-pointer hover:bg-slate-50/50 ${
                                          notif.isUnread ? 'border-[#818cf8]/40 bg-indigo-50/10 font-medium' : 'border-slate-100 bg-white'
                                        }`}
                                      >
                                        {/* Left part */}
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                          {/* Small circular icon */}
                                          <div className={`w-8 h-8 rounded-full border font-sans flex items-center justify-center shrink-0 ${notif.bgColor || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                            <span className="text-sm leading-none shrink-0 select-none">{notif.emoji}</span>
                                          </div>
                                          <div className="min-w-0 font-sans flex-1">
                                            <h4 className="text-xs font-bold text-[#0F172A] leading-tight truncate">
                                              {notif.title}
                                            </h4>
                                            <p className="text-[10px] text-[#64748B] leading-normal font-sans mt-0.5 whitespace-normal break-words">
                                              {notif.subtitle}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Right part: Time and Unread dot / Dismiss */}
                                        <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] text-[#64748B] font-mono leading-none">{notif.time}</span>
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setTraineeNotifications(prev => {
                                                  const updated = prev.filter(n => n.id !== notif.id);
                                                  localStorage.setItem('coach_track_trainee_notifications', JSON.stringify(updated));
                                                  return updated;
                                                });
                                              }}
                                              className="text-slate-450 hover:text-rose-500 cursor-pointer transition p-0.5 rounded hover:bg-slate-100/50"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          {notif.isUnread && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shrink-0 animate-pulse"></span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

            </div>
          </div>
        ) : (
          /* User is NOT logged in - Standard Landing and Login Viewports inside Centered Mobile Viewport */
          <div className="flex-1 w-full flex items-center justify-center p-0 sm:p-6 bg-slate-950 relative">
            <div className="w-full max-w-[430px] min-h-screen sm:min-h-[854px] sm:max-h-[854px] bg-white relative flex flex-col overflow-hidden sm:rounded-[36px] sm:shadow-2xl sm:border-[10px] sm:border-slate-800 transition-all text-slate-800 shadow-teal-950/20">
              
              {/* Sticky Top Header inside mobile view */}
              <div className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-2">
                  <img 
                    alt="CoachTrack MY Logo" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDETvXZjCP6SyPdhxA5LBJxWToef2-2QRTWXAAcbAR1pYCPBQvSJ3JfenXj6iDZVITmo5sPVkUUbY6CFwY_JmfWywrTQ6vMQ17bJvlNGH4dBCAJBZQAbpTyqrM4kh0PaRdmjdFW5e_ga3qBpyVr_yuIpHJ3_B6g5G116iBOCQhZkDgjAZt18i5v1T48bkwzj8qwRAN4PQidoeK2dCT4jg0emt8ViDZeIiKE--IH9uddRKJNsZ2f0AOkUxqqnvBN0WOSIFHezK-Aw6s" 
                    className="h-9 w-9 object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="font-sans font-black text-xs tracking-tight text-[#001F3F] leading-none">
                      COACH<span className="text-[#18D4C5]">TRACK MY</span>
                    </span>
                    <span className="text-[6.5px] font-bold text-slate-400 tracking-[1px] uppercase leading-none mt-1">
                      TRACK • INSPIRE • ACHIEVE
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveTab('landing')}
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'landing' ? 'bg-[#001F3F] text-white' : 'text-slate-600 hover:text-[#001F3F]'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => {
                      setAuthFormMode('login');
                      setActiveTab('login');
                    }}
                    className={`text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'login' ? 'bg-[#18D4C5] text-[#001F3F]' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Login
                  </button>
                </div>
              </div>

              {/* Demo Presentation Switcher Pill just below header */}
              {!isLiveMode && (
                <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-between text-[10px] font-sans shrink-0">
                  <div className="flex items-center gap-1 text-amber-800 font-bold">
                    <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
                    <span>DEMO SANDBOX</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleInstantSwitch('trainer')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded text-[8px] uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Coach
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInstantSwitch('trainee')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded text-[8px] uppercase tracking-wider cursor-pointer transition-colors"
                    >
                      Client
                    </button>
                  </div>
                </div>
              )}

              {/* Scrollable container holding actual contents */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'landing' && (
                  <LandingPage 
                    onStartAs={(action) => {
                      setAuthFormMode(action);
                      setActiveTab('login');
                    }} 
                  />
                )}

                {activeTab === 'login' && (
                  <AuthForm 
                    isLiveMode={isLiveMode}
                    onToggleLiveMode={toggleLiveMode}
                    onResetLocalDb={handleResetLocalDb}
                    onSetupSupabaseDb={handleSetupSupabaseDb}
                    initialMode={authFormMode}
                    onAuthSuccess={(user, trainerPrf, traineePrf) => {
                      setCurrentUser(user);
                      if (trainerPrf) setTrainerProfile(trainerPrf);
                      if (traineePrf) setTraineeProfile(traineePrf);
                      
                      if (user.role === UserRole.TRAINEE) {
                        setActiveTab('trainee-dashboard');
                      } else {
                        setActiveTab('trainer-dashboard');
                      }
                    }}
                    onNavigateToTab={(tab) => {
                      setActiveTab(tab);
                    }}
                  />
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Outermost Footer shown only during presentation landing boards */}
      {!currentUser && (
        <footer className="bg-slate-950 text-slate-500 text-xs py-8 border-t border-slate-800 shrink-0 text-center font-sans tracking-wide">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-left">
              <p className="font-bold text-slate-300">CoachTrack MY • Malaysia</p>
              <p className="text-[11px] text-slate-500 mt-1">Refactored Mobile-First Coaching Platform.</p>
            </div>
            <div className="flex items-center flex-wrap gap-2 text-[10px]">
              <span className="text-teal-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Klang Valley Verified
              </span>
              <span>v1.2.0 • TS • Vite</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}
