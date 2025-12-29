import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AddEquipment } from '@/components/equipment/AddEquipment';
import { EquipmentList } from '@/components/equipment/EquipmentList';
import { WorkoutSession } from '@/components/workout/WorkoutSession';
import { ProgressDashboard } from '@/components/progress/ProgressDashboard';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { WorkoutPlanPage } from '@/components/plan/WorkoutPlanPage';
import { MobileNav } from '@/components/layout/MobileNav';
import { Loader2 } from 'lucide-react';

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
  const navigate = useNavigate();
  const { user: authUser, isLoading: authLoading, signOut } = useAuth();
  const { user, logout, setUser } = useApp();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(
    user?.onboardingComplete ? 'dashboard' : 'onboarding'
  );

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/auth', { replace: true });
    }
  }, [authUser, authLoading, navigate]);

  // Sync auth user to app context
  useEffect(() => {
    if (authUser && !user) {
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        createdAt: new Date(authUser.created_at),
        onboardingComplete: false,
        subscriptionStatus: 'trial',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }
  }, [authUser, user, setUser]);

  const handleOnboardingComplete = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await signOut();
    logout();
    navigate('/auth', { replace: true });
  };

  if (authLoading) {
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
          <ProfilePage 
            key="profile" 
            onLogout={handleLogout} 
            onResetProfile={() => setCurrentScreen('onboarding')}
          />
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
