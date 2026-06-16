import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type LoadingType = 'table' | 'card' | 'list' | 'spinner';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  type?: LoadingType;
  rows?: number;
  cards?: number;
  items?: number;
  className?: string;
}

const skeletonBase =
  'bg-ink-100 rounded-lg relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

function SkeletonLine({
  className,
}: {
  className?: string;
}) {
  return <div className={cn('h-4', skeletonBase, className)} />;
}

function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={cn(
          'h-10 w-10 animate-spin rounded-full border-[3px] border-ink-200 border-t-primary-500',
          className
        )}
      />
      <p className="text-sm text-ink-500 font-medium">加载中...</p>
    </div>
  );
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full rounded-2xl border border-ink-200/80 bg-white overflow-hidden">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-ink-100 bg-ink-50/50">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonLine
            key={i}
            className={cn(
              'h-3 col-span-2',
              i === 0 && 'col-span-3',
              i === 5 && 'col-span-1 ml-auto'
            )}
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={cn(
            'grid grid-cols-12 gap-4 px-6 py-4',
            rowIdx !== rows - 1 && 'border-b border-ink-100/60'
          )}
        >
          <SkeletonLine className="h-3.5 col-span-3 w-5/6" />
          <SkeletonLine className="h-3.5 col-span-2 w-4/5" />
          <SkeletonLine className="h-3.5 col-span-2 w-3/4" />
          <SkeletonLine className="h-3.5 col-span-2 w-5/6" />
          <SkeletonLine className="h-3.5 col-span-2 w-4/6" />
          <SkeletonLine className="h-3.5 col-span-1 w-1/2 ml-auto rounded-full" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-ink-200/80 shadow-card p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <SkeletonLine className="h-3 w-16" />
              <SkeletonLine className="h-7 w-24" />
              <SkeletonLine className="h-3 w-20" />
            </div>
            <div className={cn('h-11 w-11 rounded-xl', skeletonBase)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="rounded-2xl bg-white border border-ink-200/80 shadow-card divide-y divide-ink-100/60 overflow-hidden">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className={cn('h-11 w-11 rounded-full shrink-0', skeletonBase)} />
          <div className="flex-1 space-y-2 min-w-0">
            <SkeletonLine className="h-3.5 w-2/5" />
            <SkeletonLine className="h-3 w-3/5" />
          </div>
          <div className="space-y-2 items-end flex flex-col shrink-0">
            <SkeletonLine className="h-3 w-16" />
            <SkeletonLine className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Loading({
  type = 'spinner',
  rows = 6,
  cards = 4,
  items = 5,
  className,
  ...props
}: LoadingProps) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {type === 'spinner' && <Spinner />}
      {type === 'table' && <TableSkeleton rows={rows} />}
      {type === 'card' && <CardSkeleton cards={cards} />}
      {type === 'list' && <ListSkeleton items={items} />}
    </div>
  );
}

export { SkeletonLine };
