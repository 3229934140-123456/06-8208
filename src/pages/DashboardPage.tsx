import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  ChevronDown,
  Volume2,
  TrendingUp,
  Building2,
  MapPin,
  Activity,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { PieChart, BarChart, LineChart, ChinaHeatMap } from '@/components/charts';
import type { PieDataItem, BarDataItem, LineSeries, ProvinceRiskData } from '@/components/charts';
import { useAppStore } from '@/store/appStore';

const provinces = [
  '全国', '北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北',
  '湖南', '河北', '安徽', '福建', '江西', '辽宁', '陕西', '重庆', '黑龙江', '吉林',
];

const schoolTypes = [
  { key: 'all', label: '全部' },
  { key: '本科', label: '本科' },
  { key: '专科', label: '专科' },
  { key: '高职', label: '高职' },
];

const timeRanges = [
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: 'term', label: '本学期' },
];

const provinceNameList = [
  '北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北', '湖南',
  '河北', '安徽', '福建', '江西', '辽宁', '陕西', '重庆', '黑龙江', '吉林', '山西',
  '广西', '云南', '贵州', '甘肃', '内蒙古', '新疆', '海南', '宁夏', '青海', '西藏', '天津',
];

const schoolNamePrefixes = ['清华', '北京', '华东', '南京', '浙江', '复旦', '上海', '中山', '武汉', '四川', '西安', '哈尔滨', '吉林', '山东', '南开', '天津', '中国', '中央', '国防', '华中'];
const schoolNameSuffixes = ['大学', '理工大学', '师范大学', '科技大学', '工业大学', '农业大学', '医科大学', '财经大学', '政法大学', '海洋大学'];

function generateProvinceData(): ProvinceRiskData[] {
  return provinceNameList.map((name) => ({
    name,
    value: Math.floor(Math.random() * 80) + 20,
    studentCount: Math.floor(Math.random() * 800000) + 50000,
    warningCount: Math.floor(Math.random() * 500) + 50,
    highRiskCount: Math.floor(Math.random() * 120) + 10,
  }));
}

function generateRiskPieData(): PieDataItem[] {
  return [
    { name: '安全', value: 68.5 },
    { name: '低风险', value: 18.3 },
    { name: '中风险', value: 9.7 },
    { name: '高风险', value: 3.5 },
  ];
}

function generateRankData(): BarDataItem[] {
  return Array.from({ length: 10 }, (_, i) => ({
    name: `${schoolNamePrefixes[i % schoolNamePrefixes.length]}${schoolNameSuffixes[i % schoolNameSuffixes.length]}`,
    value: Math.floor(Math.random() * 12) + 86,
    extra: {
      handleRate: Math.floor(Math.random() * 12) + 86,
      avgDuration: `${(Math.random() * 6 + 2).toFixed(1)}h`,
    },
  }));
}

function generateTrendData() {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  return {
    dates,
    series: [
      {
        name: '一级预警',
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 80),
      },
      {
        name: '二级预警',
        data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 120) + 180),
      },
    ] as LineSeries[],
  };
}

interface WarningStreamItem {
  id: string;
  studentName: string;
  school: string;
  level: 'low' | 'medium' | 'high' | 'critical';
  triggerType: string;
  time: string;
}

function generateWarningStream(): WarningStreamItem[] {
  const levels: WarningStreamItem['level'][] = ['low', 'medium', 'high', 'critical'];
  const triggerTypes = ['情绪低落', '心理测评', '社交异常', '行为异常', '学业预警', '睡眠监测'];
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴'];
  const names = ['明', '华', '芳', '静', '强', '磊', '洋', '勇', '艳', '杰'];

  return Array.from({ length: 10 }, (_, i) => {
    const minutesAgo = Math.floor(Math.random() * 180) + 1;
    const hours = Math.floor(minutesAgo / 60);
    const mins = minutesAgo % 60;
    return {
      id: `WARN${String(i + 1).padStart(5, '0')}`,
      studentName: `${surnames[i % surnames.length]}${names[(i + 3) % names.length]}同学`,
      school: `${schoolNamePrefixes[i % schoolNamePrefixes.length]}${schoolNameSuffixes[i % schoolNameSuffixes.length]}`,
      level: levels[i % levels.length],
      triggerType: triggerTypes[i % triggerTypes.length],
      time: hours > 0 ? `${hours}小时${mins}分钟前` : `${mins}分钟前`,
    };
  });
}

interface HighRiskSchool {
  id: string;
  name: string;
  province: string;
  highRiskCount: number;
  resolutionRate: number;
  trend: number[];
}

function generateHighRiskSchools(): HighRiskSchool[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `SCH${String(1000 + i).padStart(4, '0')}`,
    name: `${schoolNamePrefixes[(i + 5) % schoolNamePrefixes.length]}${schoolNameSuffixes[(i + 2) % schoolNameSuffixes.length]}`,
    province: provinceNameList[(i * 3) % provinceNameList.length],
    highRiskCount: Math.floor(Math.random() * 80) + 25,
    resolutionRate: Math.floor(Math.random() * 20) + 65,
    trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 30),
  }));
}

const levelColorMap: Record<WarningStreamItem['level'], 'risk-safe' | 'risk-low' | 'risk-medium' | 'risk-high'> = {
  low: 'risk-low',
  medium: 'risk-medium',
  high: 'risk-high',
  critical: 'risk-high',
};

const levelText: Record<WarningStreamItem['level'], string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
  critical: '极高风险',
};

function MiniSparkline({ data, color = '#FF6B6B' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((val - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`mini-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#mini-grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { selectedProvince, selectedSchoolType, selectedTimeRange, setSelectedProvince, setSelectedSchoolType, setSelectedTimeRange } = useAppStore();

  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const provinceData = useMemo(() => generateProvinceData(), []);
  const riskPieData = useMemo(() => generateRiskPieData(), []);
  const rankData = useMemo(() => generateRankData(), []);
  const trendData = useMemo(() => generateTrendData(), []);
  const warningStream = useMemo(() => generateWarningStream(), []);
  const highRiskSchools = useMemo(() => generateHighRiskSchools(), []);
  const riskColors = ['#2EC4B6', '#74C0FC', '#FFA94D', '#FF6B6B'];

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  if (!loaded) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout breadcrumbs={[{ label: '工作台' }, { label: '核心监测看板' }]}>
      <div className="space-y-6 stagger-reveal">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-white border border-ink-200/80 shadow-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setProvinceDropdownOpen(!provinceDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-50 border border-ink-200 text-ink-700 hover:bg-ink-100 hover:border-ink-300 transition-all min-w-[140px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span className="font-medium">{selectedProvince || '全国'}</span>
                </div>
                <ChevronDown className={cn('w-4 h-4 text-ink-400 transition-transform', provinceDropdownOpen && 'rotate-180')} />
              </button>
              {provinceDropdownOpen && (
                <div className="absolute z-50 mt-2 w-48 max-h-64 overflow-auto rounded-xl bg-white border border-ink-200 shadow-xl p-1.5">
                  {provinces.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setSelectedProvince(p === '全国' ? '' : p);
                        setProvinceDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        (selectedProvince === p || (!selectedProvince && p === '全国'))
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-ink-600 hover:bg-ink-50'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-ink-50 border border-ink-200">
              {schoolTypes.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setSelectedSchoolType(t.key === 'all' ? '' : t.key)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                    (selectedSchoolType === t.key || (!selectedSchoolType && t.key === 'all'))
                      ? 'bg-white text-primary-600 shadow-sm border border-primary-100'
                      : 'text-ink-500 hover:text-ink-700'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-ink-50 border border-ink-200">
              {timeRanges.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setSelectedTimeRange(r.key)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                    selectedTimeRange === r.key
                      ? 'bg-white text-primary-600 shadow-sm border border-primary-100'
                      : 'text-ink-500 hover:text-ink-700'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all',
              refreshing && 'pointer-events-none'
            )}
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            刷新数据
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard
            title="全国监测学生数"
            value="41,805,260"
            suffix="人"
            trendValue="+2.3%"
            trendType="up"
            description="同比去年"
            color="primary"
            icon={<Users className="w-6 h-6" strokeWidth={2} />}
          />
          <StatCard
            title="风险学生数"
            value="186,492"
            suffix="人"
            trendValue="-5.1%"
            trendType="down"
            description="同比去年"
            color="danger"
            icon={<AlertTriangle className="w-6 h-6" strokeWidth={2} />}
          />
          <StatCard
            title="预警处置率"
            value="94.7"
            suffix="%"
            trendValue="+3.2%"
            trendType="up"
            description="同比去年"
            color="mint"
            icon={<CheckCircle2 className="w-6 h-6" strokeWidth={2} />}
          />
          <StatCard
            title="平均响应时长"
            value="6.2"
            suffix="小时"
            trendValue="-1.8小时"
            trendType="down"
            description="同比去年"
            color="warning"
            icon={<Clock className="w-6 h-6" strokeWidth={2} />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-10 gap-5">
          <div className="xl:col-span-7">
            <ChinaHeatMap
              data={provinceData}
              onProvinceClick={(p) => {
                console.log('Selected province:', p.name);
              }}
            />
          </div>

          <div className="xl:col-span-3 space-y-5">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">风险等级分布</CardTitle>
                    <CardDescription>基于全体监测学生</CardDescription>
                  </div>
                  <Sparkles className="w-5 h-5 text-warning-low" />
                </div>
              </CardHeader>
              <CardContent>
                <PieChart
                  data={riskPieData}
                  colors={riskColors}
                  height={220}
                  centerLabel={{
                    title: `${riskPieData.reduce((s, i) => s + i.value, 0).toFixed(0)}%`,
                    subtitle: '学生心理健康',
                  }}
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {riskPieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-ink-50">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: riskColors[idx] }}
                      />
                      <span className="text-xs text-ink-600 flex-1">{item.name}</span>
                      <span className="text-xs font-bold text-ink-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-warning-high" />
                      实时预警流
                    </CardTitle>
                    <CardDescription>最新10条预警推送</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-warning-high">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    实时
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[340px] overflow-y-auto divide-y divide-ink-100">
                  {warningStream.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/warning/${item.id}`)}
                      className="w-full text-left p-3.5 hover:bg-ink-50 transition-colors group"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          item.level === 'critical' || item.level === 'high'
                            ? 'bg-warning-high/10'
                            : item.level === 'medium'
                            ? 'bg-warning-low/10'
                            : 'bg-risk-low/10'
                        )}>
                          <AlertTriangle className={cn(
                            'w-4 h-4',
                            item.level === 'critical' || item.level === 'high'
                              ? 'text-warning-high'
                              : item.level === 'medium'
                              ? 'text-warning-low'
                              : 'text-risk-low'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-ink-800 truncate group-hover:text-primary-600 transition-colors">
                              {item.studentName}
                            </span>
                            <Badge
                              color={levelColorMap[item.level]}
                              variant="soft"
                              size="sm"
                            >
                              {levelText[item.level]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ink-500 mb-1">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{item.school}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-ink-400">
                              触发: {item.triggerType}
                            </span>
                            <span className="text-[11px] text-ink-400">{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-10 gap-5">
          <div className="xl:col-span-6">
            <Card>
              <CardContent className="pt-6">
                <BarChart
                  data={rankData}
                  horizontal={true}
                  height={440}
                  xAxisName="处置率 (%)"
                  showRank={true}
                />
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-4">
            <Card>
              <CardContent className="pt-6">
                <LineChart
                  xAxisData={trendData.dates}
                  series={trendData.series}
                  colors={['#FF6B6B', '#FFA94D']}
                  height={300}
                  yAxisName="预警数"
                  smooth={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-warning-high" />
                  高风险学校快速一览
                </CardTitle>
                <CardDescription>高风险学生较多、需要重点关注的院校</CardDescription>
              </div>
              <button
                onClick={() => navigate('/warning')}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors"
              >
                查看全部
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              {highRiskSchools.map((school, idx) => (
                <button
                  key={school.id}
                  onClick={() => navigate(`/dashboard/school/${school.id}`)}
                  className="shrink-0 w-[260px] snap-start p-4 rounded-xl border border-ink-200 bg-gradient-to-br from-white to-ink-50 hover:shadow-card-hover hover:border-warning-high/30 hover:-translate-y-1 transition-all duration-300 group text-left"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-ink-900 truncate group-hover:text-primary-600 transition-colors">
                        {school.name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-xs text-ink-500">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{school.province}</span>
                      </div>
                    </div>
                    <Badge color="risk-high" variant="soft" size="sm" className="ml-2">
                      {school.highRiskCount}人
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <MiniSparkline data={school.trend} color="#FF6B6B" />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-ink-100">
                    <div>
                      <p className="text-[11px] text-ink-400 mb-0.5">处置率</p>
                      <p className={cn(
                        'text-lg font-bold',
                        school.resolutionRate >= 80 ? 'text-mint-600' : school.resolutionRate >= 70 ? 'text-warning-low' : 'text-warning-high'
                      )}>
                        {school.resolutionRate}%
                      </p>
                    </div>
                    <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          school.resolutionRate >= 80 ? 'bg-mint-500' : school.resolutionRate >= 70 ? 'bg-warning-low' : 'bg-warning-high'
                        )}
                        style={{ width: `${school.resolutionRate}%` }}
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
