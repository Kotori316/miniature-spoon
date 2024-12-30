import * as css from "../css";
import { RepositoryList } from "../islands/repositoryList";
import {FC} from "hono/jsx";

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

export const Header: FC<{headerText: string}> = ({headerText}) => {
  return (
    <header className={css.header}>
      <a href="https://github.com/Kotori316">
        <img
          src="https://avatars.githubusercontent.com/u/28705167?v=4"
          alt="avatar"
          className={css.birdLogo}
        />
      </a>
      <h1 className={css.title}>{headerText}</h1>
    </header>
  )
}
