import { ArcRotateCamera, Engine, ILoadingScreen, Scene } from "@babylonjs/core";
import { createStartScene } from "./startscene";
import { AdvancedDynamicTexture } from "@babylonjs/gui";

export class SpaceTruckerLoadingScreen implements ILoadingScreen {
    private _loadingText: string;
    private _totalToLoad: number;
    private _currentAmountLoaded: number;
    private _engine: Engine;
    private _active: boolean = false;

    private _advancedTexture: AdvancedDynamicTexture;


    private _startScene: {
        scene: Scene;
        camera: ArcRotateCamera;
    };

    constructor(engine: Engine) {
        this._totalToLoad = 0.00;
        this._loadingText = "Loading Space-Truckers: The Video Game...";
        this._currentAmountLoaded = 0.00;
        this._engine = engine;
        this._startScene = createStartScene(engine);

        this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("myUI");

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