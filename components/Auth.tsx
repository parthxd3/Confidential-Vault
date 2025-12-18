import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, AlertTriangle, Fingerprint } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import * as cryptoService from '../services/cryptoService';

interface AuthProps {
  onUnlock: (password: string) => void;
  isSetupMode: boolean;
}

export const Auth: React.FC<AuthProps> = ({ onUnlock, isSetupMode }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 600));

    try {
      if (isSetupMode) {
        if (password.length < 8) {
          throw new Error("KEY_LENGTH_ERROR: Minimum 8 characters required.");
        }
        if (password !== confirmPassword) {
          throw new Error("MISMATCH_ERROR: Verification failed.");
        }
        const emptyVault = await cryptoService.encryptVault([], password);
        cryptoService.saveToStorage(emptyVault);
        onUnlock(password);
      } else {
        const vault = cryptoService.loadFromStorage();
        if (!vault) throw new Error("VAULT_NOT_FOUND");
        
        await cryptoService.decryptVault(vault, password);
        onUnlock(password);
      }
    } catch (err: any) {
      setError(err.message || "ACCESS_DENIED");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel p-1 rounded-sm relative">
        {/* Decor Borders */}
        <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-cyan-500"></div>
        <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t border-r border-cyan-500"></div>
        <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b border-l border-cyan-500"></div>
        <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-cyan-500"></div>

        <div className="bg-black/40 p-8 backdrop-blur-xl border border-white/5 relative z-10">
          <div className="text-center mb-10">
            <div className="mx-auto w-20 h-20 bg-cyan-950/30 border border-cyan-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)] relative">
                <div className="absolute inset-0 rounded-full border border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent animate-spin-slow"></div>
                {isSetupMode ? <ShieldCheck className="w-8 h-8 text-cyan-400" /> : <Fingerprint className="w-8 h-8 text-cyan-400" />}
            </div>
            <h1 className="text-3xl font-tech font-bold text-white mb-2 tracking-widest uppercase">
              {isSetupMode ? 'Initialize Core' : 'CipherVault Pro'}
            </h1>
            <p className="text-cyan-400/60 font-mono text-xs uppercase tracking-wider">
              {isSetupMode 
                ? 'Create Master Encryption Key' 
                : 'Biometric Handshake Required (Simulated)'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Input
              label="ACCESS_KEY"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
            />
            
            {isSetupMode && (
              <Input
                label="VERIFY_KEY"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            )}

            {error && (
              <div className="p-3 bg-red-950/30 border-l-2 border-red-500 flex items-center gap-3 text-red-400 text-xs font-mono">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>ERR: {error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading} variant="cyber">
              {isSetupMode ? 'ENCRYPT_VAULT_DATA' : 'DECRYPT_SYSTEM'}
              {!isLoading && <Unlock className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              Secured via AES-256-GCM Protocol
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};