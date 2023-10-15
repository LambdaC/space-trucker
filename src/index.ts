import { Engine } from '@babylonjs/core';
import { SpaceTruckerApplication } from './SpaceTruckerApplication';
import { SpaceTruckerLoadingScreen } from './scenes/SpaceTruckerLoadingScreen';
import logger from './logger';


const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
logger.logInfo("Created BJS engine");

engine.loadingScreen = new SpaceTruckerLoadingScreen(engine);
const app = new SpaceTruckerApplication(engine);

const launchButton = document.getElementById("btnLaunch") as HTMLButtonElement;
const btnClickHandler = () => {
    logger.logInfo("Launch button clicked. Initializing application.");
    const pageContainer = document.getElementById("pageContainer") as HTMLElement;
    canvas.classList.remove("background-canvas");
    pageContainer.style.display = "none";
    launchButton.removeEventListener('click', btnClickHandler);

    app.run();
}
launchButton.addEventListener('click', btnClickHandler);

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});
