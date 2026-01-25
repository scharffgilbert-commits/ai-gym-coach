import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type CyclePhase = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleData {
  lastPeriodStart: Date | null;
  cycleLength: number;
  currentDay: number;
  currentPhase: CyclePhase;
  nextPeriod: Date | null;
  isEnabled: boolean;
}

export interface PhaseRecommendation {
  title: string;
  energy: 'niedrig' | 'steigend' | 'höchste' | 'sinkend';
  recommendation: string;
  avoid: string;
  nutrition: string;
  color: string;
}

export const phaseRecommendations: Record<CyclePhase, PhaseRecommendation> = {
  menstruation: {
    title: "Menstruation",
    energy: "niedrig",
    recommendation: "Leichteres Training, Yoga, Stretching",
    avoid: "Intensive HIIT, schwere Gewichte",
    nutrition: "Eisenreiche Lebensmittel",
    color: "rose"
  },
  follicular: {
    title: "Follikelphase",
    energy: "steigend",
    recommendation: "Perfekt für neue PRs und intensives Training",
    avoid: "Nichts - volle Power!",
    nutrition: "Proteinreich für Muskelaufbau",
    color: "emerald"
  },
  ovulation: {
    title: "Ovulation",
    energy: "höchste",
    recommendation: "Peak Performance! Krafttraining, HIIT",
    avoid: "Übertraining vermeiden",
    nutrition: "Antioxidantien, viel Wasser",
    color: "amber"
  },
  luteal: {
    title: "Lutealphase",
    energy: "sinkend",
    recommendation: "Moderate Intensität, mehr Pausen",
    avoid: "Zu lange Workouts",
    nutrition: "Komplexe Kohlenhydrate gegen Heißhunger",
    color: "blue"
  }
};

const calculatePhase = (dayInCycle: number, cycleLength: number): CyclePhase => {
  // Standard 28-day cycle phases (adjusted proportionally for other lengths)
  const menstruationEnd = Math.round(5 * cycleLength / 28);
  const follicularEnd = Math.round(13 * cycleLength / 28);
  const ovulationEnd = Math.round(16 * cycleLength / 28);
  
  if (dayInCycle <= menstruationEnd) return 'menstruation';
  if (dayInCycle <= follicularEnd) return 'follicular';
  if (dayInCycle <= ovulationEnd) return 'ovulation';
  return 'luteal';
};

export function useCycleTracking() {
  const { user } = useAuth();
  const [cycleData, setCycleData] = useState<CycleData>({
    lastPeriodStart: null,
    cycleLength: 28,
    currentDay: 1,
    currentPhase: 'menstruation',
    nextPeriod: null,
    isEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadCycleData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('health_profiles')
        .select('cycle_tracking_enabled, last_period_start, average_cycle_length')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.cycle_tracking_enabled && data.last_period_start) {
        const lastPeriod = new Date(data.last_period_start);
        const cycleLength = data.average_cycle_length || 28;
        const today = new Date();
        
        // Calculate days since last period
        const daysSinceStart = Math.floor(
          (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate current day in cycle (1-based, wraps around)
        const currentDay = (daysSinceStart % cycleLength) + 1;
        
        // Calculate next period date
        const cyclesPassed = Math.floor(daysSinceStart / cycleLength);
        const nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + (cyclesPassed + 1) * cycleLength);
        
        setCycleData({
          lastPeriodStart: lastPeriod,
          cycleLength,
          currentDay,
          currentPhase: calculatePhase(currentDay, cycleLength),
          nextPeriod,
          isEnabled: true,
        });
      } else {
        setCycleData(prev => ({ ...prev, isEnabled: data?.cycle_tracking_enabled || false }));
      }
    } catch (error) {
      console.error('Error loading cycle data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCycleData();
  }, [loadCycleData]);

  const updatePeriodStart = async (date: Date) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('health_profiles')
        .update({
          last_period_start: date.toISOString().split('T')[0],
          cycle_tracking_enabled: true,
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      await loadCycleData();
    } catch (error) {
      console.error('Error updating period start:', error);
      throw error;
    }
  };

  const setCycleLength = async (length: number) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('health_profiles')
        .update({ average_cycle_length: length })
        .eq('user_id', user.id);
      
      if (error) throw error;
      await loadCycleData();
    } catch (error) {
      console.error('Error updating cycle length:', error);
      throw error;
    }
  };

  const toggleCycleTracking = async (enabled: boolean) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('health_profiles')
        .update({ cycle_tracking_enabled: enabled })
        .eq('user_id', user.id);
      
      if (error) throw error;
      setCycleData(prev => ({ ...prev, isEnabled: enabled }));
    } catch (error) {
      console.error('Error toggling cycle tracking:', error);
      throw error;
    }
  };

  const phaseRecommendation = phaseRecommendations[cycleData.currentPhase];

  return {
    cycleData,
    isLoading,
    updatePeriodStart,
    setCycleLength,
    toggleCycleTracking,
    phaseRecommendation,
    refresh: loadCycleData,
  };
}
