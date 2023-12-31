import { Engine, Scene } from "@babylonjs/core";
import './index.css';
import World from "./World";
import Level from "./Level";
import UI from "./GUI";

export default class Game {
    engine: Engine;
    scene: Scene;
    canvas: HTMLCanvasElement;
    level:Level;
    resizing:boolean = false;

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

        this.resizeCanvas(this.canvas);
        this.engine.resize();

        this.gameinit(this.scene);
        this.canvas.focus();
        window.addEventListener("resize", () => {
            if (this.engine) {
                if(!this.resizing)
                {
                    this.resizing = true;
                    setTimeout(()=>{
                        this.resizeCanvas(this.canvas);
                        this.engine.resize();
                        // console.log("resizing...");
                        if(this.level.UI.isMobile)
                        {
                            // console.log("update mobile UI");
                            this.level.UI.updateUI();
                            // this.level.hero.heroController.updateJoystick();
                        }
                        this.canvas.focus();
                        this.resizing = false;
                    },100);
                }
            }
            
        });

        this.engine.runRenderLoop(
            () => {
                this.scene.render();
                // this.level.UI.advancedTexture.scaleTo(this.engine.getRenderWidth(), this.engine.getRenderHeight());
            }
        );
    }

    private gameinit(scene: Scene) {
        new World(scene);
        // new Player(this);
       
        this.level = new Level(scene, 1);
        // new Level(scene, 1);
    }

    private resizeCanvas (canvas: HTMLCanvasElement) {

        // if(window.innerWidth > window.innerHeight)
        {
            canvas.width = window.innerWidth;
            // canvas.width = window.innerWidth - myDrawerWidth;
            canvas.height = window.innerHeight;
            // canvas.height = window.innerHeight - (myHeaderHeight + myFooterHeight);
            // this.level.UI.debugINFO(canvas.width,canvas.height);
        }
      }

}
new Game()
