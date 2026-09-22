import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Building2, 
  Users, 
  X, 
  TrendingUp,
  Activity,
  Database,
  RefreshCw,
  Server
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { accommodationService, adminService, reviewService } from '../services/api';
import { Accommodation, AdminDashboardMetrics, Review, SustainabilityMetrics, ProviderTelemetry } from '../types';
import { EcoScoreBadge } from '../components/sustainability/EcoScoreBadge';
import { calculateEcoScore } from '../services/recommendationEngine';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [providers, setProviders] = useState<ProviderTelemetry[]>([]);
  const [providerSummary, setProviderSummary] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'accommodations' | 'analytics' | 'reviews' | 'providers'>('accommodations');
  const [isRefreshingProviders, setIsRefreshingProviders] = useState<boolean>(false);
  
  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStay, setEditingStay] = useState<Accommodation | null>(null);

  // Form fields with Indian defaults
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('India');
  const [propertyType, setPropertyType] = useState<Accommodation['property_type']>('eco_lodge');
  const [pricePerNight, setPricePerNight] = useState(6500);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [certificationStatus, setCertificationStatus] = useState<'verified' | 'self_reported'>('verified');
  const [certificationIssuer, setCertificationIssuer] = useState('');

  // 6 sustainability metrics state
  const [sustainability, setSustainability] = useState<SustainabilityMetrics>({
    solar: 90,
    water_conservation: 90,
    waste_management: 85,
    energy_efficiency: 90,
    local_support: 85,
    green_construction: 90,
    highlights: ['100% solar array microgrid', 'Certified zero single-use plastic', 'Ayurvedic organic kitchen']
  });

  const loadData = async () => {
    const m = await adminService.getMetrics();
    const a = await accommodationService.getAll();
    const r = await reviewService.getAllForAdmin();
    const p = await adminService.getProviderStatus();
    setMetrics(m);
    setAccommodations(a);
    setReviews(r);
    if (p && p.providers) {
      setProviders(p.providers);
      setProviderSummary(p.summary);
    }
  };

  const handleRefreshProviders = async () => {
    setIsRefreshingProviders(true);
    try {
      const p = await adminService.getProviderStatus();
      if (p && p.providers) {
        setProviders(p.providers);
        setProviderSummary(p.summary);
      }
    } finally {
      setIsRefreshingProviders(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingStay(null);
    setName('');
    setTagline('');
    setLocation('Munnar, Kerala');
    setCountry('India');
    setPropertyType('treehouse');
    setPricePerNight(6500);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80');
    setCertificationStatus('verified');
    setCertificationIssuer('Kerala Responsible Tourism Mission & GRIHA Green');
    setSustainability({
      solar: 90,
      water_conservation: 92,
      waste_management: 90,
      energy_efficiency: 88,
      local_support: 95,
      green_construction: 92,
      highlights: ['Solar-powered climate control', 'Zero-waste bio-composting', 'Rainwater Bawadi collection']
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: Accommodation) => {
    setEditingStay(acc);
    setName(acc.name);
    setTagline(acc.tagline);
    setLocation(acc.location);
    setCountry(acc.country);
    setPropertyType(acc.property_type);
    setPricePerNight(acc.price_per_night);
    setDescription(acc.description);
    setImageUrl(acc.images[0] || '');
    setCertificationStatus(acc.sustainability.certificationStatus === 'self_reported' ? 'self_reported' : 'verified');
    setCertificationIssuer(acc.sustainability.certificationIssuer || '');
    setSustainability(acc.sustainability);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this accommodation from the platform?')) {
      await accommodationService.delete(id);
      loadData();
    }
  };

  const handleResetDefaults = async () => {
    if (confirm('Reset all accommodation listings to default Indian seed data?')) {
      await accommodationService.resetDefaults();
      loadData();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedMetrics: SustainabilityMetrics = {
      ...sustainability,
      certificationStatus,
      certificationIssuer
    };

    const calculatedScore = calculateEcoScore(updatedMetrics);

    const newOrUpdatedStay: Accommodation = {
      id: editingStay ? editingStay.id : `eco_${Date.now()}`,
      name,
      tagline,
      location,
      country,
      property_type: propertyType,
      price_per_night: Number(pricePerNight),
      rating: editingStay ? editingStay.rating : 4.9,
      review_count: editingStay ? editingStay.review_count : 1,
      status: 'active',
      description,
      images: [imageUrl],
      amenities: editingStay ? editingStay.amenities : ['100% Solar Powered', 'Zero Waste & Bio-Compost', 'Rainwater Harvesting & Bawadi', 'High-speed Fiber/Starlink WiFi'],
      sustainability: updatedMetrics,
      calculatedEcoScore: calculatedScore,
      max_guests: editingStay ? editingStay.max_guests : 4,
      bedrooms: editingStay ? editingStay.bedrooms : 2,
      bathrooms: editingStay ? editingStay.bathrooms : 2,
      featured: editingStay ? editingStay.featured : false
    };

    await accommodationService.save(newOrUpdatedStay);
    setIsModalOpen(false);
    loadData();
  };

  // Preview score calculation in real time
  const livePreviewScore = calculateEcoScore(sustainability);

  // Chart Data
  const scoreDistributionData = [
    { grade: 'Grade A+ (90-100)', count: accommodations.filter(a => a.calculatedEcoScore >= 90).length, fill: '#1B5E20' },
    { grade: 'Grade A (80-89)', count: accommodations.filter(a => a.calculatedEcoScore >= 80 && a.calculatedEcoScore < 90).length, fill: '#2E7D32' },
    { grade: 'Grade B (70-79)', count: accommodations.filter(a => a.calculatedEcoScore >= 70 && a.calculatedEcoScore < 80).length, fill: '#558B2F' },
    { grade: 'Grade C (60-69)', count: accommodations.filter(a => a.calculatedEcoScore < 70).length, fill: '#F57F17' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/40 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Platform Management & Verification Portal (India)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            EcoStay Admin Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage Indian accommodations, audit 6-pillar GRIHA/IGBC sustainability records, and inspect platform analytics in ₹ INR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors"
            title="Reset database to Indian seed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Seed Data
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-eco-primary hover:bg-eco-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-900/40 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            Add New Indian Eco-Stay
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Accommodations
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalAccommodations}</span>
              <span className="text-xs font-semibold text-emerald-600">Listed (India)</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Verified Audits
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-eco-dark">{metrics.verifiedAccommodations}</span>
              <span className="text-xs font-bold text-slate-400">/ {metrics.totalAccommodations}</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Platform Avg EcoScore
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-eco-primary">{metrics.averageEcoScore}</span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -3 }}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1"
          >
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              CO₂ Offset Generated
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-teal-700">{metrics.carbonOffsetKg.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('accommodations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'accommodations'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Accommodations & Eco-Audits ({accommodations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sustainability Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Review Moderation ({reviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('providers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'providers'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Live Data Sources & APIs</span>
        </button>
      </div>

      {/* Tab: Accommodations CRUD Table */}
      {activeTab === 'accommodations' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Property</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price / Nt</th>
                  <th className="p-4">EcoScore</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {accommodations.map(acc => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={acc.images[0]}
                        alt={acc.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{acc.name}</span>
                        <span className="text-[10px] text-slate-400">ID: {acc.id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {acc.location}, {acc.country}
                    </td>
                    <td className="p-4 capitalize">
                      {acc.property_type.replace('_', ' ')}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      ₹{acc.price_per_night.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <EcoScoreBadge score={acc.calculatedEcoScore} size="sm" />
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        acc.sustainability.certificationStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {acc.sustainability.certificationStatus === 'verified' ? 'Verified Audit' : 'Self-Reported'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(acc)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors inline-flex items-center"
                        title="Edit Accommodation & Scores"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors inline-flex items-center"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">EcoScore Grade Distribution (India)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData}>
                  <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2E7D32" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Sustainability Verification Breakdown</h3>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Third-Party Independently Audited (GRIHA/IGBC/GSTC)</span>
                <span className="font-bold text-emerald-800">{metrics?.verifiedAccommodations} Properties</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Self-Reported / Pending State Tourism Audit</span>
                <span className="font-bold text-amber-800">{(metrics?.totalAccommodations || 0) - (metrics?.verifiedAccommodations || 0)} Properties</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Submitted Reviews & Eco-Audit Logs</h3>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="p-4 rounded-2xl border border-slate-200/70 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{r.user_name}</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                    {r.status}
                  </span>
                </div>
                <p className="text-slate-600">"{r.comment}"</p>
                {r.sustainability_comment && (
                  <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg font-medium">
                    Eco Observation: {r.sustainability_comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Live Data Sources & API Telemetry */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          
          {/* Summary Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Server className="w-4 h-4 text-eco-primary" />
                <h3 className="text-sm font-black text-slate-900">Multi-Provider Live Data Engine</h3>
              </div>
              <p className="text-xs text-slate-500">
                Orchestrates real-time geospatial queries across Google Places, Foursquare, OpenStreetMap, and EcoStay DB.
              </p>
            </div>

            <button
              onClick={handleRefreshProviders}
              disabled={isRefreshingProviders}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingProviders ? 'animate-spin' : ''}`} />
              <span>{isRefreshingProviders ? 'Refreshing...' : 'Ping Providers'}</span>
            </button>
          </div>

          {/* Provider Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(p => {
              const isActive = p.status === 'ACTIVE';
              const isDegraded = p.status === 'DEGRADED';
              const isStandby = p.status === 'STANDBY';
              const isLocal = p.providerName.includes('EcoStay') || p.providerName.includes('OpenStreetMap');

              return (
                <div 
                  key={p.providerName}
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-slate-400" />
                        <h4 className="font-bold text-xs text-slate-900">{p.providerName}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isActive 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : isDegraded 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        ● {p.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {isLocal 
                        ? 'Primary zero-cost geospatial and verified knowledge layer.' 
                        : 'External cloud discovery API key configured in .env'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Requests</span>
                      <span className="text-xs font-black text-slate-900">{p.totalRequests}</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Latency</span>
                      <span className="text-xs font-black text-slate-900">{p.avgLatencyMs} ms</span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Errors</span>
                      <span className={`text-xs font-black ${p.failedRequests > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {p.failedRequests}
                      </span>
                    </div>
                  </div>

                  {p.lastError && (
                    <div className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg">
                      Note: {p.lastError}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Modal: Add / Edit Accommodation with Sustainability Sliders */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl border border-slate-100">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingStay ? 'Edit Indian Accommodation & Eco-Audit' : 'Add New Indian Eco-Stay'}
                </h3>
                <p className="text-xs text-slate-400">
                  Calculates live 6-pillar weighted EcoScore (₹ INR)
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Live EcoScore Preview Badge */}
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-eco-dark block">Calculated EcoScore Preview</span>
                  <span className="text-[11px] text-slate-500">Based on 6 weighted sustainability metrics</span>
                </div>
                <EcoScoreBadge score={livePreviewScore} size="lg" />
              </div>

              {/* General Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price Per Night (₹ INR)</label>
                  <input
                    required
                    type="number"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location (State / Region)</label>
                  <input
                    required
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                  <input
                    required
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e: any) => setPropertyType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary bg-white"
                  >
                    <option value="treehouse">Canopy Treehouse</option>
                    <option value="cabin">Passive Solar Earth-Cabin</option>
                    <option value="glamping">Desert / Hill Glamping</option>
                    <option value="villa">Agroforest Villa</option>
                    <option value="boutique_hotel">Heritage Eco-Hotel</option>
                    <option value="eco_lodge">Vedic Forest Lodge</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Tagline</label>
                <input
                  required
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  required
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary resize-none"
                />
              </div>

              {/* 6 Pillars Sliders */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-eco-dark uppercase tracking-wider">
                  Sustainability Pillar Scores (0 - 100)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Solar & Renewable (25% wt)</span>
                      <span className="text-amber-600">{sustainability.solar}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sustainability.solar}
                      onChange={(e) => setSustainability({ ...sustainability, solar: Number(e.target.value) })}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Water Conservation & Bawadi (20% wt)</span>
                      <span className="text-sky-600">{sustainability.water_conservation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sustainability.water_conservation}
                      onChange={(e) => setSustainability({ ...sustainability, water_conservation: Number(e.target.value) })}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Zero Waste & Compost (20% wt)</span>
                      <span className="text-purple-600">{sustainability.waste_management}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sustainability.waste_management}
                      onChange={(e) => setSustainability({ ...sustainability, waste_management: Number(e.target.value) })}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Passive Energy Efficiency (15% wt)</span>
                      <span className="text-yellow-600">{sustainability.energy_efficiency}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sustainability.energy_efficiency}
                      onChange={(e) => setSustainability({ ...sustainability, energy_efficiency: Number(e.target.value) })}
                      className="w-full accent-yellow-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Local Tribal/Community Support (10% wt)</span>
                      <span className="text-teal-600">{sustainability.local_support}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sustainability.local_support}
                      onChange={(e) => setSustainability({ ...sustainability, local_support: Number(e.target.value) })}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1">
                      <span>Vernacular Bamboo & Mud Build (10% wt)</span>
                      <span className="text-green-700">{sustainability.green_construction}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sustainability.green_construction}
                      onChange={(e) => setSustainability({ ...sustainability, green_construction: Number(e.target.value) })}
                      className="w-full accent-green-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Certification audit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Certification Body</label>
                  <input
                    type="text"
                    value={certificationIssuer}
                    onChange={(e) => setCertificationIssuer(e.target.value)}
                    placeholder="e.g. GRIHA Platinum, Kerala Responsible Tourism"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Audit Status</label>
                  <select
                    value={certificationStatus}
                    onChange={(e: any) => setCertificationStatus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-eco-primary bg-white"
                  >
                    <option value="verified">Verified Independent Audit</option>
                    <option value="self_reported">Self-Reported Data</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-eco-primary hover:bg-eco-dark text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {editingStay ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
