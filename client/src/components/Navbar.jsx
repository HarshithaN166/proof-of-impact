import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  LogIn,
  LogOut,
  LayoutDashboard,
  Building2,
  UserCheck,
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, targetHash) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + targetHash);
    } else {
      const element = document.querySelector(targetHash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const dashboardPath = user?.role === 'verifier' ? '/verifier-dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100">
      {/* Top Protocol Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>Proof of Impact Protocol — Connected to MongoDB & Hardhat Blockchain (Chain ID: 31337)</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#176B45] text-white flex items-center justify-center shadow-md shadow-[#176B45]/20 group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Proof of Impact
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#3B82B6]/15 text-[#3B82B6]">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Don't Just Claim Impact. Prove It.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 hover:text-[#176B45] transition-colors"
            >
              Home
            </Link>
            <Link
              to="/analytics"
              className="text-sm font-semibold text-slate-600 hover:text-[#176B45] transition-colors flex items-center gap-1"
            >
              <span>Analytics</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#176B45]/10 text-[#176B45]">
                Live
              </span>
            </Link>
            <a
              href="/#campaigns"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(e, '#campaigns');
              }}
              className="text-sm font-semibold text-slate-600 hover:text-[#176B45] transition-colors"
            >
              Explore Impact
            </a>
            <a
              href="/#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(e, '#how-it-works');
              }}
              className="text-sm font-semibold text-slate-600 hover:text-[#176B45] transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#about"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(e, '#about');
              }}
              className="text-sm font-semibold text-slate-600 hover:text-[#176B45] transition-colors"
            >
              About
            </a>
          </nav>

          {/* Action Buttons / Auth State */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {user?.role === 'verifier' ? (
                    <UserCheck className="w-3.5 h-3.5 text-[#3B82B6]" />
                  ) : (
                    <Building2 className="w-3.5 h-3.5 text-[#176B45]" />
                  )}
                  <span className="capitalize">{user?.role}</span>
                </span>

                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Portal</span>
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-[#176B45] hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-md shadow-[#176B45]/20 hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:text-[#176B45] hover:bg-slate-50 transition-colors"
            >
              Home
            </Link>
            <a
              href="/#campaigns"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(e, '#campaigns');
              }}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:text-[#176B45] hover:bg-slate-50 transition-colors"
            >
              Explore Impact
            </a>
            <a
              href="/#how-it-works"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(e, '#how-it-works');
              }}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:text-[#176B45] hover:bg-slate-50 transition-colors"
            >
              How It Works
            </a>
            <a
              href="/#about"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(e, '#about');
              }}
              className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:text-[#176B45] hover:bg-slate-50 transition-colors"
            >
              About
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-[#176B45]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Portal ({user?.role})</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-[#176B45]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
