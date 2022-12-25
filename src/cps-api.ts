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
import { TextOutput } from './output/text-output';
import { TextInput } from './input/text-input';
import { ConanAPI } from './commands/conan-api';
import { Executor } from './commands/executor';
import { PipGenerator } from './generators/pip-generator';
import { Console } from './Console';
import { Fake } from './fake';

export class CPSAPI {
    
    cpsFileManager : ConfigManager;

    output : TextOutput;

    input : TextInput;

    conan : ConanAPI;

    constructor(config : ConfigManager = null, out : TextOutput, input : TextInput) {
        if (config === null) {
            // pass 
        }
        else {
            this.cpsFileManager = config;
        }
        this.input = input;
        this.output = out;
        this.conan = new ConanAPI(out, new Executor(out));
    }

    public static createTerminalBased() : CPSAPI {
        let configManager : ConfigManager;
        if (fse.existsSync(path.join(process.cwd(),"cps.yml"))) {
            configManager = ConfigManager.createFromYmlFile(
                path.join(process.cwd(),"cps.yml")
            );
        }
        else {
            configManager = null;
        }
        const [input,output] = Console.getConsoleInterfaces();
        const cps = new CPSAPI(configManager,output,input);
        return cps;
    }

    public static createFakeBased(configManager : ConfigManager = null) : CPSAPI {
        const [input,output] = Fake.getFakeInterfaces();
        const cps = new CPSAPI(configManager,output,input);
        return cps;
    }

    protected async setStringValueIfEmpty(value : string,question : string, defaultValue : string) : Promise<string> {
        let returnValue = "";
        if (value === "") {
            this.input.clear();
            returnValue = await this.input.readInput(question,defaultValue);
            this.input.clear();
        } 
        else {
            returnValue = value;
        }
        return returnValue;
    }

    protected async setStringFromListIfEmpty(value : string, question : string, list : string[]) : Promise<string> {
        let returnValue = "";
        if(value === "") {
            this.input.clear();
            returnValue = await this.input.pickFromList(question,list);
            this.input.clear();
        }
        else {
            returnValue = value;
        }
        return returnValue;
    }

    public async apiNewProject(
        destDir : string,
        name : string,
        version : string,
        license : string
    ) : Promise<void> {

        const prjName       = await this.setStringValueIfEmpty(name,"Project name (package name) : ","abc");
        const prjVersion    = await this.setStringValueIfEmpty(version,"Version :","0.1.0");
        const location      = await this.setStringValueIfEmpty(destDir,"Location :",process.cwd());
        const prjlicense    = await this.setStringValueIfEmpty(license,"License :","MIT");
        
        return this.newProject(location,prjName,prjVersion,prjlicense);
    }

    public async apiGenerate() : Promise<void> {
        this.generateCMakeLists();
        this.generateConanfilePy();
        this.generateRequriements();
    }

    public async apiInstall(
        profile : string,
        buildType : string
    ) : Promise<void> {
        const profiles = this.conan.listProfiles();
        const buildTypes = ["Debug","Release"];

        const prjProfiles   = await this.setStringFromListIfEmpty(profile,"Select conan profile for build",profiles);
        const prjBuildType  = await this.setStringFromListIfEmpty(buildType,"Select build type",buildTypes);
        
        return this.install(prjProfiles,prjBuildType);
    }

    public async apiBuild(

    ) : Promise<void> {
        return this.build();
    }

    public async apiPackage() : Promise<void> {
        return this.package("default","Release");
    }

    public async newProject(
        destDir : string,
        name : string,
        version : string,
        license : string
    ) : Promise<void> {
        
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

    public generateRequriements() {
        const projectRoot = path.dirname(this.cpsFileManager.ymlFilePath);
        const pipGen = new PipGenerator(this.cpsFileManager);
        pipGen.generateRequriements(projectRoot);
    }

    public install(
        hostProfile : string,
        buildType : string) {
            const buildProfile = "default";
            const conanfile = path.join(
                path.dirname(this.cpsFileManager.ymlFilePath),
                "conanfile.py"
            );
            const genDir = path.join(
                path.dirname(this.cpsFileManager.ymlFilePath),
                this.cpsFileManager.config.buildDir
            );
            fse.mkdirpSync(genDir);
            return this.conan.install(buildProfile,hostProfile,buildType,conanfile,genDir);
        }
    
    public build() {
        const conanfile = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "conanfile.py"
        );
        const buildDir = this.cpsFileManager.config.buildDir;
        return this.conan.build(conanfile,buildDir);
    }

    public package(
        hostProfie : string,
        buildType : string
    ) {
        const conanfile = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "conanfile.py"
        );
        const packageDir = this.cpsFileManager.config.pkgDir;
        const buildProfile = "default";
        return this.conan.package(buildProfile,hostProfie,buildType,conanfile,packageDir);
    }

    public test(
        buildType : string,
        justBuild : boolean
    ) {
        const conanfile = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "conanfile.py"
        );
        const conanTestFile = path.join(
            path.dirname(conanfile),
            "test_package",
            "conanfile.py"
        );
        const hostProfile = "default";
        const buildProfile = "default";

        if (justBuild) {
            return this.conan.buildTest(hostProfile,buildProfile,buildType,conanfile,conanTestFile);
        }
        else {
            return this.conan.create(buildProfile,hostProfile,buildType,conanfile);
        }
    }
}