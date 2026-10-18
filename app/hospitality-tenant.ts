import {exploreContext,MAIN_HOTEL,tenantDb} from './explore-tenants';
const TABLES=['config','counters','members','requests','stays','stay_attempts','feedback','feedback_access','stay_events'];
// The legacy hotel's tables remain intact. Each additional hotel gets an empty,
// schema-identical partition. Handles are request-local; no mutable tenant global.
export async function hospitalityContext(r:Request){
 const context=await exploreContext(r),db=tenantDb();
 if(context.id===MAIN_HOTEL)return {...context,db};
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(context.id)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const prefix='h_'+digest+'_',pattern=new RegExp('\\b('+TABLES.join('|')+')\\b','g');
 const rewrite=(sql:string)=>sql.replace(pattern,name=>prefix+name);
 const marker='hospitality_schema:v1:'+context.id;
 if(!await db.prepare('SELECT value FROM config WHERE key=?').bind(marker).first()){
  const schemas=(await db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table'").all<{name:string,sql:string}>()).results.filter(x=>TABLES.includes(x.name));
  if(schemas.length!==TABLES.length)throw Error('Konaklama veritabanı hazır değil.');
  await db.batch(schemas.map(x=>db.prepare(rewrite(x.sql).replace(/^CREATE TABLE\s+/i,'CREATE TABLE IF NOT EXISTS '))));
  await db.prepare('INSERT INTO config(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind(marker,'true').run();
 }
 const scoped={prepare:(sql:string)=>db.prepare(rewrite(sql)),batch:(statements:any[])=>db.batch(statements)} as D1Database;
 return {...context,db:scoped};
}
