import { OrbitingGameObject } from "@/core/OrbitingGameObject";
import { Color3, MeshBuilder, PBRMaterial, Scalar, Scene, Texture } from "@babylonjs/core";

export class Planet extends OrbitingGameObject {

    private _diameter: number;

    constructor(scene: Scene, private _planetData: any) {
        super(scene, _planetData);

        const planet = this.mesh = MeshBuilder.CreateSphere(_planetData.name, { diameter: _planetData.scale }, this.scene);

        this._diameter = _planetData.scale;
        planet.rotation.x = Math.PI;

        const planetMat = new PBRMaterial(_planetData.name + "-mat", this.scene);
        planetMat.roughness = 0.988;
        planetMat.metallic = 0.001;

        if (_planetData.diffuseTexture) {
            planetMat.albedoTexture = new Texture(_planetData.diffuseTexture, this.scene);
        } else {
            planetMat.albedoColor = _planetData.color ?? Color3.White();
        }
        if (_planetData.normalTexture) {
            planetMat.bumpTexture = new Texture(_planetData.normalTexture, this.scene);
        }
        if (_planetData.specularTexture) {
            planetMat.reflectivityTexture = new Texture(_planetData.specularTexture, this.scene);
        }
        else {
            planetMat.reflectionColor = new Color3(25 / 255, 25 / 255, 25 / 255);
        }
        if (_planetData.lightMapUrl) {
            planetMat.lightmapTexture = new Texture(_planetData.lightMapUrl, this.scene);
        }
        planetMat.directIntensity = _planetData.directIntensity ?? 1.0;
        planet.material = planetMat;

    }

    update(deltaTime: number) {
        this.rotation.y = Scalar.Repeat(this.rotation.y + 0.01, Scalar.TwoPi);
        super.update(deltaTime);
    }
}
