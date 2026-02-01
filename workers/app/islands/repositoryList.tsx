import type { Repositories } from "file-metadata/src/types";
import { hc } from "hono/client";
import { cx } from "hono/css";
import { type FC, useEffect, useState } from "hono/jsx";
import path from "path-browserify";
import type { ApiRepositoryIndex } from "../api/route/repository-index";
import { repositoryItem, repositoryText, repositoryUl, title } from "../css";

const client = hc<ApiRepositoryIndex>("/api/repository-index");

export const RepositoryList: FC = () => {
  const [data, setData] = useState<Repositories>();

  const fetchApi = async () => {
    const res = await client.index.$get();
    const data = await res.json();
    setData(data);
  };

  useEffect(() => {
    fetchApi().catch(console.error);
  }, []);

  if (data === undefined) {
    return <div class={cx(repositoryText, title)}>Loading...</div>;
  }
  return (
    <ul class={repositoryUl}>
      {data.list.map(({ fullPath, repositoryName }) => {
        const name = path.basename(fullPath);
        return (
          <li key={name} class="">
            <a class={repositoryItem} href={`/files?path=${fullPath}`}>
              {repositoryName}
            </a>
          </li>
        );
      })}
    </ul>
  );
};
