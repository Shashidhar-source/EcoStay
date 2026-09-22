import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, UserX, Sparkles } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { role, setRole } = useAuth();

  return (
    <div className="bg-emerald-950 text-white text-xs py-1.5 px-4 sticky top-0 z-50 shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            EcoStay India Demo:
          </span>
          <span className="text-emerald-100/80 hidden sm:inline">
            Switch persona to test role-specific features & admin controls
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-900/80 p-1 rounded-lg border border-emerald-700/50">
          <button
            onClick={() => setRole('guest')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium ${
              role === 'guest'
                ? 'bg-white text-emerald-950 shadow-sm font-bold'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
            }`}
            title="Browse without account"
          >
            <UserX className="w-3.5 h-3.5" />
            Guest
          </button>

          <button
            onClick={() => setRole('user')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium ${
              role === 'user'
                ? 'bg-emerald-500 text-white shadow-sm font-bold'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
            }`}
            title="Logged in as Aarav (Traveler)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Traveler (Aarav)
          </button>

          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all font-medium ${
              role === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-emerald-200 hover:text-white hover:bg-emerald-800/60'
            }`}
            title="Platform Admin (Priya) with CRUD and Analytics"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin (Priya)
          </button>
        </div>
      </div>
    </div>
  );
};
