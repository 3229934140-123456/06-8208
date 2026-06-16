import { create } from 'zustand'

export interface WarningFilter {
  level?: string
  status?: string
  keyword?: string
  riskLevel?: string
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  time: string
}

interface AppState {
  selectedProvince: string
  selectedSchoolType: string
  selectedTimeRange: string
  currentWarningFilter: WarningFilter
  notifications: Notification[]
  setSelectedProvince: (province: string) => void
  setSelectedSchoolType: (type: string) => void
  setSelectedTimeRange: (range: string) => void
  setWarningFilter: (filter: Partial<WarningFilter>) => void
  addNotification: (notification: Omit<Notification, 'id' | 'time'>) => void
  clearNotification: (id?: string) => void
}

export const useAppStore = create<AppState>()((set) => ({
  selectedProvince: '',
  selectedSchoolType: '',
  selectedTimeRange: '7d',
  currentWarningFilter: {},
  notifications: [],

  setSelectedProvince: (province) => set({ selectedProvince: province }),

  setSelectedSchoolType: (type) => set({ selectedSchoolType: type }),

  setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),

  setWarningFilter: (filter) =>
    set((state) => ({
      currentWarningFilter: { ...state.currentWarningFilter, ...filter },
    })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Date.now().toString(),
          time: new Date().toISOString(),
        },
        ...state.notifications,
      ].slice(0, 50),
    })),

  clearNotification: (id) =>
    set((state) => ({
      notifications: id
        ? state.notifications.filter((n) => n.id !== id)
        : [],
    })),
}))
