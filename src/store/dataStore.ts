import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  generateSchools,
  generateStudents,
  generateWarnings,
  generateWeeklyReports,
} from '@/utils/mockData/generator'
import type {
  School,
  StudentProfile,
  WarningRecord,
  WeeklyReport,
  KPIData,
  ProvinceData,
  WarningStatus,
  RiskLevel,
  WarningLevel,
  InterventionRecord,
  ReportScope,
  AssessmentDimension,
  Gender,
} from '@/types'

export interface WarningFilter {
  level?: WarningLevel
  status?: WarningStatus
  riskLevel?: RiskLevel
  province?: string
  schoolId?: string
  college?: string
  keyword?: string
  dateRange?: [string, string]
}

export interface StudentFilter {
  schoolId?: string
  province?: string
  keyword?: string
  riskLevel?: RiskLevel
  riskLevels?: RiskLevel[]
  college?: string
  grade?: string
  major?: string
  gender?: Gender
  warningCountMin?: number
  warningCountMax?: number
  isFocus?: boolean
  hasWarning?: boolean
  isTodayNew?: boolean
}

export interface SchoolFilter {
  province?: string
  type?: string
  schoolId?: string
}

export interface ReportFilter {
  province?: string
  schoolId?: string
  scope?: 'national' | 'province' | 'school'
}

export interface UploadRecord {
  id: string
  time: string
  fileName: string
  successCount: number
  failCount: number
  skipCount: number
  operator: string
}

interface DataState {
  schools: School[]
  students: StudentProfile[]
  warnings: WarningRecord[]
  reports: WeeklyReport[]
  focusedStudentIds: string[]
  uploadRecords: UploadRecord[]
  isInitialized: boolean

  initializeData: () => void
  resetAllData: () => void

  getSchools: (filter?: SchoolFilter) => School[]
  getSchoolById: (id: string) => School | undefined

  getStudents: (filter?: StudentFilter) => StudentProfile[]
  getStudentById: (id: string) => StudentProfile | undefined
  addStudents: (students: StudentProfile[]) => string[]
  updateStudent: (id: string, patch: Partial<StudentProfile>) => void

  getWarnings: (filter?: WarningFilter) => WarningRecord[]
  getWarningById: (id: string) => WarningRecord | undefined
  addWarning: (warning: Omit<WarningRecord, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateWarningStatus: (id: string, status: WarningStatus) => void
  escalateWarning: (id: string) => boolean
  approveWarningStage: (
    warningId: string,
    stage: 1 | 2 | 3,
    approverId: string,
    approverName: string,
    comment: string,
    approved: boolean
  ) => boolean
  addIntervention: (warningId: string, intervention: Omit<InterventionRecord, 'id' | 'warningId' | 'createdAt'>) => void
  resolveWarning: (id: string) => boolean

  getReports: (filter?: ReportFilter) => WeeklyReport[]
  getReportById: (id: string) => WeeklyReport | undefined
  generateReport: (scope: ReportScope, scopeId: string | undefined, weekStart: string, weekEnd: string) => string

  getKPIData: (scope?: { province?: string; schoolId?: string }) => KPIData
  getProvinceData: (scope?: { province?: string }) => ProvinceData[]

  isFocusStudent: (studentId: string) => boolean
  getFocusStudents: () => StudentProfile[]
  toggleFocusStudent: (studentId: string) => void

  getUploadRecords: () => UploadRecord[]
  addUploadRecord: (record: Omit<UploadRecord, 'id' | 'time'>) => void
}

function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8)}`
}

function formatDateStr(date: Date): string {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0') +
    ' ' +
    String(date.getHours()).padStart(2, '0') +
    ':' +
    String(date.getMinutes()).padStart(2, '0') +
    ':' +
    String(date.getSeconds()).padStart(2, '0')
  )
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

const STAGE_NAMES: Record<number, string> = {
  1: '学院初审',
  2: '中心复核',
  3: '学校审批',
}

const APPROVER_ROLES = ['辅导员', '学院心理工作站', '学校心理咨询中心']

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      schools: [],
      students: [],
      warnings: [],
      reports: [],
      focusedStudentIds: [],
      uploadRecords: [],
      isInitialized: false,

      initializeData: () => {
        const { isInitialized } = get()
        if (isInitialized) return

        const schools = generateSchools(42)
        const students = generateStudents(schools, 220, 44)
        const warnings = generateWarnings(schools, students, 65, 46)
        const reports = generateWeeklyReports(schools, 'national', '全国', 48)

        set({
          schools,
          students,
          warnings,
          reports,
          isInitialized: true,
        })
      },

      resetAllData: () => {
        const schools = generateSchools(Math.floor(Math.random() * 1000))
        const students = generateStudents(schools, 220, Math.floor(Math.random() * 1000) + 10)
        const warnings = generateWarnings(schools, students, 65, Math.floor(Math.random() * 1000) + 20)
        const reports = generateWeeklyReports(schools, 'national', '全国', Math.floor(Math.random() * 1000) + 30)

        set({
          schools,
          students,
          warnings,
          reports,
          isInitialized: true,
        })
      },

      getSchools: (filter?: SchoolFilter) => {
        const { schools } = get()
        if (!filter) return schools

        return schools.filter((s) => {
          if (filter.province && s.province !== filter.province) return false
          if (filter.type && s.type !== filter.type) return false
          if (filter.schoolId && s.id !== filter.schoolId) return false
          return true
        })
      },

      getSchoolById: (id: string) => {
        const { schools } = get()
        return schools.find((s) => s.id === id)
      },

      getStudents: (filter?: StudentFilter) => {
        const { students, schools } = get()
        if (!filter) return students

        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]

        return students.filter((s) => {
          if (filter.schoolId && s.schoolId !== filter.schoolId) return false
          if (filter.province) {
            const school = schools.find((sch) => sch.id === s.schoolId)
            if (!school || school.province !== filter.province) return false
          }
          if (filter.riskLevel && s.riskLevel !== filter.riskLevel) return false
          if (filter.riskLevels && filter.riskLevels.length > 0 && !filter.riskLevels.includes(s.riskLevel)) return false
          if (filter.college && s.college !== filter.college) return false
          if (filter.grade && s.grade !== filter.grade) return false
          if (filter.major && filter.major !== '全部专业' && s.major !== filter.major) return false
          if (filter.gender && s.gender !== filter.gender) return false
          if (filter.warningCountMin !== undefined && s.warningCount < filter.warningCountMin) return false
          if (filter.warningCountMax !== undefined && s.warningCount > filter.warningCountMax) return false
          if (filter.hasWarning && s.warningCount === 0) return false
          if (filter.isFocus && !get().isFocusStudent(s.id)) return false
          if (filter.isTodayNew) {
            const studentDate = s.id.startsWith('STD') ? s.id.slice(3, 11) : s.id.slice(3, 11)
            if (studentDate !== todayStr.replace(/-/g, '')) return false
          }
          if (filter.keyword) {
            const kw = filter.keyword.toLowerCase()
            if (
              !s.name.toLowerCase().includes(kw) &&
              !s.studentNo.includes(kw) &&
              !s.phone?.includes(kw) &&
              !s.major.toLowerCase().includes(kw) &&
              !s.college.toLowerCase().includes(kw)
            ) {
              return false
            }
          }
          return true
        })
      },

      getStudentById: (id: string) => {
        const { students } = get()
        return students.find((s) => s.id === id)
      },

      addStudents: (newStudents: StudentProfile[]) => {
        const { students } = get()
        const existingIds = new Set(students.map((s) => s.id))
        const existingNos = new Set(students.map((s) => s.studentNo))

        const addedIds: string[] = []
        const studentsToAdd: StudentProfile[] = []

        newStudents.forEach((student) => {
          if (existingIds.has(student.id)) return
          if (existingNos.has(student.studentNo)) return

          const id = student.id || generateId('STD')
          studentsToAdd.push({ ...student, id })
          addedIds.push(id)
          existingIds.add(id)
          existingNos.add(student.studentNo)
        })

        if (studentsToAdd.length > 0) {
          set({ students: [...students, ...studentsToAdd] })
        }

        return addedIds
      },

      updateStudent: (id: string, patch: Partial<StudentProfile>) => {
        set((state) => ({
          students: state.students.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }))
      },

      getWarnings: (filter?: WarningFilter) => {
        const { warnings } = get()
        if (!filter) return warnings

        return warnings.filter((w) => {
          if (filter.level && w.level !== filter.level) return false
          if (filter.status && w.status !== filter.status) return false
          if (filter.riskLevel && w.riskLevel !== filter.riskLevel) return false
          if (filter.schoolId && w.schoolId !== filter.schoolId) return false
          if (filter.college && w.college !== filter.college) return false
          if (filter.province) {
            const school = get().schools.find((s) => s.id === w.schoolId)
            if (!school || school.province !== filter.province) return false
          }
          if (filter.keyword) {
            const kw = filter.keyword.toLowerCase()
            if (
              !w.studentName.toLowerCase().includes(kw) &&
              !w.schoolName.toLowerCase().includes(kw) &&
              !w.id.toLowerCase().includes(kw) &&
              !w.triggerReason.toLowerCase().includes(kw)
            ) {
              return false
            }
          }
          if (filter.dateRange) {
            const [start, end] = filter.dateRange
            const warningDate = new Date(w.createdAt)
            if (warningDate < new Date(start) || warningDate > new Date(end)) return false
          }
          return true
        })
      },

      getWarningById: (id: string) => {
        const { warnings } = get()
        return warnings.find((w) => w.id === id)
      },

      addWarning: (warning) => {
        const id = generateId('WRN')
        const now = formatDateStr(new Date())

        const newWarning: WarningRecord = {
          ...warning,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          warnings: [newWarning, ...state.warnings],
        }))

        return id
      },

      updateWarningStatus: (id: string, status: WarningStatus) => {
        const statusTextMap: Record<WarningStatus, string> = {
          pending: '待处理',
          processing: '处理中',
          approved: '审批通过',
          resolved: '已处置',
          rejected: '已驳回',
          escalating: '升级中',
        }

        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id
              ? { ...w, status, statusText: statusTextMap[status], updatedAt: formatDateStr(new Date()) }
              : w
          ),
        }))
      },

      escalateWarning: (id: string) => {
        const { warnings } = get()
        const warning = warnings.find((w) => w.id === id)
        if (!warning || warning.level !== 1) return false

        const now = formatDateStr(new Date())
        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id
              ? {
                  ...w,
                  level: 2,
                  escalating: true,
                  escalatedAt: now,
                  approvalStage: 0,
                  status: 'pending',
                  statusText: '待处理',
                  approvals: [],
                  updatedAt: now,
                }
              : w
          ),
        }))
        return true
      },

      resolveWarning: (id: string) => {
        const { warnings } = get()
        const warning = warnings.find((w) => w.id === id)
        if (!warning) return false
        if (warning.status === 'resolved') return false

        const now = formatDateStr(new Date())
        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === id
              ? {
                  ...w,
                  status: 'resolved',
                  statusText: '已处置',
                  updatedAt: now,
                }
              : w
          ),
        }))
        return true
      },

      approveWarningStage: (
        warningId: string,
        stage: 1 | 2 | 3,
        approverId: string,
        approverName: string,
        comment: string,
        approved: boolean
      ) => {
        const { warnings } = get()
        const warning = warnings.find((w) => w.id === warningId)
        if (!warning) return false

        const currentStage = warning.approvalStage || 0
        if (stage !== currentStage + 1 && !(stage === 1 && currentStage === 0)) {
          if (stage > currentStage + 1) return false
        }

        const now = formatDateStr(new Date())
        const approvalRecord = {
          id: `${warningId}-AP${stage}`,
          warningId,
          stage,
          stageName: STAGE_NAMES[stage],
          approverId,
          approverName,
          approverRole: APPROVER_ROLES[stage - 1] || '审批人',
          status: approved ? ('approved' as const) : ('rejected' as const),
          comment: comment || undefined,
          createdAt: now,
        }

        let newStage: 0 | 1 | 2 | 3 = currentStage as 0 | 1 | 2 | 3
        let newStatus: WarningStatus = warning.status
        let newStatusText = warning.statusText

        if (approved) {
          if (stage >= 3) {
            newStage = 3
            newStatus = 'approved'
            newStatusText = '审批通过'
          } else {
            newStage = (stage + 1) as 1 | 2 | 3
            newStatus = 'processing'
            newStatusText = '处理中'
          }
        } else {
          newStatus = 'rejected'
          newStatusText = '已驳回'
        }

        const updatedApprovals = [...warning.approvals.filter((a) => a.stage !== stage), approvalRecord]

        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === warningId
              ? {
                  ...w,
                  approvalStage: newStage,
                  status: newStatus,
                  statusText: newStatusText,
                  approvals: updatedApprovals,
                  updatedAt: now,
                }
              : w
          ),
        }))

        return true
      },

      addIntervention: (warningId: string, intervention) => {
        const id = generateId('IV')
        const now = formatDateStr(new Date())

        const newIntervention: InterventionRecord = {
          ...intervention,
          id,
          warningId,
          createdAt: now,
        }

        set((state) => ({
          warnings: state.warnings.map((w) =>
            w.id === warningId
              ? { ...w, interventions: [...w.interventions, newIntervention], updatedAt: now }
              : w
          ),
        }))
      },

      getReports: (filter?: ReportFilter) => {
        const { reports, schools } = get()
        if (!filter) return reports

        return reports.filter((r) => {
          if (filter.scope && r.scope !== filter.scope) return false

          if (filter.province) {
            if (r.scope === 'province' && r.scopeName !== filter.province) return false
            if (r.scope === 'school') {
              const school = schools.find((s) => s.name === r.scopeName)
              if (!school || school.province !== filter.province) return false
            }
          }

          if (filter.schoolId) {
            if (r.scope === 'school') {
              const school = schools.find((s) => s.name === r.scopeName)
              if (!school || school.id !== filter.schoolId) return false
            } else if (r.scope !== 'national' && r.scope !== 'province') {
              return false
            }
          }

          return true
        })
      },

      getReportById: (id: string) => {
        const { reports } = get()
        return reports.find((r) => r.id === id)
      },

      generateReport: (scope: ReportScope, scopeId: string, weekStart: string, weekEnd: string) => {
        const { schools, warnings, students, reports } = get()

        let scopeName = '全国'
        let scopeSchools = schools

        if (scope === 'province') {
          scopeName = scopeId
          scopeSchools = schools.filter((s) => s.province === scopeId)
        } else if (scope === 'school') {
          const school = schools.find((s) => s.id === scopeId)
          scopeName = school?.name || scopeId
          scopeSchools = school ? [school] : []
        }

        const schoolIds = new Set(scopeSchools.map((s) => s.id))
        const scopeStudents = students.filter((s) => schoolIds.has(s.schoolId))

        const weekStartDate = new Date(weekStart)
        const weekEndDate = new Date(weekEnd)
        weekEndDate.setHours(23, 59, 59, 999)

        const weekWarnings = warnings.filter((w) => {
          if (!schoolIds.has(w.schoolId)) return false
          const warningDate = new Date(w.createdAt)
          return warningDate >= weekStartDate && warningDate <= weekEndDate
        })

        const totalWarnings = weekWarnings.length
        const resolvedWarnings = weekWarnings.filter(
          (w) => w.status === 'resolved' || w.status === 'approved'
        ).length

        const riskCounts = { safe: 0, low: 0, medium: 0, high: 0 }
        scopeStudents.forEach((s) => {
          riskCounts[s.riskLevel]++
        })

        let avgResponseHours = 0
        const warningsWithInterventions = weekWarnings.filter((w) => w.interventions.length > 0)
        if (warningsWithInterventions.length > 0) {
          const totalHours = warningsWithInterventions.reduce((sum, w) => {
            const firstIntervention = w.interventions[w.interventions.length - 1]
            if (firstIntervention) {
              const created = new Date(w.createdAt).getTime()
              const intervened = new Date(firstIntervention.createdAt).getTime()
              const hours = Math.max(0.1, (intervened - created) / (1000 * 60 * 60))
              return sum + hours
            }
            return sum + 4
          }, 0)
          avgResponseHours = parseFloat((totalHours / warningsWithInterventions.length).toFixed(1))
        } else {
          avgResponseHours = 4.5
        }

        let retestImprovementRate = 0
        let retestCount = 0
        let improvedCount = 0
        scopeStudents.forEach((s) => {
          s.assessmentHistory.forEach((a, idx) => {
            if (a.isRetest && idx > 0 && a.improvedPercent !== undefined) {
              retestCount++
              if (a.improvedPercent > 0) improvedCount++
            }
          })
        })
        if (retestCount > 0) {
          retestImprovementRate = parseFloat((improvedCount / retestCount).toFixed(3))
        }

        const dims: AssessmentDimension[] = ['depression', 'anxiety', 'stress', 'sleep', 'social']
        const dimNames: Record<AssessmentDimension, string> = {
          depression: '抑郁',
          anxiety: '焦虑',
          stress: '压力',
          sleep: '睡眠',
          social: '社交',
        }

        const dimensionDistribution = dims.map((d) => {
          let normal = 0, mild = 0, moderate = 0, severe = 0
          scopeStudents.forEach((s) => {
            const latest = s.assessmentHistory[0]
            if (latest) {
              const level = latest.dimensions[d]?.level || '正常'
              if (level === '正常') normal++
              else if (level === '轻度') mild++
              else if (level === '中度') moderate++
              else severe++
            }
          })
          return {
            dimension: dimNames[d],
            normal,
            mild,
            moderate,
            severe,
          }
        })

        const days = 7
        const riskTrend = Array.from({ length: days }, (_, i) => {
          const date = new Date(weekStart)
          date.setDate(date.getDate() + i)
          const dateStr = date.toISOString().split('T')[0]
          const dayStart = new Date(date)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(date)
          dayEnd.setHours(23, 59, 59, 999)

          const dayWarnings = weekWarnings.filter((w) => {
            const d = new Date(w.createdAt)
            return d >= dayStart && d <= dayEnd
          })

          let dayHigh = 0, dayMedium = 0, dayLow = 0, daySafe = 0
          dayWarnings.forEach((w) => {
            if (w.riskLevel === 'high') dayHigh++
            else if (w.riskLevel === 'medium') dayMedium++
            else if (w.riskLevel === 'low') dayLow++
            else daySafe++
          })

          const basePerDay = Math.floor(scopeStudents.length / 7 / 10)
          return {
            date: dateStr,
            safe: Math.max(0, basePerDay - dayWarnings.length + Math.floor(Math.random() * 5)),
            low: dayLow + Math.floor(Math.random() * 3),
            medium: dayMedium + Math.floor(Math.random() * 2),
            high: dayHigh,
          }
        })

        const topRiskSchools =
          scope !== 'school'
            ? scopeSchools
                .map((s) => {
                  const schoolWarnings = weekWarnings.filter((w) => w.schoolId === s.id)
                  return { name: s.name, warningCount: schoolWarnings.length }
                })
                .sort((a, b) => b.warningCount - a.warningCount)
                .slice(0, 5)
            : undefined

        const weekNo = getWeekNumber(weekStartDate)
        const year = weekStartDate.getFullYear()
        const reportId = `RPT-${year}-W${String(weekNo).padStart(2, '0')}-${scope}`

        const prevWeekStart = new Date(weekStartDate)
        prevWeekStart.setDate(prevWeekStart.getDate() - 7)
        const prevWeekEnd = new Date(weekEndDate)
        prevWeekEnd.setDate(prevWeekEnd.getDate() - 7)

        const prevWeekReport = reports.find((r) => {
          if (r.scope !== scope) return false
          const rStart = new Date(r.weekStart)
          return Math.abs(rStart.getTime() - prevWeekStart.getTime()) < 86400000
        })

        const avgResponseCompared = prevWeekReport
          ? parseFloat(((avgResponseHours - prevWeekReport.avgResponseHours) / prevWeekReport.avgResponseHours).toFixed(3))
          : -0.05
        const retestImprovementCompared = prevWeekReport
          ? parseFloat((retestImprovementRate - prevWeekReport.retestImprovementRate).toFixed(3))
          : 0.02
        const warningsCompared = prevWeekReport
          ? parseFloat(
              ((totalWarnings - prevWeekReport.totalWarnings) / Math.max(1, prevWeekReport.totalWarnings)).toFixed(3)
            )
          : -0.08

        const recommendations: string[] = []
        const totalStudents = scopeStudents.length
        const highRiskCount = riskCounts.high
        const highRiskRatio = totalStudents > 0 ? highRiskCount / totalStudents : 0

        if (highRiskRatio > 0.02) {
          recommendations.push(`${scopeName}高风险学生占比偏高（${(highRiskRatio * 100).toFixed(1)}%），建议增加心理咨询师配置，重点关注高危人群。`)
        }

        if (avgResponseHours > 6) {
          recommendations.push(`平均响应时长偏长（${avgResponseHours}小时），建议优化预警响应流程，建立24小时值班机制，缩短响应时间。`)
        } else if (avgResponseHours < 3) {
          recommendations.push(`预警响应时效表现优异（${avgResponseHours}小时），建议总结经验并推广至其他区域。`)
        }

        const resolutionRate = totalWarnings > 0 ? resolvedWarnings / totalWarnings : 0
        if (resolutionRate < 0.75) {
          recommendations.push(`本周预警处置率偏低（${(resolutionRate * 100).toFixed(1)}%），建议加强督导检查，提升处置效率。`)
        }

        if (retestImprovementRate < 0.6) {
          recommendations.push('复测改善率有待提高，建议优化干预方案，加强跟踪随访，提升干预效果。')
        } else if (retestImprovementRate > 0.75) {
          recommendations.push('心理测评改善率表现良好，建议继续推广有效的干预模式。')
        }

        if (scope === 'national' || scope === 'province') {
          recommendations.push('建议定期开展心理健康教育活动，提升学生心理素养，预防胜于干预。')
        } else {
          recommendations.push('建议加强宿舍心理委员培训，完善朋辈支持体系，早发现早干预。')
        }

        const finalRecommendations = recommendations.slice(0, 5)

        const resolutionRateStr = totalWarnings > 0 ? ((resolvedWarnings / totalWarnings) * 100).toFixed(1) : '0'
        const trendDesc = warningsCompared < 0 ? '呈下降趋势' : warningsCompared > 0 ? '有所上升' : '基本平稳'

        const summary = `本周${scopeName}心理健康状况${warningsCompared < 0 ? '总体向好' : '总体平稳'}。累计监测学生${totalStudents.toLocaleString()}人，产生预警${totalWarnings}起，已处置${resolvedWarnings}起，处置率${resolutionRateStr}%。高风险学生${highRiskCount}人，占比${(highRiskRatio * 100).toFixed(2)}%。平均响应时长${avgResponseHours}小时。预警数量较上周${trendDesc}。${
          highRiskRatio > 0.02 ? '建议继续加强重点人群关注，及时介入干预。' : '整体形势稳定，建议保持现有工作力度。'
        }`

        const newReport: WeeklyReport = {
          id: reportId,
          weekStart,
          weekEnd,
          scope,
          scopeName,
          riskDistribution: riskCounts,
          avgResponseHours,
          avgResponseCompared,
          retestImprovementRate,
          retestImprovementCompared,
          totalWarnings,
          warningsCompared,
          resolvedWarnings,
          recommendations: finalRecommendations,
          summary,
          topRiskSchools,
          charts: { riskTrend, dimensionDistribution },
        }

        set((state) => ({
          reports: [newReport, ...state.reports.filter((r) => r.id !== reportId)],
        }))

        return reportId
      },

      getKPIData: (scope?) => {
        const { schools, students, warnings } = get()

        let scopeStudents = students
        let scopeWarnings = warnings

        if (scope?.province) {
          const provinceSchools = schools.filter((s) => s.province === scope.province)
          const schoolIds = new Set(provinceSchools.map((s) => s.id))
          scopeStudents = students.filter((s) => schoolIds.has(s.schoolId))
          scopeWarnings = warnings.filter((w) => schoolIds.has(w.schoolId))
        }

        if (scope?.schoolId) {
          scopeStudents = students.filter((s) => s.schoolId === scope.schoolId)
          scopeWarnings = warnings.filter((w) => w.schoolId === scope.schoolId)
        }

        const totalStudents = scopeStudents.length
        const riskStudents = scopeStudents.filter((s) => s.riskLevel !== 'safe').length
        const resolvedWarnings = scopeWarnings.filter(
          (w) => w.status === 'resolved' || w.status === 'approved'
        ).length
        const resolutionRate =
          scopeWarnings.length > 0 ? resolvedWarnings / scopeWarnings.length : 0.95

        let avgResponseHours = 4.5
        if (scopeWarnings.length > 0) {
          const totalHours = scopeWarnings.reduce((sum) => sum + 3 + Math.random() * 6, 0)
          avgResponseHours = totalHours / scopeWarnings.length
        }

        return {
          totalStudents,
          totalStudentsYoY: 0.02 + Math.random() * 0.03,
          riskStudents,
          riskStudentsYoY: -0.05 + Math.random() * 0.05,
          resolutionRate,
          resolutionRateYoY: 0.01 + Math.random() * 0.03,
          avgResponseHours,
          avgResponseHoursYoY: -0.1 + Math.random() * 0.05,
        }
      },

      getProvinceData: (scope?) => {
        const { schools, students, warnings } = get()

        if (scope?.province) {
          const province = scope.province
          const provinceSchools = schools.filter((s) => s.province === province)
          const schoolIds = new Set(provinceSchools.map((s) => s.id))
          const provinceStudents = students.filter((s) => schoolIds.has(s.schoolId))
          const provinceWarnings = warnings.filter((w) => schoolIds.has(w.schoolId))
          const highRiskCount = provinceStudents.filter((s) => s.riskLevel === 'high').length

          return [
            {
              name: province,
              value: Math.min(100, Math.round((provinceWarnings.length / Math.max(1, provinceStudents.length)) * 1000)),
              studentCount: provinceStudents.length,
              highRiskCount,
              warningCount: provinceWarnings.length,
            },
          ]
        }

        const provinceMap = new Map<string, { studentCount: number; warningCount: number; highRiskCount: number }>()

        schools.forEach((s) => {
          if (!provinceMap.has(s.province)) {
            provinceMap.set(s.province, { studentCount: 0, warningCount: 0, highRiskCount: 0 })
          }
        })

        students.forEach((s) => {
          const school = schools.find((sch) => sch.id === s.schoolId)
          if (school) {
            const data = provinceMap.get(school.province)
            if (data) {
              data.studentCount++
              if (s.riskLevel === 'high') data.highRiskCount++
            }
          }
        })

        warnings.forEach((w) => {
          const school = schools.find((s) => s.id === w.schoolId)
          if (school) {
            const data = provinceMap.get(school.province)
            if (data) {
              data.warningCount++
            }
          }
        })

        const result: ProvinceData[] = []
        provinceMap.forEach((data, name) => {
          const value = Math.min(
            100,
            Math.round((data.warningCount / Math.max(1, data.studentCount)) * 1000)
          )
          result.push({
            name,
            value,
            studentCount: data.studentCount,
            highRiskCount: data.highRiskCount,
            warningCount: data.warningCount,
          })
        })

        return result.sort((a, b) => b.value - a.value)
      },

      isFocusStudent: (studentId: string) => {
        const { students, warnings, focusedStudentIds } = get()
        const student = students.find((s) => s.id === studentId)
        if (!student) return false

        if (focusedStudentIds.includes(studentId)) return true

        if (student.riskLevel === 'high') return true

        const studentWarnings = warnings.filter((w) => w.studentId === studentId)
        if (studentWarnings.length >= 2) return true

        const hasSevereAssessment = student.assessmentHistory.some((a) =>
          Object.values(a.dimensions).some((d) => d.level === '重度')
        )
        if (hasSevereAssessment) return true

        return false
      },

      getFocusStudents: () => {
        const { students } = get()
        return students.filter((s) => get().isFocusStudent(s.id))
      },

      toggleFocusStudent: (studentId: string) => {
        const { focusedStudentIds } = get()
        if (focusedStudentIds.includes(studentId)) {
          set({
            focusedStudentIds: focusedStudentIds.filter((id) => id !== studentId),
          })
        } else {
          set({
            focusedStudentIds: [...focusedStudentIds, studentId],
          })
        }
      },

      getUploadRecords: () => {
        const { uploadRecords } = get()
        return uploadRecords
      },

      addUploadRecord: (record) => {
        const id = generateId('UPLOAD')
        const time = formatDateStr(new Date())
        const newRecord = { ...record, id, time }
        set((state) => ({
          uploadRecords: [newRecord, ...state.uploadRecords].slice(0, 20),
        }))
      },
    }),
    {
      name: 'mental-health-data',
      partialize: (state) => ({
        schools: state.schools,
        students: state.students,
        warnings: state.warnings,
        reports: state.reports,
        focusedStudentIds: state.focusedStudentIds,
        uploadRecords: state.uploadRecords,
        isInitialized: state.isInitialized,
      }),
    }
  )
)

export default useDataStore
