# El Güero · Divino Cantarito — Frontend v2

Sitio de **El Güero · Divino Cantarito** (restaurante · bar · discoteca mexicana, Laureles, Medellín).
Frontend completo, en modo demostración, listo para que Agent.IA (Marcos y Jesús) conecte backend, agentes y canales.

- Vista previa: https://elgueropro.netlify.app/
- Documento para integración: [`INTEGRATION_HANDOFF.md`](INTEGRATION_HANDOFF.md)
- Estado de contenidos: [`CONTENT_STATUS.md`](CONTENT_STATUS.md)

## Stack y versiones

| Pieza | Versión | Por qué |
|---|---|---|
| HTML + CSS + JavaScript (ES modules), sin framework | — | Conserva el sitio aprobado sin reconstruirlo; cero JS de framework en el cliente. |
| [Vite](https://vite.dev) | 8.3.5 | Servidor de desarrollo, build de producción y variables de entorno `VITE_*`. |
| Node.js | ≥ 20.19 (Netlify usa 22) | Requisito de Vite 8. |
| Playwright (solo dev) | 1.64.1 | Pruebas responsive y de rendimiento. |

Si el equipo decide migrar a Next.js, la capa de servicios (`src/services/`), los mocks y el CSS se portan tal cual; solo cambian los componentes de render.

## Requisitos

- Node.js 20.19 o superior y npm.
- Para las pruebas: navegador de Playwright (`npx playwright install chromium`).

## Comandos

```bash
npm install            # dependencias
cp .env.example .env.local   # configuración local (opcional; sin él corre en modo demo)
npm run dev            # desarrollo → http://localhost:3031
npm run build          # build de producción → dist/
npm run preview        # sirve dist/ → http://localhost:4173
npm run check:responsive   # (con preview corriendo) pruebas en 5 tamaños + flujos
npm run check:perf         # (con preview corriendo) LCP / CLS / INP en móvil simulado
```

**Despliegue:** Netlify publica solo con cada push a `main` usando `netlify.toml` (`npm ci && npm run build`, carpeta `dist`). También sirve en Cloudflare Pages con el mismo comando y carpeta.

## Estructura

```
index.html                 Estructura de todas las secciones (orden de la directiva)
src/
  main.js                  Punto de entrada: inicializa cada componente
  config/
    env.js                 Configuración pública (VITE_*) y banderas de demo por URL
    site.js                Contenido institucional: apertura, horario, canales
  services/
    index.js               ÚNICA puerta de datos para los componentes
    types.js               Modelo de datos (JSDoc) + ServiceError
    adapters/mock.js       Adaptador de demostración (datos de prueba)
    adapters/http.js       Esqueleto para la API de Agent.IA (rutas PROPUESTAS)
  data/mocks/              Datos de demostración: menu.js, promotions.js, events.js
  components/
    header.js              Header transparente→sólido, menú móvil, botón flotante, reveal
    hero.js                Video del hero (16:9 / 9:16), globo del Güero, estado abierto/cerrado
    cantarito.js           Cantarito capa por capa + medidor (fijo en móvil)
    menu.js                Carta digital (comida / bebidas) con estados
    promos-events.js       Promociones y eventos (con cuenta regresiva)
    forms.js               Reserva y cumpleaños: validación + máquina de estados + track()
    location.js            Horario del día y botón de WhatsApp (si está configurado)
  lib/                     Utilidades: dom.js (escape/estados), time.js (hora Medellín), validation.js
  styles/main.css          Tokens de marca y estilos (mobile-first)
public/                    Archivos servidos tal cual
  media/                   Videos del hero y teaser optimizados + posters
  img/logos/               Logos oficiales optimizados (webp)
  img/fotos/               Fotogramas de los videos de marca + fotos de referencia
assets-originales/logos/   Logos originales en PNG (alta resolución), sin modificar
scripts/                   Pruebas responsive y de rendimiento (Playwright)
docs/pruebas/              Capturas y resultados de las pruebas
```

## Secciones (orden definitivo)

1. Hero cinematográfico fullscreen (video de fondo, header transparente encima) — `#inicio`
2. Experiencia El Güero (+ El Divino Cantarito capa por capa) — `#experiencia`
3. Carta digital — `#carta`
4. La Travesía — `#travesia`
5. Espacios y ambiente — `#espacios`
6. Celebra a lo Divino (cumpleaños + promociones) — `#celebra`
7. Eventos y música — `#eventos`
8. Ubicación y reservas — `#reservas`
9. Franquicias disponibles próximamente — `#franquicias`
10. Footer

## Assets

| Uso | Archivo servido | Original |
|---|---|---|
| Video hero desktop 16:9 | `public/media/hero-desktop.mp4` (1.7 MB, sin audio) | `clientes/divino-cantarito/material/videos/SPLASHHERODESKTOP.mp4` |
| Video hero móvil 9:16 | `public/media/hero-movil.mp4` (2.1 MB, sin audio) | `…/material/videos/SPLASHHEROMOBIL.mp4` |
| Posters de respaldo | `public/media/hero-*-poster.webp` | fotograma del video |
| Teaser de apertura (evento) | `public/media/teaser-apertura.mp4` (4 MB, con audio) | `…/material/videos/teaser-apertura-original.mp4` (85 MB, HEVC 4K) |
| Logo El Güero | `public/img/logos/el-guero-logo-2-{520,640,900}.webp` | `assets-originales/logos/el-guero-logo-2.png` |
| Logo Divino Cantarito | `public/img/logos/divino-cantarito-logo-{520,640,900}.webp` | `assets-originales/logos/divino-cantarito-logo.png` |
| Logo perfil (header, favicon) | `public/img/logos/el-guero-perfil-96.webp`, `public/favicon.png` | `assets-originales/logos/el-guero-perfil.png` |
| Imagen social (Open Graph) | `public/img/og-el-guero.jpg` | fotograma del video desktop |
| La Travesía / Espacios | `public/img/fotos/cap*.webp`, `guero-cantarito.webp`, `tacos-cantarito.webp` | fotogramas de los videos de marca |

Los logos se usan sin modificar (solo redimensionados). Para cambiar una imagen de la carta no se toca código: el backend manda la URL en `image`.

## Variables de entorno

Ver [`.env.example`](.env.example). Todas son **públicas** (terminan en el JS del navegador): nunca poner tokens ni claves.

| Variable | Valor por defecto | Uso |
|---|---|---|
| `VITE_DATA_SOURCE` | `mock` | `mock` = demo con datos de prueba · `http` = API de Agent.IA |
| `VITE_API_BASE_URL` | vacío | URL base de la API cuando `VITE_DATA_SOURCE=http` |
| `VITE_WHATSAPP_NUMBER` | vacío | Número oficial. **Pendiente**: vacío = botones visibles con el número provisional `570000000000` (inválido a propósito, no le llega a nadie) |
| `VITE_SITE_URL` | `https://elgueropro.netlify.app` | URL pública |

## Capa de servicios y mocks

Los componentes **solo** llaman funciones de `src/services/index.js`:
`getMenu`, `submitReservation`, `getReservationStatus`, `submitBirthdayRequest`, `getPromotions`, `getEvents`.

Detrás hay un adaptador intercambiable:

- `mock` (por defecto): datos de `src/data/mocks/`, marcados como demostración. No guarda datos de clientes en ningún lado y **nunca confirma una reserva por sí solo**.
- `http`: esqueleto con `fetch`, timeout y errores normalizados (`ServiceError`). Las rutas son una propuesta; Agent.IA las define.

Banderas de demostración por URL (solo funcionan con el mock):

| URL | Para qué |
|---|---|
| `?preview=socios` | Muestra las promociones en borrador (marcadas «Borrador») para aprobación de socios |
| `?mock=error` | Los envíos fallan → ver el estado de error |
| `?mock=confirmado` | El mock responde «confirmada» → ver ese estado |
| `?mock=lento` | Respuestas 4× más lentas → ver estados de carga |

En modo mock aparece la cinta «Modo demostración · datos de prueba» abajo a la izquierda.

## Modelo 3D (futuro)

El marco del cantarito en `#cantarito` tiene `data-slot="cantarito-3d"`. Ahí se puede montar un visor 3D (por ejemplo `<model-viewer>`) cargado en diferido, con la foto actual como respaldo. La navegación no depende de él.

## Pruebas y resultados

Ver `docs/pruebas/` (capturas por tamaño, `responsive.txt`, `rendimiento.txt`, `resultados.json`).

- Responsive: 360, 390, 768, 1366 y 1920 px → sin scroll horizontal, hero en el primer pantallazo, CTAs visibles, carta, medidor del cantarito visible al bajar, validación, estados del formulario, franquicias al final, sin errores de consola.
- Rendimiento (laboratorio, móvil 390 px, 4G lento simulado + CPU 4×): **LCP ≈ 2.1 s · CLS ≤ 0.008 · INP ≈ 90–110 ms**. Son medidas de laboratorio; las de campo (usuarios reales) se miden después del lanzamiento.

## Puntos pendientes de integración

Detalle en `INTEGRATION_HANDOFF.md`. Resumen: API de carta, reservas, cumpleaños, promociones y eventos; número oficial de WhatsApp (hoy provisional); destino de `track()` (analítica/CRM); política de tratamiento de datos (enlace del checkbox).

## Limitaciones conocidas

- La carta de bebidas de 6 páginas no llegó al repositorio: las 5 categorías de bebidas están creadas y vacías (se muestran «en revisión»), salvo El Divino Cantarito.
- Precios y descripciones de platos no están aprobados → no se muestran.
- No hay fotos reales del local: Espacios y La Travesía usan fotogramas de los videos de marca; la carta usa dos fotos de referencia del equipo. Están marcadas en `CONTENT_STATUS.md`.
- El horario (martes a domingo, 12 p. m. – 3 a. m.) viene de la referencia del equipo y está pendiente de confirmación.
- La «política de tratamiento de datos» del checkbox aún no tiene enlace (falta el documento legal).
- El video del hero se omite con «movimiento reducido» o «ahorro de datos» activos (se ve el poster).
