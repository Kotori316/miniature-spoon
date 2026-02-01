import path from "path-browserify";
import type {DirectoryLeaf, FileLeaf, Repositories} from "./types";
import {mkdir, writeFile} from "node:fs/promises";

export interface ListFiles<Parameter> {
  listFiles(parameter: Parameter): Promise<{
    files: FileLeaf[];
  }>;

  parseDirectoryTree(files: FileLeaf[]): ReturnType<typeof parseDirectoryTree>;

  findRepositories(directories: DirectoryLeaf[]): ReturnType<typeof findRepositories>;
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
      name: path.basename(directory),
      childrenFiles: children.sort((a, b) => a.name.localeCompare(b.name)),
      parent: {
        fullPath: parentPath,
        name: path.basename(parentPath),
      },
    });
  }

  const directories: DirectoryLeaf[] = directoriesWithoutChildDir.map((d) => {
    const childrenDirectories = directoriesWithoutChildDir
      .filter((c) => c.parent.fullPath === d.fullPath)
      .map((c) => ({
        fullPath: c.fullPath,
        name: c.name,
      }));
    return {
      ...d,
      childrenDirectories,
    };
  });

  return {directories};
}

export async function writeDirectoryFiles(outputDir: string, directories: DirectoryLeaf[]) {
  return Promise.all(directories.map(async (d) => {
    const filePath = `${outputDir}/${d.fullPath}.json`;
    await mkdir(path.dirname(filePath), {recursive: true});
    const content = JSON.stringify(d, null, 2);
    await writeFile(filePath, content, "utf-8");
  }))
}

export async function findRepositories(directories: DirectoryLeaf[]): Promise<Repositories> {
  return {
    list: directories.filter(isRepository).map(directory => ({
      name: directory.name,
      fullPath: directory.fullPath,
      repositoryName: getRepositoryName(directory.fullPath),
    }))
  };
}

function isRepository(directory: DirectoryLeaf): boolean {
  if (directory.childrenFiles.length === 0) {
    // repo must have files
    return false;
  }
  if (directory.name.includes("SNAPSHOT")) {
    // SNAPSHOT is added for a version in repo
    return false;
  }
  return (
    directory.childrenFiles.some((f) => f.name === "maven-metadata.xml")
  );
}

export function getRepositoryName(fullPath: string): string {
  return fullPath
    .replace(/^maven\//, "")
    .replace(/\/(?=[^/]+?$)/, ":")
    .replaceAll("/", ".");
}

export async function writeRepositories(outputDir: string, repositories: Repositories) {
  await mkdir(outputDir, {recursive: true});
  return writeFile(`${outputDir}/repositories.json`, JSON.stringify(repositories, null, 2), "utf-8");
}

export const IGNORE_FILE_LIST: readonly string[] = [".DS_Store"] as const;
