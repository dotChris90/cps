import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Executor } from './executor';
import { Command } from './command';



export class ConanExtAPI {

    exe : Executor;

    public constructor(exe : Executor) {
        this.exe = exe;
    }

    public async getTargetsOfConanPkgs(
        pkgs : string[]
    ) : Promise<string[]> {
        const targets  : string[] = [];

        let conanfileContent = "[generators]\nCMakeToolchain\nCMakeDeps\n[requires]\n";
        pkgs.forEach(e => conanfileContent = `${conanfileContent}${e}\n`);
        const prefix = "conan-ext";
        const tmpDir = fse.mkdtempSync(
            path.join(os.tmpdir(), prefix)
        );
        fse.mkdirpSync(tmpDir);
        const conanfile = path.join(tmpDir,"conanfile.txt");
        const conanBuildDir = path.join(tmpDir,"build");
        fse.mkdirpSync(conanBuildDir);

        fse.writeFileSync(conanfile,conanfileContent,{});

        const cmd = new Command();
        cmd.cmd = "conan";
        cmd.args = ["install",conanfile,"--build=missing"];
        cmd.workDir = conanBuildDir; 

        await this.exe.execAsync(cmd);

        const targetFiles = fse.readdirSync(conanBuildDir,{withFileTypes:true})
                               .filter(e => e.isFile)
                               .filter(e => e.name.endsWith("Targets.cmake"));

        const cmakefileContent = targetFiles.map(e => e.name.replace("Targets.cmake",""))
                                            .map(e => `find_package(${e} REQUIRED)`)
                                            .join("\n");
        const cmakefile = path.join(tmpDir,"CMakeLists.txt");

        fse.writeFileSync(cmakefile,cmakefileContent);

        cmd.cmd = "cmake";
        cmd.args = [`-DCMAKE_TOOLCHAIN_FILE=${path.join(conanBuildDir,"conan_toolchain.cmake")}`,
                    `-DCMAKE_BUILD_TYPE=Release`,
                    `-S=${tmpDir}`,
                    `-B=${conanBuildDir}`];
        
        const cmakeResult = this.exe.execSyncGetFormatStdout(cmd);
        const detectedTargets = cmakeResult.filter(e => e.includes("-- Conan: Target declared ") || e.includes("-- Conan: Component target declared"))
                                           .map(e => e.replace("-- Conan: Target declared '",""))
                                           .map(e => e.replace("-- Conan: Component target declared '",""))
                                           .map(e => e.replace("'",""))
        detectedTargets.forEach(e => targets.push(e));
        fse.rmSync(tmpDir,{recursive:true});
        return targets;
    }
}