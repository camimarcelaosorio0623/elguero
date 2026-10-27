/** Fechas en hora de Medellín (UTC-5, sin horario de verano), sin importar dónde esté quien mira. */
const OFFSET_MS = 5 * 3600e3;

export const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function nowInMedellin(ts = Date.now()) {
  const d = new Date(ts - OFFSET_MS);
  return {
    dow: d.getUTCDay(),
    hour: d.getUTCHours() + d.getUTCMinutes() / 60,
    ymd: d.toISOString().slice(0, 10),
  };
}

/** 'YYYY-MM-DD' → día de la semana (0=domingo). */
export function dowOf(ymd) {
  return new Date(ymd + 'T12:00:00Z').getUTCDay();
}

export function formatDateLong(iso) {
  const d = new Date(new Date(iso).getTime() - OFFSET_MS);
  const h = d.getUTCHours(), m = d.getUTCMinutes();
  const hh = ((h + 11) % 12) + 1;
  return {
    day: `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`,
    time: `${hh}:${String(m).padStart(2, '0')} ${h < 12 ? 'a. m.' : 'p. m.'}`,
    dd: d.getUTCDate(),
    mon: MONTHS[d.getUTCMonth()].slice(0, 3),
  };
}

export function formatYmd(ymd) {
  const d = new Date(ymd + 'T12:00:00Z');
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} de ${MONTHS[d.getUTCMonth()]}`;
}

/** Abierto / cerrado según el horario configurado (cierres de madrugada incluidos). */
export function isOpenNow(hours, ts = Date.now()) {
  const n = nowInMedellin(ts);
  const today = hours.openDays.includes(n.dow) && n.hour >= hours.open;
  const yesterday = (n.dow + 6) % 7;
  const lateFromYesterday = hours.close > 24 && hours.openDays.includes(yesterday) && n.hour < hours.close - 24;
  return { open: today || lateFromYesterday, dow: n.dow, hour: n.hour };
}
