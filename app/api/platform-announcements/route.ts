import {tenantDb,exploreActor,hotelRecord,MAIN_HOTEL} from '../../explore-tenants';
const out=(v:any,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
const isAdmin=(r:Request)=>r.headers.get('oai-authenticated-user-id')==='2496b48a-6d9e-4151-aa05-7a01fbbb38df'&&r.headers.get('oai-authenticated-user-email')?.toLowerCase()==='ftmotiondesign@gmail.com';
const KEY='platform_announcements_v1';
async function load(){const r=await tenantDb().prepare('SELECT value FROM config WHERE key=?').bind(KEY).first<{value:string}>();return {items:r?JSON.parse(r.value):[],previous:r?.value||''}}
export async function GET(r:Request){try{const actor=await exploreActor(r),{items}=await load();if(isAdmin(r))return out({role:'platform',items});
 if(actor.role!=='hotel')return out({items:[]});
 return out({role:'hotel',items:items.filter((x:any)=>x.active&&(x.audience==='all'||x.hotelIds.includes(actor.hotelId))).map((x:any)=>({id:x.id,title:x.title,body:x.body,createdAt:x.createdAt}))});
}catch{return out({error:'Duyurular yüklenemedi.'},500)}}
export async function POST(r:Request){if(r.headers.get('origin')!==new URL(r.url).origin)return out({error:'Kaynak doğrulanamadı.'},403);if(!isAdmin(r))return out({error:'Yetkisiz işlem.'},403);
try{const raw=await r.text();if(raw.length>12000)return out({error:'İstek çok büyük.'},413);
const data=JSON.parse(raw),action=data.action;
if(!['create','toggle'].includes(action))return out({error:'Geçersiz işlem.'},400);
const {items,previous}=await load();if(items.length>=200)return out({error:'Duyuru sınırına ulaşıldı.'},409);
if(action==='create'){const title=String(data.title||'').trim(),body=String(data.body||'').trim(),audience=data.audience;if(!title||title.length>120||!body||body.length>2000||!['all','selected'].includes(audience))return out({error:'Başlık veya içerik geçersiz.'},400);
const hotelIds=audience==='all'?[]:Array.isArray(data.hotelIds)?[...new Set(data.hotelIds)]:[];if(!Array.isArray(data.hotelIds)&&audience==='selected'||hotelIds.length>100||audience==='selected'&&!hotelIds.length||hotelIds.some((x:any)=>typeof x!=='string'||!/^[a-z0-9-]{3,80}$/.test(x)))return out({error:'Otel seçimi geçersiz.'},400);
for(const id of hotelIds)await hotelRecord(id);
items.unshift({id:crypto.randomUUID(),title,body,audience,hotelIds,active:true,createdAt:new Date().toISOString()});
}else{const item=items.find((x:any)=>x.id===data.id);if(!item)return out({error:'Duyuru bulunamadı.'},404);item.active=!item.active}
const saved=await tenantDb().prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE config.value=? RETURNING key').bind(KEY,JSON.stringify(items),previous).first();
if(!saved)return out({error:'Aynı anda değişiklik yapıldı, sayfayı yenileyin.'},409);return out({ok:true});
}catch(e){return out({error:e instanceof Error?e.message:'Kaydedilemedi.'},400)}}
