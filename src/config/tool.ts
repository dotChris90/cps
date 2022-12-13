export class Tool {

    name = "";

    version = "";

    public constructor(init?: Partial<Tool>) {
        Object.assign(this, init);
    }
}