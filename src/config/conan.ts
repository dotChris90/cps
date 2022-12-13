import { Option } from "./option";
import { Package } from "./package";
import { Tool } from "./tool";

export class Conan {

    options : Option[];

    packages : Package[];

    tools : Tool[];

    public constructor(init?: Partial<Conan>) {
        Object.assign(this, init);
        for(let idx = 0; idx < this.packages.length;idx++) {
            this.packages[idx] = new Package(this.packages[idx]);
        }
        for(let idx = 0; idx < this.options.length;idx++) {
            this.options[idx] = new Option(this.options[idx]);
        }
        for(let idx = 0; idx < this.tools.length;idx++) {
            this.tools[idx] = new Tool(this.tools[idx]);
        }
    }
}