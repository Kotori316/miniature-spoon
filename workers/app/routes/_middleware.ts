import { secureHeaders } from "hono/secure-headers";
import { createRoute } from "honox/factory";

export default createRoute(
  secureHeaders({
    contentSecurityPolicy: {},
  }),
);
