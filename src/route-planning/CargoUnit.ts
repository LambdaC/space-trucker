import { OrbitingGameObject } from "@/core/OrbitingGameObject";
import { Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { Planet } from "./Planet";

export class CargoUnit extends OrbitingGameObject {

    private _currentGravity = new Vector3(0, 0, 0);
    private _lastVelocity = new Vector3(0, 0, 0);
    private _lastGravity = new Vector3(0, 0, 0);
    private _distanceTraveled = 0.0;
    private _timeInTransit = 0.0;
    private _originPlanet: Planet;
    private _trailMesh?: Mesh;
    private _mass = 0;
    private _isInFlight = false;

    get linearVelocity() {
        return this?.physicsImpostor?.getLinearVelocity()?.length() ?? 0;
    }

    constructor(scene: Scene, origin: Planet, private _options: any) {
        super(scene, _options);

        this.autoUpdatePosition = false;
        this._originPlanet = origin;
        this._mass = _options.cargoMass;
        this.mesh = MeshBuilder.CreateBox("cargo", { width: 1, height: 1, depth: 2 }, this.scene);
        this.mesh.rotation = Vector3.Zero();
    }

    update(deltaTime: number) {
        super.update(deltaTime);
        if (this._isInFlight) {
            this._lastGravity = this._currentGravity.clone();
            const linVel = this.physicsImpostor?.getLinearVelocity();
            this._lastVelocity = linVel!.clone();
            linVel?.normalize();

            this._timeInTransit += deltaTime;
            this._distanceTraveled += this._lastVelocity.length() * deltaTime;

            this.rotation = Vector3.Cross(this.mesh.up, linVel!);
            this.physicsImpostor?.applyImpulse(this._currentGravity.scale(deltaTime), this.mesh.getAbsolutePosition());
            this._currentGravity = Vector3.Zero();
        }
    }

    destroy() {
        // TODO: play explosion animation and sound
        this.physicsImpostor?.setLinearVelocity(Vector3.Zero());
        this.physicsImpostor?.setAngularVelocity(Vector3.Zero());
    }
}