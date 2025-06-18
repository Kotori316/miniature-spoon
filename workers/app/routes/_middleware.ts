import { NONCE, secureHeaders } from "hono/secure-headers";
import { createRoute } from "honox/factory";

export default createRoute(
  secureHeaders({
    contentSecurityPolicy: { styleSrc: [NONCE], scriptSrc: [NONCE] },
  }),
);
