import type {
  ArrayElement,
  DirectoryWithTypedChildren,
} from "file-metadata/src/types";
import { hc } from "hono/client";
import { type FC, useEffect, useState } from "hono/jsx";
import type { ApiListFile } from "../api/route/list-file";
import * as css from "../css";
import {
  fileList,
  fileListItem,
  fileText,
  repositoryItem,
  separateDirectoryAndFiles,
} from "../css";
import { Header } from "../pages";

export const FilePage: FC<{ initialDotPath: string }> = ({
  initialDotPath,
}) => {
  const [dotPath, setDotPath] = useState(initialDotPath);
  const [data, setData] = useState<DirectoryWithTypedChildren | undefined>(
    undefined,
  );
  const fetchApi = async () => {
    const client = hc<ApiListFile>("/api/list-file");
    const res = await client.index.$post({ json: { dotPath } }, {});
    if (res.status >= 500) {
      console.log("Error in fetch files", res.status, res.statusText);
      return;
    }
    const result = await res.json();
    switch (result.type) {
      case "error":
        console.log("Error in fetch files", res.status, JSON.stringify(result));
        setData(undefined);
        break;
      case "ok":
        setData(result.result);
        document.title = `Files in ${result.result.name}`;
        break;
      default:
        throw new Error(`Unreachable${result satisfies never}`);
    }
  };

  useEffect(() => {
    fetchApi();
  }, [dotPath]);

  if (!data) {
    return (
      <div>
        <Header headerText={"Files in ..."} />
        <div class={css.box}>
          <div>Loading...</div>
          <button type="button" onClick={fetchApi}>
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header headerText={`Files in ${data.fullPath}`} />
      <div class={css.box}>
        <FileList data={data} setPath={setDotPath} />
      </div>
    </div>
  );
};

const FileList: FC<{
  data: DirectoryWithTypedChildren;
  setPath: (p: string) => void;
}> = ({ data, setPath }) => {
  const parent = data.parentDirectory
    ? {
        ...data.parentDirectory,
        name: "../",
      }
    : undefined;

  return (
    <div class={fileList}>
      <div class={fileListItem}>
        {parent && (
          <Directory directory={parent} setPath={setPath} key="parent" />
        )}
        {data.childDirectories.map((d) => {
          return <Directory directory={d} setPath={setPath} key={d.fullPath} />;
        })}
      </div>
      <div class={separateDirectoryAndFiles} />
      <div class={fileListItem}>
        {data.childFiles.map((f) => {
          return <File file={f} key={f.fullPath} />;
        })}
      </div>
    </div>
  );
};

const Directory: FC<{
  directory: ArrayElement<DirectoryWithTypedChildren["childDirectories"]>;
  setPath: (p: string) => void;
  key: string;
}> = ({ directory }) => {
  const setUrl = () => {
    const newUrl = `/files?path=${directory.dotPath}`;
    window.location.href = newUrl;
    /*setPath(directory.dotPath);
    window.history.pushState({}, "", newUrl);*/
  };

  return (
    <div>
      <span class={repositoryItem} onClick={setUrl} onKeyPress={setUrl}>
        {directory.name}
      </span>
    </div>
  );
};

const File: FC<{
  file: ArrayElement<DirectoryWithTypedChildren["childFiles"]>;
  key: string;
}> = ({ file }) => {
  return <div class={fileText}>{file.name}</div>;
};
