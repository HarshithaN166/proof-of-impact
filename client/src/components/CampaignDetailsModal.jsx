import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
  Tag,
  FileText,
  Clock,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { api } from '../services/api';

export default function CampaignDetailsModal({
  campaign,
  isOpen,
  onClose,
  onEdit,
  onDeleted,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!isOpen || !campaign) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      await api.deleteCampaign(campaign._id);
      onDeleted();
      onClose();
    } catch (err) {
      setDeleteError(err.message || 'Failed to remove campaign.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formattedStart = campaign.startDate
    ? new Date(campaign.startDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Not specified';

  const formattedEnd = campaign.endDate
    ? new Date(campaign.endDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Ongoing';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#176B45]/10 text-[#176B45]">
              {campaign.category}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              {campaign.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{campaign.title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Organized by <strong className="text-slate-700">{campaign.organizationName}</strong>
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Description
            </span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {campaign.description}
            </p>
          </div>

          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#176B45]" />
                Target Metric
              </span>
              <p className="text-sm font-bold text-slate-900">
                {campaign.targetQuantity?.toLocaleString()} {campaign.unit}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#3B82B6]" />
                Location
              </span>
              <p className="text-sm font-bold text-slate-900">
                {campaign.locationLabel || 'Flexible / Online'}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#176B45]" />
                Active Timeline
              </span>
              <p className="text-xs font-bold text-slate-800">
                {formattedStart} &rarr; {formattedEnd}
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#3B82B6]" />
                Created In Database
              </span>
              <p className="text-xs font-bold text-slate-800">
                {new Date(campaign.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{deleteError}</span>
            </div>
          )}

          {confirmDelete ? (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-3">
              <p className="font-bold text-rose-800">
                Are you sure you want to delete this campaign?
              </p>
              <p className="text-rose-600 text-[11px]">
                This action will delete the campaign from MongoDB. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-3xl">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Campaign</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(campaign);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Campaign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

