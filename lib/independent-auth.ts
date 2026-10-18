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

function invitePage(message=""){
 return new Response(`<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>DijiRehber Davet</title><style>body{background:#10171d;color:white;font:16px system-ui;display:grid;min-height:95vh;place-items:center}main{width:min(400px,90vw);padding:28px;background:#1c2933;border-radius:16px}input,button{box-sizing:border-box;width:100%;padding:12px;margin:8px 0;border-radius:8px}button{background:#ff821e;border:0;font-weight:bold}</style><main><h1>Şifre oluştur</h1><p>Güvenli davet bağlantısıyla hesabını etkinleştir.</p>${message?`<p role="alert">${h(message)}</p>`:""}<p id="state">Davet kontrol ediliyor...</p><form method="post" action="/davet" id="form" hidden><label>Yeni şifre (en az 12 karakter)<input type="password" name="password" minlength="12" maxlength="128" autocomplete="new-password" required></label><input type="hidden" name="access_token" id="token"><button>Şifremi kaydet</button></form><p><a style="color:#ff9b44" href="/giris">Girişe dön</a></p></main><script>
(function(){
 const hash=new URLSearchParams(location.hash.slice(1));
 const token=hash.get("access_token");
 history.replaceState(null,"",location.pathname);
 const state=document.getElementById("state");
 if(hash.get("type")==="invite"&&token){
  document.getElementById("token").value=token;
  document.getElementById("form").hidden=false;
  state.textContent="Davet doğrulandı. Yeni şifrenizi belirleyin.";
 }else{
  state.textContent="Geçerli bir davet bağlantısı bulunamadı. Yeni davet isteyin.";
 }
})();
</script></html>`,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","Referrer-Policy":"no-referrer","X-Frame-Options":"DENY","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'self'; base-uri 'none'"}});
}
async function acceptInvite(request:Request,env:any,url:URL):Promise<Response>{
 if(request.method==="GET")return invitePage();
 if(request.method!=="POST")return new Response("Method Not Allowed",{status:405});
 if(request.headers.get("origin")!==url.origin)return new Response("Forbidden",{status:403});
 const cfg=config(env);if(!cfg)return invitePage("Giriş yapılandırılmadı.");
 const form=await request.formData(),token=String(form.get("access_token")||""),password=String(form.get("password")||"");
 if(!token||token.length>4096||password.length<12||password.length>128)return invitePage("Davet veya şifre geçersiz.");
 try{
  const user=await lookup(token,env);
  if(!user)return invitePage("Davet oturumu doğrulanamadı veya süresi doldu.");
  const updated=await fetch(cfg.url+"/auth/v1/user",{method:"PUT",headers:{"apikey":cfg.key,"Authorization":"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({password}),signal:AbortSignal.timeout(6000)});
  if(!updated.ok)return invitePage("Şifre kaydedilemedi. Yeni davet veya şifre sıfırlama isteyin.");
  return redirect("/giris");
 }catch{return invitePage("Giriş hizmeti kullanılamıyor.")}
}

export async function independentAuth(request:Request,env:any):Promise<{response?:Response;request?:Request}>{
 const url=new URL(request.url);
 if(url.pathname==="/davet")return {response:await acceptInvite(request,env,url)};
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
