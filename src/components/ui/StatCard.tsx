import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardColor = 'primary' | 'mint' | 'warning' | 'danger';
type TrendType = 'up' | 'down';

export interface StatCardProps {
  title: string;
  value: string | number;
  trendValue?: string | number;
  trendType?: TrendType;
  icon?: ReactNode;
  color?: StatCardColor;
  suffix?: string;
  description?: string;
  className?: string;
}

const colorStyles: Record<
  StatCardColor,
  {
    iconBg: string;
    iconColor: string;
    gradientFrom: string;
    gradientTo: string;
    accentRing: string;
    trendColor: string;
  }
> = {
  primary: {
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
    gradientFrom: 'from-primary-500/10',
    gradientTo: 'to-primary-400/0',
    accentRing: 'ring-primary-200/50',
    trendColor: 'text-primary-600 bg-primary-50',
  },
  mint: {
    iconBg: 'bg-mint-50',
    iconColor: 'text-mint-600',
    gradientFrom: 'from-mint-500/15',
    gradientTo: 'to-mint-400/0',
    accentRing: 'ring-mint-200/50',
    trendColor: 'text-mint-600 bg-mint-50',
  },
  warning: {
    iconBg: 'bg-warning-low/15',
    iconColor: 'text-warning-low',
    gradientFrom: 'from-warning-low/20',
    gradientTo: 'to-warning-low/0',
    accentRing: 'ring-warning-low/30',
    trendColor: 'text-warning-low bg-warning-low/15',
  },
  danger: {
    iconBg: 'bg-warning-high/10',
    iconColor: 'text-warning-high',
    gradientFrom: 'from-warning-high/15',
    gradientTo: 'to-warning-high/0',
    accentRing: 'ring-warning-high/30',
    trendColor: 'text-warning-high bg-warning-high/10',
  },
};

export function StatCard({
  title,
  value,
  trendValue,
  trendType = 'up',
  icon,
  color = 'primary',
  suffix,
  description,
  className,
}: StatCardProps) {
  const styles = colorStyles[color];
  const isPositive = trendType === 'up';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white border border-ink-200/80 shadow-card p-5 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <div
        className={cn(
          'absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-60 blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-110',
          styles.gradientFrom,
          styles.gradientTo
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink-500 mb-2 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl lg:text-[32px] font-bold text-ink-900 tracking-tight leading-none">
              {value}
            </span>
            {suffix && (
              <span className="text-sm font-medium text-ink-400">
                {suffix}
              </span>
            )}
          </div>
          {trendValue !== undefined && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold',
                  styles.trendColor
                )}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                ) : (
                  <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
                )}
                {trendValue}
              </span>
              {description && (
                <span className="text-xs text-ink-400">{description}</span>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-110',
            styles.iconBg,
            styles.iconColor,
            styles.accentRing
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
