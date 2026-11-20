import React from 'react';
import { Database } from 'lucide-react';

export default function StatCard({
  icon: Icon = Database,
  value,
  label,
  subtext = 'Simulated initial metric',
  accentColor = '#176B45',
}) {
  return (
    <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 group">
      {/* Top indicator badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live
        </span>
      </div>

      {/* Main value and label */}
      <div className="space-y-1">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        <p className="text-sm font-semibold text-slate-700">
          {label}
        </p>
      </div>

      {/* Footer hint */}
      <p className="mt-3 text-xs text-slate-400 flex items-center gap-1 border-t border-slate-100 pt-3">
        <span>{subtext}</span>
      </p>
    </div>
  );
}

