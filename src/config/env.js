/**
 * Configuración pública del frontend.
 * Solo valores que pueden vivir en el navegador: nada de tokens ni claves.
 * Ver .env.example.
 */
const env = import.meta.env;
const params = new URLSearchParams(window.location.search);

export const config = {
  /** 'mock' = datos de demostración · 'http' = API de Agent.IA */
  dataSource: env.VITE_DATA_SOURCE === 'http' ? 'http' : 'mock',
  apiBaseUrl: (env.VITE_API_BASE_URL || '').replace(/\/$/, ''),
  /** Vacío = botón de WhatsApp oculto (canal oficial pendiente de Agent.IA). */
  whatsappNumber: (env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  siteUrl: env.VITE_SITE_URL || window.location.origin,
  timeZone: 'America/Bogota',
  requestTimeoutMs: 12000,

  /**
   * Banderas de la demo (solo por URL, nunca activas por defecto):
   *  ?preview=socios   → muestra promociones en borrador para aprobación de socios
   *  ?mock=error       → los envíos del mock fallan (para ver el estado de error)
   *  ?mock=confirmado  → el mock responde "confirmada" (para ver ese estado)
   *  ?mock=lento       → el mock tarda más (para ver estados de carga)
   */
  preview: params.get('preview') === 'socios',
  mockScenario: params.get('mock') || 'normal',
};

export const isDemo = config.dataSource === 'mock';
