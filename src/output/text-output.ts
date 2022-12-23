export interface TextOutput {
    out(text: string): void;
    err(text: string): void;
    warn(text : string) : void;
    clear() : void;
}