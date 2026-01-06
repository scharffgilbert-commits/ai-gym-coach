import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementBadge } from './AchievementBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  threshold: number;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export function AchievementsList() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [user?.id]);

  const fetchAchievements = async () => {
    // Fetch all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('category', { ascending: true });

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return;
    }

    setAchievements(allAchievements || []);

    // Fetch user's unlocked achievements
    if (user?.id) {
      const { data: unlocked, error: unlockedError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (!unlockedError) {
        setUserAchievements(unlocked || []);
      }
    }

    setIsLoading(false);
  };

  const categories = [...new Set(achievements.map(a => a.category))];
  
  const isUnlocked = (achievementId: string) => 
    userAchievements.some(ua => ua.achievement_id === achievementId);
  
  const getUnlockedAt = (achievementId: string) => 
    userAchievements.find(ua => ua.achievement_id === achievementId)?.unlocked_at;

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;

  const categoryLabels: Record<string, string> = {
    workout: 'Workouts',
    streak: 'Streaks',
    water: 'Hydration',
    strength: 'Stärke',
    special: 'Spezial',
    general: 'Allgemein',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fitness-card text-center"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Trophy className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-left">
            <p className="text-3xl font-bold text-foreground">{unlockedCount}</p>
            <p className="text-sm text-muted-foreground">von {totalCount} Achievements</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full gradient-primary"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent p-0">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {categoryLabels[category] || category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-3 gap-4">
              {achievements
                .filter(a => a.category === category)
                .map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    unlocked={isUnlocked(achievement.id)}
                    unlockedAt={getUnlockedAt(achievement.id)}
                    size="md"
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
