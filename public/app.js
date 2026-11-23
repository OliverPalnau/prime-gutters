const es=document.documentElement.lang==='es';
const t=(en,sp)=>es?sp:en;
const params=new URLSearchParams(location.search);
const read=(storage,key)=>{try{return JSON.parse(window[storage].getItem(key)||'null')}catch{return null}};
const write=(storage,key,value)=>{try{window[storage].setItem(key,JSON.stringify(value))}catch{}};
const remove=(storage,key)=>{try{window[storage].removeItem(key)}catch{}};
const $=(q,scope=document)=>scope.querySelector(q);
const all=(q,scope=document)=>[...scope.querySelectorAll(q)];
for(const a of all('[data-lang]'))a.search=location.search;
document.addEventListener('click',event=>{
 for(const d of all('header details[open]'))if(!d.contains(event.target))d.open=false;
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape')for(const d of all('header details[open]')){d.open=false;$('summary',d)?.focus()}
});

function initializeEstimate(){
 const form=$('#estimate');if(!form)return;
 const next=$('#continue'), back=$('#back'),one=$('#step-one'),two=$('#step-two'),feedback=$('.feedback',form);
 const draftKey='prime-gutters-estimate-v1',draft=read('sessionStorage',draftKey);
 const validDraft=draft&&Date.now()-draft.time<7200000&&draft.context===params.toString()?draft:null;
 const values=validDraft?.fields||{};
 let requestId=validDraft?.id||crypto.randomUUID(),step=1;
 const palette=(params.get('design')||'').slice(0,600);
 const field=name=>form.elements.namedItem(name);
 const chosen=()=>all('[name=services]:checked',form).map(i=>i.value);
 const snapshot=()=>({name:field('name').value,phone:field('phone').value,town:field('town').value,property:field('property').value,visit:field('visit').value,notes:field('notes').value,services:chosen()});
 function remember(){write('sessionStorage',draftKey,{time:Date.now(),id:requestId,context:params.toString(),step,fields:snapshot()})}
 function show(n,focus=false){
  step=n;one.hidden=n!==1;one.disabled=n!==1;two.hidden=n!==2;two.disabled=n!==2;
  form.classList.toggle('second',n===2);
  $('.step-info',form).textContent=n===1?t('Step 1 of 2 · Your project','Paso 1 de 2 · Su proyecto'):t('Step 2 of 2 · Your details','Paso 2 de 2 · Sus datos');
  $('.chosen-summary',form).textContent=all('[name=services]:checked',form).map(c=>c.nextElementSibling.textContent).join(' · ');
  if(palette){const summary=$('#palette-summary');summary.hidden=false;summary.textContent=t('Your design · ','Su diseño · ')+palette}
  feedback.textContent='';if(focus)(n===2?field('name'):$('[name=services]',form)).focus({preventScroll:true});
 }
 const initialServices=validDraft?.fields.services??params.getAll('service').filter(Boolean);
 all('[name=services]',form).forEach(i=>{i.checked=initialServices.includes(i.value)});
 for(const key of ['name','phone','town','property','visit','notes'])if(typeof values[key]==='string')field(key).value=values[key];
 if(!validDraft){
  if(params.has('concern'))field('notes').value=params.get('concern').trim().slice(0,180);
  if(params.has('town'))field('town').value=params.get('town').slice(0,100);
  if(chosen().includes('commercial-gutters'))field('property').value='Commercial';
  if([...field('property').options].some(o=>o.value===params.get('property')))field('property').value=params.get('property');
  const projectNames={'luxury-modern-mansions':t('Luxury or modern mansion','Mansión moderna o de lujo'),'home-builders':t('Home builder','Constructor'),'new-construction':t('New construction','Construcción nueva'),'commercial-buildings':t('Commercial building','Edificio comercial'),'existing-homes':t('Existing home','Vivienda existente'),'older-homes':t('Older home','Casa antigua')};
  if(Object.hasOwn(projectNames,params.get('project')))field('notes').value=t('Project type: ','Tipo de proyecto: ')+projectNames[params.get('project')];
 }
 show((validDraft?draft.step===2:params.has('service'))&&chosen().length?2:1);
 next.addEventListener('click',()=>{if(!chosen().length){feedback.textContent=t('Choose at least one service to continue.','Elija al menos un servicio para continuar.');$('[name=services]',form).focus();return}if(chosen().includes('commercial-gutters')&&field('property').value==='Residential')field('property').value='Commercial';show(2,true);remember()});
 back.addEventListener('click',()=>{show(1,true);remember()});
 form.addEventListener('change',e=>{
  if(e.target.name!=='services'||!e.target.checked)return;
  for(const option of all('[name=services]',form)){
   if(option!==e.target&&(option.value==='gutter-assessment'||e.target.value==='gutter-assessment'))option.checked=false;
  }
  remember();
 });
 form.addEventListener('input',()=>{feedback.textContent='';remember()});
 function textRequest(payload,receipt=false){
  const link=document.createElement('a');
  const opening=receipt?t('Hi Ryan, I requested an estimate.','Hola Ryan, solicité un presupuesto.'):t('Hi Ryan, I would like a gutter estimate.','Hola Ryan, quisiera un presupuesto de canaletas.');
  const details=[opening,receipt||'',payload.name,payload.phone,payload.town,$('.chosen-summary',form).textContent,payload.property,payload.visit,payload.notes,payload.palette].filter(Boolean).join(' · ');
  link.href='sms:+16313745916?body='+encodeURIComponent(details);
  link.textContent=t('Text Ryan my request','Enviar mi solicitud a Ryan');
  link.className='btn cyan';return link;
 }
 function offerText(payload){
  feedback.textContent=t('Open the message below and press Send to request your estimate. ','Abra el mensaje y pulse Enviar para solicitar su presupuesto. ');
  feedback.append(textRequest(payload));
 }
 if(form.dataset.delivery==='sms')$('[type=submit]',form).textContent=t('Prepare my text to Ryan','Preparar mi mensaje a Ryan');
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(step!==2)return;
  const payload={id:requestId,...snapshot(),palette,lang:es?'es':'en',consent:field('consent').checked,website:field('website').value};
  const digits=payload.phone.replace(/\D/g,'');if(digits.length<7||digits.length>15){feedback.textContent=t('Enter a phone number with 7 to 15 digits.','Escriba un teléfono de 7 a 15 dígitos.');field('phone').focus();return}
  if(form.dataset.delivery==='sms'){offerText(payload);return}
  const button=$('[type=submit]',form);button.disabled=true;back.disabled=true;form.setAttribute('aria-busy','true');feedback.textContent=t('Saving your request…','Guardando su solicitud…');
  try{
   const response=await fetch('/api/estimates',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
   const data=await response.json();
   if(!response.ok){if(response.status===409){requestId=crypto.randomUUID();remember()}throw Error('request')}
   if(data.delivery==='sms'){offerText(payload);return}
   remove('sessionStorage',draftKey);form.hidden=true;
   const receipt=$('#receipt');receipt.hidden=false;receipt.tabIndex=-1;
   const h=document.createElement('h3');h.textContent=t('Your request is saved.','Su solicitud se ha guardado.');
   const p=document.createElement('p');p.textContent=t('Estimate reference ','Referencia del presupuesto ')+data.reference+t('. Contact Ryan directly to confirm a visit.','. Póngase en contacto con Ryan para confirmar una visita.');
   const actions=document.createElement('div');actions.className='receipt-actions';
   actions.append(textRequest(payload,data.reference));
   const call=document.createElement('a');call.href='tel:+16313745916';call.className='textlink';call.textContent='631-374-5916';actions.append(call);receipt.append(h,p,actions);receipt.focus();
  }catch{
   feedback.textContent=t('Your request hasn’t been saved. Try again or send the details directly to Ryan. ','Su solicitud no se ha guardado. Inténtelo de nuevo o envíe los detalles a Ryan. ');
   const direct=textRequest(payload);direct.className='textlink';
   feedback.append(direct);
  }
  finally{button.disabled=false;back.disabled=false;form.removeAttribute('aria-busy')}
 });
}
initializeEstimate();
const colorNames={'Aspen White':'Blanco álamo','Jet Black':'Negro azabache','White':'Blanco','Black':'Negro','Bronze':'Bronce','Copper':'Cobre','Royal Brown':'Marrón oscuro','Almond':'Almendra','Clay':'Arcilla','Charcoal':'Carbón','Dove Gray':'Gris paloma','Forest Green':'Verde bosque','Musket Brown':'Marrón mosquete','Linen':'Lino','Sandstone':'Arenisca','Terracotta':'Terracota','Slate Blue':'Azul pizarra','Galvanized':'Galvanizado','Slate':'Pizarra','Weathered Wood':'Madera envejecida','Driftwood':'Madera de deriva','Pewter Gray':'Gris peltre','Barkwood':'Corteza','Sage':'Salvia','Warm White':'Blanco cálido','Coastal Gray':'Gris costero','Harbor Blue':'Azul puerto','Deep Navy':'Azul marino','Woodland':'Bosque','Olive':'Oliva','Barn Red':'Rojo granero','Bright White':'Blanco brillante','Soft White':'Blanco suave','Warm Cream':'Crema cálida','Natural Taupe':'Topo natural'};
const localName=n=>es?(colorNames[n]||n):n;
function canonicalFinish(name){
 if(name==='White')return 'Aspen White';
 if(name==='Black')return 'Jet Black';
 return name;
}
const isNaturalCopper=(profile,finish)=>profile==='half-round'&&finish==='Copper';
function initializeGutterInspector(root){
 const panel=$('#gutter-inspector',root),diagram=$('#gutter-cutaway',panel),guard=$('#inspector-guard',diagram);
 const dialog=$('.inspector-dialog',root),slot=$('#inspector-slot',root),expand=$('.inspector-expand',panel);
 const focusButtons=all('[data-focus-detail]',panel);
 const planes=JSON.parse($('#inspector-planes',root).textContent);
 const windows={profile:'138 69 752 486',trough:'240 190 486 314',lip:'482 206 365 236'};
 const focusNotes={profile:t('Section at the roof edge','Corte en el borde del techo'),trough:t('Opening and interior channel','Abertura y canal interior'),lip:t('Front lip and outer face','Borde y cara exterior')};
 let focus=Object.hasOwn(windows,params.get('focus'))?params.get('focus'):'profile',lastProfile='';
 function setFocus(key){
  focus=key;diagram.setAttribute('viewBox',windows[key]);
  for(const b of focusButtons)b.setAttribute('aria-pressed',String(b.dataset.focusDetail===key));
  $('[data-inspector-focus-note]',panel).textContent=focusNotes[key];
 }
 const between=(a,b,f)=>a.map((n,i)=>+(n+(b[i]-n)*f).toFixed(1));
 function line(a,b){return 'M'+a.join(' ')+'L'+b.join(' ')}
 function changeProfile(profile){
  const [a,b,c,d]=planes[profile.id];
  $('#inspector-metal',diagram).setAttribute('href','/media/inspector/'+profile.id+'-light.webp');
  $('[data-screen-bed]',guard).setAttribute('points',[a,b,c,d].map(p=>p.join(',')).join(' '));
  const lines=[];
  for(let n=1;n<84;n++)lines.push(line(between(a,b,n/84),between(d,c,n/84)));
  for(let n=1;n<27;n++)lines.push(line(between(a,d,n/27),between(b,c,n/27)));
  $('[data-screen-mesh]',guard).setAttribute('d',lines.join(''));
  $('[data-screen-edge]',guard).setAttribute('d',line(a,b)+line(c,d));
  lastProfile=profile.id;
 }
 for(const b of focusButtons)b.addEventListener('click',()=>setFocus(b.dataset.focusDetail));
 expand.addEventListener('click',()=>{
  $('.dialog-inspector-slot',dialog).append(panel);expand.hidden=true;dialog.showModal();
  $('[data-close-inspector]',dialog).focus();
 });
 $('[data-close-inspector]',dialog).addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{slot.append(panel);expand.hidden=false;expand.focus({preventScroll:true})});
 setFocus(focus);
 return {
  setFocus,getFocus:()=>focus,
  draw(profile,hex,finish,hasGuard){
   const natural=isNaturalCopper(profile.id,finish);
   const finishName=natural?t('Natural copper','Cobre natural'):localName(finish);
   const art=natural?'/media/inspector/natural-copper-cutaway.webp':profile.image;
   const base=$('#inspector-base',diagram);
   if(base.getAttribute('href')!==art)base.setAttribute('href',art);
   $('#inspector-metal',diagram).setAttribute('display',natural?'none':'inline');
   if(lastProfile!==profile.id)changeProfile(profile);
   for(const [index,channel] of ['R','G','B'].entries()){
    const c=parseInt(hex.slice(1+index*2,3+index*2),16)/255;
    const table=[.18*c+.008,.50*c+.015,.83*c+.025,.80*c+.16,.49*c+.50];
    $('#metal-finish-filter feFunc'+channel,diagram).setAttribute('tableValues',table.map(n=>n.toFixed(4)).join(' '));
   }
   guard.setAttribute('display',hasGuard?'inline':'none');
   const caption=profile.title+' · '+finishName+(hasGuard?t(' · With guard',' · Con protector'):'');
   $('[data-inspector-caption]',panel).textContent=caption;diagram.setAttribute('aria-label',caption);
  }
 };
}
async function initializeDesigner(){
 const root=$('#designer');if(!root)return;
 const [options,catalog]=await Promise.all(['/finishes.json','/roof-finishes.json'].map(async path=>{
  const r=await fetch(path+'?v=__FINISH_REVISION__');if(!r.ok)throw Error('colors');return r.json()
 }));
 const model=$('.house-view svg',root),tabs=all('[data-surface]',root), keys=tabs.map(b=>b.dataset.surface);
 const names=Object.fromEntries(tabs.map(b=>[b.dataset.surface,b.textContent]));
 const storageKey='prime-gutters-palette-v1';
 const profiles=JSON.parse($('#system-catalog',root).textContent);
 const inspector=initializeGutterInspector(root);
 const defaults={profile:'k-5',guard:false,gutter:'Aspen White',roof:'Charcoal',siding:'Harbor Blue',trim:'Bright White',window:'Black',door:'Barn Red',shutters:false};
 const safeColor=v=>/^#[\da-fA-F]{6}$/.test(v);
 function lookup(key,id){
  const found=options[key].find(([name])=>name===id);if(found)return found;
  if(key==='roof'&&/^m\d+$/.test(id)){const row=catalog[Number(id.slice(1))];if(row)return [row.slice(0,3).join(' · '),row[3]]}
  if(key==='gutter'&&safeColor(id))return [id.toUpperCase(),id];
  return options[key].find(([name])=>name===defaults[key]);
 }
 const saved=read('localStorage',storageKey), state={...defaults};
 for(const key of keys){const raw=params.get(key)??saved?.[key];const candidate=key==='gutter'?canonicalFinish(raw):raw;if(typeof candidate==='string'){const found=lookup(key,candidate);if(found[0]===candidate||found[0]===candidate.toUpperCase()||key==='roof'&&/^m\d+$/.test(candidate)&&found[0]!==defaults.roof)state[key]=candidate}}
 const initialProfile=params.get('profile')??saved?.profile;
 if(profiles.some(p=>p.id===initialProfile))state.profile=initialProfile;
 state.guard=params.has('guard')?params.get('guard')==='1':saved?.guard===true;
 state.shutters=params.has('shutters')?params.get('shutters')==='1':saved?.shutters===true;
 let surface=keys.includes(params.get('surface'))?params.get('surface'):'gutter';
 const viewButtons=all('[data-view]',root);
 let view=['whole','detail'].includes(params.get('view'))?params.get('view'):(surface==='gutter'?'detail':'whole');
 function showView(mode){
  view=mode;
  for(const b of viewButtons)b.setAttribute('aria-pressed',String(b.dataset.view===mode));
  $('.house-view',root).hidden=mode!=='whole';$('#inspector-slot',root).hidden=mode!=='detail';
  // The profile description sits below the illustration in either view.
  $('.system-sample',root).classList.toggle('reading-detail',mode==='detail');
 }
 const feedback=$('.studio-feedback'), target=$('.studio-actions a'),base=target.getAttribute('href');
 function query(){const q=new URLSearchParams;for(const key of keys)q.set(key,state[key]);q.set('shutters',state.shutters?'1':'0');q.set('surface',surface);q.set('view',view);if(view==='detail')q.set('focus',inspector.getFocus());q.set('profile',state.profile);q.set('guard',state.guard?'1':'0');return q}
 function paint(){
  for(const key of keys){const [name,hex]=lookup(key,state[key]);if(key==='roof'){
   ['red','green','blue'].forEach((c,i)=>model.querySelector('#roof-'+c).setAttribute('slope',String(parseInt(hex.slice(1+i*2,3+i*2),16)/[45,47,48][i])));
  }else model.style.setProperty('--'+key,hex)}
  model.style.setProperty('--shutter',lookup('door',state.door)[1]);model.style.setProperty('--shutter-display',state.shutters?'inline':'none');
  const profile=profiles.find(p=>p.id===state.profile);
  const [finish,hex]=lookup('gutter',state.gutter);
  inspector.draw(profile,hex,finish,state.guard);
  $('#house-copper',model).setAttribute('display',isNaturalCopper(profile.id,finish)?'inline':'none');
  const geometry={'k-5':[8,1.15,.25],'k-6':[11,1.4,.29],'half-round':[10,2.8,.49],'box':[13,.9,.17]}[profile.id];
  const [depth,highlight,opacity]=geometry;
  $('#eave-profile-mask',model).setAttribute('stroke-width',depth);
  const lip=$('#eave-lip',model),shade=$('#eave-shade',model),mesh=$('#eave-guard',model);
  const offset=depth/2-3;
  lip.setAttribute('transform','translate(0 '+(-offset)+')');
  lip.setAttribute('stroke-width',highlight);lip.setAttribute('opacity',opacity);
  shade.setAttribute('transform','translate(0 '+offset+')');
  shade.setAttribute('stroke-width',profile.id==='half-round'?2.6:1.2);
  mesh.setAttribute('transform','translate(0 '+(-offset)+')');
  mesh.setAttribute('display',state.guard?'inline':'none');
  $('#system-guard',root).checked=state.guard;
  for(const b of all('[data-profile]',root))b.setAttribute('aria-pressed',String(b.dataset.profile===state.profile));
  $('#sample-name',root).textContent=profile.title;$('#sample-info',root).textContent=profile.desc;
  $('#shutters').checked=state.shutters;
  $('#current-look').textContent=profile.title+' · '+localName(lookup('gutter',state.gutter)[0])+(state.guard?t(' · Guard',' · Protector'):'');
  $('#surface-title').textContent=names[surface]+' · '+localName(lookup(surface,state[surface])[0]);
  const brief=profile.title+(state.guard?t(' with gutter guards',' con protectores'):'')+' · '+keys.map(key=>names[key]+' — '+localName(lookup(key,state[key])[0])).join(', ')+(state.shutters?t(', shutters on',', con contraventanas'):'');
  const quoteLink=new URL(base,location.origin);
  if(state.guard)quoteLink.searchParams.append('service','gutter-guards');
  quoteLink.searchParams.set('design',brief);target.href=quoteLink.href;
  for(const a of all('.head-quote,.bottom-cta .btn'))a.href=quoteLink.href;
 }
 function controls(){
  for(const b of tabs)b.setAttribute('aria-pressed',String(b.dataset.surface===surface));
  const grid=$('#swatches');grid.replaceChildren();
  for(const [name,hex] of options[surface]){
   const b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(state[surface]===name));b.style.setProperty('--sample',hex);
   b.append(document.createElement('i'),document.createTextNode(localName(name)));
   b.addEventListener('click',()=>{state[surface]=name;feedback.textContent='';controls();paint();const current=all('button',grid).find(i=>i.getAttribute('aria-pressed')==='true');current?.focus({preventScroll:true})});grid.append(b)
  }
  const extra=$('.extra-finish');extra.replaceChildren();
  if(surface==='gutter'){
   const lab=document.createElement('label'),input=document.createElement('input');input.type='color';input.value=lookup('gutter',state.gutter)[1];lab.append(input,document.createTextNode(t('Try a custom color','Pruebe un color personalizado')));extra.append(lab);
   input.addEventListener('input',()=>{state.gutter=input.value;all('button',grid).forEach(b=>b.setAttribute('aria-pressed','false'));feedback.textContent='';paint()});
  }
  if(surface==='roof'){
   const label=document.createElement('label');label.textContent=t('Manufacturer roof colors','Colores de tejas por fabricante');const select=document.createElement('select');
   select.append(new Option(t('Choose a catalog finish','Elija un acabado del catálogo'),''));
   catalog.forEach(([brand,line,c],i)=>select.append(new Option(brand+' · '+line+' · '+c,'m'+i)));
   select.value=state.roof.startsWith('m')?state.roof:'';label.append(select);extra.append(label);
   select.addEventListener('change',()=>{if(select.value){state.roof=select.value;all('button',grid).forEach(b=>b.setAttribute('aria-pressed','false'));feedback.textContent='';paint()}});
  }
 }
 for(const b of all('[data-profile]',root))b.addEventListener('click',()=>{state.profile=b.dataset.profile;feedback.textContent='';paint()});
 $('#system-guard',root).addEventListener('change',e=>{state.guard=e.target.checked;feedback.textContent='';paint()});
 tabs.forEach(b=>b.addEventListener('click',()=>{surface=b.dataset.surface;showView(surface==='gutter'?'detail':'whole');feedback.textContent='';controls();paint()}));
 for(const b of viewButtons)b.addEventListener('click',()=>showView(b.dataset.view));
 $('[data-show-cutaway]',root).addEventListener('click',()=>{
  showView('detail');$('.inspector-focus button',root).focus({preventScroll:true});$('#house-preview',root).scrollIntoView({block:'start'});
 });
 $('[data-studio-copper]',root).addEventListener('click',()=>{
  state.profile='half-round';state.gutter='Copper';surface='gutter';showView('detail');feedback.textContent='';controls();paint();
 });
 $('#shutters').addEventListener('change',e=>{state.shutters=e.target.checked;feedback.textContent='';paint()});
 $('#save-look').addEventListener('click',()=>{write('localStorage',storageKey,state);history.replaceState(null,'',location.pathname+'?'+query());all('[data-lang]').forEach(a=>a.search=location.search);feedback.replaceChildren(document.createTextNode(t('Design saved. ','Diseño guardado. ')));const b=document.createElement('button');b.className='plain';b.textContent=t('Copy design link','Copiar enlace');b.onclick=async()=>{try{await navigator.clipboard.writeText(location.href);b.textContent=t('Link copied','Enlace copiado')}catch{feedback.textContent=t('Copy the page address to share this design.','Copie la dirección de la página para compartir la paleta.')}};feedback.append(b)});
 $('#reset').addEventListener('click',()=>{Object.assign(state,defaults);surface='gutter';showView('detail');inspector.setFocus('profile');remove('localStorage',storageKey);history.replaceState(null,'',location.pathname);all('[data-lang]').forEach(a=>a.search='');controls();paint();feedback.textContent=t('Original design restored.','Se restablecieron los colores originales.')});
 showView(view);controls();paint();
}
initializeDesigner().catch(()=>{const msg=$('.studio-feedback');if(msg)msg.textContent=t('Colors could not load. Refresh to try again.','No se pudieron cargar los colores. Actualice la página.')});
const comparisonControl=$('#finish-compare');
if(comparisonControl)comparisonControl.addEventListener('input',()=>{
 $('.comparison').style.setProperty('--position',comparisonControl.value+'%');
 $('#comparison-white').setAttribute('width',String(680*Number(comparisonControl.value)/100));
});

for(const flow of all('[data-capacity]')){
 const rows=JSON.parse(flow.dataset.capacity),slope=$('[data-slope]',flow);
 slope.addEventListener('change',()=>{
  const row=rows.find(v=>v.slope===slope.value);
  $('[data-five]',flow).textContent=row.fiveGpm;
  $('[data-six]',flow).textContent=row.sixGpm;
  $('[data-percent]',flow).textContent=row.percent;
  $('[data-five-bar]',flow).style.width=(row.fiveGpm/row.sixGpm*100)+'%';
 });
}
const detail=$('#eave-dialog'),opener=$('[data-open-detail]');
if(detail&&opener&&typeof detail.showModal==='function'){
 opener.addEventListener('click',event=>{event.preventDefault();detail.showModal()});
 $('[data-close-detail]',detail).addEventListener('click',()=>detail.close());
 detail.addEventListener('click',event=>{if(event.target===detail)detail.close()});
 detail.addEventListener('close',()=>opener.focus({preventScroll:true}));
}
const filter=$('[data-find-place]');
if(filter){
 const places=all('.location-result'),result=$('[data-place-result]');
 filter.addEventListener('input',()=>{
  const search=filter.value.trim().toLocaleLowerCase();
  let found=0;
  for(const a of places){a.hidden=!a.textContent.toLocaleLowerCase().includes(search);if(!a.hidden)found++}
  result.textContent=search?t(found+' matching communities',found+' localidades encontradas'):'';
 });
}

function initializeCommunitySearch(){
 const input=$('[data-community-search]');
 if(!input)return;
 const list=$('[data-community-results]'),status=$('[data-community-status]');
 const entries=JSON.parse($('[data-community-catalog]').textContent);
 const normalize=value=>value.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 input.addEventListener('input',()=>{
  const query=normalize(input.value);
  const rank=name=>name===query?0:name.startsWith(query)?1:2;
  const matches=query?entries.filter(([name])=>normalize(name).includes(query)).sort(([a],[b])=>rank(normalize(a))-rank(normalize(b))||a.localeCompare(b)):[];
  list.replaceChildren();
  for(const [name,county,path] of matches.slice(0,8)){
   const li=document.createElement('li'),a=document.createElement('a');
   a.href=path;a.textContent=name+' · '+t(county+' County','Condado de '+county);li.append(a);list.append(li);
  }
  list.hidden=!matches.length;
  status.textContent=!query?'':!matches.length?t('No matching community. Call Ryan at 631-374-5916 to check your address.','No hay coincidencias. Llame a Ryan al 631-374-5916 para consultar su dirección.'):
    matches.length>8?t('Showing the first 8 of '+matches.length+' matches. Keep typing to narrow the list.','Se muestran 8 de '+matches.length+' resultados. Siga escribiendo para filtrar.'):t('Matches: ','Coincidencias: ')+matches.length;
 });
}
initializeCommunitySearch();

function initializeFinishPicker(){
 const board=$('[data-finish-board]');
 if(!board)return;
 const stage=$('.finish-stage',board),base=$('.finish-base',stage),light=$('.finish-light-layer',stage);
 const colors=all('[data-finish]',board),styles=all('[data-installed-profile]',board);
 const studio=$('[data-finish-studio]',board),detail=$('[data-finish-detail]',board),quote=$('[data-finish-quote]',board);
 const isColorPage=location.pathname.endsWith('/gutter-colors/');
 let style=styles.find(b=>b.dataset.installedProfile===params.get('profile'))||styles[0];
 let color=colors.find(b=>b.dataset.finish===canonicalFinish(params.get('gutter')))||colors.find(b=>b.dataset.finish==='Jet Black');
 let shownArt='k-5',shownStyle=styles[0],shownColor=colors.find(b=>b.dataset.finish==='Jet Black');
 let pendingArt='',generation=0;
 const tint=$('.finish-color-layer',stage);
 function updatePhoto(profile,finish){
  const natural=isNaturalCopper(profile,finish);
  const art=natural?'natural-copper':profile;
  function commitTint(){stage.style.setProperty('--finish',color.dataset.hex);shownColor=color}
  if(art===shownArt){
   if(pendingArt)generation++;
   pendingArt='';stage.setAttribute('aria-busy','false');commitTint();return;
  }
  if(pendingArt===art)return;
  pendingArt=art;
  const token=++generation;
  const prefix='/media/finishes/'+(profile==='k-5'?'eave':profile);
  const urls=natural?['/media/finishes/natural-copper-installed.webp']:[prefix+'-base.webp',prefix+'-mask.png',prefix+'-light.webp'];
  stage.setAttribute('aria-busy','true');
  Promise.all(urls.map(src=>new Promise((ok,fail)=>{const img=new Image();img.onload=ok;img.onerror=fail;img.src=src})))
   .then(()=>{
    if(token!==generation)return;
    base.src=urls[0];base.alt=natural?t('Natural copper half-round, rolled edge, copper hangers and round downspout','Canaleta semicircular de cobre natural con borde enrollado, soportes de cobre y bajante redonda'):style.dataset.label+' · '+t('gutter and downspout on a home','canaleta y bajante en una casa');
    tint.hidden=natural;light.hidden=natural;
    if(!natural){light.src=urls[2];stage.style.setProperty('--profile-mask','url("'+urls[1]+'")')}
    commitTint();shownArt=art;shownStyle=style;pendingArt='';stage.dataset.shown=profile;stage.setAttribute('aria-busy','false');
   }).catch(()=>{
    if(token!==generation)return;
    pendingArt='';style=shownStyle;color=shownColor;update(true);
    $('[data-installed-feedback]',board).textContent=t('This preview could not load. Select the profile to retry.','No se pudo cargar la vista. Seleccione el perfil para reintentar.');
   });
 }
 function update(updateAddress){
  $('[data-installed-feedback]',board).textContent='';
  const profile=style.dataset.installedProfile,finish=color.dataset.finish,hex=color.dataset.hex;
  for(const b of styles)b.setAttribute('aria-pressed',String(b===style));
  for(const b of colors)b.setAttribute('aria-pressed',String(b===color));
  updatePhoto(profile,finish);
  $('[data-finish-dot]',board).style.background=hex;
  $('[data-installed-style]',board).textContent=style.dataset.label;
  $('[data-installed-note]',board).textContent=isNaturalCopper(profile,finish)?t('Natural copper catches the light along the rolled rim, curved hangers, and round elbow. Its color deepens as it weathers.','El cobre natural refleja la luz en el borde enrollado, los soportes curvos y el codo redondo. Su color se oscurece con el tiempo.'):style.dataset.note;
  $('[data-finish-name]',board).textContent=color.innerText.trim();
  for(const [link,view] of [[studio,'whole'],[detail,'detail']]){
   const url=new URL(link.href);url.searchParams.set('gutter',finish);url.searchParams.set('profile',profile);url.searchParams.set('view',view);link.href=url.href;
  }
  const q=new URL(quote.href);q.searchParams.set('design',style.dataset.label+' · '+color.innerText.trim());quote.href=q.href;
  if(isColorPage)for(const a of all('.head-quote,.bottom-cta .btn'))a.href=q.href;
  if(updateAddress&&isColorPage){
   const u=new URL(location.href);u.searchParams.set('gutter',finish);u.searchParams.set('profile',profile);
   history.replaceState(null,'',u);for(const a of all('[data-lang]'))a.search=u.search;
  }
 }
 update(false);
 for(const b of colors)b.addEventListener('click',()=>{color=b;update(true)});
 for(const b of styles)b.addEventListener('click',()=>{style=b;update(true)});
 $('[data-installed-copper]',board).addEventListener('click',()=>{
  style=styles.find(b=>b.dataset.installedProfile==='half-round');color=colors.find(b=>b.dataset.finish==='Copper');update(true);
 });
}
function initializeCoverage(){
 const root=$('[data-coverage]');if(!root)return;
 const links=all('[data-select-place]',root),label=$('[data-coverage-label]',root),go=$('[data-coverage-go]',root);
 const reset=$('[data-coverage-reset]',root),zoom=$('[data-map-zoom]',root),art=$('.coverage-art',root);
 const defaultState={label:label.textContent,link:go.href,action:go.textContent};
 function select(link){
  const slug=link?.dataset.selectPlace;
  for(const a of links){a.setAttribute('aria-pressed',String(a===link))}
  for(const g of all('.pgmap-place',art))g.classList.toggle('is-active',Boolean(link)&&g.dataset.place===slug);
  root.classList.toggle('has-town',Boolean(link));
  const tag=$('[data-map-label]',art),marker=$('.pgmap-place.is-active .pgmap-badge-dot',art);
  tag.hidden=!marker;
  if(marker){
   const frame=$('svg',art).viewBox.baseVal;
   tag.textContent=link.dataset.label;
   tag.style.setProperty('--town-x',100*(Number(marker.getAttribute('cx'))-frame.x)/frame.width+'%');
   tag.style.setProperty('--town-y',100*(Number(marker.getAttribute('cy'))-frame.y)/frame.height+'%');
  }
  label.textContent=link?link.dataset.label+' · '+t(link.dataset.countyName+' County','Condado de '+link.dataset.countyName):defaultState.label;
  go.textContent=link?t('View local services','Ver servicios locales'):defaultState.action;
  go.href=link?link.href:defaultState.link;reset.hidden=!link;
 }
 for(const a of links){
  a.setAttribute('role','button');a.setAttribute('aria-pressed','false');
  a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;e.preventDefault();select(a)});
  a.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();a.click()}});
 }
 art.addEventListener('click',e=>{
  const g=e.target.closest('[data-place],[data-key-place],[data-map-home]');
  if(g)select(links.find(a=>a.dataset.selectPlace===(g.dataset.place||g.dataset.keyPlace||g.dataset.mapHome)));
 });
 reset.addEventListener('click',()=>{const active=links.find(a=>a.getAttribute('aria-pressed')==='true');select(null);active?.focus({preventScroll:true})});
 zoom.addEventListener('click',()=>{
  const on=root.classList.toggle('map-enlarged');
  zoom.setAttribute('aria-pressed',String(on));zoom.textContent=on?t('Fit full map','Ajustar mapa completo'):t('Enlarge map','Ampliar mapa');
  const scroll=$('.coverage-map-scroll',root);
  if(on){const selected=$('.pgmap-place.is-active',art);
   const bounds=selected?.getBoundingClientRect(),view=scroll.getBoundingClientRect();
   scroll.scrollLeft=bounds?scroll.scrollLeft+bounds.left+bounds.width/2-view.left-view.width/2:(scroll.scrollWidth-scroll.clientWidth)/2;
  }else{scroll.scrollLeft=0;scroll.scrollTop=0}
 });
}
function initializeMotion(){
 if(!matchMedia('(prefers-reduced-motion: no-preference)').matches||!('IntersectionObserver' in window)||!Element.prototype.animate)return;
 const blocks=all('.section-title,.service-grid article,.size-card,.project-cards>a,.metal-grid>a,.finish-board,.coverage-card,.winter-grid figure,.system-sample,.footer-contact-row');
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){
   const el=entry.target;observer.unobserve(el);
   el.animate([{opacity:.64,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],
    {duration:540,easing:'cubic-bezier(.2,.7,.25,1)'});
  }
 },{threshold:.05});
 for(const b of blocks)observer.observe(b);
}
initializeFinishPicker();
initializeCoverage();
initializeMotion();

const invoiceNumber=document.querySelector('#invoice-number');
if(invoiceNumber){
 const invoiceLinks=all('[data-invoice-message]');
 function updateInvoiceLinks(){
  const number=invoiceNumber.value.trim();
  for(const link of invoiceLinks){
   const message=link.dataset.invoiceMessage+(number?' #'+number:'')+'.';
   const target=new URL(link.href);
   target.search='?body='+encodeURIComponent(message);
   link.href=target.href;
  }
 }
 invoiceNumber.addEventListener('input',updateInvoiceLinks);
 window.addEventListener('pageshow',updateInvoiceLinks);
}

// Keep the live image in place while compact controls scroll under it.
function initializeMobilePreview(root,preview,panel,notes){
 if(!root)return;
 const buttons=all('[data-design-mode]',root);
 const anchors=notes.map(selector=>{
  const node=$(selector,root),marker=document.createComment('preview detail');
  node.before(marker);
  return {node,marker};
 });
 const small=matchMedia('(max-width: 760px)');
 const header=$('header');
 function measure(){
  root.style.setProperty('--preview-top',header.getBoundingClientRect().height+'px');
  root.style.setProperty('--pinned-height',preview.getBoundingClientRect().height+'px');
 }
 function arrange(){
  root.classList.toggle('compact-designer',small.matches);
  for(const {node,marker} of anchors){
   if(small.matches)panel.append(node);else marker.after(node);
  }
  measure();
 }
 root.dataset.designMode='colors';
 for(const button of buttons)button.addEventListener('click',()=>{
  root.dataset.designMode=button.dataset.designMode;
  for(const option of buttons)option.setAttribute('aria-pressed',String(option===button));
 });
 small.addEventListener('change',arrange);
 arrange();
 if('ResizeObserver' in window){
  const sizes=new ResizeObserver(measure);
  sizes.observe(header);sizes.observe(preview);
 }else window.addEventListener('resize',measure);
}
initializeMobilePreview($('[data-finish-board]'),$('.finish-figure'),$('.finish-panel'),['.installed-caption-note']);
initializeMobilePreview($('#designer'),$('.design-photo'),$('.design-panel'),['.system-sample','.sample-note']);
