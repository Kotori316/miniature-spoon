import { CURRENT_VERSION, type DirectoryLeaf } from "file-types/src/types";

type ListFilesResultOk = {
  type: "ok";
  result: DirectoryLeaf;
};

type ListFilesError = {
  type: "error";
  reason: string;
};

export type ListFilesResult = ListFilesResultOk | ListFilesError;

export async function listFiles(
  bucket: R2Bucket | undefined,
  fullPath: string,
): Promise<ListFilesResult> {
  const fileName = `${CURRENT_VERSION}/directories/${fullPath}.json`;
  if (import.meta.env.DEV) {
    const file = import.meta.glob<DirectoryLeaf>(
      "../../../file-metadata/output/v2/directories/*.json",
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
  const result = await content.json<DirectoryLeaf>();
  return {
    type: "ok",
    result,
  };
}
