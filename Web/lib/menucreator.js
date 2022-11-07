var state = "Main";

class ArtCreator {
    constructor(elementId, iniObj, className, srcDir){
        this._element = document.getElementById(elementId);
        this._iniObj = iniObj;
        this._className = className;
        this._srcDir = srcDir;
        this.art = [];
    }
    drawArt(){
        for (var artName in this._iniObj) {
            var art = this._iniObj[artName];

            // If it's actually art:
            if (typeof art === "object" && "img" in art) {
                var offset = [0, 0, 0];
                if ("offset" in art) {
                    offset = art.offset.replace(/\(|\)/, "").split(",");
                    offset.forEach(function(o, i){
                        offset[i] = parseInt(o);
                    });
                }
                var img = document.createElement("img");
                img.src = "jam-version-assets/art/" + this._srcDir + "/" + art.img;
                img.className = this._className;
                img.id = artName;
                
                
                img.style = `position: absolute; left: ${offset[0]}px; top: ${offset[1]}px; z-index: ${offset[2]};`;

                if ("div" in art) {
                    var div = document.getElementById(art.div);
                    div ??= document.createElement("div");
                    div.id = art.div;
                    div.className = this._className;
                    div.appendChild(img);

                    if (div.parentElement === null) {
                        this._element.appendChild(div);
                    }
                } else {
                    this._element.appendChild(img);
                }
                this.art.push(img);
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
    var mainMenu = new ArtCreator("menu", ini["Menu"], "menu-art", "");
    mainMenu.drawArt();

    document.getElementById("playButton").onclick = startMicrogames;
    document.getElementById("creditsButton").onclick = transitionToCredits;
}

function initTransitions(){
    var defaultTransition = new ArtCreator("transitionContainer", ini["Transitions"], "transition-art", "transitions");
    defaultTransition.drawArt();

    // TODO: Fix this, it doesn't work for lives:
    var livesTransition = new ArtCreator("transitionContainer", ini["Transitions"]["Lives"], "lives-transition-art", "transitions");
    livesTransition.drawArt();

    var winTransition = new ArtCreator("winTransition", ini["Transitions"]["Win"], "win-transition-art", "transitions/win");
    winTransition.drawArt();

    var loseTransition = new ArtCreator("loseTransition", ini["Transitions"]["Lose"], "lose-transition-art", "transitions/lose");
    loseTransition.drawArt();
}

function initMenus(){
    if (!(ini["Transitions"].debug === "win" || ini["Transitions"].debug === "lose")){
        initMainMenu();
    }
    initTransitions();
}