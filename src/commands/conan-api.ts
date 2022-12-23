import * as path from 'path';
import * as utilExt from '@dotchris90/utils-extensions';
import * as fse from 'fs-extra';
import { TextOutput } from "../output/text-output";
import { ConanCommands } from "./conan-commands";
import { InvalidPathError } from '../error/invalide-path-error';
import { Executor } from "./executor";
import { Command } from './command';

export class ConanAPI {

    conanCmd : ConanCommands;

    output : TextOutput;

    exe : Executor;

    constructor(out : TextOutput, exe : Executor) {
        this.conanCmd = new ConanCommands();
        this.output = out;
        this.exe = exe;
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

    public inspectConanfile(
        conanfile : string,
        attribute : string
    ) : string {

        const cmd = this.conanCmd.inspectFile(conanfile,attribute);
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
        await this.create(
            buildProfile,
            hostProfile,
            buildType,
            conanfile);

        const name = this.inspectConanfile(conanfile,"name");
        const version = this.inspectConanfile(conanfile,"version");
        
        return this.installPkgAsDeployment(
            buildProfile,
            hostProfile,
            buildType,
            name,
            version,pkgDir);
    }

    public async deploy(
        buildProfile: string,
        hostProfile: string,
        buildType: string,
        conanfile : string,
        deployDir : string 
    ) : Promise<void> {
        await this.package( 
            buildProfile,
            hostProfile,
            buildType,
            conanfile,
            deployDir);
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
    }
}