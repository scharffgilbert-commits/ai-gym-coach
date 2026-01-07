export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          key: string
          name: string
          threshold: number
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon?: string
          id?: string
          key: string
          name: string
          threshold?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          threshold?: number
        }
        Relationships: []
      }
      body_measurements: {
        Row: {
          body_fat_percent: number | null
          chest_cm: number | null
          created_at: string
          hips_cm: number | null
          id: string
          left_arm_cm: number | null
          left_calf_cm: number | null
          left_thigh_cm: number | null
          measured_at: string
          notes: string | null
          right_arm_cm: number | null
          right_calf_cm: number | null
          right_thigh_cm: number | null
          user_id: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          body_fat_percent?: number | null
          chest_cm?: number | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          left_arm_cm?: number | null
          left_calf_cm?: number | null
          left_thigh_cm?: number | null
          measured_at?: string
          notes?: string | null
          right_arm_cm?: number | null
          right_calf_cm?: number | null
          right_thigh_cm?: number | null
          user_id: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          body_fat_percent?: number | null
          chest_cm?: number | null
          created_at?: string
          hips_cm?: number | null
          id?: string
          left_arm_cm?: number | null
          left_calf_cm?: number | null
          left_thigh_cm?: number | null
          measured_at?: string
          notes?: string | null
          right_arm_cm?: number | null
          right_calf_cm?: number | null
          right_thigh_cm?: number | null
          user_id?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      completed_exercises: {
        Row: {
          completed_at: string
          feedback: string | null
          id: string
          machine_id: string | null
          machine_name: string
          pain_location: string | null
          pain_reported: boolean | null
          session_id: string
        }
        Insert: {
          completed_at?: string
          feedback?: string | null
          id?: string
          machine_id?: string | null
          machine_name: string
          pain_location?: string | null
          pain_reported?: boolean | null
          session_id: string
        }
        Update: {
          completed_at?: string
          feedback?: string | null
          id?: string
          machine_id?: string | null
          machine_name?: string
          pain_location?: string | null
          pain_reported?: boolean | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_exercises_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_sets: {
        Row: {
          completed_at: string
          exercise_id: string
          id: string
          reps: number
          rpe: number | null
          set_number: number
          weight: number
        }
        Insert: {
          completed_at?: string
          exercise_id: string
          id?: string
          reps: number
          rpe?: number | null
          set_number: number
          weight?: number
        }
        Update: {
          completed_at?: string
          exercise_id?: string
          id?: string
          reps?: number
          rpe?: number | null
          set_number?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "completed_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "completed_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_usage: {
        Row: {
          avg_weight: number | null
          comfort_rating: number | null
          created_at: string
          id: string
          last_used_at: string | null
          machine_id: string
          max_weight: number | null
          notes: string | null
          total_reps: number | null
          total_sets: number | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          avg_weight?: number | null
          comfort_rating?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          machine_id: string
          max_weight?: number | null
          notes?: string | null
          total_reps?: number | null
          total_sets?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          avg_weight?: number | null
          comfort_rating?: number | null
          created_at?: string
          id?: string
          last_used_at?: string | null
          machine_id?: string
          max_weight?: number | null
          notes?: string | null
          total_reps?: number | null
          total_sets?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_usage_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      fitness_goals: {
        Row: {
          created_at: string
          experience_level: string | null
          focus_areas: string[] | null
          id: string
          long_term_goals: Json | null
          mid_term_goals: Json | null
          short_term_goals: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          focus_areas?: string[] | null
          id?: string
          long_term_goals?: Json | null
          mid_term_goals?: Json | null
          short_term_goals?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          focus_areas?: string[] | null
          id?: string
          long_term_goals?: Json | null
          mid_term_goals?: Json | null
          short_term_goals?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gym_chains: {
        Row: {
          created_at: string
          default_equipment: Json | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          default_equipment?: Json | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          default_equipment?: Json | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      gyms: {
        Row: {
          address: string | null
          chain_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          chain_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          chain_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gyms_chain_id_fkey"
            columns: ["chain_id"]
            isOneToOne: false
            referencedRelation: "gym_chains"
            referencedColumns: ["id"]
          },
        ]
      }
      health_data: {
        Row: {
          created_at: string
          data_type: string
          id: string
          metadata: Json | null
          recorded_at: string
          source: string
          synced_at: string
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          data_type: string
          id?: string
          metadata?: Json | null
          recorded_at: string
          source: string
          synced_at?: string
          unit: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          data_type?: string
          id?: string
          metadata?: Json | null
          recorded_at?: string
          source?: string
          synced_at?: string
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      health_profiles: {
        Row: {
          age: number | null
          created_at: string
          gdpr_consent: boolean | null
          gender: string | null
          health_data_consent: boolean | null
          height: number | null
          id: string
          image_analysis_consent: boolean | null
          injuries: Json | null
          preconditions: Json | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          gdpr_consent?: boolean | null
          gender?: string | null
          health_data_consent?: boolean | null
          height?: number | null
          id?: string
          image_analysis_consent?: boolean | null
          injuries?: Json | null
          preconditions?: Json | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          gdpr_consent?: boolean | null
          gender?: string | null
          health_data_consent?: boolean | null
          height?: number | null
          id?: string
          image_analysis_consent?: boolean | null
          injuries?: Json | null
          preconditions?: Json | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      machines: {
        Row: {
          ai_detected: boolean | null
          category: string | null
          created_at: string
          gym_id: string
          id: string
          image_url: string | null
          manufacturer: string | null
          muscle_groups: string[] | null
          name: string
          notes: string | null
          updated_at: string
          user_confirmed: boolean | null
          user_id: string
        }
        Insert: {
          ai_detected?: boolean | null
          category?: string | null
          created_at?: string
          gym_id: string
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          muscle_groups?: string[] | null
          name: string
          notes?: string | null
          updated_at?: string
          user_confirmed?: boolean | null
          user_id: string
        }
        Update: {
          ai_detected?: boolean | null
          category?: string | null
          created_at?: string
          gym_id?: string
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          muscle_groups?: string[] | null
          name?: string
          notes?: string | null
          updated_at?: string
          user_confirmed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "machines_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_entries: {
        Row: {
          calories: number
          carbs_g: number
          created_at: string
          fat_g: number
          food_name: string
          id: string
          logged_at: string
          meal_type: string
          protein_g: number
          serving_size: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          food_name: string
          id?: string
          logged_at?: string
          meal_type?: string
          protein_g?: number
          serving_size?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs_g?: number
          created_at?: string
          fat_g?: number
          food_name?: string
          id?: string
          logged_at?: string
          meal_type?: string
          protein_g?: number
          serving_size?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          created_at: string
          daily_calories: number
          daily_carbs_g: number
          daily_fat_g: number
          daily_protein_g: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_calories?: number
          daily_carbs_g?: number
          daily_fat_g?: number
          daily_protein_g?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_calories?: number
          daily_carbs_g?: number
          daily_fat_g?: number
          daily_protein_g?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planned_exercises: {
        Row: {
          created_at: string
          day_of_week: number | null
          exercise_order: number
          id: string
          machine_id: string | null
          machine_name: string
          notes: string | null
          plan_id: string
          rest_seconds: number | null
          sets: number
          target_reps: number
          target_weight: number | null
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          exercise_order: number
          id?: string
          machine_id?: string | null
          machine_name: string
          notes?: string | null
          plan_id: string
          rest_seconds?: number | null
          sets?: number
          target_reps?: number
          target_weight?: number | null
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          exercise_order?: number
          id?: string
          machine_id?: string | null
          machine_name?: string
          notes?: string | null
          plan_id?: string
          rest_seconds?: number | null
          sets?: number
          target_reps?: number
          target_weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "planned_exercises_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_exercises_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          equipment_onboarding_complete: boolean | null
          id: string
          language: string | null
          name: string | null
          onboarding_complete: boolean | null
          phone: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          equipment_onboarding_complete?: boolean | null
          id?: string
          language?: string | null
          name?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          equipment_onboarding_complete?: boolean | null
          id?: string
          language?: string | null
          name?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_history: {
        Row: {
          id: string
          machine_id: string
          notes: string | null
          recorded_at: string
          repetitions: number
          rpe: number | null
          sets: number
          user_id: string
          weight: number
        }
        Insert: {
          id?: string
          machine_id: string
          notes?: string | null
          recorded_at?: string
          repetitions: number
          rpe?: number | null
          sets: number
          user_id: string
          weight: number
        }
        Update: {
          id?: string
          machine_id?: string
          notes?: string | null
          recorded_at?: string
          repetitions?: number
          rpe?: number | null
          sets?: number
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_history_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      water_intake: {
        Row: {
          amount_ml: number
          created_at: string
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          ai_generated: boolean | null
          ai_tips: string[] | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
          weekly_schedule: Json | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_tips?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
          weekly_schedule?: Json | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_tips?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
          weekly_schedule?: Json | null
        }
        Relationships: []
      }
      workout_preferences: {
        Row: {
          created_at: string
          id: string
          intensity: string | null
          minutes_per_workout: number | null
          preferred_days: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intensity?: string | null
          minutes_per_workout?: number | null
          preferred_days?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intensity?: string | null
          minutes_per_workout?: number | null
          preferred_days?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_sessions: {
        Row: {
          calories_burned: number | null
          created_at: string
          end_time: string | null
          id: string
          notes: string | null
          plan_id: string | null
          start_time: string
          status: string | null
          total_duration: number | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          start_time?: string
          status?: string | null
          total_duration?: number | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          end_time?: string | null
          id?: string
          notes?: string | null
          plan_id?: string | null
          start_time?: string
          status?: string | null
          total_duration?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
