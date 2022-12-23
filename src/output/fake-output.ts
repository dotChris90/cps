import {TextOutput} from './text-output';

export class FakeOutput implements TextOutput {

    public bufferOut : Array<string> = [];

    public bufferErr : Array<string> = [];

    public bufferWarn : Array<string> = [];

    out(text: string): void {
        this.bufferOut.push(text);
    }

    err(text: string): void {
        this.bufferErr.push(text);
    }

    warn(text: string): void {
        this.bufferWarn.push(text);
    }

    clear(): void {
        this.bufferErr = [];
        this.bufferOut = [];
        this.bufferWarn = [];
    }
    
}