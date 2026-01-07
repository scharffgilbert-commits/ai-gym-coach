import { motion } from 'framer-motion';
import { Home, Dumbbell, Calendar, User, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

interface NavItem {
  icon: typeof Home;
  labelKey: TranslationKey;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, labelKey: 'nav_home', path: '/dashboard' },
  { icon: Dumbbell, labelKey: 'nav_equipment', path: '/equipment' },
  { icon: Calendar, labelKey: 'nav_plan', path: '/plan' },
  { icon: BarChart3, labelKey: 'nav_progress', path: '/progress' },
  { icon: User, labelKey: 'nav_profile', path: '/profile' },
];

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function MobileNav({ currentPath, onNavigate }: MobileNavProps) {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="relative flex flex-col items-center gap-1 py-2 px-3 transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-1 h-1 w-8 rounded-full gradient-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-all',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
