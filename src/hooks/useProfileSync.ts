import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { HealthProfile, FitnessGoals, Gym, Machine } from '@/types/fitness';

export function useProfileSync() {
  const { user: authUser } = useAuth();
  const { 
    setUser, 
    setHealthProfile, 
    setFitnessGoals, 
    setGyms,
    setOnboardingStep 
  } = useApp();

  // Load user profile data from Supabase
  const loadProfileData = useCallback(async () => {
    if (!authUser) return;

    try {
      // Load profile - create if doesn't exist
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      // If profile doesn't exist, create one
      if (profileError && profileError.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            onboarding_complete: false,
            subscription_status: 'trial',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          profile = newProfile;
        }
      }

      if (profile) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: profile.name || authUser.email?.split('@')[0] || 'User',
          createdAt: new Date(profile.created_at),
          onboardingComplete: profile.onboarding_complete || false,
          subscriptionStatus: profile.subscription_status as any || 'trial',
          trialEndsAt: profile.trial_ends_at ? new Date(profile.trial_ends_at) : undefined,
        });

        if (profile.onboarding_complete) {
          setOnboardingStep('complete');
        }
      } else {
        // Fallback: set a basic user even if profile creation failed
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          createdAt: new Date(),
          onboardingComplete: false,
          subscriptionStatus: 'trial',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
      }

      // Load health profile
      const { data: healthData } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (healthData) {
        setHealthProfile({
          userId: authUser.id,
          age: healthData.age || undefined,
          gender: healthData.gender as any,
          height: healthData.height || undefined,
          weight: healthData.weight || undefined,
          injuries: (healthData.injuries as any[]) || [],
          preconditions: (healthData.preconditions as any[]) || [],
          gdprConsent: healthData.gdpr_consent || false,
          healthDataConsent: healthData.health_data_consent || false,
          imageAnalysisConsent: healthData.image_analysis_consent || false,
        });
      }

      // Load fitness goals
      const { data: goalsData } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (goalsData) {
        setFitnessGoals({
          userId: authUser.id,
          shortTerm: (goalsData.short_term_goals as any[]) || [],
          midTerm: (goalsData.mid_term_goals as any[]) || [],
          longTerm: (goalsData.long_term_goals as any[]) || [],
          focusAreas: (goalsData.focus_areas as any[]) || [],
          experienceLevel: goalsData.experience_level as any || 'beginner',
        });
      }

      // Load gyms with machines
      const { data: gymsData } = await supabase
        .from('gyms')
        .select('*, machines(*)')
        .eq('user_id', authUser.id);

      if (gymsData && gymsData.length > 0) {
        const gyms: Gym[] = gymsData.map(gym => ({
          id: gym.id,
          userId: gym.user_id,
          name: gym.name,
          address: gym.address || undefined,
          createdAt: new Date(gym.created_at),
          machines: (gym.machines || []).map((m: any): Machine => ({
            id: m.id,
            gymId: m.gym_id,
            name: m.name,
            category: m.category as any,
            muscleGroups: m.muscle_groups || [],
            manufacturer: m.manufacturer || undefined,
            imageUrl: m.image_url || undefined,
            notes: m.notes || undefined,
            aiDetected: m.ai_detected || false,
            userConfirmed: m.user_confirmed || false,
          })),
        }));
        setGyms(gyms);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  }, [authUser, setUser, setHealthProfile, setFitnessGoals, setGyms, setOnboardingStep]);

  // Save health profile to Supabase
  const saveHealthProfile = useCallback(async (profile: HealthProfile) => {
    if (!authUser) return;

    // Check if profile exists
    const { data: existing } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('health_profiles')
        .update({
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          injuries: profile.injuries as any,
          preconditions: profile.preconditions as any,
          gdpr_consent: profile.gdprConsent,
          health_data_consent: profile.healthDataConsent,
          image_analysis_consent: profile.imageAnalysisConsent,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Error updating health profile:', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('health_profiles')
        .insert({
          user_id: authUser.id,
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          injuries: profile.injuries as any,
          preconditions: profile.preconditions as any,
          gdpr_consent: profile.gdprConsent,
          health_data_consent: profile.healthDataConsent,
          image_analysis_consent: profile.imageAnalysisConsent,
        });

      if (error) {
        console.error('Error inserting health profile:', error);
        throw error;
      }
    }
  }, [authUser]);

  // Save fitness goals to Supabase
  const saveFitnessGoals = useCallback(async (goals: FitnessGoals) => {
    if (!authUser) return;

    // Check if goals exist
    const { data: existing } = await supabase
      .from('fitness_goals')
      .select('id')
      .eq('user_id', authUser.id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('fitness_goals')
        .update({
          short_term_goals: goals.shortTerm as any,
          mid_term_goals: goals.midTerm as any,
          long_term_goals: goals.longTerm as any,
          focus_areas: goals.focusAreas,
          experience_level: goals.experienceLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', authUser.id);

      if (error) {
        console.error('Error updating fitness goals:', error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('fitness_goals')
        .insert({
          user_id: authUser.id,
          short_term_goals: goals.shortTerm as any,
          mid_term_goals: goals.midTerm as any,
          long_term_goals: goals.longTerm as any,
          focus_areas: goals.focusAreas,
          experience_level: goals.experienceLevel,
        });

      if (error) {
        console.error('Error inserting fitness goals:', error);
        throw error;
      }
    }
  }, [authUser]);

  // Mark onboarding complete
  const completeOnboarding = useCallback(async () => {
    if (!authUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', authUser.id);

    if (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }, [authUser]);

  // Don't auto-load on mount - let the parent component control when to load
  // This prevents duplicate loading

  return {
    loadProfileData,
    saveHealthProfile,
    saveFitnessGoals,
    completeOnboarding,
  };
}
