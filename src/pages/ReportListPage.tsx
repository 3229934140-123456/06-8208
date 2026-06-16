import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { PieChart, LineChart } from '@/components/charts';
import { cn } from '@/lib/utils';
import { useDataStore } from '@/store/dataStore';
import { useAuthStore } from '@/store/authStore';
import type { WeeklyReport, ReportScope, RiskLevel } from '@/types';
import {
  Calendar,
  RefreshCw,
  ChevronDown,
  MapPin,
  Eye,
  FileDown,
  GitCompare,
  Building2,
  Globe2,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Loader2,
  CheckCircle,
  X,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '周报管理' },
];

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

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekStartEnd(year: number, weekNo: number): { start: string; end: string } {
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const dayOfWeek = firstDayOfYear.getUTCDay() || 7;
  const diff = (weekNo - 1) * 7 + (1 - dayOfWeek);
  const start = new Date(Date.UTC(year, 0, 1 + diff));
  const end = new Date(Date.UTC(year, 0, 1 + diff + 6));
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(s)} - ${fmt(e)}`;
}

function TrendBadge({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const positive = inverse ? value < 0 : value > 0;
  const color = positive ? 'mint' : 'warning-high';
  return (
    <Badge color={color as any} variant="soft" size="sm">
      <span className="flex items-center gap-0.5">
        {positive ? '↑' : '↓'}
        {Math.abs(value * 100).toFixed(1)}%
      </span>
    </Badge>
  );
}

export default function ReportListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userScope = user?.scope;
  const reports = useDataStore((state) => state.reports);
  const generateReport = useDataStore((state) => state.generateReport);
  const initializeData = useDataStore((state) => state.initializeData);

  const [level, setLevel] = useState<ReportScope>('national');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedWeekNo, setSelectedWeekNo] = useState(24);
  const [compareMode, setCompareMode] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const pageSize = 9;

  useEffect(() => {
    initializeData();
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [initializeData]);

  useEffect(() => {
    if (userScope) {
      if (userScope.type === 'province') {
        setLevel('province');
        setSelectedProvince(userScope.province || '');
      } else if (userScope.type === 'school' || userScope.type === 'college') {
        setLevel('school');
        setSelectedSchoolId(userScope.schoolId || '');
      }
    }
  }, [userScope]);

  useEffect(() => {
    if (isGenerating) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 18 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setGenerateProgress(Math.min(progress, 100));
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const availableLevels = useMemo(() => {
    const levels: { value: ReportScope; label: string; icon: typeof Globe2 }[] = [];
    if (!userScope || userScope.type === 'national') {
      levels.push({ value: 'national', label: '全国', icon: Globe2 });
      levels.push({ value: 'province', label: '省份', icon: MapPin });
      levels.push({ value: 'school', label: '学校', icon: GraduationCap });
    } else if (userScope.type === 'province') {
      levels.push({ value: 'province', label: '省份', icon: MapPin });
      levels.push({ value: 'school', label: '学校', icon: GraduationCap });
    } else if (userScope.type === 'school' || userScope.type === 'college') {
      levels.push({ value: 'school', label: '学校', icon: GraduationCap });
    }
    return levels;
  }, [userScope]);

  const provinceOptions = useMemo(() => {
    const provinces = new Set(useDataStore.getState().schools.map((s) => s.province));
    return [
      { value: '', label: '全部省份' },
      ...Array.from(provinces).map((p) => ({ value: p, label: p })),
    ];
  }, []);

  const schoolOptions = useMemo(() => {
    const schools = useDataStore.getState().schools;
    let filtered = schools;
    if (level === 'province' && selectedProvince) {
      filtered = schools.filter((s) => s.province === selectedProvince);
    }
    return [
      { value: '', label: '全部学校' },
      ...filtered.map((s) => ({ value: s.id, label: s.name })),
    ];
  }, [level, selectedProvince]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (r.scope !== level) return false;

      if (level === 'province' && selectedProvince) {
        if (r.scopeName !== selectedProvince) return false;
      }

      if (level === 'school' && selectedSchoolId) {
        const school = useDataStore.getState().getSchoolById(selectedSchoolId);
        if (school && r.scopeName !== school.name) return false;
      }

      if (userScope) {
        if (userScope.type === 'province') {
          if (r.scope === 'national') return false;
          if (r.scope === 'province' && r.scopeName !== userScope.province) return false;
          if (r.scope === 'school') {
            const school = useDataStore.getState().schools.find((s) => s.name === r.scopeName);
            if (!school || school.province !== userScope.province) return false;
          }
        } else if (userScope.type === 'school' || userScope.type === 'college') {
          if (r.scope !== 'school') return false;
          const school = useDataStore.getState().schools.find((s) => s.name === r.scopeName);
          if (!school || school.id !== userScope.schoolId) return false;
        }
      }

      return true;
    });
  }, [reports, level, selectedProvince, selectedSchoolId, userScope]);

  const pagedReports = useMemo(() => {
    return filteredReports.slice(0, page * pageSize);
  }, [filteredReports, page]);

  const weekOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => 24 - i).map((w) => ({
      value: w,
      label: `${selectedYear}年第${w}周`,
    }));
  }, [selectedYear]);

  const yearOptions = useMemo(() => {
    return [2024, 2025, 2026].map((y) => ({ value: y, label: `${y}年` }));
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerateProgress(0);
    setShowGenerateModal(false);

    const { start, end } = getWeekStartEnd(selectedYear, selectedWeekNo);

    let scopeId: string | undefined;
    if (level === 'province') {
      scopeId = selectedProvince || undefined;
    } else if (level === 'school') {
      scopeId = selectedSchoolId || undefined;
    }

    setTimeout(() => {
      const reportId = generateReport(level, scopeId, start, end);
      setIsGenerating(false);
      setGenerateProgress(100);
      setShowSuccess(true);
      setPage(1);

      setTimeout(() => {
        setShowSuccess(false);
        setGenerateProgress(0);
      }, 3000);
    }, 1500);
  };

  const handlePreview = (report: WeeklyReport) => {
    navigate(`/reports/${encodeURIComponent(report.id)}`);
  };

  const handleDownload = (report: WeeklyReport) => {
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

  const generateReportText = (report: WeeklyReport): string => {
    const lines: string[] = [];
    lines.push('=' .repeat(60));
    lines.push(`  ${report.scopeName}心理健康监测周报`);
    lines.push(`  ${report.weekStart} 至 ${report.weekEnd}`);
    lines.push('=' .repeat(60));
    lines.push('');
    lines.push('【报告摘要】');
    lines.push(report.summary);
    lines.push('');
    lines.push('【关键指标】');
    lines.push(`  监测学生总数: ${Object.values(report.riskDistribution).reduce((a, b) => a + b, 0)} 人`);
    lines.push(`  本周预警数: ${report.totalWarnings} 条`);
    lines.push(`  已处置预警: ${report.resolvedWarnings} 条`);
    lines.push(`  处置率: ${((report.resolvedWarnings / Math.max(1, report.totalWarnings)) * 100).toFixed(1)}%`);
    lines.push(`  平均响应时长: ${report.avgResponseHours} 小时`);
    lines.push(`  复测改善率: ${(report.retestImprovementRate * 100).toFixed(1)}%`);
    lines.push('');
    lines.push('【风险等级分布】');
    (Object.keys(report.riskDistribution) as RiskLevel[]).forEach((level) => {
      lines.push(`  ${RISK_LABELS[level]}: ${report.riskDistribution[level]} 人`);
    });
    lines.push('');
    lines.push('【AI推荐建议】');
    report.recommendations.forEach((rec, i) => {
      lines.push(`  ${i + 1}. ${rec}`);
    });
    lines.push('');
    lines.push('=' .repeat(60));
    lines.push(`报告编号: ${report.id}`);
    lines.push(`生成时间: ${new Date().toLocaleString()}`);
    lines.push('=' .repeat(60));
    return lines.join('\n');
  };

  const getPieData = (report: WeeklyReport) => {
    return (Object.keys(report.riskDistribution) as RiskLevel[]).map((level) => ({
      name: RISK_LABELS[level],
      value: report.riskDistribution[level],
      color: RISK_COLORS[level],
    }));
  };

  const getLineData = (report: WeeklyReport) => {
    return report.charts.riskTrend.map((d) => d.high + d.medium + d.low);
  };

  const getWeekNoFromReport = (report: WeeklyReport): number => {
    return getWeekNumber(new Date(report.weekStart));
  };

  const MiniPieChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => (
    <div className="relative h-24 w-24 flex-shrink-0">
      <PieChart data={data} height={96} radius={['55%', '85%']} showLegend={false} />
    </div>
  );

  const MiniLineChart = ({ data }: { data: number[] }) => (
    <div className="h-24 flex-1 min-w-0">
      <LineChart
        xAxisData={data.map((_, i) => String(i + 1))}
        series={[{ name: '趋势', data, color: '#0F4C81' }]}
        height={96}
        showLegend={false}
        smooth={true}
      />
    </div>
  );

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        {showSuccess && (
          <div className="fixed top-24 right-6 z-50 animate-slide-in">
            <Card className="bg-mint-50 border-mint-200 shadow-lg">
              <CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-mint-600" />
                <div>
                  <p className="font-semibold text-mint-700">报告生成成功</p>
                  <p className="text-sm text-mint-600">新报告已添加到列表中</p>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="ml-2 p-1 rounded-full hover:bg-mint-100 transition-colors"
                >
                  <X className="h-4 w-4 text-mint-600" />
                </button>
              </CardContent>
            </Card>
          </div>
        )}

        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 shadow-2xl">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary-500" />
                    <h3 className="text-lg font-bold text-ink-800">生成新报告</h3>
                  </div>
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="p-1.5 rounded-lg hover:bg-ink-100 transition-colors"
                  >
                    <X className="h-5 w-5 text-ink-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">报告层级</label>
                    <div className="flex gap-2">
                      {availableLevels.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setLevel(opt.value);
                              if (opt.value === 'national') {
                                setSelectedProvince('');
                                setSelectedSchoolId('');
                              }
                            }}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                              level === opt.value
                                ? 'bg-gradient-primary text-white shadow-md'
                                : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {level === 'province' && (
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">选择省份</label>
                      <select
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="input-base w-full"
                      >
                        {provinceOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {level === 'school' && (
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">选择学校</label>
                      <select
                        value={selectedSchoolId}
                        onChange={(e) => setSelectedSchoolId(e.target.value)}
                        className="input-base w-full"
                      >
                        {schoolOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">年份</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="input-base w-full"
                      >
                        {yearOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">周次</label>
                      <select
                        value={selectedWeekNo}
                        onChange={(e) => setSelectedWeekNo(Number(e.target.value))}
                        className="input-base w-full"
                      >
                        {weekOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-primary-50/60 border border-primary-100">
                    <p className="text-sm text-primary-700">
                      <Calendar className="h-4 w-4 inline mr-1.5" />
                      报告周期：{formatDateRange(
                        getWeekStartEnd(selectedYear, selectedWeekNo).start,
                        getWeekStartEnd(selectedYear, selectedWeekNo).end
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        生成报告
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardContent className="p-4 lg:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-bold text-ink-800 font-serif">周报筛选</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCompareMode(!compareMode)}
                  className={cn(
                    'btn-secondary flex items-center gap-2',
                    compareMode && 'bg-primary-50 border-primary-200 text-primary-600'
                  )}
                >
                  <GitCompare className="h-4 w-4" />
                  <span>对比上周</span>
                </button>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  disabled={isGenerating}
                  className={cn(
                    'btn-primary flex items-center gap-2 min-w-[140px]',
                    isGenerating && 'opacity-80 cursor-wait'
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>生成中 {Math.floor(generateProgress)}%</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>生成新报告</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {isGenerating && (
              <div className="relative h-2 bg-ink-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-mint rounded-full transition-all duration-300"
                  style={{ width: `${generateProgress}%` }}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-ink-200 overflow-hidden bg-white">
                {availableLevels.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setLevel(opt.value);
                        setPage(1);
                        if (opt.value === 'province' && userScope?.province) {
                          setSelectedProvince(userScope.province);
                        } else if (opt.value === 'school' && userScope?.schoolId) {
                          setSelectedSchoolId(userScope.schoolId);
                        }
                      }}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all duration-200',
                        level === opt.value
                          ? 'bg-gradient-primary text-white shadow-inner'
                          : 'text-ink-600 hover:bg-ink-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {level === 'province' && (
                <div className="relative min-w-[180px]">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setPage(1);
                    }}
                    className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                  >
                    {provinceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                </div>
              )}

              {level === 'school' && (
                <div className="relative min-w-[220px]">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => {
                      setSelectedSchoolId(e.target.value);
                      setPage(1);
                    }}
                    className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                  >
                    {schoolOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                </div>
              )}

              <div className="flex-1" />

              <div className="text-sm text-ink-500">
                共 <span className="font-bold text-primary-600">{filteredReports.length}</span> 份报告
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-16">
              <Loading />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {pagedReports.map((report, idx) => {
                const weekNo = getWeekNoFromReport(report);
                const handleRate =
                  report.totalWarnings > 0
                    ? ((report.resolvedWarnings / report.totalWarnings) * 100).toFixed(1)
                    : '0';
                const improveRate = (report.retestImprovementRate * 100).toFixed(1);

                return (
                  <Card
                    key={report.id}
                    hoverable
                    className="overflow-hidden group"
                    style={{ animationDelay: `${(idx % 9) * 0.06}s` }}
                  >
                    <div className="relative p-5">
                      <div className="absolute top-4 left-4 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-primary text-white text-[11px] font-bold font-mono tracking-wide shadow-md">
                          {report.id}
                        </span>
                      </div>

                      <div className="flex items-end justify-between mb-4 mt-6">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-ink-400 mb-1">周报周期</p>
                          <p className="text-sm font-semibold text-ink-800 truncate">
                            {formatDateRange(report.weekStart, report.weekEnd)}
                          </p>
                        </div>
                        <Badge
                          color={
                            report.scope === 'national'
                              ? 'primary'
                              : report.scope === 'province'
                              ? 'mint'
                              : 'warning-low'
                          }
                          variant="soft"
                          size="sm"
                        >
                          {report.scopeName}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 py-3 px-3 bg-gradient-to-br from-ink-50 to-white rounded-xl border border-ink-100 mb-4">
                        <MiniPieChart data={getPieData(report)} />
                        <div className="w-px h-16 bg-ink-200" />
                        <MiniLineChart data={getLineData(report)} />
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2.5 rounded-xl bg-warning-high/5">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertTriangle className="h-3 w-3 text-warning-high" />
                            <span className="text-[10px] text-ink-500 font-medium">预警</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <p className="text-sm font-bold text-ink-800">{report.totalWarnings}</p>
                            {compareMode && (
                              <TrendBadge value={report.warningsCompared} inverse />
                            )}
                          </div>
                        </div>
                        <div className="text-center p-2.5 rounded-xl bg-primary-50/60">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle2 className="h-3 w-3 text-primary-500" />
                            <span className="text-[10px] text-ink-500 font-medium">处置率</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <p className="text-sm font-bold text-ink-800">{handleRate}%</p>
                          </div>
                        </div>
                        <div className="text-center p-2.5 rounded-xl bg-mint-50/60">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="h-3 w-3 text-mint-600" />
                            <span className="text-[10px] text-ink-500 font-medium">改善率</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <p className="text-sm font-bold text-ink-800">{improveRate}%</p>
                            {compareMode && (
                              <TrendBadge value={report.retestImprovementCompared} />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-3 border-t border-ink-100">
                        <button
                          onClick={() => handlePreview(report)}
                          className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 transition-all duration-200 group/btn"
                          title="预览报告"
                        >
                          <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDownload(report)}
                          className="p-2 rounded-lg text-mint-600 hover:bg-mint-50 transition-all duration-200 group/btn"
                          title="下载报告"
                        >
                          <FileDown className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => setCompareMode(!compareMode)}
                          className={cn(
                            'p-2 rounded-lg transition-all duration-200 group/btn',
                            compareMode
                              ? 'bg-warning-low/20 text-warning-low'
                              : 'text-warning-low hover:bg-warning-low/10'
                          )}
                          title="对比上周"
                        >
                          <GitCompare className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {pagedReports.length < filteredReports.length && (
              <div ref={loaderRef} className="flex justify-center py-6">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4" />
                  <span>
                    加载更多 ({pagedReports.length}/{filteredReports.length})
                  </span>
                </button>
              </div>
            )}

            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-16 text-center">
                  <FileDown className="h-12 w-12 mx-auto mb-4 text-ink-300" />
                  <p className="text-ink-500 mb-4">暂无符合条件的报告</p>
                  <button
                    onClick={() => setShowGenerateModal(true)}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    生成第一份报告
                  </button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
