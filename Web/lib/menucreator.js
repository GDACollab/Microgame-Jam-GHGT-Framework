var state = "Main";

class ElementCreator {
    constructor(elementId, iniObj, className, srcDir){
        this._element = document.getElementById(elementId);
        this._iniObj = iniObj;
        this._className = className;
        this._srcDir = srcDir;
        this.elements = [];
    }
    drawElements(){
        for (var elementName in this._iniObj) {
            var element = this._iniObj[elementName];

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
                    newElement.src = "jam-version-assets/art/" + this._srcDir + "/" + element.img;
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
                    div.appendChild(newElement);

                    if (div.parentElement === null) {
                        this._element.appendChild(div);
                    }
                } else {
                    this._element.appendChild(newElement);
                }
                this.elements.push(newElement);
            }
        }
    }
}

var currMenu = "main";

function transitionToCredits() {
    if (currMenu !== "credits"){
        GameAnimation.playKeyframedAnimation("CCSSGLOBALmainToCredits", {
            keepAnims: true
        });
    }
}

function initMainMenu(){
    var mainMenu = new ElementCreator("menu", ini["Menu"], "menu-art", "");
    mainMenu.drawElements();

    var credits = new ElementCreator("menu", ini["Credits"], "credits", "");
    credits.drawElements();

    document.getElementById("playButton").onclick = startMicrogames;
    document.getElementById("creditsButton").onclick = transitionToCredits;
}

function initTransitions(){
    var defaultTransition = new ElementCreator("transitionContainer", ini["Transitions"], "transition-art", "transitions");
    defaultTransition.drawElements();

    // TODO: Fix this, it doesn't work for lives:
    var livesTransition = new ElementCreator("transitionContainer", ini["Transitions"]["Lives"], "lives-transition-art", "transitions");
    livesTransition.drawElements();

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