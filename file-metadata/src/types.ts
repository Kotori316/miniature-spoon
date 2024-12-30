export type FileTree = {
  type: "file";
  fullPath: string;
  name: string;
  url: string;
  size: string | number | undefined;
  contentType: string;
};
export type DirectoryTree = {
  type: "directory";
  fullPath: string;
  name: string;
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
