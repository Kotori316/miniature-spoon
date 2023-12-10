import prettyBytes from "pretty-bytes";

export class PathObject {
  constructor(
    public readonly basename: string,
    public readonly absolutePath: string,
    private readonly fileSize?: number,
    private readonly createdDate?: Date
  ) {}

  get size(): string {
    if (this.fileSize === undefined) {
      return "-";
    } else {
      return prettyBytes(this.fileSize);
    }
  }

  get created(): string {
    if (this.createdDate === undefined) {
      return "-";
    } else {
      return this.createdDate.toISOString();
    }
  }
}

export function pathPairSort(a: PathObject, b: PathObject): number {
  return a.basename.localeCompare(b.basename, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export class ScanListResult {
  constructor(
    public readonly directories: PathObject[],
    public readonly files: PathObject[]
  ) {}

  isEmpty(): boolean {
    return this.directories.length < 2 && this.files.length === 0;
  }
}
