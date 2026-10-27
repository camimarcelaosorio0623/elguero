/**
 * Validación de interfaz. Es solo ayuda para el usuario:
 * el backend de Agent.IA debe validar todo de nuevo.
 */
export const rules = {
  required: (v) => (String(v ?? '').trim() ? null : 'Este dato es obligatorio, compa.'),
  name: (v) => {
    const s = String(v ?? '').trim();
    if (!s) return 'Dinos a nombre de quién, güero.';
    if (s.length < 2) return 'El nombre es muy corto.';
    if (s.length > 80) return 'El nombre es muy largo.';
    return null;
  },
  phone: (v) => {
    const digits = String(v ?? '').replace(/[^\d]/g, '');
    if (!digits) return 'Necesitamos un teléfono para contactarte.';
    if (digits.length < 10 || digits.length > 13) return 'Revisa el teléfono (10 dígitos, o con indicativo).';
    return null;
  },
  int: (min, max) => (v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < min || n > max) return `Entre ${min} y ${max} personas.`;
    return null;
  },
  consent: (v) => (v ? null : 'Necesitamos tu autorización para contactarte.'),
};

/** Normaliza un teléfono colombiano a E.164 (+57…). Si ya trae indicativo, lo respeta. */
export function normalizePhone(v) {
  const raw = String(v ?? '').trim();
  const digits = raw.replace(/[^\d]/g, '');
  if (raw.startsWith('+')) return '+' + digits;
  if (digits.length === 10) return '+57' + digits;
  return '+' + digits;
}

/**
 * Valida un formulario a partir de un mapa campo → validador.
 * Pinta los mensajes en [data-error-for="campo"] y marca aria-invalid.
 * @returns {boolean} true si todo es válido
 */
export function validateForm(form, schema) {
  let firstInvalid = null;
  for (const [field, check] of Object.entries(schema)) {
    const input = form.elements[field];
    if (!input) continue;
    const value = input.type === 'checkbox' ? input.checked : input.value;
    const msg = check(value, form);
    showFieldError(form, field, msg);
    if (msg && !firstInvalid) firstInvalid = input;
  }
  firstInvalid?.focus();
  return !firstInvalid;
}

export function showFieldError(form, field, msg) {
  const input = form.elements[field];
  const out = form.querySelector(`[data-error-for="${field}"]`);
  if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  if (out) out.textContent = msg || '';
}
