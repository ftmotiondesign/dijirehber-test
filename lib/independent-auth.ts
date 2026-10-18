const COOKIE = "diji_session";
const LOGIN = "/giris";
const ROOT = "https://drgtylaqfdninyhhtmpa.supabase.co";
function h(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] as string))}
function config(env:any){const url=String(env.SUPABASE_URL||"");const key=String(env.SUPABASE_ANON_KEY||"");return url===ROOT&&key?{url,key}:null}
function cookie(token:string,maxAge:number){return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function validReturn(p:string|null){return p&&p.startsWith("/")&&!p.startsWith("//")&&!p.startsWith("/giris")?p:"/yonetim"}
function page(message=""){return new Response(`<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DijiRehber Giriş</title><style>body{background:#10171d;color:white;font:16px system-ui;display:grid;min-height:95vh;place-items:center}main{width:min(400px,90vw);padding:28px;background:#1c2933;border-radius:16px}input,button{box-sizing:border-box;width:100%;padding:12px;margin:8px 0;border-radius:8px}button{background:#ff821e;border:0;font-weight:bold}</style><main><h1>DijiRehber</h1><p>Yönetim paneli girişi</p>${message?`<p role="alert">${h(message)}</p>`:""}<form method="post" action="/giris"><label>E-posta<input type="email" name="email" autocomplete="username" required></label><label>Şifre<input type="password" name="password" autocomplete="current-password" required></label><button>Giriş yap</button></form></main></html>`,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Frame-Options":"DENY"}})}
function redirect(location:string,c?:string){const headers=new Headers({"Location":location,"Cache-Control":"no-store"});if(c)headers.set("Set-Cookie",c);return new Response(null,{status:303,headers})}
async function lookup(token:string,env:any){const cfg=config(env);if(!cfg)return null;try{const r=await fetch(cfg.url+"/auth/v1/user",{headers:{"apikey":cfg.key,"Authorization":"Bearer "+token},signal:AbortSignal.timeout(4000)});if(!r.ok)return null;const user:any=await r.json();return user?.id&&user?.email&&user.email_confirmed_at?{id:String(user.id),email:String(user.email).toLowerCase()}:null}catch{return null}}
export async function independentAuth(request:Request,env:any):Promise<{response?:Response;request?:Request}>{
 const url=new URL(request.url);
 // Hosted demo remains unchanged: this middleware is used only by the standalone Worker.
 if(url.pathname===LOGIN){
  if(request.method==="GET")return {response:page()};
  if(request.method!=="POST")return {response:new Response("Method Not Allowed",{status:405})};
  if(request.headers.get("origin")!==url.origin)return {response:new Response("Forbidden",{status:403})};
  const cfg=config(env);if(!cfg)return {response:page("Giriş henüz yapılandırılmadı.")};
  const form=await request.formData();const email=String(form.get("email")||"").trim(),password=String(form.get("password")||"");
  if(!email||password.length>1024||!password)return {response:page("Bilgileri kontrol edin.")};
  try{
   const r=await fetch(cfg.url+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":cfg.key,"Content-Type":"application/json"},body:JSON.stringify({email,password}),signal:AbortSignal.timeout(6000)});
   if(!r.ok)return {response:page("E-posta veya şifre hatalı ya da hesap onaylanmamış.")};
   const data:any=await r.json();if(!data.access_token||!await lookup(data.access_token,env))return {response:page("E-posta doğrulaması gerekli.")};
   return {response:redirect("/yonetim",cookie(data.access_token,Math.min(3600,Number(data.expires_in)||3600)))};
  }catch{return {response:page("Giriş hizmetine ulaşılamıyor.")}}
 }
 if(url.pathname==="/cikis"&&request.method==="POST"){
  if(request.headers.get("origin")!==url.origin)return {response:new Response("Forbidden",{status:403})};
  return {response:redirect(LOGIN,cookie("",0))};
 }
 // Always discard identity headers supplied by the browser.
 const headers=new Headers(request.headers);
 for(const key of Array.from(headers.keys()))if(key.startsWith("oai-authenticated-user-"))headers.delete(key);
 const token=(request.headers.get("cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
 const user=token?await lookup(decodeURIComponent(token),env):null;
 if(user){headers.set("oai-authenticated-user-id",user.id);headers.set("oai-authenticated-user-email",user.email)}
 if(!user&&(/^\/(yonetim|personel)(\/|$)/.test(url.pathname)))return {response:redirect(LOGIN)};
 return {request:new Request(request,{headers})};
}
