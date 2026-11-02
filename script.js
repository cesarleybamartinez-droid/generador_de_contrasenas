/**
 * ==============================================================================
 * PROYECTO 03: CONTROLADOR DE INTERFAZ Y EVENTOS DEL DOM (script.js)
 * Flujo bajo demanda: Configura parámetros primero -> Ejecuta al pulsar el botón
 * ==============================================================================
 */

import {
  generatePassword,
  calculateEntropy,
  evaluateStrength
} from './generator.js';

// 1. ESTADO CENTRALIZADO: Guarda los parámetros elegidos antes de generar
const state = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
  currentPassword: '' // Inicia vacío hasta que el usuario pulse el botón
};

// 2. REFERENCIAS A ELEMENTOS DEL DOM
const passwordOutput = document.getElementById('password-output');
const btnRegenerate = document.getElementById('btn-regenerate');
const btnCopy = document.getElementById('btn-copy');
const copyTooltip = document.getElementById('copy-tooltip');

const strengthLabel = document.getElementById('strength-label');
const entropyValue = document.getElementById('entropy-value');
const strengthBarFill = document.getElementById('strength-bar-fill');

const lengthSlider = document.getElementById('length-slider');
const lengthDisplay = document.getElementById('length-display');
const optUppercase = document.getElementById('opt-uppercase');
const optLowercase = document.getElementById('opt-lowercase');
const optNumbers = document.getElementById('opt-numbers');
const optSymbols = document.getElementById('opt-symbols');
const optAmbiguous = document.getElementById('opt-ambiguous');
const btnGenerate = document.getElementById('btn-generate');

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

let copyTimeoutId = null;

// 3. ESTADO VISUAL INICIAL (Sin contraseña generada)
function renderIdleState() {
  passwordOutput.value = '';
  passwordOutput.placeholder = 'EN ESPERA...';
  entropyValue.textContent = '0.00 bits';
  strengthLabel.textContent = 'EN ESPERA';
  strengthLabel.style.color = '#94a3b8';
  strengthBarFill.style.width = '0%';

  // Bloqueamos los botones de Rotar y Copiar hasta que exista una contraseña
  btnRegenerate.disabled = true;
  btnCopy.disabled = true;
}

// 4. ACCIÓN DE GENERACIÓN CRIPTOGRÁFICA (Solo se ejecuta al pulsar el botón)
function generateAndRender() {
  state.currentPassword = generatePassword({
    length: state.length,
    uppercase: state.uppercase,
    lowercase: state.lowercase,
    numbers: state.numbers,
    symbols: state.symbols,
    excludeAmbiguous: state.excludeAmbiguous
  });

  passwordOutput.value = state.currentPassword;

  // Habilitamos los botones de Rotar y Copiar ahora que ya hay contraseña
  btnRegenerate.disabled = false;
  btnCopy.disabled = false;

  const entropy = calculateEntropy(state.currentPassword);
  const strength = evaluateStrength(entropy);

  entropyValue.textContent = `${entropy.toFixed(2)} bits`;
  strengthLabel.textContent = strength.label;
  strengthLabel.style.color = strength.color;
  strengthBarFill.style.width = `${strength.percent}%`;
  strengthBarFill.style.backgroundColor = strength.color;
}

// 5. VALIDACIÓN DE CASILLAS (Garantiza mínimo 1 opción seleccionada)
function enforceAtLeastOneCharset(changedCheckbox) {
  const anyChecked =
    optUppercase.checked ||
    optLowercase.checked ||
    optNumbers.checked ||
    optSymbols.checked;

  if (!anyChecked) {
    changedCheckbox.checked = true;
  }

  state.uppercase = optUppercase.checked;
  state.lowercase = optLowercase.checked;
  state.numbers = optNumbers.checked;
  state.symbols = optSymbols.checked;
}

// 6. COPIADO AL PORTAPAPELES (Solo copia si ya se generó una contraseña)
async function copyToClipboard() {
  if (!state.currentPassword) return;

  try {
    await navigator.clipboard.writeText(state.currentPassword);
    showCopyFeedback();
  } catch {
    passwordOutput.select();
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    showCopyFeedback();
  }
}

function showCopyFeedback() {
  copyTooltip.classList.add('show');
  if (copyTimeoutId) {
    clearTimeout(copyTimeoutId);
  }
  copyTimeoutId = setTimeout(() => {
    copyTooltip.classList.remove('show');
  }, 2000);
}

// 7. EVENTOS DE CONFIGURACIÓN (Actualizan parámetros sin generar todavía)
lengthSlider.addEventListener('input', (event) => {
  const newLength = parseInt(event.target.value, 10);
  state.length = newLength;
  lengthDisplay.textContent = String(newLength);
});

// Permitir hacer clic en las marcas de la escala (06, 16, 32, 48, 64)
document.querySelectorAll('.scale-mark').forEach((mark) => {
  mark.addEventListener('click', () => {
    const selectedLength = parseInt(mark.dataset.length, 10);
    state.length = selectedLength;
    lengthSlider.value = String(selectedLength);
    lengthDisplay.textContent = String(selectedLength);
  });
});

[optUppercase, optLowercase, optNumbers, optSymbols].forEach((checkbox) => {
  checkbox.addEventListener('change', (event) => {
    enforceAtLeastOneCharset(event.target);
  });
});

optAmbiguous.addEventListener('change', (event) => {
  state.excludeAmbiguous = event.target.checked;
});

// 8. EVENTOS DE DISPARO (Aquí sí se crea la contraseña)
btnGenerate.addEventListener('click', generateAndRender);
btnRegenerate.addEventListener('click', generateAndRender);
btnCopy.addEventListener('click', copyToClipboard);

// 9. TEMA CLARO / OSCURO
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀️';
    themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo claro');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '🌙';
    themeToggleBtn.setAttribute('aria-label', 'Cambiar a modo oscuro');
  }
  localStorage.setItem('theme-preference', theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(isDark ? 'light' : 'dark');
});

// 10. INICIO DE LA APLICACIÓN EN MODO DE ESPERA
initTheme();
renderIdleState();
