import { getMineType } from "file-types/src/mineTypes";
import path from "path-browserify";
import { isDirectory } from "./fileTreeUtil";

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
 * @param storage the R2 bucket or the root URL of resources
 * @param requestHeader the request header to fetch resource
 */
export async function fetchResource(
  urlPath: string,
  storage: R2Bucket | string | undefined,
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
  if (isDirectory(extension)) {
    return { result: "directory" };
  }

  const overrideMineType: string | undefined = getMineType(urlPath, undefined);
  if (typeof storage === "string") {
    return fetchResourceFromUrl(
      urlPath,
      storage,
      requestHeader,
      overrideMineType,
    );
  }

  if (storage && typeof storage === "object" && "get" in storage) {
    return fetchResourceFromR2(
      urlPath,
      storage,
      requestHeader,
      overrideMineType,
    );
  }

  return {
    result: "error",
    status: 500,
  };
}

export async function fetchResourceFromUrl(
  urlPath: string,
  storage: string,
  requestHeader: HeadersInit,
  overrideMineType?: string,
): Promise<FetchResponse> {
  const fileResponse = await fetch(`${storage}${urlPath}`, {
    method: "GET",
    redirect: "follow",
    headers: requestHeader,
  });
  // file
  if (fileResponse.status >= 400) {
    return { result: "error", status: fileResponse.status };
  }

  const o = new Response(fileResponse.body, fileResponse);
  if (overrideMineType) {
    o.headers.set("Content-Type", overrideMineType);
  }
  return { result: "ok", status: fileResponse.status, response: o };
}

export async function fetchResourceFromR2(
  urlPath: string,
  storage: R2Bucket,
  requestHeader: HeadersInit,
  overrideMineType?: string,
): Promise<FetchResponse> {
  const key = `maven/${urlPath.replace(/^\//, "")}`;
  const requestHeaders = new Headers(requestHeader);
  const fileObject = await storage.get(key, {
    onlyIf: requestHeaders,
    range: requestHeaders,
  });

  if (!fileObject) {
    return { result: "error", status: 404 };
  }

  const responseHeaders = new Headers();
  fileObject.writeHttpMetadata(responseHeaders);
  responseHeaders.set("etag", fileObject.httpEtag);
  if (overrideMineType) {
    responseHeaders.set("Content-Type", overrideMineType);
  }

  if ("body" in fileObject) {
    const status = responseHeaders.has("Content-Range") ? 206 : 200;
    return {
      result: "ok",
      status: status,
      response: new Response(fileObject.body, {
        status: status,
        headers: responseHeaders,
      }),
    };
  }

  return {
    result: "ok",
    status: 304,
    response: new Response(null, {
      status: 304,
      headers: responseHeaders,
    }),
  };
}
