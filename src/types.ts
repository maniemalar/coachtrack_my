export enum UserRole {
  TRAINER = 'TRAINER',
  TRAINEE = 'TRAINEE',
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl: string;
}

export interface TrainerProfile {
  id: string;
  userId: string;
  name: string;
  discipline: string; // "Personal Trainer" | "Sports Coach" | "Yoga Instructor" | "Gym Operator" etc.
  experienceYears: number;
  location: string; // city e.g. "Kuala Lumpur", "Petaling Jaya", "Subang Jaya"
  coordinates: {
    lat: number;
    lng: number;
  };
  freelanceStatus: 'Freelance' | 'Gym Operator' | 'Boutique Studio';
  pricePerHour: number;
  bio: string;
  rating: number;
  verified: boolean;
  certificates: string[];
  idProofUrl?: string;
  avatarUrl: string;
  phoneNumber?: string;
  // Trainer subscription details
  selectedPlan?: string; // 'Starter' | 'Growth' | 'Pro'
  traineeLimit?: number; // 5 | 20 | 50
  subscriptionPrice?: number; // 29 | 59 | 99
  subscriptionStatus?: string; // 'Active' | ...
  subscriptionStartDate?: string;
  subscriptionRenewalDate?: string;
  verificationStatus?: string; // 'Pending Verification' | 'Verified'
}

export interface TraineeProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  goals: string;
  assignedTrainerId?: string;
  streakCount: number;
  phoneNumber?: string;
  location?: string;
  // Trainee profile questions
  fitnessGoal?: string;
  preferredWorkoutType?: string;
  currentFitnessLevel?: string;
}

export interface WorkoutLog {
  id: string;
  traineeId: string;
  trainerId?: string;
  date: string; // YYYY-MM-DD
  workoutType: string; // "Strength" | "Cardio" | "Yoga" etc.
  duration: number; // minutes
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number; // kg
  }[];
  notes: string;
  trainerFeedback?: string;
  feedbackAt?: string;
  videoUrl?: string;
}

export interface NutritionLog {
  id: string;
  traineeId: string;
  date: string;
  foodName: string;
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  notes?: string;
  trainerFeedback?: string;
  feedbackAt?: string;
}

export interface BookingSession {
  id: string;
  trainerId: string;
  traineeId: string;
  traineeName: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
  status: 'Pending' | 'Approved' | 'Cancelled' | 'Completed' | 'Reschedule Requested';
  location: string;
  notes?: string;
  packageType?: 'Single Slot' | 'Monthly Pack';
  amountPaid?: number;
  paymentStatus?: 'Paid' | 'Unpaid';
  title?: string;
  type?: string;
  requestedDate?: string;
  requestedTimeSlot?: string;
}

export interface PrescribedWorkout {
  id: string;
  trainerId: string;
  traineeId: string;
  workoutType: string;
  duration: number; // minutes
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
  notes?: string;
  status: 'Pending' | 'Logged';
  assignedDate: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  replyToType?: 'WORKOUT' | 'NUTRITION';
  replyToId?: string;
  replyToTitle?: string;
}

export interface Payment {
  id: string;
  trainerId: string;
  traineeId: string;
  traineeName: string;
  amount: number; // RM
  date: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  description: string;
  dueDate?: string;
  itemDescription?: string;
  invoiceNo?: string;
  receiptNo?: string;
  packageName?: string;
  packageType?: string;
  paymentMethod?: string;
  email?: string;
}

export interface Invoice {
  id: string;
  paymentId: string;
  invoiceNo: string;
  trainerId: string;
  trainerName: string;
  trainerEmail: string;
  traineeId: string;
  traineeName: string;
  traineeEmail: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  receiptNo?: string;
  packageName?: string;
  packageType?: string;
  paymentMethod?: string;
}

export interface MalaysianFoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  category: 'Rice' | 'Noodle' | 'Bread' | 'Snacks' | 'Beverages';
}

export function resolveTraineeAvatar(name: string = '', existingAvatarUrl?: string): string {
  const cleanName = (name || '').toLowerCase().trim();
  if (cleanName.includes('ahmad') || cleanName.includes('ibrahim')) {
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120';
  }
  if (cleanName.includes('amy') || cleanName.includes('wong')) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120';
  }
  if (cleanName.includes('mei ling') || cleanName.includes('meiling') || (cleanName.includes('ling') && cleanName.includes('tan')) || cleanName === 'tan') {
    return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120';
  }
  if (cleanName.includes('faizul') || cleanName.includes('muhammad faizul')) {
    return 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120';
  }
  if (cleanName.includes('jason')) {
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';
  }

  if (existingAvatarUrl && 
      existingAvatarUrl.startsWith('http') && 
      !existingAvatarUrl.includes('placeholder') && 
      !existingAvatarUrl.includes('default') && 
      !existingAvatarUrl.includes('avatar-placeholder') &&
      !existingAvatarUrl.includes('photo-1535713875002-d1d0cf377fde')) {
    return existingAvatarUrl;
  }
  return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';
}

export function resolveMealPhoto(foodNameStr: string = ''): string {
  const name = (foodNameStr || '').toLowerCase().trim();
  
  if (name.includes('nasi lemak')) {
    // Authentic Malaysian nasi lemak (coconut rice, fried egg, sambal, peanuts, anchovies, cucumbers)
    return '/assets/meals/nasi-lemak.jpg';
  }
  if (name.includes('chicken rice') || name.includes('hainanese') || name.includes('chicken chop')) {
    // Elegant roasted/steamed Hainanese Chicken Rice
    return '/assets/meals/chicken-rice.jpg';
  }
  if (name.includes('mee goreng') || name.includes('char kway teow') || name.includes('kway teow') || name.includes('mee ') || name.includes('noodle')) {
    // Fried Malaysian stir-fry style Mee Goreng noodles
    return '/assets/meals/mee-goreng.jpg';
  }
  if (name.includes('roti canai') || name.includes('roti') || name.includes('canai')) {
    // Authentic layered flaky Malaysian Roti Canai with dhal
    return '/assets/meals/roti-canai.jpg';
  }
  if (name.includes('burger')) {
    // Delicious grilled burger
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600';
  }
  if (name.includes('protein shake') || name.includes('shake') || name.includes('protein') || name.includes('smoothie')) {
    // High performance muscle recovery protein shake smoothie
    return '/assets/meals/protein-shake.jpg';
  }
  if (name.includes('sandwich') || name.includes('subway') || name.includes('bread')) {
    // Fresh whole grain healthy sandwich
    return 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=600';
  }
  return 'placeholder';
}

