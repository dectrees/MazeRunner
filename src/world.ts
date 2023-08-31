import { Color3, CubeTexture, DirectionalLight, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import * as GUI from "@babylonjs/gui";

export default class World {
    private scene: Scene;
    constructor(scene: Scene) {
        this.scene = scene;
        this.initWorld(scene);
    }

    private initWorld(scene:Scene) {
        // Lights
        var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
        light.intensity = 0.6;
        light.specular = Color3.Black();

        // var light2 = new DirectionalLight("dir01", new Vector3(0, -0.5, -1.0), scene);
        // light2.position = new Vector3(0, 5, 5);

        // Skybox
        var skybox = MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
        var skyboxMaterial = new StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("https://assets.babylonjs.com/textures/skybox2", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = Color3.Black()
        skyboxMaterial.specularColor = Color3.Black();
        skybox.material = skyboxMaterial;

        // GUI
        // var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        // var instructions = new GUI.TextBlock();
        // instructions.text = "Move WASD keys,  Jump Space, Fire F";
        // instructions.color = "white";
        // instructions.fontSize = 16;
        // instructions.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
        // instructions.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        // advancedTexture.addControl(instructions);

    }
}