export class Library {
  name = "";

  srcs: string[] = [];

  links: string[] = [];

  incs: string[] = [];

  public constructor(init?: Partial<Library>) {
    Object.assign(this, init);
  }

  public srcsAsSet() : Set<string> {
    return new Set<string>(this.srcs);
  }

  public linksAsSet() : Set<string> {
    return new Set<string>(this.links);
  }

  public incsAsSet() : Set<string> {
    return new Set<string>(this.incs);
  }
}
