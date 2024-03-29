import {PicoInterface} from "./lib/picointerface.js";
import GlobalAudioManager from "./lib/gamesound.js";
import GlobalAnimManager from "./lib/animationmanager.js";
import MainMenuManager from "./lib/options/menumanager.js";
import iniReader from "./lib/configloader.js";
/**
 * For loading games.
 * @file
 */
/** Game loader, for everything to do with transitions: playing animations, playing sounds, selecting the next game, changing difficulty. 
 * @module gameloader
*/

var ini;
/**
 * Runs all loading behavior. That includes:
 * Keeping track of what game to currently load
 * Transitioning into loaded games
 * Playing/animating transitions from games using the Animation Manager.
 * @class GameLoader
 */
class GameLoader {
    
    /**
     * If {@link DEBUG_TEST} is set to “sequential”, this will be used for the index of the current game played.
     */
    #debug_index = 0;
    /** Did the {@link module:gameloader~GameLoader#gameStarted|gameStarted} function get called? Set to false on {@link transition} */
    #gameLoaded = false;

    /**
     * The dictionary of games to load. 
     * Initialized in {@link module:gameloader~GameLoader#setupGameLoader|setupGameLoader}. Stores the dictionary [Games] from config.ini
     * @tutorial adding-games
     */
    #gamesList;
    /** 
     * Dictionary of games with special loading conditions. 
     * Initialized in {@link module:gameloader~GameLoader#setupGameLoader|setupGameLoader}. Stores the dictionary [Games] from config.ini
    */
    #gamesConfig;
    /** 
     * Dictionary to associate game IDs (how they’re stored in folders) with their actual names.
     * Initialized in {@link module:gameloader~GameLoader#setupGameLoader|setupGameLoader}. Stores the dictionary [Games] from config.ini
    */
    #gameNames;

    /**
     * This WAS supposed to be for loading the ini file. [configloader.js]{@link module:configloader} does this instead, so I’m pretty sure this is useless.
     */
    #setupPromise;
    
    /**
     * Set by {@link MicrogameJam} to control the overall volume of the GAME LOADER’s volume. Has no effect on the volume of the games being loaded.
     */
    masterVolume = 1;
    /** 
     * A list (should probably be a set) of the games that were recently loaded to avoid loading them again.
     * Initialized in {@link module:gameloader~GameLoader#setupGameLoader|setupGameLoader}.
     * Items are arbitrarily removed in {@link module:gameloader~GameLoader#pickGameToLoad|pickGameToLoad}.
    */
    #recentGamesLoaded = [];

    constructor() {
        this.#setupPromise = new Promise(async (resolve) => {
            ini = await iniReader;
            this.#setUpGameLoader();
            resolve();
        });
    }

    /** 
     * Uses localStorage to arbitrarily set difficulty if games are wholly new to the user. Is a list, should also probably be a set.
     * So if a game isn’t in the list in this.transition(), then the difficulty is set to 1 and the game is added to this list.
     * Initialized in {@link module:gameloader~GameLoader#setupGameLoader|setupGameLoader}.

    */
    #alreadyPlayedGames;
    /**
     * Used to set a difficulty curve. Modified in {@link module:gameloader~GameLoader#transition|transition}.
     * Look for the ridiculous max/min/floor/log monstrosity and that’s the difficulty curve.
     */
    #totalGamesPlayed = 0;

    /**
     * Initialize all the properties we need.
     * Set the iframe with ID “game” (in index.html) to call {@link module:gameloader~GameLoader#iframeLoaded} on load.
     * @alias module:gameloader~GameLoader#setupGameLoader
     * @private
     */
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

    /**
     * Public read-only accessor of {@link module:gameloader~GameLoader#gameNames}
     *
     * @readonly
     */
    get gameNames() {
        return this.#gameNames;
    }

    // 
    // 
    /**
     * Main function where all the loading actually happens.
     * Call {@link module:gameloader~GameLoader#animateTransition} according to didWin, and increase the difficulty accordingly.
     * @todo Make game picking more robust, add difficulty increases, etc.
     * @param {boolean} didWin Are we meant to treat this as a loss (false) or a win (true)?
     * @return {number} The difficulty number.
     */
    transition(didWin){
        localStorage.setItem("playedGames", JSON.stringify(this.#alreadyPlayedGames));
        /**
         * Reference to {@link module:picointerface|picointerface.js}.
         * Created if a PICO-8 game is detected in {@link module:gameloader~GameLoader#iframeLoaded}.
         * Updated in {@link module:gameloader~GameLoader#loadUpdate} if it exists.
         */
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

    /**
     * Pick a random game to load using Math.random, as long as it isn’t {@link module:gameloader~GameLoader#recentGamesLoaded}.
     */
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
            console.log("DEBUG TESTING: " + gameToLoad + " - " + this.#gamesList[gameToLoad]);
        } else {
            this.#recentGamesLoaded.push(gameToLoad);
            if (this.#recentGamesLoaded.length >= 4) {
                this.#recentGamesLoaded.shift();
            }
        }
        return gameToLoad;
    }

    /**
     * Sets the iframe with ID “game” (in index.html) to point to the new game’s .html.
     * @param {string} gameToLoad The name of the game’s folder to use.
     * @alias module:gameloader~GameLoader#loadGameHTML
     * @private
     */
    #loadGameHTML(gameToLoad){
        let gameURL = "./jam-version-assets/games/" + gameToLoad + "/" + this.#gamesList[gameToLoad];
        document.getElementById("game").src = gameURL;
        
        /**
         * String of the game ID (the game’s folder name) to load. Set in {@link module:gameloader~GameLoader#loadGameHTML|loadGameHTML}. Primarily meant for debugging.
         */
        this.currGame = gameToLoad;
    }
    /**
     * Set the source of the iframe with ID “game” (in index.html) to “about:blank” for resetting purposes.
     * Called only in {@link module:gameloader~GameLoader#animateTransition}.
     * @alias module:gameloader~GameLoader#clearGameHTML
     * @private
     */
    #clearGameHTML() {
        document.getElementById("game").src = "about:blank";
        document.getElementById("game").contentWindow.location.href = "about:blank";
    }

    /**
     *
     * Called by {@link MicrogameJam#gameStarted}. Hides the timer and game and sets {@link GameLoader#gameLoaded} to true.
     */
    gameStarted(){
        document.getElementById("game").removeAttribute("hidden");
        document.getElementById("timer").removeAttribute("hidden");
        this.#gameLoaded = true;
    }

    /**
     * Read-only property for {@link module:gameloader~GameLoader#gameLoaded}. Used by [input.js]{@link module:input}.
     *
     * @readonly
     */
    get inGame() {
        return this.#gameLoaded;
    }

    /**
     * Called by {@link MicrogameJam#update}. Only calls {@link module:picointerface~PicoInterface#picoUpdate} if the current game is running PICO-8.
     * @todo Should we call this.picoInterface.picoUpdate(this.picoInterface)???
     */
    loadUpdate() {
        if (PicoInterface.isPicoRunning()){
            this.picoInterface.picoUpdate();
        }
    }

    /**
     * Callback initialized in {@link module:gameloader~GameLoader#setupGameLoader|setupGameLoader}. 
     * Fiddles with Unity and PICO-8 games if detected (initializes {@link module:picointerface} if detected), and tries to fix their behavior to work correctly.
     * @private
     * @alias module:gameloader~GameLoader#iframeLoaded
     */
    #iframeLoaded() {
        // For Unity Exports specifically (minimal Unity HTML templates work good enough, except for when it adds margin):
        document.getElementById("game").contentDocument.body.style.margin = "0";
        if (PicoInterface.isPicoRunning()){
            this.picoInterface = new PicoInterface();
            this.picoInterface.interfaceWithPico();
        }
    }

    /**
     * A private reference for the current game we’re going to load throughout this.animateTransition().
     * Set using {@link module:gameloader~GameLoader#pickGameToLoad|pickGameToLoad}.
     * Used in {@link module:gameloader~GameLoader#loadGameHTML|loadGameHTML}.
     */
    #gameToLoad;

    /**
     * Read-only accessor for {@link module:gameloader~GameLoader#gameToLoad}.
     * @readonly
     */
    get game() {
        return this.#gameToLoad;
    }

    // ANIMATIONS
    // -----------------------------------------------------------------------

    /**
     * Special function called by {@link module:gameloader~GameLoader#animateTransition|animateTransition} for animating a complete loss of the game (1 or 0 lives remaining).
     * Should probably be merged with animateTransition at some point?
     * Uses {@link module:animationmanager} to do custom loss behavior (like removing lives, and exiting back to the home screen on a finished game).
     * Other than that, it mostly acts like exactly how {@link module:gameloader~GameLoader#animateTransition|animateTransition} would play out, if allowed to continue.
     */
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

    /**
     * Gets everything ready to animate (like hiding the timer, showing the transition div, etc.)
     * Prepares the life counter (calling this.setupLifeCounter()).
     * Then uses GlobalAnimationManager.playKeyframedAnimation using all these settings.
     * Sets animation to loop until the game is loaded, or unless it has specific configurations in this.#gamesConfig.
     * Once the animation is configured to play, runs this.#loadGameHTML() (should probably just be moved to this.transition()? Although this would break this.loseGameTransition() behavior).

     * @param {string} transitionName The name to use in the saved GlobalAnimationManager when calling {@link module:animationmanager~CCSSGlobalAnimation#playKeyframedAnimation}.
     */
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

    /**
     * Show the number intactLifeDiv s (setup in config.ini) based on numLives. And play a loseLife animation with {@link module:animationmanager} if lostLife is true. 
     * 
     * @param {number} numLives How many lives we have left
     * @param {boolean} lostLife Whether or not one of those lives will be lost.
     */
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

    /**
     * Called by {@link module:gameloader~GameLoader#animationTransition} to tweak CSS settings for the intactLifeDiv s to remove them if they’ve been lost. And to hide them after the animation has finished.
     * @param {number} numLives How many lives we have left 
     * @param {boolean} lostLife Whether or not one of those lives will be lost.
     */
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