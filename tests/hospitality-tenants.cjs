const fs=require('node:fs'),assert=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite');
const sql=new DatabaseSync(':memory:');for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(fs.readFileSync('drizzle/'+f,'utf8').replaceAll('--> statement-breakpoint',''));
const DB={prepare(q){const st=sql.prepare(q);let args=[];const o={bind(...a){args=a;return o},async first(){return st.get(...args)||null},async all(){return {results:st.all(...args)}},async run(){return {meta:{changes:Number(st.run(...args).changes)}}}};return o},async batch(list){sql.exec('BEGIN');try{const out=[];for(const st of list)out.push(await st.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};
const load=require('./load-ts.cjs')({DB}),api=load('app/api/data/route.ts'),hotels=load('app/api/explore-hotels/route.ts'),owner='ftmotiondesign@gmail.com';
function req(path,email,body){return new Request('https://example.test'+path,{method:body?'POST':'GET',headers:{origin:'https://example.test',...(email?{'oai-authenticated-user-id':email,'oai-authenticated-user-email':email}:{})},...(body?{body:JSON.stringify(body)}:{})})}
async function call(module,path,email,body,status=200){const r=await module[body?'POST':'GET'](req(path,email,body));assert.equal(r.status,status,await r.clone().text());return r.json()}
const post=(id,email,action,data,status=200)=>call(api,'/api/data?otel='+id,email,{action,data},status),get=(id,email)=>call(api,'/api/data?otel='+id,email);
(async()=>{
const a=(await call(hotels,'/api/explore-hotels',owner,{action:'create',data:{name:'Diyar Otel',city:'Diyarbakır',district:'Sur',address:'Sur test'}})).hotel.id,b=(await call(hotels,'/api/explore-hotels',owner,{action:'create',data:{name:'Malatya Otel',city:'Malatya'}})).hotel.id;
for(const [id,email] of [[a,'a@hotel.test'],[b,'b@hotel.test']])await call(hotels,'/api/explore-hotels',owner,{action:'assign',data:{hotelId:id,email}});
let main=await get('kiyi-evi',owner);assert.equal(main.settings.hotel,'Kıyı Evi');assert.ok(main.guide.length>20);
let [ad,bd]=await Promise.all([get(a,'a@hotel.test'),get(b,'b@hotel.test')]);assert.equal(ad.settings.hotel,'Diyar Otel');assert.equal(ad.guide.length,0);assert.equal(bd.guide.length,0);assert.equal(ad.settings.wifi,'');assert.equal(ad.guestSettings.address,'Sur test');assert.equal(ad.role,'admin');
await post(a,'a@hotel.test','settings',{hotel:'Diyar Otel',wifi:'Diyar-Wifi',password:'12345678',breakfast:'08–10',notice:'Sadece Diyar'});
await post(a,'b@hotel.test','settings',{hotel:'Hack'},403);assert.equal((await get(a,'b@hotel.test')).role,'guest');
await post(a,'a@hotel.test','guestSettings',{receptionPhone:'+905551112233',whatsapp:'+905551112233',address:'Sur',mapQuery:'Sur Diyarbakır'});
await post(a,'a@hotel.test','guideUpsert',{title:'Diyar havuzu',category:'Havuz & Plaj',time:'09–18',active:true});assert.equal((await get(a)).guide.length,1);assert.equal((await get(b)).guide.length,0);assert.equal((await get(b)).guestSettings.receptionPhone,'');
await post(a,'a@hotel.test','memberAdd',{email:'staff@a.test'});assert.equal((await get(a,'staff@a.test')).role,'staff');assert.equal((await get(b,'staff@a.test')).role,'guest');await post(b,'staff@a.test','stayCreate',{room:'101',expiresAt:new Date(Date.now()+86400000).toISOString()},403);
const expiry=new Date(Date.now()+86400000).toISOString();const sa=await post(a,'staff@a.test','stayCreate',{room:'101',expiresAt:expiry,guestName:'A misafir'}),sb=await post(b,'b@hotel.test','stayCreate',{room:'101',expiresAt:expiry,guestName:'B misafir'});
await post(a,null,'request',{room:'101',code:sa.code,type:'Ek havlu',note:'Sadece A'});await post(b,null,'request',{room:'101',code:sa.code,type:'Ek havlu',note:'Yanlış otel'},403);
await post(b,null,'request',{room:'101',code:sb.code,type:'Oda temizliği',note:'Sadece B'});
[ad,bd]=await Promise.all([get(a,'a@hotel.test'),get(b,'b@hotel.test')]);assert.equal(ad.requests.length,1);assert.equal(bd.requests.length,1);assert.equal(ad.requests[0].note,'Sadece A');assert.equal(bd.requests[0].note,'Sadece B');assert.equal(ad.stays[0].guest_name,'A misafir');assert.equal(bd.stays[0].guest_name,'B misafir');
await post(b,'a@hotel.test','status',{id:bd.requests[0].id,status:'Tamamlandı'},403);await post(a,'a@hotel.test','status',{id:bd.requests[0].id,status:'Tamamlandı'},404);
await post(a,null,'myRequests',{room:'101',code:sa.code});await post(b,null,'myRequests',{room:'101',code:sa.code},403);
await post(a,'a@hotel.test','stayClose',{room:'101',id:ad.stays[0].id});await post(a,null,'request',{room:'101',code:sa.code,type:'Ek havlu',note:'Çıkış sonrası'},403);await post(b,null,'myRequests',{room:'101',code:sb.code});
assert.equal((await get('kiyi-evi',owner)).settings.hotel,'Kıyı Evi');assert.equal((await get('kiyi-evi',owner)).stays.length,0);
await call(api,'/api/data?otel=missing-hotel',owner,undefined,403);
const panel=load('app/panel-access.ts');assert.equal((await panel.panel(req('/yonetim?otel='+a,'a@hotel.test'),'admin')).status,200);assert.equal((await panel.panel(req('/yonetim?otel='+b,'a@hotel.test'),'admin')).status,403);
const logoKeys=[];const imageLoad=require('./load-ts.cjs')({DB,BUCKET:{async get(key){logoKeys.push(key);return {body:'photo',httpMetadata:{contentType:'image/png'}}}}});const logos=imageLoad('app/api/logo/route.ts');await logos.GET(req('/api/logo?otel='+a));await logos.GET(req('/api/logo?otel='+b));await logos.GET(req('/api/logo'));assert.deepEqual(logoKeys,['branding/'+a+'/logo','branding/'+b+'/logo','branding/logo']);
console.log('PASS: independent settings, contacts, guide, staff, same-number rooms, codes, requests, cross-tenant read/write denial, concurrent isolation, unchanged legacy demo, unknown hotel denial and panel authorization');
})().catch(e=>{console.error(e);process.exit(1)});
