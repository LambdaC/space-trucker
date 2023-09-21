import { ArcRotateCamera, AxesViewer, Camera, Color3, Engine, PointLight, Scene, Texture, Vector3 } from "@babylonjs/core";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";

export function createStartScene(engine: Engine): { scene: Scene, camera: Camera } {
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera1', 0, Math.PI / 4, 100, Vector3.Zero(), scene);
    const axes = new AxesViewer(scene, 10);
    setupEnvironment(scene);
    createStar(scene);
    populatePlanetarySystem(scene);
    camera.attachControl(true);
    return { scene, camera };
}

function setupEnvironment(scene: Scene) {
    const starfieldPT = new StarfieldProceduralTexture("starfieldPT", 512, scene);
    starfieldPT.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
    starfieldPT.darkmatter = 1.5;
    starfieldPT.distfading = 0.75;
    const envOptions = {
        skyboxSize: 512,
        createGround: false,
        skyboxTexture: starfieldPT,
        environmentTexture: starfieldPT
    };
    const light = new PointLight("starLight", Vector3.Zero(), scene);
    light.intensity = 2;
    light.diffuse = new Color3(.98, .9, 1);
    light.specular = new Color3(1, 0.9, 0.5);
    let env = scene.createDefaultEnvironment(envOptions);
}

function createStar(scene: Scene) {

}

function populatePlanetarySystem(scene: Scene) {

}