/**
 * DATOS DE DEMOSTRACIÓN — carta.
 * Nombres de productos: aprobados en la directiva master.
 * Descripciones y precios: NO aprobados → null (no se publican).
 * Carta de bebidas (6 páginas): pendiente de recibir; las categorías quedan vacías.
 * @type {import('../../services/types.js').Menu}
 */
const img = (file) => `/img/fotos/${file}`;

export const menuMock = {
  categories: [
    { id: 'tacos', section: 'food', name: 'Tacos y especialidades', description: null, image: img('ref-sig2.jpg'), order: 1 },
    { id: 'antojitos', section: 'food', name: 'Antojitos y para compartir', description: null, image: img('ref-abrir-boca.jpg'), order: 2 },
    { id: 'sopas', section: 'food', name: 'Sopas y cremas', description: null, image: img('tacos-cantarito.webp'), order: 3 },
    { id: 'cantaritos', section: 'drinks', name: 'Los Divinos Cantaritos', description: null, image: img('guero-cantarito.webp'), order: 4 },
    { id: 'margaritas', section: 'drinks', name: 'Margaritas y mezcalitas', description: null, image: null, order: 5 },
    { id: 'cocteleria', section: 'drinks', name: 'Coctelería mexicana y especiales', description: null, image: null, order: 6 },
    { id: 'destilados', section: 'drinks', name: 'Tequilas, mezcales y destilados', description: null, image: null, order: 7 },
    { id: 'cervezas', section: 'drinks', name: 'Cervezas y bebidas para compartir', description: null, image: null, order: 8 },
  ],
  products: [
    ...[
      ['tacos-al-pastor', 'Tacos al pastor', true],
      ['tacos-de-carnitas', 'Tacos de carnitas'],
      ['taco-gobernador', 'Taco gobernador'],
      ['taco-baja', 'Taco Baja'],
      ['taco-camaron-tempura', 'Taco de camarón tempura'],
      ['taco-de-lengua', 'Taco de lengua'],
      ['suizo', 'Suizo'],
    ].map(([id, name, featured], i) => p(id, 'tacos', name, i, featured)),
    ...[
      ['picada-mexicana', 'Picada mexicana'],
      ['flautas-de-pollo', 'Flautas de pollo'],
      ['chilaquiles', 'Chilaquiles'],
      ['quesos-fundidos', 'Quesos fundidos'],
      ['costra-de-queso', 'Costra de queso'],
      ['tostadas', 'Tostadas'],
      ['frijoles-puercos-chorizo', 'Frijoles puercos con chorizo'],
      ['cebollas-asadas', 'Cebollas asadas'],
    ].map(([id, name], i) => p(id, 'antojitos', name, i)),
    ...[
      ['crema-de-champinones', 'Crema de champiñones'],
      ['sopa-de-tortilla', 'Sopa de tortilla'],
      ['crema-de-frijol', 'Crema de frijol'],
      ['consome-de-pollo', 'Consomé de pollo'],
    ].map(([id, name], i) => p(id, 'sopas', name, i)),
    p('el-divino-cantarito', 'cantaritos', 'El Divino Cantarito', 0, true),
  ],
};

function p(id, categoryId, name, order, featured = false) {
  return {
    id,
    categoryId,
    name,
    description: null,
    price: null,
    image: null,
    availability: 'available',
    published: true,
    featured,
    order,
  };
}
