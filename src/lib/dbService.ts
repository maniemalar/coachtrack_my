import { supabase, isSupabaseConfigured } from './supabase';
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

export function isSupabaseActive(): boolean {
  try {
    const mode = localStorage.getItem('coach_track_mode');
    return mode === 'live' && isSupabaseConfigured && !!supabase;
  } catch (e) {
    return false;
  }
}

// Helper to generate a unique random ID
function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// Coordinate Distance calculator (Haversine formula in Km)
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

// Standard Demo Seeds in case Supabase is empty
const DEMO_TRAINERS: TrainerProfile[] = [
  {
    id: 'tr_sarah',
    userId: 'u_sarah',
    name: 'Sarah Tan',
    discipline: 'Yoga & Pilates Instructor',
    experienceYears: 6,
    location: 'SS15, Subang Jaya',
    coordinates: { lat: 3.0792, lng: 101.5950 },
    freelanceStatus: 'Freelance',
    pricePerHour: 110,
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

const DEMO_TRAINEES: TraineeProfile[] = [
  {
    id: 'te_ahmad',
    userId: 'u_ahmad',
    name: 'Ahmad bin Ibrahim',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    age: 28,
    weight: 84,
    height: 176,
    goals: 'Weight Loss and Cardio Endurance. Specifically trying to trim down fat and transition to active jogging and weekend hiking.',
    assignedTrainerId: 'tr_sarah',
    streakCount: 5
  }
];

const DEMO_PRESCRIBED: PrescribedWorkout[] = [
  {
    id: 'pw_1',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    workoutType: 'Spinal Extension & Deep Breathing Core',
    duration: 35,
    notes: 'Prioritize lower back stabilization in the SS15 studio. Stop if any minor lumbar strain occurs.',
    status: 'Pending',
    assignedDate: '2026-06-12',
    exercises: [
      { name: 'Cat Cow Flow', sets: 3, reps: 15, weight: 0 },
      { name: 'Bird Dog Stabilizations', sets: 4, reps: 12, weight: 0 },
      { name: 'Glute Bridges (Hold 5s)', sets: 3, reps: 10, weight: 0 }
    ]
  },
  {
    id: 'pw_2',
    trainerId: 'tr_sarah',
    traineeId: 'te_ahmad',
    workoutType: 'Postural Rehabilitation Set',
    duration: 30,
    notes: 'Work on thoracic mobility.',
    status: 'Pending',
    assignedDate: '2026-06-13',
    exercises: [
      { name: 'Prone Cobra', sets: 3, reps: 12, weight: 0 },
      { name: 'Thoracic Rotations', sets: 3, reps: 15, weight: 0 }
    ]
  }
];

// Seed databases if they are detected to be empty
export async function seedSupabaseIfNeeded() {
  if (!isSupabaseActive()) return;

  try {
    // 1. Check trainers
    const { data: trainers, error: trErr } = await supabase.from('trainers').select('id').limit(1);
    if (!trErr && (!trainers || trainers.length === 0)) {
      console.log('Seed: Populating trainers table...');
      await supabase.from('trainers').insert(DEMO_TRAINERS.map(t => ({
        id: t.id,
        userId: t.userId,
        name: t.name,
        discipline: t.discipline,
        experience_years: t.experienceYears,
        location: t.location,
        lat: t.coordinates.lat,
        lng: t.coordinates.lng,
        freelance_status: t.freelanceStatus,
        price_per_hour: t.pricePerHour,
        bio: t.bio,
        rating: t.rating,
        verified: t.verified,
        certificates: t.certificates,
        avatar_url: t.avatarUrl
      })));
    }

    // 2. Check trainees
    const { data: trainees, error: teErr } = await supabase.from('trainees').select('id').limit(1);
    if (!teErr && (!trainees || trainees.length === 0)) {
       console.log('Seed: Populating trainees table...');
       await supabase.from('trainees').insert(DEMO_TRAINEES.map(t => ({
         id: t.id,
         userId: t.userId,
         name: t.name,
         avatar_url: t.avatarUrl,
         age: t.age,
         weight: t.weight,
         height: t.height,
         goals: t.goals,
         assigned_trainer_id: t.assignedTrainerId,
         streak_count: t.streakCount
       })));
    }

    // 3. Check prescribed workouts
    const { data: pWorkouts, error: pwErr } = await supabase.from('prescribed_workouts').select('id').limit(1);
    if (!pwErr && (!pWorkouts || pWorkouts.length === 0)) {
      console.log('Seed: Populating prescribed_workouts table...');
      await supabase.from('prescribed_workouts').insert(DEMO_PRESCRIBED.map(pw => ({
        id: pw.id,
        trainerId: pw.trainerId,
        traineeId: pw.traineeId,
        workoutType: pw.workoutType,
        duration: pw.duration,
        exercises: JSON.stringify(pw.exercises),
        notes: pw.notes,
        status: pw.status,
        assignedDate: pw.assignedDate
      })));
    }
  } catch (err) {
    console.error('Failed to auto-seed Supabase:', err);
  }
}

// Universal API wrapper
export const dbService = {
  // --- TRAINERS ---
  async searchNearbyTrainers(lat: number, lng: number, radiusKm: number, discipline: string): Promise<(TrainerProfile & { distance: number })[]> {
    if (isSupabaseActive()) {
      await seedSupabaseIfNeeded();
      const { data, error } = await supabase.from('trainers').select('*');
      if (error) {
        console.error('Supabase query error, fallback to REST API:', error);
      } else if (data) {
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

        // Filter by radius & discipline
        mapped = mapped.filter(t => t.distance <= radiusKm);
        if (discipline) {
          mapped = mapped.filter(t => t.discipline.toLowerCase().includes(discipline.toLowerCase()));
        }
        return mapped;
      }
    }

    // Fallback: local REST endpoint
    const url = `/api/trainers/search?lat=${lat}&lng=${lng}&radius=${radiusKm}&discipline=${discipline}`;
    const res = await fetch(url);
    return res.json();
  },

  async getTrainerProfile(userId: string): Promise<TrainerProfile | null> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .or(`userId.eq.${userId},id.eq.${userId}`)
        .single();
      if (!error && data) {
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
          avatarUrl: data.avatar_url
        };
      }
    }

    const res = await fetch(`/api/trainers/${userId}`);
    if (res.ok) return res.json();
    return null;
  },

  // --- TRAINEES ---
  async getTraineeProfile(userId: string): Promise<TraineeProfile | null> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from('trainees')
        .select('*')
        .or(`userId.eq.${userId},id.eq.${userId}`)
        .single();
      if (!error && data) {
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
          streakCount: data.streak_count || 0
        };
      }
    }

    const res = await fetch(`/api/trainees/${userId}`);
    if (res.ok) return res.json();
    return null;
  },

  async getTraineesForTrainer(trainerId: string): Promise<TraineeProfile[]> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from('trainees')
        .select('*')
        .eq('assigned_trainer_id', trainerId);
      if (!error && data) {
        return data.map(d => ({
          id: d.id,
          userId: d.userId,
          name: d.name,
          avatarUrl: d.avatar_url,
          age: d.age,
          weight: d.weight,
          height: d.height,
          goals: d.goals,
          assignedTrainerId: d.assigned_trainer_id,
          streakCount: d.streak_count || 0
        }));
      }
    }

    const res = await fetch(`/api/trainees?trainerId=${trainerId}`);
    if (res.ok) return res.json();
    return [];
  },

  async unassignTrainee(traineeId: string): Promise<boolean> {
    const res = await fetch(`/api/trainees/${traineeId}/unassign`, {
      method: 'POST'
    });
    return res.ok;
  },

  // --- WORKOUT LOGS ---
  async getWorkouts(filters: { traineeId?: string; trainerId?: string }): Promise<WorkoutLog[]> {
    if (isSupabaseActive()) {
      let q = supabase.from('workouts').select('*');
      if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
      if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);
      const { data, error } = await q.order('date', { ascending: false });
      if (!error && data) {
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
          feedbackAt: item.feedbackAt
        }));
      }
    }

    const val = filters.traineeId ? `traineeId=${filters.traineeId}` : `trainerId=${filters.trainerId}`;
    const res = await fetch(`/api/workouts?${val}`);
    if (res.ok) return res.json();
    return [];
  },

  async createWorkoutLog(workout: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog | null> {
    const payload = {
      ...workout,
      id: genId('w_log')
    };

    if (isSupabaseActive()) {
      const { error } = await supabase.from('workouts').insert({
        id: payload.id,
        traineeId: payload.traineeId,
        trainerId: payload.trainerId,
        date: payload.date,
        workoutType: payload.workoutType,
        duration: payload.duration,
        exercises: payload.exercises, // JSONB handles json directly or text representation
        notes: payload.notes,
        trainerFeedback: payload.trainerFeedback,
        feedbackAt: payload.feedbackAt
      });
      if (!error) return payload;
    }

    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res.json();
    return null;
  },

  async addWorkoutFeedback(workoutId: string, feedback: string, status?: string): Promise<boolean> {
    if (isSupabaseActive()) {
      const { error } = await supabase
        .from('workouts')
        .update({ trainerFeedback: feedback, feedbackAt: new Date().toISOString() })
        .eq('id', workoutId);
      if (!error) return true;
    }

    const res = await fetch(`/api/workouts/${workoutId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, status })
    });
    return res.ok;
  },

  // --- NUTRITION LOGS ---
  async getNutrition(traineeId: string): Promise<NutritionLog[]> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from('nutrition')
        .select('*')
        .eq('traineeId', traineeId)
        .order('date', { ascending: false });
      if (!error && data) {
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
      }
    }

    const res = await fetch(`/api/nutrition?traineeId=${traineeId}`);
    if (res.ok) return res.json();
    return [];
  },

  async createNutritionLog(log: Omit<NutritionLog, 'id'>): Promise<NutritionLog | null> {
    const payload = {
      ...log,
      id: genId('n_log')
    };

    if (isSupabaseActive()) {
      const { error } = await supabase.from('nutrition').insert(payload);
      if (!error) return payload;
    }

    const res = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res.json();
    return null;
  },

  async addNutritionFeedback(nutritionId: string, feedback: string): Promise<boolean> {
    if (isSupabaseActive()) {
      const { error } = await supabase
        .from('nutrition')
        .update({ trainerFeedback: feedback, feedbackAt: new Date().toISOString() })
        .eq('id', nutritionId);
      if (!error) return true;
    }

    const res = await fetch(`/api/nutrition/${nutritionId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback })
    });
    return res.ok;
  },

  // --- BOOKING SESSIONS ---
  async getBookings(filters: { traineeId?: string; trainerId?: string }): Promise<BookingSession[]> {
    if (isSupabaseActive()) {
      let q = supabase.from('bookings').select('*');
      if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
      if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);
      const { data, error } = await q.order('date', { ascending: false });
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          trainerId: item.trainerId,
          traineeId: item.traineeId,
          traineeName: item.traineeName,
          date: item.date,
          timeSlot: item.timeSlot,
          status: item.status as any,
          location: item.location,
          notes: item.notes,
          packageType: item.packageType as any,
          amountPaid: item.amountPaid
        }));
      }
    }

    const queryStr = filters.traineeId ? `traineeId=${filters.traineeId}` : `trainerId=${filters.trainerId}`;
    const res = await fetch(`/api/bookings?${queryStr}`);
    if (res.ok) return res.json();
    return [];
  },

  async createBooking(booking: Omit<BookingSession, 'id'>): Promise<BookingSession | null> {
    const payload = {
      ...booking,
      id: genId('b_slot')
    };

    if (isSupabaseActive()) {
      const { error } = await supabase.from('bookings').insert(payload);
      if (!error) return payload;
    }

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res.json();
    return null;
  },

  async updateBookingStatus(bookingId: string, status: 'Approved' | 'Cancelled' | 'Completed'): Promise<boolean> {
    if (isSupabaseActive()) {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      if (!error) return true;
    }

    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.ok;
  },

  // --- PRESCRIBED WORKOUTS ---
  async getPrescribedWorkouts(traineeId: string, status = 'Pending'): Promise<PrescribedWorkout[]> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from('prescribed_workouts')
        .select('*')
        .eq('traineeId', traineeId)
        .eq('status', status);
      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          trainerId: item.trainerId,
          traineeId: item.traineeId,
          workoutType: item.workoutType,
          duration: item.duration,
          exercises: typeof item.exercises === 'string' ? JSON.parse(item.exercises) : item.exercises,
          notes: item.notes,
          status: item.status as any,
          assignedDate: item.assignedDate
        }));
      }
    }

    const res = await fetch(`/api/prescribed-workouts?traineeId=${traineeId}&status=${status}`);
    if (res.ok) return res.json();
    return [];
  },

  async createPrescribedWorkout(pw: Omit<PrescribedWorkout, 'id' | 'status' | 'assignedDate'>): Promise<PrescribedWorkout | null> {
    const payload = {
      ...pw,
      id: genId('pw_routine'),
      status: 'Pending' as const,
      assignedDate: new Date().toISOString().split('T')[0]
    };

    if (isSupabaseActive()) {
      const { error } = await supabase.from('prescribed_workouts').insert({
        id: payload.id,
        trainerId: payload.trainerId,
        traineeId: payload.traineeId,
        workoutType: payload.workoutType,
        duration: payload.duration,
        exercises: JSON.stringify(payload.exercises),
        notes: payload.notes,
        status: payload.status,
        assignedDate: payload.assignedDate
      });
      if (!error) return payload;
    }

    const res = await fetch('/api/prescribed-workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res.json();
    return null;
  },

  async checkInPrescribedWorkout(
    pwId: string, 
    details?: { 
      videoUrl?: string; 
      notes?: string; 
      difficulties?: string; 
      painLevel?: string; 
      generalComments?: string;
    }
  ): Promise<boolean> {
    if (isSupabaseActive()) {
      const { error } = await supabase
        .from('prescribed_workouts')
        .update({ status: 'Logged' })
        .eq('id', pwId);
      if (!error) return true;
    }

    const res = await fetch(`/api/prescribed-workouts/${pwId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details || {})
    });
    return res.ok;
  },

  // --- CHATS MESSAGES ---
  async getChats(userA: string, userB: string): Promise<ChatMessage[]> {
    if (isSupabaseActive()) {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`and(senderId.eq.${userA},receiverId.eq.${userB}),and(senderId.eq.${userB},receiverId.eq.${userA})`)
        .order('timestamp', { ascending: true });
      if (!error && data) {
        return data.map(m => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          message: m.message,
          timestamp: m.timestamp,
          replyToType: m.replyToType,
          replyToId: m.replyToId,
          replyToTitle: m.replyToTitle
        }));
      }
    }

    const res = await fetch(`/api/chats?userA=${userA}&userB=${userB}`);
    if (res.ok) return res.json();
    return [];
  },

  async createChatMessage(chat: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<ChatMessage | null> {
    const payload = {
      ...chat,
      id: genId('msg_tx'),
      timestamp: new Date().toISOString()
    };

    if (isSupabaseActive()) {
      const { error } = await supabase.from('chats').insert(payload);
      if (!error) return payload;
    }

    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res.json();
    return null;
  },

  // --- PAYMENTS & INVOICES ---
  async getPayments(filters: { traineeId?: string; trainerId?: string }): Promise<Payment[]> {
    if (isSupabaseActive()) {
      let q = supabase.from('payments').select('*');
      if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
      if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);
      const { data, error } = await q.order('date', { ascending: false });
      if (!error && data) {
        return data.map(p => ({
          id: p.id,
          trainerId: p.trainerId,
          traineeId: p.traineeId,
          traineeName: p.traineeName,
          amount: p.amount,
          date: p.date,
          status: p.status as any,
          description: p.description
        }));
      }
    }

    const val = filters.traineeId ? `traineeId=${filters.traineeId}` : `trainerId=${filters.trainerId}`;
    const res = await fetch(`/api/payments?${val}`);
    if (res.ok) return res.json();
    return [];
  },

  async createInvoice(invoice: { trainerId: string; traineeId: string; amount: number; itemDescription: string; dueDate: string }): Promise<any> {
    const payload = {
      ...invoice,
      id: genId('inv_sim')
    };

    if (isSupabaseActive()) {
      const { error } = await supabase.from('payments').insert({
        id: payload.id,
        trainerId: payload.trainerId,
        traineeId: payload.traineeId,
        traineeName: 'Client Ahmad',
        amount: payload.amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        description: payload.itemDescription
      });
      if (!error) return payload;
    }

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return res.json();
    return null;
  },

  async payInvoice(paymentId: string): Promise<boolean> {
    if (isSupabaseActive()) {
      const { error } = await supabase
        .from('payments')
        .update({ status: 'Paid' })
        .eq('id', paymentId);
      if (!error) return true;
    }

    const res = await fetch('/api/payments/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId })
    });
    return res.ok;
  },

  async getInvitations(filters: { traineeId?: string; trainerId?: string }): Promise<any[]> {
    if (isSupabaseActive()) {
      let q = supabase.from('invitations').select('*');
      if (filters.traineeId) q = q.eq('traineeId', filters.traineeId);
      if (filters.trainerId) q = q.eq('trainerId', filters.trainerId);
      const { data } = await q;
      if (data) return data;
    }
    const val = filters.traineeId ? `traineeId=${filters.traineeId}` : `trainerId=${filters.trainerId}`;
    const res = await fetch(`/api/invitations?${val}`);
    if (res.ok) return res.json();
    return [];
  },

  async createInvitation(invitation: { trainerId: string; traineeEmail: string; packageName: string; sessions: number; price: number }): Promise<any> {
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invitation)
    });
    if (res.ok) return res.json();
    const err = await res.json();
    throw new Error(err.message || 'Failed to create invitation');
  },

  async respondToInvitation(id: string, status: 'Accepted' | 'Declined'): Promise<any> {
    const res = await fetch(`/api/invitations/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) return res.json();
    const err = await res.json();
    throw new Error(err.message || 'Failed to respond to invitation');
  },

  async getNotifications(userId: string): Promise<any[]> {
    if (isSupabaseActive()) {
      const { data } = await supabase.from('notifications').select('*').eq('userId', userId);
      if (data) return data;
    }
    const res = await fetch(`/api/notifications?userId=${userId}`);
    if (res.ok) return res.json();
    return [];
  },

  async markNotificationRead(id: string): Promise<boolean> {
    if (isSupabaseActive()) {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    }
    const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    return res.ok;
  }
};
