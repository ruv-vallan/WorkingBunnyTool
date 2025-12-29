import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/layout/Layout';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import DrivePage from './pages/DrivePage';
import TeamPage from './pages/TeamPage';
import ProfilePage from './pages/ProfilePage';
import ProjectPage from './pages/ProjectPage';
import MyWorkPage from './pages/MyWorkPage';
import PermissionsPage from './pages/PermissionsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/auth"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="my-work" element={<MyWorkPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="drive" element={<DrivePage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="permissions" element={<PermissionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="project/:projectId" element={<ProjectPage />} />
        <Route path="project/:projectId/post/:postId" element={<ProjectPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
