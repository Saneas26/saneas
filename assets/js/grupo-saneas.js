// ============================================================
// GRUPO SANEAS · componente compartido de publicidad interna
// Este archivo es IGUAL en todas las webs y apps del grupo.
// Si lo cambias aquí, cópialo tal cual en las demás.
//
// Cómo se usa (una línea en cada propiedad):
//   GrupoSaneas.init({ actual:'saneas', logos:'img/' });
//   · actual → cuál de las marcas es esta (se marca «Estás aquí»)
//   · logos  → carpeta donde viven los app-<marca>.png (192px)
//
// Dos superficies:
//   · GrupoSaneas.abrirMenu()  → desplegable del logo: logotipo + explicación
//   · GrupoSaneas.gridHTML()   → parrilla para el pie; al tocar un icono se
//     despliega su ficha con la explicación y un botón OK.
// ============================================================
var GrupoSaneas = (function(){
  var MARCAS = [
    { id:'saneas', nombre:'Saneas', logo:'app-saneas.png', url:'https://saneas.es',
      texto:'Comida para resolver tus problemas de alimentación. Nutrición para todos los bolsillos.' },
    { id:'laora', nombre:'laOra', logo:'app-laora.png', url:'https://laora.es',
      texto:'La relojería de lujo al precio honesto, sin peajes de marca.' },
    { id:'pordondevoy', nombre:'Pordondevoy', logo:'app-pordondevoy.png', url:'https://pordondevoy-saneas.vercel.app',
      texto:'En un avión no hay datos ni wifi. Ahora puedes entretenerte y saber por dónde vas, de manera gratuita. Las 20 noticias más importantes del día te acompañan, junto a los principales podcast en español. Con itinerarios a las principales ciudades europeas.' },
    { id:'activala', nombre:'Activala', logo:'app-activala.png', url:'https://activala.es',
      texto:'Alquileres de casas en el sur de Gran Canaria, sin intermediarios.' },
    { id:'acumula', nombre:'Acumula', logo:'app-acumula.png', url:'https://acumula.es',
      texto:'Una ayuda para controlar tu economía casera, totalmente gratuita. Todas tus cuentas en un solo sitio.' }
  ];
  var CFG = { actual:'', logos:'img/', extras:[] };
  var CSS_PUESTO = false;

  function esc(s){ return String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function todas(){ return MARCAS.concat(CFG.extras||[]); }
  function porId(id){ var l=todas(); for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return null; }
  function src(m){ return m.logo ? (CFG.logos+m.logo) : ''; }

  // ---- estilos propios: el componente no depende del CSS de la casa ----
  function ponerCSS(){
    if(CSS_PUESTO) return; CSS_PUESTO=true;
    var c=document.createElement('style'); c.id='gs-css';
    c.textContent = [
      '.gs-fondo{position:fixed;inset:0;background:rgba(16,40,48,.45);z-index:9998;opacity:0;pointer-events:none;transition:opacity .18s}',
      '.gs-fondo.abierto{opacity:1;pointer-events:auto}',
      '.gs-panel{position:fixed;top:58px;left:50%;transform:translate(-50%,-10px);width:min(430px,calc(100% - 24px));',
        'max-height:78vh;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#fff;border-radius:20px;',
        'box-shadow:0 22px 60px rgba(16,40,48,.35);z-index:9999;opacity:0;pointer-events:none;',
        'transition:opacity .18s,transform .18s;padding:16px 14px 10px;',
        'font-family:inherit;-webkit-text-size-adjust:100%}',
      '.gs-panel.abierto{opacity:1;pointer-events:auto;transform:translate(-50%,0)}',
      '.gs-tit{font-size:13.5px;font-weight:700;color:#5f7178;text-align:center;margin:0 0 12px}',
      '.gs-tit b{color:#3890a4;font-weight:800}',
      '.gs-fila{display:flex;align-items:flex-start;gap:12px;padding:11px;border-radius:16px;',
        'border:1px solid #e3edef;margin-bottom:9px;text-decoration:none;background:#fff}',
      '.gs-fila:active{background:#f4fafb}',
      '.gs-fila img{width:52px;height:52px;border-radius:14px;object-fit:cover;flex:none;background:#fff;',
        'box-shadow:0 3px 10px rgba(16,40,48,.12)}',
      '.gs-tx{min-width:0;text-align:left}',
      '.gs-tx b{display:block;font-size:15.5px;font-weight:800;color:#1a2e35;line-height:1.2}',
      '.gs-tx span{display:block;font-size:12.5px;color:#5f7178;line-height:1.45;margin-top:3px}',
      '.gs-aqui{display:inline-block;font-size:10.5px;font-weight:800;color:#F5862E;',
        'background:#fff1e4;border-radius:8px;padding:1px 7px;margin-left:6px;vertical-align:2px}',
      '.gs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(74px,1fr));gap:18px 6px;margin-top:12px}',
      '.gs-item{display:flex;flex-direction:column;align-items:center;gap:7px;background:none;border:0;',
        'padding:0;cursor:pointer;font-family:inherit}',
      '.gs-item img{width:60px;height:60px;border-radius:16px;object-fit:cover;background:#fff;',
        'box-shadow:0 4px 12px rgba(16,40,48,.16)}',
      '.gs-item b{font-size:12.5px;font-weight:700;color:#1a2e35;line-height:1.2;text-align:center}',
      '.gs-ficha{text-align:center;padding:6px 4px 2px}',
      '.gs-ficha img{width:96px;height:96px;border-radius:24px;object-fit:cover;background:#fff;',
        'box-shadow:0 8px 22px rgba(16,40,48,.2)}',
      '.gs-ficha h3{font-size:22px;font-weight:800;color:#1a2e35;margin:14px 0 8px}',
      '.gs-ficha p{font-size:15px;color:#41585f;line-height:1.6;margin:0 6px 18px}',
      '.gs-ir{display:block;background:#3890a4;color:#fff;border:0;border-radius:14px;padding:14px;',
        'font-size:15.5px;font-weight:800;text-decoration:none;font-family:inherit;cursor:pointer;margin-bottom:9px}',
      '.gs-ok{display:block;width:100%;background:#fff;color:#3890a4;border:2px solid #3890a4;border-radius:14px;',
        'padding:13px;font-size:15.5px;font-weight:800;font-family:inherit;cursor:pointer}',
      '@media (prefers-reduced-motion:reduce){.gs-panel,.gs-fondo{transition:none}}'
    ].join('');
    document.head.appendChild(c);
  }

  function panel(){
    ponerCSS();
    var p=document.getElementById('gs-panel');
    if(p) return p;
    var f=document.createElement('div'); f.id='gs-fondo'; f.className='gs-fondo'; f.onclick=cerrar;
    p=document.createElement('div'); p.id='gs-panel'; p.className='gs-panel';
    document.body.appendChild(f); document.body.appendChild(p);
    return p;
  }
  function mostrar(html){
    var p=panel();
    p.innerHTML=html; p.scrollTop=0;
    p.classList.add('abierto');
    document.getElementById('gs-fondo').classList.add('abierto');
  }
  function cerrar(){
    var p=document.getElementById('gs-panel'); if(p) p.classList.remove('abierto');
    var f=document.getElementById('gs-fondo'); if(f) f.classList.remove('abierto');
  }

  // ---- desplegable del logo: logotipo + explicación de cada una ----
  function menuHTML(){
    return '<div class="gs-tit">Grupo <b>Saneas</b></div>' + todas().map(function(m){
      var aqui = (m.id===CFG.actual);
      var ico = m.logo ? '<img src="'+esc(src(m))+'" alt="" loading="lazy">' : '';
      var tx = '<span class="gs-tx"><b>'+esc(m.nombre)+(aqui?'<span class="gs-aqui">estás aquí</span>':'')
             + '</b><span>'+esc(m.texto)+'</span></span>';
      return aqui
        ? '<div class="gs-fila">'+ico+tx+'</div>'
        : '<a class="gs-fila" href="'+esc(m.url)+'" target="_blank" rel="noopener">'+ico+tx+'</a>';
    }).join('');
  }
  function abrirMenu(){
    var p=document.getElementById('gs-panel');
    if(p && p.classList.contains('abierto')){ cerrar(); return; }
    mostrar(menuHTML());
  }

  // ---- parrilla del pie: iconos; al tocar, la ficha con su OK ----
  function gridHTML(){
    ponerCSS();
    return '<div class="gs-grid">' + todas().map(function(m){
      var ico = m.logo ? '<img src="'+esc(src(m))+'" alt="" loading="lazy">' : '';
      return '<button type="button" class="gs-item" onclick="GrupoSaneas.ficha(\''+esc(m.id)+'\')">'
           + ico + '<b>'+esc(m.nombre)+'</b></button>';
    }).join('') + '</div>';
  }
  function ficha(id){
    var m=porId(id); if(!m) return;
    var aqui=(m.id===CFG.actual);
    mostrar('<div class="gs-ficha">'
      + (m.logo?'<img src="'+esc(src(m))+'" alt="">':'')
      + '<h3>'+esc(m.nombre)+'</h3><p>'+esc(m.texto)+'</p>'
      + (aqui?'':'<a class="gs-ir" href="'+esc(m.url)+'" target="_blank" rel="noopener">Ir a '+esc(m.nombre)+'</a>')
      + '<button type="button" class="gs-ok" onclick="GrupoSaneas.cerrar()">OK</button></div>');
  }

  function init(o){
    o=o||{};
    if(o.actual!=null) CFG.actual=o.actual;
    if(o.logos!=null)  CFG.logos=o.logos;
    if(o.extras!=null) CFG.extras=o.extras;
    ponerCSS();
  }
  return { init:init, abrirMenu:abrirMenu, cerrar:cerrar, ficha:ficha,
           gridHTML:gridHTML, menuHTML:menuHTML, marcas:todas };
})();
