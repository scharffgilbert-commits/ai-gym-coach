import { motion } from 'framer-motion';
import { 
  Trophy, Flame, Star, Medal, Crown, Zap, CalendarCheck, 
  Droplet, Droplets, Award, Dumbbell, Sunrise, Moon, TrendingUp, Footprints
} from 'lucide-react';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  flame: Flame,
  star: Star,
  medal: Medal,
  crown: Crown,
  zap: Zap,
  'calendar-check': CalendarCheck,
  droplet: Droplet,
  droplets: Droplets,
  award: Award,
  dumbbell: Dumbbell,
  sunrise: Sunrise,
  moon: Moon,
  'trending-up': TrendingUp,
  footprints: Footprints,
};

export function AchievementBadge({ 
  name, 
  description, 
  icon, 
  unlocked, 
  unlockedAt,
  size = 'md' 
}: AchievementBadgeProps) {
  const IconComponent = iconMap[icon] || Trophy;

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      className={`flex flex-col items-center text-center ${!unlocked ? 'opacity-50 grayscale' : ''}`}
    >
      <div
        className={`${sizeClasses[size]} relative flex items-center justify-center rounded-full ${
          unlocked 
            ? 'gradient-primary shadow-glow' 
            : 'bg-muted'
        }`}
      >
        <IconComponent className={`${iconSizes[size]} ${unlocked ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
        
        {unlocked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>

      <p className={`mt-2 font-semibold text-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {name}
      </p>
      <p className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-xs'}`}>
        {description}
      </p>
      
      {unlocked && unlockedAt && size !== 'sm' && (
        <p className="mt-1 text-xs text-primary">
          {new Date(unlockedAt).toLocaleDateString('de-DE')}
        </p>
      )}
    </motion.div>
  );
}
