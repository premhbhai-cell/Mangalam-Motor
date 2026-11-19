/* ===== Mangalam Motor Car Bazar - CMS core: login, GitHub save, media, settings ===== */
(function(w){
var LS=localStorage,OKS=[3472638115676760],ROOT=w.CMS_ROOT||'';
function hs(s){var a=0xdeadbeef,b=0x41c6ce57;for(var i=0,c;i<s.length;i++){c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return 4294967296*(2097151&b)+(a>>>0)}
var CMS=w.CMS={prev:{},ROOT:ROOT,
abs:function(u){return /^(data:|https?:|\/|blob:)/.test(u)?u:ROOT+u},
admin:function(){return +LS.getItem('mm_admin')>Date.now()},
cfg:function(){try{var c=JSON.parse(LS.getItem('mm_gh')||'null');return c&&c.token&&c.repo?c:null}catch(e){return null}},
gh:function(path,opt){var c=CMS.cfg();if(!c)return Promise.reject({error:'GitHub connect nahi hai'});return fetch('https://api.github.com/repos/'+c.repo+(path?'/'+path:''),Object.assign({},opt,{headers:{Authorization:'Bearer '+c.token,Accept:'application/vnd.github+json'}})).then(function(r){return r.status==404?null:r.json().then(function(j){if(!r.ok)throw{error:j.message||('GitHub error '+r.status)};return j})})},
put:function(path,text,msg,b64){var c=CMS.cfg();return CMS.gh('contents/'+path+'?ref='+c.branch).then(function(m){return CMS.gh('contents/'+path,{method:'PUT',body:JSON.stringify({message:msg,content:b64||btoa(unescape(encodeURIComponent(text))),branch:c.branch,sha:m?m.sha:undefined})})})},
del:function(path){var c=CMS.cfg();if(!c)return Promise.resolve();return CMS.gh('contents/'+path+'?ref='+c.branch).then(function(m){return m?CMS.gh('contents/'+path,{method:'DELETE',body:JSON.stringify({message:'cms: delete '+path,sha:m.sha,branch:c.branch})}):0})},
saveSettings:function(S){try{LS.setItem('mm_settings',JSON.stringify(S))}catch(e){return Promise.reject({error:'Browser storage full hai. GitHub connect karein ya chhoti image use karein.'})}if(!CMS.cfg())return Promise.resolve({ok:1,local:1});return CMS.put('content/settings.json',JSON.stringify(S),'cms: settings').then(function(){return{ok:1}})},
save:function(p,html,loc){try{LS.setItem('mmc_p_'+p,JSON.stringify({html:loc||html,updated:Date.now()}))}catch(e){return Promise.reject({error:'Browser storage full hai. GitHub connect karein (Settings).'})}if(!CMS.cfg())return Promise.resolve({ok:1,local:1});return CMS.put('content/'+p+'.json',JSON.stringify({html:html,updated:Date.now()}),'cms: edit '+p).then(function(){return{ok:1}})},
revert:function(p){LS.removeItem('mmc_p_'+p);return CMS.del('content/'+p+'.json').then(function(){return{ok:1}})},
media:function(){return fetch(ROOT+'media.json').then(function(r){return r.json()}).catch(function(){return[]}).then(function(st){var base=st.map(function(u){return{url:u,up:false}});if(!CMS.cfg())return base;return CMS.gh('contents/images/uploads?ref='+CMS.cfg().branch).then(function(l){return(l||[]).filter(function(x){return x.type=='file'&&x.name!='.gitkeep'}).map(function(x){return{url:'images/uploads/'+x.name,up:true}}).concat(base)}).catch(function(){return base})})},
upload:function(name,data){if(!CMS.cfg())return Promise.resolve({url:data});var n=Date.now()+'-'+String(name||'img').replace(/\.[^.]*$/,'').replace(/[^a-z0-9]/gi,'-').slice(0,30)+'.jpg',u='images/uploads/'+n;return CMS.put(u,null,'cms: upload '+n,data.split(',')[1]).then(function(){CMS.prev[u]=data;return{url:u}})},
pagesEdited:function(){var o=[];for(var i=0;i<LS.length;i++){var k=LS.key(i);if(k.indexOf('mmc_p_')==0)try{o.push({page:k.slice(6),updated:JSON.parse(LS.getItem(k)).updated})}catch(e){}}return o}};
w.api=function(u,o){o=o||{};var m=o.method||'GET',url=new URL(u,'http://x.invalid/'),r=url.pathname.replace('/api/',''),p=url.searchParams.get('p'),b={};try{b=JSON.parse(o.body||'{}')}catch(e){}
var R=function(v){return Promise.resolve(v)},E=function(t){return Promise.reject({error:t})};
if(r=='me')return CMS.admin()?R({ok:1}):E('login');
if(r=='login'){if(OKS.indexOf(hs(String(b.email||'').trim().toLowerCase()+'|'+String(b.password||'').trim()))>-1){LS.setItem('mm_admin',Date.now()+6048e5);return R({ok:1})}return E('Email ya password galat hai.')}
if(r=='logout'){LS.removeItem('mm_admin');return R({ok:1})}
if(!CMS.admin())return E('Login required');
if(r=='page'&&m=='PUT')return CMS.save(p,b.html,b.local);
if(r=='page'&&m=='DELETE')return CMS.revert(p);
if(r=='pages')return R(CMS.pagesEdited());
if(r=='media'&&m=='GET')return CMS.media();
if(r=='media'&&m=='DELETE')return CMS.del('images/uploads/'+url.searchParams.get('f')).then(function(){return{ok:1}});
if(r=='upload')return CMS.upload(b.name,b.data);return E('?')}
})(window);
