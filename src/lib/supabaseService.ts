import { supabase } from './supabase';
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

export const supabaseService = {
  async searchNearbyTrainers(lat: number, lng: number, radiusKm: number, discipline: string): Promise<(TrainerProfile & { distance: number })[]> {
    if (!supabase) return [];
    const { data, error } = await supabase.from('trainers').select('*');
    if (error || !data) {
      console.error('Supabase query error:', error);
      return [];
    }

    let mapped = data.map(item => {
      const distanceVal = calculateDistance(lat, lng, item.lat, item.lng);
      const trainer: TrainerProfile = {
        id: item.id,
        userId: item.userId,
        name: item.name,
        discipline: item.discipline,
        experienceYears: item.experience_years,
        location: item.location,
        coordinates: { lat: item.lat, lng: item.lng },
        freelanceStatus: item.freelance_status,
        pricePerHour: item.price_per_hour,
        bio: item.bio,
        rating: item.rating,
        verified: item.verified,
        certificates: item.certificates || [],
        avatarUrl: item.avatar_url
      };
      return { ...trainer, distance: Number(distanceVal.toFixed(2)) };
    });

    mapped = mapped.filter(t => t.distance <= radiusKm);
    if (discipline) {
      mapped = mapped.filter(t => t.discipline.toLowerCase().includes(discipline.toLowerCase()));
    }
    return mapped;
  },

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .or(`userId.eq.${userId},id.eq.${userId}`)
      .single();

    if (error || !data) {
      console.error('getTrainerProfile error:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.userId,
      name: data.name,
      discipline: data.discipline,
      experienceYears: data.experience_years,
      location: data.location,
      coordinates: { lat: data.lat, lng: data.lng },
      freelanceStatus: data.freelance_status,
      pricePerHour: data.price_per_hour,
      bio: data.bio,
      rating: data.rating,
      verified: data.verified,
      certificates: data.certificates || [],
      avatarUrl: data.avatar_url,
      phoneNumber: data.phoneNumber,
      selectedPlan: data.selectedPlan,
      traineeLimit: data.traineeLimit,
      subscriptionPrice: data.subscriptionPrice,
      subscriptionStatus: data.subscriptionStatus,
      subscriptionStartDate: data.subscriptionStartDate,
      subscriptionRenewalDate: data.subscriptionRenewalDate,
      verificationStatus: data.verificationStatus
    };
  },

  async getTraineeProfile(userId: string): Promise<TraineeProfile | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('trainees')
      .select('*')
      .or(`userId.eq.${userId},id.eq.${userId}`)
      .single();

    if (error || !data) {
      console.error('getTraineeProfile error:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.userId,
      name: data.name,
      avatarUrl: data.avatar_url,
      age: data.age,
      weight: data.weight,
      height: data.height,
      goals: data.goals,
      assignedTrainerId: data.assigned_trainer_id,
      streakCount: data.streak_count || 0,
      phoneNumber: data.phoneNumber,
      location: data.location,
      fitnessGoal: data.fitness_goal,
      preferredWorkoutType: data.preferred_workout_type,
      currentFitnessLevel: data.current_fitness_level
    };
  },

  async getTraineesForTrainer(trainerId: string): Promise<TraineeProfile[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('trainees')
      .select('*')
      .eq('assigned_trainer_id', trainerId);

    if (error || !data) {
      console.error('getTraineesForTrainer error:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      userId: item.userId,
      name: item.name,
      avatarUrl: item.avatar_url,
      age: item.age,
      weight: item.weight,
      height: item.height,
      goals: item.goals,
      assignedTrainerId: item.assigned_trainer_id,
      streakCount: item.streak_count || 0,
      phoneNumber: item.phoneNumber,
      location: item.location,
      fitnessGoal: item.fitness_goal,
      preferredWorkoutType: item.preferred_workout_type,
      currentFitnessLevel: item.current_fitness_level
    }));
  },

  async unassignTrainee(traineeId: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('trainees')
      .update({ assigned_trainer_id: null })
      .eq('id', traineeId);

    return !error;
  },

  async getWorkouts(filters: { traineeId?: string; trainerId?: string }): Promise<WorkoutLog[]> {
    if (!supabase) return [];
    let q = supabase.from('workouts').select('*');
    if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
    if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);

    const { data, error } = await q;
    if (error || !data) {
      console.error('getWorkouts error:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      traineeId: item.traineeId,
      trainerId: item.trainerId,
      date: item.date,
      workoutType: item.workoutType,
      duration: item.duration,
      exercises: typeof item.exercises === 'string' ? JSON.parse(item.exercises) : item.exercises,
      notes: item.notes,
      trainerFeedback: item.trainerFeedback,
      feedbackAt: item.feedbackAt,
      videoUrl: item.videoUrl
    }));
  },

  async createWorkoutLog(workout: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog | null> {
    if (!supabase) return null;
    const id = `w_${Math.random().toString(36).substring(2, 11)}`;
    const { error } = await supabase.from('workouts').insert({
      id,
      traineeId: workout.traineeId,
      trainerId: workout.trainerId,
      date: workout.date,
      workoutType: workout.workoutType,
      duration: workout.duration,
      exercises: JSON.stringify(workout.exercises),
      notes: workout.notes,
      videoUrl: workout.videoUrl
    });

    if (error) {
      console.error('createWorkoutLog error:', error);
      return null;
    }
    return { ...workout, id };
  },

  async addWorkoutFeedback(workoutId: string, feedback: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('workouts')
      .update({
        trainerFeedback: feedback,
        feedbackAt: new Date().toISOString().substring(0, 10)
      })
      .eq('id', workoutId);

    return !error;
  },

  async getNutrition(traineeId: string): Promise<NutritionLog[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('nutrition')
      .select('*')
      .eq('traineeId', traineeId);

    if (error || !data) {
      console.error('getNutrition error:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      traineeId: item.traineeId,
      date: item.date,
      foodName: item.foodName,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      notes: item.notes,
      trainerFeedback: item.trainerFeedback,
      feedbackAt: item.feedbackAt
    }));
  },

  async createNutritionLog(log: Omit<NutritionLog, 'id'>): Promise<NutritionLog | null> {
    if (!supabase) return null;
    const id = `n_${Math.random().toString(36).substring(2, 11)}`;
    const payload = {
      id,
      traineeId: log.traineeId,
      date: log.date,
      foodName: log.foodName,
      calories: log.calories,
      protein: log.protein,
      carbs: log.carbs,
      fat: log.fat,
      notes: log.notes
    };

    const { error } = await supabase.from('nutrition').insert(payload);
    if (error) {
      console.error('createNutritionLog error:', error);
      return null;
    }
    return { ...log, id };
  },

  async addNutritionFeedback(nutritionId: string, feedback: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('nutrition')
      .update({
        trainerFeedback: feedback,
        feedbackAt: new Date().toISOString().substring(0, 10)
      })
      .eq('id', nutritionId);

    return !error;
  },

  async getBookings(filters: { traineeId?: string; trainerId?: string }): Promise<BookingSession[]> {
    if (!supabase) return [];
    let q = supabase.from('bookings').select('*');
    if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
    if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);

    const { data, error } = await q;
    if (error || !data) {
      console.error('getBookings error:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      trainerId: item.trainerId,
      traineeId: item.traineeId,
      traineeName: item.traineeName,
      date: item.date,
      timeSlot: item.timeSlot,
      status: item.status,
      location: item.location,
      notes: item.notes,
      packageType: item.packageType,
      amountPaid: item.amountPaid,
      paymentStatus: item.paymentStatus
    }));
  },

  async createBooking(booking: Omit<BookingSession, 'id'>): Promise<BookingSession | null> {
    if (!supabase) return null;
    const id = `b_${Math.random().toString(36).substring(2, 11)}`;
    const payload = {
      id,
      trainerId: booking.trainerId,
      traineeId: booking.traineeId,
      traineeName: booking.traineeName,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      location: booking.location,
      notes: booking.notes,
      packageType: booking.packageType,
      amountPaid: booking.amountPaid,
      paymentStatus: booking.paymentStatus
    };

    const { error } = await supabase.from('bookings').insert(payload);
    if (error) {
      console.error('createBooking error:', error);
      return null;
    }
    return { ...booking, id };
  },

  async updateBookingStatus(
    bookingId: string, 
    status: 'Approved' | 'Cancelled' | 'Completed' | 'Reschedule Requested', 
    newDate?: string, 
    newTimeSlot?: string,
    requestedDate?: string,
    requestedTimeSlot?: string
  ): Promise<boolean> {
    if (!supabase) return false;
    const updateObj: any = { status };
    if (status === 'Reschedule Requested') {
      updateObj.requestedDate = requestedDate;
      updateObj.requestedTimeSlot = requestedTimeSlot;
    } else {
      if (newDate) {
        updateObj.date = newDate;
      }
      if (newTimeSlot) {
        updateObj.timeSlot = newTimeSlot;
      }
      // Set to null to clear when approved or completed
      updateObj.requestedDate = null;
      updateObj.requestedTimeSlot = null;
    }
    const { error } = await supabase
      .from('bookings')
      .update(updateObj)
      .eq('id', bookingId);

    return !error;
  },

  async getPrescribedWorkouts(traineeId: string, status = 'Pending'): Promise<PrescribedWorkout[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('prescribed_workouts')
      .select('*')
      .eq('traineeId', traineeId)
      .eq('status', status);

    if (error || !data) {
      console.error('getPrescribedWorkouts error:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      trainerId: item.trainerId,
      traineeId: item.traineeId,
      workoutType: item.workoutType,
      duration: item.duration,
      exercises: typeof item.exercises === 'string' ? JSON.parse(item.exercises) : item.exercises,
      notes: item.notes,
      status: item.status,
      assignedDate: item.assignedDate
    }));
  },

  async createPrescribedWorkout(pw: Omit<PrescribedWorkout, 'id' | 'status' | 'assignedDate'>): Promise<PrescribedWorkout | null> {
    if (!supabase) return null;
    const id = `pw_${Math.random().toString(36).substring(2, 11)}`;
    const { error } = await supabase.from('prescribed_workouts').insert({
      id,
      trainerId: pw.trainerId,
      traineeId: pw.traineeId,
      workoutType: pw.workoutType,
      duration: pw.duration,
      exercises: JSON.stringify(pw.exercises),
      notes: pw.notes,
      status: 'Pending',
      assignedDate: new Date().toISOString().substring(0, 10)
    });

    if (error) {
      console.error('createPrescribedWorkout error:', error);
      return null;
    }
    return { ...pw, id, status: 'Pending', assignedDate: new Date().toISOString().substring(0, 10) };
  },

  async checkInPrescribedWorkout(
    pwId: string, 
    actualExercises: any[], 
    duration: number, 
    notes: string
  ): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('prescribed_workouts')
      .update({ status: 'Logged' })
      .eq('id', pwId);

    return !error;
  },

  async getChats(userA: string, userB: string): Promise<ChatMessage[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(`and(senderId.eq.${userA},receiverId.eq.${userB}),and(senderId.eq.${userB},receiverId.eq.${userA})`);

    if (error || !data) {
      console.error('getChats error:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      senderId: item.senderId,
      receiverId: item.receiverId,
      message: item.message,
      timestamp: item.timestamp,
      replyToType: item.replyToType,
      replyToId: item.replyToId,
      replyToTitle: item.replyToTitle
    }));
  },

  async createChatMessage(chat: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    if (!supabase) return null;
    const id = `msg_${Math.random().toString(36).substring(2, 11)}`;
    const timestamp = new Date().toISOString();
    const payload = {
      id,
      senderId: chat.senderId,
      receiverId: chat.receiverId,
      message: chat.message,
      timestamp,
      replyToType: chat.replyToType,
      replyToId: chat.replyToId,
      replyToTitle: chat.replyToTitle
    };

    const { error } = await supabase.from('chats').insert(payload);
    if (error) {
      console.error('createChatMessage error:', error);
      return null;
    }
    return { ...chat, id, timestamp };
  },

  async getPayments(filters: { traineeId?: string; trainerId?: string }): Promise<Payment[]> {
    if (!supabase) return [];
    let q = supabase.from('payments').select('*');
    if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
    if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);

    const { data, error } = await q;
    if (error || !data) {
      console.error('getPayments error:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      trainerId: item.trainerId,
      traineeId: item.traineeId,
      traineeName: item.traineeName,
      amount: item.amount,
      date: item.date,
      status: item.status,
      description: item.description,
      dueDate: item.dueDate,
      itemDescription: item.itemDescription,
      invoiceNo: item.invoiceNo,
      receiptNo: item.receiptNo,
      packageName: item.packageName,
      packageType: item.packageType,
      paymentMethod: item.paymentMethod,
      email: item.email
    }));
  },

  async createInvoice(invoice: { trainerId: string; traineeId: string; amount: number; itemDescription: string; dueDate: string }): Promise<any> {
    if (!supabase) return null;
    const pid = `p_${Math.random().toString(36).substring(2, 11)}`;
    const invoiceNo = `INV-2026-${Math.floor(Math.random() * 9000 + 1000)}`;

    const trainee = await this.getTraineeProfile(invoice.traineeId);

    const payment: Payment = {
      id: pid,
      trainerId: invoice.trainerId,
      traineeId: invoice.traineeId,
      traineeName: trainee?.name || 'Athlete Client',
      amount: invoice.amount,
      date: new Date().toISOString().substring(0, 10),
      status: 'Unpaid',
      description: invoice.itemDescription,
      dueDate: invoice.dueDate,
      itemDescription: invoice.itemDescription,
      invoiceNo,
      packageName: invoice.itemDescription
    };

    const { error } = await supabase.from('payments').insert({
      id: pid,
      trainerId: invoice.trainerId,
      traineeId: invoice.traineeId,
      traineeName: payment.traineeName,
      amount: invoice.amount,
      date: payment.date,
      status: 'Unpaid',
      description: invoice.itemDescription,
      dueDate: invoice.dueDate,
      itemDescription: invoice.itemDescription,
      invoiceNo,
      packageName: invoice.itemDescription
    });

    if (error) {
      console.error('createInvoice error:', error);
      return null;
    }
    return { success: true, payment };
  },

  async payInvoice(paymentId: string): Promise<boolean> {
    if (!supabase) return false;
    const receiptNo = `RC-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'Paid',
        receiptNo,
        paymentMethod: 'FPX (Online Banking)'
      })
      .eq('id', paymentId);

    return !error;
  },

  async getInvitations(filters: { traineeId?: string; trainerId?: string }): Promise<any[]> {
    if (!supabase) return [];
    let q = supabase.from('invitations').select('*');
    if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
    if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);

    const { data, error } = await q;
    if (error || !data) {
      console.error('getInvitations error:', error);
      return [];
    }
    return data;
  },

  async getNotifications(userId: string): Promise<any[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId);

    if (error || !data) return [];
    return data;
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (!supabase) return false;
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    return !error;
  }
};
