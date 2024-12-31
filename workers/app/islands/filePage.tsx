import type {ArrayElement, DirectoryWithTypedChildren, FileTree,} from "file-metadata/src/types";
import {hc} from "hono/client";
import {cx} from "hono/css";
import {type FC, useEffect, useRef, useState} from "hono/jsx";
import type {ApiListFile} from "../api/route/list-file";
import * as css from "../css";
import {dateBox, fileGrid, fileList, fileListItem, fileText, repositoryItem, separateDirectoryAndFiles} from "../css";
import {Header} from "../pages";
import {FileDialog} from "./fileDialog";
import {getFileCreatedAt, getFileSize} from "../api/fileTreeUtil";

export const FilePage: FC<{ initialDotPath: string }> = ({
  initialDotPath,
}) => {
  const [dotPath, setDotPath] = useState(initialDotPath);
  const [data, setData] = useState<DirectoryWithTypedChildren | undefined>(
    undefined,
  );
  const [selectedFile, setSelectedFileInternal] = useState<
    FileTree | undefined
  >(undefined);
  const dialogRef = useRef<HTMLDialogElement>(null);

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

  const setSelectedFile = (file: FileTree) => {
    setSelectedFileInternal(file);
    dialogRef.current?.showModal();
  };

  useEffect(() => {
    fetchApi();
  }, [dotPath]);
  if (!data) {
    return (
      <div>
        <Header headerText={"Files in ..."} />
        <div class={css.preloadBox}>
          <div>Loading...</div>
          <div>
            <button type="button" onClick={fetchApi} class={css.reloadButton}>
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header headerText={`Files in ${data.fullPath}`} />
      <div class={css.box}>
        <FileList
          data={data}
          setPath={setDotPath}
          setSelectedFile={setSelectedFile}
        />
      </div>
      <FileDialog dialogRef={dialogRef} selectedFile={selectedFile} />
    </div>
  );
};

const FileList: FC<{
  data: DirectoryWithTypedChildren;
  setPath: (p: string) => void;
  setSelectedFile: (file: FileTree) => void;
}> = ({ data, setPath, setSelectedFile }) => {
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
        {data.childDirectories
          .toSorted((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true }),
          )
          .map((d) => {
            return (
              <Directory directory={d} setPath={setPath} key={d.fullPath} />
            );
          })}
      </div>
      <div class={separateDirectoryAndFiles} />
      <div class={cx(fileText, fileGrid)}>
        {data.childFiles
          .toSorted((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true }),
          )
          .map((f) => {
            return (
              <File
                file={f}
                key={f.fullPath}
                setSelectedFile={setSelectedFile}
              />
            );
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
      <button
        type="button"
        class={repositoryItem}
        onClick={setUrl}
        onKeyPress={setUrl}
      >
        {directory.name}
      </button>
    </div>
  );
};

const File: FC<{
  file: ArrayElement<DirectoryWithTypedChildren["childFiles"]>;
  setSelectedFile: (file: FileTree) => void;
  key: string;
}> = ({ file, setSelectedFile }) => {
  const date = getFileCreatedAt(file);
  return (
    <>
      <div>
        <button
          type="button"
          id={`file-name-${file.name}`}
          onClick={() => setSelectedFile(file)}
        >
          {file.name}
        </button>
      </div>
      <div>{file.contentType}</div>
      <div>{getFileSize(file)}</div>
      <div class={dateBox}>
        <span>{date}</span>
        <span>({Intl.DateTimeFormat().resolvedOptions().timeZone})</span>
      </div>
    </>
  );
};
