import type { DirectoryTree, FileTree, StorageTree } from "./getTree";

type ChildDirectory = Pick<DirectoryWithTypedChildren, "fullPath" | "name"> & {
  dotPath: string;
};

export type DirectoryWithTypedChildren = {
  fullPath: string;
  name: string;
  dotPath: string;
  childDirectories: ChildDirectory[];
  childFiles: FileTree[];
};

export function createDirectoryTrees(
  dir: DirectoryTree,
): DirectoryWithTypedChildren[] {
  const result: DirectoryWithTypedChildren[] = [];
  {
    const children: StorageTree[] = Object.values(dir.children);
    const dirs: ChildDirectory[] = children
      .filter((t) => t.type === "directory")
      .map((f) => {
        return {
          fullPath: f.fullPath,
          name: f.name,
          dotPath: f.fullPath.replaceAll("/", "."),
        } satisfies ChildDirectory;
      });
    const files: FileTree[] = children.filter((t) => t.type === "file");

    const d = {
      fullPath: dir.fullPath,
      name: dir.name,
      childDirectories: dirs,
      childFiles: files,
      dotPath: dir.fullPath.replaceAll("/", "."),
    } satisfies DirectoryWithTypedChildren;
    if (d.fullPath.length > 0) {
      result.push(d);
    }
  }

  for (const t of Object.values(dir.children).filter(
    (t) => t.type === "directory",
  )) {
    result.push(...createDirectoryTrees(t));
  }

  return result;
}
