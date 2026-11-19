/* ===== Mangalam Motor Car Bazar - CMS runtime (har page par script.js se pehle chalta hai) ===== */
(function(w){
var d=document,LS=null;try{LS=w.localStorage}catch(e){}
var path=location.pathname.replace(/\\/g,'/'),ROOT='';
var pg=(path.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
function ls(k){try{return LS.getItem(k)}catch(e){return null}}
function adm(){return +ls('mm_admin')>Date.now()}
var ed=/[?&]edit=1/.test(location.search)&&w.parent!==w&&adm();
w.__CMS_EDIT=ed;w.CMS_ROOT=ROOT;w.CMS_PAGE=pg;
function getJSON(u){try{var x=new XMLHttpRequest();x.open('GET',ROOT+u+'?t='+Math.floor(Date.now()/60000),false);x.send();if(x.status==200||(x.status==0&&x.responseText))return JSON.parse(x.responseText)}catch(e){}return null}
function digits(s){return String(s||'').replace(/\D/g,'')}
function isAbs(u){return /^(data:|https?:|\/|blob:)/.test(u)}

/* ---- settings ---- */
var S=null;
if(adm()){try{S=JSON.parse(ls('mm_settings')||'null')}catch(e){}}
if(!S)S=getJSON('content/settings.json')||{};
w.CMS_SETTINGS=S;

/* ---- page override (admin ne edit kiya ho to) ---- */
var root=d.querySelector('main'),j=null;
if(adm()){try{j=JSON.parse(ls('mmc_p_'+pg)||'null')}catch(e){}}
if(!j)j=getJSON('content/'+pg+'.json');
if(j&&j.html&&root)root.innerHTML=j.html;

/* ---- site config for script.js (WhatsApp number) ---- */
var wa=digits(S.whatsapp);if(wa&&wa.length==10)wa='91'+wa;
var p1=digits(S.phone).slice(-10);
w.CMS_SITE={whatsapp:wa||'',phone:p1||'',email:S.email||''};

/* ---- live settings apply (edit mode me nahi, taaki page me original values hi save hon) ---- */
function applySettings(){
  var P=[];
  function add(a,b){if(b&&b!==a)P.push([a,b])}
  /* order matters: pehle display, phir wa.me, phir baaki phone */
  if(p1&&p1.length==10)add('+91 70683 06702','+91 '+p1.slice(0,5)+' '+p1.slice(5));
  if(wa)add('wa.me/917068306702','wa.me/'+wa);
  add('7068306702',p1);
  add('ravirairavi2026@gmail.com',(S.email||'').trim());
  add('NH28, Nedula Chauraha, Khalilabad, Sant Kabir Nagar, Uttar Pradesh 272175',(S.address||'').trim());
  if(P.length){
    var rep=function(s){for(var i=0;i<P.length;i++)s=s.split(P[i][0]).join(P[i][1]);return s};
    var tw=d.createTreeWalker(d.body,4,null),n,arr=[];
    while((n=tw.nextNode())){var t=n.parentNode&&n.parentNode.nodeName;if(t=='SCRIPT'||t=='STYLE')continue;arr.push(n)}
    arr.forEach(function(n){var v=n.nodeValue,r=rep(v);if(r!==v)n.nodeValue=r});
    [].forEach.call(d.querySelectorAll('[href],[title],[aria-label],[alt]'),function(e){['href','title','aria-label','alt'].forEach(function(a){var v=e.getAttribute(a);if(v){var r=rep(v);if(r!==v)e.setAttribute(a,r)}})});
  }
  /* home hero slideshow images */
  var hs=S.hero||[];
  [].forEach.call(d.querySelectorAll('.hero-slide'),function(img,i){var u=(hs[i]||'').trim();if(u)img.src=isAbs(u)?u:ROOT+u});
}
if(!ed)applySettings();

/* ---- edit-mode helpers / header + mobile Login label ---- */
function ld(src,cb){var s=d.createElement('script');s.src=ROOT+src;s.onload=cb;d.body.appendChild(s)}
function ready(){
  if(ed){
    var st=d.createElement('style');st.className='cms-ui';st.textContent='.reveal{opacity:1!important;transform:none!important}#mobile-nav,[aria-label="Quick contact"],#lightbox{display:none!important}main header.sticky{top:52px!important}';d.head.appendChild(st);
    ld('cms-core.js',function(){ld('editor.js')});
  }else if(adm()){
    [].forEach.call(d.querySelectorAll('.cms-hdr-login .cms-lbl'),function(e){e.textContent='Admin'});
    [].forEach.call(d.querySelectorAll('.cms-nav-login .cms-lbl'),function(e){e.textContent='Admin'});
    [].forEach.call(d.querySelectorAll('.cms-hdr-login,.cms-nav-login'),function(e){e.setAttribute('aria-label','Admin Panel')});
  }
}
if(d.readyState=='loading')d.addEventListener('DOMContentLoaded',ready);else ready();
})(window);
