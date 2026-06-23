import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  User, 
  Activity, 
  Apple,
  Utensils,
  RefreshCw,
  TrendingUp,
  Award,
  ChevronDown,
  Star,
  Download
} from 'lucide-react';
import { dbService } from '../lib/dbService';
import { WorkoutLog, TraineeProfile, NutritionLog, resolveMealPhoto } from '../types';
import { AHMAD_COMPLETED_SESSIONS, AHMAD_NUTRITION_MEALS, getMealComment, setMealComment } from '../lib/sharedHistory';
import { motion, AnimatePresence } from 'motion/react';
import { MealImage } from './MealImage';

interface TraineeHistoryProps {
  traineeUserId: string;
  onNavigateToTab: (tab: string) => void;
}

export default function TraineeHistory({ traineeUserId, onNavigateToTab }: TraineeHistoryProps) {
  const [activeTab, setActiveTab] = useState<'workouts' | 'nutrition'>('workouts');
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [traineeMeta, setTraineeMeta] = useState<TraineeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [nutritionActiveDate, setNutritionActiveDate] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customNutritionDate, setCustomNutritionDate] = useState<string>('2026-06-21');
  const [nutritionWeekDayHovered, setNutritionWeekDayHovered] = useState<number | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<string | null>(null);
  const [detailedMeals, setDetailedMeals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchHistoryData();
  }, [traineeUserId]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const profile = await dbService.getTraineeProfile(traineeUserId);
      if (profile) {
        setTraineeMeta(profile);
        
        // Fetch Workouts
        const workouts = await dbService.getWorkouts({ traineeId: profile.id });
        setWorkoutLogs(workouts);

        // Fetch Nutrition
        const nutrition = await dbService.getNutrition(profile.id);
        setNutritionLogs(nutrition);
      }
    } catch (err) {
      console.error("Error loading trainee history data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 text-left space-y-6">
      
      {/* Title */}
      <div>
        <span className="text-[10px] font-bold tracking-wider uppercase bg-[#081F63] text-[#18D4C5] px-3 py-1 rounded-full mb-2 inline-block">
          Personal Records
        </span>
        <h2 className="text-2xl font-black font-display text-slate-900">Your Logs History</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review physical activities completed with Coach Sarah and track nutrition intake guidelines.
        </p>
      </div>

      {/* Floating Segment Tab Selector */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setActiveTab('workouts')}
          className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
            activeTab === 'workouts' 
              ? 'bg-[#081F63] text-white shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Workout History
        </button>
        <button
          onClick={() => setActiveTab('nutrition')}
          className={`py-2 px-3 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
            activeTab === 'nutrition' 
              ? 'bg-[#081F63] text-white shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Nutrition History
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl space-y-3">
          <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
          <p className="text-xs text-slate-400 font-bold font-sans">Retrieving verified history logs...</p>
        </div>
      ) : activeTab === 'workouts' ? (
        /* ====================================
           WORKOUT HISTORY TAB (Coach Sarah Live Sync)
           ==================================== */
        <div className="space-y-5">
          
          {/* Header Summary Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-md border border-slate-800 space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-[#18D4C5]/10 rounded-full blur-2xl" />
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#18D4C5] uppercase block">COMPLETED SESSIONS</span>
                <h3 className="text-xl font-black font-display text-white mt-0.5">Workout History</h3>
              </div>
              <span className="bg-slate-800 text-[#18D4C5] text-[10px] font-black px-3 py-1 rounded-xl border border-slate-750">
                {AHMAD_COMPLETED_SESSIONS.length} Recorded Sessions
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Total Burned This Week</span>
                <span className="text-lg font-black text-white block mt-0.5 font-mono">1,580 <span className="text-[10px] font-medium text-[#18D4C5]">kcal</span></span>
              </div>
              <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Workout Status</span>
                <span className="text-xs font-black text-[#18D4C5] flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  100% Consistent
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Calories Graph */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs text-left font-sans">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#081F63] tracking-wider">Calories Burned</span>
                <p className="text-2xs text-slate-400 mt-0.5">Calories burned per recorded coach session</p>
              </div>
            </div>

            {/* Custom High-Fidelity Chart */}
            <div className="relative h-44 w-full flex items-end justify-between px-2 pt-6 pb-2 bg-slate-50 border border-slate-100 rounded-2xl select-none">
              <div className="absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none px-2">
                <div className="w-full border-b border-dashed border-slate-200" />
                <div className="w-full border-b border-dashed border-slate-200" />
                <div className="w-full border-b border-dashed border-slate-200" />
              </div>

              {[
                { date: '06 Jun', calories: 500, label: 'Sat', code: 'Cardio' },
                { date: '09 Jun', calories: 250, label: 'Tue', code: 'Mobility' },
                { date: '12 Jun', calories: 380, label: 'Fri', code: 'HIIT' },
                { date: '15 Jun', calories: 450, label: 'Mon', code: 'Strength' }
              ].map((bar, i) => {
                const percentage = (bar.calories / 500) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative z-10">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 text-white font-mono text-[9px] font-black px-2 py-1 rounded shadow-md pointer-events-none transition-all duration-200 transform scale-95 group-hover:scale-100 shrink-0">
                      {bar.calories} kcal
                    </div>

                    {/* Bar Wrapper */}
                    <div className="w-9 bg-slate-200/50 rounded-lg h-24 flex items-end overflow-hidden border border-slate-150/70">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${percentage}%` }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="w-full bg-gradient-to-t from-[#081F63] to-[#18D4C5] rounded-t-sm"
                      />
                    </div>

                    <span className="text-[10px] font-extrabold text-[#081F63] font-sans mt-2">{bar.label}</span>
                    <span className="text-[8px] font-extrabold font-mono text-slate-400 mt-0.5">{bar.date}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session History Title */}
          <div>
            <h4 className="text-xs font-black text-[#081F63] uppercase tracking-widest pl-1 mb-3 select-none">
              📋 Completed Gym Sessions
            </h4>

            {/* List of sessions */}
            <div className="space-y-3">
              {AHMAD_COMPLETED_SESSIONS.map((row) => {
                const isExpanded = !!expandedSessions[row.idx];
                return (
                  <div 
                    key={row.idx}
                    className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden transition-all duration-200 text-left"
                  >
                    
                    {/* Header Button Row */}
                    <button
                      onClick={() => {
                        setExpandedSessions(prev => ({
                          ...prev,
                          [row.idx]: !prev[row.idx]
                        }));
                      }}
                      className={`w-full p-4 flex flex-col text-left cursor-pointer hover:bg-slate-50/40 transition-colors ${
                        isExpanded ? 'bg-[#18D4C5]/5' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold font-mono text-slate-400">{row.date}</span>
                            <span className="flex items-center gap-0.5 bg-amber-50 rounded px-1.5 py-0.5 text-[9px] font-black text-amber-700">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" />
                              <span>⭐ {row.rating}</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 leading-tight font-display mt-1">{row.name}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-black text-[#081F63] block tracking-tight">{row.duration}</span>
                            <span className="text-[9px] font-black text-teal-600 block tracking-tight font-mono">{row.calories}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-250 shrink-0 ${isExpanded ? 'rotate-180 text-teal-600' : ''}`} />
                        </div>
                      </div>
                    </button>

                    {/* Explanatory Details Drawer */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-slate-100 bg-slate-50/30"
                        >
                          <div className="p-4 space-y-3.5 text-xs text-slate-700">
                            
                            {/* Exercises list */}
                            <div className="bg-white rounded-xl p-3 border border-slate-200/50 shadow-2xs text-left">
                              <span className="text-[9px] font-black text-[#081F63] uppercase tracking-wider block mb-2 font-display">
                                🏋️ Exercises Performed
                              </span>
                              <ul className="space-y-1.5 pl-0.5">
                                {row.exercises.map((ex, idx) => (
                                  <li key={idx} className="font-extrabold text-slate-700 font-sans flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#18D4C5] shrink-0" />
                                    <span>{ex.replace(/^•\s*/, '')}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Metrics Doublet */}
                            <div className="grid grid-cols-2 gap-2 text-left">
                              <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Duration</span>
                                <span className="font-extrabold text-slate-800 font-sans mt-0.5 block">{row.duration}</span>
                              </div>
                              <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Calories Burned</span>
                                <span className="font-extrabold text-teal-600 font-sans mt-0.5 block">{row.calories}</span>
                              </div>
                            </div>

                            {/* Pain / Discomfort */}
                            <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl text-left">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Pain / Discomfort Reports</span>
                              <p className="font-extrabold text-slate-700">{row.pain}</p>
                            </div>

                            {/* Coach Feedback commentary */}
                            <div className="bg-white border border-slate-200/50 p-3 rounded-xl text-left border-l-3 border-teal-500">
                              <span className="text-[8.5px] font-black text-indigo-950 uppercase tracking-wider block mb-1 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-[#18D4C5]" />
                                <span>Coach Sarah Tan Commentary</span>
                              </span>
                              <p className="font-bold text-slate-600 leading-normal italic text-xs">
                                &ldquo;{row.notes}&rdquo;
                              </p>
                            </div>

                            {/* Mood / Outcome Bottom split */}
                            <div className="grid grid-cols-2 gap-2 text-left">
                              <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl">
                                <span className="text-[8px] font-black text-slate-400 uppercase block tracking-widest">Client Mood</span>
                                <span className="font-black text-indigo-700 text-2xs mt-0.5 block truncate">
                                  {row.mood.replace(/^[^\s\w]+\s*/, '')}
                                </span>
                              </div>
                              <div className="bg-white border border-slate-200/50 p-2.5 rounded-xl">
                                <span className="text-[8px] font-black text-slate-400 uppercase block tracking-widest">Session Outcome</span>
                                <span className="font-black text-emerald-700 text-2xs mt-0.5 block truncate">
                                  {row.outcome.replace(/^[^\s\w]+\s*/, '')}
                                </span>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Download CSV Button */}
          <button 
            onClick={() => {
              const csvHeaders = "date,session name,duration,calories burned,exercises,sets,reps,weights,pain/discomfort,trainer notes,client mood,outcome\n";
              const csvRows = AHMAD_COMPLETED_SESSIONS.map(row => {
                const exercisesJoined = row.exercisesStructured.map(e => e.name).join('; ');
                const setsJoined = row.exercisesStructured.map(e => e.sets).join('; ');
                const repsJoined = row.exercisesStructured.map(e => e.reps).join('; ');
                const weightsJoined = row.exercisesStructured.map(e => `${e.weight}kg`).join('; ');
                const cleanMood = row.mood.replace(/^[^\s\w]+\s*/, '');
                const cleanOutcome = row.outcome.replace(/^[^\s\w]+\s*/, '');
                return `"${row.date}","${row.name}","${row.duration}","${row.calories}","${exercisesJoined}","${setsJoined}","${repsJoined}","${weightsJoined}","${row.pain.replace(/"/g, '""')}","${row.notes.replace(/"/g, '""')}","${cleanMood.replace(/"/g, '""')}","${cleanOutcome.replace(/"/g, '""')}"`;
              }).join("\n");
              
              const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `Ahmad_Bin_Ibrahim_Workout_History.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#081F63] hover:bg-slate-850 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl uppercase tracking-wider transition-all cursor-pointer font-sans select-none shadow-sm active:scale-98"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download Workout History CSV</span>
          </button>

        </div>
      ) : (
        /* ====================================
           NUTRITION HISTORY TAB
           ==================================== */
        <div className="space-y-6">
          {(() => {
            // Compute active date string
            const activeDateStr = nutritionActiveDate === 'today' ? '2026-06-21' : (nutritionActiveDate === 'yesterday' ? '2026-06-20' : customNutritionDate);
            
            // Filter logs or fallback
            const traineeNutritionLogs = nutritionLogs.filter(n => n.date === activeDateStr);
            
            const activeMealsList = traineeNutritionLogs.length > 0 ? traineeNutritionLogs.map(m => ({
              ...m,
              time: m.time || (m.foodName.includes('Nasi Lemak') ? '03:15 PM' : m.foodName.includes('Chicken') ? '12:30 PM' : m.foodName.includes('Shake') ? '05:00 PM' : '07:30 PM'),
              mealType: m.mealType || (m.foodName.includes('Nasi Lemak') ? 'Lunch' : m.foodName.includes('Chicken') ? 'Breakfast' : m.foodName.includes('Shake') ? 'Post Workout' : 'Dinner'),
              aiInsight: m.aiInsight || (m.foodName.includes('Nasi Lemak') ? 'High carb meal. Reduce rice portion slightly and add more lean protein.' : m.foodName.includes('Chicken') ? 'Solid protein profile. Try swapping seasoned rice with steamed white rice to cut down fat.' : m.foodName.includes('Shake') ? 'Optimal post-recovery protein uptake. Facilitates active cellular recovery.' : 'Swap next time for steamed flat noodles to lower overall lipid profiles.'),
              trainerFeedback: getMealComment(m.id) || m.trainerFeedback || (m.foodName.includes('Nasi Lemak') ? 'Excellent choice, but control sambal and rice portion.' : 'Very consistent nutrient profiling today.')
            })) : AHMAD_NUTRITION_MEALS.map(m => ({
              id: m.id,
              foodName: m.foodName,
              calories: m.calories,
              protein: m.protein,
              carbs: m.carbs,
              fat: m.fat,
              fiber: m.fiber,
              notes: m.notes,
              time: m.time,
              mealType: m.mealType,
              aiInsight: m.aiInsight,
              trainerFeedback: getMealComment(m.id) || m.trainerFeedbackFallback
            }));

            const totalDailyCal = activeMealsList.reduce((acc, m) => acc + (m.calories || 0), 0);
            const totalDailyProtein = activeMealsList.reduce((acc, m) => acc + (m.protein || 0), 0);
            const totalDailyCarbs = activeMealsList.reduce((acc, m) => acc + (m.carbs || 0), 0);
            const totalDailyFat = activeMealsList.reduce((acc, m) => acc + (m.fat || 0), 0);
            const totalDailyFiber = activeMealsList.reduce((acc, m) => acc + (m.fiber || 5), 0);

            const targetCalorieGoal = 1800;
            const calorieDeviationPct = Math.abs(totalDailyCal - targetCalorieGoal) / targetCalorieGoal;
            let nutritionScore = Math.round(100 - (calorieDeviationPct * 40));
            nutritionScore = Math.max(40, Math.min(100, nutritionScore));
            const scoreRating = nutritionScore >= 85 ? 'Excellent' : (nutritionScore >= 70 ? 'Good' : 'Fair');

            const calDiff = totalDailyCal - targetCalorieGoal;
            const statusLabel = calDiff > 0 
              ? `+${calDiff} kcal Over Target` 
              : calDiff === 0 
                ? 'On Target ✓' 
                : `${Math.abs(calDiff)} kcal Under Target`;

            let statusColorClass = 'text-[#081F63] bg-teal-50 border-teal-100/50';
            let statusDotColor = 'bg-[#18D4C5]';
            if (calDiff > 150) {
              statusColorClass = 'text-rose-600 bg-rose-50 border-rose-100';
              statusDotColor = 'bg-rose-500';
            } else if (calDiff > 0) {
              statusColorClass = 'text-amber-700 bg-amber-50 border-amber-100';
              statusDotColor = 'bg-amber-500';
            }

            const totalGrams = totalDailyProtein + totalDailyCarbs + totalDailyFat + totalDailyFiber;
            const proteinPctVal = totalGrams > 0 ? Math.round((totalDailyProtein / totalGrams) * 100) : 28;
            const carbsPctVal = totalGrams > 0 ? Math.round((totalDailyCarbs / totalGrams) * 100) : 52;
            const fatPctVal = totalGrams > 0 ? Math.round((totalDailyFat / totalGrams) * 100) : 14;
            const fiberPctVal = totalGrams > 0 ? Math.max(0, 100 - proteinPctVal - carbsPctVal - fatPctVal) : 6;

            const weeklyTrendValues = [
              { day: 'Mon', val: 1650 },
              { day: 'Tue', val: 1780 },
              { day: 'Wed', val: 1950 },
              { day: 'Thu', val: 1705 },
              { day: 'Fri', val: 1820 },
              { day: 'Sat', val: 1750 },
              { day: 'Sun', val: totalDailyCal }
            ];

            const handleDownloadNutritionCSV = () => {
              const header = "Date,Time,Meal Name,Calories,Protein,Carbs,Fat,Fiber,Coach Feedback,AI Insight\n";
              const rows = activeMealsList.map(n => {
                const savedComment = getMealComment(n.id) || n.trainerFeedback || 'None';
                const aiInsightText = n.aiInsight || 'Solid protein profile.';
                const mealTime = n.time || '12:00 PM';
                return `"${activeDateStr}","${mealTime}","${n.foodName}",${n.calories},${n.protein},${n.carbs},${n.fat},${n.fiber || 5},"${savedComment.replace(/"/g, '""')}","${aiInsightText.replace(/"/g, '""')}"`;
              }).join("\n");
              const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `Ahmad_Bin_Ibrahim_Nutrition_History.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6 text-left"
              >
                {/* PAGE HEADER */}
                <div className="border-b border-slate-100 pb-4 select-none">
                  <h3 className="text-xl font-extrabold text-[#081F63] leading-tight font-display">
                    Nutrition Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-sans leading-relaxed">
                    Premium dietary insights, compliance metrics and real-time food analytics.
                  </p>
                </div>

                {/* DATE SELECTOR CHIPS */}
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                    <button 
                      onClick={() => setNutritionActiveDate('today')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl font-sans transition-all cursor-pointer text-center ${
                        nutritionActiveDate === 'today'
                          ? 'bg-[#081F63] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => setNutritionActiveDate('yesterday')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl font-sans transition-all cursor-pointer text-center ${
                        nutritionActiveDate === 'yesterday'
                          ? 'bg-[#081F63] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button 
                      onClick={() => setNutritionActiveDate('custom')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-xl font-sans transition-all cursor-pointer text-center ${
                        nutritionActiveDate === 'custom'
                          ? 'bg-[#081F63] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Select Date
                    </button>
                  </div>

                  {nutritionActiveDate === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden bg-slate-50 rounded-2xl p-3.5 border border-slate-200"
                    >
                      <div className="flex gap-3 items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans shrink-0">Choose Date:</span>
                        <input 
                          type="date" 
                          value={customNutritionDate}
                          onChange={(e) => setCustomNutritionDate(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold font-sans text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#18D4C5]"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* MAIN NUTRITION SCORE CARD */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs select-none">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    
                    {/* Ring score on left */}
                    <div className="flex flex-col items-center justify-center md:col-span-4 md:border-r md:border-slate-100 md:pr-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Nutrition Score</span>
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle 
                            cx="48" 
                            cy="48" 
                            r="42" 
                            className="text-slate-50" 
                            strokeWidth="7" 
                            stroke="currentColor" 
                            fill="transparent" 
                          />
                          <circle 
                            cx="48" 
                            cy="48" 
                            r="42" 
                            className="text-[#18D4C5] transition-all duration-300" 
                            strokeWidth="7" 
                            strokeDasharray={2 * Math.PI * 42} 
                            strokeDashoffset={2 * Math.PI * 42 * (1 - nutritionScore / 100)} 
                            strokeLinecap="round" 
                            stroke="currentColor" 
                            fill="transparent" 
                          />
                        </svg>
                        <div className="absolute text-center flex flex-col items-center justify-center">
                          <span className="text-xl font-extrabold text-[#081F63] tracking-tight">{nutritionScore}</span>
                          <span className="text-[8px] font-bold text-slate-400 border-t border-slate-100/50 pt-0.5 mt-0.5 uppercase tracking-widest leading-none">{scoreRating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Calories vs targets */}
                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Intake Summary</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-2xl font-black text-[#081F63] font-display">{totalDailyCal}</span>
                          <span className="text-slate-400 text-xs font-semibold">/ {targetCalorieGoal} kcal consumed</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="relative">
                        <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              calDiff > 0 ? 'bg-rose-500' : 'bg-[#18D4C5]'
                            }`}
                            style={{ width: `${Math.min(100, (totalDailyCal / targetCalorieGoal) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Status Row */}
                      <div className="flex items-center justify-between">
                        <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold font-sans flex items-center gap-1.5 ${statusColorClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                          <span>{statusLabel}</span>
                        </div>
                        <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider">
                          {calDiff > 0 ? 'Exceeded Limit' : `${1800 - totalDailyCal} kcal remaining`}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* WEEKLY CALORIE TREND GRAPH */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#081F63] mb-1">Weekly Calorie Trend</h4>
                    <p className="text-[11px] text-slate-400 font-sans leading-normal">Fluctuations in dietary intakes vs daily targets.</p>
                  </div>

                  {/* SVG Chart */}
                  <div className="w-full mt-3 select-none">
                    <div className="relative h-28 w-full">
                      <div className="absolute top-0 left-0 bg-[#081F63]/5 border border-[#081F63]/10 px-2 py-0.5 rounded-lg text-[9px] font-bold text-[#081F63]">
                        {nutritionWeekDayHovered !== null ? (
                          <span>{weeklyTrendValues[nutritionWeekDayHovered].day}: <strong>{weeklyTrendValues[nutritionWeekDayHovered].val} kcal</strong> ({weeklyTrendValues[nutritionWeekDayHovered].val > 1800 ? 'Over' : 'Under'})</span>
                        ) : (
                          <span>Hover days to inspect values</span>
                        )}
                      </div>

                      <svg className="w-full h-full overflow-visible" viewBox="0 0 540 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGradientTrainee" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#18D4C5" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#18D4C5" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* target line at 1800 kcal */}
                        <line 
                          x1="0" 
                          y1="40" 
                          x2="540" 
                          y2="40" 
                          stroke="#EF4444" 
                          strokeWidth="1.5" 
                          strokeDasharray="4,4" 
                        />
                        <text x="535" y="32" fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="end">TARGET: 1800 KCAL</text>

                        {/* SVG filled and line paths */}
                        <path 
                          d={`
                            M 0,${120 - (1650 / 2400) * 100} 
                            L 90,${120 - (1780 / 2400) * 100} 
                            L 180,${120 - (1950 / 2400) * 100} 
                            L 270,${120 - (1705 / 2400) * 100} 
                            L 360,${120 - (1820 / 2400) * 100} 
                            L 450,${120 - (1750 / 2400) * 100} 
                            L 540,${120 - (totalDailyCal / 2400) * 100}
                          `}
                          fill="none" 
                          stroke="#18D4C5" 
                          strokeWidth="3" 
                          strokeLinecap="round"
                        />

                        <path 
                          d={`
                            M 0,${120 - (1650 / 2400) * 100} 
                            L 90,${120 - (1780 / 2400) * 100} 
                            L 180,${120 - (1950 / 2400) * 100} 
                            L 270,${120 - (1705 / 2400) * 100} 
                            L 360,${120 - (1820 / 2400) * 100} 
                            L 450,${120 - (1750 / 2400) * 100} 
                            L 540,${120 - (totalDailyCal / 2400) * 100}
                            L 540,120
                            L 0,120
                            Z
                          `}
                          fill="url(#chartGradientTrainee)"
                        />

                        {/* Data points */}
                        {[1650, 1780, 1950, 1705, 1820, 1750, totalDailyCal].map((val, i) => {
                          const x = i * 90;
                          const y = 120 - (val / 2400) * 100;
                          const isOver = val > 1800;
                          return (
                            <g 
                              key={i} 
                              className="cursor-pointer" 
                              onMouseEnter={() => setNutritionWeekDayHovered(i)}
                              onMouseLeave={() => setNutritionWeekDayHovered(null)}
                            >
                              <circle 
                                cx={x} 
                                cy={y} 
                                r="9" 
                                fill={nutritionWeekDayHovered === i ? '#081F63' : 'transparent'} 
                                className="transition-colors duration-150"
                              />
                              <circle 
                                cx={x} 
                                cy={y} 
                                r="4" 
                                fill={isOver ? '#EF4444' : '#18D4C5'} 
                                stroke="#FFFFFF" 
                                strokeWidth="1.5" 
                              />
                            </g>
                          );
                        })}
                      </svg>
                    </div>

                    {/* X axis */}
                    <div className="flex justify-between px-1.5 mt-2.5 border-t border-slate-50 pt-1.5">
                      {weeklyTrendValues.map((dayObj, i) => (
                        <span 
                          key={i} 
                          className={`text-2xs font-extrabold block transition-colors ${
                            nutritionWeekDayHovered === i ? 'text-[#081F63] scale-105' : 'text-slate-400'
                          }`}
                        >
                          {dayObj.day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MACRO DISTRIBUTION */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#081F63] mb-1">Macro Distribution</h4>
                    <p className="text-[11px] text-slate-400 font-sans">Relative gram ratio of logged macros.</p>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    {/* Concentric rings */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Macro 1: Protein */}
                        <circle cx="48" cy="48" r="38" stroke="#F1F5F9" strokeWidth="5" fill="none" />
                        <circle cx="48" cy="48" r="38" stroke="#4F46E5" strokeWidth="5" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - proteinPctVal / 100)} strokeLinecap="round" fill="none" />

                        {/* Macro 2: Carbs */}
                        <circle cx="48" cy="48" r="30" stroke="#F1F5F9" strokeWidth="5" fill="none" />
                        <circle cx="48" cy="48" r="30" stroke="#18D4C5" strokeWidth="5" strokeDasharray={2 * Math.PI * 30} strokeDashoffset={2 * Math.PI * 30 * (1 - carbsPctVal / 100)} strokeLinecap="round" fill="none" />

                        {/* Macro 3: Fat */}
                        <circle cx="48" cy="48" r="22" stroke="#F1F5F9" strokeWidth="5" fill="none" />
                        <circle cx="48" cy="48" r="22" stroke="#F59E0B" strokeWidth="5" strokeDasharray={2 * Math.PI * 22} strokeDashoffset={2 * Math.PI * 22 * (1 - fatPctVal / 100)} strokeLinecap="round" fill="none" />

                        {/* Macro 4: Fiber */}
                        <circle cx="48" cy="48" r="14" stroke="#F1F5F9" strokeWidth="4.5" fill="none" />
                        <circle cx="48" cy="48" r="14" stroke="#0F172A" strokeWidth="4.5" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * (1 - fiberPctVal / 100)} strokeLinecap="round" fill="none" />
                      </svg>
                      <div className="absolute text-center text-sm font-black">🍽</div>
                    </div>

                    {/* Legends right */}
                    <div className="flex-1 space-y-1.5 font-sans">
                      <div className="flex items-center justify-between text-3xs border-b border-slate-50 pb-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                          <span className="text-slate-650">Protein</span>
                        </div>
                        <span className="font-extrabold text-[#081F63]">{proteinPctVal}% ({totalDailyProtein}g)</span>
                      </div>
                      <div className="flex items-center justify-between text-3xs border-b border-slate-50 pb-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#18D4C5]" />
                          <span className="text-slate-650">Carbs</span>
                        </div>
                        <span className="font-extrabold text-[#081F63]">{carbsPctVal}% ({totalDailyCarbs}g)</span>
                      </div>
                      <div className="flex items-center justify-between text-3xs border-b border-slate-50 pb-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                          <span className="text-slate-650">Fat</span>
                        </div>
                        <span className="font-extrabold text-[#081F63]">{fatPctVal}% ({totalDailyFat}g)</span>
                      </div>
                      <div className="flex items-center justify-between text-3xs">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-[#0F172A]" />
                          <span className="text-slate-650">Fiber</span>
                        </div>
                        <span className="font-extrabold text-[#081F63]">{fiberPctVal}% ({totalDailyFiber}g)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NUTRITION ACTIVITY FEED */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-1">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#081F63]">
                      Nutrition Activity Feed
                    </h4>
                    <span className="text-2xs font-bold text-slate-400">{activeMealsList.length} Meals Logged</span>
                  </div>

                  <div className="space-y-2.5">
                    {activeMealsList.map((meal) => {
                      const mealPhotoUrl = resolveMealPhoto(meal.foodName);
                      const isExpanded = expandedMealId === meal.id;
                      const isMealDetailed = !!detailedMeals[meal.id];

                      return (
                        <div 
                          key={meal.id} 
                          className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xs transition-all duration-200"
                        >
                          {/* Feed row */}
                          <button 
                            onClick={() => setExpandedMealId(isExpanded ? null : meal.id)}
                            className={`w-full flex items-center justify-between p-3 text-left transition-colors duration-200 cursor-pointer ${
                              isExpanded ? 'bg-slate-50 border-b border-slate-100' : 'hover:bg-slate-50/55'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              {/* Left image thumbnail */}
                              <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50">
                                <MealImage src={mealPhotoUrl} alt={meal.foodName} className="w-full h-full object-cover" />
                              </div>

                              {/* Center text details */}
                              <div className="min-w-0 flex-1">
                                <h4 className="font-extrabold text-[#081F63] text-xs truncate">
                                  {meal.foodName}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5 text-3xs text-slate-400 font-bold tracking-wide">
                                  <span>{meal.time}</span>
                                  <span>•</span>
                                  <span className="text-[#18D4C5] font-black">{meal.calories} kcal</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Arrow */}
                            <div className="shrink-0 ml-2.5 text-slate-400">
                              <ChevronDown 
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-[#18D4C5]' : ''
                                }`} 
                              />
                            </div>
                          </button>

                          {/* Expanded Details */}
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden bg-[#FAFCFF] border-t border-slate-100"
                              >
                                <div className="p-4 space-y-3">
                                  {/* Large interactive image with shadow */}
                                  <div className="w-full h-40 rounded-2xl overflow-hidden border border-slate-100 relative shadow-2xs bg-slate-50">
                                    <MealImage src={mealPhotoUrl} alt={meal.foodName} className="w-full h-full object-cover" />
                                    <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-3xs font-black text-[#081F63] border border-slate-100 select-none shadow-2xs">
                                      ⚡ {meal.calories} kcal
                                    </div>
                                  </div>

                                  {/* Compact Macronutrients Breakdown */}
                                  <div className="bg-white border border-slate-100 rounded-2xl p-2.5 grid grid-cols-4 gap-2 text-center text-3xs shadow-3xs">
                                    <div className="border-r border-slate-50">
                                      <span className="block text-[9px] font-bold text-slate-400">Protein</span>
                                      <span className="block text-xs font-black text-[#081F63] mt-0.5">{meal.protein}g</span>
                                    </div>
                                    <div className="border-r border-slate-50">
                                      <span className="block text-[9px] font-bold text-slate-400">Carbs</span>
                                      <span className="block text-xs font-black text-[#081F63] mt-0.5">{meal.carbs}g</span>
                                    </div>
                                    <div className="border-r border-slate-50">
                                      <span className="block text-[9px] font-bold text-slate-400">Fat</span>
                                      <span className="block text-xs font-black text-[#081F63] mt-0.5">{meal.fat}g</span>
                                    </div>
                                    <div>
                                      <span className="block text-[9px] font-bold text-slate-400">Fiber</span>
                                      <span className="block text-xs font-black text-[#081F63] mt-0.5">{meal.fiber || 5}g</span>
                                    </div>
                                  </div>

                                  {/* AI analysis banner */}
                                  <div className="bg-indigo-50/50 border border-indigo-100/30 rounded-2xl p-3 text-3xs">
                                    <div className="flex items-center gap-1.5 mb-1 text-indigo-700 font-bold select-none">
                                      <Sparkles className="w-3.5 h-3.5 font-bold" />
                                      <span className="uppercase tracking-wider">AI Nutrition Analysis</span>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                                      {meal.aiInsight}
                                    </p>
                                  </div>

                                  {/* Active coach guidance */}
                                  <div className="bg-teal-50/30 border border-teal-100/30 rounded-2xl p-3 text-3xs">
                                    <span className="font-extrabold text-teal-700 uppercase tracking-wider block mb-1">Coach Sarah's Feedback</span>
                                    <p className="text-[11px] leading-relaxed text-slate-650 italic">
                                      "{meal.trainerFeedback || 'No special coaching instruction left yet.'}"
                                    </p>
                                  </div>

                                  {/* Toggle Raw notes */}
                                  <div className="pt-2 border-t border-slate-100 text-right">
                                    <button 
                                      onClick={() => setDetailedMeals(prev => ({ ...prev, [meal.id]: !isMealDetailed }))}
                                      className="text-3xs font-extrabold text-indigo-600 hover:text-indigo-800 uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>{isMealDetailed ? 'Hide Raw Logs' : 'View Ingredient logs'}</span>
                                      <ChevronDown className={`w-3 h-3 transform transition-transform ${isMealDetailed ? 'rotate-180 text-indigo-600' : ''}`} />
                                    </button>

                                    <AnimatePresence initial={false}>
                                      {isMealDetailed && (
                                        <motion.div 
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          exit={{ opacity: 0, height: 0 }}
                                          className="text-left overflow-hidden mt-1.5 bg-slate-50 border border-slate-150 rounded-xl p-2.5"
                                        >
                                          <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Trainee Ingredient notes:</span>
                                          <p className="text-3xs font-medium text-slate-500 leading-normal italic">
                                            "{meal.notes || 'No supplementary meal tags added.'}"
                                          </p>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI NUTRITION SUMMARY CARD */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#081F63] flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#18D4C5]" />
                      <span>AI Nutrition Summary</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-3.5 font-medium leading-normal">Immediate compliance and cognitive pattern audits.</p>
                    
                    <div className="space-y-2.5">
                      <div className="flex gap-2.5 items-start">
                        <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg shrink-0 mt-0.5 text-3xs font-black">✓</span>
                        <span className="text-xs font-medium text-slate-700">Protein intake adequate</span>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg shrink-0 mt-0.5 text-3xs font-black">✓</span>
                        <span className="text-xs font-medium text-slate-700">Meal timing consistent</span>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-lg shrink-0 mt-0.5 text-3xs font-black">⚠</span>
                        <span className="text-xs font-medium text-slate-700">
                          {totalDailyCal > 1800 
                            ? `Calories exceeded by ${totalDailyCal - 1800} kcal` 
                            : `Calorie loads within targets`
                          }
                        </span>
                      </div>
                      <div className="flex gap-2.5 items-start">
                        <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-lg shrink-0 mt-0.5 text-3xs font-black">⚠</span>
                        <span className="text-xs font-medium text-slate-700">Lunch contributed highest carb intake</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-50 pt-2.5 mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest block text-left">
                    COACHTRACK INTELLIGENCE ENGINE • 2026
                  </div>
                </div>

                {/* DIETARY QUICK INSIGHTS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#081F63] uppercase tracking-wider block select-none">
                    Dietary Quick Insights
                  </h4>
                  <div className="grid grid-cols-2 gap-3 select-none">
                    
                    {/* Insight 1 */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-left shadow-2xs flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-2">🔥 Highest Calorie Day</span>
                      <div>
                        <span className="text-xs font-bold text-[#081F63] block">Wednesday</span>
                        <span className="text-3xs text-[#18D4C5] font-black uppercase tracking-wider block mt-0.5">1,950 kcal consumed</span>
                      </div>
                    </div>

                    {/* Insight 2 */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-left shadow-2xs flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-2">🥗 Healthiest Meal</span>
                      <div>
                        <span className="text-xs font-bold text-[#081F63] block truncate">Recovery Shake</span>
                        <span className="text-3xs text-[#18D4C5] font-black uppercase tracking-wider block mt-0.5">Optimal Protein Index</span>
                      </div>
                    </div>

                    {/* Insight 3 */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-left shadow-2xs flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-2">💪 Protein Champ Day</span>
                      <div>
                        <span className="text-xs font-bold text-[#081F63] block">Friday</span>
                        <span className="text-3xs text-[#18D4C5] font-black uppercase tracking-wider block mt-0.5">145g Protein Intake</span>
                      </div>
                    </div>

                    {/* Insight 4 */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-left shadow-2xs flex flex-col justify-between">
                      <span className="text-[9px] text-slate-400 font-extrabold block uppercase tracking-wider mb-2">📈 Best Nutrition Score</span>
                      <div>
                        <span className="text-xs font-bold text-[#081F63] block font-sans">Tuesday</span>
                        <span className="text-3xs text-[#18D4C5] font-black uppercase tracking-wider block mt-0.5">88 / 100 Rec. score</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* PREMIUM DOWNLOAD REPORT ACTION BUTTON */}
                <button 
                  onClick={handleDownloadNutritionCSV}
                  className="w-full flex items-center justify-center gap-2 bg-[#081F63] hover:bg-[#081F63]/90 text-white font-extrabold text-xs py-3.5 px-4 rounded-2xl uppercase tracking-wider transition-all cursor-pointer font-sans select-none shadow-sm active:scale-98 mt-2"
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>Download Nutrition Report</span>
                </button>

              </motion.div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
