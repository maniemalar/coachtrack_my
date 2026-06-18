import React, { useState } from 'react';
import { 
  UserRole, 
  TrainerProfile, 
  TraineeProfile 
} from '../types';
import { 
  supabase, 
  isSupabaseConfigured 
} from '../lib/supabase';
import { 
  LogIn, 
  User, 
  Dumbbell, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  UploadCloud, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Lock, 
  BadgeHelp,
  ShieldCheck,
  CheckCircle2,
  Info,
  Shield,
  Database
} from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: (
    user: { id: string; email: string; role: UserRole; name: string; avatarUrl: string },
    trainerProfile?: TrainerProfile | null,
    traineeProfile?: TraineeProfile | null
  ) => void;
  onNavigateToTab: (tab: string) => void;
  initialRole?: UserRole;
  isLiveMode: boolean;
  onToggleLiveMode: (live: boolean) => void;
  onResetLocalDb: () => void;
  onSetupSupabaseDb: () => void;
}

export default function AuthForm({ 
  onAuthSuccess, 
  onNavigateToTab, 
  initialRole = UserRole.TRAINEE,
  isLiveMode,
  onToggleLiveMode,
  onResetLocalDb,
  onSetupSupabaseDb
}: AuthFormProps) {
  // Auth Form mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLogginIn, setIsLoggingIn] = useState(false);

  // Signup Common fields
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [signupStep, setSignupStep] = useState(1); // stepper index for trainer
  const [signupError, setSignupError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Diagnostic states
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testResult, setTestResult] = useState('');

  // Trainer Stepper values
  // Step 1: Basic Info
  const [trainerName, setTrainerName] = useState('');
  const [trainerEmail, setTrainerEmail] = useState('');
  const [trainerPassword, setTrainerPassword] = useState('');
  const [trainerPhone, setTrainerPhone] = useState('');
  const [trainerLocation, setTrainerLocation] = useState('');
  
  // Step 2: Trainer Details
  const [trainerDiscipline, setTrainerDiscipline] = useState('Personal Training & Strength');
  const [trainerExperience, setTrainerExperience] = useState('3');
  const [trainerType, setTrainerType] = useState<'Freelance Trainer' | 'Under Gym / Studio'>('Freelance Trainer');
  const [trainerGymName, setTrainerGymName] = useState('');
  const [trainerBio, setTrainerBio] = useState('');

  // Step 3: Verification Documents
  const [certFile, setCertFile] = useState<File | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [certFileName, setCertFileName] = useState('');
  const [idFileName, setIdFileName] = useState('');
  const [isCertUploading, setIsCertUploading] = useState(false);
  const [isIdUploading, setIsIdUploading] = useState(false);

  // Step 4: Package details
  const [selectedPlanId, setSelectedPlanId] = useState<'starter' | 'growth' | 'pro'>('growth');

  // Trainee fields
  const [traineeName, setTraineeName] = useState('');
  const [traineeEmail, setTraineeEmail] = useState('');
  const [traineePassword, setTraineePassword] = useState('');
  const [traineePhone, setTraineePhone] = useState('');
  const [traineeLocation, setTraineeLocation] = useState('');
  const [traineeGoal, setTraineeGoal] = useState('');
  const [traineeWorkoutType, setTraineeWorkoutType] = useState('HIIT Weightloss');
  const [traineeLevel, setTraineeLevel] = useState('Beginner');

  const handleDiagnosticTest = async () => {
    setTestStatus('testing');
    setTestResult('');
    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase Client is not initialized. Please verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are present in your environment.');
      }
      
      const testEmail = `diagnostic-${Date.now()}@test.coachtrack.my`;
      const testPassword = `Test1234!-${Date.now()}`;
      
      console.log('Diagnostic test: Attempting supabase.auth.signUp() with:', testEmail);
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { name: 'Diagnostic Test User', role: 'trainee' }
        }
      });
      
      console.log('DIAGNOSTIC SUPABASE SIGNUP DATA RESPONSE:', data);
      console.log('DIAGNOSTIC SUPABASE SIGNUP ERROR RESPONSE:', error);
      
      if (error) {
        throw error;
      }
      
      setTestStatus('success');
      setTestResult(`Success! User created successfully.\nID: ${data.user?.id || 'N/A'}\nEmail: ${data.user?.email || testEmail}\nConfirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'Pending/No confirmation'}`);
    } catch (e: any) {
      console.error('Diagnostic test failed:', e);
      setTestStatus('failed');
      setTestResult(e.message || 'Unknown diagnostic error.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const isLive = isLiveMode;
    if (!isLive) {
      console.log('Simulating offline login for Sandbox Mode:', loginEmail);
      const emailLower = loginEmail.toLowerCase();
      if (emailLower.includes('trainer') || emailLower.includes('sarah') || emailLower === 'sarah@demo.my') {
        onAuthSuccess({
          id: 'u_sarah',
          email: loginEmail,
          role: UserRole.TRAINER,
          name: 'Sarah Tan',
          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY'
        });
        setIsLoggingIn(false);
        return;
      } else {
        onAuthSuccess({
          id: 'u_ahmad',
          email: loginEmail,
          role: UserRole.TRAINEE,
          name: 'Ahmad bin Ibrahim',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
        });
        setIsLoggingIn(false);
        return;
      }
    }

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('Attempting Supabase login for:', loginEmail);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });

        if (error) {
          console.error('Supabase Login error:', error);
          throw new Error(error.message);
        }

        if (data?.user) {
          console.log('Login success');
          // Fetch demographic from profiles
          let { data: prof, error: profErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profErr && (profErr.code === 'PGRST116' || profErr.message?.includes('coerce') || profErr.message?.includes('zero rows'))) {
            console.log('Profile record missing for existing auth user during login. Healing profile...');
            
            // Check if they are a trainer by checking trainer_profiles table
            const { data: maybeTrainer } = await supabase
              .from('trainer_profiles')
              .select('id')
              .eq('id', data.user.id)
              .maybeSingle();

            const isTrainerByTable = !!maybeTrainer;
            const isTrainerByEmail = data.user.email?.toLowerCase().includes('trainer') || data.user.email?.toLowerCase().includes('sarah');
            const determinedRole = (isTrainerByTable || isTrainerByEmail) ? 'trainer' : 'trainee';

            // Insert matching profile row to heal the schema mismatch
            const { data: newProf, error: insertErr } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email || '',
                role: determinedRole,
                name: data.user.user_metadata?.name || (determinedRole === 'trainer' ? 'Coach' : 'Trainee Athlete'),
                avatar_url: determinedRole === 'trainer'
                  ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
              })
              .select()
              .single();

            if (insertErr) {
              console.error('Failed to auto-heal missing profile:', insertErr);
              throw new Error(`Profile creation / healing query failed: ${insertErr.message}`);
            }
            prof = newProf;
            profErr = null;
          } else if (profErr) {
            console.error('Supabase Profile fetch error:', profErr);
            throw new Error(`Profile query failed: ${profErr.message}`);
          }

          if (prof) {
            console.log('Role redirect success');
            const mappedRole = (prof.role ? prof.role.toUpperCase() : 'TRAINEE') as UserRole;
            onAuthSuccess({
              id: data.user.id,
              email: prof.email,
              role: mappedRole,
              name: prof.name || 'Athlete Name',
              avatarUrl: prof.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
            });
            setIsLoggingIn(false);
            return;
          } else {
            throw new Error('User profile record not found in database.');
          }
        }
      } else {
        throw new Error('Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
      }
    } catch (err: any) {
      console.error('Login submit error:', err);
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Stepper Next / Prev
  const nextTrainerStep = () => {
    if (signupStep === 1) {
      if (!trainerName || !trainerEmail || !trainerPassword || !trainerPhone || !trainerLocation) {
        setSignupError('Please complete all basic information fields.');
        return;
      }
    } else if (signupStep === 2) {
      if (!trainerBio) {
        setSignupError('Please tell us a little bit about yourself (Short Bio).');
        return;
      }
    } else if (signupStep === 3) {
      if (!certFileName && !certFile) {
        setSignupError('Please simulate uploading your Fitness License or Certificate.');
        return;
      }
      if (!idFileName && !idFile) {
        setSignupError('Please simulate uploading your Identification proof document.');
        return;
      }
    }
    setSignupError('');
    setSignupStep(prev => prev + 1);
  };

  const prevTrainerStep = () => {
    setSignupError('');
    setSignupStep(prev => prev - 1);
  };

  // File simulations
  const handleCertSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertFile(file);
      setCertFileName(file.name);
      setIsCertUploading(true);
      setTimeout(() => setIsCertUploading(false), 800); // quick visual loading effect
    }
  };

  const handleIdSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdFile(file);
      setIdFileName(file.name);
      setIsIdUploading(true);
      setTimeout(() => setIsIdUploading(false), 800); // quick visual loading effect
    }
  };

  // Trainer Direct Registration Completion (Step 4 Selection)
  const completeTrainerSignup = async (planId: 'starter' | 'growth' | 'pro') => {
    setIsSubmitting(true);
    setSignupError('');

    const isLive = isLiveMode;
    if (!isLive) {
      setTimeout(() => {
        onAuthSuccess({
          id: `u_tr_${Math.random().toString(36).substring(2, 7)}`,
          email: trainerEmail || 'trainer_new@demo.my',
          role: UserRole.TRAINER,
          name: trainerName || 'New Sandbox Coach',
          avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
        });
        setIsSubmitting(false);
      }, 500);
      return;
    }

    const planLimits = { starter: 5, growth: 20, pro: 50 };
    const planPrices = { starter: 29, growth: 59, pro: 99 };
    const pNames = { starter: 'Starter Trainer Plan', growth: 'Growth Trainer Plan', pro: 'Pro Trainer Plan' };

    const selectedLimit = planLimits[planId];
    const selectedPrice = planPrices[planId];
    const selectedPlanName = pNames[planId];

    const todayDate = new Date().toISOString().split('T')[0];
    const renewalDate = new Date();
    renewalDate.setMonth(renewalDate.getMonth() + 1);
    const renewalString = renewalDate.toISOString().split('T')[0];

    const trainerPayload = {
      email: trainerEmail,
      password: trainerPassword,
      name: trainerName,
      role: UserRole.TRAINER,
      trainerDiscipline,
      location: trainerLocation,
      freelanceStatus: trainerType === 'Freelance Trainer' ? 'Freelance' : 'Boutique Studio',
      price: trainerDiscipline.toLowerCase().includes('yoga') ? 110 : 130, // dynamic base price
      // subscription and verification params
      selected_plan: selectedPlanName,
      trainee_limit: selectedLimit,
      subscription_price: selectedPrice,
      subscription_status: 'Active',
      subscription_start_date: todayDate,
      subscription_renewal_date: renewalString,
      verification_status: 'Pending Verification',
      phone_number: trainerPhone,
      bio: trainerBio,
      experience_years: Number(trainerExperience) || 1,
      certification_name: certFileName || 'Verified-Fitness-Cert.pdf',
      identity_name: idFileName || 'MYKAD-Scan.jpg'
    };

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('Starting Supabase Trainer signup for:', trainerEmail);
        // Create user in Auth
        const { data, error } = await supabase.auth.signUp({
          email: trainerEmail,
          password: trainerPassword,
          options: {
            data: { name: trainerName, role: UserRole.TRAINER }
          }
        });

        console.log('SUPABASE SIGNUP DATA:', data);
        console.log('SUPABASE SIGNUP ERROR:', error);

        if (error) {
          console.error('Supabase Auth SignUp Error:', error);
          throw error;
        }

        if (data?.user) {
          const authUserId = data.user.id;
          console.log('Signup auth success');

          // 1. Create Profile
          const { error: pErr } = await supabase.from('profiles').insert({
            id: authUserId,
            email: trainerEmail,
            role: 'trainer', // Lowercase to pass check constraint
            name: trainerName,
            avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
          });

          if (pErr) {
            console.error('Supabase Profile Insert Error:', pErr);
            throw new Error(`Profile creation failed: ${pErr.message}`);
          }
          console.log('Profile insert success');

          // 2. Create Trainer Profile
          const { error: tErr } = await supabase.from('trainer_profiles').insert({
            id: authUserId,
            discipline: trainerDiscipline,
            experience_years: Number(trainerExperience),
            location: trainerLocation,
            freelance_status: trainerType,
            price_per_hour: trainerDiscipline.toLowerCase().includes('yoga') ? 110 : 130,
            bio: trainerBio,
            selected_plan: selectedPlanName,
            trainee_limit: selectedLimit,
            subscription_price: selectedPrice,
            subscription_status: 'Active',
            subscription_start_date: todayDate,
            subscription_renewal_date: renewalString,
            verification_status: 'Pending Verification',
            certificates: [certFileName || 'Fitness License PDF'],
            id_proof_url: idFileName || 'Identification scan',
            phone_number: trainerPhone
          });

          if (tErr) {
            console.error('Supabase Trainer Profile Insert Error:', tErr);
            throw new Error(`Trainer profile creation failed: ${tErr.message}`);
          }

          // Also write to 'trainers' table so core legacy find-coach searches keep running cleanly!
          const { error: trLegacyErr } = await supabase.from('trainers').insert({
            id: `tr_${authUserId.substring(0, 10)}`,
            userId: authUserId,
            name: trainerName,
            discipline: trainerDiscipline,
            experience_years: Number(trainerExperience),
            location: trainerLocation,
            lat: 3.078 + Math.random() * 0.05,
            lng: 101.59 + Math.random() * 0.05,
            freelance_status: trainerType === 'Freelance Trainer' ? 'Freelance' : 'Boutique Studio',
            price_per_hour: trainerDiscipline.toLowerCase().includes('yoga') ? 110 : 130,
            bio: trainerBio,
            rating: 5.0,
            verified: false, // Pending state
            certificates: [certFileName || 'Fitness Certificate'],
            avatar_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
          });

          if (trLegacyErr) {
            console.error('Supabase Legacy Trainers Insert Error:', trLegacyErr);
          }

          onAuthSuccess({
            id: authUserId,
            email: trainerEmail,
            role: UserRole.TRAINER,
            name: trainerName,
            avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
          });

          setIsSubmitting(false);
          return;
        }
      } else {
        throw new Error('Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
      }
    } catch (e: any) {
      console.error('Trainer signup error:', e);
      if (e.message?.toLowerCase().includes('rate limit') || e.message?.toLowerCase().includes('rate_limit')) {
        setSignupError('Supabase SignUp Error: Email Rate Limit Exceeded. By default, Supabase limits sign-ups to 3 per hour per IP. To resolve this, go to your Supabase Dashboard -> Auth -> Rate Limits and disable/increase the registration rate limits, or try log-in if your user is already created.');
      } else {
        setSignupError(e.message || 'Trainer profile creation failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trainee Direct Registration
  const handleTraineeSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSignupError('');

    if (!traineeName || !traineeEmail || !traineePassword || !traineePhone || !traineeLocation || !traineeGoal || !traineeWorkoutType || !traineeLevel) {
      setSignupError('Please fill out all the onboarding registration fields.');
      setIsSubmitting(false);
      return;
    }

    const isLive = isLiveMode;
    if (!isLive) {
      setTimeout(() => {
        onAuthSuccess({
          id: `u_te_${Math.random().toString(36).substring(2, 7)}`,
          email: traineeEmail,
          role: UserRole.TRAINEE,
          name: traineeName,
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
        });
        setIsSubmitting(false);
      }, 500);
      return;
    }

    const traineePayload = {
      email: traineeEmail,
      password: traineePassword,
      name: traineeName,
      role: UserRole.TRAINEE,
      location: traineeLocation,
      phone_number: traineePhone,
      // fitness specifications
      fitness_goal: traineeGoal,
      preferred_workout_type: traineeWorkoutType,
      current_fitness_level: traineeLevel
    };

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('Starting Supabase Trainee signup for:', traineeEmail);
        // Create auth user
        const { data, error } = await supabase.auth.signUp({
          email: traineeEmail,
          password: traineePassword,
          options: {
            data: { name: traineeName, role: UserRole.TRAINEE }
          }
        });

        console.log('SUPABASE SIGNUP DATA:', data);
        console.log('SUPABASE SIGNUP ERROR:', error);

        if (error) {
          console.error('Supabase Auth SignUp Error:', error);
          throw error;
        }

        if (data?.user) {
          const authUserId = data.user.id;
          console.log('Signup auth success');

          // 1. Create Profile
          const { error: pErr } = await supabase.from('profiles').insert({
            id: authUserId,
            email: traineeEmail,
            role: 'trainee', // Lowercase to pass check constraint
            name: traineeName,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
          });

          if (pErr) {
            console.error('Supabase Profile Insert Error:', pErr);
            throw new Error(`Profile creation failed: ${pErr.message}`);
          }
          console.log('Profile insert success');

          // 2. Create Trainee Profile
          const { error: teErr } = await supabase.from('trainee_profiles').insert({
            id: authUserId,
            phone_number: traineePhone,
            location: traineeLocation,
            fitness_goal: traineeGoal,
            preferred_workout_type: traineeWorkoutType,
            current_fitness_level: traineeLevel
          });

          if (teErr) {
            console.error('Supabase Trainee Profile Insert Error:', teErr);
            throw new Error(`Trainee profile creation failed: ${teErr.message}`);
          }

          // Also write to legacy 'trainees' so search and chat works
          const { error: legacyTeErr } = await supabase.from('trainees').insert({
            id: `te_${authUserId.substring(0, 10)}`,
            userId: authUserId,
            name: traineeName,
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
            age: 25,
            weight: 70,
            height: 170,
            goals: traineeGoal,
            streak_count: 0
          });

          if (legacyTeErr) {
            console.error('Supabase Legacy Trainees Insert Error:', legacyTeErr);
          }

          onAuthSuccess({
            id: authUserId,
            email: traineeEmail,
            role: UserRole.TRAINEE,
            name: traineeName,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
          });

          setIsSubmitting(false);
          return;
        }
      } else {
        throw new Error('Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.');
      }
    } catch (e: any) {
      console.error('Trainee signup error:', e);
      if (e.message?.toLowerCase().includes('rate limit') || e.message?.toLowerCase().includes('rate_limit')) {
        setSignupError('Supabase SignUp Error: Email Rate Limit Exceeded. By default, Supabase limits sign-ups to 3 per hour per IP. To resolve this, go to your Supabase Dashboard -> Auth -> Rate Limits and disable/increase the registration rate limits, or try log-in if your user is already created.');
      } else {
        setSignupError(e.message || 'Trainee profile creation failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
      
      {/* Brand Header block */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-3 mb-3">
          <img 
            alt="COACHTRACK MY Logo" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDETvXZjCP6SyPdhxA5LBJxWToef2-2QRTWXAAcbAR1pYCPBQvSJ3JfenXj6iDZVITmo5sPVkUUbY6CFwY_JmfWywrTQ6vMQ17bJvlNGH4dBCAJBZQAbpTyqrM4kh0PaRdmjdFW5e_ga3qBpyVr_yuIpHJ3_B6g5G116iBOCQhZkDgjAZt18i5v1T48bkwzj8qwRAN4PQidoeK2dCT4jg0emt8ViDZeIiKE--IH9uddRKJNsZ2f0AOkUxqqnvBN0WOSIFHezK-Aw6s" 
            className="h-14 w-14 object-contain bg-transparent"
          />
          <div>
            <h2 className="text-3xl font-black tracking-tight leading-none text-[#001F3F]">
              COACH<span className="text-teal-500">TRACK MY</span>
            </h2>
            <p className="text-[9px] uppercase tracking-[0.25em] font-medium text-slate-500 mt-1">
              Track • Improve • Achieve
            </p>
          </div>
        </div>
      </div>

      {/* Main Switcher Card */}
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-150 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Aspect: Brand welcome message */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#001F3F] via-[#052b54] to-teal-900 text-white p-8 md:p-10 flex flex-col justify-between relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
          
          <div className="space-y-6 relative z-10">
            <span className="bg-teal-500/10 text-teal-300 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider border border-teal-500/20 inline-block">
              Premium Coach Suite
            </span>
            <h3 className="font-display font-light text-3xl tracking-tight text-slate-50">
              Transform Your <br />
              <strong className="font-extrabold text-teal-400">Fitness Connection.</strong>
            </h3>
            
            <p className="text-slate-300 text-xs leading-relaxed">
              CoachTrack MY empowers Malaysian training professionals to organize schedules, invoice seamlessly, and design targeted regimes with absolute cloud verification.
            </p>
          </div>

          <div className="mt-12 space-y-4 pt-6 border-t border-white/10 relative z-10 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck className="w-4.5 h-4.5 text-teal-400 shrink-0" />
              <span>Full Supabase Database Sync</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4.5 h-4.5 text-teal-400 shrink-0" />
              <span>Official SST Billing Statements</span>
            </div>
          </div>

          {/* Connected state indicators */}
          <div className="mt-8 bg-slate-900/50 border border-teal-500/20 rounded-2xl p-4 relative z-10 font-mono text-left">
            {isSupabaseConfigured ? (
              <div className="space-y-2">
                <div className="text-emerald-400 font-extrabold text-xs flex items-center gap-2">
                  <span>🟢 SUPABASE CLOUD CONNECTED</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <p><span className="text-slate-500">Project:</span> CoachTrack</p>
                  <p><span className="text-slate-500">Authentication:</span> Active</p>
                  <p><span className="text-slate-500">Database:</span> Connected</p>
                  <p><span className="text-slate-500">Storage:</span> Connected</p>
                  <p><span className="text-slate-500 font-bold">Realtime:</span> Connected</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-rose-400 font-extrabold text-xs flex items-center gap-2">
                  <span>🔴 SUPABASE NOT KEYED IN</span>
                </div>
                <div className="text-[10px] text-slate-300 leading-normal font-sans space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-rose-500/10">
                  <p className="font-semibold text-amber-300 uppercase tracking-wider text-[9px]">How to configure on Netlify:</p>
                  <p>1. Go to your <span className="font-semibold text-white">Netlify Dashboard</span> &rarr; Site configuration &rarr; <span className="font-semibold text-white">Environment variables</span>.</p>
                  <p>2. Define two keys:</p>
                  <div className="bg-slate-950 p-1.5 rounded text-[9px] font-mono select-all text-teal-300 space-y-0.5 border border-slate-900 leading-tight">
                    <p>VITE_SUPABASE_URL</p>
                    <p>VITE_SUPABASE_ANON_KEY</p>
                  </div>
                  <p>3. Go to <span className="font-semibold text-white">Deploys</span> &rarr; Trigger deploy &rarr; <span className="font-semibold text-white">Clear cache and deploy site</span>.</p>
                  <p className="text-teal-400 font-bold block pt-1 border-t border-slate-800 tracking-wide">🟢 DEMO SANDBOX MODE ACTIVE OFFLINE FOR ALL FEATURES</p>
                </div>
              </div>
            )}
          </div>

          {/* Test Supabase Auth Diagnostic system */}
          <div className="mt-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 relative z-10 font-mono text-left space-y-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-1">
              🛠️ AUTH TESTING DIAGNOSTIC
            </span>
            <button
              onClick={handleDiagnosticTest}
              disabled={testStatus === 'testing'}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Supabase Auth'}
            </button>
            
            {testStatus !== 'idle' && (
              <div className={`p-2.5 rounded-lg text-[10px] font-mono whitespace-pre-wrap border ${
                testStatus === 'success' 
                  ? 'bg-emerald-950/20 text-emerald-300 border-emerald-550/30' 
                  : testStatus === 'failed'
                  ? 'bg-rose-950/20 text-rose-300 border-rose-550/30'
                  : 'bg-slate-800/80 text-blue-300 border-slate-700'
              }`}>
                {testStatus === 'testing' && 'Executing supabase.auth.signUp() with dummy address...'}
                {testResult}
              </div>
            )}
          </div>

          {/* SQL Sandbox Utilities (Only shown in Backup/Demo Mode) */}
          {!isLiveMode && (
            <div className="mt-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 relative z-10 font-mono text-left space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-teal-400 block mb-1">
                ⚙️ DEMO BACKUP UTILITIES
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={onResetLocalDb}
                  className="w-full bg-slate-800 hover:bg-slate-700 hover:text-rose-450 text-slate-300 text-[10px] font-bold uppercase tracking-wider py-2 px-3 rounded-lg border border-slate-700 transition-all cursor-pointer text-center font-mono"
                >
                  Reset Local DB
                </button>
                <button
                  type="button"
                  onClick={onSetupSupabaseDb}
                  className="w-full bg-slate-800 hover:bg-slate-700 hover:text-indigo-400 text-slate-300 text-[10px] font-bold uppercase tracking-wider py-2 px-3 rounded-lg border border-slate-700 transition-all cursor-pointer text-center font-mono"
                >
                  Setup Supabase Database
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Aspect: Auth Forms */}
        <div className="md:w-7/12 p-8 md:p-10 text-left bg-white">
          
          {/* Small non-intrusive toggle */}
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between font-sans">
            <span className="text-[10px] lg:text-xs font-extrabold text-slate-400 uppercase tracking-wider block shrink-0">
              Environment Setup:
            </span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onToggleLiveMode(true)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  isLiveMode 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Live Mode
              </button>
              <button
                type="button"
                onClick={() => onToggleLiveMode(false)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  !isLiveMode 
                    ? 'bg-teal-500 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Demo Backup
              </button>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setAuthMode('login'); setSignupError(''); setLoginError(''); }}
              className={`flex-1 text-center py-2.5 text-xs font-bold' uppercase tracking-wider rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white text-[#001F3F] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Portal Login
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setSelectedRole(null); setSignupStep(1); setSignupError(''); setLoginError(''); }}
              className={`flex-1 text-center py-2.5 text-xs font-bold' uppercase tracking-wider rounded-lg transition-all ${
                authMode === 'signup'
                  ? 'bg-white text-[#001F3F] shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ==================================================== */}
          {/* LOGIN VIEW */}
          {/* ==================================================== */}
          {authMode === 'login' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-display font-extrabold text-2xl text-[#001F3F] mb-1">Welcome Back</h4>
                <p className="text-xs text-slate-500">Sign in to track progress, access billing sheets and assign workouts.</p>
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 font-medium">
                  <Info className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black @theme text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="example@coachtrack.my"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-black @theme text-slate-400 uppercase tracking-widest">Password</label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Verification token has been dispatched via simulated SMTP. Please check sandbox log."); }} className="text-[10px] text-teal-600 font-bold hover:underline">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLogginIn}
                  className="w-full bg-[#001F3F] hover:bg-[#052b54] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-6 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLogginIn ? 'Authenticating Profile...' : 'Sign In to Dashboard'}
                  <ArrowRight className="w-4 h-4 text-teal-400" />
                </button>
              </form>

              <div className="text-center pt-6 border-t border-slate-100 mt-8">
                <span className="text-xs text-slate-500 font-medium font-sans">New to CoachTrack MY? </span>
                <button 
                  onClick={() => { setAuthMode('signup'); setSelectedRole(null); }}
                  className="text-xs font-bold text-teal-600 hover:underline"
                >
                  Create an account now
                </button>
              </div>

              {/* Demo Login Cards helper */}
              {!isLiveMode && (
                <div className="pt-6 border-t border-slate-100 mt-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-teal-600 block mb-3 font-mono">
                    💡 Active Sandbox Demo Accounts
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Coach Tan Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('trainer@demo.my');
                        setLoginPassword('demo1234');
                        onAuthSuccess({
                          id: 'u_sarah',
                          email: 'trainer@demo.my',
                          role: UserRole.TRAINER,
                          name: 'Sarah Tan',
                          avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY'
                        });
                      }}
                      className="flex text-left items-center gap-3 p-3 bg-indigo-50/50 hover:bg-[#001f3f]/5 border border-slate-200 hover:border-teal-500 rounded-xl transition-all cursor-pointer group"
                    >
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY"
                        className="w-10 h-10 rounded-full border border-indigo-200 object-cover shrink-0"
                        alt="Coach Sarah"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-teal-600 transition-colors font-sans">Sarah Tan (Trainer)</span>
                        <span className="text-[9px] text-slate-500 block truncate font-sans">discipline: Yoga & Pilates</span>
                        <span className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 font-sans">SS15 • 1-Click Login</span>
                      </div>
                    </button>

                    {/* Trainee bin Ibrahim Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail('trainee@demo.my');
                        setLoginPassword('demo1234');
                        onAuthSuccess({
                          id: 'u_ahmad',
                          email: 'trainee@demo.my',
                          role: UserRole.TRAINEE,
                          name: 'Ahmad bin Ibrahim',
                          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
                        });
                      }}
                      className="flex text-left items-center gap-3 p-3 bg-teal-50/50 hover:bg-[#001f3f]/5 border border-slate-200 hover:border-teal-500 rounded-xl transition-all cursor-pointer group"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                        className="w-10 h-10 rounded-full border border-teal-200 object-cover shrink-0"
                        alt="Ahmad Ibrahim"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-bold text-slate-800 block truncate group-hover:text-teal-600 transition-colors font-sans">Ahmad bin Ibrahim (Trainee)</span>
                        <span className="text-[9px] text-slate-500 block truncate font-sans">Goal: Cardio & Fat Loss</span>
                        <span className="text-[8px] bg-teal-100 text-teal-700 font-bold px-1.5 py-0.5 rounded inline-block mt-0.5 font-sans">SS15 • 1-Click Login</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* SIGNUP VIEW */}
          {/* ==================================================== */}
          {authMode === 'signup' && (
            <div className="space-y-6">
              
              {/* Profile Selection block */}
              {selectedRole === null && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h4 className="font-display font-extrabold text-2xl text-[#001F3F] mb-1">Create Your Account</h4>
                    <p className="text-xs text-slate-500">Choose your targeted role to load the correct workspace profile configuration.</p>
                  </div>

                  <p className="text-sm font-semibold text-slate-700 text-center py-2">
                    "I am signing up as a..."
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trainee Card */}
                    <button
                      onClick={() => setSelectedRole(UserRole.TRAINEE)}
                      className="border border-slate-200 hover:border-teal-500 rounded-2xl p-6 text-left hover:shadow-lg transition group relative overflow-hidden bg-white hover:bg-slate-50/50 cursor-pointer"
                    >
                      <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/5 rounded-full -mr-8 -mt-8 transition group-hover:bg-teal-500/10"></div>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-4 transition group-hover:scale-110">
                        <User className="w-5 h-5" />
                      </div>
                      <h5 className="font-display font-black text-slate-950 text-base mb-1">Trainee / Client</h5>
                      <p className="text-xs text-slate-500 leading-normal">
                        Book verified coaches near Petaling Jaya/Subang, track local diet records, and log weights.
                      </p>
                      
                      <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-teal-600 opacity-60 group-hover:opacity-100 transition-all">
                        <span>Setup Trainee Form</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>

                    {/* Trainer Card */}
                    <button
                      onClick={() => { setSelectedRole(UserRole.TRAINER); setSignupStep(1); }}
                      className="border border-slate-200 hover:border-indigo-505 rounded-2xl p-6 text-left hover:shadow-lg transition group relative overflow-hidden bg-white hover:bg-slate-50/50 cursor-pointer"
                    >
                      <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-8 -mt-8 transition group-hover:bg-indigo-500/10"></div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 transition group-hover:scale-110">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <h5 className="font-display font-black text-slate-950 text-base mb-1">Trainer / Coach</h5>
                      <p className="text-xs text-slate-500 leading-normal">
                        Create customizable class rates, verify certificates, track billing, and automate programs.
                      </p>

                      <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-indigo-600 opacity-60 group-hover:opacity-100 transition-all">
                        <span>Enter Trainer Portal</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </button>
                  </div>

                  <div className="text-center pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-450 font-medium">Already have an account? </span>
                    <button 
                      onClick={() => setAuthMode('login')}
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      Sign in here
                    </button>
                  </div>
                </div>
              )}

              {/* ========================== */}
              {/* TRAINEE SIGNUP FLOW */}
              {/* ========================== */}
              {selectedRole === UserRole.TRAINEE && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedRole(null)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-450 hover:text-slate-700"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="font-display font-extrabold text-xl text-[#001F3F]">Trainee Registration</h4>
                      <p className="text-xs text-slate-500">Quick standalone onboarding. No credit card required.</p>
                    </div>
                  </div>

                  {signupError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 font-medium">
                      <Info className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  <form onSubmit={handleTraineeSignup} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            value={traineeName}
                            onChange={(e) => setTraineeName(e.target.value)}
                            placeholder="Ahmad Ibrahim"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="email"
                            value={traineeEmail}
                            onChange={(e) => setTraineeEmail(e.target.value)}
                            placeholder="ahmad@coachtrack.my"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Security Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="password"
                            value={traineePassword}
                            onChange={(e) => setTraineePassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            value={traineePhone}
                            onChange={(e) => setTraineePhone(e.target.value)}
                            placeholder="+60 12-345 6789"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current City / Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            value={traineeLocation}
                            onChange={(e) => setTraineeLocation(e.target.value)}
                            placeholder="Damansara, PJ"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">My Principal Fitness Goal</label>
                        <input 
                          type="text"
                          value={traineeGoal}
                          onChange={(e) => setTraineeGoal(e.target.value)}
                          placeholder="Fat Loss & 10km preparation"
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Preferred Workout Style</label>
                        <select 
                          value={traineeWorkoutType}
                          onChange={(e) => setTraineeWorkoutType(e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        >
                          <option value="HIIT Weightloss">HIIT & Calorie Burning</option>
                          <option value="Powerlifting & Bulking">Strength / Powerlifting</option>
                          <option value="Yoga & Posture">Therapeutic Yoga & Pilates</option>
                          <option value="Athletic Speed Conditioning">Sports Speed & Agility</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Fitness Level</label>
                        <div className="flex gap-2 mt-1">
                          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setTraineeLevel(lvl)}
                              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                                traineeLevel === lvl 
                                  ? 'border-teal-600 bg-teal-500/10 text-teal-850 font-black' 
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="py-2 text-[11px] text-slate-500 bg-teal-50/30 rounded-xl p-3 border border-teal-100 flex gap-2 items-start mt-6">
                      <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-teal-900 mb-0.5">Automated Revenue Protections Enabled</p>
                        <p>Booking fees feature transparent invoices. Bank escrow is completely protected under a 5% commission framework.</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#001F3F] to-teal-700 hover:from-teal-800 hover:to-[#001F3F] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 mt-4"
                    >
                      {isSubmitting ? 'Writing Profile Row...' : 'Register as Trainee'}
                      <ArrowRight className="w-4 h-4 text-teal-400" />
                    </button>
                  </form>
                </div>
              )}

              {/* ========================== */}
              {/* TRAINER SIGNUP FLOW STEPPER */}
              {/* ========================== */}
              {selectedRole === UserRole.TRAINER && (
                <div className="space-y-6">
                  
                  {/* Stepper Header indicator */}
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => signupStep === 1 ? setSelectedRole(null) : prevTrainerStep()}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="font-display font-extrabold text-lg text-[#001F3F]">Trainer Registration</h4>
                        <p className="text-xs text-slate-400">Step {signupStep} of 4: {
                          signupStep === 1 ? 'Credential Info' :
                          signupStep === 2 ? 'Professional Background' :
                          signupStep === 3 ? 'License Verification' : 'Choose Package Plan'
                        }</p>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map(idx => (
                        <span 
                          key={idx}
                          className={`w-4 h-1.5 rounded-full transition-all duration-300 ${
                            idx === signupStep ? 'w-8 bg-teal-500' : idx < signupStep ? 'bg-indigo-900' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {signupError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-1.5 font-medium">
                      <Info className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  {/* STEP 1: BASIC INFORMATION */}
                  {signupStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Professional Name</label>
                          <div className="relative font-semibold">
                            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input 
                              type="text"
                              value={trainerName}
                              onChange={(e) => setTrainerName(e.target.value)}
                              placeholder="Coach Sarah Tan"
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Professional Email</label>
                          <div className="relative font-semibold">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input 
                              type="email"
                              value={trainerEmail}
                              onChange={(e) => setTrainerEmail(e.target.value)}
                              placeholder="sarah.tan@coachtrack.my"
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Portal Password</label>
                          <div className="relative font-semibold">
                            <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input 
                              type="password"
                              value={trainerPassword}
                              onChange={(e) => setTrainerPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mobile Phone Number</label>
                          <div className="relative font-semibold">
                            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                            <input 
                              type="text"
                              value={trainerPhone}
                              onChange={(e) => setTrainerPhone(e.target.value)}
                              placeholder="+60 12-444 8888"
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Operation Location / City</label>
                        <div className="relative font-semibold">
                          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            value={trainerLocation}
                            onChange={(e) => setTrainerLocation(e.target.value)}
                            placeholder="SS15, Subang Jaya"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={nextTrainerStep}
                        className="w-full bg-[#001F3F] hover:bg-[#052b54] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 mt-6"
                      >
                        <span>Proceed to Details</span>
                        <ArrowRight className="w-4 h-4 text-teal-400" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: PROFESSIONAL DETAIL */}
                  {signupStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fitness Discipline / Sport</label>
                          <input 
                            type="text"
                            value={trainerDiscipline}
                            onChange={(e) => setTrainerDiscipline(e.target.value)}
                            placeholder="Powerlifting Instructor / Yoga & Posture"
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Years of Active Coaching</label>
                          <input 
                            type="number"
                            min="1"
                            value={trainerExperience}
                            onChange={(e) => setTrainerExperience(e.target.value)}
                            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Trainer Association Category</label>
                          <div className="flex gap-2 mt-1">
                            {['Freelance Trainer', 'Under Gym / Studio'].map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setTrainerType(type as any)}
                                className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition ${
                                  trainerType === type 
                                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-extrabold shadow-sm' 
                                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        {trainerType === 'Under Gym / Studio' && (
                          <div className="animate-fade-in">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Gym / Affiliated Studio Name</label>
                            <input 
                              type="text"
                              value={trainerGymName}
                              onChange={(e) => setTrainerGymName(e.target.value)}
                              placeholder="Chi Fitness / Anytime Fitness"
                              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                              required
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Short Bio / Coaching Motto</label>
                        <textarea
                          rows={3}
                          value={trainerBio}
                          onChange={(e) => setTrainerBio(e.target.value)}
                          placeholder="Experienced instructor oriented toward muscle sculpting, correct spinal positioning during workouts, and supportive lifestyle goals near Subang and Sunway."
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                          required
                        />
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={prevTrainerStep}
                          className="flex-1 border border-slate-250 hover:bg-slate-50 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider text-slate-600 text-center"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={nextTrainerStep}
                          className="flex-1 bg-[#001F3F] hover:bg-[#052b54] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <span>Verification Uploads</span>
                          <ArrowRight className="w-4 h-4 text-teal-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: VERIFICATION UPLOADS */}
                  {signupStep === 3 && (
                    <div className="space-y-5">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-900 text-xs flex gap-2 items-start leading-normal">
                        <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          <p className="font-extrabold">Professional Credentials Required</p>
                          <p>All listings require background clearance before search indexes near users can retrieve your profile. Account will register in <strong>Pending Verification</strong> status.</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Cert field */}
                        <div className="border border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-5 bg-slate-50/40 text-center relative transition">
                          <input 
                            type="file"
                            accept=".pdf,image/*"
                            id="cert-input"
                            onChange={handleCertSimulate}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                          <h6 className="text-xs font-bold text-slate-800">1. Fitness License / Certificate</h6>
                          <p className="text-[10px] text-slate-400 mt-0.5">Drag & drop or Click to choose (PDF, PNG or JPG max 4MB)</p>
                          
                          {certFileName ? (
                            <div className="mt-3 bg-teal-100 border border-teal-200 text-teal-900 text-[10px] font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span>{isCertUploading ? 'Uploading credentials...' : certFileName}</span>
                            </div>
                          ) : null}
                        </div>

                        {/* ID proof field */}
                        <div className="border border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-5 bg-slate-50/40 text-center relative transition">
                          <input 
                            type="file"
                            accept=".pdf,image/*"
                            id="id-proof-input"
                            onChange={handleIdSimulate}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                          <h6 className="text-xs font-bold text-slate-800">2. Identification Document Proof</h6>
                          <p className="text-[10px] text-slate-400 mt-0.5">Provide front MyKad scan or valid passport document</p>
                          
                          {idFileName ? (
                            <div className="mt-3 bg-teal-100 border border-teal-200 text-teal-900 text-[10px] font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                              <span>{isIdUploading ? 'Uploading ID copy...' : idFileName}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={prevTrainerStep}
                          className="flex-1 border border-slate-250 hover:bg-slate-50 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider text-slate-600 text-center"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={nextTrainerStep}
                          className="flex-1 bg-[#001F3F] hover:bg-[#052b54] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 animate-pulse"
                        >
                          <span>Select Plan Package</span>
                          <ArrowRight className="w-4 h-4 text-teal-400" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: PACKAGE SELECTION */}
                  {signupStep === 4 && (
                    <div className="space-y-6">
                      <div className="text-center max-w-md mx-auto mb-4">
                        <p className="text-xs text-indigo-600 uppercase font-black tracking-widest bg-indigo-50 px-2 py-0.5 rounded inline-block">Choose Trainer subscription package</p>
                        <h5 className="font-display font-black text-slate-900 text-lg leading-tight mt-1">Activate Your Workspace Stream</h5>
                        <p className="text-xs text-slate-450 mt-1">Pricing tiers map specifically to max client tracking capacity.</p>
                      </div>

                      {/* Packages container */}
                      <div className="grid grid-cols-1 gap-4">
                        
                        {/* 1. Starter */}
                        <div 
                          onClick={() => setSelectedPlanId('starter')}
                          className={`relative border rounded-2xl p-4 cursor-pointer hover:border-teal-500 transition-all ${
                            selectedPlanId === 'starter' ? 'bg-[#001F3F]/5 border-2 border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Freelancers Level</span>
                              <h6 className="font-display font-black text-slate-950 text-sm mt-1">Starter Trainer Plan</h6>
                            </div>
                            <div className="text-right">
                              <span className="font-display font-black text-[#001F3F] text-lg">RM 29</span>
                              <span className="text-[10px] text-slate-400 font-bold block">/ month</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Simulate managing <strong className="text-[#001F3F]">up to 5 trainees</strong> with essential progress logs.</p>
                        </div>

                        {/* 2. Growth (RECOMMENDED) */}
                        <div 
                          onClick={() => setSelectedPlanId('growth')}
                          className={`relative border rounded-2xl p-5 cursor-pointer hover:border-teal-500 transition-all ${
                            selectedPlanId === 'growth' ? 'bg-[#001F3F]/5 border-2 border-[#001F3F] ring-4 ring-teal-500/15' : 'border-slate-200'
                          }`}
                        >
                          <div className="absolute right-4 top-0 transform -translate-y-1/2 bg-gradient-to-r from-teal-600 to-indigo-650 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded inline-block tracking-wider shadow-sm mr-2">
                            ⭐ recommended
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">Active Personal Trainers</span>
                              <h6 className="font-display font-black text-slate-950 text-sm mt-1">Growth Trainer Plan</h6>
                            </div>
                            <div className="text-right">
                              <span className="font-display font-black text-[#001F3F] text-lg">RM 59</span>
                              <span className="text-[10px] text-slate-400 font-bold block">/ month</span>
                            </div>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 mt-2">Simulate coaching <strong className="text-[#001F3F]">up to 20 trainees</strong>. Includes interactive calendar schedules, photo comparator & AI coach builder tools.</p>
                        </div>

                        {/* 3. Pro */}
                        <div 
                          onClick={() => setSelectedPlanId('pro')}
                          className={`relative border rounded-2xl p-4 cursor-pointer hover:border-teal-500 transition-all ${
                            selectedPlanId === 'pro' ? 'bg-[#001F3F]/5 border-2 border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Established Studios</span>
                              <h6 className="font-display font-black text-slate-950 text-sm mt-1">Pro Trainer Plan</h6>
                            </div>
                            <div className="text-right">
                              <span className="font-display font-black text-[#001F3F] text-lg">RM 99</span>
                              <span className="text-[10px] text-slate-400 font-bold block">/ month</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Simulate coaching <strong className="text-[#001F3F]">up to 50 trainees</strong>. Full revenue dashboards, priority bookings & detailed PDF report export keys.</p>
                        </div>

                      </div>

                      {/* Pricing list features for comparing */}
                      <div className="bg-slate-50 rounded-2xl p-3.5 text-[11px] text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1.5 border border-slate-150">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Assign customized workouts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Local Malaysian diet database</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Pending Clearance upload status</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>5% Escrow Commission Model</span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={prevTrainerStep}
                          className="flex-1 border border-slate-250 hover:bg-slate-50 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider text-slate-600 text-center"
                        >
                          Back
                        </button>
                        
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => completeTrainerSignup(selectedPlanId)}
                          className="flex-1 bg-gradient-to-r from-teal-500 to-[#001F3F] hover:from-teal-600 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                        >
                          {isSubmitting ? 'Simulating DB record...' : 'Select Plan & Finish'}
                          <Check className="w-4 h-4 text-teal-400 font-bold" />
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
