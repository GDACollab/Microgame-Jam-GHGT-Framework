import {OptionsManager} from "./optionsmanager.js"
import {Selectable, MenuVector, MenuVectorField} from "./menulib.js"

// Handles the creation of the main menu and transition elements.
// Also handles actual control of the main menu elements.
class ElementCreator {
    constructor(elementId, iniObj, className, srcDir){
        this._element = document.getElementById(elementId);
        this._iniObj = iniObj;
        this._className = className;
        this._srcDir = srcDir;
        this.elements = [];
        
        if (this._srcDir !== "") {
            this._srcDir += "/";
        }
    }
    drawElements(){
        var elementsToSearch = Object.entries(this._iniObj);

        for (var i = 0; i < elementsToSearch.length; i++) {
            var elementName = elementsToSearch[i][0];
            var element = elementsToSearch[i][1];

            // If it's actually an element:
            if (typeof element === "object" && ("img" in element || "text" in element)) {
                var offset = [0, 0, 0];
                if ("offset" in element) {
                    offset = element.offset.replace(/\(|\)/, "").split(",");
                    offset.forEach(function(o, i){
                        offset[i] = parseInt(o);
                    });
                }
                var newElement;
                if ("img" in element) {
                    newElement = document.createElement("img");
                    newElement.src = "jam-version-assets/art/" + this._srcDir + element.img;
                    newElement.draggable = false;
                } else if ("text" in element) {
                    newElement = document.createElement("p");
                    newElement.innerHTML = markdown.render(element.text);
                }

                newElement.className = this._className;
                newElement.id = elementName;
                
                
                newElement.style = `position: absolute; left: ${offset[0]}px; top: ${offset[1]}px; z-index: ${offset[2]};`;

                if ("div" in element) {
                    var div = document.getElementById(element.div);
                    div ??= document.createElement("div");
                    div.id = element.div;
                    div.className = this._className;
                    // So we can apply z-index:
                    div.style = `position: absolute; z-index: ${offset[2]}; top: 0; left: 0;`;
                    div.appendChild(newElement);

                    if (div.parentElement === null) {
                        this._element.appendChild(div);
                    }
                } else {
                    this._element.appendChild(newElement);
                }
                
                this.elements.push(newElement);

                var timesToDupe = 0;

                if ("count" in element) {
                    timesToDupe = parseInt(element.count) - 1;
                }

                var id = newElement.id;

                for (var j = 0; j < timesToDupe; j++){
                    var dupe = newElement.cloneNode();
                    dupe.id = id + j;
                    if ("individualDiv" in element) {
                        var dupeDiv = newElement.parentNode.cloneNode();
                        var dupeDivId = newElement.parentNode.id;
                        dupeDiv.id = dupeDivId + j;
                        newElement.parentNode.parentNode.appendChild(dupeDiv);
                        dupeDiv.appendChild(dupe);
                    } else {
                        newElement.parentNode.appendChild(dupe);
                    }
                    this.elements.push(dupe);
                }
            }
        }
    }
}

class MicrogameJamMenu {
    #currMenu = "main";
    #destMenu;
    #Controller;
    #inputReader;
    #optionsManager;

    constructor(Controller){
        this.#Controller = Controller;
        if (!(ini["Transitions"].debug === "win" || ini["Transitions"].debug === "lose")){
            this.#initMainMenu();
        }
        this.#initTransitions();

        this.#inputReader = new MicrogameJamMenuInputReader();
        this.#optionsManager = new OptionsManager(this.#Controller);
    }

    addSelectable(selectable) {
        this.#inputReader.addSelectable(selectable);
    }
    
    #textY = 0;
    #creditsInputsDrawn = false;
    #optionsSetUp = false;

    #menuMapping = {
        "credits": {
            shouldLoop: function(time, animationObj){
                if (!this.#creditsInputsDrawn && animationObj.currFrame.index === 3) {
                    this.#inputReader.resetMenuInputs();
                    if (this.#inputReader.selectableElements.length > 0){
                        this.#creditsInputsDrawn = true;
                    }
                }
                return this.#currMenu === "credits";
            },
            backCallback: this.transitionTo.bind(this, "main")
        },
        "options": {
            backCallback: this.transitionTo.bind(this, "main"),
            shouldLoop: function() {
                if(!this.#optionsSetUp) {
                    this.#optionsSetUp = true;
                }
            },
            onFinish: function() {
                this.#optionsManager.startManagingOptions();
                this.#optionsSetUp = false;
            }
        },
        "main": {
            onFinish: function(){
                if (this.#currMenu === "credits"){
                    this.#creditsInputsDrawn = false;
                    document.getElementById("credits-text").style.setProperty("--text-y", 0);
                    this.#textY = 0;
                    this.#Controller.GameAnimation.stopAllKeyframedAnimationOf(`CCSSGLOBALmainTocredits`);
                }
                this.#currMenu = "main";
            },
            shouldLoop: function(){
                if (this.#currMenu === "credits"){
                    this.#textY -= 150;
                    document.getElementById("credits-text").style.setProperty("--text-y", this.#textY);
                }
                return false;
            }
        }
    };

    transitionTo(menu){
        var animName = `CCSSGLOBAL${this.#currMenu}To${menu}`;

        if (menu !== "main"){
            document.getElementById("backButton").onclick = this.#menuMapping[menu].backCallback;
        }

        // Are we currently heading AWAY from the main menu, or are we currently at the main menu?
        if (this.#currMenu === "main" || menu === "main"){
            this.#destMenu = menu;
            
            // We don't want to set the main menu to immediately clear because we want to wait for transitions to play out.
            if (this.#destMenu !== "main"){
                this.#currMenu = menu;
            }

            // Reset animation:
            this.#Controller.GameAnimation.stopAllKeyframedAnimationOf(animName);
            var menuMapping = this.#menuMapping;
            var destMenu = this.#destMenu;
            this.#Controller.GameAnimation.playKeyframedAnimation(animName, {
                keepAnims: this.#destMenu !== "main",
                shouldLoop: function(time, animationObj) {
                    if ("shouldLoop" in menuMapping[destMenu]){
                        return menuMapping[destMenu].shouldLoop.call(this, time, animationObj);
                    } else {
                        return false;
                    }
                }.bind(this),
                onFinish: function(){
                    if ("onFinish" in menuMapping[destMenu]) {
                        menuMapping[destMenu].onFinish.call(this);
                    }
                    this.#inputReader.resetMenuInputs();
                }.bind(this)
            });
        }
    }

    #initMainMenu() {
        var mainMenu = new ElementCreator("menu", ini["Menu"], "menu-art", "");
        mainMenu.drawElements();
    
        var credits = new ElementCreator("menu", ini["Credits"], "credits", "");
        credits.drawElements();
    
        document.getElementById("creditsButton").onclick = this.transitionTo.bind(this, "credits");
        document.getElementById("optionsButton").onclick = this.transitionTo.bind(this, "options");
    }

    #initTransitions(){
        var defaultTransition = new ElementCreator("transitionContainer", ini["Transitions"], "transition-art", "transitions");
        defaultTransition.drawElements();
    
        var intactLives = new ElementCreator("transitionLives", ini["Transitions"]["Lives"], "lives-transition-art", "transitions");
        intactLives.drawElements();
    
        var lostLives = new ElementCreator("transitionLives", ini["Transitions"]["Lives"]["Lost"], "lost-lives-transition-art", "transitions");
        lostLives.drawElements();
    
        var winTransition = new ElementCreator("winTransition", ini["Transitions"]["Win"], "win-transition-art", "transitions/win");
        winTransition.drawElements();
    
        var loseTransition = new ElementCreator("loseTransition", ini["Transitions"]["Lose"], "lose-transition-art", "transitions/lose");
        loseTransition.drawElements();
    }
}

class MicrogameJamMenuInputReader {

    #selectableElements = [];

    constructor() {
        this.#setUpMenuInputs();
        document.body.addEventListener("keydown", this.#readMenuInputs.bind(this));
        document.body.addEventListener("mousemove", function(){
            document.body.style.cursor = "inherit";
            if (this.#selectedElement !== -1){
                this.#clearSelect();
                this.#selectedElement = -1;
            }
        }.bind(this));
    }

    #selectablesToAdd = [];

    addSelectable(selectable) {
        this.#selectablesToAdd.push(selectable);
    }

    get selectableElements(){
        return this.#selectableElements;
    }

    #selectableVectorField;

    #setUpMenuInputs() {
        var menu = document.getElementById("menu");
        this.#selectableElements = Selectable.generateSelectablesArr(menu);
        this.#selectableElements.push(...this.#selectablesToAdd);
        this.#selectablesToAdd = [];

        this.#selectableVectorField = new MenuVectorField(this.#selectableElements, 0);

        if (this.#selectedElement !== -1) {
            this.#selectedElement = 0;
            this.#selectElement(new MenuVector(0, 0));
        }
    }

    resetMenuInputs() {
        this.#clearSelect();
        this.#setUpMenuInputs();
    }

    #clearSelect() {
        this.#selectableElements.forEach(function(e){
            e.clearSelect();
        });
    }

    #selectElement(direction){
        if (this.#selectableElements.length === 0){
            return;
        }

        // Does the selected element want to override our controls?
        if (this.#selectableElements[this.#selectedElement].selectElement instanceof Function) {
            // Don't do anything else if the element is still considered "selected".
            if (this.#selectableElements[this.#selectedElement].selectElement(direction)) {
                return;
            }
        }
        
        var pick = this.#selectableVectorField.getFromDir(direction);
        if (pick !== -1){
            this.#selectedElement = pick;
        } else if (this.#selectedElement === -1) {
            this.#selectedElement = 0;
        }

        
        this.#selectableElements[this.#selectedElement].select();
    }

    #selectedElement = -1;
    #isInMenu = true;

    #readMenuInputs(ev) {
        if (this.#isInMenu) {
            ev.preventDefault();
        }
        if (this.#selectedElement === -1) {
            document.body.style.cursor = "none";
            this.#selectedElement = 0;
            this.#selectElement(new MenuVector(0, 0));
            return;
        }
        if (ev.key === " ") {
            this.#selectableElements[this.#selectedElement].click();
            return;
        }
        this.#clearSelect();
        var dir = [0, 0];
        if (ev.key === "ArrowLeft") {
            dir[0] = -1;
        } else if (ev.key === "ArrowRight") {
            dir[0] = 1;
        }
        if (ev.key === "ArrowDown") {
            dir[1] = 1;
        } else if (ev.key === "ArrowUp") {
            dir[1] = -1;
        }
        this.#selectElement(new MenuVector(dir));
    }
}

export {MicrogameJamMenu, Selectable};