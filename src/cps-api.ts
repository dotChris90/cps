import * as path from 'path';
import * as fse from 'fs-extra';

import { ConfigManager } from "./config/config-manager";
import { CPSConfig } from "./config/cps-config";
import { ClangGenerator } from "./generators/clang-generator";
import { CMakeGenerator } from './generators/cmakefile-generator';
import { ConanfileGenerator } from './generators/conanfile-generator';
import { CppGenerator } from './generators/cpp-generator';
import { CPSGenerator } from "./generators/cps-generator";
import { DoxygenGenerator } from './generators/doxygen-generator';

export class CPSAPI {
    
    cpsFileManager : ConfigManager;

    constructor(config : ConfigManager = null) {
        if (config === null) {
            // pass 
        }
        else {
            this.cpsFileManager = config;
        }
    }

    public newProject(
        destDir : string,
        name : string,
        version : string,
        license : string
    ) : void {
        
        const dstFolder = path.join(destDir,name);
        fse.mkdirpSync(dstFolder);
        const cpsGen = new CPSGenerator();
        cpsGen.generateCPSFile(
            name,
            version,
            license,
            dstFolder
        );
        
        const clangGen = new ClangGenerator();
        clangGen.generateClangFormat(dstFolder);
        clangGen.generateClangTidy(dstFolder);
        
        const cppGen = new CppGenerator();
        cppGen.generateForNewProject(dstFolder);

        const doxyGen = new DoxygenGenerator();
        doxyGen.generateDoxyfile(dstFolder);

        this.cpsFileManager = ConfigManager.createFromYmlFile(
            path.join(dstFolder,"cps.yml")
        );


    }

    public generateCMakeLists() {
        const projectRoot = path.dirname(this.cpsFileManager.ymlFilePath);
        const cmakeGen = new CMakeGenerator(this.cpsFileManager);
        cmakeGen.generateCMakeFileTxt(projectRoot);
        cmakeGen.generateCPSCMakeModule(projectRoot);
    }

    public generateConanfilePy() {
        const projectRoot = path.dirname(this.cpsFileManager.ymlFilePath);
        const conanGen = new ConanfileGenerator(this.cpsFileManager);
        conanGen.generateConanfilePy(projectRoot);
    }
}