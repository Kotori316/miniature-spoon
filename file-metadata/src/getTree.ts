import { type File, Storage } from "@google-cloud/storage";
import path from "path-browserify";
import { getMineType } from "./mineTypes";
import type { DirectoryTree, FileTree } from "./types";

const storage = new Storage();

function createDirectory(name: string, fullPath: string): DirectoryTree {
  return {
    type: "directory",
    name,
    fullPath,
    children: {},
  };
}

export async function getTree(bucketName: string): Promise<DirectoryTree> {
  const [files] = await storage
    .bucket(bucketName)
    .getFiles({ autoPaginate: true });
  const tree = createDirectory("[root]", "");
  for (const file of files) {
    addTreeLeaf(file, tree);
  }
  return tree;
}

function addTreeLeaf(file: File, tree: DirectoryTree) {
  if (!file) {
    return;
  }
  const parsed = path.parse(file.name);

  let cursor = tree;
  const strings = parsed.dir.split("/");
  if (strings.length !== 1) {
    let full: string | undefined = undefined;
    for (const key of strings) {
      full = full === undefined ? key : `${full}/${key}`;

      if (!(key in cursor.children)) {
        cursor.children[key] = createDirectory(key, full);
      }
      const t = cursor.children[key];
      if (t.type === "directory") {
        cursor = t;
      } else {
        throw new Error(
          `Invalid directory name. Maybe you tried to create a directory in a file. ${file.name}`,
        );
      }
    }
  }
  cursor.children[parsed.base] = {
    type: "file",
    fullPath: file.name,
    name: parsed.base,
    url: file.publicUrl().replaceAll("%2F", "/"),
    size: file.metadata.size,
    contentType: getMineType(file.name, file.metadata.contentType),
  } satisfies FileTree;
}
