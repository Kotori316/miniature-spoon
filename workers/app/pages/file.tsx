import { FilePage } from "../islands/filePage";

export function filePage(dotPath: string) {
  return (
    <div>
      <FilePage initialDotPath={dotPath} />
    </div>
  );
}
