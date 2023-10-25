import { OrbitingGameObject } from "@/core/OrbitingGameObject";
import { MeshBuilder, Scene, StandardMaterial, Texture } from "@babylonjs/core";

export class Star extends OrbitingGameObject {

    constructor(scene: Scene, options: any) {
        super(scene, options);
        this.autoUpdatePosition = false;
        const starData = options;

        this.mesh = MeshBuilder.CreateSphere("star", { diameter: starData.scale }, this.scene);
        this.material = new StandardMaterial("starMat", this.scene);
        (this.material as StandardMaterial).emissiveTexture = new Texture(starData.diffuseTexture, this.scene);
    }

    update(deltaTime: number) {
        this.rotation.y += deltaTime * 0.0735;

    }
}