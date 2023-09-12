import * as GUI from "@babylonjs/gui";
export default class UI {
    advancedTexture:GUI.AdvancedDynamicTexture;
    countButton:GUI.Button;
    count:number = 0;

    //Mobile
    public isMobile: boolean = false;
    public jumpBtn: GUI.Button;
    public dashBtn: GUI.Button;
    public tossBtn: GUI.Button;
    public leftBtn: GUI.Button;
    public rightBtn: GUI.Button;
    public upBtn: GUI.Button;
    public downBtn: GUI.Button;
    constructor()
    {
        this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        if(this.advancedTexture.layer) this.advancedTexture.layer.layerMask = 0x10000000;
        
        this.countButton = this.createCountButton();
        this.createHint();

        //Check if Mobile, add button controls
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            this.isMobile = true; // tells inputController to track mobile inputs
            // console.log("detected mobile");
            //--ACTION BUTTONS--
            // container for action buttons (right side of screen)
            const actionContainer = new GUI.Rectangle();
            actionContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            actionContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            actionContainer.height = 0.4;
            actionContainer.width = 0.2;
            actionContainer.left = "-2%";
            actionContainer.top = "-2%";
            actionContainer.thickness = 0;
            this.advancedTexture.addControl(actionContainer);

            //grid for action button placement
            const actionGrid = new GUI.Grid();
            actionGrid.addColumnDefinition(.5);
            actionGrid.addColumnDefinition(.5);
            actionGrid.addRowDefinition(.5);
            actionGrid.addRowDefinition(.5);
            actionContainer.addControl(actionGrid);

            const dashBtn = GUI.Button.CreateImageOnlyButton("dash", "./assets/texture/aBtn.png");
            dashBtn.thickness = 0;
            dashBtn.alpha = 0.8;
            dashBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.dashBtn = dashBtn;

            const jumpBtn = GUI.Button.CreateImageOnlyButton("jump", "./assets/texture/bBtn.png");
            jumpBtn.thickness = 0;
            jumpBtn.alpha = 0.8;
            jumpBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.jumpBtn = jumpBtn;

            const tossBtn = GUI.Button.CreateImageOnlyButton("toss", "./assets/texture/cBtn.png");
            tossBtn.thickness = 0;
            tossBtn.alpha = 0.8;
            tossBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.tossBtn = tossBtn;
            tossBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            tossBtn.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            tossBtn.height = 0.2;
            tossBtn.width = 0.1;
            tossBtn.left = "-2%";
            tossBtn.top = "-45%";
            tossBtn.thickness = 0;
            this.advancedTexture.addControl(tossBtn);

            actionGrid.addControl(dashBtn, 0, 1);
            actionGrid.addControl(jumpBtn, 1, 0);


            //--MOVEMENT BUTTONS--
            // container for movement buttons (section left side of screen)
            const moveContainer = new GUI.Rectangle();
            moveContainer.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            moveContainer.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
            moveContainer.height = 0.4;
            moveContainer.width = 0.4;
            moveContainer.left = "2%";
            moveContainer.top = "-2%";
            moveContainer.thickness = 0;
            this.advancedTexture.addControl(moveContainer);

            //grid for placement of arrow keys
            const grid = new GUI.Grid();
            grid.addColumnDefinition(.4);
            grid.addColumnDefinition(.4);
            grid.addColumnDefinition(.4);
            grid.addRowDefinition(.5);
            grid.addRowDefinition(.5);
            moveContainer.addControl(grid);

            const leftBtn = GUI.Button.CreateImageOnlyButton("left", "./assets/texture/arrowBtn.png");
            leftBtn.thickness = 0;
            leftBtn.rotation = -Math.PI / 2;
            leftBtn.color = "white";
            leftBtn.alpha = 0.8;
            leftBtn.width = 0.8;
            leftBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.leftBtn = leftBtn;

            const rightBtn = GUI.Button.CreateImageOnlyButton("right", "./assets/texture/arrowBtn.png");
            rightBtn.rotation = Math.PI / 2;
            rightBtn.thickness = 0;
            rightBtn.color = "white";
            rightBtn.alpha = 0.8;
            rightBtn.width = 0.8;
            rightBtn.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
            this.rightBtn = rightBtn;

            const upBtn = GUI.Button.CreateImageOnlyButton("up", "./assets/texture/arrowBtn.png");
            upBtn.thickness = 0;
            upBtn.alpha = 0.8;
            upBtn.color = "white";
            this.upBtn = upBtn;

            const downBtn = GUI.Button.CreateImageOnlyButton("down", "./assets/texture/arrowBtn.png");
            downBtn.thickness = 0;
            downBtn.rotation = Math.PI;
            downBtn.color = "white";
            downBtn.alpha = 0.8;
            this.downBtn = downBtn;

            //arrange the buttons in the grid
            grid.addControl(leftBtn, 1, 0);
            grid.addControl(rightBtn, 1, 2);
            grid.addControl(upBtn, 0, 1);
            grid.addControl(downBtn, 1, 1);

        }

        if(!this.isMobile) this.createInstruction();
    }

    createHint()
    {
        var style = this.advancedTexture.createStyle();
        style.fontSize = 24;
        style.fontStyle = "bold";

        var hint = new GUI.TextBlock();
        hint.text = "Fire head to guide you!";
        hint.color = "white";
        // hint.fontSize = 18;
        // hint.top = 10;
        hint.left = -10;
        hint.style = style;
        hint.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        hint.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
        this.advancedTexture.addControl(hint);
    }

    createInstruction()
    {
        var instructions = new GUI.TextBlock();
        instructions.text = "Move WASD /Fire F /Camera Switch C /Carrier Switch G/Jump SPACE";
        instructions.color = "white";
        instructions.fontSize = 16;
        instructions.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        instructions.textVerticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.advancedTexture.addControl(instructions);
    
    }

    createCountButton()
    {
        var button = GUI.Button.CreateSimpleButton("button", "UFO Destroyed: 0");
        button.top = "30px";
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
    debugINFO(n:number)
    {
        this.countButton.children[0].text = "debug:"+n;
    }
}