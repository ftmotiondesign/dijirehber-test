# DijiRehber — GitHub test sürümü

Otel misafir rehberi, oda talepleri, personel/işletme yönetimi, çevre keşfi ve aylık sponsor sistemi.

Bu depo, çalışan FTMotion demosunun 47. sürümünden alınmış kaynak kod ve otomatik test kopyasıdır. Mevcut demo yayını değiştirilmez.

## İlk aşama: GitHub testleri

1. Bu dosyaları özel `dijirehber-test` deposuna yükleyin.
2. GitHub → Actions → DijiRehber test akışının sonucunu kontrol edin.
3. Her main/test değişikliğinde ve pull request'te 20 test paketi ve uygulama derlemesi çalışır.

Bilgisayarda aynı kontroller:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

Node.js 24 kullanılır. pnpm sürümü package.json içindeki packageManager alanına sabitlenmiştir. Başka bağımlılık sürümü seçmeyin.

## Tarayıcıda mevcut test

Çalışan demo: https://ftmotion-misafir-demo.sillypine8.chatgpt.site
İşletme: https://ftmotion-misafir-demo.sillypine8.chatgpt.site/yonetim

GitHub Actions bir web sunucusu açmaz. Bu ilk aktarım kod/test içindir; ayrı internet test adresi henüz oluşturulmuş değildir.

## Bağımsız test yayını için sonraki aşama

Uygulama sunucu tarafında Cloudflare Workers, D1 ve R2 kullanır. GitHub Pages tek başına yeterli değildir.

- Test için ayrı D1 veritabanı ve R2 görsel alanı açılmalı; `drizzle/` şemaları oraya uygulanmalıdır.
- Mevcut gerçek otel, misafir, personel, sponsor ve fotoğraf kayıtları bu depoya aktarılmamıştır. Yeni test verileri ayrı oluşturulmalıdır.
- Canlı demodaki ChatGPT girişi Sites geçidi tarafından doğrulanır. Bağımsız test sunucusunda sunucu tarafından doğrulanan bir giriş sağlayıcısı kurulmadan yönetim girişi çalışmaz.
- Bağımsız production Worker, tarayıcıdan gönderilen kimlik başlıklarını temizler. Sunucuda doğrulanmış giriş entegre edilmeden bu önlemi kaldırmayın.
- Localhost geliştirme giriş simülasyonu `DIJI_DEV_EMAIL` ile seçilebilir; gerçek kimlik doğrulaması değildir ve yalnızca geliştirme sunucusunda/loopback'te işler.
- Bu depoda otomatik yayın veya canlı veritabanına bağlanan bir workflow yoktur.

Alan adı alındığında uygulama adresi ve QR taban adresi kalıcı DijiRehber alan adına alınır. Giriş dönüş adresleri ve mevcut veriler ayrıca taşınır.

## Test kapsamı

Otel ve personel yetkileri; aynı oda numarasında otellerin ayrılığı; konaklama kodu ve çıkış; misafir talepleri; sponsor yayın/ödeme kayıtları; konum filtreleri; fotoğraf kaynak eşleşmesi; yavaş bağlantı simülasyonu; mobil/masaüstü bileşen davranışları.

## Kaynak

Başlangıç sürümü ve commit bilgisi `SOURCE_VERSION.json` içindedir. Özel erişim anahtarları, yerel veritabanları ve Git geçmişi pakete dahil edilmez. Üçüncü taraf görsellerin/lisansların atıfları uygulamada ve public dosyalarında korunur.
