/**
 * ==============================================================================
 * PROYECTO 03: GENERADOR DE CONTRASEÑAS SEGURAS (LÓGICA PURA / DOMAIN)
 * Criptografía: Web Crypto API (crypto.getRandomValues)
 * Algoritmo: Cálculo matemático de Entropía de Shannon (bits)
 * ==============================================================================
 */

export const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  ambiguous: 'il1Lo0O'
};

export function getSecureRandomInt(max) {
  if (max <= 0) return 0;
  
  const randomBuffer = new Uint32Array(1);
  const maxUint32 = 0xFFFFFFFF;
  const limit = maxUint32 - (maxUint32 % max);

  let randomVal;
  do {
    crypto.getRandomValues(randomBuffer);
    randomVal = randomBuffer[0];
  } while (randomVal >= limit);

  return randomVal % max;
}

export function generatePassword(options = {}) {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
    excludeAmbiguous = false
  } = options;

  const validLength = Math.max(6, Math.min(64, Number.isInteger(length) ? length : 16));

  const filterCharset = (set) => {
    if (!excludeAmbiguous) return set;
    return set.split('').filter(char => !CHARSETS.ambiguous.includes(char)).join('');
  };

  const activePools = [];
  if (uppercase) activePools.push(filterCharset(CHARSETS.uppercase));
  if (lowercase) activePools.push(filterCharset(CHARSETS.lowercase));
  if (numbers) activePools.push(filterCharset(CHARSETS.numbers));
  if (symbols) activePools.push(filterCharset(CHARSETS.symbols));

  if (activePools.length === 0) {
    activePools.push(filterCharset(CHARSETS.lowercase));
  }

  const completeCharset = activePools.join('');
  if (completeCharset.length === 0) {
    return '';
  }

  const passwordChars = [];

  for (const pool of activePools) {
    if (pool.length > 0 && passwordChars.length < validLength) {
      const idx = getSecureRandomInt(pool.length);
      passwordChars.push(pool[idx]);
    }
  }

  while (passwordChars.length < validLength) {
    const idx = getSecureRandomInt(completeCharset.length);
    passwordChars.push(completeCharset[idx]);
  }

  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
  }

  return passwordChars.join('');
}

export function calculatePoolSize(password) {
  if (!password || typeof password !== 'string') return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += CHARSETS.lowercase.length;
  if (/[A-Z]/.test(password)) poolSize += CHARSETS.uppercase.length;
  if (/[0-9]/.test(password)) poolSize += CHARSETS.numbers.length;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += CHARSETS.symbols.length;

  return poolSize;
}

export function calculateEntropy(password) {
  if (!password || typeof password !== 'string') return 0;
  
  const poolSize = calculatePoolSize(password);
  if (poolSize === 0) return 0;

  const length = password.length;
  const entropy = length * Math.log2(poolSize);
  return Math.round(entropy * 100) / 100;
}

export function evaluateStrength(entropy) {
  if (entropy <= 0) {
    return { level: 0, label: 'Sin contraseña', color: '#94a3b8', percent: 0 };
  }
  if (entropy < 36) {
    return { level: 1, label: 'Muy Débil', color: '#ef4444', percent: 20 };
  }
  if (entropy < 60) {
    return { level: 2, label: 'Débil', color: '#f97316', percent: 40 };
  }
  if (entropy < 80) {
    return { level: 3, label: 'Media', color: '#eab308', percent: 65 };
  }
  if (entropy < 120) {
    return { level: 4, label: 'Fuerte', color: '#10b981', percent: 85 };
  }
  return { level: 5, label: 'Impenetrable', color: '#06b6d4', percent: 100 };
}