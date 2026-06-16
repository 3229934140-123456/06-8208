import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LineChart, PieChart, RadarChart, TimelineChart } from '@/components/charts';
import type { PieDataItem, RadarIndicator, RadarSeries } from '@/components/charts';
import type { TimelineEvent } from '@/components/charts/TimelineChart';
import { useDataStore } from '@/store/dataStore';
import { useCanAccessStudent } from '@/hooks/usePermission';
import type { StudentProfile, AssessmentRecord, AssessmentDimension, RiskLevel, InterventionRecord } from '@/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Edit3,
  Bell,
  Link2,
  FileText,
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Home,
  Calendar,
  ShieldAlert,
  Heart,
  Activity,
  ClipboardList,
  MessageSquare,
  UserCheck,
  TrendingUp,
  ChevronRight,
  Star,
  AlertTriangle,
  Eye,
  Download,
  Plus,
  Check,
  Repeat,
  Users,
  PieChart as PieChartIcon,
  X,
  Save,
  Copy,
  CheckCheck,
  FileEdit,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '学生档案', href: '/students' },
  { label: '档案详情' },
];

type DetailTab = 'overview' | 'emotion' | 'assessment' | 'warning' | 'intervention';

const detailTabs: { key: DetailTab; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: '档案概览', icon: FileText },
  { key: 'emotion', label: '情绪趋势', icon: Activity },
  { key: 'assessment', label: '测评历史', icon: ClipboardList },
  { key: 'warning', label: '预警记录', icon: ShieldAlert },
  { key: 'intervention', label: '处置/咨询记录', icon: MessageSquare },
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

function EmotionRing({ value, size = 120 }: { value: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = value / 100;
  const offset = circumference * (1 - progress);
  const color = value < 50 ? '#FF6B6B' : value < 65 ? '#FFA94D' : value < 80 ? '#74C0FC' : '#2EC4B6';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="12"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-xs text-ink-400 font-medium">情绪指数</span>
      </div>
    </div>
  );
}

const emotionDimensionLabels: Record<AssessmentDimension, string> = {
  depression: '抑郁',
  anxiety: '焦虑',
  stress: '压力',
  sleep: '睡眠',
  social: '社交',
};

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById, updateStudent, initializeData, isFocusStudent, toggleFocusStudent, focusedStudentIds } = useDataStore();

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [compareFirst, setCompareFirst] = useState(0);
  const [compareSecond, setCompareSecond] = useState(1);
  const [showCompare, setShowCompare] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssessmentLinkModal, setShowAssessmentLinkModal] = useState(false);
  const [showAddInterventionModal, setShowAddInterventionModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });
  const [editForm, setEditForm] = useState<Partial<StudentProfile>>({});
  const [interventionForm, setInterventionForm] = useState({
    type: 'intervention' as 'intervention' | 'followup' | 'warning',
    typeName: '心理咨询',
    title: '',
    description: '',
    operator: '',
  });

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const student = useMemo(() => {
    if (!id) return undefined;
    return getStudentById(id);
  }, [id, getStudentById]);

  const canAccess = useCanAccessStudent(id || '');

  const isFocused = useMemo(() => {
    if (!id) return false;
    return isFocusStudent(id);
  }, [id, isFocusStudent, focusedStudentIds]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 2000);
  };

  const handleToggleFocus = () => {
    if (!student) return;
    const wasFocused = isFocused;
    toggleFocusStudent(student.id);
    const isNowFocused = !wasFocused;
    showToast(isNowFocused ? `已将 ${student.name} 加入重点关注` : `已将 ${student.name} 移出重点关注`, 'success');
  };

  const emotionChartData = useMemo(() => {
    if (!student || !student.emotionHistory || student.emotionHistory.length === 0) {
      const dates = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
      return { dates, data: [] };
    }
    const dates = student.emotionHistory.map(e => {
      const d = new Date(e.date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const data = student.emotionHistory.map(e => e.value);
    return { dates, data };
  }, [student]);

  const sourcePieData: PieDataItem[] = [
    { name: '社交数据', value: 32 },
    { name: 'APP行为', value: 28 },
    { name: '咨询记录', value: 22 },
    { name: '心理测评', value: 18 },
  ];

  const emotionStats = useMemo(() => {
    const values = emotionChartData.data;
    if (values.length === 0) {
      return { avg: 0, max: 0, min: 0, abnormal: 0 };
    }
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const abnormal = values.filter(v => v < 60).length;
    return { avg, max, min, abnormal };
  }, [emotionChartData]);

  const radarIndicators: RadarIndicator[] = [
    { name: '抑郁', max: 100, threshold: 60 },
    { name: '焦虑', max: 100, threshold: 60 },
    { name: '压力', max: 100, threshold: 60 },
    { name: '睡眠', max: 100, threshold: 60 },
    { name: '社交', max: 100, threshold: 60 },
  ];

  const radarSeries: RadarSeries[] = useMemo(() => {
    if (!student || !student.assessmentHistory || student.assessmentHistory.length === 0) {
      return [];
    }
    const assessments = student.assessmentHistory;
    const firstIdx = Math.min(compareFirst, assessments.length - 1);
    const first = assessments[firstIdx];
    const series: RadarSeries[] = [
      {
        name: first.assessmentName,
        data: (['depression', 'anxiety', 'stress', 'sleep', 'social'] as AssessmentDimension[]).map(
          d => first.dimensions[d].score
        ),
      },
    ];
    if (showCompare && compareSecond !== firstIdx && assessments[compareSecond]) {
      const second = assessments[compareSecond];
      series.push({
        name: second.assessmentName,
        data: (['depression', 'anxiety', 'stress', 'sleep', 'social'] as AssessmentDimension[]).map(
          d => second.dimensions[d].score
        ),
      });
    }
    return series;
  }, [student, compareFirst, compareSecond, showCompare]);

  const interventionEvents: TimelineEvent[] = useMemo(() => {
    if (!student || !student.warningHistory) return [];
    
    const events: TimelineEvent[] = [];
    let eventId = 1;

    student.warningHistory.forEach(w => {
      events.push({
        id: eventId++,
        time: w.createdAt,
        type: 'warning',
        typeName: '预警处置',
        title: `${w.triggerReason}预警`,
        description: w.triggerReason,
        operator: w.studentName,
        details: {
          '风险等级': getRiskText(w.riskLevel),
          '预警类型': w.triggerType,
          '当前状态': w.statusText,
        },
      });

      w.interventions?.forEach(iv => {
        events.push({
          id: eventId++,
          time: iv.createdAt,
          type: 'intervention',
          typeName: '心理咨询',
          title: iv.description || '干预记录',
          description: iv.description || '',
          operator: iv.operatorName || '',
          details: {
            '干预类型': iv.typeName,
            '持续时长': '未知',
          },
        });
      });
    });

    events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return events;
  }, [student]);

  const handleOpenEdit = () => {
    if (!student) return;
    setEditForm({
      name: student.name,
      gender: student.gender,
      age: student.age,
      phone: student.phone || '',
      college: student.college,
      major: student.major,
      grade: student.grade,
      className: student.className,
      counselor: student.counselor,
      medicalHistory: student.medicalHistory || '',
      familyHistory: student.familyHistory || '',
      tags: [...student.tags],
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!id || !student) return;
    updateStudent(id, editForm);
    setShowEditModal(false);
  };

  const handleGenerateAssessmentLink = () => {
    setShowAssessmentLinkModal(true);
  };

  const handleCopyLink = () => {
    const link = `https://mental-health.example.com/assessment/${id}?t=${Date.now()}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddIntervention = () => {
    if (!id || !interventionForm.title) {
      alert('请填写处置记录标题');
      return;
    }
    setShowAddInterventionModal(false);
    setInterventionForm({
      type: 'intervention',
      typeName: '心理咨询',
      title: '',
      description: '',
      operator: '',
    });
    alert('处置记录已添加（模拟）');
  };

  const handleWarningClick = (warningId: string) => {
    navigate(`/warning/${warningId}`);
  };

  if (!student || !canAccess) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-ink-100 flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-ink-300" />
          </div>
          <h3 className="text-xl font-bold text-ink-800 mb-2">
            {!student ? '学生不存在' : '无权限访问'}
          </h3>
          <p className="text-sm text-ink-500 mb-6">
            {!student ? '未找到对应的学生档案' : '您没有权限查看该学生的档案信息'}
          </p>
          <button
            onClick={() => navigate('/students')}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回学生列表
          </button>
        </div>
      </MainLayout>
    );
  }

  const assessmentLink = `https://mental-health.example.com/assessment/${id}?t=${Date.now()}`;

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        {toast.show && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-mint-500 text-white' : 'bg-warning-high text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回学生列表
        </button>

        <Card className="overflow-hidden border-primary-100/60">
          <div className="relative h-28 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
            <div className="absolute inset-0 opacity-20 bg-grain" />
          </div>
          <CardContent className="p-5 lg:p-7 -mt-16 relative">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-end">
              <div className="flex items-start gap-5 flex-1">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 border-white">
                    {student.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-mint-500 border-2 border-white flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-10 lg:pt-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-ink-900 tracking-tight">
                      {student.name}
                    </h2>
                    <Badge color={getRiskBadgeColor(student.riskLevel)} size="lg" variant="solid" withDot>
                      {getRiskText(student.riskLevel)}
                    </Badge>
                    {isFocused && (
                      <Badge color="risk-high" size="lg" variant="soft" withDot>
                        重点关注
                      </Badge>
                    )}
                    {student.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-ink-100 text-ink-600 text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-2.5 text-sm">
                    <div className="flex items-center gap-2 text-ink-600">
                      <GraduationCap className="h-4 w-4 text-ink-400 shrink-0" />
                      <span className="font-mono text-ink-500">学号:</span>
                      <span className="font-medium">{student.studentNo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <User className="h-4 w-4 text-ink-400 shrink-0" />
                      <span className="text-ink-500">{student.gender} · {student.age}岁</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Phone className="h-4 w-4 text-ink-400 shrink-0" />
                      <span className="font-medium">{student.phone || '未填写'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600 col-span-2">
                      <BookOpen className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student.schoolName} · {student.college} · {student.major}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Home className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student.grade} {student.className}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex lg:flex-col items-center gap-5 lg:items-end">
                <div className="flex items-center gap-5">
                  <EmotionRing value={student.currentEmotionIndex} size={110} />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-warning-high" />
                      <span className="text-sm font-medium text-ink-600">
                        历史预警 <span className="font-bold text-warning-high">{student.warningCount}</span> 次
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary-500" />
                      <span className="text-sm font-medium text-ink-600">
                        辅导员: <span className="font-semibold">{student.counselor}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning-low" />
                      <span className="text-sm text-ink-600">
                        {isFocused ? '已加入重点关注' : '未加入重点关注'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-5 mt-5 border-t border-ink-100">
              <button
                onClick={handleOpenEdit}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                编辑档案
              </button>
              <button
                onClick={handleToggleFocus}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 border',
                  isFocused
                    ? 'bg-warning-high/10 text-warning-high border-warning-high/30 hover:bg-warning-high/20'
                    : 'btn-secondary'
                )}
              >
                <Star className={cn('h-4 w-4', isFocused && 'fill-current')} />
                {isFocused ? '取消关注' : '设为重点关注'}
              </button>
              <button
                onClick={handleGenerateAssessmentLink}
                className="btn-secondary flex items-center gap-2"
              >
                <Link2 className="h-4 w-4" />
                生成测评链接
              </button>
              <button
                onClick={() => setShowAddInterventionModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                添加处置记录
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-1 p-1.5 rounded-2xl bg-white border border-ink-200 shadow-card w-fit">
          {detailTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  activeTab === tab.key
                    ? 'bg-gradient-primary text-white shadow-md'
                    : 'text-ink-600 hover:bg-ink-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary-500" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    {[
                      { label: '姓名', value: student.name },
                      { label: '学号', value: student.studentNo },
                      { label: '性别', value: student.gender },
                      { label: '年龄', value: student.age + ' 岁' },
                      { label: '联系电话', value: student.phone || '未填写' },
                      { label: '学校', value: student.schoolName },
                      { label: '学院', value: student.college },
                      { label: '专业', value: student.major },
                      { label: '年级班级', value: student.grade + ' ' + student.className },
                      { label: '辅导员', value: student.counselor },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 py-2 border-b border-ink-50 last:border-b-0">
                        <span className="text-sm text-ink-400 w-20 shrink-0">{item.label}</span>
                        <span className="text-sm font-medium text-ink-700">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Heart className="h-4 w-4 text-warning-high" />
                    病史信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: '既往病史', value: student.medicalHistory || '无', icon: Heart },
                      { label: '家族病史', value: student.familyHistory || '无', icon: Users },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl bg-ink-50/60 border border-ink-100">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                          <item.icon className="h-5 w-5 text-warning-low" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-ink-400 mb-1">{item.label}</div>
                          <div className="text-sm font-medium text-ink-700">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-warning-low" />
                    个人标签
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.tags.length > 0 ? (
                      student.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl text-sm font-medium border bg-primary-50 text-primary-600 border-primary-100"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-ink-400">暂无标签</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary-500" />
                    测评概览
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50/60 border border-ink-100">
                      <span className="text-sm text-ink-600">测评次数</span>
                      <span className="text-lg font-bold text-primary-600">
                        {student.assessmentHistory?.length || 0} 次
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50/60 border border-ink-100">
                      <span className="text-sm text-ink-600">最近测评得分</span>
                      <span className="text-lg font-bold text-ink-700">
                        {student.assessmentHistory && student.assessmentHistory.length > 0
                          ? student.assessmentHistory[0].overallScore
                          : '-'
                        } 分
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-ink-50/60 border border-ink-100">
                      <span className="text-sm text-ink-600">预警次数</span>
                      <span className="text-lg font-bold text-warning-high">
                        {student.warningCount} 次
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'emotion' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary-500" />
                        近30天情绪指数趋势
                      </CardTitle>
                      <CardDescription>综合多源数据的情绪波动曲线</CardDescription>
                    </div>
                    <Badge color="risk-medium" size="sm" variant="soft">
                      阈值线 60分
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {emotionChartData.data.length > 0 ? (
                    <LineChart
                      xAxisData={emotionChartData.dates}
                      series={[{ name: '情绪指数', data: emotionChartData.data }]}
                      colors={['#0F4C81']}
                      height={320}
                      yAxisName="指数"
                      smooth={true}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-ink-400">
                      暂无情绪数据
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-warning-low" />
                    情绪波动统计
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: '平均指数', value: emotionStats.avg, color: 'primary', suffix: '分' },
                      { label: '最高值', value: emotionStats.max, color: 'mint', suffix: '分' },
                      { label: '最低值', value: emotionStats.min, color: 'danger', suffix: '分' },
                      { label: '异常天数', value: emotionStats.abnormal, color: 'warning', suffix: '天' },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="p-4 rounded-xl bg-ink-50/60 border border-ink-100"
                      >
                        <div className="text-xs text-ink-500 mb-2">{s.label}</div>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={cn(
                              'text-2xl font-bold',
                              s.color === 'primary' && 'text-primary-600',
                              s.color === 'mint' && 'text-mint-600',
                              s.color === 'danger' && 'text-warning-high',
                              s.color === 'warning' && 'text-warning-low'
                            )}
                          >
                            {s.value}
                          </span>
                          <span className="text-sm text-ink-400">{s.suffix}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4 text-mint-500" />
                    数据来源分布
                  </CardTitle>
                  <CardDescription>情绪指数的构成来源</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={sourcePieData}
                    colors={['#0F4C81', '#2EC4B6', '#FFA94D', '#FF6B6B']}
                    height={260}
                    showLegend={false}
                  />
                  <div className="space-y-2 mt-2">
                    {sourcePieData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: ['#0F4C81', '#2EC4B6', '#FFA94D', '#FF6B6B'][idx]
                            }}
                          />
                          <span className="text-ink-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-ink-700">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-ink-800 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary-500" />
                测评记录时间线
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCompare(!showCompare)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all',
                    showCompare
                      ? 'bg-primary-50 border-primary-300 text-primary-600'
                      : 'bg-white border-ink-200 text-ink-600 hover:bg-ink-50'
                  )}
                >
                  <Repeat className="h-4 w-4" />
                  {showCompare ? '取消对比' : '测评对比'}
                </button>
                <button className="btn-secondary flex items-center gap-2 text-sm">
                  <Download className="h-4 w-4" />
                  导出报告
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-4">
                {student.assessmentHistory && student.assessmentHistory.length > 0 ? (
                  student.assessmentHistory.map((asm, idx) => (
                    <Card
                      key={asm.id}
                      className={cn(
                        'hover:shadow-card-hover transition-all duration-300 cursor-pointer',
                        showCompare && compareFirst === idx && 'ring-2 ring-primary-300'
                      )}
                      onClick={() => showCompare && setCompareFirst(idx)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <h4 className="font-bold text-ink-800 text-lg">{asm.assessmentName}</h4>
                              {asm.isRetest && (
                                <Badge color="risk-medium" size="sm" variant="soft">
                                  复测
                                </Badge>
                              )}
                              {asm.improvedPercent && (
                                <Badge color="risk-safe" size="sm" variant="soft" withDot>
                                  改善 +{asm.improvedPercent}%
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-ink-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {asm.assessmentDate}
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs text-ink-400 mb-1">总分</div>
                            <div
                              className={cn(
                                'text-3xl font-bold',
                                asm.overallScore < 40 ? 'text-mint-600'
                                  : asm.overallScore < 55 ? 'text-risk-low'
                                  : asm.overallScore < 70 ? 'text-warning-low'
                                  : 'text-warning-high'
                              )}
                            >
                              {asm.overallScore}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {(['depression', 'anxiety', 'stress', 'sleep', 'social'] as AssessmentDimension[]).map((dim) => {
                            const d = asm.dimensions[dim];
                            return (
                              <div key={dim} className="flex items-center gap-3">
                                <span className="w-12 text-xs text-ink-500 shrink-0">
                                  {emotionDimensionLabels[dim]}
                                </span>
                                <div className="flex-1 h-2 rounded-full bg-ink-100 overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all duration-700',
                                      d.level === '正常' ? 'bg-mint-400'
                                        : d.level === '轻度' ? 'bg-risk-low'
                                        : d.level === '中度' ? 'bg-warning-low'
                                        : 'bg-warning-high'
                                    )}
                                    style={{ width: d.score + '%' }}
                                  />
                                </div>
                                <span className="w-16 text-right">
                                  <span className={cn(
                                    'text-xs font-bold',
                                    d.level === '正常' ? 'text-mint-600'
                                      : d.level === '轻度' ? 'text-risk-low'
                                      : d.level === '中度' ? 'text-warning-low'
                                      : 'text-warning-high'
                                  )}>
                                    {d.score}
                                  </span>
                                  <span className="text-[10px] text-ink-400 ml-1">{d.level}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-ink-100">
                          <div className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-mint-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-ink-600 leading-relaxed">{asm.conclusion}</p>
                          </div>
                        </div>
                        {showCompare && (
                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCompareSecond(idx);
                              }}
                              className={cn(
                                'text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                                compareSecond === idx
                                  ? 'bg-mint-100 text-mint-700 border border-mint-200'
                                  : 'bg-ink-50 text-ink-500 border border-ink-200 hover:bg-ink-100'
                              )}
                            >
                              {compareSecond === idx && <Check className="h-3 w-3 inline mr-1" />}
                              设为对比项 B
                            </button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-ink-400">
                      <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>暂无测评记录</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {showCompare && student.assessmentHistory && student.assessmentHistory.length > 0 && (
                <Card className="h-fit xl:sticky xl:top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary-500" />
                      测评对比雷达图
                    </CardTitle>
                    <CardDescription>
                      {student.assessmentHistory[compareFirst]?.assessmentName || '-'}
                      {compareSecond !== compareFirst && student.assessmentHistory[compareSecond] && (
                        <> vs {student.assessmentHistory[compareSecond].assessmentName}</>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadarChart
                      indicators={radarIndicators}
                      series={radarSeries}
                      colors={['#0F4C81', '#2EC4B6']}
                      height={360}
                      showThreshold={true}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'warning' && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50/80 border-b border-ink-100">
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">预警编号</th>
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">风险等级</th>
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">触发原因</th>
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">触发时间</th>
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">处置状态</th>
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.warningHistory && student.warningHistory.length > 0 ? (
                      student.warningHistory.map((w) => (
                        <tr
                          key={w.id}
                          className={cn(
                            'border-b border-ink-50 transition-all duration-200 hover:bg-primary-50/40 cursor-pointer',
                            w.riskLevel === 'high' && 'bg-warning-high/5'
                          )}
                          onClick={() => handleWarningClick(w.id)}
                        >
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-primary-600 font-semibold">{w.id}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge color={getRiskBadgeColor(w.riskLevel)} size="md" withDot variant="solid">
                              {getRiskText(w.riskLevel)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <span className="text-ink-700">{w.triggerReason}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-ink-500 whitespace-nowrap">{w.createdAt}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge color={w.status === 'resolved' ? 'risk-safe' : w.status === 'pending' ? 'risk-medium' : 'risk-low'} size="md" withDot>
                              {w.statusText}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <button className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors">
                              <Eye className="h-4 w-4" />
                              查看详情
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-ink-400">
                          <ShieldAlert className="h-10 w-10 mx-auto mb-2 opacity-30" />
                          <p>暂无预警记录</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'intervention' && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary-500" />
                    处置/咨询记录
                  </CardTitle>
                  <CardDescription>共 {interventionEvents.length} 条记录</CardDescription>
                </div>
                <button
                  onClick={() => setShowAddInterventionModal(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  新增记录
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {interventionEvents.length > 0 ? (
                <TimelineChart
                  events={interventionEvents}
                  height={600}
                />
              ) : (
                <div className="py-16 text-center text-ink-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>暂无处置/咨询记录</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h3 className="text-lg font-bold text-ink-800 flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-primary-500" />
                编辑学生档案
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">姓名</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">性别</label>
                  <select
                    value={editForm.gender || '男'}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">年龄</label>
                  <input
                    type="number"
                    value={editForm.age || ''}
                    onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">联系电话</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">学院</label>
                  <input
                    type="text"
                    value={editForm.college || ''}
                    onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">专业</label>
                  <input
                    type="text"
                    value={editForm.major || ''}
                    onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">年级</label>
                  <input
                    type="text"
                    value={editForm.grade || ''}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">班级</label>
                  <input
                    type="text"
                    value={editForm.className || ''}
                    onChange={(e) => setEditForm({ ...editForm, className: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">辅导员</label>
                  <input
                    type="text"
                    value={editForm.counselor || ''}
                    onChange={(e) => setEditForm({ ...editForm, counselor: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">标签</label>
                  <input
                    type="text"
                    value={(editForm.tags || []).join('，')}
                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(/[，,]/).map(t => t.trim()).filter(Boolean) })}
                    placeholder="多个标签用逗号分隔"
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">既往病史</label>
                  <textarea
                    value={editForm.medicalHistory || ''}
                    onChange={(e) => setEditForm({ ...editForm, medicalHistory: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">家族病史</label>
                  <textarea
                    value={editForm.familyHistory || ''}
                    onChange={(e) => setEditForm({ ...editForm, familyHistory: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100 bg-ink-50/50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white border border-ink-200 text-ink-600 font-medium hover:bg-ink-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssessmentLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h3 className="text-lg font-bold text-ink-800 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary-500" />
                生成测评链接
              </h3>
              <button
                onClick={() => setShowAssessmentLinkModal(false)}
                className="p-2 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-ink-600">
                以下是专属测评链接，发送给学生后可直接进行心理测评：
              </p>
              <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-100">
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-primary-700 font-mono break-all">
                    {assessmentLink}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      'shrink-0 p-2 rounded-lg transition-all',
                      copied
                        ? 'bg-mint-100 text-mint-600'
                        : 'bg-white text-primary-600 hover:bg-primary-100 border border-primary-200'
                    )}
                  >
                    {copied ? <CheckCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <AlertCircle className="h-4 w-4" />
                链接有效期为7天，仅限本人使用
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100 bg-ink-50/50">
              <button
                onClick={() => setShowAssessmentLinkModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white border border-ink-200 text-ink-600 font-medium hover:bg-ink-100 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddInterventionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden animate-slide-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h3 className="text-lg font-bold text-ink-800 flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary-500" />
                添加处置记录
              </h3>
              <button
                onClick={() => setShowAddInterventionModal(false)}
                className="p-2 rounded-lg hover:bg-ink-100 text-ink-400 hover:text-ink-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">记录类型</label>
                <select
                  value={interventionForm.type}
                  onChange={(e) => {
                    const type = e.target.value as any;
                    const typeName = type === 'intervention' ? '心理咨询' : type === 'followup' ? '随访跟进' : '预警处置';
                    setInterventionForm({ ...interventionForm, type, typeName });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                >
                  <option value="intervention">心理咨询</option>
                  <option value="followup">随访跟进</option>
                  <option value="warning">预警处置</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">标题</label>
                <input
                  type="text"
                  value={interventionForm.title}
                  onChange={(e) => setInterventionForm({ ...interventionForm, title: e.target.value })}
                  placeholder="请输入记录标题"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">处置人员</label>
                <input
                  type="text"
                  value={interventionForm.operator}
                  onChange={(e) => setInterventionForm({ ...interventionForm, operator: e.target.value })}
                  placeholder="请输入处置人员姓名"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">详细描述</label>
                <textarea
                  value={interventionForm.description}
                  onChange={(e) => setInterventionForm({ ...interventionForm, description: e.target.value })}
                  rows={4}
                  placeholder="请输入处置详细内容"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100 bg-ink-50/50">
              <button
                onClick={() => setShowAddInterventionModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white border border-ink-200 text-ink-600 font-medium hover:bg-ink-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddIntervention}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                保存记录
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
