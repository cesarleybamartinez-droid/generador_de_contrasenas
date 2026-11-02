import { test, expect } from '@playwright/test';

test.describe('Suite E2E: KEYVAULT Generador de Contraseñas', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. debe iniciar en estado de espera con el botón rotar deshabilitado hasta pulsar ejecutar', async ({ page }) => {
    const output = page.locator('#password-output');
    const strengthLabel = page.locator('#strength-label');
    const entropyValue = page.locator('#entropy-value');
    const btnGenerate = page.locator('#btn-generate');
    const btnRegenerate = page.locator('#btn-regenerate');

    // Al abrir la web, el campo debe estar vacío y el botón Rotar bloqueado
    await expect(output).toHaveValue('');
    await expect(strengthLabel).toHaveText('EN ESPERA');
    await expect(entropyValue).toHaveText('0.00 bits');
    await expect(btnRegenerate).toBeDisabled();

    // Al pulsar Ejecutar, se crea la contraseña y se habilita el botón Rotar
    await btnGenerate.click();
    const generatedPassword = await output.inputValue();
    expect(generatedPassword).toHaveLength(16);
    await expect(btnRegenerate).toBeEnabled();
    await expect(entropyValue).not.toHaveText('0.00 bits');
  });

  test('2. debe configurar la longitud con el slider y generar con el nuevo tamaño al pulsar ejecutar', async ({ page }) => {
    const slider = page.locator('#length-slider');
    const lengthDisplay = page.locator('#length-display');
    const output = page.locator('#password-output');
    const btnGenerate = page.locator('#btn-generate');

    // Mover el slider a 28 solo configura el número, aún no genera contraseña
    await slider.fill('28');
    await slider.dispatchEvent('input');
    await expect(lengthDisplay).toHaveText('28');
    await expect(output).toHaveValue('');

    // Pulsar el botón genera la contraseña de 28 caracteres
    await btnGenerate.click();
    const newPassword = await output.inputValue();
    expect(newPassword).toHaveLength(28);
  });

  test('3. debe generar contraseñas distintas cada vez que se pulsa Ejecutar o Rotar', async ({ page }) => {
    const output = page.locator('#password-output');
    const btnGenerate = page.locator('#btn-generate');
    const btnRegenerate = page.locator('#btn-regenerate');

    await btnGenerate.click();
    const firstPassword = await output.inputValue();

    await btnRegenerate.click();
    const secondPassword = await output.inputValue();
    expect(secondPassword).not.toBe(firstPassword);
  });

  test('4. debe impedir que el usuario desmarque todas las casillas de caracteres', async ({ page }) => {
    const labelUpper = page.locator('label[for="opt-uppercase"]');
    const labelLower = page.locator('label[for="opt-lowercase"]');
    const labelNumbers = page.locator('label[for="opt-numbers"]');
    const labelSymbols = page.locator('label[for="opt-symbols"]');
    const chkSymbols = page.locator('#opt-symbols');

    await labelUpper.click();
    await labelLower.click();
    await labelNumbers.click();
    await labelSymbols.click();

    await expect(chkSymbols).toBeChecked();
  });

  test('5. debe mostrar el tooltip de confirmación al copiar una contraseña generada', async ({ page }) => {
    const btnGenerate = page.locator('#btn-generate');
    const btnCopy = page.locator('#btn-copy');
    const tooltip = page.locator('#copy-tooltip');

    // Primero generamos una contraseña y luego la copiamos
    await btnGenerate.click();
    await expect(tooltip).not.toHaveClass(/show/);
    await btnCopy.click();
    await expect(tooltip).toHaveClass(/show/);
  });

  test('6. debe alternar correctamente entre Modo Oscuro y Modo Claro', async ({ page }) => {
    const themeToggle = page.locator('#theme-toggle');
    const html = page.locator('html');

    const isInitiallyDark = (await html.getAttribute('data-theme')) === 'dark';

    await themeToggle.click();
    if (isInitiallyDark) {
      await expect(html).not.toHaveAttribute('data-theme', 'dark');
    } else {
      await expect(html).toHaveAttribute('data-theme', 'dark');
    }
  });

});