import { useState, useMemo, useEffect, useRef } from 'react';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Loading } from '@/components/ui/Loading';
import { PieChart, LineChart, RadarChart, BarChart } from '@/components/charts';
import { cn } from '@/lib/utils';
import {
  Printer,
  FileDown,
  Share2,
  GitCompare,
  ChevronRight,
  ChevronDown,
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
  Brain,
  Heart,
  Moon,
  MessageCircle,
  AlertCircle,
  ArrowUpRight,
  Zap,
  Lightbulb,
  BookOpen,
  UserPlus,
  Building2,
  Download,
  ChevronLeft,
  GitBranch,
  Calendar,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '周报管理', href: '/reports' },
  { label: '第24周详情' },
];

const tocItems = [
  { id: 'summary', label: '执行摘要', icon: BookOpen },
  { id: 'risk', label: '风险等级分布', icon: ShieldAlert },
  { id: 'response', label: '预警响应时效', icon: Clock },
  { id: 'improvement', label: '测评改善分析', icon: TrendingUp },
  { id: 'top-schools', label: '高风险学校/区域', icon: AlertTriangle },
  { id: 'resources', label: '资源配置建议', icon: Lightbulb },
  { id: 'appendix', label: '附录数据', icon: BookOpen },
];

interface KPIMetric {
  label: string;
  value: number;
  suffix?: string;
  trend: number;
  color: 'primary' | 'mint' | 'warning' | 'danger';
  icon: React.ReactNode;
}

const mockKPIs: KPIMetric[] = [
  { label: '监测学生总数', value: 1258643, suffix: '人', trend: 2.3, color: 'primary', icon: <Users className="h-6 w-6" /> },
  { label: '新增预警', value: 3421, suffix: '条', trend: -5.1, color: 'danger', icon: <AlertTriangle className="h-6 w-6" /> },
  { label: '平均处置率', value: 89.7, suffix: '%', trend: 3.2, color: 'mint', icon: <CheckCircle2 className="h-6 w-6" /> },
  { label: '改善率', value: 76.4, suffix: '%', trend: 4.8, color: 'primary', icon: <TrendingUp className="h-6 w-6" /> },
];

const riskDistributionData = [
  { name: '安全', value: 986432, color: '#2EC4B6' },
  { name: '低风险', value: 185642, color: '#74C0FC' },
  { name: '中风险', value: 68921, color: '#FFA94D' },
  { name: '高风险', value: 17648, color: '#FF6B6B' },
];

const responseTimeData = Array.from({ length: 8 }, (_, i) => ({
  week: `第${17 + i}周`,
  avgHours: 4.5 + Math.random() * 3 - 1.5,
}));

const handleRateData = [
  { name: '北京', value: 94.5, extra: { avgDuration: '2.3h' } },
  { name: '上海', value: 93.2, extra: { avgDuration: '2.8h' } },
  { name: '浙江', value: 91.8, extra: { avgDuration: '3.1h' } },
  { name: '江苏', value: 90.5, extra: { avgDuration: '3.5h' } },
  { name: '广东', value: 88.7, extra: { avgDuration: '3.8h' } },
  { name: '山东', value: 86.4, extra: { avgDuration: '4.2h' } },
  { name: '四川', value: 84.2, extra: { avgDuration: '4.8h' } },
  { name: '湖北', value: 82.8, extra: { avgDuration: '5.1h' } },
  { name: '河南', value: 80.3, extra: { avgDuration: '5.6h' } },
  { name: '陕西', value: 78.5, extra: { avgDuration: '6.2h' } },
];

const topFastSchools = [
  { name: '清华大学', avgHours: 1.2, handleRate: 98.5, count: 124 },
  { name: '北京大学', avgHours: 1.5, handleRate: 97.8, count: 156 },
  { name: '复旦大学', avgHours: 1.8, handleRate: 96.9, count: 98 },
  { name: '上海交通大学', avgHours: 2.0, handleRate: 96.2, count: 142 },
  { name: '浙江大学', avgHours: 2.2, handleRate: 95.8, count: 178 },
  { name: '南京大学', avgHours: 2.4, handleRate: 95.1, count: 89 },
  { name: '中国科学技术大学', avgHours: 2.5, handleRate: 94.8, count: 76 },
  { name: '武汉大学', avgHours: 2.7, handleRate: 94.2, count: 131 },
  { name: '华中科技大学', avgHours: 2.9, handleRate: 93.8, count: 145 },
  { name: '西安交通大学', avgHours: 3.0, handleRate: 93.5, count: 92 },
];

const improvementTrend = {
  weeks: Array.from({ length: 8 }, (_, i) => `第${17 + i}周`),
  rate: [62.3, 64.8, 67.2, 69.5, 71.8, 73.2, 74.8, 76.4],
  lastYear: [58.5, 60.2, 62.8, 64.5, 66.1, 67.8, 69.5, 71.2],
};

const radarIndicators = [
  { name: '抑郁水平', max: 100, threshold: 50 },
  { name: '焦虑水平', max: 100, threshold: 50 },
  { name: '压力感知', max: 100, threshold: 60 },
  { name: '睡眠质量', max: 100, threshold: 60 },
  { name: '社会功能', max: 100, threshold: 55 },
];

const radarSeries = [
  { name: '本周', data: [38, 42, 52, 68, 72] },
  { name: '上周', data: [42, 46, 56, 64, 68] },
];

const improvementRatio = {
  improved: 68,
  stable: 24,
  worsened: 8,
};

const topRiskSchools = [
  { rank: 1, name: '某师范大学', warnings: 156, trend: [65, 72, 68, 75, 80, 85, 92], suggestion: '建议增加专职心理咨询师3名，开展全员心理筛查' },
  { rank: 2, name: '某理工学院', warnings: 142, trend: [58, 62, 70, 68, 75, 82, 88], suggestion: '重点关注毕业班学生，设置减压活动中心' },
  { rank: 3, name: '某医学院', warnings: 128, trend: [60, 55, 65, 72, 78, 84, 86], suggestion: '增加门诊咨询时段，建立24小时危机干预热线' },
  { rank: 4, name: '某综合性大学', warnings: 115, trend: [52, 58, 62, 68, 72, 76, 82], suggestion: '建立宿舍心理委员制度，加强朋辈互助' },
  { rank: 5, name: '某艺术学院', warnings: 98, trend: [50, 55, 60, 65, 70, 75, 80], suggestion: '开展艺术治疗团体辅导，加强家校联动' },
];

const resourceSuggestions = [
  {
    id: 1,
    problem: '广东省心理咨询师配备不足',
    suggestion: '建议广东省增加心理咨询师配备12名，重点覆盖粤东粤西高校',
    effect: '预计可将该省平均处置时长降低35%，预警响应时效提升至全国前5',
    priority: 'high' as const,
  },
  {
    id: 2,
    problem: '西部地区心理测评覆盖率较低',
    suggestion: '为四川、贵州、云南等省份高校拨付专项测评经费，统一采购测评系统',
    effect: '预计提升测评覆盖率从68%至92%，早期预警识别率提升40%',
    priority: 'high' as const,
  },
  {
    id: 3,
    problem: '毕业班学生压力集中爆发',
    suggestion: '在5-6月开展全国高校毕业班减压专项行动，配备临时心理援助团队',
    effect: '预计可降低该时段高风险预警发生率约25%',
    priority: 'medium' as const,
  },
  {
    id: 4,
    problem: '夜间危机事件响应滞后',
    suggestion: '建立全国统一的24小时心理危机干预热线，配备夜间值班心理咨询师',
    effect: '夜间危机事件平均响应时间从45分钟缩短至15分钟',
    priority: 'high' as const,
  },
  {
    id: 5,
    problem: '辅导员心理专业能力不足',
    suggestion: '开展全国高校辅导员心理技能培训认证，每学期不少于40学时',
    effect: '一级预警识别准确率提升30%，基层处置效率显著提高',
    priority: 'medium' as const,
  },
  {
    id: 6,
    problem: '家长参与度较低',
    suggestion: '建立家校联动心理预警平台，定期向家长推送心理健康科普和学生状态报告',
    effect: '学生心理改善周期缩短约20%，复发率降低15%',
    priority: 'low' as const,
  },
];

const appendixData = Array.from({ length: 25 }, (_, i) => {
  const provinces = ['北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北', '湖南'];
  return {
    id: i + 1,
    province: provinces[i % provinces.length],
    totalStudents: Math.floor(Math.random() * 80000) + 10000,
    assessmentCount: Math.floor(Math.random() * 60000) + 8000,
    warnings: Math.floor(Math.random() * 300) + 20,
    critical: Math.floor(Math.random() * 30) + 2,
    handleRate: (80 + Math.random() * 18).toFixed(1),
    improveRate: (65 + Math.random() * 25).toFixed(1),
  };
});

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
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

const getPriorityStyle = (p: 'high' | 'medium' | 'low') => {
  switch (p) {
    case 'high':
      return { color: 'warning-high' as const, text: '高优先级', icon: <AlertCircle className="h-3.5 w-3.5" /> };
    case 'medium':
      return { color: 'warning-low' as const, text: '中优先级', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
    case 'low':
      return { color: 'mint' as const, text: '低优先级', icon: <CheckCircle2 className="h-3.5 w-3.5" /> };
  }
};

export default function ReportDetailPage() {
  const [compareMode, setCompareMode] = useState(false);
  const [activeSection, setActiveSection] = useState('summary');
  const [appendixOpen, setAppendixOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
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
  }, [loading]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const provinceRiskMatrix = useMemo(() => {
    return [
      ['北京', '#2EC4B6', '上海', '#2EC4B6', '广东', '#FFA94D'],
      ['江苏', '#74C0FC', '浙江', '#2EC4B6', '山东', '#FFA94D'],
      ['河南', '#FFA94D', '四川', '#FF6B6B', '湖北', '#FFA94D'],
      ['湖南', '#74C0FC', '河北', '#FFA94D', '福建', '#74C0FC'],
    ];
  }, []);

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      {loading ? (
        <Card>
          <CardContent className="p-20">
            <Loading />
          </CardContent>
        </Card>
      ) : (
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
                          {activeSection === item.id && (
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          )}
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
                      <span className="font-mono text-sm text-white/80">WR-2026-W24</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold font-serif tracking-tight mb-3 leading-tight">
                      全国大学生心理健康监测周报 · 第24周
                    </h1>
                    <p className="text-white/80 text-sm lg:text-base flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        发布时间 2026-06-15
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        数据范围 2026.06.08 - 2026.06.14
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 transition-all duration-200 flex items-center gap-2 text-sm font-medium">
                      <Printer className="h-4 w-4" />
                      <span className="hidden sm:inline">打印</span>
                    </button>
                    <button className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 transition-all duration-200 flex items-center gap-2 text-sm font-medium">
                      <FileDown className="h-4 w-4" />
                      <span className="hidden sm:inline">下载PDF</span>
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
                      <span className="float-left text-5xl font-serif font-bold text-primary-500 mr-3 mt-[-4px] leading-none">本</span>
                      周全国监测范围内共覆盖 <b className="text-primary-600">2,847 所高校</b>，累计监测学生
                      <b className="text-primary-600"> 1,258,643 人</b>，累计产生预警记录
                      <b className="text-warning-high"> 3,421 条</b>，较上周下降 5.1%。整体心理健康形势
                      <b className="text-mint-600">持续向好</b>，全国平均预警处置率提升至
                      <b className="text-primary-600"> 89.7%</b>，学生心理测评改善率达
                      <b className="text-mint-600"> 76.4%</b>，连续第八周保持上升态势。值得关注的是，
                      <b className="text-warning-low">西部地区部分省份</b>
                      高风险学生占比仍高于全国平均水平 3.2 个百分点，建议加强资源倾斜与督导检查。
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockKPIs.map((kpi, idx) => (
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
                              kpi.color === 'warning' && 'bg-warning-low/15 text-warning-low ring-warning-low/30',
                              kpi.color === 'danger' && 'bg-warning-high/10 text-warning-high ring-warning-high/30'
                            )}
                          >
                            {kpi.icon}
                          </div>
                          {compareMode && <TrendArrow value={kpi.trend} inverse={kpi.color === 'danger'} />}
                        </div>
                        <p className="text-sm text-ink-500 mb-1">{kpi.label}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-ink-900 tracking-tight">
                            {kpi.value.toLocaleString()}
                          </span>
                          {kpi.suffix && <span className="text-sm text-ink-400">{kpi.suffix}</span>}
                        </div>
                        {compareMode && (
                          <div className="mt-2 pt-2 border-t border-ink-100 text-xs text-ink-500">
                            较上周 {kpi.trend > 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}%
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
                    <CardTitle className="text-base">全国学生风险等级构成</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PieChart
                      data={riskDistributionData}
                      height={320}
                      centerLabel={{ title: '125.8万', subtitle: '监测学生总数' }}
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
                      const delta = [-2.1, -0.8, 1.2, 3.5][idx];
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
                              {compareMode && <TrendArrow value={delta} />}
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
                  <CardTitle className="text-base">各省风险热力矩阵</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {provinceRiskMatrix.flatMap((row, rIdx) =>
                      row.map((cell, cIdx) => {
                        if (cIdx % 2 === 1) return null;
                        const name = row[cIdx] as string;
                        const color = row[cIdx + 1] as string;
                        return (
                          <div
                            key={`${rIdx}-${cIdx}`}
                            className="relative p-4 rounded-xl border border-ink-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-md cursor-pointer group"
                            style={{ backgroundColor: `${color}18` }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-ink-800">{name}</span>
                              <Building2 className="h-4 w-4 text-ink-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <div
                              className="h-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          </div>
                        );
                      })
                    )}
                  </div>
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
                    <CardTitle className="text-base">平均响应时长趋势</CardTitle>
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

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">各省份处置率排名</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BarChart
                      data={handleRateData}
                      height={300}
                      horizontal
                      xAxisName="处置率(%)"
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="h-5 w-5 text-warning-low" />
                    TOP10 响应最快高校
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-ink-50/80 border-b border-ink-100">
                          <th className="px-6 py-3.5 text-left font-semibold text-ink-600 w-20">排名</th>
                          <th className="px-6 py-3.5 text-left font-semibold text-ink-600">高校名称</th>
                          <th className="px-6 py-3.5 text-left font-semibold text-ink-600">平均响应时长</th>
                          <th className="px-6 py-3.5 text-left font-semibold text-ink-600">处置率</th>
                          <th className="px-6 py-3.5 text-left font-semibold text-ink-600">本周处置数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topFastSchools.map((school, idx) => (
                          <tr
                            key={school.name}
                            className="border-b border-ink-50 transition-colors hover:bg-primary-50/30"
                          >
                            <td className="px-6 py-3.5">
                              {idx < 3 ? (
                                <span
                                  className={cn(
                                    'inline-flex w-7 h-7 rounded-lg items-center justify-center text-white text-xs font-bold shadow-md',
                                    idx === 0 && 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                                    idx === 1 && 'bg-gradient-to-br from-slate-300 to-slate-500',
                                    idx === 2 && 'bg-gradient-to-br from-orange-400 to-orange-600'
                                  )}
                                >
                                  {idx + 1}
                                </span>
                              ) : (
                                <span className="text-ink-500 font-medium ml-1">{idx + 1}</span>
                              )}
                            </td>
                            <td className="px-6 py-3.5 font-medium text-ink-800">{school.name}</td>
                            <td className="px-6 py-3.5">
                              <Badge color="mint" variant="soft" size="sm">
                                {school.avgHours}h
                              </Badge>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 bg-ink-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-mint rounded-full"
                                    style={{ width: `${school.handleRate}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-mint-600">{school.handleRate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 font-semibold text-ink-700">{school.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
            </section>

            <section
              id="top-schools"
              ref={(el) => (sectionRefs.current['top-schools'] = el)}
              className="scroll-mt-24 space-y-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-warning-high rounded-full" />
                <h2 className="text-xl font-bold text-ink-800 font-serif">高风险学校 TOP5</h2>
              </div>

              <Card>
                <CardContent className="p-0 divide-y divide-ink-100">
                  {topRiskSchools.map((school) => (
                    <div key={school.rank} className="p-5 hover:bg-ink-50/50 transition-colors group">
                      <div className="flex flex-wrap items-start gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0',
                            school.rank === 1 && 'bg-gradient-to-br from-warning-high to-red-700',
                            school.rank === 2 && 'bg-gradient-to-br from-warning-low to-orange-600',
                            school.rank === 3 && 'bg-gradient-to-br from-yellow-400 to-yellow-600',
                            school.rank > 3 && 'bg-gradient-to-br from-ink-400 to-ink-600'
                          )}
                        >
                          {school.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-ink-800 mb-1">{school.name}</h3>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1 text-warning-high">
                                  <AlertTriangle className="h-4 w-4" />
                                  <b>{school.warnings}</b> 条预警
                                </span>
                              </div>
                            </div>
                            <div className="w-40 h-12">
                              <LineChart
                                xAxisData={school.trend.map((_, i) => String(i + 1))}
                                series={[{ name: '风险趋势', data: school.trend, color: '#FF6B6B' }]}
                                height={48}
                                showLegend={false}
                              />
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-warning-high/5 border border-warning-high/15">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="h-4 w-4 text-warning-low mt-0.5 shrink-0" />
                              <p className="text-sm text-ink-600 leading-relaxed">{school.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
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
                {resourceSuggestions.map((item, idx) => {
                  const p = getPriorityStyle(item.priority);
                  return (
                    <Card
                      key={item.id}
                      hoverable
                      className="overflow-hidden group"
                      style={{ animationDelay: `${idx * 0.08}s` }}
                    >
                      <CardContent className="p-5 relative">
                        <div
                          className={cn(
                            'absolute top-0 left-0 right-0 h-1',
                            item.priority === 'high' && 'bg-gradient-to-r from-warning-high to-red-400',
                            item.priority === 'medium' && 'bg-gradient-to-r from-warning-low to-yellow-400',
                            item.priority === 'low' && 'bg-gradient-to-r from-mint-500 to-green-400'
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
                              发现问题
                            </p>
                            <p className="text-sm font-medium text-ink-800 leading-snug">{item.problem}</p>
                          </div>
                          <div>
                            <p className="text-xs text-ink-400 mb-1 uppercase tracking-wider font-semibold">
                              <Lightbulb className="h-3 w-3 inline mr-1" />
                              建议方案
                            </p>
                            <p className="text-sm text-ink-600 leading-relaxed">{item.suggestion}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-primary-50/60 border border-primary-100/60">
                            <p className="text-xs text-primary-500 mb-1 font-semibold flex items-center gap-1">
                              <Target className="h-3.5 w-3.5" />
                              预估效果
                            </p>
                            <p className="text-sm text-primary-700 leading-relaxed">{item.effect}</p>
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
                      <p className="font-semibold text-ink-800">各省份监测数据明细表</p>
                      <p className="text-sm text-ink-500">共 {appendixData.length} 条记录 · 点击展开查看</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
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
                          <th className="px-4 py-3 text-left font-semibold text-ink-600">省份</th>
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
                          <tr
                            key={row.id}
                            className="border-b border-ink-50 hover:bg-primary-50/30 transition-colors"
                          >
                            <td className="px-4 py-3 text-ink-400 font-mono">{row.id}</td>
                            <td className="px-4 py-3 font-medium text-ink-800">{row.province}</td>
                            <td className="px-4 py-3 text-right text-ink-700">{row.totalStudents.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-ink-700">{row.assessmentCount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-semibold text-warning-high">{row.warnings}</td>
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
      )}
    </MainLayout>
  );
}
