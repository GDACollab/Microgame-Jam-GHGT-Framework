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

var currMenu = "main";

function transitionToCredits() {
    if (currMenu === "main"){
        document.getElementById("backButton").onclick = creditsToMenu;
        currMenu = "credits";
        // Reset animation:
        GameAnimation.stopAllKeyframedAnimationOf("CCSSGLOBALmainToCredits");
        GameAnimation.playKeyframedAnimation("CCSSGLOBALmainToCredits", {
            keepAnims: true,
            shouldLoop: function(){
                return currMenu === "credits";
            }
        });
        document.getElementById("credits-text").style.setProperty("--text-y", 0);
    }
}

function creditsToMenu(){
    if (currMenu === "credits") {
        var textY = 0;
        GameAnimation.playKeyframedAnimation("CCSSGLOBALcreditsToMain", {
            // Kind of a hack-y workaround to get credits off the screen. shouldLoop called every frame, so it seems like the credits are hurriedly moved offscreen.
            // The animation will still be playing (it's really slow, about 30 seconds or so to show all the credits), but it will be offscreen.
            // We reset the animation if it still happens to be playing by resetting it at roughly the start of CCSSGLOBALcreditsToMain.
            shouldLoop: function(){
                textY -= 150;
                document.getElementById("credits-text").style.setProperty("--text-y", textY);
                return false;
            },
            onFinish: function(){
                currMenu = "main";
            }
        });
    }
}

function optionsToMenu() {
    if (currMenu === "options") {
        GameAnimation.playKeyframedAnimation("CCSSGLOBALoptionsToMain", {
            onFinish: function(){
                currMenu = "main";
            }
        });
    }
}

function transitionToOptions() {
    if(currMenu === "main") {
        document.getElementById("backButton").onclick = optionsToMenu;
        currMenu = "options";
        GameAnimation.playKeyframedAnimation("CCSSGLOBALmainToOptions", {
            keepAnims: true
        });
    }
}

function initMainMenu(){
    var mainMenu = new ElementCreator("menu", ini["Menu"], "menu-art", "");
    mainMenu.drawElements();

    var credits = new ElementCreator("menu", ini["Credits"], "credits", "");
    credits.drawElements();

    document.getElementById("creditsButton").onclick = transitionToCredits;
    document.getElementById("optionsButton").onclick = transitionToOptions;
}

function initTransitions(){
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

function initMenus(){
    if (!(ini["Transitions"].debug === "win" || ini["Transitions"].debug === "lose")){
        initMainMenu();
    }
    initTransitions();
}

export {initMenus};