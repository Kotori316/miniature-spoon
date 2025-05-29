import type { NotFoundHandler } from "hono";
import { css } from "hono/css";

const handler: NotFoundHandler = (c) => {
  c.status(404);
  return c.render(
    <div class={styles}>
      <h1>404 Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>,
  );
};

const styles = css`
  padding: 1rem;
`;

export default handler;
