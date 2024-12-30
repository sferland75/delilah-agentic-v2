import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/Dashboard';
import AssessmentList from './components/AssessmentList';
import AssessmentForm from './components/AssessmentForm';
import AssessmentDetail from './components/AssessmentDetail';
import AssessmentEdit from './components/AssessmentEdit';
import ClientList from './components/ClientList';
import ClientForm from './components/ClientForm';
import ClientDetail from './components/ClientDetail';
import Login from './components/Login';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Assessments */}
                    <Route path="/assessments" element={<AssessmentList />} />
                    <Route path="/assessments/new" element={<AssessmentForm />} />
                    <Route path="/assessments/:id" element={<AssessmentDetail />} />
                    <Route path="/assessments/:id/edit" element={<AssessmentEdit />} />

                    {/* Clients */}
                    <Route path="/clients" element={<ClientList />} />
                    <Route path="/clients/new" element={<ClientForm />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;