
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("warfarin-cache").then(cache => {
      return cache.addAll(["index.html", "style.css", "script.js", "pill-render.js"]);
    })
  );
});
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});
