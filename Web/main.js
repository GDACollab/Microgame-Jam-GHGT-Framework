import MicrogameJamMenu from "./lib/options/menumanager.js";
import GlobalGameLoader from "./gameloader.js";
import GlobalAudioManager from "./lib/gamesound.js";
import GlobalAnimManager from "./lib/animationmanager.js";
import {initVersionStyle, versionStyleUpdate} from "./jam-version-assets/version-style.js";
import GlobalInputManager from "./lib/input.js";
import iniReader from "./lib/configloader.js";

/**
 * The main brains. It’s loaded as a javascript module, which works great to avoid adding more <script> tags to index.html, but it means you can’t directly contribute global variables.
 * Which is a problem we’ll get into when we hit GameInterface. 
 * Has root behavior for anything tricky to control in the minutiae of any sub-scripts. For instance, some debug behavior (mostly to test transitions) is controlled here. It also has references to ALL of the front end experience since it’s mean to be a master controller of the front end (and a little bit of the back end) experience.
*/

/**
 * If {@link DEBUG_TRANSITION} is win or lose, then this will play either the win or lose transition.
 * If {@link DEBUG_TRANSITION_LOOP} is "loop", then this will loop. If it is "loop-end", then it will play once.
 * 
 * @param {boolean} isWin Whether or not to play a win or lose transition.
 */
function debugLoopTransition(isWin){
    var winOrLose = (isWin)? "win" : "lose";

    var numLives = DEBUG_TRANSITION_LIVES;
    
    MicrogameJamMainManager.GameLoader.setUpLifeCounter(numLives, DEBUG_TRANSITION_LIFE_LOST);

    MicrogameJamMainManager.GameAnimation.playKeyframedAnimation(`CCSSGLOBAL${winOrLose}Animation`, {
        shouldLoop: function(){
            return DEBUG_TRANSITION_LOOP === "loop-end";
        },
        onFinish: function(){
        if (DEBUG_TRANSITION_LOOP === "loop"){
            MicrogameJamMainManager.GameLoader.removeLives(numLives, DEBUG_TRANSITION_LIFE_LOST);
            MicrogameJamMainManager.GameAnimation.stopAllKeyframedAnimationOf("CCSSGLOBALloseLife");
            debugLoopTransition(isWin);
        }
    }});
}

/**
 *
 * Main game controller.
 * For controlling the primary functions, all calls should get routed through here.
 * @see module:main
 * @class MicrogameJam
 * @tutorial adding-games
 */
class MicrogameJam {
    /**Are we currently loaded into a game? Set to true when {@link module:gameinterface/GameInterface} calls its _endedGame function (i.e., the microgame calls WinGame or LoseGame). */
    #inGame = false;
    /** 
     * Bit of a misnomer, unfortunately. It’s just used to keep track of what the volume should be when modified by the [settings]{@link module:optionsmanager} and to update the [audio manager]{@link module:gamesound} appropriately when that happens.
     * @todo I should probably just move this to a static variable in gamesound.js. Oh well.*/ 
    masterVolume = 1;

    constructor() {
        var self = this;
        iniReader.then((iniDat) => {
            initVersionStyle(iniDat, self);
        });

        /** Reference to [gamesound.js]{@link module:gamesound} */
        this.GameSound = GlobalAudioManager;

        /** Reference to [animationmanager.js]{@link module:animationmanager} */
        this.GameAnimation = GlobalAnimManager;

        /** Reference to [gameloader.js]{@link module:gameloader} */
        this.GameLoader = GlobalGameLoader;

        GlobalGameLoader.masterVolume = this.masterVolume;

        /** Reference to [menumanager.js]{@link module:menumanager} */
        this.GameMenus = MicrogameJamMenu;
        this.GameMenus.onSetup.then(() => {
            document.getElementById("playButton").onclick = this.startMicrogames.bind(this);
            document.getElementById("restartButton").onclick = this.startMicrogames.bind(this);
            
            this.GameMenus.onVolume = (vol) => {
                this.masterVolume = vol;
                GlobalGameLoader.masterVolume = this.masterVolume;
                this.GameSound.updateSound("theme", this.masterVolume * 0.2);
            };
        });

        if (DEBUG_TRANSITION === "win") {
            debugLoopTransition(true);
            document.getElementById("transitionContainer").hidden = false;
            document.getElementById("winTransition").hidden = false;
        }

        if (DEBUG_TRANSITION === "lose"){
            debugLoopTransition(false);
            document.getElementById("transitionContainer").hidden = false;
            document.getElementById("loseTransition").hidden = false;
        }

        this.GameSound.onSetup.then(() => {
            this.GameSound.play("theme", this.masterVolume * 0.2, false, true);

            for (const button of document.querySelectorAll("[id*=\"Button\"]")) {
                button.addEventListener("mouseover", this.playButtonHover.bind(this));

                button.addEventListener("click", this.playButtonClick.bind(this));
            }
        });

        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Callback for any buttons hovered over. Plays hover sound.
     * Initialized in {@link MicrogameJam}
     */
    playButtonHover() {
        this.GameSound.play("buttonHover", this.masterVolume, true);
    }
    
    /**
     * Callback for any buttons clicked on. Plays click sound.
     * Initialized in {@link MicrogameJam}.
     */
    playButtonClick() {
        this.GameSound.play("buttonClick", this.masterVolume, true);
    }

    /**
     * Hide the menu, and start the [gameloader]{@link module:gameloader} (using the transition function).
     */
    startMicrogames() {
        this.GameMenus.isInMenu = false;
        this.#inGame = false;

        this.GameSound.stop("theme");
        this.GameSound.stop("endTheme");

        this.GameSound.play("buttonClick", this.masterVolume, true, false);

        this.GameLoader.transition(true);

        setTimeout(function(){
            document.getElementById("menu").setAttribute("hidden", "");
        }, 500);
    }

    /**
     * 
     * Called every animation frame. Updates all the logic for the:
     * [Animation Manager (frameUpdate)]{@link module:animationmanager}
     * [Version Style (versionStyleUpdate)]{@link module:versionstyle}
     * [Game Loader (loadUpdate)]{@link module:gameloader}
     * [GlobalInputManager (updateInput)]{@link module:input}
     * @param {number} time Time elapsed since last frame.
     */
    update(time) {
        this.GameAnimation.frameUpdate.bind(this.GameAnimation, time)();

        versionStyleUpdate(this.#inGame);

        this.GameLoader.loadUpdate();

        GlobalInputManager.updateInput();

        requestAnimationFrame(this.update.bind(this));
    }

    /**
     * Called by [GameInterface]{@link module:gameinterface} in the gameStart function. Used by the framework when it detects that a game is ready to start.
     * Stops loader behavior, and tells [GlobalInputManager]{@link module:input} to be ready to receive game inputs.
     */
    gameStarted() {
        this.#inGame = true;
        GlobalInputManager.gameStartInputUpdate(GlobalGameLoader.game);
        this.GameLoader.gameStarted();
    }

    /**
     * Called by [GameInterface]{@link module:gameinterface} in the _gameEnded function. Called during a win, loss, or automatic loss.
     * Calls [Game Loader]{@link gameloader} transition.
     * 
     * @param {boolean} didWin Whether or not the game was one.
     * @returns The difficulty after transitioning.
     */
    endGame(didWin) {
        return this.GameLoader.transition(didWin);
    }
}

var MicrogameJamMainManager = new MicrogameJam();
GameInterface.construct(MicrogameJamMainManager);