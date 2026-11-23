import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import site from '../dist/server/index.js';
import {paths} from '../src/pages.mjs';
import {origin,href} from '../src/data.mjs';

const fetchPath=(path,env={},opts={})=>site.fetch(new Request(new URL(path,origin),opts),env);
test('each bilingual page, image, and internal link resolves',async()=>{
 const links=new Set();
 for(const lang of ['en','es'])for(const path of paths){
  const res=await fetchPath(href(lang,path));assert.equal(res.status,200,path);
  const html=await res.text();assert.ok(!/Omar|631-840-7645/i.test(html),path);
  assert.equal((html.match(/<h1>/g)||[]).length,1,path);
  assert.ok(html.includes('tel:+16313745916'));
  assert.ok(html.includes('st124_fill_in.pdf')&&html.includes('footer-about')&&html.includes('prime-gutters-logo.webp'),path);
  const photos=[...html.matchAll(/<(?:img|image)\b[^>]*? (?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(u=>!u.includes('/brand/')&&!u.includes('/directory/')&&!u.endsWith('/ryan-moore-avatar.webp'));
  assert.equal(new Set(photos).size,photos.length,'Duplicate contextual photo on '+path+': '+photos.filter((u,i)=>photos.indexOf(u)!==i));
  for(const block of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))assert.ok(JSON.parse(block[1])['@graph'].length>=3);

  for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g))links.add(match[1].split('?')[0]);
 }
 for(const url of links){const res=await fetchPath(url);assert.ok([200,302,308].includes(res.status),url)}
 assert.equal((await fetchPath('/services/roofing/')).status,404);
});
test('visualizer keeps each editable surface, independent gutter controls, catalog, and zoom',async()=>{
 const html=await(await fetchPath('/visualizer/')).text();
 for(const s of ['gutter','siding','trim','roof','window','door'])assert.match(html,new RegExp('data-surface="'+s+'"'));
 assert.ok(html.includes('data-surface="gutter" aria-pressed="true"'));assert.ok(html.includes('data-view="detail"'));assert.ok(html.includes('var(--gutter'));
 assert.ok((await(await fetchPath('/finishes.json')).json()).gutter.length>=16);assert.equal((await(await fetchPath('/roof-finishes.json')).json()).length,218);
});
test('quote submission, retry, conflicts, validation, and no public read',async()=>{
 const db=new DatabaseSync(':memory:');db.exec(fs.readFileSync('drizzle/0000_estimates.sql','utf8'));
 const env={DB:{prepare(sql){const stmt=db.prepare(sql);return {bind(...args){return {run:async()=>({meta:stmt.run(...args)}),first:async()=>stmt.get(...args)}}}}}};
 const data={id:crypto.randomUUID(),name:'Preview',phone:'202-555-0144',town:'Huntington',services:['commercial-gutters'],property:'Commercial',visit:'Morning',notes:'',palette:'Copper',consent:true,lang:'en',website:''};
 const submit=(x)=>fetchPath('/api/estimates',env,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(x)});
 let r=await submit(data);assert.equal(r.status,201);const reference=await r.json();
 r=await submit(data);assert.equal(r.status,200);assert.deepEqual(await r.json(),reference);
 assert.equal((await submit({...data,notes:'Different'})).status,409);
 assert.equal(db.prepare('select count(*) as n from estimates').get().n,1);
 assert.deepEqual([...Object.values(db.prepare('select property_type,palette from estimates').get())],['Commercial','Copper']);
 assert.equal((await submit({...data,services:['roofing']})).status,422);
 assert.equal((await submit({...data,consent:false})).status,422);
 assert.equal((await fetchPath('/api/estimates',env)).status,405);db.close();
});
test('every listed community has bilingual pages and all municipalities appear in the footer',async()=>{
 const {counties}=await import('../src/places.mjs');
 const {locationPath}=await import('../src/features.mjs');
 assert.equal(counties.reduce((n,c)=>n+c.municipalities.length,0),15);
 assert.equal(counties.reduce((n,c)=>n+c.communities.length,0),340);
 for(const lang of ['en','es']){
  const home=await(await fetchPath(href(lang,'/'))).text();
  const footer=home.slice(home.indexOf('<footer>'),home.indexOf('</footer>'));
  for(const c of counties)for(const name of c.communities){
   assert.ok(paths.includes(locationPath(c,name)),name);
   assert.ok(footer.includes(href(lang,locationPath(c,name))),name);
  }
 }
});
test('assistant tools support the guide, coverage, answers, and a reviewable estimate',async()=>{
 const rpc=async(method,params={})=>{
  const r=await fetchPath('/mcp',{},{method:'POST',body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
  assert.equal(r.status,200);return (await r.json()).result;
 };
 const call=async(name,args={})=>(await rpc('tools/call',{name,arguments:args})).structuredContent;
 assert.equal((await rpc('initialize',{protocolVersion:'2025-11-25'})).protocolVersion,'2025-11-25');
 assert.ok((await rpc('server/discover')).supportedVersions.length);
 assert.equal((await rpc('tools/list')).tools.length,5);
 assert.equal((await call('get_business_information')).owner,'Ryan Moore');
 assert.equal((await call('find_service_area',{place:'City of Long Beach'})).matches[0].county,'Nassau County');
 assert.equal((await call('find_service_area',{place:'Not listed'})).matches.length,0);
 assert.ok((await call('get_gutter_answers',{language:'es'})).answers.length>=6);
 const sizing=await call('compare_gutter_sizes',{slope:'1/16'});assert.deepEqual([sizing.fiveGpm,sizing.sixGpm,sizing.percent],[81,135,67]);
 const alt=await call('compare_gutter_sizes',{slope:'1/8'});assert.deepEqual([alt.fiveGpm,alt.sixGpm,alt.percent],[112,193,72]);
 const brief=await call('prepare_estimate_link',{profile:'half-round',service:'seamless-gutter-installation',guards:true,town:'Huntington',property:'Multifamily'});
 assert.equal(brief.submitted,false);
 const u=new URL(brief.url);
 assert.deepEqual(u.searchParams.getAll('service'),['seamless-gutter-installation','gutter-guards']);
 assert.equal(u.searchParams.get('design'),'Half-round gutter');
 assert.ok((await rpc('tools/call',{name:'compare_gutter_sizes',arguments:{slope:'bad'}})).isError);
});
test('winter feature respects the New York season and the guide is available all year',async()=>{
 const {winterSeason,winterPath}=await import('../src/winter.mjs');
 assert.equal(winterSeason(new Date('2026-10-01T02:00:00Z')),false);
 assert.equal(winterSeason(new Date('2026-11-22T16:00:00Z')),true);
 assert.equal(winterSeason(new Date('2027-03-31T23:00:00Z')),true);
 assert.equal(winterSeason(new Date('2027-07-01T12:00:00Z')),false);
 for(const lang of ['en','es']){
  const page=await(await fetchPath(href(lang,winterPath))).text();
  for(const filename of ['winter-cape','winter-overflow','bay-shore-snow','coe-hall-winter'])assert.ok(page.includes(filename+'.webp'));
  assert.ok(page.includes('www.epa.gov/mold/')&&page.includes('extension.umn.edu/'));
 }
});
test('services lead the homepage, each finish is named, and map controls match real areas',async()=>{
 const {metalTypes,gutterFinishes,metalPath,colorPath}=await import('../src/collections.mjs');
 const {counties}=await import('../src/places.mjs');
 const {winterSeason}=await import('../src/winter.mjs');
 for(const l of ['en','es']){
  const doc=await(await fetchPath(href(l,'/'))).text();
  const card=doc.indexOf('class="service-grid"'),size=doc.indexOf('class="section sizing"');
  assert.ok(card>0&&card<size);
  if(winterSeason())assert.ok(size<doc.indexOf('class="section winter-feature"'));
  assert.ok(doc.includes('footer-contact-row')&&doc.includes('/projects/luxury-modern-mansions/'));
  for(const [name] of gutterFinishes)assert.ok(doc.includes('data-finish="'+name+'"'));
  for(const m of metalTypes)assert.ok(doc.includes(href(l,metalPath(m))));
  assert.equal((doc.match(/class="pgmap-place" data-place=/g)||[]).length,15);
  for(const county of counties)for(const town of county.municipalities){
   assert.ok(doc.includes('data-select-place="'+town.slug+'"'));
   const artwork=new RegExp('data-place="'+town.slug+'"[^>]*data-index="(\\d+)"').exec(doc);
   assert.ok(artwork,town.name);
   assert.ok(new RegExp('data-select-place="'+town.slug+'"[^>]*><i aria-hidden="true">'+artwork[1]+'</i>').test(doc));
  }
  assert.equal((await fetchPath(href(l,colorPath))).status,200);
  assert.equal((await fetchPath(href(l,colorPath)+'?roof=Slate&gutter=White')).status,302);
 }
});
test('Ryan’s portrait and face crop replace initials in all existing owner callouts',async()=>{
 for(const lang of ['en','es']){
  const about=await(await fetchPath(href(lang,'/about/'))).text();
  assert.ok(about.includes('class="owner-portrait" src="/media/people/ryan-moore.webp"'));
  for(const path of ['/','/estimate/']){
   const doc=await(await fetchPath(href(lang,path))).text();
   assert.ok(!doc.includes('>RM<'));assert.ok(doc.includes('class="owner-avatar" src="/media/people/ryan-moore-avatar.webp"'));
  }
 }
});

test('installed and cutaway views serve distinct artwork for each profile',async()=>{
 const {systemProfiles}=await import('../src/projects.mjs');
 const guards=await(await fetchPath('/media/inspector/guard-planes.json')).json();
 for(const l of ['en','es']){
  const page=await(await fetchPath(href(l,'/gutter-colors/')+'?profile=half-round&gutter=Copper')).text();
  for(const p of systemProfiles)assert.ok(page.includes('data-installed-profile="'+p.id+'"'));
  assert.ok(page.includes('data-installed-copper')&&page.includes('data-finish-detail'));
  const studio=await(await fetchPath(href(l,'/visualizer/'))).text();
  assert.ok(studio.includes('gutter-cutaway')&&studio.includes('data-focus-detail="trough"')&&studio.includes('inspector-dialog'));
 }
 for(const p of systemProfiles){
  const label=p.id==='k-5'?'eave':p.id;
  const assets=['/media/inspector/'+p.id+'-light.webp',...['-light.webp','-mask.png','-base.webp'].map(s=>'/media/finishes/'+label+s)];
  for(const url of assets){const response=await fetchPath(url);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^image\//)}
  assert.equal(guards[p.id].length,4);
 }
});
test('review invitations, invoice options, emergency calls and tax form are available in each language',async()=>{
 const {googleReviews,writeGoogleReview,tel}=await import('../src/data.mjs');
 const {paymentMethods}=await import('../src/customer-resources.mjs');
 const {nyForm}=await import('../src/features.mjs');
 for(const l of ['en','es']){
  const reviews=await(await fetchPath(href(l,'/reviews/'))).text(),footer=reviews.split('<footer>')[1];
  for(const url of [googleReviews,writeGoogleReview,nyForm,tel])assert.ok(reviews.includes(url));
  for(const name of ['Gerald Curreri','Alicia Sable'])assert.ok(reviews.includes(name));
  assert.ok(footer.includes('24/7')&&footer.includes(href(l,'/pay-invoice/'))&&footer.includes('review-us-on-google.webp'));
  assert.ok(footer.includes('nextdoor-logo.svg'));
  const invoice=await(await fetchPath(href(l,'/pay-invoice/'))).text();
  for(const [id,name] of paymentMethods)assert.ok(invoice.includes('pay-'+id+'.svg')&&invoice.includes('alt="'+name+'"'));
  assert.equal((invoice.match(/data-invoice-message=/g)||[]).length,3);
 }
});

test('homeowners can start with a symptom and find a town in either county',async()=>{
 for(const lang of ['en','es']){
  const hub=await(await fetchPath(href(lang,'/homeowner-hub/'))).text();
  assert.ok(hub.includes('id="gutter-help"')&&hub.includes('service=gutter-assessment&amp;concern='));
  const directory=await(await fetchPath(href(lang,'/areas-served/'))).text();
  const catalog=JSON.parse(directory.match(/data-community-catalog>([^<]+)</)[1]);
  for(const name of ['Huntington Station','Mineola'])assert.equal((await fetchPath(catalog.find(entry=>entry[0]===name)[2])).status,200);
  const estimate=await(await fetchPath(href(lang,'/estimate/'),{smsEstimates:true})).text();
  assert.ok(estimate.includes('value="gutter-assessment"')&&estimate.includes('data-delivery="sms"'));
 }
 const payload={id:crypto.randomUUID(),name:'Preview',phone:'2025550144',town:'Mineola',property:'Residential',services:['gutter-assessment'],visit:'Flexible',lang:'en',website:'',notes:'Overflow',palette:'',consent:true};
 const opts={method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)};
 const response=await fetchPath('/api/estimates',{smsEstimates:true},opts);
 assert.deepEqual(await response.json(),{delivery:'sms'});
 const fail=await fetchPath('/api/estimates',{storeEstimate:async()=>{throw Error('offline')}},opts);
 assert.equal(fail.status,503);
 const status=await fetchPath('/api/estimates',{storeEstimate:async(id,row)=>{assert.equal(id,payload.id);assert.equal(row.notes,'Overflow');return 201}},opts);
 assert.equal(status.status,201);
});

test('natural copper has separate installed and cutaway photographs',async()=>{
 for(const path of ['/media/finishes/natural-copper-installed.webp','/media/inspector/natural-copper-cutaway.webp']){
  const res=await fetchPath(path);assert.equal(res.status,200);assert.equal(res.headers.get('content-type'),'image/webp');
 }
});
