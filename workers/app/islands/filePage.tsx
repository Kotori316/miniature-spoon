import type {
  DirectoryLeaf,
  DirectoryOnlyName,
  FileLeaf,
} from "file-types/src/types";
import { hc } from "hono/client";
import { cx } from "hono/css";
import { type FC, useEffect, useRef, useState } from "hono/jsx";
import path from "path-browserify";
import { getFileSize, getFileUpdatedAt } from "../api/fileTreeUtil";
import type { ApiListFile } from "../api/route/list-file";
import * as css from "../css";
import {
  dateBox,
  fileGrid,
  fileList,
  fileListItem,
  fileText,
  repositoryItem,
  separateDirectoryAndFiles,
} from "../css";
import { Header } from "../pages";
import { FileDialog } from "./fileDialog";

export const FilePage: FC<{ initialPath: string }> = ({ initialPath }) => {
  const [fullPath, setFullPath] = useState(initialPath);
  const [data, setData] = useState<DirectoryLeaf>();
  const [hasError, setHasError] = useState<boolean>();
  const [selectedFile, setSelectedFileInternal] = useState<FileLeaf>();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const fetchApi = async () => {
    const client = hc<ApiListFile>("/api/list-file");
    const res = await client.index.$post({ json: { fullPath } }, {});
    if (res.status >= 500) {
      console.log("Error in fetch files", res.status, res.statusText);
      setHasError(true);
      return;
    }
    const result = await res.json();
    switch (result.type) {
      case "error":
        console.log("Error in fetch files", res.status, JSON.stringify(result));
        setData(undefined);
        setHasError(true);
        break;
      case "ok":
        setData(result.result);
        document.title = `Files in ${path.basename(result.result.fullPath)}`;
        break;
      default:
        throw new Error(`Unreachable${result satisfies never}`);
    }
  };

  const setSelectedFile = (file: FileLeaf) => {
    setSelectedFileInternal(file);
    dialogRef.current?.showModal();
  };

  useEffect(() => {
    fetchApi().catch(console.error);
  }, [fullPath]);
  if (!data) {
    return (
      <div>
        <Header headerText={hasError ? "Error" : "Files in ..."} />
        <div class={css.preloadBox}>
          {hasError ? (
            <div>Failed to get file list</div>
          ) : (
            <div>Loading...</div>
          )}
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
          setPath={setFullPath}
          setSelectedFile={setSelectedFile}
        />
      </div>
      <FileDialog dialogRef={dialogRef} selectedFile={selectedFile} />
    </div>
  );
};

const FileList: FC<{
  data: DirectoryLeaf;
  setPath: (p: string) => void;
  setSelectedFile: (file: FileLeaf) => void;
}> = ({ data, setPath, setSelectedFile }) => {
  const parent = data.parent
    ? {
        ...data.parent,
        name: "../",
      }
    : undefined;

  return (
    <div class={fileList}>
      <div class={fileListItem}>
        {parent && (
          <Directory directory={parent} setPath={setPath} key="parent" />
        )}
        {data.childrenDirectories
          .toSorted((a: DirectoryOnlyName, b: DirectoryOnlyName) =>
            path
              .basename(a.fullPath)
              .localeCompare(path.basename(b.fullPath), undefined, {
                numeric: true,
              }),
          )
          .map((d: DirectoryOnlyName) => {
            return (
              <Directory directory={d} setPath={setPath} key={d.fullPath} />
            );
          })}
      </div>
      <div class={separateDirectoryAndFiles} />
      <div class={cx(fileText, fileGrid)}>
        {data.childrenFiles
          .toSorted((a: FileLeaf, b: FileLeaf) =>
            path
              .basename(a.fullPath)
              .localeCompare(path.basename(b.fullPath), undefined, {
                numeric: true,
              }),
          )
          .map((f: FileLeaf) => {
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
  // The name prop is used to override the display name, such as "../"
  directory: DirectoryOnlyName & { name?: string };
  setPath: (p: string) => void;
  key: string;
}> = ({ directory }) => {
  const newUrl = `/files?path=${directory.fullPath}`;
  /*const setUrl = () => {
    window.location.href = newUrl;
    /!*setPath(dotPath);
    window.history.pushState({}, "", newUrl);*!/
  };*/

  return (
    <div>
      <a href={newUrl} class={repositoryItem}>
        {directory.name ?? path.basename(directory.fullPath)}
      </a>
    </div>
  );
};

const File: FC<{
  file: FileLeaf;
  setSelectedFile: (file: FileLeaf) => void;
  key: string;
}> = ({ file, setSelectedFile }) => {
  const date = getFileUpdatedAt(file);
  const fileName = path.basename(file.fullPath);
  return (
    <>
      <div>
        <button
          type="button"
          id={`file-name-${fileName}`}
          class={css.underline}
          onClick={() => setSelectedFile(file)}
        >
          {fileName}
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
