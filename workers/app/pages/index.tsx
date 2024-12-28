import {Page} from "../page";

export function rootPage() {
  return (
    <Page title="Index">
      <div class="">
        <header class="p-4 flex flex-row gap-2 items-center border-b border-gray-600">
          <a href="https://github.com/Kotori316">
            <img src="https://avatars.githubusercontent.com/u/28705167?v=4" alt="avatar"
                 className="w-20 h-20 rounded-full"
            />
          </a>
          <div>Kotori316 Maven</div>
        </header>
      </div>
    </Page>
  )
}
