
type RepositoryIndex = {
  name: string;
  /**
   * Dot separated strings, such as `com.kotori316.plugin`
   */
  path: string;
};


export async function getRepositoryIndexList(): Promise<RepositoryIndex[]> {
  return [
    {
      name: "com.kotori316:infchest",
      path: "com.kotori316.infchest",
    },
    {
      name: "com.kotori316:fluidtank",
      path: "com.kotori316.fluidtank",
    },
  ];
}
