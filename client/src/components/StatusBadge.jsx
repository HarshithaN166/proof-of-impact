import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status = 'PENDING' }) {
  const normalized = (status || '').toUpperCase();

  const configs = {
    VERIFIED: {
      bg: 'bg-[#176B45]/10',
      text: 'text-[#176B45]',
      border: 'border-[#176B45]/20',
      icon: CheckCircle2,
      label: 'Verified On-Chain',
    },
    APPROVED: {
      bg: 'bg-[#176B45]/10',
      text: 'text-[#176B45]',
      border: 'border-[#176B45]/20',
      icon: CheckCircle2,
      label: 'Approved',
    },
    PENDING: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
      label: 'Review Pending',
    },
    REJECTED: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: XCircle,
      label: 'Rejected',
    },
  };

  const config = configs[normalized] || {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: AlertCircle,
    label: normalized || 'Unknown',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
}
