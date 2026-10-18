# Independent login (draft, not deployed)

Test-only Supabase project: `drgtylaqfdninyhhtmpa`. Never use a service role key in the browser or repository.

Set Cloudflare Worker production secrets/variables:
- `SUPABASE_URL`: `https://drgtylaqfdninyhhtmpa.supabase.co`
- `SUPABASE_ANON_KEY`: the test project's **publishable/anon** key (prefer secret storage).

The standalone Worker exposes `/giris` and verifies email/password through Supabase Auth. The resulting HttpOnly session cookie is checked via Supabase `/auth/v1/user` on each request before any trusted identity headers are injected. No role can be specified by the client.

**Not deployment-ready:** invites still require a callback and password creation flow; email default redirect currently points at a Hello World deployment. No refresh-token rotation (users must sign in again after token expiry). Audit all API endpoints/role boundaries and tenant isolation before enabling the deploy workflow. Role assignment must be performed by trusted admin process, not self-signup. This feature is a review branch and not active on the test Worker.

Public signup should remain disabled until hotel provisioning/invitation flow is implemented.
