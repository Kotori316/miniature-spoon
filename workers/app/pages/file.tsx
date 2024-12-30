import {FilePage} from "../islands/filePage";

export function filePage(dotPath: string) {
  return (
    <FilePage initialDotPath={dotPath} />
  )
}
