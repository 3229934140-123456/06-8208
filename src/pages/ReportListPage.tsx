import { useState, useMemo, useEffect, useRef } from 'react';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { PieChart, LineChart } from '@/components/charts';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '周报管理' },
];

type ReportLevel = 'national' | 'province' | 'school';

interface ReportCard {
  id: string;
  code: string;
  weekNo: number;
  year: number;
  period: string;
  level: ReportLevel;
  levelName: string;
  province?: string;
  school?: string;
  createTime: string;
  warningCount: number;
  handleRate: number;
  improveRate: number;
  warningTrend: number;
  handleTrend: number;
  improveTrend: number;
  pieData: { name: string; value: number; color: string }[];
  lineData: number[];
}

const levelOptions = [
  { value: 'national' as ReportLevel, label: '全国', icon: Globe2 },
  { value: 'province' as ReportLevel, label: '省份', icon: MapPin },
  { value: 'school' as ReportLevel, label: '学校', icon: GraduationCap },
];

const provinceOptions = [
  { value: '', label: '全部省份' },
  { value: '北京', label: '北京' },
  { value: '上海', label: '上海' },
  { value: '广东', label: '广东' },
  { value: '江苏', label: '江苏' },
  { value: '浙江', label: '浙江' },
  { value: '山东', label: '山东' },
  { value: '河南', label: '河南' },
  { value: '四川', label: '四川' },
  { value: '湖北', label: '湖北' },
  { value: '湖南', label: '湖南' },
  { value: '河北', label: '河北' },
  { value: '福建', label: '福建' },
];

function getWeekRange(year: number, weekNo: number): string {
  const firstDayOfYear = new Date(year, 0, 1);
  const start = new Date(firstDayOfYear);
  start.setDate(start.getDate() + (weekNo - 1) * 7 - firstDayOfYear.getDay() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${fmt(start)} - ${fmt(end)}`;
}

function generateMockReports(): ReportCard[] {
  const provinces = ['北京', '上海', '广东', '江苏', '浙江', '山东', '四川', '湖北'];
  const schools = ['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学', '南京大学'];
  const reports: ReportCard[] = [];
  const year = 2026;
  const levels: ReportLevel[] = ['national', 'province', 'school'];

  for (let i = 0; i < 18; i++) {
    const weekNo = 24 - Math.floor(i / 3);
    const level = levels[i % 3];
    const province = level !== 'national' ? provinces[i % provinces.length] : undefined;
    const school = level === 'school' ? schools[i % schools.length] : undefined;
    const pieData = [
      { name: '安全', value: 520 + Math.floor(Math.random() * 300), color: '#2EC4B6' },
      { name: '低风险', value: 280 + Math.floor(Math.random() * 150), color: '#74C0FC' },
      { name: '中风险', value: 120 + Math.floor(Math.random() * 80), color: '#FFA94D' },
      { name: '高风险', value: 40 + Math.floor(Math.random() * 40), color: '#FF6B6B' },
    ];
    reports.push({
      id: `RPT${String(year * 1000 + i).padStart(8, '0')}`,
      code: `WR-${year}-W${String(weekNo).padStart(2, '0')}`,
      weekNo,
      year,
      period: getWeekRange(year, weekNo),
      level,
      levelName:
        level === 'national' ? '全国' : level === 'province' ? `${province}省` : school!,
      province,
      school,
      createTime: new Date(Date.now() - i * 86400000 * 7).toISOString().split('T')[0],
      warningCount: 480 + Math.floor(Math.random() * 500),
      handleRate: 82 + Math.floor(Math.random() * 15),
      improveRate: 68 + Math.floor(Math.random() * 22),
      warningTrend: (Math.random() * 20 - 10),
      handleTrend: (Math.random() * 10 - 2),
      improveTrend: (Math.random() * 12 - 3),
      pieData,
      lineData: Array.from({ length: 14 }, () => 60 + Math.floor(Math.random() * 35)),
    });
  }
  return reports;
}

function TrendBadge({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const positive = inverse ? value < 0 : value > 0;
  const color = positive ? 'mint' : 'warning-high';
  return (
    <Badge color={color as any} variant="soft" size="sm">
      <span className="flex items-center gap-0.5">
        {positive ? '↑' : '↓'}
        {Math.abs(value).toFixed(1)}%
      </span>
    </Badge>
  );
}

export default function ReportListPage() {
  const [year, setYear] = useState(2026);
  const [weekNo, setWeekNo] = useState(24);
  const [level, setLevel] = useState<ReportLevel>('national');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [allReports, setAllReports] = useState<ReportCard[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const pageSize = 9;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllReports(generateMockReports());
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isGenerating) {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 18 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            setGenerateProgress(0);
          }, 500);
        }
        setGenerateProgress(Math.min(progress, 100));
      }, 250);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const filteredReports = useMemo(() => {
    return allReports.filter((r) => {
      if (level === 'province' && selectedProvince && r.province !== selectedProvince) return false;
      if (r.level !== level && level !== 'national') return false;
      return true;
    });
  }, [allReports, level, selectedProvince]);

  const pagedReports = useMemo(() => {
    return filteredReports.slice(0, page * pageSize);
  }, [filteredReports, page]);

  const weekOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => 24 - i).map((w) => ({
      value: w,
      label: `${year}年第${w}周`,
    }));
  }, [year]);

  const MiniPieChart = ({ data }: { data: ReportCard['pieData'] }) => (
    <div className="relative h-24 w-24 flex-shrink-0">
      <PieChart
        data={data}
        height={96}
        radius={['55%', '85%']}
        showLegend={false}
      />
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
        <Card>
          <CardContent className="p-4 lg:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-bold text-ink-800 font-serif">周报筛选</h2>
              </div>
              <button
                onClick={() => {
                  setIsGenerating(true);
                  setGenerateProgress(0);
                }}
                disabled={isGenerating}
                className={cn(
                  'btn-primary flex items-center gap-2 min-w-[160px]',
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
                {levelOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setLevel(opt.value)}
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

              <div className="relative min-w-[180px]">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <select
                  value={weekNo}
                  onChange={(e) => setWeekNo(Number(e.target.value))}
                  className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                >
                  {weekOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>

              {level === 'province' && (
                <div className="relative min-w-[150px]">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
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
              {pagedReports.map((report, idx) => (
                <Card
                  key={report.id}
                  hoverable
                  className="overflow-hidden group"
                  style={{ animationDelay: `${(idx % 9) * 0.06}s` }}
                >
                  <div className="relative p-5">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-primary text-white text-[11px] font-bold font-mono tracking-wide shadow-md">
                        {report.code}
                      </span>
                    </div>

                    <div className="flex items-end justify-between mb-4 mt-6">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ink-400 mb-1">周报周期</p>
                        <p className="text-sm font-semibold text-ink-800 truncate">{report.period}</p>
                      </div>
                      <Badge
                        color={
                          report.level === 'national'
                            ? 'primary'
                            : report.level === 'province'
                            ? 'mint'
                            : 'warning-low'
                        }
                        variant="soft"
                        size="sm"
                      >
                        {report.levelName}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 py-3 px-3 bg-gradient-to-br from-ink-50 to-white rounded-xl border border-ink-100 mb-4">
                      <MiniPieChart data={report.pieData} />
                      <div className="w-px h-16 bg-ink-200" />
                      <MiniLineChart data={report.lineData} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2.5 rounded-xl bg-warning-high/5">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <AlertTriangle className="h-3 w-3 text-warning-high" />
                          <span className="text-[10px] text-ink-500 font-medium">预警</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-sm font-bold text-ink-800">{report.warningCount}</p>
                          <TrendBadge value={report.warningTrend} inverse />
                        </div>
                      </div>
                      <div className="text-center p-2.5 rounded-xl bg-primary-50/60">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <CheckCircle2 className="h-3 w-3 text-primary-500" />
                          <span className="text-[10px] text-ink-500 font-medium">处置率</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-sm font-bold text-ink-800">{report.handleRate}%</p>
                          <TrendBadge value={report.handleTrend} />
                        </div>
                      </div>
                      <div className="text-center p-2.5 rounded-xl bg-mint-50/60">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="h-3 w-3 text-mint-600" />
                          <span className="text-[10px] text-ink-500 font-medium">改善率</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-sm font-bold text-ink-800">{report.improveRate}%</p>
                          <TrendBadge value={report.improveTrend} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 pt-3 border-t border-ink-100">
                      <button
                        className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 transition-all duration-200 group/btn"
                        title="预览报告"
                      >
                        <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        className="p-2 rounded-lg text-mint-600 hover:bg-mint-50 transition-all duration-200 group/btn"
                        title="下载PDF"
                      >
                        <FileDown className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button
                        className="p-2 rounded-lg text-warning-low hover:bg-warning-low/10 transition-all duration-200 group/btn"
                        title="对比上周"
                      >
                        <GitCompare className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {pagedReports.length < filteredReports.length && (
              <div
                ref={loaderRef}
                className="flex justify-center py-6"
              >
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Loader2 className="h-4 w-4" />
                  <span>加载更多 ({pagedReports.length}/{filteredReports.length})</span>
                </button>
              </div>
            )}

            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-16 text-center">
                  <FileDown className="h-12 w-12 mx-auto mb-4 text-ink-300" />
                  <p className="text-ink-500">暂无符合条件的报告</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
