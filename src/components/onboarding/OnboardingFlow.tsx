import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Dumbbell, Heart, Target, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { OnboardingStep, Injury, BodyRegion } from '@/types/fitness';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { onboardingStep, setOnboardingStep, setHealthProfile, setFitnessGoals, setUser } = useApp();
  const [direction, setDirection] = useState(0);
  
  // Form state
  const [healthData, setHealthData] = useState({
    age: '',
    gender: '' as 'male' | 'female' | 'other' | 'prefer-not-to-say',
    height: '',
    weight: '',
  });
  
  const [injuries, setInjuries] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [focusAreas, setFocusAreas] = useState<BodyRegion[]>([]);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [consents, setConsents] = useState({
    gdpr: false,
    healthData: false,
    imageAnalysis: false,
    disclaimer: false,
  });

  const steps: OnboardingStep[] = ['welcome', 'health-basics', 'health-screening', 'goals', 'experience', 'consent', 'complete'];
  const currentIndex = steps.indexOf(onboardingStep);

  const goNext = () => {
    setDirection(1);
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setOnboardingStep(steps[nextIndex]);
    }
  };

  const goBack = () => {
    setDirection(-1);
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setOnboardingStep(steps[prevIndex]);
    }
  };

  const handleComplete = () => {
    // Save all data
    setHealthProfile({
      userId: 'temp-user',
      age: parseInt(healthData.age),
      gender: healthData.gender,
      height: parseInt(healthData.height),
      weight: parseInt(healthData.weight),
      injuries: injuries.map((area, i) => ({
        id: `injury-${i}`,
        area: area as Injury['area'],
        severity: 'mild',
        recoveryStatus: 'recovering',
      })),
      preconditions: [],
      gdprConsent: consents.gdpr,
      healthDataConsent: consents.healthData,
      imageAnalysisConsent: consents.imageAnalysis,
    });

    setFitnessGoals({
      userId: 'temp-user',
      shortTerm: goals.map((type, i) => ({
        id: `goal-${i}`,
        type: type as any,
        description: type,
        priority: i + 1,
      })),
      midTerm: [],
      longTerm: [],
      focusAreas,
      experienceLevel: experience,
    });

    setUser({
      id: 'temp-user',
      email: 'demo@fitai.app',
      name: 'Demo User',
      createdAt: new Date(),
      onboardingComplete: true,
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    onComplete();
  };

  const injuryOptions = [
    { id: 'back', label: 'Back', icon: '🔙' },
    { id: 'knees', label: 'Knees', icon: '🦵' },
    { id: 'shoulders', label: 'Shoulders', icon: '💪' },
    { id: 'hips', label: 'Hips', icon: '🦴' },
    { id: 'ankles', label: 'Ankles', icon: '🦶' },
    { id: 'wrists', label: 'Wrists', icon: '✋' },
    { id: 'neck', label: 'Neck', icon: '🔝' },
  ];

  const goalOptions = [
    { id: 'muscle-gain', label: 'Build Muscle', icon: '💪' },
    { id: 'fat-loss', label: 'Lose Fat', icon: '🔥' },
    { id: 'endurance', label: 'Endurance', icon: '🏃' },
    { id: 'strength', label: 'Get Stronger', icon: '🏋️' },
    { id: 'flexibility', label: 'Flexibility', icon: '🧘' },
    { id: 'sustainable-fitness', label: 'Stay Healthy', icon: '❤️' },
  ];

  const focusOptions: { id: BodyRegion; label: string }[] = [
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'arms', label: 'Arms' },
    { id: 'core', label: 'Core' },
    { id: 'legs', label: 'Legs' },
    { id: 'glutes', label: 'Glutes' },
    { id: 'full-body', label: 'Full Body' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      {onboardingStep !== 'welcome' && onboardingStep !== 'complete' && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted safe-area-top">
          <motion.div
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / (steps.length - 2)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={onboardingStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="min-h-screen"
        >
          {/* Welcome Step */}
          {onboardingStep === 'welcome' && (
            <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary shadow-glow"
              >
                <Dumbbell className="h-12 w-12 text-primary-foreground" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-4xl font-bold text-foreground"
              >
                Welcome to <span className="text-gradient">FitAI</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 max-w-sm text-center text-lg text-muted-foreground"
              >
                Your AI-powered personal trainer for the gym. Train smarter, progress faster.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 grid w-full max-w-sm gap-4"
              >
                {[
                  { icon: Sparkles, text: 'AI-generated workout plans' },
                  { icon: Target, text: 'Personalized to your goals' },
                  { icon: Heart, text: 'Adapts to your progress' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{item.text}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 w-full max-w-sm"
              >
                <Button variant="hero" size="xl" className="w-full" onClick={goNext}>
                  Get Started
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          )}

          {/* Health Basics Step */}
          {onboardingStep === 'health-basics' && (
            <div className="flex min-h-screen flex-col px-6 py-20">
              <button onClick={goBack} className="mb-8 text-muted-foreground">
                ← Back
              </button>
              
              <h2 className="text-3xl font-bold text-foreground">
                Let's get to know you
              </h2>
              <p className="mt-2 text-muted-foreground">
                This helps us create personalized workouts
              </p>

              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={healthData.age}
                    onChange={(e) => setHealthData({ ...healthData, age: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'male', label: 'Male' },
                      { id: 'female', label: 'Female' },
                      { id: 'other', label: 'Other' },
                      { id: 'prefer-not-to-say', label: 'Prefer not to say' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setHealthData({ ...healthData, gender: option.id as any })}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          healthData.gender === option.id
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={healthData.height}
                      onChange={(e) => setHealthData({ ...healthData, height: e.target.value })}
                      className="h-14 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={healthData.weight}
                      onChange={(e) => setHealthData({ ...healthData, weight: e.target.value })}
                      className="h-14 text-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={goNext}
                  disabled={!healthData.age || !healthData.gender || !healthData.height || !healthData.weight}
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Health Screening Step */}
          {onboardingStep === 'health-screening' && (
            <div className="flex min-h-screen flex-col px-6 py-20">
              <button onClick={goBack} className="mb-8 text-muted-foreground">
                ← Back
              </button>
              
              <h2 className="text-3xl font-bold text-foreground">
                Any injuries or limitations?
              </h2>
              <p className="mt-2 text-muted-foreground">
                We'll adapt your workouts accordingly
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {injuryOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (injuries.includes(option.id)) {
                        setInjuries(injuries.filter((i) => i !== option.id));
                      } else {
                        setInjuries([...injuries, option.id]);
                      }
                    }}
                    className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      injuries.includes(option.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium text-foreground">{option.label}</span>
                  </button>
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Select all that apply, or skip if none
              </p>

              <div className="mt-auto pt-8">
                <Button variant="hero" size="xl" className="w-full" onClick={goNext}>
                  {injuries.length > 0 ? 'Continue' : 'Skip'}
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Goals Step */}
          {onboardingStep === 'goals' && (
            <div className="flex min-h-screen flex-col px-6 py-20">
              <button onClick={goBack} className="mb-8 text-muted-foreground">
                ← Back
              </button>
              
              <h2 className="text-3xl font-bold text-foreground">
                What are your goals?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Select up to 3 primary goals
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {goalOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      if (goals.includes(option.id)) {
                        setGoals(goals.filter((g) => g !== option.id));
                      } else if (goals.length < 3) {
                        setGoals([...goals, option.id]);
                      }
                    }}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all ${
                      goals.includes(option.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <span className="font-medium text-foreground text-center">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <Label className="mb-3 block">Focus areas (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {focusOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        if (focusAreas.includes(option.id)) {
                          setFocusAreas(focusAreas.filter((a) => a !== option.id));
                        } else {
                          setFocusAreas([...focusAreas, option.id]);
                        }
                      }}
                      className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-all ${
                        focusAreas.includes(option.id)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-8">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={goNext}
                  disabled={goals.length === 0}
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Experience Step */}
          {onboardingStep === 'experience' && (
            <div className="flex min-h-screen flex-col px-6 py-20">
              <button onClick={goBack} className="mb-8 text-muted-foreground">
                ← Back
              </button>
              
              <h2 className="text-3xl font-bold text-foreground">
                Your fitness level?
              </h2>
              <p className="mt-2 text-muted-foreground">
                This helps us set the right intensity
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    id: 'beginner' as const,
                    label: 'Beginner',
                    description: 'New to strength training or returning after a long break',
                    emoji: '🌱',
                  },
                  {
                    id: 'intermediate' as const,
                    label: 'Intermediate',
                    description: 'Consistent training for 6+ months',
                    emoji: '💪',
                  },
                  {
                    id: 'advanced' as const,
                    label: 'Advanced',
                    description: '2+ years of serious training',
                    emoji: '🏆',
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setExperience(option.id)}
                    className={`flex w-full items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                      experience === option.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-3xl">{option.emoji}</span>
                    <div>
                      <span className="block font-semibold text-foreground">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <Button variant="hero" size="xl" className="w-full" onClick={goNext}>
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Consent Step */}
          {onboardingStep === 'consent' && (
            <div className="flex min-h-screen flex-col px-6 py-20">
              <button onClick={goBack} className="mb-8 text-muted-foreground">
                ← Back
              </button>
              
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              
              <h2 className="text-3xl font-bold text-foreground">
                Your data, your control
              </h2>
              <p className="mt-2 text-muted-foreground">
                We take your privacy seriously
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    id: 'gdpr',
                    label: 'Privacy Policy',
                    description: 'I agree to the terms and privacy policy',
                    required: true,
                  },
                  {
                    id: 'healthData',
                    label: 'Health Data',
                    description: 'Allow FitAI to process my health information',
                    required: true,
                  },
                  {
                    id: 'imageAnalysis',
                    label: 'Machine Recognition',
                    description: 'Allow AI analysis of gym equipment photos',
                    required: false,
                  },
                  {
                    id: 'disclaimer',
                    label: 'Disclaimer',
                    description: 'I understand this is not medical advice',
                    required: true,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setConsents({ ...consents, [item.id]: !consents[item.id as keyof typeof consents] })
                    }
                    className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                      consents[item.id as keyof typeof consents]
                        ? 'border-primary bg-primary/10'
                        : 'border-border'
                    }`}
                  >
                    <div
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all ${
                        consents[item.id as keyof typeof consents]
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}
                    >
                      {consents[item.id as keyof typeof consents] && (
                        <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className="block font-medium text-foreground">
                        {item.label}
                        {item.required && <span className="text-destructive"> *</span>}
                      </span>
                      <span className="text-sm text-muted-foreground">{item.description}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-8">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={goNext}
                  disabled={!consents.gdpr || !consents.healthData || !consents.disclaimer}
                >
                  Continue
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {onboardingStep === 'complete' && (
            <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-success/20"
              >
                <motion.svg
                  className="h-12 w-12 text-success"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-3xl font-bold text-foreground"
              >
                You're all set!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 max-w-sm text-center text-muted-foreground"
              >
                Your personalized training journey begins now. Let's add your gym equipment to get started.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 w-full max-w-sm space-y-4"
              >
                <div className="rounded-2xl bg-card p-4 shadow-card">
                  <p className="text-sm font-medium text-muted-foreground">Your 7-day trial includes:</p>
                  <ul className="mt-3 space-y-2">
                    {[
                      'Unlimited AI workout generation',
                      'Equipment detection & setup',
                      'Progress tracking',
                      'Personalized recommendations',
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 w-full max-w-sm"
              >
                <Button variant="hero" size="xl" className="w-full" onClick={handleComplete}>
                  Start Training
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
