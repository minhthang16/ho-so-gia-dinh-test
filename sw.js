"use strict";
const PREFIX='hsgd-static:'+self.registration.scope+':';
const CACHE=PREFIX+'3.1.0';
const ASSETS=['./','./index.html','./styles.css?v=3.1.0','./app.js?v=3.1.0','./sync.js?v=3.1.0','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const URLS=new Set(ASSETS.map(x=>new URL(x,self.registration.scope).href));
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!URLS.has(r.url))return;e.respondWith(caches.open(CACHE).then(async c=>{const saved=await c.match(r);if(saved)return saved;const res=await fetch(r);if(res.ok)await c.put(r,res.clone());return res;}));});
