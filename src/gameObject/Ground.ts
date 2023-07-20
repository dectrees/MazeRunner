import Game from "../game";
import GameObject from "./gameObject";
import {Vector3, CreateBoxVertexData, PhysicsImpostor} from "@babylonjs/core";

export default class Ground extends GameObject{
    constructor(x: number, z: number, game: Game){
        super("ground",game);
        
        const vertexData  = CreateBoxVertexData({size:10,width:10,height:0.1,depth:10}) ;
        vertexData.applyToMesh(this);


        this.position = Vector3.Zero();
        this.position.x = x;
        this.position.z = z;

        this.physicsImpostor = new PhysicsImpostor(
            this,
            PhysicsImpostor.BoxImpostor,
            {mass:0,restitution:0.9},
            game.scene
        )
    }
}