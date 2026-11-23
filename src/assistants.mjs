import {reviewsPath,invoicePath,paymentMethods} from './customer-resources.mjs';
import {colorPath,metalTypes,metalPath,gutterFinishes} from './collections.mjs';
import {winterPath} from './winter.mjs';
import {origin,phone,services,faqs,L,pick,href,nextdoor,yelp,googleReviews,writeGoogleReview} from './data.mjs';
import {counties} from './places.mjs';
import {capacityExample,slopeExamples,projectTypes,systemProfiles} from './projects.mjs';
import {sizePath,taxPath,countyPath,locationPath,projectPath,ownerStory} from './features.mjs';

export const businessFacts=(lang='en')=>({
 name:'Prime Gutters',owner:'Ryan Moore',about:ownerStory(lang),phone,homeBase:'Huntington, New York',
 areas:['Nassau County, NY','Suffolk County, NY'],profiles:[googleReviews,nextdoor,yelp],
 reviews:origin+href(lang,reviewsPath),writeGoogleReview,invoiceHelp:origin+href(lang,invoicePath),paymentMethods:paymentMethods.map(([,name])=>name),
 emergencyContact:{phone,availability:L(lang,'Call 24/7 to confirm the next available visit.','Llame las 24 horas para confirmar la próxima visita disponible.')},
 services:services.map(s=>({name:pick(lang,s.name),id:s.slug,url:origin+href(lang,'/services/'+s.slug+'/')})),
 projectTypes:projectTypes.map(p=>({name:pick(lang,p.name),url:origin+href(lang,projectPath(p))})),
 colorChart:origin+href(lang,colorPath),gutterColors:gutterFinishes.map(([name])=>name),
 gutterMaterials:metalTypes.map(m=>({name:pick(lang,m.label),url:origin+href(lang,metalPath(m))})),
 visualizer:origin+href(lang,'/visualizer/'),freeEstimate:origin+href(lang,'/estimate/'),
 winterGuide:origin+href(lang,winterPath),sizeGuide:origin+href(lang,sizePath),capitalImprovementForm:origin+href(lang,taxPath),
 directory:origin+href(lang,'/areas-served/'),mcp:origin+'/mcp'
});
const languageField={type:'string',enum:['en','es'],description:'Preferred language. Defaults to English.'};
const propertyField={type:'string',enum:['Residential','Commercial','Multifamily']};
const profileField={type:'string',enum:systemProfiles.map(p=>p.id)};
function mcpTool(name,description,properties={},required=[]){
 return {name,description,inputSchema:{type:'object',properties,required,additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}};
}
export const publicTools=[
 mcpTool('get_business_information','Get the owner, contact details, service menu, property-specific guides and official Prime Gutters links.',{language:languageField}),
 mcpTool('find_service_area','Check a town, city, village, hamlet or county by name and get the local service page. Coverage includes every town in Nassau and Suffolk counties, NY.',{place:{type:'string',minLength:1,maxLength:100},language:languageField},['place']),
 mcpTool('compare_gutter_sizes','Compare USDA reference capacities for 5-inch and 6-inch aluminum K-style gutters at the same slope, with assumptions and source.',{slope:{type:'string',enum:slopeExamples.map(r=>r.slope)},language:languageField}),
 mcpTool('prepare_estimate_link','Prepare a link to the bilingual estimate form with the selected services, property type, town, profile and optional guards. The customer reviews and submits the form.',{
  language:languageField,town:{type:'string',maxLength:100},service:{type:'string',enum:services.map(s=>s.slug)},property:propertyField,profile:profileField,guards:{type:'boolean'}
 }),
 mcpTool('get_gutter_answers','Read answers about repair, maintenance, guards, colors, and commercial projects, with links for follow-up.',{language:languageField})
];
function foldName(s){return s.toLowerCase().trim().replace(/^(town|village|city|hamlet|township) of /,'').replace(/[, ]+(ny|new york)$/,'').replace(/[^a-z0-9]/g,'')}
export function findArea(query,lang){
 const value=foldName(query);
 const matches=[];
 for(const c of counties){
  if([foldName(c.name),foldName(c.name+' County')].includes(value))matches.push({place:c.name+' County',covered:true,url:origin+href(lang,countyPath(c))});
  for(const name of c.communities){if(foldName(name)!==value)continue;
   matches.push({place:name,county:c.name+' County',covered:true,municipalities:c.details[name].municipalities,url:origin+href(lang,locationPath(c,name))})}
 }
 return {matches,coverage:'All of Nassau County and Suffolk County, New York.',directory:origin+href(lang,'/areas-served/'),...(matches.length?{}:{note:'No exact directory match. Call Ryan to confirm the property location.'})};
}
function validateArgs(schema,args){
 if(args===null||typeof args!=='object'||Array.isArray(args))return false;
 if(schema.required.some(key=>!Object.hasOwn(args,key)))return false;
 return Object.keys(args).every(key=>{
  if(!Object.hasOwn(schema.properties,key))return false;
  const rule=schema.properties[key],value=args[key];
  return typeof value===rule.type&&(!rule.enum||rule.enum.includes(value))&&
    (rule.type!=='string'||(value.trim().length>=(rule.minLength??1)&&value.length<=(rule.maxLength??150)));
 });
}
function callTool(name,args){
 const lang=args.language||'en';
 if(name==='get_business_information')return businessFacts(lang);
 if(name==='find_service_area')return findArea(args.place,lang);
 if(name==='compare_gutter_sizes')return {...capacityExample(slopeExamples.find(r=>r.slope===(args.slope||'1/16'))),
  slopeUnit:'inches per foot',material:'Aluminum box ogee (K-style)',freeboardInches:0.5,
  basis:'Rounded US gallons per minute from USDA NRCS PA-1. Actual profile, slope, outlets, downspouts and discharge affect performance. This is a planning example, not a hurricane rating.',guide:origin+href(lang,sizePath)};
 if(name==='get_gutter_answers')return {answers:faqs.map(([q,a])=>({question:pick(lang,q),answer:pick(lang,a)})),guide:origin+href(lang,'/faq/')};
 const u=new URL(href(lang,'/estimate/'),origin);
 if(args.service)u.searchParams.append('service',args.service);
 if(args.guards&&args.service!=='gutter-guards')u.searchParams.append('service','gutter-guards');
 if(args.town)u.searchParams.set('town',args.town);
 if(args.property)u.searchParams.set('property',args.property);
 if(args.profile)u.searchParams.set('design',pick(lang,systemProfiles.find(p=>p.id===args.profile).name));
 return {url:u.href,submitted:false,phone};
}
const rpcHeaders={'content-type':'application/json;charset=utf-8','cache-control':'no-store'};
export async function mcpEndpoint(request){
 if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST'}});
 let msg;
 const reply=(obj,status=200)=>new Response(JSON.stringify({jsonrpc:'2.0',id:msg?.id??null,...obj}),{status,headers:rpcHeaders});
 const error=(code,message,http=200)=>reply({error:{code,message}},http);
 try {const text=await request.text();if(text.length>24000)return error(-32600,'Request too large',413);msg=JSON.parse(text)}catch{return error(-32700,'Parse error',400)}
 if(!msg||msg.jsonrpc!=='2.0'||typeof msg.method!=='string'||Array.isArray(msg))return error(-32600,'Invalid request',400);
 const info={name:'prime-gutters',version:'2.0.0'},capabilities={tools:{listChanged:false}};
 if(msg.method==='server/discover')return reply({result:{supportedVersions:['2026-07-28'],capabilities,serverInfo:info}});
 if(msg.method==='initialize'){
  const supported=['2026-07-28','2025-11-25','2025-06-18','2025-03-26'];
  return reply({result:{protocolVersion:supported.includes(msg.params?.protocolVersion)?msg.params.protocolVersion:supported[0],capabilities,serverInfo:info}});
 }
 if(!Object.hasOwn(msg,'id'))return new Response(null,{status:202});
 if(msg.method==='ping')return reply({result:{}});
 if(msg.method==='tools/list')return reply({result:{tools:publicTools}});
 if(msg.method!=='tools/call')return error(-32601,'Method not found');
 const tool=publicTools.find(t=>t.name===msg.params?.name);
 if(!tool)return error(-32602,'Unknown tool');
 const args=msg.params.arguments===undefined?{}:msg.params.arguments;
 if(!validateArgs(tool.inputSchema,args))return reply({result:{isError:true,content:[{type:'text',text:'Invalid arguments for '+tool.name}]}});
 const result=callTool(tool.name,args);
 return reply({result:{content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result,isError:false}});
}
export function assistantIndex(){
 const facts=businessFacts();
 return ['# Prime Gutters','',facts.about,'','Call or text '+phone+'. Serving every town in Nassau and Suffolk counties, NY.','',
 ...facts.services.map(s=>'- ['+s.name+']('+s.url+')'),...facts.projectTypes.map(p=>'- ['+p.name+']('+p.url+')'),
 ...[['Gutter color chart',facts.colorChart],['Service areas',facts.directory],['5-inch vs 6-inch capacity',facts.sizeGuide],['Long Island winter gutters and ice dams',facts.winterGuide],['Gutter visualizer',facts.visualizer],['Free estimate',facts.freeEstimate],['Capital improvement certificate',facts.capitalImprovementForm],['Machine-readable business information',origin+'/api/business.json'],['MCP server',facts.mcp],['Bilingual sitemap',origin+'/sitemap.xml']].map(([n,u])=>'- ['+n+']('+u+')')].join('\n');
}

