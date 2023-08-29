import { ArcRotateCamera, Color3, Mesh, MeshBuilder, Nullable, Quaternion, Ray, RayHelper, Scene, ShadowGenerator, StandardMaterial, Vector3 } from "@babylonjs/core";
import Game from "./Game";
import Level from "./Level";
import HeorController from "./HeroController";
export default class Hero {
    game: Game;
    scene: Scene;
    level:Level;
    camera;
    heroController:HeorController;
    mesh:Mesh;
    shadowGenerator: ShadowGenerator;
    
    constructor(game: Game,level:Level) {
        this.game = game;
        this.scene = game.scene;
        this.level = level;
        this.shadowGenerator = level.shadowGenerator;
        this.camera = this.createCamera(this.scene);
        this.heroController = new HeorController(this);
        this.initHero(this.scene);

    }


    private initHero(scene:Scene)
    {
        this.mesh = this.asymmetryWithAxis(scene) ;
        if (this.mesh) {
            this.mesh.isPickable = false;
            this.mesh.ellipsoid = new Vector3(0.5, 0.5, 0.5);
            // this.mesh.position.x = -4;
        }
        this.camera.lockedTarget = this.mesh;
        this.shadowGenerator.getShadowMap()?.renderList?.push(this.mesh);
    }
    private createCamera(scene: Scene) {
        var camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 9;
        // camera.upperRadiusLimit = 50;
        camera.upperRadiusLimit = 300;
        camera.upperBetaLimit = Math.PI / 2;
        camera.lowerBetaLimit = Math.PI / 4;
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
        camera._panningMouseButton = 1;
        return camera;
    }

    //combined an asymmetrical obect with axis
    private asymmetryWithAxis(scene: Scene): Nullable<Mesh> {
        // var localOrigin = this.localAxes(1);
        // localOrigin.rotation.y = Math.PI/2;
        var asymmetricalObject = this.asymmetry(scene);
        // localOrigin.parent = asymmetricalObject;
        var material = new StandardMaterial("m", scene);
        material.diffuseColor = new Color3(1, 0, 5);
        if (asymmetricalObject) {
            asymmetricalObject.material = material;
            asymmetricalObject.position.y += 0.5;
            asymmetricalObject.rotationQuaternion = Quaternion.FromEulerAngles(0, -Math.PI / 2, 0);

        }
        return asymmetricalObject;
    }

    // a local axis system to help you in need
    private localAxes(size: number): Mesh {
        var pilot_local_axisX = Mesh.CreateLines("pilot_local_axisX", [
            Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
            new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
        ], this.scene, false);
        pilot_local_axisX.color = new Color3(1, 0, 0);

        var pilot_local_axisY = Mesh.CreateLines("pilot_local_axisY", [
            Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
            new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
        ], this.scene, false);
        pilot_local_axisY.color = new Color3(0, 1, 0);

        var pilot_local_axisZ = Mesh.CreateLines("pilot_local_axisZ", [
            Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
            new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
        ], this.scene, false);
        pilot_local_axisZ.color = new Color3(0, 0, 1);

        var local_origin = MeshBuilder.CreateBox("local_origin", { size: 1 }, this.scene);
        local_origin.isVisible = false;

        pilot_local_axisX.parent = local_origin;
        pilot_local_axisY.parent = local_origin;
        pilot_local_axisZ.parent = local_origin;

        return local_origin;

    }
    // an asymmetricall object  to help you not lost your direction
    private asymmetry(scene: Scene): Nullable<Mesh> {
        var body = MeshBuilder.CreateCylinder("body", { height: 1, diameterTop: 0.2, diameterBottom: 0.5, tessellation: 6, subdivisions: 1 }, scene);
        var front = MeshBuilder.CreateBox("front", { height: 1, width: 0.3, depth: 0.1875 }, scene);
        front.position.x = 0.125;
        var head = MeshBuilder.CreateSphere("head", { diameter: 0.5 }, scene);
        head.position.y = 0.75;
        var arm = MeshBuilder.CreateCylinder("arm", { height: 1, diameter: 0.2, tessellation: 6, subdivisions: 1 }, scene);
        arm.rotation.x = Math.PI / 2;
        arm.position.y = 0.25;

        var pilot = Mesh.MergeMeshes([body, front, head, arm], true);
        return pilot;
    }
}
