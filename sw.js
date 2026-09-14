const CACHE='depenses-dauphine-v3-20260914';
const ASSETS=['./?v=3','./index.html','./styles.css?v=3','./app.js?v=3','./manifest.webmanifest?v=3','./dauphine-icon-180.png?v=3','./dauphine-icon-192.png?v=3','./dauphine-icon-512.png?v=3'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))})
