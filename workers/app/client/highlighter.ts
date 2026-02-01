import type { FileLeaf } from "file-metadata/src/types";

import type { HighlighterCore } from "shiki";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import shikiJson from "shiki/langs/json.mjs";
import shikiXml from "shiki/langs/xml.mjs";
import shikiMinLight from "shiki/themes/min-light.mjs";

let _highlighter: HighlighterCore | null = null;

export async function highlight(
  file: FileLeaf,
  content: string,
): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter?.codeToHtml(content, {
    lang: await detectLanguage(file),
    theme: "min-light",
  });
}

async function getHighlighter() {
  if (!_highlighter) {
    _highlighter = await createHighlighterCore({
      themes: [shikiMinLight],
      langs: [shikiJson, shikiXml],
      engine: createOnigurumaEngine(import("shiki/wasm")),
    });
  }
  return _highlighter;
}

async function detectLanguage(file: FileLeaf) {
  const path = await import("path-browserify");
  const ext = path.extname(file.fullPath);
  const extensionMap: Record<string, string> = {
    ".module": "json",
    ".json": "json",
    ".pom": "xml",
    ".xml": "xml",
  };
  return extensionMap[ext] ?? "text";
}
