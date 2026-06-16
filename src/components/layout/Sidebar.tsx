import { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Users,
  Building2,
  FileBarChart2,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SubMenuItem = {
  label: string;
  key: string;
};

type MenuItem = {
  label: string;
  key: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: string | number }>;
  children?: SubMenuItem[];
};

const menuItems: MenuItem[] = [
  { label: '核心看板', key: 'dashboard', icon: LayoutDashboard },
  { label: '预警管理', key: 'alerts', icon: AlertTriangle },
  {
    label: '学生档案',
    key: 'students',
    icon: Users,
    children: [
      { label: '档案列表', key: 'students-list' },
      { label: '批量上传', key: 'students-upload' },
      { label: '重点关注', key: 'students-focus' },
    ],
  },
  { label: '学校详情', key: 'schools', icon: Building2 },
  { label: '周报系统', key: 'reports', icon: FileBarChart2 },
  { label: '系统设置', key: 'settings', icon: Settings },
];

const currentUser = {
  name: '张管理',
  role: '系统管理员',
  avatar: null,
};

export function Sidebar() {
  const [activeKey, setActiveKey] = useState('dashboard');
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['students']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      toggleExpand(item.key);
    } else {
      setActiveKey(item.key);
    }
  };

  const handleSubMenuClick = (key: string) => {
    setActiveKey(key);
  };

  const SidebarContent = (
    <>
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mint-400 to-mint-600 shadow-glow">
          <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-white tracking-tight leading-tight">
            心理健康
          </span>
          <span className="text-xs text-mint-300/80 leading-tight">
            监测平台
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedKeys.includes(item.key);
          const isActive = activeKey === item.key;
          const hasActiveChild =
            item.children?.some((c) => c.key === activeKey) ?? false;

          return (
            <div key={item.key}>
              <button
                onClick={() => handleMenuClick(item)}
                className={cn(
                  'group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive || hasActiveChild
                    ? 'bg-white/15 text-white shadow-inner'
                    : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-colors',
                    isActive || hasActiveChild
                      ? 'text-mint-300'
                      : 'text-blue-200/60 group-hover:text-blue-100'
                  )}
                  strokeWidth={2}
                />
                <span className="flex-1 text-left">{item.label}</span>
                {item.children && (
                  <span
                    className={cn(
                      'transition-transform duration-300',
                      isExpanded && 'rotate-180'
                    )}
                  >
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </span>
                )}
              </button>

              {item.children && (
                <div
                  className={cn(
                    'grid transition-all duration-300 ease-in-out overflow-hidden',
                    isExpanded
                      ? 'grid-rows-[1fr] opacity-100 mt-1'
                      : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="min-h-0">
                    <div className="ml-7 mr-2 border-l border-white/10 pl-3 space-y-0.5">
                      {item.children.map((child) => (
                        <button
                          key={child.key}
                          onClick={() => handleSubMenuClick(child.key)}
                          className={cn(
                            'w-full flex items-center gap-2 rounded-md px-3 py-2 text-xs transition-all duration-200',
                            activeKey === child.key
                              ? 'bg-mint-500/20 text-mint-300 font-semibold'
                              : 'text-blue-100/60 hover:text-white hover:bg-white/5'
                          )}
                        >
                          <ChevronRight
                            className={cn(
                              'h-3 w-3 transition-all',
                              activeKey === child.key
                                ? 'text-mint-300 translate-x-0.5'
                                : 'opacity-40'
                            )}
                          />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 backdrop-blur-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mint-400 to-primary-500 ring-2 ring-white/20">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-blue-200/60 truncate">
              {currentUser.role}
            </p>
          </div>
          <button
            className="shrink-0 rounded-lg p-2 text-blue-200/60 hover:bg-white/10 hover:text-white transition-all"
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-card"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink-900/60 backdrop-blur-sm lg:hidden animate-fade-in-up"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] flex flex-col bg-gradient-to-b from-[#0F4C81] via-[#0D4474] to-[#083152] shadow-2xl transition-transform duration-300 ease-out',
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-3 lg:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
        >
          <X className="h-4 w-4" />
        </button>
        {SidebarContent}
      </aside>
    </>
  );
}
