import {L,pick,href,esc,media,origin,tel,phone,faqs,services,yelp,nextdoor,googleReviews} from './data.mjs';
import {projectTypes,systemProfiles} from './projects.mjs';
import {sizePath,taxPath,localDirectory,ownerStory,profileBadges} from './features.mjs';
import {counties} from './places.mjs';

export function systemSettings(l){
 const t=(a,b)=>L(l,a,b);
 return `<fieldset class="system-settings"><legend>${t('Gutter profile & size','Perfil y tamaño')}</legend><div class="system-switch">${systemProfiles.map((p,i)=>`<button type="button" data-profile="${p.id}" aria-pressed="${i===0}">${pick(l,p.short)}</button>`).join('')}</div>
 <button class="copper-preset" type="button" data-studio-copper><i aria-hidden="true"></i>${t('Try copper half-round','Probar media caña en cobre')}</button><label class="guard-toggle"><input type="checkbox" id="system-guard">${t('Include a gutter guard','Incluir un protector')}</label></fieldset>`;
}
export function systemSample(l){
 const t=(a,b)=>L(l,a,b),p=systemProfiles[0];
 const catalog=systemProfiles.map(v=>({id:v.id,title:pick(l,v.name),desc:pick(l,v.desc),image:v.image}));
 return `<div class="system-sample">
 <div><p class="eyebrow">${t('Selected gutter','Canaleta seleccionada')}</p><h2 id="sample-name">${pick(l,p.name)}</h2><p id="sample-info">${pick(l,p.desc)}</p><button type="button" data-show-cutaway class="plain">${t('Inspect this profile','Inspeccionar este perfil')}</button></div></div>
 <script type="application/json" id="system-catalog">${JSON.stringify(catalog).replace(/</g,'\\u003c')}</script>`;
}
export function heroDetail(l){
 const t=(a,b)=>L(l,a,b);
 return `<a class="inspect-eave" href="/media/mansion-eave-detail.webp" data-open-detail><span aria-hidden="true">⊕</span> ${t('See the black gutter detail','Ver el detalle de la canaleta negra')}</a>
 <dialog id="eave-dialog"><div class="detail-dialog-head"><h2>${t('The black gutter at the eave','La canaleta negra en el alero')}</h2><button type="button" data-close-detail aria-label="${t('Close image','Cerrar imagen')}">×</button></div>
 <img loading="lazy" width="1280" height="853" src="/media/mansion-eave-detail.webp" alt="${t('Matte black gutter and offset downspout against a light stone mansion façade','Canaleta negra mate y bajante sobre la fachada de piedra clara de una mansión')}"><p>${t('Illustrative exterior · matte black finish','Exterior ilustrativo · acabado negro mate')}</p></dialog>`;
}
export function footerStory(l){
 const t=(a,b)=>L(l,a,b);
 return `<section class="wrap footer-about"><div><h2>${t('About Prime Gutters','Acerca de Prime Gutters')}</h2><p>${ownerStory(l)}</p><a href="${href(l,'/about/')}">${t('Meet Ryan Moore','Conozca a Ryan Moore')}</a></div>${profileBadges(l)}</section>
 <section class="wrap footer-directory"><h2>${t('Gutters throughout Nassau & Suffolk counties','Canaletas en los condados de Nassau y Suffolk')}</h2>${localDirectory(l)}</section>`;
}
export function assistantHelp(l){
 const t=(a,b)=>L(l,a,b);
 return `<section class="section"><div class="wrap narrow prose"><h2>${t('Information an assistant can use','Información para asistentes')}</h2>
 <p>${t('Look up service coverage, compare gutter profiles, and prepare a free estimate link with the customer’s town and project choices. The customer reviews their details and submits the request on the estimate page.','Consulte cobertura, compare perfiles y prepare un enlace de presupuesto con la localidad y las opciones elegidas. El cliente revisa sus datos y envía la solicitud en el formulario.')}</p>
 <p><strong>Model Context Protocol</strong><br><code>POST ${origin}/mcp</code></p><div class="source-links"><a href="/.well-known/mcp.json">MCP discovery</a><a href="/api/business.json">${t('Business data (JSON)','Datos de la empresa (JSON)')}</a><a href="/llms.txt">llms.txt</a><a href="/sitemap.xml">${t('Bilingual sitemap','Mapa del sitio bilingüe')}</a></div></div></section>`;
}
export function pageGraph(l,path,h,desc,subject){
 const businessId=origin+'/#business',pageUrl=origin+href(l,path);
 const business={'@type':'HomeAndConstructionBusiness','@id':businessId,name:'Prime Gutters',url:origin,telephone:'+16313745916',logo:origin+'/media/brand/prime-gutters-logo.webp',image:origin+media.hero,description:ownerStory(l),address:{'@type':'PostalAddress',addressLocality:'Huntington',addressRegion:'NY',postalCode:'11743',addressCountry:'US'},founder:{'@id':origin+'/#ryan'},sameAs:[yelp,nextdoor,googleReviews],areaServed:counties.map(c=>({'@type':'AdministrativeArea',name:c.name+' County, New York'}))};
 const web={'@id':pageUrl+'#webpage','@type':path==='/about/'?'AboutPage':path==='/contact/'?'ContactPage':'WebPage',url:pageUrl,name:h,description:desc,inLanguage:l,about:{'@id':businessId}};
 const graph=[business,{'@type':'Person','@id':origin+'/#ryan',name:'Ryan Moore',image:origin+'/media/people/ryan-moore.webp',jobTitle:'Owner',worksFor:{'@id':businessId},homeLocation:{'@type':'Place',name:'Huntington, New York'}},web];
 if(path==='/faq/'||path==='/'){
  const questions=faqs.map(([q,a])=>({'@type':'Question',name:pick(l,q),acceptedAnswer:{'@type':'Answer',text:pick(l,a)}}));
  graph.push({'@type':'FAQPage','@id':pageUrl+'#faq',inLanguage:l,mainEntity:questions});
 }
 if(subject?.service||subject?.project||subject?.location){
  const loc=subject.location;
  const service={'@type':'Service','@id':pageUrl+'#service',name:h,description:desc,provider:{'@id':businessId},areaServed:loc?{'@type':'Place',name:(loc.name?loc.name+', ':'')+loc.county.name+' County, NY'}:business.areaServed,url:pageUrl};
  graph.push(service);web.mainEntity={'@id':service['@id']};
 }
 if(path!=='/'){
  const list=[{'@type':'ListItem',position:1,name:L(l,'Home','Inicio'),item:origin+href(l)}];
  if(subject?.location?.name)list.push({'@type':'ListItem',position:2,name:subject.location.county.name+' County',item:origin+href(l,'/areas-served/'+subject.location.county.slug+'-county/')});
  list.push({'@type':'ListItem',position:list.length+1,name:h,item:pageUrl});
  graph.push({'@type':'BreadcrumbList',itemListElement:list});
 }
 return {'@context':'https://schema.org','@graph':graph};
}

