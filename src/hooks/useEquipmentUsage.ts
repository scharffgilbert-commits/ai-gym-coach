import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UpdateUsageParams {
  machineId: string;
  sets: number;
  reps: number;
  weight: number;
}

export function useEquipmentUsage() {
  const { user } = useAuth();

  const updateEquipmentUsage = useCallback(async (params: UpdateUsageParams) => {
    if (!user) return;

    try {
      // First, check if usage record exists
      const { data: existing } = await supabase
        .from('equipment_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('machine_id', params.machineId)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const newTotalSets = existing.total_sets + params.sets;
        const newTotalReps = existing.total_reps + params.reps;
        const newMaxWeight = Math.max(existing.max_weight || 0, params.weight);
        const newAvgWeight = existing.avg_weight 
          ? (existing.avg_weight + params.weight) / 2 
          : params.weight;

        await supabase
          .from('equipment_usage')
          .update({
            usage_count: existing.usage_count + 1,
            total_sets: newTotalSets,
            total_reps: newTotalReps,
            max_weight: newMaxWeight,
            avg_weight: newAvgWeight,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Create new record
        await supabase
          .from('equipment_usage')
          .insert({
            user_id: user.id,
            machine_id: params.machineId,
            usage_count: 1,
            total_sets: params.sets,
            total_reps: params.reps,
            max_weight: params.weight,
            avg_weight: params.weight,
            last_used_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error updating equipment usage:', error);
    }
  }, [user]);

  const getEquipmentStats = useCallback(async (machineId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('equipment_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('machine_id', machineId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching equipment stats:', error);
      return null;
    }
  }, [user]);

  const getMostUsedEquipment = useCallback(async (limit = 5) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('equipment_usage')
        .select(`
          *,
          machines:machine_id (
            id,
            name,
            category,
            muscle_groups
          )
        `)
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching most used equipment:', error);
      return [];
    }
  }, [user]);

  const rateEquipmentComfort = useCallback(async (machineId: string, rating: number) => {
    if (!user || rating < 1 || rating > 5) return;

    try {
      await supabase
        .from('equipment_usage')
        .upsert({
          user_id: user.id,
          machine_id: machineId,
          comfort_rating: rating,
        }, { onConflict: 'user_id,machine_id' });
    } catch (error) {
      console.error('Error rating equipment:', error);
    }
  }, [user]);

  return {
    updateEquipmentUsage,
    getEquipmentStats,
    getMostUsedEquipment,
    rateEquipmentComfort,
  };
}
