import {contactPath,acceptContact} from './contact.mjs';
import {assessment} from './homeowner.mjs';
import {mcpEndpoint,businessFacts,assistantIndex} from './assistants.mjs';
import {paths,renderPage} from './pages.mjs';
import {origin,href,services} from './data.mjs';

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
const plain=(body,type,status=200)=>new Response(body,{status,headers:{'content-type':type+';charset=utf-8','x-content-type-options':'nosniff'}});
const allowed=new Set([...services,assessment].map(service=>service.slug));
const reference=id=>'PG-'+id.slice(0,8).toUpperCase();
function normalized(b){
 if(!b||typeof b!=='object'||b.consent!==true||b.website||!Array.isArray(b.services)||!b.services.length||b.services.length>allowed.size||!b.services.every(s=>allowed.has(s)))return null;
 if(typeof b.id!=='string'||!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(b.id))return null;
 const limits={name:90,phone:30,town:100,notes:1200,palette:600};
 for(const [k,max] of Object.entries(limits))if(typeof b[k]!=='string'||b[k].length>max)return null;
 if(!b.name.trim()||!b.town.trim()||!/^\d{7,15}$/.test(b.phone.replace(/\D/g,''))||!['Residential','Commercial','Multifamily'].includes(b.property)||!['Flexible','Morning','Afternoon'].includes(b.visit)||!['en','es'].includes(b.lang))return null;
 return [b.name.trim(),b.phone.trim(),b.town.trim(),b.property,JSON.stringify([...new Set(b.services)].sort()),b.visit,b.notes.trim(),b.palette.trim(),b.lang];
}
const fields=['name','phone','town','property_type','services','visit_preference','notes','palette','language'];
async function estimate(req,env){
 if(req.method!=='POST')return json({error:'Method not allowed'},405);
 if(req.headers.has('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origin mismatch'},403);
 if(!req.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
 if(Number(req.headers.get('content-length'))>12000)return json({error:'Content too large'},413);
 let b;try{const raw=await req.text();if(raw.length>12000)return json({error:'Content too large'},413);b=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
 const row=normalized(b);if(!row)return json({error:'Check project details'},422);
 if(env?.smsEstimates)return json({delivery:'sms'});
 try{
  if(env?.storeEstimate){
   const stored=await env.storeEstimate(b.id,Object.fromEntries(fields.map((key,index)=>[key,row[index]])));
   return stored===409?json({error:'Request already used'},409):json({reference:reference(b.id)},stored);
  }
  const inserted=await env.DB.prepare('INSERT INTO estimates (request_id,'+fields.join(',')+') VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(b.id,...row).run();
  if(!inserted.meta?.changes){
   const existing=await env.DB.prepare('SELECT '+fields.join(',')+' FROM estimates WHERE request_id=?').bind(b.id).first();
   if(!existing||!fields.every((f,i)=>existing[f]===row[i]))return json({error:'Request already used'},409);
  }
  return json({reference:reference(b.id)},inserted.meta?.changes?201:200);
 }catch{return json({error:'Estimate storage temporarily unavailable'},503)}
}
export function createSite(model,assets){
 const mapSource={};
 return {async fetch(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(path===contactPath || path==='/es/contact/') {
   const language=path.startsWith('/es/')?'es':'en';
   const headers={'content-type':'text/html; charset=utf-8','cache-control':'no-store'};
   if(request.method==='POST'){
    const result=await acceptContact(request,env,language);
    if(result.status===303)return new Response(null,{status:303,headers:{location:path+'?received=1','cache-control':'no-store'}});
    return new Response(renderPage(language,contactPath,model,'',result.state),{status:result.status,headers});
   }
   if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD, POST'}});
   const state={received:url.searchParams.get('received')==='1',unavailable:!env?.DB&&!env?.storeContact};
   return new Response(request.method==='HEAD'?null:renderPage(language,contactPath,model,'',state),{headers});
  }
  if(path==='/mcp')return mcpEndpoint(request);
  if(path==='/api/estimates')return estimate(request,env);
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
  if(path==='/api/business.json')return json(businessFacts(url.searchParams.get('language')==='es'?'es':'en'));
  if(path==='/.well-known/mcp.json')return json({name:'Prime Gutters',description:'Gutter services, local coverage, sizing and estimate preparation',url:origin+'/mcp',transport:'streamable-http',capabilities:{tools:{}}});
  if(path.startsWith('/api/'))return json({error:'Not found'},404);
  if(Object.hasOwn(assets,path)){
   const [type,b64]=assets[path],data=request.method==='HEAD'?null:Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
   return new Response(data,{headers:{'content-type':type,'cache-control':path.startsWith('/media/')?'public, max-age=86400':'public, max-age=300','x-content-type-options':'nosniff'}});
  }
  if(path==='/robots.txt')return plain('User-agent: *\nAllow: /\nDisallow: /api/estimates\nSitemap: '+origin+'/sitemap.xml\n','text/plain');
  if(path==='/sitemap.xml')return plain('<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['en','es'].flatMap(l=>paths.map(p=>'<url><loc>'+origin+href(l,p)+'</loc></url>')).join('')+'</urlset>','application/xml');
  if(path==='/llms.txt')return plain(assistantIndex(),'text/plain');
  const lang=/^\/es(?:\/|$)/.test(path)?'es':'en';
  let local=lang==='es'?path.slice(3)||'/':path;
  if(!local.endsWith('/'))local+='/';
  const aliases={'/contact-us/':contactPath,'/colors/':'/gutter-colors/','/siding-colors/':'/visualizer/','/quote/':'/estimate/','/about-us/':'/about/','/project-planner/':'/estimate/'};
  if(local==='/gutter-colors/'&&['roof','siding','trim','guard','surface','shutters','window','door'].some(key=>url.searchParams.has(key)))aliases[local]='/visualizer/';
  if(Object.hasOwn(aliases,local)){url.pathname=href(lang,aliases[local]);return Response.redirect(url.toString(),302)}
  if(paths.includes(local)&&path!==href(lang,local)){url.pathname=href(lang,local);return Response.redirect(url.toString(),308)}
  let mapArt='';
  if(request.method==='GET'&&(local==='/'||local==='/areas-served/')){
   const mapPath='/media/prime-service-map'+(lang==='es'?'-es':'')+'.svg';
   mapSource[lang]??=new TextDecoder().decode(Uint8Array.from(atob(assets[mapPath][1]),c=>c.charCodeAt(0)));
   mapArt=mapSource[lang];
  }
  let html=request.method==='HEAD'?null:renderPage(lang,local,model,mapArt);
  if(html&&env?.smsEstimates)html=html.replace('<form id="estimate">','<form id="estimate" data-delivery="sms">');
  return plain(html,'text/html',paths.includes(local)?200:404);
 }};
}
