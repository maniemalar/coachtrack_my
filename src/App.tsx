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
import { isSupabaseConfigured } from './lib/supabase';

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
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  const [emailInput, setEmailInput] = useState('ahmad@coachtrack.my');
  const [passwordInput, setPasswordInput] = useState('password123');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.TRAINEE);

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

  const handleQuickLogin = (role: UserRole) => {
    if (role === UserRole.TRAINEE) {
      const traineeUser = {
        id: 'u_ahmad',
        email: 'ahmad@coachtrack.my',
        role: UserRole.TRAINEE,
        name: 'Ahmad Ibrahim',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      };
      setCurrentUser(traineeUser);
      setActiveTab('trainee-dashboard');
    } else {
      const trainerUser = {
        id: 'u_sarah',
        email: 'sarah@coachtrack.my',
        role: UserRole.TRAINER,
        name: 'Sarah Tan',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
      };
      setCurrentUser(trainerUser);
      setActiveTab('trainer-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTrainerProfile(null);
    setTraineeProfile(null);
    setAssignedTrainer(null);
    setActiveTab('landing');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        if (user.role === UserRole.TRAINEE) {
          setActiveTab('trainee-dashboard');
        } else {
          setActiveTab('trainer-dashboard');
        }
      } else {
        alert('Invalid demo credentials. Feel free to use the Sandbox Instant Swappers at the very top of the bar!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Perform a full database reset back to initial seed state
  const resetDatabaseSeed = async () => {
    const confirmation = window.confirm("Reset SQL/JSON sandbox back to initial defaults? This wipes any changes you made in current test and starts fresh.");
    if (!confirmation) return;

    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      if (res.ok) {
        alert("Database successfully reset! Reloading application...");
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Cohesive Brand Banner & Demo Switcher Header */}
      <BrandingHeader
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onQuickLogin={handleQuickLogin}
      />

      {/* Main Container Content */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage onStartAs={(role) => handleQuickLogin(role)} />
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

        {activeTab === 'trainer-dashboard' && currentUser && trainerProfile && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Physical Session History Page routing */}
        {activeTab === 'session-history' && currentUser && trainerProfile && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Client Management Page route split */}
        {activeTab === 'client-management' && currentUser && trainerProfile && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Coaching Hub Page route split */}
        {activeTab === 'coaching-hub' && currentUser && trainerProfile && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Trainer Revenue Page route split */}
        {activeTab === 'revenue' && currentUser && trainerProfile && (
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

      {/* Aesthetic Sandbox System status and Reset footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 shrink-0 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <p className="font-bold text-slate-200">CoachTrack MY • Malaysia</p>
            <p className="text-[11px] text-slate-500 mt-1">Designed for Klang Valley, Subang Jaya, Petaling Jaya fitness communities.</p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => setShowSupabaseModal(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition ${
                isSupabaseConfigured
                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-700 hover:bg-amber-900/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured ? '● Supabase Cloud DB Active' : '● Setup Supabase Database'}</span>
            </button>
            <button 
              onClick={resetDatabaseSeed}
              className="bg-slate-800 hover:bg-slate-700 text-slate-350 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-bold flex items-center gap-1.5 transition"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Reset Local DB</span>
            </button>
            <span className="text-[10px] text-slate-600">v1.2.0 • TS • Vite</span>
          </div>
        </div>
      </footer>

      {/* Supabase Technical Integration Tutorial popup */}
      {showSupabaseModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl p-6 md:p-8 text-left relative my-8">
            <button 
              onClick={() => setShowSupabaseModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-center text-base p-1.5 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <Database className="w-5 h-5 text-teal-600 animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-slate-900">Supabase SQL Integration Guide</h3>
                <p className="text-xs text-slate-500">Enable 100% persistent workouts, bookings, food logs, and coach chats on Netlify.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <div className="bg-teal-50/55 border border-teal-100 p-4 rounded-xl">
                <p className="font-bold text-teal-950 mb-1">Why are Coach Sarah Tan and Workouts missing on Netlify?</p>
                <p>
                  Netlify hosts your React app as a <strong>static frontend (SPA)</strong>. Because there is no persistent backend server running to preserve the local <code className="bg-white/70 px-1 border rounded">database.json</code> file, data is reset and API routes return 404. By connecting Supabase, your React app queries the database directly with serverless operations!
                </p>
              </div>

              <div>
                <span className="font-extrabold uppercase text-slate-900 tracking-wider block mb-1">Step 1: Create Supabase Project</span>
                <p>Register at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline font-semibold">supabase.com</a> (Free tier) and spin up a new PostgreSQL database project.</p>
              </div>

              <div>
                <span className="font-extrabold uppercase text-slate-900 tracking-wider block mb-1">Step 2: Paste SQL Schema in SQL Editor</span>
                <p className="mb-2">Go to Supabase's <strong>SQL Editor</strong>, open a new query sheet, and run the following command to create all requisite tables:</p>
                <pre className="bg-slate-950 text-emerald-400 text-[10px] p-4 rounded-xl font-mono overflow-x-auto max-h-40 border border-slate-800">
{`-- Create CoachTrack Malaysia Tables
CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  freelance_status TEXT NOT NULL,
  price_per_hour INTEGER NOT NULL,
  bio TEXT NOT NULL,
  rating DOUBLE PRECISION NOT NULL,
  verified BOOLEAN DEFAULT TRUE,
  certificates TEXT[] NOT NULL,
  avatar_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trainees (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  age INTEGER NOT NULL,
  weight INTEGER NOT NULL,
  height INTEGER NOT NULL,
  goals TEXT NOT NULL,
  assigned_trainer_id TEXT,
  streak_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  "traineeId" TEXT NOT NULL,
  "trainerId" TEXT,
  date TEXT NOT NULL,
  "workoutType" TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exercises JSONB NOT NULL,
  notes TEXT,
  "trainerFeedback" TEXT,
  "feedbackAt" TEXT
);

CREATE TABLE IF NOT EXISTS nutrition (
  id TEXT PRIMARY KEY,
  "traineeId" TEXT NOT NULL,
  date TEXT NOT NULL,
  "foodName" TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  carbs INTEGER NOT NULL,
  fat INTEGER NOT NULL,
  notes TEXT,
  "trainerFeedback" TEXT,
  "feedbackAt" TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "traineeId" TEXT NOT NULL,
  "traineeName" TEXT NOT NULL,
  date TEXT NOT NULL,
  "timeSlot" TEXT NOT NULL,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  "packageType" TEXT,
  "amountPaid" INTEGER
);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  "replyToType" TEXT,
  "replyToId" TEXT,
  "replyToTitle" TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "traineeId" TEXT NOT NULL,
  "traineeName" TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prescribed_workouts (
  id TEXT PRIMARY KEY,
  "trainerId" TEXT NOT NULL,
  "traineeId" TEXT NOT NULL,
  "workoutType" TEXT NOT NULL,
  duration INTEGER NOT NULL,
  exercises JSONB NOT NULL,
  notes TEXT,
  status TEXT NOT NULL,
  "assignedDate" TEXT NOT NULL
);`}
                </pre>
              </div>

              <div>
                <span className="font-extrabold uppercase text-slate-900 tracking-wider block mb-1">Step 3: Define Environment Secrets in Netlify</span>
                <p className="mb-2">In your Netlify Project Dashboard under <strong>Site Configuration &rarr; Environment Variables</strong>, add the following two public keys (they are also supported in your local <code className="bg-slate-100 px-1 border rounded">.env</code> file):</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-205 font-mono text-[10px] text-slate-700 space-y-1">
                  <p><strong>VITE_SUPABASE_URL</strong> = <span className="text-teal-700">&ldquo;https://your-supabase-project.supabase.co&rdquo;</span></p>
                  <p><strong>VITE_SUPABASE_ANON_KEY</strong> = <span className="text-teal-700">&ldquo;your-anon-key-here&rdquo;</span></p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-emerald-800">
                <p className="font-bold mb-0.5">🚀 Auto-Seeding Enabled!</p>
                <p className="m-0 text-[11px]">As soon as your keys are configured, the applet will automatically seed your Supabase tables with standard coaches (including Coach Sarah Tan set right inside SS15!), demo client Ahmad, and initial prescribed routines!</p>
              </div>
            </div>

            <div className="border-t border-slate-150 pt-4 mt-6 flex justify-end">
              <button 
                onClick={() => setShowSupabaseModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
              >
                Got it, Let's Connect!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
