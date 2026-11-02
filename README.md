# 🛡️ KEYVAULT // Generador de Contraseñas Criptográficas y Analizador de Entropía

![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-100%2F100%2F100%2F100-brightgreen)
![Vitest](https://img.shields.io/badge/Vitest-16%2F16%20passed-success)
![Playwright E2E](https://img.shields.io/badge/Playwright_E2E-6%2F6%20passed-blue)
![Web Crypto API](https://img.shields.io/badge/CSPRNG-Web_Crypto_API-amber)

Aplicación web de grado de ingeniería para la generación de contraseñas criptográficamente seguras y evaluación matemática de entropía en tiempo real bajo los lineamientos de seguridad **NIST SP 800-63B**. Diseñada con una estética única de **Centro de Operaciones de Ciberseguridad (KEYVAULT Design System)** en HTML5, CSS3 y Vanilla JavaScript modular sin dependencias de terceros.

---

## Adquisición de Requerimientos e Ingeniería del Sistema

### 1. Declaración del Problema

Los generadores de contraseñas convencionales basados en `Math.random()` utilizan generadores pseudoaleatorios deterministas (_PRNG_) cuyo estado interno puede ser predecible. Además, el usuario promedio carece de métricas cuantitativas reales (bits de entropía) para evaluar la resistencia de una clave frente a ataques de fuerza bruta modernos.

### 2. Requerimientos Funcionales (RF)

- **RF-01 (Generación Bajo Demanda):** El sistema inicia en estado de espera seguro (`EN ESPERA`) con los controles de rotación y copiado bloqueados hasta que el usuario ordene explícitamente la primera ejecución criptográfica.
- **RF-02 (Longitud Configurable con Escala Lineal Exacta):** Selector deslizante de `6` a `64` caracteres acompañado de una escala posicionada por interpolación lineal matemática con atajos interactivos (`06`, `16`, `32`, `48`, `64`).
- **RF-03 (Matriz de Alfabetos):** Selección independiente de Mayúsculas (`A-Z`), Minúsculas (`a-z`), Dígitos (`0-9`), Símbolos (`!@#$...`) y filtro de exclusión de caracteres visualmente ambiguos (`il1Lo0O`).
- **RF-04 (Garantía de Inclusión y Defensa contra Cero Opciones):** Toda contraseña generada garantiza al menos un carácter de cada conjunto activo e impide que el usuario desactive los 4 alfabetos simultáneamente.
- **RF-05 (Telemetría de Entropía de Shannon):** Cálculo en vivo de los bits de entropía y clasificación visual de blindaje (_Muy Débil_, _Débil_, _Media_, _Fuerte_, _Impenetrable_).
- **RF-06 (Portapapeles Seguro):** Integración con la `Clipboard API` nativa y retroalimentación visual accesible.

### 3. Requerimientos No Funcionales (RNF)

- **RNF-01 (Seguridad Criptográfica CSPRNG):** Uso exclusivo de `window.crypto.getRandomValues()` con arreglo tipado `Uint32Array`.
- **RNF-02 (Eliminación de Sesgo de Módulo):** Implementación de muestreo por rechazo (_Rejection Sampling_) para garantizar distribución de probabilidad uniforme.
- **RNF-03 (Accesibilidad y Rendimiento):** Puntuación perfecta **100/100/100/100 en Google Lighthouse** (Performance, Accessibility, Best Practices, SEO) y contrastes conformes a WCAG AAA.

---

## Modelo Matemático y Criptográfico

### 1. Eliminación del Sesgo de Módulo (_Modulo Bias Rejection_)

Para elegir un índice aleatorio en un alfabeto de tamaño $M$ usando enteros de 32 bits ($2^{32} - 1$), se descartan los valores superiores al múltiplo exacto más alto:

$$\text{Límite} = (2^{32} - 1) - \left((2^{32} - 1) \bmod M\right)$$

Todo valor aleatorio $X \ge \text{Límite}$ se vuelve a muestrear, garantizando equiprobabilidad estricta.

### 2. Mezcla de Fisher-Yates (_Knuth Shuffle_)

Para evitar patrones predecibles tras garantizar un carácter de cada categoría seleccionada, el arreglo resultante se permuta en tiempo lineal $O(N)$ con índices criptográficos.

### 3. Ecuación de Entropía de Shannon

La fuerza real de la contraseña se mide en **bits de entropía ($E$)**:

$$E = L \times \log_2(R)$$

Donde:

- $L$: Longitud de la contraseña.
- $R$: Tamaño del universo de caracteres (_Pool Size_: $26$ minúsculas + $26$ mayúsculas + $10$ dígitos + $26$ símbolos = hasta $88$ caracteres).

---

## Certificación de Calidad (Suite de Pruebas de 5 Niveles)

### 1. Pruebas Unitarias de Dominio (Vitest)

- **16 de 16 pruebas aprobadas** (`100% pass rate`) en **755 ms**.
- Cobertura de distribución uniforme, límites de longitud (`6` a `64`), inclusión obligatoria de alfabetos, filtro de ambigüedad (`il1Lo0O`), cálculo de _Pool Size_, entropía en bits y umbrales NIST.

### 2. Benchmark de Rendimiento Criptográfico

- **50,000 iteraciones** ejecutadas en Node.js V8:
  - **Generación Segura (Web Crypto + Fisher-Yates):** `8,899 contraseñas/segundo`.
  - **Análisis de Entropía Matemática y Fuerza:** `1,240,522 evaluaciones/segundo` (40.31 ms).

### 3. Pruebas End-to-End en Navegador Real (Playwright E2E)

- **6 de 6 flujos de usuario aprobados** en Chromium (**11.7 s**):
  1. Verificación de estado inicial en espera y bloqueo del botón _Rotar_ antes de la primera generación.
  2. Sincronización del slider de longitud y generación bajo demanda.
  3. Unicidad criptográfica al pulsar _Ejecutar_ y _Rotar_.
  4. Protección de interfaz contra desmarcado total de casillas.
  5. Copiado al portapapeles y activación del tooltip de estado.
  6. Alternancia y persistencia entre Modo Oscuro y Modo Claro.

### 4. Pruebas de Carga y Concurrencia (Autocannon)

- **100 conexiones concurrentes** sostenidas durante 10 segundos:
  - **Volumen:** `17,000 peticiones completadas` (`148 MB` transferidos) con **0 errores**.
  - **Caudal (Throughput):** Promedio de **1,703.7 Req/s** (picos de **1,875 Req/s**).
  - **Latencia:** Promedio de **58.25 ms** (mediana `p50` de **54 ms**).

### 5. Auditoría Google Lighthouse

- **Performance:** `100 / 100`
- **Accessibility:** `100 / 100`
- **Best Practices:** `100 / 100`
- **SEO:** `100 / 100`

---

## Comandos de Ejecución

```bash
# Levantar servidor local de desarrollo
npx http-server -p 8080 -c-1 .

# Ejecutar suite de pruebas unitarias (Vitest)
npm test

# Ejecutar benchmark criptográfico de estrés
npm run bench

# Ejecutar pruebas End-to-End con navegador Chromium (Playwright)
npm run test:e2e

# Ejecutar prueba de carga y concurrencia (Autocannon)
npm run test:load
```

---

## 👤 Autor

Desarrollado con rigor de ingeniería por **Cesar Leyba Martinez**
