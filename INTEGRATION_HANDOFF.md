# INTEGRATION_HANDOFF — El Güero · Divino Cantarito

**Para:** Marcos y Jesús (Agent.IA — backend, agentes, integraciones)
**De:** Marce (frontend)
**Fecha:** 27-oct-2026 · Frontend v2

> Este documento describe **lo que necesita el frontend**. Las rutas y formatos son una **propuesta**: ninguna API está implementada. Ustedes aprueban y definen los contratos definitivos; el frontend se ajusta en un solo archivo (`src/services/adapters/http.js`).

---

## 1. Cómo se conecta

1. `VITE_DATA_SOURCE=http` y `VITE_API_BASE_URL=https://…` (en Netlify → Site settings → Environment variables).
2. Ajustar `ENDPOINTS` y, si hace falta, la forma de las respuestas en `src/services/adapters/http.js`.
3. Los componentes no se tocan: solo consumen `src/services/index.js`.

Reglas que el frontend ya cumple:
- Ninguna credencial en el navegador. Si la API requiere autenticación, que se resuelva en servidor (proxy / cookie httpOnly). El adaptador usa `credentials: 'omit'`.
- Todo texto del backend se escapa antes de pintarse; las URLs solo se aceptan si son `https://`, `http://` o rutas relativas.
- La validación del frontend es solo ayuda: **el backend debe validar todo de nuevo**.
- El frontend nunca inventa IDs de reserva ni marca una reserva como confirmada por su cuenta.

## 2. Módulos que requieren backend

| Módulo | Función del frontend | Necesita | Estado |
|---|---|---|---|
| Carta | `getMenu()` | Categorías, productos, precios, disponibilidad, imágenes | Mock |
| Reservas | `submitReservation()`, `getReservationStatus()` | Recibir solicitud, disponibilidad, confirmación | Mock |
| Cumpleaños | `submitBirthdayRequest()` | Recibir solicitud de cotización | Mock |
| Promociones | `getPromotions()` | Solo activas (borradores nunca en la API pública) | Mock (2 borradores) |
| Eventos | `getEvents()` | Solo publicados | Mock (gran apertura) |
| WhatsApp | `VITE_WHATSAPP_NUMBER` | Número oficial; agente conversacional del lado de ustedes | Botones visibles con número provisional `570000000000` (pendiente) |
| CRM / analítica | `track(name, props)` en `src/components/forms.js` | Destino de eventos de conversión | Emite `CustomEvent('guero:track')`, no envía nada |

## 3. Estructuras de datos

Fuente de verdad: `src/services/types.js` (JSDoc). Resumen:

```ts
MenuCategory { id: string; section: 'food'|'drinks'; name: string; description: string|null; image: string|null; order: number }

Product {
  id: string; categoryId: string; name: string;
  description: string|null;     // null = no aprobada → no se muestra
  price: number|null;           // COP entero; null = no publicado
  image: string|null;           // URL; null = imagen de la categoría
  availability: 'available'|'sold_out'|'unavailable';
  published: boolean;           // false = no aparece
  featured?: boolean;           // sello "De la casa"
  order: number
}

ReservationRequest {
  name: string;                 // 2–80 caracteres
  date: string;                 // 'YYYY-MM-DD', hora de Medellín
  time: string;                 // 'HH:mm' 24 h
  partySize: number;            // 1–30
  phone: string;                // E.164, ej. '+573001234567'
  visitType: 'dinner'|'party'|'birthday'|'celebration'|'business'|'other';
  consent: true                 // autorización de tratamiento de datos (Ley 1581 de 2012)
}
ReservationResult { requestId: string; status: 'received'|'pending'|'confirmed'|'rejected'|'cancelled'; message?: string|null }

BirthdayRequest { name; phone; date: 'YYYY-MM-DD'; guests: number /*2–150*/; notes?: string /*≤500*/; consent: true }
BirthdayResult  { requestId: string; status: 'received' }

Promotion { id; title; description: string|null; conditions: string|null; status: 'draft'|'active'|'inactive'; image: string|null; validFrom: string|null; validTo: string|null }

EventItem { id; title; startsAt: string /*ISO 8601 con zona*/; description: string|null; image: string|null; video: string|null; status: 'draft'|'published'|'cancelled'; cta: { label: string; href: string } | null }
```

## 4. Operaciones de API propuestas

> Propuesta. Ninguna existe todavía.

### 4.1 Consultar carta y categorías
`GET /menu` → `200`
```json
{
  "categories": [{ "id": "tacos", "section": "food", "name": "Tacos y especialidades", "description": null, "image": "https://cdn…/tacos.webp", "order": 1 }],
  "products": [{ "id": "tacos-al-pastor", "categoryId": "tacos", "name": "Tacos al pastor", "description": null, "price": null, "image": null, "availability": "available", "published": true, "featured": true, "order": 0 }]
}
```

### 4.2 Consultar disponibilidad de productos
Incluida en `GET /menu` (`availability`). Si prefieren un endpoint liviano para refrescar sin recargar la carta:
`GET /menu/availability` → `200` `[{ "id": "tacos-al-pastor", "availability": "sold_out" }]` *(el frontend aún no lo consume; avisar si lo crean)*.

### 4.3 Enviar solicitud de reserva
`POST /reservations`
```json
{ "name": "Ana Pérez", "date": "2026-11-13", "time": "19:00", "partySize": 4, "phone": "+573001234567", "visitType": "birthday", "consent": true }
```
→ `201`
```json
{ "requestId": "R-8F2K1", "status": "received", "message": null }
```
`status: "confirmed"` **solo** si el backend confirma en firme en ese momento. El frontend muestra «Solicitud recibida — todavía no confirmada» para `received` / `pending`.

### 4.4 Consultar estado de una reserva
`GET /reservations/{requestId}` → `200` `{ "requestId": "R-8F2K1", "status": "confirmed", "message": "Mesa para 4 a las 7:00 p. m." }`
*(Preparado en la capa de servicios; la interfaz de consulta pública se habilita cuando definan cómo se identifica el cliente, p. ej. enlace firmado por WhatsApp.)*

### 4.5 Enviar solicitud de cumpleaños
`POST /birthday-requests`
```json
{ "name": "Ana Pérez", "phone": "+573001234567", "date": "2026-12-05", "guests": 15, "notes": "Sorpresa con mariachi", "consent": true }
```
→ `201` `{ "requestId": "B-31QZ", "status": "received" }`

### 4.6 Consultar promociones activas
`GET /promotions?status=active` → `200` `Promotion[]` (solo `active`).

### 4.7 Consultar eventos publicados
`GET /events?status=published` → `200` `EventItem[]` (ordenados por `startsAt`).

### 4.8 Errores (formato que espera el adaptador)

| HTTP | `ServiceError.code` | Qué muestra la interfaz |
|---|---|---|
| 400 / 422 | `validation` | Marca los campos de `fields` y pide revisar |
| 404 | `not_found` | Mensaje genérico |
| 5xx | `server` | «No pudimos enviar tu solicitud… tus datos siguen en el formulario» + reintentar |
| sin red / timeout 12 s | `network` / `timeout` | Igual que 5xx |

Cuerpo de error sugerido:
```json
{ "message": "Datos inválidos", "fields": { "phone": "Número no válido", "date": "No hay disponibilidad ese día" } }
```
Los nombres en `fields` deben coincidir con los del request (`name`, `date`, `time`, `partySize`, `phone`, `visitType`, `consent`).

## 5. Eventos y estados de interfaz

**Carta, promociones, eventos:** `loading` → `ready` | `empty` | `error` (atributo `data-state` en el contenedor).

**Reserva y cumpleaños:**
```
idle ──enviar──▶ sending ──▶ received   (status received | pending)
                         ├─▶ confirmed  (solo status === 'confirmed' del backend)
                         └─▶ error ──reintentar──▶ idle (conserva los datos)
```

**Eventos de analítica** (`window` → `guero:track`, `detail.name`), sin datos personales:
`reservation_submitted {status}`, `reservation_failed {code}`, `birthday_open`, `birthday_submitted`, `birthday_failed {code}`.
Los botones principales tienen `data-cta="…"` para medir clics (p. ej. `hero-reservar`, `header-reservar`, `cotizar-cumple`, `maps`).

## 6. Dependencias pendientes

- [ ] Contratos API definitivos (este documento como punto de partida).
- [ ] CORS de la API para el dominio del sitio (y `localhost:3031` en desarrollo).
- [ ] **Número oficial de WhatsApp → `VITE_WHATSAPP_NUMBER`** (hoy los botones usan el provisional `570000000000`).
- [ ] Destino de `track()` (CRM / analítica).
- [ ] Enlace a la política de tratamiento de datos (checkbox de los formularios).
- [ ] Carta de bebidas cargada en el backend (los datos de demo no la incluyen).
- [ ] Hosting de imágenes de productos (URLs en `image`).
- [ ] Dominio definitivo (canonical y Open Graph apuntan hoy a `elgueropro.netlify.app`).

## 7. Preguntas técnicas por resolver

1. ¿La API vive en un dominio propio o detrás del mismo dominio del sitio (proxy de Netlify/Cloudflare)? Esto define CORS y cookies.
2. ¿Protección anti-spam de formularios? (Turnstile / reCAPTCHA / rate-limit en servidor). El frontend puede integrar el widget; la verificación es de ustedes.
3. ¿Cómo consulta un cliente el estado de su reserva? (enlace firmado por WhatsApp, código + teléfono, solo por WhatsApp…).
4. ¿Disponibilidad de horarios en tiempo real? Si sí, proponemos `GET /availability?date=YYYY-MM-DD&partySize=n` → `["18:00","18:30",…]` para reemplazar los turnos fijos cada 30 min.
5. ¿Precios con o sin impoconsumo/servicio incluido? Afecta cómo se muestra `price`.
6. ¿Límite real de personas por reserva online? (hoy 30; cumpleaños hasta 150).
7. ¿Idioma: solo español o también inglés?
