// Historial de avisos en el propio iPhone (IndexedDB). Lo comparten sw.js y la página.
// Guarda solo los últimos MAX_AVISOS; los más viejos se borran solos.
const MAX_AVISOS = 500;

function abrirHistorial() {
  return new Promise((ok, mal) => {
    const r = indexedDB.open("avisos", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("historial", { keyPath: "id", autoIncrement: true });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => mal(r.error);
  });
}

function terminar(tx) {
  return new Promise((ok, mal) => { tx.oncomplete = ok; tx.onerror = () => mal(tx.error); tx.onabort = () => mal(tx.error); });
}

async function guardarAviso(aviso) {
  const db = await abrirHistorial();
  const tx = db.transaction("historial", "readwrite");
  const st = tx.objectStore("historial");
  st.add(aviso);
  const cuenta = st.count();
  cuenta.onsuccess = () => {
    let sobran = cuenta.result - MAX_AVISOS;
    if (sobran <= 0) return;
    st.openCursor().onsuccess = (e) => {
      const c = e.target.result;
      if (c && sobran-- > 0) { c.delete(); c.continue(); }
    };
  };
  await terminar(tx);
  db.close();
}

async function leerAvisos() {
  const db = await abrirHistorial();
  const tx = db.transaction("historial", "readonly");
  const r = tx.objectStore("historial").getAll();
  await terminar(tx);
  db.close();
  return r.result.reverse();
}

async function borrarAvisos() {
  const db = await abrirHistorial();
  const tx = db.transaction("historial", "readwrite");
  tx.objectStore("historial").clear();
  await terminar(tx);
  db.close();
}
