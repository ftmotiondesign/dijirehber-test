# DijiRehber test sunucusu: yayın kontrol noktası

Cloudflare'da şu anda `dijirehber-test` Worker'ı Hello World yayınını gösteriyor. D1 `DB` binding tanımlı; Supabase ayarları Cloudflare dashboard'da `SUPABASE_URL` ve `SUPABASE_ANON_KEY` olarak eklenmiş. Kodun Workers'a yayınlanması henüz gerçekleşmedi.

Bu değişiklik `keep_vars: true` kullanarak GitHub Actions dağıtımında Cloudflare dashboard'daki bağlantı/secret değerlerinin yanlışlıkla silinmesini önler. **Bu özellik tek başına güvenli bir dağıtım sağlamaz.**

Yayın öncesi engeller:
- İstemci tarafından taklit edilen kimlik başlıklarının bütün API rotalarında yok sayıldığını test edin.
- Yönetici yetkisinin yalnızca sunucuda doğrulanmış kullanıcı/rol kayıtlarıyla verildiğini test edin.
- Farklı otellerin personel ve verilerinin yalıtımını uçtan uca kontrol edin.
- Davet/şifre oluşturma akışı ve oturum kapatma/gerekirse yenileme işlemlerini test edin.
- GitHub test workflow'u başarılı ve Cloudflare kimlik bilgileri GitHub environment secrets içinde olmalı.
- `DIJI_DEPLOY_READY` değişkenini yalnızca bu maddeler onaylandığında `true` yapın.
- Yayından sonra gerçek Worker uygulama, D1 ve Supabase bağlantılarını canlı test edin.

Bu doküman hiçbir anahtar veya gizli bilgi içermiyor.
