import { setUpGooglyEyes, updateGooglyEyes } from "./googly-eye.js";

function versionStyleUpdate(isInGame) {
    updateGooglyEyes();

    if (isInGame) {
        timerUpdate();
    }
}

// Included in version-style because we might want to change how the timer animates based on the style.
function timerUpdate() {
    document.getElementById("timerFull").style.left = "-" + ((1 - GameInterface.getTimer()/_maxTimer) * 100) + "%";
    if (GameInterface.getTimer() <= 0) {
        if (ini["GamesConfig"]["slightly-more-time"].includes(currGame)) {
            if (GameInterface.getTimer() <= -0.2){
                GameInterface.loseGame();
            }
        } else {
            GameInterface.loseGame();
        }
    }
}

function initVersionStyle() {
    setUpGooglyEyes();
}

export {initVersionStyle, versionStyleUpdate};