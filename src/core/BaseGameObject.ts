import { Mesh, Scene, Vector3 } from "@babylonjs/core";

export class BaseGameObject {

    protected _mesh!: Mesh;

    protected _lastSceneTime = 0;

    get rotation(): Vector3 { return this._mesh?.rotation; }
    set rotation(value: Vector3) { this._mesh.rotation = value; }

    get position() { return this._mesh.position; }
    set position(value) { this._mesh.position = value; }

    get forward() { return this._mesh?.forward; }

    get material() { return this._mesh?.material; }
    set material(value) { this._mesh.material = value; }
    get physicsImpostor() { return this._mesh.physicsImpostor; }
    set physicsImpostor(value) { this._mesh.physicsImpostor = value; }

    get scene(): Scene {
        return this._scene;
    }

    constructor(protected _scene: Scene) {
        this._scene.onDisposeObservable.add(() => this.dispose());
    }

    update(deltaTime: number) {
        this._lastSceneTime = deltaTime;
    }

    dispose() {
        this._mesh?.dispose();
    }
}