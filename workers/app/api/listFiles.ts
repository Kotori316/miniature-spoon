import {DirectoryWithTypedChildren} from "file-metadata/src/types";

type ListFilesResultOk = {
  type: "ok",
  result: DirectoryWithTypedChildren
}

type ListFilesError = {
  type: "error"
  reason: string
}

export type ListFilesResult = ListFilesResultOk | ListFilesError;

export async function listFiles(bucket: R2Bucket | undefined, dotPath: string): Promise<ListFilesResult> {
  const fileName = `${dotPath}.json`;
  if (import.meta.env.DEV) {
    const result: DirectoryWithTypedChildren = {
      "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric",
      "name": "additionalenchantedminer-fabric",
      "childDirectories": [
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.1-SNAPSHOT",
          "name": "20.1-SNAPSHOT",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.1-SNAPSHOT"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.4.42",
          "name": "20.4.42",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.4.42"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.4.44",
          "name": "20.4.44",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.4.44"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.4.47",
          "name": "20.4.47",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.4.47"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.4.50",
          "name": "20.4.50",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.4.50"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.4.56",
          "name": "20.4.56",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.4.56"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.4.57",
          "name": "20.4.57",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.4.57"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/20.4.76",
          "name": "20.4.76",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.20.4.76"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.78",
          "name": "21.0.78",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.78"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.79",
          "name": "21.0.79",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.79"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.81",
          "name": "21.0.81",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.81"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.82",
          "name": "21.0.82",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.82"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.83",
          "name": "21.0.83",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.83"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.84",
          "name": "21.0.84",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.84"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.85",
          "name": "21.0.85",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.85"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.86",
          "name": "21.0.86",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.86"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.87",
          "name": "21.0.87",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.87"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.0.88",
          "name": "21.0.88",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.0.88"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.100",
          "name": "21.1.100",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.100"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.101",
          "name": "21.1.101",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.101"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.102",
          "name": "21.1.102",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.102"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.103",
          "name": "21.1.103",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.103"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.104",
          "name": "21.1.104",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.104"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.105",
          "name": "21.1.105",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.105"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.106",
          "name": "21.1.106",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.106"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.107",
          "name": "21.1.107",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.107"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.108",
          "name": "21.1.108",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.108"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.109",
          "name": "21.1.109",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.109"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.110",
          "name": "21.1.110",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.110"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.112",
          "name": "21.1.112",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.112"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.115",
          "name": "21.1.115",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.115"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.116",
          "name": "21.1.116",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.116"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.89",
          "name": "21.1.89",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.89"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.91",
          "name": "21.1.91",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.91"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.92",
          "name": "21.1.92",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.92"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.93",
          "name": "21.1.93",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.93"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.94",
          "name": "21.1.94",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.94"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.95",
          "name": "21.1.95",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.95"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.97",
          "name": "21.1.97",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.97"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.98",
          "name": "21.1.98",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.98"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.1.99",
          "name": "21.1.99",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.1.99"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.3.111",
          "name": "21.3.111",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.3.111"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.3.113",
          "name": "21.3.113",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.3.113"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.3.114",
          "name": "21.3.114",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.3.114"
        },
        {
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/21.3.117",
          "name": "21.3.117",
          "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric.21.3.117"
        }
      ],
      "childFiles": [
        {
          "type": "file",
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml",
          "name": "maven-metadata.xml",
          "url": "https://storage.googleapis.com/kotori316-maven-storage/maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml",
          "size": "1835",
          "contentType": "text/xml"
        },
        {
          "type": "file",
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.md5",
          "name": "maven-metadata.xml.md5",
          "url": "https://storage.googleapis.com/kotori316-maven-storage/maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.md5",
          "size": "32",
          "contentType": "text/plain"
        },
        {
          "type": "file",
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.sha1",
          "name": "maven-metadata.xml.sha1",
          "url": "https://storage.googleapis.com/kotori316-maven-storage/maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.sha1",
          "size": "40",
          "contentType": "text/plain"
        },
        {
          "type": "file",
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.sha256",
          "name": "maven-metadata.xml.sha256",
          "url": "https://storage.googleapis.com/kotori316-maven-storage/maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.sha256",
          "size": "64",
          "contentType": "text/plain"
        },
        {
          "type": "file",
          "fullPath": "maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.sha512",
          "name": "maven-metadata.xml.sha512",
          "url": "https://storage.googleapis.com/kotori316-maven-storage/maven/com/kotori316/additionalenchantedminer-fabric/maven-metadata.xml.sha512",
          "size": "128",
          "contentType": "text/plain"
        }
      ],
      "dotPath": "maven.com.kotori316.additionalenchantedminer-fabric"
    };
    return {
      type: "ok",
      result,
    }
  }

  if (!bucket) {
    return {
      type: "error",
      reason: "Invalid bucket"
    }
  }
  const content = await bucket.get(fileName);
  if (!content) {
    return {
      type: "error",
      reason: "No such item"
    }
  }
  const result = await content.json<DirectoryWithTypedChildren>()
  return {
    type: "ok",
    result
  }
}
