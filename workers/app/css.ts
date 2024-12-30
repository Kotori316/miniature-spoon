import { css } from "hono/css";

// Copied from tailwind
export const all = css`
  *,
  ::before,
  ::after {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: theme('borderColor.DEFAULT', currentColor);
  }

  ::before,
  ::after {
    --tw-content: '';
  }

  html,
  :host {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    -moz-tab-size: 4;
    tab-size: 4;
    font-family: theme('fontFamily.sans', ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"), serif;
    font-feature-settings: theme('fontFamily.sans[1].fontFeatureSettings', normal);
    font-variation-settings: theme('fontFamily.sans[1].fontVariationSettings', normal);
    -webkit-tap-highlight-color: transparent;
  }

  body {
    margin: 0;
    line-height: inherit;
  }

  hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
  }

  abbr:where([title]) {
    text-decoration: underline dotted;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: inherit;
    font-weight: inherit;
  }

  a {
    color: inherit;
    text-decoration: inherit;
  }

  b,
  strong {
    font-weight: bolder;
  }

  code,
  kbd,
  samp,
  pre {
    font-family: theme('fontFamily.mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace),monospace;
    font-feature-settings: theme('fontFamily.mono[1].fontFeatureSettings', normal);
    font-variation-settings: theme('fontFamily.mono[1].fontVariationSettings', normal);
    font-size: 1em;
  }

  small {
    font-size: 80%;
  }

  sub,
  sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sub {
    bottom: -0.25em;
  }

  sup {
    top: -0.5em;
  }

  table {
    text-indent: 0;
    border-color: inherit;
    border-collapse: collapse;
  }

  button,
  input,
  optgroup,
  select,
  textarea {
    font-family: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    font-size: 100%;
    font-weight: inherit;
    line-height: inherit;
    letter-spacing: inherit;
    color: inherit;
    margin: 0;
    padding: 0;
  }

  button,
  select {
    text-transform: none;
  }

  button,
  input:where([type='button']),
  input:where([type='reset']),
  input:where([type='submit']) {
    -webkit-appearance: button;
    background-color: transparent;
    background-image: none;
  }

  :-moz-focusring {
    outline: auto;
  }

  :-moz-ui-invalid {
    box-shadow: none;
  }

  progress {
    vertical-align: baseline;
  }

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    height: auto;
  }

  [type='search'] {
    -webkit-appearance: textfield;
    outline-offset: -2px;
  }

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-file-upload-button {
    -webkit-appearance: button;
    font: inherit;
  }

  summary {
    display: list-item;
  }

  blockquote,
  dl,
  dd,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  figure,
  p,
  pre {
    margin: 0;
  }

  fieldset {
    margin: 0;
    padding: 0;
  }

  legend {
    padding: 0;
  }

  ol,
  ul,
  menu {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  dialog {
    padding: 0;
  }

  textarea {
    resize: vertical;
  }

  input::placeholder,
  textarea::placeholder {
    opacity: 1;
    color: theme('colors.gray.400', #9ca3af);
  }

  button,
  [role="button"] {
    cursor: pointer;
  }

  :disabled {
    cursor: default;
  }

  img,
  svg,
  video,
  canvas,
  audio,
  iframe,
  embed,
  object {
    display: block;
    vertical-align: middle;
  }

  img,
  video {
    max-width: 100%;
    height: auto;
  }


  [hidden]:where(:not([hidden="until-found"])) {
    display: none;
  }
`;

// flex flex-row items-center gap-2 border-gray-600 border-b p-4"
export const header = css`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid gray;
  padding: 0.5rem;
  font-family: sans-serif;
`;

// h-20 w-20 rounded-full
export const birdLogo = css`
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
`;

// flex list-inside list-disc flex-col gap-1
export const repositoryUl = css`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  list-style-position: inside;
  list-style-type: disc;
`;

export const repositoryText = css`
  font-family: monospace;
  color: green;
`;

// font-mono text-emerald-700 decoration-indigo-400 underline-offset-auto hover:text-indigo-700 hover:underline
export const repositoryItem = css`
  ${repositoryText};
  text-decoration-color: dodgerblue;
  text-underline-offset: auto;
  cursor: pointer;

  &:hover {
    color: royalblue;
    text-underline: auto;
    text-decoration-line: underline;
  }
`;

export const title = css`
  font-size: 1.5rem;
  font-style: normal;
  font-weight: bold;
`;

export const box = css`
  margin: 1rem;
`;

export const separateDirectoryAndFiles = css`
  border: 1px solid gray;
`;

export const fileText = css`
  font-family: monospace;
  color: cornflowerblue;
`;

export const fileList = css`
  display: flex;
  flex-direction: column;
  gap: 1rem
`;

export const fileListItem = css`
  display: flex;
  flex-direction: column;
  gap: 0.25rem
`;
