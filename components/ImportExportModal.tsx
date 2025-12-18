import React, { useState, useRef } from 'react';
import { X, Download, Upload, AlertTriangle, FileJson, Check } from 'lucide-react';
import { Button } from './Button';
import * as cryptoService from '../services/cryptoService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const ImportExportModal: React.FC<Props> = ({ isOpen, onClose, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importStatus, setImportStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const vault = cryptoService.loadFromStorage();
    if (!vault) return;
    
    const blob = new Blob([JSON.stringify(vault, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TITANIUM_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (cryptoService.isValidVault(json)) {
                if (window.confirm("WARNING: OVERWRITE_PROTOCOL_INITIATED. CONFIRM?")) {
                    cryptoService.saveToStorage(json);
                    setImportStatus('success');
                    setTimeout(() => {
                        onImportSuccess();
                        onClose();
                    }, 1500);
                }
            } else {
                throw new Error("INVALID_FORMAT");
            }
        } catch (err) {
            setImportStatus('error');
            setErrorMsg("FILE_CORRUPTED_OR_INVALID");
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg shadow-[0_0_50px_rgba(6,182,212,0.15)] relative">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
          <h2 className="text-xl font-tech font-bold text-white uppercase tracking-widest">I/O_OPERATIONS</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex border-b border-white/5">
            <button 
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-4 text-xs font-mono tracking-wider transition-all border-b-2 ${activeTab === 'export' ? 'text-cyan-400 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}`}
            >
                EXPORT_DATA
            </button>
            <button 
                onClick={() => setActiveTab('import')}
                className={`flex-1 py-4 text-xs font-mono tracking-wider transition-all border-b-2 ${activeTab === 'import' ? 'text-cyan-400 border-cyan-400 bg-cyan-900/10' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}`}
            >
                RESTORE_DATA
            </button>
        </div>

        <div className="p-8">
            {activeTab === 'export' ? (
                <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-cyan-950/30 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                        <Download className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-tech font-bold text-white uppercase">DOWNLOAD_ENCRYPTED_ARCHIVE</h3>
                        <p className="text-xs font-mono text-slate-500 mt-2">
                            Serialize vault contents (Titanium Protocol V1) to local JSON storage.
                        </p>
                    </div>
                    <div className="p-4 bg-yellow-950/20 border-l-2 border-yellow-500 text-left">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                            <p className="text-[10px] font-mono text-yellow-200 leading-relaxed">
                                SECURITY_WARNING: Archive contains sensitive ciphertext. Protect the file integrity. Unauthorized access to master key will compromise this archive.
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleExport} className="w-full" variant="cyber">
                        INITIATE_DOWNLOAD
                    </Button>
                </div>
            ) : (
                <div className="space-y-6 text-center">
                     <div className="w-20 h-20 bg-blue-950/30 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                        <Upload className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-tech font-bold text-white uppercase">RESTORE_FROM_ARCHIVE</h3>
                        <p className="text-xs font-mono text-slate-500 mt-2">
                            Overwrite current session with external dataset.
                        </p>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept=".json"
                        className="hidden"
                        onChange={handleImport}
                    />

                    {importStatus === 'error' && (
                        <div className="p-3 bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-mono">
                            ERR: {errorMsg}
                        </div>
                    )}
                    {importStatus === 'success' && (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> RESTORE_COMPLETE. REBOOTING...
                        </div>
                    )}

                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={importStatus === 'success'}>
                        <FileJson className="w-4 h-4 mr-2" /> SELECT_SOURCE_FILE
                    </Button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};