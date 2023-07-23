import { AnimationGroup, ArcRotateCamera, FollowCamera, Mesh, Nullable, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import Game from "./game";
import "@babylonjs/loaders";
import HeroController from "./heroController";

export default class Player {
    private game: Game;
    scene: Scene;
    mesh: Mesh;
    // private heroController: HeroController;
    heroSpeed = 0.03;
    heroSpeedBackwards = 0.01;
    heroRotationSpeed = 0.05;


    private cameraArc: ArcRotateCamera;
    private cameraFollow: FollowCamera;
    private currentCamera: FollowCamera |  ArcRotateCamera;

    walkAnim: Nullable<AnimationGroup> = null;
    walkBackAnim: Nullable<AnimationGroup> = null;
    idleAnim: Nullable<AnimationGroup> = null;
    sambaAnim: Nullable<AnimationGroup> = null;

    constructor(game: Game) {
        this.game = game;
        this.scene = game.scene;
        
        this.cameraFollow = this.initFollowCamera(this.scene);
        this.cameraArc = this.initArcCamera(this.scene);
        this.loadModel(this.scene);
        new HeroController(this);
    }

    //ArcRotateCamera
    private initArcCamera(scene: Scene): ArcRotateCamera {
        var camera1 = new ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 2, 10, new Vector3(0, 2, 0), scene);
        camera1.lowerRadiusLimit = 5;
        camera1.upperRadiusLimit = 30;
        camera1.upperBetaLimit = Math.PI / 2.1;
        camera1.lowerBetaLimit = Math.PI / 4;
        camera1.wheelDeltaPercentage = 0.01;
        return camera1;
    }

    private initFollowCamera(scene: Scene): FollowCamera {
        var camera = new FollowCamera("tankFollowCamera", new Vector3(10, 0, 10), scene);
        camera.heightOffset = 3;
        camera.rotationOffset = 180;
        camera.cameraAcceleration = .1;
        camera.maxCameraSpeed = 1;
        camera.radius = 8;

        camera.inputs.removeByType('FollowCameraPointersInput');
        return camera;

    }

    private async loadModel(scene: Scene): Promise<void> {
        const model = await SceneLoader.ImportMeshAsync(null, "https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene);
        this.mesh = model.meshes[0] as Mesh;
        this.mesh.scaling.scaleInPlace(0.1);
        this.cameraFollow.attachControl(true);

        this.currentCamera = this.cameraFollow;
        this.currentCamera.lockedTarget = this.mesh;
        scene.activeCamera = this.currentCamera;


        //load animation
        this.walkAnim = scene.getAnimationGroupByName("Walking");
        this.walkBackAnim = scene.getAnimationGroupByName("WalkingBack");
        this.idleAnim = scene.getAnimationGroupByName("Idle");
        this.sambaAnim = scene.getAnimationGroupByName("Samba");

    }

    switchCamera(){
        if(this.currentCamera instanceof FollowCamera){
            // console.log("switch to arc camera");
            // this.cameraFollow.attachControl(false);
            this.cameraArc.attachControl(this.game.canvas,true);
            this.scene.activeCamera = this.cameraArc;
            this.currentCamera = this.cameraArc;
            this.currentCamera.lockedTarget = this.mesh;
        }
        else{
            // console.log("switch to fcollow camera");
            // this.cameraArc.attachControl(false);
            // this.cameraFollow.attachControl(true);
            this.scene.activeCamera = this.cameraFollow;
            this.currentCamera = this.cameraFollow;
            this.currentCamera.rotationOffset = 180;
        }
    }

    play(act: string) {
        switch (act) {
            case "idle":
                this.idleAnim?.start(true, 1.0, this.idleAnim.from, this.idleAnim.to, false);
                break;
            case "samba":
                this.sambaAnim?.start(true, 1.0, this.sambaAnim.from, this.sambaAnim.to, false);
                break;
            case "forward":
                this.walkAnim?.start(true, 1.0, this.walkAnim.from, this.walkAnim.to, false);
                break;
            case "back":
                this.walkBackAnim?.start(true, 1.0, this.walkBackAnim.from, this.walkBackAnim.to, false);
                break;
        }
    }
    stop() {
        this.idleAnim?.stop();
        this.walkAnim?.stop();
        this.walkBackAnim?.stop();
    }

    move(act: string) {
        switch (act) {
            case "w":
                this.mesh.moveWithCollisions(this.mesh.forward.scaleInPlace(this.heroSpeed));
                break;
            case "s":
                this.mesh.moveWithCollisions(this.mesh.forward.scaleInPlace(-this.heroSpeedBackwards));
                break;
            case "a":
                this.mesh.rotate(Vector3.Up(), -this.heroRotationSpeed);
                break;
            case "d":
                this.mesh.rotate(Vector3.Up(), this.heroRotationSpeed);
                break;
        }
    }

}