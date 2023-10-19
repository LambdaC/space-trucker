import { Engine } from "@babylonjs/core";
import { AppStates } from "./appstates";
import { IScreen } from "./scenes/IScreen";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { SplashScene } from "./scenes/SplashScene";
import logger from "./logger";
import { SpaceTruckerInputManager } from "./input/SpaceTruckerInputManager";

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

    private _stateMachine: AppStateMachine<AppStates>;
    private _currentScene?: IScreen;
    private _mainMenu!: MainMenuScene;
    private _splashScene!: SplashScene;
    private _inputManager!: SpaceTruckerInputManager;

    constructor(private _engine: Engine) {
        this._stateMachine = new AppStateMachine<AppStates>(AppStates.CREATED);
    }

    public run() {
        this._initialize();

        this._engine.runRenderLoop(() => {
            this._update();
            this._render();
        });

    }

    private _initialize() {
        this._stateMachine.state = AppStates.INITIALIZING;
        this._engine.displayLoadingUI();
        this._inputManager = new SpaceTruckerInputManager(this._engine);
        this._splashScene = new SplashScene(this._engine, this._inputManager);
        this._mainMenu = new MainMenuScene(this._engine, this._inputManager);

        this._splashScene.onReadyObservable.addOnce(() => {
            this._engine.hideLoadingUI();
            this._gotoCutScene();
        });

        this._mainMenu.onExitActionObservable.addOnce(() => this._exit());
        this._mainMenu.onPlayActionObservable.add(() => this._goToRunningState());
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
                this._splashScene.update();
                break;
            case AppStates.MENU:
                this._mainMenu.update();
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
        this._splashScene.actionProcessor?.attachControl();
        this._splashScene.run();
    }

    private _gotoMainMenu() {
        this._splashScene.actionProcessor?.detachControl();
        this._stateMachine.state = AppStates.MENU;
        // this._mainMenu.update();
        this._currentScene = this._mainMenu;
        this._mainMenu.actionProcessor?.attachControl();
    }

    private _goToRunningState() {
        this._mainMenu.actionProcessor?.detachControl();
        this._stateMachine.state = AppStates.RUNNING;
        this._currentScene = undefined;
    }

    private _exit() {
        this._stateMachine.state = AppStates.EXITING;
        this._currentScene = undefined;
        if (window) {
            this._engine.dispose();
            window.location?.reload();
        }
    }
}