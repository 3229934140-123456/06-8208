import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import type { WarningRecord, StudentProfile, InterventionType, ApprovalRecord, RiskLevel } from '@/types';
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

const STAGE_NAMES: Record<number, string> = {
  1: '辅导员确认',
  2: '联络员复核',
  3: '心理中心批准',
};

export default function WarningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addNotification = useAppStore((state) => state.addNotification);

  const initializeData = useDataStore((state) => state.initializeData);
  const getWarningById = useDataStore((state) => state.getWarningById);
  const getStudentById = useDataStore((state) => state.getStudentById);
  const approveWarningStage = useDataStore((state) => state.approveWarningStage);
  const addIntervention = useDataStore((state) => state.addIntervention);
  const isFocusStudent = useDataStore((state) => state.isFocusStudent);
  const toggleFocusStudent = useDataStore((state) => state.toggleFocusStudent);
  const resolveWarning = useDataStore((state) => state.resolveWarning);
  const warnings = useDataStore((state) => state.warnings);

  const [loading, setLoading] = useState(true);
  const [selectedInterventionType, setSelectedInterventionType] = useState<InterventionType>('counsel');
  const [interventionDesc, setInterventionDesc] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    initializeData();
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [initializeData]);

  const warning = useMemo<WarningRecord | undefined>(() => {
    if (!id) return undefined;
    return getWarningById(id);
  }, [id, getWarningById, warnings]);

  const student = useMemo<StudentProfile | undefined>(() => {
    if (!warning) return undefined;
    return getStudentById(warning.studentId);
  }, [warning, getStudentById]);

  const isFocused = useMemo(() => {
    if (!warning) return false;
    return isFocusStudent(warning.studentId);
  }, [warning, isFocusStudent]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: '首页', href: '/dashboard' },
    { label: '预警管理', href: '/warning' },
    { label: `预警详情 - ${warning?.id || ''}` },
  ];

  const riskScore = useMemo(() => {
    if (!warning) return 0;
    return Math.round(warning.depressionScore * 0.4 + (100 - warning.emotionIndex) * 0.35 + warning.level * 15);
  }, [warning]);

  const currentStage = warning?.approvalStage || 0;

  const myStage = useMemo(() => {
    if (!user) return 0;
    switch (user.role) {
      case 'counselor':
        return 1;
      case 'liaison':
        return 2;
      case 'center':
      case 'school':
        return 3;
      default:
        return 0;
    }
  }, [user]);

  const canApprove = currentStage === myStage && currentStage > 0 && warning?.status !== 'rejected' && warning?.status !== 'resolved';

  const approvals = useMemo<ApprovalRecord[]>(() => {
    if (!warning) return [];

    const stages: ApprovalRecord[] = [];
    for (let i = 1; i <= 3; i++) {
      const existing = warning.approvals.find((a) => a.stage === i);
      if (existing) {
        stages.push(existing);
      } else {
        stages.push({
          id: `${warning.id}-stage${i}`,
          warningId: warning.id,
          stage: i as 1 | 2 | 3,
          stageName: STAGE_NAMES[i] || `阶段${i}`,
          approverId: '',
          approverName: '-',
          approverRole: '',
          status: 'pending',
          createdAt: '',
        });
      }
    }
    return stages;
  }, [warning]);

  const emotionChartOption = useMemo(() => {
    if (!student || !student.emotionHistory || student.emotionHistory.length === 0) {
      return {};
    }
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
    if (!student || !student.assessmentHistory || student.assessmentHistory.length === 0) {
      return {};
    }
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
    if (!interventionDesc.trim() || !warning) return;
    if (!user) return;

    addIntervention(warning.id, {
      type: selectedInterventionType,
      typeName: interventionTypeMap[selectedInterventionType].label,
      operatorId: user.id,
      operatorName: user.name,
      description: interventionDesc.trim(),
    });

    addNotification({
      type: 'success',
      title: '提交成功',
      message: `${interventionTypeMap[selectedInterventionType].label}记录已添加`,
    });

    setInterventionDesc('');
  };

  const handleApproval = (approved: boolean) => {
    if (!canApprove || !warning || !user) return;

    const stage = myStage as 1 | 2 | 3;
    const success = approveWarningStage(
      warning.id,
      stage,
      user.id,
      user.name,
      approvalComment.trim(),
      approved
    );

    if (success) {
      addNotification({
        type: 'success',
        title: approved ? '审批通过' : '审批驳回',
        message: `预警 ${warning.id} ${approved ? '已通过' : '已驳回'}`,
      });
      setApprovalComment('');
    } else {
      addNotification({
        type: 'error',
        title: '操作失败',
        message: '审批操作失败，请重试',
      });
    }
  };

  const handleStudentClick = () => {
    if (warning) {
      navigate(`/students/${warning.studentId}`);
    }
  };

  const handleSendNotification = () => {
    if (!warning) return;
    addNotification({
      type: 'info',
      title: '通知已发送',
      message: `已向 ${warning.studentName} 的辅导员发送通知`,
    });
  };

  const handleContactStudent = () => {
    setShowContactModal(true);
  };

  const handleToggleFocus = () => {
    if (!warning) return;
    toggleFocusStudent(warning.studentId);
    const focused = isFocusStudent(warning.studentId);
    addNotification({
      type: 'success',
      title: focused ? '已添加到重点关注' : '已取消重点关注',
      message: focused ? `${warning.studentName} 已加入重点关注列表` : `${warning.studentName} 已移出重点关注列表`,
    });
  };

  const handleExportReport = () => {
    if (!warning) return;

    const reportContent = `
预警处置报告
=============

预警编号: ${warning.id}
学生姓名: ${warning.studentName}
学校: ${warning.schoolName}
学院: ${warning.college}
年级专业: ${warning.grade} / ${warning.major}
预警等级: ${warning.level === 1 ? '一级' : '二级'}
风险等级: ${warning.riskLevel}
触发类型: ${warning.triggerType}
触发原因: ${warning.triggerReason}
情绪指数: ${warning.emotionIndex}
抑郁得分: ${warning.depressionScore}
生成时间: ${new Date(warning.createdAt).toLocaleString('zh-CN')}
当前状态: ${warning.statusText}

审批记录:
${warning.approvals.map((a) => `
  阶段${a.stage} - ${a.stageName}
  审批人: ${a.approverName}
  状态: ${a.status === 'approved' ? '通过' : a.status === 'rejected' ? '驳回' : '待处理'}
  时间: ${a.createdAt || '未处理'}
  意见: ${a.comment || '无'}
`).join('')}

干预记录:
${warning.interventions.map((iv) => `
  类型: ${iv.typeName}
  操作人: ${iv.operatorName}
  时间: ${new Date(iv.createdAt).toLocaleString('zh-CN')}
  描述: ${iv.description}
`).join('')}

---
报告生成时间: ${new Date().toLocaleString('zh-CN')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `处置报告_${warning.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: '导出成功',
      message: '处置报告已导出',
    });
  };

  if (loading) {
    return <MainLayout breadcrumbs={breadcrumbs}><div className="p-16"><Loading /></div></MainLayout>;
  }

  if (!warning) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="p-16 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-ink-300" />
          <p className="text-ink-500">未找到预警记录</p>
          <button
            onClick={() => navigate('/warning')}
            className="mt-4 btn-primary"
          >
            返回预警列表
          </button>
        </div>
      </MainLayout>
    );
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
                <div
                  className="flex flex-col sm:flex-row gap-6 cursor-pointer group"
                  onClick={handleStudentClick}
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                      <User className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-ink-900">{student?.name || warning.studentName}</h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-ink-500">{student?.gender || '-'} · {student?.age || '-'}岁</span>
                        <span className="text-ink-200">|</span>
                        <span className="text-sm font-mono text-ink-500">{student?.studentNo || '-'}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(student?.tags || []).map((tag) => (
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
                      <span>{student?.schoolName || warning.schoolName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Building2 className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student?.college || warning.college}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <GraduationCap className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student?.grade || warning.grade} · {student?.major || warning.major}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Users className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student?.className || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <UserCheck className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>辅导员：{student?.counselor || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink-600">
                      <Phone className="h-4 w-4 text-ink-400 shrink-0" />
                      <span>{student?.phone || '-'}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center text-primary-500 text-sm font-medium">
                    查看详情 →
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
                        {warning.triggerReason}
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
                  {student?.assessmentHistory?.[0]?.assessmentName || '暂无测评数据'} · {student?.assessmentHistory?.[0]?.assessmentDate || ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ReactECharts option={radarChartOption} style={{ height: 280 }} notMerge lazyUpdate />
                  <div className="space-y-3">
                    {student?.assessmentHistory?.[0] && Object.entries(student.assessmentHistory[0].dimensions).map(([key, dim]) => {
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
                    {student?.assessmentHistory?.[0] && (
                      <div className="mt-3 p-3 rounded-xl bg-ink-50/80 text-xs text-ink-600 leading-relaxed">
                        <span className="font-semibold text-ink-700">测评结论：</span>
                        {student.assessmentHistory[0].conclusion}
                      </div>
                    )}
                    {!student?.assessmentHistory?.length && (
                      <div className="text-center py-8 text-ink-400">
                        <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p>暂无测评数据</p>
                      </div>
                    )}
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
                    {approvals.map((apr, idx) => {
                      const isCompleted = apr.status === 'approved' || apr.status === 'rejected';
                      const isCurrent = currentStage === apr.stage && canApprove;
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
                      const segCompleted = approvals[segIdx]?.status === 'approved';
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
                  {warning.interventions.length === 0 && (
                    <div className="text-center py-8 text-ink-400">
                      <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                      <p>暂无干预记录</p>
                    </div>
                  )}
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
                  <span className="ml-auto text-xs text-ink-400 font-normal">共 {student?.warningCount || 0} 条</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(student?.warningHistory || []).slice(0, 3).map((hw) => (
                  <div
                    key={hw.id}
                    className="p-3 rounded-xl border border-ink-100 hover:border-ink-200 hover:bg-ink-50/50 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/warning/${hw.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="solid" size="sm" color={hw.level === 1 ? 'warning-low' : 'warning-high'}>
                        {hw.level === 1 ? '一级' : '二级'}
                      </Badge>
                      <span className="font-mono text-xs text-ink-400">{hw.id}</span>
                      <span className="ml-auto text-xs text-ink-400">{new Date(hw.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-600">{hw.triggerType === 'emotion' ? '情绪异常' : hw.triggerType === 'assessment' ? '测评异常' : hw.triggerType === 'behavior' ? '行为异常' : '综合触发'}</span>
                      <span className={cn(
                        'text-xs font-medium px-2 py-0.5 rounded-md',
                        hw.status === 'resolved' || hw.status === 'approved' ? 'bg-mint-50 text-mint-700' : 'bg-ink-100 text-ink-500'
                      )}>
                        {hw.statusText}
                      </span>
                    </div>
                  </div>
                ))}
                {(!student?.warningHistory || student.warningHistory.length === 0) && (
                  <div className="text-center py-4 text-ink-400 text-sm">
                    暂无历史预警记录
                  </div>
                )}
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
                <button
                  onClick={handleSendNotification}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary-50/60 hover:bg-primary-50 border border-primary-100 hover:border-primary-200 transition-all duration-200 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white group-hover:scale-110 transition-transform shadow-md">
                    <BellRing className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-primary-700">发送通知给辅导员</span>
                </button>
                <button
                  onClick={handleContactStudent}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-mint-50/60 hover:bg-mint-50 border border-mint-100 hover:border-mint-200 transition-all duration-200 group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint-500 text-white group-hover:scale-110 transition-transform shadow-md">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-mint-700">一键联系学生</span>
                </button>
                <button
                  onClick={handleToggleFocus}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 group',
                    isFocused
                      ? 'bg-warning-low/20 border-warning-low/30 hover:bg-warning-low/25'
                      : 'bg-warning-low/10 hover:bg-warning-low/15 border border-warning-low/20 hover:border-warning-low/30'
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl text-white group-hover:scale-110 transition-transform shadow-md',
                    isFocused ? 'bg-warning-high' : 'bg-warning-low'
                  )}>
                    <BookmarkPlus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-semibold text-warning-low">
                    {isFocused ? '取消重点关注' : '添加到重点关注'}
                  </span>
                </button>
                <button
                  onClick={handleExportReport}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-ink-50 hover:bg-ink-100 border border-ink-200 hover:border-ink-300 transition-all duration-200 group"
                >
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

      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
            <div className="p-6 border-b border-ink-100">
              <h3 className="text-lg font-bold text-ink-800">联系学生</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-ink-50 rounded-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <User className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-ink-800">{student?.name || warning.studentName}</p>
                  <p className="text-sm text-ink-500">{student?.phone || '暂无联系方式'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-mint-500 text-white font-medium hover:bg-mint-600 transition-colors">
                  <PhoneCall className="h-4 w-4" />
                  拨打电话
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  发送消息
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-ink-100">
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full py-2.5 rounded-xl text-ink-600 hover:bg-ink-50 font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
