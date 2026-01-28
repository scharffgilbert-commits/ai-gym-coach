import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  showHome = true,
  onBack,
  rightElement,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('sticky top-0 z-40 bg-background/95 backdrop-blur-xl safe-area-top', className)}
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {!showBack && showHome && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleHome}
              className="shrink-0"
            >
              <Home className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </motion.header>
  );
}
