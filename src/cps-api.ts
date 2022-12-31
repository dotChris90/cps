import * as path from 'path';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as glob from 'glob';
import * as utils from '@dotchris90/utils-extensions';

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
import { CMakeAPI } from './commands/cmake-api';
import { ValidationError } from './error/validation-error';
import { Item } from './input/item';

export class CPSAPI {
    
    cpsFileManager : ConfigManager;

    output : TextOutput;

    input : TextInput;

    conan : ConanAPI;

    cmake : CMakeAPI;

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
        this.cmake = new CMakeAPI(out, new Executor(out));
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
        this.generateCMakeTestLists();
        this.generateConanfilePy();
        this.generateConanTestFilePy();
        this.generateRequriements();
    }

    public async apiInstall(
        profile : string,
        buildType : string,
        importHeader : boolean
    ) : Promise<void> {

        const profiles = this.conan.listProfiles();
        const buildTypes = this.conan.getBuildTypes();

        const prjProfiles   = await this.setStringFromListIfEmpty(profile,"Select conan profile for build",profiles);
        const prjBuildType  = await this.setStringFromListIfEmpty(buildType,"Select build type",buildTypes);
        
        return this.install(prjProfiles,prjBuildType,importHeader);
    }

    public async apiBuild(

    ) : Promise<void> {
        return this.build();
    }

    public async apiDeploy(
        profile : string,
        buildType : string
    ) : Promise<void> {

        const profiles = this.conan.listProfiles();
        const buildTypes = this.conan.getBuildTypes();

        const prjProfiles   = await this.setStringFromListIfEmpty(profile,"Select conan profile for build",profiles);
        const prjBuildType  = await this.setStringFromListIfEmpty(buildType,"Select build type",buildTypes);

        return this.deploy(prjProfiles,prjBuildType);
    
    }

    public async apiPackage(
        profile : string,
        buildType : string
    ) : Promise<void> {

        const profiles = this.conan.listProfiles();
        const buildTypes =  this.conan.getBuildTypes();

        const prjProfiles   = await this.setStringFromListIfEmpty(profile,"Select conan profile for build",profiles);
        const prjBuildType  = await this.setStringFromListIfEmpty(buildType,"Select build type",buildTypes);

        return this.package(prjProfiles,prjBuildType);
    }

    public async apiTest(
        buildType : string,
        justBuild : string
    ) : Promise<void> {

        const buildTypes = this.conan.getBuildTypes();
        const buildOrExe = ["Yes","No"];

        const prjBuildType  = await this.setStringFromListIfEmpty(buildType,"Select build type",buildTypes);
        const decision = await this.setStringFromListIfEmpty(justBuild,"Just build but not execute?",buildOrExe);

        return this.test(prjBuildType,decision === "Yes");
    }

    public async apiEdit(

    ) : Promise<void> {

        let targets : string[] = [];
        this.cpsFileManager.config.cmake.executables.forEach(e => {
            targets.push(`exe --> ${e.name}`)
        });
        this.cpsFileManager.config.cmake.libraries.forEach(e => {
            targets.push(`lib --> ${e.name}`)
        });
        let selectedTarget =  await (this.input.pickFromList("Select target to edit",targets));
        const isLib = selectedTarget.startsWith("lib");
        selectedTarget = selectedTarget.substring("lib -->".length+1);

        const editOptions = (isLib) ? ["inc","src"] : ["src"];
        
        const option = await this.input.pickFromList("What type you want to edit?",editOptions);

        if (option === "inc") {
            await this.selectIncs(selectedTarget);
        }
        if (option === "src") {
            await this.selectSrcs(selectedTarget);
        }
        CPSConfig.writeToYMLFile(this.cpsFileManager.ymlFilePath,this.cpsFileManager.config);
    }

    protected async selectIncs(selectedTarget : string) {
        
        const srcFolder = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "src"
        );

        let incs : string[] = []

        const patterns = [
            `${srcFolder}/**/*.hpp`,
            `${srcFolder}/**/*.h`
        ];

        patterns.forEach(pattern => {
            incs = incs.concat(glob.sync(pattern))
        }); 

        for(let idx = 0; idx < incs.length;idx++)
            incs[idx] = "src" + incs[idx].substring(srcFolder.length);

        this.cpsFileManager.validateIncsInLibs(incs);
       
        const incsSelection = Array<Item>();

        incs.forEach(e => {
            let item = new Item();
            item.text = e;
            item.isSelected = this.cpsFileManager.doesLibHasInc(selectedTarget,e);
            incsSelection.push(item);
        });

        let selectedItems = (await this.input.editLists("Select header files for cps.yml",incsSelection))
                                       .filter(e => e.isSelected)
                                       .map(e => e.text);
        this.cpsFileManager.setIncs2Lib(selectedTarget,selectedItems);
    }

    protected async selectSrcs(selectedTarget : string) {

        const srcFolder = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "src"
        );

        let srcs : string[] = []

        const patterns = [
            `${srcFolder}/**/*.cpp`,
            `${srcFolder}/**/*.cc`,
            `${srcFolder}/**/*.c`
        ];

        patterns.forEach(pattern => {
            srcs = srcs.concat(glob.sync(pattern))
        }); 

        for(let idx = 0; idx < srcs.length;idx++)
            srcs[idx] = "src" + srcs[idx].substring(srcFolder.length);

        this.cpsFileManager.validateSrcsInTargets(srcs);
       
        const srcsSelection = Array<Item>();

        srcs.forEach(e => {
            let item = new Item();
            item.text = e;
            item.isSelected = this.cpsFileManager.doesTargetHasSrc(selectedTarget,e);
            srcsSelection.push(item);
        });

        let selectedItems = (await this.input.editLists("Select source files for cps.yml",srcsSelection))
                                       .filter(e => e.isSelected)
                                       .map(e => e.text);
        this.cpsFileManager.setSrcs2Target(selectedTarget,selectedItems);
    }  

    public async apiDoc(

    ) : Promise<void> {

        const buildType = "Release";

        return this.doc(buildType);
    }

    public async doc(
        buildType : string
    ) : Promise<void> {

        let toolchainfile = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            this.cpsFileManager.config.buildDir,
            "generators",
            "cps_toolchain.cmake"
        );
        if (!fse.existsSync(toolchainfile))
            throw new ValidationError("cps_toolchain file missing - please execute cps install before");
        let cmakefile =  path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "CMakeLists.txt"
        );
        if (!fse.existsSync(cmakefile))
            throw new ValidationError("CMakeLists.txt file missing - please execute cps generate before");
        let buildDir = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            this.cpsFileManager.config.buildDir,
        );
        return this.cmake.configureAndBuildTarget(cmakefile, buildDir, buildType,"doxy",toolchainfile);
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

    public generateCMakeTestLists() {
        const projectRoot = path.dirname(this.cpsFileManager.ymlFilePath);
        const cmakeGen = new CMakeGenerator(this.cpsFileManager);
        cmakeGen.generateCMakeTestFileTxt(path.join(projectRoot,"test_package"));
    }

    public generateConanfilePy() {
        const projectRoot = path.dirname(this.cpsFileManager.ymlFilePath);
        const conanGen = new ConanfileGenerator(this.cpsFileManager);
        conanGen.generateConanfilePy(projectRoot);
    }

    public generateConanTestFilePy() {
        const projectRoot = path.dirname(this.cpsFileManager.ymlFilePath);
        const conanGen = new ConanfileGenerator(this.cpsFileManager);
        conanGen.generateConanTestFilePy(path.join(projectRoot,"test_package"));
    }

    public generateRequriements() {
        const projectRoot = path.dirname(this.cpsFileManager.ymlFilePath);
        const pipGen = new PipGenerator(this.cpsFileManager);
        pipGen.generateRequriements(projectRoot);
    }

    protected async importHeader(
        buildProfile : string,
        hostProfile : string,
        buildType : string, 
        conanfile : string) {
        let importHeaders = true;
        let importDir = "";
        importDir = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            this.cpsFileManager.config.importDir
        );
        let reimport = false;
        if (fse.existsSync(importDir) && fse.readdirSync(importDir).length > 0) {
            reimport = (await this.input.pickFromList("import dir exists, shall do reimport?",["Yes","No"]) === "Yes");
        }
        if (reimport) {
            fse.rmSync(importDir, {recursive:true});
        }
        else {
            importHeaders = false;
        }
        if (importHeaders) {
            fse.mkdirpSync(importDir);
            return this.conan.importHeaders(buildProfile,hostProfile,buildType,conanfile,importDir);
        }
        else {
            return;
        }
    }   

    public async genCPSToolFile(
        buildProfile : string,
        hostProfie : string,
        buildType : string,
        genDir : string
    ) {
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), "cps-cmake-path"));
        const cpsToolchainFile = path.join(
            genDir,
            "generators",
            "cps_toolchain.cmake"
        );
        const conanToolchainFile = path.join(
            genDir,
            "generators",
            "conan_toolchain.cmake"
        );
        const conanfileTxt = path.join(
            tmpDir,
            "conanfile.txt"
        );
        const conanTmpBuild = path.join(
            tmpDir,
            "build"
        );
        const cmakePathFile = path.join(
            tmpDir,
            "build",
            "conan_paths.cmake"
        );
        let conanfileTxtContent = "[generators]\ncmake_paths\n[build_requires]\n";
        fse.mkdirpSync(tmpDir);
        fse.mkdirpSync(conanTmpBuild);
        
        const tools = this.cpsFileManager.config.conan.tools.filter(e => e.separate);
        tools.forEach(e => {
            conanfileTxtContent = `${conanfileTxtContent}${e.name}/${e.version}\n`;
        });
        fse.writeFileSync(
            conanfileTxt,
            conanfileTxtContent
        );

        await this.conan.simpleInstall(conanfileTxt,conanTmpBuild);

        const cmakePathContent = fse.readFileSync(cmakePathFile).toString();
        
        let cpsToolchainFileContent = fse.readFileSync(
            conanToolchainFile
        ).toString();
        cpsToolchainFileContent = `${cpsToolchainFileContent}\n${cmakePathContent}`;

        if (fse.existsSync(cpsToolchainFile))
            fse.rmSync(cpsToolchainFile);
        fse.writeFileSync(
            cpsToolchainFile,cpsToolchainFileContent
        );
    }

    public async install(
        hostProfile : string,
        buildType : string,
        importHeaders : boolean
        ) : Promise<void> {
            const buildProfile = "default";
            const conanfile = path.join(
                path.dirname(this.cpsFileManager.ymlFilePath),
                "conanfile.py"
            );
            const genDir = path.join(
                path.dirname(this.cpsFileManager.ymlFilePath),
                this.cpsFileManager.config.buildDir
            );
            if(fse.existsSync(genDir))
                fse.rmSync(genDir,{recursive:true});
            fse.mkdirpSync(genDir);
            await this.conan.install(buildProfile,hostProfile,buildType,conanfile,genDir);
            
            if (this.cpsFileManager.config.conan.tools.filter(e => e.separate).length > 0)
                await this.genCPSToolFile(buildProfile,hostProfile,buildType,genDir);

            return this.importHeader(buildProfile,hostProfile,buildType,conanfile);
        }
    
    public build() {
        const conanfile = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "conanfile.py"
        );
        const buildDir = this.cpsFileManager.config.buildDir;
        fse.mkdirpSync(buildDir);
        return this.conan.build(conanfile,buildDir);
    }

    public deploy(
        hostProfie : string,
        buildType : string
    ) : Promise<void> {
        const conanfile = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "conanfile.py"
        );
        const deployDir = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            this.cpsFileManager.config.deployDir
        );
        if (fse.existsSync(deployDir))
            fse.rmSync(deployDir,{recursive:true});
        fse.mkdirSync(deployDir);
        const buildProfile = "default";
        return this.conan.deploy(buildProfile,hostProfie,buildType,conanfile,deployDir);
    }

    public async package(
        hostProfie : string,
        buildType : string
    ) : Promise<void> {
        const conanfile = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            "conanfile.py"
        );
        const packageDir = path.join(
            path.dirname(this.cpsFileManager.ymlFilePath),
            this.cpsFileManager.config.pkgDir
        );
        const buildProfile = "default";
        if (fse.existsSync(packageDir))
            fse.rmSync(packageDir,{recursive:true});
        await fse.mkdirp(packageDir);
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
        const conanTestBuildFolder= path.join(
            path.dirname(conanTestFile),
            "build"
        );

        const hostProfile = "default";
        const buildProfile = "default";

        if (fse.existsSync(conanTestBuildFolder)) {
            fse.readdirSync(conanTestBuildFolder,{withFileTypes:true})
               .filter(e => this.conan.getBuildTypes().includes(e.name))
               .forEach(e => fse.rmSync(path.join(conanTestBuildFolder,e.name),{recursive:true}));
        }
        if (fse.existsSync(path.join(conanTestBuildFolder,buildType)))
            fse.rmSync(path.join(conanTestBuildFolder,buildType),{recursive:true});

        if (justBuild) {
            return this.conan.buildTest(hostProfile,buildProfile,buildType,conanfile,conanTestFile);
        }
        else {
            return this.conan.create(buildProfile,hostProfile,buildType,conanfile);
        }
    }
}