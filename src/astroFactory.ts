import { Animation, Color3, Mesh, MeshBuilder, Scalar, Scene, StandardMaterial, Texture, TrailMesh } from "@babylonjs/core";
import distortTexture from "../assets/textures/distortion.png";
import rockTextureN from "../assets/textures/rockn.png";
import rockTexture from "../assets/textures/rock.png";

export class AstroFactory {
    static createPlanet(opts: {
        name: string;
        posRadians: number;
        posRadius: number;
        scale: number;
        color: Color3;
        rocky: boolean;
    }, scene: Scene): Mesh {
        const planet = MeshBuilder.CreateSphere(opts.name, { diameter: 1 }, scene);
        const mat = new StandardMaterial(planet.name + "-mat", scene);
        mat.diffuseColor = mat.specularColor = opts.color;
        mat.specularPower = 0;
        if (opts.rocky === true) {
            mat.bumpTexture = new Texture(rockTextureN, scene);
            mat.diffuseTexture = new Texture(rockTexture, scene);
        } else {
            mat.diffuseTexture = new Texture(distortTexture, scene);
        }

        planet.material = mat;
        planet.scaling.setAll(opts.scale);
        planet.position.x = opts.posRadius * Math.sin(opts.posRadians);
        planet.position.z = opts.posRadius * Math.cos(opts.posRadians);

        (planet as any).orbitOptions = opts;
        (planet as any).orbitAnimationObserver = AstroFactory.createAndStartOrbitAnimation(planet, scene);
        return planet;
    }

    static createAndStartOrbitAnimation(planet: Mesh, scene: Scene) {
        const Gm = 6672.59 * 0.07;
        const opts = (planet as any).orbitOptions;
        const rCubed = Math.pow(opts.posRadius, 3);
        const period = Scalar.TwoPi * Math.sqrt(rCubed / Gm);
        const v = Math.sqrt(Gm / opts.posRadius);
        const w = v / period;
        const circum = Scalar.TwoPi * opts.posRadius;
        let angPos = opts.posRadians;

        planet.computeWorldMatrix(true);
        let planetTrail = new TrailMesh(planet.name + "-trail", planet, scene, .1, circum, true);
        let trailMat = new StandardMaterial(planetTrail.name + "-mat", scene);
        trailMat.emissiveColor = trailMat.specularColor = trailMat.diffuseColor = opts.color;
        planetTrail.material = trailMat;

        let preRenderObsv = scene.onBeforeRenderObservable.add(sc => {
            planet.position.x = opts.posRadius * Math.sin(angPos);
            planet.position.z = opts.posRadius * Math.cos(angPos);
            angPos = Scalar.Repeat(angPos + w, Scalar.TwoPi);
        });
        return preRenderObsv;
    }

    static createSpinAnimation() {
        let orbitAnim = new Animation("planetspin",
            "rotation.y", 30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE);
        const keyFrames = [];
        keyFrames.push({
            frame: 0,
            value: 0
        });
        keyFrames.push({
            frame: 60,
            value: Scalar.TwoPi
        });
        orbitAnim.setKeys(keyFrames);
        return orbitAnim
    }
}