
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import LoadOrchestrationPage from './pages/LoadOrchestrationPage';
import VisibilitySecurityPage from './pages/VisibilitySecurityPage';
import AnalyticsPage from './pages/SustainabilityPage';
import SettingsPage from './pages/CollaborationPage';
import AlertsPage from './pages/AlertsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { APIProvider } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY } from './constants';

const App: React.FC = () => {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <AuthProvider>
        <Routes>
          {/* Public routes that don't use the main layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Routes that use the main layout */}
          {/* FIX: Correctly wrap routes in Layout component using nested routes */}
          <Route element={<Layout />}>
            {/* Publicly accessible route within the layout */}
            <Route path="/" element={<HomePage />} />

            {/* Protected routes within the layout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/loads" element={<LoadOrchestrationPage />} />
              <Route path="/shipments" element={<VisibilitySecurityPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Old path redirects */}
              <Route path="load-orchestration" element={<Navigate to="/loads" replace />} />
              <Route path="visibility-security" element={<Navigate to="/shipments" replace />} />
              <Route path="sustainability" element={<Navigate to="/analytics" replace />} />
              <Route path="collaboration" element={<Navigate to="/settings" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </APIProvider>
  );
};

export default App;
