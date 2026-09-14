import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({children, admin=false, skipOnboarding=false}){
  const {user,loading}=useAuth()
  const location=useLocation()
  if(loading) return <div className="screen-loader"><div className="loader-orb"/><p>Opening your learning space…</p></div>
  if(!user) return <Navigate to="/login" replace state={{from:location.pathname}} />
  if(!skipOnboarding && user.role==='learner' && !user.onboarding_completed) return <Navigate to="/onboarding" replace />
  if(admin && !['admin','editor'].includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}
