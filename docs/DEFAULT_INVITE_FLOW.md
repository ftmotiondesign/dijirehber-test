# Varsayılan Supabase davet e-postası

Custom SMTP **gerekmez**. Supabase varsayılan *Invite user* şablonundaki `{{ .ConfirmationURL }}`, kullanıcıyı doğrulama sonrası **Site URL** değerine yönlendirir ve oturum bilgisini URL fragment'ında (hash) gönderir.

DijiRehber test projesinin **Authentication → URL Configuration → Site URL** değeri ilk davet testi için:

`https://dijirehber-test.dijiyesorapi.workers.dev/davet`

olarak ayarlanmalıdır. Alternatif olarak davet oluşturulurken bu URL `redirectTo` ile açıkça verilebilir. Yönlendirme URL izin listesine de bu kesin yolu ekleyin. Varsayılan davet mesajını değiştirmeyin.

Tarayıcı `/davet#access_token=...&type=invite` açar. Fragment sunucuya gitmez: davet sayfası fragmentı anında URL'den kaldırır, token'ı yalnızca aynı origin'e form POST ile iletir. Sunucu Supabase `/auth/v1/user` üzerinden erişim jetonunu kontrol eder, `/auth/v1/user` PUT ile şifre oluşturur. Jeton kod deposunda saklanmaz. Bu yalnızca ilk davet akışıdır.

**Önemli sınırlar:** Test Worker'ında halen Hello World çalışıyor; kod deploy edilmedi. `SUPABASE_URL`, `SUPABASE_ANON_KEY` yapılandırılmalı. Genel API/otel/rol erişim denetimi, refresh token/çıkış, oturum kısıtları ve uçtan uca testler tamamlanana dek release workflow'u kapalı kalmalıdır. Varsayılan doğrulama akışının fragment alanları gerçek davetle test edilmelidir.
