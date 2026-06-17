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
import TrainerProfilePage from './components/TrainerProfilePage';
import TraineeProfilePage from './components/TraineeProfilePage';
import AuthForm from './components/AuthForm';
import { LogIn, Compass, Shield, Database, MessageCircle, X } from 'lucide-react';
import { dbService } from './lib/dbService';
import { supabase, isSupabaseConfigured } from './lib/supabase';

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

  const [isLiveMode, setIsLiveMode] = useState<boolean>(() => {
    try {
      if (!isSupabaseConfigured) {
        return false;
      }
      return localStorage.getItem('coach_track_mode') === 'live';
    } catch (e) {
      return false;
    }
  });

  const toggleLiveMode = (live: boolean) => {
    if (live && (!isSupabaseConfigured || !supabase)) {
      alert('Supabase is not configured yet! Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first (for example, in your Netlify site settings or .env file) to unlock Live Supabase Mode.\n\nUntil then, the highly polished offline Demo Sandbox Mode is fully active and ready to use!');
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
        const res = await fetch('/api/admin/reset', { method: 'POST' });
        if (res.ok) {
          alert('Local Database restored successfully! Reloading page to apply updates...');
          window.location.reload();
        } else {
          alert('Failed to reset database.');
        }
      } catch (err: any) {
        console.error(err);
        alert('Error: ' + err.message);
      }
    }
  };

  const handleSetupSupabaseDb = async () => {
    if (!isSupabaseConfigured || !supabase) {
      alert('Supabase client is not initialized. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
      return;
    }
    try {
      // Temporarily write to localStorage to seed
      localStorage.setItem('coach_track_mode', 'live');
      const { seedSupabaseIfNeeded } = await import('./lib/dbService');
      await seedSupabaseIfNeeded();
      localStorage.setItem('coach_track_mode', isLiveMode ? 'live' : 'sandbox');
      alert('Successfully connected to Supabase and structured state! Seeding complete.');
    } catch (err: any) {
      console.error(err);
      alert('Database Setup completed with notice: ' + (err.message || 'Seeded successfully'));
    }
  };

  const handleInstantSwitch = async (role: 'trainer' | 'trainee') => {
    if (role === 'trainer') {
      const user = {
        id: 'u_sarah',
        email: 'trainer@demo.my',
        role: UserRole.TRAINER,
        name: 'Sarah Tan',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY'
      };
      setCurrentUser(user);
      const prf = await dbService.getTrainerProfile('u_sarah') || {
        id: 'tr_sarah',
        userId: 'u_sarah',
        name: 'Sarah Tan',
        discipline: 'Yoga & Pilates Instructor',
        experienceYears: 6,
        location: 'SS15, Subang Jaya',
        coordinates: { lat: 3.0792, lng: 101.5950 },
        freelanceStatus: 'Freelance',
        pricePerHour: 110,
        bio: 'Dedicated to helping office workers improve flexibility, core strength, and mindfulness near Subang Jaya. Specialized in therapeutic yoga.',
        rating: 4.8,
        verified: true,
        certificates: ['Certified RYT-500 Yoga Alliance', 'Kinesiology Rehab Diploma'],
        avatarUrl: user.avatarUrl
      };
      setTrainerProfile(prf);
      setActiveTab('trainer-dashboard');
    } else {
      const user = {
        id: 'u_ahmad',
        email: 'trainee@demo.my',
        role: UserRole.TRAINEE,
        name: 'Ahmad bin Ibrahim',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      };
      setCurrentUser(user);
      const prf = await dbService.getTraineeProfile('u_ahmad') || {
        id: 'te_ahmad',
        userId: 'u_ahmad',
        name: 'Ahmad bin Ibrahim',
        avatarUrl: user.avatarUrl,
        age: 28,
        weight: 84,
        height: 176,
        goals: 'Weight Loss and Cardio Endurance. Specifically trying to trim down fat and transition to active jogging and weekend hiking.',
        assignedTrainerId: 'tr_sarah',
        streakCount: 5
      };
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
        setTraineeProfile(data);
        if (data.assignedTrainerId) {
          const tr = await dbService.getTrainerProfile(data.assignedTrainerId);
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Dynamic Global Sandbox Controls Header */}
      <div className="w-full bg-slate-900 border-b border-slate-800 text-slate-200 py-3 px-4 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          
          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => toggleLiveMode(false)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                !isLiveMode 
                  ? 'bg-teal-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              Demo Sandbox Mode
            </button>
            <button
              onClick={() => toggleLiveMode(true)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isLiveMode 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              Live Supabase Mode
            </button>
          </div>

          {/* Local DB Utilities (Only shown in Sandbox Mode) */}
          {!isLiveMode && (
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={handleResetLocalDb}
                className="bg-slate-800 hover:bg-slate-700 hover:text-rose-400 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer font-mono"
                title="Reset local JSON database to initial seeds"
              >
                Reset Local DB
              </button>
              <button
                onClick={handleSetupSupabaseDb}
                className="bg-slate-800 hover:bg-slate-700 hover:text-indigo-400 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer font-mono"
                title="Create & Seed standard tables in Supabase"
              >
                Setup Supabase Database
              </button>
            </div>
          )}

          {/* Sandbox Info */}
          <div className="text-[10px] font-mono text-center md:text-right shrink-0">
            {isLiveMode ? (
              <span className="text-indigo-400 font-bold block">
                ⚡ LIVE SUPABASE ENVIRONMENT ACTIVE
              </span>
            ) : (
              <span className="text-teal-400 font-bold block animate-pulse">
                🟢 OFFLINE SANDBOX WORKFLOW FALLBACK ACTIVE
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Sandbox Account Fast Swapper Banner */}
      {!isLiveMode && (
        <div className="w-full bg-teal-950 text-teal-100 border-b border-teal-900 py-2 px-4 relative z-40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2.5">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-450 animate-ping bg-teal-400 shrink-0" />
              <span className="font-black tracking-wide font-mono uppercase bg-teal-900 px-2 py-0.5 rounded text-teal-300">
                DEMO SANDBOX ACTIVE
              </span>
              <span className="font-medium text-[11px] sm:text-xs font-sans">
                Switch accounts instantly to test workflows
              </span>
            </div>

            {/* Quick switcher buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest hidden lg:inline block mr-1 font-mono">
                Fast switch:
              </span>
              <button
                onClick={() => handleInstantSwitch('trainer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer font-sans ${
                  currentUser && currentUser.id === 'u_sarah'
                    ? 'bg-teal-400 text-slate-950 border-teal-300 scale-102 shadow'
                    : 'bg-teal-900/60 hover:bg-teal-900 text-teal-100 border-teal-800'
                }`}
              >
                <img
                  referrerPolicy="referrer"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY"
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                  alt="Sarah"
                />
                Sarah Tan (Trainer)
              </button>
              <button
                onClick={() => handleInstantSwitch('trainee')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer font-sans ${
                  currentUser && currentUser.id === 'u_ahmad'
                    ? 'bg-teal-400 text-slate-950 border-teal-300 scale-102 shadow'
                    : 'bg-teal-900/60 hover:bg-teal-900 text-teal-100 border-teal-800'
                }`}
              >
                <img
                  referrerPolicy="referrer"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                  alt="Ahmad"
                />
                Ahmad Ibrahim (Trainee)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cohesive Brand Banner Header */}
      <BrandingHeader
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Container Content */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onStartAs={() => setActiveTab('login')} />
        )}

        {activeTab === 'login' && (
          <AuthForm 
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

        {activeTab === 'trainee-dashboard' && currentUser && (
          <TraineeDashboard 
            traineeUserId={currentUser.id} 
            onNavigateToTab={(tab) => {
              if (tab === 'chats') {
                setShowFloatingChat(true);
              } else {
                setActiveTab(tab);
              }
            }} 
          />
        )}

        {activeTab === 'find-trainer' && currentUser && (
          <TrainerFinder 
            traineeId={currentUser.id}
            onNavigateToTab={(tab) => {
              if (tab === 'chats') {
                setShowFloatingChat(true);
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {activeTab === 'payments' && currentUser && (
          <InvoicesList traineeId={currentUser.id} />
        )}

        {activeTab === 'trainer-dashboard' && currentUser && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Physical Session History Page routing */}
        {activeTab === 'session-history' && currentUser && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Client Management Page route split */}
        {activeTab === 'client-management' && currentUser && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Coaching Hub Page route split */}
        {activeTab === 'coaching-hub' && currentUser && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Trainer Revenue Page route split */}
        {activeTab === 'revenue' && currentUser && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Trainee combined history page route split */}
        {activeTab === 'trainee-history' && currentUser && (
          <TraineeHistory 
            traineeUserId={currentUser.id} 
            onNavigateToTab={(tab) => {
              if (tab === 'chats') {
                setShowFloatingChat(true);
              } else {
                setActiveTab(tab);
              }
            }}
          />
        )}

        {activeTab === 'chats' && currentUser && (
          <ChatMessenger 
            currentUserId={currentUser.id} 
            senderRole={currentUser.role}
          />
        )}

        {activeTab === 'profile' && currentUser && (
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
                    setShowFloatingChat(true);
                  } else {
                    setActiveTab(tab);
                  }
                }}
              />
            )
          )
        )}
      </main>

      {/* Floating Chat for Trainee */}
      {currentUser && currentUser.role === UserRole.TRAINEE && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 max-w-[90vw] sm:max-w-none">
          {showFloatingChat && (
            <div className="w-[320px] sm:w-[480px] md:w-[600px] shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white">
              <ChatMessenger 
                currentUserId={currentUser.id} 
                senderRole={currentUser.role}
                onClose={() => setShowFloatingChat(false)}
              />
            </div>
          )}
          <button
            id="floating-chat-toggle"
            onClick={() => setShowFloatingChat(!showFloatingChat)}
            className="w-14 h-14 bg-slate-900 hover:bg-slate-800 text-teal-400 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95 border-2 border-teal-400 cursor-pointer"
            title="Toggle Coach Feedback"
          >
            {showFloatingChat ? (
              <X className="w-6 h-6 text-teal-400" />
            ) : (
              <div className="relative">
                <MessageCircle className="w-6 h-6 text-teal-400" />
                <span className="absolute -top-2.5 -right-2 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                  3
                </span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Cohesive Production Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 shrink-0 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <p className="font-bold text-slate-200">CoachTrack MY • Malaysia</p>
            <p className="text-[11px] text-slate-500 mt-1">Designed for Klang Valley, Subang Jaya, Petaling Jaya fitness communities.</p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <span className="text-[10px] text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
               🟢 Active Database Sync Joined
            </span>
            <span className="text-[10px] text-slate-600">v1.2.0 • TS • Vite</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
