import {
  ListObjectsV2Command,
  S3Client,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";
import { getMineType } from "file-types/src/mineTypes";
import type { FileLeaf } from "file-types/src/types";
import path from "path-browserify";
import type winston from "winston";
import {
  findRepositories,
  IGNORE_FILE_LIST,
  type ListFiles,
  parseDirectoryTree,
} from "./list-files";
import { logger } from "./main";

type S3ListFilesParameter = {
  bucketName: string;
  publicDomain: string;
};

export const listFiles: () => ListFiles<S3ListFilesParameter> = () => {
  const client = new S3Client();

  return {
    listFiles(parameter: S3ListFilesParameter): Promise<{ files: FileLeaf[] }> {
      return listFilesInBucket(logger(), client, parameter);
    },
    parseDirectoryTree: parseDirectoryTree,

    findRepositories: findRepositories,
  };
};

async function listFilesInBucket(
  logger: winston.Logger,
  client: S3Client,
  param: S3ListFilesParameter,
): Promise<{
  files: FileLeaf[];
}> {
  const files: FileLeaf[] = [];
  const bucketName = param.bucketName;
  let continuationToken: string | undefined;
  let count = 1;
  do {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      ContinuationToken: continuationToken,
    });
    const response = await client.send(command);
    continuationToken = response.NextContinuationToken;
    if (response.Contents) {
      files.push(
        ...response.Contents.flatMap((o) => convertObjectToFileLeaf(o, param)),
      );
      if (count === 1 || count % 10 === 0) {
        logger.info(
          "S3 ListObjectsV2Command %d: %d files",
          count,
          files.length,
        );
      }
    } else {
      logger.warn("S3 ListObjectsV2Command %d: No files", count);
    }
    count++;
  } while (continuationToken !== undefined);

  return { files };
}

function convertObjectToFileLeaf(
  o: S3Object,
  param: S3ListFilesParameter,
): FileLeaf[] {
  if (!o.Key) {
    return [];
  }

  const filePath = o.Key.replace(/^maven\//, "");

  const name = path.basename(filePath);
  if (IGNORE_FILE_LIST.includes(name)) {
    return [];
  }

  return [
    {
      type: "file",
      fullPath: filePath,
      url: `${param.publicDomain}/${filePath}`,
      size: o.Size,
      contentType: getMineType(filePath, undefined),
      updatedAt: o.LastModified?.toISOString(),
    },
  ];
}
