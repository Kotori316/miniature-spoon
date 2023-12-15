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
