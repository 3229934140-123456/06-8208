import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  UserCog,
  RefreshCw,
  ChevronRight,
  Home,
  X,
  User as UserIcon,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/dataStore';
import type { StudentProfile, WarningRecord } from '@/types';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type TopBarProps = {
  breadcrumbs?: BreadcrumbItem[];
};

const defaultBreadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/' },
  { label: '预警管理', href: '/alerts' },
  { label: '预警列表' },
];

const notifications = [
  { id: 1, title: '新预警：学生李明(高三2班)', time: '刚刚', unread: true },
  { id: 2, title: '周报生成完成', time: '10分钟前', unread: true },
  { id: 3, title: '数据同步成功', time: '1小时前', unread: false },
  { id: 4, title: '批量导入完成(128条)', time: '2小时前', unread: false },
];

interface SearchResult {
  type: 'student' | 'warning' | 'school';
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
}

export function TopBar({ breadcrumbs = defaultBreadcrumbs }: TopBarProps) {
  const navigate = useNavigate();
  const { getStudents, getWarnings, getSchools } = useDataStore();

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const searchResults = useMemo<SearchResult[]>(() => {
    const keyword = searchValue.trim();
    if (!keyword) return [];

    const results: SearchResult[] = [];

    const students = getStudents({ keyword }).slice(0, 5);
    students.forEach((s) => {
      results.push({
        type: 'student',
        id: s.id,
        title: s.name,
        subtitle: `${s.studentNo} · ${s.college}`,
        icon: UserIcon,
        iconColor: 'text-primary-500 bg-primary-50',
      });
    });

    const warnings = getWarnings({ keyword }).slice(0, 5);
    warnings.forEach((w) => {
      results.push({
        type: 'warning',
        id: w.id,
        title: w.studentName,
        subtitle: `${w.id} · ${w.triggerReason}`,
        icon: AlertTriangle,
        iconColor: 'text-warning-high bg-warning-high/10',
      });
    });

    const schools = getSchools().filter((s) => s.name.includes(keyword)).slice(0, 3);
    schools.forEach((s) => {
      results.push({
        type: 'school',
        id: s.id,
        title: s.name,
        subtitle: s.province,
        icon: GraduationCap,
        iconColor: 'text-mint-600 bg-mint-50',
      });
    });

    return results.slice(0, 10);
  }, [searchValue, getStudents, getWarnings, getSchools]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
        setSelectedResultIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      const idx = selectedResultIndex >= 0 ? selectedResultIndex : 0;
      handleResultClick(searchResults[idx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex((prev) =>
        prev > 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSelectedResultIndex(-1);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setSearchValue('');
    setShowSearchResults(false);
    setSelectedResultIndex(-1);

    if (result.type === 'student') {
      navigate(`/students/${result.id}`);
    } else if (result.type === 'warning') {
      navigate(`/warning/${result.id}`);
    } else if (result.type === 'school') {
      navigate(`/dashboard/school/${result.id}`);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  return (
    <header className="h-16 bg-white border-b border-ink-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sticky top-0 z-30">
      <div className="h-full flex items-center gap-4 px-4 lg:px-6">
        <div className="lg:ml-0 ml-12 flex items-center gap-1.5 text-sm min-w-0">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 min-w-0">
              {index === 0 ? (
                <Home className="h-3.5 w-3.5 text-ink-400 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-ink-300 shrink-0" />
              )}
              {item.href ? (
                <a
                  href={item.href}
                  className={cn(
                    'truncate hover:text-primary-500 transition-colors',
                    index === breadcrumbs.length - 1
                      ? 'text-ink-700 font-semibold'
                      : 'text-ink-500'
                  )}
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-ink-700 font-semibold truncate">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 flex justify-center px-2 lg:px-8">
          <div className="relative w-full max-w-xl" ref={searchRef}>
            <div
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-3.5 py-2 border transition-all duration-200',
                searchFocused
                  ? 'bg-white border-primary-300 ring-4 ring-primary-500/10 shadow-sm'
                  : 'bg-ink-50 border-transparent hover:border-ink-200 hover:bg-white'
              )}
            >
              <Search
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  searchFocused ? 'text-primary-500' : 'text-ink-400'
                )}
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSelectedResultIndex(-1);
                }}
                onFocus={() => {
                  setSearchFocused(true);
                  if (searchValue.trim()) setShowSearchResults(true);
                }}
                onBlur={() => {
                  setSearchFocused(false);
                }}
                onKeyDown={handleSearchKeyDown}
                onInput={(e) => {
                  const val = (e.target as HTMLInputElement).value;
                  if (val.trim()) setShowSearchResults(true);
                }}
                placeholder="搜索学生、学校、预警编号..."
                className="flex-1 bg-transparent text-sm text-ink-800 placeholder:text-ink-400 outline-none min-w-0"
              />
              {searchValue && (
                <button
                  onClick={() => {
                    setSearchValue('');
                    setShowSearchResults(false);
                  }}
                  className="shrink-0 rounded-md p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <kbd className="hidden md:inline-flex shrink-0 items-center gap-0.5 rounded-md border border-ink-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-ink-500">
                Ctrl K
              </kbd>
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-ink-200 shadow-card-hover animate-fade-in-up overflow-hidden z-50">
                <div className="px-4 py-2.5 border-b border-ink-100 bg-ink-50/50">
                  <p className="text-xs font-medium text-ink-500">
                    搜索结果 ({searchResults.length})
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((result, index) => {
                    const Icon = result.icon;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleResultClick(result);
                        }}
                        onMouseEnter={() => setSelectedResultIndex(index)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-ink-50 last:border-b-0',
                          selectedResultIndex === index
                            ? 'bg-primary-50'
                            : 'hover:bg-ink-50'
                        )}
                      >
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl shrink-0', result.iconColor)}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-800 truncate">
                            {result.title}
                          </p>
                          <p className="text-xs text-ink-400 truncate">
                            {result.subtitle}
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-md bg-ink-100 text-ink-500 font-medium shrink-0">
                          {result.type === 'student' ? '学生' : result.type === 'warning' ? '预警' : '学校'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showSearchResults && searchValue.trim() && searchResults.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white border border-ink-200 shadow-card-hover animate-fade-in-up overflow-hidden z-50">
                <div className="px-4 py-8 text-center">
                  <Search className="h-8 w-8 text-ink-300 mx-auto mb-2" />
                  <p className="text-sm text-ink-500">未找到相关结果</p>
                  <p className="text-xs text-ink-400 mt-1">试试其他关键词吧</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 lg:gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 bg-mint-50/80 border border-mint-200/60">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-500" />
            </span>
            <span className="text-xs font-medium text-mint-700 whitespace-nowrap">
              实时接入中
            </span>
          </div>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen((v) => !v);
                setUserMenuOpen(false);
              }}
              className={cn(
                'relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200',
                notifOpen
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-800'
              )}
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-ink-200 shadow-card-hover animate-fade-in-up overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
                  <h3 className="text-sm font-semibold text-ink-800">
                    消息通知
                  </h3>
                  <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                    全部已读
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 border-b border-ink-50 transition-colors hover:bg-ink-50 cursor-pointer last:border-b-0',
                        n.unread && 'bg-primary-50/40'
                      )}
                    >
                      {n.unread && (
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      )}
                      {!n.unread && <span className="w-1.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-ink-800 font-medium leading-relaxed">
                          {n.title}
                        </p>
                        <p className="text-xs text-ink-400 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full px-4 py-2.5 text-xs font-medium text-primary-600 hover:bg-primary-50 border-t border-ink-100 transition-colors">
                  查看全部通知
                </button>
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 hover:text-ink-800 transition-all duration-200"
            title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
          >
            {theme === 'light' ? (
              <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            ) : (
              <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />
            )}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen((v) => !v);
                setNotifOpen(false);
              }}
              className={cn(
                'flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-200',
                userMenuOpen
                  ? 'bg-ink-100'
                  : 'hover:bg-ink-50'
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 ring-2 ring-white shadow-sm shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-semibold text-ink-800">
                  张管理
                </span>
                <span className="text-[11px] text-ink-400">系统管理员</span>
              </div>
              <ChevronDown
                className={cn(
                  'hidden md:block h-3.5 w-3.5 text-ink-400 transition-transform duration-200',
                  userMenuOpen && 'rotate-180'
                )}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-ink-200 shadow-card-hover animate-fade-in-up overflow-hidden">
                <div className="px-4 py-3 border-b border-ink-100 bg-gradient-to-r from-primary-50 to-mint-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 ring-2 ring-white shadow-sm">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-800 truncate">
                        张管理
                      </p>
                      <p className="text-xs text-ink-500 truncate">
                        admin@school.edu.cn
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-1.5">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                    <User className="h-4 w-4 text-ink-400" />
                    <span>个人资料</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                    <UserCog className="h-4 w-4 text-ink-400" />
                    <span>切换角色</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors">
                    <RefreshCw className="h-4 w-4 text-ink-400" />
                    <span>刷新数据</span>
                  </button>
                </div>
                <div className="border-t border-ink-100 py-1.5">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">退出登录</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
