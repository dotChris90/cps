export class Tool {
  name = "";

  version = "";

  options = new Map<string, string>();

  public constructor(init?: Partial<Tool>) {
    Object.assign(this, init);
  }
}
