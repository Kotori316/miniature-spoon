import type {
  DirectoryWithTypedChildren,
  Repositories,
  Repository,
} from "./types";

export function findRepository(
  directories: DirectoryWithTypedChildren[],
): Repositories {
  const repos: Repository[] = directories.filter(isRepository).map((d) => {
    const repositoryName = getRepositoryName(d.fullPath);
    return {
      name: d.name,
      dotPath: d.dotPath,
      fullPath: d.fullPath,
      repositoryName,
    } satisfies Repository;
  });
  return {
    list: repos,
  };
}

function isRepository(directory: DirectoryWithTypedChildren): boolean {
  if (directory.childFiles.length === 0) {
    // repo must have files
    return false;
  }
  if (directory.name.includes("SNAPSHOT")) {
    // SNAPSHOT is added for a version in repo
    return false;
  }
  return (
    directory.childFiles.findIndex((f) => f.name === "maven-metadata.xml") >= 0
  );
}

export function getRepositoryName(fullPath: string): string {
  return fullPath
    .replace(/^maven\//, "")
    .replace(/\/(?=[^/]+?$)/, ":")
    .replaceAll("/", ".");
}
