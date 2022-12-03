import {OptionsManager} from "./optionsmanager.js"

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
    
    #textY = 0;
    #creditsInputsDrawn = false;

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
            backCallback: this.transitionTo.bind(this, "main")
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
            var self = this;
            this.#Controller.GameAnimation.playKeyframedAnimation(animName, {
                keepAnims: this.#destMenu !== "main",
                shouldLoop: function(time, animationObj) {
                    if ("shouldLoop" in menuMapping[destMenu]){
                        return menuMapping[destMenu].shouldLoop.bind(self, time, animationObj)();
                    } else {
                        return false;
                    }
                },
                onFinish: function(){
                    if ("onFinish" in menuMapping[destMenu]) {
                        menuMapping[destMenu].onFinish.bind(self)();
                    }
                    self.#inputReader.resetMenuInputs();
                }
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

class MenuVector {
    constructor(arr) {
        this.x = arr[0];
        this.y = arr[1];
    }
    dot(otherVector){
        return this.x * otherVector.x + this.y * otherVector.y;
    }
    dist(otherVector) {
        return Math.sqrt(Math.pow(this.x - otherVector.x, 2) + Math.pow(this.y - otherVector.y, 2));
    }
    sub(otherVector) {
        return new MenuVector([this.x - otherVector.x, this.y - otherVector.y]); 
    }
    normalized() {
        var size = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        return new MenuVector([this.x/size, this.y/size]);
    }
}

class MicrogameJamMenuInputReader {

    #selectableElements = [];

    constructor() {
        this.#setUpMenuInputs();
        document.body.addEventListener("keydown", this.#readMenuInputs.bind(this));
        document.body.addEventListener("mousemove", function(){
            if (this.#selectedElement !== -1){
                this.#clearSelect();
                this.#selectedElement = -1;
            }
        }.bind(this));
    }

    get selectableElements(){
        return this.#selectableElements;
    }
    
    // Based on the stuff I did for the twine extension.

    #selectElementRecurse(element, positionDat){
        if (element instanceof Element === false){
            return;
        }
        var computedStyle = window.getComputedStyle(element);
        var posLeft = positionDat[0] + element.offsetLeft;
        var posTop = positionDat[1] + element.offsetTop;

        // Is the HTML element positioned within the bounds of the frame?
        var isWithinBounds = posLeft >= 0 && posLeft <= 960 && posTop >= 0 && posTop <= 540;
        
        // Next, does the CSS contribute to the position at all?
        // Assumes transforms only:
        var translateMatrix = computedStyle.transform.replace(")", "").split(",");
        var left = parseInt(translateMatrix[4]);
        var top = parseInt( translateMatrix[5]);
        var isWithinCSSBounds = false;
        if (!isNaN(left) && !isNaN(top)){
            isWithinCSSBounds = posLeft + left >= 0 && posLeft + left <= 960 && posTop + top >= 0 && posTop + top <= 540;
        } else if (computedStyle.transform === "none" && isWithinBounds) { // If no transform is set, we assume that the element's position is based solely on posLeft and posTop.
            isWithinCSSBounds = true;
        }

        var newSum = [posLeft, posTop];
        if ((isWithinCSSBounds) && computedStyle.display !== "none" && computedStyle.visibility !== "hidden" && computedStyle.cursor === "pointer"){
            this.#selectableElements.push(element);
            element.totalOffset = newSum;
        } else {
            for (var c in element.children){
                var child = element.children[c];
                this.#selectElementRecurse(child, newSum);
            }
        }
    }

    #setUpMenuInputs() {
        var menu = document.getElementById("menu");
        var pos = [0, 0];
        this.#selectElementRecurse(menu, pos);
        if (this.#selectedElement !== -1) {
            this.#selectedElement = 0;
            this.#selectElement([0, 0]);
        }
    }

    resetMenuInputs() {
        this.#selectableElements.forEach(function(e){
            e.classList.remove("hover");
        });
        this.#selectableElements = [];
        this.#setUpMenuInputs();
    }

    #clearSelect() {
        this.#selectableElements[this.#selectedElement].classList.remove("hover");
    }

    #selectElement(direction){
        if (this.#selectableElements.length === 0){
            return;
        }
        if (direction[0] !== 0 || direction[1] !== 0) {
            var oldSelect = this.#selectedElement;
            this.#selectedElement = -1;

            var closestDist = -1;
            var dirVec = new MenuVector(direction);
            var currElement = this.#selectableElements[oldSelect];
            var currElementVec = new MenuVector(currElement.totalOffset);

            this.#selectableElements.forEach(function(e, index){
                if (index !== oldSelect) {
                    var searchLoc = new MenuVector(e.totalOffset);
                    var searchVec = searchLoc.sub(currElementVec);

                    var dist = dirVec.dist(searchLoc.normalized());
                    var dot = dirVec.dot(searchVec);
                    if (dot > 0.5 && (dist < closestDist || closestDist === -1)) {
                        closestDist = dist;
                        this.#selectedElement = index;
                    }
                }
            }, this);

            if (this.#selectedElement === -1) {
                this.#selectedElement = oldSelect;
            }
        }
        this.#selectableElements[this.#selectedElement].classList.add("hover");
    }

    #selectedElement = -1;

    #readMenuInputs(ev) {
        if (this.#selectedElement === -1) {
            this.#selectedElement = 0;
            this.#selectElement([0, 0]);
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
        this.#selectElement(dir);
    }
}

export {MicrogameJamMenu};