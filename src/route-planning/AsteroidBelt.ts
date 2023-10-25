import { OrbitingGameObject } from "@/core/OrbitingGameObject";
import { Material, Matrix, MeshBuilder, PBRMaterial, Quaternion, Scalar, Scene, Texture, Vector3 } from "@babylonjs/core";
import rockTextureUrl from "@/../assets/textures/rock.png";
import rockNormalUrl from "@/../assets/textures/rockn.png";

export class AsteroidBelt extends OrbitingGameObject {

    private _rotations: Vector3[] = [];
    private _positions: Vector3[] = [];
    private _scalings: Vector3[] = [];
    private _quaternions: Quaternion[] = [];
    private _matrices: Matrix[] = [];
    private _matrixBuffer: Float32Array;

    get numAsteroids(): number {
        return this._asteroidBeltData.number;
    }

    constructor(scene: Scene, private _asteroidBeltData: any) {
        super(scene, _asteroidBeltData);

        const numAsteroids = _asteroidBeltData.number;


        const density = _asteroidBeltData.density;
        const innerBeltRadius = _asteroidBeltData.innerBeltRadius;
        const outerBeltRadius = _asteroidBeltData.outerBeltRadius;
        const maxScale = _asteroidBeltData.maxScale;

        const rockMat = new PBRMaterial("rockMat", this.scene);
        rockMat.albedoTexture = new Texture(rockTextureUrl, this.scene);
        rockMat.bumpTexture = new Texture(rockNormalUrl, this.scene);
        rockMat.roughness = 0.9;
        rockMat.metallic = 0.015;
        const aSphere = MeshBuilder.CreateIcoSphere("spsSphere", { radius: 5, subdivisions: 4, flat: true });
        aSphere.material = rockMat;

        for (let i = 0; i < numAsteroids; ++i) {
            this._scalings.push(new Vector3(Math.random() * 2 + 1, Math.random() + 1, Math.random() * 2 + 1));

            let theta = Math.random() * 2 * Math.PI;
            let rTheta = Scalar.RandomRange(innerBeltRadius + density * 0.5, outerBeltRadius - density * 0.5);

            this._positions.push(new Vector3(
                Math.sin(theta) * rTheta,
                (Math.random() - 0.5) * density,
                Math.cos(theta) * rTheta
            ));

            this._rotations.push(new Vector3(
                Math.random() * 3.5,
                Math.random() * 3.5,
                Math.random() * 3.5
            ));

            this._quaternions.push(new Quaternion());
            this._matrices.push(new Matrix());
        }

        this._matrixBuffer = new Float32Array(numAsteroids * 64);
        this.updateMatrices();
        aSphere.thinInstanceSetBuffer("matrix", this._matrixBuffer);

        this.mesh = aSphere;
    }

    private updateMatrices() {
        for (let i = 0; i < this.numAsteroids; ++i) {
            Quaternion.FromEulerAnglesToRef(this._rotations[i].x, this._rotations[i].y, this._rotations[i].z, this._quaternions[i]);
            Matrix.ComposeToRef(this._scalings[i], this._quaternions[i], this._positions[i], this._matrices[i]);
            this._matrices[i].copyToArray(this._matrixBuffer, i * 16);
        }
    };

    update(deltaTime: number) {
        this.rotation.y = Scalar.Repeat(this.rotation.y + 0.0001, Scalar.TwoPi);

        for (let i = 0; i < this.numAsteroids; ++i) {
            this._rotations[i].x += Math.random() * 0.01;
            this._rotations[i].y += Math.random() * 0.01;
            this._rotations[i].z += Math.random() * 0.01;
        }
        this.updateMatrices();
        this.mesh.thinInstanceBufferUpdated("matrix");
    }
}