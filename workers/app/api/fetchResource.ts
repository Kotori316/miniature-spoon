import * as path from "node:path";

type FetchResponseOk = {
  result: "ok";
  status: number;
  response: Response;
};
type FetchResponseError = {
  result: "error";
  status: number;
};
type FetchResponseDirectory = {
  result: "directory";
};
type FetchResponse =
  | FetchResponseOk
  | FetchResponseError
  | FetchResponseDirectory;

const knownMineType: Record<string, string> = {
  ".module": "application/json",
  ".pom": "application/xml",
  ".md5": "text/plain",
  ".sha1": "text/plain",
  ".sha256": "text/plain",
  ".sha512": "text/plain",
  ".asc": "text/plain",
  ".jar": "application/java-archive",
};

/**
 * Get a resource response from my storage
 * @param urlPath start with `/`
 * @param requestHeader the request header to fetch resource
 */
export async function fetchResource(
  urlPath: string,
  requestHeader: HeadersInit,
): Promise<FetchResponse> {
  if (urlPath.endsWith(".DS_Store")) {
    // No need to get mac metadata
    return {
      result: "error",
      status: 400,
    }
  }
  const extension = path.extname(urlPath);
  if (!extension) {
    return { result: "directory" };
  }
  const fileResponseFuture = fetch(
    `https://storage.googleapis.com/kotori316-maven-storage/maven${urlPath}`,
    {
      method: "GET",
      redirect: "follow",
      headers: requestHeader,
    },
  );
  // file
  const overrideMineType: string | undefined = knownMineType[extension];
  const fileResponse = await fileResponseFuture;
  if (fileResponse.status >= 400) {
    return { result: "error", status: fileResponse.status };
  }

  const o = new Response(fileResponse.body, fileResponse);
  if (overrideMineType) {
    o.headers.set("Content-Type", overrideMineType);
  }
  return { result: "ok", status: fileResponse.status, response: o };
}
