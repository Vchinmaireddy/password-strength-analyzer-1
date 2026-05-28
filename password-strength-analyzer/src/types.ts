export interface PasswordMetrics {
  length: number;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigits: boolean;
  hasSpecial: boolean;
  entropy: number;
  entropyLabel: 'Critical' | 'Low' | 'Moderate' | 'High' | 'Very High';
  score: number; // 0 to 10 scale
  strength: 'Weak' | 'Medium' | 'Strong';
  suggestions: string[];
  warnings: string[];
  poolSize: number;
}

export interface PasswordHistoryItem {
  id: string;
  hashedValue: string; // SHA-256 base64 or hex hash for privacy-safe storage
  timestamp: string;
  label?: string; // e.g., "Google", "Personal", etc.
}

export interface GeneratorSettings {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean; // exclude i, l, 1, o, 0, O etc.
}
