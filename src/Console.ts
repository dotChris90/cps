import { ConsoleInput } from "./input/console-input";
import { ConsoleOutput } from "./output/console-output";

export class Console {

    public static getConsoleInterfaces() : [ConsoleInput, ConsoleOutput] {
        return [new ConsoleInput(),new ConsoleOutput()];
    }
}