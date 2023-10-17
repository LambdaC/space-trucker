import { Animation, AnimationGroup, Mesh, Scene } from "@babylonjs/core";

export class CutSceneSegment {

    public animationGroup: AnimationGroup;

    public loopAnimation: boolean = false;

    constructor(private _target: Mesh, private _scene: Scene, animationSequence: Animation[]) {

        this.animationGroup = new AnimationGroup(this._target.name + "-animGroupCS", this._scene);

        for (const anim of animationSequence) {
            this.animationGroup.addTargetedAnimation(anim, this._target);
        }
    }

    start() {
        this.animationGroup.start(this.loopAnimation);
    }

    stop() {
        this.animationGroup.stop();
    }

    get onEnd() {
        return this.animationGroup.onAnimationEndObservable;
    }
}