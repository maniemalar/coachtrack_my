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
  status: 'Pending' | 'Approved' | 'Cancelled' | 'Completed';
  location: string;
  notes?: string;
  packageType?: 'Single Slot' | 'Monthly Pack';
  amountPaid?: number;
  paymentStatus?: 'Paid' | 'Unpaid';
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
