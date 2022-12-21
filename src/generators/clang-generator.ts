import * as path from 'path';
import * as fse from 'fs-extra';

export class ClangGenerator {
    
    clangTidyFile : string;
    
    clangFormatFile : string;

    constructor() {
        this.clangFormatFile = path.join(
            __filename,
            "..",
            "templates",
            ".clang-tidy"
          );
          this.clangTidyFile = path.join(
            __filename,
            "..",
            "templates",
            ".clang-format"
          );
    }

    public generateClangTidy(dstFolder : string) {
        fse.writeFileSync(
            path.join(dstFolder,".clang-tidy"),
            fse.readFileSync(this.clangTidyFile).toString()
        );
    }
    
    public generateClangFormat(dstFolder : string) {
        fse.writeFileSync(
            path.join(dstFolder,".clang-format"),
            fse.readFileSync(this.clangFormatFile).toString()
        );
    }
    
}