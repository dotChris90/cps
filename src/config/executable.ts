export class Executable {
  name = "";

  srcs: string[] = [];

  links: string[] = [];

  public constructor(init?: Partial<Executable>) {
    Object.assign(this, init);
  }
}
