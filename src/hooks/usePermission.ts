import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useDataStore } from '@/store/dataStore'
import type { UserScope, UserRole } from '@/types'

export interface DataFilter {
  province?: string
  schoolId?: string
  college?: string
}

export interface MenuItem {
  label: string
  key: string
  icon: string
  children?: SubMenuItem[]
}

export interface SubMenuItem {
  label: string
  key: string
}

export function useScope(): UserScope | null {
  const user = useAuthStore((state) => state.user)
  return user?.scope || null
}

export function useDataFilter(): DataFilter {
  const scope = useScope()
  return useMemo(() => {
    const filter: DataFilter = {}
    if (scope?.province) filter.province = scope.province
    if (scope?.schoolId) filter.schoolId = scope.schoolId
    if (scope?.college) filter.college = scope.college
    return filter
  }, [scope])
}

export function useCanAccessSchool(schoolId: string): boolean {
  const scope = useScope()
  const schools = useDataStore((state) => state.schools)

  return useMemo(() => {
    if (!scope) return false
    if (scope.type === 'national') return true

    if (scope.type === 'province') {
      const school = schools.find((s) => s.id === schoolId)
      return school?.province === scope.province
    }

    if (scope.type === 'school' || scope.type === 'college') {
      return schoolId === scope.schoolId
    }

    return false
  }, [scope, schoolId, schools])
}

export function useCanAccessStudent(studentId: string): boolean {
  const scope = useScope()
  const student = useDataStore((state) => state.getStudentById(studentId))

  return useMemo(() => {
    if (!scope) return false
    if (scope.type === 'national') return true
    if (!student) return false

    if (scope.type === 'province') {
      const schools = useDataStore.getState().schools
      const school = schools.find((s) => s.id === student.schoolId)
      return school?.province === scope.province
    }

    if (scope.type === 'school') {
      return student.schoolId === scope.schoolId
    }

    if (scope.type === 'college') {
      return student.schoolId === scope.schoolId && student.college === scope.college
    }

    return false
  }, [scope, studentId, student])
}

const menuConfig: Record<UserRole, MenuItem[]> = {
  ministry: [
    { label: '核心看板', key: 'dashboard', icon: 'LayoutDashboard' },
    { label: '预警管理', key: 'alerts', icon: 'AlertTriangle' },
    { label: '学校详情', key: 'schools', icon: 'Building2' },
    { label: '周报系统', key: 'reports', icon: 'FileBarChart2' },
    { label: '系统设置', key: 'settings', icon: 'Settings' },
  ],
  province: [
    { label: '核心看板', key: 'dashboard', icon: 'LayoutDashboard' },
    { label: '预警管理', key: 'alerts', icon: 'AlertTriangle' },
    { label: '学校详情', key: 'schools', icon: 'Building2' },
    { label: '周报系统', key: 'reports', icon: 'FileBarChart2' },
    { label: '系统设置', key: 'settings', icon: 'Settings' },
  ],
  school: [
    { label: '核心看板', key: 'dashboard', icon: 'LayoutDashboard' },
    { label: '预警管理', key: 'alerts', icon: 'AlertTriangle' },
    {
      label: '学生档案',
      key: 'students',
      icon: 'Users',
      children: [
        { label: '档案列表', key: 'students-list' },
        { label: '批量上传', key: 'students-upload' },
        { label: '重点关注', key: 'students-focus' },
      ],
    },
    { label: '学校详情', key: 'schools', icon: 'Building2' },
    { label: '周报系统', key: 'reports', icon: 'FileBarChart2' },
    { label: '系统设置', key: 'settings', icon: 'Settings' },
  ],
  center: [
    { label: '核心看板', key: 'dashboard', icon: 'LayoutDashboard' },
    { label: '预警管理', key: 'alerts', icon: 'AlertTriangle' },
    {
      label: '学生档案',
      key: 'students',
      icon: 'Users',
      children: [
        { label: '档案列表', key: 'students-list' },
        { label: '批量上传', key: 'students-upload' },
        { label: '重点关注', key: 'students-focus' },
      ],
    },
    { label: '学校详情', key: 'schools', icon: 'Building2' },
    { label: '周报系统', key: 'reports', icon: 'FileBarChart2' },
    { label: '系统设置', key: 'settings', icon: 'Settings' },
  ],
  liaison: [
    { label: '核心看板', key: 'dashboard', icon: 'LayoutDashboard' },
    { label: '预警管理', key: 'alerts', icon: 'AlertTriangle' },
    {
      label: '学生档案',
      key: 'students',
      icon: 'Users',
      children: [
        { label: '档案列表', key: 'students-list' },
      ],
    },
    { label: '周报系统', key: 'reports', icon: 'FileBarChart2' },
  ],
  counselor: [
    { label: '核心看板', key: 'dashboard', icon: 'LayoutDashboard' },
    { label: '预警管理', key: 'alerts', icon: 'AlertTriangle' },
    {
      label: '学生档案',
      key: 'students',
      icon: 'Users',
      children: [
        { label: '档案列表', key: 'students-list' },
      ],
    },
    { label: '周报系统', key: 'reports', icon: 'FileBarChart2' },
  ],
}

export function useMenuItems(): { items: MenuItem[]; firstKey: string } {
  const user = useAuthStore((state) => state.user)
  const role = user?.role || 'ministry'

  const items = useMemo(() => menuConfig[role] || [], [role])

  const firstKey = useMemo(() => {
    if (items.length === 0) return 'dashboard'
    const firstItem = items[0]
    if (firstItem.children && firstItem.children.length > 0) {
      return firstItem.children[0].key
    }
    return firstItem.key
  }, [items])

  return { items, firstKey }
}

export function useHasPermission(permission: string): boolean {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  return hasPermission(permission)
}
