import { Engine, Scene } from "@babylonjs/core";
import { AppStates } from "./appstates";
import { MainMenuScene } from "./MainMenuScene";

class AppStateMachine<T> {
    private _previousState: T;
    private _currentState: T;

    constructor(initValue: T) {
        this._currentState = initValue;
        this._previousState = initValue;
    }

    set state(value: T) {
        this._previousState = this._currentState;
        this._currentState = value;
    }

    get state(): T {
        return this._currentState as T;
    }

    get previousState(): T {
        return this._previousState as T;
    }
}

export class SpaceTruckerApplication {

    private _engine: Engine;
    private _stateMachine: AppStateMachine<AppStates>;
    private _activeScene: Scene | null = null;
    private _mainMenu: MainMenuScene | null = null;

    constructor(engine: Engine) {
        this._engine = engine;
        this._stateMachine = new AppStateMachine<AppStates>(AppStates.CREATED);
    }

    public async run() {
        this._engine.runRenderLoop(async () => {
            switch (this._stateMachine.state) {
                case AppStates.CREATED:
                    this._create();
                    break;
                case AppStates.INITIALIZING:
                    await this._initialize();
                    break;
                case AppStates.CUTSCENE:
                    this._gotoCutScene();
                    break;
                case AppStates.MENU:
                    this._gotoMainMenu();
                    break;
                case AppStates.RUNNING:
                    break;
                case AppStates.EXITING:
                    break;
            }

            this._activeScene?.render();
        });

    }

    private _create() {
        this._stateMachine.state = AppStates.INITIALIZING;
    }

    private async _initialize() {
        if (this._stateMachine.previousState === AppStates.INITIALIZING) {
            return;
        }

        // 模拟加载资源
        this._engine.displayLoadingUI();
        const p = new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 5000);
        });

        await p;

        this._engine.hideLoadingUI();
        this._stateMachine.state = AppStates.CUTSCENE;
    }

    private _gotoCutScene() {
        this._stateMachine.state = AppStates.MENU;
    }

    private _gotoMainMenu() {
        if (this._stateMachine.previousState === AppStates.MENU) {
            return;
        }
        this._stateMachine.state = AppStates.MENU;

        this._engine.displayLoadingUI();
        this._mainMenu = new MainMenuScene(this._engine);
        this._activeScene = this._mainMenu.scene;
        this._engine.hideLoadingUI();
    }

}