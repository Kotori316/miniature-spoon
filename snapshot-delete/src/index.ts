import { deleteSnapshots } from "./file";

export default {
  // The scheduled handler is invoked at the interval set in our wrangler.toml's
  // [[triggers]] configuration.
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    deleteSnapshots(env.MAVEN_BUCKET);
  },

  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    if ((env.ENVIRONMENT as string) === "local") {
      console.log("Coming request", request.method, request.url);
      const result = await deleteSnapshots(env.MAVEN_BUCKET);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    return new Response(undefined, {
      status: 404,
    });
  },
};
