import {PicoInterface} from "./lib/picointerface.js";
export {GameLoader, GameLoaderAnimator};

class GameLoader {
    #debug_index = 0;
    #gameLoaded = false;
    #enabledGames = new Set();

    #gamesList;
    #gamesConfig;
    #gameNames;
    #Controller;

    constructor(Controller) {
        this.#Controller = Controller;

        // Add games to be loaded here (CONFIG_FILE adds stuff automatically):
        this.#gamesList = ini["Games"];
        this.#gamesConfig = ini["GamesConfig"];
        this.#gameNames = ini["GameNames"];

        // Since each item in GamesConfig is a list of games:
        for (var key in this.#gamesConfig) {
            this.#gamesConfig[key] = this.#gamesConfig[key].split(",");
        }

        var gamesSelect = document.getElementById("options-select-games");
        Object.keys(this.#gameNames).forEach((game) => {
            var p = document.createElement("p");
            this.#enabledGames.add(game);
            var check = document.createElement("input");
            var gameName = this.#gameNames[game];
            check.type = "checkbox";
            check.id = game + "enable";
            check.checked = true;
            check.name = game + "enable";
            var label = document.createElement("label");
            label.innerText = gameName;
            // We want to be able to click each game to set individual settings.
            // label.htmlFor = game + "enable";
            p.appendChild(check);
            p.appendChild(label);
            gamesSelect.appendChild(p);
        });

        document.getElementById("game").onload = this.#iframeLoaded;
    }

    // TODO: Make game picking more robust, add difficulty increases, etc.
    transition(didWin){
        this.#gameLoaded = false;

        // Because Twine saves things to the session:
        sessionStorage.removeItem("Saved Session");

        // Difficulty change:
        var difficulty = 1;
        if (DEBUG_DIFFICULTY >= 1 && DEBUG_DIFFICULTY <= 3 && Number.isInteger(DEBUG_DIFFICULTY)) {
            difficulty = DEBUG_DIFFICULTY;
        } else {
            difficulty = 1;
        }
        
        
        var transitionName = (didWin)? "win" : "lose";

        this.#Controller.GameSound.play(transitionName + "Jingle", masterVolume * 0.8, true);

        GameLoaderAnimator.animateTransition(transitionName);

        // Return difficulty to the GameInterface:
        return difficulty;
    }

    pickGameToLoad() {
        var gameToLoad = Object.keys(this.#gamesList)[Math.floor(Math.random() * Object.keys(this.#gamesList).length)]
        if (DEBUG_TEST !== "") {
            if (DEBUG_TEST === "sequential"){
                document.body.onkeyup = function(event){
                    if (event.key === "1") {
                        debug_index++;
                        transition(true, function(){});
                    }
                }
                gameToLoad = Object.keys(this.#gamesList)[debug_index];
                debug_index++;
                if (debug_index > Object.keys(this.#gamesList).length) {
                    debug_index = 0;
                }
            } else {
                gameToLoad = DEBUG_TEST;
            }
            
            console.log("DEBUG TESTING: " + gameToLoad + " - " + this.#gamesList[gameToLoad]);
        }
        return gameToLoad;
    }

    loadGame(gameToLoad){
        let gameURL = "./jam-version-assets/games/" + gameToLoad + "/" + this.#gamesList[gameToLoad];
        document.getElementById("game").src = gameURL;
        this.currGame = gameToLoad;
    }
    
    gameStarted(){
        document.getElementById("game").removeAttribute("hidden");
        document.getElementById("timer").removeAttribute("hidden");
        this.#gameLoaded = true;
    }

    startLoadingMicrogames() {
        this.#gameLoaded = false;
        GameLoaderAnimator.animateTransition.bind(this, "win")();
    }

    #iframeLoaded() {
        // Click on the iframe so inputs get through:
        document.getElementById("game").contentWindow.dispatchEvent(new MouseEvent("click"));
        document.getElementById("game").contentWindow.focus();

        // For Unity Exports specifically (minimal Unity HTML templates work good enough, except for when it adds margin):
        document.getElementById("game").contentDocument.body.style.margin = "0";
        if (PicoInterface.isPicoRunning()){
            var picoInterface = new PicoInterface();
            picoInterface.interfaceWithPico();
        }
    }
};

// Purely for organization. Use .bind(this) when calling from the GameLoader.
class GameLoaderAnimator {
    static animateTransition(transitionName) {
        document.getElementById("timer").setAttribute("hidden", "");
        document.getElementById("transitionContainer").removeAttribute("hidden");
        document.getElementById(transitionName + "Transition").removeAttribute("hidden");

        let gameToLoad = this.pickGameToLoad();

        var playTransitionPriorLoaded = false;

        var numLives = this.#Controller.GameInterface.getLives();
        if (transitionName === "lose") {
            // This is used purely for animation, so if we've lost a life, we add one to show the losing animation.
            numLives++;
        }

        GameLoaderAnimator.setUpLifeCounter.bind(this, numLives, transitionName === "lose")();

        this.#Controller.GameAnimation.playKeyframedAnimation("CCSSGLOBAL" + transitionName + "Animation", {
            shouldLoop: function(timestamp, animationObj){
                // Should we load when we're looping? If yes, we have to actually wait until we're looping.
                if (this.#gamesConfig["play-transition-prior"].includes(gameToLoad) && !playTransitionPriorLoaded && "loop" in animationObj.timeline.get(animationObj.currKeyframePlaying)) {
                    playTransitionPriorLoaded = true;
                    this.#Controller.GameLoader.loadGame(gameToLoad);
                }
                // Loop while our game isn't ready to start.
                return this.#gameLoaded === false; 
            },
            onFinish: function () {
                document.getElementById(transitionName + "Transition").setAttribute("hidden", "");
                document.getElementById("transitionContainer").setAttribute("hidden", "");
                GameLoaderAnimator.removeLives(numLives, transitionName === "lose");
            }
        });

        if (!(this.#gamesConfig["play-transition-prior"].includes(gameToLoad))) {
            loadGame(gameToLoad);
        }
    }

    static setUpLifeCounter(numLives, lostLife) {
        for (var i = 0; i < numLives; i++) {
            document.getElementById("intactLifeDiv" + ((i > 0)? (i - 1) : "")).classList.add("active-lives");
        }

        var lostLifeDiv = document.getElementById("lostLifeDiv");
        var currPar = lostLifeDiv.parentNode;
        lostLifeDiv.parentNode.removeChild(lostLifeDiv);
        
        if (lostLife) {
            document.getElementById("intact-life" + ((numLives > 1) ? (numLives - 2) : "")).style.display = "none";

            var div = document.getElementById("intactLifeDiv" + ((numLives > 1) ? (numLives - 2) : ""));
            div.appendChild(lostLifeDiv);
            
            // You can manually set delays in the CCSS animation itself:
            this.#Controller.GameAnimation.playKeyframedAnimation("CCSSGLOBALloseLife", {
                keepAnims: true
            });
        } else {
            currPar.appendChild(lostLifeDiv);
        }
    }

    static removeLives(numLives, lostLife) {
        document.querySelectorAll(".active-lives").forEach(function(element){
            element.classList.remove("active-lives");
        });

        if (lostLife){
            document.getElementById("intact-life" + ((numLives > 1) ? (numLives - 2) : "")).style.display = "inherit";
        }
    }
};