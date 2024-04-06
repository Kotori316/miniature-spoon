import "../src/index";
import { SELF } from "cloudflare:test";

describe("production app", () => {
  test("/put-object must be disabled in production", async () => {
    const res = await SELF.fetch("http://localhost/put-object", {
      method: "PUT",
      body: '{"key": "com/kotori316/test/a.txt", "content": "a"}',
    });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(404);
    expect(res.statusText).toBe("Not Found");
  });
});
