/* ===== Visual page editor (admin ke iframe me chalta hai) ===== */
(function(){
var d=document,pg=window.CMS_PAGE,R=window.CMS_ROOT||'',root=d.querySelector('main'),sel=null,img=null,dirty=0;
if(!root)return;
var SKIP={SCRIPT:1,STYLE:1,SVG:1,PATH:1,IFRAME:1,VIDEO:1,SELECT:1,OPTION:1,TEXTAREA:1,INPUT:1,NOSCRIPT:1};
var st=d.createElement('style');st.className='cms-ui';
st.textContent='body{padding-top:52px!important}[contenteditable]{cursor:text}[contenteditable]:hover{outline:1px dashed #2271b1}[contenteditable]:focus{outline:2px solid #2271b1}.cms-sel{outline:3px solid #d63638!important;outline-offset:-3px}#cb{position:fixed;top:0;left:0;right:0;height:52px;background:#1d2327;display:flex;gap:6px;align-items:center;padding:0 10px;z-index:2147483600;font:13px system-ui;overflow-x:auto;white-space:nowrap}#cb button{background:#2c3338;color:#fff;border:1px solid #50575e;border-radius:4px;padding:8px 11px;cursor:pointer;font:13px system-ui;flex:none}#cb button:hover{background:#2271b1}#cb .s{background:#00a32a;border-color:#00a32a}#cb .x{background:#d63638;border-color:#d63638}#cb span{color:#a7aaad;margin-left:6px;flex:none}#cm{position:fixed;inset:0;background:#000b;z-index:2147483601;display:none;font:14px system-ui}#cm>div{background:#fff;margin:4vh auto;width:min(900px,94vw);height:90vh;border-radius:6px;display:flex;flex-direction:column;color:#111}#cm header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #ddd}#cm .gr{flex:1;overflow:auto;padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;align-content:start}#cm .gr img{width:100%;height:90px;object-fit:cover;cursor:pointer;border:2px solid transparent;border-radius:4px}#cm .gr img:hover{border-color:#2271b1}';
d.head.appendChild(st);
var bar=d.createElement('div');bar.id='cb';bar.className='cms-ui';
bar.innerHTML='<button class="s" data-a="save">💾 Save</button><button data-a="parent">⤴ Parent</button><button data-a="up">⬆</button><button data-a="down">⬇</button><button data-a="dup">⧉ Duplicate</button><button class="x" data-a="del">🗑 Delete</button><button data-a="addt">➕ Text</button><button data-a="addi">➕ Image</button><button data-a="img">🖼 Change Image</button><button data-a="link">🔗 Link</button><button data-a="rev">↺ Original</button><button data-a="exit">✕ Exit</button><span id="cs">Text par click karke likhein · kisi cheez par click = select (Delete/Duplicate/Move) · bada block chunne ke liye ⤴ Parent</span>';
d.body.appendChild(bar);
var m=d.createElement('div');m.id='cm';m.className='cms-ui';
m.innerHTML='<div><header><b>Media Library — image chunein</b><span><label style="cursor:pointer;background:#2271b1;color:#fff;padding:7px 12px;border-radius:3px">⬆ Nayi image upload<input type="file" accept="image/*" hidden id="cf"></label> <button id="cx" style="padding:7px 12px">Close</button></span></header><div class="gr" id="cg"></div></div>';
d.body.appendChild(m);
function S(t){d.getElementById('cs').textContent=t}
function shrink(f,cb){var i=new Image(),u=URL.createObjectURL(f);i.onload=function(){var s=Math.min(1,1600/Math.max(i.width,i.height)),c=d.createElement('canvas');c.width=i.width*s;c.height=i.height*s;c.getContext('2d').drawImage(i,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.85))};i.onerror=function(){alert('Image padh nahi payi')};i.src=u}
/* text elements -> editable */
function mark(el){[].forEach.call(el.querySelectorAll('*'),function(e){
  if(e.closest('.cms-ui')||SKIP[e.tagName.toUpperCase()]||e.closest('svg,iframe,select'))return;
  for(var k=e.firstChild;k;k=k.nextSibling){if(k.nodeType==3&&k.nodeValue.trim()){e.setAttribute('contenteditable','true');break}}})}
mark(root);
function imgOf(el){if(!el)return null;if(el.tagName=='IMG')return el;var i=el.querySelector&&el.querySelector('img');if(i)return i;for(var e=el,n=0;e&&e!==root&&n<5;e=e.parentElement,n++){if(/url\(/.test(e.style.backgroundImage||''))return e}return null}
function pick(cb){m.style.display='block';var g=d.getElementById('cg');g.innerHTML='Loading...';api('/api/media').then(function(l){g.innerHTML='';l.forEach(function(x){var i=d.createElement('img');i.loading='lazy';i.src=CMS.prev[x.url]||CMS.abs(x.url);i.onclick=function(){m.style.display='none';cb(x.url)};g.appendChild(i)})})}
function select(e){if(sel)sel.classList.remove('cms-sel');sel=e;if(e)e.classList.add('cms-sel');img=imgOf(e)}
/* editor ke andar site ke apne click/submit (WhatsApp, lightbox, search) na chalen */
d.addEventListener('click',function(e){if(e.target.closest('.cms-ui'))return;
  if(root.contains(e.target))e.stopPropagation();
  if(e.target.closest('a,summary,button,form,label'))e.preventDefault();
  var t=e.target.closest('svg')||e.target;if(!root.contains(t)||t===root){select(null);return}
  select(t);dirty=1},true);
d.addEventListener('keydown',function(e){if(e.key===' '&&e.target.closest&&e.target.closest('summary,button')){e.preventDefault();d.execCommand('insertText',false,' ')}},true);
d.addEventListener('submit',function(e){e.preventDefault();e.stopPropagation()},true);
d.addEventListener('input',function(){dirty=1},true);
function clean(keep){var c=root.cloneNode(true);
  [].forEach.call(c.querySelectorAll('[data-real]'),function(e){var u=e.getAttribute('data-real');if(!keep){if(e.tagName=='IMG')e.src=u;else e.style.backgroundImage="url('"+u+"')"}e.removeAttribute('data-real')});
  [].forEach.call(c.querySelectorAll('script,.cms-ui'),function(e){e.remove()});
  [].forEach.call(c.querySelectorAll('[contenteditable]'),function(e){e.removeAttribute('contenteditable')});
  [].forEach.call(c.querySelectorAll('.cms-sel'),function(e){e.classList.remove('cms-sel');if(!e.getAttribute('class'))e.removeAttribute('class')});
  [].forEach.call(c.querySelectorAll('.img-missing'),function(e){e.classList.remove('img-missing')});
  [].forEach.call(c.querySelectorAll('img[style*="visibility"]'),function(e){e.style.visibility='';if(!e.getAttribute('style'))e.removeAttribute('style')});
  [].forEach.call(c.querySelectorAll('.hero-slide'),function(e,i){e.setAttribute('style',i?'opacity:0;transform:scale(1)':'opacity:1;transform:scale(1.035)')});
  return c.innerHTML}
function setImg(u){if(!img)return;var real=CMS.abs(u),v=CMS.prev[u]||real;img.setAttribute('data-real',real);
  if(img.tagName=='IMG'){img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=v;var pc=img.closest('picture');if(pc)[].forEach.call(pc.querySelectorAll('source'),function(s){s.remove()})}else img.style.backgroundImage="url('"+v+"')";
  dirty=1;S('Image badal gayi — Save dabayein')}
d.getElementById('cx').onclick=function(){m.style.display='none'};
d.getElementById('cf').onchange=function(){var f=this.files[0];if(!f)return;shrink(f,function(data){S('Uploading...');api('/api/upload',{method:'POST',body:JSON.stringify({name:f.name,data:data})}).then(function(j){m.style.display='none';cb2(j.url)}).catch(function(e){alert(e.error||'Upload fail')})})};
var cb2=function(u){setImg(u)};
bar.onclick=function(e){var a=e.target.dataset.a;if(!a)return;
 if(a=='save'){S('Saving...');api('/api/page?p='+pg,{method:'PUT',body:JSON.stringify({html:clean(false),local:clean(true)})}).then(function(){dirty=0;S(CMS.cfg()?'✔ Saved — GitHub par gaya, ~1 minute me live site par dikhega':'✔ Saved (sirf is browser me). Sabko dikhane ke liye Admin → GitHub Settings connect karein')}).catch(function(x){S('Error: '+(x.error||'save nahi hua'))})}
 else if(a=='exit'){if(!dirty||confirm('Unsaved changes hain. Bahar nikle?'))parent.postMessage('cms-exit','*')}
 else if(a=='rev'){if(confirm('Is page ke saare changes hata kar original design wapas laayein?'))api('/api/page?p='+pg,{method:'DELETE'}).then(function(){location.reload()})}
 else if(a=='img'){if(!img)return alert('Pehle kisi image par click karein');cb2=setImg;pick(function(u){setImg(u)})}
 else if(a=='addt'){var p=d.createElement('p');p.setAttribute('contenteditable','true');p.style.cssText='margin:14px auto;max-width:900px;padding:0 16px;font-size:17px;line-height:1.6';p.textContent='Naya text — yahan likhein';(sel||root.lastElementChild).after(p);select(p);dirty=1;S('Text add ho gaya — isme likhein')}
 else if(a=='addi'){pick(function(u){var i=d.createElement('img');i.style.cssText='max-width:100%;height:auto;display:block;margin:14px auto;border-radius:12px';var real=CMS.abs(u);i.src=CMS.prev[u]||real;i.setAttribute('data-real',real);i.alt='';(sel||root.lastElementChild).after(i);select(i);dirty=1;S('Image add ho gayi — Save dabayein')})}
 else if(!sel)alert('Pehle kisi cheez par click karke use select karein');
 else if(a=='parent'){if(sel.parentElement&&sel.parentElement!==root)select(sel.parentElement)}
 else if(a=='dup'){var c=sel.cloneNode(true);c.classList.remove('cms-sel');sel.after(c);dirty=1;S('Copy ban gayi — ab usme text/image badlein')}
 else if(a=='del'){if(confirm('Ye hata dein?')){sel.remove();sel=null;img=null;dirty=1}}
 else if(a=='up'&&sel.previousElementSibling){sel.parentNode.insertBefore(sel,sel.previousElementSibling);dirty=1}
 else if(a=='down'&&sel.nextElementSibling){sel.parentNode.insertBefore(sel.nextElementSibling,sel);dirty=1}
 else if(a=='link'){var l=sel.closest('a')||sel.querySelector('a');if(!l)return alert('Is block me link nahi hai');var v=prompt('Link (URL / cars.html / tel:+91... / https://wa.me/...)',l.getAttribute('href'));if(v!==null){l.setAttribute('href',v);dirty=1}}
};
})();
