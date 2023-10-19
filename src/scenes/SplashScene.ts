import logger from "@/logger";
import { Animation, ArcRotateCamera, Camera, Color3, Color4, Engine, HemisphericLight, Mesh, MeshBuilder, Observable, Scene, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import babylonLogoUrl from "@/../assets/babylonjs_identity_color.png";
import poweredByUrl from "@/../assets/powered-by.png";
import spaceTruckerRigUrl from "@/../assets/space-trucker-and-rig.png";
import communityUrl from "@/../assets/splash-screen-community.png";
import { CutSceneSegment } from "./CutSceneSegment";
import { IScreen } from "./IScreen";
import titleMusic from "../assets/sounds/space-trucker-title-theme.m4a";
import { SpaceTruckerInputManager } from "@/input/SpaceTruckerInputManager";
import { InputAction } from "@/input/InputAction";
import { SpaceTruckerInputProcessor } from "@/input/SpaceTruckerInputProcessor";

const animationFps = 30;
const flipAnimation = new Animation("flip", "rotation.x", animationFps, Animation.ANIMATIONTYPE_FLOAT, 0, true);
const fadeAnimation = new Animation("entranceAndExitFade", "visibility", animationFps, Animation.ANIMATIONTYPE_FLOAT, 0, true);
const scaleAnimation = new Animation("scaleTarget", "scaling", animationFps, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE, true);

const actionList: InputAction[] = [{ action: "ACTIVATE", shouldBounce: () => true }];
export class SplashScene implements IScreen {

    private _scene: Scene;

    // 4个过场动画
    private _billboard!: Mesh;
    private _powerBy!: CutSceneSegment;
    private _babylonBillboard!: CutSceneSegment;
    private _communityProduction!: CutSceneSegment;
    private _callToAction!: CutSceneSegment;
    private _currentSegment?: CutSceneSegment;
    private _previousSegment?: CutSceneSegment;

    private _light: HemisphericLight;
    private _camera: Camera;

    private _onReadyObservable: Observable<void> = new Observable();

    private _music!: Sound;

    private _skipRequested = false;
    private _actionProcessor?: SpaceTruckerInputProcessor;

    get actionProcessor() {
        return this._actionProcessor;
    }

    get scene() {
        return this._scene;
    }

    get onReadyObservable() {
        return this._onReadyObservable;
    }

    get skipRequested() {
        return this._skipRequested;
    }

    constructor(private _engine: Engine, private _inputManager: SpaceTruckerInputManager) {
        this._scene = new Scene(this._engine);
        this._scene.clearColor = new Color4(0, 0, 0, 1.0);
        this._camera = new ArcRotateCamera("camera", 0, Math.PI / 2, 5, Vector3.Zero(), this._scene);
        this._light = new HemisphericLight("light", new Vector3(0, 1, 0), this._scene);
        this._light.groundColor = Color3.White();
        this._light.intensity = 0.5;

        this._initialize();
    }

    handleInput() {

    }

    update() {
        if (this._previousSegment !== this._currentSegment) {
            this._currentSegment?.start();
        }
        this._actionProcessor?.update();
        this._previousSegment = this._currentSegment;
    }

    private _initialize() {
        this._billboard = this._createBillboard();
        this._powerBy = this._createPowerBy();
        this._babylonBillboard = this._createBabylonBillboard();
        this._communityProduction = this._createCommunityProduction();
        this._callToAction = this._createCallToAction();

        const poweredTexture = new Texture(poweredByUrl, this._scene);
        const babylonTexture = new Texture(babylonLogoUrl, this._scene);
        const communityTexture = new Texture(communityUrl, this._scene);
        const rigTexture = new Texture(spaceTruckerRigUrl, this._scene);

        const billMat = this._billboard.material as StandardMaterial;
        billMat.diffuseTexture = poweredTexture;

        this._powerBy.onEnd.addOnce(() => {
            logger.logInfo("powered End");
            billMat.diffuseTexture = babylonTexture;
            this._billboard.rotation.x = Math.PI;
            this._light.intensity = 0.667;
            this._billboard.visibility = 0;
            this._currentSegment = this._babylonBillboard;
        });

        this._babylonBillboard.onEnd.addOnce(() => {
            logger.logInfo("babylonEnd");
            billMat.diffuseTexture = communityTexture;
            this._billboard.rotation.x = Math.PI;
            this._billboard.visibility = 0;
            this._currentSegment = this._communityProduction;

        });

        this._communityProduction.onEnd.addOnce(() => {
            logger.logInfo("communityEnd");
            this._billboard.visibility = 0;
            billMat.diffuseTexture = rigTexture;
            this._currentSegment = this._callToAction;
        });

        this._callToAction.onEnd.addOnce(() => {
            logger.logInfo("callToAction end");
            // this._skipRequested = true;
        });

        this._music = new Sound("theme",
            titleMusic,
            this._scene,
            () => {
                // 通知准备就绪
                this._onReadyObservable.notifyObservers();
            },
            { autoplay: false, loop: false, volume: .01 });

        this._actionProcessor = new SpaceTruckerInputProcessor(this, this._inputManager, actionList);

    }

    private _createBillboard(): Mesh {
        const billboard = MeshBuilder.CreatePlane("billboard", {
            width: 5,
            height: 3
        }, this._scene);
        billboard.rotation.z = Math.PI;
        billboard.rotation.x = Math.PI;
        billboard.rotation.y = Math.PI / 2;
        const billMat = new StandardMaterial("stdMat", this._scene);
        billboard.material = billMat;

        return billboard;
    }

    private _createCallToAction(): CutSceneSegment {
        const start = 0;
        const enterTime = 3.0;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 3.0;
        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 1 }
        ];

        const startVector = new Vector3(1, 1, 1);
        const scaleKeys = [
            { frame: start, value: startVector },
            { frame: entranceFrame, value: new Vector3(1.25, 1, 1.25) },
            { frame: beginExitFrame, value: new Vector3(1.5, 1, 1.5) },
            { frame: endFrame, value: new Vector3(1, 1, 1) }
        ];

        fadeAnimation.setKeys(keys);
        scaleAnimation.setKeys(scaleKeys);

        const seg = new CutSceneSegment(this._billboard, this._scene, [fadeAnimation, scaleAnimation]);
        return seg;
    }

    private _createCommunityProduction(): CutSceneSegment {
        const start = 0;
        const enterTime = 4.0;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 3.0;
        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 0 }
        ];

        fadeAnimation.setKeys(keys);

        const seg2 = new CutSceneSegment(this._billboard, this._scene, [fadeAnimation]);
        return seg2;
    }

    private _createBabylonBillboard(): CutSceneSegment {
        const start = 0;
        const enterTime = 2.5;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 2.5;
        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 0 }
        ];
        fadeAnimation.setKeys(keys);

        const seg1 = new CutSceneSegment(this._billboard, this._scene, [fadeAnimation]);
        return seg1;
    }

    private _createPowerBy() {
        const start = 0;
        const enterTime = 3.5;
        const exitTime = enterTime + 2.5;
        const end = exitTime + 2.5;

        const entranceFrame = enterTime * animationFps;
        const beginExitFrame = exitTime * animationFps;
        const endFrame = end * animationFps;
        const keys = [
            { frame: start, value: 0 },
            { frame: entranceFrame, value: 1 },
            { frame: beginExitFrame, value: 0.998 },
            { frame: endFrame, value: 0 }
        ];
        fadeAnimation.setKeys(keys);

        const flipKeys = [
            { frame: start, value: Math.PI },
            { frame: entranceFrame, value: 0 },
            { frame: beginExitFrame, value: Math.PI },
            { frame: endFrame, value: 2 * Math.PI }
        ];
        flipAnimation.setKeys(flipKeys);

        const seg0 = new CutSceneSegment(this._billboard, this._scene, [fadeAnimation, flipAnimation]);
        return seg0;
    }

    run() {
        this._previousSegment = this._currentSegment = this._powerBy;
        this._music.play();
        this._music.setVolume(0.998, 400);
        this._currentSegment.start();
    }

    /** SpaceTruckerInputProcessor will call it */
    ACTIVATE(state: { [key: string]: any }) {
        const lastState = state.priorState;
        if (!this._skipRequested && !lastState) {
            logger.logInfo("Key press detected. Skipping cut scene.");
            this._skipRequested = true;
            return true;
        }
        return false;
    }


}