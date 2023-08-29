import { ActionManager, Axis, ExecuteCodeAction, Matrix, Mesh, Nullable, Quaternion, Scene, Vector3, ParticleSystem, RayHelper, PointerEventTypes, Ray } from "@babylonjs/core";
import Hero from "./Hero";
import ParticleController from "./ParticleController"
import Level from "./Level";
export default class HeorController {
    scene: Scene;
    player;
    level: Level;
    inputMap = {};
    source = Quaternion.FromEulerAngles(0, 0, 0);
    target = Quaternion.FromEulerAngles(0, 0, 0);
    onObject = false;

    //Input detection
    jumpKeyDown = false;
    isJumping = false;

    //jumping and collision with ground checks
    velocity = new Vector3();
    dashvelv = new Vector3();
    dashvelh = new Vector3();
    //dashes
    dashTime = 0;
    startDashTime = 0.1;
    dxn = 0; //which dxn dash should go
    dashing = false;


    fireball: Mesh;
    bullet: Mesh;
    bandit: Mesh;

    pc: ParticleController;
    fireStatus = false;
    fireRanger = 50;
    fireVelocity = 0.1;
    fireDirection: Vector3 = Vector3.Zero();
    distance = 0;
    fireStart: Vector3 = Vector3.Zero();
    trace: boolean = true;
    lightup: boolean = false;
    banditReady: boolean = false;


    constructor(player: Hero, level: Level) {
        this.scene = player.scene;
        this.player = player;
        this.level = level;
        this.registerPointerHandler();
        this.scene.onBeforeRenderObservable.add(() => {
            // this._updateSPS();
            this._updateFrame();
            this._checkInput(this.scene);
        });
        this.fireball = player.level.fireball;
        this.bandit = player.level.bandit;

        this.pc = level.pc;
        this.registerAction(this.scene);
        this.registerUpdate(this.scene);
    }

    private registerUpdate(scene: Scene) {
        scene.registerBeforeRender(() => {

            //jump check
            const delta = scene.getEngine().getDeltaTime();

            if (this.velocity.y <= 0) {//create a ray to detect the ground as character is falling

                const ray = new Ray();
                const rayHelper = new RayHelper(ray);
                if (this.player) rayHelper.attachToMesh(this.player.mesh, new Vector3(0, -0.995, 0), new Vector3(0, 0, 0), 0.6);

                const pick = scene.pickWithRay(ray);
                if (pick) {
                    this.onObject = pick.hit;

                }

            }
            this.velocity.y -= delta / 3000;
            if (this.onObject) {
                // console.log("onObject now");
                this.velocity.y = Math.max(0, this.velocity.y)
            };
            if (this.jumpKeyDown && this.onObject) {

                this.velocity.y = 0.20;
                this.onObject = false;
                // console.log("jump onObject:",this.onObject);
            }

            this.player?.mesh.moveWithCollisions(this.velocity);
        });
    }

    private _updateFrame() {
        if (this.bandit == null && this.banditReady && this.player.level.banditClone) {
            this.bandit = this.fireball.clone();
            // console.log("cloned a bandit");
            this.bandit.position = Vector3.Zero();
            this.bandit.position.z = 20;
            this.bandit.position.y = 5;
            this.bandit.isVisible = true;
            if (this.pc.ps) {
                this.pc.ps.emitter = this.bandit;
            }
            this.bandit.animations.push(this.player.level.ani.xSlide);
            this.player.level.banditClone = false;
            this.scene.beginAnimation(this.bandit, 0, 4 * this.player.level.ani.frameRate, true);
        }
        if (this.player) {
            // console.log("navReady:",this.level.navReady);
            // console.log("level init:",this.level.init);
            if (this.level.navReady && this.level.init) {
                // console.log("finding start point");
                var startPoint = this.level.robot.getStartPoint(new Vector3(0, 0.1, 0));
                if (startPoint) {
                    console.log("found a startPoint:", startPoint);
                    this.player.mesh.position = startPoint;
                }
                this.level.init = false;
            }
            if (this.isPointerDown) {

                this.source = this.player.mesh.rotationQuaternion!;
                if (this.source) {
                    this.player.mesh.rotationQuaternion = Quaternion.Slerp(this.source, this.target, 0.3);
                }
                else {
                    console.log("souce is null");
                }
            }
            if (this.pc.ps) {
                // this.ps.emitter = new Vector3(this.player.position.x, this.player.position.y+0.5,this.player.position.z);
            }

            if (!this.bullet) {
                if (this.pc.fireReady) {
                    // console.log("clone a new fireball");
                    this.bullet = this.fireball.clone();
                    if (this.player) {
                        this.bullet.position = Vector3.Zero();
                        this.bullet.position.y = 0.7;
                        this.bullet.isVisible = true;
                        this.bullet.parent = this.player.mesh;
                        this.pc.ps?.stop();
                        if (this.pc.ps) {
                            this.pc.ps.emitter = null;
                            this.banditReady = true;
                        }
                    }
                }
            }
            else if (this.fireStatus) {
                let intersect = false;
                if (this.bandit) {
                    intersect = this.bullet.intersectsMesh(this.bandit);
                }
                if ((this.distance < this.fireRanger) && (!intersect)) {
                    // console.log("distance:",this.distance);
                    if (this.trace && this.bandit) {
                        const smatrix = Matrix.Zero();
                        const sscaling = Vector3.Zero();
                        const srotationQuaternion = Quaternion.Zero();
                        const stranslation = Vector3.Zero();

                        let step = Vector3.Zero();
                        step.copyFrom(this.bullet.forward);
                        // step.y = 0;
                        step = step.normalize();
                        Matrix.LookAtLHToRef(Vector3.Zero(), step, Axis.Y, smatrix);
                        smatrix.decompose(sscaling, srotationQuaternion, stranslation);
                        this.bullet.rotationQuaternion = srotationQuaternion.invertInPlace();
                        this.bullet.moveWithCollisions(step.scaleInPlace(this.fireVelocity));


                        const matrix = Matrix.Zero();
                        const scaling = Vector3.Zero();
                        const rotationQuaternion = Quaternion.Zero();
                        const translation = Vector3.Zero();

                        Matrix.LookAtLHToRef(this.bullet.position, this.bandit.position, Axis.Y, matrix);
                        matrix.decompose(scaling, rotationQuaternion, translation);
                        let destQuaternion = rotationQuaternion.invertInPlace();
                        this.bullet.rotationQuaternion = Quaternion.Slerp(this.bullet.rotationQuaternion, destQuaternion, 0.05);

                        this.distance = this.bullet.position.subtract(this.fireStart).length();
                    }
                    else {
                        let step = this.fireDirection;
                        step.y = 0;
                        step = step.normalize();
                        this.bullet.moveWithCollisions(step.scaleInPlace(this.fireVelocity));
                        this.distance = this.bullet.position.subtract(this.fireStart).length();
                    }
                }
                else {
                    // console.log("reset fire bullet");
                    if (intersect) {
                        if (!this.lightup) {
                            this.lightup = true;
                            this.pc.ps?.start();
                            setTimeout(() => {
                                this.pc.ps?.stop();
                                if (this.pc.ps) this.pc.ps.emitter = null;
                                this.lightup = false;
                                this.pc.doExplode(this.scene, this.bandit);
                                this.bandit = null;
                            }, 3000);
                        }

                    }
                    this.bullet.position = Vector3.Zero();
                    this.bullet.position.y = 0.7;
                    this.bullet.rotationQuaternion = Quaternion.FromEulerAngles(0, 0, 0);
                    this.bullet.parent = this.player.mesh;
                    this.distance = 0;
                    this.fireStatus = false;
                }

            }
        }
        else {
            console.log("player is null");
        }


    }

    private _checkInput(scene: Scene) {
        // dash implementation Blackthornprod unity tutorial
        // not dashing
        if (this.player) {
            // console.log("before check:", this.onObject);
            let keydown = false;
            let step = Vector3.Zero();
            if (!this.dashing) {
                if (this.inputMap["w"] || this.inputMap["ArrowUp"]) {
                    step = this.player.mesh.right;
                    step.y = 0;
                    this.player.mesh.moveWithCollisions(step.scaleInPlace(0.1));
                    // this.player.position.z+=0.1;
                    keydown = true;
                    this.dxn = 1;
                }
                if (this.inputMap["a"] || this.inputMap["ArrowLeft"]) {
                    step = this.player.mesh.forward;
                    step.y = 0;
                    this.player.mesh.moveWithCollisions(step.scaleInPlace(0.1));
                    keydown = true;
                    this.dxn = 3;
                }
                if (this.inputMap["s"] || this.inputMap["ArrowDown"]) {
                    step = this.player.mesh.right;
                    step.y = 0;
                    this.player.mesh.moveWithCollisions(step.scaleInPlace(-0.1));

                    keydown = true;
                }
                if (this.inputMap["d"] || this.inputMap["ArrowRight"]) {
                    step = this.player.mesh.forward;
                    step.y = 0;
                    this.player.mesh.moveWithCollisions(step.scaleInPlace(-0.1));
                    keydown = true;
                    this.dxn = 4;
                }
                if (this.inputMap["Shift"] && this.dxn != 0) {
                    keydown = true;
                    this.dashing = true;
                } else {
                    this.dxn = 0;
                }
                if (this.inputMap["f"]) {
                    if (this.bullet) {
                        if (!this.fireStatus) {
                            this.fireStatus = true;
                            this.fireDirection.copyFrom(this.player.mesh.right);
                            // this.fireDirection = this.player.right;
                            // console.log("fire directon:",this.fireDirection);
                            this.distance = 0;
                            this.bullet.setParent(null);
                            this.fireStart.copyFrom(this.bullet.position);
                            this.bullet.rotate(Vector3.Up(), Math.PI / 2);
                            // console.log("fireStart:",this.fireStart);
                        }
                    }
                }
            } else {
                if (this.dashTime <= 0) {

                    this.dashTime = this.startDashTime;
                    this.dashvelv.y = 0;
                    this.dashvelh.x = 0;
                    this.dashing = false;
                    this.dxn = 0;

                } else {
                    this.dashTime -= scene.getEngine().getDeltaTime() / 3000;

                    if (this.dxn == 1) { // up
                        this.dashvelv.y = .3;
                        this.player.mesh.moveWithCollisions(this.dashvelv);
                    } else if (this.dxn == 3) { // left
                        this.dashvelh = this.player.mesh.forward;
                        this.dashvelh.y += 0;
                        this.player.mesh.moveWithCollisions(this.dashvelh.scaleInPlace(0.5));

                    } else if (this.dxn == 4) { //right
                        this.dashvelh = this.player.mesh.forward;
                        this.dashvelh.y = 0;
                        this.player.mesh.moveWithCollisions(this.dashvelh.scaleInPlace(-0.5));
                    }
                }
            }
        }
    }

    private isPointerDown: boolean = false;
    private registerPointerHandler() {

        this.scene.onPointerObservable.add((eventData) => {
            eventData.event.preventDefault();
            if (eventData.type === PointerEventTypes.POINTERDOWN && eventData.event.button === 2) {
                this.isPointerDown = true;
                // console.log("mouse key down");
            }
            else if (eventData.type === PointerEventTypes.POINTERMOVE) {
                // console.log("event button:",eventData.event.button);
                if (this.isPointerDown) {
                    const a1 = this.player.camera.alpha;
                    this.target = Quaternion.FromEulerAngles(0, Math.PI - a1, 0);
                    // console.log("mouse key move");
                }
            }
            else if (eventData.type === PointerEventTypes.POINTERUP && eventData.event.button === 2) {
                this.isPointerDown = false;
                // console.log("mouse key up")
            }
        });

    }

    private registerAction(scene: Scene) {
        scene.actionManager = new ActionManager(scene);
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

            //checking jumps
            if (evt.sourceEvent.type == "keydown") {
                if ((evt.sourceEvent.key == "c" || evt.sourceEvent.key == " ")) {
                    this.jumpKeyDown = true;
                    // console.log("jumpKeyDown");
                }
                if (evt.sourceEvent.key == "z") {
                    this.level.navKeyDown = true;
                }
            }
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

            //checking jumps
            if (evt.sourceEvent.type == "keyup") {

                if ((evt.sourceEvent.key == "c" || evt.sourceEvent.key == " ")) {
                    this.jumpKeyDown = false;
                    // console.log("jumpKeyDown");
                }
                if (evt.sourceEvent.key == "z") {
                    this.level.navKeyDown = false;
                }
            }
        }));

    }
}