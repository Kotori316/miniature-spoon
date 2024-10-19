import { html } from "hono/html";
import type { FC, PropsWithChildren } from "hono/jsx";
import { type PathObject, pathPairSort } from "./file";

const Page: FC<PropsWithChildren<{ title: string }>> = (props) => {
  const content = (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>{props.title}</title>
        <link href="/static/output.css" rel="stylesheet" />
      </head>
      <body>{props.children}</body>
    </html>
  );
  return html`<!doctype html>${content}`;
};

export function createRepositoryIndex(repositoryPathes: string[]) {
  const extension = ".html";
  return (
    <Page title="Repositories">
      <div class="m-4">
        <h1 class="font-sans text-2xl">List of Repositories</h1>
        <div class="my-4 border-b-2 border-dashed border-indigo-500" />
        <ul class="list-disc list-inside flex flex-col gap-1">
          {repositoryPathes.map((path) => {
            const lastSlash = path.lastIndexOf("/");
            const group = path.substring(0, lastSlash).replaceAll("/", ".");
            const name = path.substring(lastSlash + 1);
            return (
              <li>
                <a
                  class="font-mono underline-offset-auto text-emerald-700 hover:text-indigo-700 hover:underline decoration-indigo-400"
                  href={`${path}${extension}`}
                >
                  {`${group}:${name}`}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </Page>
  );
}

const DirContents: FC<{
  files: PathObject[];
  dirs: PathObject[];
  prefix: string;
  directoryPagePrefix: string;
}> = (props) => {
  const { files, dirs, prefix, directoryPagePrefix } = props;
  const sortedDirs = dirs.sort(pathPairSort);
  const sortedFiles = files.sort(pathPairSort);

  return (
    <Page title={`Maven ${prefix || "Root"}`}>
      <div class="m-4">
        <h1 class="font-sans text-2xl">Index of {prefix}</h1>
        <div class="my-4 border-b-2 border-dashed border-indigo-500" />
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-3 text-lg">File</div>
            <div class="col-auto text-lg text-right">Size</div>
            <div class="col-auto" />
            <div class="col-auto text-lg">CreatedAt</div>
          </div>
          <Files
            files={sortedDirs}
            pagePrefix={directoryPagePrefix || ""}
            isDirectory={true}
          />
          <Files files={sortedFiles} pagePrefix="" isDirectory={false} />
        </div>
      </div>
    </Page>
  );
};

const Files: FC<{
  files: PathObject[];
  pagePrefix: string;
  isDirectory: boolean;
}> = (props) => {
  const { files, pagePrefix, isDirectory } = props;
  const postfix = isDirectory ? "/" : "";
  const extension = isDirectory ? ".html" : "";
  return (
    <div>
      {files.map((o) => {
        const nextPath = (pagePrefix || "") + o.absolutePath + extension;
        return (
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-3">
              <a
                href={nextPath}
                class="font-mono text-emerald-700 hover:text-indigo-700 visited:text-purple-700"
              >
                {o.basename + postfix}
              </a>
            </div>
            <div class="col-auto text-right">{o.size}</div>
            <div class="col-auto" />
            <div class="col-auto">{o.created}</div>
          </div>
        );
      })}
    </div>
  );
};

export function createDirContents(
  files: PathObject[],
  dirs: PathObject[],
  prefix: string,
  directoryPagePrefix: string,
) {
  return (
    <DirContents
      dirs={dirs}
      files={files}
      prefix={prefix}
      directoryPagePrefix={directoryPagePrefix}
    />
  );
}
