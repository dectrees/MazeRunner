import { ArcRotateCamera, Color3, FollowCamera, Mesh, MeshBuilder, Nullable, Quaternion, Ray, RayHelper, Scene, ShadowGenerator, StandardMaterial, UniversalCamera, Vector3, Viewport } from "@babylonjs/core";
import Level from "./Level";
import HeorController from "./HeroController";
export default class Hero {
    level: Level;
    scene: Scene;
    camera: ArcRotateCamera | FollowCamera|UniversalCamera;;
    heroController:HeorController;
    mesh:Mesh;
    shadowGenerator: ShadowGenerator;
    originQuaternion  = Quaternion.FromEulerAngles(0, 0, 0);
    private cameraArc: ArcRotateCamera;
    private cameraFollow: FollowCamera;
    private cameraUniversal: UniversalCamera;
    private cameraView: UniversalCamera;
    
    constructor(level: Level) {
        this.level = level;
        this.scene = level.scene;
        this.shadowGenerator = level.shadowGenerator;
        this.cameraArc = this.initArcCamera(this.scene);
        this.cameraFollow = this.initFollowCamera(this.scene);
        this.cameraUniversal = this.initUniversalCamera(this.scene);
        this.camera = this.cameraArc;
        this.initHero(this.scene);
        this.heroController = new HeorController(this,level);
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
    private initArcCamera(scene: Scene) {
        var camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 9;
        camera.upperRadiusLimit = 50;
        camera.radius = 15;
        // camera.upperRadiusLimit = 300;
        camera.upperBetaLimit = Math.PI / 2;
        camera.lowerBetaLimit = Math.PI / 4;
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);
        camera._panningMouseButton = 1;
        camera.layerMask = 0x1FFFFFFF;
        // camera.checkCollisions = true;
        // camera.collisionRadius = new Vector3(1,1,1);
        return camera;
    }

    private initFollowCamera(scene: Scene): FollowCamera {
        var camera = new FollowCamera("tankFollowCamera", new Vector3(10, 0, 10), scene);
        camera.heightOffset = 1;
        camera.rotationOffset = 270;
        camera.cameraAcceleration = .1;
        camera.maxCameraSpeed = 1;
        camera.radius = 10;
        camera.upperRadiusLimit = 15;
        camera.lowerRadiusLimit = 7;
        camera.inputs.removeByType('FollowCameraPointersInput');
        camera.inputs.removeByType("FollowCameraKeyboardMoveInput");
        return camera;

    }

    private initUniversalCamera(scene: Scene): UniversalCamera {
        var camera = new UniversalCamera("universalCamera", new Vector3(-8, 1.5, 0), scene);
        camera.rotationQuaternion = Quaternion.FromEulerAngles(0, Math.PI/2, 0);
        // camera.setTarget(new Vector3(0.1,0.51,0));
        camera.checkCollisions = true;
        camera.ellipsoid = new Vector3(1, 1.5, 1);
        // camera.inputs.removeByType('FreeCameraPointersInput');
        camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
        // console.log("before parenting:",camera.rotationQuaternion);
        camera.parent = this.mesh;
        this.originQuaternion = camera.rotationQuaternion;
        // console.log("after parenting:",camera.rotationQuaternion);
        camera.layerMask = 0x1FFFFFFF;
        camera.speed = 0.02;

        this.cameraView = new UniversalCamera("ViewCamera", new Vector3(8, 4, 4), scene);
        this.cameraView.setTarget(new Vector3(0,1,0));
        this.cameraView.parent = this.mesh;
        this.cameraView.viewport = new Viewport(0.01,0.68,0.2,0.3);
        
        return camera;

    }

    switchCamera() {
        
        if (this.camera instanceof UniversalCamera) {
            console.log("switch to Arc camera");
            // console.log("cam len to arc:",this.scene.activeCameras?.length);
            this.scene.activeCameras = [];
            // console.log("cam len to Arc after:",this.scene.activeCameras?.length);
            // this.scene.activeCameras?.map((cam)=>console.log(cam.name));
            
            this.cameraUniversal.detachControl();
            // this.scene.activeCameras = null;
            this.cameraArc.attachControl(this.scene.getEngine().getRenderingCanvas(),true);
            this.cameraArc._panningMouseButton = 1;
            this.camera = this.cameraArc;
            this.camera.lockedTarget = this.mesh; 
            this.camera.radius = 15;
            this.scene.activeCamera = this.cameraArc;
            
        }
        else {
            // console.log("switch to Follow camera");
            // this.cameraArc.detachControl();
            // this.cameraFollow.attachControl(true);
            // this.scene.activeCamera = this.cameraFollow;
            // this.camera = this.cameraFollow;
            // this.camera.rotationOffset = 270;           
            // this.camera.lockedTarget = this.mesh;
            // this.camera.radius = 10;
            
            console.log("switch to Universal Camera");
            // console.log("cam len to uni:",this.scene.activeCameras?.length);

            this.cameraArc.detachControl();
            this.cameraUniversal.attachControl(true);    
            this.scene.activeCamera = this.cameraUniversal;

            this.scene.activeCameras?.push(this.cameraUniversal);
            this.scene.activeCameras?.push(this.cameraView );
            // console.log("cam len to uni after:",this.scene.activeCameras?.length);
            // this.scene.activeCameras?.map((cam)=>console.log(cam.name));

            this.camera = this.cameraUniversal;  
            this.camera.parent = this.mesh;  
            this.cameraView.parent = this.mesh;   
            // console.log("after switch:",this.camera.rotationQuaternion);
            // this.camera.checkCollisions = true;
            // this.camera.ellipsoid = new Vector3(1, 1.5, 1); 
            this.scene.cameraToUseForPointers = this.cameraUniversal;
        }
        
    }
    //combined an asymmetrical obect with axis
    private asymmetryWithAxis(scene: Scene): Nullable<Mesh> {
        // var localOrigin = this.localAxes(1);
        // localOrigin.rotation.y = Math.PI/2;
        var asymmetricalObject = this.asymmetry(scene);
        // localOrigin.parent = asymmetricalObject;

        if (asymmetricalObject) {
            asymmetricalObject.position.y = 1;
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
        var material = new StandardMaterial("m", scene);
        material.diffuseColor = new Color3(1, 0, 5);

        var emissiveMat = new StandardMaterial("glow",scene);
        emissiveMat.emissiveColor = Color3.Teal();

        var body = MeshBuilder.CreateCylinder("body", { height: 0.6, diameterTop: 0.2, diameterBottom: 0.5, tessellation: 6, subdivisions: 1 }, scene);
        var front = MeshBuilder.CreateBox("front", { height: .6, width: 0.3, depth: 0.1875 }, scene);
        front.position.x = 0.125;
        var head = MeshBuilder.CreateSphere("head", { diameter: 0.5 }, scene);
        head.position.y = 0.6;
        var arm = MeshBuilder.CreateCylinder("arm", { height: 1, diameter: 0.2, tessellation: 6, subdivisions: 1 }, scene);
        arm.rotation.x = Math.PI / 2;
        arm.position.y = 0.2;
        var bottom = MeshBuilder.CreateCylinder("bottom", { height: 0.2, diameter: 1, tessellation: 12, subdivisions: 6 }, scene);
        bottom.position.y = -.3

        body.material = material;
        front.material = emissiveMat;
        arm.material = material;
        bottom.material = emissiveMat;
        var pilot = Mesh.MergeMeshes([body, front, head, arm,bottom], true, true, undefined, false, true);
        return pilot;
    }
}
