import { supabase, isSupabaseConfigured } from './supabase';
import { demoDataService } from './demoData';
import { supabaseService } from './supabaseService';
import { 
  TrainerProfile, 
  TraineeProfile, 
  WorkoutLog, 
  NutritionLog, 
  BookingSession, 
  ChatMessage, 
  Payment, 
  Invoice,
  PrescribedWorkout
} from '../types';

export function isSupabaseActive(): boolean {
  try {
    const mode = localStorage.getItem('coach_track_mode');
    return mode === 'live' && isSupabaseConfigured && !!supabase;
  } catch (e) {
    return false;
  }
}

export const dbService = {
  // --- TRAINERS ---
  async searchNearbyTrainers(lat: number, lng: number, radiusKm: number, discipline: string): Promise<(TrainerProfile & { distance: number })[]> {
    if (isSupabaseActive()) {
      return supabaseService.searchNearbyTrainers(lat, lng, radiusKm, discipline);
    }
    return demoDataService.searchNearbyTrainers(lat, lng, radiusKm, discipline);
  },

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    if (isSupabaseActive()) {
      return supabaseService.getTrainerProfile(userId);
    }
    return demoDataService.getTrainerProfile(userId);
  },

  // --- TRAINEES ---
  async getTraineeProfile(userId: string): Promise<TraineeProfile | null> {
    if (isSupabaseActive()) {
      return supabaseService.getTraineeProfile(userId);
    }
    return demoDataService.getTraineeProfile(userId);
  },

  async getTraineesForTrainer(trainerId: string): Promise<TraineeProfile[]> {
    if (isSupabaseActive()) {
      return supabaseService.getTraineesForTrainer(trainerId);
    }
    return demoDataService.getTraineesForTrainer(trainerId);
  },

  async unassignTrainee(traineeId: string): Promise<boolean> {
    if (isSupabaseActive()) {
      return supabaseService.unassignTrainee(traineeId);
    }
    return demoDataService.unassignTrainee(traineeId);
  },

  // --- WORKOUT LOGS ---
  async getWorkouts(filters: { traineeId?: string; trainerId?: string }): Promise<WorkoutLog[]> {
    if (isSupabaseActive()) {
      return supabaseService.getWorkouts(filters);
    }
    return demoDataService.getWorkouts(filters);
  },

  async createWorkoutLog(workout: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog | null> {
    if (isSupabaseActive()) {
      return supabaseService.createWorkoutLog(workout);
    }
    return demoDataService.createWorkoutLog(workout);
  },

  async addWorkoutFeedback(workoutId: string, feedback: string, status?: string): Promise<boolean> {
    if (isSupabaseActive()) {
      return supabaseService.addWorkoutFeedback(workoutId, feedback);
    }
    return demoDataService.addWorkoutFeedback(workoutId, feedback);
  },

  // --- NUTRITION LOGS ---
  async getNutrition(traineeId: string): Promise<NutritionLog[]> {
    if (isSupabaseActive()) {
      return supabaseService.getNutrition(traineeId);
    }
    return demoDataService.getNutrition(traineeId);
  },

  async createNutritionLog(log: Omit<NutritionLog, 'id'>): Promise<NutritionLog | null> {
    if (isSupabaseActive()) {
      return supabaseService.createNutritionLog(log);
    }
    return demoDataService.createNutritionLog(log);
  },

  async addNutritionFeedback(nutritionId: string, feedback: string): Promise<boolean> {
    if (isSupabaseActive()) {
      return supabaseService.addNutritionFeedback(nutritionId, feedback);
    }
    return demoDataService.addNutritionFeedback(nutritionId, feedback);
  },

  // --- BOOKING SESSIONS ---
  async getBookings(filters: { traineeId?: string; trainerId?: string }): Promise<BookingSession[]> {
    if (isSupabaseActive()) {
      return supabaseService.getBookings(filters);
    }
    return demoDataService.getBookings(filters);
  },

  async createBooking(booking: Omit<BookingSession, 'id'>): Promise<BookingSession | null> {
    if (isSupabaseActive()) {
      return supabaseService.createBooking(booking);
    }
    return demoDataService.createBooking(booking);
  },

  async updateBookingStatus(
    bookingId: string, 
    status: 'Approved' | 'Cancelled' | 'Completed' | 'Reschedule Requested', 
    newDate?: string, 
    newTimeSlot?: string,
    requestedDate?: string,
    requestedTimeSlot?: string
  ): Promise<boolean> {
    if (isSupabaseActive()) {
      return supabaseService.updateBookingStatus(bookingId, status, newDate, newTimeSlot, requestedDate, requestedTimeSlot);
    }
    return demoDataService.updateBookingStatus(bookingId, status, newDate, newTimeSlot, requestedDate, requestedTimeSlot);
  },

  // --- PRESCRIBED WORKOUTS ---
  async getPrescribedWorkouts(traineeId: string, status = 'Pending'): Promise<PrescribedWorkout[]> {
    if (isSupabaseActive()) {
      return supabaseService.getPrescribedWorkouts(traineeId, status);
    }
    return demoDataService.getPrescribedWorkouts(traineeId, status);
  },

  async createPrescribedWorkout(pw: Omit<PrescribedWorkout, 'id' | 'status' | 'assignedDate'>): Promise<PrescribedWorkout | null> {
    if (isSupabaseActive()) {
      return supabaseService.createPrescribedWorkout(pw);
    }
    return demoDataService.createPrescribedWorkout(pw);
  },

  async checkInPrescribedWorkout(
    pwId: string, 
    actualExercises: any[], 
    duration: number, 
    notes: string
  ): Promise<boolean> {
    if (isSupabaseActive()) {
      return supabaseService.checkInPrescribedWorkout(pwId, actualExercises, duration, notes);
    }
    return demoDataService.checkInPrescribedWorkout(pwId, actualExercises, duration, notes);
  },

  // --- CHATS ---
  async getChats(userA: string, userB: string): Promise<ChatMessage[]> {
    if (isSupabaseActive()) {
      return supabaseService.getChats(userA, userB);
    }
    return demoDataService.getChats(userA, userB);
  },

  async createChatMessage(chat: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    if (isSupabaseActive()) {
      return supabaseService.createChatMessage(chat);
    }
    return demoDataService.createChatMessage(chat);
  },

  // --- PAYMENTS ---
  async getPayments(filters: { traineeId?: string; trainerId?: string }): Promise<Payment[]> {
    if (isSupabaseActive()) {
      return supabaseService.getPayments(filters);
    }
    return demoDataService.getPayments(filters);
  },

  async createInvoice(invoice: { trainerId: string; traineeId: string; amount: number; itemDescription: string; dueDate: string }): Promise<any> {
    if (isSupabaseActive()) {
      return supabaseService.createInvoice(invoice);
    }
    return demoDataService.createInvoice(invoice);
  },

  async payInvoice(paymentId: string): Promise<boolean> {
    if (isSupabaseActive()) {
      return supabaseService.payInvoice(paymentId);
    }
    return demoDataService.payInvoice(paymentId);
  },

  // --- INVITATIONS ---
  async getInvitations(filters: { traineeId?: string; trainerId?: string }): Promise<any[]> {
    if (isSupabaseActive()) {
      return supabaseService.getInvitations(filters);
    }
    return demoDataService.getInvitations(filters);
  },

  async createInvitation(invitation: { trainerId: string; traineeEmail: string; packageName: string; sessions: number; price: number }): Promise<any> {
    if (isSupabaseActive()) {
      // Direct pass-through if supported, otherwise mock
      return { success: true };
    }
    return demoDataService.createInvitation(invitation);
  },

  async respondToInvitation(id: string, status: 'Accepted' | 'Declined'): Promise<any> {
    if (isSupabaseActive()) {
      return { success: true };
    }
    return demoDataService.respondToInvitation(id, status);
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId: string): Promise<any[]> {
    if (isSupabaseActive()) {
      return supabaseService.getNotifications(userId);
    }
    return demoDataService.getNotifications(userId);
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (isSupabaseActive()) {
      return supabaseService.markNotificationRead(id);
    }
    return demoDataService.markNotificationRead(id);
  }
};
