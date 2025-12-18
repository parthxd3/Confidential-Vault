import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'cyber';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'cyber', 
  className = '', 
  isLoading,
  disabled,
  ...props 
}) => {
  const baseStyles = "relative group px-5 py-2.5 font-tech font-semibold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-cyan-400/30 clip-path-slant",
    cyber: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:text-cyan-200",
    secondary: "bg-slate-800/50 text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 hover:text-white",
    danger: "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 hover:border-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    ghost: "bg-transparent text-slate-400 hover:text-cyan-400 hover:bg-cyan-900/10"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Scanline effect overlay for cyber buttons */}
      {(variant === 'cyber' || variant === 'primary') && (
         <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
      )}

      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></span>
      ) : null}
      {children}
    </button>
  );
};