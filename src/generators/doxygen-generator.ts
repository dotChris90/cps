import * as path from 'path';
import * as fse from 'fs-extra';

export class DoxygenGenerator {

    doxyfile : string;

    constructor() {
        this.doxyfile = path.join(
            __filename,
            "..",
            "templates",
            "Doxyfile"
          );
    }

    public generateDoxyfile(dstFolder : string) {
        fse.copyFileSync(
            this.doxyfile,
            path.join(dstFolder,"Doxyfile")
        );
    }
}