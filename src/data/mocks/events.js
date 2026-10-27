/**
 * DATOS DE DEMOSTRACIÓN — eventos.
 * Solo la gran apertura (fecha aprobada en la directiva). Sin artistas: no hay confirmados.
 * @type {import('../../services/types.js').EventItem[]}
 */
export const eventsMock = [
  {
    id: 'gran-apertura-2026',
    title: 'Gran apertura',
    startsAt: '2026-11-13T18:00:00-05:00',
    description: 'Tacos al pastor, cantaritos de barro y noches que se vuelven leyenda.',
    image: '/media/teaser-apertura-poster.webp',
    video: '/media/teaser-apertura.mp4',
    status: 'published',
    cta: { label: 'Reservar mi mesa', href: '#reservas' },
  },
];
