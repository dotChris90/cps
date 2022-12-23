import { Command } from "./command";

export class ConanCommands {
    
    cmd : Command;

    constructor() {
        this.cmd = new Command();
        this.cmd.cmd = "conan";
    }

    protected cloneCmd() : Command {
        return JSON.parse(JSON.stringify(this.cmd)) as Command;
    }

    public listProfiles() : Command{
        const returnCmd = this.cloneCmd();
        returnCmd.args = ["profile","list"];
        return returnCmd; 
    }

    public create(
        hostProfile = "default",
        buildProfile = "default",
        buildType = "Release",
        conanfile : string
    ) : Command {
        const returnCmd = this.cloneCmd();
        returnCmd.args = [
            "create",
            `-pr:h=${hostProfile}`,
            `-pr:b=${buildProfile}`,
            conanfile  
        ];
        return returnCmd;
    }

    public install(
        hostProfile = "default",
        buildProfile = "default",
        buildType = "Release",
        generator = "",
        conanfile : string
    ) : Command {
        const returnCmd = this.cloneCmd();
        returnCmd.args = [
            "install",
            `-pr:h=${hostProfile}`,
            `-pr:b=${buildProfile}`,
            `-s build_type=${buildType}`,
            '--build=missing'
        ];
        if (generator === "") {

        }
        else {
            returnCmd.args.push("--generator");
            returnCmd.args.push(generator);
        }
        returnCmd.args.push(conanfile);
        return returnCmd;
    }

    public build(
        conanfile : string
    ) : Command {
        const returnCmd = this.cloneCmd();
        returnCmd.args = [
            "build",
            conanfile
        ];
        returnCmd.workDir = "build";
        return returnCmd;
    }

}