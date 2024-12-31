import type {
  ChildDirectory,
  DirectoryTree,
  DirectoryWithTypedChildren,
  FileTree,
  StorageTree,
} from "./types";

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
    const parentDirectory =
      dir.parent === undefined
        ? undefined
        : ({
            name: dir.parent.name,
            fullPath: dir.parent.fullPath,
            dotPath: dir.parent.fullPath.replaceAll("/", "."),
          } satisfies ChildDirectory);

    const d = {
      fullPath: dir.fullPath,
      name: dir.name,
      childDirectories: dirs,
      childFiles: files,
      dotPath: dir.fullPath.replaceAll("/", "."),
      parentDirectory,
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
