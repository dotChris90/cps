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

    public inspectFile(
        conanfile : string,
        attribute : string
    )  : Command {
        const cmd = this.cloneCmd();
        cmd.args = [
            "inspect",
            conanfile,
            "-a", 
            attribute
        ];

        return cmd;
    }

    public outputGraph(
        name : string, 
        version : string,
        outfile : string
    ) : Command {

        const cmd = this.cloneCmd();
        cmd.args = [
            "info",
            `${name}/${version}@_/_`,
            "-n",
            "requires",
            "-g",
            outfile
        ];

        return cmd;
    }

    public infoPkg(
        name : string,
        version : string
    ) : Command {

        const cmd = this.cloneCmd();
        cmd.args = [
            "info",
            `${name}/${version}@_/_`,
            "-n",
            "requires"
        ];

        return cmd;
    }

    public inspectPkg(
        name : string,
        version : string,
        jsonOutFile : string
    ) : Command {
        const cmd = this.cloneCmd();
        cmd.args = [
            "inspect",
            `${name}/${version}@_/_`,
            "--json",
            jsonOutFile
        ];

        return cmd;
    }

    public inspectPkgAttr(
        name : string,
        version : string,
        attribute : string
    )  : Command {
        const cmd = this.cloneCmd();
        cmd.args = [
            "inspect",
            `${name}/${version}@_/_`,
            "-a", 
            attribute
        ];

        return cmd;
    }
    

    public createWithoutTest(
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
            "-tf=None",
            conanfile  
        ];
        return returnCmd;
    }

    public simpleInstall(
        conanfile: string
        ) : Command {
            const cmd = this.cloneCmd();
            cmd.args = ["install",conanfile];
            return cmd;
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

    public installPkg(
        hostProfile = "default",
        buildProfile = "default",
        buildType = "Release",
        generator = "",
        name : string,
        version : string
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
        returnCmd.args.push(`${name}/${version}@_/_`);
        return returnCmd;
    }

    public installV1(
        profile : string,
        buildType = "Release",
        generator = "",
        conanfile : string
    ) {
        const returnCmd = this.cloneCmd();
        returnCmd.args = [
            "install",
            `-pr=${profile}`,
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