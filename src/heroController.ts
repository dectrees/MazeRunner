import { ActionManager, ExecuteCodeAction, PointerEventTypes, Scene } from "@babylonjs/core";
import Player from "./player";

export default class HeorController {
    private player: Player;
    inputMap: any;
    private animating = false;
    private lastPointerX: number =0;
    private isPointerDown:boolean = false;
    private angleSensibility:number = 500;

    constructor(player: Player) {
        this.player = player;
        this.registerAction(player.scene);

        this.update(player.scene);
    }
    private registerAction(scene: Scene) {
        scene.actionManager = new ActionManager(scene);
        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        //register mouse move
        scene.onPointerObservable.add((eventData) => {
            if (eventData.type === PointerEventTypes.POINTERDOWN) {
              this.lastPointerX = eventData.event.clientX;
              this.isPointerDown = true;
            } else if (eventData.type === PointerEventTypes.POINTERMOVE) {
              if (this.isPointerDown) {
                const currentPointerX = eventData.event.clientX;
                const deltaX = currentPointerX - this.lastPointerX; 
          
                this.lastPointerX = currentPointerX;
                this.player.rotate(deltaX/this.angleSensibility);
              }
            } else if (eventData.type === PointerEventTypes.POINTERUP) {
              this.isPointerDown = false;
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

        //Manage animations to be played  
        if (keydown) {
            if (!this.animating) {
                this.animating = true;
                if (this.inputMap["s"]) {
                    //Walk backwards
                    this.player.play("back");
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
                else {
                    //Walk
                    this.player.play("forward");
                }
            }
        }
        else {

            if (this.animating) {
                //Default animation is idle when no key is down     
                this.player.play("samba");

                //Stop all animations besides Idle Anim when no key is down
                this.player.stop();

                //Ensure animation are played only once per rendering loop
                this.animating = false;
            }
        }
    });
}
}