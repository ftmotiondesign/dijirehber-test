import { env } from 'cloudflare:workers';
const runtime=()=>env as unknown as {DB?:D1Database,BUCKET?:R2Bucket};
const allowed=(r:Request)=>!!r.headers.get('oai-authenticated-user-id')&&r.headers.get('oai-authenticated-user-email')?.toLowerCase()==='ftmotiondesign@gmail.com';
const fail=(error:string,status:number)=>Response.json({ok:false,error},{status});
const IMAGE_LIMIT=550000;
const key=(id:string)=>'guide_image:'+id;
function toBase64(bytes:Uint8Array){let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value)}
function fromBase64(value:string){const raw=atob(value);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes}
export async function GET(r:Request){
 const id=new URL(r.url).searchParams.get('id')||'';
 if(!/^[a-f0-9-]{36}$/.test(id))return new Response(null,{status:404});
 const storage=runtime().BUCKET;
 if(storage){const file=await storage.get('guide/'+id);if(file)return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'image/png','Cache-Control':'public,max-age=3600','X-Content-Type-Options':'nosniff'}})}
 const db=runtime().DB;if(!db)return fail('Görsel depolama servisi yapılandırılmamış.',503);
 try{
  const row=await db.prepare('SELECT value FROM config WHERE key=?').bind(key(id)).first<{value:string}>();
  if(!row)return new Response(null,{status:404});
  const stored=JSON.parse(row.value);
  if(!['image/jpeg','image/png','image/webp'].includes(stored.mime)||typeof stored.data!=='string')return new Response(null,{status:404});
  return new Response(fromBase64(stored.data),{headers:{'Content-Type':stored.mime,'Cache-Control':'public,max-age=3600','X-Content-Type-Options':'nosniff'}});
 }catch{return fail('Fotoğraf okunamadı.',500)}
}
export async function POST(r:Request){
 if(!allowed(r)){try{await (await import('../../explore-tenants')).exploreContext(r,true)}catch{return fail('Yönetici yetkisi gerekiyor.',403)}}
 if(r.headers.get('origin')!==new URL(r.url).origin)return fail('Geçersiz kaynak',403);
 if(Number(r.headers.get('content-length')||0)>2200000)return fail('Fotoğraf en fazla 2 MB olabilir.',413);
 try{
  const form=await r.formData();const file=form.get('image');
  if(!(file instanceof File)||file.size>2097152||file.size<12)return fail('JPG, PNG veya WebP fotoğraf seçin (en fazla 2 MB).',400);
  const bytes=new Uint8Array(await file.arrayBuffer());let mime='';
  if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))mime='image/png';
  else if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)mime='image/jpeg';
  else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')mime='image/webp';
  if(!mime)return fail('Desteklenmeyen dosya biçimi.',400);
  const id=crypto.randomUUID(),storage=runtime().BUCKET;
  if(storage)await storage.put('guide/'+id,bytes,{httpMetadata:{contentType:mime}});
  else{
   const db=runtime().DB;if(!db)return fail('Fotoğraf depolama alanı bağlı değil.',503);
   if(bytes.byteLength>IMAGE_LIMIT)return fail('Ücretsiz D1 depolama için fotoğraf 550 KB altında olmalıdır. Daha küçük görsel seçin.',413);
   await db.prepare('INSERT INTO config(key,value) VALUES(?,?)').bind(key(id),JSON.stringify({mime,data:toBase64(bytes)})).run();
  }
  return Response.json({ok:true,url:'/api/guide-image?id='+id});
 }catch{return fail('Fotoğraf kaydedilemedi. Veritabanı bağlantısını kontrol edin.',500)}
}
