import { mkdir, writeFile } from "node:fs/promises";
import { createDirectoryTrees } from "./createDirectoryTrees";
import { findRepository } from "./findRepository";
import { getTree } from "./getTree";
import type { DirectoryWithTypedChildren, Repositories } from "./types";

async function main() {
  console.log("Start main");
  if (!process.env.GOOGLE_STORAGE_BUCKET_NAME) {
    console.log("No bucket specified for GOOGLE_STORAGE_BUCKET_NAME");
    process.exit(1);
  }
  const tree = await getTree(process.env.GOOGLE_STORAGE_BUCKET_NAME);
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
