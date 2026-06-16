import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import type { RiskLevel, StudentProfile, AssessmentDimension, WarningRecord } from '@/types';
import ReactECharts from 'echarts-for-react';
import { useDataStore } from '@/store/dataStore';
import {
  ArrowLeft,
  GraduationCap,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Search,
  Building2,
  ChevronDown,
  Eye,
  BarChart3,
  BrainCircuit,
  AlertTriangle,
  User,
  MapPin,
  Award,
  Zap,
  Activity,
  FileText,
  Heart,
  HeartHandshake,
  AlertCircle,
  Star,
} from 'lucide-react';

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSchoolById, getStudents, getWarnings, initializeData } = useDataStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'emotion' | 'assessment' | 'crisis' | 'students'>('overview');
  const [selectedColleges, setSelectedColleges] = useState<string[]>([]);
  const [studentCollege, setStudentCollege] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentRisk, setStudentRisk] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const school = useMemo(() => {
    if (!id) return undefined;
    return getSchoolById(id);
  }, [id, getSchoolById]);

  const students = useMemo(() => {
    if (!id) return [];
    return getStudents({ schoolId: id });
  }, [id, getStudents]);

  const warnings = useMemo(() => {
    if (!id) return [];
    return getWarnings({ schoolId: id });
  }, [id, getWarnings]);

  const colleges = useMemo(() => {
    const collegeSet = new Set(students.map((s) => s.college));
    return Array.from(collegeSet);
  }, [students]);

  const schoolStats = useMemo(() => {
    const totalStudents = students.length;
    const totalWarnings = warnings.length;
    const todayNew = warnings.filter((w) => {
      const today = new Date().toDateString();
      return new Date(w.createdAt).toDateString() === today;
    }).length;
    const resolvedCount = warnings.filter((w) => w.status === 'resolved' || w.status === 'approved').length;
    const resolutionRate = totalWarnings > 0 ? (resolvedCount / totalWarnings) * 100 : 95;

    let avgResponseHours = 4.5;
    const warningsWithInterventions = warnings.filter((w) => w.interventions.length > 0);
    if (warningsWithInterventions.length > 0) {
      const totalHours = warningsWithInterventions.reduce((sum, w) => {
        const firstIntervention = w.interventions[w.interventions.length - 1];
        if (firstIntervention) {
          const created = new Date(w.createdAt).getTime();
          const intervened = new Date(firstIntervention.createdAt).getTime();
          const hours = Math.max(0.1, (intervened - created) / (1000 * 60 * 60));
          return sum + hours;
        }
        return sum + 4;
      }, 0);
      avgResponseHours = totalHours / warningsWithInterventions.length;
    }

    return {
      totalStudents,
      currentWarnings: totalWarnings,
      todayNew,
      resolutionRate,
      avgResponseHours,
    };
  }, [students, warnings]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: '首页', href: '/dashboard' },
    { label: '学校概览', href: '/dashboard' },
    { label: school?.name || '学校详情' },
  ];

  const heatmapData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const data: Array<[number, number, number]> = [];
    colleges.forEach((college, ci) => {
      const collegeStudents = students.filter((s) => s.college === college);
      days.forEach((_, di) => {
        const riskLevels = collegeStudents.map((s) => {
          if (s.riskLevel === 'high') return 4;
          if (s.riskLevel === 'medium') return 3;
          if (s.riskLevel === 'low') return 2;
          return 1;
        });
        const avgRisk = riskLevels.length > 0
          ? Math.round(riskLevels.reduce((a, b) => a + b, 0) / riskLevels.length)
          : 1;
        const variance = Math.floor(Math.random() * 2) - 1;
        const val = Math.max(0, Math.min(4, avgRisk + variance));
        data.push([di, ci, val]);
      });
    });

    return { data, days, colleges };
  }, [students, colleges]);

  const emotionTrendData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const collegeData = colleges.slice(0, 5).map((college) => {
      const collegeStudents = students.filter((s) => s.college === college);
      const data = days.map((_, di) => {
        const scores = collegeStudents.map((s) => {
          if (s.emotionHistory && s.emotionHistory[di]) {
            return s.emotionHistory[di].value;
          }
          return 60 + Math.random() * 30;
        });
        return Math.round(scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length));
      });
      return { name: college, data };
    });

    return { days, collegeData };
  }, [students, colleges]);

  const emotionDistribution = useMemo(() => {
    const distribution = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${(i + 1) * 10}`,
      count: 0,
    }));

    students.forEach((s) => {
      const score = s.currentEmotionIndex;
      const idx = Math.min(9, Math.max(0, Math.floor(score / 10)));
      distribution[idx].count++;
    });

    return distribution;
  }, [students]);

  const topAbnormalStudents = useMemo(() => {
    const studentsWithHistory = students.filter((s) => s.emotionHistory && s.emotionHistory.length >= 7);
    const abnormal = studentsWithHistory.map((s) => {
      const history = s.emotionHistory;
      const recent = history.slice(0, 7);
      const earlier = history.slice(7, 14);
      const recentAvg = recent.reduce((a, b) => a + b.value, 0) / Math.max(1, recent.length);
      const earlierAvg = earlier.length > 0
        ? earlier.reduce((a, b) => a + b.value, 0) / earlier.length
        : recentAvg + 10;
      const fluctuation = Math.round(recentAvg - earlierAvg);
      return {
        id: s.id,
        name: s.name,
        college: s.college,
        grade: s.grade,
        fluctuation,
        currentScore: Math.round(recentAvg),
      };
    });

    return abnormal
      .sort((a, b) => a.fluctuation - b.fluctuation)
      .slice(0, 10);
  }, [students]);

  const dimensionRadar = useMemo(() => {
    const dims: AssessmentDimension[] = ['depression', 'anxiety', 'stress', 'sleep', 'social'];
    const dimNames: Record<AssessmentDimension, string> = {
      depression: '抑郁水平',
      anxiety: '焦虑水平',
      stress: '压力感知',
      sleep: '睡眠质量',
      social: '社会适应',
    };

    const currentScores = dims.map((dim) => {
      const scores = students
        .filter((s) => s.assessmentHistory.length > 0)
        .map((s) => s.assessmentHistory[0].dimensions[dim]?.score || 50);
      return scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 50;
    });

    const overallScores = currentScores.map((s) => Math.round(s + (Math.random() * 10 - 5)));

    return {
      current: currentScores,
      overall: overallScores,
      indicators: dims.map((d) => dimNames[d]),
    };
  }, [students]);

  const dimensionStack = useMemo(() => {
    const dims: AssessmentDimension[] = ['depression', 'anxiety', 'stress', 'sleep', 'social'];
    const dimNames: Record<AssessmentDimension, string> = {
      depression: '抑郁',
      anxiety: '焦虑',
      stress: '压力',
      sleep: '睡眠',
      social: '社交',
    };

    return dims.map((dim) => {
      const studentsWithAssessment = students.filter((s) => s.assessmentHistory.length > 0);
      let normal = 0, mild = 0, moderate = 0, severe = 0;
      studentsWithAssessment.forEach((s) => {
        const level = s.assessmentHistory[0].dimensions[dim]?.level || '正常';
        if (level === '正常') normal++;
        else if (level === '轻度') mild++;
        else if (level === '中度') moderate++;
        else severe++;
      });
      const total = studentsWithAssessment.length || 1;
      return {
        dimension: dimNames[dim],
        正常: normal,
        轻度: mild,
        中度: moderate,
        重度: severe,
      };
    });
  }, [students]);

  const completionRates = useMemo(() => {
    const total = students.length;
    const assessed = students.filter((s) => s.assessmentHistory.length > 0).length;
    const rate = total > 0 ? Math.round((assessed / total) * 100) : 0;

    return [
      { name: '2026年春季普查', completed: assessed, total, date: '2026-04', rate },
      { name: 'SDS抑郁专项', completed: Math.round(assessed * 0.7), total, date: '2026-05', rate: Math.round(rate * 0.7) },
      { name: 'SAS焦虑专项', completed: Math.round(assessed * 0.65), total, date: '2026-05', rate: Math.round(rate * 0.65) },
      { name: '新生心理普查', completed: Math.round(assessed * 0.9), total: Math.round(total * 0.9), date: '2026-03', rate: Math.round(rate * 1.05) },
    ];
  }, [students]);

  const crisisTimeline = useMemo(() => {
    const events: Array<{
      time: string;
      type: 'warning' | 'approve' | 'intervene' | 'resolve' | 'followup';
      title: string;
      desc: string;
      count: number;
    }> = [];

    const sortedWarnings = [...warnings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    sortedWarnings.slice(0, 15).forEach((w, i) => {
      events.push({
        time: w.createdAt,
        type: 'warning',
        title: `新增预警：${w.studentName}`,
        desc: w.triggerReason,
        count: 1,
      });

      if (w.interventions.length > 0) {
        const intervention = w.interventions[w.interventions.length - 1];
        events.push({
          time: intervention.createdAt,
          type: 'intervene',
          title: `干预介入：${intervention.typeName}`,
          desc: `${intervention.operatorName}进行了${intervention.typeName}`,
          count: 1,
        });
      }

      if (w.status === 'resolved' || w.status === 'approved') {
        events.push({
          time: w.updatedAt,
          type: 'resolve',
          title: '成功处置',
          desc: `预警${w.id}已成功处置`,
          count: 1,
        });
      }
    });

    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15);
  }, [warnings]);

  const crisisCategories = useMemo(() => {
    const typeMap: Record<string, number> = {
      '情绪异常': 0,
      '学业压力': 0,
      '人际冲突': 0,
      '家庭问题': 0,
      '自伤风险': 0,
      '其他': 0,
    };

    warnings.forEach((w) => {
      if (w.triggerType === 'emotion') {
        typeMap['情绪异常']++;
      } else if (w.triggerType === 'assessment') {
        typeMap['学业压力']++;
      } else if (w.triggerType === 'behavior') {
        typeMap['人际冲突']++;
      } else {
        typeMap['其他']++;
      }
    });

    return Object.entries(typeMap)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [warnings]);

  const disposalBoxData = useMemo(() => {
    const categories = ['情绪异常', '学业压力', '人际冲突', '家庭问题', '自伤风险'];
    return categories.map((cat) => {
      const data = [
        Math.floor(Math.random() * 2) + 1,
        Math.floor(Math.random() * 3) + 2,
        Math.floor(Math.random() * 4) + 4,
        Math.floor(Math.random() * 6) + 8,
        Math.floor(Math.random() * 10) + 12,
      ];
      return { name: cat, data };
    });
  }, [warnings]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (studentCollege && s.college !== studentCollege) return false;
      if (studentGrade && s.grade !== studentGrade) return false;
      if (studentRisk && s.riskLevel !== studentRisk) return false;
      if (studentSearch) {
        const kw = studentSearch.toLowerCase();
        if (
          !s.name.toLowerCase().includes(kw) &&
          !s.studentNo.includes(kw) &&
          !s.college.toLowerCase().includes(kw) &&
          !s.major.toLowerCase().includes(kw)
        ) return false;
      }
      return true;
    });
  }, [students, studentCollege, studentGrade, studentRisk, studentSearch]);

  const studentTotalPages = Math.ceil(filteredStudents.length / pageSize);
  const pageStudents = filteredStudents.slice((studentPage - 1) * pageSize, studentPage * pageSize);

  const handleStudentClick = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const heatmapOption = useMemo(() => ({
    tooltip: {
      position: 'top',
      formatter: (p: any) => `${heatmapData.colleges[p.value[1]]} · ${heatmapData.days[p.value[0]]}<br/>风险等级：${['无风险', '低风险', '中风险', '高风险', '极高'][p.value[2]]}`,
    },
    grid: { left: 100, right: 30, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: heatmapData.days, axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#64748B', fontSize: 10 }, splitArea: { show: false } },
    yAxis: { type: 'category', data: heatmapData.colleges, axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#64748B', fontSize: 11 }, splitArea: { show: false } },
    visualMap: { min: 0, max: 4, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemWidth: 12, itemHeight: 120, textStyle: { fontSize: 10, color: '#64748B' }, inRange: { color: ['#E8FAF8', '#74C0FC', '#FFA94D', '#FF8787', '#E03131'] }, show: true },
    series: [{ name: '风险等级', type: 'heatmap', data: heatmapData.data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0, 0, 0, 0.3)' } }, itemStyle: { borderWidth: 2, borderColor: '#fff' } }],
  }), [heatmapData]);

  const emotionTrendOption = useMemo(() => {
    const colors = ['#0F4C81', '#2EC4B6', '#FFA94D', '#74C0FC', '#FF6B6B'];
    return {
      tooltip: { trigger: 'axis' },
      legend: { data: emotionTrendData.collegeData.map((e) => e.name), bottom: 0, textStyle: { fontSize: 11, color: '#64748B' } },
      grid: { left: 40, right: 20, top: 20, bottom: 50 },
      xAxis: { type: 'category', data: emotionTrendData.days, axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#64748B', fontSize: 10 } },
      yAxis: { type: 'value', min: 50, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: '#F1F5F9' } }, axisLabel: { color: '#64748B', fontSize: 10 } },
      series: emotionTrendData.collegeData.map((e, i) => ({
        name: e.name,
        type: 'line',
        data: e.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { width: 2.5, color: colors[i % colors.length] },
        itemStyle: { color: colors[i % colors.length], borderWidth: 2, borderColor: '#fff' },
      })),
    };
  }, [emotionTrendData]);

  const emotionDistOption = useMemo(() => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: emotionDistribution.map((e) => e.range), axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#64748B', fontSize: 10 }, name: '情绪指数区间', nameTextStyle: { fontSize: 11, color: '#64748B' }, nameGap: 20 },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F1F5F9' } }, axisLabel: { color: '#64748B', fontSize: 10 }, name: '学生人数', nameTextStyle: { fontSize: 11, color: '#64748B' }, nameGap: 25 },
    series: [{
      type: 'bar',
      data: emotionDistribution.map((e, i) => ({ value: e.count, itemStyle: { color: i < 3 ? '#FF6B6B' : i < 5 ? '#FFA94D' : i < 8 ? '#74C0FC' : '#2EC4B6', borderRadius: [6, 6, 0, 0] } })),
      barWidth: '65%',
      label: { show: true, position: 'top', fontSize: 10, color: '#64748B' },
    }],
  }), [emotionDistribution]);

  const assessmentRadarOption = useMemo(() => ({
    tooltip: {},
    legend: { data: ['本校平均', '总体水平'], bottom: 0, textStyle: { fontSize: 11, color: '#64748B' } },
    radar: {
      indicator: dimensionRadar.indicators.map((name) => ({ name, max: 100 })),
      center: ['50%', '48%'],
      radius: '62%',
      axisName: { color: '#475569', fontSize: 12 },
      splitLine: { lineStyle: { color: '#E2E8F0' } },
      splitArea: { areaStyle: { color: ['#FAFBFC', '#F1F5F9'] } },
    },
    series: [{
      type: 'radar',
      data: [
        { value: dimensionRadar.current, name: '本校平均', lineStyle: { color: '#0F4C81', width: 2.5 }, itemStyle: { color: '#0F4C81' }, areaStyle: { color: 'rgba(15, 76, 129, 0.2)' } },
        { value: dimensionRadar.overall, name: '总体水平', lineStyle: { color: '#2EC4B6', width: 2, type: 'dashed' }, itemStyle: { color: '#2EC4B6' }, areaStyle: { color: 'rgba(46, 196, 182, 0.12)' } },
      ],
    }],
  }), [dimensionRadar]);

  const assessmentStackOption = useMemo(() => {
    const dims = dimensionStack.map((d) => d.dimension);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { data: ['正常', '轻度', '中度', '重度'], bottom: 0, textStyle: { fontSize: 11, color: '#64748B' } },
      grid: { left: 50, right: 20, top: 30, bottom: 50 },
      xAxis: { type: 'category', data: dims, axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#64748B', fontSize: 10 } },
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F1F5F9' } }, axisLabel: { color: '#64748B', fontSize: 10 } },
      series: [
        { name: '正常', type: 'bar', stack: 'total', data: dimensionStack.map((d) => d.正常), itemStyle: { color: '#2EC4B6' }, barWidth: '55%' },
        { name: '轻度', type: 'bar', stack: 'total', data: dimensionStack.map((d) => d.轻度), itemStyle: { color: '#74C0FC' } },
        { name: '中度', type: 'bar', stack: 'total', data: dimensionStack.map((d) => d.中度), itemStyle: { color: '#FFA94D' } },
        { name: '重度', type: 'bar', stack: 'total', data: dimensionStack.map((d) => d.重度), itemStyle: { color: '#FF6B6B', borderRadius: [6, 6, 0, 0] } },
      ],
    };
  }, [dimensionStack]);

  const crisisPieOption = useMemo(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 11, color: '#64748B' } },
    color: ['#0F4C81', '#2EC4B6', '#FFA94D', '#74C0FC', '#FF6B6B', '#94A3B8'],
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' }, itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.2)' } },
      data: crisisCategories,
    }],
  }), [crisisCategories]);

  const disposalBoxOption = useMemo(() => ({
    tooltip: { trigger: 'item' },
    grid: { left: 50, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: disposalBoxData.map((d) => d.name), axisLine: { lineStyle: { color: '#E2E8F0' } }, axisLabel: { color: '#64748B', fontSize: 10 } },
    yAxis: { type: 'value', name: '处置时长(小时)', axisLine: { show: false }, splitLine: { lineStyle: { color: '#F1F5F9' } }, axisLabel: { color: '#64748B', fontSize: 10 }, nameTextStyle: { fontSize: 11, color: '#64748B' }, nameGap: 25 },
    series: [{
      type: 'boxplot',
      data: disposalBoxData.map((d) => d.data),
      itemStyle: { color: '#0F4C81', borderColor: '#0F4C81' },
      emphasis: { itemStyle: { color: '#2EC4B6', borderColor: '#2EC4B6' } },
    }],
  }), [disposalBoxData]);

  const tabs = [
    { key: 'overview', label: '概览', icon: Activity },
    { key: 'emotion', label: '情绪分析', icon: Heart },
    { key: 'assessment', label: '测评分析', icon: BrainCircuit },
    { key: 'crisis', label: '危机事件', icon: AlertTriangle },
    { key: 'students', label: '学生名单', icon: Users },
  ] as const;

  if (!school) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <div className="p-16"><Loading /></div>
      </MainLayout>
    );
  }

  const getRiskBadgeColor = (level: RiskLevel): 'risk-safe' | 'risk-low' | 'risk-medium' | 'risk-high' => {
    switch (level) {
      case 'safe': return 'risk-safe';
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
    }
  };

  const getRiskText = (level: RiskLevel): string => {
    switch (level) {
      case 'safe': return '安全';
      case 'low': return '低风险';
      case 'medium': return '中风险';
      case 'high': return '高风险';
    }
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-ink-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-ink-200 transition-all duration-200 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">返回看板</span>
        </button>

        <Card className="overflow-hidden relative">
          <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-mint-500 relative">
            <div className="absolute inset-0 bg-grain opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <CardContent className="-mt-16 relative z-10">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg border-4 border-white shrink-0">
                  <GraduationCap className="h-12 w-12 text-primary-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-ink-900">{school.name}</h1>
                    <div className="flex items-center gap-1.5 text-sm text-ink-500">
                      <MapPin className="h-4 w-4" />
                      <span>{school.province}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="solid" color="primary" size="md" withDot>
                      {school.type}
                    </Badge>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-mint-50 text-mint-700 border border-mint-200/60">
                      <Award className="h-3 w-3 inline mr-1" />
                      普通高等院校
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 lg:border-l lg:border-white/30 lg:pl-6">
                {[
                  { label: '在校生数', value: schoolStats.totalStudents.toLocaleString(), suffix: '人', icon: Users, color: 'text-primary-600 bg-primary-50' },
                  { label: '当前预警', value: schoolStats.currentWarnings, suffix: '条', icon: ShieldAlert, color: 'text-warning-high bg-warning-high/10' },
                  { label: '今日新增', value: `+${schoolStats.todayNew}`, suffix: '条', icon: Calendar, color: 'text-warning-low bg-warning-low/15' },
                  { label: '处置率', value: schoolStats.resolutionRate.toFixed(1), suffix: '%', icon: CheckCircle2, color: 'text-mint-600 bg-mint-50' },
                  { label: '平均响应', value: schoolStats.avgResponseHours.toFixed(1), suffix: 'h', icon: Clock, color: 'text-risk-low bg-risk-low/15' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-ink-100 hover:shadow-sm transition-all duration-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', item.color)}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] text-ink-500 whitespace-nowrap">{item.label}</span>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-bold text-ink-900">{item.value}</span>
                      <span className="text-xs text-ink-400">{item.suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-2xl bg-ink-100/60 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  selected ? 'bg-white text-primary-600 shadow-sm' : 'text-ink-500 hover:text-ink-700 hover:bg-white/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatCard title="本月新增预警" value={Math.floor(warnings.length * 0.3).toString()} suffix="条" color="danger" icon={<ShieldAlert className="h-6 w-6" />} trendValue="-15%" trendType="down" description="较上月" />
              <StatCard title="本月已处置" value={Math.floor(warnings.length * 0.3 * 0.85).toString()} suffix="条" color="mint" icon={<CheckCircle2 className="h-6 w-6" />} trendValue="+12%" trendType="up" description="较上月" />
              <StatCard title="重点关注学生" value={students.filter(s => s.riskLevel === 'high').length.toString()} suffix="人" color="warning" icon={<Star className="h-6 w-6" />} trendValue="+3" trendType="up" description="较上周" />
              <StatCard title="平均处置时长" value={schoolStats.avgResponseHours.toFixed(1)} suffix="小时" color="primary" icon={<Clock className="h-6 w-6" />} trendValue="-0.8h" trendType="down" description="较上月" />
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-primary-500" />
                  学院风险分布热力矩阵
                </CardTitle>
                <CardDescription>近14天各学院每日风险等级分布，颜色越深风险越高</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts option={heatmapOption} style={{ height: 380 }} notMerge lazyUpdate />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'emotion' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-base">
                    <Activity className="h-5 w-5 text-primary-500" />
                    各学院近14天情绪趋势
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {emotionTrendData.collegeData.map((e) => {
                      const selected = selectedColleges.length === 0 || selectedColleges.includes(e.name);
                      return (
                        <button
                          key={e.name}
                          onClick={() => {
                            setSelectedColleges((prev) =>
                              prev.includes(e.name)
                                ? prev.length === 1 ? [] : prev.filter((n) => n !== e.name)
                                : [...prev, e.name]
                            );
                          }}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                            selected ? 'bg-primary-500 text-white shadow-sm' : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                          )}
                        >
                          {e.name.replace('学院', '')}
                        </button>
                      );
                    })}
                  </div>
                </CardTitle>
                <CardDescription>可点击学院名称筛选显示</CardDescription>
              </CardHeader>
              <CardContent>
                <ReactECharts
                  option={{
                    ...emotionTrendOption,
                    series: (emotionTrendOption.series as any).filter((s: any) => selectedColleges.length === 0 || selectedColleges.includes(s.name)),
                    legend: { ...emotionTrendOption.legend, data: (emotionTrendOption.legend as any).data.filter((n: string) => selectedColleges.length === 0 || selectedColleges.includes(n)) },
                  }}
                  style={{ height: 320 }}
                  notMerge
                  lazyUpdate
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5 text-mint-600" />
                    情绪指数分布直方图
                  </CardTitle>
                  <CardDescription>全校学生当前情绪指数区间分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={emotionDistOption} style={{ height: 280 }} notMerge lazyUpdate />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingDown className="h-5 w-5 text-warning-high" />
                    异常波动TOP10
                  </CardTitle>
                  <CardDescription>近期情绪指数下降幅度最大的学生</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[320px] overflow-y-auto">
                  <div className="space-y-2">
                    {topAbnormalStudents.map((stu, idx) => (
                      <button
                        key={stu.id}
                        onClick={() => handleStudentClick(stu.id)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50/80 transition-all duration-200 group text-left"
                      >
                        <span className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0',
                          idx === 0 ? 'bg-warning-high text-white' : idx === 1 ? 'bg-warning-low text-white' : idx === 2 ? 'bg-risk-medium text-white' : 'bg-ink-200 text-ink-600'
                        )}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-ink-800 group-hover:text-primary-600 transition-colors">{stu.name}</span>
                            <span className="text-[10px] text-ink-400 font-mono">{stu.id}</span>
                          </div>
                          <p className="text-xs text-ink-500 truncate">{stu.college} · {stu.grade}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-warning-high flex items-center gap-0.5 justify-end">
                            <TrendingDown className="h-3 w-3" />
                            {stu.fluctuation}
                          </p>
                          <p className="text-[10px] text-ink-400">当前 {stu.currentScore}</p>
                        </div>
                        <div className="p-1.5 rounded-lg text-ink-400 group-hover:text-primary-500 group-hover:bg-primary-50 transition-all">
                          <Eye className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BrainCircuit className="h-5 w-5 text-primary-500" />
                    5维度雷达图对比
                  </CardTitle>
                  <CardDescription>本校平均 vs 全国高校总体水平</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={assessmentRadarOption} style={{ height: 340 }} notMerge lazyUpdate />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5 text-mint-600" />
                    各维度等级分布
                  </CardTitle>
                  <CardDescription>正常/轻度/中度/重度人数堆叠分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={assessmentStackOption} style={{ height: 340 }} notMerge lazyUpdate />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-warning-low" />
                  测评完成率统计
                </CardTitle>
                <CardDescription>近期各项心理测评的参与完成情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completionRates.map((cr, idx) => {
                    const rate = Math.round((cr.completed / cr.total) * 100);
                    return (
                      <div key={idx} className="p-4 rounded-xl bg-ink-50/60 hover:bg-ink-50 transition-colors">
                        <div className="flex items-center justify-between mb-2.5">
                          <div>
                            <p className="text-sm font-semibold text-ink-800">{cr.name}</p>
                            <p className="text-xs text-ink-400 mt-0.5">测评时间：{cr.date}</p>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold bg-gradient-to-br from-primary-500 to-mint-500 bg-clip-text text-transparent">{rate}</span>
                            <span className="text-sm text-ink-400">%</span>
                          </div>
                        </div>
                        <div className="h-2.5 rounded-full bg-white overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-1000',
                              rate >= 90 ? 'bg-gradient-to-r from-mint-400 to-mint-500' : rate >= 75 ? 'bg-gradient-to-r from-primary-400 to-primary-500' : 'bg-gradient-to-r from-warning-low to-risk-medium'
                            )}
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="text-ink-500">
                            已完成 <span className="font-semibold text-ink-700">{cr.completed.toLocaleString()}</span> / {cr.total.toLocaleString()} 人
                          </span>
                          <span className={cn(
                            'px-2 py-0.5 rounded-md font-medium',
                            rate >= 90 ? 'bg-mint-50 text-mint-700' : rate >= 75 ? 'bg-primary-50 text-primary-700' : 'bg-warning-low/10 text-warning-low'
                          )}>
                            {rate >= 90 ? '完成度优秀' : rate >= 75 ? '完成度良好' : '需提升参与度'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'crisis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-5 w-5 text-warning-low" />
                    危机事件时间线
                  </CardTitle>
                  <CardDescription>近期危机处理流程全记录</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[520px] overflow-y-auto pr-2">
                  <div className="relative pl-6 space-y-5">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-200 via-mint-200 to-ink-100" />
                    {crisisTimeline.map((evt, idx) => {
                      const iconMap: Record<string, any> = { warning: ShieldAlert, approve: CheckCircle2, intervene: HeartHandshake, resolve: CheckCircle2, followup: Clock };
                      const colorMap: Record<string, string> = { warning: 'bg-warning-high', approve: 'bg-primary-500', intervene: 'bg-warning-low', resolve: 'bg-mint-500', followup: 'bg-risk-low' };
                      const Icon = iconMap[evt.type] || AlertCircle;
                      return (
                        <div key={idx} className="relative animate-slide-in" style={{ animationDelay: `${idx * 0.04}s` }}>
                          <div className={cn('absolute -left-[30px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-md', colorMap[evt.type])}>
                            <Icon className="h-3 w-3 text-white" />
                          </div>
                          <div className="p-3.5 rounded-xl bg-ink-50/80 border border-ink-100 hover:shadow-sm hover:border-ink-200 transition-all duration-200">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-ink-800">{evt.title}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white text-ink-600 border border-ink-200">×{evt.count}</span>
                                <span className="text-[10px] text-ink-400">
                                  {new Date(evt.time).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-ink-500">{evt.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-5 w-5 text-primary-500" />
                      事件分类统计
                    </CardTitle>
                    <CardDescription>各类危机事件占比分布</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={crisisPieOption} style={{ height: 260 }} notMerge lazyUpdate />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-5 w-5 text-mint-600" />
                      处置时长箱线图
                    </CardTitle>
                    <CardDescription>不同类型事件的处置时间分布(小时)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactECharts option={disposalBoxOption} style={{ height: 240 }} notMerge lazyUpdate />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 lg:p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(1); }}
                      placeholder="搜索学生姓名、学号、学院..."
                      className="input-base pl-10"
                    />
                  </div>
                  <div className="relative min-w-[160px]">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <select
                      value={studentCollege}
                      onChange={(e) => { setStudentCollege(e.target.value); setStudentPage(1); }}
                      className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                    >
                      <option value="">全部学院</option>
                      {colleges.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                  <div className="relative min-w-[130px]">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <select
                      value={studentGrade}
                      onChange={(e) => { setStudentGrade(e.target.value); setStudentPage(1); }}
                      className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                    >
                      <option value="">全部年级</option>
                      {['大一', '大二', '大三', '大四', '研一', '研二', '研三'].map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                  <div className="relative min-w-[140px]">
                    <ShieldAlert className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                    <select
                      value={studentRisk}
                      onChange={(e) => { setStudentRisk(e.target.value); setStudentPage(1); }}
                      className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                    >
                      <option value="">全部风险</option>
                      <option value="safe">安全</option>
                      <option value="low">低风险</option>
                      <option value="medium">中风险</option>
                      <option value="high">高风险</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50/80 border-b border-ink-100">
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学生信息</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学院/专业</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">年级班级</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">风险等级</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">最近测评</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">测评日期</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">辅导员</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((stu, idx) => {
                      const lastAssessment = stu.assessmentHistory[0];
                      const lastScore = lastAssessment?.overallScore ?? 75;
                      const lastDate = lastAssessment?.assessmentDate ?? '2026-04-15';
                      return (
                        <tr
                          key={stu.id}
                          onClick={() => handleStudentClick(stu.id)}
                          className="border-b border-ink-50 hover:bg-primary-50/30 transition-colors group cursor-pointer"
                          style={{ animationDelay: `${idx * 0.03}s` }}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-200 to-primary-400 shrink-0">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink-800">{stu.name}</p>
                                <p className="text-xs font-mono text-ink-400">{stu.studentNo}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-ink-700">{stu.college}</p>
                            <p className="text-xs text-ink-400">{stu.major}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="text-sm text-ink-700">{stu.grade}</p>
                            <p className="text-xs text-ink-400">{stu.className}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              size="sm"
                              withDot
                              color={getRiskBadgeColor(stu.riskLevel)}
                            >
                              {getRiskText(stu.riskLevel)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                'font-bold text-sm',
                                lastScore < 50 ? 'text-warning-high' : lastScore < 65 ? 'text-warning-low' : lastScore < 80 ? 'text-risk-low' : 'text-mint-600'
                              )}>
                                {lastScore}
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    lastScore < 50 ? 'bg-warning-high' : lastScore < 65 ? 'bg-warning-low' : lastScore < 80 ? 'bg-risk-low' : 'bg-mint-500'
                                  )}
                                  style={{ width: `${lastScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-ink-500 whitespace-nowrap">{lastDate}</td>
                          <td className="px-4 py-3.5 text-sm text-ink-600">{stu.counselor}</td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStudentClick(stu.id);
                              }}
                              className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {pageStudents.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-16 text-center text-ink-400">
                          <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                          <p>暂无符合条件的学生</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6 py-4 border-t border-ink-100 bg-ink-50/50">
                  <div className="text-sm text-ink-500">
                    共 <span className="font-semibold text-ink-700">{filteredStudents.length}</span> 名学生，
                    当前第 <span className="font-semibold text-ink-700">{studentPage}</span> / {studentTotalPages} 页
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setStudentPage(Math.max(1, studentPage - 1))}
                      disabled={studentPage === 1}
                      className={cn(
                        'p-2 rounded-lg border border-ink-200 bg-white transition-all duration-200',
                        studentPage === 1 ? 'text-ink-300 cursor-not-allowed' : 'text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                      )}
                    >
                      <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                    {Array.from({ length: Math.min(5, studentTotalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(studentPage - 2, studentTotalPages - 4));
                      const pageNum = start + i;
                      if (pageNum > studentTotalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setStudentPage(pageNum)}
                          className={cn(
                            'min-w-[38px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                            studentPage === pageNum ? 'bg-gradient-primary text-white shadow-md' : 'bg-white border border-ink-200 text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setStudentPage(Math.min(studentTotalPages, studentPage + 1))}
                      disabled={studentPage === studentTotalPages}
                      className={cn(
                        'p-2 rounded-lg border border-ink-200 bg-white transition-all duration-200',
                        studentPage === studentTotalPages ? 'text-ink-300 cursor-not-allowed' : 'text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                      )}
                    >
                      <ChevronDown className="h-4 w-4 rotate-90" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
