import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import { independentAuth } from "../lib/independent-auth";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    if (!import.meta.env.DEV) {
      // Temporary guest-only public preview until API and tenant authorization audit completes.
      const path = new URL(request.url).pathname;
      if (/^\/(personel|ortaklik|davet)(\/|$)/.test(path)) return new Response("Yönetim girişi test sürümünde geçici olarak kapalı.", { status: 503, headers: { "Cache-Control": "no-store" } });
      const write = !["GET", "HEAD", "OPTIONS"].includes(request.method);
      const hotelWrite = request.method === "POST" && path === "/api/explore-hotels";
      if (write && !hotelWrite && !(request.method === "POST" && path === "/cikis")) return new Response("Test sürümünde diğer değişiklik işlemleri kapalı.", { status: 503, headers: { "Cache-Control": "no-store" } });
      const result = await independentAuth(request, env);
      if (result.response) return result.response;
      request = result.request!;
      // Admin checks use only identity headers injected after Supabase verification.
      const authorized = request.headers.get("oai-authenticated-user-id") === "2496b48a-6d9e-4151-aa05-7a01fbbb38df" && request.headers.get("oai-authenticated-user-email")?.toLowerCase() === "ftmotiondesign@gmail.com";
      if ((/^\/yonetim(\/|$)/.test(path) || hotelWrite) && !authorized) return new Response("Yönetici yetkisi gerekiyor.", { status: 403, headers: { "Cache-Control": "no-store" } });
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
