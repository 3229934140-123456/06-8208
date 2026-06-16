import { useState, useEffect, useCallback } from 'react'
import type { WarningFilter } from '@/store/appStore'

interface HookResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

interface KPIData {
  totalStudents: number
  totalSchools: number
  totalWarnings: number
  focusStudents: number
  trend: {
    students: number
    warnings: number
    focus: number
  }
}

interface ProvinceData {
  name: string
  value: number
  studentCount: number
  warningCount: number
}

interface School {
  id: string
  name: string
  province: string
  type: string
  studentCount: number
  warningCount: number
  averageScore: number
  contact: string
  phone: string
}

interface Warning {
  id: string
  studentId: string
  studentName: string
  school: string
  level: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  type: string
  source: string
  createTime: string
  handler?: string
  description: string
}

interface WarningDetail extends Warning {
  history: { time: string; action: string; operator: string; remark: string }[]
  relatedEvents: { id: string; type: string; time: string; content: string }[]
  assessment: {
    depressionScore: number
    anxietyScore: number
    stressScore: number
    sleepQuality: number
    socialFunction: number
  }
}

interface Student {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  school: string
  college: string
  major: string
  grade: string
  studentNo: string
  riskLevel: 'normal' | 'attention' | 'warning' | 'danger'
  lastAssessment: string
  counselor: string
  phone: string
}

interface StudentDetail extends Student {
  guardian: {
    name: string
    relationship: string
    phone: string
  }
  mentalHealth: {
    latestScore: number
    trend: number[]
    history: { time: string; score: number; type: string }[]
  }
  warningHistory: { id: string; level: string; time: string; status: string }[]
  counselingRecords: { id: string; time: string; counselor: string; summary: string }[]
}

interface Report {
  id: string
  title: string
  period: string
  school: string
  createTime: string
  author: string
  status: 'draft' | 'submitted' | 'approved'
  summary: string
}

interface ReportDetail extends Report {
  sections: {
    title: string
    content: string
    data?: Record<string, unknown>
  }[]
  attachments: { name: string; size: string; type: string }[]
}

interface SchoolDetail extends School {
  collegeEmotions: {
    college: string
    trend: { date: string; score: number }[]
    avgScore: number
  }[]
  assessmentDimensions: {
    dimension: string
    score: number
    maxScore: number
    benchmark: number
  }[]
  timeline: {
    date: string
    events: { type: string; title: string; content: string; count?: number }[]
  }[]
  collegeList: {
    id: string
    name: string
    studentCount: number
    warningCount: number
    avgScore: number
  }[]
}

const mockDelay = (min = 200, max = 500) =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min))

function useMockFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []): HookResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  const refetch = useCallback(() => setKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ...deps])

  return { data, loading, error, refetch }
}

const generateKPIData = (): KPIData => ({
  totalStudents: 1258643,
  totalSchools: 2847,
  totalWarnings: 3421,
  focusStudents: 15632,
  trend: {
    students: 2.3,
    warnings: -5.1,
    focus: -8.4,
  },
})

const provinceNames = [
  '北京', '上海', '广东', '江苏', '浙江', '山东', '河南', '四川', '湖北', '湖南',
  '河北', '安徽', '福建', '江西', '辽宁', '陕西', '重庆', '黑龙江', '吉林', '山西',
  '广西', '云南', '贵州', '甘肃', '内蒙古', '新疆', '海南', '宁夏', '青海', '西藏', '天津',
]

const generateProvinceData = (): ProvinceData[] =>
  provinceNames.map((name) => ({
    name,
    value: Math.floor(Math.random() * 100) + 20,
    studentCount: Math.floor(Math.random() * 80000) + 5000,
    warningCount: Math.floor(Math.random() * 300) + 10,
  }))

const schoolTypes = ['综合类', '理工类', '师范类', '医药类', '财经类', '农林类', '艺术类', '体育类']
const schoolNamePrefixes = ['清华', '北京', '华东', '南京', '浙江', '复旦', '上海', '中山', '武汉', '四川', '西安', '哈尔滨', '吉林', '山东', '南开', '天津', '中国', '中央', '国防', '华中']
const schoolNameSuffixes = ['大学', '理工大学', '师范大学', '科技大学', '工业大学', '农业大学', '医科大学', '财经大学', '政法大学', '海洋大学']

const generateSchools = (province?: string, type?: string): School[] => {
  const list: School[] = []
  const count = 50
  for (let i = 0; i < count; i++) {
    const prefix = schoolNamePrefixes[i % schoolNamePrefixes.length]
    const suffix = schoolNameSuffixes[i % schoolNameSuffixes.length]
    const t = schoolTypes[i % schoolTypes.length]
    const p = provinceNames[i % provinceNames.length]
    list.push({
      id: `SCH${String(i + 1).padStart(4, '0')}`,
      name: `${prefix}${suffix}`,
      province: p,
      type: t,
      studentCount: Math.floor(Math.random() * 40000) + 3000,
      warningCount: Math.floor(Math.random() * 80) + 2,
      averageScore: Math.floor(Math.random() * 30) + 60,
      contact: `联系人${i + 1}`,
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    })
  }
  return list.filter(
    (s) => (!province || s.province === province) && (!type || s.type === type)
  )
}

const warningTypes = ['情绪低落', '焦虑倾向', '睡眠障碍', '人际关系', '学业压力', '家庭问题', '自伤倾向', '自杀意念']
const warningSources = ['心理测评', '辅导员上报', '心理咨询记录', 'APP行为监测', '门禁异常', '消费异常', '同学反映', '课堂表现']
const warningStatuses: Warning['status'][] = ['pending', 'processing', 'resolved', 'closed']
const warningLevels: Warning['level'][] = ['low', 'medium', 'high', 'critical']

const generateWarnings = (filter?: WarningFilter): Warning[] => {
  const list: Warning[] = []
  for (let i = 0; i < 80; i++) {
    const level = warningLevels[i % warningLevels.length]
    const status = warningStatuses[i % warningStatuses.length]
    const type = warningTypes[i % warningTypes.length]
    const w: Warning = {
      id: `WRN${String(i + 1).padStart(6, '0')}`,
      studentId: `STU${String(1000 + i).padStart(6, '0')}`,
      studentName: `学生${i + 1}`,
      school: `${schoolNamePrefixes[i % schoolNamePrefixes.length]}${schoolNameSuffixes[i % schoolNameSuffixes.length]}`,
      level,
      status,
      type,
      source: warningSources[i % warningSources.length],
      createTime: new Date(Date.now() - i * 3600000 * Math.random() * 24).toISOString(),
      handler: i % 3 === 0 ? undefined : `处理人${(i % 10) + 1}`,
      description: `该学生近期表现出${type}相关症状，需关注并跟进处理。建议进行心理评估和辅导。`,
    }
    list.push(w)
  }
  return list.filter((w) => {
    if (filter?.level && w.level !== filter.level) return false
    if (filter?.status && w.status !== filter.status) return false
    if (filter?.keyword) {
      const kw = filter.keyword.toLowerCase()
      if (
        !w.studentName.toLowerCase().includes(kw) &&
        !w.type.toLowerCase().includes(kw) &&
        !w.school.toLowerCase().includes(kw)
      )
        return false
    }
    return true
  })
}

const generateWarningDetail = (id: string): WarningDetail => {
  const baseList = generateWarnings()
  const base = baseList.find((w) => w.id === id) || baseList[0]
  return {
    ...base,
    history: [
      { time: new Date(Date.now() - 86400000 * 3).toISOString(), action: '创建预警', operator: '系统自动', remark: '根据测评数据触发' },
      { time: new Date(Date.now() - 86400000 * 2).toISOString(), action: '分配处理', operator: '管理员', remark: '分配给辅导员处理' },
      { time: new Date(Date.now() - 86400000).toISOString(), action: '首次约谈', operator: base.handler || '辅导员', remark: '已进行初步沟通，学生情绪有所缓解' },
    ],
    relatedEvents: [
      { id: 'E1', type: '心理测评', time: new Date(Date.now() - 86400000 * 7).toISOString(), content: 'SDS测评得分68分（中度抑郁）' },
      { id: 'E2', type: '异常行为', time: new Date(Date.now() - 86400000 * 5).toISOString(), content: '连续3天凌晨2点后仍在校外' },
      { id: 'E3', type: '课堂表现', time: new Date(Date.now() - 86400000 * 2).toISOString(), content: '近期旷课4节' },
    ],
    assessment: {
      depressionScore: 68,
      anxietyScore: 72,
      stressScore: 65,
      sleepQuality: 45,
      socialFunction: 52,
    },
  }
}

const colleges = ['计算机学院', '经济管理学院', '文学院', '理学院', '工学院', '医学院', '法学院', '外国语学院', '艺术学院', '体育学院']
const majorsMap: Record<string, string[]> = {
  计算机学院: ['计算机科学与技术', '软件工程', '人工智能', '数据科学'],
  经济管理学院: ['经济学', '金融学', '工商管理', '会计学'],
  文学院: ['汉语言文学', '新闻学', '传播学'],
  理学院: ['数学', '物理学', '化学', '生物学'],
  工学院: ['机械工程', '土木工程', '电气工程'],
  医学院: ['临床医学', '护理学', '药学'],
  法学院: ['法学', '知识产权'],
  外国语学院: ['英语', '日语', '法语'],
  艺术学院: ['美术', '音乐', '设计'],
  体育学院: ['体育教育', '运动训练'],
}
const riskLevels: Student['riskLevel'][] = ['normal', 'attention', 'warning', 'danger']
const grades = ['大一', '大二', '大三', '大四', '研一', '研二', '研三', '博一', '博二']

const generateStudents = (search?: string, riskLevel?: string): Student[] => {
  const list: Student[] = []
  for (let i = 0; i < 120; i++) {
    const college = colleges[i % colleges.length]
    const majorList = majorsMap[college]
    const s: Student = {
      id: `STU${String(1000 + i).padStart(6, '0')}`,
      name: `学生${i + 1}`,
      gender: i % 2 === 0 ? 'male' : 'female',
      age: 18 + (i % 8),
      school: `${schoolNamePrefixes[i % schoolNamePrefixes.length]}${schoolNameSuffixes[i % schoolNameSuffixes.length]}`,
      college,
      major: majorList[i % majorList.length],
      grade: grades[i % grades.length],
      studentNo: `202${i % 5}${String(10000 + i).padStart(6, '0')}`,
      riskLevel: riskLevels[i % riskLevels.length],
      lastAssessment: new Date(Date.now() - i * 86400000 * 2).toISOString().split('T')[0],
      counselor: `辅导员${(i % 15) + 1}`,
      phone: `139${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    }
    list.push(s)
  }
  return list.filter((s) => {
    if (riskLevel && s.riskLevel !== riskLevel) return false
    if (search) {
      const kw = search.toLowerCase()
      if (
        !s.name.toLowerCase().includes(kw) &&
        !s.studentNo.includes(kw) &&
        !s.major.toLowerCase().includes(kw) &&
        !s.college.toLowerCase().includes(kw)
      )
        return false
    }
    return true
  })
}

const generateStudentDetail = (id: string): StudentDetail => {
  const baseList = generateStudents()
  const base = baseList.find((s) => s.id === id) || baseList[0]
  const trendScores = Array.from({ length: 12 }, () => Math.floor(Math.random() * 40) + 50)
  return {
    ...base,
    guardian: {
      name: `家长${base.id.slice(-2)}`,
      relationship: '父亲',
      phone: `137${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    },
    mentalHealth: {
      latestScore: trendScores[trendScores.length - 1],
      trend: trendScores,
      history: [
        { time: '2025-09-15', score: 72, type: 'SDS自评量表' },
        { time: '2025-11-20', score: 68, type: 'SAS焦虑量表' },
        { time: '2026-02-10', score: 65, type: 'PHQ-9抑郁筛查' },
        { time: '2026-04-18', score: 58, type: '季度心理测评' },
      ],
    },
    warningHistory: [
      { id: 'WH1', level: '高风险', time: '2026-03-10', status: '已处理' },
      { id: 'WH2', level: '中风险', time: '2026-01-22', status: '已关闭' },
    ],
    counselingRecords: [
      { id: 'C1', time: '2026-05-12', counselor: '王老师', summary: '进行了第一次心理咨询，讨论学业压力问题。' },
      { id: 'C2', time: '2026-05-19', counselor: '王老师', summary: '第二次咨询，情绪有所改善，继续跟进。' },
      { id: 'C3', time: '2026-05-26', counselor: '李老师', summary: '转介后咨询，已建立良好咨访关系。' },
    ],
  }
}

const reportPeriods = ['2026年第20周', '2026年第19周', '2026年第18周', '2026年第17周', '2026年第16周', '2026年第15周']
const reportStatuses: Report['status'][] = ['approved', 'submitted', 'approved', 'approved', 'draft', 'approved']

const generateReports = (): Report[] =>
  reportPeriods.map((period, i) => ({
    id: `RPT${String(20260000 + i + 1).padStart(8, '0')}`,
    title: `${period}心理健康工作周报`,
    period,
    school: `${schoolNamePrefixes[i % schoolNamePrefixes.length]}${schoolNameSuffixes[i % schoolNameSuffixes.length]}`,
    createTime: new Date(Date.now() - i * 7 * 86400000).toISOString().split('T')[0],
    author: `作者${i + 1}`,
    status: reportStatuses[i],
    summary: `本周心理健康工作整体平稳，开展了多项活动，处理了若干预警案例。学生心理健康水平总体良好。`,
  }))

const generateReportDetail = (id: string): ReportDetail => {
  const baseList = generateReports()
  const base = baseList.find((r) => r.id === id) || baseList[0]
  return {
    ...base,
    sections: [
      { title: '一、本周工作概述', content: '本周心理健康教育中心持续开展日常工作，包括心理咨询、团体辅导、危机干预等。' },
      {
        title: '二、数据统计分析',
        content: '本周共接待个体咨询45人次，开展团体辅导3场，处理预警12起。',
        data: { consultation: 45, groupCounseling: 3, warnings: 12 },
      },
      { title: '三、重点案例情况', content: '本周重点关注学生5人，其中2人已转介至专科医院，3人持续跟进中。' },
      { title: '四、下周工作计划', content: '1. 继续开展日常咨询工作；2. 组织心理健康讲座1场；3. 跟进重点学生。' },
    ],
    attachments: [
      { name: '预警案例详情表.xlsx', size: '156KB', type: 'excel' },
      { name: '咨询记录汇总.pdf', size: '2.3MB', type: 'pdf' },
    ],
  }
}

const generateSchoolDetail = (id: string): SchoolDetail => {
  const baseList = generateSchools()
  const base = baseList.find((s) => s.id === id) || baseList[0]
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })
  return {
    ...base,
    collegeEmotions: colleges.slice(0, 6).map((college) => ({
      college,
      trend: days.map((date) => ({ date, score: Math.floor(Math.random() * 20) + 70 })),
      avgScore: Math.floor(Math.random() * 15) + 75,
    })),
    assessmentDimensions: [
      { dimension: '抑郁水平', score: 28, maxScore: 100, benchmark: 35 },
      { dimension: '焦虑水平', score: 32, maxScore: 100, benchmark: 38 },
      { dimension: '压力感知', score: 45, maxScore: 100, benchmark: 50 },
      { dimension: '睡眠质量', score: 68, maxScore: 100, benchmark: 60 },
      { dimension: '社会适应', score: 72, maxScore: 100, benchmark: 65 },
      { dimension: '自我认知', score: 65, maxScore: 100, benchmark: 60 },
    ],
    timeline: days.slice(-7).map((date) => ({
      date,
      events: [
        { type: 'counseling', title: '心理咨询', content: '当日咨询人次', count: 3 + Math.floor(Math.random() * 8) },
        { type: 'warning', title: '预警处理', content: '新增预警', count: Math.floor(Math.random() * 3) },
        { type: 'activity', title: '心理活动', content: '当日开展活动', count: Math.random() > 0.5 ? 1 : 0 },
      ].filter((e) => e.count !== 0),
    })),
    collegeList: colleges.map((name, i) => ({
      id: `COL${String(i + 1).padStart(3, '0')}`,
      name,
      studentCount: Math.floor(Math.random() * 3000) + 500,
      warningCount: Math.floor(Math.random() * 15),
      avgScore: Math.floor(Math.random() * 20) + 70,
    })),
  }
}

export const useKPIData = (): HookResult<KPIData> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateKPIData()
  })

export const useProvinceData = (): HookResult<ProvinceData[]> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateProvinceData()
  })

export const useSchools = (province?: string, type?: string): HookResult<School[]> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateSchools(province, type)
  }, [province, type])

export const useWarnings = (filter?: WarningFilter): HookResult<Warning[]> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateWarnings(filter)
  }, [filter?.level, filter?.status, filter?.keyword])

export const useWarningDetail = (id: string): HookResult<WarningDetail> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateWarningDetail(id)
  }, [id])

export const useStudents = (search?: string, riskLevel?: string): HookResult<Student[]> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateStudents(search, riskLevel)
  }, [search, riskLevel])

export const useStudentDetail = (id: string): HookResult<StudentDetail> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateStudentDetail(id)
  }, [id])

export const useReports = (): HookResult<Report[]> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateReports()
  })

export const useReportDetail = (id: string): HookResult<ReportDetail> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateReportDetail(id)
  }, [id])

export const useSchoolDetail = (id: string): HookResult<SchoolDetail> =>
  useMockFetch(async () => {
    await mockDelay()
    return generateSchoolDetail(id)
  }, [id])

export type {
  KPIData,
  ProvinceData,
  School,
  Warning,
  WarningDetail,
  Student,
  StudentDetail,
  Report,
  ReportDetail,
  SchoolDetail,
}
