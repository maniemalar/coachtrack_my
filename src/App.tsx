import { useState, useEffect } from 'react';
import { UserRole } from './types';
import BrandingHeader from './components/BrandingHeader';
import LandingPage from './components/LandingPage';
import TraineeDashboard from './components/TraineeDashboard';
import TrainerDashboard from './components/TrainerDashboard';
import TrainerFinder from './components/TrainerFinder';
import ChatMessenger from './components/ChatMessenger';
import InvoicesList from './components/InvoicesList';
import { LogIn, Compass, Shield, Database } from 'lucide-react';

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

  const [emailInput, setEmailInput] = useState('ahmad@coachtrack.my');
  const [passwordInput, setPasswordInput] = useState('password123');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.TRAINEE);

  useEffect(() => {
    // Attempt automatic discovery of current trainer profile metadata
    if (currentUser && currentUser.role === UserRole.TRAINER) {
      fetchTrainerProfile(currentUser.id);
    }
  }, [currentUser]);

  const fetchTrainerProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/trainers/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setTrainerProfile(data);
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
          <div className="max-w-md mx-auto my-16 bg-white border border-slate-100 rounded-2xl shadow-xl p-8 text-left">
            <h3 className="font-display font-black text-2xl text-slate-900 mb-2 flex items-center gap-1.5 justify-center">
              <LogIn className="w-6 h-6 text-teal-600" />
              <span>Login to CoachTrack MY</span>
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Enter demo credentials below or use the fast-switcher above
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Password Check
                </label>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl text-xs shadow-md mt-6 transition duration-150"
              >
                Sign In & Get Strong
              </button>
            </form>

            <div className="border-t border-slate-150 pt-4 mt-6 text-center text-[11px] text-slate-400">
              <span className="font-bold block text-slate-550 mb-1">Demo quick credentials:</span>
              <p>Trainee: <span>ahmad@coachtrack.my</span> / password123</p>
              <p>Trainer: <span>sarah@coachtrack.my</span> / password123</p>
            </div>
          </div>
        )}

        {activeTab === 'trainee-dashboard' && currentUser && (
          <TraineeDashboard 
            traineeUserId={currentUser.id} 
            onNavigateToTab={(tab) => setActiveTab(tab)} 
          />
        )}

        {activeTab === 'find-trainer' && currentUser && (
          <TrainerFinder 
            traineeId={currentUser.id}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'payments' && currentUser && (
          <InvoicesList traineeId={currentUser.id} />
        )}

        {activeTab === 'trainer-dashboard' && currentUser && trainerProfile && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Client Management Page route split */}
        {activeTab === 'client-management' && currentUser && trainerProfile && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {/* Trainer Revenue Page route split */}
        {activeTab === 'revenue' && currentUser && trainerProfile && (
          <TrainerDashboard trainerProfile={trainerProfile} activeTab={activeTab} />
        )}

        {activeTab === 'chats' && currentUser && (
          <ChatMessenger 
            currentUserId={currentUser.id} 
            senderRole={currentUser.role}
          />
        )}
      </main>

      {/* Aesthetic Sandbox System status and Reset footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 shrink-0 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <p className="font-bold text-slate-200">CoachTrack MY • Malaysia</p>
            <p className="text-[11px] text-slate-500 mt-1">Designed for Klang Valley, Subang Jaya, Petaling Jaya fitness communities.</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={resetDatabaseSeed}
              className="bg-slate-800 hover:bg-slate-700 text-slate-350 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-bold flex items-center gap-1.5 transition"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Reset Sandbox Database</span>
            </button>
            <span className="text-[10px] text-slate-600">v1.2.0 • TS • Vite</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
