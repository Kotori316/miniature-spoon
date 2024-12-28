import {Page} from "../page";
import {Suspense} from "hono/jsx";
import {getRepositoryIndexList} from "../api/repositoryIndex";

export function rootPage() {
  return (
    <Page title="Index">
      <div class="">
        <header class="flex flex-row items-center gap-2 border-gray-600 border-b p-4">
          <a href="https://github.com/Kotori316">
            <img
              src="https://avatars.githubusercontent.com/u/28705167?v=4"
              alt="avatar"
              class="h-20 w-20 rounded-full"
            />
          </a>
          <h1>Kotori316 Maven Repository List</h1>
        </header>
        <Suspense fallback={<span>Loading</span>}>
          <RepositoryList/>
        </Suspense>
      </div>
    </Page>
  );
}

async function RepositoryList() {
  const list = await getRepositoryIndexList();
  return (
    <div class="m-4">
      <ul class="flex list-inside list-disc flex-col gap-1">
        {list.map(({name, path}) => {
          return (
            <li key={name}>
              <a
                class="font-mono text-emerald-700 decoration-indigo-400 underline-offset-auto hover:text-indigo-700 hover:underline "
                href={path}
              >
                {name}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
