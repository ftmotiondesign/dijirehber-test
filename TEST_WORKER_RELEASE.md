# Manual Cloudflare test deployment

This is **not yet a live deployment**. The workflow is intentionally disabled until its GitHub environment variable `DIJI_DEPLOY_READY` is `true`. **Do not enable it until standalone server-verified authentication and authorization are implemented and tested.** The current hosted demo's Sites identity gateway does not work on an independent Worker.

GitHub > Settings > Environments: create `dijirehber-test` with a required reviewer. Under environment variables enter:

- `DIJI_TEST_D1_DATABASE_ID`: `294c809c-b6e0-4206-a7ca-abc25e9e7e9d`
- `DIJI_DEPLOY_READY`: leave unset for now.

Under environment secrets enter:

- `CLOUDFLARE_API_TOKEN`: scoped token limited to Worker script editing/deployment on the test account.
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID. Keep it in environment secrets for convenience.

**Never post token values in chat or commit them.** The workflow is `workflow_dispatch` only, not automatic. It deploys to `dijirehber-test` using the existing D1 test database, removes the unconfigured R2 binding, and executes tests before deployment. A build by itself does not establish secure login; protect all privileged endpoints in server code before enabling.

Note: `dijirehber-test` currently runs Hello World. This workflow has not executed and does not change it.

Once independent authentication is complete, verify the generated Wrangler JSON and deployment behavior before the first manual deployment. Future code changes should not overwrite Cloudflare dashboard bindings unexpectedly.
