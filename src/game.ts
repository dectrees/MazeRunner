import { Engine, Scene } from "@babylonjs/core";
import './index.css';
import Player from "./player";
import World from "./world";


export default class Game {
    engine: Engine;
    scene: Scene;
    canvas: HTMLCanvasElement;

    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.id = "gameCanvas";
        document.body.appendChild(this.canvas);
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.engine.enableOfflineSupport = false;
        this.gameinit(this.scene);

        this.engine.runRenderLoop(
            () => {
                this.scene.render();
            }
        );
    }

    private gameinit(scene:Scene){
        new World(scene);
        new Player(this);
    }

}

new Game()
