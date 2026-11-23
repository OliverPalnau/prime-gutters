import {L,pick,href,esc,nextdoor,yelp,writeGoogleReview,phone,media,tel} from './data.mjs';
import {counties} from './places.mjs';
import {projectTypes,systemProfiles,sizingSource,stormSource,drainSource,slopeExamples,capacityExample} from './projects.mjs';

export const sizePath='/guides/5-inch-vs-6-inch-k-style-gutters/';
export const taxPath='/capital-improvement-form/';
export const nyForm='https://www.tax.ny.gov/pdf/current_forms/st/st124_fill_in.pdf';
export const nyGuidance='https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/capital_improvements.htm';
const nyClassifications='https://www.tax.ny.gov/pdf/publications/sales/pub862.pdf';
export const projectPath=p=>'/projects/'+p.slug+'/';
export const countyPath=c=>'/areas-served/'+c.slug+'-county/';
export const slugify=s=>s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const locationPath=(c,n)=>countyPath(c)+slugify(n)+'/';
const aLink=(l,path,name,style='textlink')=>`<a class="${style}" href="${esc(href(l,path))}">${esc(name)}</a>`;
const sectionLead=(tag,heading,desc='')=>`<div class="section-title"><p class="eyebrow"><span></span>${tag}</p><h2>${heading}</h2>${desc?'<p>'+desc+'</p>':''}</div>`;
export const ownerStory=l=>L(l,
 'Ryan Moore owns Prime Gutters and lives in Huntington, New York. He has spent more than 15 years in the gutter business, working on thousands of homes for builders and homeowners across Long Island.',
 'Ryan Moore es propietario de Prime Gutters y vive en Huntington, Nueva York. Lleva más de 15 años trabajando en canaletas y ha trabajado en miles de viviendas para constructores y propietarios de Long Island.');
export function profileBadges(l) {
  return `<div class="directory-logos">
    <a href="${yelp}" aria-label="${L(l,'Find Prime Gutters on Yelp','Encuentre Prime Gutters en Yelp')}"><img width="150" height="90" src="/media/directory/find-us-on-yelp.webp" alt="Find us on Yelp"></a>
    <a href="${nextdoor}" aria-label="${L(l,'View Prime Gutters on Nextdoor','Ver Prime Gutters en Nextdoor')}"><img width="140" height="20" src="/media/directory/nextdoor-logo.svg" alt="Nextdoor"><small>${L(l,'Neighborhood Fave','Favorito del vecindario')} · 2021–2023</small></a>
    <a class="google-invite" href="${writeGoogleReview}" aria-label="${L(l,'Review Prime Gutters on Google','Escriba una reseña de Prime Gutters en Google')}"><img width="144" height="77" src="/media/directory/review-us-on-google.webp" loading="lazy" alt="${L(l,'Leave us a Google review','Escriba una reseña en Google')}"></a>
  </div>`;
}
export function sizeComparison(l,full=false,embedded=false) {
  const t=(a,b)=>L(l,a,b),initial=capacityExample(slopeExamples[0]);
  const styles=systemProfiles.slice(0,2).map(prof=>`<article class="size-card">
    <a class="size-image" href="${(embedded?'?profile='+prof.id+'#exterior-studio':href(l,'/visualizer/?profile='+prof.id))}"><img src="${embedded?(prof.id==='k-5'?'/media/finishes/eave-base.webp':'/media/finishes/k-6-base.webp'):prof.image}" loading="lazy" width="960" height="620" alt="${pick(l,prof.name)}"></a>
    <div><h3>${pick(l,prof.name)}</h3><p>${pick(l,prof.desc)}</p>${(embedded?`<a class="textlink" href="?profile=${prof.id}#exterior-studio">${t('Try this size','Probar este tamaño')}</a>`:aLink(l,'/visualizer/?profile='+prof.id,t('Try this size','Probar este tamaño')))}</div>
  </article>`).join('');
  const slopeSelect=slopeExamples.map(row=>`<option value="${row.slope}">${row.slope} ${t('in. per foot','pulg. por pie')}</option>`).join('');
  return `<section class="section sizing"><div class="wrap">
   ${sectionLead(t('Gutter sizing guide','Guía de tamaños'),t('5-inch or 6-inch K-style gutters?','¿Canaletas de perfil K de 5 o 6 pulgadas?'),t('Both have the familiar molded front. See how one extra inch changes the opening, the profile, and the amount of roof runoff the gutter can carry.','Ambas tienen el frente moldeado tradicional. Vea cómo una pulgada más cambia la abertura, el perfil y el caudal que puede transportar la canaleta.'))}
   <div class="size-layout"><div class="size-pair">${styles}</div><aside class="flow-card" data-capacity='${JSON.stringify(slopeExamples.map(capacityExample).map(({slope,fiveGpm,sixGpm,percent})=>({slope,fiveGpm,sixGpm,percent})))}'>
    <p class="eyebrow">${t('Aluminum K-style · Flow comparison','Perfil K de aluminio · Comparación de caudal')}</p>
    <h3><span data-percent>${initial.percent}</span>% ${t('more flow capacity','más capacidad de caudal')}</h3>
    <label>${t('Gutter slope','Pendiente de la canaleta')} <select data-slope>${slopeSelect}</select></label>
    <div class="flow-rows" aria-live="polite"><div><b>5″</b><i data-five-bar></i><strong><span data-five>${initial.fiveGpm}</span> GPM</strong></div>
    <div><b>6″</b><i></i><strong><span data-six>${initial.sixGpm}</span> GPM</strong></div></div>
    <p>${t('U.S. gallons per minute, rounded. USDA aluminum ogee profiles at the selected slope, with ½ inch of clearance below the rim. Actual flow depends on profile dimensions, outlets, and downspouts.','Galones de EE. UU. por minuto, redondeados. Perfiles de aluminio de la tabla USDA, a la pendiente indicada y con ½ pulgada libre hasta el borde. El caudal real depende del perfil, las salidas y las bajantes.')}</p>
    <a href="${sizingSource}">${t('Source: USDA sizing table','Fuente: tabla de dimensionamiento del USDA')}</a>
   </aside></div>
   <div class="storm-note"><div><h3>${t('What about hurricane rain?','¿Y la lluvia de un huracán?')}</h3><p>${t('A wider gutter gives roof runoff more room during intense downpours. A small outlet, a clogged leader, or several roof valleys draining into one corner can still cause overflow. Wind damage, storm surge, and ground flooding require separate protection.','Una canaleta más ancha da más capacidad durante aguaceros intensos. Una salida pequeña, una bajante obstruida o varios valles que descargan en una esquina aún pueden provocar desbordamientos. El viento, la marejada y las inundaciones del terreno requieren protección aparte.')}</p></div>
   ${aLink(l,full?'/estimate/?service=seamless-gutter-installation':sizePath,full?t('Ask Ryan about sizing','Consultar el tamaño con Ryan'):t('See the full sizing guide','Ver la guía completa'),'btn outline-dark')}</div>
  </div></section>`;
}
export function fullSizeGuide(l){
 const t=(a,b)=>L(l,a,b);
 return sizeComparison(l,true)+`<section class="section warm"><div class="wrap narrow prose"><h2>${t('What Ryan checks before recommending a size','Qué revisa Ryan antes de recomendar un tamaño')}</h2>
 <p>${t('Start with each roof section that drains to the same outlet. Note the roof pitch, valleys, upper downspouts that empty onto lower roofs, and any place where water crosses an entrance. A short section beneath a valley can need more attention than a longer run along a simple roof.','Revise cada faldón que descarga en la misma salida. Anote la pendiente, los valles, las bajantes que vierten sobre techos inferiores y los lugares donde el agua cruza una entrada. Un tramo corto debajo de un valle puede necesitar más atención que un tramo largo en un techo sencillo.')}</p>
 <h2>${t('Where the water goes next','Adónde va el agua después')}</h2><p>${t('An outlet and downspout must carry the water the gutter collects. Grade and discharge location then determine whether it moves away from the foundation. Ask Ryan to review all three when comparing estimates.','La salida y la bajante deben evacuar el agua que recoge la canaleta. El nivel del suelo y el punto de descarga determinan si se aleja de los cimientos. Pídale a Ryan que revise los tres aspectos al comparar presupuestos.')}</p><div class="source-links"><a href="${drainSource}">Building America · ${t('Gutters and downspouts','Canaletas y bajantes')}</a><a href="${stormSource}">NOAA · ${t('Hurricane hazards','Riesgos de huracanes')}</a></div></div></section>`;
}
export function systemCards(l,items=systemProfiles){
 return `<div class="profile-photos">${items.map(p=>`<article><a href="${href(l,'/visualizer/?profile='+p.id)}"><img src="${p.image}" width="960" height="620" loading="lazy" alt="${pick(l,p.name)}"></a><div><h3>${pick(l,p.name)}</h3><p>${pick(l,p.desc)}</p>${aLink(l,'/visualizer/?profile='+p.id,L(l,'See in visualizer','Ver en el simulador'))}</div></article>`).join('')}</div>`;
}
export function guardFeature(l){
 const t=(a,b)=>L(l,a,b);
 return `<section class="section warm"><div class="wrap split"><img class="about-img" src="/media/profiles/guard.webp" loading="lazy" alt="${t('Cutaway of a mesh guard covering the top of a gutter','Corte de una rejilla que cubre la parte superior de una canaleta')}"><div>
 ${sectionLead(t('Gutter guards & screens','Protectores y rejillas'),t('Keep leaves out. Keep the outlets accessible.','Frene las hojas y mantenga las salidas accesibles.'))}
 <p>${t('Prime Gutters can fit guards to new systems or assess an existing run for a retrofit. Bring a photo of the trees over the roof. Broad leaves, pine needles, and seed pods can call for different openings and maintenance.','Prime Gutters puede instalar protectores en sistemas nuevos o evaluar canaletas existentes. Comparta una foto de los árboles sobre el techo. Las hojas anchas, agujas de pino y semillas requieren aberturas y mantenimiento distintos.')}</p>
 <p>${t('Ryan checks the gutter width, roof edge, and how the cover can be opened for cleaning. Periodic inspection still matters, especially after storms.','Ryan revisa el ancho, el borde del techo y el acceso para limpiar. Las inspecciones periódicas siguen siendo importantes, especialmente después de tormentas.')}</p>
 <div class="actions">${aLink(l,'/visualizer/?guard=1',t('Preview a gutter guard','Ver un protector'),'btn cyan')}${aLink(l,'/estimate/?service=gutter-guards',t('Get a guard estimate','Cotizar protectores'))}</div>
 </div></div></section>`;
}
export function projectsOverview(l){
 const t=(a,b)=>L(l,a,b);
 return `<section class="section projects"><div class="wrap">${sectionLead(t('Who we work with','Para quién trabajamos'),t('Gutters for your kind of property.','Canaletas para su tipo de propiedad.'))}
 <div class="project-cards">${projectTypes.map(p=>`<a href="${href(l,projectPath(p))}"><img loading="lazy" src="${p.image}" alt=""><div><h3>${pick(l,p.name)}</h3><p>${pick(l,p.intro)}</p></div></a>`).join('')}</div></div></section>`;
}
export function projectBody(l,p){
 const t=(a,b)=>L(l,a,b);
 const url='/estimate/?service='+p.service+'&project='+p.slug;
 return `<section class="section"><div class="wrap project-detail"><div class="prose">${p.sections.map(([h,b])=>`<article><h2>${pick(l,h)}</h2><p>${pick(l,b)}</p></article>`).join('')}</div><aside class="project-brief"><img src="${({'luxury-modern-mansions':'/media/mansion-eave-detail.webp','home-builders':'/media/profiles/finished-new-home.webp','new-construction':'/media/profiles/new-build.webp','commercial-buildings':'/media/profiles/box.webp','existing-homes':'/media/profiles/repair.webp','older-homes':'/media/profiles/half-round-installed.webp'})[p.slug]}" loading="lazy" alt=""><div><h3>${t('Discuss your project with Ryan','Hable de su proyecto con Ryan')}</h3><p>${t('Include the property town, project stage, and the best time to arrange a visit.','Indique la localidad, la etapa del proyecto y el mejor horario para una visita.')}</p>${aLink(l,url,t('Request a project estimate','Solicitar presupuesto'),'btn cyan')}</div></aside></div></section>`;
}
export function countyMap(l){
 return `<img class="area-map" loading="lazy" width="900" height="470" src="/media/prime-service-map${l==='es'?'-es':''}.svg" alt="${L(l,'Nassau and Suffolk counties shaded across Long Island, with Huntington marked as Prime Gutters’ home base','Los condados de Nassau y Suffolk resaltados en Long Island, con Huntington como sede de Prime Gutters')}">`;
}
export function localDirectory(l,short=false){
 const t=(a,b)=>L(l,a,b);
 return `<div class="location-directory">${counties.map(c=>`<section><h3>${aLink(l,countyPath(c),t(c.name+' County','Condado de '+c.name),'county-heading')}</h3>
 <div class="town-links">${c.municipalities.map(m=>aLink(l,locationPath(c,m.name),m.name,'town-link')).join('')}</div>
 ${short?'':`<details><summary>${t('All '+c.communities.length+' communities','Las '+c.communities.length+' localidades')}</summary>
 <div class="all-places">${c.communities.map(name=>aLink(l,locationPath(c,name),name,'')).join('')}</div></details>`}</section>`).join('')}</div>`;
}
export function areaSummary(l,mapArt='',directory=false){
 const t=(a,b)=>L(l,a,b);
 const indexByTown=new Map();
 for(const match of mapArt.matchAll(/<g\b[^>]*data-place="([^"]+)"[^>]*data-index="(\d+)"/g))indexByTown.set(match[1],Number(match[2]));
 const mapView=mapArt?mapArt.replace(/viewBox="0 0 1280 910"/,'viewBox="0 0 1280 660"'):countyMap(l);
 const groups=counties.map(c=>{
  const towns=[...c.municipalities].sort((a,b)=>(indexByTown.get(a.slug)||0)-(indexByTown.get(b.slug)||0));
  return `<section class="town-key" data-key-county="${c.slug}"><h3><a href="${href(l,countyPath(c))}">${l==='es'?'Condado de '+c.name:c.name+' County'}</a></h3><p>${c.slug==='nassau'?t('3 towns and 2 cities','3 municipios y 2 ciudades'):t('10 towns','10 municipios')}</p><div>${towns.map(m=>`<a href="${href(l,locationPath(c,m.name))}" data-select-place="${m.slug}" data-label="${esc(m.name)}" data-county-name="${c.name}" data-type="${m.kind}" aria-label="${esc(t('Show '+m.name+' on the map','Mostrar '+m.name+' en el mapa'))}"><i aria-hidden="true">${indexByTown.get(m.slug)||''}</i>${esc(m.name)}</a>`).join('')}</div></section>`;
 }).join('');
 const communityCatalog=counties.flatMap(c=>c.communities.map(name=>[name,c.name,href(l,locationPath(c,name))]));
 const search=directory?`<div class="community-search" id="find-community"><label for="find-name">${t('Find your town, village, or hamlet','Busque su municipio, villa o aldea')}</label>
 <input id="find-name" type="search" autocomplete="off" data-community-search placeholder="${t('For example, Huntington Station','Por ejemplo, Huntington Station')}">
 <p data-community-status role="status"></p><ul data-community-results hidden></ul>
 <script type="application/json" data-community-catalog>${JSON.stringify(communityCatalog).replaceAll('<','\\u003c')}</script></div>`:`<a class="textlink community-jump" href="${href(l,'/areas-served/#find-community')}">${t('Find my village or hamlet','Buscar mi villa o aldea')}</a>`;
 const full=href(l,directory?'/estimate/':'/areas-served/');
 return `<div class="coverage-explorer" data-coverage><div class="coverage-heading"><div>${sectionLead(t('Long Island service area','Zona de servicio en Long Island'),t('Every town in Nassau and Suffolk.','Todos los municipios de Nassau y Suffolk.'),t('All 13 towns and both cities are covered, including their villages and hamlets. Select a name or a shaded area to find its local gutter services.','Cubrimos los 13 municipios y ambas ciudades, incluidas sus villas y aldeas. Elija un nombre o una zona sombreada para ver los servicios locales.'))}</div><a class="textlink" href="${href(l,'/estimate/')}">${t('Request a local estimate','Solicitar presupuesto local')}</a></div>
 ${search}<div class="coverage-card"><div class="coverage-map-pane"><div class="coverage-map-scroll" tabindex="0" aria-label="${t('Map of the service area','Mapa de la zona de servicio')}"><div class="coverage-art">${mapView}<span class="map-town-label" data-map-label hidden></span></div></div>
 <div class="map-toolbar"><div class="county-colors"><span><i></i>Nassau</span><span><i></i>Suffolk</span></div><button type="button" data-map-zoom aria-pressed="false">${t('Enlarge map','Ampliar mapa')}</button></div></div>
 <div class="coverage-key-panel">${groups}</div>
 <div class="coverage-result" aria-live="polite"><div><small>${t('Selected service area','Zona seleccionada')}</small><strong data-coverage-label>${t('Nassau & Suffolk counties','Condados de Nassau y Suffolk')}</strong></div><div><a data-coverage-go class="btn ink" href="${full}">${directory?t('Ask about my property','Consultar mi propiedad'):t('See service areas','Ver zonas')}</a><button type="button" class="plain" data-coverage-reset hidden>${t('Show all','Ver todo')}</button></div></div></div></div>`;
}

export const locationEntries = new Map();
for(const c of counties){
 locationEntries.set(countyPath(c),{county:c,name:null});
 for(const n of c.communities)locationEntries.set(locationPath(c,n),{county:c,name:n});
}
export function locationMeta(l,entry){
 const {county:c,name}=entry,t=(a,b)=>L(l,a,b);
 const place=name||(l==='es'?'el condado de '+c.name:c.name+' County');
 const heading=t('Gutter installation & repair in '+place,'Instalación y reparación de canaletas en '+place);
 const detail=name?c.details[name]:null;
 const municipalities=detail?.municipalities?.filter(m=>m!==name)||[];
 const areaText=municipalities.length?t('Serving '+name+' in '+c.name+' County, within '+municipalities.join(' and ')+'.','Servicio en '+name+', condado de '+c.name+', en '+municipalities.join(' y ')+'.'):t('Prime Gutters serves '+place+' on Long Island.','Prime Gutters presta servicio en '+place+', Long Island.');
 return {heading,desc:areaText+' '+t('Call Ryan Moore for seamless installation, repairs, guards, or a commercial estimate.','Llame a Ryan Moore para instalación sin juntas, reparación, protectores o presupuesto comercial.')};
}
function nearPlaces(c,n){
 const current=c.details[n];
 const distance=other=>{
  const point=c.details[other];
  if(!point.lat||!point.lon||!current.lat||!current.lon)return Infinity;
  return Math.pow(point.lat-current.lat,2)+Math.pow((point.lon-current.lon)*Math.cos(current.lat*Math.PI/180),2);
 };
 return c.communities.filter(v=>v!==n).sort((a,b)=>distance(a)-distance(b)||a.localeCompare(b)).slice(0,6);
}
export function localBody(l,{county:c,name}){
 const t=(a,b)=>L(l,a,b);
 if(!name) return `<section class="section"><div class="wrap">${countyMap(l)}
 <div class="local-list-head"><h2>${t(c.name+' towns and communities','Municipios y localidades de '+c.name)}</h2><label>${t('Find a community','Buscar una localidad')}<input type="search" data-find-place placeholder="${t('Enter a town or community','Escriba una localidad')}"></label></div>
 <div class="county-place-list">${c.communities.map(n=>aLink(l,locationPath(c,n),n,'location-result')).join('')}</div>
 <p data-place-result role="status"></p><a class="textlink" href="${c.source}">${t('County municipality directory','Directorio municipal del condado')}</a></div></section>`;
 const municipality=c.municipalities.find(m=>m.name===name);
 const related=municipality?.communities.filter(x=>x!==name)||[];
 const relatedHeading=related.length?t('Communities served in the town of '+name,'Localidades atendidas en el municipio de '+name):t('Nearby communities we also serve','Localidades cercanas que también atendemos');
 const locationQuote='/estimate/?town='+encodeURIComponent(name);
 return `<section class="section"><div class="wrap local-service-grid"><div>
 <p class="eyebrow">${t('Service at your property','Servicio en su propiedad')}</p><h2>${t('Plan your gutter project in '+name+'.','Planifique su proyecto de canaletas en '+name+'.')}</h2>
 <p class="local-byline"><a href="#local-about">${t('Ryan Moore, owner of Prime Gutters','Ryan Moore, propietario de Prime Gutters')}</a> · ${t('Based in Huntington, serving '+name,'Con sede en Huntington y servicio en '+name)}</p>
 <p>${t('For a leak, send Ryan a ground-level photo of the affected corner and the downspout it feeds. For a new installation, share the roof plan or the sides of the building you want included.','Para una fuga, envíe a Ryan una foto de la esquina afectada y su bajante, tomada desde el suelo. Para una instalación nueva, comparta el plano del techo o los lados del edificio que desea incluir.')}</p>
 <div class="actions">${aLink(l,locationQuote,t('Get an estimate in '+name,'Solicitar presupuesto en '+name),'btn cyan')}${ `<a class="textlink" href="#exterior-studio">${t('Compare gutter options','Compare opciones')}</a>`}</div>
 <h3>${relatedHeading}</h3><div class="town-links">${(related.length?related:nearPlaces(c,name)).map(n=>aLink(l,locationPath(c,n),n,'town-link')).join('')}</div>
 </div><aside class="local-options"><h3>${t('What does the property need?','¿Qué necesita la propiedad?')}</h3>
 ${[['seamless-gutter-installation',t('New seamless gutters','Canaletas nuevas sin juntas')],['gutter-repair',t('Leaking or sagging gutters','Canaletas con fugas o caídas')],['commercial-gutters',t('Commercial estimate','Presupuesto comercial')],['gutter-guards',t('Add gutter guards','Añadir protectores')]].map(([s,n])=>aLink(l,locationQuote+'&service='+s,n,'local-option')).join('')}
 <p>${t('Locally owned in Huntington. Field visits are arranged directly with Ryan.','Empresa local de Huntington. Coordine las visitas directamente con Ryan.')}</p>${aLink(l,countyPath(c),t('See all of '+c.name+' County','Ver todo el condado de '+c.name))}</aside></div></section>`;
}
export function taxBody(l){
 const t=(a,b)=>L(l,a,b);
 return `<section class="section"><div class="wrap narrow prose"><h2>${t('Check the project scope first.','Revise primero el alcance del proyecto.')}</h2><p>${t('New York evaluates whether the work adds substantial value or appreciably extends useful life, becomes a permanent part of the property, and is intended to remain there. Routine cleaning and repair are treated differently. Review the state’s classifications with your contractor for the actual work being done.','Nueva York evalúa si la obra agrega valor sustancial o prolonga apreciablemente la vida útil, queda fijada de forma permanente y se realiza con la intención de permanecer. La limpieza y reparación rutinarias tienen otro tratamiento. Revise con el contratista la clasificación estatal de los trabajos previstos.')}</p>
 <h2>${t('Complete system or partial repair?','¿Sistema completo o reparación parcial?')}</h2><p>${t('New York Publication 862 lists installing or replacing an entire gutter and downspout system as a capital improvement. The state lists cleaning, repairs, and replacement of part of a system under repair and maintenance. Ask Ryan to identify the scope on the written estimate.','La Publicación 862 de Nueva York clasifica la instalación o sustitución del sistema completo de canaletas y bajantes como mejora de capital. La limpieza, las reparaciones y la sustitución parcial figuran entre los trabajos de reparación y mantenimiento. Pida a Ryan que detalle el alcance en el presupuesto.')}</p>
 <h2>${t('Give the certificate to your contractor.','Entregue el certificado al contratista.')}</h2><p>${t('For qualifying work, the customer completes Form ST-124 and gives the signed certificate to the contractor. The form contains instructions for both parties. Keep a copy with the project estimate and invoice.','Para trabajos que califican, el cliente completa el formulario ST-124 y entrega el certificado firmado al contratista. El formulario incluye instrucciones para ambas partes. Guarde una copia con el presupuesto y la factura.')}</p>
 <div class="actions"><a class="btn cyan" href="${nyForm}">${t('Open the official NY form (PDF)','Abrir el formulario oficial (PDF)')}</a></div><div class="source-links"><a href="${nyGuidance}">${t('NY Tax Department guidance','Guía del Departamento de Impuestos de NY')}</a><a href="${nyClassifications}">${t('Publication 862 · Work classifications','Publicación 862 · Clasificación de trabajos')}</a></div></div></section>`;
}

