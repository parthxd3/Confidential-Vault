import React, { useMemo } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle, Activity } from 'lucide-react';
import { VaultStats } from '../types';

interface Props {
  stats: VaultStats;
}

export const SecurityAdvisor: React.FC<Props> = ({ stats }) => {
  const score = useMemo(() => {
    if (stats.totalLogins === 0) return 100;
    
    let base = 100;
    base -= (stats.weakPasswords * 15);
    base -= (stats.reusedPasswords * 10);
    
    return Math.max(0, Math.min(100, base));
  }, [stats]);

  const getStatusColor = () => {
      if (score >= 80) return { text: 'text-emerald-400', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10' };
      if (score >= 50) return { text: 'text-yellow-400', border: 'border-yellow-500', shadow: 'shadow-yellow-500/20', bg: 'bg-yellow-500/10' };
      return { text: 'text-red-400', border: 'border-red-500', shadow: 'shadow-red-500/20', bg: 'bg-red-500/10' };
  };

  const colors = getStatusColor();

  return (
    <div className="glass-panel border-white/5 overflow-hidden flex flex-col h-full relative">
       {/* Scanner Line Animation */}
       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan"></div>

      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
         <h3 className="font-tech font-semibold text-white tracking-wider flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            SYSTEM_INTEGRITY
         </h3>
         <div className="flex gap-1">
             <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
             <div className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full"></div>
             <div className="w-1.5 h-1.5 bg-cyan-500/20 rounded-full"></div>
         </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 relative">
        <div className="flex items-center gap-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center relative`}>
                {/* Outer Ring */}
                <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="2" fill="none" className="text-slate-800" />
                    <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="4" fill="none" 
                        strokeDasharray={276}
                        strokeDashoffset={276 - (276 * score) / 100}
                        className={`${colors.text} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className={`text-3xl font-mono font-bold ${colors.text} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                    {Math.round(score)}%
                </div>
            </div>
            <div>
                <p className="text-slate-500 text-xs font-mono mb-1 uppercase">Integrity Level</p>
                <h4 className={`text-xl font-tech font-bold ${colors.text} tracking-wide`}>
                    {score >= 80 ? 'OPTIMAL' : score >= 50 ? 'UNSTABLE' : 'CRITICAL'}
                </h4>
                <p className="text-[10px] text-slate-600 font-mono mt-1">LAST_SCAN: NOW</p>
            </div>
        </div>

        <div className="space-y-3">
            <div className="px-1 text-[10px] font-bold text-cyan-700 uppercase tracking-widest font-tech border-b border-cyan-900/30 pb-1 mb-2">
                Diagnostics
            </div>
            
            {stats.weakPasswords > 0 ? (
                 <div className="flex items-start gap-3 p-3 bg-red-950/20 border-l-2 border-red-500">
                    <ShieldAlert className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-mono text-red-300">
                        WARN: {stats.weakPasswords} WEAK_ENTROPY_KEY{stats.weakPasswords > 1 ? 'S' : ''}_DETECTED
                    </p>
                </div>
            ) : (
                <div className="flex items-start gap-3 p-3 bg-emerald-950/20 border-l-2 border-emerald-500">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-mono text-emerald-300">ENTROPY_LEVELS: NORMAL</p>
                </div>
            )}

            {stats.reusedPasswords > 0 ? (
                 <div className="flex items-start gap-3 p-3 bg-yellow-950/20 border-l-2 border-yellow-500">
                    <ShieldAlert className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-mono text-yellow-200">
                        WARN: {stats.reusedPasswords} REDUNDANT_KEY{stats.reusedPasswords > 1 ? 'S' : ''}_FOUND
                    </p>
                </div>
            ) : (
                <div className="flex items-start gap-3 p-3 bg-emerald-950/20 border-l-2 border-emerald-500">
                     <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                     <p className="text-xs font-mono text-emerald-300">REDUNDANCY_CHECK: PASSED</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};