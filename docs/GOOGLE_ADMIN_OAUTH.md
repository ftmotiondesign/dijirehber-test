# Google Auth setup checklist (not deployed)

1. Supabase project **dijirehber-test** → Authentication → Providers → Google → Enable.
2. Configure a Google Cloud OAuth web client and add Supabase callback `https://drgtylaqfdninyhhtmpa.supabase.co/auth/v1/callback` in **Authorized redirect URIs**. Enter the client ID and client secret only in Supabase, never in GitHub.
3. Supabase Authentication → URL Configuration → Redirect URLs: add `https://dijirehber-test.dijiyesorapi.workers.dev/auth/google/callback`. Existing `/davet` must remain.
4. Route `/auth/google/start` initiates Supabase Google OAuth with PKCE; `/auth/google/callback` exchanges code server-side.
5. This code only grants the admin session if the Google-linked Supabase account has the **preapproved UID** and email. Merely matching Google email is insufficient. If the identity is separate, **do not relax the UID condition**: link identities securely via Supabase account identity management and verify ownership.
6. Google sign-in is not yet accessible on the Cloudflare guest-only preview, and #8 is still pending. Review and test the two changes together before enabling the admin surface.
7. No admin password, service_role key, or Google client secret belongs in client code.

NOTE: Browser validation, session expiry, sign-out, account linking and privileged API authorization require tests before any release.
