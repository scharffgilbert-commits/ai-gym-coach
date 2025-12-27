import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  User, 
  HealthProfile, 
  FitnessGoals, 
  Gym, 
  WorkoutPlan, 
  WorkoutSession,
  OnboardingStep,
  ProgressMetrics 
} from '@/types/fitness';

interface AppState {
  user: User | null;
  healthProfile: HealthProfile | null;
  fitnessGoals: FitnessGoals | null;
  gyms: Gym[];
  workoutPlans: WorkoutPlan[];
  activeSession: WorkoutSession | null;
  progressMetrics: ProgressMetrics | null;
  onboardingStep: OnboardingStep;
  isLoading: boolean;
  isDarkMode: boolean;
}

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  setHealthProfile: (profile: HealthProfile | null) => void;
  setFitnessGoals: (goals: FitnessGoals | null) => void;
  setGyms: (gyms: Gym[]) => void;
  addGym: (gym: Gym) => void;
  setWorkoutPlans: (plans: WorkoutPlan[]) => void;
  setActiveSession: (session: WorkoutSession | null) => void;
  setProgressMetrics: (metrics: ProgressMetrics | null) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setIsLoading: (loading: boolean) => void;
  toggleDarkMode: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    healthProfile: null,
    fitnessGoals: null,
    gyms: [],
    workoutPlans: [],
    activeSession: null,
    progressMetrics: null,
    onboardingStep: 'welcome',
    isLoading: false,
    isDarkMode: true, // Default to dark mode
  });

  // Apply dark mode class to document
  React.useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  const setUser = (user: User | null) => setState(prev => ({ ...prev, user }));
  const setHealthProfile = (healthProfile: HealthProfile | null) => setState(prev => ({ ...prev, healthProfile }));
  const setFitnessGoals = (fitnessGoals: FitnessGoals | null) => setState(prev => ({ ...prev, fitnessGoals }));
  const setGyms = (gyms: Gym[]) => setState(prev => ({ ...prev, gyms }));
  const addGym = (gym: Gym) => setState(prev => ({ ...prev, gyms: [...prev.gyms, gym] }));
  const setWorkoutPlans = (workoutPlans: WorkoutPlan[]) => setState(prev => ({ ...prev, workoutPlans }));
  const setActiveSession = (activeSession: WorkoutSession | null) => setState(prev => ({ ...prev, activeSession }));
  const setProgressMetrics = (progressMetrics: ProgressMetrics | null) => setState(prev => ({ ...prev, progressMetrics }));
  const setOnboardingStep = (onboardingStep: OnboardingStep) => setState(prev => ({ ...prev, onboardingStep }));
  const setIsLoading = (isLoading: boolean) => setState(prev => ({ ...prev, isLoading }));
  const toggleDarkMode = () => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  
  const logout = () => {
    setState({
      user: null,
      healthProfile: null,
      fitnessGoals: null,
      gyms: [],
      workoutPlans: [],
      activeSession: null,
      progressMetrics: null,
      onboardingStep: 'welcome',
      isLoading: false,
      isDarkMode: state.isDarkMode,
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setUser,
        setHealthProfile,
        setFitnessGoals,
        setGyms,
        addGym,
        setWorkoutPlans,
        setActiveSession,
        setProgressMetrics,
        setOnboardingStep,
        setIsLoading,
        toggleDarkMode,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
