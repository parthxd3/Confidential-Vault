import React, { useMemo, useState } from 'react';
import { Search, Plus, Copy, Trash2, Edit2, ExternalLink, LogOut, Key, FolderOpen, CreditCard, Landmark, FileText, Globe, Sliders, Settings, Cpu, Eye, EyeOff } from 'lucide-react';
import { Credential, CredentialCategory, VaultStats } from '../types';
import { Button } from './Button';
import { SecurityAdvisor } from './SecurityAdvisor';
import { AuditLog } from './AuditLog';

interface DashboardProps {
  credentials: Credential[];
  onAdd: () => void;
  onEdit: (cred: Credential) => void;
  onDelete: (id: string) => void;
  onLock: () => void;
  onOpenGenerator: () => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ credentials, onAdd, onEdit, onDelete, onLock, onOpenGenerator, onOpenSettings }) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stealthMode, setStealthMode] = useState(false);

  const filtered = useMemo(() => {
    return credentials.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                            (c.username && c.username.toLowerCase().includes(search.toLowerCase())) ||
                            (c.cardholder && c.cardholder.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [credentials, search, filterCategory]);

  const stats: VaultStats = useMemo(() => {
     let weak = 0;
     let reused = 0;
     const logins = credentials.filter(c => c.type === 'login');
     const passwords = logins.map(c => c.password || '').filter(p => p.length > 0);
     const unique = new Set(passwords);
     reused = passwords.length - unique.size;
     weak = passwords.filter(p => p.length < 12).length; 
     
     return {
         totalItems: credentials.length,
         totalLogins: logins.length,
         weakPasswords: weak,
         reusedPasswords: reused,
     };
  }, [credentials]);

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getItemIcon = (type: string) => {
      switch(type) {
          case 'card': return <CreditCard className="w-5 h-5 text-fuchsia-400" />;
          case 'bank': return <Landmark className="w-5 h-5 text-blue-400" />;
          case 'note': return <FileText className="w-5 h-5 text-yellow-400" />;
          default: return <Globe className="w-5 h-5 text-cyan-400" />;
      }
  };

  const getSecondaryText = (cred: Credential) => {
      if (stealthMode) return '••••••••••••••••';
      switch(cred.type) {
          case 'card': return `•••• ${cred.number?.slice(-4) || '????'}`;
          case 'bank': return cred.accountNumber ? `ACCT: •••• ${cred.accountNumber.slice(-4)}` : 'BANK_DATA';
          case 'note': return 'SECURE_NOTE';
          default: return cred.username || 'NO_USER_ID';
      }
  };

  const getCopyValue = (cred: Credential) => {
       switch(cred.type) {
          case 'card': return cred.number || '';
          case 'bank': return cred.accountNumber || '';
          case 'note': return cred.notes || '';
          default: return cred.password || '';
      }
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-300 flex-col md:flex-row">
        {/* Sidebar */}
        <div className="w-full md:w-64 glass-panel border-r border-white/5 flex flex-col relative z-20 shrink-0">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-cyan-950/50 border border-cyan-500/30 rounded flex items-center justify-center relative shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        <Cpu className="w-6 h-6 text-cyan-400" />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>
                    </div>
                    <div>
                        <span className="font-tech font-bold text-xl tracking-wider text-white block">CIPHER</span>
                        <span className="font-tech text-xs text-cyan-500 tracking-[0.2em] block">VAULT PRO</span>
                    </div>
                </div>
                
                <Button className="w-full" variant="cyber" onClick={onAdd}>
                    <Plus className="w-4 h-4" /> INJECT_DATA
                </Button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto hidden md:block">
                <button 
                    onClick={() => setFilterCategory('All')}
                    className={`w-full flex items-center px-4 py-2.5 text-xs font-mono tracking-wider transition-all border-l-2 ${filterCategory === 'All' ? 'border-cyan-400 bg-cyan-900/10 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                    <FolderOpen className="w-4 h-4 mr-3" />
                    ALL_ITEMS 
                    <span className="ml-auto text-[10px] opacity-50 bg-black/50 px-1.5 py-0.5 rounded">{credentials.length}</span>
                </button>
                
                <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-cyan-700 uppercase tracking-widest font-tech">
                    Classifications
                </div>
                {Object.values(CredentialCategory).map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`w-full flex items-center px-4 py-2 text-xs font-mono transition-all border-l-2 ${filterCategory === cat ? 'border-cyan-400 bg-cyan-900/10 text-cyan-300' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-none mr-3 ${
                            cat === 'Work' ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 
                            cat === 'Social' ? 'bg-purple-500 shadow-[0_0_5px_#a855f7]' : 
                            cat === 'Finance' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 
                            cat === 'Shopping' ? 'bg-pink-500 shadow-[0_0_5px_#ec4899]' : 'bg-slate-500'
                        }`}></span>
                        {cat.toUpperCase()}
                        <span className="ml-auto text-[10px] opacity-50">
                            {credentials.filter(c => c.category === cat).length}
                        </span>
                    </button>
                ))}

                <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-cyan-700 uppercase tracking-widest font-tech">
                    Subroutines
                </div>
                <button onClick={onOpenGenerator} className="w-full flex items-center px-4 py-2 text-xs font-mono text-slate-500 hover:text-cyan-300 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-cyan-500/50">
                    <Sliders className="w-4 h-4 mr-3" />
                    KEY_GEN
                </button>
                <button onClick={onOpenSettings} className="w-full flex items-center px-4 py-2 text-xs font-mono text-slate-500 hover:text-cyan-300 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-cyan-500/50">
                    <Settings className="w-4 h-4 mr-3" />
                    I/O_OPERATIONS
                </button>
            </nav>

            <div className="p-4 border-t border-white/5 hidden md:block">
                <button onClick={onLock} className="flex items-center w-full px-4 py-3 text-xs font-mono text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-500/30 transition-all uppercase tracking-widest">
                    <LogOut className="w-4 h-4 mr-3" />
                    Terminate_Session
                </button>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
            {/* Header */}
            <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center flex-1 max-w-xl relative group mr-4">
                    <Search className="absolute left-3 w-4 h-4 text-cyan-600 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="SEARCH_DATABASE..." 
                        className="w-full bg-slate-900/50 border border-white/5 focus:border-cyan-500/50 rounded-none px-10 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all uppercase"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <button 
                    onClick={() => setStealthMode(!stealthMode)}
                    className={`p-2 rounded border transition-all ${stealthMode ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400' : 'border-white/10 text-slate-500 hover:text-white'}`}
                    title="TOGGLE_STEALTH_MODE"
                >
                    {stealthMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-tech font-bold text-white tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                                DATA_ENTRIES
                            </h2>
                            <span className="text-xs font-mono text-cyan-600 border border-cyan-900/50 px-2 py-1 bg-cyan-950/20">
                                RECORDS: {filtered.length.toString().padStart(3, '0')}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {filtered.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-slate-800 bg-white/5">
                                    <p className="font-mono text-slate-500 text-sm">NO_MATCHING_RECORDS</p>
                                    <Button variant="ghost" className="mt-4" onClick={onAdd}>INITIALIZE_NEW_ENTRY</Button>
                                </div>
                            ) : (
                                filtered.map(cred => (
                                    <div key={cred.id} className="group relative bg-slate-900/40 border border-white/5 hover:border-cyan-500/50 p-4 transition-all duration-300 hover:bg-cyan-950/10 flex items-center justify-between overflow-hidden">
                                        {/* Card Decoration */}
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex items-center gap-5 min-w-0">
                                            <div className="w-10 h-10 bg-black border border-slate-700 group-hover:border-cyan-500/50 flex items-center justify-center transition-colors relative shrink-0">
                                                {getItemIcon(cred.type)}
                                                {/* Corner markers */}
                                                <div className="absolute top-0 left-0 w-0.5 h-0.5 bg-slate-600 group-hover:bg-cyan-400"></div>
                                                <div className="absolute bottom-0 right-0 w-0.5 h-0.5 bg-slate-600 group-hover:bg-cyan-400"></div>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={`font-tech font-bold text-base md:text-lg text-white truncate pr-4 tracking-wide group-hover:text-cyan-200 transition-colors ${stealthMode ? 'blur-sm select-none' : ''}`}>
                                                    {stealthMode ? '••••••••' : cred.name}
                                                </h3>
                                                <p className="text-[10px] md:text-xs font-mono text-slate-500 truncate group-hover:text-cyan-400/70">
                                                    {getSecondaryText(cred)}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform md:translate-x-4 group-hover:translate-x-0">
                                            {cred.url && cred.type === 'login' && !stealthMode && (
                                                <a href={cred.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/30 border border-transparent hover:border-cyan-500/30">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => copyToClipboard(getCopyValue(cred), cred.id)} 
                                                className="p-2 text-slate-500 hover:text-emerald-400 hover:bg-emerald-950/30 border border-transparent hover:border-emerald-500/30 relative"
                                                title="COPY_DATA"
                                            >
                                                {copiedId === cred.id && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] py-1 px-2 font-mono z-50">COPIED</span>}
                                                <Copy className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => onEdit(cred)} 
                                                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-950/30 border border-transparent hover:border-blue-500/30"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(cred.id)} 
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-500/30"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <SecurityAdvisor stats={stats} />
                    </div>
                </div>
            </div>
            
            {/* Audit Log Footer */}
            <AuditLog />
        </div>
    </div>
  );
};