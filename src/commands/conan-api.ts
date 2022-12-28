import * as path from 'path';
import * as utilExt from '@dotchris90/utils-extensions';
import * as fse from 'fs-extra';
import * as os from 'os';
import { TextOutput } from "../output/text-output";
import { ConanCommands } from "./conan-commands";
import { InvalidPathError } from '../error/invalide-path-error';
import { Executor } from "./executor";
import { Command } from './command';
import { ConanPackage } from '../conan/package';

export class ConanAPI {

    conanCmd : ConanCommands;

    output : TextOutput;

    exe : Executor;

    constructor(out : TextOutput, exe : Executor) {
        this.conanCmd = new ConanCommands();
        this.output = out;
        this.exe = exe;
    }

    public getBuildTypes() : string[] {
        return ['Debug', 'Release', 'RelWithDebInfo', 'MinSizeRel'];
    }

    protected validateConanfile(
        conanfile : string
    ) : void {
        if (!fse.existsSync(conanfile) ) {
            throw new InvalidPathError("conanfile does not exist");
        }
        if (!conanfile.endsWith("conanfile.py") && !conanfile.endsWith("conanfile.txt")) {
            throw new InvalidPathError("selected file is not a conanfile");    
        }   
    }

    protected validateDir(
        dirname : string,
        dirPath : string
    ) : void {
        if (!fse.existsSync(dirPath)) {
            throw new InvalidPathError(`directory ${dirname} does not exist.`);
        }
    }

    public listProfiles() : string[] {
        const cmd = this.conanCmd.listProfiles();
        const profiles = this.exe.execSyncGetFormatStdout(cmd);
        return profiles;
    }
    
    public simpleInstall(
        conanfile : string,
        gendir : string
    ) : Promise<void> {
        
        this.validateConanfile(conanfile);
        this.validateDir("gendir",gendir);

        const cmd = this.conanCmd.simpleInstall(conanfile);
        cmd.workDir = gendir;

        return this.exe.execAsync(cmd);
    }

    public install(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string,
        genDir : string) : Promise<void> {
        
        this.validateConanfile(conanfile);
        this.validateDir("genDir",genDir);

        const cmd = this.conanCmd.install(hostProfile,buildProfile,buildType,"",conanfile);
        cmd.workDir = genDir;

        return this.exe.execAsync(cmd);
    }

    public installAsDeployment(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string,
        genDir : string) : Promise<void> {

        this.validateConanfile(conanfile);
        this.validateDir("genDir",genDir);
    
        const cmd = this.conanCmd.install(hostProfile,buildProfile,buildType,"deploy",conanfile);
        cmd.workDir = genDir;
    
        return this.exe.execAsync(cmd);    
    }

    public installPkgAsDeployment(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        name : string,
        version : string,
        deployDir : string
    ) : Promise<void> {
        
        this.validateDir("deployDir",deployDir);
    
        const cmd = this.conanCmd.installPkg(hostProfile,buildProfile,buildType,"deploy",name,version);
        cmd.workDir = deployDir;
    
        return this.exe.execAsync(cmd);    
    }

    public async importHeaders(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string,
        genDir : string
    ) {
        await this.installAsDeployment(
            buildProfile,
            hostProfile,
            buildType,
            conanfile,
            genDir);

        fse.mkdirpSync(path.join(genDir,"include"));

        const pkgs = fse.readdirSync(genDir, {withFileTypes:true})
                        .filter(e => e.isDirectory())
                        .filter(e => fse.readdirSync( path.join(genDir,e.name)).includes("include"))
                        .map( e => path.join(genDir,e.name));
        
        pkgs.forEach( pkg => {
            fse.readdirSync(path.join(pkg,"include"), {withFileTypes: true})
               .filter(element => element.name !== "CMakeLists.txt")
               .forEach(element => {
                fse.copySync(
                    path.join(pkg,"include",element.name),
                    path.join(genDir,"include",element.name)
                );
            });
        });
    }

    public build(
        conanfile : string,
        buildDir : string
    ) : Promise<void> {

        this.validateConanfile(conanfile);
        this.validateDir("buildDir",buildDir);

        const cmd = this.conanCmd.build(conanfile);
        cmd.workDir = buildDir;

        return this.exe.execAsync(cmd);
    }

    public createWithoutTest(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string) : Promise<void> {
    
        this.validateConanfile(conanfile);
        let cmd = this.conanCmd.createWithoutTest(
            hostProfile,
            buildProfile,
            buildType,
            conanfile 
        );

        cmd.workDir = process.cwd();

        return this.exe.execAsync(cmd);
    }

    public create(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string) : Promise<void> {

        this.validateConanfile(conanfile);
        let cmd = this.conanCmd.create(
            hostProfile,
            buildProfile,
            buildType,
            conanfile 
        );

        cmd.workDir = process.cwd();

        return this.exe.execAsync(cmd);
    }

    public async buildTest(
        hostProfile: string,
        buildProfile: string,
        buildType: string,
        conanfile : string,
        conanTestFile : string) : Promise<void> {

        let cmd = this.conanCmd.createWithoutTest(
            hostProfile,
            buildProfile,
            buildType,
            conanfile
        );
        
        await this.exe.execAsync(cmd);

        const name = this.inspectConanfileAttr(conanfile,"name");
        const version = this.inspectConanfileAttr(conanfile,"version");

        const testBuildFolder = path.join(path.dirname(conanTestFile),"build");
        fse.mkdirpSync(testBuildFolder);

        cmd = this.conanCmd.install(
            hostProfile,
            buildProfile,
            buildType,
            "",
            conanTestFile
        );
        cmd.workDir = testBuildFolder;

        await this.exe.execAsync(cmd);

        cmd = this.conanCmd.installPkg(hostProfile,buildProfile,buildType,"cmake_find_package_multi",name,version);
        cmd.workDir = path.join(testBuildFolder,"generators");
        await this.exe.execAsync(cmd);

        cmd = this.conanCmd.build(conanTestFile);
        cmd.workDir = testBuildFolder;
        return this.exe.execAsync(cmd);
    }

    public inspectConanfileAttr(
        conanfile : string,
        attribute : string
    ) : string {

        const cmd = this.conanCmd.inspectFile(conanfile,attribute);
        const result = this.exe.execSyncGetFormatStdout(cmd);

        let attributeText = `${attribute}: `;
        return result[0].substring(attributeText.length);
    }

    public inspectPkg(
        name : string,
        version : string
    ) : ConanPackage {
        const prefix = "conan-api-json";
        const tmpDir = fse.mkdtempSync(path.join(os.tmpdir(), prefix));
        const jsonFile = path.join(tmpDir,"inspect.json");

        fse.mkdirpSync(tmpDir);

        const cmd1 = this.conanCmd.inspectPkg(name, version, jsonFile);
        this.exe.execSyncGetFormatStdout(cmd1);

        const jsonContent = fse.readFileSync(jsonFile).toString();

        let jsonObj = JSON.parse(jsonContent) as ConanPackage;
        jsonObj = new ConanPackage(jsonObj);

        const cmd2 = this.conanCmd.outputGraph(name, version,path.join(tmpDir,"out.dot") );
        this.exe.execSyncGetFormatStdout(cmd2);

        let pkgs = fse.readFileSync(path.join(tmpDir,"out.dot")).toString()
                      .split("\n")
                      .filter(e => e.startsWith("        "))
                      .map(e => e.trim());

        pkgs.forEach(e => {
            e.split(" -> ").forEach(ee => jsonObj.deepRequires.add(ee.trim().replaceAll('"','')))
        });

        if (jsonObj.deepRequires.has("virtual"))
            jsonObj.deepRequires.delete("virtual");
        jsonObj.deepRequires.delete(`${name}/${version}`);

        fse.rmSync(tmpDir,{recursive:true});

        return jsonObj;
    }

    public inspectPkgAttr(
        name : string,
        version : string,
        attribute : string
    ) : string {

        const cmd = this.conanCmd.inspectPkg(name, version,attribute);
        const result = this.exe.execSyncGetFormatStdout(cmd);

        let attributeText = `${attribute}: `;
        return result[0].substring(attributeText.length);   
    }


    public async package(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string,
        pkgDir : string ) : Promise<void> {
        await this.createWithoutTest(
            buildProfile,
            hostProfile,
            buildType,
            conanfile);

        const name = this.inspectConanfileAttr(conanfile,"name");
        const version = this.inspectConanfileAttr(conanfile,"version");
        
        return this.installPkgAsDeployment(
            buildProfile,
            hostProfile,
            buildType,
            name,
            version,pkgDir).then( () => {
                fse.readdirSync(pkgDir,{withFileTypes:true})
                   .filter(e => e.name !== name)
                   .map(e => path.join(pkgDir,e.name))
                   .forEach(e => fse.rmSync(e, {recursive:true}));
                fse.readdirSync(path.join(pkgDir,name),{withFileTypes:true})
                   .forEach(e => fse.moveSync(
                        path.join(pkgDir,name,e.name),
                        path.join(pkgDir,e.name)
                   ));
                fse.rmSync(path.join(pkgDir,name),{recursive:true});
            });
    }

    public async deploy(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string,
        deployDir : string 
    ) : Promise<void> {
       
        await this.createWithoutTest(
            buildProfile,
            hostProfile,
            buildType,
            conanfile);

        const name = this.inspectConanfileAttr(conanfile,"name");
        const version = this.inspectConanfileAttr(conanfile,"version");
        
        await this.installPkgAsDeployment(
            buildProfile,
            hostProfile,
            buildType,
            name,
            version,deployDir);

        // remember : licenses
        const pkgSubDir = [
            "bin",
            "lib",
            "include",
            "res"
        ];

        const pkgs = fse.readdirSync(deployDir, {withFileTypes:true})
                                .filter(e => e.isDirectory())
                                .map(e => path.join(deployDir,e.name));

        fse.mkdirpSync(path.join(deployDir,"all"));

        pkgSubDir.forEach(e => {
                    fse.mkdirpSync(path.join(deployDir,"all",e));
                    pkgs.forEach( pkg => {
                        if (fse.existsSync(path.join(pkg,e))) {
                            const subDirs = fse.readdirSync(path.join(pkg,e),{withFileTypes:true})
                                               .map(subE => subE.name);
                            subDirs.forEach(subE => {
                                fse.copySync(
                                    path.join(pkg,e,subE),
                                    path.join(deployDir,"all",e,subE)
                                );
                            })
                        }
                    });
                });
        fse.readdirSync(path.join(deployDir,"all"),{withFileTypes:true})
           .forEach(e => {
                if (fse.readdirSync(path.join(deployDir,"all",e.name)).length === 0 ) {
                    fse.rmSync(path.join(deployDir,"all",e.name),{recursive:true});
                }
           })
    }
}