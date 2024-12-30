import {FC, useState} from "hono/jsx";
import {Header} from "../pages";
import * as css from "../css";
import {hc} from "hono/client";
import {ApiListFile} from "../api/route/list-file";

export const FilePage: FC<{ initialDotPath: string }> = ({initialDotPath}) => {
  const [dotPath, setDotPath] = useState(initialDotPath);
  const fetchApi = async () => {
    const client = hc<ApiListFile>("/api/list-file");
    const res = await client.index.$post({"dotPath": dotPath}, {});
    if (res.status >= 500) {
      console.log("Error in fetch files", res.status, res.statusText);
      return;
    }
    const result = await res.json();
    switch (result.type) {
      case  "error":
        console.log("Error in fetch files", res.status, JSON.stringify(result))
        break
      case "ok":
        console.log("Ok")
        break
      default:
        throw new Error("Unreachable" + (result satisfies never))
    }
  }

  return (
    <div>
      <Header headerText={`Files in ${dotPath}`}/>
      <div className={css.box}>{dotPath}</div>
      <button onClick={() => fetchApi()}>Reload</button>
    </div>
  )
}
