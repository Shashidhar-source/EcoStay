import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { motion } from 'framer-motion';
import { SustainabilityMetrics } from '../../types';
import { Sun, Droplets, Trash2, Zap, Users, Hammer } from 'lucide-react';

interface SustainabilityRadarChartProps {
  sustainability: SustainabilityMetrics;
  height?: number;
}

export const SustainabilityRadarChart: React.FC<SustainabilityRadarChartProps> = ({
  sustainability,
  height = 300
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const data = [
    {
      subject: 'Renewable (25%)',
      fullMark: 100,
      score: sustainability.solar || 0,
      icon: Sun,
      color: '#F57C00'
    },
    {
      subject: 'Water (20%)',
      fullMark: 100,
      score: sustainability.water_conservation || 0,
      icon: Droplets,
      color: '#0288D1'
    },
    {
      subject: 'Waste (20%)',
      fullMark: 100,
      score: sustainability.waste_management || 0,
      icon: Trash2,
      color: '#7B1FA2'
    },
    {
      subject: 'Energy Eff. (15%)',
      fullMark: 100,
      score: sustainability.energy_efficiency || 0,
      icon: Zap,
      color: '#FBC02D'
    },
    {
      subject: 'Community (10%)',
      fullMark: 100,
      score: sustainability.local_support || 0,
      icon: Users,
      color: '#00897B'
    },
    {
      subject: 'Green Build (10%)',
      fullMark: 100,
      score: sustainability.green_construction || 0,
      icon: Hammer,
      color: '#558B2F'
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-2xl shadow-xl border border-slate-700">
          <p className="font-bold text-emerald-400">{item.subject}</p>
          <p className="text-sm font-extrabold mt-0.5">Score: {item.score} / 100</p>
          <p className="text-[10px] text-slate-400 mt-1">Weight contributing to EcoScore</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div style={{ width: '100%', height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#E0E7DE" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#2E7D32', fontSize: 11, fontWeight: 700 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#B0BEC5" tick={{ fontSize: 9 }} />
            <Radar
              name="EcoScore Pillar"
              dataKey="score"
              stroke="#2E7D32"
              fill="#2E7D32"
              fillOpacity={0.35}
              isAnimationActive={true}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Numerical Pillar Progress Bars Breakdown with smooth entry */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-emerald-100">
        {data.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.35 }}
              whileHover={{ y: -2 }}
              className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/90 shadow-2xs group"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-1.5 truncate">
                  <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-slate-700 truncate">{item.subject.split(' ')[0]}</span>
                </div>
                <span className="font-black text-eco-dark">{item.score}%</span>
              </div>
              <div className="w-full bg-emerald-200/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: animatedProgress ? `${item.score}%` : '0%', 
                    backgroundColor: item.color 
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
