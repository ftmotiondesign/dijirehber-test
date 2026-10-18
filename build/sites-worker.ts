import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import { independentAuth } from "../lib/independent-auth";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    if (!import.meta.env.DEV) {
      // Verified, invitation-only platform administrator preview.
      const path = new URL(request.url).pathname;
      const blocked = /^\/(personel|ortaklik)(\/|$)/.test(path);
      if (blocked) return new Response("Bu yönetim bölümü henüz etkin değil.", { status: 503, headers: { "Cache-Control": "no-store" } });
      const auth = await independentAuth(request, env);
      if (auth.response) return auth.response;
      request = auth.request!;
      const isAdmin = request.headers.get("oai-authenticated-user-id") === "2496b48a-6d9e-4151-aa05-7a01fbbb38df" &&
        request.headers.get("oai-authenticated-user-email")?.toLowerCase() === "ftmotiondesign@gmail.com";
      const isPublic = request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS";
      // Maintain read-only guest preview, except authenticated admin write APIs.
      if (!isPublic && !isAdmin) return new Response("Yazma işlemleri bu test sürümünde kapalı.", { status: 403, headers: { "Cache-Control": "no-store" } });
      if (/^\/yonetim(\/|$)/.test(path) && !isAdmin) return new Response("Yönetici yetkisi gerekiyor.", { status: 403, headers: { "Cache-Control": "no-store" } });
      if (!isAdmin && /^\/api\/(data|explore-hotels|explore|sponsors|guide-image|logo|local-services)(\/|$)/.test(path) && request.method !== "GET") {
        return new Response("Bu işlemi yalnızca yönetici yapabilir.", { status: 403 });
      }
    }
    let binding = ctx.props?.CONNECTORS;
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) return { status: "request_context_expired", message: "This request has expired. Please try again." };
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};
