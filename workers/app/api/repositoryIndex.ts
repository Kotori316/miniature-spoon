import type { Repositories } from "file-metadata/src/types";

export async function getRepositoryIndexList(
  bucket: R2Bucket | undefined,
): Promise<Repositories> {
  if (import.meta.env.DEV) {
    return {
      list: [
        {
          name: "VersionCheckerMod",
          dotPath: "maven.com.kotori316.VersionCheckerMod",
          fullPath: "maven/com/kotori316/VersionCheckerMod",
          repositoryName: "com.kotori316:VersionCheckerMod",
        },
        {
          name: "additionalenchantedminer-fabric",
          dotPath: "maven.com.kotori316.additionalenchantedminer-fabric",
          fullPath: "maven/com/kotori316/additionalenchantedminer-fabric",
          repositoryName: "com.kotori316:additionalenchantedminer-fabric",
        },
        {
          name: "additionalenchantedminer-neoforge",
          dotPath: "maven.com.kotori316.additionalenchantedminer-neoforge",
          fullPath: "maven/com/kotori316/additionalenchantedminer-neoforge",
          repositoryName: "com.kotori316:additionalenchantedminer-neoforge",
        },
        {
          name: "additionalenchantedminer",
          dotPath: "maven.com.kotori316.additionalenchantedminer",
          fullPath: "maven/com/kotori316/additionalenchantedminer",
          repositoryName: "com.kotori316:additionalenchantedminer",
        },
        {
          name: "autoplanter-fabric-1.20.4",
          dotPath: "maven.com.kotori316.autoplanter-fabric-1.20.4",
          fullPath: "maven/com/kotori316/autoplanter-fabric-1.20.4",
          repositoryName: "com.kotori316:autoplanter-fabric-1.20.4",
        },
        {
          name: "autoplanter-fabric-1.20.5",
          dotPath: "maven.com.kotori316.autoplanter-fabric-1.20.5",
          fullPath: "maven/com/kotori316/autoplanter-fabric-1.20.5",
          repositoryName: "com.kotori316:autoplanter-fabric-1.20.5",
        },
        {
          name: "autoplanter-fabric-1.20.6",
          dotPath: "maven.com.kotori316.autoplanter-fabric-1.20.6",
          fullPath: "maven/com/kotori316/autoplanter-fabric-1.20.6",
          repositoryName: "com.kotori316:autoplanter-fabric-1.20.6",
        },
        {
          name: "autoplanter-fabric-1.21.1",
          dotPath: "maven.com.kotori316.autoplanter-fabric-1.21.1",
          fullPath: "maven/com/kotori316/autoplanter-fabric-1.21.1",
          repositoryName: "com.kotori316:autoplanter-fabric-1.21.1",
        },
        {
          name: "autoplanter-fabric-1.21.3",
          dotPath: "maven.com.kotori316.autoplanter-fabric-1.21.3",
          fullPath: "maven/com/kotori316/autoplanter-fabric-1.21.3",
          repositoryName: "com.kotori316:autoplanter-fabric-1.21.3",
        },
        {
          name: "autoplanter-fabric-1.21.4",
          dotPath: "maven.com.kotori316.autoplanter-fabric-1.21.4",
          fullPath: "maven/com/kotori316/autoplanter-fabric-1.21.4",
          repositoryName: "com.kotori316:autoplanter-fabric-1.21.4",
        },
        {
          name: "autoplanter-fabric-1.21",
          dotPath: "maven.com.kotori316.autoplanter-fabric-1.21",
          fullPath: "maven/com/kotori316/autoplanter-fabric-1.21",
          repositoryName: "com.kotori316:autoplanter-fabric-1.21",
        },
        {
          name: "autoplanter-forge-1.20.4",
          dotPath: "maven.com.kotori316.autoplanter-forge-1.20.4",
          fullPath: "maven/com/kotori316/autoplanter-forge-1.20.4",
          repositoryName: "com.kotori316:autoplanter-forge-1.20.4",
        },
        {
          name: "autoplanter-forge-1.20.6",
          dotPath: "maven.com.kotori316.autoplanter-forge-1.20.6",
          fullPath: "maven/com/kotori316/autoplanter-forge-1.20.6",
          repositoryName: "com.kotori316:autoplanter-forge-1.20.6",
        },
        {
          name: "autoplanter-forge-1.21.1",
          dotPath: "maven.com.kotori316.autoplanter-forge-1.21.1",
          fullPath: "maven/com/kotori316/autoplanter-forge-1.21.1",
          repositoryName: "com.kotori316:autoplanter-forge-1.21.1",
        },
        {
          name: "autoplanter-forge-1.21.3",
          dotPath: "maven.com.kotori316.autoplanter-forge-1.21.3",
          fullPath: "maven/com/kotori316/autoplanter-forge-1.21.3",
          repositoryName: "com.kotori316:autoplanter-forge-1.21.3",
        },
        {
          name: "autoplanter-forge-1.21.4",
          dotPath: "maven.com.kotori316.autoplanter-forge-1.21.4",
          fullPath: "maven/com/kotori316/autoplanter-forge-1.21.4",
          repositoryName: "com.kotori316:autoplanter-forge-1.21.4",
        },
        {
          name: "autoplanter-forge-1.21",
          dotPath: "maven.com.kotori316.autoplanter-forge-1.21",
          fullPath: "maven/com/kotori316/autoplanter-forge-1.21",
          repositoryName: "com.kotori316:autoplanter-forge-1.21",
        },
        {
          name: "autoplanter-neoforge-1.20.4",
          dotPath: "maven.com.kotori316.autoplanter-neoforge-1.20.4",
          fullPath: "maven/com/kotori316/autoplanter-neoforge-1.20.4",
          repositoryName: "com.kotori316:autoplanter-neoforge-1.20.4",
        },
        {
          name: "autoplanter-neoforge-1.20.5",
          dotPath: "maven.com.kotori316.autoplanter-neoforge-1.20.5",
          fullPath: "maven/com/kotori316/autoplanter-neoforge-1.20.5",
          repositoryName: "com.kotori316:autoplanter-neoforge-1.20.5",
        },
        {
          name: "autoplanter-neoforge-1.20.6",
          dotPath: "maven.com.kotori316.autoplanter-neoforge-1.20.6",
          fullPath: "maven/com/kotori316/autoplanter-neoforge-1.20.6",
          repositoryName: "com.kotori316:autoplanter-neoforge-1.20.6",
        },
        {
          name: "autoplanter-neoforge-1.21.1",
          dotPath: "maven.com.kotori316.autoplanter-neoforge-1.21.1",
          fullPath: "maven/com/kotori316/autoplanter-neoforge-1.21.1",
          repositoryName: "com.kotori316:autoplanter-neoforge-1.21.1",
        },
        {
          name: "autoplanter-neoforge-1.21.3",
          dotPath: "maven.com.kotori316.autoplanter-neoforge-1.21.3",
          fullPath: "maven/com/kotori316/autoplanter-neoforge-1.21.3",
          repositoryName: "com.kotori316:autoplanter-neoforge-1.21.3",
        },
        {
          name: "autoplanter-neoforge-1.21.4",
          dotPath: "maven.com.kotori316.autoplanter-neoforge-1.21.4",
          fullPath: "maven/com/kotori316/autoplanter-neoforge-1.21.4",
          repositoryName: "com.kotori316:autoplanter-neoforge-1.21.4",
        },
        {
          name: "autoplanter-neoforge-1.21",
          dotPath: "maven.com.kotori316.autoplanter-neoforge-1.21",
          fullPath: "maven/com/kotori316/autoplanter-neoforge-1.21",
          repositoryName: "com.kotori316:autoplanter-neoforge-1.21",
        },
        {
          name: "call-plugin",
          dotPath: "maven.com.kotori316.call-plugin",
          fullPath: "maven/com/kotori316/call-plugin",
          repositoryName: "com.kotori316:call-plugin",
        },
        {
          name: "debug-utility-fabric",
          dotPath: "maven.com.kotori316.debug-utility-fabric",
          fullPath: "maven/com/kotori316/debug-utility-fabric",
          repositoryName: "com.kotori316:debug-utility-fabric",
        },
        {
          name: "debug-utility-forge",
          dotPath: "maven.com.kotori316.debug-utility-forge",
          fullPath: "maven/com/kotori316/debug-utility-forge",
          repositoryName: "com.kotori316:debug-utility-forge",
        },
        {
          name: "debug-utility-neoforge-du",
          dotPath: "maven.com.kotori316.debug-utility-neoforge-du",
          fullPath: "maven/com/kotori316/debug-utility-neoforge-du",
          repositoryName: "com.kotori316:debug-utility-neoforge-du",
        },
        {
          name: "debug-utility-neoforge",
          dotPath: "maven.com.kotori316.debug-utility-neoforge",
          fullPath: "maven/com/kotori316/debug-utility-neoforge",
          repositoryName: "com.kotori316:debug-utility-neoforge",
        },
        {
          name: "infchest-fabric-1.20.6",
          dotPath: "maven.com.kotori316.infchest-fabric-1.20.6",
          fullPath: "maven/com/kotori316/infchest-fabric-1.20.6",
          repositoryName: "com.kotori316:infchest-fabric-1.20.6",
        },
        {
          name: "infchest-fabric-1.21.1",
          dotPath: "maven.com.kotori316.infchest-fabric-1.21.1",
          fullPath: "maven/com/kotori316/infchest-fabric-1.21.1",
          repositoryName: "com.kotori316:infchest-fabric-1.21.1",
        },
        {
          name: "infchest-fabric-1.21.3",
          dotPath: "maven.com.kotori316.infchest-fabric-1.21.3",
          fullPath: "maven/com/kotori316/infchest-fabric-1.21.3",
          repositoryName: "com.kotori316:infchest-fabric-1.21.3",
        },
        {
          name: "infchest-fabric-1.21.4",
          dotPath: "maven.com.kotori316.infchest-fabric-1.21.4",
          fullPath: "maven/com/kotori316/infchest-fabric-1.21.4",
          repositoryName: "com.kotori316:infchest-fabric-1.21.4",
        },
        {
          name: "infchest-fabric-1.21",
          dotPath: "maven.com.kotori316.infchest-fabric-1.21",
          fullPath: "maven/com/kotori316/infchest-fabric-1.21",
          repositoryName: "com.kotori316:infchest-fabric-1.21",
        },
        {
          name: "infchest-forge-1.20.6",
          dotPath: "maven.com.kotori316.infchest-forge-1.20.6",
          fullPath: "maven/com/kotori316/infchest-forge-1.20.6",
          repositoryName: "com.kotori316:infchest-forge-1.20.6",
        },
        {
          name: "infchest-forge-1.21.1",
          dotPath: "maven.com.kotori316.infchest-forge-1.21.1",
          fullPath: "maven/com/kotori316/infchest-forge-1.21.1",
          repositoryName: "com.kotori316:infchest-forge-1.21.1",
        },
        {
          name: "infchest-forge-1.21.3",
          dotPath: "maven.com.kotori316.infchest-forge-1.21.3",
          fullPath: "maven/com/kotori316/infchest-forge-1.21.3",
          repositoryName: "com.kotori316:infchest-forge-1.21.3",
        },
        {
          name: "infchest-forge-1.21.4",
          dotPath: "maven.com.kotori316.infchest-forge-1.21.4",
          fullPath: "maven/com/kotori316/infchest-forge-1.21.4",
          repositoryName: "com.kotori316:infchest-forge-1.21.4",
        },
        {
          name: "infchest-forge-1.21",
          dotPath: "maven.com.kotori316.infchest-forge-1.21",
          fullPath: "maven/com/kotori316/infchest-forge-1.21",
          repositoryName: "com.kotori316:infchest-forge-1.21",
        },
        {
          name: "infchest-neoforge-1.20.6",
          dotPath: "maven.com.kotori316.infchest-neoforge-1.20.6",
          fullPath: "maven/com/kotori316/infchest-neoforge-1.20.6",
          repositoryName: "com.kotori316:infchest-neoforge-1.20.6",
        },
        {
          name: "infchest-neoforge-1.21.1",
          dotPath: "maven.com.kotori316.infchest-neoforge-1.21.1",
          fullPath: "maven/com/kotori316/infchest-neoforge-1.21.1",
          repositoryName: "com.kotori316:infchest-neoforge-1.21.1",
        },
        {
          name: "infchest-neoforge-1.21.3",
          dotPath: "maven.com.kotori316.infchest-neoforge-1.21.3",
          fullPath: "maven/com/kotori316/infchest-neoforge-1.21.3",
          repositoryName: "com.kotori316:infchest-neoforge-1.21.3",
        },
        {
          name: "infchest-neoforge-1.21.4",
          dotPath: "maven.com.kotori316.infchest-neoforge-1.21.4",
          fullPath: "maven/com/kotori316/infchest-neoforge-1.21.4",
          repositoryName: "com.kotori316:infchest-neoforge-1.21.4",
        },
        {
          name: "infchest-neoforge-1.21",
          dotPath: "maven.com.kotori316.infchest-neoforge-1.21",
          fullPath: "maven/com/kotori316/infchest-neoforge-1.21",
          repositoryName: "com.kotori316:infchest-neoforge-1.21",
        },
        {
          name: "largefluidtank-fabric",
          dotPath: "maven.com.kotori316.largefluidtank-fabric",
          fullPath: "maven/com/kotori316/largefluidtank-fabric",
          repositoryName: "com.kotori316:largefluidtank-fabric",
        },
        {
          name: "largefluidtank-forge",
          dotPath: "maven.com.kotori316.largefluidtank-forge",
          fullPath: "maven/com/kotori316/largefluidtank-forge",
          repositoryName: "com.kotori316:largefluidtank-forge",
        },
        {
          name: "largefluidtank-neoforge",
          dotPath: "maven.com.kotori316.largefluidtank-neoforge",
          fullPath: "maven/com/kotori316/largefluidtank-neoforge",
          repositoryName: "com.kotori316:largefluidtank-neoforge",
        },
        {
          name: "com.kotori316.plugin.cf.gradle.plugin",
          dotPath:
            "maven.com.kotori316.plugin.cf.com.kotori316.plugin.cf.gradle.plugin",
          fullPath:
            "maven/com/kotori316/plugin/cf/com.kotori316.plugin.cf.gradle.plugin",
          repositoryName:
            "com.kotori316.plugin.cf:com.kotori316.plugin.cf.gradle.plugin",
        },
        {
          name: "scalable-cats-force-fabric",
          dotPath: "maven.com.kotori316.scalable-cats-force-fabric",
          fullPath: "maven/com/kotori316/scalable-cats-force-fabric",
          repositoryName: "com.kotori316:scalable-cats-force-fabric",
        },
        {
          name: "scalablecatsforce-neoforge",
          dotPath: "maven.com.kotori316.scalablecatsforce-neoforge",
          fullPath: "maven/com/kotori316/scalablecatsforce-neoforge",
          repositoryName: "com.kotori316:scalablecatsforce-neoforge",
        },
        {
          name: "scalablecatsforce",
          dotPath: "maven.com.kotori316.scalablecatsforce",
          fullPath: "maven/com/kotori316/scalablecatsforce",
          repositoryName: "com.kotori316:scalablecatsforce",
        },
        {
          name: "test-utility-fabric",
          dotPath: "maven.com.kotori316.test-utility-fabric",
          fullPath: "maven/com/kotori316/test-utility-fabric",
          repositoryName: "com.kotori316:test-utility-fabric",
        },
        {
          name: "test-utility-forge",
          dotPath: "maven.com.kotori316.test-utility-forge",
          fullPath: "maven/com/kotori316/test-utility-forge",
          repositoryName: "com.kotori316:test-utility-forge",
        },
        {
          name: "test-utility-neoforge-tu",
          dotPath: "maven.com.kotori316.test-utility-neoforge-tu",
          fullPath: "maven/com/kotori316/test-utility-neoforge-tu",
          repositoryName: "com.kotori316:test-utility-neoforge-tu",
        },
        {
          name: "test-utility-neoforge",
          dotPath: "maven.com.kotori316.test-utility-neoforge",
          fullPath: "maven/com/kotori316/test-utility-neoforge",
          repositoryName: "com.kotori316:test-utility-neoforge",
        },
        {
          name: "cats-core_2.13",
          dotPath: "maven.org.typelevel.cats-core_2.13",
          fullPath: "maven/org/typelevel/cats-core_2.13",
          repositoryName: "org.typelevel:cats-core_2.13",
        },
        {
          name: "cats-core_3",
          dotPath: "maven.org.typelevel.cats-core_3",
          fullPath: "maven/org/typelevel/cats-core_3",
          repositoryName: "org.typelevel:cats-core_3",
        },
        {
          name: "cats-free_2.13",
          dotPath: "maven.org.typelevel.cats-free_2.13",
          fullPath: "maven/org/typelevel/cats-free_2.13",
          repositoryName: "org.typelevel:cats-free_2.13",
        },
        {
          name: "cats-free_3",
          dotPath: "maven.org.typelevel.cats-free_3",
          fullPath: "maven/org/typelevel/cats-free_3",
          repositoryName: "org.typelevel:cats-free_3",
        },
        {
          name: "cats-kernel_2.13",
          dotPath: "maven.org.typelevel.cats-kernel_2.13",
          fullPath: "maven/org/typelevel/cats-kernel_2.13",
          repositoryName: "org.typelevel:cats-kernel_2.13",
        },
        {
          name: "cats-kernel_3",
          dotPath: "maven.org.typelevel.cats-kernel_3",
          fullPath: "maven/org/typelevel/cats-kernel_3",
          repositoryName: "org.typelevel:cats-kernel_3",
        },
      ],
    };
  }
  if (bucket === undefined) {
    console.log("Bucket is empty in this env");
    return { list: [] };
  }
  const data = await bucket.get("repositories.json");
  if (!data) {
    return { list: [] };
  }
  return data.json<Repositories>();
}
