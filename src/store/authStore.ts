import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole, UserScope } from '@/types'

export type { UserRole }

export interface User {
  id: string
  username: string
  role: UserRole
  name: string
  avatar?: string
  organization: string
  scope: UserScope
  permissions: string[]
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (role: UserRole, username: string, password: string) => Promise<boolean>
  logout: () => void
  checkAuth: () => User | null
  getUserScope: () => UserScope | null
  hasPermission: (permission: string) => boolean
}

const mockUsers: Record<UserRole, { username: string; password: string; user: User }> = {
  ministry: {
    username: 'admin',
    password: '123456',
    user: {
      id: '1',
      username: 'admin',
      role: 'ministry',
      name: '教育部管理员',
      organization: '教育部',
      scope: { type: 'national' },
      permissions: ['all'],
    },
  },
  province: {
    username: 'beijing',
    password: '123456',
    user: {
      id: '2',
      username: 'beijing',
      role: 'province',
      name: '北京教育厅管理员',
      organization: '北京市教育厅',
      scope: { type: 'province', province: '北京市' },
      permissions: ['province:view', 'province:manage'],
    },
  },
  school: {
    username: 'tsinghua',
    password: '123456',
    user: {
      id: '3',
      username: 'tsinghua',
      role: 'school',
      name: '清华大学管理员',
      organization: '清华大学',
      scope: { type: 'school', province: '北京市', schoolId: 'SCH0001', schoolName: '清华大学' },
      permissions: ['school:view', 'school:manage'],
    },
  },
  center: {
    username: 'center',
    password: '123456',
    user: {
      id: '4',
      username: 'center',
      role: 'center',
      name: '心理咨询中心',
      organization: '清华大学心理咨询中心',
      scope: { type: 'school', province: '北京市', schoolId: 'SCH0001', schoolName: '清华大学' },
      permissions: ['center:view', 'center:manage'],
    },
  },
  liaison: {
    username: 'liaison',
    password: '123456',
    user: {
      id: '5',
      username: 'liaison',
      role: 'liaison',
      name: '心理联络员',
      organization: '清华大学计算机学院',
      scope: { type: 'college', province: '北京市', schoolId: 'SCH0001', schoolName: '清华大学', college: '计算机学院' },
      permissions: ['liaison:view', 'liaison:report'],
    },
  },
  counselor: {
    username: 'counselor',
    password: '123456',
    user: {
      id: '6',
      username: 'counselor',
      role: 'counselor',
      name: '辅导员',
      organization: '清华大学计算机学院',
      scope: { type: 'college', province: '北京市', schoolId: 'SCH0001', schoolName: '清华大学', college: '计算机学院' },
      permissions: ['counselor:view', 'counselor:manage'],
    },
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (role, username, password) => {
        set({ isLoading: true })
        await new Promise((resolve) => setTimeout(resolve, 800))

        const mockUser = mockUsers[role]
        if (mockUser && mockUser.username === username && mockUser.password === password) {
          set({
            user: mockUser.user,
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        }

        set({ isLoading: false })
        return false
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      checkAuth: () => {
        const { user, isAuthenticated } = get()
        return isAuthenticated && user ? user : null
      },

      getUserScope: () => {
        const { user } = get()
        return user?.scope || null
      },

      hasPermission: (permission: string) => {
        const { user } = get()
        if (!user) return false
        if (user.permissions.includes('all')) return true
        return user.permissions.includes(permission)
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
