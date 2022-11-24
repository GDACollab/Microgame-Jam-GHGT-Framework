import { setUpGooglyEyes, updateGooglyEyes } from "./googly-eye.js";
import {TintColor} from "./TintColor.js";

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

var yarnTintDat = [];

function initYarnTints(){
    var colors = ["#ff0000", "#00ff00", "#0000ff"];
    colors.forEach((c) => {
        new TintColor("./jam-version-assets/art/yarnpiece.png", c).run().then((dat) => {
            yarnTintDat.push(dat);
        }).catch((err) => {
            console.error(err);
        });
    });
}

function initVersionStyle() {
    setUpGooglyEyes();
    initYarnTints();
}

export {initVersionStyle, versionStyleUpdate};