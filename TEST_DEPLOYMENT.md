# DijiRehber — bağımsız test ortamı kurulumu

> Durum: Kurulum kontrol listesi. **Bu dosya bir sunucu, veritabanı veya kullanıcı hesabı oluşturmaz.** Mevcut Sites demosunun verilerini ve giriş mekanizmasını kullanmayın.

## Mimari

- Cloudflare Workers: sunucu ve uygulama
- Cloudflare D1: `DB` binding, **yalnızca test ortamına ait** veritabanı
- Cloudflare R2: `BUCKET` binding, **yalnızca test ortamına ait** medya alanı
- Bağımsız kimlik doğrulaması: oturum/jeton doğrulaması sunucuda yapılmalı. Kullanıcı rolü ve otel/işletme ilişkisi D1'den kontrol edilmeli.
- Test URL: ancak Cloudflare'da başarılı bir dağıtımdan sonra belirlenecek; önceden bir URL varsaymayın.

## Cloudflare hesabında yapılacaklar

1. `dijirehber-test-db` adlı **yeni** D1 veritabanı açın. Gerçek veya mevcut demo D1'ini bağlamayın.
2. `dijirehber-test-media` adlı **yeni** R2 bucket açın. R2 kullanımı ve erişim yetkilerini kontrol edin.
3. Worker'ın test adını belirleyin. D1 `database_id` ve R2 `bucket_name` değerlerini **test deploy yapılandırmasına** yazın. `vite.config.ts` içindeki `00000000-0000-4000-8000-000000000000` sadece geliştirme yer tutucusudur; gerçek yayın kimliği değildir.
4. `drizzle/` altındaki SQL geçişlerini test D1'e, sırasıyla uygulayın. Şema ve migration geçmişini doğrulayın. Gerçek ortama migration uygulamayın.
5. Test giriş sağlayıcısını etkinleştirin; sunucu tarafında imzalı kimlik/oturum doğrulaması, süre sonu, çıkış ve rol yetkilendirmesi olmadan yönetim erişimi açmayın.
6. Yeni test admin hesabı ve ayrı otel/işletme hesapları oluşturun. Roller: platform yöneticisi, otel yöneticisi, personel, iş ortağı. Otel kaydına erişim kontrolünü **her API isteğinde** yapın.
7. Cloudflare dağıtım bilgilerini GitHub Actions Secrets/Variables'a gerektiği kadar sınırlı yetkiyle ekleyin; erişim anahtarlarını repoya veya `.env.example` dosyasına koymayın.
8. Prod yayınından bağımsız Worker deploy edin. URL yayınlandıktan sonra giriş sağlayıcısının izinli dönüş adreslerini test URL'sine göre güncelleyin.

## Yayın öncesi zorunlu testler

- `pnpm install --frozen-lockfile && pnpm test && pnpm build`
- Giriş yapmayan kullanıcı yönetim/API sayfalarına erişememeli.
- Kullanıcının tarayıcıdan eklediği `oai-authenticated-user-*` başlıkları hiçbir şekilde kimlik olarak kabul edilmemeli.
- İşletme A, İşletme B'nin taleplerini, odalarını, personelini veya raporlarını okuyup değiştirememeli.
- Personel sadece atandığı otelin izinli işlemlerini yapabilmeli.
- Platform yöneticisi rolü sıradan hesap tarafından atanamamalı.
- Misafir talepleri, sponsor kayıtları, komisyonlar, fotoğraf yüklemeleri test DB/R2 üzerinde denenmeli.
- Ücretli servis anahtarları, veri yedekleri ve üçüncü taraf API erişimleri canlı ortamla karıştırılmamalı.

## Mevcut kodla ilgili dikkat

`build/sites-worker.ts` production modunda istemcinin ilettiği `oai-authenticated-user-*` başlıklarını siliyor. Bu korumayı kaldırmak **çözüm değildir**. Sites ortamının sağladığı kimlik bağlamı bağımsız Cloudflare Worker'a kendiliğinden taşınmaz; giriş ve otel/rol yetki kontrolleri gerçek bir sunucu tarafı doğrulama entegrasyonu gerektirir.

`pnpm build` başarılı olması yayının veya kullanıcı girişinin hazır olduğu anlamına gelmez.

## Sonraki kapı

Cloudflare hesabında test D1/R2 kaynakları, yetkili deploy bağlantısı ve güvenli kimlik doğrulama kodu tamamlandığında otomatik yayın akışı eklenebilir. Bunlar olmadan “test sunucusu açıldı” veya “veritabanı bağlandı” denmemelidir.
