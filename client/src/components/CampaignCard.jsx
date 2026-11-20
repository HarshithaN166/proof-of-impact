import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  FileText,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';

export default function CampaignCard({ campaign, onInspect }) {
  const [copied, setCopied] = useState(false);
  const [imgErrorCount, setImgErrorCount] = useState(0);

  const handleCopyHash = (e) => {
    e.stopPropagation();
    if (campaign.evidenceHash) {
      navigator.clipboard.writeText(campaign.evidenceHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const target = campaign.target || campaign.targetQuantity || 1;
  const progress = campaign.currentProgress || campaign.verifiedQuantity || 0;
  const progressPercent = Math.min(100, Math.round((progress / target) * 100));

  // Category fallback images (Unsplash CDN + Embedded High-Res SVGs for guaranteed offline reliability)
  const getCategoryUnsplash = (category, title) => {
    const text = `${category || ''} ${title || ''}`.toLowerCase();
    if (text.includes('health') || text.includes('community') || text.includes('medical')) {
      return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('water') || text.includes('cleanliness') || text.includes('sanitation')) {
      return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('food') || text.includes('nutrition') || text.includes('hunger')) {
      return 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('education') || text.includes('school') || text.includes('book')) {
      return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80';
    }
    if (text.includes('animal') || text.includes('wildlife')) {
      return 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80';
    }
    return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
  };

  const getCategorySvgFallback = (category, title) => {
    const text = `${category || ''} ${title || ''}`.toLowerCase();
    if (text.includes('health') || text.includes('community') || text.includes('medical')) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230284c7"/><stop offset="50%" stop-color="%230ea5e9"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="800" height="400" fill="url(%23g)"/><g fill="white" opacity="0.15"><circle cx="700" cy="80" r="120"/><circle cx="100" cy="350" r="160"/></g><text x="400" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="white" text-anchor="middle" letter-spacing="2">HEALTH &amp; COMMUNITY</text><text x="400" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white" opacity="0.9" text-anchor="middle">Verified Medical &amp; Community Outreach</text></svg>`;
    }
    if (text.includes('water') || text.includes('cleanliness') || text.includes('sanitation')) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230284c7"/><stop offset="50%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%232563eb"/></linearGradient></defs><rect width="800" height="400" fill="url(%23g)"/><g fill="white" opacity="0.15"><circle cx="720" cy="100" r="140"/><circle cx="80" cy="320" r="130"/></g><text x="400" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="white" text-anchor="middle" letter-spacing="2">CLEAN WATER INITIATIVE</text><text x="400" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white" opacity="0.9" text-anchor="middle">Safe Drinking Water &amp; Sanitation</text></svg>`;
    }
    if (text.includes('food') || text.includes('nutrition') || text.includes('hunger')) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d97706"/><stop offset="50%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient></defs><rect width="800" height="400" fill="url(%23g)"/><g fill="white" opacity="0.15"><circle cx="700" cy="80" r="120"/><circle cx="100" cy="350" r="160"/></g><text x="400" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="white" text-anchor="middle" letter-spacing="2">FOOD &amp; NUTRITION</text><text x="400" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white" opacity="0.9" text-anchor="middle">Community Sustenance &amp; Food Security</text></svg>`;
    }
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23176B45"/><stop offset="50%" stop-color="%2315803d"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><rect width="800" height="400" fill="url(%23g)"/><g fill="white" opacity="0.15"><circle cx="700" cy="80" r="120"/><circle cx="100" cy="350" r="160"/></g><text x="400" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="900" fill="white" text-anchor="middle" letter-spacing="2">ENVIRONMENT &amp; NATURE</text><text x="400" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="white" opacity="0.9" text-anchor="middle">Ecosystem Restoration &amp; Green Future</text></svg>`;
  };

  // Determine current image to render based on error count:
  // 0: custom campaign.imageUrl if provided, else unsplash category image
  // 1: unsplash category image if custom failed, else svg fallback
  // 2+: guaranteed embedded SVG data URI fallback
  let displayImage = campaign.imageUrl;
  if (!displayImage || imgErrorCount === 1) {
    displayImage = getCategoryUnsplash(campaign.category, campaign.title);
  }
  if (imgErrorCount >= 2 || (!campaign.imageUrl && imgErrorCount >= 1)) {
    displayImage = getCategorySvgFallback(campaign.category, campaign.title);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Visual Header / Banner */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={campaign.title}
          onError={() => setImgErrorCount((prev) => prev + 1)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            {campaign.category}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#176B45] text-white shadow-sm backdrop-blur-sm">
            {campaign.status || 'Active'}
          </span>
        </div>

        {/* Organization Name */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
          <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold shrink-0">
            {(campaign.organizationId?.organizationName || campaign.organizationName || 'O')[0]}
          </div>
          <span className="text-xs font-semibold text-white/95 truncate">
            {campaign.organizationId?.organizationName || campaign.organizationName || 'Authorized Organization'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#176B45] transition-colors leading-snug line-clamp-1">
            {campaign.title}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>
        </div>

        {/* Location & Metrics */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-[#176B45] shrink-0" />
            <span className="truncate">{campaign.locationLabel || 'Verified Location'}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                {progress.toLocaleString()} / {target.toLocaleString()} {campaign.unit}
              </span>
              <span className="font-bold text-[#176B45]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#176B45] to-[#3B82B6] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onInspect && onInspect(campaign)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-[#176B45] hover:text-white bg-[#176B45]/10 hover:bg-[#176B45] transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Inspect Campaign Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}
