import { 
  TrainerProfile, 
  TraineeProfile, 
  WorkoutLog, 
  NutritionLog, 
  BookingSession, 
  ChatMessage, 
  Payment, 
  Invoice,
  PrescribedWorkout, 
  UserRole
} from '../types';

// Helper to generate IDs
function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
}

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Seed Demo Trainers
const SEED_TRAINERS: TrainerProfile[] = [
  {
    id: 'tr_sarah',
    userId: 'u_sarah',
    name: 'Sarah Tan',
    discipline: 'Yoga & Pilates Instructor',
    experienceYears: 6,
    location: 'SS15, Subang Jaya',
    coordinates: { lat: 3.0792, lng: 101.5950 },
    freelanceStatus: 'Freelance',
    pricePerHour: 80,
    bio: 'Dedicated to helping office workers improve flexibility, core strength, and mindfulness near Subang Jaya. Specialized in therapeutic yoga.',
    rating: 4.8,
    verified: true,
    certificates: ['Certified RYT-500 Yoga Alliance', 'Kinesiology Rehab Diploma'],
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY'
  },
  {
    id: 'tr_faiz',
    userId: 'u_faiz',
    name: 'Coach Faiz Subri',
    discipline: 'Strength & Conditioning',
    experienceYears: 8,
    location: 'SS15, Subang Jaya',
    coordinates: { lat: 3.0789, lng: 101.5944 },
    freelanceStatus: 'Boutique Studio',
    pricePerHour: 130,
    bio: 'Powerlifter and sports conditioning coach. I build customized plans to maximize athletic output and lean muscle gains in SS15 Subang Jaya.',
    rating: 4.9,
    verified: true,
    certificates: ['NASM Certified Personal Trainer', 'FISAF International Gold Cert'],
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuIdggY96cPbYkxhPMHyYSEZQVUCfWOJP3N_XjZHy2cjbfbBe8s3VMjo0eHn80_fcIMAAAF9XsmYOwUEthMnXcvB4974Gmf0oHIP2pwWjW-434vE_vl-DsdIsKv3zP1v9Qso_eKmrZoTS81FTK7orVBn9iZdZqrfXeN7X39OP9QLt2cgD0bSNT3HVELQeobUuSzw2qzsVS1XFYG5l31bH9DauPRuk-3ihxIl0wsjV28iH1BPJsDdxxTauVSBToRTmaBW0973wtxfo8'
  },
  {
    id: 'tr_rishi',
    userId: 'u_rishi',
    name: 'Rishi Kumar',
    discipline: 'HIIT & Fat Loss Specialist',
    experienceYears: 5,
    location: 'Damansara Utama (UPTOWN), PJ',
    coordinates: { lat: 3.1365, lng: 101.6215 },
    freelanceStatus: 'Freelance',
    pricePerHour: 95,
    bio: 'Fusing calisthenics and kettlebells for high-calorie-burning training. I make workout routines fun, sweaty and incredibly rewarding.',
    rating: 4.7,
    verified: true,
    certificates: ['Malaysia Sports Council Level 1 Coach', 'CPR/AED Red Crescent'],
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADB1ZHt7ssX9NUEls5g3R-nszN8liOzwo4WalDuhO9bP9jbzDIyH69L8_9W1wh7xxOkq5xViXT__xUnRIwlOTP9aS6htvLxLii1PsQ9QqfvJU86pvcMyaiGpRo5JAk5zShen0P1a-2rZNArw-4drQpgrkn6-3A2ZpKEcKYXrZBpRCbHVwGl0l6wpq0W1LymDFOLy0wU_RYGMli3Qwxy4PQhyvx7_0nVWGuaxfO231dYzv42WIS_jvmBP1bK7dwGLiKFT2SOKYHVKo'
  }
];

// Seed Demo Trainees - Only 3 active clients under Sarah Tan
const SEED_TRAINEES: TraineeProfile[] = [
  {
    id: 'te_ahmad',
    userId: 'u_ahmad',
    name: 'Ahmad Bin Ibrahim',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    age: 28,
    weight: 84,
    height: 176,
    goals: 'Weight Loss and Cardio Endurance. Specifically trying to trim down fat and transition to active jogging and weekend hiking.',
    assignedTrainerId: 'tr_sarah',
    streakCount: 5,
    phoneNumber: '+6012-3456789',
    location: 'Subang Jaya'
  },
  {
    id: 'te_ling',
    userId: 'u_ling',
    name: 'Mei Ling Tan',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    age: 31,
    weight: 58,
    height: 162,
    goals: 'Post-Partum abdominal restoration, pelvis-floor alignment, and core recovery.',
    assignedTrainerId: 'tr_sarah',
    streakCount: 8,
    phoneNumber: '+6016-9876543',
    location: 'Petaling Jaya'
  },
  {
    id: 'te_faizul',
    userId: 'u_faizul',
    name: 'Muhammad Faizul',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    age: 31,
    weight: 75,
    height: 170,
    goals: 'Functional hypertrophy and cardiovascular threshold training.',
    assignedTrainerId: 'tr_sarah',
    streakCount: 3,
    phoneNumber: '+6019-3334444',
    location: 'SS15, Subang Jaya'
  }
];

// Seed Workouts Completes
const SEED_WORKOUTS: WorkoutLog[] = [
  {
    id: 'w_1',
    traineeId: 'te_ahmad',
    trainerId: 'tr_sarah',
    date: '2026-06-15',
    workoutType: 'Strength Training',
    duration: 45,
    exercises: [
      { name: 'Kettlebell Goblet Squat', sets: 4, reps: 10, weight: 16 },
      { name: 'Romanian Deadlift', sets: 3, reps: 12, weight: 24 },
      { name: 'Pushups', sets: 3, reps: 15, weight: 0 }
    ],
    notes: 'Good execution of squats. Ahmad felt strong today.',
    trainerFeedback: 'Outstanding focus on keeping the hips back! Proud of your posture.',
    feedbackAt: '2026-06-15'
  },
  {
    id: 'w_2',
    traineeId: 'te_ling',
    trainerId: 'tr_sarah',
    date: '2026-06-16',
    workoutType: 'Pilates',
    duration: 50,
    exercises: [
      { name: 'Pilates Hundred', sets: 1, reps: 100, weight: 0 },
      { name: 'Single Leg Stretch', sets: 3, reps: 12, weight: 0 },
      { name: 'Pelvic Tilted Glute Bridge', sets: 3, reps: 15, weight: 0 }
    ],
    notes: 'Mei Ling recovered abdominal engagement beautifully.',
    trainerFeedback: 'Loved your core synchronization here! Excellent pelvic control.',
    feedbackAt: '2026-06-16'
  }
];

// Seed Nutrition Logs
const SEED_NUTRITION: NutritionLog[] = [
  {
    id: 'n_1',
    traineeId: 'te_ahmad',
    date: '2026-06-18',
    foodName: 'Nasi Lemak Biasa & Fried Egg',
    calories: 650,
    protein: 18,
    carbs: 85,
    fat: 25,
    notes: 'Post-workout brunch in SS15.'
  },
  {
    id: 'n_2',
    traineeId: 'te_ling',
    date: '2026-06-18',
    foodName: 'Grilled Chicken Chop with Salad',
    calories: 450,
    protein: 38,
    carbs: 12,
    fat: 26,
    notes: 'Home cooked dinner.'
  }
];

// Seed Bookings
const SEED_BOOKINGS: BookingSession[] = [
  {
    id: 'b_1',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Bin Ibrahim',
    title: 'HIIT Core Strength',
    type: 'Strength',
    date: '2026-06-20',
    timeSlot: '10:00 AM',
    status: 'Approved',
    location: 'SS15 Studio • Selangor',
    notes: 'Focusing on high intensity spinal extensions and core conditioning',
    packageType: 'Monthly Pack',
    amountPaid: 600,
    paymentStatus: 'Paid'
  },
  {
    id: 'b_2',
    trainerId: 'tr_sarah',
    traineeId: 'te_ling',
    traineeName: 'Mei Ling Tan',
    title: 'Pilates Slimming',
    type: 'Pilates',
    date: '2026-06-20',
    timeSlot: '02:00 PM',
    status: 'Approved',
    location: 'Subang Gym • Selangor',
    notes: 'Reformer posture and abdominal recovery flow',
    packageType: 'Monthly Pack',
    amountPaid: 310,
    paymentStatus: 'Paid'
  },
  {
    id: 'b_3',
    trainerId: 'tr_sarah',
    traineeId: 'te_faizul',
    traineeName: 'Muhammad Faizul',
    title: 'Athletic Strength',
    type: 'Strength',
    date: '2026-06-20',
    timeSlot: '04:00 PM',
    status: 'Approved',
    location: 'PJ Peak Performance',
    notes: 'Olympic weightlifting transitions and posture audits',
    packageType: 'Single Slot',
    amountPaid: 80,
    paymentStatus: 'Paid'
  },
  {
    id: 'b_4',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Bin Ibrahim',
    title: 'HIIT Hypertrophy Booster',
    type: 'Strength',
    date: '2026-06-17',
    timeSlot: '10:00 AM',
    status: 'Approved',
    location: 'SS15 Studio • Selangor',
    notes: 'Spinal extension and posture evaluation',
    packageType: 'Monthly Pack',
    amountPaid: 150,
    paymentStatus: 'Paid'
  },
  {
    id: 'b_5',
    trainerId: 'tr_sarah',
    traineeId: 'te_ling',
    traineeName: 'Mei Ling Tan',
    title: 'Yoga Recovery Flow',
    type: 'Mobility',
    date: '2026-06-17',
    timeSlot: '12:00 PM',
    status: 'Approved',
    location: 'Zoom Virtual Chamber',
    notes: 'Therapeutic hip openers and pelvic floor focus',
    packageType: 'Monthly Pack',
    amountPaid: 150,
    paymentStatus: 'Paid'
  },
  {
    id: 'b_6',
    trainerId: 'tr_sarah',
    traineeId: 'te_faizul',
    traineeName: 'Muhammad Faizul',
    title: 'Metabolic Conditioning',
    type: 'Cardio',
    date: '2026-06-22',
    timeSlot: '12:00 PM',
    status: 'Pending',
    location: 'Studio Loft SS15',
    notes: 'Initial evaluation and baseline cardiorespiratory coaching',
    packageType: 'Single Slot',
    amountPaid: 80,
    paymentStatus: 'Unpaid'
  },
  {
    id: 'b_7',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Bin Ibrahim',
    title: 'Fat Loss Circuit HIIT',
    type: 'Cardio',
    date: '2026-06-22',
    timeSlot: '09:30 AM',
    status: 'Approved',
    location: 'SS15 Studio • Selangor',
    notes: 'Intense calorie-burning full body circuit training',
    packageType: 'Monthly Pack',
    amountPaid: 150,
    paymentStatus: 'Paid'
  },
  {
    id: 'b_8',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Bin Ibrahim',
    title: 'Cardio Endurance Run',
    type: 'Cardio',
    date: '2026-06-25',
    timeSlot: '11:00 AM',
    status: 'Approved',
    location: 'SS15 Studio • Selangor',
    notes: 'Gait analysis and steady-state VO2 Max conditioning',
    packageType: 'Monthly Pack',
    amountPaid: 150,
    paymentStatus: 'Paid'
  }
];

// Prescribed
const SEED_PRESCRIBED: PrescribedWorkout[] = [
  {
    id: 'pw_1',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    workoutType: 'Spinal Extension',
    duration: 35,
    notes: 'Prioritize lower back stabilization.',
    status: 'Pending',
    assignedDate: '2026-06-12',
    exercises: [
      { name: 'Cat Cow', sets: 3, reps: 15, weight: 0 },
      { name: 'Bird Dog', sets: 4, reps: 12, weight: 0 }
    ]
  }
];

// Seed Payments (RM910.00 Monthly Revenue, RM80.00 Pending Payments)
const SEED_PAYMENTS: Payment[] = [
  {
    id: 'p_1',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Bin Ibrahim',
    amount: 600,
    date: '2026-06-10',
    status: 'Paid',
    description: '8 Classes Per Month Subscription',
    itemDescription: '8 Classes Per Month Subscription',
    invoiceNo: 'INV-2026-01',
    receiptNo: 'RC-2026-01',
    packageName: '8 Classes Per Month',
    paymentMethod: 'FPX (Maybank2u)'
  },
  {
    id: 'p_2',
    trainerId: 'tr_sarah',
    traineeId: 'te_ling',
    traineeName: 'Mei Ling Tan',
    amount: 310,
    date: '2026-06-12',
    status: 'Paid',
    description: '4 Classes Per Month Subscription',
    itemDescription: '4 Classes Per Month Subscription',
    invoiceNo: 'INV-2026-02',
    receiptNo: 'RC-2026-02',
    packageName: '4 Classes Per Month',
    paymentMethod: 'Credit Card'
  },
  {
    id: 'p_3',
    trainerId: 'tr_sarah',
    traineeId: 'te_faizul',
    traineeName: 'Muhammad Faizul',
    amount: 80,
    date: '2026-06-15',
    status: 'Unpaid',
    description: 'Single Session coaching slot',
    itemDescription: 'Single Session Slot',
    invoiceNo: 'INV-2026-03',
    packageName: 'Single Session'
  }
];

// Invoices
const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    paymentId: 'p_1',
    invoiceNo: 'INV-2026-01',
    trainerId: 'tr_sarah',
    trainerName: 'Sarah Tan',
    trainerEmail: 'sarah@demo.my',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Bin Ibrahim',
    traineeEmail: 'trainee@demo.my',
    amount: 600,
    date: '2026-06-10',
    dueDate: '2026-06-20',
    status: 'Paid',
    packageName: '8 Classes Per Month',
    paymentMethod: 'FPX',
    receiptNo: 'RC-2026-01',
    items: [{ description: '8 Classes Subscription Pack', quantity: 1, unitPrice: 600, total: 600 }]
  },
  {
    id: 'inv_2',
    paymentId: 'p_2',
    invoiceNo: 'INV-2026-02',
    trainerId: 'tr_sarah',
    trainerName: 'Sarah Tan',
    trainerEmail: 'sarah@demo.my',
    traineeId: 'te_ling',
    traineeName: 'Mei Ling Tan',
    traineeEmail: 'ling@demo.my',
    amount: 310,
    date: '2026-06-12',
    dueDate: '2026-06-22',
    status: 'Paid',
    packageName: '4 Classes Per Month',
    paymentMethod: 'Credit Card',
    receiptNo: 'RC-2026-02',
    items: [{ description: '4 Classes Subscription Pack', quantity: 1, unitPrice: 310, total: 310 }]
  },
  {
    id: 'inv_3',
    paymentId: 'p_3',
    invoiceNo: 'INV-2026-03',
    trainerId: 'tr_sarah',
    trainerName: 'Sarah Tan',
    trainerEmail: 'sarah@demo.my',
    traineeId: 'te_faizul',
    traineeName: 'Muhammad Faizul',
    traineeEmail: 'faizul@demo.my',
    amount: 80,
    date: '2026-06-15',
    dueDate: '2026-06-25',
    status: 'Unpaid',
    packageName: 'Single Session',
    items: [{ description: 'Single coaching hour slot', quantity: 1, unitPrice: 80, total: 80 }]
  }
];

class DemoStorage {
  private db: {
    trainers: TrainerProfile[];
    trainees: TraineeProfile[];
    workouts: WorkoutLog[];
    nutrition: NutritionLog[];
    bookings: BookingSession[];
    prescribedWorkouts: PrescribedWorkout[];
    payments: Payment[];
    invoices: Invoice[];
    chats: ChatMessage[];
    notifications: any[];
    invitations: any[];
  };

  constructor() {
    this.db = {
      trainers: [],
      trainees: [],
      workouts: [],
      nutrition: [],
      bookings: [],
      prescribedWorkouts: [],
      payments: [],
      invoices: [],
      chats: [],
      notifications: [],
      invitations: []
    };
    this.load();
  }

  private load() {
    try {
      const data = localStorage.getItem('coach_track_demo_storage');
      if (data) {
        this.db = JSON.parse(data);
        // FORCE CLEAN UP: If old database has forbidden names or lacks seeded notifications, reset/heal!
        const hasAmir = this.db.trainees && this.db.trainees.some(t => t.name.includes('Amir') || t.name.includes('Jason') || t.name.includes('Aisyah'));
        const lacksNotifications = !this.db.notifications || this.db.notifications.length === 0;
        const lacksNewBookings = !this.db.bookings || !this.db.bookings.some(b => b.id === 'b_8');
        if (hasAmir || lacksNotifications || lacksNewBookings) {
          console.log("Stale database containing old demo users or empty notifications detected. Healing and resyncing CoachTrack MY...");
          this.reset();
        }
      } else {
        this.reset();
      }
    } catch {
      this.reset();
    }
  }

  public save() {
    try {
      localStorage.setItem('coach_track_demo_storage', JSON.stringify(this.db));
    } catch (e) {
      console.error('Failed to save presentation demo data', e);
    }
  }

  public reset() {
    this.db = {
      trainers: JSON.parse(JSON.stringify(SEED_TRAINERS)),
      trainees: JSON.parse(JSON.stringify(SEED_TRAINEES)),
      workouts: JSON.parse(JSON.stringify(SEED_WORKOUTS)),
      nutrition: JSON.parse(JSON.stringify(SEED_NUTRITION)),
      bookings: JSON.parse(JSON.stringify(SEED_BOOKINGS)),
      prescribedWorkouts: JSON.parse(JSON.stringify(SEED_PRESCRIBED)),
      payments: JSON.parse(JSON.stringify(SEED_PAYMENTS)),
      invoices: JSON.parse(JSON.stringify(SEED_INVOICES)),
      chats: [],
      notifications: [
        {
          id: 'n_notif_1',
          userId: 'te_ahmad',
          message: 'Coach Sarah Tan scheduled a new HIIT Core Strength session for 20 Jun 2026 at 10:00 AM at SS15 Studio, Selangor.',
          read: false,
          createdAt: '18 Jun 2026',
          type: 'schedule'
        },
        {
          id: 'n_notif_2',
          userId: 'te_ahmad',
          message: 'Coach Sarah Tan reviewed your meal log (Nasi Lemak Biasa) and added advice: "Try adding a hard boiled egg instead of fried next time to cut down on fat. Keep it up!"',
          read: false,
          createdAt: '18 Jun 2026',
          type: 'nutrition'
        },
        {
          id: 'n_notif_3',
          userId: 'te_ahmad',
          message: 'New Invoice Issued: INV-2026-01 for RM600 (8 Classes Per Month Subscription). Due by 20 Jun 2026.',
          read: false,
          createdAt: '10 Jun 2026',
          type: 'invoice'
        },
        {
          id: 'n_notif_4',
          userId: 'te_ahmad',
          message: 'Payment Confirmed: Received RM600 for subscription receipt RC-2026-01.',
          read: true,
          createdAt: '10 Jun 2026',
          type: 'payment'
        },
        {
          id: 'n_notif_5',
          userId: 'te_ahmad',
          message: 'Coach Sarah Tan added workout feedback to your Strength Training log: "Outstanding focus on keeping the hips back! Proud of your posture."',
          read: false,
          createdAt: '15 Jun 2026',
          type: 'workout'
        }
      ],
      invitations: [
        {
          id: 'inv_sarah_1',
          trainerId: 'tr_sarah',
          trainerName: 'Coach Sarah Tan',
          traineeEmail: 'trainee@demo.my',
          packageName: '8 Classes Per Month',
          sessions: 8,
          price: 600,
          status: 'Pending',
          createdAt: '25 Jun 2026'
        }
      ]
    };
    this.save();
  }

  public get Trainers() { return this.db.trainers; }
  public get Trainees() { return this.db.trainees; }
  public get Workouts() { return this.db.workouts; }
  public get Nutrition() { return this.db.nutrition; }
  public get Bookings() { return this.db.bookings; }
  public get PrescribedWorkouts() { return this.db.prescribedWorkouts; }
  public get Payments() { return this.db.payments; }
  public get Invoices() { return this.db.invoices; }
  public get Chats() { return this.db.chats; }
  public get Notifications() { return this.db.notifications; }
  public get Invitations() { return this.db.invitations; }
}

export const demoStorage = new DemoStorage();

export const demoDataService = {
  reset() {
    demoStorage.reset();
  },

  async searchNearbyTrainers(lat: number, lng: number, radiusKm: number, discipline: string): Promise<(TrainerProfile & { distance: number })[]> {
    let list = demoStorage.Trainers.map(item => {
      const distance = calculateDistance(lat, lng, item.coordinates.lat, item.coordinates.lng);
      return { ...item, distance: Number(distance.toFixed(2)) };
    });
    list = list.filter(t => t.distance <= radiusKm);
    if (discipline) {
      list = list.filter(t => t.discipline.toLowerCase().includes(discipline.toLowerCase()));
    }
    return list;
  },

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    const item = demoStorage.Trainers.find(t => t.userId === userId || t.id === userId);
    return item ? { ...item } : null;
  },

  async getTraineeProfile(userId: string): Promise<TraineeProfile | null> {
    const item = demoStorage.Trainees.find(t => t.userId === userId || t.id === userId);
    return item ? { ...item } : null;
  },

  async getTraineesForTrainer(trainerId: string): Promise<TraineeProfile[]> {
    return demoStorage.Trainees.filter(t => t.assignedTrainerId === trainerId).map(t => ({ ...t }));
  },

  async unassignTrainee(traineeId: string): Promise<boolean> {
    const item = demoStorage.Trainees.find(t => t.id === traineeId);
    if (item) {
      delete item.assignedTrainerId;
      demoStorage.save();
      return true;
    }
    return false;
  },

  async getWorkouts(filters: { traineeId?: string; trainerId?: string }): Promise<WorkoutLog[]> {
    let list = demoStorage.Workouts;
    if (filters.traineeId) list = list.filter(w => w.traineeId === filters.traineeId);
    if (filters.trainerId) list = list.filter(w => w.trainerId === filters.trainerId);
    return list.map(w => ({ ...w }));
  },

  async createWorkoutLog(workout: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog | null> {
    const log: WorkoutLog = { ...workout, id: genId('w') };
    demoStorage.Workouts.push(log);
    demoStorage.save();
    return log;
  },

  async addWorkoutFeedback(workoutId: string, feedback: string): Promise<boolean> {
    const item = demoStorage.Workouts.find(w => w.id === workoutId);
    if (item) {
      item.trainerFeedback = feedback;
      item.feedbackAt = new Date().toISOString().substring(0, 10);
      demoStorage.save();
      return true;
    }
    return false;
  },

  async getNutrition(traineeId: string): Promise<NutritionLog[]> {
    return demoStorage.Nutrition.filter(n => n.traineeId === traineeId).map(n => ({ ...n }));
  },

  async createNutritionLog(log: Omit<NutritionLog, 'id'>): Promise<NutritionLog | null> {
    const entry: NutritionLog = { ...log, id: genId('n') };
    demoStorage.Nutrition.push(entry);
    demoStorage.save();
    return entry;
  },

  async addNutritionFeedback(nutritionId: string, feedback: string): Promise<boolean> {
    const item = demoStorage.Nutrition.find(n => n.id === nutritionId);
    if (item) {
      item.trainerFeedback = feedback;
      item.feedbackAt = new Date().toISOString().substring(0, 10);
      demoStorage.save();
      return true;
    }
    return false;
  },

  async getBookings(filters: { traineeId?: string; trainerId?: string }): Promise<BookingSession[]> {
    let list = demoStorage.Bookings;
    if (filters.traineeId) list = list.filter(b => b.traineeId === filters.traineeId);
    if (filters.trainerId) list = list.filter(b => b.trainerId === filters.trainerId);
    return list.map(b => ({ ...b }));
  },

  async createBooking(booking: Omit<BookingSession, 'id'>): Promise<BookingSession | null> {
    const ent: BookingSession = { ...booking, id: genId('b') };
    demoStorage.Bookings.push(ent);
    demoStorage.save();
    return ent;
  },

  async updateBookingStatus(
    bookingId: string, 
    status: 'Approved' | 'Cancelled' | 'Completed' | 'Reschedule Requested', 
    newDate?: string, 
    newTimeSlot?: string,
    requestedDate?: string,
    requestedTimeSlot?: string
  ): Promise<boolean> {
    const item = demoStorage.Bookings.find(b => b.id === bookingId);
    if (item) {
      item.status = status;
      if (status === 'Reschedule Requested') {
        item.requestedDate = requestedDate;
        item.requestedTimeSlot = requestedTimeSlot;
      } else {
        if (newDate) {
          item.date = newDate;
        }
        if (newTimeSlot) {
          item.timeSlot = newTimeSlot;
        }
        item.requestedDate = undefined;
        item.requestedTimeSlot = undefined;
      }
      demoStorage.save();
      return true;
    }
    return false;
  },

  async getPrescribedWorkouts(traineeId: string, status = 'Pending'): Promise<PrescribedWorkout[]> {
    return demoStorage.PrescribedWorkouts.filter(pw => pw.traineeId === traineeId && pw.status === status).map(pw => ({ ...pw }));
  },

  async createPrescribedWorkout(pw: Omit<PrescribedWorkout, 'id' | 'status' | 'assignedDate'>): Promise<PrescribedWorkout | null> {
    const ent: PrescribedWorkout = { 
      ...pw, 
      id: genId('pw'), 
      status: 'Pending', 
      assignedDate: new Date().toISOString().substring(0, 10) 
    };
    demoStorage.PrescribedWorkouts.push(ent);
    demoStorage.save();
    return ent;
  },

  async checkInPrescribedWorkout(pwId: string, actualExercises: any[], duration: number, notes: string): Promise<boolean> {
    const item = demoStorage.PrescribedWorkouts.find(pw => pw.id === pwId);
    if (item) {
      item.status = 'Logged';
      // Create a workout log too!
      await this.createWorkoutLog({
        traineeId: item.traineeId,
        trainerId: item.trainerId,
        date: new Date().toISOString().substring(0, 10),
        workoutType: item.workoutType,
        duration: duration || item.duration,
        exercises: actualExercises,
        notes: notes || 'Prescribed workout checked in!'
      });
      demoStorage.save();
      return true;
    }
    return false;
  },

  async getChats(userA: string, userB: string): Promise<ChatMessage[]> {
    return demoStorage.Chats.filter(c => 
      (c.senderId === userA && c.receiverId === userB) ||
      (c.senderId === userB && c.receiverId === userA)
    ).map(c => ({ ...c }));
  },

  async createChatMessage(chat: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    const msg: ChatMessage = {
      ...chat,
      id: genId('msg'),
      timestamp: new Date().toISOString()
    };
    demoStorage.Chats.push(msg);
    demoStorage.save();
    return msg;
  },

  async getPayments(filters: { traineeId?: string; trainerId?: string }): Promise<Payment[]> {
    let list = demoStorage.Payments;
    if (filters.traineeId) list = list.filter(p => p.traineeId === filters.traineeId);
    if (filters.trainerId) list = list.filter(p => p.trainerId === filters.trainerId);
    return list.map(p => ({ ...p }));
  },

  async createInvoice(invoice: { trainerId: string; traineeId: string; amount: number; itemDescription: string; dueDate: string }): Promise<any> {
    const pid = genId('p');
    const invId = genId('inv');
    const invoiceNo = `INV-2026-${Math.floor(Math.random() * 9000 + 1000)}`;

    const trainee = await this.getTraineeProfile(invoice.traineeId);
    const trainer = await this.getTrainerProfile(invoice.trainerId);

    const payment: Payment = {
      id: pid,
      trainerId: invoice.trainerId,
      traineeId: invoice.traineeId,
      traineeName: trainee?.name || 'Trainee Athlete',
      amount: invoice.amount,
      date: new Date().toISOString().substring(0, 10),
      status: 'Unpaid',
      description: invoice.itemDescription,
      dueDate: invoice.dueDate,
      itemDescription: invoice.itemDescription,
      invoiceNo: invoiceNo,
      packageName: invoice.itemDescription
    };

    const finalInvoice: Invoice = {
      id: invId,
      paymentId: pid,
      invoiceNo: invoiceNo,
      trainerId: invoice.trainerId,
      trainerName: trainer?.name || 'Coach Name',
      trainerEmail: trainer?.userId || 'trainer@demo.my',
      traineeId: invoice.traineeId,
      traineeName: trainee?.name || 'Trainee Name',
      traineeEmail: trainee?.userId || 'trainee@demo.my',
      amount: invoice.amount,
      date: new Date().toISOString().substring(0, 10),
      dueDate: invoice.dueDate,
      status: 'Unpaid',
      packageName: invoice.itemDescription,
      items: [{ description: invoice.itemDescription, quantity: 1, unitPrice: invoice.amount, total: invoice.amount }]
    };

    demoStorage.Payments.push(payment);
    demoStorage.Invoices.push(finalInvoice);
    demoStorage.save();
    return { success: true, payment, invoice: finalInvoice };
  },

  async payInvoice(paymentId: string): Promise<boolean> {
    const payment = demoStorage.Payments.find(p => p.id === paymentId);
    const invoice = demoStorage.Invoices.find(i => i.paymentId === paymentId);
    if (payment) {
      payment.status = 'Paid';
      payment.receiptNo = `RC-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
      payment.paymentMethod = 'Online Banking FPX';
      if (invoice) {
        invoice.status = 'Paid';
        invoice.receiptNo = payment.receiptNo;
        invoice.paymentMethod = payment.paymentMethod;
      }
      demoStorage.save();
      return true;
    }
    return false;
  },

  async getInvitations(filters: { traineeId?: string; trainerId?: string }): Promise<any[]> {
    let list = demoStorage.Invitations;
    if (filters.traineeId) list = list.filter(i => i.traineeId === filters.traineeId);
    if (filters.trainerId) list = list.filter(i => i.trainerId === filters.trainerId);
    return list.map(i => ({ ...i }));
  },

  async createInvitation(invitation: { trainerId: string; traineeEmail: string; packageName: string; sessions: number; price: number }): Promise<any> {
    const ent = {
      id: genId('invt'),
      trainerId: invitation.trainerId,
      traineeEmail: invitation.traineeEmail,
      packageName: invitation.packageName,
      sessions: invitation.sessions,
      price: invitation.price,
      status: 'Pending',
      date: new Date().toISOString().substring(0, 10)
    };
    demoStorage.Invitations.push(ent);
    demoStorage.save();
    return ent;
  },

  async respondToInvitation(id: string, status: 'Accepted' | 'Declined'): Promise<any> {
    const item = demoStorage.Invitations.find(i => i.id === id);
    if (item) {
      item.status = status;
      demoStorage.save();
      return item;
    }
    return null;
  },

  async getNotifications(userId: string): Promise<any[]> {
    return demoStorage.Notifications.filter(n => n.userId === userId).map(n => ({ ...n }));
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const item = demoStorage.Notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      demoStorage.save();
      return true;
    }
    return false;
  }
};
