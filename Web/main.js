import MicrogameJamMenu from "./lib/options/menumanager.js";
import GlobalGameLoader from "./gameloader.js";
import GlobalAudioManager from "./lib/gamesound.js";
import GlobalAnimManager from "./lib/animationmanager.js";
import {initVersionStyle, versionStyleUpdate} from "./jam-version-assets/version-style.js";
import GlobalInputManager from "./lib/input.js";

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
    masterVolume = 1;

    constructor() {
        initVersionStyle();

        this.GameSound = GlobalAudioManager;

        this.GameAnimation = GlobalAnimManager;

        this.GameLoader = GlobalGameLoader;

        this.GameMenus = MicrogameJamMenu;
        this.GameMenus.onSetup.then(() => {
            document.getElementById("playButton").onclick = this.startMicrogames;
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
            this.GameSound.play("theme", this.masterVolume * 0.3, false, true);

            var GameSound = this.GameSound;
            for (const button of document.querySelectorAll("[id*=\"Button\"]")) {
                button.addEventListener("mouseover", function(){
                    GameSound.play("buttonHover", this.masterVolume, true);
                });

                button.addEventListener("click", function(){
                    GameSound.play("buttonClick", this.masterVolume, true);
                });
            }
        });

        requestAnimationFrame(this.update.bind(this));
    }

    startMicrogames() {
        this.#inGame = false;

        this.GameSound.stop("theme");

        this.GameSound.play("buttonClick", this.masterVolume, true, false, function(){
            this.GameSound.play("winJingle", this.masterVolume * 0.8, true);
        });

        this.GameLoader.transition("win");

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
}

var MicrogameJamMainManager = new MicrogameJam();