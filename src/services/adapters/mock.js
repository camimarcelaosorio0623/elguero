/**
 * Adaptador MOCK — solo para demostración.
 * - No guarda datos de clientes en ningún lado (ni localStorage ni red).
 * - Nunca confirma una reserva por sí solo: responde "received".
 *   "confirmed" solo aparece con ?mock=confirmado, para revisar ese estado de la interfaz.
 * - Los requestId llevan el prefijo DEMO- para que nadie los confunda con reales.
 */
import { config } from '../../config/env.js';
import { ServiceError } from '../types.js';
import { menuMock } from '../../data/mocks/menu.js';
import { promotionsMock } from '../../data/mocks/promotions.js';
import { eventsMock } from '../../data/mocks/events.js';

const scenario = config.mockScenario;
const wait = (ms) => new Promise((r) => setTimeout(r, scenario === 'lento' ? ms * 4 : ms));
const clone = (v) => structuredClone(v);
const demoId = () => 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();

function maybeFail() {
  if (scenario === 'error') throw new ServiceError('server', 'Simulación de error (mock).');
}

export const mockAdapter = {
  async getMenu() {
    await wait(250);
    return clone(menuMock);
  },

  async submitReservation(/** @type {import('../types.js').ReservationRequest} */ _req) {
    await wait(1100);
    maybeFail();
    return {
      requestId: demoId(),
      status: scenario === 'confirmado' ? 'confirmed' : 'received',
      message: null,
    };
  },

  async getReservationStatus(requestId) {
    await wait(400);
    return { requestId, status: 'pending', message: null };
  },

  async submitBirthdayRequest(/** @type {import('../types.js').BirthdayRequest} */ _req) {
    await wait(1100);
    maybeFail();
    return { requestId: demoId(), status: 'received' };
  },

  async getPromotions({ includeDrafts = false } = {}) {
    await wait(200);
    return clone(promotionsMock).filter((p) => p.status === 'active' || (includeDrafts && p.status === 'draft'));
  },

  async getEvents() {
    await wait(200);
    return clone(eventsMock).filter((e) => e.status === 'published');
  },
};
