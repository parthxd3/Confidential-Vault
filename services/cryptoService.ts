import { EncryptedVault, Credential } from '../types';

// --- TITANIUM PROTOCOL CONFIGURATION ---
const PROTOCOL_VERSION = "TITANIUM_V1";
const PBKDF2_ITERATIONS = 250000; // Increased complexity
const SALT_LENGTH = 32; // Double standard length
const IV_LENGTH = 12;

// --- EVENT BUS FOR TERMINAL LOGS ---
type LogType = 'info' | 'warn' | 'error' | 'success' | 'crypto';
type LogListener = (message: string, type: LogType) => void;
const listeners: Set<LogListener> = new Set();

export const onLog = (fn: LogListener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

const log = (msg: string, type: LogType = 'info') => {
    listeners.forEach(fn => fn(msg.toUpperCase(), type));
};

// --- CORE CRYPTO UTILITIES ---

const toBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const fromBase64 = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- TITANIUM CIPHER IMPLEMENTATION ---

export const generateKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  log(`INIT_PBKDF2_DERIVATION: ITERATIONS=${PBKDF2_ITERATIONS}`, 'crypto');
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  log(`KEY_DERIVED: AES-256-GCM_READY`, 'success');
  return key;
};

export const encryptVault = async (data: Credential[], password: string): Promise<EncryptedVault> => {
  log(`STARTING_ENCRYPTION_SEQUENCE: ${PROTOCOL_VERSION}`, 'info');
  const startTime = performance.now();
  
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  log(`SALT_GENERATED: ${SALT_LENGTH * 8}_BIT`, 'crypto');
  
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  log(`IV_GENERATED: NONCE_UNIQUE`, 'crypto');

  const key = await generateKey(password, salt);
  
  const enc = new TextEncoder();
  const payload = JSON.stringify({
      meta: { version: PROTOCOL_VERSION, timestamp: Date.now() },
      payload: data
  });
  const encodedData = enc.encode(payload);

  log(`ENCRYPTING_PAYLOAD: ${encodedData.length} BYTES`, 'crypto');
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    encodedData
  );

  const duration = (performance.now() - startTime).toFixed(2);
  log(`ENCRYPTION_COMPLETE: ${duration}ms`, 'success');

  return {
    salt: toBase64(salt),
    iv: toBase64(iv),
    data: toBase64(encryptedContent)
  };
};

export const decryptVault = async (vault: EncryptedVault, password: string): Promise<Credential[]> => {
  log(`INITIATING_DECRYPTION_PROTOCOL`, 'info');
  try {
    const salt = new Uint8Array(fromBase64(vault.salt));
    const iv = new Uint8Array(fromBase64(vault.iv));
    const encryptedData = fromBase64(vault.data);
    
    log(`LOADING_CIPHERTEXT: ${encryptedData.byteLength} BYTES`, 'crypto');
    
    const key = await generateKey(password, salt);
    
    log(`ATTEMPTING_AES_GCM_DECRYPT`, 'crypto');
    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encryptedData
    );

    log(`DECRYPTION_SUCCESSFUL: INTEGRITY_VERIFIED`, 'success');
    
    const dec = new TextDecoder();
    const rawString = dec.decode(decryptedContent);
    const json = JSON.parse(rawString);

    // Support legacy (array only) or new Titanium Protocol (object)
    if (Array.isArray(json)) {
        log(`DETECTED_LEGACY_VAULT_FORMAT`, 'warn');
        return json;
    } else if (json.meta && json.payload) {
        log(`TITANIUM_PROTOCOL_VERIFIED: v${json.meta.version}`, 'success');
        return json.payload;
    } else {
        throw new Error("UNKNOWN_DATA_STRUCTURE");
    }

  } catch (e) {
    log(`DECRYPTION_FAILED: AUTHENTICATION_ERROR`, 'error');
    throw new Error("ACCESS_DENIED: INVALID_CREDENTIALS");
  }
};

export const saveToStorage = (vault: EncryptedVault) => {
  log(`WRITING_TO_LOCAL_STORAGE`, 'info');
  localStorage.setItem('cipher_vault_data', JSON.stringify(vault));
  log(`STORAGE_WRITE_COMPLETE`, 'success');
};

export const loadFromStorage = (): EncryptedVault | null => {
  const data = localStorage.getItem('cipher_vault_data');
  if (data) log(`VAULT_BLOB_FOUND_IN_STORAGE`, 'info');
  else log(`NO_VAULT_FOUND: INIT_SETUP_MODE`, 'warn');
  return data ? JSON.parse(data) : null;
};

export const hasVault = (): boolean => {
  return !!localStorage.getItem('cipher_vault_data');
};

export const clearVault = () => {
    log(`EXECUTING_VAULT_PURGE`, 'error');
    localStorage.removeItem('cipher_vault_data');
}

export const isValidVault = (obj: any): obj is EncryptedVault => {
    return (
        obj &&
        typeof obj.iv === 'string' &&
        typeof obj.salt === 'string' &&
        typeof obj.data === 'string'
    );
}