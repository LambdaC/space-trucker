import { Scalar, Scene } from "@babylonjs/core";
import { BaseGameObject } from "./BaseGameObject";
import { gravConstant, primaryReferenceMass } from "@/route-planning/GameData";

export class OrbitingGameObject extends BaseGameObject {

    private _angularPosition = 0.0;
    private _angularVelocity = 0.0;
    private _orbitalPeriod = 0.0;
    private _orbitalRadius = 1;
    private _orbitalVelocity = 0.0;
    private _orbitalCircumfrence = 0.0;
    private _autoUpdatePosition = false;

    set autoUpdatePosition(value: boolean) { this._autoUpdatePosition = value; }
    get autoUpdatePosition() { return this._autoUpdatePosition; }

    constructor(scene: Scene, orbitalData: any) {
        super(scene);

        this._autoUpdatePosition = orbitalData?.autoUpdatePosition ?? true;

        if (this._autoUpdatePosition) {
            this._angularPosition = orbitalData.posRadians ?? 0.0;
            this._orbitalRadius = orbitalData.posRadius ?? 0.01;
            this.setOrbitalParameters();
        }
    }

    private setOrbitalParameters(orbitalRadius = this._orbitalRadius, primaryMass = primaryReferenceMass) {
        const parameters = this.calculateOrbitalParameters(orbitalRadius, primaryMass);

        this._orbitalPeriod = parameters.orbitalPeriod;
        this._orbitalVelocity = parameters.orbitalVelocity;
        this._angularVelocity = parameters.angularVelocity;
        this._orbitalCircumfrence = parameters.orbitalCircumfrence;
    }

    private calculateOrbitalParameters(orbitalRadius = this._orbitalRadius, referenceMass = primaryReferenceMass) {
        const Gm = gravConstant * referenceMass;
        const rCubed = Math.pow(orbitalRadius, 3);
        const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
        const v = Math.sqrt(Gm / orbitalRadius);
        const w = v / orbitalRadius;
        const orbitalCircumfrence = Math.pow(Math.PI * orbitalRadius, 2);
        return {
            orbitalPeriod: period,
            orbitalVelocity: v,
            angularVelocity: w,
            orbitalCircumfrence: orbitalCircumfrence
        };
    }

    override update(deltaTime: number) {

        if (this._autoUpdatePosition) {
            this.updateOrbitalPosition(deltaTime);
        }
        super.update(deltaTime);
    }

    private updateOrbitalPosition(deltaTime: number) {
        const angPos = this._angularPosition;
        const w = this._angularVelocity * (deltaTime ?? 0.016);
        const posRadius = this._orbitalRadius;

        this._angularPosition = Scalar.NormalizeRadians(angPos + w);
        // TODO: support inclined orbits by calculating the z-coordinate using the correct trig fn
        this.position.x = posRadius * Math.sin(this._angularPosition);
        this.position.z = posRadius * Math.cos(this._angularPosition);
    }
}