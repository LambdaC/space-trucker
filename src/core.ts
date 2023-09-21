import "babylonjs";

export function createStartScene(engine: BABYLON.Engine): { scene: BABYLON.Scene, camera: BABYLON.Camera } {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera('camera1', 0, Math.PI / 4, 100, BABYLON.Vector3.Zero(), scene);
    const axes = new BABYLON.Debug.AxesViewer(scene, 10);
    setupEnvironment(scene);
    createStar(scene);
    populatePlanetarySystem(scene);
    camera.attachControl(true);
    return { scene, camera };
}

function setupEnvironment(scene: BABYLON.Scene) {

}

function createStar(scene: BABYLON.Scene) {

}

function populatePlanetarySystem(scene: BABYLON.Scene) {

}