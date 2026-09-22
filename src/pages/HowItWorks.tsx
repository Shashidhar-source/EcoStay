import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Leaf, 
  Sun, 
  Droplets, 
  Trash2, 
  Zap, 
  Users, 
  Hammer, 
  Calculator, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-eco-dark text-xs font-bold px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-eco-primary" />
          <span>Transparent Science-Backed Framework</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
          The EcoScore & Recommendation Engine Explained
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Conventional platforms rank properties solely by budget and popularity. EcoStay introduces an explainable, multi-attribute evaluation framework that pairs your personal travel preferences with audited environmental performance.
        </p>
      </div>

      {/* 6 Pillars Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-eco-primary" />
          <h2 className="text-2xl font-black text-slate-900">
            1. The Six Sustainability Pillars (0 - 100 EcoScore)
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Every accommodation is evaluated across six standardized pillars with weighted percentage contributions to produce an overall numerical score and letter grade (A+ to D):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Sun className="w-4 h-4 text-amber-600" /> Renewable & Clean Energy
              </span>
              <span className="bg-amber-100 text-amber-800 text-xs font-black px-2 py-0.5 rounded-full">25% Weight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              On-site photovoltaic solar glass, micro-hydro turbines, geothermal heat pumps, and clean energy storage capacity.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Droplets className="w-4 h-4 text-sky-600" /> Water Conservation
              </span>
              <span className="bg-sky-100 text-sky-800 text-xs font-black px-2 py-0.5 rounded-full">20% Weight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rainwater harvesting, greywater phytoremediation treatment, low-flow fixtures, and water stewardship.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-purple-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Trash2 className="w-4 h-4 text-purple-600" /> Waste Management & Circularity
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs font-black px-2 py-0.5 rounded-full">20% Weight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero single-use plastic policy, closed-loop composting systems, organic waste digesters, and comprehensive recycling.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-yellow-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Zap className="w-4 h-4 text-yellow-600" /> Passive Energy Efficiency
              </span>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-2 py-0.5 rounded-full">15% Weight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-performance thermal insulation (hemp/sheep wool), bioclimatic airflow ventilation, and smart sensor energy management.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-teal-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Users className="w-4 h-4 text-teal-600" /> Local Community Stewardship
              </span>
              <span className="bg-teal-100 text-teal-800 text-xs font-black px-2 py-0.5 rounded-full">10% Weight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fair local employment, indigenous partnership, sourcing 80%+ ingredients from regional regenerative agriculture.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-green-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Hammer className="w-4 h-4 text-green-700" /> Green Architecture & Timber
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-black px-2 py-0.5 rounded-full">10% Weight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              FSC-certified timber, architectural bamboo, recycled maritime materials, and LEED / BREEAM / EarthCheck certification.
            </p>
          </div>

        </div>
      </div>

      {/* Recommendation Engine Formula */}
      <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl space-y-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-2 text-amber-400">
          <Calculator className="w-6 h-6" />
          <h2 className="text-2xl font-black">2. Explainable Recommendation Engine Formula</h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          When you execute a search, properties are ranked using a multi-factor composite algorithm designed to optimize sustainability without compromising your budget or comfort:
        </p>

        {/* Formula Box */}
        <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 text-emerald-300 font-mono text-xs sm:text-sm space-y-2 overflow-x-auto">
          <p className="font-bold text-white mb-2">// Final Recommendation Composite Score (0 - 100):</p>
          <p>Score = (0.40 × Sustainability Score)</p>
          <p>        + (0.25 × Preference Match Score)</p>
          <p>        + (0.15 × Location Match Score)</p>
          <p>        + (0.10 × Budget Match Score)</p>
          <p>        + (0.10 × User Guest Rating)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300 pt-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Transparent:</strong> Users see exact reasons behind each match.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Defensible:</strong> Mathematical normalization prevents bias.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span><strong>Anti-Greenwashing:</strong> Verifiable metrics over marketing slogans.</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-black text-slate-900">Ready to find your next eco-friendly stay?</h3>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all text-sm"
        >
          <span>Explore All Sustainable Accommodations</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
