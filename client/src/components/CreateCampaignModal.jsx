import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
  Tag,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { api } from '../services/api';

const CATEGORIES = [
  'Environment',
  'Food and Nutrition',
  'Education',
  'Health and Community',
  'Cleanliness',
  'Animal Welfare',
  'Other',
];

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess,
  editCampaign = null,
}) {
  const isEditing = Boolean(editCampaign);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Environment',
    unit: '',
    targetQuantity: '',
    locationLabel: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'ACTIVE',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editCampaign) {
      setFormData({
        title: editCampaign.title || '',
        description: editCampaign.description || '',
        category: editCampaign.category || 'Environment',
        unit: editCampaign.unit || '',
        targetQuantity: editCampaign.targetQuantity || '',
        locationLabel: editCampaign.locationLabel || '',
        startDate: editCampaign.startDate
          ? new Date(editCampaign.startDate).toISOString().split('T')[0]
          : '',
        endDate: editCampaign.endDate
          ? new Date(editCampaign.endDate).toISOString().split('T')[0]
          : '',
        status: editCampaign.status || 'ACTIVE',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Environment',
        unit: '',
        targetQuantity: '',
        locationLabel: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'ACTIVE',
      });
    }
    setError('');
  }, [editCampaign, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field validation
    if (!formData.title.trim()) {
      setError('Please provide a campaign title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a short description for the campaign.');
      return;
    }
    if (!formData.unit.trim()) {
      setError('Please specify the unit of impact (e.g. saplings, meals, books).');
      return;
    }
    if (formData.targetQuantity && Number(formData.targetQuantity) < 0) {
      setError('Target quantity cannot be negative.');
      return;
    }
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date cannot be prior to start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        unit: formData.unit.trim(),
        targetQuantity: Number(formData.targetQuantity) || 0,
        locationLabel: formData.locationLabel.trim(),
        startDate: formData.startDate ? new Date(formData.startDate) : new Date(),
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        status: formData.status,
      };

      if (isEditing) {
        await api.updateCampaign(editCampaign._id, payload);
      } else {
        await api.createCampaign(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#176B45]/10 text-[#176B45] flex items-center justify-center">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Impact Campaign' : 'Create New Impact Campaign'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update campaign goals and details'
                  : 'Establish measurable scope and metrics for your organization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Campaign Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Green Campus Tree Planting Drive"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
            />
          </div>

          {/* Category & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Impact Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Campaign Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              >
                <option value="ACTIVE">ACTIVE (Accepting Submissions)</option>
                <option value="DRAFT">DRAFT (Unpublished)</option>
                <option value="COMPLETED">COMPLETED (Goal Finished)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Outline the purpose, beneficiaries, community partners, and measurable objectives..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all resize-none"
            />
          </div>

          {/* Target Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Target Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="targetQuantity"
                  min="0"
                  required
                  value={formData.targetQuantity}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Unit of Impact <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                placeholder="e.g. saplings, meals, books, kg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Activity Location Label
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                name="locationLabel"
                value={formData.locationLabel}
                onChange={handleChange}
                placeholder="e.g. University North Grounds, Sector 4"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>
          </div>

          {/* Start and End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                End Date (Optional)
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B45]/20 focus:border-[#176B45] transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#176B45] hover:bg-[#115335] shadow-md shadow-[#176B45]/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Publish Campaign'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

