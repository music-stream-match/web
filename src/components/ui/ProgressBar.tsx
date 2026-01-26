import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max, className, showLabel = true }: ProgressBarProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm text-text-muted mb-1">
          <span>{value} / {max}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
