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

    constructor(Controller){
        this.#Controller = Controller;
        if (!(ini["Transitions"].debug === "win" || ini["Transitions"].debug === "lose")){
            initMainMenu();
        }
        initTransitions();
    }
    
    #textY = 0;

    #menuMapping = {
        "credits": {
            shouldLoop: function(){
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
                    document.getElementById("credits-text").style.setProperty("--text-y", 0);
                }
                this.#currMenu = "main";
            },
            shouldLoop: function(){
                if (this.#destMenu === "credits"){
                    this.#textY -= 150;
                    document.getElementById("credits-text").style.setProperty("--text-y", textY);
                }
                return false;
            }
        }
    };

    transitionTo(menu){
        this.#textY = 0;

        var animName = `CCSSGLOBAL${this.#currMenu}To${menu}`;

        if (menu !== "main"){
            document.getElementById("backButton").onclick = this.#menuMapping[this.#currMenu].backCallback;
        }

        // Are we currently heading AWAY from the main menu, or are we currently at the main menu?
        if (this.#currMenu === "main" || this.#menu === "main"){
            this.#destMenu = menu;
            
            // We don't want to set the main menu to immediately clear because we want to wait for transitions to play out.
            if (this.#destMenu !== "main"){
                this.#currMenu = menu;
            }

            // Reset animation:
            this.#Controller.GameAnimation.stopAllKeyframedAnimationOf(animName);
            this.#Controller.GameAnimation.playKeyframedAnimation(animName, {
                keepAnims: true,
                shouldLoop: function() {
                    if ("shouldLoop" in this.#menuMapping[this.#currMenu]){
                        return this.#menuMapping[this.#currMenu].shouldLoop();
                    } else {
                        return false;
                    }
                },
                onFinish: function(){
                    if ("onFinish" in this.#menuMapping[this.#currMenu]) {
                        this.#menuMapping[this.#currMenu].onFinish();
                    }
                }
            });
        }
    }

    initMainMenu() {
        var mainMenu = new ElementCreator("menu", ini["Menu"], "menu-art", "");
        mainMenu.drawElements();
    
        var credits = new ElementCreator("menu", ini["Credits"], "credits", "");
        credits.drawElements();
    
        document.getElementById("creditsButton").onclick = this.transitionTo.bind("credits");
        document.getElementById("optionsButton").onclick = this.transitionTo.bind("options");
    }

    initTransitions(){
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

export {MicrogameJamMenu};