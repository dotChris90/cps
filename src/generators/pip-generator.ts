import * as fse from 'fs-extra';
import * as path from 'path';
import { ConfigManager } from "../config/config-manager";

export class PipGenerator {

    configManager : ConfigManager;

    constructor(config : ConfigManager) {
        this.configManager = config;
    }

    public generateRequriements(
        dstFolder : string
    ) {
        let pipContent : string[] = [];
        this.configManager.config.pip.tools.forEach(e => {
            pipContent.push(`${e.name}>=${e.version}`);
        });
        if (pipContent.length > 0) {
            fse.writeFileSync(
                path.join(dstFolder,"requirements.txt"),
                pipContent.join("\n")
            );
        }
        else {
            fse.writeFileSync(
                path.join(dstFolder,"requirements.txt"),
                ""
            );
        }
    }
}