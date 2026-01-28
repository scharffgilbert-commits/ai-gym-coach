import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Mail, Lock, Eye, EyeOff, Loader2, Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Language } from '@/i18n/translations';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language, setLanguage, languageFlags, languageNames, availableLanguages } = useLanguage();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    // Check for password reset mode from URL
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setMode('reset');
    }
  }, [searchParams]);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mode !== 'reset') {
        navigate('/', { replace: true });
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      } else if (session && mode !== 'reset') {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const validateForm = () => {
    if (mode === 'forgot') {
      try {
        emailSchema.parse({ email });
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: { email?: string } = {};
          error.errors.forEach((err) => {
            if (err.path[0] === 'email') fieldErrors.email = err.message;
          });
          setErrors(fieldErrors);
        }
        return false;
      }
    }

    if (mode === 'reset') {
      try {
        passwordSchema.parse({ password });
        if (password !== confirmPassword) {
          setErrors({ confirmPassword: t('password_mismatch') });
          return false;
        }
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: { password?: string } = {};
          error.errors.forEach((err) => {
            if (err.path[0] === 'password') fieldErrors.password = err.message;
          });
          setErrors(fieldErrors);
        }
        return false;
      }
    }

    try {
      authSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'email') fieldErrors.email = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setResetEmailSent(true);
      toast.success(t('reset_email_sent'));
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('password_updated'));
      setMode('login');
      navigate('/auth', { replace: true });
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'forgot') {
      return handleForgotPassword();
    }

    if (mode === 'reset') {
      return handleResetPassword();
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error(t('login') + ' failed');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success(t('welcome_back') + '!');
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: name || email.split('@')[0],
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Email already registered');
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success(t('create_account') + '!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return t('welcome_back');
      case 'signup': return t('create_account');
      case 'forgot': return t('forgot_password_title');
      case 'reset': return t('reset_password_title');
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return t('login_subtitle');
      case 'signup': return t('signup_subtitle');
      case 'forgot': return t('forgot_password_subtitle');
      case 'reset': return t('reset_password_subtitle');
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return t('login');
      case 'signup': return t('signup');
      case 'forgot': return t('send_reset_link');
      case 'reset': return t('update_password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12 relative safe-area-y">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 safe-area-top">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span>{languageFlags[language]}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableLanguages.map((lang) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setLanguage(lang as Language)}
                className={language === lang ? 'bg-primary/10' : ''}
              >
                <span className="mr-2">{languageFlags[lang as Language]}</span>
                {languageNames[lang as Language]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary shadow-glow"
      >
        <Dumbbell className="h-10 w-10 text-primary-foreground" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        {/* Back button for forgot/reset modes */}
        {(mode === 'forgot' || mode === 'reset') && (
          <button
            onClick={() => {
              setMode('login');
              setResetEmailSent(false);
              setErrors({});
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('back')}
          </button>
        )}

        <h1 className="text-center text-3xl font-bold text-foreground mb-2">
          {getTitle()}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {getSubtitle()}
        </p>

        {/* Reset email sent confirmation */}
        {mode === 'forgot' && resetEmailSent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <Mail className="h-8 w-8 text-success" />
            </div>
            <p className="text-muted-foreground">{t('check_email_for_reset')}</p>
            <Button
              variant="outline"
              onClick={() => {
                setResetEmailSent(false);
                setMode('login');
              }}
            >
              {t('back_to_login')}
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">{t('name')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t('name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === 'reset' ? t('new_password') : t('password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            )}

            {mode === 'reset' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot password link */}
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setErrors({});
                }}
                className="text-sm text-primary hover:underline"
              >
                {t('forgot_password')}
              </button>
            )}

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('loading')}
                </>
              ) : (
                getButtonText()
              )}
            </Button>
          </form>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErrors({});
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {mode === 'login' ? (
                <>{t('no_account')} <span className="text-primary font-medium">{t('signup')}</span></>
              ) : (
                <>{t('have_account')} <span className="text-primary font-medium">{t('login')}</span></>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
