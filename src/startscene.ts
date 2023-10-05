import { ArcRotateCamera, AxesViewer, Color3, Engine, Mesh, MeshBuilder, PointLight, Scalar, Scene, StandardMaterial, Texture, Vector3, Animation, TrailMesh, GlowLayer, Nullable, IEnvironmentHelperOptions } from "@babylonjs/core";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures";
import distortTexture from "../assets/textures/distortion.png";
import rockTextureN from "../assets/textures/rockn.png";
import rockTexture from "../assets/textures/rock.png";

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
    const spinAnim = createSpinAnimation();
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
    planets.push(createPlanet(hg, scene));
    planets.push(createPlanet(aphro, scene));
    planets.push(createPlanet(tellus, scene));
    planets.push(createPlanet(ares, scene));
    planets.push(createPlanet(zeus, scene));
    return planets;
}

function createPlanet(opts: {
    name: string;
    posRadians: number;
    posRadius: number;
    scale: number;
    color: Color3;
    rocky: boolean;
}, scene: Scene): Mesh {
    const planet = MeshBuilder.CreateSphere(opts.name, { diameter: 1 }, scene);
    const mat = new StandardMaterial(planet.name + "-mat", scene);
    mat.diffuseColor = mat.specularColor = opts.color;
    mat.specularPower = 0;
    if (opts.rocky === true) {
        mat.bumpTexture = new Texture(rockTextureN, scene);
        mat.diffuseTexture = new Texture(rockTexture, scene);
    } else {
        mat.diffuseTexture = new Texture(distortTexture, scene);
    }

    planet.material = mat;
    planet.scaling.setAll(opts.scale);
    planet.position.x = opts.posRadius * Math.sin(opts.posRadians);
    planet.position.z = opts.posRadius * Math.cos(opts.posRadians);

    (planet as any).orbitOptions = opts;
    (planet as any).orbitAnimationObserver = createAndStartOrbitAnimation(planet, scene);
    return planet;
}

function createAndStartOrbitAnimation(planet: Mesh, scene: Scene) {
    const Gm = 6672.59 * 0.07;
    const opts = (planet as any).orbitOptions;
    const rCubed = Math.pow(opts.posRadius, 3);
    const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
    const v = Math.sqrt(Gm / opts.posRadius);
    const w = v / period;
    const circum = Scalar.TwoPi * opts.posRadius;
    let angPos = opts.posRadians;

    planet.computeWorldMatrix(true);
    let planetTrail = new TrailMesh(planet.name + "-trail", planet, scene, .1, circum, true);
    let trailMat = new StandardMaterial(planetTrail.name + "-mat", scene);
    trailMat.emissiveColor = trailMat.specularColor = trailMat.diffuseColor = opts.color;
    planetTrail.material = trailMat;

    let preRenderObsv = scene.onBeforeRenderObservable.add(sc => {
        planet.position.x = opts.posRadius * Math.sin(angPos);
        planet.position.z = opts.posRadius * Math.cos(angPos);
        angPos = Scalar.Repeat(angPos + w, Scalar.TwoPi);
    });
    return preRenderObsv;
}

function createSpinAnimation() {
    let orbitAnim = new Animation("planetspin",
        "rotation.y", 30,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE);
    const keyFrames = [];
    keyFrames.push({
        frame: 0,
        value: 0
    });
    keyFrames.push({
        frame: 60,
        value: Scalar.TwoPi
    });
    orbitAnim.setKeys(keyFrames);
    return orbitAnim
}