export type FileLeaf = {
  type: "file";
  fullPath: string;
  url: string;
  size: string | number | undefined;
  contentType: string;
  updatedAt: string | undefined;
};

export type DirectoryLeaf = {
  type: "directory";
  fullPath: string;
  parent: DirectoryOnlyName;
  childrenFiles: FileLeaf[];
  childrenDirectories: DirectoryOnlyName[];
};

export type DirectoryOnlyName = Pick<DirectoryLeaf, "fullPath">;

export type Repository = DirectoryOnlyName & {
  repositoryName: string;
};

export type Repositories = {
  list: Repository[];
};
