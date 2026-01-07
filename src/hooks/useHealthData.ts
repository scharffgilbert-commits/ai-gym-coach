import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';

export interface HealthDataPoint {
  dataType: 'steps' | 'heart_rate' | 'calories' | 'sleep' | 'workout';
  value: number;
  unit: string;
  source: 'apple_health' | 'google_fit' | 'manual';
  recordedAt: Date;
  metadata?: Record<string, any>;
}

interface HealthStats {
  steps: number;
  heartRate: number;
  caloriesBurned: number;
  sleepMinutes: number;
  lastSynced: Date | null;
}

export function useHealthData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    steps: 0,
    heartRate: 0,
    caloriesBurned: 0,
    sleepMinutes: 0,
    lastSynced: null,
  });

  const isNativeApp = Capacitor.isNativePlatform();

  const saveHealthData = useCallback(async (data: HealthDataPoint[]) => {
    if (!user) return;

    const records = data.map(d => ({
      user_id: user.id,
      data_type: d.dataType,
      value: d.value,
      unit: d.unit,
      source: d.source,
      recorded_at: d.recordedAt.toISOString(),
      metadata: d.metadata || {},
    }));

    const { error } = await supabase
      .from('health_data')
      .insert(records);

    if (error) throw error;
  }, [user]);

  const fetchTodaysStats = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('health_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', today.toISOString())
        .order('synced_at', { ascending: false });

      if (error) throw error;

      // Aggregate data by type
      const stats: HealthStats = {
        steps: 0,
        heartRate: 0,
        caloriesBurned: 0,
        sleepMinutes: 0,
        lastSynced: null,
      };

      const heartRates: number[] = [];

      data?.forEach(record => {
        switch (record.data_type) {
          case 'steps':
            stats.steps += Number(record.value);
            break;
          case 'heart_rate':
            heartRates.push(Number(record.value));
            break;
          case 'calories':
            stats.caloriesBurned += Number(record.value);
            break;
          case 'sleep':
            stats.sleepMinutes += Number(record.value);
            break;
        }

        const syncedAt = new Date(record.synced_at);
        if (!stats.lastSynced || syncedAt > stats.lastSynced) {
          stats.lastSynced = syncedAt;
        }
      });

      // Calculate average heart rate
      if (heartRates.length > 0) {
        stats.heartRate = Math.round(
          heartRates.reduce((a, b) => a + b, 0) / heartRates.length
        );
      }

      setHealthStats(stats);
    } catch (error) {
      console.error('Error fetching health stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getWeeklyData = useCallback(async (dataType: string) => {
    if (!user) return [];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('health_data')
      .select('*')
      .eq('user_id', user.id)
      .eq('data_type', dataType)
      .gte('recorded_at', weekAgo.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    return data || [];
  }, [user]);

  const syncFromWearable = useCallback(async () => {
    if (!user) return { success: false, message: 'Nicht angemeldet' };

    setSyncing(true);
    try {
      if (!isNativeApp) {
        return {
          success: false,
          message: 'Wearable-Sync ist nur in der nativen App verfügbar. Bitte nutze die manuelle Eingabe.',
        };
      }

      // Native health data sync would go here
      // This requires platform-specific plugins that need native development
      // For now, we return a message guiding the user
      
      return {
        success: false,
        message: 'Native Health-Integration erfordert zusätzliche Setup-Schritte. Bitte nutze vorerst die manuelle Eingabe.',
      };
    } catch (error) {
      console.error('Error syncing from wearable:', error);
      return {
        success: false,
        message: 'Fehler beim Synchronisieren',
      };
    } finally {
      setSyncing(false);
    }
  }, [user, isNativeApp]);

  const addManualEntry = useCallback(async (
    dataType: HealthDataPoint['dataType'],
    value: number,
    unit: string,
    recordedAt?: Date
  ) => {
    if (!user) return;

    await saveHealthData([{
      dataType,
      value,
      unit,
      source: 'manual',
      recordedAt: recordedAt || new Date(),
    }]);

    await fetchTodaysStats();
  }, [user, saveHealthData, fetchTodaysStats]);

  return {
    healthStats,
    loading,
    syncing,
    isNativeApp,
    fetchTodaysStats,
    getWeeklyData,
    syncFromWearable,
    addManualEntry,
    saveHealthData,
  };
}
