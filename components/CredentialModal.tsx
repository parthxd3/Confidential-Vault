import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Eye, EyeOff, CreditCard, Globe, Landmark, FileText, Lock, Cpu } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Credential, CredentialCategory, ItemType } from '../types';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cred: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Credential;
}

export const CredentialModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [type, setType] = useState<ItemType>('login');
  const [formData, setFormData] = useState<Partial<Credential>>({
    name: '',
    category: CredentialCategory.OTHER,
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setFormData({ ...initialData });
    } else {
        setType('login');
        setFormData({
            name: '',
            category: CredentialCategory.OTHER,
            notes: '',
            username: '',
            password: '',
            url: ''
          });
    }
  }, [initialData, isOpen]);

  const updateField = (field: keyof Credential, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSimpleGenerate = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i=0; i<24; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    updateField('password', pass);
  };

  const handleSubmit = () => {
      if (!formData.name) return;
      onSave({
          type,
          name: formData.name || 'Untitled',
          category: formData.category || CredentialCategory.OTHER,
          notes: formData.notes,
          ...formData
      } as any);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl flex flex-col max-h-[90vh] relative shadow-[0_0_50px_rgba(6,182,212,0.1)]">
        {/* Holographic Border Overlay */}
        <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none"></div>
        
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 flex items-center justify-center bg-cyan-950 border border-cyan-500/30">
                <Cpu className="w-5 h-5 text-cyan-400" />
             </div>
             <div>
                <h2 className="text-lg font-tech font-bold text-white tracking-widest uppercase">
                    {initialData ? 'EDIT_PROTOCOL' : 'NEW_ENTRY_PROTOCOL'}
                </h2>
                <p className="text-[10px] text-cyan-600 font-mono">SECURE_WRITE_ACCESS_GRANTED</p>
             </div>
             
             {!initialData && (
                 <div className="flex bg-black/50 border border-white/10 p-1 ml-6">
                     {['login', 'card', 'bank', 'note'].map((t) => (
                         <button 
                            key={t}
                            onClick={() => setType(t as ItemType)} 
                            className={`p-2 transition-all border ${type === t ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'border-transparent text-slate-500 hover:text-white'}`}
                            title={t.toUpperCase()}
                        >
                            {t === 'login' && <Globe className="w-4 h-4"/>}
                            {t === 'card' && <CreditCard className="w-4 h-4"/>}
                            {t === 'bank' && <Landmark className="w-4 h-4"/>}
                            {t === 'note' && <FileText className="w-4 h-4"/>}
                         </button>
                     ))}
                 </div>
             )}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-red-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 bg-gradient-to-br from-black/20 to-cyan-950/10">
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-6">
                 <div className="col-span-2">
                    <Input
                        label={type === 'card' ? 'ISSUER_ID' : type === 'bank' ? 'INSTITUTION_ID' : 'SERVICE_IDENTIFIER'}
                        placeholder={type === 'login' ? 'e.g. NETFLIX_MAIN' : ''}
                        value={formData.name}
                        onChange={e => updateField('name', e.target.value)}
                        autoFocus
                    />
                 </div>
                 <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-tech uppercase tracking-widest text-slate-400 mb-1.5">DATA_CATEGORY</label>
                    <select
                        className="w-full bg-slate-900/30 border-b-2 border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/10 font-mono text-sm transition-colors"
                        value={formData.category}
                        onChange={e => updateField('category', e.target.value)}
                    >
                        {Object.values(CredentialCategory).map(cat => (
                            <option key={cat} value={cat} className="bg-slate-900">{cat.toUpperCase()}</option>
                        ))}
                    </select>
                 </div>
            </div>

            {/* Login Type */}
            {type === 'login' && (
                <>
                    <Input
                        label="USER_IDENTIFIER"
                        value={formData.username || ''}
                        onChange={e => updateField('username', e.target.value)}
                    />
                     <div className="group">
                        <label className="block text-xs font-tech uppercase tracking-widest text-slate-400 mb-1.5 group-focus-within:text-cyan-400 transition-colors">ACCESS_KEY</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-slate-900/30 border-b-2 border-slate-700 px-3 py-2.5 text-cyan-300 pr-20 focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/10 font-mono text-sm transition-colors"
                                value={formData.password || ''}
                                onChange={e => updateField('password', e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSimpleGenerate}
                                    className="p-1.5 text-slate-500 hover:text-cyan-400 transition-colors"
                                    title="AUTO_GEN"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all duration-300 group-focus-within:w-full"></div>
                        </div>
                    </div>
                    <Input
                        label="NETWORK_LOCATOR (URL)"
                        value={formData.url || ''}
                        onChange={e => updateField('url', e.target.value)}
                    />
                </>
            )}

            {/* Card Type */}
            {type === 'card' && (
                <>
                    <Input
                        label="HOLDER_NAME"
                        value={formData.cardholder || ''}
                        onChange={e => updateField('cardholder', e.target.value)}
                    />
                    <Input
                        label="PAN_NUMBER"
                        value={formData.number || ''}
                        onChange={e => updateField('number', e.target.value.replace(/\D/g, '').substring(0, 19))}
                        placeholder="0000 0000 0000 0000"
                    />
                    <div className="grid grid-cols-3 gap-6">
                        <Input
                            label="EXP_DATE"
                            value={formData.expiry || ''}
                            onChange={e => updateField('expiry', e.target.value)}
                            placeholder="MM/YY"
                        />
                         <Input
                            label="CVV_CODE"
                            value={formData.cvv || ''}
                            onChange={e => updateField('cvv', e.target.value)}
                            type="password"
                            maxLength={4}
                        />
                         <Input
                            label="PIN_CODE"
                            value={formData.pin || ''}
                            onChange={e => updateField('pin', e.target.value)}
                            type="password"
                            maxLength={6}
                        />
                    </div>
                </>
            )}

            {/* Bank Type */}
            {type === 'bank' && (
                <>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                             <Input
                                label="ACCOUNT_ID"
                                value={formData.accountNumber || ''}
                                onChange={e => updateField('accountNumber', e.target.value)}
                            />
                        </div>
                        <Input
                            label="ROUTING_NO"
                            value={formData.routingNumber || ''}
                            onChange={e => updateField('routingNumber', e.target.value)}
                        />
                         <Input
                            label="SWIFT_BIC"
                            value={formData.swift || ''}
                            onChange={e => updateField('swift', e.target.value)}
                        />
                        <div className="col-span-2">
                             <Input
                                label="IBAN_CODE"
                                value={formData.iban || ''}
                                onChange={e => updateField('iban', e.target.value)}
                            />
                        </div>
                    </div>
                </>
            )}

          <div>
             <label className="block text-xs font-tech uppercase tracking-widest text-slate-400 mb-1.5">ENCRYPTED_NOTES</label>
             <textarea
                className="w-full bg-slate-900/30 border-b-2 border-slate-700 px-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-400 focus:bg-cyan-950/10 font-mono text-sm min-h-[100px] transition-colors resize-none"
                value={formData.notes || ''}
                onChange={e => updateField('notes', e.target.value)}
                placeholder="// Enter sensitive data here..."
             />
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/40">
          <Button variant="ghost" onClick={onClose}>ABORT</Button>
          <Button variant="cyber" onClick={handleSubmit}>COMMIT_TO_VAULT</Button>
        </div>
      </div>
    </div>
  );
};