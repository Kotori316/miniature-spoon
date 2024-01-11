import * as file from "../src/files";

describe.concurrent("file mime type", () => {
  const pairs = {
    txt: "text/plain; charset=utf-8",
    xml: "application/xml",
    module: "application/json",
    pom: "application/xml",
    jar: "application/java-archive",
    zip: "application/zip",
    md5: "text/plain",
    sha1: "text/plain",
    sha256: "text/plain",
    sha512: "text/plain",
    asc: "text/plain",
    hoge: "application/octet-stream",
  };
  for (const [key, value] of Object.entries(pairs)) {
    it(`ext: ${key}, mime: ${value}`, async ({ expect }) => {
      const mime = file.getMimeType(`a.${key}`);
      expect(mime).toBe(value);
    });
  }
});

test("mime is given", () => {
  const mime = file.getMimeType("a.txt", "application/xml");
  expect(mime).toBe("application/xml");
});

describe.concurrent("available path", () => {
  it("com", async () => {
    const path = file.availablePaths(["com"]).matches;
    expect(path).toEqual(["com"]);
  });
  it("com.kotori316", async () => {
    const path = file.availablePaths(["com.kotori316"]).matches;
    expect(path).toEqual(["com", "com/kotori316"]);
  });
  it("com.kotori316.test", async () => {
    const path = file.availablePaths(["com.kotori316.test"]).matches;
    expect(path).toEqual(["com", "com/kotori316", "com/kotori316/test"]);
  });
  it("com.kotori316 and org.kotori316", async () => {
    const path = file.availablePaths(["com.kotori316", "org.kotori316"]).matches;
    expect(path).toEqual(["com", "com/kotori316", "org", "org/kotori316"]);
  });
  it("prefix of com.kotori316 and org.kotori316", async () => {
    const path = file.availablePaths(["com.kotori316", "org.kotori316"]).prefixes;
    expect(path).toEqual(["com/kotori316/", "org/kotori316/"]);
  });
  it("prefix of com", async () => {
    const path = file.availablePaths(["com"]).prefixes;
    expect(path).toEqual(["com/"]);
  });
});
