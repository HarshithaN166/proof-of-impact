import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#176B45] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Verifying session credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200 p-8 text-center space-y-4 shadow-lg shadow-rose-500/5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your authenticated account (<span className="font-semibold text-slate-800">{user.email}</span>) holds the role{' '}
            <span className="font-bold text-rose-600 uppercase px-2 py-0.5 rounded bg-rose-50 border border-rose-100">{user.role}</span>.
            This route requires one of [{allowedRoles.join(', ')}].
          </p>
          <div className="pt-2">
            <Navigate
              to={user.role === 'verifier' ? '/verifier-dashboard' : '/dashboard'}
              replace
            />
          </div>
        </div>
      </div>
    );
  }

  return children;
}

