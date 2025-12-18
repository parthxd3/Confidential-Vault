import React, { useState, useEffect, useCallback } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { CredentialModal } from './components/CredentialModal';
import { GeneratorModal } from './components/GeneratorModal';
import { ImportExportModal } from './components/ImportExportModal';
import { Credential } from './types';
import * as cryptoService from './services/cryptoService';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<Credential | undefined>(undefined);

  // Check if vault exists on mount
  useEffect(() => {
    const hasVault = cryptoService.hasVault();
    setIsSetupMode(!hasVault);
  }, []);

  // Window Focus/Blur for Security (Privacy Shield)
  useEffect(() => {
    const handleWindowBlur = () => {
        if (!isLocked) setIsBlurred(true);
    };
    const handleWindowFocus = () => {
        setIsBlurred(false);
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isLocked]);

  // Idle Timer
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeout);
      if (!isLocked) {
        timeout = setTimeout(() => handleLock(), IDLE_TIMEOUT);
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      clearTimeout(timeout);
    };
  }, [isLocked]);

  const handleUnlock = async (password: string) => {
    try {
      const vault = cryptoService.loadFromStorage();
      if (vault) {
        const decrypted = await cryptoService.decryptVault(vault, password);
        setCredentials(decrypted);
        setMasterPassword(password);
        setIsLocked(false);
      } else if (isSetupMode) {
          // Newly created in Auth component, just set state
          setCredentials([]);
          setMasterPassword(password);
          setIsLocked(false);
          setIsSetupMode(false);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to unlock vault.");
    }
  };

  const handleLock = useCallback(() => {
    setMasterPassword(null);
    setCredentials([]);
    setIsLocked(true);
    setIsBlurred(false);
    setIsGeneratorOpen(false);
    setIsSettingsOpen(false);
    setIsModalOpen(false);
  }, []);

  const saveVault = async (newCredentials: Credential[]) => {
    if (!masterPassword) return;
    try {
      const encrypted = await cryptoService.encryptVault(newCredentials, masterPassword);
      cryptoService.saveToStorage(encrypted);
      setCredentials(newCredentials);
    } catch (e) {
      console.error("Failed to save vault", e);
      alert("Critical Error: Could not save vault.");
    }
  };

  const handleAddCredential = async (data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCred: Credential = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...credentials, newCred];
    await saveVault(updated);
    setIsModalOpen(false);
  };

  const handleEditCredential = async (data: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingCred) return;
    const updatedCred: Credential = {
      ...editingCred,
      ...data,
      updatedAt: Date.now(),
    };
    const updated = credentials.map(c => c.id === editingCred.id ? updatedCred : c);
    await saveVault(updated);
    setIsModalOpen(false);
    setEditingCred(undefined);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const updated = credentials.filter(c => c.id !== id);
      await saveVault(updated);
    }
  };

  const openAddModal = () => {
    setEditingCred(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (cred: Credential) => {
    setEditingCred(cred);
    setIsModalOpen(true);
  };

  const handleImportSuccess = () => {
      // Upon successful import, lock the vault so user re-authenticates with potentially new password 
      // (or the same one, but refreshes state cleanly)
      handleLock();
      alert("Vault restored successfully. Please unlock with the imported vault's password.");
  };

  if (isLocked) {
    return <Auth onUnlock={handleUnlock} isSetupMode={isSetupMode} />;
  }

  return (
    <div className={isBlurred ? 'privacy-blur' : ''}>
      <Dashboard 
        credentials={credentials}
        onAdd={openAddModal}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onLock={handleLock}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <CredentialModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={editingCred ? handleEditCredential : handleAddCredential}
        initialData={editingCred}
      />
      <GeneratorModal 
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />
      <ImportExportModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}

export default App;