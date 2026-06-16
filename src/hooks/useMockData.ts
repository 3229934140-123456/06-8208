import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDataStore } from '@/store/dataStore'
import type { WarningFilter as StoreWarningFilter } from '@/store/dataStore'
import type {
  School,
  StudentProfile,
  WarningRecord,
  WeeklyReport,
  KPIData,
  ProvinceData,
  RiskLevel,
} from '@/types'

interface HookResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const mockDelay = (min = 200, max = 500) =>
  new Promise((resolve) => setTimeout(resolve, Math.random() * (max - min) + min))

function useMockFetch<T>(fetcher: () => T | Promise<T>, deps: unknown[] = []): HookResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  const initializeData = useDataStore((state) => state.initializeData)

  const refetch = useCallback(() => setKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    initializeData()

    Promise.resolve()
      .then(() => mockDelay())
      .then(() => fetcher())
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

export const useKPIData = (): HookResult<KPIData> => {
  const getKPIData = useDataStore((state) => state.getKPIData)
  return useMockFetch(() => getKPIData(), [])
}

export const useProvinceData = (province?: string): HookResult<ProvinceData[]> => {
  const getProvinceData = useDataStore((state) => state.getProvinceData)
  return useMockFetch(() => getProvinceData(province ? { province } : undefined), [province])
}

export const useSchools = (province?: string, type?: string): HookResult<School[]> => {
  const getSchools = useDataStore((state) => state.getSchools)
  return useMockFetch(() => getSchools({ province, type }), [province, type])
}

export const useSchoolDetail = (id: string): HookResult<School | null> => {
  const getSchoolById = useDataStore((state) => state.getSchoolById)
  return useMockFetch(() => getSchoolById(id) || null, [id])
}

export interface WarningFilter {
  level?: string
  status?: string
  keyword?: string
  riskLevel?: string
  province?: string
  schoolId?: string
}

export const useWarnings = (filter?: WarningFilter): HookResult<WarningRecord[]> => {
  const getWarnings = useDataStore((state) => state.getWarnings)

  const storeFilter = useMemo<StoreWarningFilter | undefined>(() => {
    if (!filter) return undefined
    return {
      level: filter.level ? (Number(filter.level) as 1 | 2) : undefined,
      status: filter.status as StoreWarningFilter['status'],
      riskLevel: filter.riskLevel as RiskLevel,
      province: filter.province,
      schoolId: filter.schoolId,
      keyword: filter.keyword,
    }
  }, [filter])

  return useMockFetch(() => getWarnings(storeFilter), [
    filter?.level,
    filter?.status,
    filter?.keyword,
    filter?.riskLevel,
    filter?.province,
    filter?.schoolId,
  ])
}

export const useWarningDetail = (id: string): HookResult<WarningRecord | null> => {
  const getWarningById = useDataStore((state) => state.getWarningById)
  return useMockFetch(() => getWarningById(id) || null, [id])
}

export const useStudents = (search?: string, riskLevel?: string): HookResult<StudentProfile[]> => {
  const getStudents = useDataStore((state) => state.getStudents)
  return useMockFetch(
    () =>
      getStudents({
        keyword: search,
        riskLevel: riskLevel as RiskLevel,
      }),
    [search, riskLevel]
  )
}

export const useStudentDetail = (id: string): HookResult<StudentProfile | null> => {
  const getStudentById = useDataStore((state) => state.getStudentById)
  return useMockFetch(() => getStudentById(id) || null, [id])
}

export const useReports = (): HookResult<WeeklyReport[]> => {
  const getReports = useDataStore((state) => state.getReports)
  return useMockFetch(() => getReports(), [])
}

export const useReportDetail = (id: string): HookResult<WeeklyReport | null> => {
  const getReportById = useDataStore((state) => state.getReportById)
  return useMockFetch(() => getReportById(id) || null, [id])
}

export const useFocusStudents = (): HookResult<StudentProfile[]> => {
  const getFocusStudents = useDataStore((state) => state.getFocusStudents)
  return useMockFetch(() => getFocusStudents(), [])
}

export {
  type School,
  type StudentProfile,
  type WarningRecord,
  type WeeklyReport,
  type KPIData,
  type ProvinceData,
}
