if(!self.define){let e,s={};const r=(r,n)=>(r=new URL(r+".js",n).href,s[r]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=s,document.head.appendChild(e)}else e=r,importScripts(r),s()})).then((()=>{let e=s[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(n,o)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let l={};const u=e=>r(e,i),t={module:{uri:i},exports:l,require:u};s[i]=Promise.all(n.map((e=>t[e]||u(e)))).then((e=>(o(...e),l)))}}define(["./workbox-5b385ed2"],(function(e){"use strict";e.setCacheNameDetails({prefix:"video-capture-demo"}),self.addEventListener("message",(e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()})),e.precacheAndRoute([{url:"css/app.a53354b1.css",revision:null},{url:"css/camera.5184ed1e.css",revision:null},{url:"css/chunk-vendors.092f9b11.css",revision:null},{url:"css/form.34d93a88.css",revision:null},{url:"fonts/bootstrap-icons.02685dab.woff2",revision:null},{url:"fonts/bootstrap-icons.8463cb1e.woff",revision:null},{url:"index.html",revision:"67264df16ee37be3e09560fb182d2679"},{url:"js/156.006b2221.js",revision:null},{url:"js/about.2e07b2e1.js",revision:null},{url:"js/app.a4579697.js",revision:null},{url:"js/chunk-vendors.2935fd58.js",revision:null},{url:"js/form.ae2935b6.js",revision:null},{url:"manifest.json",revision:"982882c5d9a7ed09f1956d082ebdab13"},{url:"robots.txt",revision:"b6216d61c03e6ce0c9aea6ca7808f7ca"}],{})}));
//# sourceMappingURL=service-worker.js.map
