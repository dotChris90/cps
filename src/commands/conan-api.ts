import * as path from 'path';
import * as utilExt from '@dotchris90/utils-extensions';
import * as fse from 'fs-extra';
import { TextOutput } from "../output/text-output";
import { ConanCommands } from "./conan-commands";
import { InvalidPathError } from '../error/invalide-path-error';
import { Executor } from "./executor";

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

    public async deployHeaders(
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
}