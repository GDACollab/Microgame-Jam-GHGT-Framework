import MicrogameJamMenu from "./lib/options/menumanager.js";
import GlobalGameLoader from "./gameloader.js";
import GlobalAudioManager from "./lib/gamesound.js";
import GlobalAnimManager from "./lib/animationmanager.js";
import {initVersionStyle, versionStyleUpdate} from "./jam-version-assets/version-style.js";
import GlobalInputManager from "./lib/input.js";
import iniReader from "./lib/configloader.js";

// Main game controller.
// For controlling the primary functions, all calls should get routed through here.

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

class MicrogameJam {
    #inGame = false;
    // I should probably just move this to a static variable in gamesound.js. Oh well.
    masterVolume = 1;

    constructor() {
        var self = this;
        iniReader.then((iniDat) => {
            initVersionStyle(iniDat, self);
        });

        this.GameSound = GlobalAudioManager;

        this.GameAnimation = GlobalAnimManager;

        this.GameLoader = GlobalGameLoader;

        GlobalGameLoader.masterVolume = this.masterVolume;

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

    playButtonHover() {
        this.GameSound.play("buttonHover", this.masterVolume, true);
    }
    
    playButtonClick() {
        this.GameSound.play("buttonClick", this.masterVolume, true);
    }

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

    update(time) {
        this.GameAnimation.frameUpdate.bind(this.GameAnimation, time)();

        versionStyleUpdate(this.#inGame);

        this.GameLoader.loadUpdate();

        GlobalInputManager.updateInput();

        requestAnimationFrame(this.update.bind(this));
    }

    gameStarted() {
        this.#inGame = true;
        GlobalInputManager.gameStartInputUpdate(GlobalGameLoader.game);
        this.GameLoader.gameStarted();
    }

    endGame(didWin) {
        return this.GameLoader.transition(didWin);
    }
}

var MicrogameJamMainManager = new MicrogameJam();
GameInterface.construct(MicrogameJamMainManager);