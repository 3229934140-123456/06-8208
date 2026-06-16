import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Landmark,
  GraduationCap,
  Database,
  BrainCircuit,
  FileCheck2,
  BarChart3,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, type UserRole } from '@/store/authStore';

type RoleTab = {
  key: UserRole;
  label: string;
  icon: typeof Building2;
  description: string;
};

const roleTabs: RoleTab[] = [
  { key: 'ministry', label: '教育部', icon: Landmark, description: '国家级管理平台' },
  { key: 'province', label: '省教育厅', icon: Building2, description: '省级监管部门' },
  { key: 'school', label: '高校', icon: GraduationCap, description: '校级管理中心' },
];

const testAccounts = [
  { role: '教育部', username: 'admin', password: '123456' },
  { role: '省教育厅', username: 'beijing', password: '123456' },
  { role: '高校', username: 'tsinghua', password: '123456' },
  { role: '心理咨询中心', username: 'center', password: '123456' },
  { role: '心理联络员', username: 'liaison', password: '123456' },
  { role: '辅导员', username: 'counselor', password: '123456' },
];

const features = [
  {
    icon: Database,
    title: '多源数据实时接入',
    desc: '咨询预约 / 心理测评 / 社交情感 / 手机行为',
    color: 'from-mint-400 to-mint-600',
  },
  {
    icon: BrainCircuit,
    title: 'AI智能风险评分与预警',
    desc: '多维数据融合分析，精准识别潜在风险',
    color: 'from-primary-400 to-primary-600',
  },
  {
    icon: FileCheck2,
    title: '三级审批闭环干预流程',
    desc: '教育部-省厅-高校，层层把关联动处置',
    color: 'from-warning-low to-warning-medium',
  },
  {
    icon: BarChart3,
    title: '全国可视化监测看板',
    desc: '实时数据大屏，全局态势一目了然',
    color: 'from-purple-400 to-purple-600',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>('ministry');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const roleMap: Record<UserRole, { username: string; password: string }> = {
      ministry: { username: 'admin', password: '123456' },
      province: { username: 'beijing', password: '123456' },
      school: { username: 'tsinghua', password: '123456' },
      center: { username: 'center', password: '123456' },
      liaison: { username: 'liaison', password: '123456' },
      counselor: { username: 'counselor', password: '123456' },
    };
    const creds = roleMap[selectedRole];
    if (creds) {
      setUsername(creds.username);
      setPassword(creds.password);
    }
  }, [selectedRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    const success = await login(selectedRole, username.trim(), password.trim());
    if (success) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError('用户名或密码错误，请检查后重试');
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
      <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />

      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-mint-400/20 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary-400/25 blur-[140px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full bg-warning-low/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        <div className={cn(
          'w-full lg:w-[60%] flex flex-col justify-between p-8 lg:p-12 xl:p-16 transition-all duration-700',
          mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
        )}>
          <div className="flex items-center gap-3 mb-8 lg:mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-mint-400 to-primary-500 flex items-center justify-center shadow-lg shadow-mint-500/30">
              <Shield className="w-7 h-7 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg tracking-wide">心理卫士</h2>
              <p className="text-white/60 text-xs">MindGuard Platform</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 mb-6 w-fit">
              <span className="w-2 h-2 rounded-full bg-mint-400 animate-pulse" />
              <span className="text-white/80 text-sm font-medium">教育部专项行动计划 · 三级联动治理体系</span>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl xl:text-5xl font-bold text-white leading-tight mb-6 tracking-tight">
              全国大学生心理健康
              <br />
              <span className="bg-gradient-to-r from-mint-300 via-white to-primary-200 bg-clip-text text-transparent">
                监测与危机干预智能分析平台
              </span>
            </h1>

            <p className="text-white/70 text-base lg:text-lg max-w-xl mb-10 leading-relaxed">
              运用人工智能与大数据技术，构建全方位、多层次、立体化的大学生心理健康保障体系，
              守护每一位学子的心灵成长。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 max-w-2xl">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={cn(
                      'group flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5',
                      mounted && 'animate-fade-in-up'
                    )}
                    style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110',
                      feature.color,
                      'shadow-black/20'
                    )}>
                      <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-sm mb-0.5">{feature.title}</h3>
                      <p className="text-white/50 text-xs leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 lg:gap-10 mt-8">
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white font-serif">
                2,914<span className="text-mint-300">+</span>
              </p>
              <p className="text-white/50 text-sm mt-1">接入高校数（所）</p>
            </div>
            <div className="h-12 w-px bg-white/15 hidden lg:block" />
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white font-serif">
                4,180<span className="text-mint-300">+</span>
              </p>
              <p className="text-white/50 text-sm mt-1">覆盖学生（万）</p>
            </div>
            <div className="h-12 w-px bg-white/15 hidden lg:block" />
            <div>
              <p className="text-3xl lg:text-4xl font-bold text-white font-serif">
                8,600<span className="text-warning-low">+</span>
              </p>
              <p className="text-white/50 text-sm mt-1">日均预警（条）</p>
            </div>
          </div>
        </div>

        <div className={cn(
          'w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-8 xl:p-12 transition-all duration-700 delay-200',
          mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
        )}>
          <div className="w-full max-w-md">
            <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-7 lg:p-8 shadow-2xl shadow-primary-900/50 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mint-400 via-primary-300 to-warning-low opacity-70" />
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-mint-400/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary-400/20 blur-3xl" />

              <div className="relative">
                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-bold text-white mb-1">欢迎登录</h2>
                  <p className="text-white/60 text-sm">请选择您的身份角色后登录系统</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6 p-1.5 bg-white/5 rounded-xl border border-white/10">
                  {roleTabs.map((tab) => {
                    const TabIcon = tab.icon;
                    const isSelected = selectedRole === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedRole(tab.key)}
                        className={cn(
                          'relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg transition-all duration-300',
                          isSelected
                            ? 'bg-gradient-to-br from-white/20 to-white/5 text-white shadow-lg'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                        )}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 rounded-lg ring-2 ring-mint-400/50 shadow-[0_0_20px_rgba(46,196,182,0.3)] animate-pulse-slow pointer-events-none" />
                        )}
                        <TabIcon className={cn('w-5 h-5', isSelected ? 'text-mint-300' : '')} strokeWidth={2} />
                        <span className="text-xs font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1">用户名</label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-mint-300 transition-colors" strokeWidth={2} />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="请输入用户名"
                        className={cn(
                          'w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30',
                          'focus:outline-none focus:ring-2 focus:ring-mint-400/40 focus:border-mint-400/50 transition-all duration-200',
                          'backdrop-blur-sm'
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/70 text-xs font-medium mb-1.5 ml-1">密码</label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-mint-300 transition-colors" strokeWidth={2} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className={cn(
                          'w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-white/30',
                          'focus:outline-none focus:ring-2 focus:ring-mint-400/40 focus:border-mint-400/50 transition-all duration-200',
                          'backdrop-blur-sm'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={2} /> : <Eye className="w-4 h-4" strokeWidth={2} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning-high/15 border border-warning-high/30 text-warning-low text-sm animate-fade-in-up">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded bg-white/5 border-white/20 text-mint-500 focus:ring-mint-400/40 focus:ring-offset-0"
                      />
                      <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">记住我</span>
                    </label>
                    <a href="#" className="text-sm text-mint-300/80 hover:text-mint-300 transition-colors">
                      忘记密码?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      'relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300',
                      'bg-gradient-to-r from-mint-500 via-primary-400 to-primary-500 bg-[length:200%_100%] hover:bg-[position:100%_0]',
                      'shadow-lg shadow-mint-500/25 hover:shadow-xl hover:shadow-mint-500/35 hover:-translate-y-0.5',
                      'active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed'
                    )}
                  >
                    <span className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-all duration-300" />
                    {isLoading ? (
                      <span className="relative flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        登录中...
                      </span>
                    ) : (
                      <span className="relative">安全登录</span>
                    )}
                  </button>
                </form>

                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 mb-3">
                    <AlertCircle className="w-3.5 h-3.5 text-warning-low" />
                    <span className="text-white/70 text-xs font-medium">测试账号（点击角色Tab自动填充）</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {testAccounts.map((acc) => (
                      <div
                        key={acc.role}
                        className="flex flex-col px-2.5 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-white/80 text-[11px] font-medium">{acc.role}</span>
                        <span className="text-white/50 text-[10px] mt-0.5 font-mono">
                          {acc.username} / {acc.password}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-white/40 text-xs space-y-1">
              <p>© 2026 教育部思想政治工作司 · 全国大学生心理健康教育与咨询中心</p>
              <p>京ICP备XXXXXXXX号 · 技术支持：心理卫士平台研发团队</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
