import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute, GuestRoute } from '@/components/auth/ProtectedRoute';
import { LoadingScreen } from '@/components/ui';

const SplashPage = lazy(() => import('@/pages/SplashPage').then((m) => ({ default: m.SplashPage })));
const AuthCallbackPage = lazy(() => import('@/pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })));
const IntroPage = lazy(() => import('@/pages/IntroPage').then((m) => ({ default: m.IntroPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignUpPage = lazy(() => import('@/pages/SignUpPage').then((m) => ({ default: m.SignUpPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));
const OnboardingDemoPage = lazy(() => import('@/pages/OnboardingDemoPage').then((m) => ({ default: m.OnboardingDemoPage })));
const QuizPage = lazy(() => import('@/pages/QuizPage').then((m) => ({ default: m.QuizPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const TrackerPage = lazy(() => import('@/pages/TrackerPage').then((m) => ({ default: m.TrackerPage })));
const AndrogenTrackerPage = lazy(() => import('@/pages/AndrogenTrackerPage').then((m) => ({ default: m.AndrogenTrackerPage })));
const CarePage = lazy(() => import('@/pages/CarePage').then((m) => ({ default: m.CarePage })));
const CareArticlesPage = lazy(() => import('@/pages/CareArticlesPage').then((m) => ({ default: m.CareArticlesPage })));
const JourneyArticlePage = lazy(() => import('@/pages/JourneyArticlePage').then((m) => ({ default: m.JourneyArticlePage })));
const CareTopicPage = lazy(() => import('@/pages/CareTopicPage').then((m) => ({ default: m.CareTopicPage })));
const LegacyJourneyArticleRedirect = lazy(() =>
  import('@/pages/LegacyJourneyRedirect').then((m) => ({ default: m.LegacyJourneyArticleRedirect })),
);
const ChatPage = lazy(() => import('@/pages/ChatPage').then((m) => ({ default: m.ChatPage })));
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function PageLoader() {
  return <LoadingScreen message="Loading page…" />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/" element={<IntroPage />} />
        <Route path="/splash" element={<SplashPage />} />
        <Route path="/intro" element={<IntroPage />} />
        <Route path="/welcome" element={<Navigate to="/intro" replace />} />
        <Route path="/landing" element={<Navigate to="/intro" replace />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignUpPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingDemoPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/track" element={<Navigate to="/tracker" replace />} />
            <Route path="/androgen" element={<AndrogenTrackerPage />} />
            <Route path="/care" element={<CarePage />} />
            <Route path="/care/articles" element={<CareArticlesPage />} />
            <Route path="/care/articles/:slug" element={<JourneyArticlePage />} />
            <Route path="/care/topics/:topicId" element={<CareTopicPage />} />
            <Route path="/journey" element={<Navigate to="/care" replace />} />
            <Route path="/journey/:slug" element={<LegacyJourneyArticleRedirect />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/sakhi" element={<Navigate to="/chat" replace />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
