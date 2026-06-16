import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useDataStore } from '@/store/dataStore';
import type { StudentProfile, RiskLevel, Gender, AssessmentDimension } from '@/types';
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
  ArrowLeft,
  FileEdit,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '学生档案', href: '/students' },
  { label: '重点关注名单' },
];

type EnrollReason = 'warning_freq' | 'continuous_low' | 'high_risk' | 'severe_assessment' | 'manual';

interface FocusStudent extends StudentProfile {
  enrollReason: EnrollReason;
  enrollTime: string;
  severity: 1 | 2 | 3;
  latestAssessmentLevel: string;
  consecutiveLowEmotionDays: number;
  warningCountThisMonth: number;
}

const enrollReasonMap: Record<EnrollReason, { label: string; color: 'risk-high' | 'risk-medium' | 'risk-low' | 'primary' }> = {
  warning_freq: { label: '预警频次≥2次', color: 'risk-high' },
  continuous_low: { label: '持续低情绪≥5天', color: 'risk-medium' },
  high_risk: { label: '高风险等级', color: 'risk-high' },
  severe_assessment: { label: '测评结果重度', color: 'risk-high' },
  manual: { label: '手动添加', color: 'primary' },
};

const enrollReasonOptions = [
  { value: '', label: '全部入册原因' },
  { value: 'warning_freq', label: '预警频次' },
  { value: 'continuous_low', label: '持续低情绪' },
  { value: 'high_risk', label: '高风险' },
  { value: 'severe_assessment', label: '重度测评' },
  { value: 'manual', label: '手动添加' },
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

function getEnrollReason(student: StudentProfile, isFocused: boolean): EnrollReason {
  if (isFocused && student.warningCount < 2 && student.riskLevel !== 'high') {
    return 'manual';
  }
  if (student.warningCount >= 2) return 'warning_freq';
  if (student.riskLevel === 'high') return 'high_risk';
  if (student.currentEmotionIndex < 50) return 'continuous_low';
  if (student.assessmentHistory && student.assessmentHistory.length > 0) {
    const latest = student.assessmentHistory[0];
    const dims: AssessmentDimension[] = ['depression', 'anxiety', 'stress', 'sleep', 'social'];
    const hasSevere = dims.some(d => latest.dimensions[d]?.level === '重度');
    if (hasSevere) return 'severe_assessment';
  }
  return 'high_risk';
}

function getSeverity(student: StudentProfile): 1 | 2 | 3 {
  if (student.riskLevel === 'high' || student.warningCount >= 3) return 3;
  if (student.riskLevel === 'medium' || student.warningCount >= 1) return 2;
  return 1;
}

function getLatestAssessmentLevel(student: StudentProfile): string {
  if (!student.assessmentHistory || student.assessmentHistory.length === 0) {
    return '暂无测评';
  }
  const latest = student.assessmentHistory[0];
  const dims: AssessmentDimension[] = ['depression', 'anxiety', 'stress', 'sleep', 'social'];
  const levelMap: Record<string, string> = {
    '正常': '正常',
    '轻度': '轻度抑郁',
    '中度': '中度抑郁',
    '重度': '重度抑郁',
  };
  const levels = dims.map(d => latest.dimensions[d]?.level || '正常');
  if (levels.includes('重度')) return '重度抑郁';
  if (levels.includes('中度')) return '中度抑郁';
  if (levels.includes('轻度')) return '轻度抑郁';
  return '正常';
}

function getConsecutiveLowDays(student: StudentProfile): number {
  if (!student.emotionHistory || student.emotionHistory.length === 0) return 0;
  let count = 0;
  let maxCount = 0;
  for (let i = student.emotionHistory.length - 1; i >= 0; i--) {
    if (student.emotionHistory[i].value < 60) {
      count++;
      maxCount = Math.max(maxCount, count);
    } else {
      break;
    }
  }
  return maxCount;
}

function getWarningCountThisMonth(student: StudentProfile): number {
  if (!student.warningHistory || student.warningHistory.length === 0) return 0;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return student.warningHistory.filter(w => new Date(w.createdAt) >= monthStart).length;
}

export default function FocusListPage() {
  const navigate = useNavigate();
  const { getFocusStudents, toggleFocusStudent, isFocusStudent, initializeData, students } = useDataStore();

  const [searchValue, setSearchValue] = useState('');
  const [reason, setReason] = useState('');
  const [college, setCollege] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releaseReason, setReleaseReason] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<FocusStudent | null>(null);
  const [referralModalOpen, setReferralModalOpen] = useState(false);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const collegeOptions = useMemo(() => {
    const colleges = new Set(students.map(s => s.college));
    return [
      { value: '', label: '全部学院' },
      ...Array.from(colleges).map(c => ({ value: c, label: c })),
    ];
  }, [students]);

  const focusStudents = useMemo((): FocusStudent[] => {
    const focusList = getFocusStudents();
    return focusList.map(student => {
      const isFocused = isFocusStudent(student.id);
      return {
        ...student,
        enrollReason: getEnrollReason(student, isFocused),
        enrollTime: student.assessmentHistory?.[0]?.assessmentDate || student.warningHistory?.[0]?.createdAt || '未知',
        severity: getSeverity(student),
        latestAssessmentLevel: getLatestAssessmentLevel(student),
        consecutiveLowEmotionDays: getConsecutiveLowDays(student),
        warningCountThisMonth: getWarningCountThisMonth(student),
      };
    }).sort((a, b) => b.severity - a.severity);
  }, [getFocusStudents, isFocusStudent]);

  const stats = useMemo(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const newThisWeek = focusStudents.filter(s => {
      if (s.enrollTime === '未知') return false;
      return new Date(s.enrollTime) >= weekAgo;
    }).length;
    
    return {
      current: focusStudents.length,
      newThisWeek,
      released: Math.floor(students.length * 0.1),
      avgCycle: '18.5',
    };
  }, [focusStudents, students.length]);

  const filteredStudents = useMemo(() => {
    return focusStudents.filter((s) => {
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
  }, [focusStudents, reason, college, searchValue]);

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
      '持续低情绪天数': s.consecutiveLowEmotionDays,
      '最近测评等级': s.latestAssessmentLevel,
      辅导员: s.counselor,
      联系电话: s.phone || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '重点关注名单');
    XLSX.writeFile(wb, `重点关注名单_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleViewDetail = (id: string) => {
    navigate(`/students/${id}`);
  };

  const handleReleaseClick = (student: FocusStudent) => {
    setSelectedStudent(student);
    setReleaseReason('');
    setReleaseModalOpen(true);
  };

  const handleConfirmRelease = () => {
    if (!releaseReason.trim() || !selectedStudent) return;
    toggleFocusStudent(selectedStudent.id);
    setReleaseModalOpen(false);
    setSelectedStudent(null);
    setReleaseReason('');
    setPage(1);
  };

  const handleReferralClick = (student: FocusStudent) => {
    setSelectedStudent(student);
    setReferralModalOpen(true);
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
        </div>

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
                <span className="text-ink-300">或</span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-primary-500" />
                  高风险等级
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
            description="重点关注学生总数"
          />
          <StatCard
            title="本周新增"
            value={stats.newThisWeek}
            suffix="人"
            color="warning"
            icon={<UserPlus className="h-6 w-6" />}
            description="较上周新增"
          />
          <StatCard
            title="已解除关注"
            value={stats.released}
            suffix="人"
            color="mint"
            icon={<CheckCircle2 className="h-6 w-6" />}
            description="累计解除"
          />
          <StatCard
            title="平均关注周期"
            value={stats.avgCycle}
            suffix="天"
            color="primary"
            icon={<Clock className="h-6 w-6" />}
            description="平均关注时长"
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
                        'border-b border-ink-50 transition-all duration-200 hover:bg-primary-50/30 group cursor-pointer',
                        isCritical && 'bg-warning-high/5'
                      )}
                      style={{ animationDelay: `${idx * 0.02}s` }}
                      onClick={() => handleViewDetail(student.id)}
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
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewDetail(student.id)}
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
                            onClick={() => handleReferralClick(student)}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
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
                      ? 'bg-gradient-to-r from-mint-500 to-mint-600 hover:shadow-lg hover:-translate-y-0.5'
                      : 'bg-ink-300 cursor-not-allowed shadow-none'
                  )}
                >
                  确认解除
                </button>
              </div>
            </div>
          </div>
        )}

        {referralModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-slide-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
                <h3 className="text-lg font-bold text-ink-800 flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-warning-low" />
                  转介建议
                </h3>
                <button
                  onClick={() => {
                    setReferralModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="p-2 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-warning-low/10 border border-warning-low/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-warning-low/20 flex items-center justify-center">
                      <FileEdit className="h-5 w-5 text-warning-low" />
                    </div>
                    <div>
                      <div className="font-semibold text-ink-800">{selectedStudent.name}</div>
                      <div className="text-xs text-ink-500">{selectedStudent.studentNo} · {selectedStudent.college}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-ink-500 text-xs">风险等级</span>
                      <Badge color={getRiskBadgeColor(selectedStudent.riskLevel)} size="sm" withDot className="ml-2">
                        {getRiskText(selectedStudent.riskLevel)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-ink-500 text-xs">入册原因</span>
                      <span className="ml-2 text-ink-700 text-sm">{enrollReasonMap[selectedStudent.enrollReason].label}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-ink-700">建议转介方案</h4>
                  <div className="space-y-2">
                    {[
                      { title: '校心理咨询中心个体咨询', desc: '建议每周1-2次，持续8周', recommended: true },
                      { title: '团体心理辅导', desc: '人际关系成长小组，每周1次', recommended: false },
                      { title: '精神科医院评估', desc: '建议到三甲医院精神科进一步诊断', recommended: selectedStudent.severity === 3 },
                      { title: '辅导员日常关注', desc: '增加谈心谈话频次，加强日常关怀', recommended: true },
                      { title: '家校联动', desc: '与家长沟通，共同关注学生状态', recommended: selectedStudent.severity >= 2 },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-3 rounded-xl border transition-all',
                          item.recommended
                            ? 'bg-primary-50/60 border-primary-200/60'
                            : 'bg-ink-50/50 border-ink-100'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {item.recommended && (
                            <Badge color="primary" size="sm" variant="soft">推荐</Badge>
                          )}
                          <span className="font-medium text-ink-800 text-sm">{item.title}</span>
                        </div>
                        <p className="text-xs text-ink-500 ml-0">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 bg-ink-50 border-t border-ink-100">
                <button
                  onClick={() => {
                    setReferralModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-ink-200 text-ink-600 text-sm font-medium hover:bg-ink-100 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    alert('转介建议已记录（模拟）');
                    setReferralModalOpen(false);
                    setSelectedStudent(null);
                  }}
                  className="btn-primary text-sm"
                >
                  确认转介
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
