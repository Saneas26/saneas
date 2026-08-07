/* Telemetría anónima del Grupo Saneas · un aviso al día por dispositivo.
   No se guarda ningún dato personal: solo un identificador aleatorio que vive
   en este navegador, la plataforma (iPhone/Android) y el país, que deduce el
   servidor de la conexión sin guardar la IP. El recuento no es público: solo
   se ve desde el panel privado de Saneas.
   Además, aquí se cuenta el clic en "Instala la app Saneas" (app saneas_instalar)
   para medir el embudo web → instalación. Mismo anonimato: solo el identificador.
   Documentación: github.com/Saneas26/pordondevoy → TELEMETRIA.md */
(function () {
  var APP = "saneas_web";
  var URL_PING = "https://pordondevoy-saneas.vercel.app/api/ping";

  var almacen;
  try { almacen = window.localStorage; } catch (e) { return; }   // navegación privada: no insistimos
  if (!almacen || !window.fetch) return;

  var instalada = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
    || navigator.standalone === true;

  var id = almacen.getItem("gs-dispositivo");
  if (!id) {
    id = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 3 | 8)).toString(16);
        });
    almacen.setItem("gs-dispositivo", id);
  }

  var plataforma = /iphone|ipad|ipod/i.test(navigator.userAgent) ? "iPhone"
    : (/android/i.test(navigator.userAgent) ? "Android" : "Otro");

  function ping(app, alGuardar) {
    fetch(URL_PING, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,   // el aviso llega aunque la página navegue justo después
      body: JSON.stringify({
        app: app,
        dispositivo: id,
        plataforma: plataforma,
        instalada: instalada
      })
    }).then(function (r) { if (r.ok && alGuardar) alGuardar(); })
      .catch(function () {});
  }

  // 1) Visita de la web: una vez al día; de nuevo ese día si pasa a instalada.
  var marca = new Date().toISOString().slice(0, 10) + (instalada ? "·i" : "·n");
  if (almacen.getItem("gs-ping") !== marca) {
    ping(APP, function () { almacen.setItem("gs-ping", marca); });
  }

  // 2) Clic en "Instala la app Saneas": cubre el CTA de la portada y la tarjeta
  //    del pie (→ /instala-app) y el botón y enlaces de instala-app
  //    (→ app.saneas.es). Se avisa en cada clic; el servidor ya deja como mucho
  //    un apunte por dispositivo y día. keepalive: no frena la navegación.
  document.addEventListener("click", function (ev) {
    var el = ev.target;
    while (el && el.getAttribute && !(el.tagName === "A" && el.getAttribute("href"))) {
      el = el.parentNode;
    }
    if (!el || !el.getAttribute) return;
    var h = el.getAttribute("href");
    if (h.indexOf("/instala-app") !== 0 && h.indexOf("https://app.saneas.es") !== 0) return;
    ping("saneas_instalar");
  }, true);
})();
