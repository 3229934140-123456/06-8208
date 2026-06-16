import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'solid' | 'soft' | 'outline';
type BadgeColor =
  | 'primary'
  | 'mint'
  | 'warning-low'
  | 'warning-high'
  | 'risk-safe'
  | 'risk-low'
  | 'risk-medium'
  | 'risk-high';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: 'sm' | 'md' | 'lg';
  withDot?: boolean;
  children?: ReactNode;
}

const variantStyles = (variant: BadgeVariant, color: BadgeColor): string => {
  const styles = {
    solid: solidStyles[color],
    soft: softStyles[color],
    outline: outlineStyles[color],
  };
  return styles[variant];
};

const solidStyles: Record<BadgeColor, string> = {
  primary: 'bg-primary-500 text-white',
  mint: 'bg-mint-500 text-white',
  'warning-low': 'bg-warning-low text-white',
  'warning-high': 'bg-warning-high text-white',
  'risk-safe': 'bg-risk-safe text-white',
  'risk-low': 'bg-risk-low text-white',
  'risk-medium': 'bg-risk-medium text-white',
  'risk-high': 'bg-risk-high text-white',
};

const softStyles: Record<BadgeColor, string> = {
  primary: 'bg-primary-50 text-primary-700 border border-primary-200/60',
  mint: 'bg-mint-50 text-mint-700 border border-mint-200/60',
  'warning-low':
    'bg-warning-low/15 text-orange-700 border border-warning-low/30',
  'warning-high':
    'bg-warning-high/12 text-red-700 border border-warning-high/30',
  'risk-safe':
    'bg-risk-safe/12 text-mint-700 border border-risk-safe/30',
  'risk-low':
    'bg-risk-low/15 text-blue-700 border border-risk-low/30',
  'risk-medium':
    'bg-risk-medium/15 text-orange-700 border border-risk-medium/30',
  'risk-high':
    'bg-risk-high/12 text-red-700 border border-risk-high/30',
};

const outlineStyles: Record<BadgeColor, string> = {
  primary: 'border border-primary-400 text-primary-600 bg-transparent',
  mint: 'border border-mint-400 text-mint-600 bg-transparent',
  'warning-low': 'border border-warning-low text-warning-low bg-transparent',
  'warning-high': 'border border-warning-high text-warning-high bg-transparent',
  'risk-safe': 'border border-risk-safe text-risk-safe bg-transparent',
  'risk-low': 'border border-risk-low text-risk-low bg-transparent',
  'risk-medium': 'border border-risk-medium text-risk-medium bg-transparent',
  'risk-high': 'border border-risk-high text-risk-high bg-transparent',
};

const dotColors: Record<BadgeColor, string> = {
  primary: 'bg-primary-500',
  mint: 'bg-mint-500',
  'warning-low': 'bg-warning-low',
  'warning-high': 'bg-warning-high',
  'risk-safe': 'bg-risk-safe',
  'risk-low': 'bg-risk-low',
  'risk-medium': 'bg-risk-medium',
  'risk-high': 'bg-risk-high',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-[10px] rounded-md',
  md: 'px-2.5 py-1 text-xs rounded-lg',
  lg: 'px-3 py-1.5 text-sm rounded-xl',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'soft',
      color = 'primary',
      size = 'md',
      withDot = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-semibold tracking-wide transition-all',
          sizeStyles[size],
          variantStyles(variant, color),
          className
        )}
        {...props}
      >
        {withDot && (
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full shrink-0',
              dotColors[color]
            )}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
