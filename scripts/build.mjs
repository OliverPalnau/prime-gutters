import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const vercelBuild=process.argv.includes('--vercel');
const output='vercel-static';
const read=p=>fs.readFileSync(p,'utf8');
// Content-based URLs keep returning visitors on matching HTML, styles and controls.
const clientRevision=createHash('sha256');
for (const file of ['site.css','upgrades.css','app.js','finishes.json']) clientRevision.update(fs.readFileSync('public/'+file));
const revision=clientRevision.digest('hex').slice(0,12);
let sources='const finishOptions='+read('public/finishes.json')+';\nconst guardPlanes='+read('public/media/inspector/guard-planes.json')+';\n'+['data','places','projects','collections','icons','features','winter','inspector','homeowner','customer-resources','assistants','additions','pages','router'].map(name=>read('src/'+name+'.mjs').replace(/^import .*?;\n/gm,'').replace(/^export /gm,'')).join('\n').replaceAll('__CLIENT_REVISION__',revision);
if(vercelBuild){
 const host=process.env.SITE_ORIGIN||('https://'+(process.env.VERCEL_PROJECT_PRODUCTION_URL||process.env.VERCEL_URL||'localhost'));
 const canonical=new URL(host);
 if(canonical.protocol!=='https:'||canonical.username||canonical.password||canonical.pathname!=='/'||canonical.hash||canonical.search)throw Error('Invalid production origin');
 sources=sources.replace("const origin = 'https://prime-gutters.oliverpalnau.chatgpt.site';",'const origin = '+JSON.stringify(canonical.origin)+';');
}
const model=read('public/media/exterior-designer/house-model.svg').trim();
const resources={};
const mime={'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.json':'application/json','.woff2':'font/woff2','.png':'image/png'};
const referenced=['site.css','upgrades.css','app.js','favicon.svg','roof-finishes.json','finishes.json',
 'media/prime-service-map.svg','media/prime-service-map-es.svg','media/prime-exterior.webp','media/exterior-designer/studio-photoreal-house.webp',
 'media/copper-downspout-cedar-siding.1x_vfcmaboapj.jpg','media/service-context/gutters-black.webp',
 'media/service-context/gutters-white.webp','media/service-context/gutters-brown.webp',
 'media/21ca8f3f56c22ca2-s.p.14a9xpaqsbppk.woff2','media/83afe278b6a6bb3c-s.p.45535valc9rzk.woff2'];
for (const dir of ['profiles','directory','brand','finishes','people','inspector']){
 for (const name of fs.readdirSync('public/media/'+dir)) if(name!=='finish-proof.webp' && mime[path.extname(name)]) referenced.push('media/'+dir+'/'+name);
}
referenced.push('media/mansion-black-gutters.webp','media/mansion-eave-detail.webp','media/capital-detail.webp',
 'media/spring-rain-roofline.webp','media/spring-rain-roofline-mobile.webp');
for(const name of referenced){
 const file=name==='app.js'?Buffer.from(read('public/app.js').replaceAll('__FINISH_REVISION__',revision)):fs.readFileSync('public/'+name);
 if(vercelBuild){
  const target=path.join(output,name);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,file);
 }
 if(!vercelBuild||/^media\/prime-service-map(?:-es)?\.svg$/.test(name))
  resources['/'+name]=[mime[path.extname(name)],file.toString('base64')];
}
fs.mkdirSync('dist/server',{recursive:true});
fs.writeFileSync('dist/server/index.js',sources+'\nexport default createSite('+JSON.stringify(model)+','+JSON.stringify(resources)+');\n');
fs.mkdirSync('dist/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Built bilingual gutter site with '+referenced.length+' local resources.');
