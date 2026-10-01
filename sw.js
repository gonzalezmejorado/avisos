// Recibe los avisos aunque la app esté cerrada. iOS exige mostrar SIEMPRE una notificación por cada aviso:
// si no, retira el permiso.
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { cuerpo: e.data ? e.data.text() : "" }; }
  const titulo = d.titulo || "Claude Code";
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.cuerpo || "necesito de tu presencia",
    icon: "icono-192.png",
    tag: d.tag || undefined,
    renotify: !!d.tag,
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window" }).then((ws) => ws.length ? ws[0].focus() : clients.openWindow("./")));
});
