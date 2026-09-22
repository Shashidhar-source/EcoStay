import React from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { 
  Layers, 
  ArrowLeft, 
  Trash2, 
  X, 
  Sun, 
  Droplets, 
  Trash, 
  Zap, 
  Users, 
  Hammer, 
  ShieldCheck 
} from 'lucide-react';
import { EcoScoreBadge } from '../components/sustainability/EcoScoreBadge';

export const Compare: React.FC = () => {
  const { selectedProperties, removeFromCompare, clearCompare } = useCompare();

  if (selectedProperties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Accommodations Selected</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Explore our Indian sustainable listings and click "Compare" on 2 or more properties to inspect them side-by-side.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 bg-eco-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
        >
          Explore Eco-Stays
        </Link>
      </div>
    );
  }

  const sustainabilityPillars = [
    { key: 'solar', label: 'Renewable Solar & Clean Energy (25%)', icon: Sun, color: 'text-amber-600' },
    { key: 'water_conservation', label: 'Water Conservation & Bawadi (20%)', icon: Droplets, color: 'text-sky-600' },
    { key: 'waste_management', label: 'Zero Single-Use Plastic & Compost (20%)', icon: Trash, color: 'text-purple-600' },
    { key: 'energy_efficiency', label: 'Passive Thermal Energy Efficiency (15%)', icon: Zap, color: 'text-yellow-600' },
    { key: 'local_support', label: 'Local Community & Tribal Support (10%)', icon: Users, color: 'text-teal-600' },
    { key: 'green_construction', label: 'Vernacular Bamboo, Clay & Mud Build (10%)', icon: Hammer, color: 'text-green-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-eco-primary mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-amber-600" />
            Side-by-Side Eco Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare environmental performance, certifications, and amenities across {selectedProperties.length} stays in India.
          </p>
        </div>

        <button
          onClick={clearCompare}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl border border-rose-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Comparison
        </button>
      </div>

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          
          {/* Header row: Property cards */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-wider w-48 align-top">
                Property
              </th>
              {selectedProperties.map(property => (
                <th key={property.id} className="p-5 align-top min-w-[220px]">
                  <div className="relative group space-y-3">
                    <button
                      onClick={() => removeFromCompare(property.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <img
                      src={property.images[0]}
                      alt={property.name}
                      className="w-full h-32 rounded-2xl object-cover shadow-xs"
                    />
                    <div>
                      <Link
                        to={`/accommodation/${property.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-eco-primary transition-colors line-clamp-1"
                      >
                        {property.name}
                      </Link>
                      <span className="text-xs text-slate-500 block truncate">
                        {property.location}, {property.country}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-slate-900">
                        ₹{property.price_per_night.toLocaleString('en-IN')} <span className="text-xs font-normal text-slate-500">/nt</span>
                      </span>
                      <EcoScoreBadge score={property.calculatedEcoScore} size="sm" />
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            
            {/* Overall EcoScore Row */}
            <tr className="bg-emerald-50/40 font-bold">
              <td className="p-4 text-eco-dark font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-eco-primary" />
                Overall EcoScore
              </td>
              {selectedProperties.map(property => (
                <td key={property.id} className="p-4">
                  <div className="flex items-center gap-2">
                    <EcoScoreBadge score={property.calculatedEcoScore} size="md" />
                  </div>
                </td>
              ))}
            </tr>

            {/* Certification Status */}
            <tr>
              <td className="p-4 font-bold text-slate-600">Audit Status</td>
              {selectedProperties.map(property => (
                <td key={property.id} className="p-4 font-semibold text-slate-800">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    property.sustainability.certificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {property.sustainability.certificationStatus === 'verified' ? 'Verified Audit' : 'Self-Reported'}
                  </span>
                </td>
              ))}
            </tr>

            {/* Sustainability Pillars Breakdown Rows */}
            {sustainabilityPillars.map(pillar => {
              const Icon = pillar.icon;
              return (
                <tr key={pillar.key} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="p-4 font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${pillar.color}`} />
                      <span>{pillar.label}</span>
                    </div>
                  </td>
                  {selectedProperties.map(property => {
                    const val = (property.sustainability as any)[pillar.key] || 0;
                    return (
                      <td key={property.id} className="p-4">
                        <div className="space-y-1.5">
                          <span className="font-extrabold text-slate-800">{val}%</span>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-[140px]">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Price & Rating Rows */}
            <tr className="bg-slate-50/50">
              <td className="p-4 font-bold text-slate-600">Price / Night</td>
              {selectedProperties.map(property => (
                <td key={property.id} className="p-4 font-extrabold text-slate-900 text-sm">
                  ₹{property.price_per_night.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-bold text-slate-600">Guest Rating</td>
              {selectedProperties.map(property => (
                <td key={property.id} className="p-4 font-bold text-slate-800">
                  ★ {property.rating} / 5.0
                </td>
              ))}
            </tr>

            {/* Capacity */}
            <tr>
              <td className="p-4 font-bold text-slate-600">Max Capacity</td>
              {selectedProperties.map(property => (
                <td key={property.id} className="p-4 text-slate-700">
                  {property.max_guests} Guests ({property.bedrooms} Beds, {property.bathrooms} Baths)
                </td>
              ))}
            </tr>

            {/* Action Row */}
            <tr className="bg-slate-50/80">
              <td className="p-4 font-bold text-slate-600">Action</td>
              {selectedProperties.map(property => (
                <td key={property.id} className="p-4">
                  <Link
                    to={`/accommodation/${property.id}`}
                    className="inline-block bg-eco-primary hover:bg-eco-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    View & Book
                  </Link>
                </td>
              ))}
            </tr>

          </tbody>

        </table>
      </div>

    </div>
  );
};
