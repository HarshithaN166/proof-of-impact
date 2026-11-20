import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OrganizationDashboard from './pages/OrganizationDashboard';
import VerifierDashboard from './pages/VerifierDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Organization Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['organization', 'admin']}>
                    <OrganizationDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Verifier Route */}
              <Route
                path="/verifier-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['verifier', 'admin']}>
                    <VerifierDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
