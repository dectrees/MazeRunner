import {
    Animation
} from "@babylonjs/core";

export default class Animations {

    //Animation
    xSlide: Animation;
    frameRate = 50;
    constructor() {
        this.xSlide = this.buildAnimation();
    }
    private buildAnimation(): Animation {
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
}
