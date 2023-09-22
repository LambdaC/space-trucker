import { ArcRotateCamera, AxesViewer, Camera, Color3, Engine, MeshBuilder, PointLight, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";

export function createStartScene(engine: Engine) {
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera1', 0, Math.PI / 4, 350, Vector3.Zero(), scene);
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
    const env = scene.createDefaultEnvironment(envOptions);
    return env;
}

function createStar(scene: Scene) {
    const starDiam = 16;
    const star = MeshBuilder.CreateSphere("star", { diameter: starDiam, segments: 128 }, scene);
    const mat = new StandardMaterial("starMat", scene);
    star.material = mat;
    mat.emissiveColor = new Color3(0.37, 0.333, 0.11);
    // mat.diffuseTexture = new Texture("textures/distortion.png", scene);
    // mat.diffuseTexture.level = 1.8;
    return star
}

function populatePlanetarySystem(scene: Scene) {

}