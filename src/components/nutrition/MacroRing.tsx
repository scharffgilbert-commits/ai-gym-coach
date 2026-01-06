import { cn } from "@/lib/utils";

interface MacroRingProps {
  value: number;
  max: number;
  label: string;
  color: 'protein' | 'carbs' | 'fat' | 'calories';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

const colorMap = {
  protein: 'text-blue-500',
  carbs: 'text-amber-500',
  fat: 'text-rose-500',
  calories: 'text-primary'
};

const strokeColorMap = {
  protein: '#3b82f6',
  carbs: '#f59e0b',
  fat: '#f43f5e',
  calories: 'hsl(var(--primary))'
};

const sizeMap = {
  sm: { size: 48, stroke: 4 },
  md: { size: 64, stroke: 5 },
  lg: { size: 80, stroke: 6 }
};

export function MacroRing({ 
  value, 
  max, 
  label, 
  color, 
  size = 'md',
  showValue = true 
}: MacroRingProps) {
  const { size: ringSize, stroke } = sizeMap[size];
  const radius = (ringSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg className="transform -rotate-90" width={ringSize} height={ringSize}>
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-muted/30"
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={strokeColorMap[color]}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-xs font-bold", colorMap[color])}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", colorMap[color])}>
        {Math.round(value)}/{max}g
      </span>
    </div>
  );
}
