import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useDataStore } from '@/store/dataStore';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useDataFilter } from '@/hooks/usePermission';
import type { WarningRecord, WarningLevel, RiskLevel, TriggerType, WarningStatus } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import {
  AlertTriangle,
  ArrowUpCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Wrench,
  TrendingUp,
  Calendar,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  Zap,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '预警管理' },
];

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'level1', label: '一级预警' },
  { key: 'level2', label: '二级预警' },
  { key: 'pending', label: '待审批' },
  { key: 'resolved', label: '已处置' },
];

const riskLevelOptions = [
  { value: '', label: '全部风险等级' },
  { value: 'safe', label: '安全' },
  { value: 'low', label: '低风险' },
  { value: 'medium', label: '中风险' },
  { value: 'high', label: '高风险' },
];

const timeRangeOptions = [
  { value: '7d', label: '近7天' },
  { value: '30d', label: '近30天' },
  { value: '90d', label: '近90天' },
  { value: 'semester', label: '本学期' },
  { value: 'custom', label: '自定义' },
];

const triggerTypeMap: Record<TriggerType, string> = {
  emotion: '情绪异常',
  assessment: '测评异常',
  behavior: '行为异常',
  composite: '综合触发',
};

const warningStatusMap: Record<WarningStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'warning-high' },
  processing: { label: '处理中', color: 'warning-low' },
  approved: { label: '审批通过', color: 'mint' },
  resolved: { label: '已处置', color: 'primary' },
  rejected: { label: '已驳回', color: 'risk-medium' },
  escalating: { label: '升级中', color: 'warning-high' },
};

function getRiskBadgeColor(level: RiskLevel): 'risk-safe' | 'risk-low' | 'risk-medium' | 'risk-high' {
  switch (level) {
    case 'safe': return 'risk-safe';
    case 'low': return 'risk-low';
    case 'medium': return 'risk-medium';
    case 'high': return 'risk-high';
  }
}

export default function WarningListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addNotification = useAppStore((state) => state.addNotification);
  const dataFilter = useDataFilter();

  const initializeData = useDataStore((state) => state.initializeData);
  const getWarnings = useDataStore((state) => state.getWarnings);
  const getSchools = useDataStore((state) => state.getSchools);
  const escalateWarning = useDataStore((state) => state.escalateWarning);
  const warnings = useDataStore((state) => state.warnings);

  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [province, setProvince] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  useEffect(() => {
    initializeData();
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [initializeData]);

  const provinceOptions = useMemo(() => {
    const schools = getSchools({
      province: dataFilter.province,
      schoolId: dataFilter.schoolId,
    });
    const provinceSet = new Set(schools.map((s) => s.province));
    const provinces = Array.from(provinceSet).sort();
    return [
      { value: '', label: '全部省份' },
      ...provinces.map((p) => ({ value: p, label: p })),
    ];
  }, [getSchools, warnings, dataFilter]);

  const dateRange = useMemo((): [string, string] | undefined => {
    if (timeRange === 'custom' || timeRange === '') return undefined;

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();

    switch (timeRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case 'semester': {
        const now = new Date();
        if (now.getMonth() >= 8) {
          start.setFullYear(now.getFullYear(), 8, 1);
        } else {
          start.setFullYear(now.getFullYear(), 1, 1);
        }
        break;
      }
      default:
        return undefined;
    }

    start.setHours(0, 0, 0, 0);
    return [start.toISOString(), end.toISOString()];
  }, [timeRange]);

  const filteredWarnings = useMemo<WarningRecord[]>(() => {
    let level: WarningLevel | undefined;
    let status: WarningStatus | undefined;

    if (activeTab === 'level1') {
      level = 1;
    } else if (activeTab === 'level2') {
      level = 2;
    } else if (activeTab === 'pending') {
      status = 'processing';
    } else if (activeTab === 'resolved') {
      status = 'resolved';
    }

    return getWarnings({
      level,
      status,
      riskLevel: riskLevel as RiskLevel || undefined,
      province: province || dataFilter.province || undefined,
      schoolId: dataFilter.schoolId || undefined,
      college: dataFilter.college || undefined,
      keyword: searchValue || undefined,
      dateRange,
    });
  }, [getWarnings, activeTab, riskLevel, province, searchValue, dateRange, dataFilter]);

  const stats = useMemo(() => {
    const data = filteredWarnings;
    return {
      pendingLevel1: data.filter((w) => w.level === 1 && (w.status === 'pending' || w.status === 'processing')).length,
      pendingLevel2: data.filter((w) => w.level === 2 && (w.status === 'pending' || w.status === 'processing')).length,
      inApproval: data.filter((w) => w.status === 'processing').length,
    };
  }, [filteredWarnings]);

  const totalPages = Math.ceil(filteredWarnings.length / pageSize);
  const pageData = filteredWarnings.slice((page - 1) * pageSize, page * pageSize);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleRiskLevelChange = (value: string) => {
    setRiskLevel(value);
    setPage(1);
  };

  const handleProvinceChange = (value: string) => {
    setProvince(value);
    setPage(1);
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    setPage(1);
  };

  const handleViewDetail = (id: string) => {
    navigate(`/warning/${id}`);
  };

  const handleProcess = (id: string) => {
    navigate(`/warning/${id}`);
  };

  const handleEscalate = (warning: WarningRecord) => {
    if (warning.level !== 1) return;

    const confirmed = window.confirm(`确定要将预警 ${warning.id} 升级为二级预警吗？`);
    if (!confirmed) return;

    const success = escalateWarning(warning.id);
    if (success) {
      addNotification({
        type: 'success',
        title: '升级成功',
        message: `预警 ${warning.id} 已升级为二级预警`,
      });
    } else {
      addNotification({
        type: 'error',
        title: '升级失败',
        message: '预警升级操作失败，请重试',
      });
    }
  };

  const handleExport = () => {
    const exportData = filteredWarnings.map((w) => ({
      预警编号: w.id,
      学生姓名: w.studentName,
      学校: w.schoolName,
      学院: w.college,
      年级专业: `${w.grade}${w.major}`,
      预警等级: w.level === 1 ? '一级' : '二级',
      风险等级: w.riskLevel === 'safe' ? '安全' : w.riskLevel === 'low' ? '低风险' : w.riskLevel === 'medium' ? '中风险' : '高风险',
      触发类型: triggerTypeMap[w.triggerType],
      情绪指数: w.emotionIndex,
      抑郁得分: w.depressionScore,
      生成时间: new Date(w.createdAt).toLocaleString('zh-CN'),
      状态: w.statusText,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '预警列表');
    XLSX.writeFile(wb, `预警列表_${new Date().toISOString().split('T')[0]}.xlsx`);

    addNotification({
      type: 'success',
      title: '导出成功',
      message: `已导出 ${filteredWarnings.length} 条预警数据`,
    });
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <StatCard
            title="待处理一级预警"
            value={stats.pendingLevel1}
            suffix="条"
            color="danger"
            icon={
              <div className="relative">
                <ShieldAlert className="h-6 w-6" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-high opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-warning-high" />
                </span>
              </div>
            }
            trendValue="+12%"
            trendType="up"
            description="较昨日"
          />
          <StatCard
            title="待升级二级预警"
            value={stats.pendingLevel2}
            suffix="条"
            color="warning"
            icon={
              <div className="relative">
                <ArrowUpCircle className="h-6 w-6" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-low opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-warning-low animate-pulse" />
                </span>
              </div>
            }
            trendValue="-8%"
            trendType="down"
            description="较昨日"
          />
          <StatCard
            title="审批中数量"
            value={stats.inApproval}
            suffix="条"
            color="primary"
            icon={
              <div className="relative">
                <Clock className="h-6 w-6" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 animate-pulse-slow" />
                </span>
              </div>
            }
            trendValue="+5%"
            trendType="up"
            description="较昨日"
          />
        </div>

        <Card>
          <CardContent className="p-4 lg:p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    activeTab === tab.key
                      ? 'bg-gradient-primary text-white shadow-md'
                      : 'text-ink-600 hover:bg-ink-100'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="搜索学生名、学校、预警编号..."
                  className="input-base pl-10"
                />
              </div>

              <div className="relative min-w-[160px]">
                <ShieldHalf className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <select
                  value={riskLevel}
                  onChange={(e) => handleRiskLevelChange(e.target.value)}
                  className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                >
                  {riskLevelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[140px]">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <select
                  value={province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                >
                  {provinceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>

              <div className="relative min-w-[140px]">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <select
                  value={timeRange}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="input-base pl-10 appearance-none pr-10 cursor-pointer"
                >
                  {timeRangeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
              </div>

              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>导出Excel</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-16"><Loading /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50/80 border-b border-ink-100">
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">预警编号</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学生姓名</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学校</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">年级专业</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">预警等级</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">风险等级</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">触发类型</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">情绪指数</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">抑郁得分</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">生成时间</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">状态</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((warning, idx) => {
                      const isHighRisk = warning.riskLevel === 'high';
                      return (
                        <tr
                          key={warning.id}
                          className={cn(
                            'border-b border-ink-50 transition-all duration-200 hover:bg-primary-50/30 group',
                            isHighRisk && 'bg-warning-high/5'
                          )}
                          style={{ animationDelay: `${idx * 0.03}s` }}
                        >
                          <td className={cn('px-4 py-3.5', isHighRisk && 'border-l-4 border-l-warning-high')}>
                            <span className="font-mono text-xs text-ink-500">{warning.id}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-medium text-ink-800">{warning.studentName}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-700">{warning.schoolName}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-600 whitespace-nowrap">{warning.grade} / {warning.major}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge
                              variant="solid"
                              color={warning.level === 1 ? 'warning-low' : 'warning-high'}
                              size="sm"
                              withDot
                            >
                              {warning.level === 1 ? '一级预警' : '二级预警'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge color={getRiskBadgeColor(warning.riskLevel)} size="sm" withDot>
                              {warning.riskLevel === 'safe' ? '安全' : warning.riskLevel === 'low' ? '低风险' : warning.riskLevel === 'medium' ? '中风险' : '高风险'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 text-ink-600">
                              <Zap className="h-3.5 w-3.5 text-warning-low" />
                              <span>{triggerTypeMap[warning.triggerType]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              'font-semibold',
                              warning.emotionIndex < 50 ? 'text-warning-high' : warning.emotionIndex < 65 ? 'text-warning-low' : 'text-mint-600'
                            )}>
                              {warning.emotionIndex}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              'font-semibold',
                              warning.depressionScore >= 63 ? 'text-warning-high' : warning.depressionScore >= 50 ? 'text-warning-low' : 'text-ink-600'
                            )}>
                              {warning.depressionScore}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-ink-500 whitespace-nowrap text-xs">
                            {new Date(warning.createdAt).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge color={warningStatusMap[warning.status].color as any} size="sm">
                              {warningStatusMap[warning.status].label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewDetail(warning.id)}
                                className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
                                title="查看详情"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleProcess(warning.id)}
                                className="p-1.5 rounded-lg text-mint-600 hover:bg-mint-50 transition-colors"
                                title="处理"
                              >
                                <Wrench className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEscalate(warning)}
                                className={cn(
                                  'p-1.5 rounded-lg transition-colors',
                                  warning.level === 1
                                    ? 'text-warning-low hover:bg-warning-low/10'
                                    : 'text-ink-300 cursor-not-allowed'
                                )}
                                title="升级"
                                disabled={warning.level !== 1}
                              >
                                <TrendingUp className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {pageData.length === 0 && (
                      <tr>
                        <td colSpan={12} className="px-4 py-16 text-center text-ink-400">
                          <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
                          <p>暂无符合条件的预警数据</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredWarnings.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6 py-4 border-t border-ink-100 bg-ink-50/50">
                  <div className="text-sm text-ink-500">
                    共 <span className="font-semibold text-ink-700">{filteredWarnings.length}</span> 条预警，
                    当前第 <span className="font-semibold text-ink-700">{page}</span> / {totalPages} 页
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={cn(
                        'p-2 rounded-lg border border-ink-200 bg-white transition-all duration-200',
                        page === 1 ? 'text-ink-300 cursor-not-allowed' : 'text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                      const pageNum = start + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={cn(
                            'min-w-[38px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200',
                            page === pageNum
                              ? 'bg-gradient-primary text-white shadow-md'
                              : 'bg-white border border-ink-200 text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={cn(
                        'p-2 rounded-lg border border-ink-200 bg-white transition-all duration-200',
                        page === totalPages ? 'text-ink-300 cursor-not-allowed' : 'text-ink-600 hover:bg-primary-50 hover:border-primary-200'
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
