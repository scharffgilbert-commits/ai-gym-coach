import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AddEquipment } from '@/components/equipment/AddEquipment';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { WorkoutSession } from '@/components/workout/WorkoutSession';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { WorkoutPlanPage } from '@/components/plan/WorkoutPlanPage';
import { MobileNav } from '@/components/layout/MobileNav';

type AppScreen = 
  | 'onboarding'
  | 'dashboard'
  | 'equipment'
  | 'add-equipment'
  | 'plan'
  | 'workout'
  | 'progress'
  | 'profile';

function AppContent() {
  const { user, logout } = useApp();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(
    user?.onboardingComplete ? 'dashboard' : 'onboarding'
  );

  const handleOnboardingComplete = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentScreen('onboarding');
  };

  const getPathFromScreen = (screen: AppScreen): string => {
    const paths: Record<AppScreen, string> = {
      onboarding: '/onboarding',
      dashboard: '/dashboard',
      equipment: '/equipment',
      'add-equipment': '/equipment/add',
      plan: '/plan',
      workout: '/workout',
      progress: '/progress',
      profile: '/profile',
    };
    return paths[screen];
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

  const showNav = !['onboarding', 'workout', 'add-equipment'].includes(currentScreen);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {currentScreen === 'onboarding' && (
          <OnboardingFlow key="onboarding" onComplete={handleOnboardingComplete} />
        )}
        
        {currentScreen === 'dashboard' && (
          <Dashboard
            key="dashboard"
            onStartWorkout={() => setCurrentScreen('workout')}
            onAddEquipment={() => setCurrentScreen('add-equipment')}
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
            onStartWorkout={() => setCurrentScreen('workout')}
          />
        )}

        {currentScreen === 'workout' && (
          <WorkoutSession
            key="workout"
            onComplete={() => setCurrentScreen('dashboard')}
            onExit={() => setCurrentScreen('dashboard')}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressDashboard key="progress" />
        )}

        {currentScreen === 'profile' && (
          <ProfilePage key="profile" onLogout={handleLogout} />
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
