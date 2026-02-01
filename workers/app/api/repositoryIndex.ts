import { CURRENT_VERSION, type Repositories } from "file-metadata/src/types";

export async function getRepositoryIndexList(
  bucket: R2Bucket | undefined,
): Promise<Repositories> {
  if (import.meta.env.DEV) {
    const file = import.meta.glob<Repositories>(
      "../../../file-metadata/output/v2/repositories.json",
    );
    return await file["../../../file-metadata/output/v2/repositories.json"]();
  }
  if (bucket === undefined) {
    console.log("Bucket is empty in this env");
    return { list: [] };
  }
  const data = await bucket.get(`${CURRENT_VERSION}/repositories.json`);
  if (!data) {
    console.log("No such item(repositories.json)");
    return { list: [] };
  }
  return data.json<Repositories>();
}
