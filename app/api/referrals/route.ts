// Eski başvuru kayıtları korunur; komisyon akışı kapatılmıştır.
export function GET(){return Response.json({error:'Sponsor modeline geçildi.',url:'/api/sponsors'},{status:410,headers:{'Cache-Control':'no-store'}})}
export function POST(){return Response.json({error:'Başvuru ve satış komisyonu akışı kapatıldı. Sponsor modelini kullanın.'},{status:410,headers:{'Cache-Control':'no-store'}})}
