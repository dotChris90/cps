export class Package {

    name = "";

    version = "";

    options = new Map<string,string>();

    public constructor(init?: Partial<Package>) {
        Object.assign(this, init);
     }
}