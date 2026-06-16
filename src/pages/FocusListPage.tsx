import { useState, useMemo } from 'react';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import type { RiskLevel, Gender } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Star,
  ShieldAlert,
  UserPlus,
  X,
  Calendar,
  AlertCircle,
  TrendingDown,
  Activity,
  Users,
  Clock,
  FileCheck2,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '学生档案' },
  { label: '重点关注名单' },
];

type EnrollReason = 'warning_freq' | 'continuous_low' | 'severe_assessment' | 'manual';

interface FocusStudent {
  id: string;
  studentNo: string;
  name: string;
  gender: Gender;
  college: string;
  riskLevel: RiskLevel;
  enrollReason: EnrollReason;
  enrollTime: string;
  warningCountThisMonth: number;
  consecutiveLowEmotionDays: number;
  latestAssessmentLevel: string;
  counselor: string;
  severity: 1 | 2 | 3;
  phone: string;
}

const enrollReasonMap: Record<EnrollReason, { label: string; color: 'risk-high' | 'risk-medium' | 'risk-low' | 'primary' }> = {
  warning_freq: { label: '预警频次≥2次/月', color: 'risk-high' },
  continuous_low: { label: '持续低情绪≥5天', color: 'risk-medium' },
  severe_assessment: { label: '测评结果重度', color: 'risk-high' },
  manual: { label: '手动添加', color: 'primary' },
};

const enrollReasonOptions = [
  { value: '', label: '全部入册原因' },
  { value: 'warning_freq', label: '预警频次' },
  { value: 'continuous_low', label: '持续低情绪' },
  { value: 'severe_assessment', label: '重度测评' },
  { value: 'manual', label: '手动添加' },
];

const collegeOptions = [
  { value: '', label: '全部学院' },
  { value: '计算机学院', label: '计算机学院' },
  { value: '经济管理学院', label: '经济管理学院' },
  { value: '文学院', label: '文学院' },
  { value: '理学院', label: '理学院' },
  { value: '工学院', label: '工学院' },
  { value: '医学院', label: '医学院' },
  { value: '法学院', label: '法学院' },
  { value: '外国语学院', label: '外国语学院' },
  { value: '艺术学院', label: '艺术学院' },
  { value: '体育学院', label: '体育学院' },
];

function getRiskBadgeColor(level: RiskLevel): 'risk-safe' | 'risk-low' | 'risk-medium' | 'risk-high' {
  switch (level) {
    case 'safe': return 'risk-safe';
    case 'low': return 'risk-low';
    case 'medium': return 'risk-medium';
    case 'high': return 'risk-high';
  }
}

function getRiskText(level: RiskLevel): string {
  switch (level) {
    case 'safe': return '安全';
    case 'low': return '低风险';
    case 'medium': return '中风险';
    case 'high': return '高风险';
  }
}

function generateMockFocusStudents(): FocusStudent[] {
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '华', '平', '辉', '鹏'];
  const colleges = ['计算机学院', '经济管理学院', '文学院', '理学院', '工学院', '医学院', '法学院', '外国语学院', '艺术学院', '体育学院'];
  const counselors = ['王老师', '李老师', '张老师', '刘老师', '陈老师', '杨老师', '黄老师', '周老师'];
  const reasons: EnrollReason[] = ['warning_freq', 'continuous_low', 'severe_assessment', 'manual', 'warning_freq', 'continuous_low'];
  const levels: RiskLevel[] = ['high', 'high', 'medium', 'medium', 'high', 'low'];
  const assessmentLevels = ['重度抑郁', '重度焦虑', '中度抑郁', '中度焦虑', '重度压力', '轻度抑郁'];

  return Array.from({ length: 36 }, (_, i) => {
    const reason = reasons[i % reasons.length];
    const level = levels[i % levels.length];
    const now = new Date();
    now.setDate(now.getDate() - i * (2 + (i % 5)));
    now.setHours(9 + (i % 8), (i * 13) % 60);

    return {
      id: `FOCUS${String(1000 + i).padStart(6, '0')}`,
      studentNo: `202${i % 5}${String(10000 + i).padStart(6, '0')}`,
      name: `${surnames[i % surnames.length]}${names[(i + 7) % names.length]}`,
      gender: (i % 2 === 0 ? '男' : '女') as Gender,
      college: colleges[i % colleges.length],
      riskLevel: level,
      enrollReason: reason,
      enrollTime: now.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      warningCountThisMonth: reason === 'warning_freq' ? 2 + (i % 4) : (i % 3),
      consecutiveLowEmotionDays: reason === 'continuous_low' ? 5 + (i % 10) : (i % 5),
      latestAssessmentLevel: reason === 'severe_assessment' ? assessmentLevels[i % assessmentLevels.length] : assessmentLevels[(i + 2) % assessmentLevels.length],
      counselor: counselors[i % counselors.length],
      severity: (level === 'high' ? (i % 2 === 0 ? 3 : 2) : 1) as 1 | 2 | 3,
      phone: `1${3 + (i % 4)}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    };
  }).sort((a, b) => b.severity - a.severity);
}

export default function FocusListPage() {
  const [searchValue, setSearchValue] = useState('');
  const [reason, setReason] = useState('');
  const [college, setCollege] = useState('');
  const [timeRange, setTimeRange] = useState('30d');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseReason, setReleaseReason] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<FocusStudent | null>(null);

  const mockStudents = useMemo(() => generateMockFocusStudents(), []);

  const stats = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    return {
      current: mockStudents.length,
      newThisWeek: mockStudents.filter((s) => new Date(s.enrollTime) >= weekAgo).length,
      released: Math.floor(mockStudents.length * 0.35),
      avgCycle: '18.5',
    };
  }, [mockStudents]);

  const filteredStudents = useMemo(() => {
    return mockStudents.filter((s) => {
      if (reason && s.enrollReason !== reason) return false;
      if (college && s.college !== college) return false;
      if (searchValue) {
        const kw = searchValue.toLowerCase();
        if (
          !s.name.toLowerCase().includes(kw) &&
          !s.studentNo.includes(kw)
        )
          return false;
      }
      return true;
    });
  }, [mockStudents, reason, college, searchValue]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const pageData = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () => {
    const exportData = filteredStudents.map((s) => ({
      学号: s.studentNo,
      姓名: s.name,
      性别: s.gender,
      学院: s.college,
      风险等级: getRiskText(s.riskLevel),
      入册原因: enrollReasonMap[s.enrollReason].label,
      入册时间: s.enrollTime,
      '本月预警次数': s.warningCountThisMonth,
      '连续低情绪天数': s.consecutiveLowEmotionDays,
      '最近测评等级': s.latestAssessmentLevel,
      辅导员: s.counselor,
      联系电话: s.phone,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '重点关注名单');
    XLSX.writeFile(wb, `重点关注名单_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleReleaseClick = (student: FocusStudent) => {
    setSelectedStudent(student);
    setReleaseReason('');
    setReleaseModalOpen(true);
  };

  const handleConfirmRelease = () => {
    if (!releaseReason.trim()) return;
    alert(`已解除对 ${selectedStudent?.name} 的重点关注`);
    setReleaseModalOpen(false);
    setSelectedStudent(null);
    setReleaseReason('');
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <Card className="border-warning-high/20 bg-gradient-to-r from-warning-high/5 via-warning-low/5 to-transparent">
          <CardContent className="p-4 lg:p-5 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-high/15 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5 text-warning-high" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-ink-800 mb-1">系统自动纳入规则</h4>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-600">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-warning-high" />
                  月内预警 ≥ 2次
                </span>
                <span className="text-ink-300">或</span>
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-warning-low" />
                  连续 5天 情绪低于阈值
                </span>
                <span className="text-ink-300">或</span>
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-warning-high" />
                  测评结果为重度
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="当前关注人数"
            value={stats.current.toLocaleString()}
            suffix="人"
            color="danger"
            icon={<Users className="h-6 w-6" />}
            trendValue="+3.1%"
            trendType="up"
            description="较上周"
          />
          <StatCard
            title="本周新增"
            value={stats.newThisWeek}
            suffix="人"
            color="warning"
            icon={<UserPlus className="h-6 w-6" />}
            trendValue="+2"
            trendType="up"
            description="较上周"
          />
          <StatCard
            title="已解除关注"
            value={stats.released}
            suffix="人"
            color="mint"
            icon={<CheckCircle2 className="h-6 w-6" />}
            trendValue="+12.5%"
            trendType="up"
            description="较上月"
          />
          <StatCard
            title="平均关注周期"
            value={stats.avgCycle}
            suffix="天"
            color="primary"
            icon={<Clock className="h-6 w-6" />}
            trendValue="-2.3天"
            trendType="down"
            description="较上月"
          />
        </div>

        <Card>
          <CardContent className="p-4 lg:p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setPage(1);
                  }}
                  placeholder="搜索姓名、学号..."
                  className="input-base pl-10"
                />
              </div>

              <div className="relative min-w-[180px]">
                <ShieldAlert className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <select
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setPage(1);
                  }}
                  className="input-base appearance-none pl-10 pr-10 cursor-pointer"
                >
                  {enrollReasonOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[160px]">
                <FileCheck2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <select
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setPage(1);
                  }}
                  className="input-base appearance-none pl-10 pr-10 cursor-pointer"
                >
                  {collegeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[160px]">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="input-base appearance-none pl-10 pr-10 cursor-pointer"
                >
                  <option value="7d">近7天入册</option>
                  <option value="30d">近30天入册</option>
                  <option value="90d">近90天入册</option>
                  <option value="all">全部时间</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>

              <div className="flex-1" />

              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>导出名单</span>
              </button>
            </div>

            {(reason || college || searchValue) && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setReason('');
                    setCollege('');
                    setSearchValue('');
                    setPage(1);
                  }}
                  className="text-sm text-ink-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  清空筛选
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink-50/80 border-b border-ink-100">
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 w-10">
                    <span className="sr-only">严重程度</span>
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学号</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">姓名</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学院</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">风险等级</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">入册原因</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">入册时间</th>
                  <th className="px-4 py-3.5 text-center font-semibold text-ink-600 whitespace-nowrap">预警次数(月)</th>
                  <th className="px-4 py-3.5 text-center font-semibold text-ink-600 whitespace-nowrap">持续低情绪天数</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">最近测评等级</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">辅导员</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap sticky right-0 bg-ink-50/80">操作</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((student, idx) => {
                  const isCritical = student.severity === 3;
                  return (
                    <tr
                      key={student.id}
                      className={cn(
                        'border-b border-ink-50 transition-all duration-200 hover:bg-primary-50/30 group',
                        isCritical && 'bg-warning-high/5'
                      )}
                      style={{ animationDelay: `${idx * 0.02}s` }}
                    >
                      <td className="px-4 py-3.5">
                        {student.severity === 3 ? (
                          <div
                            className="w-6 h-6 rounded-lg bg-warning-high/15 flex items-center justify-center animate-pulse"
                            title="严重 - 优先处置"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-warning-high" />
                          </div>
                        ) : student.severity === 2 ? (
                          <div
                            className="w-6 h-6 rounded-lg bg-warning-low/15 flex items-center justify-center"
                            title="重要"
                          >
                            <Star className="h-3.5 w-3.5 text-warning-low fill-current" />
                          </div>
                        ) : (
                          <div className="w-6 h-6" />
                        )}
                      </td>
                      <td className={cn('px-4 py-3.5', isCritical && 'border-l-4 border-l-warning-high')}>
                        <span className="font-mono text-xs text-ink-500">{student.studentNo}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink-800">{student.name}</span>
                          <span className="text-xs text-ink-400">({student.gender})</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-ink-700 whitespace-nowrap">{student.college}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge color={getRiskBadgeColor(student.riskLevel)} size="sm" withDot variant="solid">
                          {getRiskText(student.riskLevel)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge color={enrollReasonMap[student.enrollReason].color} size="sm">
                          {enrollReasonMap[student.enrollReason].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-ink-500 whitespace-nowrap text-xs">{student.enrollTime}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          'font-bold inline-flex items-center justify-center w-7 h-7 rounded-lg',
                          student.warningCountThisMonth >= 3
                            ? 'bg-warning-high/15 text-warning-high'
                            : student.warningCountThisMonth >= 1
                            ? 'bg-warning-low/15 text-warning-low'
                            : 'bg-ink-100 text-ink-500'
                        )}>
                          {student.warningCountThisMonth}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          'font-bold inline-flex items-center justify-center w-7 h-7 rounded-lg',
                          student.consecutiveLowEmotionDays >= 7
                            ? 'bg-warning-high/15 text-warning-high'
                            : student.consecutiveLowEmotionDays >= 5
                            ? 'bg-warning-low/15 text-warning-low'
                            : 'bg-ink-100 text-ink-500'
                        )}>
                          {student.consecutiveLowEmotionDays}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn(
                          'text-xs font-medium whitespace-nowrap px-2 py-1 rounded-md',
                          student.latestAssessmentLevel.includes('重度')
                            ? 'bg-warning-high/10 text-warning-high'
                            : student.latestAssessmentLevel.includes('中度')
                            ? 'bg-warning-low/10 text-warning-low'
                            : 'bg-risk-low/10 text-risk-low'
                        )}>
                          {student.latestAssessmentLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-ink-600 whitespace-nowrap">{student.counselor}</span>
                      </td>
                      <td className="px-4 py-3.5 sticky right-0 bg-inherit group-hover:bg-primary-50/60">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
                            title="查看详情"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReleaseClick(student)}
                            className="p-1.5 rounded-lg text-mint-600 hover:bg-mint-50 transition-colors"
                            title="解除关注"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-warning-low hover:bg-warning-low/10 transition-colors"
                            title="转介建议"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={12} className="px-4 py-16 text-center text-ink-400">
                      <Star className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p>暂无符合条件的关注学生</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredStudents.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6 py-4 border-t border-ink-100 bg-ink-50/50">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-ink-500">
                  共 <span className="font-semibold text-ink-700">{filteredStudents.length}</span> 条关注数据
                </span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="input-base appearance-none pr-8 cursor-pointer text-sm py-1.5 px-3"
                  >
                    {[10, 20, 50, 100].map((n) => (
                      <option key={n} value={n}>{n} 条/页</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={cn(
                    'p-2 rounded-lg border border-ink-200 bg-white transition-all duration-200',
                    page === 1 ? 'text-ink-300 cursor-not-allowed' : 'text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const pageNum = start + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'min-w-[38px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                        page === pageNum
                          ? 'bg-gradient-primary text-white shadow-md'
                          : 'bg-white border border-ink-200 text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={cn(
                    'p-2 rounded-lg border border-ink-200 bg-white transition-all duration-200',
                    page === totalPages ? 'text-ink-300 cursor-not-allowed' : 'text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>

        {releaseModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-slide-in">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-mint-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-mint-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ink-800 mb-1">
                      确认解除重点关注
                    </h3>
                    <p className="text-sm text-ink-500 leading-relaxed mb-4">
                      将学生 <span className="font-semibold text-ink-700">{selectedStudent.name}</span>（{selectedStudent.studentNo}）从重点关注名单中移除。
                    </p>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-ink-600">
                          解除原因 <span className="text-warning-high">*</span>
                        </label>
                        <textarea
                          value={releaseReason}
                          onChange={(e) => setReleaseReason(e.target.value)}
                          placeholder="请填写解除关注的原因，例如：情绪状态持续稳定30天以上、复测结果正常、辅导效果良好等..."
                          rows={4}
                          className="input-base resize-none text-sm"
                        />
                      </div>
                      <div className="p-3 rounded-xl bg-ink-50 border border-ink-100 text-xs text-ink-500 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-warning-low mt-0.5 shrink-0" />
                          <span>解除后系统将继续正常监测，但不再列入重点关注名单</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-warning-low mt-0.5 shrink-0" />
                          <span>若后续再次触发纳入规则，学生将自动重新进入名单</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-ink-50 border-t border-ink-100">
                <button
                  onClick={() => {
                    setReleaseModalOpen(false);
                    setSelectedStudent(null);
                    setReleaseReason('');
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-ink-200 text-ink-600 text-sm font-medium hover:bg-ink-100 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmRelease}
                  disabled={!releaseReason.trim()}
                  className={cn(
                    'px-5 py-2 rounded-xl text-white text-sm font-medium shadow-md transition-all',
                    releaseReason.trim()
                      ? 'bg-gradient-mint hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-ink-300 cursor-not-allowed shadow-none'
                  )}
                >
                  确认解除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
