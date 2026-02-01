import { mkdir, writeFile } from "node:fs/promises";
import path from "path-browserify";
import type { DirectoryLeaf, FileLeaf, Repositories } from "./types";

export interface ListFiles<Parameter> {
  listFiles(parameter: Parameter): Promise<{
    files: FileLeaf[];
  }>;

  parseDirectoryTree(files: FileLeaf[]): ReturnType<typeof parseDirectoryTree>;

  findRepositories(
    directories: DirectoryLeaf[],
  ): ReturnType<typeof findRepositories>;
}

export async function parseDirectoryTree(files: FileLeaf[]): Promise<{
  directories: DirectoryLeaf[];
}> {
  const directoryToChildren = new Map<string, FileLeaf[]>();
  for (const file of files) {
    const parent = path.dirname(file.fullPath);
    const children = directoryToChildren.get(parent) || [];
    children.push(file);
    directoryToChildren.set(parent, children);
  }
  const directoriesWithoutChildDir: Omit<
    DirectoryLeaf,
    "childrenDirectories"
  >[] = [];
  for (const [directory, children] of directoryToChildren) {
    const parentPath = path.dirname(directory);
    directoriesWithoutChildDir.push({
      type: "directory",
      fullPath: directory,
      childrenFiles: children.sort((a, b) => {
        return path
          .basename(a.fullPath)
          .localeCompare(path.basename(b.fullPath));
      }),
      parent: {
        fullPath: parentPath,
      },
    });
  }

  const directories: DirectoryLeaf[] = directoriesWithoutChildDir.map((d) => {
    const childrenDirectories = directoriesWithoutChildDir
      .filter((c) => c.parent.fullPath === d.fullPath)
      .map((c) => ({
        fullPath: c.fullPath,
      }));
    return {
      ...d,
      childrenDirectories,
    };
  });

  return { directories };
}

export async function writeDirectoryFiles(
  outputDir: string,
  directories: DirectoryLeaf[],
  pretty: boolean,
) {
  return Promise.all(
    directories.map(async (d) => {
      const filePath = `${outputDir}/${d.fullPath}.json`;
      await mkdir(path.dirname(filePath), { recursive: true });
      const content = pretty ? JSON.stringify(d, null, 2) : JSON.stringify(d);
      await writeFile(filePath, content, "utf-8");
    }),
  );
}

export async function findRepositories(
  directories: DirectoryLeaf[],
): Promise<Repositories> {
  return {
    list: directories.filter(isRepository).map((directory) => ({
      fullPath: directory.fullPath,
      repositoryName: getRepositoryName(directory.fullPath),
    })),
  };
}

function isRepository(directory: DirectoryLeaf): boolean {
  if (directory.childrenFiles.length === 0) {
    // repo must have files
    return false;
  }
  if (path.basename(directory.fullPath).includes("SNAPSHOT")) {
    // SNAPSHOT is added for a version in repo
    return false;
  }
  return directory.childrenFiles.some(
    (f) => path.basename(f.fullPath) === "maven-metadata.xml",
  );
}

export function getRepositoryName(fullPath: string): string {
  return fullPath
    .replace(/^maven\//, "")
    .replace(/\/(?=[^/]+?$)/, ":")
    .replaceAll("/", ".");
}

export async function writeRepositories(
  outputDir: string,
  repositories: Repositories,
  pretty: boolean,
) {
  await mkdir(outputDir, { recursive: true });
  const content = pretty
    ? JSON.stringify(repositories, null, 2)
    : JSON.stringify(repositories);
  return writeFile(`${outputDir}/repositories.json`, content, "utf-8");
}

export const IGNORE_FILE_LIST: readonly string[] = [".DS_Store"] as const;
