import { Tool } from "./tool";

export class Pip {
    
    tools : Tool[];
    
    public constructor(init?: Partial<Pip>) {
        Object.assign(this, init);
        for(let idx = 0; idx < this.tools.length;idx++) {
            this.tools[idx] = new Tool(this.tools[idx]);
        }
    }
}