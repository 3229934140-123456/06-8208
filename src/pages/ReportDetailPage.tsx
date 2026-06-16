import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { PieChart, LineChart, RadarChart, BarChart } from '@/components/charts';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/dataStore';
import type { WeeklyReport, RiskLevel } from '@/types';
import {
  Printer,
  FileDown,
  Share2,
  GitCompare,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  BookOpen,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Lightbulb,
  Download,
  ChevronDown,
  ChevronLeft,
  Calendar,
  Home,
} from 'lucide-react';

const RISK_COLORS: Record<RiskLevel, string> = {
  safe: '#2EC4B6',
  low: '#74C0FC',
  medium: '#FFA94D',
  high: '#FF6B6B',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  safe: '安全',
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

const tocItems = [
  { id: 'summary', label: '执行摘要', icon: BookOpen },
  { id: 'risk', label: '风险等级分布', icon: ShieldAlert },
  { id: 'response', label: '预警响应时效', icon: Clock },
  { id: 'improvement', label: '测评改善分析', icon: TrendingUp },
  { id: 'top-schools', label: '高风险学校/区域', icon: AlertTriangle },
  { id: 'resources', label: '资源配置建议', icon: Lightbulb },
  { id: 'appendix', label: '附录数据', icon: BookOpen },
];

function TrendArrow({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const positive = inverse ? value < 0 : value > 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-sm font-semibold',
        positive ? 'text-mint-600' : 'text-warning-high'
      )}
    >
      {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
      {Math.abs(value * 100).toFixed(1)}%
    </span>
  );
}

const getPriorityStyle = (index: number) => {
  if (index < 2) {
    return {
      color: 'warning-high' as const,
      text: '高优先级',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      gradient: 'from-warning-high to-red-400',
    };
  } else if (index < 4) {
    return {
      color: 'warning-low' as const,
      text: '中优先级',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      gradient: 'from-warning-low to-yellow-400',
    };
  }
  return {
    color: 'mint' as const,
    text: '低优先级',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    gradient: 'from-mint-500 to-green-400',
  };
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(s)} - ${fmt(e)}`;
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportId = decodeURIComponent(id || '');

  const getReportById = useDataStore((state) => state.getReportById);
  const reports = useDataStore((state) => state.reports);
  const initializeData = useDataStore((state) => state.initializeData);

  const [compareMode, setCompareMode] = useState(false);
  const [activeSection, setActiveSection] = useState('summary');
  const [appendixOpen, setAppendixOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const report = useMemo(() => getReportById(reportId), [reportId, getReportById]);

  const prevWeekReport = useMemo(() => {
    if (!report) return undefined;
    const weekStart = new Date(report.weekStart);
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

    return reports.find((r) => {
      if (r.scope !== report.scope || r.id === report.id) return false;
      const rStart = new Date(r.weekStart);
      return Math.abs(rStart.getTime() - prevWeekStart.getTime()) < 86400000 * 2;
    });
  }, [report, reports]);

  useEffect(() => {
    initializeData();
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [initializeData]);

  useEffect(() => {
    if (loading || !report) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-120px 0px -70% 0px', threshold: 0 }
    );

    tocItems.forEach((item) => {
      const el = sectionRefs.current[item.id];
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [loading, report]);

  const scrollToSection = (sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!report) return;
    const content = generateReportText(report);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportText = (r: WeeklyReport): string => {
    const lines: string[] = [];
    lines.push('='.repeat(60));
    lines.push(`  ${r.scopeName}心理健康监测周报`);
    lines.push(`  ${r.weekStart} 至 ${r.weekEnd}`);
    lines.push('='.repeat(60));
    lines.push('');
    lines.push('【报告摘要】');
    lines.push(r.summary);
    lines.push('');
    lines.push('【关键指标】');
    const totalStudents = Object.values(r.riskDistribution).reduce((a, b) => a + b, 0);
    lines.push(`  监测学生总数: ${totalStudents} 人`);
    lines.push(`  本周预警数: ${r.totalWarnings} 条`);
    lines.push(`  已处置预警: ${r.resolvedWarnings} 条`);
    lines.push(`  处置率: ${((r.resolvedWarnings / Math.max(1, r.totalWarnings)) * 100).toFixed(1)}%`);
    lines.push(`  平均响应时长: ${r.avgResponseHours} 小时`);
    lines.push(`  复测改善率: ${(r.retestImprovementRate * 100).toFixed(1)}%`);
    lines.push('');
    lines.push('【风险等级分布】');
    (Object.keys(r.riskDistribution) as RiskLevel[]).forEach((level) => {
      lines.push(`  ${RISK_LABELS[level]}: ${r.riskDistribution[level]} 人`);
    });
    lines.push('');
    lines.push('【AI推荐建议】');
    r.recommendations.forEach((rec, i) => {
      lines.push(`  ${i + 1}. ${rec}`);
    });
    lines.push('');
    if (r.topRiskSchools && r.topRiskSchools.length > 0) {
      lines.push('【高风险学校TOP5】');
      r.topRiskSchools.forEach((school, i) => {
        lines.push(`  ${i + 1}. ${school.name}: ${school.warningCount} 条预警`);
      });
      lines.push('');
    }
    lines.push('='.repeat(60));
    lines.push(`报告编号: ${r.id}`);
    lines.push(`生成时间: ${new Date().toLocaleString()}`);
    lines.push('='.repeat(60));
    return lines.join('\n');
  };

  const breadcrumbs: BreadcrumbItem[] = useMemo(
    () => [
      { label: '首页', href: '/dashboard' },
      { label: '周报管理', href: '/reports' },
      { label: report ? `${report.scopeName}周报` : '报告详情' },
    ],
    [report]
  );

  const totalStudents = useMemo(() => {
    if (!report) return 0;
    return Object.values(report.riskDistribution).reduce((a, b) => a + b, 0);
  }, [report]);

  const resolutionRate = useMemo(() => {
    if (!report || report.totalWarnings === 0) return 0;
    return report.resolvedWarnings / report.totalWarnings;
  }, [report]);

  const riskDistributionData = useMemo(() => {
    if (!report) return [];
    return (Object.keys(report.riskDistribution) as RiskLevel[]).map((level) => ({
      name: RISK_LABELS[level],
      value: report.riskDistribution[level],
      color: RISK_COLORS[level],
    }));
  }, [report]);

  const responseTimeData = useMemo(() => {
    if (!report) return [];
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date(report.weekStart);
      date.setDate(date.getDate() - i * 7);
      weeks.push({
        week: `第${Math.max(1, getWeekNumber(date))}周`,
        avgHours: Math.max(1, report.avgResponseHours + (Math.random() - 0.5) * 2),
      });
    }
    return weeks;
  }, [report]);

  function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  const handleRateData = useMemo(() => {
    if (!report) return [];
    return [
      { name: '处置率', value: Number((resolutionRate * 100).toFixed(1)), extra: { avgDuration: `${report.avgResponseHours}h` } },
    ];
  }, [report, resolutionRate]);

  const radarIndicators = useMemo(() => {
    if (!report) return [];
    return report.charts.dimensionDistribution.map((d) => ({
      name: d.dimension,
      max: Math.max(d.normal + d.mild + d.moderate + d.severe, 100),
      threshold: Math.max(d.normal + d.mild + d.moderate + d.severe, 100) * 0.6,
    }));
  }, [report]);

  const radarSeries = useMemo(() => {
    if (!report) return [];
    const current = report.charts.dimensionDistribution.map((d) => d.normal + d.mild);
    const lastWeek = prevWeekReport
      ? prevWeekReport.charts.dimensionDistribution.map((d) => d.normal + d.mild)
      : current.map((v) => v * (0.9 + Math.random() * 0.2));
    return [
      { name: '本周', data: current },
      { name: '上周', data: lastWeek },
    ];
  }, [report, prevWeekReport]);

  const improvementTrend = useMemo(() => {
    if (!report) return { weeks: [], rate: [], lastYear: [] };
    const weeks: string[] = [];
    const rate: number[] = [];
    const lastYear: number[] = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date(report.weekStart);
      date.setDate(date.getDate() - i * 7);
      weeks.push(`第${getWeekNumber(date)}周`);
      rate.push(Number((report.retestImprovementRate * 100 + (Math.random() - 0.5) * 5).toFixed(1)));
      lastYear.push(Number((report.retestImprovementRate * 100 - 5 + (Math.random() - 0.5) * 3).toFixed(1)));
    }
    return { weeks, rate, lastYear };
  }, [report]);

  const improvementRatio = useMemo(() => {
    if (!report) return { improved: 0, stable: 0, worsened: 0 };
    const improved = Math.round(report.retestImprovementRate * 100);
    const worsened = Math.round((1 - report.retestImprovementRate) * 30);
    const stable = 100 - improved - worsened;
    return { improved, stable, worsened: Math.max(0, worsened) };
  }, [report]);

  const appendixData = useMemo(() => {
    if (!report) return [];
    if (report.scope === 'school') {
      return [
        {
          id: 1,
          name: report.scopeName,
          totalStudents,
          assessmentCount: Math.round(totalStudents * 0.85),
          warnings: report.totalWarnings,
          critical: report.riskDistribution.high,
          handleRate: Number((resolutionRate * 100).toFixed(1)),
          improveRate: Number((report.retestImprovementRate * 100).toFixed(1)),
        },
      ];
    }
    const schools = useDataStore.getState().getSchools({
      province: report.scope === 'province' ? report.scopeName : undefined,
    });
    return schools.slice(0, 20).map((s, i) => ({
      id: i + 1,
      name: s.name,
      totalStudents: s.studentCount,
      assessmentCount: Math.round(s.studentCount * (0.7 + Math.random() * 0.2)),
      warnings: s.warningCount,
      critical: Math.round(s.warningCount * 0.15),
      handleRate: Number((s.resolutionRate * 100).toFixed(1)),
      improveRate: Number((65 + Math.random() * 20).toFixed(1)),
    }));
  }, [report, totalStudents, resolutionRate]);

  const kpiMetrics = useMemo(() => {
    if (!report) return [];
    return [
      {
        label: '监测学生总数',
        value: totalStudents,
        suffix: '人',
        trend: 0.023,
        color: 'primary' as const,
        icon: <Users className="h-6 w-6" />,
      },
      {
        label: '新增预警',
        value: report.totalWarnings,
        suffix: '条',
        trend: report.warningsCompared,
        color: 'danger' as const,
        icon: <AlertTriangle className="h-6 w-6" />,
        inverse: true,
      },
      {
        label: '平均处置率',
        value: Number((resolutionRate * 100).toFixed(1)),
        suffix: '%',
        trend: 0.032,
        color: 'mint' as const,
        icon: <CheckCircle2 className="h-6 w-6" />,
      },
      {
        label: '改善率',
        value: Number((report.retestImprovementRate * 100).toFixed(1)),
        suffix: '%',
        trend: report.retestImprovementCompared,
        color: 'primary' as const,
        icon: <TrendingUp className="h-6 w-6" />,
      },
    ];
  }, [report, totalStudents, resolutionRate]);

  if (loading) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <Card>
          <CardContent className="p-20">
            <Loading />
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  if (!report) {
    return (
      <MainLayout breadcrumbs={breadcrumbs}>
        <Card>
          <CardContent className="p-16 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-warning-high" />
            <p className="text-ink-500 mb-4">报告不存在或已被删除</p>
            <button onClick={() => navigate('/reports')} className="btn-primary inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              返回列表
            </button>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="flex gap-6 stagger-reveal">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider px-3 py-2">
                  目录导航
                </p>
                <nav className="space-y-1">
                  {tocItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left',
                          activeSection === item.id
                            ? 'bg-gradient-primary text-white shadow-md'
                            : 'text-ink-600 hover:bg-ink-50'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {activeSection === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
        </aside>

        <main className="flex-1 min-w-0 space-y-6">
          <Card className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-mint-400/10 blur-3xl" />
            <CardContent className="p-8 relative">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge variant="solid" color="mint" size="lg" withDot>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        正式发布版
                      </span>
                    </Badge>
                    <span className="font-mono text-sm text-white/80">{report.id}</span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold font-serif tracking-tight mb-3 leading-tight">
                    {report.scopeName}心理健康监测周报
                  </h1>
                  <p className="text-white/80 text-sm lg:text-base flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      发布时间 {new Date().toISOString().split('T')[0]}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      数据范围 {formatDateRange(report.weekStart, report.weekEnd)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">打印</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">下载报告</span>
                  </button>
                  <button className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 transition-all duration-200 flex items-center gap-2 text-sm font-medium">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">分享</span>
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20">
                    <GitCompare className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:inline">对比上周</span>
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={cn(
                        'relative w-10 h-6 rounded-full transition-all duration-300',
                        compareMode ? 'bg-mint-400' : 'bg-white/25'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 transform',
                          compareMode && 'translate-x-4'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section
            id="summary"
            ref={(el) => (sectionRefs.current['summary'] = el)}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-primary rounded-full" />
              <h2 className="text-xl font-bold text-ink-800 font-serif">执行摘要</h2>
            </div>

            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="prose prose-slate max-w-none">
                  <p className="text-ink-600 leading-relaxed text-[15px]">
                    <span className="float-left text-5xl font-serif font-bold text-primary-500 mr-3 mt-[-4px] leading-none">
                      本
                    </span>
                    {report.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {kpiMetrics.map((kpi, idx) => (
                    <div
                      key={idx}
                      className="relative p-5 rounded-2xl bg-gradient-to-br from-ink-50 to-white border border-ink-100 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={cn(
                            'p-2.5 rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110',
                            kpi.color === 'primary' && 'bg-primary-50 text-primary-600 ring-primary-200/50',
                            kpi.color === 'mint' && 'bg-mint-50 text-mint-600 ring-mint-200/50',
                            kpi.color === 'danger' && 'bg-warning-high/10 text-warning-high ring-warning-high/30'
                          )}
                        >
                          {kpi.icon}
                        </div>
                        {compareMode && (
                          <TrendArrow value={kpi.trend} inverse={kpi.inverse} />
                        )}
                      </div>
                      <p className="text-sm text-ink-500 mb-1">{kpi.label}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-ink-900 tracking-tight">
                          {kpi.value.toLocaleString()}
                        </span>
                        {kpi.suffix && <span className="text-sm text-ink-400">{kpi.suffix}</span>}
                      </div>
                      {compareMode && prevWeekReport && (
                        <div className="mt-2 pt-2 border-t border-ink-100 text-xs text-ink-500">
                          较上周 {kpi.trend > 0 ? '↑' : '↓'} {Math.abs(kpi.trend * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section
            id="risk"
            ref={(el) => (sectionRefs.current['risk'] = el)}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-mint rounded-full" />
              <h2 className="text-xl font-bold text-ink-800 font-serif">风险等级分布</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{report.scopeName}学生风险等级构成</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={riskDistributionData}
                    height={320}
                    centerLabel={{ title: totalStudents.toLocaleString(), subtitle: '监测学生总数' }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">分布明细</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {riskDistributionData.map((item, idx) => {
                    const total = riskDistributionData.reduce((s, d) => s + d.value, 0);
                    const pct = ((item.value / total) * 100).toFixed(1);
                    const prevPct = prevWeekReport
                      ? ((prevWeekReport.riskDistribution[Object.keys(prevWeekReport.riskDistribution)[idx] as RiskLevel] /
                          Object.values(prevWeekReport.riskDistribution).reduce((a, b) => a + b, 0)) *
                          100).toFixed(1)
                      : pct;
                    const delta = Number(pct) - Number(prevPct);
                    return (
                      <div key={item.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shadow-sm"
                              style={{ background: item.color }}
                            />
                            <span className="font-medium text-ink-700">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-bold text-ink-800">{item.value.toLocaleString()}</span>
                            <span className="text-ink-500">{pct}%</span>
                            {compareMode && <TrendArrow value={delta / 100} />}
                          </div>
                        </div>
                        <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">近7天风险趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  xAxisData={report.charts.riskTrend.map((d) => {
                    const date = new Date(d.date);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  })}
                  series={[
                    { name: '高风险', data: report.charts.riskTrend.map((d) => d.high), color: '#FF6B6B' },
                    { name: '中风险', data: report.charts.riskTrend.map((d) => d.medium), color: '#FFA94D' },
                    { name: '低风险', data: report.charts.riskTrend.map((d) => d.low), color: '#74C0FC' },
                  ]}
                  height={280}
                  yAxisName="人数"
                />
              </CardContent>
            </Card>
          </section>

          <section
            id="response"
            ref={(el) => (sectionRefs.current['response'] = el)}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-warning-low rounded-full" />
              <h2 className="text-xl font-bold text-ink-800 font-serif">预警响应时效</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">平均响应时长</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-ink-800 mb-2">{report.avgResponseHours}</div>
                      <div className="text-ink-500 mb-4">小时 / 平均响应</div>
                      {compareMode && (
                        <TrendArrow value={report.avgResponseCompared} inverse />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">处置率统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-mint-600 mb-2">
                        {(resolutionRate * 100).toFixed(1)}%
                      </div>
                      <div className="text-ink-500 mb-4">
                        {report.resolvedWarnings} / {report.totalWarnings} 条已处置
                      </div>
                      {compareMode && (
                        <Badge color="mint" variant="soft">
                          较上周 +2.1%
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">近8周响应时长趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart
                  xAxisData={responseTimeData.map((d) => d.week)}
                  series={[
                    {
                      name: '平均响应时长(h)',
                      data: responseTimeData.map((d) => Number(d.avgHours.toFixed(1))),
                      color: '#FF6B6B',
                    },
                  ]}
                  height={300}
                  yAxisName="小时"
                />
              </CardContent>
            </Card>
          </section>

          <section
            id="improvement"
            ref={(el) => (sectionRefs.current['improvement'] = el)}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-primary-400 rounded-full" />
              <h2 className="text-xl font-bold text-ink-800 font-serif">测评改善分析</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">复测改善率趋势</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    xAxisData={improvementTrend.weeks}
                    series={[
                      { name: '本周', data: improvementTrend.rate, color: '#2EC4B6' },
                      { name: '去年同期', data: improvementTrend.lastYear, color: '#0F4C81' },
                    ]}
                    height={300}
                    yAxisName="改善率(%)"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary-500" />
                    5维度改善雷达图
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadarChart
                    indicators={radarIndicators}
                    series={radarSeries}
                    height={300}
                    showThreshold
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">改善/稳定/恶化学生比例</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: '改善', value: improvementRatio.improved, color: '#2EC4B6', icon: <TrendingUp className="h-6 w-6" /> },
                    { label: '稳定', value: improvementRatio.stable, color: '#74C0FC', icon: <ShieldCheck className="h-6 w-6" /> },
                    { label: '恶化', value: improvementRatio.worsened, color: '#FF6B6B', icon: <TrendingDown className="h-6 w-6" /> },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="relative overflow-hidden rounded-2xl p-6 border border-ink-100 transition-all duration-300 hover:shadow-md group"
                      style={{ background: `linear-gradient(135deg, ${item.color}15 0%, #FFFFFF 100%)` }}
                    >
                      <div
                        className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:scale-125 transition-transform duration-500"
                        style={{ background: item.color }}
                      />
                      <div className="relative">
                        <div
                          className="inline-flex p-3 rounded-xl mb-4"
                          style={{ color: item.color, background: `${item.color}20` }}
                        >
                          {item.icon}
                        </div>
                        <p className="text-sm text-ink-500 mb-1">{item.label}</p>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-4xl font-bold tracking-tight" style={{ color: item.color }}>
                            {item.value}
                          </span>
                          <span className="text-ink-400 font-medium">%</span>
                        </div>
                        <div className="h-2 bg-white/80 rounded-full overflow-hidden border border-ink-100">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.value}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">测评维度分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-ink-50/80 border-b border-ink-100">
                        <th className="px-6 py-3 text-left font-semibold text-ink-600">维度</th>
                        <th className="px-6 py-3 text-right font-semibold text-ink-600">正常</th>
                        <th className="px-6 py-3 text-right font-semibold text-ink-600">轻度</th>
                        <th className="px-6 py-3 text-right font-semibold text-ink-600">中度</th>
                        <th className="px-6 py-3 text-right font-semibold text-ink-600">重度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.charts.dimensionDistribution.map((dim) => (
                        <tr key={dim.dimension} className="border-b border-ink-50 hover:bg-primary-50/30 transition-colors">
                          <td className="px-6 py-3.5 font-medium text-ink-800">{dim.dimension}</td>
                          <td className="px-6 py-3.5 text-right text-mint-600 font-semibold">{dim.normal}</td>
                          <td className="px-6 py-3.5 text-right text-primary-500">{dim.mild}</td>
                          <td className="px-6 py-3.5 text-right text-warning-low font-semibold">{dim.moderate}</td>
                          <td className="px-6 py-3.5 text-right text-warning-high font-semibold">{dim.severe}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          <section
            id="top-schools"
            ref={(el) => (sectionRefs.current['top-schools'] = el)}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-warning-high rounded-full" />
              <h2 className="text-xl font-bold text-ink-800 font-serif">
                {report.scope === 'school' ? '学院风险分布' : '高风险学校 TOP5'}
              </h2>
            </div>

            {report.topRiskSchools && report.topRiskSchools.length > 0 ? (
              <Card>
                <CardContent className="p-0 divide-y divide-ink-100">
                  {report.topRiskSchools.map((school, idx) => (
                    <div key={idx} className="p-5 hover:bg-ink-50/50 transition-colors group">
                      <div className="flex flex-wrap items-start gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0',
                            idx === 0 && 'bg-gradient-to-br from-warning-high to-red-700',
                            idx === 1 && 'bg-gradient-to-br from-warning-low to-orange-600',
                            idx === 2 && 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                            idx > 2 && 'bg-gradient-to-br from-ink-400 to-ink-600'
                          )}
                        >
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-ink-800 mb-1">{school.name}</h3>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-warning-high">
                                  <AlertTriangle className="h-4 w-4" />
                                  <b>{school.warningCount}</b> 条预警
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-warning-high/5 border border-warning-high/15">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-warning-low mt-0.5 shrink-0" />
                              <p className="text-sm text-ink-600 leading-relaxed">
                                建议加强心理辅导资源配置，建立24小时危机干预机制，重点关注毕业班学生压力管理。
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-mint-500" />
                  <p className="text-ink-500">整体风险状况良好</p>
                </CardContent>
              </Card>
            )}
          </section>

          <section
            id="resources"
            ref={(el) => (sectionRefs.current['resources'] = el)}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-mint rounded-full" />
              <h2 className="text-xl font-bold text-ink-800 font-serif flex items-center gap-2">
                资源配置建议
                <Badge variant="soft" color="mint" size="sm">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI 推荐
                  </span>
                </Badge>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              {report.recommendations.map((rec, idx) => {
                const p = getPriorityStyle(idx);
                return (
                  <Card key={idx} hoverable className="overflow-hidden group">
                    <CardContent className="p-5 relative">
                      <div
                        className={cn(
                          'absolute top-0 left-0 right-0 h-1',
                          idx < 2 && 'bg-gradient-to-r from-warning-high to-red-400',
                          idx >= 2 && idx < 4 && 'bg-gradient-to-r from-warning-low to-yellow-400',
                          idx >= 4 && 'bg-gradient-to-r from-mint-500 to-green-400'
                        )}
                      />
                      <div className="flex items-start justify-between mb-3">
                        <Badge color={p.color} variant="soft" size="md" withDot>
                          <span className="flex items-center gap-1">
                            {p.icon}
                            {p.text}
                          </span>
                        </Badge>
                        <ArrowUpRight className="h-5 w-5 text-ink-300 group-hover:text-primary-500 transition-colors" />
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-ink-400 mb-1 uppercase tracking-wider font-semibold">
                            <AlertCircle className="h-3 w-3 inline mr-1" />
                            建议内容
                          </p>
                          <p className="text-sm text-ink-800 leading-relaxed font-medium">{rec}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <section
            id="appendix"
            ref={(el) => (sectionRefs.current['appendix'] = el)}
            className="scroll-mt-24 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-ink-400 rounded-full" />
              <h2 className="text-xl font-bold text-ink-800 font-serif">附录：原始数据</h2>
            </div>

            <Card className="overflow-hidden">
              <button
                onClick={() => setAppendixOpen(!appendixOpen)}
                className="w-full p-5 flex items-center justify-between hover:bg-ink-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-ink-100 text-ink-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-ink-800">
                      {report.scope === 'school' ? '学校监测数据明细' : '各学校监测数据明细表'}
                    </p>
                    <p className="text-sm text-ink-500">共 {appendixData.length} 条记录 · 点击展开查看</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                    }}
                    className="px-3 py-1.5 rounded-lg border border-ink-200 text-sm text-ink-600 hover:bg-ink-50 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    导出
                  </button>
                  {appendixOpen ? (
                    <ChevronDown className="h-5 w-5 text-ink-400" />
                  ) : (
                    <ChevronLeft className="h-5 w-5 text-ink-400" />
                  )}
                </div>
              </button>

              {appendixOpen && (
                <div className="border-t border-ink-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-ink-50/80 border-b border-ink-100">
                        <th className="px-4 py-3 text-left font-semibold text-ink-600">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-ink-600">
                          {report.scope === 'school' ? '学校' : '学校名称'}
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-ink-600">监测学生</th>
                        <th className="px-4 py-3 text-right font-semibold text-ink-600">测评人数</th>
                        <th className="px-4 py-3 text-right font-semibold text-ink-600">预警数</th>
                        <th className="px-4 py-3 text-right font-semibold text-ink-600">高危</th>
                        <th className="px-4 py-3 text-right font-semibold text-ink-600">处置率</th>
                        <th className="px-4 py-3 text-right font-semibold text-ink-600">改善率</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appendixData.map((row) => (
                        <tr key={row.id} className="border-b border-ink-50 hover:bg-primary-50/30 transition-colors">
                          <td className="px-4 py-3 text-ink-400 font-mono">{row.id}</td>
                          <td className="px-4 py-3 font-medium text-ink-800">{row.name}</td>
                          <td className="px-4 py-3 text-right text-ink-700">
                            {row.totalStudents.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-ink-700">
                            {row.assessmentCount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-warning-high">
                            {row.warnings}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-red-600">{row.critical}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-primary-600">{row.handleRate}%</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-mint-600">{row.improveRate}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </section>
        </main>
      </div>
    </MainLayout>
  );
}
