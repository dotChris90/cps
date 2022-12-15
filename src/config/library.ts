export class Library {
  name = "";

  srcs: string[] = [];

  links: string[] = [];

  incs: string[] = [];

  public constructor(init?: Partial<Library>) {
    Object.assign(this, init);
  }
}
