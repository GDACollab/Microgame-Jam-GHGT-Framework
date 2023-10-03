/**
 * The javascript module for version specific styles (i.e., showing a timer)
 * @file
 */
/**
 * The javascript module for version specific styles (i.e., showing a timer)
 * @module versionstyle
 */
import { setUpGooglyEyes, updateGooglyEyes } from "./googly-eye.js";

var ini, MicrogameJamMainManager;

/**
 * Update every frame from {@link MicrogameJam}.
 * @param {boolean} isInGame Are we currently in the game? 
 */
function versionStyleUpdate(isInGame) {
    updateGooglyEyes();

    if (isInGame) {
        timerUpdate();
    }
}

/**
 * Included in version-style because we might want to change how the timer animates based on the style. Called by {@link module:versionstyle#versionStyleUpdate}.
 */
function timerUpdate() {
    document.getElementById("timerFull").style.left = "-" + ((1 - GameInterface.getTimer()/GameInterface.getMaxTimer()) * 100) + "%";
    var timer = GameInterface.getTimer();
    if (timer !== -1 && timer <= 0) {
        if (ini["GamesConfig"]["slightly-more-time"].includes(MicrogameJamMainManager.GameLoader.currGame)) {
            if (GameInterface.getTimer() <= -0.2){
                GameInterface.loseGame();
            }
        } else {
            GameInterface.loseGame();
        }
    }
}

/**
 * Set up all the initial style stuff.
 * @param {Object} config Ini file from {@link module:configloader}. 
 * @param {MicrogameJam} manager Microgame Jam manager. 
 */
function initVersionStyle(config, manager) {
    setUpGooglyEyes();
    ini = config;
    MicrogameJamMainManager = manager;
}

export {initVersionStyle, versionStyleUpdate};