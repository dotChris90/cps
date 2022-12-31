import { Item } from "./item";
import { TextInput } from "./text-input";

export class FakeInput implements TextInput {
    
    editLists(question: string, items: Item[]): Promise<Item[]> {
        throw new Error("Method not implemented.");
    }

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