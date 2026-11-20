"use strict";
/* V3.3.0 UI02 V05 - ICON V02 only: refresh PWA icon and favicon caches. */
const PREFIX='hsgd-static:'+self.registration.scope+':';
const CACHE=PREFIX+'3.3.0-ui02-v05-icon02';
const ASSETS=['./','./index.html','./styles.css?v=3.3.0','./compact.css?v=3.3.0-ui01','./ui02.css?v=3.3.0-ui02-v05','./app.js?v=3.3.0','./ui02.js?v=3.3.0-ui02-v05','./sync.js?v=3.3.0','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-family-192-v2.png','./icons/icon-family-512-v2.png','./icons/icon-maskable-512-v2.png','./icons/apple-touch-icon-v2.png','./icons/favicon-32-v2.png','./icons/favicon-48-v2.png'];
const URLS=new Set(ASSETS.map(x=>new URL(x,self.registration.scope).href));
const ENTRY=new URL('./index.html',self.registration.scope).href;
const ROOT=new URL('./',self.registration.scope).href;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...URLS].map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  // Network-first for this application's entry pages, including query-string variants.
  // Never cache a newly fetched HTML under the older version: offline fallback stays coherent.
  const u=new URL(r.url);u.search='';u.hash='';
  if(r.mode==='navigate'&&(u.href===ROOT||u.href===ENTRY)){
    e.respondWith((async()=>{try{const res=await fetch(r,{cache:'no-store'});if(res.ok)return res;const c=await caches.open(CACHE);return (await c.match(ENTRY))||res;}catch(err){const c=await caches.open(CACHE);return (await c.match(ENTRY))||Response.error();}})());return;
  }
  if(!URLS.has(r.url))return;
  e.respondWith(caches.open(CACHE).then(async c=>{const saved=await c.match(r);if(saved)return saved;const res=await fetch(r);if(res.ok)await c.put(r,res.clone());return res;}));
});
