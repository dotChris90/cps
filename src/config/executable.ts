export class Executable {
  name = "";

  srcs: string[] = [];

  links: string[] = [];

  public constructor(init?: Partial<Executable>) {
    Object.assign(this, init);
  }

  public srcsAsSet() : Set<string> {
    return new Set<string>(this.srcs);
  }

  public linksAsSet() : Set<string> {
    return new Set<string>(this.links);
  }
}
