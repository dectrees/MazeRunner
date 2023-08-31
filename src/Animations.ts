import {
    Animation
} from "@babylonjs/core";

export default class Animations {

    //Animation
    Slide: Animation;
    Rotate: Animation;
    frameRate = 50;
    constructor(direction: number) {
        this.Slide = this.buildAnimation(direction);
        this.Rotate = this.buildRotation();
    }
    private buildRotation()
    {
        const rotation = new Animation("rotation", "rotation.y", this.frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);


        const keyFramesR = [];

        keyFramesR.push({
            frame: 0,
            value: 0
        });

        keyFramesR.push({
            frame: this.frameRate,
            value: Math.PI/2
        });

        keyFramesR.push({
            frame: 2 * this.frameRate,
            value: Math.PI
        });
        keyFramesR.push({
            frame: 3 * this.frameRate,
            value: 3*Math.PI/2
        });
        keyFramesR.push({
            frame: 4 * this.frameRate,
            value: 2*Math.PI
        });

        rotation.setKeys(keyFramesR);

        return rotation;
    }
    private buildAnimation(direction: number): Animation {
        if (direction == 0) {
            const xSlide = new Animation("xSlide", "position.x", this.frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);


            const keyFrames = [];

            keyFrames.push({
                frame: 0,
                value: 0
            });

            keyFrames.push({
                frame: this.frameRate,
                value: -3
            });

            keyFrames.push({
                frame: 2 * this.frameRate,
                value: 0
            });
            keyFrames.push({
                frame: 3 * this.frameRate,
                value: 3
            });
            keyFrames.push({
                frame: 4 * this.frameRate,
                value: 0
            });

            xSlide.setKeys(keyFrames);
            return xSlide;
        }
        else {
            const ySlide = new Animation("ySlide", "position.y", this.frameRate, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);

            const keyFramesY = [];

            keyFramesY.push({
                frame: 0,
                value: 6
            });

            keyFramesY.push({
                frame: this.frameRate,
                value: 7
            });

            keyFramesY.push({
                frame: 2 * this.frameRate,
                value: 8
            });
            keyFramesY.push({
                frame: 3 * this.frameRate,
                value: 7
            });
            keyFramesY.push({
                frame: 4 * this.frameRate,
                value: 6    
            });

            ySlide.setKeys(keyFramesY);
            return ySlide;
        }
    }
}
