import { FilePage } from "../islands/filePage";

export function filePage(dotPath: string) {
  return (
    <div>
      <title>Files</title>
      <FilePage initialDotPath={dotPath} />
    </div>
  );
}
