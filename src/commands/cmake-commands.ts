import { Command } from "./command";
import * as path from 'path';

export class CMakeCommands {

    cmd : Command;

    constructor() {
        this.cmd = new Command();
        this.cmd.cmd = "cmake";
    }

    protected cloneCmd() : Command {
        return JSON.parse(JSON.stringify(this.cmd)) as Command;
    }

    public configure(
        cmakefile : string,
        toolchainfile : string,
        buildType : string,
        buildFolder : string
    ) : Command {
        let cmd = this.cloneCmd();
        cmd.args = [
            `-DCMAKE_TOOLCHAIN_FILE=${toolchainfile}`,
            `-DCMAKE_BUILD_TYPE=${buildType}`,
            `-S=${path.dirname(cmakefile)}`,
            `-B=${buildFolder}`
        ];
        return cmd;
    }

    public buildTarget(
        buildFolder : string,
        target : string
    ) : Command {
        let cmd = this.cloneCmd();
        cmd.args = [
            `--build`,
            `${buildFolder}`,
            `--target`,
            `${target}`
        ];
        return cmd;
    }
}