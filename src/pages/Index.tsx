import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileSync } from '@/hooks/useProfileSync';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AddEquipment } from '@/components/equipment/AddEquipment';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { WorkoutSession } from '@/components/workout/WorkoutSession';
import { PlanSelector } from '@/components/workout/PlanSelector';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { WorkoutPlanPage } from '@/components/plan/WorkoutPlanPage';
import { PlanEditor } from '@/components/plan/PlanEditor';
import { AchievementsPage } from '@/components/achievements/AchievementsPage';
import { WaterPage } from '@/components/water/WaterPage';
import { MobileNav } from '@/components/layout/MobileNav';
import { Loader2 } from 'lucide-react';
import { PlannedExercise } from '@/types/fitness';

type AppScreen = 
  | 'onboarding'
  | 'dashboard'
  | 'equipment'
  | 'add-equipment'
  | 'plan'
  | 'edit-plan'
  | 'select-workout'
  | 'workout'
  | 'progress'
  | 'profile'
  | 'achievements'
  | 'water';

function AppContent() {
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading, signOut } = useAuth();
  const { user, logout, setUser } = useApp();
  const { loadProfileData } = useProfileSync();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding');
  const [selectedExercises, setSelectedExercises] = useState<PlannedExercise[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/auth', { replace: true });
    }
  }, [authUser, authLoading, navigate]);

  // Load profile data and set initial screen
  useEffect(() => {
    const initializeProfile = async () => {
      if (authUser && !isInitialized) {
        await loadProfileData();
        setIsInitialized(true);
      }
    };
    initializeProfile();
  }, [authUser, isInitialized, loadProfileData]);

  // Set screen based on user state
  useEffect(() => {
    if (isInitialized && user) {
      setCurrentScreen(user.onboardingComplete ? 'dashboard' : 'onboarding');
    }
  }, [isInitialized, user]);

  const handleOnboardingComplete = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await signOut();
    logout();
    navigate('/auth', { replace: true });
  };

  if (authLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authUser) {
    return null;
  }

  const getPathFromScreen = (screen: AppScreen): string => {
    const paths: Record<AppScreen, string> = {
      onboarding: '/onboarding',
      dashboard: '/dashboard',
      equipment: '/equipment',
      'add-equipment': '/equipment/add',
      plan: '/plan',
      'edit-plan': '/plan/edit',
      'select-workout': '/select-workout',
      workout: '/workout',
      progress: '/progress',
      profile: '/profile',
      achievements: '/achievements',
      water: '/water',
    };
    return paths[screen];
  };

  const handleEditPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setCurrentScreen('edit-plan');
  };

  const handleNavigate = (path: string) => {
    const screenMap: Record<string, AppScreen> = {
      '/dashboard': 'dashboard',
      '/equipment': 'equipment',
      '/plan': 'plan',
      '/progress': 'progress',
      '/profile': 'profile',
    };
    const screen = screenMap[path];
    if (screen) setCurrentScreen(screen);
  };

  const showNav = !['onboarding', 'workout', 'add-equipment', 'select-workout', 'edit-plan'].includes(currentScreen);

  const handleSelectPlan = (exercises: PlannedExercise[]) => {
    setSelectedExercises(exercises);
    setCurrentScreen('workout');
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentScreen === 'onboarding' && (
          <OnboardingFlow key="onboarding" onComplete={handleOnboardingComplete} />
        )}
        
        {currentScreen === 'dashboard' && (
          <Dashboard
            key="dashboard"
            onStartWorkout={() => setCurrentScreen('select-workout')}
            onAddEquipment={() => setCurrentScreen('add-equipment')}
            onViewAchievements={() => setCurrentScreen('achievements')}
          />
        )}

        {currentScreen === 'equipment' && (
          <EquipmentList
            key="equipment"
            onBack={() => setCurrentScreen('dashboard')}
            onAddEquipment={() => setCurrentScreen('add-equipment')}
          />
        )}

        {currentScreen === 'add-equipment' && (
          <AddEquipment
            key="add-equipment"
            onBack={() => setCurrentScreen('equipment')}
            onComplete={() => setCurrentScreen('equipment')}
          />
        )}

        {currentScreen === 'plan' && (
          <WorkoutPlanPage
            key="plan"
            onStartWorkout={() => setCurrentScreen('select-workout')}
            onEditPlan={handleEditPlan}
          />
        )}

        {currentScreen === 'edit-plan' && selectedPlanId && (
          <PlanEditor
            key="edit-plan"
            planId={selectedPlanId}
            onBack={() => setCurrentScreen('plan')}
            onSave={() => setCurrentScreen('plan')}
          />
        )}

        {currentScreen === 'select-workout' && (
          <PlanSelector
            key="select-workout"
            onSelectPlan={handleSelectPlan}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'workout' && (
          <WorkoutSession
            key="workout"
            onComplete={() => {
              setSelectedExercises([]);
              setCurrentScreen('dashboard');
            }}
            onExit={() => {
              setSelectedExercises([]);
              setCurrentScreen('dashboard');
            }}
            initialExercises={selectedExercises}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressDashboard key="progress" />
        )}

        {currentScreen === 'profile' && (
          <ProfilePage 
            key="profile" 
            onLogout={handleLogout} 
            onResetProfile={() => setCurrentScreen('onboarding')}
          />
        )}

        {currentScreen === 'achievements' && (
          <AchievementsPage key="achievements" />
        )}

        {currentScreen === 'water' && (
          <WaterPage key="water" />
        )}
      </AnimatePresence>

      {showNav && (
        <MobileNav
          currentPath={getPathFromScreen(currentScreen)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
