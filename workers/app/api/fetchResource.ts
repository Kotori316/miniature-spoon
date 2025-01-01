import * as path from "node:path";
import { knownMineType } from "file-metadata/src/mineTypes";

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

/**
 * Get a resource response from my storage
 * @param urlPath start with `/`
 * @param resourceDomain the root URL of resources, without last `/`
 * @param requestHeader the request header to fetch resource
 */
export async function fetchResource(
  urlPath: string,
  resourceDomain: string,
  requestHeader: HeadersInit,
): Promise<FetchResponse> {
  if (urlPath.endsWith(".DS_Store")) {
    // No need to get mac metadata
    return {
      result: "error",
      status: 400,
    };
  }
  const extension = path.extname(urlPath);
  if (!extension) {
    return { result: "directory" };
  }
  const fileResponseFuture = fetch(`${resourceDomain}${urlPath}`, {
    method: "GET",
    redirect: "follow",
    headers: requestHeader,
  });
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
