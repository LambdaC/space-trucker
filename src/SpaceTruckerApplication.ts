import { Engine, Scene } from "@babylonjs/core";
import { AppStates } from "./appstates";
import { MainMenuScene } from "./MainMenuScene";

class AppStateMachine<T> {
    private _previousState: T | null = null;
    private _currentState: T;

    constructor(initValue: T) {
        this._currentState = initValue;
    }

    set state(value: T) {
        this._currentState = value;
    }

    get state(): T {
        return this._currentState;
    }

    get previousState(): T | null {
        return this._previousState;
    }

    set previousState(value: T) {
        this._previousState = value;
    }

    get isChanged(): boolean {
        return this._currentState !== this._previousState;
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
            await this._updateState();
            this._activeScene?.render();
        });

    }

    private async _updateState() {
        if (!this._stateMachine.isChanged) {
            return;
        }

        // 先保存一下当前的state,下面的方法可能会改变当前state。
        const state = this._stateMachine.state;

        switch (state) {
            case AppStates.CREATED:
                this._create();
                break;
            case AppStates.INITIALIZING:
                this._initialize();
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

        // 只能在最后改变上一个state是什么，因为上面的方法可能需要知道上一个state是什么。
        this._stateMachine.previousState = state;
    }

    private _create() {
        this._stateMachine.state = AppStates.INITIALIZING;
    }

    private async _initialize() {
        // 模拟加载资源
        this._engine.displayLoadingUI();
        const p = new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });

        await p;

        this._engine.hideLoadingUI();
        this._stateMachine.state = AppStates.CUTSCENE;
    }

    private _gotoCutScene() {
        this._stateMachine.state = AppStates.MENU;
    }

    private _gotoMainMenu() {
        this._engine.displayLoadingUI();
        this._mainMenu = new MainMenuScene(this._engine);
        this._activeScene = this._mainMenu.scene;
        this._engine.hideLoadingUI();
    }

}