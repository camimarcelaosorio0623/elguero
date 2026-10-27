/**
 * Capa de servicios: el ÚNICO punto por el que los componentes piden o envían datos.
 * Los componentes no saben si detrás hay un mock o la API de Agent.IA.
 *
 * Para conectar el backend: VITE_DATA_SOURCE=http + VITE_API_BASE_URL, y ajustar
 * src/services/adapters/http.js a los contratos definitivos.
 */
import { config } from '../config/env.js';
import { mockAdapter } from './adapters/mock.js';
import { httpAdapter } from './adapters/http.js';

const adapter = config.dataSource === 'http' ? httpAdapter : mockAdapter;

/** @returns {Promise<import('./types.js').Menu>} */
export async function getMenu() {
  const menu = await adapter.getMenu();
  return {
    categories: [...menu.categories].sort((a, b) => a.order - b.order),
    products: menu.products.filter((p) => p.published).sort((a, b) => a.order - b.order),
  };
}

/** @param {import('./types.js').ReservationRequest} req
 *  @returns {Promise<import('./types.js').ReservationResult>} */
export const submitReservation = (req) => adapter.submitReservation(req);

/** @returns {Promise<import('./types.js').ReservationResult>} */
export const getReservationStatus = (id) => adapter.getReservationStatus(id);

/** @param {import('./types.js').BirthdayRequest} req
 *  @returns {Promise<import('./types.js').BirthdayResult>} */
export const submitBirthdayRequest = (req) => adapter.submitBirthdayRequest(req);

/** @returns {Promise<import('./types.js').Promotion[]>} */
export const getPromotions = () => adapter.getPromotions({ includeDrafts: config.preview });

/** @returns {Promise<import('./types.js').EventItem[]>} */
export const getEvents = () => adapter.getEvents();
