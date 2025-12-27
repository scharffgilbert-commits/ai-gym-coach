export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  onboardingComplete: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'none';
  trialEndsAt?: Date;
}

export interface HealthProfile {
  userId: string;
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height: number; // in cm
  weight: number; // in kg
  injuries: Injury[];
  preconditions: Precondition[];
  gdprConsent: boolean;
  healthDataConsent: boolean;
  imageAnalysisConsent: boolean;
}

export interface Injury {
  id: string;
  area: 'back' | 'knees' | 'shoulders' | 'hips' | 'ankles' | 'wrists' | 'neck' | 'elbows' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  description?: string;
  recoveryStatus: 'active' | 'recovering' | 'healed';
}

export interface Precondition {
  id: string;
  type: 'cardiovascular' | 'respiratory' | 'metabolic' | 'neurological' | 'musculoskeletal' | 'other';
  description: string;
  medicalClearance: boolean;
}

export interface FitnessGoals {
  userId: string;
  shortTerm: Goal[]; // 1-4 weeks
  midTerm: Goal[]; // 1-3 months
  longTerm: Goal[]; // 3+ months
  focusAreas: BodyRegion[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface Goal {
  id: string;
  type: 'muscle-gain' | 'fat-loss' | 'endurance' | 'strength' | 'flexibility' | 'marathon' | 'sustainable-fitness' | 'rehabilitation';
  description: string;
  targetDate?: Date;
  priority: number;
}

export type BodyRegion = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs' | 'glutes' | 'full-body';

export interface Gym {
  id: string;
  name: string;
  address?: string;
  userId: string;
  machines: Machine[];
  createdAt: Date;
}

export interface Machine {
  id: string;
  gymId: string;
  name: string;
  manufacturer?: string;
  category: MachineCategory;
  muscleGroups: MuscleGroup[];
  imageUrl?: string;
  aiDetected: boolean;
  userConfirmed: boolean;
  notes?: string;
}

export type MachineCategory = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'functional' | 'free-weights';

export type MuscleGroup = 
  | 'pectorals' | 'deltoids' | 'trapezius' | 'latissimus-dorsi' | 'rhomboids'
  | 'biceps' | 'triceps' | 'forearms'
  | 'quadriceps' | 'hamstrings' | 'calves' | 'glutes'
  | 'rectus-abdominis' | 'obliques' | 'transverse-abdominis' | 'erector-spinae';

export interface TrainingHistory {
  id: string;
  machineId: string;
  userId: string;
  weight: number; // in kg
  repetitions: number;
  sets: number;
  rpe?: number; // Rate of Perceived Exertion 1-10
  date: Date;
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  weeklySchedule: WeeklySchedule;
  createdAt: Date;
  aiGenerated: boolean;
  exercises: PlannedExercise[];
}

export interface WeeklySchedule {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface PlannedExercise {
  id: string;
  machineId: string;
  machineName: string;
  order: number;
  sets: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
  notes?: string;
  dayOfWeek: number; // 0-6
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';
  exercises: CompletedExercise[];
  totalDuration?: number; // in seconds
  caloriesBurned?: number;
}

export interface CompletedExercise {
  id: string;
  sessionId: string;
  machineId: string;
  machineName: string;
  sets: CompletedSet[];
  feedback?: 'too-easy' | 'optimal' | 'too-hard';
  painReported: boolean;
  painLocation?: string;
  completedAt: Date;
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  weight: number;
  rpe?: number;
  completedAt: Date;
}

export interface ProgressMetrics {
  userId: string;
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalWeightLifted: number; // in kg
  averageWorkoutDuration: number; // in minutes
  currentStreak: number; // days
  longestStreak: number; // days
  weeklyWorkouts: number[];
  muscleGroupProgress: Record<MuscleGroup, number>;
}

export type OnboardingStep = 
  | 'welcome'
  | 'health-basics'
  | 'health-screening'
  | 'goals'
  | 'experience'
  | 'consent'
  | 'complete';
