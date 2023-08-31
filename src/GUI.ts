import * as GUI from "@babylonjs/gui";
export default class UI {
    advancedTexture:GUI.AdvancedDynamicTexture;
    countButton:GUI.Button;
    count:number = 0;
    constructor()
    {
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        this.createInstruction();
        this.countButton = this.createCountButton();
    }

    createInstruction()
    {
        var instructions = new GUI.TextBlock();
        instructions.text = "Move WASD /Fire F /Camera Switch C /Jump SPACE";
        instructions.color = "white";
        instructions.fontSize = 16;
        instructions.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        instructions.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.advancedTexture.addControl(instructions);

        var style = this.advancedTexture.createStyle();
        style.fontSize = 24;
        style.fontStyle = "bold";

        var hint = new GUI.TextBlock();
        hint.text = "When you get lost, fire your head to guide you!";
        hint.color = "white";
        // hint.fontSize = 18;
        hint.top = 10;
        hint.left = 10;
        hint.style = style;
        hint.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        hint.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(hint);
    
    }

    createCountButton()
    {
        var button = GUI.Button.CreateSimpleButton("button", "UFO Destroyed: 0");
        button.top = "15px";
        button.left = "-15px";
        button.width = "250px";
        button.height = "50px";
        button.cornerRadius = 20;
        button.thickness = 4;
        button.children[0].color = "#DFF9FB";
        button.children[0].fontSize = 24;
        button.color = "#FF7979";
        button.background = "#007900";

        button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
    
        // var clicks = 0;
        // button.onPointerClickObservable.add(function () {
        //     clicks++;
        //     if (clicks % 2 == 0) {
        //     button.background = "#EB4D4B";
        //     } else {
        //     button.background = "#007900";
        //     }
        //     button.children[0].text = "UFO Destroyed: " + clicks;
        // });
    
        this.advancedTexture.addControl(button); 
        
        return button;
    }
    updateCount(){
        this.countButton.children[0].text = "UFO Destroyed: " + (++this.count); 
    }
}