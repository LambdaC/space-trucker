import { Scene } from "@babylonjs/core";

export interface IScreen {
    [key: string]: any;
    get scene(): Scene;
    update: () => void;
}