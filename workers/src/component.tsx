import { PathObject, pathPairSort } from "./data";
import { html } from "hono/html";
import { FC } from "hono/jsx";
import path from "path-browserify";

export const Page: FC<{ title: string }> = (props) => {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${props.title}</title>
        <link href="/static/output.css" rel="stylesheet" />
      </head>
      <body>
        ${props.children}
      </body>
    </html>`;
};

export const DirContents: FC<{
  files: PathObject[];
  dirs: PathObject[];
  prefix: string;
}> = (props) => {
  const { files, dirs, prefix } = props;
  const sortedDirs = dirs.sort(pathPairSort);
  const sortedFiles = files.sort(pathPairSort);

  return (
    <Page title={`Maven ${prefix || "Root"}`}>
      <div class="m-4">
        <h1 class="font-sans text-2xl">Index of {prefix}</h1>
        <div class="my-4 border-b-2 border-dashed border-indigo-500"></div>
        <div class="flex flex-col gap-3">
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-3 text-lg">File</div>
            <div class="col-auto text-lg text-right">Size</div>
            <div class="col-auto"></div>
            <div class="col-auto text-lg">CreatedAt</div>
          </div>
          <Files files={sortedDirs} postfix="/"></Files>
          <Files files={sortedFiles} postfix=""></Files>
        </div>
      </div>
    </Page>
  );
};

const Files: FC<{ files: PathObject[]; postfix: string }> = (props) => {
  const { files, postfix } = props;
  return (
    <div>
      {files.map((o) => {
        const nextPath = path.resolve("/", o.absolutePath);
        return (
          <div class="grid grid-cols-6 gap-2">
            <div class="col-span-3">
              <a href={nextPath} class="font-mono text-emerald-700 hover:text-indigo-700 visited:text-purple-700">
                {o.basename + postfix}
              </a>
            </div>
            <div class="col-auto text-right">{o.size}</div>
            <div class="col-auto"></div>
            <div class="col-auto">{o.created}</div>
          </div>
        );
      })}
    </div>
  );
};

export function createDirContents(files: PathObject[], dirs: PathObject[], prefix: string) {
  return <DirContents dirs={dirs} files={files} prefix={prefix}></DirContents>;
}
