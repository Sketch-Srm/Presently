self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Required for Chrome to trigger PWA install prompt
self.addEventListener('fetch', (e) => {
  // Pass through all requests normally
});
