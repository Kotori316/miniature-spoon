import type { DirectoryWithTypedChildren } from "file-metadata/src/types";

type ListFilesResultOk = {
  type: "ok";
  result: DirectoryWithTypedChildren;
};

type ListFilesError = {
  type: "error";
  reason: string;
};

export type ListFilesResult = ListFilesResultOk | ListFilesError;

export async function listFiles(
  bucket: R2Bucket | undefined,
  dotPath: string,
): Promise<ListFilesResult> {
  const fileName = `directories/${dotPath}.json`;
  if (import.meta.env.DEV) {
    const file = import.meta.glob<DirectoryWithTypedChildren>(
      "../../../file-metadata/output/directories/*.json",
    );
    const key = `../../../file-metadata/output/${fileName}`;
    if (key in file) {
      const result = await file[key]();
      return {
        type: "ok",
        result,
      };
    }
    return {
      type: "error",
      reason: "No such item",
    };
  }

  if (!bucket) {
    return {
      type: "error",
      reason: "Invalid bucket",
    };
  }
  const content = await bucket.get(fileName);
  if (!content) {
    return {
      type: "error",
      reason: "No such item",
    };
  }
  const result = await content.json<DirectoryWithTypedChildren>();
  return {
    type: "ok",
    result,
  };
}
