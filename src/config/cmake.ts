import { Executable } from "./executable";
import { Library } from "./library";

export class CMake {

    executables : Executable[];

    libraries : Library[];

    public constructor(init?: Partial<CMake>) {
        Object.assign(this, init);
        for(let idx = 0; idx < this.executables.length;idx++) {
            this.executables[idx] = new Executable(this.executables[idx]);
        }
        for(let idx = 0; idx < this.libraries.length;idx++) {
            this.libraries[idx] = new Library(this.libraries[idx]);
        }
    }
}