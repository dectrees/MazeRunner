import { AnimationGroup, ArcRotateCamera, FollowCamera, Matrix, Mesh, MeshBuilder, Nullable, Quaternion, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import Game from "./game";
import "@babylonjs/loaders";
import HeroController from "./heroController";

export default class Player {
    private game: Game;
    scene: Scene;
    assets;
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
        this.assets = await this.loadCharacter(scene);
        this.mesh = this.assets.mesh;
        
        //load animation
        this.walkAnim = this.assets.animationGroups[2];
        this.walkBackAnim = this.assets.animationGroups[3];
        this.idleAnim = this.assets.animationGroups[0];
        this.sambaAnim = this.assets.animationGroups[1];

        this.cameraFollow.attachControl(true);
        this.currentCamera = this.cameraFollow;
        this.currentCamera.lockedTarget = this.mesh;
        scene.activeCamera = this.cameraFollow;

    }

    private async loadCharacter(scene:Scene):Promise<any>
    {
        const outer = MeshBuilder.CreateBox("outer", { width: 2, depth: 1, height: 3 }, scene);
        outer.isVisible = false;
        outer.isPickable = false;
        outer.checkCollisions = true;

        //move origin of box collider to the bottom of the mesh (to match player mesh)
        // outer.bakeTransformIntoVertices(Matrix.Translation(0, 1.5, 0))
        outer.position.y += 1.5;
        //for collisions
        outer.ellipsoid = new Vector3(1, 1.5, 1);
        outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

        outer.rotationQuaternion = new Quaternion(0, 1, 0, 0); 

        const result = await SceneLoader.ImportMeshAsync(null, "https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene);
        const root = result.meshes[0];
        root.scaling.scaleInPlace(0.1);
        //body is our actual player mesh
        const body = root;
        //little tricky here, as when parenting, children ganna inherit all the transformation from the parent
        //so we have to move the children first to prevent from inheriting their parent's transformation
        body.position.y -= 1.5;
        body.parent = outer;
        outer.position.y += 1.5;

        body.isPickable = false;
        // console.log("quaternion outer: ",outer.rotationQuaternion);
        // console.log("outer rotation Y: ",outer.rotation.y);
        body.getChildMeshes().forEach(m => {
            m.isPickable = false;
        })
        
        //return the mesh and animations
        return {
            mesh: outer as Mesh,
            animationGroups: result.animationGroups
        }
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
            this.currentCamera.rotationOffset =180;
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