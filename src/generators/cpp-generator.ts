import * as fse from 'fs-extra';
import * as path from 'path';

export class CppGenerator {

    newFolder : string;

    srcFolder : string;

    testFolder : string;

    constructor() {
        this.newFolder =  path.join(
            __filename,
            "..",
            "templates",
            "new"
          );
        this.srcFolder = path.join(
            this.newFolder,
            "src"
        );
        this.testFolder = path.join(
            this.newFolder,
            "test_package"
        );
    }

    public generateForNewProject(
        dstFolder : string
    ) : void {
        const srcFiles : string[] = [];
        const dstFile : string[] = [];
        fse.readdirSync(this.srcFolder)
           .forEach(e => {
            srcFiles.push(path.join(this.srcFolder,e));
            dstFile.push(path.join(dstFolder,"src", e));
        });
        for(let idx = 0; idx < srcFiles.length;idx++) {
            fse.mkdirpSync(path.dirname(dstFile[idx]));
            fse.copyFileSync(srcFiles[idx],dstFile[idx]);
        }
        fse.readdirSync(this.testFolder,{withFileTypes:true})
           .filter(e => path.extname(e.name) === ".cpp")
           .forEach(e => {
                fse.copySync(
                    path.join(this.testFolder,e.name),
                    path.join(dstFolder,"test_package",e.name)
                );
           });
    }
}