import { ArcRotateCamera, CreateCylinder, Engine, HemisphericLight, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures/starfield/starfieldProceduralTexture";

export class MainMenuScene {

    private _engine: Engine;
    private _scene!: Scene;

    constructor(engine: Engine) {
        this._engine = engine;
        this._scene = new Scene(engine);
        this._setupBackgroundEnviroment();

    }

    private _setupBackgroundEnviroment() {
        const camera = new ArcRotateCamera("menuCam", 0, 0, -30, Vector3.Zero(), this._scene, true);
        const light = new HemisphericLight("light", new Vector3(0, 0.5, 0), this._scene);
        const starfieldPT = new StarfieldProceduralTexture("starfieldPT", 512, this._scene);
        const starfieldMat = new StandardMaterial("starfield", this._scene);
        const space = CreateCylinder("space", { height: 100, diameterTop: 0, diameterBottom: 60 }, this._scene);
        starfieldMat.diffuseTexture = starfieldPT;
        starfieldMat.diffuseTexture.coordinatesMode = Texture.SKYBOX_MODE;
        starfieldMat.backFaceCulling = false;
        starfieldPT.beta = 0.1;
        space.material = starfieldMat;
        this._scene.registerBeforeRender(() => starfieldPT.time += this._scene.getEngine().getDeltaTime() / 1000);
    }

    get scene(): Scene {
        return this._scene;
    }
}