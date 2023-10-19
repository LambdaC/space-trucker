import { Engine, Gamepad, GenericPad, IKeyboardEvent, IMouseEvent, KeyboardEventTypes, Nullable, Observable, Observer, PointerEventTypes, Scene } from "@babylonjs/core";
import { InputAction } from "./InputAction";
import logger from "@/logger";
import SpaceTruckerControls from "./inputActionMaps";

interface InputSubscription {
    checkInputs: () => void,
    dispose: () => void
}

const controlsMap = SpaceTruckerControls.inputControlsMap;
export class SpaceTruckerInputManager {

    private _inputMap: { [key: string]: IKeyboardEvent | IMouseEvent | number };
    private _gamepad?: Gamepad | null;
    private _gamePadOnButtonDown!: Nullable<Observer<number>>;
    private _gamePadOnButtonUp!: Nullable<Observer<number>>;
    private _onInputAvailableObservable: Observable<InputAction[]>;

    /** 缓存需要监听输入事件的场景数据 */
    private _inputSubscriptions: { scene: Scene, subscriptions: InputSubscription[] }[] = [];


    get onInputAvailableObservable() {
        return this._onInputAvailableObservable;
    }

    constructor(private _engine: Engine) {
        this._inputMap = {};
        this._onInputAvailableObservable = new Observable();
    }

    getInputs(scene: Scene): Nullable<InputAction[]> {
        const sceneInputHandler = this._inputSubscriptions.find(is => is.scene === scene);
        if (!sceneInputHandler) {
            return null;
        }
        sceneInputHandler.subscriptions.forEach(s => s.checkInputs());
        const im = this._inputMap;
        const ik = Object.keys(im);

        const inputs = ik
            .map((key) => {
                return { action: controlsMap[key], lastEvent: im[key] };
            });
        if (inputs && inputs.length > 0) {
            this._onInputAvailableObservable.notifyObservers(inputs);
        }
        return inputs;
    }

    /** 某个场景需要监听输入事件 */
    registerInputForScene(sceneToRegister: Scene) {
        logger.logInfo("registering input for scene" + sceneToRegister);
        const inputSubscriptions = this._inputSubscriptions;
        const registration = {
            scene: sceneToRegister, subscriptions: [
                this.enableKeyboard(sceneToRegister),
                this.enableMouse(sceneToRegister),
                this.enableGamepad(sceneToRegister)
            ]
        };

        sceneToRegister.onDisposeObservable.add(() => this.unregisterInputForScene(sceneToRegister));
        inputSubscriptions.push(registration);
        sceneToRegister.attachControl(); // 让scene可以监听事件
    }

    /** 某个场景去掉输入监听 */
    unregisterInputForScene(sceneToUnregister: Scene) {
        logger.logInfo("unregistering input controls for scene" + sceneToUnregister);
        const subs = this._inputSubscriptions.find(s => s.scene === sceneToUnregister);
        if (!subs) {
            logger.logWarning("didn't find any subscriptions to unregister..." + this._inputSubscriptions);
            return;
        }
        subs.subscriptions.forEach(sub => sub.dispose());
        sceneToUnregister.detachControl();
    }

    /** 监听键盘事件 */
    enableKeyboard(scene: Scene): InputSubscription {
        const observer = scene.onKeyboardObservable.add((kbInfo) => {
            const key = kbInfo.event.key;
            const keyMapped = SpaceTruckerControls.inputControlsMap[key];

            if (!keyMapped) {
                return;
            }

            if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
                this._inputMap[key] = kbInfo.event;
            }
            else {
                delete this._inputMap[key];
            }
        });

        const checkInputs = () => { };
        return {
            checkInputs,
            dispose: () => {
                scene.onKeyboardObservable.remove(observer);
            }
        };
    }

    /** 监听鼠标事件 */
    enableMouse(scene: Scene) {
        const obs = scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
                this._inputMap["PointerTap"] = pointerInfo.event;
            }
            else if (pointerInfo.type === PointerEventTypes.POINTERUP) {
                if (this._inputMap["PointerTap"] != null) {
                    delete this._inputMap["PointerTap"];
                }
            }
        });

        const checkInputs = () => { };
        return { checkInputs, dispose: () => scene.onPointerObservable.remove(obs) };
    }

    /** 处理gamepad事件 */
    // adapted from 
    // source: https://github.com/BabylonJS/Babylon.js/blob/preview/src/Cameras/Inputs/freeCameraGamepadInput.ts
    enableGamepad(scene: Scene) {
        const manager = scene.gamepadManager;
        const gamepadConnectedObserver = manager.onGamepadConnectedObservable
            .add(gamepad => {
                console.log('gamepad connected', gamepad);
                // HACK: need to avoid selecting goofy non-gamepad devices reported by browser
                if (gamepad?.browserGamepad?.buttons.length > 0) {
                    if (gamepad.type !== Gamepad.POSE_ENABLED) {
                        // prioritize XBOX gamepads.
                        if (!this._gamepad || gamepad.type === Gamepad.XBOX) {
                            this._gamepad = gamepad;
                        }
                    }
                    const controlMap = SpaceTruckerControls.gamePadControlMap[gamepad.type];
                    // how do we manage the observers here?
                    this._gamePadOnButtonDown = (gamepad as GenericPad).onButtonUpObservable.add((buttonId, s) => {
                        console.log("button down", buttonId, s);
                        const buttonMapped = controlMap[buttonId][0];
                        console.log(buttonMapped[0]);
                        this._inputMap[buttonMapped] = 1;
                    });
                    this._gamePadOnButtonUp = (gamepad as GenericPad).onButtonUpObservable.add((buttonId, s) => {
                        console.log("button up", buttonId, s);
                        const buttonMapped = controlMap[buttonId][0];
                        delete this._inputMap[buttonMapped];
                    });
                }
            });

        const gamepadDisconnectedObserver = manager.onGamepadDisconnectedObservable
            .add(gamepad => {
                (gamepad as GenericPad).onButtonDownObservable.remove(this._gamePadOnButtonDown);
                (gamepad as GenericPad).onButtonUpObservable.remove(this._gamePadOnButtonUp);
                this._gamepad = null;
            });

        const checkInputs = () => {
            const iMap = this._inputMap;
            if (!this._gamepad) { return; }

            // handle quantitative or input that reads between 0 and 1
            // binary (on/off) inputs are handled by the onButton/ondPadUp|DownObservables

            let LSValues = SpaceTruckerControls.normalizeJoystickInputs(this._gamepad.leftStick);
            SpaceTruckerControls.mapStickTranslationInputToActions(LSValues, iMap);

            let RSValues = SpaceTruckerControls.normalizeJoystickInputs(this._gamepad.rightStick);
            SpaceTruckerControls.mapStickRotationInputToActions(RSValues, iMap);

        };

        // check if there are already other controllers connected
        this._gamepad = manager
            .gamepads
            .find(gp => gp && gp.type === Gamepad.XBOX && gp.browserGamepad.buttons.length);

        // if no xbox controller was found, but there are gamepad controllers, take the first one
        if (!this._gamepad && manager.gamepads.length) {
            // HACK
            this._gamepad = manager.gamepads[0];
        }

        console.log('gamepad enabled', this._gamepad);

        return {
            checkInputs,
            dispose: () => {
                this._gamepad = null;
                manager.onGamepadConnectedObservable.remove(gamepadConnectedObserver);
                manager.onGamepadDisconnectedObservable.remove(gamepadDisconnectedObserver);
            }
        };
    }
}