import React from 'react';
import { ShieldCheck, GitBranch, Code2, Terminal, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#176B45] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Proof of Impact
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Don't Just Claim Impact. Prove It. A tamper-evident verification protocol anchoring social and environmental impact records to the blockchain.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-mono">
              <Terminal className="w-3.5 h-3.5 text-[#3B82B6]" />
              <span>Hardhat Local Network (Chain ID: 31337)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white tracking-wider uppercase">
              Platform
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#top" className="hover:text-emerald-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#campaigns" className="hover:text-emerald-400 transition-colors">
                  Explore Campaigns
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  How Verification Works
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-emerald-400 transition-colors">
                  Why Blockchain?
                </a>
              </li>
            </ul>
          </div>

          {/* User Roles */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white tracking-wider uppercase">
              User Workflows
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="text-slate-300 font-semibold">Organizations:</span> Submit impact claims & evidence files
              </li>
              <li>
                <span className="text-slate-300 font-semibold">Verifiers:</span> Independent audit & on-chain attestation
              </li>
              <li>
                <span className="text-slate-300 font-semibold">Public:</span> Inspect tamper-evident proof records
              </li>
              <li>
                <span className="text-slate-300 font-semibold">Admin:</span> Verifier role authorization
              </li>
            </ul>
          </div>

          {/* Project Academic Context */}
          <div className="space-y-3">
            <h5 className="text-sm font-bold text-white tracking-wider uppercase">
              Academic Context
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed">
              Developed as a collegiate capstone project demonstrating real-world applications of decentralized audit trails beyond cryptocurrency.
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] font-semibold text-emerald-300 bg-emerald-900/30 border border-emerald-700/50 px-2.5 py-1 rounded-md">
                Collegiate Capstone Project
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Proof of Impact Platform. Built with React + Vite, Express, MongoDB & Solidity.
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
