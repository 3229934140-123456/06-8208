import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Loading } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import type { WarningRecord, StudentProfile, AssessmentRecord, InterventionType, ApprovalRecord, RiskLevel } from '@/types';
import ReactECharts from 'echarts-for-react';
import {
  ArrowLeft,
  User,
  School,
  GraduationCap,
  Building2,
  UserCheck,
  Phone,
  ShieldAlert,
  Shield,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Circle,
  MessageSquare,
  Send,
  CalendarDays,
  HeartHandshake,
  BrainCircuit,
  Users,
  Star,
  Download,
  BellRing,
  PhoneCall,
  BookmarkPlus,
  FileDown,
  Plus,
  History,
  AlertCircle,
  TrendingDown,
  Zap,
} from 'lucide-react';

const interventionTypeMap: Record<InterventionType, { label: string; icon: any; color: string }> = {
  counsel: { label: '约谈', icon: MessageSquare, color: 'primary' },
  referral: { label: '转介', icon: BrainCircuit, color: 'mint' },
  contact_family: { label: '联系家属', icon: Users, color: 'warning-low' },
  follow_up: { label: '随访', icon: HeartHandshake, color: 'risk-low' },
  other: { label: '其他', icon: FileText, color: 'risk-medium' },
};

function generateMockDetail(): { warning: WarningRecord; student: StudentProfile } {
  const emotionHistory = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const base = 45 + (i >= 10 ? -10 : Math.sin(i / 2) * 10);
    return {
      date: d.toISOString().split('T')[0],
      value: Math.max(30, Math.min(85, Math.round(base + (Math.random() - 0.5) * 8))),
      source: (['social', 'app_usage', 'counsel', 'assessment'] as const)[i % 4],
    };
  });

  const assessment: AssessmentRecord = {
    id: 'ASM000128',
    studentId: 'STU100008',
    assessmentName: 'SCL-90症状自评量表',
    assessmentDate: '2026-06-10',
    overallScore: 68,
    dimensions: {
      depression: { score: 72, level: '中度' },
      anxiety: { score: 65, level: '轻度' },
      stress: { score: 58, level: '轻度' },
      sleep: { score: 48, level: '正常' },
      social: { score: 55, level: '轻度' },
    },
    conclusion: '受测者近期存在中度抑郁倾向，伴有轻度焦虑和压力感受，建议进行心理咨询介入。',
    isRetest: false,
  };

  const interventions = [
    {
      id: 'INT001',
      warningId: 'WRN20260008',
      type: 'counsel' as InterventionType,
      typeName: '约谈',
      operatorId: 'OP001',
      operatorName: '王辅导员',
      description: '初次约谈，学生主诉学业压力大，对未来感到迷茫，睡眠质量下降。已建立信任关系，约定下周继续跟进。',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'INT002',
      warningId: 'WRN20260008',
      type: 'follow_up' as InterventionType,
      typeName: '随访',
      operatorId: 'OP001',
      operatorName: '王辅导员',
      description: '电话随访，学生反馈情绪略有好转，但仍存在失眠情况。建议调整作息并进行适度运动。',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const approvals: ApprovalRecord[] = [
    {
      id: 'APR001',
      warningId: 'WRN20260008',
      stage: 1,
      stageName: '辅导员确认',
      approverId: 'U001',
      approverName: '王辅导员',
      approverRole: 'counselor',
      status: 'approved',
      comment: '已与学生面谈，情况属实，同意升级为二级预警。建议院系关注并介入。',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'APR002',
      warningId: 'WRN20260008',
      stage: 2,
      stageName: '院系联络员复核',
      approverId: 'U002',
      approverName: '李联络员',
      approverRole: 'liaison',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'APR003',
      warningId: 'WRN20260008',
      stage: 3,
      stageName: '校心理中心批准',
      approverId: 'U003',
      approverName: '-',
      approverRole: 'center',
      status: 'pending',
      createdAt: '',
    },
  ];

  const warning: WarningRecord = {
    id: 'WRN20260008',
    studentId: 'STU100008',
    studentName: '李明轩',
    schoolId: 'SCH0001',
    schoolName: '清华大学',
    college: '计算机学院',
    major: '软件工程',
    grade: '大三',
    level: 2,
    riskLevel: 'high',
    triggerType: 'composite',
    triggerReason: '连续3天情绪指数低于阈值 + SDS测评中度抑郁 + 夜间异常行为',
    emotionIndex: 42,
    depressionScore: 68,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'processing',
    statusText: '处理中',
    approvalStage: 2,
    approvals,
    interventions,
  };

  const student: StudentProfile = {
    id: 'STU100008',
    name: '李明轩',
    gender: '男',
    age: 21,
    studentNo: '2023010892',
    schoolId: 'SCH0001',
    schoolName: '清华大学',
    college: '计算机学院',
    major: '软件工程',
    grade: '大三',
    className: '软工2303班',
    phone: '138****6682',
    counselor: '王老师',
    currentEmotionIndex: 42,
    riskLevel: 'high',
    warningCount: 3,
    assessmentHistory: [assessment],
    emotionHistory,
    warningHistory: [warning],
    tags: ['学业压力', '社交退缩', '失眠'],
  };

  return { warning, student };
}

function generateSimilarStudents(): Array<{ id: string; name: string; college: string; riskLevel: RiskLevel; similarity: number }> {
  const names = ['陈思远', '刘子豪', '赵雨桐', '孙雅琪', '周天宇'];
  const colleges = ['计算机学院', '经济管理学院', '工学院'];
  const levels: RiskLevel[] = ['medium', 'high', 'medium', 'high', 'medium'];
  return names.map((name, i) => ({
    id: `STU${100020 + i}`,
    name,
    college: colleges[i % colleges.length],
    riskLevel: levels[i],
    similarity: 78 + Math.floor(Math.random() * 18),
  }));
}

function generateHistoryWarnings(): Array<{ id: string; level: number; time: string; status: string; trigger: string }> {
  return [
    { id: 'WRN20250892', level: 1, time: '2025-11-15', status: '已处置', trigger: '情绪异常' },
    { id: 'WRN20260156', level: 1, time: '2026-02-28', status: '已关闭', trigger: '测评异常' },
  ];
}

export default function WarningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading] = useState(false);
  const [selectedInterventionType, setSelectedInterventionType] = useState<InterventionType>('counsel');
  const [interventionDesc, setInterventionDesc] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [currentRole] = useState<'counselor' | 'liaison' | 'center'>('liaison');

  const { warning, student } = useMemo(() => generateMockDetail(), [id]);
  const similarStudents = useMemo(() => generateSimilarStudents(), []);
  const historyWarnings = useMemo(() => generateHistoryWarnings(), []);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: '首页', href: '/dashboard' },
    { label: '预警管理', href: '/warning' },
    { label: `预警详情 - ${warning.id}` },
  ];

  const riskScore = useMemo(() => {
    return Math.round(warning.depressionScore * 0.4 + (100 - warning.emotionIndex) * 0.35 + warning.level * 15);
  }, [warning]);

  const currentStage = warning.approvalStage || 0;
  const myStage = currentRole === 'counselor' ? 1 : currentRole === 'liaison' ? 2 : 3;
  const canApprove = currentStage === myStage;

  const emotionChartOption = useMemo(() => {
    const dates = student.emotionHistory.map((e) => e.date.slice(5));
    const values = student.emotionHistory.map((e) => e.value);
    return {
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 30 },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#E2E8F0' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#F1F5F9' } },
        axisLabel: { color: '#64748B', fontSize: 11 },
      },
      series: [
        {
          name: '情绪指数',
          type: 'line',
          data: values,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { width: 3, color: '#0F4C81' },
          itemStyle: { color: '#0F4C81', borderWidth: 2, borderColor: '#fff' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(15, 76, 129, 0.25)' },
                { offset: 1, color: 'rgba(15, 76, 129, 0.02)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { type: 'dashed', color: '#FF6B6B', width: 2 },
            data: [{ yAxis: 50, label: { formatter: '阈值 50', color: '#FF6B6B', fontSize: 11, position: 'insideEndTop' } }],
          },
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(255, 107, 107, 0.12)' },
            data: [[{ yAxis: 0 }, { yAxis: 50 }]],
          },
        },
      ],
    };
  }, [student]);

  const radarChartOption = useMemo(() => {
    const dims = student.assessmentHistory[0]?.dimensions;
    if (!dims) return {};
    return {
      tooltip: {},
      radar: {
        indicator: [
          { name: '抑郁', max: 100 },
          { name: '焦虑', max: 100 },
          { name: '压力', max: 100 },
          { name: '睡眠', max: 100 },
          { name: '社交', max: 100 },
        ],
        center: ['50%', '52%'],
        radius: '65%',
        axisName: { color: '#475569', fontSize: 12 },
        splitLine: { lineStyle: { color: '#E2E8F0' } },
        splitArea: { areaStyle: { color: ['#FAFBFC', '#F1F5F9'] } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: [dims.depression.score, dims.anxiety.score, dims.stress.score, dims.sleep.score, dims.social.score],
              name: '学生得分',
              lineStyle: { color: '#FF6B6B', width: 2 },
              itemStyle: { color: '#FF6B6B' },
              areaStyle: { color: 'rgba(255, 107, 107, 0.2)' },
            },
            {
              value: [35, 35, 40, 65, 60],
              name: '常模参考',
              lineStyle: { color: '#2EC4B6', width: 2, type: 'dashed' },
              itemStyle: { color: '#2EC4B6' },
              areaStyle: { color: 'rgba(46, 196, 182, 0.1)' },
            },
          ],
        },
      ],
      legend: { data: ['学生得分', '常模参考'], bottom: 0, textStyle: { fontSize: 11, color: '#64748B' } },
    };
  }, [student]);

  const handleSubmitIntervention = () => {
    if (!interventionDesc.trim()) return;
    alert(`干预记录已提交：${interventionTypeMap[selectedInterventionType].label}`);
    setInterventionDesc('');
  };

  const handleApproval = (approved: boolean) => {
    if (!canApprove) return;
    alert(`${approved ? '通过' : '驳回'}成功：${approvalComment || '无意见'}`);
    setApprovalComment('');
  };

  if (loading) {
    return <MainLayout breadcrumbs={breadcrumbs}><div className="p-16"><Loading /></div></MainLayout>;
  }

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-ink-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-ink-200 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">返回预警列表</span>
          </button>
          <div className="flex items-center gap-2">
            <Badge variant="solid" color={warning.level === 1 ? 'warning-low' : 'warning-high'} size="lg" withDot>
              {warning.level === 1 ? '一级预警' : '二级预警'}
            </Badge>
            <Badge color={warning.riskLevel === 'high' ? 'risk-high' : warning.riskLevel === 'medium' ? 'risk-medium' : 'risk-low'} size="lg" withDot>
              {warning.riskLevel === 'high' ? '高风险' : warning.riskLevel === 'medium' ? '中风险' : '低风险'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-100 gap-6">
          <div className="xl:col-span-[65%] space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shrink-0">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-ink-900">{student.name}</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-ink-500">{student.gender} · {student.age}岁</span>
                        <span className="text-ink-200">|</span>
                        <span className="text-sm font-mono text-ink-500">{student.studentNo}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {student.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-warning-low/10 text-warning-low border border-warning-low/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 sm:border-l sm:border-ink-100 sm:pl-6 text-sm">
                    <div className="flex items-center gap-2 text-ink-600">
                      <School className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student.schoolName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Building2 className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student.college}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <GraduationCap className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student.grade} · {student.major}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Users className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student.className}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <UserCheck className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>辅导员：{student.counselor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Phone className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student.phone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldAlert className="h-5 w-5 text-warning-high" />
                    预警详情
                  </CardTitle>
                  <span className="text-xs text-ink-400">预警编号：{warning.id}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-ink-50/80">
                  <div>
                    <p className="text-xs text-ink-400 mb-1">预警等级</p>
                    <p className="font-semibold text-ink-800">{warning.level === 1 ? '一级（一般）' : '二级（严重）'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400 mb-1">风险等级</p>
                    <p className={cn(
                      'font-semibold',
                      warning.riskLevel === 'high' ? 'text-warning-high' : warning.riskLevel === 'medium' ? 'text-warning-low' : 'text-mint-600'
                    )}>
                      {warning.riskLevel === 'high' ? '高风险' : warning.riskLevel === 'medium' ? '中风险' : warning.riskLevel === 'low' ? '低风险' : '安全'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400 mb-1">触发原因</p>
                    <p className="font-semibold text-ink-800">{warning.triggerType === 'emotion' ? '情绪异常' : warning.triggerType === 'assessment' ? '测评异常' : warning.triggerType === 'behavior' ? '行为异常' : '综合触发'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-400 mb-1">触发时间</p>
                    <p className="font-semibold text-ink-800">{new Date(warning.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-warning-low/30 bg-gradient-to-r from-warning-low/8 to-transparent">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning-low shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-ink-800 mb-1">详细触发条件</p>
                      <p className="text-sm text-ink-600 leading-relaxed">
                        连续3天情绪指数：<span className="font-semibold text-warning-high">42 / 38 / 41</span>，低于阈值 <span className="font-semibold">50</span>；
                        最新SDS测评得分 <span className="font-semibold text-warning-high">68分（中度抑郁）</span>；
                        门禁记录显示连续 <span className="font-semibold text-warning-high">3天</span> 凌晨2点后返校。
                        综合触发 <span className="font-semibold text-warning-high">二级预警</span>，建议立即介入。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingDown className="h-5 w-5 text-primary-500" />
                  情绪趋势（近14天）
                </CardTitle>
                <CardDescription>红色阴影区域为异常范围（低于阈值50）</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts option={emotionChartOption} style={{ height: 260 }} notMerge lazyUpdate />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BrainCircuit className="h-5 w-5 text-mint-600" />
                  测评结果摘要
                </CardTitle>
                <CardDescription>
                  {student.assessmentHistory[0]?.assessmentName} · {student.assessmentHistory[0]?.assessmentDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReactECharts option={radarChartOption} style={{ height: 280 }} notMerge lazyUpdate />
                  <div className="space-y-3">
                    {student.assessmentHistory[0] && Object.entries(student.assessmentHistory[0].dimensions).map(([key, dim]) => {
                      const labels: Record<string, string> = { depression: '抑郁水平', anxiety: '焦虑水平', stress: '压力感知', sleep: '睡眠质量', social: '社会功能' };
                      const color = dim.level === '正常' ? 'bg-risk-safe' : dim.level === '轻度' ? 'bg-risk-low' : dim.level === '中度' ? 'bg-risk-medium' : 'bg-risk-high';
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-ink-600">{labels[key]}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-ink-800">{dim.score}</span>
                              <span className={cn('px-1.5 py-0.5 text-[10px] rounded text-white font-medium', color)}>{dim.level}</span>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                            <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${dim.score}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    <div className="mt-3 p-3 rounded-xl bg-ink-50/80 text-xs text-ink-600 leading-relaxed">
                      <span className="font-semibold text-ink-700">测评结论：</span>
                      {student.assessmentHistory[0]?.conclusion}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle2 className="h-5 w-5 text-primary-500" />
                  三级审批流程
                  {canApprove && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-50 text-primary-600 border border-primary-200">待您处理</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative px-2">
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    {warning.approvals.map((apr, idx) => {
                      const isCompleted = apr.status === 'approved' || apr.status === 'rejected';
                      const isCurrent = currentStage === apr.stage;
                      const isRejected = apr.status === 'rejected';
                      return (
                        <div key={apr.id} className="flex flex-col items-center text-center">
                          <div className={cn(
                            'relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300',
                            isCompleted && !isRejected ? 'bg-risk-safe text-white border-risk-safe shadow-md shadow-risk-safe/30'
                              : isRejected ? 'bg-warning-high text-white border-warning-high shadow-md'
                              : isCurrent ? 'bg-white text-primary-500 border-primary-500 shadow-lg shadow-primary-500/30 scale-110'
                              : 'bg-white text-ink-300 border-ink-200'
                          )}>
                            {isCompleted && !isRejected ? <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
                              : isRejected ? <XCircle className="h-6 w-6" strokeWidth={2.5} />
                              : isCurrent ? <Clock className="h-6 w-6 animate-pulse" strokeWidth={2} />
                              : <Circle className="h-6 w-6" strokeWidth={2} />}
                          </div>
                          <p className="mt-3 text-sm font-bold text-ink-800">{apr.stageName}</p>
                          <p className="mt-0.5 text-xs text-ink-500">{apr.approverName}</p>
                          {apr.createdAt && (
                            <p className="mt-0.5 text-[10px] text-ink-400">{new Date(apr.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
                          )}
                          {apr.comment && (
                            <p className="mt-2 text-xs text-ink-500 px-2 py-1.5 rounded-lg bg-ink-50 max-w-[200px] leading-relaxed">
                              "{apr.comment}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute top-6 left-[8%] right-[8%] h-0.5 z-0 flex items-center">
                    {[0, 1].map((segIdx) => {
                      const segCompleted = warning.approvals[segIdx].status === 'approved';
                      return (
                        <div key={segIdx} className="flex-1 mx-4 h-full">
                          <div className={cn(
                            'h-full transition-all duration-1000',
                            segCompleted ? 'bg-risk-safe' : 'bg-ink-200'
                          )}
                            style={segCompleted ? { backgroundImage: 'linear-gradient(90deg, #2EC4B6 0%, #2EC4B6 50%, transparent 50%)', backgroundSize: '10px 100%', animation: 'shimmer 1.5s linear infinite' } : {}}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {canApprove && (
                  <div className="p-5 rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50/60 to-mint-50/40 animate-fade-in-up">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink-800 mb-1">请填写审批意见</p>
                        <textarea
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                          rows={3}
                          placeholder="请输入您的审批意见，说明通过或驳回的原因..."
                          className="input-base resize-none text-sm mt-2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => handleApproval(false)}
                        className="px-6 py-2.5 rounded-xl font-medium border border-warning-high/40 text-warning-high bg-white hover:bg-warning-high/5 transition-all duration-200"
                      >
                        <span className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          驳回
                        </span>
                      </button>
                      <button
                        onClick={() => handleApproval(true)}
                        className="btn-primary"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          通过
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-5 w-5 text-mint-600" />
                  干预记录时间线
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-6 space-y-6">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-200 via-mint-200 to-transparent" />
                  {[...warning.interventions].reverse().map((iv, idx) => {
                    const cfg = interventionTypeMap[iv.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={iv.id} className="relative animate-slide-in" style={{ animationDelay: `${idx * 0.08}s` }}>
                        <div className={cn(
                          'absolute -left-[30px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-md',
                          cfg.color === 'primary' ? 'bg-primary-500'
                            : cfg.color === 'mint' ? 'bg-mint-500'
                            : cfg.color === 'warning-low' ? 'bg-warning-low'
                            : cfg.color === 'risk-low' ? 'bg-risk-low'
                            : 'bg-risk-medium'
                        )}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <div className="p-4 rounded-xl bg-ink-50/80 border border-ink-100 hover:shadow-sm transition-all duration-200">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-ink-200 text-ink-700">
                              {cfg.label}
                            </span>
                            <span className="text-xs text-ink-400">{iv.operatorName}</span>
                            <span className="text-xs text-ink-400 ml-auto flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(iv.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm text-ink-600 leading-relaxed">{iv.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="h-5 w-5 text-primary-500" />
                  新增干预记录
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(interventionTypeMap) as InterventionType[]).map((key) => {
                    const cfg = interventionTypeMap[key];
                    const Icon = cfg.icon;
                    const selected = selectedInterventionType === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedInterventionType(key)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                          selected
                            ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10'
                            : 'border-ink-200 bg-white hover:border-ink-300 hover:bg-ink-50'
                        )}
                      >
                        <Icon className={cn('h-5 w-5 transition-colors', selected ? 'text-primary-500' : 'text-ink-400')} />
                        <span className={cn('text-xs font-semibold transition-colors', selected ? 'text-primary-700' : 'text-ink-600')}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div>
                  <textarea
                    value={interventionDesc}
                    onChange={(e) => setInterventionDesc(e.target.value)}
                    rows={4}
                    placeholder={`请输入${interventionTypeMap[selectedInterventionType].label}的详细内容说明...`}
                    className="input-base resize-none text-sm"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitIntervention}
                    disabled={!interventionDesc.trim()}
                    className={cn(
                      'btn-primary flex items-center gap-2',
                      !interventionDesc.trim() && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <Send className="h-4 w-4" />
                    提交干预记录
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-[35%] space-y-6">
            <Card className="overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-warning-high via-warning-low to-warning-critical relative">
                <div className="absolute inset-0 bg-grain opacity-50" />
              </div>
              <CardContent className="-mt-10 relative z-10 space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink-500 mb-1">当前风险评分</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold bg-gradient-to-br from-warning-high to-warning-critical bg-clip-text text-transparent">
                        {riskScore}
                      </span>
                      <span className="text-sm text-ink-400">/ 100</span>
                    </div>
                  </div>
                  <Badge variant="solid" color="warning-high" size="lg" withDot>
                    {riskScore >= 75 ? '极高' : riskScore >= 60 ? '高' : riskScore >= 45 ? '中' : '低'}
                  </Badge>
                </div>

                <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-risk-safe via-risk-medium to-warning-high transition-all duration-1000"
                    style={{ width: `${riskScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ink-100">
                  <div className="text-center p-2">
                    <p className="text-[10px] text-ink-400 mb-0.5">建议优先级</p>
                    <p className="text-sm font-bold text-warning-high">P0</p>
                  </div>
                  <div className="text-center p-2 border-x border-ink-100">
                    <p className="text-[10px] text-ink-400 mb-0.5">响应时限</p>
                    <p className="text-sm font-bold text-warning-low">24h内</p>
                  </div>
                  <div className="text-center p-2">
                    <p className="text-[10px] text-ink-400 mb-0.5">处置建议</p>
                    <p className="text-sm font-bold text-primary-600">立即介入</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-5 w-5 text-warning-low" />
                  历史预警
                  <span className="ml-auto text-xs text-ink-400 font-normal">共 {student.warningCount} 条</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {historyWarnings.map((hw) => (
                  <div
                    key={hw.id}
                    className="p-3 rounded-xl border border-ink-100 hover:border-ink-200 hover:bg-ink-50/50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="solid" size="sm" color={hw.level === 1 ? 'warning-low' : 'warning-high'}>
                        {hw.level === 1 ? '一级' : '二级'}
                      </Badge>
                      <span className="font-mono text-xs text-ink-400">{hw.id}</span>
                      <span className="ml-auto text-xs text-ink-400">{hw.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-600">{hw.trigger}</span>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-md',
                        hw.status === '已处置' ? 'bg-mint-50 text-mint-700' : 'bg-ink-100 text-ink-500'
                      )}>
                        {hw.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5 text-primary-500" />
                  同风险学生推荐
                </CardTitle>
                <CardDescription>相似特征的其他学生</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {similarStudents.map((ss) => (
                  <div
                    key={ss.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-200 to-primary-400 shrink-0 group-hover:scale-110 transition-transform">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-800 truncate">{ss.name}</span>
                        <Badge size="sm" color={ss.riskLevel === 'high' ? 'risk-high' : 'risk-medium'}>
                          {ss.riskLevel === 'high' ? '高' : '中'}
                        </Badge>
                      </div>
                      <p className="text-xs text-ink-400 truncate">{ss.college}</p>
                    </div>
                    <div className="flex items-center gap-1 text-right shrink-0">
                      <Star className="h-3 w-3 text-warning-low fill-warning-low" />
                      <span className="text-xs font-bold text-ink-700">{ss.similarity}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-5 w-5 text-warning-low" />
                  快捷操作
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50/60 hover:bg-primary-50 border border-primary-100 hover:border-primary-200 transition-all duration-200 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white group-hover:scale-110 transition-transform shadow-md">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-primary-700">发送通知给辅导员</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-mint-50/60 hover:bg-mint-50 border border-mint-100 hover:border-mint-200 transition-all duration-200 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-500 text-white group-hover:scale-110 transition-transform shadow-md">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-mint-700">一键联系学生</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-warning-low/10 hover:bg-warning-low/15 border border-warning-low/20 hover:border-warning-low/30 transition-all duration-200 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-low text-white group-hover:scale-110 transition-transform shadow-md">
                    <BookmarkPlus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-warning-low">添加到重点关注</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-ink-50 hover:bg-ink-100 border border-ink-200 hover:border-ink-300 transition-all duration-200 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-700 text-white group-hover:scale-110 transition-transform shadow-md">
                    <FileDown className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-ink-700">导出处置报告</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
