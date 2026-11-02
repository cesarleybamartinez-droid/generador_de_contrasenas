import { describe, it, expect } from 'vitest';
import {
  CHARSETS,
  getSecureRandomInt,
  generatePassword,
  calculatePoolSize,
  calculateEntropy,
  evaluateStrength
} from './generator.js';

describe('Suite de Pruebas Unitarias: Generador de Contraseñas Seguras', () => {

  describe('1. getSecureRandomInt (Aleatoriedad Criptográfica Uniforme)', () => {
    it('debe devolver números dentro del rango [0, max - 1]', () => {
      const max = 10;
      for (let i = 0; i < 100; i++) {
        const val = getSecureRandomInt(max);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(max);
      }
    });

    it('debe devolver 0 si max es menor o igual a 0', () => {
      expect(getSecureRandomInt(0)).toBe(0);
      expect(getSecureRandomInt(-5)).toBe(0);
    });
  });

  describe('2. generatePassword (Generación de Contraseñas)', () => {
    it('debe generar una contraseña con la longitud predeterminada de 16 caracteres', () => {
      const pwd = generatePassword();
      expect(pwd).toHaveLength(16);
    });

    it('debe respetar longitudes personalizadas dentro del rango permitido (6 a 64)', () => {
      expect(generatePassword({ length: 8 })).toHaveLength(8);
      expect(generatePassword({ length: 32 })).toHaveLength(32);
      expect(generatePassword({ length: 64 })).toHaveLength(64);
    });

    it('debe acotar longitudes fuera de rango (mínimo 6, máximo 64)', () => {
      expect(generatePassword({ length: 2 })).toHaveLength(6);
      expect(generatePassword({ length: 120 })).toHaveLength(64);
      expect(generatePassword({ length: 'invalido' })).toHaveLength(16);
    });

    it('debe garantizar al menos un carácter de cada conjunto activo', () => {
      const pwd = generatePassword({
        length: 12,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
      });

      expect(/[A-Z]/.test(pwd)).toBe(true);
      expect(/[a-z]/.test(pwd)).toBe(true);
      expect(/[0-9]/.test(pwd)).toBe(true);
      expect(/[^a-zA-Z0-9]/.test(pwd)).toBe(true);
    });

    it('debe excluir caracteres ambiguos (il1Lo0O) cuando excludeAmbiguous es true', () => {
      for (let i = 0; i < 20; i++) {
        const pwd = generatePassword({
          length: 30,
          excludeAmbiguous: true
        });
        
        for (const amb of CHARSETS.ambiguous) {
          expect(pwd).not.toContain(amb);
        }
      }
    });

    it('debe recurrir a minúsculas si el usuario desmarca todas las casillas (fallback seguro)', () => {
      const pwd = generatePassword({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: false
      });

      expect(pwd.length).toBe(16);
      expect(/^[a-z]+$/.test(pwd)).toBe(true);
    });

    it('debe generar contraseñas únicas en ejecuciones consecutivas (no repetitivas)', () => {
      const pwd1 = generatePassword({ length: 20 });
      const pwd2 = generatePassword({ length: 20 });
      expect(pwd1).not.toBe(pwd2);
    });
  });

  describe('3. calculatePoolSize (Tamaño del Espacio de Búsqueda R)', () => {
    it('debe devolver 0 para cadenas vacías o no válidas', () => {
      expect(calculatePoolSize('')).toBe(0);
      expect(calculatePoolSize(null)).toBe(0);
      expect(calculatePoolSize(123)).toBe(0);
    });

    it('debe identificar correctamente los pools de caracteres presentes', () => {
      expect(calculatePoolSize('abcdef')).toBe(26);                     // Solo minúsculas
      expect(calculatePoolSize('abcABC')).toBe(52);                     // Minúsculas + Mayúsculas
      expect(calculatePoolSize('abcABC123')).toBe(62);                  // Minúsculas + Mayúsculas + Números
      expect(calculatePoolSize('abcABC123!@#')).toBe(62 + CHARSETS.symbols.length); // Todos los pools
    });
  });

  describe('4. calculateEntropy (Entropía Matemática de Shannon)', () => {
    it('debe calcular la entropía exacta con la fórmula E = L * log2(R)', () => {
      // 10 caracteres numéricos (R = 10, log2(10) ≈ 3.3219) => 10 * 3.3219 = 33.22 bits
      const entropy = calculateEntropy('1234567890');
      expect(entropy).toBe(33.22);
    });

    it('debe devolver 0 bits para entradas vacías', () => {
      expect(calculateEntropy('')).toBe(0);
      expect(calculateEntropy(null)).toBe(0);
    });

    it('debe otorgar más de 80 bits a una contraseña robusta de 16 caracteres', () => {
      const pwd = generatePassword({ length: 16 });
      const entropy = calculateEntropy(pwd);
      expect(entropy).toBeGreaterThan(80);
    });
  });

  describe('5. evaluateStrength (Clasificación de Seguridad NIST SP 800-63B)', () => {
    it('debe clasificar correctamente cada nivel de seguridad', () => {
      expect(evaluateStrength(0).label).toBe('Sin contraseña');
      expect(evaluateStrength(25).label).toBe('Muy Débil');
      expect(evaluateStrength(45).label).toBe('Débil');
      expect(evaluateStrength(65).label).toBe('Media');
      expect(evaluateStrength(95).label).toBe('Fuerte');
      expect(evaluateStrength(130).label).toBe('Impenetrable');
    });

    it('debe proveer un porcentaje visual de 0 a 100 para la barra de progreso', () => {
      expect(evaluateStrength(0).percent).toBe(0);
      expect(evaluateStrength(20).percent).toBe(20);
      expect(evaluateStrength(50).percent).toBe(40);
      expect(evaluateStrength(70).percent).toBe(65);
      expect(evaluateStrength(90).percent).toBe(85);
      expect(evaluateStrength(140).percent).toBe(100);
    });
  });

});