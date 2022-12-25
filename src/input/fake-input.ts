import { TextInput } from "./text-input";

export class FakeInput implements TextInput {

    async readInput(question: string, placeHolder: string): Promise<string> {
        return placeHolder;
    }
    async pickFromList(question: string, list: string[]): Promise<string> {
        return list[0];
    }
    async pickFromListMulti(question: string, list: string[]): Promise<string[]> {
        return list;
    }

    clear() : void{
        
    }
}