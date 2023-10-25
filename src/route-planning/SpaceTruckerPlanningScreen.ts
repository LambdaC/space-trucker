import { SpaceTruckerInputManager } from "@/input/SpaceTruckerInputManager";
import { ArcRotateCamera, Color3, Color4, CubeTexture, Engine, Observable, PointLight, Scene, Texture, Vector3 } from "@babylonjs/core";
import { CargoUnit } from "./CargoUnit";
import { Star } from "./Star";
import { SpaceTruckerInputProcessor } from "@/input/SpaceTruckerInputProcessor";
import { Planet } from "./Planet";
import { AsteroidBelt } from "./AsteroidBelt";
import { gameData } from "./GameData";
import { IScreen } from "@/scenes/IScreen";

const preFlightActionList = [
    { action: 'ACTIVATE', shouldBounce: () => true },
    { action: 'MOVE_OUT', shouldBounce: () => false },
    { action: 'MOVE_IN', shouldBounce: () => false },
    { action: 'GO_BACK', shouldBounce: () => true },
    { action: 'MOVE_LEFT', shouldBounce: () => false },
    { action: 'MOVE_RIGHT', shouldBounce: () => false },
    { action: 'PAUSE', shouldBounce: () => true }
];

const enum PLANNING_STATE {
    Created = 0,
    Initialized = 1,
    ReadyToLaunch = 2,
    InFlight = 3,
    CargoArrived = 4,
    RouteAccepted = 5,
    GeneratingCourse = 6,
    CargoDestroyed = 7,
    Paused = 8
}

export class SpaceTruckerPlanningScreen implements IScreen {

    private _scene: Scene;
    private _launchForce = 150.0;
    private _launchForceIncrement = 1.0;
    private _launchForceMax = 500;
    private _planets: Planet[] = [];
    private _origin: Planet;
    private _destination;
    private _cargo: CargoUnit;
    private _star: Star;
    private _launchArrow;
    private _destinationMesh;
    private _asteroidBelt;
    private _soundManager;
    private _actionProcessor: SpaceTruckerInputProcessor;
    private _onStateChangeObservable = new Observable<{ priorState: PLANNING_STATE, currentState: PLANNING_STATE }>();

    private _previousState = PLANNING_STATE.Created;
    private _state = PLANNING_STATE.Created;

    get scene() { return this._scene }

    get gameState() {
        return this._state;
    }

    set gameState(value) {
        if (this._state != value) {
            this._previousState = this._state;
            this._state = value;
            this._onStateChangeObservable.notifyObservers({ priorState: this._previousState, currentState: value });
        }
    }

    constructor(engine: Engine, private _inputManager: SpaceTruckerInputManager, private _config: any) {
        this._onStateChangeObservable.add(s => console.log(`${s.currentState} is new state. Prev was ${s.priorState}`));
        engine.loadingUIText = 'Loading Route Planning Simulation...';

        this._scene = new Scene(engine);

        // this.soundManager = new SpaceTruckerSoundManager(this.scene, overworldMusic);

        this.scene.clearColor = new Color4(0.1, 0.1, 0.1, 1.0);

        this._star = new Star(this.scene, _config.starData);

        const planetData = _config.planetaryInfo;
        planetData.forEach((planData: any) => {
            let planet = new Planet(this.scene, planData);
            this._planets.push(planet);
        });

        this._asteroidBelt = new AsteroidBelt(this.scene, _config.asteroidBeltOptions);

        //let skyTexture = CubeTexture.CreateFromImages(skyBoxfiles, this.scene);
        const skyTexture = new CubeTexture(_config.environment.environmentTexture, this.scene);
        skyTexture.coordinatesMode = Texture.SKYBOX_MODE;
        // this.scene.reflectionTexture = skyTexture;
        const skybox = this.scene.createDefaultSkybox(skyTexture, false, 20000);

        const camera = new ArcRotateCamera("cam", 0, 1.35, 3000, Vector3.Zero(), this.scene);
        camera.maxZ = 100000;
        camera.position.y += 10000;

        const light = new PointLight("starLight", new Vector3(), this.scene);
        light.intensity = 10000000;

        this._origin = this._planets.filter(p => p.name ===
            _config.startingPlanet)[0];

        this._destination = this._planets.filter(p =>
            p.name === this._config.endingPlanet)[0];

        this._cargo = new CargoUnit(this.scene,
            this._origin, {
            ...gameData,
            destination: this._destination,
            cargoMass: _config.cargoMass,
        });
        const arrowLines = [
            new Vector3(-1, 0, 0),
            new Vector3(-1, 0, -3),
            new Vector3(-2, 0, -3),
            new Vector3(0, 0, -5),
            new Vector3(2, 0, -3),
            new Vector3(1, 0, -3),
            new Vector3(1, 0, 0)

        ];
        this._launchArrow = MeshBuilder.CreateDashedLines("launchArrow", { points: arrowLines });
        this._launchArrow.scaling.scaleInPlace(10);
        this._launchArrow.rotation = new Vector3(0, Math.PI, 0);
        this._launchArrow.bakeCurrentTransformIntoVertices();

        this._destinationMesh = MeshBuilder.CreateIcoSphere("destination", {
            radius: this.destination.diameter * 1.5,
            subdivisions: 6,
            flat: false
        }, this.scene);
        this.destinationMesh.visibility = 0.38;
        this.destinationMesh.parent = this.destination.mesh;
        this.destinationMesh.actionManager = new ActionManager(this.scene);
        this.destinationMesh.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this.cargo.mesh
                },
                (ev) => {
                    console.log('mesh intersection triggered!', ev);
                    this.cargoArrived();
                }
            ));


        this.scene.onReadyObservable.add(() => {
            this.ui = new PlanningScreenGui(this);
            this.ui.bindToScreen();
        });
        ammoReadyPromise.then(res => {
            console.log("ammo ready");
            // this.initializePhysics();
        });
        this._actionProcessor = new SpaceTruckerInputProcessor(this, inputManager, preFlightActionList);
        this.gameState = PLANNING_STATE.Initialized;
        camera.useFramingBehavior = true;
        camera.attachControl(true);
    }

    update() {

    }
}