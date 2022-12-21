import * as path from 'path';
import * as fse from 'fs-extra';

export class CPSGenerator {

    cpsTemplateFile : string;

    constructor() {
        this.cpsTemplateFile = path.join(
            __filename,
            "..",
            "templates",
            "cps.yml"
          );
    }

    public generateCPSFile(
        name : string,
        version : string,
        license : string,
        dstFolder : string
    ) : void {
        const cpsContent = fse.readFileSync(
            this.cpsTemplateFile
        ).toString().replaceAll("{{name}}", name)
                    .replaceAll("{{version}}", version)
                    .replaceAll("{{license}}", license);
        fse.writeFileSync(
            path.join(dstFolder,"cps.yml"),
            cpsContent
        );
    }
}