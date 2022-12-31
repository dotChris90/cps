/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable class-methods-use-this */
import {Terminal, terminal } from "terminal-kit";
import { Item } from "./item";
import { TextInput } from "./text-input"

function show(e : Item) : string {
    return (e.isSelected)? `[x] ${e.text}` : `[ ] ${e.text}`; 
}

export class ConsoleInput implements TextInput {

    async editLists(question: string, items: Item[]): Promise<Item[]> {
        
        // clone it and do not manipulate outside
        let list = JSON.parse(JSON.stringify(items)) as Array<Item>;
        let stillSelecting = true;
        while(stillSelecting) {
            terminal.clear();
            terminal.green(question);
            let selectionMenu = list.map(e  => show(e)).concat(["Finish...."]);
            let options = {continueOnSubmit : false};
            let selection = await terminal.singleColumnMenu(selectionMenu,options).promise;
            stillSelecting = (selection.selectedText !== "Finish....");
            if (stillSelecting) {
                list[selection.selectedIndex].isSelected = !list[selection.selectedIndex].isSelected;
            }
        }
        terminal.clear();
        return list;
    }

    clear() : void {
        terminal.clear();   
    }

    readInput(question: string, placeHolder: string): Promise<string> {
        terminal.green(question);
        return new Promise<string>((resolve) => {
            terminal.inputField({default : placeHolder},( error , input ) => {
                terminal.nextLine(1);
                resolve(input)
            });
        });
    }
    
    pickFromList(question: string, list: string[]): Promise<string> {
        terminal.clear();
        terminal.green(question);

        return new Promise<string>((resolve) => {
            terminal.singleColumnMenu(list,(error,response) => resolve(response.selectedText));
        });
    }

    pickFromListMulti(question: string, list: string[]): Promise<string[]> {
        terminal.clear();
        terminal.green(question);

        list.push("Finish");

        return new Promise<string[]>((resolve) => {
            let stillSelecting = true;
            const results = new Array<string>();
            while(stillSelecting) {
                terminal.singleColumnMenu(list,(error,response) => {
                    stillSelecting = !(response.selectedText === "Finish");
                    if (stillSelecting) {
                        results.push(response.selectedText);
                    }
                });
            }
            resolve(results);
        });
    }
    
}