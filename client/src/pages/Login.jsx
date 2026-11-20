import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function Login() {
  const [roleTab, setRoleTab] = useState('organization'); // 'organization' | 'verifier'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (roleTab === 'verifier' ? '/verifier-dashboard' : '/dashboard');

  const handleFillDemo = (type) => {
    setError('');
    if (type === 'verifier') {
      setRoleTab('verifier');
      setEmail('verifier@proofofimpact.org');
      setPassword('DemoPass123!');
    } else {
      setRoleTab('organization');
      setEmail('org@greenfuture.org');
      setPassword('DemoPass123!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(email, password);

      // Redirect according to the authenticated user's actual role
      if (user.role === 'verifier') {
        navigate('/verifier-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#176B45] text-white flex items-center justify-center shadow-md shadow-[#176B45]/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              Proof of Impact
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Your Portal
          </h2>
          <p className="text-xs text-slate-500">
            Access your evidence verification dashboard and audit trail
          </p>
        </div>

        {/* Role Tab Selector */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setRoleTab('organization');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleTab === 'organization'
                ? 'bg-white text-[#176B45] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organization</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleTab('verifier');
              setError('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              roleTab === 'verifier'
                ? 'bg-white text-[#3B82B6] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Verifier</span>
          </button>
        </div>

        {/* Seeded Account Quick-Fill */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#176B45]" />
              Seeded Test Accounts:
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('organization')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:border-[#176B45] hover:text-[#176B45] transition-colors cursor-pointer"
            >
              Organization
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('verifier')}
              className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:border-[#3B82B6] hover:text-[#3B82B6] transition-colors cursor-pointer"
            >
              Verifier
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={roleTab === 'verifier' ? 'verifier@proofofimpact.org' : 'name@organization.org'}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 ${
              roleTab === 'verifier'
                ? 'bg-[#3B82B6] hover:bg-[#2F6C98] shadow-[#3B82B6]/25'
                : 'bg-[#176B45] hover:bg-[#115335] shadow-[#176B45]/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In as {roleTab === 'verifier' ? 'Verifier' : 'Organization'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 text-center space-y-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            New organization?{' '}
            <Link
              to="/register"
              className="font-bold text-[#176B45] hover:underline"
            >
              Create an organization account
            </Link>
          </p>
          {roleTab === 'verifier' && (
            <p className="text-[11px] text-slate-400">
              Verifier accounts are issued strictly by system administrators.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

