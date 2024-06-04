import { readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import prettyBytes from "pretty-bytes";

import {
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  S3Client,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";

const cacheFileName = "cache.json";

export async function getObjectsInR2() {
  try {
    const read = await readFile(cacheFileName, { encoding: "utf-8" });
    const data = JSON.parse(read) as Record<string, string | number>[];
    return data.map((o) => {
      return {
        ...o,
        LastModified: new Date(o.LastModified),
      };
    }) as S3Object[];
  } catch (err) {}

  const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT ?? "",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY ?? "",
      secretAccessKey: process.env.R2_SECRET_KEY ?? "",
    },
  });

  const s3AccessStart = Date.now();
  const option: ListObjectsV2CommandInput = {
    Bucket: process.env.R2_BUCKET,
  };
  let list = await s3Client.send(new ListObjectsV2Command(option));
  const objects = list.Contents ?? [];
  console.log(`Got ${objects.length} items in ${Date.now() - s3AccessStart}ms`);
  while (list.IsTruncated && list.NextContinuationToken) {
    list = await s3Client.send(
      new ListObjectsV2Command({
        ...option,
        ContinuationToken: list.NextContinuationToken,
      }),
    );
    objects.push(...(list.Contents ?? []));
    console.log(
      `Got ${objects.length} items in ${Date.now() - s3AccessStart}ms`,
    );
  }
  console.log(
    `Total ${objects.length} items in ${Date.now() - s3AccessStart}ms`,
  );
  await writeFile(cacheFileName, JSON.stringify(objects));
  return objects;
}

function getDirectoriesGroupedByDepth(
  objects: S3Object[],
): Record<number, string[]> {
  const objectKeys = objects.map((o) => o.Key || "").filter((o) => o !== "");
  const maxDepth = objectKeys
    .map((o) => o.split("/").length)
    .reduce((pre, current) => Math.max(pre, current));

  const result: Record<number, string[]> = [];
  for (let index = 0; index < maxDepth; index++) {
    const pattern = new RegExp(`(?<directory>^(.+?\/){${index + 1}}).+$`);
    const currentDepth = objectKeys.flatMap((o) => {
      const result = o.match(pattern);
      if (result?.groups?.directory) {
        return [path.resolve("/", result.groups.directory)];
      }
      return [];
    });
    result[index + 1] = [...new Set(currentDepth)];
  }
  return result;
}

function getFilesInDirectory(
  objects: S3Object[],
  directory: string,
): PathObject[] {
  return objects
    .filter((o) => `/${o.Key}`.startsWith(directory))
    .filter((o) => !`/${o.Key}`.replace(`${directory}/`, "").includes("/"))
    .map((o) => {
      if (!o.Key) {
        throw new Error(`Elements undefined for ${o}`);
      }
      const baseName = path.basename(o.Key);
      return new PathObject(
        baseName,
        path.resolve("/", o.Key),
        o.Size,
        o.LastModified,
      );
    });
}

function getDirectoriesInDirectory(
  directories: string[],
  directory: string,
): PathObject[] {
  const dirs = directories.filter((o) => path.dirname(o) === directory);
  return [...new Set(dirs)].map((o) => {
    const baseName = path.basename(o);
    return PathObject.createDir(baseName, path.resolve("/", o));
  });
}

export class PathObject {
  constructor(
    public readonly basename: string,
    public readonly absolutePath: string,
    private readonly fileSize?: number,
    private readonly createdDate?: Date,
  ) {}

  static createDir(basename: string, absolutePath: string): PathObject {
    return new PathObject(basename, absolutePath, undefined, undefined);
  }

  get size(): string {
    if (this.fileSize === undefined) {
      return "-";
    }
    return prettyBytes(this.fileSize);
  }

  get created(): string {
    if (this.createdDate === undefined) {
      return "-";
    }
    return this.createdDate.toISOString();
  }
}

export function pathPairSort(a: PathObject, b: PathObject): number {
  return a.basename.localeCompare(b.basename, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

type DirectoryComponent = {
  files: PathObject[];
  dirs: PathObject[];
  directory: string;
};

export function getDirectoryComponents(
  objects: S3Object[],
): Map<string, DirectoryComponent> {
  const result = new Map<string, DirectoryComponent>();
  const directoriesByDepth = getDirectoriesGroupedByDepth(objects);
  const allDirectories = Object.values(directoriesByDepth).flat();

  for (const directories of Object.values(directoriesByDepth)) {
    for (const directory of directories) {
      const files = getFilesInDirectory(objects, directory);

      const parentPath = path.resolve(directory, "..");
      const parentDir = PathObject.createDir(
        "..",
        parentPath === "/" ? "/index" : parentPath,
      );
      const dirs = [
        parentDir,
        ...getDirectoriesInDirectory(allDirectories, directory),
      ];

      const component: DirectoryComponent = {
        files,
        dirs,
        directory,
      };
      result.set(directory, component);
    }
  }

  return result;
}
