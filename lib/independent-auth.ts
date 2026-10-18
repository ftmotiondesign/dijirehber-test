const COOKIE = "diji_session";
const LOGIN = "/giris";
const ROOT = "https://drgtylaqfdninyhhtmpa.supabase.co";
function h(s:string){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] as string))}
function config(env:any){const url=String(env.SUPABASE_URL||"");const key=String(env.SUPABASE_ANON_KEY||"");return url===ROOT&&key?{url,key}:null}
function cookie(token:string,maxAge:number){return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`}
function validReturn(p:string|null){return p&&p.startsWith("/")&&!p.startsWith("//")&&!p.startsWith("/giris")?p:"/yonetim"}
function page(message=""){return new Response(`<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DijiRehber Giriş</title><style>body{background:#10171d;color:white;font:16px system-ui;display:grid;min-height:95vh;place-items:center}main{width:min(400px,90vw);padding:28px;background:#1c2933;border-radius:16px}input,button{box-sizing:border-box;width:100%;padding:12px;margin:8px 0;border-radius:8px}button{background:#ff821e;border:0;font-weight:bold}</style><main><h1>DijiRehber</h1><p>Yönetici girişi — Google ile devam et</p><p><a href="/auth/google/start">Google ile devam et</a></p>${message?`<p role="alert">${h(message)}</p>`:""}</main></html>`,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Frame-Options":"DENY"}})}
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


const GOOGLE_STATE_COOKIE="diji_google_state";
const GOOGLE_VERIFIER_COOKIE="diji_google_verifier";
function shortCookie(name:string,value:string,seconds:number){return name+"="+encodeURIComponent(value)+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+seconds}
function cleanupCookies(headers:Headers){headers.append("Set-Cookie",shortCookie(GOOGLE_STATE_COOKIE,"",0));headers.append("Set-Cookie",shortCookie(GOOGLE_VERIFIER_COOKIE,"",0))}
function randomUrlSafe(n:number){const bytes=crypto.getRandomValues(new Uint8Array(n));return btoa(String.fromCharCode(...bytes)).replace(/[+]/g,"-").replace(/[/]/g,"_").replace(/=+$/,"")}
function getCookie(request:Request,name:string){const raw=(request.headers.get("cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(name+"="));try{return raw?decodeURIComponent(raw.slice(name.length+1)):null}catch{return null}}
async function challenge(verifier:string){const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(verifier));return btoa(String.fromCharCode(...new Uint8Array(hash))).replace(/[+]/g,"-").replace(/[/]/g,"_").replace(/=+$/,"")}
async function googleStart(request:Request,env:any){
 const cfg=config(env);if(!cfg)return page("Google giriş bağlantısı henüz yapılandırılmadı.");
 const url=new URL(request.url),state=randomUrlSafe(32),verifier=randomUrlSafe(48);
 const destination=new URL(cfg.url+"/auth/v1/authorize");
 destination.searchParams.set("scopes","email profile");
 destination.searchParams.set("provider","google");
 destination.searchParams.set("redirect_to",url.origin+"/auth/google/callback");
 destination.searchParams.set("code_challenge",await challenge(verifier));
 destination.searchParams.set("code_challenge_method","s256");
 const responseHeaders=new Headers({"Location":destination.toString(),"Cache-Control":"no-store"});
 responseHeaders.append("Set-Cookie",shortCookie(GOOGLE_STATE_COOKIE,state,600));
 responseHeaders.append("Set-Cookie",shortCookie(GOOGLE_VERIFIER_COOKIE,verifier,600));
 // Supabase forwards its own OAuth state; this local marker guards unsolicited callbacks.
 return new Response(null,{status:302,headers:responseHeaders});
}
async function googleCallback(request:Request,env:any){
 const url=new URL(request.url),cfg=config(env),verifier=getCookie(request,GOOGLE_VERIFIER_COOKIE),marker=getCookie(request,GOOGLE_STATE_COOKIE);
 const error=url.searchParams.get("error");
 const resultHeaders=new Headers({"Cache-Control":"no-store"});
 cleanupCookies(resultHeaders);
 if(error||!cfg||!verifier||!marker||!url.searchParams.get("code")){resultHeaders.set("Location","/giris?google_error=1");return new Response(null,{status:303,headers:resultHeaders})}
 try{
  const r=await fetch(cfg.url+"/auth/v1/token?grant_type=pkce",{method:"POST",headers:{"Content-Type":"application/json","apikey":cfg.key},body:JSON.stringify({auth_code:url.searchParams.get("code"),code_verifier:verifier}),signal:AbortSignal.timeout(6000)});
  if(!r.ok){resultHeaders.set("Location","/giris?google_error=1");return new Response(null,{status:303,headers:resultHeaders})}
  const data:any=await r.json();
  const user=data.access_token?await lookup(data.access_token,env):null;
  // Never grant administrator privileges based solely on Google email.
  // The administrator UID must match the explicitly approved Supabase identity.
  if(!user||user.id!=="2496b48a-6d9e-4151-aa05-7a01fbbb38df"||user.email!=="ftmotiondesign@gmail.com"){resultHeaders.set("Location","/giris?google_error=1");return new Response(null,{status:303,headers:resultHeaders})}
  resultHeaders.set("Location","/yonetim");
  resultHeaders.append("Set-Cookie",cookie(data.access_token,Math.min(3600,Number(data.expires_in)||3600)));
  return new Response(null,{status:303,headers:resultHeaders});
 }catch{return redirect("/giris?google_error=1")}
}

export async function independentAuth(request:Request,env:any):Promise<{response?:Response;request?:Request}>{
 const url=new URL(request.url);
 if(url.pathname==="/auth/google/start"&&request.method==="GET")return {response:await googleStart(request,env)};
 if(url.pathname==="/auth/google/callback"&&request.method==="GET")return {response:await googleCallback(request,env)};
 if(url.pathname==="/davet")return {response:await acceptInvite(request,env,url)};
 // Hosted demo remains unchanged: this middleware is used only by the standalone Worker.
 if(url.pathname===LOGIN){
  if(request.method==="GET")return {response:page(url.searchParams.has("google_verified")?"Google kimliği doğrulandı. Yönetim erişimi henüz açılmadı.":url.searchParams.has("google_error")?"Google giriş doğrulaması tamamlanamadı.":"")};
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
