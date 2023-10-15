import { ArcRotateCamera, CreateCylinder, Engine, HemisphericLight, Observable, Scalar, Scene, Sound, StandardMaterial, Texture, Vector3, setAndStartTimer } from "@babylonjs/core";
import { AdvancedDynamicTexture, Button, Control, Grid, Image, Rectangle, TextBlock, TextWrapping } from "@babylonjs/gui";
import { StarfieldProceduralTexture } from "@babylonjs/procedural-textures/starfield/starfieldProceduralTexture";
import menuBackground from "../assets/menuBackground.png";
import titleMusic from "../assets/sounds/space-trucker-title-theme.m4a";
import selectionIcon from "../assets/ui-selection-icon.png";
import logger from "../logger";

export class MainMenuScene {

    private _engine: Engine;
    private _scene!: Scene;
    private _menu!: AdvancedDynamicTexture;
    private _menuGrid!: Grid;
    private _menuContainer!: Rectangle;
    private _music: Sound;
    private _selectorIcon!: Image;
    private _selectorAnimationFrame = 0;
    private _selectedItemIndex = 0;
    private _selectedItemChanged: Observable<number>;

    constructor(engine: Engine) {
        this._engine = engine;
        this._scene = new Scene(engine);
        this._music = new Sound("titleMusic", titleMusic, this._scene, () => logger.logInfo("loaded title music"), { autoplay: true, loop: true, volume: 1.5 });
        this._setupBackgroundEnviroment();
        this._setupUI();
        this._createSelectorIcon();

        this._selectedItemChanged = new Observable();
        this._selectedItemChanged.add((idx) => {
            const menuGrid = this._menuGrid;
            const selectedItem = menuGrid.getChildrenAt(idx, 1);
            if (selectedItem && selectedItem[0].isEnabled !== true) {
                this.selectedItemIndex = 1 + idx;
            }
            this._selectorIcon.isVisible = true;
            menuGrid.removeControl(this._selectorIcon);
            menuGrid.addControl(this._selectorIcon, idx);
        });

        this._scene.whenReadyAsync().then(() => this.selectedItemIndex = 0);
    }

    get selectedItemIndex() {
        return this._selectedItemIndex || -1;
    }

    set selectedItemIndex(idx) {
        const itemCount = this._menuGrid.rowCount;
        const newIdx = Scalar.Repeat(idx, itemCount);
        this._selectedItemIndex = newIdx;
        this._selectedItemChanged.notifyObservers(newIdx);
    }

    private _createSelectorIcon() {
        this._selectorIcon = new Image("selectorIcon", selectionIcon);
        this._selectorIcon.width = "160px";
        this._selectorIcon.height = "60px";
        this._selectorIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this._selectorIcon.shadowOffsetX = 5;
        this._selectorIcon.shadowOffsetY = 3;


        this._selectorIcon.isVisible = false;
        this._menuGrid.addControl(this._selectorIcon, 1, 0);
        this._selectorAnimationFrame = 1;
        this._scene.onBeforeRenderObservable.add(() => this._selectorIconAnimation());
    }

    private _selectorIconAnimation() {
        const animTimeSeconds = Math.PI * 2;
        const dT = this._scene.getEngine().getDeltaTime() / 1000;
        this._selectorAnimationFrame = Scalar.Repeat(this._selectorAnimationFrame + dT * 5, animTimeSeconds * 10);
        this._selectorIcon.top = Math.sin(this._selectorAnimationFrame).toFixed(0) + "px";
    }

    private _setupBackgroundEnviroment() {
        const camera = new ArcRotateCamera("menuCam", 0, 0, -30, Vector3.Zero(), this._scene, true);
        const light = new HemisphericLight("light", new Vector3(0, 0.5, 0), this._scene);
        const starfieldPT = new StarfieldProceduralTexture("starfieldPT", 512, this._scene);
        const starfieldMat = new StandardMaterial("starfield", this._scene);
        const space = CreateCylinder("space", { height: 100, diameterTop: 0, diameterBottom: 60 }, this._scene);
        starfieldMat.diffuseTexture = starfieldPT;
        starfieldMat.diffuseTexture.coordinatesMode = Texture.SKYBOX_MODE;
        starfieldMat.backFaceCulling = false;
        starfieldPT.beta = 0.1;
        space.material = starfieldMat;
        this._scene.registerBeforeRender(() => starfieldPT.time += this._scene.getEngine().getDeltaTime() / 1000);
    }

    private _setupUI() {
        this._menu = AdvancedDynamicTexture.CreateFullscreenUI("Menu");
        this._menu.renderAtIdealSize = true;
        const menuContainer = new Rectangle("menuContainer");
        menuContainer.width = 0.8;
        menuContainer.thickness = 5;
        menuContainer.cornerRadius = 13;

        this._menu.addControl(menuContainer);
        this._menuContainer = menuContainer;

        const menuBg = new Image("menuBg", menuBackground);
        menuContainer.addControl(menuBg);

        const menuGrid = new Grid("menuGrid");
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addColumnDefinition(0.33);
        menuGrid.addRowDefinition(0.5);
        menuGrid.addRowDefinition(0.5);
        menuContainer.addControl(menuGrid);
        this._menuGrid = menuGrid;

        const titleText = new TextBlock("title", "Space-Truckers");
        titleText.resizeToFit = true;
        titleText.textWrapping = TextWrapping.WordWrap;
        titleText.fontSize = "72pt";
        titleText.color = "white";
        titleText.width = 0.9;
        titleText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        titleText.paddingTop = titleText.paddingBottom = "18px";
        titleText.shadowOffsetX = 3;
        titleText.shadowOffsetY = 6;
        titleText.shadowBlur = 2;
        menuContainer.addControl(titleText);

        this._addMenuItems();
    }

    private _addMenuItems() {
        const pbOpts = {
            name: "btPlay",
            title: "Play",
            background: "red",
            color: "white",
            onInvoked: () => logger.logInfo("Play button clicked")
        };

        const ebOpts = {
            name: "btExit",
            title: "Exit",
            background: "white",
            color: "black",
            onInvoked: () => {
                logger.logInfo("Exit button clicked");
                this._onMenuLeave(1000);
            }
        }

        const createMenuItem = (opts: typeof pbOpts) => {
            const btn = Button.CreateSimpleButton(opts.name || "", opts.title);
            btn.color = opts.color || "white";
            btn.background = opts.background || "green";
            btn.height = "80px";
            btn.thickness = 4;
            btn.cornerRadius = 80;
            btn.shadowOffsetY = 12;
            btn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            btn.fontSize = "36pt";

            if (opts.onInvoked) {
                btn.onPointerClickObservable.add((ed, es) => opts.onInvoked());
            }

            return btn;
        }

        const playButton = createMenuItem(pbOpts);
        this._menuGrid.addControl(playButton, this._menuGrid.children.length, 1);

        const exitButton = createMenuItem(ebOpts);
        this._menuGrid.addControl(exitButton, this._menuGrid.children.length, 1);
        // this._menu.addControl(exitButton);
    }

    _onMenuEnter(duration: number) {
        let fadeIn = 0;
        const fadeTime = duration || 1500;
        const timer = setAndStartTimer({
            timeout: fadeTime,
            contextObservable: this._scene.onBeforeRenderObservable,
            onTick: () => {
                const dT = this._scene.getEngine().getDeltaTime();
                fadeIn += dT;
                const currAmt = Scalar.SmoothStep(0, 1, fadeIn / fadeTime);
                this._menuContainer.alpha = currAmt;
            },
            onEnded: () => {
                this.selectedItemIndex = 0;
            }
        });
        return timer;
    }

    private _onMenuLeave(duration: number) {
        let fadeOut = 0;
        const fadeTime = duration || 1500;

        this._menuContainer.isVisible = false;

        const timer = setAndStartTimer({
            timeout: fadeTime,
            contextObservable: this._scene.onBeforeRenderObservable,

            onTick: () => {
                const dT = this._scene.getEngine().getDeltaTime();
                fadeOut += dT;
                const currAmt = Scalar.SmoothStep(1, 0, fadeOut / fadeTime);
                this._menuContainer.alpha = currAmt;

            },

            onEnded: () => {
                this._music.stop();
            }

        });

        return timer;
    }

    get scene(): Scene {
        return this._scene;
    }
}