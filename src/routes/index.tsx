import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect, type ReactNode, type ComponentType } from 'react'
import { useAuthStore } from '@/store/authStore'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const SchoolDetailPage = lazy(() => import('@/pages/SchoolDetailPage'))
const WarningListPage = lazy(() => import('@/pages/WarningListPage'))
const WarningDetailPage = lazy(() => import('@/pages/WarningDetailPage'))
const StudentListPage = lazy(() => import('@/pages/StudentListPage'))
const StudentUploadPage = lazy(() => import('@/pages/StudentUploadPage'))
const FocusListPage = lazy(() => import('@/pages/FocusListPage'))
const StudentDetailPage = lazy(() => import('@/pages/StudentDetailPage'))
const ReportListPage = lazy(() => import('@/pages/ReportListPage'))
const ReportDetailPage = lazy(() => import('@/pages/ReportDetailPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

interface ProtectedRouteProps {
  children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    useAuthStore.getState().checkAuth()
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )
}

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  )
}

function withProtected(Component: ComponentType) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </ProtectedRoute>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/dashboard',
    element: withProtected(DashboardPage),
  },
  {
    path: '/dashboard/school/:id',
    element: withProtected(SchoolDetailPage),
  },
  {
    path: '/warning',
    element: withProtected(WarningListPage),
  },
  {
    path: '/warning/:id',
    element: withProtected(WarningDetailPage),
  },
  {
    path: '/students',
    element: withProtected(StudentListPage),
  },
  {
    path: '/students/upload',
    element: withProtected(StudentUploadPage),
  },
  {
    path: '/students/focus',
    element: withProtected(FocusListPage),
  },
  {
    path: '/students/:id',
    element: withProtected(StudentDetailPage),
  },
  {
    path: '/reports',
    element: withProtected(ReportListPage),
  },
  {
    path: '/reports/:id',
    element: withProtected(ReportDetailPage),
  },
  {
    path: '/settings',
    element: withProtected(SettingsPage),
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage),
  },
])

export { router, ProtectedRoute, PageLoader }
export default router
