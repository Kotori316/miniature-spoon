import type { FileTree } from "file-metadata/src/types";
import { cx } from "hono/css";
import {
  type FC,
  type PropsWithChildren,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "hono/jsx";
import { getFileCreatedAt, getFileSize } from "../api/fileTreeUtil";
import { highlight } from "../client/highlighter";
import {
  dialog,
  dialogBox,
  dialogHeaderBox,
  dialogHeaderIconBox,
  fileGrid,
  fileText,
  separateDirectoryAndFiles,
} from "../css";

export const FileDialog: FC<{
  dialogRef: RefObject<HTMLDialogElement>;
  selectedFile: FileTree | undefined;
}> = ({ dialogRef, selectedFile }) => {
  const [content, setContent] = useState<string>();

  const innerContainer = useRef<HTMLDivElement>(null);
  const closeDialog = () => {
    dialogRef.current?.close();
    setContent(undefined);
  };
  const dialogClick = (event: Event) => {
    if (event.target === dialogRef.current) {
      closeDialog();
    }
  };

  if (!selectedFile) {
    return (
      <Dialog
        onDialogClick={dialogClick}
        dialogRef={dialogRef}
        innerContainer={innerContainer}
      >
        No selected file
      </Dialog>
    );
  }

  const relativeLink = selectedFile.fullPath.replaceAll("maven/", "");
  useEffect(() => {
    if (
      selectedFile.contentType.startsWith("text") ||
      selectedFile.contentType.startsWith("application/json") ||
      selectedFile.contentType.startsWith("application/xml")
    ) {
      const getHighlightedContent = async () => {
        const res = await fetch(relativeLink);
        if (res.ok) {
          setContent(await highlight(selectedFile, await res.text()));
        }
      };
      getHighlightedContent();
    } else {
      setContent("Preview is not available for this file type");
    }
  }, [selectedFile.url]);
  const date = getFileCreatedAt(selectedFile);

  return (
    <Dialog
      onDialogClick={dialogClick}
      dialogRef={dialogRef}
      innerContainer={innerContainer}
    >
      <h1 class={dialogHeaderBox}>
        <div class={dialogHeaderIconBox}>
          <i class="fa-solid fa-file" />
          <span>{selectedFile.fullPath}</span>
        </div>
        <a
          href={relativeLink}
          target="_blank"
          class={dialogHeaderIconBox}
          rel="noreferrer"
        >
          <i class="fa-solid fa-link" />
          <span>Link to file</span>
        </a>
        <button type="button" onClick={closeDialog}>
          <i class="fa-xl fa-solid fa-xmark" />
        </button>
      </h1>
      <div class={separateDirectoryAndFiles} />
      <div class={cx(fileText, fileGrid)}>
        <div>{selectedFile.name}</div>
        <div>{selectedFile.contentType}</div>
        <div>{getFileSize(selectedFile)}</div>
        <div>{date}</div>
      </div>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: intended */}
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
    </Dialog>
  );
};

const Dialog: FC<
  PropsWithChildren<{
    onDialogClick: (event: Event) => void;
    dialogRef: RefObject<HTMLDialogElement>;
    innerContainer: RefObject<HTMLDivElement>;
  }>
> = (props) => {
  return (
    <dialog
      class={dialog}
      ref={props.dialogRef}
      onClick={props.onDialogClick}
      onKeyPress={props.onDialogClick}
    >
      <div class={dialogBox} ref={props.innerContainer}>
        {props.children}
      </div>
    </dialog>
  );
};
