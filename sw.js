// Recibe los avisos aunque la app esté cerrada. iOS exige mostrar SIEMPRE una notificación por cada aviso:
// si no, retira el permiso. Cada aviso se guarda además en el historial (historial.js).
importScripts("historial.js");

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { cuerpo: e.data ? e.data.text() : "" }; }
  const titulo = d.titulo || "Claude Code";
  const cuerpo = d.cuerpo || "necesito de tu presencia";
  const aviso = { titulo, cuerpo, recibido: Date.now(), enviado: d.enviado || null };
  e.waitUntil(Promise.all([
    self.registration.showNotification(titulo, { body: cuerpo, icon: "icono-192.png", tag: d.tag || undefined, renotify: !!d.tag }),
    // Si el historial fallara, la notificación sale igual.
    guardarAviso(aviso).catch(() => {}).then(() => self.clients.matchAll({ type: "window" }))
      .then((ws) => ws.forEach((w) => w.postMessage("nuevo-aviso"))),
  ]));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window" }).then((ws) => ws.length ? ws[0].focus() : clients.openWindow("./")));
});
