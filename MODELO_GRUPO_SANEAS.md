# MODELO GRUPO SANEAS · Web + APP + estructura

**Para develosenior.** Este documento es el modelo a seguir para montar cualquier
marca nueva del grupo empresarial Saneas (web de marketing + APP de clientes).
Es autocontenido: no necesitas ninguna conversación anterior. Está probado en
producción con Saneas (saneas.es + app.saneas.es) y es la referencia para
Pordondevoy, laOra, CasActiva y las que vengan.

Copia espejo en los dos repos del grupo (`saneas-app` y `saneas`). Si cambias
uno, cambia el otro.

---

## 0. Las reglas del juego (Oscar)

1. **Ejecutar, no proponer.** Pregunta solo lo que solo Oscar puede contestar
   (URLs, precios, decisiones de negocio, logos). Todo lo demás, hazlo.
2. **Nunca parches.** Soluciones de raíz, sin romper nada, sin parar a mitad.
3. **Nada sale al cliente sin que Oscar lo revise.** Ciclo obligatorio:
   rama → preview → Oscar dice «fusiona» → merge a main. Sin excepciones.
4. **El enlace de la preview siempre en el chat**, sin que lo pida.
5. **Los correos de destino NUNCA en el código.** Los repos son públicos: el
   correo de Oscar vive solo en secretos de Supabase (`CANDIDATOS_EMAIL`).
6. **Sin frameworks y sin build.** HTML/CSS/JS vanilla que se lee y se toca.
   Guardar es desplegar.
7. **SQL siempre en archivos pegar-y-listo**, idempotentes, en `supabase/`.
   Oscar los pega en el SQL Editor; los `.ts` van a Edge Functions, nunca al
   SQL Editor.
8. **Commits en español**, mensaje que explique el porqué.
9. **El histórico contable no se toca.** Nada de updates masivos sobre datos
   anteriores a una fecha de corte sin lista explícita de Oscar.
10. **Capturas de pantalla al chat** como prueba de cada cambio visual.

---

## 1. Estructura del grupo

Por cada marca, **dos repos** en la cuenta `Saneas26` y **dos dominios**:

| Pieza | Repo | Dominio | Hosting | Previews |
|---|---|---|---|---|
| Web de marketing | `Saneas26/<marca>` | `<marca>.es` | Cloudflare Pages | `<rama>.<marca>.pages.dev` |
| APP de clientes (PWA) | `Saneas26/<marca>-app` | `app.<marca>.es` | Vercel | URL por PR |

- **Supabase: un proyecto por marca** (auth, tablas, Edge Functions, secretos).
  La clave *publishable* va en el código cliente (es pública por diseño); la
  seguridad la pone RLS, nunca la ocultación.
- **Resend** para todos los correos salientes, con remitente
  `'<Marca> <app@<marca>.es>'` y secretos `RESEND_API_KEY` + correo destino.
- **El pie común del grupo**: todas las webs llevan la sección «El grupo
  Saneas» con una tarjeta por marca (logo 192px en
  `assets/img/app-<marca>.png`). Al nacer una marca, se añade su tarjeta en
  TODAS las webs del grupo. Mientras no tenga web pública, la tarjeta va sin
  enlace y con `<small class="soon">Muy pronto</small>`.

Marcas a fecha de este documento: **Saneas** (nutrición) · **Pordondevoy**
(pordondevoy-saneas.vercel.app) · **laOra** (relojes, muy pronto) ·
**CasActiva** (muy pronto).

---

## 2. Modelo de WEB de marketing

### Estructura
```
<marca>/
├── index.html            ← landing completa, un solo archivo
├── <otras>.html          ← una página = un archivo (ej. asesorias.html)
├── instala-app.html      ← guía de instalación de la PWA (iOS/Android)
├── assets/img/           ← imágenes y logos del grupo (app-<marca>.png a 192px)
└── supabase/             ← SQL pegar-y-listo y Edge Functions .ts
```

### Diseño
- **Tipografías**: Manrope (texto) + Quicksand 700 (solo la marca, clase `.saneas`).
- **Paleta en `:root`**: `--teal:#3890A4 · --teal-dark:#1a5a6a · --orange:#F5862E
  · --text:#17343c · --gray:#6b7b80 · --radius:28px` (una marca nueva puede
  cambiar los colores, no la mecánica).
- **La marca registrada siempre**: `Marca<sup>®</sup>` con el ® en superíndice.
- **La palabra Saneas, norma corporativa**: siempre «Saneas» — S mayúscula y el
  resto en minúsculas, fuente Quicksand Bold, y SOLO en teal o en blanco. El
  naranja corporativo se reserva para distinguir o para detalles. Nunca en
  mayúsculas completas (cuidado con `text-transform:uppercase` en títulos) y
  nunca en color oscuro.
- **Secciones alternando** fondo blanco y `#f7f9fa`, sin dos seguidas del mismo
  color. Si al insertar una sección se rompe la alternancia, se corrige.
- **Animaciones**: clase `.reveal` + IntersectionObserver (transición de
  opacidad y translateY). Nada más pesado.
- **CTA principal**: botón naranja a WhatsApp (`api.whatsapp.com/send?phone=...`).
- **Sin exageraciones**: cifras reales, comparativas honestas, letra pequeña
  cuando toca (ej. «no sustituimos a tu médico»).

### El pie del grupo (bloque modelo)
```html
<footer>
  <div class="logo saneas">Marca<sup>®</sup></div>
  <div class="footer-links">
    <a href="https://www.instagram.com/...">Instagram</a>
    <!-- Facebook · YouTube · WhatsApp -->
  </div>
  <div class="fg-title">Grupo <span class="saneas fg-s">Saneas</span></div>
  <div class="fg-grid">
    <a class="fg-card" href="...">
      <img src="/assets/img/app-<marca>.png" alt="APP Marca">
      <span class="tx"><b>APP Marca</b><small>Una línea de qué es</small></span>
    </a>
    <!-- una tarjeta por marca; sin web aún: <a class="fg-card pronto"> +
         <small class="soon">Muy pronto</small> y sin href -->
  </div>
  <p>© <año> Marca® · <qué es> · Todos los derechos reservados</p>
</footer>
```
El CSS de `.fg-*` está en `index.html` y `asesorias.html` de `Saneas26/saneas`:
cópialo tal cual (tarjetas blancas, borde suave, hover que se eleva salvo
`.pronto`, rejilla `flex-wrap` que admite más marcas sin tocar nada).

### Formularios públicos (candidatos, contacto…) — patrón completo
1. **Tabla insert-only** con RLS: `create policy ... for insert to anon with
   check (true);` sin políticas de select/update/delete. Campo **honeypot**
   (ej. `c_web`) que si viene relleno se descarta en el cliente.
2. **El HTML postea por REST** con la clave publishable
   (`fetch(SUPABASE_URL+'/rest/v1/<tabla>', {headers:{apikey,...}})`).
3. **Database Webhook de INSERT** → **Edge Function** (Deno) → **Resend**.
   El correo de destino sale de un secreto (`Deno.env.get('CANDIDATOS_EMAIL')`),
   jamás del código. La función lleva «Enforce JWT verification» desactivado
   (la llama el webhook interno).
   - Si el panel de Supabase no muestra Webhooks (lo han movido a
     Integrations), el equivalente por SQL es un trigger con `pg_net`:
     `net.http_post(url:='https://<proyecto>.supabase.co/functions/v1/<fn>',
     body:=jsonb_build_object('record', to_jsonb(new)))`.
4. Modelos reales para copiar: `supabase/candidatos_asesor.sql` +
   `supabase/avisar-candidato.ts` (repo web) y `supabase/propuestas_tienda.sql`
   + `supabase/avisar-propuesta.ts` (repo app).

### Cloudflare Pages
Conectar el repo, `main` = producción con el dominio `<marca>.es`; cada rama
publica preview automática en `<rama-normalizada>.<proyecto>.pages.dev`.

---

## 3. Modelo de APP de clientes (PWA)

### Estructura
```
<marca>-app/
├── index.html            ← cáscara (~230 líneas): head + pantallas + scripts numerados
├── manifest.json         ← nombre, colores, display standalone
├── icon-192.png / icon-512.png
├── vercel.json           ← Cache-Control: no-store en /, *.html, /js/*, /css/*, sw.js
├── css/                  ← base.css (reset+variables) · app.css · extras por área
├── js/                   ← módulos CLÁSICOS numerados (ver abajo)
├── panel.html            ← panel de administración de Oscar (si la marca lo necesita)
└── supabase/             ← SQL pegar-y-listo y Edge Functions .ts
```

### La arquitectura de módulos (lo más importante)
**Scripts clásicos numerados que comparten ámbito global. Sin ES modules, sin
imports, sin build.** El número marca el orden de carga en `index.html` y ese
orden es sagrado: un módulo puede usar lo que definieron los anteriores.

Los 22 de Saneas como referencia (una marca nueva tendrá menos al empezar):
```
01-config.js      APP_VERSION, cliente Supabase, flags de plan
02-util.js        esc(), toast(), fmt(), helpers compartidos
03-auth.js        login OTP por email (código de 8 dígitos, sin contraseñas)
04-bloqueo.js     pantalla de acceso en pausa (renovación caducada)
05-sesion.js      sesión, push, service worker de notificaciones
06-objetivos.js   cálculos de negocio (calorías, macros)
07-inicio.js      pantalla principal narrativa (misión, capítulos, mapa)
08-social.js      compartir evolución, pizarra
09-dieta.js       dieta + lista de la compra + PDF
10-detalle.js     overlay #detail (abrirDetalle/cerrarDetalle) + FAQ
11-registro.js    formulario semanal con precarga de lo guardado
12-extras-inicio.js  repintado periódico (setInterval 800ms de pintar*())
13-registro-envio.js envío/corrección del registro
14-nav.js         navegación entre pantallas (go())
15-gym.js         entrenamiento
16-pagos.js       pagos y tarifas
17-mas.js         tienda/recetas/opinión/propuestas
18-facturas.js    descarga de facturas
19-arranque.js    boot: sesión → carga → splash → main
20-miplan.js      genScript() (carga perezosa de html2canvas/jsPDF) + plan PDF
21-diario.js      diario de comidas + escáner de códigos (ZXing perezoso)
22-recarga.js     recarga automática al volver (VA DE SERIE EN TODA APP NUEVA)
```

### Convenciones que no se negocian
- **La app NUNCA gira**: solo vertical, fijado por Oscar. `manifest.json` con
  `"orientation":"portrait"` + guardián `#rotateGuard` con
  `@media (orientation:landscape) and (max-height:520px)` (por altura, para
  cubrir también los iPhone grandes sin bloquear el escritorio). Esto no se
  quita en ninguna actualización futura.
- **Versión**: `APP_VERSION = '<Marca>26 vX.Y'` en 01-config + pintor en el
  pie de la app. Cada release sube la versión Y el `?v=` del módulo tocado en
  `index.html` (aunque con `no-store` es redundante, deja rastro).
- **Overlay único** `#detail` para fichas y formularios: `abrirDetalle(titulo,
  html)` / `cerrarDetalle()`. Los formularios de la app se montan ahí.
- **Envolver, no editar**: para extender una función de otro módulo,
  `const _orig=fn; fn=function(){ ...; return _orig.apply(this,arguments); }`
  (así se encadenó `cerrarDetalle`→parar escáner y
  `cargarEstadoRegistro`→foto del formulario).
- **Nada de `await` en la ruta de render del panel**: placeholder + relleno
  asíncrono con `setTimeout(0)` y reintento corto.
- **Escapar siempre** lo que viene de la base con `esc()` antes de inyectarlo
  en HTML.
- **Librerías pesadas siempre perezosas** (`genScript()` al pulsar el botón):
  html2canvas, jsPDF, ZXing. Nunca en el arranque.
- **`22-recarga.js` de serie**: al volver la PWA tras ≥10 min en segundo
  plano, `location.reload()` — salvo overlay abierto, campo con foco,
  formulario editado respecto a su precarga, o audio/vídeo sonando. Es la
  garantía de que ningún cliente se queda semanas con una versión vieja.

### Supabase (seguridad)
- **RLS deny-all por defecto.** Lo que el cliente lee de lo suyo:
  `using (cliente_id = auth.uid())`. Formularios públicos: insert-only.
- **El panel de Oscar** habla solo por **RPCs `security definer`** con guardia
  `es_admin()` al principio. Probarlas desde el SQL Editor dice «no
  autorizado» A PROPÓSITO; se prueban desde el panel.
- **Correos**: tabla → webhook INSERT → Edge Function → Resend, destino en
  secreto. Igual que en la web.
- **PDF con identidad**: cabecera `Marca<span style="vertical-align:super">®</span>`,
  nombre del cliente, fecha, e ID de documento
  `XX-<6 del uuid>-<AAMMDDHHMM>` (rastreable sin base de datos).

---

## 4. Cómo trabaja develosenior (método verificado)

1. **Ramas**: una rama `claude/...` por encargo. Si su PR ya se fusionó, la
   rama se reinicia desde main: `git checkout -B <rama> origin/main`.
2. **Push a través del proxy de la sesión**: `--force-with-lease` a secas
   falla («stale info»); usar el sha explícito:
   `--force-with-lease=<rama>:$(git ls-remote origin <rama> | cut -f1)`.
3. **Ediciones quirúrgicas** con python: `assert t.count(ancla)==1` antes de
   cada `replace`. Si el ancla no es única, el script revienta y no rompe nada.
4. **`node --check`** sobre cada `.js` tocado antes de ningún commit.
5. **Prueba en navegador real**: playwright-core + Chromium preinstalado
   (`/opt/pw-browsers/chromium`), con stubs de Supabase/CDN por
   `addInitScript` + `route()`. Capturas al chat con los casos que importan
   (el vacío, el error, el éxito).
6. **Antes de fusionar**: `git fetch origin main` +
   `git merge-base --is-ancestor origin/main <rama>` — Oscar edita a veces
   desde github.dev y main puede haber avanzado.
7. **Merge por squash** desde la herramienta de GitHub, nunca push directo a main.

---

## 5. Checklist de arranque de una marca nueva

1. Logos de Oscar: cuadrado de la app (a 192px PNG) y marca denominativa.
2. Repos `Saneas26/<marca>` y `Saneas26/<marca>-app` (desde los de Saneas como
   plantilla, quitando lo específico de nutrición).
3. Proyecto Supabase de la marca: auth por email OTP, tablas mínimas, RLS
   deny-all, secretos `RESEND_API_KEY` + correo destino.
4. Resend: dominio `<marca>.es` verificado, remitente `app@<marca>.es`.
5. Vercel: repo `-app`, dominio `app.<marca>.es`, `vercel.json` con no-store.
6. Cloudflare Pages: repo web, dominio `<marca>.es`.
7. App mínima viable: 01-config (nueva URL/clave/APP_VERSION), 02-util,
   03-auth, 14-nav, 19-arranque, 22-recarga + las pantallas del negocio.
8. Web: index.html con la paleta de la marca, secciones alternadas, CTA
   WhatsApp, pie del grupo completo.
9. **Actualizar el pie de TODAS las webs del grupo** con la tarjeta nueva
   (quitar el «Muy pronto» si ya tiene web).
10. Ciclo completo de estreno: rama → preview → capturas → «fusiona» de Oscar.

---

## 6. Lo que NO se hace

- Frameworks, bundlers, TypeScript en cliente, ES modules. No.
- Service workers a mano más allá del de notificaciones push. La frescura la
  dan `no-store` + `22-recarga.js`, no un SW de caché.
- Correos, claves privadas o datos personales en código o en commits
  (los repos son públicos).
- Tocar CAT_Tienda u otros catálogos maestros desde flujos de clientes: los
  clientes proponen en tablas de propuestas; Oscar aprueba a mano.
- Updates masivos sobre histórico contable.
- Fusionar a main sin el «fusiona» explícito de Oscar.
- Dar nada por desplegado sin verificarlo (preview, captura, o curl).
