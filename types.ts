export type ItemType = 'login' | 'card' | 'bank' | 'note';

export interface Credential {
  id: string;
  type: ItemType;
  
  // Common
  name: string; // Service Name, Bank Name, or Card Issuer
  category: CredentialCategory;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;

  // Login Specific
  username?: string;
  password?: string;
  url?: string;

  // Card Specific
  cardholder?: string;
  number?: string;
  expiry?: string;
  cvv?: string;
  pin?: string;
  cardType?: string; // Visa, Mastercard, etc.

  // Bank Specific
  accountNumber?: string;
  routingNumber?: string;
  swift?: string;
  iban?: string;
}

export enum CredentialCategory {
  PERSONAL = 'Personal',
  WORK = 'Work',
  FINANCE = 'Finance',
  SHOPPING = 'Shopping',
  SOCIAL = 'Social',
  OTHER = 'Other',
}

export interface EncryptedVault {
  iv: string;
  salt: string;
  data: string;
}

export interface VaultStats {
  totalItems: number;
  totalLogins: number;
  weakPasswords: number;
  reusedPasswords: number;
}