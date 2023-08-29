import { ActionManager, ArcRotateCamera, ExecuteCodeAction, FollowCamera, PointerEventTypes, Quaternion, Scene, Tools } from "@babylonjs/core";
import Player from "./Player";

export default class HeorController {
    private player: Player;
    inputMap: any;
    private animating = true;
    private lastPointerX: number = 0;
    private isPointerDown: boolean = false;
    private angleSensibility: number = 300;

    constructor(player: Player) {
        this.player = player;
        this.registerAction(player.scene);

        this.update(player.scene);
    }
    private registerAction(scene: Scene) {
        scene.actionManager = new ActionManager(scene);
        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = true;
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = false;
        }));

        //register mouse move
        scene.onPointerObservable.add((eventData) => {
            if (eventData.type === PointerEventTypes.POINTERDOWN && eventData.event.button === 2) {
                this.lastPointerX = eventData.event.clientX;
                this.isPointerDown = true;
            } else if (eventData.type === PointerEventTypes.POINTERMOVE) {
                if (this.isPointerDown) {
                    if (this.player.currentCamera instanceof FollowCamera) {
                        const currentPointerX = eventData.event.clientX;
                        const deltaX = currentPointerX - this.lastPointerX;
                        this.lastPointerX = currentPointerX;
                        this.player.rotate(deltaX / this.angleSensibility);
                    }
                    else if(this.player.currentCamera instanceof ArcRotateCamera)
                    {
                        this.player.mouseRightKeyDown = true;
                    }
                }
            } else if (eventData.type === PointerEventTypes.POINTERUP && eventData.event.button === 2) {
                this.isPointerDown = false;
                this.player.mouseRightKeyDown = false;
            }
        });
    }
    private update(scene: Scene) {
        //Rendering loop (executed for everyframe)
        scene.onBeforeRenderObservable.add(() => {
            var keydown = false;
            //Manage the movements of the character (e.g. position, direction)
            if (this.inputMap["w"]) {    
                this.player.move("w");               
                keydown = true;
            }
            if (this.inputMap["s"]) {
                this.player.move("s");       
                keydown = true;
            }
            if (this.inputMap["a"]) {
                this.player.move("a");
                keydown = true;
            }
            if (this.inputMap["d"]) {
                this.player.move("d");
                keydown = true;
            }
            if (this.inputMap["b"]) {
                keydown = true;
            }
            if (this.inputMap["c"]) {
                keydown = true;
            }
            if (this.inputMap["Shift"])
            {
                keydown  = true;
            }

            //Manage animations to be played  
            if (keydown) {
                if (!this.animating) {
                    this.animating = true;
                    if (this.inputMap["s"]) {
                        //Walk backwards
                        if(this.player.rush)
                        {
                            // console.log("play back,fast");
                            this.player.play("back",0.5);
                        }
                        else{
                            // console.log("play back,normal");
                            this.player.play("back");
                        }
                    }
                    else if
                        (this.inputMap["b"]) {
                        //Samba!
                         this.player.play("samba");                       
                    }
                    else if
                        (this.inputMap["c"]) {
                        this.player.switchCamera();
                    }
                    else if(this.inputMap["Shift"])
                    {
                        this.player.rush = !this.player.rush;
                        // console.log("rush:",this.player.rush);
                    }
                    else {
                        //Walk
                        if(this.player.rush)
                        {
                            // console.log("key down,play fast");
                            this.player.play("forward",0.5);
                        }
                        else
                        {
                            // console.log("key down, play normal")
                            this.player.play("forward");
                        }
                    }
                }
            }
            else {

                if (this.animating) {
                    //Default animation is idle when no key is down     
                    this.player.play("idle");

                    //Stop all animations besides Idle Anim when no key is down
                    this.player.stop();

                    //Ensure animation are played only once per rendering loop
                    this.animating = false;
                    // console.log("stop animation");
                }
            }
        });
    }
}