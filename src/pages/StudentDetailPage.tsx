import { useState, useMemo } from 'react';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LineChart, PieChart, RadarChart, TimelineChart } from '@/components/charts';
import type { PieDataItem, RadarIndicator, RadarSeries } from '@/components/charts';
import type { TimelineEvent } from '@/components/charts/TimelineChart';
import { useStudentDetail } from '@/hooks/useMockData';
import type { StudentProfile, AssessmentRecord, AssessmentDimension, RiskLevel } from '@/types';
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

function generateMockStudentDetail(): StudentProfile & {
  guardianName: string;
  guardianRelationship: string;
  guardianPhone: string;
  medicalHistory: string;
  familyHistory: string;
  allergyHistory: string;
  address: string;
  ethnicity: string;
  tags: string[];
  assessments: AssessmentRecord[];
  warnings: {
    id: string;
    level: RiskLevel;
    triggerReason: string;
    time: string;
    status: string;
    duration: string;
  }[];
  interventions: TimelineEvent[];
} {
  const dimensionNames: AssessmentDimension[] = ['depression', 'anxiety', 'stress', 'sleep', 'social'];

  const assessments: AssessmentRecord[] = Array.from({ length: 4 }, (_elem: unknown, i: number) => {
    const overall = 55 + Math.floor(Math.random() * 35);
    return {
      id: `ASM${String(1000 + i).padStart(5, '0')}`,
      studentId: 'STU0000001',
      assessmentName: ['SDS自评量表', 'SAS焦虑量表', 'PHQ-9抑郁筛查', '季度心理测评'][i],
      assessmentDate: new Date(Date.now() - i * 86400000 * (30 + i * 15)).toISOString().split('T')[0],
      overallScore: overall,
      dimensions: dimensionNames.reduce((acc, dim) => {
        const score = Math.floor(Math.random() * 50) + 30;
        const level = score < 40 ? '正常' : score < 55 ? '轻度' : score < 70 ? '中度' : '重度';
        acc[dim] = { score, level };
        return acc;
      }, {} as Record<AssessmentDimension, { score: number; level: string }>) as any,
      conclusion: [
        '情绪状态良好，建议保持积极心态',
        '轻度焦虑倾向，建议适当放松',
        '存在一定学业压力，建议心理咨询',
        '整体心理状态平稳',
      ][i],
      isRetest: i === 2,
      improvedPercent: i > 0 ? Math.floor(Math.random() * 20) + 5 : undefined,
    };
  });

  return {
    id: 'STU2026000001',
    name: '张伟明',
    gender: '男',
    age: 20,
    studentNo: '2023100123',
    schoolId: 'SCH0001',
    schoolName: '清华大学',
    college: '计算机学院',
    major: '软件工程',
    grade: '大三',
    className: '软工2103班',
    phone: '13812345678',
    counselor: '王老师',
    currentEmotionIndex: 62,
    riskLevel: 'medium',
    warningCount: 2,
    assessmentHistory: assessments,
    emotionHistory: [],
    warningHistory: [],
    guardianName: '张建国',
    guardianRelationship: '父亲',
    guardianPhone: '13698765432',
    medicalHistory: '无重大疾病史',
    familyHistory: '无家族精神病史',
    allergyHistory: '青霉素过敏',
    address: '北京市海淀区中关村大街1号',
    ethnicity: '汉族',
    tags: ['学业困难', '性格内向', '贫困生'],
    assessments,
    warnings: [
      { id: 'WRN2026031001', level: 'high', triggerReason: '连续7天情绪低于阈值 + 夜间行为异常', time: '2026-03-10 14:23', status: '已处理', duration: '48小时' },
      { id: 'WRN2026012201', level: 'medium', triggerReason: 'SDS测评中度抑郁', time: '2026-01-22 09:15', status: '已关闭', duration: '72小时' },
    ],
    interventions: [
      { id: 1, time: '2026-05-26 14:00', type: 'followup', typeName: '随访跟进', title: '第三次随访', description: '学生情绪状态明显改善，睡眠质量有所提高，社交活动增加。建议继续保持，两周后再次随访。', operator: '李老师', details: { '咨询类型': '面谈', '持续时长': '50分钟', '下次随访': '2026-06-09' } },
      { id: 2, time: '2026-05-19 10:00', type: 'intervention', typeName: '心理咨询', title: '个体心理咨询（第二次）', description: '继续探讨学业压力问题，引入认知行为疗法，帮助调整不合理信念。学生配合度较好。', operator: '王老师', details: { '咨询类型': '面谈', '持续时长': '60分钟' } },
      { id: 3, time: '2026-05-12 15:30', type: 'intervention', typeName: '心理咨询', title: '个体心理咨询（第一次）', description: '首次咨询，建立咨访关系。学生主诉学业压力大，对未来感到迷茫。初步评估存在中度焦虑情绪。', operator: '王老师', details: { '咨询类型': '面谈', '持续时长': '55分钟' } },
      { id: 4, time: '2026-03-12 09:00', type: 'warning', typeName: '预警处置', title: '高危预警响应', description: '接到系统预警后，辅导员第一时间联系学生本人及家长，经评估后转介至校心理咨询中心进行专业干预。', operator: '王老师', details: { '响应时间': '2小时', '处置方式': '转介咨询 + 家长沟通' } },
    ],
  };
}

const emotionDimensionLabels: Record<AssessmentDimension, string> = {
  depression: '抑郁',
  anxiety: '焦虑',
  stress: '压力',
  sleep: '睡眠',
  social: '社交',
};

export default function StudentDetailPage() {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [compareFirst, setCompareFirst] = useState(0);
  const [compareSecond, setCompareSecond] = useState(1);
  const [showCompare, setShowCompare] = useState(false);

  const { loading } = useStudentDetail('STU2026000001');
  const student = useMemo(() => generateMockStudentDetail(), []);

  const emotionChartData = useMemo(() => {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    let baseValue = student.currentEmotionIndex;
    const data = Array.from({ length: 30 }, () => {
      baseValue += (Math.random() - 0.5) * 10;
      baseValue = Math.max(30, Math.min(95, baseValue));
      return Math.round(baseValue);
    });
    return { dates, data };
  }, [student.currentEmotionIndex]);

  const sourcePieData: PieDataItem[] = [
    { name: '社交数据', value: 32 },
    { name: 'APP行为', value: 28 },
    { name: '咨询记录', value: 22 },
    { name: '心理测评', value: 18 },
  ];

  const emotionStats = useMemo(() => {
    const values = emotionChartData.data;
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
    const first = student.assessments[compareFirst];
    const series: RadarSeries[] = [
      {
        name: first.assessmentName,
        data: (['depression', 'anxiety', 'stress', 'sleep', 'social'] as AssessmentDimension[]).map(
          d => first.dimensions[d].score
        ),
      },
    ];
    if (showCompare && compareSecond !== compareFirst) {
      const second = student.assessments[compareSecond];
      series.push({
        name: second.assessmentName,
        data: (['depression', 'anxiety', 'stress', 'sleep', 'social'] as AssessmentDimension[]).map(
          d => second.dimensions[d].score
        ),
      });
    }
    return series;
  }, [student.assessments, compareFirst, compareSecond, showCompare]);

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <button className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-primary-600 transition-colors">
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
                      <span className="font-medium">{student.phone}</span>
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
                      <Phone className="h-4 w-4 text-ink-400" />
                      <span className="text-sm text-ink-600">
                        紧急联系人: {student.guardianName}（{student.guardianRelationship}）
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-5 mt-5 border-t border-ink-100">
              <button className="btn-secondary flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                编辑档案
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Bell className="h-4 w-4" />
                发送通知
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                生成测评链接
              </button>
              <button className="btn-primary flex items-center gap-2">
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
                      { label: '民族', value: student.ethnicity },
                      { label: '联系电话', value: student.phone },
                      { label: '学校', value: student.schoolName },
                      { label: '学院', value: student.college },
                      { label: '专业', value: student.major },
                      { label: '年级班级', value: student.grade + ' ' + student.className },
                      { label: '辅导员', value: student.counselor },
                      { label: '家庭住址', value: student.address },
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
                      { label: '既往病史', value: student.medicalHistory, icon: Heart },
                      { label: '家族病史', value: student.familyHistory, icon: Users },
                      { label: '过敏史', value: student.allergyHistory, icon: AlertTriangle },
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
                    {[...student.tags, '成绩中等', '喜欢编程', '早起习惯', '社交较少', '学习认真'].map((tag, i) => (
                      <span
                        key={i}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-sm font-medium border transition-all hover:scale-105 cursor-default',
                          i < 3
                            ? 'bg-warning-low/10 text-warning-low border-warning-low/30'
                            : i < 5
                            ? 'bg-primary-50 text-primary-600 border-primary-100'
                            : 'bg-mint-50 text-mint-700 border-mint-100'
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary-500" />
                    紧急联系人
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50/60 to-white border border-primary-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-bold text-ink-800">{student.guardianName}</div>
                        <div className="text-xs text-ink-500">{student.guardianRelationship}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-600">
                      <Phone className="h-4 w-4 text-ink-400" />
                      <span className="font-medium">{student.guardianPhone}</span>
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
                  <LineChart
                    xAxisData={emotionChartData.dates}
                    series={[{ name: '情绪指数', data: emotionChartData.data }]}
                    colors={['#0F4C81']}
                    height={320}
                    yAxisName="指数"
                    smooth={true}
                    loading={loading}
                  />
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
                {student.assessments.map((asm, idx) => (
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
                ))}
              </div>

              {showCompare && (
                <Card className="h-fit xl:sticky xl:top-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary-500" />
                      测评对比雷达图
                    </CardTitle>
                    <CardDescription>
                      {student.assessments[compareFirst].assessmentName}
                      {compareSecond !== compareFirst && (
                        <> vs {student.assessments[compareSecond].assessmentName}</>
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
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">处置时长</th>
                      <th className="px-6 py-4 text-left font-semibold text-ink-600 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.warnings.map((w) => (
                      <tr
                        key={w.id}
                        className={cn(
                          'border-b border-ink-50 transition-all duration-200 hover:bg-primary-50/40',
                          w.level === 'high' && 'bg-warning-high/5'
                        )}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-primary-600 font-semibold">{w.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={getRiskBadgeColor(w.level)} size="md" withDot variant="solid">
                            {getRiskText(w.level)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <span className="text-ink-700">{w.triggerReason}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-ink-500 whitespace-nowrap">{w.time}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color={w.status === '已处理' ? 'risk-safe' : 'risk-medium'} size="md" withDot>
                            {w.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-ink-600">{w.duration}</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:text-primary-700 transition-colors">
                            <Eye className="h-4 w-4" />
                            查看详情
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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
                  <CardDescription>共 {student.interventions.length} 条记录</CardDescription>
                </div>
                <button className="btn-primary flex items-center gap-2 text-sm">
                  <Plus className="h-4 w-4" />
                  新增记录
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <TimelineChart
                events={student.interventions}
                height={600}
                loading={loading}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
