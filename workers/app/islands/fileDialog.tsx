import type {FileTree} from "file-metadata/src/types";
import {type FC, PropsWithChildren, type RefObject, useEffect, useRef, useState} from "hono/jsx";
import {
  dialog,
  dialogBox,
  dialogHeaderBox,
  dialogHeaderIconBox,
  fileGrid,
  fileText,
  separateDirectoryAndFiles
} from "../css";
import {getFileCreatedAt, getFileSize} from "../api/fileTreeUtil";
import {cx} from "hono/css";

export const FileDialog: FC<{
  dialogRef: RefObject<HTMLDialogElement>;
  selectedFile: FileTree | undefined;
}> = ({dialogRef, selectedFile}) => {
  const [content, setContent] = useState<string>()

  const innerContainer = useRef<HTMLDivElement>(null);
  const closeDialog = () => {
    dialogRef.current?.close();
    setContent(undefined)
  };
  const dialogClick = (event: Event) => {
    if (event.target === dialogRef.current) {
      closeDialog();
    }
  };

  if (!selectedFile) {
    return (
      <Dialog onDialogClick={dialogClick} dialogRef={dialogRef} innerContainer={innerContainer}>
        No selected file
      </Dialog>
    )
  }

  const relativeLink = selectedFile.fullPath.replaceAll("maven/", "")
  useEffect(() => {
    if(selectedFile.contentType.startsWith("text")
    || selectedFile.contentType.startsWith("application/json")
    || selectedFile.contentType.startsWith("application/xml")
    ) {
      const f = async () => {
        const res = await fetch(relativeLink);
        if (res.ok) {
          const text = await res.text();
          setContent(text)
        }
      }
      f()
    } else {
      setContent("Preview is not available for this file type")
    }

  }, [selectedFile.url]);
  const date = getFileCreatedAt(selectedFile);

  return (
    <Dialog onDialogClick={dialogClick} dialogRef={dialogRef} innerContainer={innerContainer}>
      <h1 class={dialogHeaderBox}>
        <div className={dialogHeaderIconBox}>
          <i className="fa-solid fa-file"></i>
          <span>{selectedFile.fullPath}</span>
        </div>
        <a href={relativeLink} target="_blank" className={dialogHeaderIconBox}>
          <i className="fa-solid fa-link"></i>
          <span>Link to file</span>
        </a>
        <button type="button" onClick={closeDialog}>
          <i class="fa-xl fa-solid fa-xmark"/>
        </button>
      </h1>
      <div class={separateDirectoryAndFiles}></div>
      <div class={cx(fileText, fileGrid)}>
        <div>{selectedFile.name}</div>
        <div>{selectedFile.contentType}</div>
        <div>{getFileSize(selectedFile)}</div>
        <div>{date}</div>
      </div>
      {content && <div>{content}</div>}
    </Dialog>
  );
};

const Dialog: FC<PropsWithChildren<{
  onDialogClick: (event: Event) => void;
  dialogRef: RefObject<HTMLDialogElement>;
  innerContainer: RefObject<HTMLDivElement>;
}>> = (props) => {
  return (
    <dialog class={dialog} ref={props.dialogRef} onClick={props.onDialogClick} onKeyPress={props.onDialogClick}>
      <div className={dialogBox} ref={props.innerContainer}>
        {props.children}
      </div>
    </dialog>
  )
}
