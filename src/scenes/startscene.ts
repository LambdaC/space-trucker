import { ArcRotateCamera, AxesViewer, Color3, Engine, GlowLayer, IEnvironmentHelperOptions, MeshBuilder, PointLight, Scalar, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";
import distortTexture from "../assets/textures/distortion.png";
import { AstroFactory } from "../astroFactory";

/**
 * scene、camera
 * @param engine 
 * @returns 
 */
export function createStartScene(engine: Engine) {
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera('camera1', 0, Math.PI / 4, 350, Vector3.Zero(), scene);
    camera.attachControl(true);
    const axes = new AxesViewer(scene); // 第二个参数不能为true，不然会影响天空盒的大小

    setupEnvironment(scene);
    const star = createStar(scene);
    const planets = populatePlanetarySystem(scene);

    const glowLayer = new GlowLayer("glowLayer", scene);
    const spinAnim = AstroFactory.createSpinAnimation();
    star.animations.push(spinAnim);
    scene.beginAnimation(star, 0, 60, true);
    planets.forEach(p => {
        glowLayer.addExcludedMesh(p);
        p.animations.push(spinAnim);
        scene.beginAnimation(p, 0, 60, true, Scalar.RandomRange(0.1, 3));
    });

    return { scene, camera };
}

/**
 * environment(skybox、environment texture)、light
 * @param scene 
 * @returns 
 */
function setupEnvironment(scene: Scene) {
    const starfieldPT = new StarfieldProceduralTexture("starfieldPT", 512, scene);
    starfieldPT.coordinatesMode = Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE;
    starfieldPT.darkmatter = 1.5;
    starfieldPT.distfading = 0.75;
    // scene.createDefaultCameraOrLight(true, true, true);
    const envOptions: Partial<IEnvironmentHelperOptions> = {
        skyboxSize: 512,
        createGround: false,
        skyboxTexture: starfieldPT,
        // environmentTexture: starfieldPT
    };
    const env = scene.createDefaultEnvironment(envOptions);
    const light = new PointLight("starLight", Vector3.Zero(), scene);
    light.intensity = 2;
    light.diffuse = new Color3(.98, .9, 1);
    light.specular = new Color3(1, 0.9, 0.5);

    return env;
}

/**
 * mesh、material
 * @param scene 
 * @returns 
 */
function createStar(scene: Scene) {
    const starDiam = 16;
    const star = MeshBuilder.CreateSphere("star", { diameter: starDiam, segments: 128 }, scene);
    const mat = new StandardMaterial("starMat", scene);
    star.material = mat;
    mat.emissiveColor = new Color3(0.37, 0.333, 0.11);
    mat.diffuseTexture = new Texture(distortTexture, scene);
    mat.diffuseTexture.level = 1.8;
    return star
}

function populatePlanetarySystem(scene: Scene) {
    const planets = [];
    const hg = {
        name: "hg",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 14,
        scale: 2,
        color: new Color3(0.45, 0.33, 0.18),
        rocky: true
    };
    const aphro = {
        name: "aphro",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 35,
        scale: 3.5,
        color: new Color3(0.91, 0.89, 0.72),
        rocky: true
    };
    const tellus = {
        name: "tellus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 65,
        scale: 3.75,
        color: new Color3(0.17, 0.63, 0.05),
        rocky: true
    };
    const ares = {
        name: "ares",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 100,
        scale: 3,
        color: new Color3(0.55, 0, 0),
        rocky: true
    };
    const zeus = {
        name: "zeus",
        posRadians: Scalar.RandomRange(0, 2 * Math.PI),
        posRadius: 140,
        scale: 6,
        color: new Color3(0, 0.3, 1),
        rocky: false
    };
    planets.push(AstroFactory.createPlanet(hg, scene));
    planets.push(AstroFactory.createPlanet(aphro, scene));
    planets.push(AstroFactory.createPlanet(tellus, scene));
    planets.push(AstroFactory.createPlanet(ares, scene));
    planets.push(AstroFactory.createPlanet(zeus, scene));
    return planets;
}

