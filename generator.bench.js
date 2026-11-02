/**
 * ==============================================================================
 * PROYECTO 03: BENCHMARK DE RENDIMIENTO CRIPTOGRÁFICO
 * Medición de throughput para generación de contraseñas y cálculo de entropía
 * ==============================================================================
 */

import { generatePassword, calculateEntropy, evaluateStrength } from './generator.js';

console.log('⚡ Iniciando Benchmark de Rendimiento Criptográfico...');

const ITERACIONES = 50000;
const LONGITUD_PRUEBA = 16;

// 1. Calentamiento de la CPU (Warmup del motor V8 de Node.js)
for (let i = 0; i < 1000; i++) {
  generatePassword({ length: LONGITUD_PRUEBA });
}

// 2. Medición de Generación Criptográfica Completa
const inicioGen = performance.now();
for (let i = 0; i < ITERACIONES; i++) {
  generatePassword({ length: LONGITUD_PRUEBA });
}
const duracionGen = performance.now() - inicioGen;
const opsPorSegundoGen = Math.round((ITERACIONES / (duracionGen / 1000)));

// 3. Medición de Cálculo de Entropía + Evaluación de Fuerza
const muestraContrasena = generatePassword({ length: 24 });
const inicioEntropia = performance.now();
for (let i = 0; i < ITERACIONES; i++) {
  const e = calculateEntropy(muestraContrasena);
  evaluateStrength(e);
}
const duracionEntropia = performance.now() - inicioEntropia;
const opsPorSegundoEntropia = Math.round((ITERACIONES / (duracionEntropia / 1000)));

// 4. Reporte de Resultados
console.log('\n======================================================');
console.log('📊 RESULTADOS DEL BENCHMARK');
console.log('======================================================');
console.log(`🔹 Total de iteraciones: ${ITERACIONES.toLocaleString()} operaciones`);
console.log(`\n🔑 1. Generación Segura (Web Crypto + Fisher-Yates):`);
console.log(`   - Tiempo total: ${duracionGen.toFixed(2)} ms`);
console.log(`   - Velocidad promedio: ${opsPorSegundoGen.toLocaleString()} contraseñas/segundo`);
console.log(`\n🧮 2. Análisis de Entropía Matemática y Fuerza:`);
console.log(`   - Tiempo total: ${duracionEntropia.toFixed(2)} ms`);
console.log(`   - Velocidad promedio: ${opsPorSegundoEntropia.toLocaleString()} evaluaciones/segundo`);
console.log('======================================================\n');