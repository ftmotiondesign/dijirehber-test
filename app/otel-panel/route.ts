import {exploreContext} from '../explore-tenants';

const escapeHtml=(v:unknown)=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]||ch));
export async function GET(request:Request){
 const u=new URL(request.url);
 const userId=request.headers.get('oai-authenticated-user-id');
 if(!userId)return Response.redirect(new URL('/signin-with-chatgpt?return_to='+encodeURIComponent(u.pathname+u.search),u),302);
 let context:Awaited<ReturnType<typeof exploreContext>>;
 try{context=await exploreContext(request,true)}
 catch{return new Response('Bu otele ait yönetici yetkiniz yok. Kendi otel hesabınızla giriş yapın.',{status:403,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}})}
 const hotel=context.hotel;
 const q='?otel='+encodeURIComponent(context.id);
 const tiles=[
  ['Oda QR Kodları','Odalar için QR kodu oluşturun ve misafir bağlantılarını yönetin.','/yonetim'+q],
  ['Otel Rehberi','Otel bilgilerini, hizmetleri ve misafire gösterilen bölümleri düzenleyin.','/yonetim/rehber'+q],
  ['Misafir Talepleri','Gelen talepleri ve konaklama işlemlerini takip edin.','/personel'+q],
  ['Personel Ekranı','Yetkili personelin kullandığı operasyon ekranına geçin.','/personel'+q],
  ['Menü ve Siparişler','Otel menüsünü ve misafir siparişlerini yönetin.','/yonetim/menu'+q],
  ['Misafir Görünümü','Otelinizin misafirlerinin gördüğü rehberi açın.','/rehber'+q]
 ];
 const cards=tiles.map(([name,desc,href])=>'<a class="card" href="'+href+'"><strong>'+escapeHtml(name)+'</strong><span>'+escapeHtml(desc)+'</span><b>Sayfayı aç →</b></a>').join('');
 const html='<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Otel Yönetimi | DijiRehber</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f7f5;color:#193b37;font:15px system-ui}header{background:#173531;color:white;padding:22px max(20px,calc((100% - 1100px)/2))}header small{opacity:.75}h1{font-size:26px;margin:8px 0}main{max-width:1100px;margin:30px auto;padding:0 20px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.card{background:#fff;border:1px solid #dce6de;border-radius:16px;padding:22px;color:inherit;text-decoration:none;display:flex;flex-direction:column;min-height:170px;gap:12px}.card:hover{border-color:#2f7e6e;box-shadow:0 8px 24px #193b3710}.card strong{font-size:19px}.card span{color:#62766e;flex:1;line-height:1.5}.card b{font-size:13px;color:#167264}.note{color:#62766e;line-height:1.6}.toplinks a{color:white;margin-left:15px;text-decoration:none}@media(max-width:850px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:550px){.grid{grid-template-columns:1fr}header{padding:20px}h1{font-size:23px}}</style></head><body><header><small>DijiRehber · Otele özel yönetim</small><div class="toplinks" style="float:right"><a href="/cikis">Çıkış</a></div><h1>'+escapeHtml(hotel.name||'Otel')+'</h1><div>Otel yönetim paneli</div></header><main><p class="note">Bu panel seçili otelin yönetimine ayrılmıştır. Her bölümde yalnızca yetkiniz olan otelin işlemlerini yönetin.</p><div class="grid">'+cards+'</div></main></body></html>';
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}
