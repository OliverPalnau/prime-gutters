import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import './build.mjs';
const {default:site}=await import('../dist/server/index.js');
mkdirSync('.local',{recursive:true});const db=new DatabaseSync('.local/preview.sqlite');
db.exec(readFileSync('drizzle/0000_estimates.sql','utf8').replace('CREATE TABLE estimates','CREATE TABLE IF NOT EXISTS estimates'));
db.exec(readFileSync('drizzle/0001_contact_messages.sql','utf8'));
const env={DB:{prepare(sql){const stmt=db.prepare(sql);return {bind(...args){return {run:async()=>({meta:stmt.run(...args)}),first:async()=>stmt.get(...args)}}}}}};
const portArg=process.argv.indexOf('--port');
const port=Number(portArg>=0?process.argv[portArg+1]:process.env.PORT||5173);
createServer(async(req,res)=>{
 try{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  const request=new Request('http://'+(req.headers.host||'localhost')+req.url,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});
  const response=await site.fetch(request,env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Preview unavailable')}
}).listen(port,'0.0.0.0',()=>console.log('Prime Gutters preview on '+port));
