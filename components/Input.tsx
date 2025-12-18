import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, rightElement, className = '', ...props }) => {
  return (
    <div className="w-full group">
      {label && <label className="block text-xs font-tech uppercase tracking-widest text-slate-400 mb-1.5 group-focus-within:text-cyan-400 transition-colors">{label}</label>}
      <div className="relative">
        <input
          className={`w-full bg-slate-900/30 border-b-2 ${error ? 'border-red-500 text-red-400' : 'border-slate-700 text-slate-100'} px-3 py-2.5 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/10 transition-all font-mono text-sm ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {rightElement}
          </div>
        )}
        {/* Glow effect bar */}
        <div className={`absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-300 group-focus-within:w-full ${error ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : ''}`}></div>
      </div>
      {error && <p className="mt-1 text-xs text-red-400 font-mono flex items-center gap-1">:: {error}</p>}
    </div>
  );
};