/**
 * Contenido institucional del sitio (lo que NO viene del backend).
 * Cada dato lleva su estado en CONTENT_STATUS.md.
 */
export const site = {
  name: 'El Güero · Divino Cantarito',
  tagline: 'México en cada trago.',
  subtitle: 'Tacos al pastor, cantaritos de barro y noches que se vuelven leyenda.',
  kind: 'Restaurante · Bar · Discoteca',
  publicLocation: 'Laureles · Medellín', // dirección exacta pendiente de validar: no publicar

  /** Apertura aprobada: viernes 13-nov-2026, 6:00 p. m. hora de Medellín (UTC-5). */
  opening: {
    iso: '2026-11-13T18:00:00-05:00',
    label: 'Viernes 13 de noviembre de 2026 · 6:00 p. m.',
  },

  /**
   * Horario tomado de la referencia del equipo (v5). PENDIENTE de confirmar con socios.
   * days: 0=domingo … 6=sábado. close > 24 = cierra de madrugada del día siguiente.
   */
  hours: {
    confirmed: false,
    openDays: [0, 2, 3, 4, 5, 6],
    open: 12,
    close: 27,
    label: 'Martes a domingo',
  },

  channels: {
    instagram: 'https://www.instagram.com/divinocantarito/',
    tiktok: 'https://www.tiktok.com/@divinocantarito',
    maps: 'https://maps.app.goo.gl/8WZ3bj1DLoZp1nVKA',
  },
};
