import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar, type BreadcrumbItem } from './TopBar';

export type { BreadcrumbItem };

export type MainLayoutProps = {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
};

export function MainLayout({ children, breadcrumbs }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar />
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <TopBar breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6 xl:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
