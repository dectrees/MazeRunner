import { Engine, Scene } from "@babylonjs/core";
import './index.css';
import Player from "./Player";
import World from "./World";
import Level from "./Level";
import Hero from "./Hero";


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
        this.scene.collisionsEnabled = true;
        this.engine.enableOfflineSupport = false;
        this.gameinit(this.scene);

        window.addEventListener("resize", () => {
            if (this.engine) {
                this.engine.resize();
            }
        });

        this.engine.runRenderLoop(
            () => {
                this.scene.render();
            }
        );
    }

    private gameinit(scene: Scene) {
        new World(scene);
        // new Player(this);
       
        new Hero(this, new Level(scene, 1));

    }

}

new Game()
