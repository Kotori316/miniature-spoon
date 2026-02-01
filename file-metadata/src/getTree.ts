import { ListObjectsV2Command, S3Client, type _Object as S3Object } from "@aws-sdk/client-s3";
import path from "path-browserify";
import { getMineType } from "./mineTypes";
import type { DirectoryTree, FileTree } from "./types";

function createDirectory(
  name: string,
  fullPath: string,
  parent: DirectoryTree["parent"],
): DirectoryTree {
  return {
    type: "directory",
    name,
    fullPath,
    children: {},
    parent,
  };
}

export async function getTree(bucketName: string, publicUrlBase: string): Promise<DirectoryTree> {
  const s3Client = new S3Client({});
  const tree = createDirectory("[root]", "", undefined);
  let continuationToken: string | undefined = undefined;

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    if (response.Contents) {
      for (const object of response.Contents) {
        addTreeLeaf(object, tree, publicUrlBase);
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return tree;
}

function addTreeLeaf(
  object: S3Object,
  tree: DirectoryTree,
  publicUrlBase: string,
) {
  if (!object || !object.Key) {
    return;
  }
  const parsed = path.parse(object.Key);
  if (parsed.base === ".DS_Store") {
    // Ignore .DS_Store file
    return;
  }

  let cursor = tree;
  const strings = parsed.dir.split("/");
  if (strings.length !== 1) {
    let full: string | undefined = undefined;
    let preKey: string | undefined = undefined;
    for (const key of strings) {
      const preFull = full;
      full = full === undefined ? key : `${full}/${key}`;

      if (!(key in cursor.children)) {
        const parent =
          preFull === undefined || preKey === undefined
            ? undefined
            : {
                name: preKey,
                fullPath: preFull,
              };
        cursor.children[key] = createDirectory(key, full, parent);
      }
      const t = cursor.children[key];
      if (t.type === "directory") {
        cursor = t;
      } else {
        throw new Error(
          `Invalid directory name. Maybe you tried to create a directory in a file. ${object.Key}`,
        );
      }
      preKey = key;
    }
  }

  // Generate public URL for R2/S3
  const publicUrl = `${publicUrlBase}/${object.Key}`;

  cursor.children[parsed.base] = {
    type: "file",
    fullPath: object.Key,
    name: parsed.base,
    url: publicUrl,
    size: object.Size,
    contentType: getMineType(object.Key, undefined),
    createdAt: object.LastModified?.toISOString(),
    updatedAt: object.LastModified?.toISOString(),
  } satisfies FileTree;
}
