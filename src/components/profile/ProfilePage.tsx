import { motion } from 'framer-motion';
import { User, Settings, Bell, Shield, LogOut, ChevronRight, Moon, Sun, Crown, Target, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useApp } from '@/contexts/AppContext';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { useLanguage } from '@/i18n/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  onLogout: () => void;
  onResetProfile?: () => void;
}

export function ProfilePage({ onLogout, onResetProfile }: ProfilePageProps) {
  const { user, healthProfile, fitnessGoals, isDarkMode, toggleDarkMode } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: Target,
      label: 'Edit Fitness Goals',
      description: 'Update goals, focus areas & experience',
      action: onResetProfile,
    },
    {
      icon: User,
      label: 'Edit Profile',
      description: 'Update your personal information',
    },
    {
      icon: Settings,
      label: 'Preferences',
      description: 'App settings and customization',
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage push notifications',
    },
    {
      icon: FileText,
      label: 'Privacy Policy',
      description: 'View our privacy policy',
      action: () => navigate('/privacy'),
    },
    {
      icon: Shield,
      label: 'Privacy & Data',
      description: 'Manage your data and privacy settings',
    },
  ];

  const trialDaysLeft = user?.trialEndsAt
    ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="min-h-screen pb-24 bg-background">
      <PageHeader title="Profile" />

      <div className="px-4 space-y-6">
        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fitness-card flex items-center gap-4"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-bold text-primary-foreground">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{user?.name || 'User'}</h3>
            <p className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</p>
          </div>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl gradient-primary p-6"
        >
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-20 w-20 rounded-full bg-foreground/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground/80">
                {user?.subscriptionStatus === 'trial' ? 'Free Trial' : 'Pro Member'}
              </span>
            </div>
            {user?.subscriptionStatus === 'trial' && (
              <>
                <p className="mt-2 text-xl font-bold text-primary-foreground">
                  {trialDaysLeft} days left
                </p>
                <Button variant="glass" size="sm" className="mt-4">
                  Upgrade to Pro
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="fitness-card text-center">
            <p className="text-2xl font-bold text-foreground">{healthProfile?.weight || '—'}</p>
            <p className="text-xs text-muted-foreground">kg</p>
          </div>
          <div className="fitness-card text-center">
            <p className="text-2xl font-bold text-foreground">{healthProfile?.height || '—'}</p>
            <p className="text-xs text-muted-foreground">cm</p>
          </div>
          <div className="fitness-card text-center">
            <p className="text-2xl font-bold text-foreground capitalize">
              {fitnessGoals?.experienceLevel?.charAt(0) || '—'}
            </p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </motion.div>

        {/* Dark Mode Toggle */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={toggleDarkMode}
          className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-elevated"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {isDarkMode ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">Dark Mode</p>
            <p className="text-sm text-muted-foreground">
              {isDarkMode ? 'Currently enabled' : 'Currently disabled'}
            </p>
          </div>
          <div
            className={`h-8 w-14 rounded-full p-1 transition-colors ${
              isDarkMode ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`h-6 w-6 rounded-full bg-card shadow-md transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </div>
        </motion.button>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="fitness-card"
        >
          <LanguageSelector />
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-2"
        >
          {menuItems.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 shadow-card transition-all hover:shadow-elevated"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.action ? 'bg-primary/10' : 'bg-muted'}`}>
                <item.icon className={`h-6 w-6 ${item.action ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="outline"
            size="lg"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </motion.div>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground">
          FitAI v1.0.0 • Made with ❤️
        </p>
      </div>
    </div>
  );
}
