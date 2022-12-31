import { TextOutput } from "../output/text-output";
import { CMakeCommands } from "./cmake-commands";
import { Executor } from "./executor";

export class CMakeAPI {

    cmakeCmds : CMakeCommands;

    exe : Executor;

    out : TextOutput;

    constructor(out : TextOutput, exe : Executor) {
        this.cmakeCmds = new CMakeCommands();
        this.exe = exe;
        this.out = out;
    }

    public async configureAndBuildTarget(
        cmakefile : string,
        buildDir : string,
        buildType : string,
        target : string,
        toolchainfile : string
    ) : Promise<void> {
        let cmd = this.cmakeCmds.configure(cmakefile,toolchainfile,buildType,buildDir);
        cmd.workDir = buildDir;
        await this.exe.execAsync(cmd);
        
        cmd = this.cmakeCmds.buildTarget(buildDir, target);
        cmd.workDir = buildDir;
        return this.exe.execAsync(cmd);
    }
}