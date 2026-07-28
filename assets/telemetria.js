/* Telemetría anónima del Grupo Saneas · un aviso al día por dispositivo.
   No se guarda ningún dato personal: solo un identificador aleatorio que vive
   en este navegador, la plataforma (iPhone/Android) y el país, que deduce el
   servidor de la conexión sin guardar la IP. El recuento no es público: solo
   se ve desde el panel privado de Saneas.
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

  // Una vez al día; y de nuevo ese día si se pasa de navegador a instalada.
  var marca = new Date().toISOString().slice(0, 10) + (instalada ? "·i" : "·n");
  if (almacen.getItem("gs-ping") === marca) return;

  fetch(URL_PING, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app: APP,
      dispositivo: id,
      plataforma: /iphone|ipad|ipod/i.test(navigator.userAgent) ? "iPhone"
        : (/android/i.test(navigator.userAgent) ? "Android" : "Otro"),
      instalada: instalada
    })
  }).then(function (r) { if (r.ok) almacen.setItem("gs-ping", marca); })
    .catch(function () {});
})();
