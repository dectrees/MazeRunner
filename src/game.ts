import { Vector3, Color3, Engine, Scene, AmmoJSPlugin, ArcRotateCamera, HemisphericLight } from "@babylonjs/core";
import './index.css';
import Ground from "./gameObject/Ground";
import Player from "./gameObject/Player";
import Ammo from "ammojs-typed";

export default class Game {
    engine: Engine;
    scene: Scene;
    canvas: HTMLCanvasElement;
    player!: Player;
    enablePhysics: boolean;

    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.id = "gameCanvas";
        this.enablePhysics = true;
        document.body.appendChild(this.canvas);
        this.engine = new Engine(this.canvas, true);

        if (this.enablePhysics) {
            this.initPhysics().then(() => {
                this.physicalObjects();
            });
        }

        this.scene = this.createScene(this.engine);
        this.engine.runRenderLoop(
            () => {
                this.scene.render();
            }
        );
    }

    private async initPhysics(): Promise<void> {
        // const ammo = await Ammo();
        const ammo = await Ammo.bind(window)();
        const physics: AmmoJSPlugin = new AmmoJSPlugin(true, ammo);
        this.scene.enablePhysics(new Vector3(0, -9.81, 0), physics);

    }

    
    private physicalObjects() {
        new Ground(0, 0, this);
        this.player = new Player(this);
    }

    private createScene(engine: Engine): Scene {

        const scene = new Scene(engine);
        //camera
        const camera = new ArcRotateCamera("camera", 0, Math.PI / 3, 5, Vector3.Zero(), scene);
        camera.lowerRadiusLimit = 9;
        camera.upperRadiusLimit = 9;
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);


        //light
        const light = new HemisphericLight("light", new Vector3(0.5, 1, 0), scene);
        light.intensity = 0.7;
        scene.ambientColor = new Color3(0.3, 0.3, 0.3);

        return scene;
    }

}

new Game()
