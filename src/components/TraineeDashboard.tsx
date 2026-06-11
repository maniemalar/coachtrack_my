import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Utensils, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Calendar, 
  Flame, 
  TrendingUp, 
  Clipboard, 
  ArrowRight,
  User,
  Heart,
  Search,
  MessageCircle
} from 'lucide-react';
import { MalaysianFoodItem, NutritionLog, WorkoutLog, BookingSession, TrainerProfile, TraineeProfile, PrescribedWorkout } from '../types';
import { dbService } from '../lib/dbService';

interface TraineeDashboardProps {
  traineeUserId: string;
  onNavigateToTab: (tab: string) => void;
}

const MALAYSIAN_FOODS: MalaysianFoodItem[] = [
  { name: 'Nasi Lemak Biasa (with egg)', calories: 650, protein: 15, carbs: 80, fat: 25, servingSize: '1 plate', category: 'Rice' },
  { name: 'Roti Canai (plain, 1 piece)', calories: 300, protein: 6, carbs: 45, fat: 10, servingSize: '1 piece', category: 'Bread' },
  { name: 'Teh Tarik (pulled tea)', calories: 140, protein: 2, carbs: 22, fat: 4, servingSize: '1 glass', category: 'Beverages' },
  { name: 'Laksa Sarawak', calories: 450, protein: 18, carbs: 55, fat: 18, servingSize: '1 bowl', category: 'Noodle' },
  { name: 'Hainanese Chicken Rice', calories: 600, protein: 28, carbs: 70, fat: 22, servingSize: '1 plate', category: 'Rice' },
  { name: 'Nasi Kandar (with chicken & cabbage)', calories: 800, protein: 35, carbs: 95, fat: 30, servingSize: '1 plate', category: 'Rice' },
  { name: 'Mee Goreng Mamak', calories: 660, protein: 18, carbs: 85, fat: 25, servingSize: '1 plate', category: 'Noodle' },
  { name: 'Char Kway Teow', calories: 740, protein: 20, carbs: 90, fat: 32, servingSize: '1 plate', category: 'Noodle' },
  { name: 'Satay Chicken (5 sticks + peanut sauce)', calories: 360, protein: 22, carbs: 15, fat: 20, servingSize: '1 serving', category: 'Snacks' },
  { name: 'Tosai Plain', calories: 200, protein: 4, carbs: 38, fat: 3, servingSize: '1 piece', category: 'Bread' }
];

export default function TraineeDashboard({ traineeUserId, onNavigateToTab }: TraineeDashboardProps) {
  const [traineeMeta, setTraineeMeta] = useState<TraineeProfile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [nutrition, setNutrition] = useState<NutritionLog[]>([]);
  const [bookings, setBookings] = useState<BookingSession[]>([]);
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  
  // Prescribed Workouts state
  const [prescribedWorkouts, setPrescribedWorkouts] = useState<PrescribedWorkout[]>([]);
  const [checkingInWorkout, setCheckingInWorkout] = useState<PrescribedWorkout | null>(null);
  const [checkInNotes, setCheckInNotes] = useState('');

  // Form states: Workout
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [workoutType, setWorkoutType] = useState('Strength');
  const [workoutDuration, setWorkoutDuration] = useState(45);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<{ name: string; sets: number; reps: number; weight: number }[]>([
    { name: '', sets: 3, reps: 10, weight: 10 }
  ]);

  // Form states: Nutrition
  const [showNutritionForm, setShowNutritionForm] = useState(false);
  const [selectedFoodIndex, setSelectedFoodIndex] = useState(-1);
  const [customFoodName, setCustomFoodName] = useState('');
  const [customCalories, setCustomCalories] = useState(300);
  const [customProtein, setCustomProtein] = useState(15);
  const [customCarbs, setCustomCarbs] = useState(40);
  const [customFat, setCustomFat] = useState(8);
  const [nutritionNotes, setNutritionNotes] = useState('');

  // AI states
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [aiNutritionResult, setAiNutritionResult] = useState<any | null>(null);

  const loadingMessages = [
    "Analyzing your physique goals...",
    "Querying the CoachTrack MY local database...",
    "Gemini model formulating standard Malaysian calorie adjustments...",
    "Structuring certified trainers guidelines...",
    "Almost ready to execute!"
  ];

  useEffect(() => {
    fetchTraineeData();
  }, [traineeUserId]);

  const fetchTraineeData = async () => {
    try {
      const dataProfile = await dbService.getTraineeProfile(traineeUserId);
      if (!dataProfile) return;
      setTraineeMeta(dataProfile);

      const dataWorkouts = await dbService.getWorkouts({ traineeId: dataProfile.id });
      setWorkouts(dataWorkouts);

      const dataNutrition = await dbService.getNutrition(dataProfile.id);
      setNutrition(dataNutrition);

      const dataBk = await dbService.getBookings({ traineeId: dataProfile.id });
      setBookings(dataBk);

      if (dataProfile.assignedTrainerId) {
        const dataTr = await dbService.getTrainerProfile(dataProfile.assignedTrainerId);
        if (dataTr) setTrainer(dataTr);
      }

      // Fetch coach prescribed sessions
      const dataPW = await dbService.getPrescribedWorkouts(dataProfile.id, 'Pending');
      setPrescribedWorkouts(dataPW);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 10 }]);
  };

  const handleUpdateExerciseRow = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traineeMeta) return;

    try {
      const payload = {
        traineeId: traineeMeta.id,
        trainerId: traineeMeta.assignedTrainerId,
        workoutType,
        duration: workoutDuration,
        exercises: exercises.filter(ex => ex.name.trim() !== ''),
        notes: workoutNotes
      };

      const res = await dbService.createWorkoutLog(payload);
      
      if (res) {
        setShowWorkoutForm(false);
        setWorkoutNotes('');
        setExercises([{ name: '', sets: 3, reps: 10, weight: 10 }]);
        fetchTraineeData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNutritionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!traineeMeta) return;

    let foodName = customFoodName;
    let calVal = Number(customCalories);
    let protVal = Number(customProtein);
    let carbVal = Number(customCarbs);
    let fatVal = Number(customFat);

    if (selectedFoodIndex >= 0) {
      const selected = MALAYSIAN_FOODS[selectedFoodIndex];
      foodName = selected.name;
      calVal = selected.calories;
      protVal = selected.protein;
      carbVal = selected.carbs;
      fatVal = selected.fat;
    }

    if (!foodName) return;

    try {
      const payload = {
        traineeId: traineeMeta.id,
        foodName,
        calories: calVal,
        protein: protVal,
        carbs: carbVal,
        fat: fatVal,
        notes: nutritionNotes
      };

      const res = await dbService.createNutritionLog(payload);

      if (res) {
        setShowNutritionForm(false);
        setCustomFoodName('');
        setSelectedFoodIndex(-1);
        setNutritionNotes('');
        fetchTraineeData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkingInWorkout) return;

    try {
      const ok = await dbService.checkInPrescribedWorkout(checkingInWorkout.id);

      if (ok) {
        setCheckingInWorkout(null);
        setCheckInNotes('');
        fetchTraineeData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Launch AI Assistant
  const triggerAIWorkoutRec = async () => {
    if (!traineeMeta) return;
    setLoadingAI(true);
    setAiResult(null);
    setAiMessageIndex(0);

    // Dynamic message switcher to feel incredibly alive & responsive
    const msgTimer = setInterval(() => {
      setAiMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 1500);

    try {
      const res = await fetch('/api/ai/workout-rec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeId: traineeMeta.id })
      });
      const data = await res.json();
      setAiResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(msgTimer);
      setLoadingAI(false);
    }
  };

  const triggerAINutritionAnalysis = async () => {
    if (nutrition.length === 0) {
      alert("No logged meals today to analyze! Please add at least one local meal record first.");
      return;
    }
    setLoadingAI(true);
    setAiNutritionResult(null);
    setAiMessageIndex(0);

    const msgTimer = setInterval(() => {
      setAiMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 1200);

    try {
      const res = await fetch('/api/ai/meal-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: nutrition })
      });
      const data = await res.json();
      setAiNutritionResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(msgTimer);
      setLoadingAI(false);
    }
  };

  // Calculating Daily Calorie Levels
  const totalCaloriesToday = nutrition.reduce((sum, item) => sum + item.calories, 0);
  const totalCarbsToday = nutrition.reduce((sum, item) => sum + item.carbs, 0);
  const totalProteinToday = nutrition.reduce((sum, item) => sum + item.protein, 0);
  const totalFatToday = nutrition.reduce((sum, item) => sum + item.fat, 0);

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Block & Quick Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800">
                Selamat Datang, {traineeMeta?.name || 'Ahmad'}!
              </h2>
            </div>
            <p className="text-slate-500 text-sm">
              Keep moving! View local trainers or log your nasi lemak & training weights below.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-xl">
              <Flame className="w-6 h-6 text-amber-500 animate-bounce" />
              <div className="text-left">
                <span className="block text-xs font-semibold text-amber-800 leading-none">Streak</span>
                <span className="text-lg font-black text-amber-900">{traineeMeta?.streakCount || 0} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <div className="text-left">
                <span className="block text-xs font-semibold text-emerald-800 leading-none">Target Goal</span>
                <span className="text-xs font-bold text-emerald-900 block truncate max-w-[150px]">
                  {traineeMeta?.goals || 'Healthy Life'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Main Grid Columns */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Column 1: Today's Intake & Malaysian Nutrition Logger */}
          <div className="lg:col-span-2 space-y-8">

            {/* Coach-Prescribed Workouts Card */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border border-slate-800 text-left relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
                <Dumbbell className="w-48 h-48 text-teal-400" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-teal-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Assigned Routines
                  </span>
                  <h3 className="font-display font-bold text-lg text-white">Your Coach-Prescribed Workouts</h3>
                </div>
                
                {prescribedWorkouts.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center text-slate-300 text-xs">
                    <p className="font-semibold text-white">All caught up! No pending workouts assigned.</p>
                    <p className="mt-1">You log your workouts by completing what your trainer has assigned. Chat with Sarah Tan to request a customized plan!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prescribedWorkouts.map((pw) => (
                      <div key={pw.id} className="bg-white/10 border border-white/15 hover:bg-white/[0.12] transition rounded-xl p-4 text-left">
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                          <div>
                            <h4 className="font-bold text-white text-base leading-tight">{pw.workoutType}</h4>
                            <p className="text-[10px] text-teal-300 font-semibold mt-0.5">Assigned by: Coach Sarah Tan</p>
                          </div>
                          <span className="bg-teal-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shrink-0">
                            ⏱ {pw.duration} mins
                          </span>
                        </div>

                        {pw.notes && (
                          <div className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-lg mb-3 block border border-white/5">
                            💡 <strong className="text-teal-200">Coach Guidance:</strong> {pw.notes}
                          </div>
                        )}

                        <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-200 mb-4">
                          {pw.exercises.map((ex, i) => (
                            <div key={i} className="bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 flex justify-between">
                              <span>💪 {ex.name}</span>
                              <span className="font-semibold text-teal-300">{ex.sets}s × {ex.reps}r {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}</span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setCheckingInWorkout(pw);
                            setCheckInNotes('');
                          }}
                          className="w-full bg-teal-400 hover:bg-teal-300 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          📋 Check In / Log Completed Session
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Check-In Dialog Modal */}
            {checkingInWorkout && (
              <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100 text-left">
                  <h3 className="font-display font-medium text-lg text-slate-900 mb-1">
                    Check In to Prescribed Session
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Verify you finished this assigned workout. Your stats will live-update, and your coach will be notified.
                  </p>

                  <form onSubmit={handleCheckInSubmit} className="space-y-4">
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-3.5 text-xs text-slate-800">
                      <p className="font-bold text-teal-950 text-sm mb-1">{checkingInWorkout.workoutType}</p>
                      <p className="text-slate-500 mb-2">Prescribed Duration: <strong>{checkingInWorkout.duration} minutes</strong></p>
                      <p className="font-semibold text-slate-700">Target routines completed:</p>
                      <div className="space-y-1.5 mt-2">
                        {checkingInWorkout.exercises.map((ex, idx) => (
                          <div key={idx} className="flex items-center gap-2 font-mono text-slate-650">
                            <span className="text-teal-600 font-bold">✔</span> 
                            <span>{ex.name} ({ex.sets}s × {ex.reps}r {ex.weight > 0 ? `@ ${ex.weight}kg` : ''})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Active Feedback / Posture Notes
                      </label>
                      <textarea
                        value={checkInNotes}
                        onChange={(e) => setCheckInNotes(e.target.value)}
                        placeholder="E.g. Completed all reps! Felt strong in squats, but slight pull in my hamstring..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-teal-500 h-24 text-slate-800"
                        required
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setCheckingInWorkout(null)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                      >
                        Complete Check In
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Logs: Workout Track list */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Training Workouts Logged</h3>
                </div>
                <button
                  id="btn-add-workout"
                  onClick={() => setShowWorkoutForm(!showWorkoutForm)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Log
                </button>
              </div>

              {/* Add Workout Inline Form */}
              {showWorkoutForm && (
                <form onSubmit={handleWorkoutSubmit} className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6 text-left relative">
                  <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
                    <span>🏋️</span> New Workout Session Log
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Discipline / Workout Type
                      </label>
                      <input 
                        type="text" 
                        value={workoutType}
                        onChange={(e) => setWorkoutType(e.target.value)}
                        placeholder="Strength, Core, HIIT, Cardio, Yoga" 
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Duration (Minutes)
                      </label>
                      <input 
                        type="number" 
                        value={workoutDuration}
                        onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-teal-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Exercises dynamic loop */}
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Individual Exercises
                    </label>
                    <div className="space-y-2">
                      {exercises.map((ex, idx) => (
                        <div key={idx} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                          <input 
                            type="text"
                            placeholder="E.g. Bench squat / push press"
                            value={ex.name}
                            onChange={(e) => handleUpdateExerciseRow(idx, 'name', e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-teal-500 flex-1 min-w-[120px]"
                          />
                          <input 
                            type="number"
                            placeholder="Sets"
                            value={ex.sets}
                            title="Sets"
                            onChange={(e) => handleUpdateExerciseRow(idx, 'sets', Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-teal-500 w-16"
                          />
                          <input 
                            type="number"
                            placeholder="Reps"
                            value={ex.reps}
                            title="Reps"
                            onChange={(e) => handleUpdateExerciseRow(idx, 'reps', Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-teal-500 w-16"
                          />
                          <input 
                            type="number"
                            placeholder="Weight (kg)"
                            value={ex.weight}
                            title="Weight (kg)"
                            onChange={(e) => handleUpdateExerciseRow(idx, 'weight', Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-teal-500 w-24"
                          />
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddExerciseRow}
                      className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Exercise Row
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Workout Comments / Posture notes
                    </label>
                    <textarea 
                      value={workoutNotes}
                      onChange={(e) => setWorkoutNotes(e.target.value)}
                      placeholder="E.g. Muscle fatigue, joint tight, felt strong"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-teal-500 h-20"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowWorkoutForm(false)} 
                      className="px-3.5 py-1.5 rounded-lg text-slate-600 text-xs hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
                    >
                      Save Workout Log
                    </button>
                  </div>
                </form>
              )}

              {/* Workouts History listing */}
              {workouts.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-sm">No workout sessions logged yet.</p>
                  <p className="text-xs mt-1">Tap Add Log button above to post your first exercise stats!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workouts.map((w) => (
                    <div key={w.id} className="border border-slate-100 rounded-xl p-4 text-left hover:border-slate-200 transition bg-slate-50/50">
                      <div className="flex justify-between items-start mb-2.5">
                        <div>
                          <span className="inline-block text-[10px] uppercase font-bold text-slate-400 mb-0.5">{w.date}</span>
                          <h4 className="font-bold text-slate-800 text-base">{w.workoutType}</h4>
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                          ⏱ {w.duration} mins
                        </span>
                      </div>

                      {/* Exercises bullets */}
                      <div className="grid sm:grid-cols-2 gap-2 border-t border-slate-100 pt-2.5 mt-2.5 text-xs text-slate-600">
                        {w.exercises.map((ex, i) => (
                          <div key={i} className="flex justify-between items-center bg-white px-2.5 py-1.5 rounded-lg border border-slate-100">
                            <span className="font-medium text-slate-800">{ex.name}</span>
                            <span className="font-mono text-slate-500">
                              {ex.sets}s × {ex.reps}r {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                            </span>
                          </div>
                        ))}
                      </div>

                      {w.notes && (
                        <p className="text-xs italic text-slate-500 mt-2 bg-white p-2 rounded-lg border border-slate-100 pl-3">
                          &ldquo;{w.notes}&rdquo;
                        </p>
                      )}

                      {/* Instructor Response */}
                      {w.trainerFeedback ? (
                        <div className="mt-3 bg-teal-50 border border-teal-100 rounded-lg p-3 text-[11px] text-teal-800 relative">
                          <span className="absolute -top-2 left-4 px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-teal-600 text-white rounded-full">
                            Trainer Feedback Included
                          </span>
                          <p className="font-bold mt-1 mb-0.5">Coach Suggestion:</p>
                          <p className="italic font-medium">&ldquo;{w.trainerFeedback}&rdquo;</p>
                        </div>
                      ) : (
                        <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span>Waiting for Coach feedback on this workout log...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Logs: Malaysian Nutrition Tracker */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900">Today’s Malaysian Nutrition Log</h3>
                </div>
                <button
                  id="btn-add-meal"
                  onClick={() => setShowNutritionForm(!showNutritionForm)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Local Meal
                </button>
              </div>

              {/* Dynamic Macro Balance Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 p-4 rounded-xl mb-6 text-left text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Total Calories</span>
                  <span className="text-lg font-black text-slate-900">{totalCaloriesToday} kcal</span>
                </div>
                <div>
                  <span className="text-teal-600 font-medium block">Protein Intake</span>
                  <span className="text-lg font-black text-slate-900">{totalProteinToday} g</span>
                </div>
                <div>
                  <span className="text-cyan-600 font-medium block">Total Carbs</span>
                  <span className="text-lg font-black text-slate-900">{totalCarbsToday} g</span>
                </div>
                <div>
                  <span className="text-amber-600 font-medium block">Fats Logged</span>
                  <span className="text-lg font-black text-slate-900">{totalFatToday} g</span>
                </div>
              </div>

              {/* Inline Nutrition form with predefined Malaysian Foods */}
              {showNutritionForm && (
                <form onSubmit={handleNutritionSubmit} className="bg-slate-50 border border-slate-100 rounded-xl p-5 mb-6 text-left">
                  <h4 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-1.5">
                    <span>🍛</span> Log Malaysian Food Delicate
                  </h4>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Choose Traditional Dish
                    </label>
                    <select
                      value={selectedFoodIndex}
                      onChange={(e) => setSelectedFoodIndex(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-teal-500"
                    >
                      <option value="-1">-- Or Write Custom Meal Below --</option>
                      {MALAYSIAN_FOODS.map((food, i) => (
                        <option key={i} value={i}>
                          {food.name} ({food.calories}kcal • P:{food.protein}g C:{food.carbs}g)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedFoodIndex === -1 && (
                    <div className="grid sm:grid-cols-5 gap-3 mb-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Food Title
                        </label>
                        <input 
                          type="text" 
                          value={customFoodName}
                          onChange={(e) => setCustomFoodName(e.target.value)}
                          placeholder="E.g. Nasi Kandas, Tosai" 
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Cals
                        </label>
                        <input 
                          type="number" 
                          value={customCalories}
                          onChange={(e) => setCustomCalories(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Prot (g)
                        </label>
                        <input 
                          type="number" 
                          value={customProtein}
                          onChange={(e) => setCustomProtein(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Carbs (g)
                        </label>
                        <input 
                          type="number" 
                          value={customCarbs}
                          onChange={(e) => setCustomCarbs(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-teal-500"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Meal Notes / Adjustments
                    </label>
                    <input 
                      type="text" 
                      value={nutritionNotes}
                      onChange={(e) => setNutritionNotes(e.target.value)}
                      placeholder="E.g. Extra egg, skipped gravy sugar, added sambal"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-teal-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button" 
                      onClick={() => setShowNutritionForm(false)} 
                      className="px-3.5 py-1.5 rounded-lg text-slate-600 text-xs hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
                    >
                      Save Nutrition Log
                    </button>
                  </div>
                </form>
              )}

              {/* Logs history output */}
              {nutrition.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-sm">No meals logged for today yet.</p>
                  <p className="text-xs mt-1">Keep track of your local foods (Nasi Lemak, Teh Tarik, Char Kway Teow, Roti Canai) above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nutrition.map((n) => (
                    <div key={n.id} className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 text-left">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <span className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Logged Dish</span>
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">{n.foodName}</h4>
                        </div>
                        <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg shrink-0">
                          🔥 {n.calories} kcal
                        </span>
                      </div>

                      {/* Macros badges */}
                      <div className="flex gap-3 text-[11px] text-slate-500 font-medium mb-2.5 mt-2">
                        <span className="bg-white border border-slate-100 px-2.5 py-1 rounded-md">Protein: <strong className="text-slate-800 font-bold">{n.protein}g</strong></span>
                        <span className="bg-white border border-slate-100 px-2.5 py-1 rounded-md">Carbs: <strong className="text-slate-800 font-bold">{n.carbs}g</strong></span>
                        <span className="bg-white border border-slate-100 px-2.5 py-1 rounded-md">Fats: <strong className="text-slate-800 font-bold">{n.fat}g</strong></span>
                      </div>

                      {n.notes && (
                        <p className="text-xs text-slate-500 pl-2 border-l-2 border-slate-300 italic mb-2">
                          &ldquo;{n.notes}&rdquo;
                        </p>
                      )}

                      {/* Coach Reply */}
                      {n.trainerFeedback ? (
                        <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-[11px] text-teal-800 relative mt-3">
                          <span className="absolute -top-2 left-4 px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-teal-600 text-white rounded-full">
                            Coach Nutrition Review
                          </span>
                          <p className="font-bold mt-1 mb-0.5">Sarah Tan Suggestion:</p>
                          <p className="italic font-medium">&ldquo;{n.trainerFeedback}&rdquo;</p>
                        </div>
                      ) : (
                        <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <span>Waiting for coach dietary advice on this local meal...</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Column 2: Assigned Coach, Sessions and AI Advice Center */}
          <div className="space-y-8 text-left">
            
            {/* Quick Session Booking Status */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                <span>Upcoming Session Agenda</span>
              </h3>

              {bookings.filter(b => b.status === 'Approved').length === 0 ? (
                <div className="text-slate-400 font-medium py-4 text-xs">
                  No approved workout sessions scheduled this week.
                  <button 
                    onClick={() => onNavigateToTab('find-trainer')}
                    className="block mt-3 text-teal-400 hover:text-teal-300 font-bold cursor-pointer"
                  >
                    Browse Local Trainers to Book &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.filter(b => b.status === 'Approved').map(b => (
                    <div key={b.id} className="bg-white/10 rounded-xl p-3.5 border border-white/10 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase">
                          Confirmed Slot
                        </span>
                        <span className="text-white/60 font-medium text-[10px]">{b.date} • {b.timeSlot}</span>
                      </div>
                      <p className="font-bold text-slate-200 text-sm mb-1">{b.notes || 'Coaching Session'}</p>
                      <p className="text-slate-400">📍 Location: {b.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assigned Coach Contact Card */}
            {trainer ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-3">
                  Your Certified Trainer
                </span>
                <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3 mb-3">
                  <img 
                    referrerPolicy="no-referrer"
                    src={trainer.avatarUrl} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 shrink-0" 
                    alt={trainer.name} 
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight text-base flex items-center gap-1">
                      {trainer.name}
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1 rounded border border-indigo-100 font-extrabold">✓ Certified</span>
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">{trainer.discipline}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic truncate mb-4">&ldquo;{trainer.bio}&rdquo;</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onNavigateToTab('chats')}
                    className="flex-1 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle className="w-4 h-4" /> Message Coach
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
                <span className="text-2xl block mb-2">🤝</span>
                <h4 className="font-bold text-slate-800 text-sm">No trainer assigned yet!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto mb-4">
                  Find some of Klang Valley’s best trainers close to your location to get feedback.
                </p>
                <button 
                  onClick={() => onNavigateToTab('find-trainer')}
                  className="bg-indigo-950 text-teal-400 font-bold text-xs py-2 px-4 rounded-xl w-full"
                >
                  Discover Trainers Near Me
                </button>
              </div>
            )}

            {/* CoachTrack MY AI Assistant Coach */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative border border-slate-700/50">
              <div className="absolute top-4 right-4 text-[10px] font-bold bg-white/10 text-teal-400 border border-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-teal-400" />
                <span>CoachTrack AI</span>
              </div>

              <h4 className="font-display font-black text-white text-base mb-1">
                AI Assistant Recommendations
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-5">
                Generate a dynamically customized training plan or analyze your local Malaysian meals instantly with our full-stack Gemini assistant!
              </p>

              {/* Loader with changing messages */}
              {loadingAI && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 text-center flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mb-3"></div>
                  <p className="text-[11px] font-bold text-slate-200 animate-pulse">
                    {loadingMessages[aiMessageIndex]}
                  </p>
                </div>
              )}

              {/* Buttons to trigger */}
              {!loadingAI && (
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <button
                    onClick={triggerAIWorkoutRec}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-all"
                  >
                    Generate 3-Day AI Workout Plan
                  </button>
                  <button
                    onClick={triggerAINutritionAnalysis}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider transition-all"
                  >
                    Analyze Nasi Lemak Logs
                  </button>
                </div>
              )}

              {/* AI output result */}
              {aiResult && (
                <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 text-xs text-left max-h-[300px] overflow-y-auto mt-4">
                  <h5 className="font-bold text-teal-900 border-b border-teal-100 pb-1.5 mb-2 flex items-center gap-1 text-sm">
                    <span>📋</span> {aiResult.workoutName}
                  </h5>
                  <p className="text-slate-700 mb-3"><strong className="text-teal-900 font-bold text-[11px]">Primary Focus:</strong> {aiResult.focus}</p>
                  
                  <div className="mb-3">
                    <strong className="block text-[11px] text-teal-900 mb-1">Local Training Adjustments:</strong>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {aiResult.tips.map((tip: string, idx: number) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <strong className="block text-[11px] text-teal-900 border-t border-teal-100 pt-2 font-bold">Routines:</strong>
                    {aiResult.schedule.map((dayObj: any, idx: number) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-teal-100">
                        <strong className="text-teal-900 text-[11.5px] font-bold block mb-1.5">{dayObj.day}</strong>
                        <div className="space-y-1.5">
                          {dayObj.exercises.map((ex: any, i: number) => (
                            <div key={i} className="text-[11px] text-slate-600 border-b border-slate-50 last:border-none pb-1 last:pb-0">
                              <span className="font-medium text-slate-800">{ex.name}</span>: {ex.sets}x{ex.reps} ({ex.weight}kg)
                              <p className="text-[10px] text-slate-500 leading-tight mt-0.5 italic">{ex.descr}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      alert("Workout plan sent to Coach Sarah Tan. Awaiting review.");
                    }}
                    className="w-full mt-3 bg-teal-600 text-white font-bold py-1.5 rounded-lg text-center font-sans text-[10px]"
                  >
                    Request Coach Approval for AI Routine
                  </button>
                </div>
              )}

              {/* AI nutrition output */}
              {aiNutritionResult && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-xs text-left max-h-[300px] overflow-y-auto mt-4">
                  <h5 className="font-bold text-emerald-900 border-b border-emerald-100 pb-1.5 mb-2 text-sm flex items-center justify-between">
                    <span>🥗 Nutrition Critique</span>
                    <span className="text-[10px] bg-emerald-650 text-teal-800 bg-emerald-100 px-2 py-0.5 rounded">Score: {aiNutritionResult.aiRatingOutOfTen}/10</span>
                  </h5>
                  <p className="text-slate-700 mb-2"><strong className="text-emerald-900 font-bold">Intake Feedback:</strong> {aiNutritionResult.caloriesFeedback}</p>
                  <p className="text-slate-700 mb-2"><strong className="text-emerald-900 font-bold">Macros Balance:</strong> {aiNutritionResult.nutritionalBalance}</p>
                  <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-emerald-100 mb-3 text-[10.5px]">
                    <strong className="text-emerald-800 block not-italic font-bold mb-0.5">Malaysia Dietary Insight:</strong> 
                    {aiNutritionResult.malaysianInsights}
                  </p>

                  <div className="space-y-2 mt-2">
                    <strong className="block text-[11px] text-emerald-900 font-bold">Healthy local alternatives:</strong>
                    {aiNutritionResult.healthySubstitutions.map((subObj: any, i: number) => (
                      <div key={i} className="bg-white p-2 rounded-lg border border-emerald-100 text-[11px]">
                        <p className="text-slate-500">Instead of: <span className="line-through text-slate-800 font-medium">{subObj.originalFood}</span></p>
                        <p className="text-emerald-800 font-bold mt-0.5">Eat: {subObj.healthyAlternative}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 italic">{subObj.benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
