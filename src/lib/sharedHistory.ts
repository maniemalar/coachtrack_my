export interface CompletedSession {
  idx: string;
  date: string;
  name: string;
  workoutType: string;
  duration: string;
  durationNum: number;
  calories: string;
  caloriesNum: number;
  rating: string;
  exercises: string[];
  exercisesStructured: { name: string; sets: number; reps: number; weight: number }[];
  pain: string;
  notes: string;
  mood: string;
  outcome: string;
}

export const AHMAD_COMPLETED_SESSIONS: CompletedSession[] = [
  {
    idx: 'sess-0',
    date: '15 Jun 2026',
    name: 'Strength Training',
    workoutType: 'Strength Training',
    duration: '60 mins',
    durationNum: 60,
    calories: '450 kcal',
    caloriesNum: 450,
    rating: '4.9',
    exercises: [
      '• Squat 4x10 @ 60kg',
      '• Deadlift 3x12 @ 80kg',
      '• Push Up 3x15'
    ],
    exercisesStructured: [
      { name: 'Squat', sets: 4, reps: 10, weight: 60 },
      { name: 'Deadlift', sets: 3, reps: 12, weight: 80 },
      { name: 'Push Up', sets: 3, reps: 15, weight: 0 }
    ],
    pain: 'None reported (stable core activation throughout all sets)',
    notes: 'Outstanding form observed on both squat and alignment. Hamstrings showing dynamic engagement.',
    mood: '🎯 Highly motivated & focused',
    outcome: '🏆 Perfect consistency score with excellent progression on squat weights.'
  },
  {
    idx: 'sess-1',
    date: '12 Jun 2026',
    name: 'HIIT Core Strength',
    workoutType: 'HIIT Core Strength',
    duration: '45 mins',
    durationNum: 45,
    calories: '380 kcal',
    caloriesNum: 380,
    rating: '4.7',
    exercises: [
      '• Plank Holds 3x60s',
      '• Mountain Climbers 4x30s',
      '• Medicine Ball Slams 3x15'
    ],
    exercisesStructured: [
      { name: 'Plank Holds', sets: 3, reps: 1, weight: 0 },
      { name: 'Mountain Climbers', sets: 4, reps: 30, weight: 0 },
      { name: 'Medicine Ball Slams', sets: 3, reps: 15, weight: 0 }
    ],
    pain: 'Slight stiffness in left shoulder, resolved post-warmup',
    notes: 'Impressive cardiovascular endurance. Completed all intervals without taking unscheduled resting breaks.',
    mood: '⚡ Active & competitive',
    outcome: '💪 Met target heart rate zones (145-160 BPM) for more than 75% of the workout.'
  },
  {
    idx: 'sess-2',
    date: '09 Jun 2026',
    name: 'Mobility & Core',
    workoutType: 'Mobility & Core',
    duration: '40 mins',
    durationNum: 40,
    calories: '250 kcal',
    caloriesNum: 250,
    rating: '4.6',
    exercises: [
      '• Bird Dog 3x12',
      '• Hamstring Dynamic Stretch 3x60s',
      '• Foam Roller Glutes 5 mins'
    ],
    exercisesStructured: [
      { name: 'Bird Dog', sets: 3, reps: 12, weight: 0 },
      { name: 'Hamstring Dynamic Stretch', sets: 3, reps: 1, weight: 0 },
      { name: 'Foam Roller Glutes', sets: 1, reps: 1, weight: 0 }
    ],
    pain: 'Mild lower back stiffness (2/10 tension)',
    notes: 'Focused entirely on posterior chain decompression. Encouraged lumbar extension movements only.',
    mood: '🧘 Peaceful & mindful',
    outcome: '🍃 Noticeable hip-rotation joint clearance improvement post-session.'
  },
  {
    idx: 'sess-3',
    date: '06 Jun 2026',
    name: 'Cardio Endurance',
    workoutType: 'Cardio Endurance',
    duration: '60 mins',
    durationNum: 60,
    calories: '500 kcal',
    caloriesNum: 500,
    rating: '4.9',
    exercises: [
      '• Treadmill LISS Run 30 mins',
      '• Rowing Machine Intervals 15 mins',
      '• Assault Bike 15 mins'
    ],
    exercisesStructured: [
      { name: 'Treadmill LISS Run', sets: 1, reps: 1, weight: 0 },
      { name: 'Rowing Machine Intervals', sets: 1, reps: 1, weight: 0 },
      { name: 'Assault Bike', sets: 1, reps: 1, weight: 0 }
    ],
    pain: 'None reported',
    notes: 'Very stable pacing at 5:35/km. Aerobic capacity continues to improve steadily over previous baselines.',
    mood: '🔥 Determined & unstoppable',
    outcome: '📈 Burned record 500 kcal in a single cardiorespiratory focus session.'
  }
];

export interface SharedMeal {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  notes: string;
  time: string;
  mealType: string;
  aiInsight: string;
  trainerFeedbackFallback: string;
}

export const AHMAD_NUTRITION_MEALS: SharedMeal[] = [
  {
    id: 'm_1',
    foodName: 'Hainanese Chicken Rice',
    calories: 620,
    protein: 32,
    carbs: 75,
    fat: 22,
    fiber: 2,
    notes: "Roasted fragrant chicken slices served with seasoned oil rice and spicy garlic chili paste.",
    time: '12:30 PM',
    mealType: 'Breakfast',
    aiInsight: 'Solid protein profile. Try swapping seasoned rice with steamed white rice to cut down fat.',
    trainerFeedbackFallback: 'Great roasted choice. Solid portion of proteins!'
  },
  {
    id: 'm_2',
    foodName: 'Nasi Lemak Biasa & Fried Egg',
    calories: 650,
    protein: 18,
    carbs: 85,
    fat: 25,
    fiber: 4,
    notes: "Traditional coconut rice served with boiled cucumber, crispy peanuts, fried anchovies, and a farm-fresh fried egg.",
    time: '03:15 PM',
    mealType: 'Lunch',
    aiInsight: 'High carb meal. Reduce rice portion slightly and add more lean protein.',
    trainerFeedbackFallback: 'Excellent choice, but control sambal and rice portion.'
  },
  {
    id: 'm_3',
    foodName: 'Protein Recovery Shake',
    calories: 310,
    protein: 35,
    carbs: 20,
    fat: 4,
    fiber: 6,
    notes: "Whey isolate shake with half banana.",
    time: '05:00 PM',
    mealType: 'Post Workout',
    aiInsight: 'Optimal post-recovery protein uptake. Facilitates active cellular recovery.',
    trainerFeedbackFallback: 'Excellent choices post-run. Try not to exceed 1 banana scoop.'
  },
  {
    id: 'm_4',
    foodName: 'Stir-fried Beef Noodles',
    calories: 520,
    protein: 45,
    carbs: 60,
    fat: 16,
    fiber: 16,
    notes: "Lean flank steak with whole wheat high fiber flat noodles.",
    time: '07:30 PM',
    mealType: 'Dinner',
    aiInsight: 'Swap next time for steamed flat noodles to lower overall lipid profiles.',
    trainerFeedbackFallback: 'Controlled carbohydrates in the evening would yield much higher alert levels.'
  }
];

export const getMealComment = (mealId: string): string => {
  const custom = localStorage.getItem(`coachtrack_meal_comment_${mealId}`);
  if (custom !== null) return custom;
  const found = AHMAD_NUTRITION_MEALS.find(m => m.id === mealId);
  return found ? found.trainerFeedbackFallback : '';
};

export const setMealComment = (mealId: string, value: string): void => {
  localStorage.setItem(`coachtrack_meal_comment_${mealId}`, value);
};

export interface BodyLog {
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bmr: number;
  bodyFat: number;
  waist: number;
  chest: number;
  hip: number;
  arm: number;
  thigh: number;
  notes: string;
}

const DEFAULT_BODY_LOGS: Record<string, BodyLog[]> = {
  'te_ahmad': [
    {
      date: "2026-06-01",
      weight: 86,
      height: 176,
      bmi: 27.8,
      bmr: 1825,
      bodyFat: 23.5,
      waist: 96,
      chest: 106,
      hip: 110,
      arm: 39,
      thigh: 64,
      notes: "Beginning of the month assessment. Tight hip flexors and slightly overweight."
    },
    {
      date: "2026-06-10",
      weight: 85,
      height: 176,
      bmi: 27.4,
      bmr: 1815,
      bodyFat: 22.4,
      waist: 95,
      chest: 105,
      hip: 109,
      arm: 38.5,
      thigh: 63,
      notes: "Noted slight reduction in waist girth. Stronger glute response."
    },
    {
      date: "2026-06-21",
      weight: 84,
      height: 176,
      bmi: 27.1,
      bmr: 1805,
      bodyFat: 21.8,
      waist: 94,
      chest: 104,
      hip: 108,
      arm: 38,
      thigh: 62,
      notes: "Excellent postural control on deep squats today. Continuous fat drop."
    }
  ],
  'te_ling': [
    {
      date: "2026-06-01",
      weight: 59.5,
      height: 162,
      bmi: 22.7,
      bmr: 1285,
      bodyFat: 26.5,
      waist: 74,
      chest: 92,
      hip: 96,
      arm: 27,
      thigh: 55,
      notes: "First post-partum check-in. Weak core activation."
    },
    {
      date: "2026-06-21",
      weight: 58,
      height: 162,
      bmi: 22.1,
      bmr: 1276,
      bodyFat: 25.5,
      waist: 72,
      chest: 90,
      hip: 94,
      arm: 26,
      thigh: 54,
      notes: "Pelvic alignment is stabilizing nicely. Visible waist trim."
    }
  ],
  'te_faizul': [
    {
      date: "2026-06-01",
      weight: 76.5,
      height: 170,
      bmi: 26.5,
      bmr: 1525,
      bodyFat: 20.8,
      waist: 86,
      chest: 100,
      hip: 100,
      arm: 34.5,
      thigh: 57,
      notes: "Initial consultation."
    },
    {
      date: "2026-06-21",
      weight: 75,
      height: 170,
      bmi: 26.0,
      bmr: 1515,
      bodyFat: 19.5,
      waist: 84,
      chest: 98,
      hip: 98,
      arm: 34,
      thigh: 56,
      notes: "Noted significant strength gains during deadlift checks."
    }
  ]
};

export const getSharedBodyLogs = (): Record<string, BodyLog[]> => {
  const stored = localStorage.getItem('coachtrack_shared_body_logs');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }
  return DEFAULT_BODY_LOGS;
};

export const setSharedBodyLogs = (logs: Record<string, BodyLog[]>): void => {
  localStorage.setItem('coachtrack_shared_body_logs', JSON.stringify(logs));
};

