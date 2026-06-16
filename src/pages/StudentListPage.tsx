import { useState, useMemo } from 'react';
import { MainLayout, type BreadcrumbItem } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useStudents } from '@/hooks/useMockData';
import type { StudentProfile, RiskLevel, Gender } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Plus,
  Eye,
  Edit3,
  Bell,
  Star,
  Users,
  AlertTriangle,
  UserPlus,
  X,
  Check,
  SlidersHorizontal,
  GraduationCap,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { label: '首页', href: '/dashboard' },
  { label: '学生档案' },
  { label: '档案列表' },
];

const tabs = [
  { key: 'all', label: '全部学生', icon: Users },
  { key: 'focus', label: '重点关注', icon: Star },
  { key: 'warning', label: '有预警历史', icon: AlertTriangle },
  { key: 'today', label: '今日新增', icon: UserPlus },
];

const colleges = [
  '全部学院', '计算机学院', '经济管理学院', '文学院', '理学院', '工学院', '医学院', '法学院', '外国语学院', '艺术学院', '体育学院'
];

const grades = [
  '全部年级', '大一', '大二', '大三', '大四', '研一', '研二', '研三', '博一', '博二'
];

const majorsMap: Record<string, string[]> = {
  '全部学院': ['全部专业'],
  '计算机学院': ['全部专业', '计算机科学与技术', '软件工程', '人工智能', '数据科学'],
  '经济管理学院': ['全部专业', '经济学', '金融学', '工商管理', '会计学'],
  '文学院': ['全部专业', '汉语言文学', '新闻学', '传播学'],
  '理学院': ['全部专业', '数学', '物理学', '化学', '生物学'],
  '工学院': ['全部专业', '机械工程', '土木工程', '电气工程'],
  '医学院': ['全部专业', '临床医学', '护理学', '药学'],
  '法学院': ['全部专业', '法学', '知识产权'],
  '外国语学院': ['全部专业', '英语', '日语', '法语'],
  '艺术学院': ['全部专业', '美术', '音乐', '设计'],
  '体育学院': ['全部专业', '体育教育', '运动训练'],
};

const riskLevelOptions: { value: RiskLevel | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'safe', label: '安全' },
  { value: 'low', label: '低风险' },
  { value: 'medium', label: '中风险' },
  { value: 'high', label: '高风险' },
];

const genderOptions: { value: Gender | ''; label: string }[] = [
  { value: '', label: '全部' },
  { value: '男', label: '男' },
  { value: '女', label: '女' },
];

const tagPool = ['新生', '贫困生', '独生子女', '留守儿童', '性格内向', '学业困难', '家庭变故', '失恋', '就业焦虑', '身体疾病'];

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

function generateMockStudents(): StudentProfile[] {
  const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '华', '平', '辉', '鹏'];
  const collegeList = colleges.slice(1);
  const gradeList = grades.slice(1);
  const counselorNames = ['王老师', '李老师', '张老师', '刘老师', '陈老师', '杨老师', '黄老师', '周老师'];
  const riskLevels: RiskLevel[] = ['safe', 'safe', 'safe', 'low', 'low', 'medium', 'high'];

  return Array.from({ length: 120 }, (_, i) => {
    const college = collegeList[i % collegeList.length];
    const majorList = majorsMap[college] || ['专业1'];
    const major = majorList[1 + (i % Math.max(1, majorList.length - 1))] || '专业1';
    const grade = gradeList[i % gradeList.length];
    const riskLevel = riskLevels[i % riskLevels.length];
    const emotionIndex = riskLevel === 'high' ? 30 + (i % 15) : riskLevel === 'medium' ? 45 + (i % 15) : riskLevel === 'low' ? 60 + (i % 15) : 75 + (i % 20);
    const warningCount = riskLevel === 'high' ? 2 + (i % 4) : riskLevel === 'medium' ? 1 + (i % 3) : riskLevel === 'low' ? (i % 2) : 0;
    const gender: Gender = i % 2 === 0 ? '男' : '女';
    const classNum = 1 + (i % 6);
    const studentTags: string[] = [];
    tagPool.forEach((tag, idx) => {
      if ((i + idx) % 7 === 0) studentTags.push(tag);
    });

    return {
      id: `STU${String(2026000001 + i).padStart(10, '0')}`,
      name: `${surnames[i % surnames.length]}${names[(i + 5) % names.length]}`,
      gender,
      age: 18 + (i % 10),
      studentNo: `202${i % 5}${String(10000 + i).padStart(6, '0')}`,
      schoolId: 'SCH0001',
      schoolName: '清华大学',
      college,
      major,
      grade,
      className: `${grade}${classNum}班`,
      phone: `1${3 + (i % 4)}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      counselor: counselorNames[i % counselorNames.length],
      currentEmotionIndex: emotionIndex,
      riskLevel,
      warningCount,
      assessmentHistory: [],
      emotionHistory: [],
      warningHistory: [],
      tags: studentTags.slice(0, 3),
    };
  });
}

export default function StudentListPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [college, setCollege] = useState('全部学院');
  const [grade, setGrade] = useState('全部年级');
  const [major, setMajor] = useState('全部专业');
  const [riskLevel, setRiskLevel] = useState<RiskLevel | ''>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [warningRangeMin, setWarningRangeMin] = useState('');
  const [warningRangeMax, setWarningRangeMax] = useState('');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<RiskLevel[]>([]);

  const { data: apiStudents, loading } = useStudents();
  const mockStudents = useMemo(() => generateMockStudents(), []);

  const allStudents = useMemo<StudentProfile[]>(() => {
    return mockStudents;
  }, [mockStudents]);

  const stats = useMemo(() => {
    return {
      total: allStudents.length,
      today: Math.floor(allStudents.length * 0.02),
      risk: allStudents.filter(s => s.riskLevel !== 'safe').length,
      focus: Math.floor(allStudents.length * 0.08),
    };
  }, [allStudents]);

  const majorOptions = useMemo(() => {
    return majorsMap[college] || ['全部专业'];
  }, [college]);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      if (activeTab === 'focus' && s.riskLevel === 'safe') return false;
      if (activeTab === 'warning' && s.warningCount === 0) return false;
      if (activeTab === 'today' && parseInt(s.id.slice(-3)) > 115) return false;
      if (college !== '全部学院' && s.college !== college) return false;
      if (grade !== '全部年级' && s.grade !== grade) return false;
      if (major !== '全部专业' && s.major !== major) return false;
      if (riskLevel && s.riskLevel !== riskLevel) return false;
      if (selectedRiskLevels.length > 0 && !selectedRiskLevels.includes(s.riskLevel)) return false;
      if (gender && s.gender !== gender) return false;
      if (warningRangeMin && s.warningCount < parseInt(warningRangeMin)) return false;
      if (warningRangeMax && s.warningCount > parseInt(warningRangeMax)) return false;
      if (searchValue) {
        const kw = searchValue.toLowerCase();
        if (
          !s.name.toLowerCase().includes(kw) &&
          !s.studentNo.includes(kw) &&
          !(s.phone && s.phone.includes(kw))
        )
          return false;
      }
      return true;
    });
  }, [allStudents, activeTab, college, grade, major, riskLevel, selectedRiskLevels, gender, warningRangeMin, warningRangeMax, searchValue]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const pageData = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () => {
    const exportData = filteredStudents.map((s) => ({
      学号: s.studentNo,
      姓名: s.name,
      性别: s.gender,
      年龄: s.age,
      学院: s.college,
      专业: s.major,
      年级: s.grade,
      班级: s.className,
      当前情绪指数: s.currentEmotionIndex,
      风险等级: getRiskText(s.riskLevel),
      历史预警次数: s.warningCount,
      辅导员: s.counselor,
      联系电话: s.phone || '',
      标签: s.tags.join('、'),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '学生档案');
    XLSX.writeFile(wb, `学生档案_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const toggleRiskLevel = (level: RiskLevel) => {
    setSelectedRiskLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  return (
    <MainLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6 stagger-reveal">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="总人数"
            value={stats.total.toLocaleString()}
            suffix="人"
            color="primary"
            icon={<Users className="h-6 w-6" />}
            trendValue="+2.1%"
            trendType="up"
            description="较上月"
          />
          <StatCard
            title="今日新增"
            value={stats.today}
            suffix="人"
            color="mint"
            icon={<UserPlus className="h-6 w-6" />}
            trendValue="+5"
            trendType="up"
            description="较昨日"
          />
          <StatCard
            title="风险学生"
            value={stats.risk}
            suffix="人"
            color="warning"
            icon={<ShieldAlert className="h-6 w-6" />}
            trendValue="-3.2%"
            trendType="down"
            description="较上月"
          />
          <StatCard
            title="关注名单"
            value={stats.focus}
            suffix="人"
            color="danger"
            icon={<Star className="h-6 w-6" />}
            trendValue="-1.8%"
            trendType="down"
            description="较上月"
          />
        </div>

        <Card>
          <CardContent className="p-4 lg:p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 pb-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPage(1);
                    }}
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    setPage(1);
                  }}
                  placeholder="按姓名、学号、手机号搜索..."
                  className="input-base pl-10"
                />
              </div>

              <button
                onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all duration-200',
                  showAdvancedFilter
                    ? 'bg-primary-50 border-primary-300 text-primary-600'
                    : 'bg-white border-ink-200 text-ink-600 hover:bg-ink-50 hover:border-ink-300'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                高级筛选
                {showAdvancedFilter && <ChevronDown className="h-4 w-4 rotate-180" />}
                {!showAdvancedFilter && <ChevronDown className="h-4 w-4" />}
              </button>

              <div className="flex-1" />

              <button
                onClick={handleExport}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>批量导出</span>
              </button>
              <button className="btn-secondary flex items-center gap-2">
                <Upload className="h-4 w-4" />
                <span>批量导入</span>
              </button>
              <button className="btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>添加学生</span>
              </button>
            </div>

            {showAdvancedFilter && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 p-4 bg-ink-50/60 rounded-xl border border-ink-100 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-500 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    学院
                  </label>
                  <div className="relative">
                    <select
                      value={college}
                      onChange={(e) => {
                        setCollege(e.target.value);
                        setMajor('全部专业');
                        setPage(1);
                      }}
                      className="input-base appearance-none pr-10 cursor-pointer text-sm"
                    >
                      {colleges.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-500 flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    年级
                  </label>
                  <div className="relative">
                    <select
                      value={grade}
                      onChange={(e) => {
                        setGrade(e.target.value);
                        setPage(1);
                      }}
                      className="input-base appearance-none pr-10 cursor-pointer text-sm"
                    >
                      {grades.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-500">专业</label>
                  <div className="relative">
                    <select
                      value={major}
                      onChange={(e) => {
                        setMajor(e.target.value);
                        setPage(1);
                      }}
                      className="input-base appearance-none pr-10 cursor-pointer text-sm"
                    >
                      {majorOptions.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-500">风险等级（多选）</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['safe', 'low', 'medium', 'high'] as RiskLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => toggleRiskLevel(level)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                          selectedRiskLevels.includes(level)
                            ? level === 'safe' ? 'bg-risk-safe/20 border-risk-safe text-risk-safe'
                              : level === 'low' ? 'bg-risk-low/20 border-risk-low text-risk-low'
                              : level === 'medium' ? 'bg-risk-medium/20 border-risk-medium text-risk-medium'
                              : 'bg-risk-high/20 border-risk-high text-risk-high'
                            : 'bg-white border-ink-200 text-ink-500 hover:border-ink-300'
                        )}
                      >
                        {selectedRiskLevels.includes(level) && <Check className="h-3 w-3 inline mr-1" />}
                        {getRiskText(level)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-500">性别</label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value as Gender | '');
                        setPage(1);
                      }}
                      className="input-base appearance-none pr-10 cursor-pointer text-sm"
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-500">预警次数范围</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="最小"
                      value={warningRangeMin}
                      onChange={(e) => {
                        setWarningRangeMin(e.target.value);
                        setPage(1);
                      }}
                      className="input-base text-sm px-3 py-2"
                    />
                    <span className="text-ink-400 text-sm">~</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="最大"
                      value={warningRangeMax}
                      onChange={(e) => {
                        setWarningRangeMax(e.target.value);
                        setPage(1);
                      }}
                      className="input-base text-sm px-3 py-2"
                    />
                  </div>
                </div>

                {(selectedRiskLevels.length > 0 || college !== '全部学院' || grade !== '全部年级' || major !== '全部专业' || gender || warningRangeMin || warningRangeMax) && (
                  <div className="xl:col-span-6 flex justify-end">
                    <button
                      onClick={() => {
                        setCollege('全部学院');
                        setGrade('全部年级');
                        setMajor('全部专业');
                        setRiskLevel('');
                        setSelectedRiskLevels([]);
                        setGender('');
                        setWarningRangeMin('');
                        setWarningRangeMax('');
                        setPage(1);
                      }}
                      className="text-sm text-ink-500 hover:text-primary-600 flex items-center gap-1 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      清空筛选条件
                    </button>
                  </div>
                )}
              </div>
            )}
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
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学号</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">姓名</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">性别</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">年龄</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">学院</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">专业</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">年级</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">班级</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">情绪指数</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">风险等级</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">预警次数</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">辅导员</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap">标签</th>
                      <th className="px-4 py-3.5 text-left font-semibold text-ink-600 whitespace-nowrap sticky right-0 bg-ink-50/80">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((student, idx) => {
                      const isHighRisk = student.riskLevel === 'high';
                      return (
                        <tr
                          key={student.id}
                          className={cn(
                            'border-b border-ink-50 transition-all duration-200 hover:bg-primary-50/30 group',
                            isHighRisk && 'bg-warning-high/5'
                          )}
                          style={{ animationDelay: `${idx * 0.02}s` }}
                        >
                          <td className={cn('px-4 py-3.5', isHighRisk && 'border-l-4 border-l-warning-high')}>
                            <span className="font-mono text-xs text-ink-500">{student.studentNo}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-medium text-ink-800">{student.name}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-600">{student.gender}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-600">{student.age}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-700">{student.college}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-600 whitespace-nowrap">{student.major}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-600">{student.grade}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-600">{student.className}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    student.currentEmotionIndex < 50 ? 'bg-warning-high'
                                      : student.currentEmotionIndex < 65 ? 'bg-warning-low'
                                      : student.currentEmotionIndex < 80 ? 'bg-risk-low'
                                      : 'bg-risk-safe'
                                  )}
                                  style={{ width: `${student.currentEmotionIndex}%` }}
                                />
                              </div>
                              <span className={cn(
                                'font-semibold text-xs',
                                student.currentEmotionIndex < 50 ? 'text-warning-high'
                                  : student.currentEmotionIndex < 65 ? 'text-warning-low'
                                  : student.currentEmotionIndex < 80 ? 'text-risk-low'
                                  : 'text-risk-safe'
                              )}>
                                {student.currentEmotionIndex}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge color={getRiskBadgeColor(student.riskLevel)} size="sm" withDot>
                              {getRiskText(student.riskLevel)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              'font-semibold',
                              student.warningCount >= 3 ? 'text-warning-high'
                                : student.warningCount >= 1 ? 'text-warning-low'
                                : 'text-ink-500'
                            )}>
                              {student.warningCount}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-ink-600 whitespace-nowrap">{student.counselor}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1 max-w-[160px]">
                              {student.tags.slice(0, 2).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 text-[10px] rounded-md bg-ink-100 text-ink-600 font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                              {student.tags.length > 2 && (
                                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-ink-100 text-ink-500">
                                  +{student.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 sticky right-0 bg-inherit group-hover:bg-primary-50/60">
                            <div className="flex items-center gap-1">
                              <button
                                className="p-1.5 rounded-lg text-primary-500 hover:bg-primary-50 transition-colors"
                                title="查看详情"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-mint-600 hover:bg-mint-50 transition-colors"
                                title="编辑"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-warning-low hover:bg-warning-low/10 transition-colors"
                                title="发送预警通知"
                              >
                                <Bell className="h-4 w-4" />
                              </button>
                              <button
                                className={cn(
                                  'p-1.5 rounded-lg transition-colors',
                                  student.riskLevel === 'safe'
                                    ? 'text-ink-400 hover:bg-warning-low/10 hover:text-warning-low'
                                    : 'text-warning-low bg-warning-low/10'
                                )}
                                title={student.riskLevel !== 'safe' ? '已加入重点关注' : '加入重点关注'}
                              >
                                <Star className={cn('h-4 w-4', student.riskLevel !== 'safe' && 'fill-current')} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {pageData.length === 0 && (
                      <tr>
                        <td colSpan={14} className="px-4 py-16 text-center text-ink-400">
                          <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
                          <p>暂无符合条件的学生数据</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 px-4 lg:px-6 py-4 border-t border-ink-100 bg-ink-50/50">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-ink-500">
                      共 <span className="font-semibold text-ink-700">{filteredStudents.length}</span> 条数据
                    </span>
                    <div className="relative">
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                        className="input-base appearance-none pr-8 cursor-pointer text-sm py-1.5 px-3"
                      >
                        {[10, 20, 50, 100].map((n) => (
                          <option key={n} value={n}>{n} 条/页</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400 pointer-events-none" />
                    </div>
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
