import { Engine } from "@babylonjs/core";
import { AppStates } from "./appstates";
import { IScene } from "./scenes/IScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { SplashScene } from "./scenes/SplashScene";
import logger from "./logger";

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
    private _currentScene?: IScene;
    private _mainMenu!: MainMenuScene;
    private _splashScene!: SplashScene;


    constructor(engine: Engine) {
        this._engine = engine;
        this._stateMachine = new AppStateMachine<AppStates>(AppStates.CREATED);
    }

    public run() {
        this._initialize();

        this._engine.runRenderLoop(() => {
            this._handleInput();
            this._update();
            this._render();
        });

    }

    private _initialize() {
        this._stateMachine.state = AppStates.INITIALIZING;
        this._engine.displayLoadingUI();
        this._splashScene = new SplashScene(this._engine);
        this._mainMenu = new MainMenuScene(this._engine);

        this._splashScene.onReadyObservable.addOnce(() => {
            this._engine.hideLoadingUI();
            this._gotoCutScene();
        });
    }

    private _handleInput() {

    }

    private _update() {
        // 先保存一下当前的state,下面的方法可能会改变当前state。
        const state = this._stateMachine.state;

        switch (state) {
            case AppStates.CREATED:
            case AppStates.INITIALIZING:
                break;
            case AppStates.CUTSCENE:
                if (this._splashScene.skipRequested) {
                    this._gotoMainMenu();
                    logger.logInfo("in application onRender - skipping splash screen message");
                }
                break;
            case AppStates.MENU:
                break;
            case AppStates.RUNNING:
                break;
            case AppStates.EXITING:
                break;
        }

        // 只能在最后改变上一个state是什么，因为上面的方法可能需要知道上一个state是什么。
        this._stateMachine.previousState = state;
    }

    private _render() {
        this._currentScene?.scene.render();
    }

    private _gotoCutScene() {
        this._stateMachine.state = AppStates.CUTSCENE;
        this._currentScene = this._splashScene;
        this._splashScene.run();
    }

    private _gotoMainMenu() {
        this._stateMachine.state = AppStates.MENU;
        // this._mainMenu.update();
        this._currentScene = this._mainMenu;
    }
}