import React from 'react';
import { X, Info, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MilestoneNoticeModal({ isOpen, onClose, mode = 'login' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Authentication Preview' : 'Organization Onboarding'}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#176B45]/10 text-[#176B45]">
              Milestone 1
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            You are currently viewing <strong>Milestone 1 (Frontend Home Page & Layout)</strong>.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 text-slate-700">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <CheckCircle2 className="w-4 h-4 text-[#176B45]" />
            <span>Currently Active:</span>
          </div>
          <p className="text-slate-600 pl-6">
            Complete responsive Home Page, Navbar, Hero, Statistics with demo tags, 4-step How It Works, sample Campaigns, and Proof Inspection modal.
          </p>

          <div className="flex items-center gap-2 font-semibold text-slate-900 pt-2 border-t border-slate-200/60">
            <Info className="w-4 h-4 text-[#3B82B6]" />
            <span>Upcoming Milestones:</span>
          </div>
          <p className="text-slate-600 pl-6">
            Milestone 2 (all UI pages), Milestone 3 (Backend & JWT Auth), Milestone 6 (Solidity Contract), and Milestone 8 (Verifier on-chain review).
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-xs font-bold bg-[#176B45] text-white hover:bg-[#115335] shadow-md shadow-[#176B45]/20 transition-all cursor-pointer"
        >
          Got it, continue exploring!
        </button>
      </div>
    </div>
  );
}

