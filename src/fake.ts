import { FakeInput } from "./input/fake-input";
import { FakeOutput } from "./output/fake-output";

export class Fake {
    public static getFakeInterfaces() : [FakeInput, FakeOutput] {
        return [new FakeInput(),new FakeOutput()];
    }
}