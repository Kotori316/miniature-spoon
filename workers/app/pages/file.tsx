import { FilePage } from "../islands/filePage";

export function filePage(path: string) {
  return (
    <div>
      <title>Files</title>
      <FilePage initialPath={path} />
    </div>
  );
}
