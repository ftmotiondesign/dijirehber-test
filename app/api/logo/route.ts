import { env } from 'cloudflare:workers';
import {hospitalityContext} from '../../hospitality-tenant';
function handlers(context:any){
const logoKey=context.id==='kiyi-evi'?'branding/logo':'branding/'+context.id+'/logo';
const runtime=()=>env as unknown as {DB:D1Database,BUCKET:R2Bucket};
const allowed=()=>context.allowed;
const fail=(error:string,status:number)=>Response.json({error},{status});
async function GET(r?:Request){const file=await runtime().BUCKET.get(logoKey);if(!file)return new Response(null,{status:404});return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'image/png','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
async function POST(r:Request){if(!allowed())return fail('Yönetici yetkisi gerekiyor.',403);if(r.headers.get('origin')!==new URL(r.url).origin)return fail('Geçersiz kaynak',403);if(Number(r.headers.get('content-length')||0)>600000)return fail('Logo en fazla 500 KB olabilir.',413);try{const form=await r.formData();const file=form.get('logo');if(!(file instanceof File)||file.size>512000||file.size<12)return fail('PNG, JPEG veya WebP logo seçin (en fazla 500 KB).',400);const bytes=new Uint8Array(await file.arrayBuffer());let mime='';if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))mime='image/png';else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')mime='image/webp';if(!mime)return fail('Desteklenmeyen dosya biçimi.',400);await runtime().BUCKET.put(logoKey,bytes,{httpMetadata:{contentType:mime}});await context.db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('logo','true').run();return Response.json({ok:true})}catch{return fail('Logo yüklenemedi. Lütfen tekrar deneyin.',400)}}
async function DELETE(r:Request){if(!allowed())return fail('Yönetici yetkisi gerekiyor.',403);if(r.headers.get('origin')!==new URL(r.url).origin)return fail('Geçersiz kaynak',403);await runtime().BUCKET.delete(logoKey);await context.db.prepare('DELETE FROM config WHERE key=?').bind('logo').run();return Response.json({ok:true})}

return {GET,POST,DELETE};}
async function dispatch(r:Request,method:"GET"|"POST"|"DELETE"){try{return await handlers(await hospitalityContext(r))[method](r)}catch{return Response.json({error:"Konaklama yetkisini kontrol edin."},{status:403})}}
export const GET=(r:Request)=>dispatch(r,"GET");export const POST=(r:Request)=>dispatch(r,"POST");export const DELETE=(r:Request)=>dispatch(r,"DELETE");
