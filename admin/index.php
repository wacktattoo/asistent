<?php
declare(strict_types=1);
require __DIR__ . '/_boot.php';
$setup  = !is_setup_done();
$logged = is_logged_in();
$csrf   = $logged ? csrf_token() : '';
?><!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Foxyvision — editor obsahu</title>
<style>
  :root{--paper:#F6F3ED;--ink:#0F0F10;--terracotta:#C45434;--line:rgba(15,15,16,.12);--muted:#6b6459}
  *{box-sizing:border-box}
  body{margin:0;background:var(--paper);color:var(--ink);
    font:15px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    padding:26px clamp(16px,4vw,48px) 130px}
  h1{font-size:clamp(22px,3vw,32px);margin:0 0 6px;letter-spacing:-.02em}
  .lead{color:var(--muted);margin:0 0 24px;max-width:74ch}
  code{background:#fff;padding:2px 6px;border-radius:5px;border:1px solid var(--line)}
  h2{font-size:17px;margin:32px 0 12px}
  .card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;margin-bottom:14px}
  .card h3{margin:0 0 12px;font-size:15px;color:var(--terracotta)}
  label{display:block;font-size:12.5px;font-weight:700;margin:12px 0 5px}
  label span{font-weight:400;color:var(--muted)}
  input,textarea{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:8px;
    font:inherit;background:var(--paper);color:inherit}
  input:focus,textarea:focus{outline:2px solid rgba(196,84,52,.35);outline-offset:1px}
  textarea{min-height:76px;resize:vertical}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .tags,.logos{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}
  .tag,.logo{display:inline-flex;align-items:center;gap:6px;border-radius:999px;
    padding:5px 6px 5px 11px;font-size:13px}
  .tag{background:rgba(196,84,52,.1);border:1px solid rgba(196,84,52,.28)}
  .logo{background:var(--paper);border:1px solid var(--line)}
  .logo img{height:22px;width:auto;border-radius:3px;background:#fff}
  .tag button,.logo button{border:0;background:none;cursor:pointer;color:var(--terracotta);font-size:15px;padding:0 4px}
  .add{display:flex;gap:8px;margin-top:9px;flex-wrap:wrap}
  .add input[type=text]{flex:1;min-width:150px}
  .btn{border:0;border-radius:8px;padding:9px 15px;font:inherit;font-weight:700;
    background:var(--ink);color:var(--paper);cursor:pointer}
  .btn.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
  .btn[disabled]{opacity:.5;cursor:default}
  .bar{position:fixed;left:0;right:0;bottom:0;background:#fff;border-top:1px solid var(--line);
    padding:12px clamp(16px,4vw,48px);display:flex;gap:10px;align-items:center;flex-wrap:wrap;
    box-shadow:0 -8px 24px rgba(15,15,16,.06)}
  .bar .hint{color:var(--muted);font-size:13px;margin-right:auto}
  .ok{color:#2c7a4b;font-weight:700}.err{color:#b3341a;font-weight:700}
  .prev{display:flex;align-items:center;gap:10px;margin-top:8px}
  .prev img{width:120px;height:68px;object-fit:cover;border-radius:8px;border:1px solid var(--line);background:#fff}
  .prev .miss{width:120px;height:68px;border-radius:8px;border:1px dashed #d99;display:grid;
    place-items:center;font-size:11px;color:#b3341a;text-align:center;padding:4px}
  .login{max-width:420px;margin:8vh auto;background:#fff;border:1px solid var(--line);
    border-radius:16px;padding:26px}
  .note{background:#fff6ed;border:1px solid #f0c9a5;border-radius:10px;padding:12px 14px;
    font-size:13.5px;margin:0 0 20px}
</style>
</head>
<body>

<?php if ($setup): ?>
  <div class="login">
    <h1>Nastavení hesla</h1>
    <p class="lead">Editor ještě nemá heslo. Zvol si ho — bez něj by mohl obsah webu měnit kdokoli.</p>
    <label>Nové heslo <span>(aspoň 10 znaků)</span></label>
    <input type="password" id="pw1" autocomplete="new-password" />
    <label>Heslo pro kontrolu</label>
    <input type="password" id="pw2" autocomplete="new-password" />
    <p id="msg" style="min-height:22px;font-size:13.5px"></p>
    <button class="btn" id="doSetup" type="button">Nastavit heslo</button>
  </div>
  <script>
  document.getElementById('doSetup').onclick = function(){
    var a=document.getElementById('pw1').value, b=document.getElementById('pw2').value, m=document.getElementById('msg');
    if(a.length<10){ m.className='err'; m.textContent='Heslo musí mít aspoň 10 znaků.'; return; }
    if(a!==b){ m.className='err'; m.textContent='Hesla se neshodují.'; return; }
    var f=new FormData(); f.append('action','setup'); f.append('password',a);
    fetch('api.php',{method:'POST',body:f}).then(function(r){return r.json()}).then(function(j){
      if(j.ok){ location.reload(); } else { m.className='err'; m.textContent=j.error; }
    }).catch(function(){ m.className='err'; m.textContent='Server neodpověděl.'; });
  };
  </script>

<?php elseif (!$logged): ?>
  <div class="login">
    <h1>Přihlášení</h1>
    <p class="lead">Editor obsahu webu Foxyvision.</p>
    <label>Heslo</label>
    <input type="password" id="pw" autocomplete="current-password" />
    <p id="msg" style="min-height:22px;font-size:13.5px"></p>
    <button class="btn" id="doLogin" type="button">Přihlásit</button>
  </div>
  <script>
  function login(){
    var m=document.getElementById('msg');
    var f=new FormData(); f.append('action','login'); f.append('password',document.getElementById('pw').value);
    fetch('api.php',{method:'POST',body:f}).then(function(r){return r.json()}).then(function(j){
      if(j.ok){ location.reload(); } else { m.className='err'; m.textContent=j.error; }
    }).catch(function(){ m.className='err'; m.textContent='Server neodpověděl.'; });
  }
  document.getElementById('doLogin').onclick=login;
  document.getElementById('pw').addEventListener('keydown',function(e){ if(e.key==='Enter') login(); });
  </script>

<?php else: ?>
  <h1>Editor obsahu</h1>
  <p class="lead">
    Změny se po uložení <strong>okamžitě projeví na webu</strong>. Obrázky i loga se při nahrání
    samy převedou do WebP a zmenší, takže se web nezpomalí.
  </p>
  <p class="note">
    Po uložení dej na webu <strong>Ctrl+F5</strong> — prohlížeč si drží starou verzi v paměti.
  </p>

  <h2>Loga klientů <span style="font-weight:400;color:var(--muted);font-size:13px">— rotují pod hero sekcí</span></h2>
  <div class="card">
    <div class="logos" id="logos"></div>
    <div class="add">
      <input type="text" id="logoNew" placeholder="Textové logo (název klienta)" />
      <button class="btn ghost" id="logoAdd" type="button">Přidat text</button>
    </div>
    <div class="add">
      <input type="file" id="logoFile" accept="image/*" />
      <button class="btn ghost" id="logoUp" type="button">Nahrát obrázkové logo</button>
    </div>
  </div>

  <h2>Projekty <span style="font-weight:400;color:var(--muted);font-size:13px">— sekce „Naše práce“</span></h2>
  <div id="projects"></div>
  <button class="btn ghost" id="projAdd" type="button">+ Přidat projekt</button>

  <div class="bar">
    <span class="hint" id="status">…</span>
    <button class="btn ghost" id="logout" type="button">Odhlásit</button>
    <button class="btn" id="save" type="button">Uložit na web</button>
  </div>

  <script src="../data/content.js?t=<?= time() ?>"></script>
  <script>
  (function(){
    "use strict";
    var CSRF = <?= json_encode($csrf) ?>;
    var src = window.FOXY_CONTENT || {};
    var data = {
      logos: Array.isArray(src.logos) ? JSON.parse(JSON.stringify(src.logos)) : [],
      projects: Array.isArray(src.projects) ? JSON.parse(JSON.stringify(src.projects)) : []
    };
    var $ = function(id){ return document.getElementById(id); };
    var dirty = false;

    function status(msg, cls){ var s=$("status"); s.className='hint '+(cls||''); s.innerHTML=msg; }
    function touch(){ dirty=true; status(data.projects.length+' projektů · '+data.logos.length+' log — <b>neuloženo</b>'); }

    function post(fd){
      fd.append('csrf', CSRF);
      return fetch('api.php',{method:'POST',body:fd}).then(function(r){return r.json()});
    }

    /* ---- loga ---- */
    function renderLogos(){
      var w=$("logos"); w.innerHTML='';
      data.logos.forEach(function(l,i){
        var el=document.createElement('span'); el.className='logo';
        if(l && typeof l==='object' && l.img){
          var im=document.createElement('img'); im.src='../'+l.img; im.alt=l.alt||'';
          el.appendChild(im);
          el.appendChild(document.createTextNode(l.alt||''));
        } else {
          el.appendChild(document.createTextNode(String(l)));
        }
        var b=document.createElement('button'); b.type='button'; b.textContent='×'; b.title='Odebrat';
        b.onclick=function(){ data.logos.splice(i,1); renderLogos(); touch(); };
        el.appendChild(b); w.appendChild(el);
      });
    }
    $("logoAdd").onclick=function(){
      var v=$("logoNew").value.trim(); if(!v) return;
      data.logos.push(v); $("logoNew").value=''; renderLogos(); touch();
    };
    $("logoUp").onclick=function(){
      var f=$("logoFile").files[0];
      if(!f){ status('Vyber soubor s logem.','err'); return; }
      var fd=new FormData(); fd.append('action','upload-logo'); fd.append('file',f);
      fd.append('name', f.name.replace(/\.[^.]+$/,''));
      status('Nahrávám a převádím…');
      post(fd).then(function(j){
        if(!j.ok){ status(j.error,'err'); return; }
        data.logos.push({img:j.path, alt:f.name.replace(/\.[^.]+$/,'')});
        $("logoFile").value=''; renderLogos(); touch();
      }).catch(function(){ status('Nahrání selhalo.','err'); });
    };

    /* ---- projekty ---- */
    var FIELDS=[
      ["index","Číslo v rohu obrázku","01","input"],
      ["name","Nadpis v boxu vpravo","DEERTONE","input"],
      ["type","Popisek nad nadpisem","Ticketingová platforma","input"],
      ["result","Řádek u „Výsledek“","","input"],
      ["desc","Odstavec v boxu vpravo","","textarea"]
    ];

    function renderProjects(){
      var wrap=$("projects"); wrap.innerHTML='';
      data.projects.forEach(function(p,pi){
        var card=document.createElement('div'); card.className='card';
        var h=document.createElement('h3'); h.textContent='Projekt '+(pi+1)+(p.name?' — '+p.name:''); card.appendChild(h);

        var row=document.createElement('div'); row.className='row';
        FIELDS.forEach(function(f){
          var holder=document.createElement('div');
          var l=document.createElement('label');
          l.appendChild(document.createTextNode(f[1]+' '));
          var sp=document.createElement('span'); sp.textContent='('+f[0]+')'; l.appendChild(sp);
          var inp=document.createElement(f[3]);
          inp.value=(p[f[0]]==null?'':p[f[0]]);
          if(f[2]) inp.placeholder=f[2];
          inp.oninput=function(){ p[f[0]]=inp.value; touch(); };
          if(f[0]==='desc') holder.style.gridColumn='1 / -1';
          holder.appendChild(l); holder.appendChild(inp); row.appendChild(holder);
        });
        card.appendChild(row);

        /* obrázek projektu */
        var il=document.createElement('label');
        il.appendChild(document.createTextNode('Obrázek projektu '));
        var isp=document.createElement('span'); isp.textContent='('+(p.img||'nenastaven')+')'; il.appendChild(isp);
        card.appendChild(il);

        var prev=document.createElement('div'); prev.className='prev';
        var thumb;
        if(p.img){
          thumb=document.createElement('img'); thumb.src='../'+p.img+'?t='+Date.now(); thumb.alt='';
          thumb.onerror=function(){
            var miss=document.createElement('div'); miss.className='miss';
            miss.textContent='chybí soubor'; thumb.replaceWith(miss);
          };
        } else {
          thumb=document.createElement('div'); thumb.className='miss'; thumb.textContent='bez obrázku';
        }
        prev.appendChild(thumb);

        var fi=document.createElement('input'); fi.type='file'; fi.accept='image/*';
        var up=document.createElement('button'); up.type='button'; up.className='btn ghost'; up.textContent='Nahrát obrázek';
        up.onclick=function(){
          var f=fi.files[0];
          if(!f){ status('Vyber soubor s obrázkem.','err'); return; }
          var fd=new FormData(); fd.append('action','upload-project'); fd.append('file',f);
          fd.append('name', p.name||('projekt-'+(pi+1)));
          status('Nahrávám a převádím…');
          post(fd).then(function(j){
            if(!j.ok){ status(j.error,'err'); return; }
            p.img=j.path; renderProjects(); touch();
          }).catch(function(){ status('Nahrání selhalo.','err'); });
        };
        var box=document.createElement('div'); box.appendChild(fi); box.appendChild(up);
        box.style.display='flex'; box.style.gap='8px'; box.style.flexWrap='wrap';
        prev.appendChild(box);
        card.appendChild(prev);

        /* tagy */
        var tl=document.createElement('label');
        tl.appendChild(document.createTextNode('Čipy v obrázku '));
        var tsp=document.createElement('span'); tsp.textContent='(ideálně 3–4)'; tl.appendChild(tsp);
        card.appendChild(tl);
        var tags=document.createElement('div'); tags.className='tags';
        (p.tags||[]).forEach(function(t,ti){
          var el=document.createElement('span'); el.className='tag';
          el.appendChild(document.createTextNode(t));
          var b=document.createElement('button'); b.type='button'; b.textContent='×';
          b.onclick=function(){ p.tags.splice(ti,1); renderProjects(); touch(); };
          el.appendChild(b); tags.appendChild(el);
        });
        card.appendChild(tags);
        var addWrap=document.createElement('div'); addWrap.className='add';
        var ti2=document.createElement('input'); ti2.type='text'; ti2.placeholder='Nový čip';
        var ba=document.createElement('button'); ba.type='button'; ba.className='btn ghost'; ba.textContent='Přidat čip';
        ba.onclick=function(){ var v=ti2.value.trim(); if(!v) return;
          if(!p.tags) p.tags=[]; p.tags.push(v); renderProjects(); touch(); };
        ti2.addEventListener('keydown',function(e){ if(e.key==='Enter'){e.preventDefault(); ba.click();} });
        addWrap.appendChild(ti2); addWrap.appendChild(ba); card.appendChild(addWrap);

        var del=document.createElement('button'); del.type='button'; del.className='btn ghost';
        del.style.marginTop='14px'; del.textContent='Odebrat projekt';
        del.onclick=function(){ if(confirm('Odebrat projekt „'+(p.name||(pi+1))+'“?')){
          data.projects.splice(pi,1); renderProjects(); touch(); } };
        card.appendChild(del);
        wrap.appendChild(card);
      });
    }
    $("projAdd").onclick=function(){
      data.projects.push({index:String(data.projects.length+1).padStart(2,'0'),
        name:'',type:'',desc:'',result:'',img:'',tags:[]});
      renderProjects(); touch();
    };

    /* ---- uložení ---- */
    $("save").onclick=function(){
      var b=$("save"); b.disabled=true; status('Ukládám…');
      var fd=new FormData(); fd.append('action','save'); fd.append('data', JSON.stringify(data));
      post(fd).then(function(j){
        b.disabled=false;
        if(!j.ok){ status(j.error,'err'); return; }
        dirty=false;
        status('<span class="ok">Uloženo na web v '+j.saved+'</span> — na webu dej Ctrl+F5');
      }).catch(function(){ b.disabled=false; status('Uložení selhalo.','err'); });
    };
    $("logout").onclick=function(){
      var fd=new FormData(); fd.append('action','logout');
      post(fd).then(function(){ location.reload(); });
    };
    window.addEventListener('beforeunload',function(e){ if(dirty){ e.preventDefault(); e.returnValue=''; } });

    renderLogos(); renderProjects();
    status(data.projects.length+' projektů · '+data.logos.length+' log');
  })();
  </script>
<?php endif; ?>
</body>
</html>
