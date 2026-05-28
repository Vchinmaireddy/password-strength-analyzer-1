import { PasswordMetrics, PasswordHistoryItem, GeneratorSettings } from '../types';

// Let's declare our list of common weak passwords (normalized to lowercase)
const COMMON_WEAK_PASSWORDS = new Set([
  '123456', 'password', '123456789', '12345678', '12345', '1234567', 'qwerty', '1234567890', 
  'password123', 'admin', '123123', 'letmein', 'welcome', 'microsoft', 'google', 'apple',
  'sunshine', 'iloveyou', 'football', 'monkey', 'charlie', 'cisco', 'superman', 'starwars',
  'qwertyuiop', '111111', '123321', 'asdfghjk', 'login', 'security', 'dragon', 'football',
  'shadow', 'mustang', 'trustno1', 'secret', 'admin123', '1234', 'solitude', 'princess',
  'hunter2', 'baseball', 'butterflies', 'cookie', 'creative', 'killer', 'nature', 'freedom'
]);

/**
 * Calculates SHA-256 hash of a string using browser's native subtle crypto.
 * Useful for building the simulated local password history vault (Reuse checking).
 */
export async function hashPasswordSHA256(password: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback if environment lacks web crypto (e.g. some sandboxes before load)
    return simpleHash(password);
  }
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.error('Hash failed, using fallback:', err);
    return simpleHash(password);
  }
}

// Minimal non-crypto fallback hash in case sub-environment is restrictive
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `fallback-${hash.toString(16)}`;
}

/**
 * Analyzes password complexity, patterns, and calculates an accurate strength metrics package.
 */
export function analyzePassword(password: string): PasswordMetrics {
  const len = password.length;
  
  if (len === 0) {
    return {
      length: 0,
      hasUppercase: false,
      hasLowercase: false,
      hasDigits: false,
      hasSpecial: false,
      entropy: 0,
      entropyLabel: 'Critical',
      score: 0,
      strength: 'Weak',
      suggestions: ['Please type a password to begin testing strength.'],
      warnings: [],
      poolSize: 0
    };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  // Special characters: standard ASCII symbols
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Pool size calculations
  let poolSize = 0;
  if (hasLowercase) poolSize += 26;
  if (hasUppercase) poolSize += 26;
  if (hasDigits) poolSize += 10;
  if (hasSpecial) poolSize += 32;

  // Protect log2 calculation if poolSize is 0
  const effectivePool = poolSize || 1;
  const entropy = len * Math.log2(effectivePool);

  // Calculate entropy category
  let entropyLabel: 'Critical' | 'Low' | 'Moderate' | 'High' | 'Very High' = 'Critical';
  if (entropy >= 80) {
    entropyLabel = 'Very High';
  } else if (entropy >= 60) {
    entropyLabel = 'High';
  } else if (entropy >= 35) {
    entropyLabel = 'Moderate';
  } else if (entropy >= 20) {
    entropyLabel = 'Low';
  }

  // Warning Checks
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const lowerPassword = password.toLowerCase();

  // Check common weak list
  const isCommon = COMMON_WEAK_PASSWORDS.has(lowerPassword);
  if (isCommon) {
    warnings.push('This password is on the list of most commonly breached passwords and is extremely unsafe.');
  }

  // Check repeating characters (e.g. aaa, 111)
  const repeatRegex = /(.)\1\1/;
  if (repeatRegex.test(password)) {
    warnings.push('Contains repetitive sequential characters (e.g. "aaa" or "111").');
    suggestions.push('Avoid repeating the same character consecutively to resist dictionary variations.');
  }

  // Check keyboard sequence or runs (e.g. 12345, abcde)
  let runsCount = 0;
  for (let i = 0; i < password.length - 2; i++) {
    const c1 = password.charCodeAt(i);
    const c2 = password.charCodeAt(i + 1);
    const c3 = password.charCodeAt(i + 2);
    if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
      runsCount++;
    }
  }
  if (runsCount > 0) {
    warnings.push('Contains sequential letters or numbers (e.g., "abc", "789").');
    suggestions.push('Avoid using standard alphabet runs or digit sequences.');
  }

  // Calculate base score out of 10 points
  let score = 0;

  // Length points (up to 5 points)
  if (len >= 16) {
    score += 5;
  } else if (len >= 12) {
    score += 4;
  } else if (len >= 8) {
    score += 3;
  } else if (len >= 6) {
    score += 1;
  }

  // Character mix points (up to 4 points)
  if (hasLowercase) score += 1;
  if (hasUppercase) score += 1;
  if (hasDigits) score += 1;
  if (hasSpecial) score += 1;

  // Extra variety bonus (if excellent length >= 12 and 3+ character categories, plus high entropy)
  const isDiverse = [hasLowercase, hasUppercase, hasDigits, hasSpecial].filter(Boolean).length >= 3;
  if (len >= 12 && isDiverse && entropy >= 60) {
    score += 1;
  }

  // Severe Deductions & Corrections
  if (len < 6) {
    score = 0; // Absolute weak
  } else if (isCommon) {
    score = Math.min(score, 1); // Clamp common to weak
  }

  // Ensure score stays inside 0 - 10
  score = Math.max(0, Math.min(10, score));

  // Categorize strength
  let strength: 'Weak' | 'Medium' | 'Strong' = 'Weak';
  if (score >= 7) {
    strength = 'Strong';
  } else if (score >= 4) {
    strength = 'Medium';
  }

  // Suggestions build
  if (len < 12) {
    suggestions.push(`Increase length: Your password is ${len} characters. Aiming for 12 to 16+ boosts guessing difficulty exponentially.`);
  }
  if (!hasUppercase) {
    suggestions.push('Add uppercase characters: Include capital letters (A-Z) to widen the potential brute force character pool.');
  }
  if (!hasLowercase) {
    suggestions.push('Add lowercase characters: Include small letters (a-z) for better entropy.');
  }
  if (!hasDigits) {
    suggestions.push('Add numbers: Mix in numbers (0-9) so the password is not entirely text-based.');
  }
  if (!hasSpecial) {
    suggestions.push('Add special symbols: Incorporate symbols (e.g., @, $, %, !, *) to create unpredictable complexity.');
  }

  if (score >= 7 && warnings.length === 0) {
    suggestions.length = 0; // Clear suggestions for strong secure passwords
    suggestions.push('Great job! This password fulfills all standard cryptographic uniqueness parameters.');
  }

  return {
    length: len,
    hasUppercase,
    hasLowercase,
    hasDigits,
    hasSpecial,
    entropy,
    entropyLabel,
    score,
    strength,
    suggestions,
    warnings,
    poolSize
  };
}

/**
 * Generates a standard secure randomized password based on customized attributes.
 */
export function generatePassword(settings: GeneratorSettings): string {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:\',./<>?~`';

  // Exclude easy to confuse homoglyph lookalikes option (e.g. l, I, 1, o, 0, O, |, etc)
  const removeLookalikes = (str: string) => {
    return str.split('').filter(c => !'lI1o0O|`\'",.'.includes(c)).join('');
  };

  let pool = '';
  const forcedCharacters: string[] = [];

  if (settings.includeLowercase) {
    const chars = settings.excludeSimilar ? removeLookalikes(lowercaseChars) : lowercaseChars;
    pool += chars;
    if (chars.length > 0) {
      forcedCharacters.push(chars[Math.floor(Math.random() * chars.length)]);
    }
  }
  if (settings.includeUppercase) {
    const chars = settings.excludeSimilar ? removeLookalikes(uppercaseChars) : uppercaseChars;
    pool += chars;
    if (chars.length > 0) {
      forcedCharacters.push(chars[Math.floor(Math.random() * chars.length)]);
    }
  }
  if (settings.includeNumbers) {
    const chars = settings.excludeSimilar ? removeLookalikes(numberChars) : numberChars;
    pool += chars;
    if (chars.length > 0) {
      forcedCharacters.push(chars[Math.floor(Math.random() * chars.length)]);
    }
  }
  if (settings.includeSymbols) {
    const chars = settings.excludeSimilar ? removeLookalikes(symbolChars) : symbolChars;
    pool += chars;
    if (chars.length > 0) {
      forcedCharacters.push(chars[Math.floor(Math.random() * chars.length)]);
    }
  }

  // Default to letters if nothing is selected
  if (pool.length === 0) {
    pool = lowercaseChars + uppercaseChars;
  }

  let generated = '';
  // Fill the prefix with guaranteed character variations first to meet selected toggles
  for (let i = 0; i < forcedCharacters.length && i < settings.length; i++) {
    generated += forcedCharacters[i];
  }

  // Fill the remainder of the requested password length
  const remainingLength = settings.length - generated.length;
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    generated += pool[randomIndex];
  }

  // Shuffle the final string to avoid predictable positions for forced types
  const shuffled = generated.split('').sort(() => Math.random() - 0.5).join('');
  return shuffled;
}
