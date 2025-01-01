import type { FC } from "hono/jsx";
import * as css from "../css";
import { RepositoryList } from "../islands/repositoryList";
import { css as cssDefine, cx } from "hono/css";

export function rootPage(title: string) {
  return (
    <div class="">
      <Header headerText={title} />
      <div class={css.box}>
        <RepositoryList />
      </div>
    </div>
  );
}

export const Header: FC<{ headerText: string }> = ({ headerText }) => {
  return (
    <header class={css.header}>
      <a href="/">
        <img
          src="https://avatars.githubusercontent.com/u/28705167?v=4"
          alt="avatar"
          class={css.birdLogo}
        />
      </a>
      <h1 class={css.title}>{headerText}</h1>
      <div class={cx(css.iconBox, css.box)}>
      <a class={css.iconBoxAnimation} href="https://github.com/Kotori316">
        <i class={cx(ghText, "fa-brands", "fa-github")}></i>
      </a>
      <a class={css.iconBoxAnimation} href="https://discord.gg/ThxxGXMjZn">
        <i class={cx(ghText, "fa-brands", "fa-discord")}></i>
      </a>
      <a class={css.iconBoxAnimation} href="https://twitter.com/small_bird_316">
        <i class={cx(ghText, "fa-brands", "fa-twitter")}></i>
      </a>
      </div>
    </header>
  );
};

const ghText = cssDefine`
  font-size: 1.25rem;
`;
