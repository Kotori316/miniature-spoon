import * as path from "node:path";
import { XMLParser } from "fast-xml-parser";
function resolve(parent: string, child: string): string {
  return path.relative("/", path.resolve(parent, child));
}

export async function deleteSnapshots(bucket: R2Bucket) {
  const metadataFiles = await getFiles(bucket, (o) =>
    o.key.endsWith("SNAPSHOT/maven-metadata.xml"),
  );
  const prefixes = (
    await Promise.all(
      metadataFiles.map(async (o) => {
        const obj = await bucket.get(o.key);
        if (!obj) return [];
        const content = await obj.text();
        const directory = path.dirname(o.key);
        return {
          prefix: directory,
          files: getLatestFilePrefixes(content).map((s) =>
            resolve(directory, s),
          ),
        };
      }),
    )
  ).flatMap((s) => s) satisfies object[];

  const deletedFiles = (
    await Promise.all(
      prefixes.map(async (t) => {
        return deleteFiles(bucket, t.prefix, t.files);
      }),
    )
  ).flatMap((s) => s) satisfies string[];

  return {
    metadataFiles: metadataFiles.map((o) => o.key),
    prefixes: prefixes,
    deletedFiles: deletedFiles,
  };
}

async function getFiles(
  bucket: R2Bucket,
  filter: (obj: R2Object) => boolean,
  prefix?: string,
): Promise<R2Object[]> {
  const options: R2ListOptions = {
    prefix: prefix,
  };
  let list = await bucket.list(options);
  const objects = list.objects.filter(filter);
  while (list.truncated) {
    list = await bucket.list({
      ...options,
      cursor: list.cursor,
    });
    objects.push(...list.objects.filter(filter));
  }
  return objects;
}

type SnapshotVersion = {
  extension: string;
  value: string;
  updated: string;
  classifier?: string;
};

function getLatestFilePrefixes(xmlText: string): string[] {
  const defaultPrefixes = ["maven-metadata.xml"];

  const parser = new XMLParser();
  const parsed = parser.parse(xmlText);
  const snapshotVersions = parsed?.metadata?.versioning?.snapshotVersions
    ?.snapshotVersion as SnapshotVersion[] | undefined;
  if (!snapshotVersions) return defaultPrefixes;
  const artifactId = parsed?.metadata?.artifactId as string | undefined;

  const files = snapshotVersions.map((s) => {
    const classifier = s.classifier ? `-${s.classifier}` : "";
    return `${artifactId}-${s.value}${classifier}.${s.extension}`;
  });
  return defaultPrefixes.concat(files);
}

async function deleteFiles(
  bucket: R2Bucket,
  prefix: string,
  leaveFilePrefixes: string[],
): Promise<string[]> {
  const snapshotFiles = await getFiles(
    bucket,
    (o) => !leaveFilePrefixes.some((allowed) => o.key.startsWith(allowed)),
    prefix,
  );

  const keys = snapshotFiles.map((o) => o.key);

  bucket.delete(keys);

  return keys;
}
