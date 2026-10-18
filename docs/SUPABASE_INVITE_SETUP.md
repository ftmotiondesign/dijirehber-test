# Supabase davet akışı - güvenli yapılandırma

Supabase projesi: `dijirehber-test`. Authentication → Email Templates → **Invite user** şablonunda bağlantıyı **yalnızca bu proje için** aşağıdaki şekilde ayarla:

```html
<a href="{{ .SiteURL }}/davet?token_hash={{ .TokenHash }}">Daveti kabul et ve şifreni oluştur</a>
```

Bu şablonun `SiteURL` değeri `https://dijirehber-test.dijiyesorapi.workers.dev` olmalıdır. Template editörü değiştirilmeden önce mevcut şablon saklanmalı. Daha önce localhost'a yönlenen e-postalar bu düzeltmeden etkilenmez, tekrar davet gönderilmesi gerekir.

`/davet` sayfası şifreyi sunucuya POST eder, Supabase `/auth/v1/verify` ile `type=invite` ve `token_hash` değerini sunucu tarafında doğrular; ardından Supabase `/auth/v1/user` yoluyla şifreyi ayarlar. İstemciye auth access token iletmez.

### Henüz yapılmamışlar
- Test sunucusu halen Hello World; uygulama deploy edilmedi.
- Cloudflare'da `SUPABASE_URL` ve `SUPABASE_ANON_KEY` bağlanmalı.
- Kritik API rotalarının tenant/role yetkileri, refresh/logout akışı ve kullanıcı rolleri denetlenmeli.
- Giriş güvenliği ve davet akışı için gerçek uçtan uca testler tamamlanmalı.
- Otomatik yayın `DIJI_DEPLOY_READY` sağlanana kadar kapalı kalmalı.

**Sıradan üyeleri platform yöneticisi yapan herhangi bir self-service mekanizma eklemeyin.**
