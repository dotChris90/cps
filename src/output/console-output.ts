/* eslint-disable class-methods-use-this */
import { terminal } from "terminal-kit";
import { TextOutput } from "./text-output"

export class ConsoleOutput implements TextOutput{

    out(text: string): void {
        terminal(`${text}\n`);
    }

    err(text: string): void {
        terminal.red(`${text}\n`);
    }

    warn(text: string): void {
        terminal.yellow(`${text}\n`);
    }

    clear(): void {
        terminal.clear();   
    }
}