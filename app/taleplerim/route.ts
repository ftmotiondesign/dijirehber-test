import html from '../guest-html';
export function GET(){return new Response(html.replace('<body data-surface="guest">','<body data-surface="my-requests">'),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})}
