import {MicrogameJamMenu} from "./lib/options/menumanager.js";
import {GameLoader} from "./gameloader.js";
import {AudioManager} from "./lib/gamesound.js";
import {AnimationManager} from "./lib/animationmanager.js";
import {getConfig} from "./lib/configloader.js";
import {initVersionStyle, versionStyleUpdate} from "./jam-version-assets/version-style.js";
import * as MicrogameInputManager from "./lib/input.js";

// Main game controller.
// For controlling the primary functions, all calls should get routed through here.

function debugLoopTransition(isWin){
    var winOrLose = (isWin)? "win" : "lose";

    var numLives = ini["Transitions"]["debug-lives"];
    
    MicrogameJamMainManager.GameLoader.setUpLifeCounter(numLives, ini["Transitions"]["debug-life-lost"] === "true");

    MicrogameJamMainManager.GameAnimation.playKeyframedAnimation(`CCSSGLOBAL${winOrLose}Animation`, {
        shouldLoop: function(){
            return ini["Transitions"]["debug-loop"] === "loop-end";
        },
        onFinish: function(){
        if (ini["Transitions"]["debug-loop"] === "loop"){
            MicrogameJamMainManager.GameLoader.removeLives(numLives, ini["Transitions"]["debug-life-lost"] === "true");
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

        this.GameSound = new AudioManager();

        this.GameAnimation = new AnimationManager(document.getElementById("version-style").href);
        this.GameAnimation.evaluateMainSheet();

        this.GameLoader = new GameLoader(this);

        this.GameMenus = new MicrogameJamMenu(this);

        document.getElementById("playButton").onclick = this.startMicrogames;

        if (ini["Transitions"].debug === "win") {
            debugLoopTransition(true);
            document.getElementById("transitionContainer").hidden = false;
            document.getElementById("winTransition").hidden = false;
        }

        if (ini["Transitions"].debug === "lose"){
            debugLoopTransition(false);
            document.getElementById("transitionContainer").hidden = false;
            document.getElementById("loseTransition").hidden = false;
        }

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

        MicrogameInputManager.updateInput();

        requestAnimationFrame(this.update.bind(this));
    }

    gameStarted() {
        this.#inGame = true;
        MicrogameInputManager.gameStartInputUpdate();
        this.GameLoader.gameStarted();
    }
}

var MicrogameJamMainManager;
getConfig("./jam-version-assets/config.ini").then(function(res){
    ini = res;
    MicrogameJamMainManager = new MicrogameJam();
});