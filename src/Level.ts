import { Mesh, Color3, Color4, MeshBuilder, Scene, SolidParticleSystem, StandardMaterial, Texture, Vector3, ShadowGenerator, DirectionalLight, VertexData, GlowLayer } from "@babylonjs/core";
import Animations from "./Animations";
import Robot from "./Robot";
import Hero from "./Hero";
import ParticleController from "./ParticleController";
import UI from "./GUI";
export default class Level {
    size: number;
    scene: Scene;
    nlevel: number;
    nbBuildings = 300;
    fact: number;   // density
    scaleX: number;
    scaleY: number;
    scaleZ: number;
    grey: number;
    uvSize: number;
    fireball: Mesh;
    platform: Mesh;
    shadowGenerator: ShadowGenerator;
    ani:Animations;
    bandit: Mesh;
    banditClone: boolean = true;
    robot:Robot;
    staticMesh;
    hero:Hero;
    navKeyDown = false;
    navReady = false;
    init = true;
    alien:Mesh;
    enableWandering = false;
    UI;
    gl:GlowLayer;
    varGL:GlowLayer;

     //particle system
     pc: ParticleController;

    constructor(scene: Scene, nlevel: number) {
        this.size = 500;
        this.scene = scene;
        this.nlevel = nlevel;
        this.fact = 50;   // density
        this.scaleX = 0.0;
        this.scaleY = 0.0;
        this.scaleZ = 0.0;
        this.grey = 0.0;
        this.uvSize = 0.0;
        this.shadowGenerator = this.createShadowCast(scene);
        this.staticMesh = this.buildLevel(scene);
        this.ani = new Animations(1);
        this.UI = new UI();
        this.gl = this.createGlowLayer(scene);
        this.varGL = this.createVarGlowLayer(scene);

        this.fireball = this.gameObjects(scene);
        this.pc = new ParticleController(this.scene,this.fireball,this); 
        this.hero = new Hero(this);
        this.robot = new Robot(scene,this,this.hero);
        // scene.collisionsEnabled = true;
    }
    private createVarGlowLayer(scene:Scene)
    {
        var gl = new GlowLayer("varglow", scene);
        var t = 0;
        scene.onBeforeRenderObservable.add(function() {
            t += 0.01;
            if(t > 1000) t = 0;
            gl.intensity = Math.cos(t) * 0.5 + 0.5;
        });
        return gl;
    }
    private createGlowLayer(scene:Scene)
    {
        var gl = new GlowLayer("glow", scene);
        gl.intensity = 0.4;
        return gl;
    }

    applyGL(mesh:Mesh)
    {
        if(mesh)
        {
            this.gl.addIncludedOnlyMesh(mesh);
        }
    }

    applyVarGL(mesh:Mesh)
    {
        if(mesh)
        {
            this.varGL.addIncludedOnlyMesh(mesh);
        }
    }
    private createShadowCast(scene:Scene)
    {
        var light0 = new DirectionalLight("light", new Vector3(0, -1, 0), scene);
        light0.position = new Vector3(20, 40, 20);
        // Default intensity is 1. Let's dim the light a small amount
        light0.intensity = 0.4;
        light0.specular = new Color3(1, 0.76, 0.76);
        var shadowGenerator = new ShadowGenerator(1024, light0);
        return shadowGenerator;
    }
    private buildLevel(scene: Scene) {

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
            -this.size/2, 0, this.size/2,
            -this.size/2, 0, -this.size/2,
            this.size/2, 0, -this.size/2,
            this.size/2, 0, this.size/2,
            -this.size/2, 0, this.size/2,
            this.size/2, 0, -this.size/2
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
        matground.diffuseTexture = new Texture("./assets/texture/grass.png")
        matground.diffuseTexture.uScale = 100;
        matground.diffuseTexture.vScale = 100;
        // matground.diffuseColor = new Color3(.1, .1, .1);
        matground.specularColor = new Color3(.1, .1, .1);
        matground.backFaceCulling = false;
        customMesh.receiveShadows = true;
        // customMesh.isPickable = true;

        //SPS 
        var url = "./assets/texture/glassbuilding.jpg";
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
        wallMaterial.diffuseTexture = new Texture("./assets/texture/glassbuilding.jpg", scene);
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
        if (staticmesh) 
        {
            staticmesh.receiveShadows = true;
            staticmesh.checkCollisions = true;
        }
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
        this.platform = platform1;

        var emissiveMat = new StandardMaterial("glow",scene);
        emissiveMat.emissiveColor = Color3.Yellow();

        var fireball = MeshBuilder.CreateSphere("ball platform", { diameter: 0.5 }, scene);
        fireball.material = emissiveMat;
        // this.fireball.position.x = 4;
        fireball.position.y = 6;
        fireball.isVisible = true;
        fireball.checkCollisions = false;
        scene.beginDirectAnimation(fireball, [this.ani.Slide],0, 4 * this.ani.frameRate, true);

        this.applyGL(fireball);


        //shadows setting
        platform1.receiveShadows = true;
        this.shadowGenerator.getShadowMap()?.renderList?.push(platform1);
        return fireball;
    }

    updateObjects(v:Vector3)
    {
        this.fireball.position.x = v.x;
        this.fireball.position.z = v.z;
        this.platform.position.x = v.x;
        this.platform.position.z = v.z;
    }

}
