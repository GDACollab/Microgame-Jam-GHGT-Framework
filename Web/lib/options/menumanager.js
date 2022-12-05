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

    addSelectableElement(element) {
        this.#inputReader.addSelectable(element);
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
                    this.#optionsManager.startManagingOptions();
                    this.#optionsSetUp = true;
                }
            },
            onFinish: function() {
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

class MenuVector {
    #x;
    #y;
    constructor() {
        if (arguments[0] instanceof Array) {
            this.#x = arr[0];
            this.#y = arr[1];
        } else if (arguments[0] instanceof MenuVector) {
            this.#x = arguments[0].x;
            this.#y = arguments[0].y;
        } else if (arguments[0] instanceof Number && arguments[1] instanceof Number) {
            this.#x = arguments[0];
            this.#y = arguments[1];
        } else {
            console.error("Cannot create vector with arguments " + arguments);
        }
    }
    get x() {
        return this.#x;
    }
    get y() {
        return this.#y;
    }

    dot(otherVector){
        return this.x * otherVector.x + this.y * otherVector.y;
    }
    dist(otherVector) {
        return Math.sqrt(Math.pow(this.x - otherVector.x, 2) + Math.pow(this.y - otherVector.y, 2));
    }
    // It is literally stupid that Javascript doesn't allow overloading of basic operations. WTF, Brendan Eich of Netscape.
    // What were you thinking.
    // Oh, you know what might be cool though? Without thinking about any security vulnerabilities this might pose  (probably why it'll be a bad idea):
    // Being able to set your own shorthand for macros in the script. Like .= for calling the dot product on a vector or something.
    add() {
        if (arguments[0] instanceof MenuVector) {
            this.#x += otherVector.x;
            this.#y += otherVector.y;
        } else if (arguments[0] instanceof Number && arguments[1] instanceof Number) {
            this.#x += arguments[0];
            this.#y += arguments[1];
        } else {
            console.error("Cannot add vector with arguments " + arguments);
        }
        return this;
    }
    sub(otherVector) {
        if (arguments[0] instanceof MenuVector) {
            this.#x -= otherVector.x;
            this.#y -= otherVector.y;
        } else if (arguments[0] instanceof Number && arguments[1] instanceof Number) {
            this.#x -= arguments[0];
            this.#y -= arguments[1];
        } else {
            console.error("Cannot sub vector with arguments " + arguments);
        }
        return this;
    }
    normalized() {
        var size = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        this.#x /= size;
        this.#y /= size;
        return this;
    }

    static add(vec1, vec2) {
        return new MenuVector(vec1.x + vec2.x, vec1.y + vec2.y);
    }
    static sub(vec1, vec2) {
        return new MenuVector(vec1.x - vec2.x, vec1.y - vec2.y);
    }
    static normalized(vec) {
        var size = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
        return new MenuVector(vec.x/size, vec.y/size);
    }
}

class Selectable {
    constructor(baseElement, existingPosition = null) {
        this.element = baseElement;
        if (existingPosition !== null) {
            this.position = new MenuVector(existingPosition.x + this.element.offsetLeft, existingPosition.y + this.element.offsetTop);
        } else {
            this.findPosition();
        }
    }
    
    findPosition(){
        this.position = new MenuVector(this.element.offsetLeft, this.element.offsetTop);
        var par = this.element.parentElement;
        while (par !== null) {
            this.position.add(par.offsetLeft, par.offsetTop);
            par = par.parentElement;
        }
    }

    isWithinBounds(){
        var computedStyle = window.getComputedStyle(this.element);

        // Is the HTML element positioned within the bounds of the frame?
        var isWithinBounds = this.position.x >= 0 && this.position.x <= SCREEN_WIDTH && this.position.y >= 0 && this.position.y <= SCREEN_HEIGHT;
        
        // Next, does the CSS contribute to the position at all?
        // Assumes transforms only:
        var translateMatrix = computedStyle.transform.replace(")", "").split(",");
        var left = parseInt(translateMatrix[4]);
        var top = parseInt( translateMatrix[5]);
        var isWithinCSSBounds = false;
        if (left instanceof Number && top instanceof Number){
            isWithinCSSBounds = this.position.x + left >= 0 && this.position.x + left <= SCREEN_WIDTH && this.position.y + top >= 0 && this.position.y + top <= SCREEN_HEIGHT;
        } else if (computedStyle.transform === "none" && isWithinBounds) { // If no transform is set, we assume that the element's position is based solely on posLeft and posTop.
            isWithinCSSBounds = true;
        }

        return isWithinCSSBounds;
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

    #selectablesToAdd = [];

    addSelectable(element) {
        this.#selectablesToAdd.push(element);
    }

    get selectableElements(){
        return this.#selectableElements;
    }
    
    // Based on the stuff I did for the twine extension.

    #selectElementRecurse(element, positionVector){
        if (element instanceof Element === false){
            return;
        }
        var select = new Selectable(element, positionVector);

        if (select.isWithinBounds() && computedStyle.display !== "none" && computedStyle.visibility !== "hidden" && computedStyle.cursor === "pointer"){
            this.#selectableElements.push(select);
        } else {
            for (var c in element.children){
                var child = element.children[c];
                this.#selectElementRecurse(child, new MenuVector(select.position));
            }
        }
    }

    #setUpMenuInputs() {
        var menu = document.getElementById("menu");
        var pos = new MenuVector(0, 0);
        this.#selectElementRecurse(menu, pos);
        if (this.#selectedElement !== -1) {
            this.#selectedElement = 0;
            this.#selectElement(new MenuVector(0, 0));
        }
        this.#selectablesToAdd = [];
    }

    resetMenuInputs() {
        this.#selectableElements.forEach(function(e){
            e.classList.remove("hover");
        });
        this.#selectableElements = [];
        this.#setUpMenuInputs();
    }

    #clearSelect() {
        this.#selectableElements[this.#selectedElement].element.classList.remove("hover");
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
                    var searchVec = MenuVector.sub(searchLoc, currElementVec);

                    var dist = dirVec.dist(MenuVector.normalized(searchLoc));
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
        this.#selectableElements[this.#selectedElement].element.classList.add("hover");
    }

    #selectedElement = -1;
    #isInMenu = true;

    #readMenuInputs(ev) {
        if (this.#isInMenu) {
            ev.preventDefault();
        }
        if (this.#selectedElement === -1) {
            this.#selectedElement = 0;
            this.#selectElement([0, 0]);
            return;
        }
        if (ev.key === " ") {
            this.#selectableElements[this.#selectedElement].element.click();
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

export {MicrogameJamMenu, Selectable};