import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Inbox, FileX, SearchX, ShieldAlert, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyIconPreset = 'default' | 'no-data' | 'no-results' | 'error' | 'empty';

export interface EmptyActionProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export interface EmptyProps {
  icon?: ReactNode;
  iconPreset?: EmptyIconPreset;
  title?: string;
  description?: string;
  action?: EmptyActionProps;
  secondaryAction?: EmptyActionProps;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const presetIcons: Record<EmptyIconPreset, { icon: ReactNode; gradient: string }> = {
  default: {
    icon: <Inbox className="h-10 w-10 text-white" strokeWidth={1.5} />,
    gradient: 'from-primary-400 to-primary-600',
  },
  'no-data': {
    icon: <FileX className="h-10 w-10 text-white" strokeWidth={1.5} />,
    gradient: 'from-ink-400 to-ink-600',
  },
  'no-results': {
    icon: <SearchX className="h-10 w-10 text-white" strokeWidth={1.5} />,
    gradient: 'from-mint-400 to-mint-600',
  },
  error: {
    icon: <ShieldAlert className="h-10 w-10 text-white" strokeWidth={1.5} />,
    gradient: 'from-warning-high to-warning-critical',
  },
  empty: {
    icon: <Plus className="h-10 w-10 text-white" strokeWidth={1.5} />,
    gradient: 'from-primary-400 to-mint-500',
  },
};

const sizeMap = {
  sm: {
    wrapper: 'py-8 gap-3',
    iconWrap: 'h-16 w-16',
    icon: 'scale-75',
    title: 'text-base',
    desc: 'text-xs',
    action: 'text-sm px-4 py-1.5',
  },
  md: {
    wrapper: 'py-12 gap-4',
    iconWrap: 'h-20 w-20',
    icon: 'scale-90',
    title: 'text-lg',
    desc: 'text-sm',
    action: 'text-sm px-5 py-2',
  },
  lg: {
    wrapper: 'py-20 gap-6',
    iconWrap: 'h-28 w-28',
    icon: 'scale-110',
    title: 'text-xl',
    desc: 'text-base',
    action: 'text-base px-6 py-2.5',
  },
};

export function Empty({
  icon,
  iconPreset = 'default',
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyProps) {
  const preset = presetIcons[iconPreset];
  const s = sizeMap[size];
  const displayIcon = icon ?? preset.icon;

  const defaultTitles: Record<EmptyIconPreset, string> = {
    default: '暂无数据',
    'no-data': '尚未创建任何内容',
    'no-results': '未找到匹配结果',
    error: '加载出错了',
    empty: '还没有任何内容',
  };

  const defaultDescs: Record<EmptyIconPreset, string> = {
    default: '数据将在接入后自动展示，稍后再试',
    'no-data': '点击下方按钮创建第一个内容开始使用',
    'no-results': '请尝试调整搜索条件或清除筛选器',
    error: '请检查网络连接，或稍后刷新重试',
    empty: '添加数据后即可在此处查看',
  };

  const displayTitle = title ?? defaultTitles[iconPreset];
  const displayDesc = description ?? defaultDescs[iconPreset];

  const {
    label: actionLabel,
    className: actionClassName,
    onClick: actionOnClick,
    ...actionRest
  } = action ?? ({} as EmptyActionProps);

  const {
    label: secondaryLabel,
    className: secondaryClassName,
    onClick: secondaryOnClick,
    ...secondaryRest
  } = secondaryAction ?? ({} as EmptyActionProps);

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center justify-center text-center',
        s.wrapper,
        className
      )}
    >
      <div
        className={cn(
          'relative flex shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg shadow-ink-200/50',
          s.iconWrap,
          preset.gradient
        )}
      >
        <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-[2px]" />
        <div className={cn('relative z-10', s.icon)}>{displayIcon}</div>
        <div
          className={cn(
            'absolute -bottom-3 left-1/2 -translate-x-1/2 h-4 rounded-full bg-ink-200/40 blur-md',
            size === 'sm' ? 'w-12' : size === 'md' ? 'w-16' : 'w-24'
          )}
        />
      </div>

      <div className="flex flex-col items-center gap-1.5 mt-1">
        <h3
          className={cn(
            'font-bold text-ink-800 tracking-tight',
            s.title
          )}
        >
          {displayTitle}
        </h3>
        {displayDesc && (
          <p className={cn('text-ink-500 max-w-md leading-relaxed', s.desc)}>
            {displayDesc}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-1">
          {secondaryAction && (
            <button
              className={cn(
                'rounded-xl font-medium border border-ink-200 bg-white text-ink-600 hover:bg-ink-50 hover:border-ink-300 transition-all duration-200',
                s.action,
                secondaryClassName
              )}
              onClick={secondaryOnClick}
              {...secondaryRest}
            >
              {secondaryLabel}
            </button>
          )}
          {action && (
            <button
              className={cn(
                'rounded-xl font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md shadow-primary-500/25 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5',
                s.action,
                actionClassName
              )}
              onClick={actionOnClick}
              {...actionRest}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
