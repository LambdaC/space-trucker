import { createStartScene } from '@/core';
import { Engine } from '@babylonjs/core';

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
// const engine = new WebGPUEngine(canvas); // Generate the BABYLON 3D engine
const createScene = function () {
    const startScene = createStartScene(engine);
    return startScene.scene;
    // const scene = new Scene(engine);
    // scene.createDefaultCameraOrLight(true, true, true);
    // scene.createDefaultEnvironment({
    //     createGround: false,
    //     skyboxSize: 512,
    // });
    // MeshBuilder.CreateBox("box", { size: 5 }, scene);
    // return scene;
};
const scene = createScene(); //Call the createScene function
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});
