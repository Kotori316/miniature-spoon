import type { FC } from "hono/jsx";
import * as css from "../css";
import { RepositoryList } from "../islands/repositoryList";

export function rootPage() {
  return (
    <div class="">
      <Header headerText="Kotori316 Maven Repository List" />
      <div class={css.box}>
        <RepositoryList />
      </div>
    </div>
  );
}

export const Header: FC<{ headerText: string }> = ({ headerText }) => {
  return (
    <header class={css.header}>
      <a href="https://github.com/Kotori316">
        <img
          src="https://avatars.githubusercontent.com/u/28705167?v=4"
          alt="avatar"
          class={css.birdLogo}
        />
      </a>
      <h1 class={css.title}>{headerText}</h1>
    </header>
  );
};
