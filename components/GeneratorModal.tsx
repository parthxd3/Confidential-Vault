import React, { useState, useEffect } from 'react';
import { X, Copy, RefreshCw, Sliders } from 'lucide-react';
import { Button } from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GeneratorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const sets = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    let chars = '';
    if (options.upper) chars += sets.upper;
    if (options.lower) chars += sets.lower;
    if (options.numbers) chars += sets.numbers;
    if (options.symbols) chars += sets.symbols;

    if (chars === '') return setPassword('');

    // Ensure at least one of each selected type
    let result = [];
    if (options.upper) result.push(sets.upper[Math.floor(Math.random() * sets.upper.length)]);
    if (options.lower) result.push(sets.lower[Math.floor(Math.random() * sets.lower.length)]);
    if (options.numbers) result.push(sets.numbers[Math.floor(Math.random() * sets.numbers.length)]);
    if (options.symbols) result.push(sets.symbols[Math.floor(Math.random() * sets.symbols.length)]);

    while (result.length < length) {
      result.push(chars[Math.floor(Math.random() * chars.length)]);
    }

    // Shuffle
    setPassword(result.sort(() => Math.random() - 0.5).join(''));
  };

  useEffect(() => {
    if (isOpen) generate();
  }, [isOpen, length, options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md relative">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
          <h2 className="text-xl font-tech font-bold text-white flex items-center gap-2 uppercase tracking-wider">
            <Sliders className="w-5 h-5 text-cyan-400" />
            ENTROPY_GENERATOR
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-8">
           <div className="bg-black border border-cyan-500/30 p-4 relative flex items-center justify-between group shadow-[0_0_20px_rgba(6,182,212,0.1)]">
               <span className="font-mono text-xl text-cyan-300 break-all">{password}</span>
               
               <div className="absolute inset-0 bg-cyan-400/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="flex items-center gap-2 ml-4 relative z-10">
                    <button onClick={generate} className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-900/20 rounded-sm transition-colors">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button onClick={copyToClipboard} className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-sm transition-colors relative">
                        <Copy className="w-5 h-5" />
                        {copied && <span className="absolute -top-8 right-0 bg-emerald-600 text-white text-[10px] px-2 py-1 font-mono">COPIED</span>}
                    </button>
               </div>
           </div>

           <div className="space-y-6">
               <div>
                   <div className="flex justify-between text-xs font-mono text-cyan-500 mb-2 uppercase tracking-widest">
                       <span>BIT_STRENGTH (LENGTH)</span>
                       <span>[{length}]</span>
                   </div>
                   <input 
                      type="range" 
                      min="8" 
                      max="64" 
                      value={length} 
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full h-1 bg-slate-800 appearance-none cursor-pointer accent-cyan-400"
                   />
               </div>

               <div className="grid grid-cols-2 gap-4">
                   {[
                       { key: 'upper', label: 'UPPERCASE (A-Z)' },
                       { key: 'lower', label: 'LOWERCASE (a-z)' },
                       { key: 'numbers', label: 'NUMERICS (0-9)' },
                       { key: 'symbols', label: 'SYMBOLS (!@#)' },
                   ].map(opt => (
                       <label key={opt.key} className="flex items-center gap-3 text-slate-400 cursor-pointer group">
                           <div className={`w-4 h-4 border flex items-center justify-center transition-all ${options[opt.key as keyof typeof options] ? 'bg-cyan-500/20 border-cyan-400' : 'border-slate-600'}`}>
                                {options[opt.key as keyof typeof options] && <div className="w-2 h-2 bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>}
                           </div>
                           <input 
                              type="checkbox" 
                              checked={options[opt.key as keyof typeof options]}
                              onChange={() => setOptions(prev => ({...prev, [opt.key]: !prev[opt.key as keyof typeof options]}))}
                              className="hidden"
                           />
                           <span className="text-xs font-mono group-hover:text-cyan-300 transition-colors">{opt.label}</span>
                       </label>
                   ))}
               </div>
           </div>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end bg-black/40">
            <Button variant="cyber" onClick={onClose}>ACCEPT_SEQUENCE</Button>
        </div>
      </div>
    </div>
  );
};