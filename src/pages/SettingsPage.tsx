import { useState, useMemo } from 'react';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import {
  User,
  Lock,
  Shield,
  Database,
  Bell,
  FileText,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  UserPlus as UserPlusIcon,
  Ban,
  RefreshCw,
  Settings as SettingsIcon,
  Download,
  Search,
  ChevronDown,
  Calendar,
  Activity,
  Wifi,
  WifiOff,
  Smartphone,
  MessageSquare,
  Mail,
  MessageCircle,
  Volume2,
  Moon,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '系统设置' },
];

type TabKey = 'basic' | 'threshold' | 'permission' | 'datasource' | 'notification' | 'logs';

const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'basic', label: '基本信息', icon: User },
  { key: 'threshold', label: '预警阈值配置', icon: Shield },
  { key: 'permission', label: '权限与角色', icon: Lock },
  { key: 'datasource', label: '数据接入源', icon: Database },
  { key: 'notification', label: '通知设置', icon: Bell },
  { key: 'logs', label: '系统日志', icon: FileText },
];

const rolePermissions = {
  modules: [
    '数据概览', '学生管理', '预警管理', '报告管理', '学校管理',
    '测评中心', '资源配置', '系统设置', '用户管理', '日志审计',
  ],
  roles: [
    {
      name: '超级管理员',
      color: 'warning-high',
      perms: [true, true, true, true, true, true, true, true, true, true],
    },
    {
      name: '省级管理员',
      color: 'primary',
      perms: [true, true, true, true, true, true, true, false, false, false],
    },
    {
      name: '高校管理员',
      color: 'mint',
      perms: [true, true, true, true, false, true, false, false, false, false],
    },
    {
      name: '心理咨询师',
      color: 'warning-low',
      perms: [true, true, true, false, false, true, false, false, false, false],
    },
    {
      name: '辅导员',
      color: 'risk-low',
      perms: [false, true, true, false, false, false, false, false, false, false],
    },
  ],
};

const users = [
  { id: 1, name: '张三', username: 'admin', role: '超级管理员', email: 'admin@mhedu.gov.cn', phone: '138****0001', status: 'active', lastLogin: '2026-06-16 09:23' },
  { id: 2, name: '李四', username: 'prov_gd', role: '省级管理员', email: 'lisi@gdedu.gov.cn', phone: '139****0002', status: 'active', lastLogin: '2026-06-16 08:45' },
  { id: 3, name: '王五', username: 'school_th', role: '高校管理员', email: 'wangwu@tsinghua.edu.cn', phone: '137****0003', status: 'active', lastLogin: '2026-06-15 17:12' },
  { id: 4, name: '赵六', username: 'counselor01', role: '心理咨询师', email: 'zhaoliu@pku.edu.cn', phone: '136****0004', status: 'active', lastLogin: '2026-06-16 10:30' },
  { id: 5, name: '钱七', username: 'teacher01', role: '辅导员', email: 'qianqi@fudan.edu.cn', phone: '135****0005', status: 'disabled', lastLogin: '2026-06-10 14:22' },
  { id: 6, name: '孙八', username: 'counselor02', role: '心理咨询师', email: 'sunba@sjtu.edu.cn', phone: '134****0006', status: 'active', lastLogin: '2026-06-16 11:05' },
];

const dataSources = [
  {
    id: 1,
    name: '心理咨询API',
    icon: MessageSquare,
    description: '全国高校心理咨询预约与记录系统对接',
    status: 'online',
    todayCount: 4823,
    lastSync: '2026-06-16 11:55:23',
    url: 'https://api.mhedu.gov.cn/counseling/v1',
  },
  {
    id: 2,
    name: '心理测评系统',
    icon: Activity,
    description: 'SDS/SAS/PHQ-9等标准化心理测评数据接入',
    status: 'online',
    todayCount: 15642,
    lastSync: '2026-06-16 11:50:12',
    url: 'https://api.mhedu.gov.cn/assessment/v2',
  },
  {
    id: 3,
    name: '社交情感分析',
    icon: MessageCircle,
    description: '校园社交平台情感倾向NLP分析接口',
    status: 'online',
    todayCount: 38521,
    lastSync: '2026-06-16 11:58:45',
    url: 'https://api.mhedu.gov.cn/social/v1',
  },
  {
    id: 4,
    name: '手机行为SDK',
    icon: Smartphone,
    description: '学生端APP行为数据埋点与异常检测SDK',
    status: 'warning',
    todayCount: 986,
    lastSync: '2026-06-16 08:22:10',
    url: 'https://sdk.mhedu.gov.cn/behavior/v3',
  },
];

const assessmentThresholds = [
  { name: 'SDS 抑郁自评量表', key: 'sds', normal: 53, mild: 63, moderate: 72 },
  { name: 'SAS 焦虑自评量表', key: 'sas', normal: 50, mild: 60, moderate: 70 },
  { name: 'PHQ-9 抑郁筛查', key: 'phq9', normal: 5, mild: 10, moderate: 15 },
  { name: 'GAD-7 焦虑筛查', key: 'gad7', normal: 5, mild: 10, moderate: 15 },
  { name: 'PSS 压力感知量表', key: 'pss', normal: 14, mild: 20, moderate: 27 },
  { name: 'ISI 失眠严重指数', key: 'isi', normal: 7, mild: 15, moderate: 22 },
];

const notificationLevels = [
  { level: '极高风险', color: 'warning-high', roles: ['超级管理员', '省级管理员', '高校管理员', '心理咨询师'] },
  { level: '高风险', color: 'risk-medium', roles: ['省级管理员', '高校管理员', '心理咨询师', '辅导员'] },
  { level: '中风险', color: 'warning-low', roles: ['高校管理员', '心理咨询师', '辅导员'] },
  { level: '低风险', color: 'risk-low', roles: ['心理咨询师', '辅导员'] },
];

const logLevels = ['ALL', 'INFO', 'WARN', 'ERROR'] as const;

const systemLogs = Array.from({ length: 40 }, (_, i) => {
  const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'] as const;
  const modules = ['用户模块', '预警模块', '报告模块', '数据同步', '权限系统', '通知服务', '测评中心'];
  const operators = ['admin', 'prov_gd', 'school_th', 'counselor01', 'system'];
  const actions = [
    '用户登录成功', '更新预警状态', '生成周报', '同步测评数据', '修改权限配置',
    '发送通知短信', '导出数据报表', '新增用户账号', '禁用账号', '修改阈值配置',
  ];
  const level = levels[i % levels.length];
  return {
    id: i + 1,
    time: new Date(Date.now() - i * 3600000 * (1 + Math.random() * 3)).toLocaleString('zh-CN'),
    level,
    module: modules[i % modules.length],
    operator: operators[i % operators.length],
    action: actions[i % actions.length],
    ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  };
});

function Toggle({ value, onChange, size = 'md' }: { value: boolean; onChange: (v: boolean) => void; size?: 'sm' | 'md' }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'relative rounded-full transition-all duration-300 flex-shrink-0',
        size === 'sm' ? 'w-9 h-5' : 'w-11 h-6',
        value ? 'bg-gradient-mint' : 'bg-ink-200'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 rounded-full bg-white shadow-md transition-all duration-300 transform',
          size === 'sm' ? 'w-4 h-4 left-0.5' : 'w-5 h-5 left-0.5',
          value && (size === 'sm' ? 'translate-x-4' : 'translate-x-5')
        )}
      />
    </button>
  );
}

function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  suffix = '',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 relative">
        <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-primary rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-primary-500 shadow-md pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <span className="min-w-[70px] text-right font-semibold text-primary-600 text-sm">
        {value}{suffix}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  const [emotionThreshold, setEmotionThreshold] = useState(50);
  const [abnormalDays, setAbnormalDays] = useState(3);
  const [escalationHours, setEscalationHours] = useState(48);
  const [thresholds, setThresholds] = useState(assessmentThresholds);

  const [channels, setChannels] = useState({
    inApp: true,
    sms: true,
    email: false,
    wechat: true,
  });
  const [soundAlert, setSoundAlert] = useState(true);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const [logLevel, setLogLevel] = useState<(typeof logLevels)[number]>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [logDateRange, setLogDateRange] = useState('7d');

  const filteredLogs = useMemo(() => {
    return systemLogs.filter((log) => {
      if (logLevel !== 'ALL' && log.level !== logLevel) return false;
      if (logSearch) {
        const kw = logSearch.toLowerCase();
        if (
          !log.action.toLowerCase().includes(kw) &&
          !log.operator.toLowerCase().includes(kw) &&
          !log.module.toLowerCase().includes(kw)
        )
          return false;
      }
      return true;
    });
  }, [logLevel, logSearch]);

  const handleExportLogs = () => {
    const exportData = filteredLogs.map((log) => ({
      ID: log.id,
      时间: log.time,
      级别: log.level,
      模块: log.module,
      操作人: log.operator,
      操作描述: log.action,
      IP地址: log.ip,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '系统日志');
    XLSX.writeFile(wb, `系统日志_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5 text-primary-500" />
            当前用户信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">姓名</label>
              <input type="text" defaultValue="系统管理员" className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">用户名</label>
              <input type="text" defaultValue="admin" className="input-base bg-ink-50" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">邮箱</label>
              <input type="email" defaultValue="admin@mhedu.gov.cn" className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-1.5">手机号</label>
              <input type="tel" defaultValue="138****0001" className="input-base" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-ink-600 mb-1.5">所属单位</label>
              <input
                type="text"
                defaultValue="教育部全国高校心理健康监测中心"
                className="input-base"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              重置
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              保存修改
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-mint-600" />
            平台版本信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: '系统版本', value: 'v2.4.1' },
              { label: '发布日期', value: '2026-05-20' },
              { label: '数据库版本', value: 'MySQL 8.0.32' },
              { label: '运行环境', value: 'Node.js 20 LTS' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-ink-50/60 border border-ink-100">
                <p className="text-xs text-ink-400 mb-1">{item.label}</p>
                <p className="font-semibold text-ink-800">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-warning-low" />
            修改密码
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
            {[
              { label: '当前密码', value: showOldPwd, setValue: setShowOldPwd },
              { label: '新密码', value: showNewPwd, setValue: setShowNewPwd },
              { label: '确认新密码', value: showConfirmPwd, setValue: setShowConfirmPwd },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-ink-600 mb-1.5">{field.label}</label>
                <div className="relative">
                  <input type={field.value ? 'text' : 'password'} className="input-base pr-11" placeholder="请输入密码" />
                  <button
                    onClick={() => field.setValue(!field.value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    {field.value ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-400 flex items-start gap-1.5">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            密码需包含大小写字母、数字和特殊字符，长度不少于 8 位。建议每 90 天更换一次密码。
          </p>
          <div className="mt-6 flex justify-end">
            <button className="btn-primary flex items-center gap-2">
              <Lock className="h-4 w-4" />
              确认修改密码
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderThreshold = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary-500" />
              预警触发参数
            </CardTitle>
            <button
              onClick={() => {
                setEmotionThreshold(50);
                setAbnormalDays(3);
                setEscalationHours(48);
                setThresholds(assessmentThresholds);
              }}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              恢复默认
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-ink-800">情绪安全阈值</p>
                <p className="text-xs text-ink-500">情绪指数低于此值将触发关注提醒</p>
              </div>
            </div>
            <Slider value={emotionThreshold} onChange={setEmotionThreshold} suffix="分" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-ink-800">连续异常天数</p>
                <p className="text-xs text-ink-500">连续多少天指数异常触发升级预警</p>
              </div>
            </div>
            <Slider value={abnormalDays} onChange={setAbnormalDays} min={1} max={14} suffix="天" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-ink-800">升级时效</p>
                <p className="text-xs text-ink-500">高风险预警未处置自动上报的时限</p>
              </div>
            </div>
            <Slider value={escalationHours} onChange={setEscalationHours} min={12} max={168} suffix="h" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-5 w-5 text-mint-600" />
            测评等级阈值设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-ink-100">
          {thresholds.map((row, idx) => (
            <div key={row.key} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-ink-800">{row.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: '正常界限', key: 'normal' as const, color: '#2EC4B6' },
                  { label: '轻度异常', key: 'mild' as const, color: '#FFA94D' },
                  { label: '中度异常', key: 'moderate' as const, color: '#FF6B6B' },
                ].map((col) => (
                  <div key={col.key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: col.color }}>
                        {col.label}
                      </span>
                      <span className="text-sm font-bold text-ink-800">≥ {row[col.key]}分</span>
                    </div>
                    <input
                      type="number"
                      value={row[col.key]}
                      onChange={(e) => {
                        const newVal = Number(e.target.value);
                        setThresholds((prev) =>
                          prev.map((r, i) =>
                            i === idx ? { ...r, [col.key]: newVal } : r
                          )
                        );
                      }}
                      className="input-base py-2 text-sm"
                      style={{ borderLeftColor: col.color, borderLeftWidth: 3 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-6 flex justify-end">
            <button className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              保存阈值配置
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPermission = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-500" />
            角色权限矩阵
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50/80 border-b border-ink-100">
                <th className="px-5 py-4 text-left font-semibold text-ink-600 sticky left-0 bg-ink-50/80 z-10 min-w-[140px]">
                  角色 / 模块
                </th>
                {rolePermissions.modules.map((mod) => (
                  <th key={mod} className="px-4 py-4 text-center font-semibold text-ink-600 whitespace-nowrap">
                    {mod}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rolePermissions.roles.map((role) => (
                <tr key={role.name} className="border-b border-ink-50 hover:bg-primary-50/30 transition-colors">
                  <td className="px-5 py-4 sticky left-0 bg-white z-10">
                    <Badge color={role.color as any} variant="soft" size="md" withDot>
                      {role.name}
                    </Badge>
                  </td>
                  {role.perms.map((hasPerm, idx) => (
                    <td key={idx} className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        {hasPerm ? (
                          <CheckCircle2 className="h-5 w-5 text-mint-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-ink-200" />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5 text-mint-600" />
              用户账号管理
            </CardTitle>
            <button className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="h-4 w-4" />
              添加账号
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50/80 border-b border-ink-100">
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">用户信息</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">角色</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">联系方式</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">最近登录</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">状态</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-ink-50 hover:bg-primary-50/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-primary text-white flex items-center justify-center font-semibold text-sm shrink-0">
                        {user.name.slice(-1)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-ink-800">{user.name}</p>
                        <p className="text-xs text-ink-400 font-mono">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      color={
                        user.role === '超级管理员'
                          ? 'warning-high'
                          : user.role === '省级管理员'
                          ? 'primary'
                          : user.role === '高校管理员'
                          ? 'mint'
                          : user.role === '心理咨询师'
                          ? 'warning-low'
                          : 'risk-low'
                      }
                      variant="soft"
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-ink-600 space-y-0.5">
                      <p>{user.email}</p>
                      <p className="text-ink-400">{user.phone}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-ink-500">{user.lastLogin}</td>
                  <td className="px-5 py-4">
                    <Badge
                      color={user.status === 'active' ? 'risk-safe' : 'warning-high'}
                      variant="soft"
                      size="sm"
                      withDot
                    >
                      {user.status === 'active' ? '正常' : '已禁用'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors" title="编辑">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          user.status === 'active'
                            ? 'text-warning-low hover:bg-warning-low/10'
                            : 'text-mint-600 hover:bg-mint-50'
                        )}
                        title={user.status === 'active' ? '禁用' : '启用'}
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 transition-colors" title="重置密码">
                        <Lock className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );

  const renderDatasource = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          添加新数据源
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dataSources.map((ds) => {
          const Icon = ds.icon;
          const isOnline = ds.status === 'online';
          return (
            <Card key={ds.id} hoverable className="overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-3.5 rounded-2xl transition-transform duration-300 group-hover:scale-110',
                        isOnline ? 'bg-mint-50 text-mint-600' : 'bg-warning-low/15 text-warning-low'
                      )}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-ink-800">{ds.name}</h3>
                        {isOnline ? (
                          <Badge color="risk-safe" variant="soft" size="sm" withDot>
                            <span className="flex items-center gap-1">
                              <Wifi className="h-3 w-3" />
                              运行中
                            </span>
                          </Badge>
                        ) : (
                          <Badge color="warning-low" variant="soft" size="sm" withDot>
                            <span className="flex items-center gap-1">
                              <WifiOff className="h-3 w-3" />
                              连接异常
                            </span>
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-ink-500 leading-relaxed">{ds.description}</p>
                      <p className="text-xs text-ink-400 font-mono mt-2 truncate">{ds.url}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'relative flex h-3 w-3 shrink-0 mt-2',
                      isOnline && 'animate-pulse-slow'
                    )}
                  >
                    {isOnline && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-400 opacity-75" />
                    )}
                    <span
                      className={cn(
                        'relative inline-flex rounded-full h-3 w-3',
                        isOnline ? 'bg-mint-500' : 'bg-warning-low'
                      )}
                    />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 border-y border-ink-100 mb-4">
                  <div>
                    <p className="text-xs text-ink-400 mb-1">今日数据量</p>
                    <p className="text-xl font-bold text-ink-800">
                      {ds.todayCount.toLocaleString()}
                      <span className="text-sm font-normal text-ink-400 ml-1">条</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400 mb-1">最后同步时间</p>
                    <p className="text-sm font-semibold text-ink-600">{ds.lastSync}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2 text-sm">
                    <RefreshCw className="h-4 w-4" />
                    立即重连
                  </button>
                  <button className="btn-secondary flex items-center justify-center gap-2 py-2 text-sm px-4">
                    <SettingsIcon className="h-4 w-4" />
                    配置
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderNotification = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-500" />
            通知渠道开关
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'inApp' as const, label: '站内信', desc: '系统内消息中心推送', icon: MessageSquare, color: 'text-primary-500' },
              { key: 'sms' as const, label: '短信通知', desc: '紧急预警短信推送', icon: Smartphone, color: 'text-warning-low' },
              { key: 'email' as const, label: '邮件通知', desc: '周报摘要邮件发送', icon: Mail, color: 'text-mint-600' },
              { key: 'wechat' as const, label: '微信推送', desc: '官方服务号模板消息', icon: MessageCircle, color: 'text-green-500' },
            ].map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.key}
                  className="flex items-center justify-between p-4 rounded-xl border border-ink-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl bg-ink-50 ${ch.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink-800">{ch.label}</p>
                      <p className="text-xs text-ink-500">{ch.desc}</p>
                    </div>
                  </div>
                  <Toggle value={channels[ch.key]} onChange={(v) => setChannels({ ...channels, [ch.key]: v })} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning-low" />
            预警级别通知范围配置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-ink-100">
          {notificationLevels.map((nl) => (
            <div key={nl.level} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge color={nl.color as any} variant="soft" size="md" withDot>
                  {nl.level}
                </Badge>
                <span className="text-xs text-ink-400">→ 推送至：</span>
                {nl.roles.map((r) => (
                  <span key={r} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-ink-100 text-xs font-medium text-ink-600">
                    {r}
                  </span>
                ))}
                <button className="ml-auto text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                  <Pencil className="h-3 w-3" />
                  编辑范围
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-mint-600" />
            提醒方式与时段
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-4 rounded-xl bg-ink-50/60 border border-ink-100">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-primary-500" />
              <div>
                <p className="font-medium text-ink-800">声音提醒</p>
                <p className="text-xs text-ink-500">收到新预警时播放提示音</p>
              </div>
            </div>
            <Toggle value={soundAlert} onChange={setSoundAlert} />
          </div>

          <div className="p-4 rounded-xl bg-ink-50/60 border border-ink-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="font-medium text-ink-800">免打扰时段</p>
                  <p className="text-xs text-ink-500">设定时段内仅推送极高风险预警</p>
                </div>
              </div>
              <Toggle value={doNotDisturb} onChange={setDoNotDisturb} />
            </div>
            {doNotDisturb && (
              <div className="grid grid-cols-2 gap-4 pt-2 animate-fade-in-up">
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1.5">开始时间</label>
                  <input type="time" defaultValue="22:00" className="input-base" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1.5">结束时间</label>
                  <input type="time" defaultValue="07:30" className="input-base" />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              保存通知设置
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-ink-200 overflow-hidden bg-white">
            {logLevels.map((lv) => (
              <button
                key={lv}
                onClick={() => setLogLevel(lv)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-all duration-200',
                  logLevel === lv ? 'bg-gradient-primary text-white' : 'text-ink-600 hover:bg-ink-50'
                )}
              >
                {lv}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px]">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <select
              value={logDateRange}
              onChange={(e) => setLogDateRange(e.target.value)}
              className="input-base pl-10 appearance-none pr-10 cursor-pointer"
            >
              <option value="1d">今天</option>
              <option value="3d">近3天</option>
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
              <option value="90d">近90天</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              type="text"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              placeholder="搜索操作描述、操作人、模块..."
              className="input-base pl-10"
            />
          </div>

          <div className="flex-1" />

          <button
            onClick={handleExportLogs}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            导出日志
          </button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50/80 border-b border-ink-100">
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600 w-20">ID</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">时间</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">级别</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">模块</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">操作人</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">操作描述</th>
                <th className="px-5 py-3.5 text-left font-semibold text-ink-600">IP 地址</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-ink-50 hover:bg-primary-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-ink-400">#{String(log.id).padStart(4, '0')}</td>
                  <td className="px-5 py-3.5 text-xs text-ink-500 whitespace-nowrap">{log.time}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      color={
                        log.level === 'ERROR'
                          ? 'warning-high'
                          : log.level === 'WARN'
                          ? 'warning-low'
                          : 'primary'
                      }
                      variant="soft"
                      size="sm"
                      withDot
                    >
                      {log.level}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-ink-600">{log.module}</td>
                  <td className="px-5 py-3.5 font-medium text-ink-700 font-mono text-xs">{log.operator}</td>
                  <td className="px-5 py-3.5 text-ink-600">{log.action}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-ink-400">{log.ip}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-ink-400">
                    <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p>暂无符合条件的日志记录</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="flex flex-col lg:flex-row gap-6 stagger-reveal">
        <aside className="lg:w-56 shrink-0">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left',
                        activeTab === tab.key
                          ? 'bg-gradient-primary text-white shadow-md'
                          : 'text-ink-600 hover:bg-ink-50'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 min-w-0">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'threshold' && renderThreshold()}
          {activeTab === 'permission' && renderPermission()}
          {activeTab === 'datasource' && renderDatasource()}
          {activeTab === 'notification' && renderNotification()}
          {activeTab === 'logs' && renderLogs()}
        </main>
      </div>
    </MainLayout>
  );
}
