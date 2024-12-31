export type FileTree = {
  type: "file";
  fullPath: string;
  name: string;
  url: string;
  size: string | number | undefined;
  contentType: string;
  createdAt: string | undefined;
  updatedAt: string | undefined;
};
export type DirectoryTree = {
  type: "directory";
  fullPath: string;
  name: string;
  parent: Pick<DirectoryTree, "fullPath" | "name"> | undefined;
  children: Record<string, StorageTree>;
};
export type StorageTree = FileTree | DirectoryTree;

export type ChildDirectory = Pick<
  DirectoryWithTypedChildren,
  "fullPath" | "name"
> & {
  dotPath: string;
};

export type DirectoryWithTypedChildren = {
  fullPath: string;
  name: string;
  dotPath: string;
  parentDirectory: ChildDirectory | undefined;
  childDirectories: ChildDirectory[];
  childFiles: FileTree[];
};

export type Repository = Pick<
  DirectoryWithTypedChildren,
  "fullPath" | "name" | "dotPath"
> & {
  repositoryName: string;
};

export type Repositories = {
  list: Repository[];
};

export type ArrayElement<T extends readonly unknown[]> =
  T extends readonly (infer S)[] ? S : never;
