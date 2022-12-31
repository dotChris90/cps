import { Item } from "./item";

export interface TextInput {

    readInput(question : string, placeHolder : string) : Promise<string>;
    pickFromList(question : string, list : string[]) : Promise<string>;
    pickFromListMulti(question : string, list : string[]) : Promise<string[]>;
    clear() : void;
    editLists(question : string, items : Item[] ) : Promise<Item[]>;
}