"use client";
import {useEffect,useState} from "react";

const API="https://drgtylaqfdninyhhtmpa.supabase.co/auth/v1";
const KEY="sb_publishable_X-3nUcyyhAxMRpzbbSuByw_Kzji31l0";
type Mode="login"|"register"|"forgot"|"recover";
type Session={access_token:string;refresh_token?:string;expires_at?:number;user?:{email?:string}};
const headers={"apikey":KEY,"Content-Type":"application/json"};
function returnUrl(){return location.origin+"/hesabim";}
async function request(path:string,body:unknown,token?:string){
 const res=await fetch(API+path,{method:"POST",headers:{...headers,...(token?{Authorization:"Bearer "+token}:{})},body:JSON.stringify(body)});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data.msg||data.error_description||data.message||"İşlem gerçekleştirilemedi.");
 return data;
}
export default function Hesabim(){
 const [mode,setMode]=useState<Mode>("login"),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[repeat,setRepeat]=useState(""),[name,setName]=useState("");
 const [session,setSession]=useState<Session|null>(null),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{
  const hash=new URLSearchParams(location.hash.slice(1));
  if(hash.get("type")==="recovery"&&hash.get("access_token")){setSession({access_token:hash.get("access_token")!,refresh_token:hash.get("refresh_token")||undefined});setMode("recover");history.replaceState(null,"",location.pathname);}
  else{if(hash.get("error_description"))setMessage(hash.get("error_description")||"Bağlantı geçersiz.");try{const saved=sessionStorage.getItem("dijirehber-visitor-session");if(saved){const s:Session=JSON.parse(saved);if(s.expires_at&&s.expires_at>Math.floor(Date.now()/1000)+30)setSession(s);else sessionStorage.removeItem("dijirehber-visitor-session");}}catch{}}
 },[]);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage("");
  try{
   if(mode==="register"){
    if(password.length<8)throw new Error("Şifre en az 8 karakter olmalı.");
    if(password!==repeat)throw new Error("Şifreler eşleşmiyor.");
    await request("/signup",{email,password,data:{full_name:name},email_redirect_to:returnUrl()});
    setMessage("Kayıt talebiniz alındı. E-postanıza gelen doğrulama bağlantısını açın.");setMode("login");
   }else if(mode==="forgot"){
    await request("/recover",{email,redirect_to:returnUrl()});setMessage("Hesap kayıtlıysa şifre sıfırlama bağlantısı e-postanıza gönderildi.");
   }else if(mode==="recover"){
    if(password.length<8)throw new Error("Yeni şifre en az 8 karakter olmalı.");
    const res=await fetch(API+"/user",{method:"PUT",headers:{...headers,Authorization:"Bearer "+session?.access_token},body:JSON.stringify({password})});
    if(!res.ok)throw new Error("Şifre güncellenemedi. Bağlantı süresi dolmuş olabilir.");
    setMessage("Şifreniz güncellendi. Yeniden giriş yapın.");setSession(null);setMode("login");
   }else{
    const data=await request("/token?grant_type=password",{email,password});
    const value:Session={access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Math.floor(Date.now()/1000)+data.expires_in,user:data.user};
    sessionStorage.setItem("dijirehber-visitor-session",JSON.stringify(value));setSession(value);
   }
  }catch(err){setMessage(err instanceof Error?err.message:"Beklenmeyen hata.");}finally{setBusy(false);}
 }
 async function logout(){if(session?.access_token){try{await fetch(API+"/logout",{method:"POST",headers:{...headers,Authorization:"Bearer "+session.access_token}});}catch{}}sessionStorage.removeItem("dijirehber-visitor-session");setSession(null);setPassword("");setMode("login");}
 const field:React.CSSProperties={padding:"13px",border:"1px solid #d9e3e7",borderRadius:10,width:"100%",fontSize:16};
 return <main style={{minHeight:"100vh",background:"#f5f8fa",display:"grid",placeItems:"center",padding:20,color:"#173b45"}}>
 <section style={{width:"100%",maxWidth:430,background:"white",borderRadius:20,padding:28,boxShadow:"0 10px 35px #173b4515"}}>
 <h1 style={{textAlign:"center",fontSize:30,fontWeight:750}}>DijiRehber</h1><p style={{textAlign:"center",color:"#647782",marginBottom:22}}>Hesabım</p>
 {session&&mode!=="recover"?<><p>Giriş yapıldı: <strong>{session.user?.email||email}</strong></p><p style={{fontSize:13,color:"#647782"}}>Bu oturum yalnızca ziyaretçi hesabı içindir; otel yönetimi yetkisi vermez.</p><button onClick={logout} style={{...field,background:"#173b45",color:"white",cursor:"pointer"}}>Çıkış Yap</button></>:
 <><div style={{display:"flex",gap:8,marginBottom:18}}><button type="button" onClick={()=>{setMode("login");setMessage("");}} style={{...field,background:mode==="login"?"#173b45":"white",color:mode==="login"?"white":"#173b45"}}>Giriş Yap</button><button type="button" onClick={()=>{setMode("register");setMessage("");}} style={{...field,background:mode==="register"?"#173b45":"white",color:mode==="register"?"white":"#173b45"}}>Yeni Üye</button></div>
 <form onSubmit={submit} style={{display:"grid",gap:13}}>
 {mode==="register"&&<label>Ad Soyad<input required value={name} onChange={e=>setName(e.target.value)} style={field}/></label>}
 {mode!=="recover"&&<label>E-posta<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} style={field}/></label>}
 {mode!=="forgot"&&<label>{mode==="recover"?"Yeni Şifre":"Şifre"}<input required minLength={mode==="login"?1:8} type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} style={field}/></label>}
 {mode==="register"&&<label>Şifre Tekrarı<input required type="password" value={repeat} onChange={e=>setRepeat(e.target.value)} style={field}/></label>}
 <button disabled={busy} style={{...field,background:"#173b45",color:"white",cursor:"pointer"}}>{busy?"İşleniyor...":mode==="login"?"Giriş Yap":mode==="register"?"Üye Ol":mode==="forgot"?"Sıfırlama Bağlantısı Gönder":"Şifremi Güncelle"}</button>
 </form>
 {mode==="login"&&<button onClick={()=>{setMode("forgot");setMessage("");}} style={{border:0,background:"none",color:"#176f91",marginTop:15,cursor:"pointer"}}>Şifremi Unuttum</button>}
 {mode==="forgot"&&<button onClick={()=>setMode("login")} style={{border:0,background:"none",marginTop:15,cursor:"pointer"}}>Girişe Dön</button>}</>}
 {message&&<p role="status" style={{marginTop:16,fontSize:14}}>{message}</p>}
 </section></main>;
}
