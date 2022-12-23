/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable unicorn/no-object-as-default-parameter */

import * as child_process from 'child_process';
import { Command } from './command';
import { TextOutput } from '../output/text-output';

export class Executor {

  private output: TextOutput;

  constructor(output: TextOutput) {
    this.output = output;
  }
  
  public execSyncGetFormatStdout(
    cmd : Command
    ) : string[]{
        const CWD = cmd.workDir === "" ? process.cwd() : cmd.workDir;
        let options : any =  {};
        options['cwd'] = CWD;
        let out = "";
        out =child_process.spawnSync(cmd.cmd, cmd.args, options).stdout.toString();
        const bufferSplitted = out.split("\n").filter(text => text !== '');
        return bufferSplitted;
  }

  public execAsyncGetFormatStdout(
    cmd : Command
    ) : Promise<string[]> {
        this.output.clear();
        const CWD = cmd.workDir === "" ? process.cwd() : cmd.workDir;
        let options : any = {};
        options['cwd'] = CWD;
        let out = "";
        out = child_process.spawnSync(cmd.cmd, cmd.args, options).stdout.toString();
        const bufferSplitted = out.split("\n").filter(text => text !== '');
        const bufferPromise: Promise<string[]> = new Promise((resolve) => resolve(bufferSplitted));
        return bufferPromise;
  }

  
  public execAsync(
    cmd : Command
    ) : Promise<any> {
    const workingDir = cmd.workDir === "" ? process.cwd() : cmd.workDir;
    let options : any = {};
    return new Promise((resolve, reject) => {
      options['cwd'] = workingDir;
      options['shell'] = true;
      const commandProc = child_process.spawn(cmd.cmd, cmd.args, options);
      commandProc.stdout.on("data", (data) => {
        this.output.out(data.toString());
      });
      commandProc.stderr.on("data", (data) => {
        const msg = data.toString() as string;
        if(msg.includes("WARN"))
          this.output.warn(msg);
        else
          this.output.err(msg);
      });
      commandProc.on('exit', function (code) {
        // *** Process completed
        resolve(code);
      });
      commandProc.on('error', function (err) {
        // *** Process creation failed
        reject(err);
      });
    });
  }

  public execSync(
    cmd : Command
    ) : void {
      const workingDir = cmd.workDir === "" ? process.cwd() : cmd.workDir;
      let options : any = {};
      options['cwd'] = workingDir;
      options['shell'] = "true";

      const out = child_process.spawnSync(cmd.cmd, cmd.args, options);

      this.output.out(out.stdout);
      this.output.err(out.stderr);
    }

  // required since some classes like cppcheck need the output for error check
  public execSyncGetBuffer(
    cmd : Command
    ) : child_process.SpawnSyncReturns<Buffer> {
      this.output.out("");
      return child_process.spawnSync(cmd.cmd, cmd.args);
  }

    // required since some classes like cppcheck need the output for error check
  public execAsyncGetBuffer(
      cmd : Command
      ) : child_process.ChildProcessWithoutNullStreams {
        this.output.out("");
        return child_process.spawn(cmd.cmd, cmd.args);
    }
}