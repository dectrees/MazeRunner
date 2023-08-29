import { Mesh, Color3, Color4, MeshBuilder, Scene, SolidParticleSystem, StandardMaterial, Texture, Vector3, ShadowGenerator, DirectionalLight, VertexData } from "@babylonjs/core";
import Animations from "./Animations";
import Robot from "./Robot";
export default class Level {
    size: number;
    scene: Scene;
    level: number;
    nbBuildings = 300;
    fact: number;   // density
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    grey: number;
    uvSize: number;
    fireball: Mesh;
    shadowGenerator: ShadowGenerator;
    ani:Animations;
    bandit: Mesh;
    banditClone: boolean = true;
    robot:Robot;
    staticMesh;

    constructor(scene: Scene, level: number) {
        this.size = 500;
        this.scene = scene;
        this.level = level;
        this.fact = 50;   // density
        this.scaleX = 0.0;
        this.scaleY = 0.0;
        this.scaleZ = 0.0;
        this.grey = 0.0;
        this.uvSize = 0.0;
        this.staticMesh = this.buildLevel(scene);
        this.gameObjects(this.scene);
        this.ani = new Animations();
        this.robot = new Robot(scene,this);
    }
    private buildLevel(scene: Scene) {

        var light0 = new DirectionalLight("light", new Vector3(0, -1, 0), scene);
        light0.position = new Vector3(20, 40, 20);
        // Default intensity is 1. Let's dim the light a small amount
        light0.intensity = 0.4;
        light0.specular = new Color3(1, 0.76, 0.76);
        this.shadowGenerator = new ShadowGenerator(1024, light0);
        
        // Ground
        // var ground = MeshBuilder.CreateGround("ground", { height: this.size, width: this.size, subdivisions: 4 }, scene);
        // var groundMaterial = new StandardMaterial("groundMaterial", scene);
        // groundMaterial.diffuseTexture = new Texture("./src/assets/texture/grass.png", scene);
        // groundMaterial.diffuseTexture.uScale = 100;
        // groundMaterial.diffuseTexture.vScale = 100;
        // groundMaterial.specularColor = new Color3(.1, .1, .1);
        // groundMaterial.backFaceCulling = false;
        // ground.material = groundMaterial;
        // ground.receiveShadows = true;
        var customMesh = new Mesh("custom", scene);
        var positions = [
            -this.size, 0, this.size,
            -this.size, 0, -this.size,
            this.size, 0, -this.size,
            this.size, 0, this.size,
            -this.size, 0, this.size,
            this.size, 0, -this.size
        ];
        var indices = [0, 1, 2, 3, 4, 5];	
        var uvs = [0,1,0,0,1,0,1,1,0,1,1,0];
        var colors = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,  0, 1, 0, 1]; //color array added
        	//Empty array to contain calculated values
        var normals = [];
        
        var vertexData = new VertexData();
        VertexData.ComputeNormals(positions, indices, normals);

        //Assign positions, indices and normals to vertexData
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        //Apply vertexData to custom mesh
        vertexData.applyToMesh(customMesh)
        var matground = new StandardMaterial("mat", scene);
        customMesh.material = matground;
        matground.diffuseTexture = new Texture("./src/assets/texture/grass.png")
        matground.diffuseTexture.uScale = 100;
        matground.diffuseTexture.vScale = 100;
        // matground.diffuseColor = new Color3(.1, .1, .1);
        matground.specularColor = new Color3(.1, .1, .1);
        matground.backFaceCulling = false;
        customMesh.receiveShadows = true;

        //SPS 
        var url = "./src/assets/texture/glassbuilding.jpg";
        var mat = new StandardMaterial("mat1", scene);
        var texture = new Texture(url, scene);
        mat.diffuseTexture = texture;

        // custom position function
        const myPositionFunction = (particle, i, s) => {
            this.scaleX = Math.random() * 2 + 0.8;
            this.scaleY = Math.random() * 6 + 0.8;
            this.scaleZ = Math.random() * 2 + 0.8;
            this.uvSize = Math.random() * 0.9;
            particle.scale.x = this.scaleX;
            particle.scale.y = this.scaleY;
            particle.scale.z = this.scaleZ;
            particle.position.x = (Math.random() - 0.5) * this.fact;
            particle.position.y = particle.scale.y / 2 + 0.01;
            particle.position.z = (Math.random() - 0.5) * this.fact;
            particle.rotation.y = Math.random() * 3.5;
            this.grey = 1.0 - Math.random() * 0.5;
            particle.color = new Color4(this.grey + 0.1, this.grey + 0.1, this.grey, 1);
            particle.uvs.x = Math.random() * 0.1;
            particle.uvs.y = Math.random() * 0.1;
            particle.uvs.z = particle.uvs.x + this.uvSize;
            particle.uvs.w = particle.uvs.y + this.uvSize;
        };

        // Particle system creation : Immutable
        var SPS = new SolidParticleSystem('SPS', scene, { updatable: false });
        var model = MeshBuilder.CreateBox("m", {}, scene);
        SPS.addShape(model, this.nbBuildings, { positionFunction: myPositionFunction });
        var mesh = SPS.buildMesh();
        mesh.material = mat;
        mesh.scaling.scaleInPlace(10);
        mesh.checkCollisions = true;
        // dispose the model
        model.dispose();

  
        var wallMaterial = new StandardMaterial("wall", scene);
        wallMaterial.diffuseTexture = new Texture("./src/assets/texture/glassbuilding.jpg", scene);
        wallMaterial.diffuseTexture.uScale = 1;
        wallMaterial.diffuseTexture.vScale = 10;

        var wallleft = MeshBuilder.CreateBox("crate", { size: this.size }, scene);
        wallleft.material = wallMaterial;
        wallleft.scaling = new Vector3(0.01, 0.25, 1);
        wallleft.position.x = -this.size/2;
        wallleft.position.y = this.size/8;
        wallleft.checkCollisions = true;

        var wallright = MeshBuilder.CreateBox("crate", { size: this.size }, scene);
        wallright.material = wallMaterial;
        wallright.scaling = new Vector3(0.01, 0.25, 1);
        wallright.position.x = this.size/2;
        wallright.position.y = this.size/8;
        wallright.checkCollisions = true;

        var wallup = MeshBuilder.CreateBox("crate", { size: this.size }, scene);
        wallup.material = wallMaterial;
        wallup.scaling = new Vector3(0.01, 0.25, 1);
        wallup.rotation.y = Math.PI/2;
        wallup.position.z = this.size/2;
        wallup.position.y = this.size/8;
        wallup.checkCollisions = true;

        var walldown = MeshBuilder.CreateBox("crate", { size: this.size }, scene);
        walldown.material = wallMaterial;
        walldown.scaling = new Vector3(0.01, 0.25, 1);
        walldown.rotation.y = Math.PI/2;
        walldown.position.z = -this.size/2;
        walldown.position.y = this.size/8;
        walldown.checkCollisions = true;

        // console.log([customMesh, mesh].map((t)=>t.getVerticesDataKinds()));
        var staticmesh = Mesh.MergeMeshes([customMesh,mesh], true, true, undefined, false, true);
        if (staticmesh) staticmesh.receiveShadows = true;
        return staticmesh;
    }

    private gameObjects(scene: Scene) {
        //single testing platform
        var platform1 = Mesh.CreateBox("plat1", 2, scene);
        platform1.scaling = new Vector3(1, .25, 1);
        platform1.position.y = 5;
        // platform1.position.x = 4;
        var platmtl = new StandardMaterial("red", scene);
        platmtl.diffuseColor = new Color3(.5, .5, .8);
        platform1.material = platmtl;
        platform1.checkCollisions = true;

        this.fireball = MeshBuilder.CreateSphere("ball platform", { diameter: 0.5 }, scene);
        this.fireball.material = platmtl;
        // this.fireball.position.x = 4;
        this.fireball.position.y = 6;
        this.fireball.isVisible = true;
        this.fireball.checkCollisions = false;


        //shadows setting
        platform1.receiveShadows = true;
        this.shadowGenerator.getShadowMap()?.renderList?.push(platform1);
        // if (this.player) this.shadowGenerator.getShadowMap()?.renderList?.push(this.player);

    }

}
