import {get,put} from '@vercel/blob';
import site from '../dist/server/index.js';

async function storeEstimate(id,record){
 const key='estimates/'+id+'.json';
 const body=JSON.stringify(record);
 try{
  await put(key,body,{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
  return 201;
 }catch(error){
  const previous=await get(key,{access:'private',useCache:false});
  if(!previous?.stream)throw error;
  return await new Response(previous.stream).text()===body?200:409;
 }
}

export default {
 async fetch(request){
  const url=new URL(request.url);
  const routed=url.searchParams.get('__pg_route');
  if(routed!==null){
   url.pathname='/'+routed.replace(/^\/+/, '');
   url.searchParams.delete('__pg_route');
  }
  const hasStore=Boolean(process.env.BLOB_READ_WRITE_TOKEN||process.env.BLOB_STORE_ID);
  return site.fetch(new Request(url,request),hasStore?{storeEstimate}:{smsEstimates:true});
 }
};
