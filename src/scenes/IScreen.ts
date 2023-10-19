import { Scene } from "@babylonjs/core";

export interface IScreen {
    [key: string]: any;
    get scene(): Scene;
    handleInput: () => void;
    update: () => void;


}