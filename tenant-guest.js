const guestHotelId=new URLSearchParams(location.search).get('otel')||'kiyi-evi';
const stayCodePrefix=guestHotelId==='kiyi-evi'?'stay-code:':'stay-code:'+guestHotelId+':';
const originalGuestFetch=window.fetch.bind(window);
window.fetch=function(input,options){if(typeof input==='string'){const u=new URL(input,location.origin);if(u.origin===location.origin&&['/api/data','/api/logo','/api/guide-image','/api/qr','/api/explore','/api/sponsors','/api/local-services'].includes(u.pathname)&&!u.searchParams.has('otel')){u.searchParams.set('otel',guestHotelId);input=u.pathname+u.search+u.hash}}return originalGuestFetch(input,options)};
function hotelGuestUrl(path,params={}){const u=new URL(path,location.origin);u.searchParams.set('otel',guestHotelId);for(const [key,value] of Object.entries(params))u.searchParams.set(key,value);return u.pathname+u.search}
