import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Stethoscope,
  CheckCircle2,
  HeartHandshake,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';

export type EventType = 'warning' | 'approval' | 'intervention' | 'closed' | 'followup';

export interface TimelineEvent {
  id: string | number;
  time: string;
  type: EventType;
  typeName: string;
  title: string;
  description: string;
  operator?: string;
  details?: Record<string, any>;
}

export interface TimelineChartProps {
  events: TimelineEvent[];
  loading?: boolean;
  height?: string | number;
  onEventClick?: (event: TimelineEvent) => void;
}

const EVENT_CONFIG: Record<
  EventType,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    lightBg: string;
    icon: React.ElementType;
  }
> = {
  warning: {
    color: 'text-risk-high',
    bgColor: 'bg-risk-high',
    borderColor: 'border-risk-high/30',
    lightBg: 'bg-risk-high/10',
    icon: AlertTriangle,
  },
  approval: {
    color: 'text-warning-low',
    bgColor: 'bg-warning-low',
    borderColor: 'border-warning-low/30',
    lightBg: 'bg-warning-low/10',
    icon: FileCheck2,
  },
  intervention: {
    color: 'text-primary-500',
    bgColor: 'bg-primary-500',
    borderColor: 'border-primary-500/30',
    lightBg: 'bg-primary-500/10',
    icon: Stethoscope,
  },
  closed: {
    color: 'text-mint-500',
    bgColor: 'bg-mint-500',
    borderColor: 'border-mint-500/30',
    lightBg: 'bg-mint-500/10',
    icon: CheckCircle2,
  },
  followup: {
    color: 'text-risk-low',
    bgColor: 'bg-risk-low',
    borderColor: 'border-risk-low/30',
    lightBg: 'bg-risk-low/10',
    icon: HeartHandshake,
  },
};

export default function TimelineChart({
  events,
  loading = false,
  height = 500,
  onEventClick,
}: TimelineChartProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

  const toggleExpand = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }, [events]);

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return {
        date: `${month}-${day}`,
        time: `${hours}:${minutes}`,
      };
    } catch {
      return { date: timeStr, time: '' };
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center w-full bg-white/50 rounded-2xl"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <Loading />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full bg-white/50 rounded-2xl text-ink-400"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <HeartHandshake className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">暂无事件记录</p>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-2xl"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="h-full overflow-y-auto overflow-x-hidden pr-2 pl-2 py-4 custom-scrollbar">
        <div className="relative">
          <div
            className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-100 via-ink-200 to-mint-100 rounded-full"
            aria-hidden="true"
          />

          <ul className="space-y-4">
            {sortedEvents.map((event, index) => {
              const config = EVENT_CONFIG[event.type];
              const Icon = config.icon;
              const isExpanded = expandedIds.has(event.id);
              const timeFormatted = formatTime(event.time);
              const hasDetails = event.details && Object.keys(event.details).length > 0;

              return (
                <li
                  key={event.id}
                  className="relative pl-14 animate-fade-in-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div
                    className={cn(
                      'absolute left-0 top-0 w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 border-white z-10 transition-transform duration-300 hover:scale-110',
                      config.lightBg,
                      config.color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <div
                      className={cn(
                        'absolute inset-0 rounded-full animate-ping opacity-20',
                        config.bgColor
                      )}
                      style={{ animationDuration: '3s', animationIterationCount: 'infinite', animationDelay: `${index * 0.3}s` }}
                    />
                  </div>

                  <div
                    className={cn(
                      'rounded-xl border transition-all duration-300 cursor-pointer',
                      'hover:shadow-card-hover hover:-translate-y-0.5',
                      'bg-white border-ink-100'
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span
                              className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                                config.lightBg,
                                config.color
                              )}
                            >
                              <Icon className="w-3 h-3 mr-1" />
                              {event.typeName}
                            </span>
                            <span className="text-xs text-ink-400 whitespace-nowrap">
                              {timeFormatted.date} {timeFormatted.time}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-ink-900 truncate">
                            {event.title}
                          </h4>
                        </div>

                        {(hasDetails || event.description.length > 50) && (
                          <button
                            onClick={(e) => toggleExpand(event.id, e)}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-ink-50 transition-colors text-ink-400 hover:text-ink-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>

                      <p
                        className={cn(
                          'text-sm text-ink-500 leading-relaxed transition-all duration-300',
                          !isExpanded && event.description.length > 80
                            ? 'line-clamp-2'
                            : ''
                        )}
                      >
                        {event.description}
                      </p>

                      {event.operator && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-ink-400">
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-ink-50 rounded-lg">
                            <User className="w-3 h-3" />
                            <span>{event.operator}</span>
                          </div>
                        </div>
                      )}

                      {isExpanded && hasDetails && (
                        <div className="mt-4 pt-4 border-t border-ink-100 grid grid-cols-2 gap-x-4 gap-y-2">
                          {Object.entries(event.details!).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="text-ink-400">{key}</span>
                              <span className="font-semibold text-ink-700">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #CBD5E1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94A3B8;
        }
      `}</style>
    </div>
  );
}
