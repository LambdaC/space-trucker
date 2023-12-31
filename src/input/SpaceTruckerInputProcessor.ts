import { IScreen } from "@/scenes/IScreen";
import { Nullable, Observable, Observer, Scene, setAndStartTimer } from "@babylonjs/core";
import { SpaceTruckerInputManager } from "./SpaceTruckerInputManager";
import { InputAction } from "./InputAction";
import logger from "@/logger";

function bounce(funcToBounce: (...args: any[]) => void, bounceInMilliseconds: number, inputProcessor: SpaceTruckerInputProcessor): (...args: any[]) => any {
    var isBounced = false;
    const observableContext = inputProcessor.screen.scene.onBeforeRenderObservable;
    return (...args) => {
        if (isBounced) {
            return false;
        }
        isBounced = true;
        setAndStartTimer({
            timeout: bounceInMilliseconds,
            onEnded: () => isBounced = false,
            contextObservable: observableContext
        });
        return funcToBounce.call(inputProcessor.screen, args);
    };
}

export class SpaceTruckerInputProcessor {

    private _scene: Scene;
    private _controlsAttached = false;

    private _onInputObserver!: Nullable<Observer<InputAction[]>>;

    private _inputQueue: InputAction[][] = [];

    private _lastActionState?: { [key: string]: any };
    private _actionState: { [key: string]: any } = {};

    private _actionMap: { [key: string]: (...args: any[]) => any } = {};

    get screen() {
        return this._screen;
    }

    constructor(private _screen: IScreen, private _inputManager: SpaceTruckerInputManager, private _actionList: InputAction[]) {
        this._scene = this._screen.scene;

        this.buildActionMap(this._actionList, false);
    }

    buildActionMap(actionList: InputAction[], createNew: boolean) {
        if (createNew) {
            this._actionMap = {};
        }

        //const actionList = keyboardControlMap.menuActionList
        actionList.forEach(actionDef => {
            const action = actionDef.action;
            const actionFn = this._screen[action];
            if (!actionFn) {
                return;
            }
            this._actionMap[action] = actionDef.shouldBounce?.() ? bounce(actionFn, 250, this) : actionFn;
        });
    }

    attachControl() {
        if (!this._controlsAttached) {
            logger.logInfo("input processor attaching control for screen " + this._screen);
            this._scene.attachControl();
            this._inputManager.registerInputForScene(this._scene);
            this._onInputObserver = this._inputManager.onInputAvailableObservable.add((inputs) => {
                this.inputAvailableHandler(inputs);
            });
            this._controlsAttached = true;
        }
    }
    detachControl() {
        if (this._controlsAttached) {
            logger.logInfo("input processor detaching control for screen " + this._screen);

            this._inputManager.onInputAvailableObservable.remove(this._onInputObserver);
            this._inputManager.unregisterInputForScene(this._scene);
            this._controlsAttached = false;
            this._inputQueue = [];
        }
    }

    inputAvailableHandler(inputs: InputAction[]) {
        this._inputQueue.push(inputs);
    }

    update() {

        if (!this._controlsAttached) {
            return;
        }
        this._inputManager.getInputs(this._scene);
        this._lastActionState = this._actionState;

        const inputQueue = this._inputQueue;
        while (inputQueue.length > 0) {
            let input = inputQueue.pop();
            this.inputCommandHandler(input!);
        }
    }

    inputCommandHandler(input: InputAction[]) {
        input.forEach(i => {
            const inputParam = i.lastEvent;
            const actionFn = this._actionMap[i.action];
            if (actionFn) {

                const priorState = this._lastActionState ? this._lastActionState[i.action] : null;

                // the way we're dispatching this function in this context results in a loss of the "this" context for the
                // function being dispatched. Calling bind on the function object returns a new function with the correct
                // "this" set as expected. That function is immediately invoked with the target and magnitude parameter values.

                this._actionState[i.action] = actionFn({ priorState }, inputParam);
                // use the return value of the actionFn to allow handlers to maintain individual states (if they choose).
                // handlers that don't need to maintain state also don't need to know what to return, 
                // since undefined == null == false.

            }
        });
    }

}