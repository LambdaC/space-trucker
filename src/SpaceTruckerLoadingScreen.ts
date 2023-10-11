import { ArcRotateCamera, Engine, ILoadingScreen, Scene } from "@babylonjs/core";
import { createStartScene } from "./startscene";
import { AdvancedDynamicTexture, Container, TextBlock } from "@babylonjs/gui";

export class SpaceTruckerLoadingScreen implements ILoadingScreen {
    private _engine: Engine;
    private _active: boolean = false;

    private _advancedTexture: AdvancedDynamicTexture;


    private _startScene: {
        scene: Scene;
        camera: ArcRotateCamera;
    };

    constructor(engine: Engine) {
        this._engine = engine;
        this._startScene = createStartScene(engine);
        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");

        const textBlock = new TextBlock("textBlock", "Loading Space-Truckers: The Video Game...");
        textBlock.fontSize = "62pt";
        textBlock.color = "antiquewhite";
        textBlock.verticalAlignment = Container.VERTICAL_ALIGNMENT_BOTTOM;

        this._advancedTexture.addControl(textBlock);


        engine.runRenderLoop(() => {
            if (this._startScene && this._active) {
                this._startScene.scene.render();
            }
        });
    }

    displayLoadingUI: () => void = () => {
        this._active = true;
    };

    hideLoadingUI: () => void = () => {
        this._active = false;
    };

    loadingUIBackgroundColor: string = "#FFFFFF";

    loadingUIText: string = "Custome Loading Screen";

}