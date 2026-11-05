import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { Spinner } from './components/ui';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const JobDescriptionPage = lazy(() => import('./pages/JobDescriptionPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const SkillGapPage = lazy(() => import('./pages/SkillGapPage'));
const ImprovementPage = lazy(() => import('./pages/ImprovementPage'));
const InterviewPage = lazy(() => import('./pages/InterviewPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-surface text-primary"><Spinner className="h-6 w-6" /></div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/app/dashboard" element={<DashboardPage />} />
                <Route path="/app/upload" element={<UploadPage />} />
                <Route path="/app/job-description" element={<JobDescriptionPage />} />
                <Route path="/app/analysis/:id" element={<AnalysisPage />} />
                <Route path="/app/analysis/:id/skills" element={<SkillGapPage />} />
                <Route path="/app/analysis/:id/improvements" element={<ImprovementPage />} />
                <Route path="/app/analysis/:id/interview" element={<InterviewPage />} />
                <Route path="/app/chat" element={<ChatPage />} />
                <Route path="/app/history" element={<HistoryPage />} />
                <Route path="/app/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
