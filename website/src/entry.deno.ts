/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for the Deno server when building for production.
 *
 * Learn more about the Deno integration here:
 * - https://qwik.dev/docs/deployments/deno/
 * - https://docs.deno.com/runtime/
 *
 */
import { createQwikRouter, type ServeHandlerInfo } from "@qwik.dev/router/middleware/deno";
import render from "./entry.ssr";

// Minimal Deno global surface used below, so `tsc` stays green without Deno's lib types.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(
    options: { port: number },
    handler: (request: Request, info: ServeHandlerInfo) => Promise<Response>,
  ): void;
};

// Create the Qwik Router Deno middleware
const { router, notFound, staticFile } = createQwikRouter({ render });

// Allow for dynamic port
const port = Number(Deno.env.get("PORT") ?? 3009);

Deno.serve({ port }, async (request: Request, info: ServeHandlerInfo) => {
  const staticResponse = await staticFile(request);
  if (staticResponse) {
    return staticResponse;
  }

  // Server-side render this request with Qwik Router
  const qwikRouterResponse = await router(request, info);
  if (qwikRouterResponse) {
    return qwikRouterResponse;
  }

  // Path not found
  return notFound(request);
});
