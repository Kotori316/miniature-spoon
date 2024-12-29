import * as css from "../css";
import { RepositoryList } from "../islands/repositoryList";

export function rootPage() {
  return (
    <div class="">
      <header class={css.header}>
        <a href="https://github.com/Kotori316">
          <img
            src="https://avatars.githubusercontent.com/u/28705167?v=4"
            alt="avatar"
            class={css.birdLogo}
          />
        </a>
        <h1 class={css.title}>Kotori316 Maven Repository List</h1>
      </header>
      <div class={css.box}>
        <RepositoryList />
      </div>
    </div>
  );
}
