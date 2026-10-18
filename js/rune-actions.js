(()=>{
'use strict';
const ICONS={del:'assets/runes/delete.png',up:'assets/runes/up.png',down:'assets/runes/down.png',activate:'assets/runes/activate.png'};
function classify(b){
 if(b.classList.contains('rune-nav')||b.classList.contains('rune-action-icon')) return null;
 const raw=(b.textContent||'').trim(), title=(b.getAttribute('title')||'').toLowerCase(), label=(b.getAttribute('aria-label')||'').toLowerCase();
 if(b.hasAttribute('data-del'))return 'del';
 if(b.hasAttribute('data-up'))return 'up';
 if(b.hasAttribute('data-down'))return 'down';
 if(/🗑/.test(raw)||/^(löschen|loeschen|entfernen)$/i.test(raw)||(/löschen|loeschen|entfernen/.test(title)&&(/🗑/.test(raw)||!raw)))return 'del';
 if(/^[↑▲⬆]$/.test(raw))return 'up';
 if(/^[↓▼⬇]$/.test(raw))return 'down';
 if(b.classList.contains('kampagne-aktivieren') || (/kampagne aktivieren/i.test(title)&&/^[●✓✔]$/.test(raw)))return 'activate';
 return null;
}
const LABEL={del:'Löschen',up:'Nach oben',down:'Nach unten',activate:'Kampagne aktivieren'};
function enhance(root){
 const buttons=[];if(root.nodeType===1&&root.matches('button'))buttons.push(root);
 if(root.querySelectorAll)buttons.push(...root.querySelectorAll('button'));
 for(const b of buttons){
  const type=classify(b);if(!type)continue;
  b.classList.add('rune-action-icon','icon-'+type);
  if(!b.getAttribute('aria-label'))b.setAttribute('aria-label',b.title||LABEL[type]);
  if(!b.title)b.title=LABEL[type];
  const img=document.createElement('img');img.src=ICONS[type];img.alt='';img.setAttribute('aria-hidden','true');
  /* Content update does not change the button, its classes, size or click handlers. */
  b.replaceChildren(img);
 }
}
function init(){
 enhance(document.body);
 /* Watch only newly added DOM, not characterData, to avoid endless observer updates. */
 new MutationObserver(records=>{for(const r of records){for(const node of r.addedNodes){
  if(node.nodeType===1 && !node.closest?.('button.rune-action-icon'))enhance(node);
 }}}).observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
