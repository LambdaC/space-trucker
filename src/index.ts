import { Engine } from '@babylonjs/core';
import logger from './logger';
import { SpaceTruckerLoadingScreen } from './SpaceTruckerLoadingScreen';

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element
const engine = new Engine(canvas, true); // Generate the BABYLON 3D engine
logger.logInfo("Created BJS engine");

engine.loadingScreen = new SpaceTruckerLoadingScreen(engine);


const launchButton = document.getElementById("btnLaunch") as HTMLButtonElement;
const btnClickHandler = () => {
    logger.logInfo("Launch button clicked. Initializing application.");
    const pageContainer = document.getElementById("pageContainer") as HTMLElement;
    canvas.classList.remove("background-canva");
    pageContainer.style.display = "none";
    launchButton.removeEventListener('click', btnClickHandler);

    engine.displayLoadingUI();
}
launchButton.addEventListener('click', btnClickHandler);

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});
