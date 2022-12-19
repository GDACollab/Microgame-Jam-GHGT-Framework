import {PicoInterface} from "./lib/picointerface.js";
import GlobalAudioManager from "./lib/gamesound.js";
import GlobalAnimManager from "./lib/animationmanager.js";
import MainMenuManager from "./lib/options/menumanager.js";
import iniReader from "./lib/configloader.js";
// Game loader, for everything to do with transitions: playing animations, playing sounds, selecting the next game, changing difficulty.

var ini;
class GameLoader {
    #debug_index = 0;
    #gameLoaded = false;

    #gamesList;
    #gamesConfig;
    #gameNames;

    #setupPromise;
    masterVolume = 1;
    #recentGamesLoaded = [];

    constructor() {
        this.#setupPromise = new Promise(async (resolve) => {
            ini = await iniReader;
            this.#setUpGameLoader();
            resolve();
        });
    }

    #alreadyPlayedGames;
    #totalGamesPlayed = 0;

    #setUpGameLoader() {
        this.#alreadyPlayedGames = JSON.parse(localStorage.getItem("playedGames"));
        if (this.#alreadyPlayedGames === null) {
            this.#alreadyPlayedGames = [];
        }
        // Add games to be loaded here (CONFIG_FILE adds stuff automatically):
        this.#gamesList = ini["Games"];
        this.#gamesConfig = ini["GamesConfig"];
        this.#gameNames = ini["GameNames"];

        // Since each item in GamesConfig is a list of games:
        for (var key in this.#gamesConfig) {
            this.#gamesConfig[key] = this.#gamesConfig[key].split(",");
        }

        document.getElementById("game").onload = this.#iframeLoaded;
    }

    get gameNames() {
        return this.#gameNames;
    }

    // TODO: Make game picking more robust, add difficulty increases, etc.
    // Main function where all the loading actually happens.
    transition(didWin){
        localStorage.setItem("playedGames", JSON.stringify(this.#alreadyPlayedGames));
        this.picoInterface = undefined;
        this.#gameLoaded = false;

        // Because Twine saves things to the session:
        sessionStorage.removeItem("Saved Session");
        
        var transitionName = (didWin)? "win" : "lose";

        GlobalAudioManager.play(transitionName + "Jingle", this.masterVolume * 0.4, true);

        this.animateTransition(transitionName);
        // Difficulty change:
        var difficulty = 1;
        if (DEBUG_DIFFICULTY >= 1 && DEBUG_DIFFICULTY <= 3 && Number.isInteger(DEBUG_DIFFICULTY)) {
            difficulty = DEBUG_DIFFICULTY;
        } else if (this.#gameToLoad !== null) {
            if (!this.#alreadyPlayedGames.includes(this.#gameToLoad)) {
                this.#alreadyPlayedGames.push(this.#gameToLoad);
                difficulty = 1;
            } else {
                if (this.#totalGamesPlayed === 0) {
                    difficulty = 1;
                } else {
                    difficulty = Math.max(Math.min(Math.floor(0.9 * Math.log(this.#totalGamesPlayed) + 1), 3), 0);
                }
            }
        }
        this.#totalGamesPlayed++;

        // Return difficulty to the GameInterface:
        return difficulty;
    }

    pickGameToLoad() {
        var enabledGamesArr = Array.from(MainMenuManager.enabledGames.values());
        enabledGamesArr = enabledGamesArr.filter((game) => !this.#recentGamesLoaded.includes(game));
        var gameToLoad = enabledGamesArr[Math.floor(Math.random() * enabledGamesArr.length)];
        if (DEBUG_TEST !== "") {
            if (DEBUG_TEST === "sequential"){
                document.body.onkeyup = function(event){
                    if (event.key === "1") {
                        this.#debug_index++;
                        transition(true, function(){});
                    }
                }
                gameToLoad = Object.keys(this.#gamesList)[this.#debug_index];
                this.#debug_index++;
                if (this.#debug_index > Object.keys(this.#gamesList).length) {
                    this.#debug_index = 0;
                }
            } else {
                gameToLoad = DEBUG_TEST;
            }
        } else {
            this.#recentGamesLoaded.push(gameToLoad);
            if (this.#recentGamesLoaded.length >= 4) {
                this.#recentGamesLoaded.shift();
            }
        }
        console.log("DEBUG TESTING: " + gameToLoad + " - " + this.#gamesList[gameToLoad]);
        return gameToLoad;
    }

    #loadGameHTML(gameToLoad){
        let gameURL = "./jam-version-assets/games/" + gameToLoad + "/" + this.#gamesList[gameToLoad];
        document.getElementById("game").src = gameURL;
        this.currGame = gameToLoad;
    }
    #clearGameHTML() {
        document.getElementById("game").src = "about:blank";
        document.getElementById("game").contentWindow.location.href = "about:blank";
    }
    
    gameStarted(){
        document.getElementById("game").removeAttribute("hidden");
        document.getElementById("timer").removeAttribute("hidden");
        this.#gameLoaded = true;
    }

    get inGame() {
        return this.#gameLoaded;
    }

    loadUpdate() {
        if (PicoInterface.isPicoRunning()){
            this.picoInterface.picoUpdate();
        }
    }

    #iframeLoaded() {
        // For Unity Exports specifically (minimal Unity HTML templates work good enough, except for when it adds margin):
        document.getElementById("game").contentDocument.body.style.margin = "0";
        if (PicoInterface.isPicoRunning()){
            this.picoInterface = new PicoInterface();
            this.picoInterface.interfaceWithPico();
        }
    }

    #gameToLoad;
    get game() {
        return this.#gameToLoad;
    }

    // ANIMATIONS
    // -----------------------------------------------------------------------

    loseGameTransition() {
        var mainMenuDraw = false;
        this.setUpLifeCounter(1, true);
        var internalClock = performance.now();
        var gamesWon = this.#totalGamesPlayed - 3;
        GlobalAnimManager.playKeyframedAnimation("CCSSGLOBALloseAnimation", {
            shouldLoop: function(timestamp, animationObj) {
                if (!mainMenuDraw && (timestamp - internalClock) > 600){
                    mainMenuDraw = true;
                    // Unload the iframe, load the main menu:
                    document.getElementById("game").src = "about:blank";
                    document.getElementById("menu").removeAttribute("hidden");

                    document.getElementById("game-over-text").innerText = `You won ${gamesWon} games.`;

                    // Set up game over screen:
                    document.getElementById("game-over").removeAttribute("hidden");
                    GlobalAnimManager.playKeyframedAnimation("CCSSGLOBALhideMain", {keepAnims: true});
                    document.getElementById("backButton").style.transform = "translate(577px, -81px)";
                    document.getElementById("backButton").style.transformOrigin = "278% 0%";

                    document.getElementById("backButton").onclick = () => {
                        GlobalAudioManager.stop("endTheme");
                        GlobalAudioManager.play("theme", this.masterVolume * 0.2, false, true);
                        GlobalAnimManager.playKeyframedAnimation("CCSSGLOBALgameoverTomain", {
                            onFinish: function(){
                                document.getElementById("game-over").setAttribute("hidden", "");
                                MainMenuManager.resetMenuInputs();
                            }
                        });
                        document.getElementById("backButton").style.transform = "";
                        document.getElementById("backButton").style.transformOrigin = "";
                    };
                }
                return false;
            }.bind(this),
            onFinish: function() {
                document.getElementById("loseTransition").setAttribute("hidden", "");
                document.getElementById("transitionContainer").setAttribute("hidden", "");
                this.removeLives(1, true);
                GlobalAudioManager.play("endTheme", this.masterVolume * 0.2, false, true);
                MainMenuManager.isInMenu = true;
                MainMenuManager.resetMenuInputs();
            }.bind(this)
        });
        // Reset the total number of games played, but don't reset recentGamesLoaded.
        this.#totalGamesPlayed = 0;
    }

    animateTransition(transitionName) {
        GlobalAnimManager.stopAllAnimations();
        document.getElementById("timer").setAttribute("hidden", "");
        document.getElementById("transitionContainer").removeAttribute("hidden");
        document.getElementById(transitionName + "Transition").removeAttribute("hidden");

        var numLives = GameInterface.getLives();
        if (transitionName === "lose") {
            // This is used purely for animation, so if we've lost a life, we add one to show the losing animation.
            numLives++;
        }
        
        if ((transitionName === "lose" && numLives === 1) || numLives <= 0) {
            this.loseGameTransition();
            this.#gameToLoad = null;
            return;
        } else {
            this.#gameToLoad = this.pickGameToLoad();
        }

        var playTransitionPriorLoaded = false;

        this.setUpLifeCounter(numLives, transitionName === "lose");

        GlobalAnimManager.playKeyframedAnimation("CCSSGLOBAL" + transitionName + "Animation", {
            shouldLoop: function(timestamp, animationObj){
                // Should we load when we're looping? If yes, we have to actually wait until we're looping.
                if (this.#gamesConfig["play-transition-prior"].includes(this.#gameToLoad) && !playTransitionPriorLoaded && "loop" in animationObj.timeline.get(animationObj.currKeyframePlaying)) {
                    playTransitionPriorLoaded = true;
                    this.#loadGameHTML(this.#gameToLoad);
                }
                // Loop while our game isn't ready to start.
                return this.#gameLoaded === false; 
            }.bind(this),
            onFinish: function () {
                document.getElementById(transitionName + "Transition").setAttribute("hidden", "");
                document.getElementById("transitionContainer").setAttribute("hidden", "");
                this.removeLives(numLives, transitionName === "lose");
            }.bind(this)
        });

        if (!(this.#gamesConfig["play-transition-prior"].includes(this.#gameToLoad))) {
            this.#loadGameHTML(this.#gameToLoad);
        } else {
            this.#clearGameHTML();
        }
    }

    setUpLifeCounter(numLives, lostLife) {
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
            GlobalAnimManager.playKeyframedAnimation("CCSSGLOBALloseLife", {
                keepAnims: true
            });
        } else {
            currPar.appendChild(lostLifeDiv);
        }
    }

    removeLives(numLives, lostLife) {
        document.querySelectorAll(".active-lives").forEach(function(element){
            element.classList.remove("active-lives");
        });

        if (lostLife){
            document.getElementById("intact-life" + ((numLives > 1) ? (numLives - 2) : "")).style.display = "inherit";
        }
    }
};

var GlobalGameLoader = new GameLoader();

export default GlobalGameLoader;