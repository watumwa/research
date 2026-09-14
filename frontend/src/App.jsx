import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import { LoginPage, RegisterPage } from './pages/AuthPage'
import { ForgotPasswordPage, ResetPasswordPage } from './pages/PasswordResetPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import LegalPage from './pages/LegalPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import CoursePage from './pages/CoursePage'
import LessonPage from './pages/LessonPage'
import BuilderPage from './pages/BuilderPage'
import BuildersPage from './pages/BuildersPage'
import StructuredBuilderPage from './pages/StructuredBuilderPage'
import ResourcesPage from './pages/ResourcesPage'
import PremiumResourcePage from './pages/PremiumResourcePage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){return <Routes>
  <Route path="/" element={<LandingPage/>}/>
  <Route path="/login" element={<LoginPage/>}/>
  <Route path="/register" element={<RegisterPage/>}/>
  <Route path="/forgot-password" element={<ForgotPasswordPage/>}/>
  <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage/>}/>
  <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage/>}/>
  <Route path="/terms" element={<LegalPage type="terms"/>}/>
  <Route path="/privacy" element={<LegalPage type="privacy"/>}/>
  <Route path="/onboarding" element={<ProtectedRoute skipOnboarding><OnboardingPage/></ProtectedRoute>}/>
  <Route element={<ProtectedRoute><AppShell/></ProtectedRoute>}>
    <Route path="/dashboard" element={<DashboardPage/>}/>
    <Route path="/courses/:slug" element={<CoursePage/>}/>
    <Route path="/research-blueprint" element={<CourseRedirect slug="research-blueprint"/>}/>
    <Route path="/communication" element={<CourseRedirect slug="business-communication-toolkit"/>}/>
    <Route path="/lessons/:slug" element={<LessonPage/>}/>
    <Route path="/lesson/:slug" element={<LessonPage/>}/>
    <Route path="/builder" element={<BuildersPage/>}/>
    <Route path="/builders/research-problem" element={<BuilderPage/>}/>
    <Route path="/builders/chapter-one" element={<StructuredBuilderPage type="chapter-one"/>}/>
    <Route path="/builders/literature-review" element={<StructuredBuilderPage type="literature-review"/>}/>
    <Route path="/resources" element={<ResourcesPage/>}/>
    <Route path="/resources/:slug" element={<PremiumResourcePage/>}/>
    <Route path="/checkout/:slug" element={<CheckoutPage/>}/>
    <Route path="/profile" element={<ProfilePage/>}/>
    <Route path="/admin" element={<ProtectedRoute admin><AdminPage/></ProtectedRoute>}/>
  </Route>
  <Route path="*" element={<NotFoundPage/>}/>
</Routes>}
function CourseRedirect({slug}){return <Navigate to={`/courses/${slug}`} replace/>}
