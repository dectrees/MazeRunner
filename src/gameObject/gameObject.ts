import {Mesh, Scene} from "@babylonjs/core";
import Game from "../game";

export default class GameObject extends Mesh {
    game: Game;
    scene: Scene;

    constructor(name: string, game: Game){
        super(name,game.scene);

        this.game = game;
        this.scene = game.scene;

    }
}