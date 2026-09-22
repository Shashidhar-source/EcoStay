import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { SustainabilityMetrics } from '../../types';

interface EcoCredentialListProps {
  sustainability: SustainabilityMetrics;
}

export const EcoCredentialList: React.FC<EcoCredentialListProps> = ({ sustainability }) => {
  const isVerified = sustainability.certificationStatus === 'verified';

  return (
    <div className="space-y-4">
      {/* Certification Status Header */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
        isVerified 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        <div className={`p-2 rounded-xl text-white mt-0.5 ${isVerified ? 'bg-emerald-600' : 'bg-amber-600'}`}>
          {isVerified ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm">
              {isVerified ? 'Independently Verified Certification' : 'Self-Reported Sustainability Data'}
            </h4>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
              isVerified ? 'bg-emerald-200/80 text-emerald-800' : 'bg-amber-200/80 text-amber-900'
            }`}>
              {sustainability.certificationStatus || 'Verified'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {isVerified 
              ? `Environmental practices and energy generation verified by ${sustainability.certificationIssuer || 'Global Sustainable Tourism Council'}.`
              : 'Data submitted by host; pending independent on-site audit.'}
          </p>
        </div>
      </div>

      {/* Highlights List */}
      {sustainability.highlights && sustainability.highlights.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-eco-primary" />
            Verified Eco Highlights
          </h5>
          <ul className="space-y-2.5">
            {sustainability.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-eco-primary flex-shrink-0 mt-0.5" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
