import { mkdir, writeFile } from "node:fs/promises";
import {
  type DirectoryWithTypedChildren,
  createDirectoryTrees,
} from "./createDirectoryTrees";
import { type Repositories, findRepository } from "./findRepository";
import { getTree } from "./getTree";

async function main() {
  console.log("Start main");
  const tree = await getTree("kotori316-maven-storage");
  console.log("Loaded tree");
  const separated = createDirectoryTrees(tree);
  const repositories = findRepository(separated);
  console.log("Transformed");

  await mkdir("output/directories", { recursive: true });
  console.log("Created directory");
  await Promise.all([
    ...writeDirectoryTrees(separated),
    writeRepositories(repositories),
  ]);
  console.log("Wrote JSON files");
  console.log("End main");
}

function writeDirectoryTrees(directories: DirectoryWithTypedChildren[]) {
  return directories.map((directory) => {
    const fileName = `output/directories/${directory.dotPath}.json`;
    return writeFile(fileName, JSON.stringify(directory, null, 2));
  });
}

function writeRepositories(repositories: Repositories) {
  const fileName = "output/repositories.json";
  return writeFile(fileName, JSON.stringify(repositories, null, 2));
}

main().catch(console.error);
