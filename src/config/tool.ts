export class Tool {
  name = "";

  version = "";

  options = new Map<string, string>();

  separate = false;

  public constructor(init?: Partial<Tool>) {
    Object.assign(this, init);
  }
}
