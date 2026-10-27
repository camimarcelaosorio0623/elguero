/**
 * Modelo de datos que el frontend espera del backend.
 * Es la fuente de verdad de INTEGRATION_HANDOFF.md: si cambia aquí, se actualiza allá.
 *
 * @typedef {'food'|'drinks'} MenuSection
 *
 * @typedef {Object} MenuCategory
 * @property {string} id            Identificador estable (slug).
 * @property {MenuSection} section
 * @property {string} name
 * @property {string|null} description
 * @property {string|null} image    URL absoluta o ruta pública. null = imagen por defecto.
 * @property {number} order
 *
 * @typedef {'available'|'sold_out'|'unavailable'} Availability
 *
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} categoryId
 * @property {string} name
 * @property {string|null} description  null = no aprobada → no se muestra.
 * @property {number|null} price        Pesos colombianos (COP), entero. null = no publicado.
 * @property {string|null} image
 * @property {Availability} availability
 * @property {boolean} published        false = no se muestra en el sitio público.
 * @property {boolean} [featured]       Sello "De la casa".
 * @property {number} order
 *
 * @typedef {Object} Menu
 * @property {MenuCategory[]} categories
 * @property {Product[]} products
 *
 * @typedef {'lunch'|'dinner'|'party'|'birthday'|'celebration'|'business'|'other'} VisitType
 *
 * @typedef {Object} ReservationRequest
 * @property {string} name
 * @property {string} date      YYYY-MM-DD (hora de Medellín)
 * @property {string} time      HH:mm, 24 h
 * @property {number} partySize 1–30
 * @property {string} phone     Formato E.164 sugerido (+57…)
 * @property {VisitType} visitType
 * @property {boolean} consent  Autorización de tratamiento de datos (Ley 1581 de 2012)
 *
 * @typedef {'received'|'pending'|'confirmed'|'rejected'|'cancelled'} ReservationStatus
 *
 * @typedef {Object} ReservationResult
 * @property {string} requestId  Generado por el backend. El frontend nunca lo inventa.
 * @property {ReservationStatus} status
 * @property {string|null} [message]
 *
 * @typedef {Object} BirthdayRequest
 * @property {string} name
 * @property {string} phone
 * @property {string} date       YYYY-MM-DD tentativa
 * @property {number} guests
 * @property {string} [notes]
 * @property {boolean} consent
 *
 * @typedef {Object} BirthdayResult
 * @property {string} requestId
 * @property {'received'} status
 *
 * @typedef {Object} Promotion
 * @property {string} id
 * @property {string} title
 * @property {string|null} description
 * @property {string|null} conditions
 * @property {'draft'|'active'|'inactive'} status
 * @property {string|null} image
 * @property {string|null} validFrom  ISO 8601
 * @property {string|null} validTo
 *
 * @typedef {Object} EventItem
 * @property {string} id
 * @property {string} title
 * @property {string} startsAt   ISO 8601 con zona horaria
 * @property {string|null} description
 * @property {string|null} image     Flyer
 * @property {string|null} video
 * @property {'draft'|'published'|'cancelled'} status
 * @property {{label:string, href:string}|null} cta
 */

/** Error normalizado de la capa de servicios. */
export class ServiceError extends Error {
  /**
   * @param {'network'|'timeout'|'validation'|'not_found'|'server'|'unknown'} code
   * @param {string} message
   * @param {Record<string,string>} [fields] errores por campo devueltos por el backend
   */
  constructor(code, message, fields) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.fields = fields || null;
  }
}
