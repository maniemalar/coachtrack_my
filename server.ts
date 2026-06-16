import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { 
  UserRole, 
  TrainerProfile, 
  TraineeProfile, 
  WorkoutLog, 
  NutritionLog, 
  BookingSession, 
  ChatMessage, 
  Payment, 
  Invoice,
  PrescribedWorkout
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to file-based persistent database
const DB_FILE = path.join(process.cwd(), 'database.json');

// Initialize Gemini Client
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Initial Seed Data
const DEFAULT_TRAINERS: TrainerProfile[] = [
  {
    id: 'tr_sarah',
    userId: 'u_sarah',
    name: 'Sarah Tan',
    discipline: 'Yoga & Pilates Instructor',
    experienceYears: 6,
    location: 'SS15, Subang Jaya',
    coordinates: { lat: 3.0792, lng: 101.5950 }, // ss15 subang
    freelanceStatus: 'Freelance',
    pricePerHour: 110,
    bio: 'Dedicated to helping office workers improve flexibility, core strength, and mindfulness right here in Klang Valley. Specialized in therapeutic yoga.',
    rating: 4.8,
    verified: true,
    certificates: ['Certified RYT-500 Yoga Alliance', 'Kinesiology Rehab Diploma'],
    idProofUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdbLazpc2A4eSVhZ_CtAZRTFHNzG3kufmetnxoPLqJqd9Ba1uofmyihn_1XwWE-LFDpPVzy29OMxa5G29qGx3p8kBoe7SZmtqdvrC3El-KKNpBro7q-NKPkywkzkVVPgzfg3cfVHfucP48F4UbrcjhECaqEi5jpLyQPCRELWCt-LEt42L3swdSCYFndC3CR61tZIU2ILlHSOF-UU5T8S3WSIVxg054c1xPEN6J8k4d8bFe0Aneqp9rB8FT_wF1RbSXTa5Jw6SPRHY'
  },
  {
    id: 'tr_faiz',
    userId: 'u_faiz',
    name: 'Coach Faiz Subri',
    discipline: 'Strength & Conditioning',
    experienceYears: 8,
    location: 'SS15, Subang Jaya',
    coordinates: { lat: 3.0789, lng: 101.5944 }, // ss15 subang
    freelanceStatus: 'Boutique Studio',
    pricePerHour: 130,
    bio: 'Powerlifter and sports conditioning coach. I build customized plans to maximize athletic output and lean muscle gains. High energy, results-focused!',
    rating: 4.9,
    verified: true,
    certificates: ['NASM Certified Personal Trainer', 'FISAF International Gold Cert'],
    idProofUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=120',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuIdggY96cPbYkxhPMHyYSEZQVUCfWOJP3N_XjZHy2cjbfbBe8s3VMjo0eHn80_fcIMAAAF9XsmYOwUEthMnXcvB4974Gmf0oHIP2pwWjW-434vE_vl-DsdIsKv3zP1v9Qso_eKmrZoTS81FTK7orVBn9iZdZqrfXeN7X39OP9QLt2cgD0bSNT3HVELQeobUuSzw2qzsVS1XFYG5l31bH9DauPRuk-3ihxIl0wsjV28iH1BPJsDdxxTauVSBToRTmaBW0973wtxfo8'
  },
  {
    id: 'tr_rishi',
    userId: 'u_rishi',
    name: 'Rishi Kumar',
    discipline: 'HIIT & Fat Loss Specialist',
    experienceYears: 5,
    location: 'Damansara Utama (UPTOWN), PJ',
    coordinates: { lat: 3.1365, lng: 101.6215 }, // Uptown PJ
    freelanceStatus: 'Freelance',
    pricePerHour: 95,
    bio: 'Fusing calisthenics and kettlebells for high-calorie-burning training. I make workout routines fun, sweaty and incredibly rewarding.',
    rating: 4.7,
    verified: true,
    certificates: ['Malaysia Sports Council Level 1 Coach', 'CPR/AED Red Crescent'],
    idProofUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADB1ZHt7ssX9NUEls5g3R-nszN8liOzwo4WalDuhO9bP9jbzDIyH69L8_9W1wh7xxOkq5xViXT__xUnRIwlOTP9aS6htvLxLii1PsQ9QqfvJU86pvcMyaiGpRo5JAk5zShen0P1a-2rZNArw-4drQpgrkn6-3A2ZpKEcKYXrZBpRCbHVwGl0l6wpq0W1LymDFOLy0wU_RYGMli3Qwxy4PQhyvx7_0nVWGuaxfO231dYzv42WIS_jvmBP1bK7dwGLiKFT2SOKYHVKo'
  },
  {
    id: 'tr_chloe',
    userId: 'u_chloe',
    name: 'Chloe Lim',
    discipline: 'Boutique Studio Owner & Coach',
    experienceYears: 10,
    location: 'Cheras, Kuala Lumpur',
    coordinates: { lat: 3.1028, lng: 101.7314 }, // Cheras
    freelanceStatus: 'Gym Operator',
    pricePerHour: 150,
    bio: 'Coaching groups and individuals to sustainable health. Merging wellness therapy, strength work, and nutritional guidance for busy moms.',
    rating: 5.0,
    verified: true,
    certificates: ['Certified Exercise Physiologist ACE', 'Malaysia Gym Association Cert'],
    idProofUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1rZ0p8JfF22KjDhd7LCu9s8Mo-0BJrqC0PY6JwElGB9xI_RQ9EOjj1KzAEVN8sSPVrJDL04GRjBsjafOYVDqs_Z9RSahcAQ30rFG26y4WGWE6YXkekijE4cDjrbaCoZz8kqJGLb1wV6EXyKy289Rp1OWjm-At_SPu-GV3p4TdSEpiFfVjpJN4wf5P0561ZdXzSutqlhFTvjXA87jvm8LeM23mYNasagInqlzwREH1g5i222PmLYrFgO3Srt5XkIQuEmPhRz4OOLs'
  }
];

const DEFAULT_TRAINEES: TraineeProfile[] = [
  {
    id: 'te_ahmad',
    userId: 'u_ahmad',
    name: 'Ahmad bin Ibrahim',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm6XjkajKC1E-auUB-6Sr-GyTGI4zsoY-YEgT0MAl6pw_jL3uSF-kMR6I3SCISx-0HXh-tcAf99gfuoVVhzN1P1HU5oCZk0WWchxWKY22ATwB-APrTezY3HVTAOMGVpXNApLlt1VIzi9o8yJXJ5nQRsSmRHOuxBYfJf_533KGGsCsvrxpZ_3m5uxZ9KZr2L6dBuXJkWmoMBDY9z_YnDYNr0b8EJ3Tyw-sPE0l5vW78317CdkDStSWtXZxNwtq6QaBgqW3N2oV2two',
    age: 28,
    weight: 84,
    height: 176,
    goals: 'Weight Loss and Cardio Endurance. Specifically trying to trim down fat and transition to active jogging and weekend hiking.',
    assignedTrainerId: 'tr_sarah',
    streakCount: 5
  },
  {
    id: 'te_ling',
    userId: 'u_ling',
    name: 'Mei Ling Tan',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
    age: 31,
    weight: 58,
    height: 162,
    goals: 'Post-Partum abdominal restoration, pelvis floor alignment, and flexibility improvement.',
    assignedTrainerId: 'tr_sarah',
    streakCount: 8
  },
  {
    id: 'te_faizul',
    userId: 'u_faizul',
    name: 'Muhammad Faizul',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    age: 24,
    weight: 92,
    height: 180,
    goals: 'Powerlifting hyper-focus. Trying to target 180kg deadlift by end of quarter while avoiding lumbar spine injury.',
    assignedTrainerId: 'tr_sarah',
    streakCount: 3
  }
];

const DEFAULT_USERS = [
  { id: 'u_sarah', email: 'sarah@trainer.my', role: UserRole.TRAINER, name: 'Sarah Tan' },
  { id: 'u_faiz', email: 'faiz@trainer.my', role: UserRole.TRAINER, name: 'Coach Faiz' },
  { id: 'u_rishi', email: 'rishi@trainer.my', role: UserRole.TRAINER, name: 'Rishi Kumar' },
  { id: 'u_chloe', email: 'chloe@trainer.my', role: UserRole.TRAINER, name: 'Chloe Lim' },
  { id: 'u_ahmad', email: 'ahmad@trainee.my', role: UserRole.TRAINEE, name: 'Ahmad Ibrahim' }
];

const DEFAULT_WORKOUTS: WorkoutLog[] = [
  {
    id: 'w_1',
    traineeId: 'te_ahmad',
    trainerId: 'tr_sarah',
    date: '2026-06-10',
    workoutType: 'Strength & Core',
    duration: 45,
    exercises: [
      { name: 'Goblet Squats', sets: 4, reps: 12, weight: 16 },
      { name: 'Dumbbell Chest Press', sets: 3, reps: 10, weight: 14 },
      { name: 'Plank Hold', sets: 3, reps: 60, weight: 0 },
      { name: 'Romanian Deadlifts', sets: 3, reps: 12, weight: 24 }
    ],
    notes: 'Pushed hard in squats! Felt slight tightness in upper shoulders during planks.',
    trainerFeedback: 'Awesome squat form today, Ahmad! Let’s keep track of that shoulder tightness. Do 5 minutes of target rotator stretch tomorrow.',
    feedbackAt: '2026-06-10T09:30:00Z',
    videoUrl: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054fb1d23eb5d9f07144e5ccb485c64&profile_id=139&oauth2_token_id=57447761'
  }
];

const DEFAULT_NUTRITION: NutritionLog[] = [
  {
    id: 'n_1',
    traineeId: 'te_ahmad',
    date: '2026-06-11',
    foodName: 'Nasi Lemak with Fried Egg (Biasa)',
    calories: 650,
    protein: 15,
    carbs: 80,
    fat: 25,
    notes: 'Breakfast with Teh Tarik kurang manis. Tried not to drink all the sweet curry.',
    trainerFeedback: 'Nice choice for keeping curry in check, Ahmad! Try adding a hard boiled egg instead of fried next time to cut down on fat. Keep it up!',
    feedbackAt: '2026-06-11T03:15:00Z'
  }
];

const DEFAULT_BOOKINGS: BookingSession[] = [
  {
    id: 'b_1',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Ibrahim',
    date: '2026-06-12',
    timeSlot: '10:00 AM',
    status: 'Approved',
    location: 'Bangsar Gym Center',
    notes: 'Focus on breathing control & squat posture setup.'
  }
];

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: 'c_1',
    senderId: 'u_sarah',
    receiverId: 'u_ahmad',
    message: 'Hello Ahmad, looking forward to our session tomorrow. Make sure to sleep well tonight and drink enough water!',
    timestamp: '2026-06-11T12:00:00Z'
  },
  {
    id: 'c_2',
    senderId: 'u_ahmad',
    receiverId: 'u_sarah',
    message: 'Thanks coach Sarah! I logged my breakfast just now. Nasi Lemak tapi kurang manis.',
    timestamp: '2026-06-11T12:05:00Z'
  }
];

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'p_1',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Ibrahim',
    amount: 330,
    date: '2026-06-05',
    status: 'Paid',
    description: '3x Private Yoga & Conditioning Sessions Pack'
  },
  {
    id: 'p_2',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Ibrahim',
    amount: 110,
    date: '2026-06-11',
    status: 'Unpaid',
    description: '1x Custom Goal Assessment & Stretch Session'
  }
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    paymentId: 'p_1',
    invoiceNo: 'COACH-2026-0034',
    trainerId: 'tr_sarah',
    trainerName: 'Sarah Tan',
    trainerEmail: 'sarah@trainer.my',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Ibrahim',
    traineeEmail: 'ahmad@trainee.my',
    amount: 330,
    date: '2026-06-05',
    dueDate: '2026-06-05',
    status: 'Paid',
    items: [
      {
        description: 'Elite Level Private Personal Coaching Hour',
        quantity: 3,
        unitPrice: 110,
        total: 330
      }
    ]
  },
  {
    id: 'inv_2',
    paymentId: 'p_2',
    invoiceNo: 'COACH-2026-0045',
    trainerId: 'tr_sarah',
    trainerName: 'Sarah Tan',
    trainerEmail: 'sarah@trainer.my',
    traineeId: 'te_ahmad',
    traineeName: 'Ahmad Ibrahim',
    traineeEmail: 'ahmad@trainee.my',
    amount: 110,
    date: '2026-06-11',
    dueDate: '2026-06-18',
    status: 'Unpaid',
    items: [
      {
        description: 'Custom Physical Assessment (Klang Valley Standard)',
        quantity: 1,
        unitPrice: 110,
        total: 110
      }
    ]
  }
];

const DEFAULT_PRESCRIBED: PrescribedWorkout[] = [
  {
    id: 'pw_1',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    workoutType: 'Pilates Core Focus (Assigned by Coach Sarah)',
    duration: 35,
    exercises: [
      { name: 'Hundred Exercises Pilates', sets: 1, reps: 100, weight: 0 },
      { name: 'Single-leg Circles', sets: 3, reps: 12, weight: 0 },
      { name: 'Criss-Cross Abdominal Burn', sets: 4, reps: 16, weight: 0 },
      { name: 'Pilates Spine Stretch', sets: 3, reps: 10, weight: 0 }
    ],
    notes: 'Ahmad, focus on absolute breathing cycles. Keep abdomen drawn in on every exhalation.',
    status: 'Pending',
    assignedDate: '2026-06-11'
  },
  {
    id: 'pw_2',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    workoutType: 'Bangsar Posture Restoration',
    duration: 50,
    exercises: [
      { name: 'Kettlebell Romanian Deadlift', sets: 4, reps: 12, weight: 16 },
      { name: 'Dand / Hindu Pushups', sets: 3, reps: 8, weight: 0 },
      { name: 'Bird Dog Isometric Hold', sets: 3, reps: 5, weight: 0 },
      { name: 'Glute Bridge Raises', sets: 3, reps: 15, weight: 12 }
    ],
    notes: 'Focus on posture and lower spine strength. Perform early in the morning before breakfast.',
    status: 'Pending',
    assignedDate: '2026-06-12'
  }
];

// Load Database
let dbData = {
  users: DEFAULT_USERS,
  trainers: DEFAULT_TRAINERS,
  trainees: DEFAULT_TRAINEES,
  workouts: DEFAULT_WORKOUTS,
  nutrition: DEFAULT_NUTRITION,
  bookings: DEFAULT_BOOKINGS,
  chats: DEFAULT_CHATS,
  payments: DEFAULT_PAYMENTS,
  invoices: DEFAULT_INVOICES,
  prescribedWorkouts: DEFAULT_PRESCRIBED,
  invitations: [] as any[],
  notifications: [] as any[]
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      // Merge with default items in case user adds something
      dbData = { ...dbData, ...parsed };
    } else {
      writeDb();
    }
  } catch (err) {
    console.error('Error reading DB:', err);
  }
}

function writeDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

readDb();

// Haversine function to calculate accurate distance in km
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

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = dbData.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Auto allow demo profiles
  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatarUrl: user.role === UserRole.TRAINER 
        ? (dbData.trainers.find(t => t.userId === user.id)?.avatarUrl || '') 
        : (dbData.trainees.find(t => t.userId === user.id)?.avatarUrl || '')
    }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, role, trainerDiscipline, location, freelanceStatus, price } = req.body;
  
  const exists = dbData.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const userId = `u_${Date.now()}`;
  const newUser = { id: userId, email, role, name };
  dbData.users.push(newUser);

  if (role === UserRole.TRAINER) {
    const trainerId = `tr_${Date.now()}`;
    const newTrainer: TrainerProfile = {
      id: trainerId,
      userId,
      name,
      discipline: trainerDiscipline || 'Fitness Personal Trainer',
      experienceYears: 1,
      location: location || 'Kuala Lumpur',
      coordinates: { lat: 3.1390, lng: 101.6869 }, // default center
      freelanceStatus: freelanceStatus || 'Freelance',
      pricePerHour: Number(price) || 80,
      bio: 'New certified CoachTrack MY fitness professional ready to train clients.',
      rating: 5.0,
      verified: false, // Wait for admin upload
      certificates: [],
      avatarUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
    };
    dbData.trainers.push(newTrainer);
  } else {
    const traineeId = `te_${Date.now()}`;
    const newTrainee: TraineeProfile = {
      id: traineeId,
      userId,
      name,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      age: 25,
      weight: 70,
      height: 170,
      goals: 'General fitness, stamina improvement and lifestyle adjustment.',
      streakCount: 0
    };
    dbData.trainees.push(newTrainee);
  }

  writeDb();
  res.json({
    user: {
      id: userId,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      avatarUrl: role === UserRole.TRAINER 
        ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=120'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
    }
  });
});

// Update Trainer Verification Documents
app.post('/api/trainers/:trainerId/verify', (req, res) => {
  const { trainerId } = req.params;
  const { certName, idName } = req.body;
  const trainer = dbData.trainers.find(t => t.id === trainerId);
  
  if (!trainer) {
    return res.status(404).json({ message: 'Trainer not found' });
  }

  if (certName && !trainer.certificates.includes(certName)) {
    trainer.certificates.push(certName);
  }
  trainer.verified = true; // Auto verify for testing MVP
  
  writeDb();
  res.json({ message: 'Trainer profile document verified successfully!', trainer });
});

// Trainees and Trainer near me search
app.get('/api/trainers/search', (req, res) => {
  const { lat, lng, radius, discipline } = req.query;
  const userLat = lat ? Number(lat) : 3.1390; // Default KL Center
  const userLng = lng ? Number(lng) : 101.6869;
  const searchRadius = radius ? Number(radius) : 10; // km

  let filtered = dbData.trainers.map(t => {
    const distanceVal = calculateDistance(userLat, userLng, t.coordinates.lat, t.coordinates.lng);
    return {
      ...t,
      distance: Number(distanceVal.toFixed(2))
    };
  });

  // Filter within radius (10km default)
  filtered = filtered.filter(t => t.distance <= searchRadius);

  if (discipline) {
    filtered = filtered.filter(t => t.discipline.toLowerCase().includes(discipline.toString().toLowerCase()));
  }

  res.json(filtered);
});

// Get Trainer Details
app.get('/api/trainers/:id', (req, res) => {
  const trainer = dbData.trainers.find(t => t.id === req.params.id || t.userId === req.params.id);
  if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
  res.json(trainer);
});

// Get All Trainees (with optional trainerId filter)
app.get('/api/trainees', (req, res) => {
  const { trainerId } = req.query;
  let list = dbData.trainees || [];
  if (trainerId) {
    list = list.filter(t => t.assignedTrainerId === trainerId);
  }
  res.json(list);
});

// Get Trainee Profile
app.get('/api/trainees/:userId', (req, res) => {
  const trainee = dbData.trainees.find(t => t.userId === req.params.userId || t.id === req.params.userId);
  if (!trainee) return res.status(404).json({ message: 'Trainee profile not found' });
  res.json(trainee);
});

// Update Trainee Target Info
app.post('/api/trainees/:traineeId/profile', (req, res) => {
  const { traineeId } = req.params;
  const { weight, height, goals } = req.body;
  const trainee = dbData.trainees.find(t => t.id === traineeId || t.userId === traineeId);
  if (!trainee) return res.status(404).json({ message: 'Trainee not found' });

  if (weight) trainee.weight = Number(weight);
  if (height) trainee.height = Number(height);
  if (goals) trainee.goals = goals;

  writeDb();
  res.json(trainee);
});

// Remove trainee-trainer association / relationship
app.post('/api/trainees/:traineeId/unassign', (req, res) => {
  const { traineeId } = req.params;
  const trainee = dbData.trainees.find(t => t.id === traineeId || t.userId === traineeId);
  if (!trainee) return res.status(404).json({ message: 'Trainee profile not found' });
  
  trainee.assignedTrainerId = '';
  writeDb();
  res.json({ success: true, message: 'Client removed from coaching roster' });
});

// Workout Logs
app.get('/api/workouts', (req, res) => {
  const { traineeId, trainerId } = req.query;
  let list = dbData.workouts;
  if (traineeId) list = list.filter(w => w.traineeId === traineeId);
  if (trainerId) list = list.filter(w => w.trainerId === trainerId);
  res.json(list);
});

app.post('/api/workouts', (req, res) => {
  const { traineeId, trainerId, workoutType, duration, exercises, notes } = req.body;
  const newLog: WorkoutLog = {
    id: `w_${Date.now()}`,
    traineeId,
    trainerId,
    date: new Date().toISOString().split('T')[0],
    workoutType: workoutType || 'General Workout',
    duration: duration ? Number(duration) : 45,
    exercises: exercises || [],
    notes: notes || ''
  };

  dbData.workouts.push(newLog);
  
  // Increment streak
  const trainee = dbData.trainees.find(t => t.id === traineeId || t.userId === traineeId);
  if (trainee) trainee.streakCount += 1;

  writeDb();
  res.json(newLog);
});

app.post('/api/workouts/:id/reply', (req, res) => {
  const { id } = req.params;
  const { feedback, status } = req.body;
  const workout = dbData.workouts.find(w => w.id === id);
  if (!workout) return res.status(404).json({ message: 'Workout not found' });

  workout.trainerFeedback = feedback;
  workout.feedbackAt = new Date().toISOString();
  if (status) {
    workout.status = status;
  } else {
    workout.status = 'Approved';
  }

  // Connect user account to create an in-app chat message automatically from Trainer
  const trainer = dbData.trainers.find(t => t.id === workout.trainerId);
  if (trainer) {
    const recipientTrainee = dbData.trainees.find(te => te.id === workout.traineeId);
    if (recipientTrainee) {
      const chatMsg: ChatMessage = {
        id: `c_${Date.now()}`,
        senderId: trainer.userId,
        receiverId: recipientTrainee.userId,
        message: `Feedback for Workout [${workout.workoutType}]: ${feedback}`,
        timestamp: new Date().toISOString(),
        replyToType: 'WORKOUT',
        replyToId: workout.id,
        replyToTitle: workout.workoutType
      };
      dbData.chats.push(chatMsg);
    }
  }

  writeDb();
  res.json(workout);
});

// Nutrition Logs
app.get('/api/nutrition', (req, res) => {
  const { traineeId } = req.query;
  let list = dbData.nutrition;
  if (traineeId) list = list.filter(n => n.traineeId === traineeId);
  res.json(list);
});

app.post('/api/nutrition', (req, res) => {
  const { traineeId, foodName, calories, protein, carbs, fat, notes } = req.body;
  const newLog: NutritionLog = {
    id: `n_${Date.now()}`,
    traineeId,
    date: new Date().toISOString().split('T')[0],
    foodName,
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    notes: notes || ''
  };

  dbData.nutrition.push(newLog);
  writeDb();
  res.json(newLog);
});

app.post('/api/nutrition/:id/reply', (req, res) => {
  const { id } = req.params;
  const { feedback, trainerId } = req.body;
  const nutrition = dbData.nutrition.find(n => n.id === id);
  if (!nutrition) return res.status(404).json({ message: 'Nutrition log not found' });

  nutrition.trainerFeedback = feedback;
  nutrition.feedbackAt = new Date().toISOString();

  // Sync to chat as "Replying to Nutrition Tracker"
  const trainer = dbData.trainers.find(t => t.id === trainerId);
  if (trainer) {
    const recipientTrainee = dbData.trainees.find(te => te.id === nutrition.traineeId);
    if (recipientTrainee) {
      const chatMsg: ChatMessage = {
        id: `c_${Date.now()}`,
        senderId: trainer.userId,
        receiverId: recipientTrainee.userId,
        message: `Nutrition Reply [${nutrition.foodName}]: ${feedback}`,
        timestamp: new Date().toISOString(),
        replyToType: 'NUTRITION',
        replyToId: nutrition.id,
        replyToTitle: nutrition.foodName
      };
      dbData.chats.push(chatMsg);
    }
  }

  writeDb();
  res.json(nutrition);
});

// Booking and Schedule management
app.get('/api/bookings', (req, res) => {
  const { trainerId, traineeId } = req.query;
  let list = dbData.bookings;
  if (trainerId) list = list.filter(b => b.trainerId === trainerId);
  if (traineeId) list = list.filter(b => b.traineeId === traineeId);
  res.json(list);
});

app.post('/api/bookings', (req, res) => {
  const { trainerId, traineeId, traineeName, date, timeSlot, location, notes, packageType, amountPaid } = req.body;
  
  const finalPrice = Number(amountPaid) || (packageType === 'Monthly Pack' ? 800 : 110);
  
  const newBooking: BookingSession = {
    id: `b_${Date.now()}`,
    trainerId,
    traineeId,
    traineeName,
    date,
    timeSlot,
    status: 'Pending',
    location: location || 'Gym Center',
    notes,
    packageType: packageType || 'Single Slot',
    amountPaid: finalPrice,
    paymentStatus: 'Paid' // Marked paid immediately upon slot booking
  };

  // Auto-generate matching payment and invoice
  const paymentId = `p_book_${Date.now()}`;
  const newPayment: Payment = {
    id: paymentId,
    trainerId,
    traineeId,
    traineeName,
    amount: finalPrice,
    date: new Date().toISOString().split('T')[0],
    status: 'Paid',
    description: `Immediate Booking Payment via Slot Checkout (${packageType || 'Single Slot'})`
  };

  const trainerProfile = dbData.trainers.find(t => t.id === trainerId);
  const newInvoice: Invoice = {
    id: `inv_book_${Date.now()}`,
    paymentId,
    invoiceNo: `COACH-BOOK-${Math.floor(Math.random() * 9000 + 1000)}`,
    trainerId,
    trainerName: trainerProfile?.name || 'Sarah Tan',
    trainerEmail: 'trainer@coachtrack.my',
    traineeId,
    traineeName,
    traineeEmail: 'trainee@coachtrack.my',
    amount: finalPrice,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Paid',
    items: [
      {
        description: `Fitness Coaching Session - Type: ${packageType || 'Single Slot'} (${date} ${timeSlot})`,
        quantity: 1,
        unitPrice: finalPrice,
        total: finalPrice
      }
    ]
  };

  dbData.bookings.push(newBooking);
  dbData.payments.push(newPayment);
  dbData.invoices.push(newInvoice);
  
  writeDb();
  res.json({ booking: newBooking, payment: newPayment, invoice: newInvoice });
});

// Prescribed Workouts endpoints
app.get('/api/prescribed-workouts', (req, res) => {
  const { traineeId, status } = req.query;
  let list = dbData.prescribedWorkouts || [];
  if (traineeId) {
    list = list.filter(pw => pw.traineeId === traineeId || pw.traineeId === `te_${String(traineeId).replace('u_', '')}`);
  }
  if (status) {
    list = list.filter(pw => pw.status === status);
  }
  res.json(list);
});

app.post('/api/prescribed-workouts', (req, res) => {
  const { trainerId, traineeId, traineeIds, workoutType, duration, exercises, notes, videoProofRequired } = req.body;
  
  // Resolve list of target trainee IDs
  let ids: string[] = [];
  if (Array.isArray(traineeIds)) {
    ids = traineeIds;
  } else if (traineeId) {
    ids = [traineeId];
  }

  if (ids.length === 0) {
    return res.status(400).json({ message: 'No trainees specified for assignment' });
  }

  const baseId = Date.now();
  const created: any[] = [];

  if (!dbData.prescribedWorkouts) {
    dbData.prescribedWorkouts = [];
  }

  ids.forEach((tId, idx) => {
    const newPW = {
      id: `pw_${baseId}_${idx}`,
      trainerId,
      traineeId: tId,
      workoutType: workoutType || 'Coaches Custom Target routine',
      duration: Number(duration) || 45,
      exercises: exercises || [],
      notes: notes || '',
      status: 'Pending',
      assignedDate: new Date().toISOString().split('T')[0],
      videoProofRequired: videoProofRequired !== false
    };
    dbData.prescribedWorkouts.push(newPW as any);
    created.push(newPW);
  });

  writeDb();
  res.json(created.length === 1 ? created[0] : created);
});

app.post('/api/prescribed-workouts/:id/checkin', (req, res) => {
  const { id } = req.params;
  const { notes, videoUrl, difficulties, painLevel, generalComments, sessionFeedback } = req.body;
  
  const pwList = dbData.prescribedWorkouts || [];
  const pw = pwList.find(p => p.id === id);
  if (!pw) {
    return res.status(404).json({ message: 'Prescribed workout not found' });
  }

  // Update status
  pw.status = 'Logged';

  // Create completed workout log with Pending Review status
  const newLog: WorkoutLog = {
    id: `w_logged_${Date.now()}`,
    traineeId: pw.traineeId,
    trainerId: pw.trainerId,
    date: new Date().toISOString().split('T')[0],
    workoutType: pw.workoutType,
    duration: pw.duration,
    exercises: pw.exercises,
    notes: notes || `Check-in completed successfully! Video evidence captured.`,
    
    // Trainee feedback telemetry
    videoUrl: videoUrl || 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c054fb1d23eb5d9f07144e5ccb485c64&profile_id=139&oauth2_token_id=57447761',
    sessionFeedback: sessionFeedback || '',
    difficulties: difficulties || '',
    painLevel: painLevel || 'None',
    generalComments: generalComments || '',
    status: 'Pending Review'
  };

  dbData.workouts.push(newLog);

  // Increment client streak count
  const trainee = dbData.trainees.find(t => t.id === pw.traineeId || t.userId === pw.traineeId);
  if (trainee) {
    trainee.streakCount += 1;
  }

  // Notify trainer automatically
  if (!dbData.notifications) dbData.notifications = [];
  
  // Find trainer userId
  const trainerObj = dbData.trainers.find(t => t.id === pw.trainerId || t.userId === pw.trainerId);
  if (trainerObj) {
    dbData.notifications.push({
      id: 'not_tr_' + Date.now(),
      userId: trainerObj.userId,
      title: 'New Video Evidence Uploaded!',
      message: `Your client ${trainee ? trainee.name : 'Ahmad Ibrahim'} submitted workout proof for: ${pw.workoutType}. Review execution now.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
    dbData.notifications.push({
      id: 'not_tr_id_' + Date.now(),
      userId: trainerObj.id,
      title: 'New Video Evidence Uploaded!',
      message: `Your client ${trainee ? trainee.name : 'Ahmad Ibrahim'} submitted workout proof for: ${pw.workoutType}. Review execution now.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  }

  writeDb();
  res.json({ prescribed: pw, workoutLog: newLog });
});

app.post('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Approved' | 'Cancelled' | 'Completed'
  const booking = dbData.bookings.find(b => b.id === id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  booking.status = status;
  writeDb();
  res.json(booking);
});

// Chats
app.get('/api/chats', (req, res) => {
  const { userA, userB } = req.query;
  if (!userA || !userB) return res.json([]);
  
  const list = dbData.chats.filter(c => 
    (c.senderId === userA && c.receiverId === userB) ||
    (c.senderId === userB && c.receiverId === userA)
  ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
  res.json(list);
});

app.post('/api/chats', (req, res) => {
  const { senderId, receiverId, message, replyToType, replyToId, replyToTitle } = req.body;
  const newChat: ChatMessage = {
    id: `c_${Date.now()}`,
    senderId,
    receiverId,
    message,
    timestamp: new Date().toISOString(),
    replyToType,
    replyToId,
    replyToTitle
  };

  dbData.chats.push(newChat);
  writeDb();
  res.json(newChat);
});

// Payments & Invoices
app.get('/api/payments', (req, res) => {
  const { trainerId, traineeId } = req.query;
  let list = dbData.payments;
  if (trainerId) list = list.filter(p => p.trainerId === trainerId);
  if (traineeId) list = list.filter(p => p.traineeId === traineeId);
  res.json(list);
});

app.get('/api/invoices', (req, res) => {
  const { trainerId, traineeId } = req.query;
  let list = dbData.invoices;
  if (trainerId) list = list.filter(i => i.trainerId === trainerId);
  if (traineeId) list = list.filter(i => i.traineeId === traineeId);
  res.json(list);
});

app.post('/api/payments/pay', (req, res) => {
  const { paymentId } = req.body;
  const payment = dbData.payments.find(p => p.id === paymentId);
  const invoice = dbData.invoices.find(i => i.paymentId === paymentId);

  if (payment) payment.status = 'Paid';
  if (invoice) invoice.status = 'Paid';

  writeDb();
  res.json({ message: 'Payment of RM ' + (payment?.amount || 0) + ' completed successfully!', payment, invoice });
});

// Trainer Create Custom Invoice
app.post('/api/invoices', (req, res) => {
  const { trainerId, traineeId, amount, itemDescription, dueDate } = req.body;
  const trainerProfile = dbData.trainers.find(t => t.id === trainerId);
  const traineeProfile = dbData.trainees.find(t => t.id === traineeId || t.userId === traineeId);

  if (!trainerProfile || !traineeProfile) {
    return res.status(404).json({ message: 'Trainer or Trainee profile missing' });
  }

  const paymentId = `p_${Date.now()}`;
  const newPayment: Payment = {
    id: paymentId,
    trainerId,
    traineeId: traineeProfile.id,
    traineeName: traineeProfile.name,
    amount: Number(amount) || 100,
    date: new Date().toISOString().split('T')[0],
    status: 'Unpaid',
    description: itemDescription || 'Coaching Fees'
  };

  const invoiceId = `inv_${Date.now()}`;
  const newInvoice: Invoice = {
    id: invoiceId,
    paymentId,
    invoiceNo: `COACH-2026-0${Math.floor(Math.random() * 9000 + 1000)}`,
    trainerId,
    trainerName: trainerProfile.name,
    trainerEmail: 'trainer@coachtrack.my',
    traineeId: traineeProfile.id,
    traineeName: traineeProfile.name,
    traineeEmail: 'trainee@coachtrack.my',
    amount: Number(amount) || 100,
    date: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    status: 'Unpaid',
    items: [
      {
        description: itemDescription || 'Coaching Session Package',
        quantity: 1,
        unitPrice: Number(amount) || 100,
        total: Number(amount) || 100
      }
    ]
  };

  dbData.payments.push(newPayment);
  dbData.invoices.push(newInvoice);

  writeDb();
  res.json({ newPayment, newInvoice });
});

// GET invitations
app.get('/api/invitations', (req, res) => {
  const { traineeId, trainerId } = req.query;
  let list = dbData.invitations || [];
  if (traineeId) {
    list = list.filter(inv => inv.traineeId === traineeId);
  }
  if (trainerId) {
    list = list.filter(inv => inv.trainerId === trainerId);
  }
  res.json(list);
});

// POST send new invitation
app.post('/api/invitations', (req, res) => {
  const { trainerId, traineeEmail, packageName, sessions, price } = req.body;
  const trainer = dbData.trainers.find(t => t.id === trainerId);
  const userAccount = dbData.users.find(u => u.email.toLowerCase() === traineeEmail.toLowerCase() && u.role === 'TRAINEE');

  if (!userAccount) {
    return res.status(404).json({ message: 'No registered CoachTrack MY Trainee account found with this email.' });
  }

  const trainee = dbData.trainees.find(t => t.userId === userAccount.id || t.id === userAccount.id);
  if (!trainee) {
    return res.status(404).json({ message: 'Trainee profile not found.' });
  }

  // Assign trainer ID immediately so client appears automatically in Trainer's roster
  trainee.assignedTrainerId = trainerId;

  const newInv = {
    id: 'inv_' + Date.now(),
    trainerId,
    trainerName: trainer ? trainer.name : 'Coach Sarah Tan',
    trainerDiscipline: trainer ? trainer.discipline : 'Fitness Specialist',
    traineeId: trainee.id,
    traineeEmail: userAccount.email,
    packageName,
    sessions: Number(sessions) || 1,
    price: Number(price) || 100,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  };

  if (!dbData.invitations) dbData.invitations = [];
  dbData.invitations.push(newInv);

  // Send trainee an in-app notification
  if (!dbData.notifications) dbData.notifications = [];
  dbData.notifications.push({
    id: 'not_' + Date.now(),
    userId: trainee.id,
    title: 'New Coach Onboarding Invitation!',
    message: `Coach ${trainer ? trainer.name : 'Sarah Tan'} has invited you to connect under the: ${packageName}!`,
    date: new Date().toISOString().split('T')[0],
    read: false
  });

  writeDb();
  res.json(newInv);
});

// POST respond connection invitation
app.post('/api/invitations/:id/respond', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Accepted' | 'Declined'
  const list = dbData.invitations || [];
  const inv = list.find(i => i.id === id);

  if (!inv) {
    return res.status(404).json({ message: 'Invitation record not found' });
  }

  inv.status = status;

  if (status === 'Accepted') {
    const trainee = dbData.trainees.find(t => t.id === inv.traineeId);
    if (trainee) {
      trainee.assignedTrainerId = inv.trainerId;
    }

    const trainerProfile = dbData.trainers.find(t => t.id === inv.trainerId);
    if (trainerProfile && trainee) {
      // 1. Generate Payment record
      const paymentId = `p_${Date.now()}`;
      const newPayment = {
        id: paymentId,
        trainerId: inv.trainerId,
        traineeId: trainee.id,
        traineeName: trainee.name,
        amount: Number(inv.price),
        date: new Date().toISOString().split('T')[0],
        status: 'Unpaid',
        description: `${inv.packageName} - Onboarding Fee`
      };

      // 2. Generate Invoice record
      const invoiceId = `inv_${Date.now()}`;
      const newInvoice = {
        id: invoiceId,
        paymentId,
        invoiceNo: `COACH-2026-0${Math.floor(Math.random() * 9000 + 1000)}`,
        trainerId: inv.trainerId,
        trainerName: trainerProfile.name,
        trainerEmail: 'trainer@coachtrack.my',
        traineeId: trainee.id,
        traineeName: trainee.name,
        traineeEmail: inv.traineeEmail,
        amount: Number(inv.price),
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
        status: 'Unpaid',
        items: [
          {
            description: `${inv.packageName} (${inv.sessions} sessions)`,
            quantity: 1,
            unitPrice: Number(inv.price),
            total: Number(inv.price)
          }
        ]
      };

      dbData.payments.push(newPayment as any);
      dbData.invoices.push(newInvoice as any);
    }

    // Notify trainer
    if (!dbData.notifications) dbData.notifications = [];
    dbData.notifications.push({
      id: 'not_' + Date.now(),
      userId: inv.trainerId,
      title: 'Trainee Accepted Onboarding Plan!',
      message: `${trainee ? trainee.name : 'Trainee'} accepted your invitation. First invoice generated automatically.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  } else if (status === 'Declined') {
    // Notify trainer
    if (!dbData.notifications) dbData.notifications = [];
    dbData.notifications.push({
      id: 'not_' + Date.now(),
      userId: inv.trainerId,
      title: 'Invitation Declined',
      message: `${inv.traineeEmail} has declined your onboarding request.`,
      date: new Date().toISOString().split('T')[0],
      read: false
    });
  }

  writeDb();
  res.json({ message: `Invitation status updated to ${status}`, invitation: inv });
});

// GET notifications
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  let list = dbData.notifications || [];
  if (userId) {
    list = list.filter(n => n.userId === userId);
  }
  res.json(list);
});

// POST Mark notification read
app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const list = dbData.notifications || [];
  const item = list.find(n => n.id === id);
  if (item) {
    item.read = true;
  }
  writeDb();
  res.json({ success: true });
});

// Admin Profile Reset
app.post('/api/admin/reset', (req, res) => {
  dbData = {
    users: DEFAULT_USERS,
    trainers: DEFAULT_TRAINERS,
    trainees: DEFAULT_TRAINEES,
    workouts: DEFAULT_WORKOUTS,
    nutrition: DEFAULT_NUTRITION,
    bookings: DEFAULT_BOOKINGS,
    chats: DEFAULT_CHATS,
    payments: DEFAULT_PAYMENTS,
    invoices: DEFAULT_INVOICES,
    prescribedWorkouts: DEFAULT_PRESCRIBED
  };
  writeDb();
  res.json({ message: 'Database reset to default seeds successfully!' });
});

// AI Suggestions: Workout Recommendations (Gemini API)
app.post('/api/ai/workout-rec', async (req, res) => {
  const { traineeId } = req.body;
  const trainee = dbData.trainees.find(t => t.id === traineeId || t.userId === traineeId);
  
  if (!trainee) {
    return res.status(404).json({ error: 'Trainee not found' });
  }

  const promptText = `
    You are an expert personal trainer at CoachTrack MY in Malaysia.
    Generate a 3-day workout plan optimized for a Malaysian client:
    Name: ${trainee.name}
    Age: ${trainee.age}, Weight: ${trainee.weight}kg, Height: ${trainee.height}cm
    Personal Goals: ${trainee.goals}

    Please output a response structured strictly in JSON format matching the schema:
    {
      "workoutName": "Title of dynamic routine",
      "focus": "Brief primary focus statement",
      "tips": ["Tip 1", "Tip 2 for Malaysian context (hydrating in Malaysian heat, etc)"],
      "schedule": [
        {
          "day": "Day 1 (e.g. Upper Body & Core)",
          "exercises": [
            { "name": "Squat", "sets": 3, "reps": 12, "weight": 20, "descr": "Posture advice" }
          ]
        },
        {
          "day": "Day 2 (e.g. Cardio & Flexibility)",
          "exercises": [
            { "name": "Push up", "sets": 3, "reps": 10, "weight": 0, "descr": "Push up posture" }
          ]
        },
        {
          "day": "Day 3 (e.g. Lower Body & Power)",
          "exercises": [
            { "name": "Plank", "sets": 3, "reps": 60, "weight": 0, "descr": "Tighten core" }
          ]
        }
      ]
    }
  `;

  if (!ai) {
    // Return mock prediction if key is absent
    return res.json({
      workoutName: "Ahmad's Lean Endurance Build",
      focus: "Cardiovascular Stamina & Strength Core Foundation Development",
      tips: [
        "Take extra hydration! In Malaysia's 32°C humidity, keep target fluid intake at 3.5L/day.",
        "Perform outdoor cardio early in the morning (e.g. Lake Gardens, KL CC park) or late evening to beat heavy daytime heat."
      ],
      schedule: [
        {
          day: "Day 1: Calisthenics & Low-impact Cardio",
          exercises: [
            { name: "Bodyweight Air Squats", sets: 3, reps: 15, weight: 0, descr: "Maintain chest up, squeeze glutes at top." },
            { name: "Push-ups (Knee Assisted)", sets: 3, reps: 10, weight: 0, descr: "Keep hips level, lower chest to ground." },
            { name: "Plank Hold", sets: 3, reps: 45, weight: 0, descr: "Focus on deep nasal breathing, absolute core tension." }
          ]
        },
        {
          day: "Day 2: Cardio HIIT Pace",
          exercises: [
            { name: "Jumping Jacks", sets: 4, reps: 30, weight: 0, descr: "Light landing on toes, maintain tempo." },
            { name: "Mountain Climbers", sets: 3, reps: 20, weight: 0, descr: "Keep shoulders directly above wrists." },
            { name: "Dynamic Side Lunges", sets: 3, reps: 12, weight: 0, descr: "Step wide to stretch inner adductors and build agility." }
          ]
        },
        {
          day: "Day 3: Strength Core Anchor",
          exercises: [
            { name: "Dumbbell Goblet Squats", sets: 3, reps: 10, weight: 12, descr: "Hold dumbbell tight to chest, deep squad." },
            { name: "Single Arm Dumbbell Rows", sets: 3, reps: 12, weight: 10, descr: "Keep back flat, drive elbow to ceiling." },
            { name: "Bird-Dog Extensions", sets: 3, reps: 12, weight: 0, descr: "Alternative reach hand and foot, pause 2s." }
          ]
        }
      ]
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workoutName: { type: Type.STRING },
            focus: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.INTEGER },
                        reps: { type: Type.INTEGER },
                        weight: { type: Type.INTEGER },
                        descr: { type: Type.STRING }
                      },
                      required: ['name', 'sets', 'reps', 'weight', 'descr']
                    }
                  }
                },
                required: ['day', 'exercises']
              }
            }
          },
          required: ['workoutName', 'focus', 'tips', 'schedule']
        }
      }
    });

    const output = JSON.parse(response.text?.trim() || '{}');
    res.json(output);
  } catch (error) {
    console.error('Gemini Workout error:', error);
    res.status(500).json({ error: 'AI workout generation failed', details: String(error) });
  }
});

// AI Suggestions: Meal suggestions & Log Analysis
app.post('/api/ai/meal-analysis', async (req, res) => {
  const { logs } = req.body;
  
  const promptText = `
    You are an AI Sports Nutritionist from CoachTrack MY.
    Analyze these logged Malaysian meals and provide constructive local feedback and substitution suggestions:
    Logs: ${JSON.stringify(logs)}

    Please analyze specific food items like Nasi Lemak, Teh Tarik, Char Kway Teow, Roti Canai.
    Output a response strictly structured in JSON format matching the schema:
    {
      "caloriesFeedback": "Brief overview of daily calorie levels",
      "nutritionalBalance": "Analysis of protein, fat, carbs ratio",
      "malaysianInsights": "Specific pointers regarding Malaysian food culture, sugars, palm oils",
      "healthySubstitutions": [
        { "originalFood": "Original food name", "healthyAlternative": "Local healthy alternative recipe", "benefit": "Brief benefit" }
      ],
      "aiRatingOutOfTen": 8
    }
  `;

  if (!ai) {
    return res.json({
      caloriesFeedback: "Your current breakfast of Nasi Lemak contributes about 650 kcal, which is substantial but within limits if active.",
      nutritionalBalance: "Carbohydrates are high (80g) and saturated fat is elevated (25g) due to coconut milk (santan) and cooking oil. Protein is slightly low (15g) for athletic needs.",
      malaysianInsights: "The standard sambal in Nasi Lemak is often cooked with generous amounts of palm oil and refined sugar. Teh Tarik (pulled tea) contains condensed milk which spikes glycemic values.",
      healthySubstitutions: [
        {
          originalFood: "Nasi Lemak Biaṣa with Fried Egg",
          healthyAlternative: "Nasi Lemak Basmati (Santan-free, cooked with ginger & pandan) + Hard Boiled Egg + Grilled Chicken breast",
          benefit: "Reduces fat content by 60%, doubles high-quality lean protein, and lowers blood-glucose spikes."
        },
        {
          originalFood: "Teh Tarik kuranġ manis",
          healthyAlternative: "Teh O Limau Panas (Lime black tea) or Teh C Kosong (Evaporated milk without sugar)",
          benefit: "Eliminates empty refined sugars completely, retaining herbal antioxidants."
        }
      ],
      aiRatingOutOfTen: 6
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caloriesFeedback: { type: Type.STRING },
            nutritionalBalance: { type: Type.STRING },
            malaysianInsights: { type: Type.STRING },
            healthySubstitutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalFood: { type: Type.STRING },
                  healthyAlternative: { type: Type.STRING },
                  benefit: { type: Type.STRING }
                },
                required: ['originalFood', 'healthyAlternative', 'benefit']
              }
            },
            aiRatingOutOfTen: { type: Type.INTEGER }
          },
          required: ['caloriesFeedback', 'nutritionalBalance', 'malaysianInsights', 'healthySubstitutions', 'aiRatingOutOfTen']
        }
      }
    });

    const output = JSON.parse(response.text?.trim() || '{}');
    res.json(output);
  } catch (error) {
    console.error('Gemini Nutrition error:', error);
    res.status(500).json({ error: 'AI nutrition analysis failed', details: String(error) });
  }
});

// Vite Middleware & Static Serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CoachTrack MY] Fullstack Dev Server booted on port ${PORT}`);
  });
}

startServer();
