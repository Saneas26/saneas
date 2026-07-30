// ============================================================
// GRUPO SANEAS · componente compartido de publicidad interna
// Este archivo es IGUAL en todas las webs y apps del grupo.
// Si lo cambias aquí, cópialo tal cual en las demás.
//
// Cómo se usa (una línea en cada propiedad):
//   GrupoSaneas.init({ actual:'saneas', logos:'img/' });
//   · actual → cuál de las marcas es esta (se marca «Estás aquí»)
//   · logos  → carpeta donde viven los app-<marca>.png (192px)
//   · barra  → selector de la barra de arriba de esa casa, para que el
//     desplegable no la tape. Por defecto '.appbar,header' (las apps); la
//     web de marketing pasa 'nav'. Ojo: en las apps 'nav' es la barra de
//     pestañas de ABAJO, así que no vale como valor por defecto.
//
// Dos superficies:
//   · GrupoSaneas.abrirMenu()  → desplegable del logo: logotipo + explicación
//   · GrupoSaneas.gridHTML()   → parrilla para el pie; al tocar un icono se
//     despliega su ficha con la explicación y un botón OK.
// ============================================================
var GrupoSaneas = (function(){
  var MARCAS = [
    // Saneas son DOS fichas: la web (icono teal con todas las letras) y la APP
    // (icono teal con la S sola, que lleva a la pagina de instalacion).
    { id:'saneas', nombre:'Saneas', logo:'app-saneas-web.png', url:'https://saneas.es',
      texto:'El método de nutrición con 87% de éxito que ha ayudado a más de 1700 personas, sin pastillas, sin batidos y sin inyecciones. Solo cambiando tus hábitos poco a poco. El GPS de la nutrición que te muestra el camino.' },
    { id:'saneas-app', nombre:'APP Saneas', logo:'app-saneas-s.png', url:'https://saneas.es/instala-app',
      texto:'Probablemente la mejor APP de nutrición del mercado.' },
    { id:'pordondevoy', nombre:'Pordondevoy', logo:'app-pordondevoy.png', url:'https://pordondevoy-saneas.vercel.app',
      texto:'En un avión no hay datos ni wifi. Ahora puedes entretenerte y saber por dónde vas, de manera gratuita. Las 20 noticias más importantes del día te acompañan, junto a los principales podcast en español. Con itinerarios a las principales ciudades europeas.' },
    { id:'activala', nombre:'Activala', logo:'app-activala.png', url:'https://activala.es',
      texto:'Alquileres de casas en el sur de Gran Canaria, sin intermediarios.' },
    { id:'laora', nombre:'laOra', logo:'app-laora.png', url:'https://laora.es',
      texto:'La relojería de lujo al precio honesto, sin peajes de marca.' },
    { id:'acumula', nombre:'Acumula', logo:'app-acumula.png', url:'https://acumula.es',
      texto:'Una ayuda para controlar tu economía casera, totalmente gratuita. Todas tus cuentas en un solo sitio.' }
  ];
  var CFG = { actual:'', logos:'img/', extras:[], barra:'.appbar,header' };
  var CSS_PUESTO = false;

  function esc(s){ return String(s==null?'':s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function todas(){
    var result = MARCAS.slice();
    if(CFG.extras && CFG.extras.length > 0){
      // Orden del grupo: Saneas.es · APP Saneas · Asesorias · Pordondevoy · …
      result.splice(2, 0, CFG.extras[0]);
    }
    return result;
  }
  // ---- códigos QR de cada casa, ya calculados ----
  // Se generan con herramientas/qr_grupo.py (segno) y se pegan aquí: son siete
  // direcciones fijas, así que no hace falta un codificador en la app. Cada uno
  // es la matriz en binario, empaquetada en base64, fila a fila.
  var QRS = {
    'saneas': {t:25, d:'/i+/wSBQboOrt1AV26ci7BS1B/qq/gEpAGIVtDZY2set+b0QeIh26gpE+Y/KFBpSAnj2cfkAV8R/jaowQXErpX+d0Spa6q93BeWw/jSkgA=='},
    'saneas-app': {t:29, d:'/m/D/BGOkG6u0Lt0aUXbqcouwVnZB/qqr+AJmABKit2iQQQcy+17Wpip2L329JTyPtFVqCs6YpfqaJcUvQdt0V5L+1IyccfCn+fl/YB/xF/4t2owT4sZups/ldClCK6Dpw8FbNK/5VaJAA=='},
    'asesorias': {t:29, d:'/h/7/BAqkG6yFLt0ZUXbqKouwVfZB/qqr+AOuABK8rWjzekc8pF7OypnyrGkNZTuBnFV7XqifSEyKKpynQWLAT9FxlISG1/AjfEE+IBoxF/4n2owSU8Zur0/ldBUC66fJx8FHN6/5RatAA=='},
    'pordondevoy': {t:29, d:'/qr7/BeREG6bJLt1Y4XboD0uwQYdB/qqr+ARTwC3BPpcYWX8TeURzYvyeho2pQZQeb0cvZNy+JRw0pMLFNMtWkumvfJIUE2hRXBu/gB4RH/6KutQU/EbuklPpdXOLm6zqEsExDGv7evVAA=='},
    'activala': {t:25, d:'/me/wSIQbqaLt0nV26tS7BcVB/qq/gDnAEqmWiZvxoS6dZkoJGm3d35m3kjMRHhzu7brWv4AdUQ/iKoQRpHbq+/t0qee6SuVBdD+/mNjgA=='},
    'laora': {t:25, d:'/ju/wTsQbpDrt1FF26T67BXFB/qq/gFmAGIfNE4v2sCqX6cGm4xqWwgHTY9NBhopt/j7fPkARER/kqowTBELph+d0tpa6rZ3Bb0w/gzEgA=='},
    'acumula': {t:25, d:'/iW/wTFQbrbLt0A126r67BTxB/qq/gDwAErHWhClhpan1Y+qtGOhR3+L3kj45nggkjby8f4Ab0Q/kCoQQJH7rw/t0Nue6JOVBWx+/itjgA=='}
  };

  function qrSVG(id, lado){
    var q = QRS[id]; if(!q) return '';
    var bin = atob(q.d), t = q.t, borde = 4, total = t + borde*2, d = '';
    for(var i=0;i<t*t;i++){
      if(!((bin.charCodeAt(i>>3) >> (7-(i&7))) & 1)) continue;
      d += 'M'+((i%t)+borde)+' '+(((i/t)|0)+borde)+'h1v1h-1z';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="'+lado+'" height="'+lado+'" '
         + 'viewBox="0 0 '+total+' '+total+'" shape-rendering="crispEdges" role="img" '
         + 'aria-label="Código QR"><rect width="'+total+'" height="'+total+'" fill="#fff"/>'
         + '<path d="'+d+'" fill="#1a2e35"/></svg>';
  }

  function porId(id){ var l=todas(); for(var i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return null; }
  function src(m){ return m.logo ? (CFG.logos+m.logo) : ''; }
  // Marcas sin PNG (los sub-productos): baldosa naranja con dos figuras,
  // una detrás de otra — se entiende de un vistazo que son personas.
  var SVG_PERSONAS = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" '
    + 'stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'
    + '<path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  // Saneas no lleva foto: lleva su logotipo corporativo, el nombre entero
  // en QuickSand Bold («Saneas®»), blanco sobre el teal de la marca — para
  // que se reconozca igual aquí que en la cabecera de la web y de la app.
  function icono(m, clase){
    if(m.wordmark){
      var tam = clase.indexOf('ficha')>-1 ? 'gs-word-ficha'
              : clase.indexOf('item')>-1  ? 'gs-word-item' : 'gs-word-fila';
      return '<span class="gs-word '+tam+'">Saneas<sup>&reg;</sup></span>';
    }
    return m.logo
      ? '<img src="'+esc(src(m))+'" alt="" loading="lazy">'
      : '<span class="'+clase+'">'+SVG_PERSONAS+'</span>';
  }

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
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;',
        '-webkit-text-size-adjust:100%}',
      '.gs-panel.abierto{opacity:1;pointer-events:auto;transform:translate(-50%,0)}',
      '.gs-tit{font-size:15px;font-weight:700;color:#22313a;text-align:center;margin:0 0 12px}',
      '.gs-tit b{color:#3890a4;font-weight:800}',
      '.gs-fila{display:flex;align-items:flex-start;gap:12px;padding:11px;border-radius:16px;',
        'border:1px solid #e3edef;margin-bottom:9px;text-decoration:none;background:#fff}',
      '.gs-fila:active{background:#f4fafb}',
      '.gs-fila{flex-wrap:wrap}',
      '.gs-fila-l{display:flex;align-items:flex-start;gap:12px;flex:1 1 100%;min-width:0;text-decoration:none}',
      '.gs-comp{margin:6px 0 0 64px;background:#eef6f8;color:#3890a4;border:0;border-radius:9px;',
        'padding:7px 14px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:inherit}',
      '.gs-comp:active{background:#dcecf0}',
      '.gs-comp-ficha{display:block;width:100%;margin:0 0 9px;padding:13px;font-size:15.5px}',
      '.gs-qr{display:flex;justify-content:center;margin:4px 0 6px}',
      '.gs-qr svg{border-radius:12px;box-shadow:0 4px 14px rgba(16,40,48,.16)}',
      '.gs-qr-pie{font-size:14px;color:#3d4f59;margin:0 6px 16px}',
      '.gs-ir.gs-wa{background:#25D366}',
      '.gs-fila img{width:52px;height:52px;border-radius:14px;object-fit:cover;flex:none;background:#fff;',
        'box-shadow:0 3px 10px rgba(16,40,48,.12)}',
      '.gs-tx{min-width:0;text-align:left}',
      '.gs-tx b{display:block;font-size:17px;font-weight:800;color:#22313a;line-height:1.25}',
      '.gs-tx span{display:block;font-size:16px;color:#3d4f59;line-height:1.55;margin-top:5px}',
      '.gs-aqui{display:inline-block;font-size:10.5px;font-weight:800;color:#F5862E;',
        'background:#fff1e4;border-radius:8px;padding:1px 7px;margin-left:6px;vertical-align:2px}',
      '.gs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px 6px;margin-top:12px}',
      '.gs-item{display:flex;flex-direction:column;align-items:center;gap:7px;background:none;border:0;',
        'padding:0;cursor:pointer;font-family:inherit}',
      '.gs-item img{width:60px;height:60px;border-radius:16px;object-fit:cover;background:#fff;',
        'box-shadow:0 4px 12px rgba(16,40,48,.16)}',
      '.gs-item b{font-size:14px;font-weight:700;color:#22313a;line-height:1.25;text-align:center}',
      '.gs-ficha{text-align:center;padding:6px 4px 2px}',
      '.gs-ficha img{width:96px;height:96px;border-radius:24px;object-fit:cover;background:#fff;',
        'box-shadow:0 8px 22px rgba(16,40,48,.2)}',
      '.gs-ficha h3{font-size:24px;font-weight:800;color:#22313a;margin:14px 0 8px}',
      '.gs-ficha p{font-size:17px;color:#3d4f59;line-height:1.55;margin:0 6px 18px}',
      '.gs-ir{display:block;background:#3890a4;color:#fff;border:0;border-radius:14px;padding:14px;',
        'font-size:15.5px;font-weight:800;text-decoration:none;font-family:inherit;cursor:pointer;margin-bottom:9px}',
      '.gs-ok{display:block;width:100%;background:#fff;color:#3890a4;border:2px solid #3890a4;border-radius:14px;',
        'padding:13px;font-size:15.5px;font-weight:800;font-family:inherit;cursor:pointer}',
      '.gs-svg{display:inline-flex;align-items:center;justify-content:center;flex:none;',
        'background:linear-gradient(135deg,#F5862E,#d96b1a);box-shadow:0 3px 10px rgba(16,40,48,.12)}',
      '.gs-svg-fila{width:52px;height:52px;border-radius:14px}',
      '.gs-svg-fila svg{width:26px;height:26px}',
      '.gs-svg-item{width:60px;height:60px;border-radius:16px;box-shadow:0 4px 12px rgba(16,40,48,.16)}',
      '.gs-svg-item svg{width:30px;height:30px}',
      '.gs-svg-ficha{width:96px;height:96px;border-radius:24px;box-shadow:0 8px 22px rgba(16,40,48,.2)}',
      '.gs-svg-ficha svg{width:46px;height:46px}',
      '.gs-word{display:inline-flex;align-items:center;justify-content:center;flex:none;',
        'background:linear-gradient(135deg,#1a2e35,#3890a4);color:#fff;',
        'font-family:\'Quicksand\',sans-serif;font-weight:700;letter-spacing:-.2px;',
        'white-space:nowrap;line-height:1}',
      '.gs-word sup{font-size:.5em;font-weight:700;color:#F5862E;margin-left:1px}',
      '.gs-word-fila{width:52px;height:52px;border-radius:14px;font-size:11.5px;',
        'box-shadow:0 3px 10px rgba(16,40,48,.12)}',
      '.gs-word-item{width:60px;height:60px;border-radius:16px;font-size:13px;',
        'box-shadow:0 4px 12px rgba(16,40,48,.16)}',
      '.gs-word-ficha{width:96px;height:96px;border-radius:24px;font-size:19px;',
        'box-shadow:0 8px 22px rgba(16,40,48,.2)}',
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
    // Debajo de la barra de la casa, sea la que sea: en Saneas son dos filas
    // y con el top fijo el panel tapaba el propio botón.
    var barra=document.querySelector(CFG.barra);
    if(barra){ var abajo=barra.getBoundingClientRect().bottom;
      if(abajo>0) p.style.top=Math.round(abajo+8)+'px'; }
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
      var ico = icono(m,'gs-svg gs-svg-fila');
      var tx = '<span class="gs-tx"><b>'+esc(m.nombre)+(aqui?'<span class="gs-aqui">estás aquí</span>':'')
             + '</b><span>'+esc(m.texto)+'</span></span>';
      var dentro = aqui
        ? '<div class="gs-fila-l">'+ico+tx+'</div>'
        : '<a class="gs-fila-l" href="'+esc(m.url)+'" target="_blank" rel="noopener">'+ico+tx+'</a>';
      return '<div class="gs-fila">' + dentro
        + '<button type="button" class="gs-comp" onclick="GrupoSaneas.compartir(\''+esc(m.id)+'\')">Compartir</button>'
        + '</div>';
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
      var ico = icono(m,'gs-svg gs-svg-item');
      return '<button type="button" class="gs-item" onclick="GrupoSaneas.ficha(\''+esc(m.id)+'\')">'
           + ico + '<b>'+esc(m.nombre)+'</b></button>';
    }).join('') + '</div>';
  }
  // ---- compartir: el QR para que lo escaneen delante, o WhatsApp ----
  function compartir(id){
    var m = porId(id); if(!m) return;
    var lado = QRS[id] ? (QRS[id].t + 8) * 6 : 210;   // 6 px por modulo: bordes nitidos
    var svg = qrSVG(id, lado);
    var texto = 'Te comparto ' + m.nombre + ': ' + m.url;
    var wa = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(texto);
    mostrar('<div class="gs-ficha">'
      + '<h3>Compartir ' + esc(m.nombre) + '</h3>'
      + (svg ? '<div class="gs-qr">' + svg + '</div>'
             + '<p class="gs-qr-pie">Que lo escaneen con la cámara del móvil</p>' : '')
      + '<a class="gs-ir gs-wa" href="' + esc(wa) + '" target="_blank" rel="noopener">Enviar por WhatsApp</a>'
      + '<button type="button" class="gs-ok" onclick="GrupoSaneas.ficha(\'' + esc(m.id) + '\')">Volver</button>'
      + '</div>');
  }

  function ficha(id){
    var m=porId(id); if(!m) return;
    var aqui=(m.id===CFG.actual);
    mostrar('<div class="gs-ficha">'
      + icono(m,'gs-svg gs-svg-ficha')
      + '<h3>'+esc(m.nombre)+'</h3><p>'+esc(m.texto)+'</p>'
      + (aqui?'':'<a class="gs-ir" href="'+esc(m.url)+'" target="_blank" rel="noopener">Ir a '+esc(m.nombre)+'</a>')
      + '<button type="button" class="gs-comp gs-comp-ficha" onclick="GrupoSaneas.compartir(\''+esc(m.id)+'\')">Compartir</button>'
      + '<button type="button" class="gs-ok" onclick="GrupoSaneas.cerrar()">OK</button></div>');
  }

  function init(o){
    o=o||{};
    if(o.actual!=null) CFG.actual=o.actual;
    if(o.logos!=null)  CFG.logos=o.logos;
    if(o.extras!=null) CFG.extras=o.extras;
    if(o.barra!=null)  CFG.barra=o.barra;
    ponerCSS();
  }
  return { init:init, abrirMenu:abrirMenu, cerrar:cerrar, ficha:ficha, compartir:compartir,
           gridHTML:gridHTML, menuHTML:menuHTML, marcas:todas };
})();
