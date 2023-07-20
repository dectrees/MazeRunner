import Game from "../game";
import GameObject from "./gameObject";
import {CreateIcoSphereVertexData, Vector3, PhysicsImpostor} from "@babylonjs/core";

export default class Player extends GameObject{

    constructor(game:Game){
        super("player",game);

        const vertexData  = CreateIcoSphereVertexData({radius:1,flat:true,subdivisions:3});
        vertexData.applyToMesh(this);

        this.position = Vector3.Zero();
        this.position.y = 5;

        this.physicsImpostor = new PhysicsImpostor(
            this,
            PhysicsImpostor.BoxImpostor,
            {mass:1,restitution:0.9},
            game.scene
        )
    }
}