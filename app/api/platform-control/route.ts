import {tenantDb,hotelRecord} from '../../explore-tenants';
const KEY='platform_control_v1';
const admin=(r:Request)=>r.headers.get('oai-authenticated-user-id')==='2496b48a-6d9e-4151-aa05-7a01fbbb38df'&&r.headers.get('oai-authenticated-user-email')?.toLowerCase()==='ftmotiondesign@gmail.com';
const out=(v:any,s=200)=>Response.json(v,{status:s,headers:{'Cache-Control':'no-store'}});
async function get(){const r=await tenantDb().prepare('SELECT value FROM config WHERE key=?').bind(KEY).first<{value:string}>();return {state:r?JSON.parse(r.value):{sponsors:[],commissions:[]},previous:r?.value||''}}
const str=(v:any,n:number)=>{if(typeof v!=='string'||!v.trim()||v.length>n)throw Error('Geçersiz alan');return v.trim()};
export async function GET(r:Request){if(!admin(r))return out({error:'Yetkisiz'},403);try{return out((await get()).state)}catch{return out({error:'Veriler okunamadı'},500)}}
export async function POST(r:Request){if(!admin(r)||r.headers.get('origin')!==new URL(r.url).origin)return out({error:'Yetkisiz'},403);try{
 const body=await r.text();if(body.length>6000)return out({error:'İstek çok büyük'},413);const {type,action,data}=JSON.parse(body);if(!['sponsors','commissions'].includes(type)||!['create','toggle'].includes(action))return out({error:'Geçersiz işlem'},400);
 const {state,previous}=await get(),records=state[type];if(records.length>=200)return out({error:'Kayıt sınırı'},409);
 if(action==='create'){
  const hotelId=str(data.hotelId,80);await hotelRecord(hotelId);
  if(type==='sponsors'){const title=str(data.title,100),url=str(data.url,400);if(!/^https:\/\//.test(url))throw Error('HTTPS adresi girin');records.unshift({id:crypto.randomUUID(),hotelId,title,url,active:true,createdAt:new Date().toISOString()})}
  else {const note=str(data.note,200),amount=Number(data.amount),currency='TRY';if(!Number.isFinite(amount)||amount<0||amount>100000000)throw Error('Tutar geçersiz');records.unshift({id:crypto.randomUUID(),hotelId,note,amount:Math.round(amount*100)/100,currency,active:true,createdAt:new Date().toISOString()})}
 }else{const item=records.find((x:any)=>x.id===data.id);if(!item)return out({error:'Kayıt bulunamadı'},404);item.active=!item.active}
 const row=await tenantDb().prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE config.value=? RETURNING key').bind(KEY,JSON.stringify(state),previous).first();
 if(!row)return out({error:'Kayıt başka bir işlemde değişmiş, yenileyin'},409);
 return out({ok:true});
}catch(e){return out({error:e instanceof Error?e.message:'Kaydedilemedi'},400)}}
