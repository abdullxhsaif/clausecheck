import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { Loader2 } from 'lucide-react'

const Landing = lazy(() => import('./pages/Landing.jsx'))
const Pricing = lazy(() => import('./pages/Pricing.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
      <Loader2 className="w-10 h-10 text-brand-400 animate-spin" />
    </div>
  )
}

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <FullScreenLoader />

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
