import { Scene } from "@babylonjs/core";

export interface IScene {
    get scene(): Scene;
    handleInput: () => void;
    update: () => void;
}